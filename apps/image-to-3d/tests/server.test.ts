/**
 * Server handlers end to end, in process: auth gate, rate limit, budget,
 * the Claude call shape (caching, structured output, fallbacks), retries,
 * refusals, and the library on a temp-dir store. Claude is either a scripted
 * fake or the fixture replay (real-shaped responses, real stream events).
 */
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import type { BetaMessage, BetaMessageStreamParams } from "@anthropic-ai/sdk/resources/beta/messages/messages";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { spentToday } from "../server/budget";
import type { MessagesApi, MessageStreamLike } from "../server/claude";
import type { Deps } from "../server/deps";
import { readEnv } from "../server/env";
import { generate, judge } from "../server/handlers/generate";
import { deleteItem, getLibrary, patchItem, saveItem, upload } from "../server/handlers/library";
import { getSession, login } from "../server/handlers/session";
import { route } from "../server/http";
import { fixtureMessagesApi, messageToEvents } from "../server/mock";
import { RateLimiter } from "../server/rateLimit";
import { FsStore } from "../server/store/fsStore";
import { SYSTEM_PROMPT } from "../server/prompts";
import { fixtureMessage, FIXTURES, fixtureSpec, IMAGES } from "./helpers";

const PNG_B64 = readFileSync(path.join(IMAGES, "toadstool.png")).toString("base64");
const IMAGE = { data: PNG_B64, mediaType: "image/png" };
const BASE = "https://i3d.test";

let dir: string;
beforeEach(() => {
  dir = mkdtempSync(path.join(tmpdir(), "i3d-"));
});
afterEach(() => rmSync(dir, { recursive: true, force: true }));

/** Scripted fake: returns the given messages in order and records every request. */
function scripted(messages: BetaMessage[]) {
  const calls: BetaMessageStreamParams[] = [];
  const api: MessagesApi = {
    stream(params): MessageStreamLike {
      calls.push(structuredClone(params));
      const msg = messages[Math.min(calls.length - 1, messages.length - 1)];
      const events = messageToEvents(msg);
      return {
        async *[Symbol.asyncIterator]() {
          yield* events;
        },
        finalMessage: async () => msg,
      };
    },
  };
  return { api, calls };
}

function deps(over: Partial<Deps> = {}, env: Record<string, string> = {}): Deps {
  return {
    env: readEnv({ APP_PASSWORD: "open sesame", DAILY_BUDGET_USD: "5", ...env }),
    store: new FsStore(dir),
    api: fixtureMessagesApi(FIXTURES, 0),
    claudeLimiter: new RateLimiter(100),
    loginLimiter: new RateLimiter(100),
    ...over,
  };
}

async function signIn(d: Deps): Promise<string> {
  const res = await route((r) => login(r, d))(jsonReq("POST", "/api/session", { password: "open sesame" }));
  expect(res.status).toBe(200);
  const cookie = res.headers.get("set-cookie")!;
  expect(cookie).toMatch(/HttpOnly/);
  expect(cookie).toMatch(/SameSite=Strict/);
  expect(cookie).toMatch(/Secure/);
  return cookie.split(";")[0];
}

