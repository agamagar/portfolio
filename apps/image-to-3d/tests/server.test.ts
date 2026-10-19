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
import { getSession, logout, postSession } from "../server/handlers/session";
import { route } from "../server/http";
import { MemoryKv } from "../server/kv";
import { fixtureMessagesApi, messageToEvents } from "../server/mock";
import { imageHash } from "../server/moderation";
import { assertUserBudget } from "../server/quota";
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

const isModeration = (p: BetaMessageStreamParams) => JSON.stringify(p.system).includes("content-safety reviewer");

/**
 * Scripted fake: returns the given messages in order and records every request. Moderation
 * pre-checks are answered separately (allow, unless `moderation` says otherwise) and recorded in modCalls.
 */
function scripted(messages: BetaMessage[], moderation: (p: BetaMessageStreamParams, n: number) => string = () => "moderate.allow.json") {
  const calls: BetaMessageStreamParams[] = [];
  const modCalls: BetaMessageStreamParams[] = [];
  const api: MessagesApi = {
    stream(params): MessageStreamLike {
      let msg: BetaMessage;
      if (isModeration(params)) {
        modCalls.push(structuredClone(params));
        msg = fixtureMessage(moderation(params, modCalls.length));
      } else {
        calls.push(structuredClone(params));
        msg = messages[Math.min(calls.length - 1, messages.length - 1)];
      }
      const events = messageToEvents(msg);
      return {
        async *[Symbol.asyncIterator]() {
          yield* events;
        },
        finalMessage: async () => msg,
      };
    },
  };
  return { api, calls, modCalls };
}

function deps(over: Partial<Deps> = {}, env: Record<string, string> = {}): Deps {
  return {
    env: readEnv({ MOCK_AUTH: "1", DAILY_BUDGET_USD: "5", MONTHLY_MODELS: "100", ...env }),
    store: new FsStore(dir),
    kv: new MemoryKv(),
    api: fixtureMessagesApi(FIXTURES, 0),
    claudeLimiter: new RateLimiter(100),
    loginLimiter: new RateLimiter(100),
    publicLimiter: new RateLimiter(100),
    reportLimiter: new RateLimiter(100),
    ...over,
  };
}

