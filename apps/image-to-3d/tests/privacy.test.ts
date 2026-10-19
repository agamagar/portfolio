/** Storage privacy: per-user isolation, signed links, retention, delete / delete-all, sharing and reports. */
import { mkdtempSync, readFileSync, rmSync, utimesSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Deps } from "../server/deps";
import { readEnv } from "../server/env";
import { cron } from "../server/handlers/cron";
import { getFile } from "../server/handlers/file";
import { deleteItem, getLibrary, patchItem, saveItem, upload } from "../server/handlers/library";
import { getSession, postSession } from "../server/handlers/session";
import { AUTO_TAKEDOWN_REPORTS, getShared, reportShared } from "../server/handlers/shared";
import { route } from "../server/http";
import { MemoryKv } from "../server/kv";
import { RateLimiter } from "../server/rateLimit";
import { sweep } from "../server/retention";
import { signFile, verifyFile } from "../server/signing";
import { FsStore } from "../server/store/fsStore";
import { fixtureSpec, IMAGES } from "./helpers";

const BASE = "https://i3d.test";
const ID = "0b6f6a9e-6a2c-4c1e-9d55-2f4f5f0f8a11";
const PNG = new Uint8Array(readFileSync(path.join(IMAGES, "robot.png")));
const GLB = (() => {
  const b = new Uint8Array(64);
  b.set([0x67, 0x6c, 0x54, 0x46]);
  return b;
})();

let dir: string;
beforeEach(() => {
  dir = mkdtempSync(path.join(tmpdir(), "i3d-priv-"));
});
afterEach(() => rmSync(dir, { recursive: true, force: true }));

function deps(env: Record<string, string> = {}): Deps {
  return {
    env: readEnv({ MOCK_AUTH: "1", SESSION_SECRET: "test-secret", ...env }),
    store: new FsStore(dir),
    kv: new MemoryKv(),
    api: null,
    claudeLimiter: new RateLimiter(100),
    loginLimiter: new RateLimiter(100),
    publicLimiter: new RateLimiter(100),
    reportLimiter: new RateLimiter(100),
  };
}