function jsonReq(method: string, url: string, body?: unknown, cookie?: string, extra: Record<string, string> = {}) {
  return new Request(BASE + url, {
    method,
    headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.7", ...(cookie ? { cookie } : {}), ...extra },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

async function events(res: Response): Promise<Record<string, any>[]> {
  expect(res.headers.get("content-type")).toMatch(/ndjson/);
  return (await res.text())
    .split("\n")
    .filter(Boolean)
    .map((l) => JSON.parse(l));
}

const createBody = { mode: "create", image: IMAGE, style: "clay", model: "claude-opus-5-5", effort: "medium", notes: "" };

function withText(base: BetaMessage, text: string, extra: Partial<BetaMessage> = {}): BetaMessage {
  return { ...base, ...extra, content: [{ type: "text", text, citations: null }] } as BetaMessage;
}

// ---------------------------------------------------------------------------

describe("access gate", () => {
  it("rejects every Claude and library route without a session", async () => {
    const d = deps();
    const gen = route((r) => generate(r, d));
    expect((await gen(jsonReq("POST", "/api/generate", createBody))).status).toBe(401);
    expect((await route((r) => judge(r, d))(jsonReq("POST", "/api/judge", {}))).status).toBe(401);
    expect((await route((r) => getLibrary(r, d))(jsonReq("GET", "/api/library"))).status).toBe(401);
    expect((await route((r) => saveItem(r, d))(jsonReq("POST", "/api/library", {}))).status).toBe(401);
  });

  it("rejects a wrong password and a forged cookie", async () => {
    const d = deps();
    const bad = await route((r) => login(r, d))(jsonReq("POST", "/api/session", { password: "nope" }));
    expect(bad.status).toBe(401);
    const forged = "i3d_session=9999999999.AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
    expect((await route((r) => getLibrary(r, d))(jsonReq("GET", "/api/library", undefined, forged))).status).toBe(401);
  });

  it("fails closed in production when APP_PASSWORD is missing", async () => {
    const d = deps({}, { APP_PASSWORD: "", VERCEL_ENV: "production" });
    const res = await route((r) => generate(r, d))(jsonReq("POST", "/api/generate", createBody));
    expect(res.status).toBe(503);
    const s = await (await getSession(jsonReq("GET", "/api/session"), d)).json();
    expect(s.locked).toBe(true);
  });

  it("never exposes the API key in the session payload", async () => {
    const d = deps({}, { ANTHROPIC_API_KEY: "sk-ant-secret-value" });
    const cookie = await signIn(d);
    const text = await (await getSession(jsonReq("GET", "/api/session", undefined, cookie), d)).text();
    expect(text).not.toMatch(/sk-ant/);
    expect(JSON.parse(text).authenticated).toBe(true);
  });

  it("ignores ANTHROPIC_MOCK in production", () => {
    expect(readEnv({ ANTHROPIC_MOCK: "fixtures", VERCEL_ENV: "production" }).mock).toBeNull();
    expect(readEnv({ ANTHROPIC_MOCK: "fixtures" }).mock).toBe("fixtures");
  });
});

describe("generate (scripted Claude)", () => {
  it("sends a cached system prompt, cached source image, JSON-schema output, effort, adaptive thinking and fallbacks", async () => {
    const { api, calls } = scripted([fixtureMessage("create.toadstool.json")]);
    const d = deps({ api });
    const cookie = await signIn(d);
    const evs = await events(await route((r) => generate(r, d))(jsonReq("POST", "/api/generate", createBody, cookie)));
    const result = evs.find((e) => e.type === "result")!;
    expect(result.spec.title).toBe("Toadstool in a pot");
    expect(result.costUsd).toBeGreaterThan(0);
    expect(evs.some((e) => e.type === "thinking")).toBe(true);
    expect(evs[0]).toEqual({ type: "status", stage: "analysing" });

    const params = calls[0] as any;
    expect(params.model).toBe("claude-opus-5-5");
    expect(params.system).toEqual([{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }]);
    expect(params.thinking).toEqual({ type: "adaptive", display: "summarized" });
    expect(params.output_config.effort).toBe("medium");
    expect(params.output_config.format.type).toBe("json_schema");
    expect(params.fallbacks).toBe("default");
    expect(params.betas).toEqual(["server-side-fallback-2026-07-01"]);
    expect(params.tool_choice).toBeUndefined();
    const content = params.messages[0].content;
    expect(content[0]).toMatchObject({ type: "image", cache_control: { type: "ephemeral" } });
    expect(content[1].text).toMatch(/^CREATE/);
  });

  it("does not request server-side fallbacks on Haiku", async () => {
    const { api, calls } = scripted([fixtureMessage("create.toadstool.json")]);
    const d = deps({ api });
    const cookie = await signIn(d);
    await events(await route((r) => generate(r, d))(jsonReq("POST", "/api/generate", { ...createBody, model: "claude-haiku-5-5", effort: "low" }, cookie)));
    expect((calls[0] as any).fallbacks).toBeUndefined();
    expect((calls[0] as any).output_config.effort).toBe("low");
  });

  it("retries once with the validation errors appended after the cached prefix", async () => {
    const good = fixtureMessage("create.toadstool.json");
    const bad = withText(good, '{"score":0,"critique":"","changes":[],"spec":{"title":"x"}}');
    const { api, calls } = scripted([bad, good]);
    const d = deps({ api });
    const cookie = await signIn(d);
    const evs = await events(await route((r) => generate(r, d))(jsonReq("POST", "/api/generate", createBody, cookie)));
    expect(evs.find((e) => e.type === "retry")).toMatchObject({ attempt: 2 });
    const result = evs.find((e) => e.type === "result")!;
    expect(result.attempts).toBe(2);
    expect(calls).toHaveLength(2);
    const retryContent = (calls[1] as any).messages[0].content;
    expect(retryContent.slice(0, 2)).toEqual((calls[0] as any).messages[0].content); // same cached prefix
    expect(retryContent[2].text).toMatch(/could not be used/);
    // both attempts are billed and recorded against the daily budget
    expect(await spentToday(d.store!)).toBeCloseTo(result.costUsd, 5);
  });

  it("gives up after two unusable answers with a clear error", async () => {
    const bad = withText(fixtureMessage("create.toadstool.json"), "not json at all");
    const { api, calls } = scripted([bad]);
    const d = deps({ api });
    const cookie = await signIn(d);
    const evs = await events(await route((r) => generate(r, d))(jsonReq("POST", "/api/generate", createBody, cookie)));
    expect(calls).toHaveLength(2);
    expect(evs.at(-1)).toMatchObject({ type: "error", code: "invalid_output" });
  });

  it("treats a truncated answer (max_tokens) as retryable", async () => {
    const good = fixtureMessage("create.toadstool.json");
    const cut = withText(good, '{"score":0,"crit', { stop_reason: "max_tokens" });
    const { api } = scripted([cut, good]);
    const d = deps({ api });
    const cookie = await signIn(d);
    const evs = await events(await route((r) => generate(r, d))(jsonReq("POST", "/api/generate", createBody, cookie)));
    expect(evs.find((e) => e.type === "result")?.attempts).toBe(2);
  });

  it("surfaces a refusal without retrying", async () => {
    const refused = { ...withText(fixtureMessage("create.toadstool.json"), ""), stop_reason: "refusal", stop_details: { type: "refusal", category: null, explanation: null } } as unknown as BetaMessage;
    const { api, calls } = scripted([refused]);
    const d = deps({ api });
    const cookie = await signIn(d);
    const evs = await events(await route((r) => generate(r, d))(jsonReq("POST", "/api/generate", createBody, cookie)));
    expect(calls).toHaveLength(1);
    expect(evs.at(-1)).toMatchObject({ type: "error", code: "refusal" });
  });

  it("uses the answer after a server-side fallback switch point", async () => {
    const good = fixtureMessage("create.toadstool.json");
    const text = good.content.find((b) => b.type === "text")!;
    const switched = {
      ...good,
      content: [{ type: "text", text: "partial from the first model", citations: null }, { type: "fallback", from: { model: "claude-opus-5-5" }, to: { model: "claude-opus-4-8" } }, text],
    } as unknown as BetaMessage;
    const { api } = scripted([switched]);
    const d = deps({ api });
    const cookie = await signIn(d);
    const evs = await events(await route((r) => generate(r, d))(jsonReq("POST", "/api/generate", createBody, cookie)));
    expect(evs.find((e) => e.type === "result")?.spec.title).toBe("Toadstool in a pot");
  });

  it("validates input before spending anything", async () => {
    const { api, calls } = scripted([fixtureMessage("create.toadstool.json")]);
    const d = deps({ api });
    const cookie = await signIn(d);
    const gen = route((r) => generate(r, d));
    const notPng = await gen(jsonReq("POST", "/api/generate", { ...createBody, image: { data: Buffer.from("hello world, not an image").toString("base64"), mediaType: "image/png" } }, cookie));
    expect(notPng.status).toBe(400);
    const badPass = await gen(jsonReq("POST", "/api/generate", { ...createBody, mode: "refine", pass: 9, render: IMAGE, spec: fixtureSpec("create.toadstool.json") }, cookie));
    expect(badPass.status).toBe(400);
    const notJson = await gen(new Request(BASE + "/api/generate", { method: "POST", headers: { cookie, "content-type": "text/plain" }, body: "x" }));
    expect(notJson.status).toBe(415);
    expect(calls).toHaveLength(0);
  });

  it("rate limits per client", async () => {
    const d = deps({ claudeLimiter: new RateLimiter(2) });
    const cookie = await signIn(d);
    const gen = route((r) => generate(r, d));
    await events(await gen(jsonReq("POST", "/api/generate", createBody, cookie)));
    await events(await gen(jsonReq("POST", "/api/generate", createBody, cookie)));
    const third = await gen(jsonReq("POST", "/api/generate", createBody, cookie));
    expect(third.status).toBe(429);
    expect(Number(third.headers.get("retry-after"))).toBeGreaterThan(0);
    // a different client is unaffected
    const other = await gen(jsonReq("POST", "/api/generate", createBody, cookie, { "x-forwarded-for": "198.51.100.1" }));
    expect(other.status).toBe(200);
    await other.text();
  });

  it("stops at the daily budget", async () => {
    const d = deps({}, { DAILY_BUDGET_USD: "0.3" });
    const cookie = await signIn(d);
    const gen = route((r) => generate(r, d));
    const first = await events(await gen(jsonReq("POST", "/api/generate", createBody, cookie)));
    expect(first.find((e) => e.type === "result")).toBeTruthy();
    const second = await gen(jsonReq("POST", "/api/generate", createBody, cookie));
    expect(second.status).toBe(402);
    expect((await second.json()).code).toBe("budget_exceeded");
  });
});

describe("fixture flow (real-shaped responses through the full server path)", () => {
  it("create → compare & fix × 2 → judge, with cache reads on refinement", async () => {
    const d = deps();
    const cookie = await signIn(d);
    const gen = route((r) => generate(r, d));

    const created = (await events(await gen(jsonReq("POST", "/api/generate", createBody, cookie)))).find((e) => e.type === "result")!;
    expect(created.spec.parts).toHaveLength(13);
    expect(created.usage.cache_creation_input_tokens).toBeGreaterThan(0);

    let spec = created.spec;
    const scores: number[] = [];
    for (const pass of [1, 2]) {
      const res = (await events(await gen(jsonReq("POST", "/api/generate", { ...createBody, mode: "refine", pass, spec, render: IMAGE }, cookie)))).find(
        (e) => e.type === "result",
      )!;
      expect(res.usage.cache_read_input_tokens).toBeGreaterThan(0);
      expect(res.changes.length).toBeGreaterThan(0);
      scores.push(res.score);
      spec = res.spec;
    }
    expect(scores).toEqual([6.2, 8.4]);
    expect(spec.parts.length).toBe(17);

    const j = await (await route((r) => judge(r, d))(jsonReq("POST", "/api/judge", { image: IMAGE, render: IMAGE }, cookie))).json();
    expect(j.score).toBe(8.8);
    expect(j.model).toBe("claude-haiku-5-5");

    const spent = await spentToday(d.store!);
    expect(spent).toBeGreaterThan(0.3);
    expect(spent).toBeLessThan(1);
  });

  it("picks the subject from the user's notes", async () => {
    const d = deps();
    const cookie = await signIn(d);
    const evs = await events(await route((r) => generate(r, d))(jsonReq("POST", "/api/generate", { ...createBody, notes: "a toy robot" }, cookie)));
    expect(evs.find((e) => e.type === "result")!.spec.title).toBe("Toy robot");
  });
});

describe("library", () => {
  const GLB = (() => {
    const b = new Uint8Array(64);
    b.set([0x67, 0x6c, 0x54, 0x46]); // "glTF"
    return b;
  })();
  const PNG = new Uint8Array(readFileSync(path.join(IMAGES, "robot.png")));
  const id = "0b6f6a9e-6a2c-4c1e-9d55-2f4f5f0f8a11";

  function put(cookie: string, name: string, type: string, body: Uint8Array<ArrayBuffer>, itemId = id) {
    return new Request(`${BASE}/api/upload?id=${itemId}&name=${name}`, { method: "PUT", headers: { cookie, "content-type": type }, body });
  }

  it("upload → save → list → get → rename → delete", async () => {
    const d = deps();
    const cookie = await signIn(d);
    const up = route((r) => upload(r, d));
    expect((await up(put(cookie, "model", "model/gltf-binary", GLB))).status).toBe(201);
    expect((await up(put(cookie, "thumb", "image/png", PNG))).status).toBe(201);
    expect((await up(put(cookie, "source", "image/png", PNG))).status).toBe(201);

    const spec = fixtureSpec("refine.toadstool.1.json");
    const saved = await route((r) => saveItem(r, d))(jsonReq("POST", "/api/library", { id, title: "Toadstool", tags: ["Mushroom", "pot", "pot"], style: "felt", spec, score: 8.4, passes: 2, costUsd: 0.5, triangles: 37000, model: "claude-opus-5-5" }, cookie));
    expect(saved.status).toBe(201);
    const { item } = await saved.json();
    expect(item.tags).toEqual(["mushroom", "pot"]);
    expect(item.files.glb).toMatch(/model-[0-9a-f]+\.glb$/);
    expect(item.style).toBe("felt");

    const list = await (await route((r) => getLibrary(r, d))(jsonReq("GET", "/api/library", undefined, cookie))).json();
    expect(list.items.map((i: { id: string }) => i.id)).toEqual([id]);

    const one = await (await route((r) => getLibrary(r, d))(jsonReq("GET", `/api/library?id=${id}`, undefined, cookie))).json();
    expect(one.spec.title).toBe(spec.title);

    const renamed = await (await route((r) => patchItem(r, d))(jsonReq("PATCH", "/api/library", { id, title: "  Red toadstool ", tags: ["red"] }, cookie))).json();
    expect(renamed.item.title).toBe("Red toadstool");
    expect(renamed.item.tags).toEqual(["red"]);

    const del = await route((r) => deleteItem(r, d))(jsonReq("DELETE", `/api/library?id=${id}`, undefined, cookie));
    expect(del.status).toBe(200);
    const after = await (await route((r) => getLibrary(r, d))(jsonReq("GET", "/api/library", undefined, cookie))).json();
    expect(after.items).toEqual([]);
    expect(await d.store!.list(`i3d/items/${id}/`)).toEqual([]);
  });

  it("rejects uploads whose bytes don't match their type, unknown names and bad ids", async () => {
    const d = deps();
    const cookie = await signIn(d);
    const up = route((r) => upload(r, d));
    expect((await up(put(cookie, "model", "model/gltf-binary", PNG))).status).toBe(400);
    expect((await up(put(cookie, "model", "text/html", GLB))).status).toBe(415);
    expect((await up(put(cookie, "evil", "image/png", PNG))).status).toBe(400);
    expect((await up(put(cookie, "thumb", "image/png", PNG, "../../etc"))).status).toBe(400);
  });

  it("refuses to save an invalid spec or before files are uploaded", async () => {
    const d = deps();
    const cookie = await signIn(d);
    const save = route((r) => saveItem(r, d));
    expect((await save(jsonReq("POST", "/api/library", { id, spec: fixtureSpec("create.robot.json") }, cookie))).status).toBe(400); // no files
    await route((r) => upload(r, d))(put(cookie, "model", "model/gltf-binary", GLB));
    await route((r) => upload(r, d))(put(cookie, "thumb", "image/png", PNG));
    expect((await save(jsonReq("POST", "/api/library", { id, spec: { title: 1 } }, cookie))).status).toBe(400);
  });

  it("keeps a bounded number of index versions", async () => {
    const d = deps();
    const cookie = await signIn(d);
    await route((r) => upload(r, d))(put(cookie, "model", "model/gltf-binary", GLB));
    await route((r) => upload(r, d))(put(cookie, "thumb", "image/png", PNG));
    await route((r) => saveItem(r, d))(jsonReq("POST", "/api/library", { id, spec: fixtureSpec("create.robot.json") }, cookie));
    for (let i = 0; i < 8; i++) await route((r) => patchItem(r, d))(jsonReq("PATCH", "/api/library", { id, title: `t${i}` }, cookie));
    const versions = await d.store!.list("i3d/index/");
    expect(versions.length).toBeLessThanOrEqual(5);
    const list = await (await route((r) => getLibrary(r, d))(jsonReq("GET", "/api/library", undefined, cookie))).json();
    expect(list.items[0].title).toBe("t7");
  });

  it("PUBLIC_GALLERY opens reads but not writes", async () => {
    const d = deps({}, { PUBLIC_GALLERY: "true" });
    expect((await route((r) => getLibrary(r, d))(jsonReq("GET", "/api/library"))).status).toBe(200);
    expect((await route((r) => patchItem(r, d))(jsonReq("PATCH", "/api/library", { id, title: "x" }))).status).toBe(401);
    expect((await route((r) => deleteItem(r, d))(jsonReq("DELETE", `/api/library?id=${id}`))).status).toBe(401);
  });
});