async function signIn(d: Deps, email = "ada@example.com", invite?: string): Promise<string> {
  const res = await route((r) => postSession(r, d))(jsonReq("POST", "/api/session", { action: "mock", email, invite }));
  expect(res.status).toBe(200);
  const cookie = res.headers.get("set-cookie")!;
  expect(cookie).toMatch(/HttpOnly/);
  expect(cookie).toMatch(/SameSite=Lax/);
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

  it("rejects a forged or signed-out cookie", async () => {
    const d = deps();
    const forged = "i3d_session=" + "A".repeat(43);
    expect((await route((r) => getLibrary(r, d))(jsonReq("GET", "/api/library", undefined, forged))).status).toBe(401);
    const cookie = await signIn(d);
    expect((await route((r) => getLibrary(r, d))(jsonReq("GET", "/api/library", undefined, cookie))).status).toBe(200);
    const out = await logout(jsonReq("DELETE", "/api/session", undefined, cookie), d);
    expect(out.headers.get("set-cookie")).toMatch(/Max-Age=0/);
    expect((await route((r) => getLibrary(r, d))(jsonReq("GET", "/api/library", undefined, cookie))).status).toBe(401);
  });

  it("stores only a hash of the session token", async () => {
    const d = deps();
    const cookie = await signIn(d);
    const token = cookie.split("=")[1];
    for (const k of await d.kv!.keys("")) expect(k).not.toContain(token);
    expect(JSON.stringify([...(await d.kv!.keys("sess:"))])).toMatch(/sess:[0-9a-f]{64}/);
  });

  it("fails closed in production without Google, a session secret or durable storage", async () => {
    const prod = { VERCEL_ENV: "production", GOOGLE_CLIENT_ID: "x", GOOGLE_CLIENT_SECRET: "y", SESSION_SECRET: "z" };
    for (const [over, kv] of [
      [{ GOOGLE_CLIENT_ID: "" }, new MemoryKv()],
      [{ SESSION_SECRET: "" }, new MemoryKv()],
      [{}, null],
    ] as const) {
      const d = deps({ kv }, { ...prod, ...over });
      const res = await route((r) => generate(r, d))(jsonReq("POST", "/api/generate", createBody));
      expect(res.status).toBe(503);
      expect((await (await getSession(jsonReq("GET", "/api/session"), d)).json()).locked).toBe(true);
    }
  });

  it("mock sign-in is unavailable in production", async () => {
    const d = deps({}, { VERCEL_ENV: "production", MOCK_AUTH: "1", GOOGLE_CLIENT_ID: "x", SESSION_SECRET: "z" });
    expect(d.env.mockAuth).toBe(false);
    const res = await route((r) => postSession(r, d))(jsonReq("POST", "/api/session", { action: "mock", email: "a@b.co" }));
    expect(res.status).toBe(404);
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
    expect(content[0].text).toBe("Front view:");
    expect(content[1]).toMatchObject({ type: "image", cache_control: { type: "ephemeral" } });
    expect(content[2].text).toMatch(/^CREATE/);
  });

  it("sends front, left and right as labelled image blocks, caching up to the last view", async () => {
    const { api, calls } = scripted([fixtureMessage("create.toadstool.json")]);
    const d = deps({ api });
    const cookie = await signIn(d);
    const body = { ...createBody, image: undefined, images: { front: IMAGE, left: IMAGE, right: IMAGE } };
    const evs = await events(await route((r) => generate(r, d))(jsonReq("POST", "/api/generate", body, cookie)));
    expect(evs.at(-1)).toMatchObject({ type: "result" });
    const content = (calls[0] as any).messages[0].content;
    expect(content.map((b: any) => b.text ?? b.type).slice(0, 6)).toEqual(["Front view (1 of 3):", "image", "Left view (2 of 3):", "image", "Right view (3 of 3):", "image"]);
    expect(content[1].cache_control).toBeUndefined();
    expect(content[5].cache_control).toEqual({ type: "ephemeral" });
    expect(content[6].text).toMatch(/3 views/);
  });

  it("rejects a bad side image", async () => {
    const d = deps({ api: scripted([fixtureMessage("create.toadstool.json")]).api });
    const cookie = await signIn(d);
    const body = { ...createBody, image: undefined, images: { front: IMAGE, left: { data: "AAAA", mediaType: "image/png" } } };
    const res = await route((r) => generate(r, d))(jsonReq("POST", "/api/generate", body, cookie));
    expect(res.status).toBe(400);
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
    expect(retryContent.slice(0, 3)).toEqual((calls[0] as any).messages[0].content); // same cached prefix
    expect(retryContent[3].text).toMatch(/could not be used/);
    // both attempts are billed and recorded against the daily budget, plus the tiny moderation call
    const spent = await spentToday(d.store!);
    expect(spent).toBeGreaterThan(result.costUsd);
    expect(spent - result.costUsd).toBeLessThan(0.001);
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
      const res = (await events(await gen(jsonReq("POST", "/api/generate", { ...createBody, mode: "refine", jobId: created.jobId, pass, spec, render: IMAGE }, cookie)))).find(
        (e) => e.type === "result",
      )!;
      expect(res.usage.cache_read_input_tokens).toBeGreaterThan(0);
      expect(res.changes.length).toBeGreaterThan(0);
      scores.push(res.score);
      spec = res.spec;
    }
    expect(scores).toEqual([6.2, 8.4]);
    expect(spec.parts.length).toBe(17);

    const j = await (await route((r) => judge(r, d))(jsonReq("POST", "/api/judge", { image: IMAGE, render: IMAGE, jobId: created.jobId }, cookie))).json();
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

  it("re-encodes uploaded images (EXIF stripped) and refuses oversized ones", async () => {
    const d = deps();
    const cookie = await signIn(d);
    const sharp = (await import("sharp")).default;
    const jpg = await sharp({ create: { width: 32, height: 32, channels: 3, background: "#369" } })
      .withExif({ IFD0: { Copyright: "secret-owner" } })
      .jpeg()
      .toBuffer();
    expect(jpg.toString("latin1")).toContain("secret-owner");
    const res = await route((r) => upload(r, d))(put(cookie, "source", "image/jpeg", new Uint8Array(jpg)));
    expect(res.status).toBe(201);
    const [file] = (await d.store!.list(`i3d/users/`)).filter((f) => f.pathname.includes(`/items/${id}/source`));
    expect(Buffer.from(await d.store!.read(file)).toString("latin1")).not.toContain("secret-owner");
    const wide = await sharp({ create: { width: 4100, height: 8, channels: 3, background: "#fff" } }).png().toBuffer();
    expect((await route((r) => upload(r, d))(put(cookie, "left", "image/png", new Uint8Array(wide)))).status).toBe(413);
    const junk = new Uint8Array(40).fill(1);
    junk.set([0xff, 0xd8]);
    expect((await route((r) => upload(r, d))(put(cookie, "right", "image/jpeg", junk))).status).toBe(400);
  });

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
    expect(item.files.glb).toMatch(/^\/api\/file\?p=/);
    expect(new URL(item.files.glb, BASE).searchParams.get("p")).toMatch(/^i3d\/users\/[0-9a-f]+\/items\/.+\/model-[0-9a-f]+\.glb$/);
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
    expect((await d.store!.list(`i3d/users/`)).filter((f) => f.pathname.includes(`/items/${id}/`))).toEqual([]);
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
    const versions = (await d.store!.list("i3d/users/")).filter((f) => f.pathname.includes("/index/"));
    expect(versions.length).toBeLessThanOrEqual(5);
    const list = await (await route((r) => getLibrary(r, d))(jsonReq("GET", "/api/library", undefined, cookie))).json();
    expect(list.items[0].title).toBe("t7");
  });
});