const req = (method: string, url: string, body?: unknown, cookie?: string, extra: Record<string, string> = {}) =>
  new Request(BASE + url, { method, headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.7", ...(cookie ? { cookie } : {}), ...extra }, body: body === undefined ? undefined : JSON.stringify(body) });

async function signIn(d: Deps, email: string): Promise<string> {
  const res = await route((r) => postSession(r, d))(req("POST", "/api/session", { action: "mock", email }));
  return res.headers.get("set-cookie")!.split(";")[0];
}
const uid = async (d: Deps, cookie: string) => (await (await getSession(req("GET", "/api/session", undefined, cookie), d)).json()).user.id as string;

async function saveModel(d: Deps, cookie: string, id = ID, title = "Toadstool") {
  const up = (name: string, type: string, body: Uint8Array<ArrayBuffer>) => route((r) => upload(r, d))(new Request(`${BASE}/api/upload?id=${id}&name=${name}`, { method: "PUT", headers: { cookie, "content-type": type }, body }));
  for (const [n, t, b] of [["model", "model/gltf-binary", GLB], ["thumb", "image/png", PNG], ["source", "image/png", PNG]] as const) expect((await up(n, t, b)).status).toBe(201);
  const res = await route((r) => saveItem(r, d))(req("POST", "/api/library", { id, title, spec: fixtureSpec("refine.toadstool.1.json") }, cookie));
  expect(res.status).toBe(201);
  return (await res.json()).item as { files: Record<string, string> };
}
const fileReq = (url: string, extra?: Record<string, string>) => new Request(BASE + url, { headers: extra });

describe("per-user privacy", () => {
  it("users only ever see their own library, and can't reach another's files", async () => {
    const d = deps();
    const a = await signIn(d, "a@example.com");
    const b = await signIn(d, "b@example.com");
    const item = await saveModel(d, a);
    const list = (cookie: string) => route((r) => getLibrary(r, d))(req("GET", "/api/library", undefined, cookie)).then((r) => r.json());
    expect((await list(a)).items).toHaveLength(1);
    expect((await list(b)).items).toEqual([]);
    // b asking for a's id (a UUID is no secret) finds nothing, and can't patch or delete it
    expect((await route((r) => getLibrary(r, d))(req("GET", `/api/library?id=${ID}`, undefined, b))).status).toBe(404);
    expect((await route((r) => patchItem(r, d))(req("PATCH", "/api/library", { id: ID, title: "mine now" }, b))).status).toBe(404);
    expect((await route((r) => deleteItem(r, d))(req("DELETE", `/api/library?id=${ID}`, undefined, b))).status).toBe(404);
    expect((await list(a)).items[0].title).toBe("Toadstool");
    // a's files live under a's own prefix
    const p = new URL(item.files.glb, BASE).searchParams.get("p")!;
    expect(p.startsWith(`i3d/users/${await uid(d, a)}/`)).toBe(true);
    expect(await d.store!.list(`i3d/users/${await uid(d, b)}/`)).toEqual([]);
  });

  it("the library needs a session; storage URLs never reach the browser", async () => {
    const d = deps();
    const a = await signIn(d, "a@example.com");
    expect((await route((r) => getLibrary(r, d))(req("GET", "/api/library"))).status).toBe(401);
    const item = await saveModel(d, a);
    expect(JSON.stringify(item)).not.toMatch(/https?:\/\/[^"]*blob|\/files\//);
    for (const url of Object.values(item.files)) expect(url).toMatch(/^\/api\/file\?p=.+&e=\d+&s=/);
  });
});

describe("signed links", () => {
  it("serve the file while valid, refuse a tampered path, a bad signature and an expired link", async () => {
    const d = deps();
    const a = await signIn(d, "a@example.com");
    const item = await saveModel(d, a);
    const ok = await route((r) => getFile(r, d))(fileReq(item.files.glb));
    expect(ok.status).toBe(200);
    expect(ok.headers.get("content-type")).toBe("model/gltf-binary");
    expect(new Uint8Array(await ok.arrayBuffer())).toEqual(GLB);

    const u = new URL(item.files.glb, BASE);
    const other = new URL(u);
    other.searchParams.set("p", u.searchParams.get("p")!.replace("model-", "thumb-"));
    expect((await route((r) => getFile(r, d))(fileReq(other.pathname + other.search))).status).toBe(403);
    const forged = new URL(u);
    forged.searchParams.set("s", "A".repeat(43));
    expect((await route((r) => getFile(r, d))(fileReq(forged.pathname + forged.search))).status).toBe(403);
    const old = signFile(d.env, u.searchParams.get("p")!, 60, Date.now() - 3600_000);
    expect((await route((r) => getFile(r, d))(fileReq(old))).status).toBe(403);
    // a link signed with another secret is no good
    const stranger = signFile(readEnv({ SESSION_SECRET: "other" }), u.searchParams.get("p")!);
    expect((await route((r) => getFile(r, d))(fileReq(stranger))).status).toBe(403);
  });

  it("only signs paths under users/, and verify rejects missing parts", () => {
    const env = readEnv({ SESSION_SECRET: "x" });
    expect(verifyFile(env, new URLSearchParams("p=a"))).toBeNull();
    const link = new URL(signFile(env, "i3d/users/u/items/i/model-1.glb"), BASE);
    expect(verifyFile(env, link.searchParams)).toBe("i3d/users/u/items/i/model-1.glb");
  });

  it("refuses a validly signed path outside i3d/users/ (the spend ledger, say)", async () => {
    const d = deps();
    await d.store!.put("i3d/usage/2026-10-19/1-aa-100.u", "1", "text/plain");
    const res = await route((r) => getFile(r, d))(fileReq(signFile(d.env, "i3d/usage/2026-10-19/1-aa-100.u")));
    expect(res.status).toBe(403);
  });
});

describe("retention", () => {
  const age = (file: string, ms: number) => utimesSync(file, new Date(Date.now() - ms), new Date(Date.now() - ms));
  const backdate = async (d: Deps, match: (p: string) => boolean, ms: number) => {
    for (const f of await d.store!.list("i3d/users/")) if (match(f.pathname)) age(path.join(dir, f.pathname), ms);
  };
  const setCreatedAt = async (d: Deps, userId: string, ms: number) => {
    const { readIndex, mutateIndex } = await import("../server/library");
    await readIndex(d.store!, userId);
    await mutateIndex(d.store!, userId, (items) => items.map((i) => ({ ...i, createdAt: new Date(Date.now() - ms).toISOString() })));
  };
  const H = 3600_000;

  it("hides and deletes sources after 24h, keeps the model", async () => {
    const d = deps();
    const a = await signIn(d, "a@example.com");
    await saveModel(d, a);
    const userId = await uid(d, a);
    await backdate(d, () => true, 25 * H);
    await setCreatedAt(d, userId, 25 * H);
    // already unreachable before the cron runs
    const list = await (await route((r) => getLibrary(r, d))(req("GET", "/api/library", undefined, a))).json();
    expect(list.items[0].files.source).toBeUndefined();
    expect(list.items[0].files.glb).toBeTruthy();
    const staleSource = signFile(d.env, (await d.store!.list(`i3d/users/${userId}/items/`)).find((f) => f.pathname.includes("/source-"))!.pathname);
    expect((await route((r) => getFile(r, d))(fileReq(staleSource))).status).toBe(410);

    const r = await sweep(d);
    expect(r.filesDeleted).toBe(1);
    expect(r.sourcesCleared).toBe(1);
    const left = (await d.store!.list(`i3d/users/${userId}/items/`)).map((f) => f.pathname.split("/").pop()!.split("-")[0]);
    expect(left.sort()).toEqual(["model", "spec", "thumb"]);
    expect((await (await route((r2) => getLibrary(r2, d))(req("GET", "/api/library", undefined, a))).json()).items).toHaveLength(1);
  });

  it("deletes whole models and their share links after 30 days", async () => {
    const d = deps();
    const a = await signIn(d, "a@example.com");
    await saveModel(d, a);
    await route((r) => patchItem(r, d))(req("PATCH", "/api/library", { id: ID, shared: true }, a));
    const userId = await uid(d, a);
    expect((await d.kv!.keys("share:")).length).toBe(1);
    await backdate(d, (p) => p.includes("/items/"), 31 * 24 * H);
    await setCreatedAt(d, userId, 31 * 24 * H);
    expect((await (await route((r) => getLibrary(r, d))(req("GET", "/api/library", undefined, a))).json()).items).toEqual([]);
    const r = await sweep(d);
    expect(r.itemsExpired).toBe(1);
    expect((await d.store!.list(`i3d/users/${userId}/items/`))).toEqual([]);
    expect(await d.kv!.keys("share:")).toEqual([]);
  });

  it("deletes uploads that were never saved, after 24h only", async () => {
    const d = deps();
    const a = await signIn(d, "a@example.com");
    const userId = await uid(d, a);
    await route((r) => upload(r, d))(new Request(`${BASE}/api/upload?id=${ID}&name=model`, { method: "PUT", headers: { cookie: a, "content-type": "model/gltf-binary" }, body: GLB }));
    expect((await sweep(d)).filesDeleted).toBe(0);
    await backdate(d, () => true, 25 * H);
    expect((await sweep(d)).filesDeleted).toBe(1);
    expect(await d.store!.list(`i3d/users/${userId}/items/`)).toEqual([]);
  });

  it("the cron route needs the bearer secret, and refuses to run in production without one", async () => {
    const d = deps({ CRON_SECRET: "c-secret" });
    expect((await route((r) => cron(r, d))(req("GET", "/api/cron"))).status).toBe(401);
    expect((await route((r) => cron(r, d))(req("GET", "/api/cron", undefined, undefined, { authorization: "Bearer nope" }))).status).toBe(401);
    const ok = await route((r) => cron(r, d))(req("GET", "/api/cron", undefined, undefined, { authorization: "Bearer c-secret" }));
    expect(ok.status).toBe(200);
    expect(await ok.json()).toMatchObject({ filesDeleted: 0 });
    const prod = deps({ VERCEL_ENV: "production", GOOGLE_CLIENT_ID: "x" });
    expect((await route((r) => cron(r, prod))(req("GET", "/api/cron"))).status).toBe(503);
  });
});

describe("delete", () => {
  it("delete-all removes every file, index version and share link of the user, and nobody else's", async () => {
    const d = deps();
    const a = await signIn(d, "a@example.com");
    const b = await signIn(d, "b@example.com");
    await saveModel(d, a);
    await saveModel(d, a, "1b6f6a9e-6a2c-4c1e-9d55-2f4f5f0f8a22", "Second");
    await saveModel(d, b);
    await route((r) => patchItem(r, d))(req("PATCH", "/api/library", { id: ID, shared: true }, a));
    const res = await route((r) => deleteItem(r, d))(req("DELETE", "/api/library?all=1", undefined, a));
    expect(await res.json()).toMatchObject({ deleted: 2 });
    expect(await d.store!.list(`i3d/users/${await uid(d, a)}/`)).toEqual([]);
    expect(await d.kv!.keys("share:")).toEqual([]);
    expect((await d.store!.list(`i3d/users/${await uid(d, b)}/`)).length).toBeGreaterThan(0);
  });

  it("deleting the account needs the email typed, then removes data, user and sessions", async () => {
    const d = deps();
    const a = await signIn(d, "a@example.com");
    await saveModel(d, a);
    const post = (body: unknown) => route((r) => postSession(r, d))(req("POST", "/api/session", body, a));
    expect((await post({ action: "delete-account", confirm: "wrong@example.com" })).status).toBe(400);
    expect((await post({ action: "delete-account", confirm: "a@example.com" })).status).toBe(200);
    expect((await route((r) => getLibrary(r, d))(req("GET", "/api/library", undefined, a))).status).toBe(401);
    expect(await d.store!.list("i3d/users/")).toEqual([]);
    expect(await d.kv!.keys("user:")).toEqual([]);
    expect(await d.kv!.get("email:a@example.com")).toBeNull();
  });
});

describe("sharing and reports", () => {
  async function share(d: Deps, cookie: string) {
    await saveModel(d, cookie);
    const res = await route((r) => patchItem(r, d))(req("PATCH", "/api/library", { id: ID, shared: true }, cookie));
    const { item } = await res.json();
    return item.shareToken as string;
  }

  it("a shared model is readable without signing in, without sources, owner or cost", async () => {
    const d = deps();
    const a = await signIn(d, "a@example.com");
    const t = await share(d, a);
    const res = await route((r) => getShared(r, d))(req("GET", `/api/shared?t=${t}`));
    expect(res.status).toBe(200);
    const text = await res.text();
    const body = JSON.parse(text);
    expect(body.item.title).toBe("Toadstool");
    expect(body.spec.parts.length).toBeGreaterThan(3);
    expect(Object.keys(body.item.files).sort()).toEqual(["glb", "thumb"]);
    expect(text).not.toMatch(/a@example\.com|costUsd|source|shareToken/);
    expect((await route((r) => getFile(r, d))(fileReq(body.item.files.glb))).status).toBe(200);
  });

  it("unsharing revokes the link; bad tokens 404", async () => {
    const d = deps();
    const a = await signIn(d, "a@example.com");
    const t = await share(d, a);
    await route((r) => patchItem(r, d))(req("PATCH", "/api/library", { id: ID, shared: false }, a));
    expect((await route((r) => getShared(r, d))(req("GET", `/api/shared?t=${t}`))).status).toBe(404);
    expect((await route((r) => getShared(r, d))(req("GET", "/api/shared?t=nope"))).status).toBe(404);
  });

  it("reports are stored, and enough distinct reporters take the model down for good", async () => {
    const d = deps();
    const a = await signIn(d, "a@example.com");
    const t = await share(d, a);
    const report = (ip: string, reason = "sexual") => route((r) => reportShared(r, d))(req("POST", "/api/shared", { t, reason, details: "bad" }, undefined, { "x-forwarded-for": ip }));
    expect((await report("198.51.100.1")).status).toBe(201);
    expect((await report("198.51.100.1")).status).toBe(201); // the same reporter again doesn't add up
    expect((await report("198.51.100.2")).status).toBe(201);
    expect((await route((r) => getShared(r, d))(req("GET", `/api/shared?t=${t}`))).status).toBe(200);
    const last = await report("198.51.100.3", "not-a-reason");
    expect(await last.json()).toMatchObject({ takenDown: true });
    expect(AUTO_TAKEDOWN_REPORTS).toBe(3);
    expect((await d.kv!.keys("report:")).length).toBe(4);
    expect((await route((r) => getShared(r, d))(req("GET", `/api/shared?t=${t}`))).status).toBe(404);
    const again = await route((r) => patchItem(r, d))(req("PATCH", "/api/library", { id: ID, shared: true }, a));
    expect(again.status).toBe(403);
  });

  it("reports on unknown links 404", async () => {
    const d = deps();
    const res = await route((r) => reportShared(r, d))(req("POST", "/api/shared", { t: "A".repeat(24), reason: "other" }));
    expect(res.status).toBe(404);
  });
});