/** A fake Claude that holds every call until release() is called, to observe in-flight limits. */
function gated() {
  let release!: () => void;
  const gate = new Promise<void>((r) => (release = r));
  const inner = scripted([fixtureMessage("create.toadstool.json")]).api;
  const api: MessagesApi = {
    stream(params) {
      const s = inner.stream(params);
      if (isModeration(params)) return s; // the pre-check isn't held, only the main call
      return {
        async *[Symbol.asyncIterator]() {
          await gate;
          yield* s;
        },
        finalMessage: async () => {
          await gate;
          return s.finalMessage();
        },
      };
    },
  };
  return { api, release };
}

describe("quotas", () => {
  const gen = (d: Deps) => route((r) => generate(r, d));
  const post = (d: Deps, body: unknown, cookie: string, extra: Record<string, string> = {}) => gen(d)(jsonReq("POST", "/api/generate", body, cookie, extra));

  it("allows MONTHLY_MODELS creates, then 429s with a clear code; refines don't count", async () => {
    const d = deps({}, { MONTHLY_MODELS: "2" });
    const cookie = await signIn(d);
    const r1 = (await events(await post(d, createBody, cookie))).find((e) => e.type === "result")!;
    // two refine passes on the first model are free
    for (const pass of [1, 2]) await events(await post(d, { ...createBody, mode: "refine", jobId: r1.jobId, pass, spec: r1.spec, render: IMAGE }, cookie));
    await events(await post(d, createBody, cookie));
    const third = await post(d, createBody, cookie);
    expect(third.status).toBe(429);
    expect((await third.json()).code).toBe("quota_exceeded");
    const me = await (await getSession(jsonReq("GET", "/api/session", undefined, cookie), d)).json();
    expect(me.quota.monthly).toMatchObject({ used: 2, limit: 2 });
  });

  it("a three-view job counts as one model", async () => {
    const d = deps({}, { MONTHLY_MODELS: "1" });
    const cookie = await signIn(d);
    const res = await post(d, { ...createBody, image: undefined, images: { front: IMAGE, left: IMAGE, right: IMAGE } }, cookie);
    expect((await events(res)).find((e) => e.type === "result")).toBeTruthy();
    const q = (await (await getSession(jsonReq("GET", "/api/session", undefined, cookie), d)).json()).quota;
    expect(q.monthly.used).toBe(1);
  });

  it("each user has their own count, and admins are unlimited", async () => {
    const d = deps({}, { MONTHLY_MODELS: "1", ADMIN_EMAILS: "boss@example.com" });
    const a = await signIn(d, "a@example.com");
    const b = await signIn(d, "b@example.com");
    const boss = await signIn(d, "boss@example.com");
    await events(await post(d, createBody, a));
    expect((await post(d, createBody, a)).status).toBe(429);
    await events(await post(d, createBody, b));
    await events(await post(d, createBody, boss));
    await events(await post(d, createBody, boss));
  });

  it("a failed create is refunded", async () => {
    const { api } = scripted([{ ...fixtureMessage("create.toadstool.json"), stop_reason: "refusal" } as BetaMessage]);
    const d = deps({ api }, { MONTHLY_MODELS: "1" });
    const cookie = await signIn(d);
    await events(await post(d, createBody, cookie));
    const q = (await (await getSession(jsonReq("GET", "/api/session", undefined, cookie), d)).json()).quota;
    expect(q.monthly.used).toBe(0);
  });

  it("refine and judge need a job that this user's create opened", async () => {
    const { api, calls } = scripted([fixtureMessage("create.toadstool.json")]);
    const d = deps({ api });
    const a = await signIn(d, "a@example.com");
    const b = await signIn(d, "b@example.com");
    const spec = fixtureSpec("create.toadstool.json");
    const refine = { ...createBody, mode: "refine", pass: 1, spec, render: IMAGE };
    expect((await post(d, refine, a)).status).toBe(400);
    expect((await post(d, { ...refine, jobId: "AAAAAAAAAAAAAAAA" }, a)).status).toBe(400);
    expect((await route((r) => judge(r, d))(jsonReq("POST", "/api/judge", { image: IMAGE, render: IMAGE }, a))).status).toBe(400);
    const job = (await events(await post(d, createBody, a))).find((e) => e.type === "result")!.jobId;
    expect((await post(d, { ...refine, jobId: job }, b)).status).toBe(400); // someone else's job
    const n = calls.length;
    await events(await post(d, { ...refine, jobId: job }, a));
    expect(calls.length).toBe(n + 1);
    // MAX_REFINE_PASSES bounds the passes per job
    const d2 = deps({}, { MAX_REFINE_PASSES: "1" });
    const c = await signIn(d2);
    const j2 = (await events(await post(d2, createBody, c))).find((e) => e.type === "result")!.jobId;
    await events(await post(d2, { ...refine, jobId: j2 }, c));
    expect((await post(d2, { ...refine, jobId: j2 }, c)).status).toBe(400);
  });

  it("allows one in-flight generation per user", async () => {
    const g = gated();
    const d = deps({ api: g.api });
    const cookie = await signIn(d);
    const first = await post(d, createBody, cookie); // Claude is still working, so the lock is held
    const second = await post(d, createBody, cookie);
    expect(second.status).toBe(409);
    expect((await second.json()).code).toBe("in_flight");
    g.release();
    await events(first);
    const third = await post(d, createBody, cookie); // the lock is released when the stream ends
    expect(third.status).toBe(200);
    await third.text();
  });

  it("answers 'busy, retry' when every global slot is taken, and frees slots after a run", async () => {
    const g = gated();
    const d = deps({ api: g.api }, { MAX_CONCURRENT: "1" });
    const a = await signIn(d, "a@example.com");
    const b = await signIn(d, "b@example.com");
    const first = await post(d, createBody, a);
    const busy = await post(d, createBody, b);
    expect(busy.status).toBe(503);
    expect(busy.headers.get("retry-after")).toBe("10");
    expect((await busy.json()).code).toBe("busy");
    g.release();
    await events(first);
    const retry = await post(d, createBody, b);
    expect(retry.status).toBe(200);
    await retry.text();
    // the failed attempt didn't use up b's quota: only the one run counted
    const q = (await (await getSession(jsonReq("GET", "/api/session", undefined, b), d)).json()).quota;
    expect(q.monthly.used).toBe(1);
  });

  it("caps each user's daily compute and tracks it per user", async () => {
    const d = deps({}, { DAILY_USER_USD: "0.05" });
    const a = await signIn(d, "a@example.com");
    const b = await signIn(d, "b@example.com");
    expect((await post(d, createBody, a)).status).toBe(429); // the worst-case next call already doesn't fit
    expect((await post(d, createBody, b)).status).toBe(429);
    const roomy = deps({ kv: d.kv }, { DAILY_USER_USD: "3" });
    const ra = await post(roomy, createBody, a);
    await events(ra);
    const me = await (await getSession(jsonReq("GET", "/api/session", undefined, a), roomy)).json();
    expect(me.quota.daily.spentUsd).toBeGreaterThan(0.1);
    const other = await (await getSession(jsonReq("GET", "/api/session", undefined, b), roomy)).json();
    expect(other.quota.daily.spentUsd).toBe(0);
    await expect(assertUserBudget(roomy.env, roomy.kv!, { id: "x" } as never, 99)).rejects.toMatchObject({ code: "user_budget_exceeded" });
  });

  it("limits per IP across instances (kv-backed) using x-vercel-forwarded-for on Vercel", async () => {
    const kv = new MemoryKv();
    const { KvRateLimiter } = await import("../server/rateLimit");
    const a = new KvRateLimiter(kv, 2);
    const b = new KvRateLimiter(kv, 2); // another instance, same Kv
    await a.check("ip1");
    await b.check("ip1");
    await expect(a.check("ip1")).rejects.toMatchObject({ status: 429 });
    await a.check("ip2");
    const { clientIp } = await import("../server/http");
    const req = new Request("https://x.test", { headers: { "x-vercel-forwarded-for": "198.51.100.9", "x-forwarded-for": "6.6.6.6" } });
    expect(clientIp(req)).toBe("198.51.100.9");
    process.env.VERCEL = "1";
    try {
      expect(clientIp(new Request("https://x.test", { headers: { "x-forwarded-for": "6.6.6.6" } }))).toBe("unknown");
    } finally {
      delete process.env.VERCEL;
    }
  });
});

describe("moderation", () => {
  const gen = (d: Deps) => route((r) => generate(r, d));
  const post = (d: Deps, body: unknown, cookie: string) => gen(d)(jsonReq("POST", "/api/generate", body, cookie));
  const logs = async () => {
    const { sink } = await import("../server/log");
    const lines: string[] = [];
    const orig = sink.write;
    sink.write = (l) => lines.push(l);
    return { lines, restore: () => (sink.write = orig) };
  };

  it("checks every image with Haiku before the main model, and the note with the first", async () => {
    const { api, calls, modCalls } = scripted([fixtureMessage("create.toadstool.json")]);
    const d = deps({ api });
    const cookie = await signIn(d);
    await events(await post(d, { ...createBody, image: undefined, images: { front: IMAGE, left: IMAGE, right: IMAGE }, notes: "a mushroom" }, cookie));
    expect(modCalls).toHaveLength(3);
    expect(calls).toHaveLength(1);
    expect(modCalls[0].model).toBe("claude-haiku-5-5");
    expect(JSON.stringify(modCalls[0].messages)).toContain("a mushroom");
    expect(JSON.stringify(modCalls[1].messages)).not.toContain("a mushroom");
    expect(JSON.stringify(modCalls[0].output_config)).toMatch(/verdict/);
  });

  it("blocks with a 422 and a reason, never calls the main model, refunds the quota, and logs only a hash", async () => {
    const { api, calls } = scripted([fixtureMessage("create.toadstool.json")], () => "moderate.block.json");
    const d = deps({ api }, { MONTHLY_MODELS: "1" });
    const cookie = await signIn(d);
    const l = await logs();
    try {
      const res = await post(d, createBody, cookie);
      expect(res.status).toBe(422);
      const body = await res.json();
      expect(body.code).toBe("moderation_blocked");
      expect(body.error).toMatch(/weapons/);
      expect(calls).toHaveLength(0);
      const { imageInput } = await import("../server/validate");
      const hash = imageHash((await imageInput(IMAGE, "x")).data);
      const line = l.lines.map((x) => JSON.parse(x)).find((x) => x.event === "moderation_block");
      expect(line).toMatchObject({ userId: expect.any(String), category: "weapon", imageHash: hash });
      expect(l.lines.join("\n")).not.toContain(PNG_B64.slice(0, 60));
      expect(JSON.stringify(line)).not.toMatch(/"image"|base64/);
    } finally {
      l.restore();
    }
    const q = (await (await getSession(jsonReq("GET", "/api/session", undefined, cookie), d)).json()).quota;
    expect(q.monthly.used).toBe(0);
  });

  it("refuses a repeat of a blocked image without another model call", async () => {
    const { api, modCalls } = scripted([fixtureMessage("create.toadstool.json")], (_p, n) => (n === 1 ? "moderate.block.json" : "moderate.allow.json"));
    const d = deps({ api });
    const cookie = await signIn(d);
    expect((await post(d, createBody, cookie)).status).toBe(422);
    expect(modCalls).toHaveLength(1);
    const again = await post(d, createBody, cookie);
    expect(again.status).toBe(422);
    expect(modCalls).toHaveLength(1);
  });

  it("locks an account out for the day after three blocks", async () => {
    const { api } = scripted([fixtureMessage("create.toadstool.json")], () => "moderate.block.json");
    const d = deps({ api });
    const cookie = await signIn(d);
    for (let i = 0; i < 3; i++) expect((await post(d, createBody, cookie)).status).toBe(422);
    const res = await post(d, createBody, cookie);
    expect(res.status).toBe(403);
    expect((await res.json()).code).toBe("moderation_locked");
  });

  it("treats a model refusal on the pre-check as a block", async () => {
    const refusal = { ...fixtureMessage("moderate.allow.json"), stop_reason: "refusal" } as BetaMessage;
    const api: MessagesApi = {
      stream: (p) => {
        const msg = isModeration(p) ? refusal : fixtureMessage("create.toadstool.json");
        return { async *[Symbol.asyncIterator]() { yield* messageToEvents(msg); }, finalMessage: async () => msg };
      },
    };
    const d = deps({ api });
    const cookie = await signIn(d);
    expect((await post(d, createBody, cookie)).status).toBe(422);
  });

  it("only lets refinements reuse the images that were approved", async () => {
    const d = deps();
    const cookie = await signIn(d);
    const created = (await events(await post(d, createBody, cookie))).find((e) => e.type === "result")!;
    const refine = { ...createBody, mode: "refine", jobId: created.jobId, pass: 1, spec: created.spec, render: IMAGE };
    const swapped = await post(d, { ...refine, image: { data: readFileSync(path.join(IMAGES, "robot.png")).toString("base64"), mediaType: "image/png" } }, cookie);
    expect(swapped.status).toBe(400);
    expect((await swapped.json()).code).toBe("bad_job");
    await events(await post(d, refine, cookie)); // the original image is fine
  });

  it("mock mode blocks a note containing the test phrase", async () => {
    const d = deps();
    const cookie = await signIn(d);
    expect((await post(d, { ...createBody, notes: "moderation-test-block" }, cookie)).status).toBe(422);
    // (a blocked image stays blocked by hash, so the allowed request uses a different one)
    const other = { data: readFileSync(path.join(IMAGES, "robot.png")).toString("base64"), mediaType: "image/png" };
    const ok = await post(d, { ...createBody, image: other }, cookie);
    expect(ok.status).toBe(200);
    await ok.text();
  });
});
