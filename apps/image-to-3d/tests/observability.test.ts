/** Structured logs (no images, no secrets), spend alerts via webhook, and the admin API. */
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { checkBudgetAlerts, notify } from "../server/alerts";
import { recordSpend } from "../server/budget";
import type { Deps } from "../server/deps";
import { readEnv } from "../server/env";
import { getAdmin, postAdmin } from "../server/handlers/admin";
import { generate } from "../server/handlers/generate";
import { patchItem, saveItem, upload } from "../server/handlers/library";
import { getSession, postSession } from "../server/handlers/session";
import { route } from "../server/http";
import { MemoryKv } from "../server/kv";
import { log, sink } from "../server/log";
import { fixtureMessagesApi } from "../server/mock";
import { RateLimiter } from "../server/rateLimit";
import { FsStore } from "../server/store/fsStore";
import { signInOrSignUp } from "../server/users";
import { FIXTURES, fixtureSpec, IMAGES } from "./helpers";

const BASE = "https://i3d.test";
const PNG_B64 = readFileSync(path.join(IMAGES, "toadstool.png")).toString("base64");
let dir: string;
beforeEach(() => {
  dir = mkdtempSync(path.join(tmpdir(), "i3d-obs-"));
});
afterEach(() => rmSync(dir, { recursive: true, force: true }));

function deps(env: Record<string, string> = {}): Deps {
  return {
    env: readEnv({ MOCK_AUTH: "1", SESSION_SECRET: "s", ADMIN_EMAILS: "boss@example.com", DAILY_BUDGET_USD: "10", ...env }),
    store: new FsStore(dir),
    kv: new MemoryKv(),
    api: fixtureMessagesApi(FIXTURES, 0),
    claudeLimiter: new RateLimiter(100),
    loginLimiter: new RateLimiter(100),
    publicLimiter: new RateLimiter(100),
    reportLimiter: new RateLimiter(100),
  };
}
const req = (method: string, url: string, body?: unknown, cookie?: string) =>
  new Request(BASE + url, { method, headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.7", ...(cookie ? { cookie } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
async function signIn(d: Deps, email: string) {
  const res = await route((r) => postSession(r, d))(req("POST", "/api/session", { action: "mock", email }));
  const cookie = res.headers.get("set-cookie")!.split(";")[0];
  await route((r) => postSession(r, d))(req("POST", "/api/session", { action: "consent" }, cookie));
  return cookie;
}
function capture() {
  const lines: string[] = [];
  const orig = sink.write;
  sink.write = (l) => lines.push(l);
  return { lines, parsed: () => lines.map((l) => JSON.parse(l) as Record<string, any>), restore: () => (sink.write = orig) };
}

describe("structured logs", () => {
  it("are one JSON object per line and never contain images, cookies or secrets", () => {
    const c = capture();
    try {
      log("test", { userId: "u1", image: PNG_B64, data: PNG_B64, cookie: "i3d_session=abc", nested: { render: PNG_B64, ok: 1 }, blob: PNG_B64, url: `data:image/png;base64,${PNG_B64}`, buf: new Uint8Array(10) });
      const [line] = c.parsed();
      expect(line).toMatchObject({ event: "test", level: "info", userId: "u1", nested: { ok: 1 } });
      expect(c.lines[0]).not.toContain(PNG_B64.slice(0, 80));
      expect(line.image).toBeUndefined();
      expect(line.cookie).toBeUndefined();
      expect(line.blob).toBe("[redacted blob]");
      expect(line.url).toBe("[redacted blob]");
      expect(line.buf).toBe("[redacted bytes]");
    } finally {
      c.restore();
    }
  });

  it("a generation logs its outcome, cost and timing, and nothing of the image", async () => {
    const d = deps();
    const cookie = await signIn(d, "a@example.com");
    const c = capture();
    try {
      const res = await route((r) => generate(r, d))(req("POST", "/api/generate", { mode: "create", image: { data: PNG_B64, mediaType: "image/png" }, style: "clay", model: "claude-opus-5-5", effort: "medium", notes: "my secret note" }, cookie));
      await res.text();
      const gen = c.parsed().find((l) => l.event === "generate")!;
      expect(gen).toMatchObject({ mode: "create", model: "claude-opus-5-5", views: 1 });
      expect(gen.costUsd).toBeGreaterThan(0);
      expect(gen.ms).toBeGreaterThanOrEqual(0);
      expect(gen.userId).toMatch(/^[0-9a-f]{24}$/);
      expect(c.lines.join("\n")).not.toContain(PNG_B64.slice(0, 80));
      expect(c.lines.join("\n")).not.toContain("my secret note");
    } finally {
      c.restore();
    }
  });
});

describe("spend alerts", () => {
  const hook = () => {
    const calls: { url: string; body: any }[] = [];
    const f = (async (url: string, init: RequestInit) => {
      calls.push({ url, body: JSON.parse(String(init.body)) });
      return new Response("ok");
    }) as unknown as typeof fetch;
    return { calls, f };
  };

  it("fires each threshold once per day, in order, as the spend crosses it", async () => {
    const d = deps({ ALERT_WEBHOOK_URL: "https://hooks.example/secret-path", DAILY_BUDGET_USD: "10", ALERT_THRESHOLDS: "50,80,100" });
    const h = hook();
    expect(await checkBudgetAlerts(d, Date.now(), h.f)).toEqual([]);
    await recordSpend(d.store!, 4);
    expect(await checkBudgetAlerts(d, Date.now(), h.f)).toEqual([]);
    await recordSpend(d.store!, 1.5); // 55%
    expect(await checkBudgetAlerts(d, Date.now(), h.f)).toEqual([50]);
    expect(await checkBudgetAlerts(d, Date.now(), h.f)).toEqual([]); // not again
    await recordSpend(d.store!, 5); // 105%: 80 and 100 together
    expect(await checkBudgetAlerts(d, Date.now(), h.f)).toEqual([80, 100]);
    expect(h.calls).toHaveLength(3);
    expect(h.calls[0].url).toBe("https://hooks.example/secret-path");
    expect(h.calls[0].body.text).toMatch(/^\[image-to-3d\] Spend is at 55%/);
    expect(h.calls[2].body.text).toMatch(/paused until 00:00 UTC/);
    // a new day starts fresh
    expect(await checkBudgetAlerts(d, Date.now() + 86_400_000, h.f)).toEqual([]);
  });

  it("without a webhook it only logs, and a failing webhook never throws or leaks its URL", async () => {
    const c = capture();
    try {
      await notify(readEnv({}), "hello");
      const boom = (async () => {
        throw new Error("down");
      }) as unknown as typeof fetch;
      await notify(readEnv({ ALERT_WEBHOOK_URL: "https://hooks.example/secret-path" }), "hello", "warn", boom);
      expect(c.lines.join("\n")).not.toContain("secret-path");
      expect(c.parsed().some((l) => l.event === "alert_webhook_failed")).toBe(true);
    } finally {
      c.restore();
    }
  });
});

describe("admin", () => {
  it("is for admins only", async () => {
    const d = deps();
    expect((await route((r) => getAdmin(r, d))(req("GET", "/api/admin"))).status).toBe(401);
    const user = await signIn(d, "a@example.com");
    expect((await route((r) => getAdmin(r, d))(req("GET", "/api/admin", undefined, user))).status).toBe(403);
    expect((await route((r) => postAdmin(r, d))(req("POST", "/api/admin", { action: "create-invite" }, user))).status).toBe(403);
  });

  it("shows spend by day, per-user usage and users", async () => {
    const d = deps();
    const boss = await signIn(d, "boss@example.com");
    const user = await signIn(d, "a@example.com");
    await route((r) => generate(r, d))(req("POST", "/api/generate", { mode: "create", image: { data: PNG_B64, mediaType: "image/png" }, style: "clay", model: "claude-opus-5-5", effort: "medium", notes: "" }, user)).then((r) => r.text());
    const body = await (await route((r) => getAdmin(r, d))(req("GET", "/api/admin", undefined, boss))).json();
    expect(body.today.usd).toBeGreaterThan(0.1);
    expect(body.days).toHaveLength(14);
    expect(body.days[0].usd).toBeCloseTo(body.today.usd, 6);
    const row = body.users.find((u: any) => u.email === "a@example.com");
    expect(row).toMatchObject({ modelsThisMonth: 1, role: "user" });
    expect(row.usdToday).toBeGreaterThan(0.1);
    expect(body.users.find((u: any) => u.email === "boss@example.com").role).toBe("admin");
  });

  it("mints invite codes that let someone in, and revokes them", async () => {
    const d = deps({ INVITE_REQUIRED: "true" });
    const boss = await signIn(d, "boss@example.com");
    const post = (body: unknown) => route((r) => postAdmin(r, d))(req("POST", "/api/admin", body, boss));
    const { code } = await (await post({ action: "create-invite", maxUses: 1, note: "for Sam" })).json();
    expect(code).toMatch(/^[a-z0-9]{4}-[a-z0-9]{4}$/);
    const listed = await (await route((r) => getAdmin(r, d))(req("GET", "/api/admin", undefined, boss))).json();
    expect(listed.invites[0]).toMatchObject({ code, maxUses: 1, uses: 0, note: "for Sam" });
    await expect(signInOrSignUp(d.env, d.kv!, { email: "sam@example.com", invite: code })).resolves.toMatchObject({ created: true });
    const { code: second } = await (await post({ action: "create-invite" })).json();
    await post({ action: "revoke-invite", code: second });
    await expect(signInOrSignUp(d.env, d.kv!, { email: "late@example.com", invite: second })).rejects.toMatchObject({ code: "invite_required" });
  });

  it("takes a shared model down on request", async () => {
    const d = deps();
    const boss = await signIn(d, "boss@example.com");
    const user = await signIn(d, "a@example.com");
    const id = "0b6f6a9e-6a2c-4c1e-9d55-2f4f5f0f8a11";
    const png = new Uint8Array(readFileSync(path.join(IMAGES, "robot.png")));
    for (const [n, t, b] of [["model", "model/gltf-binary", new Uint8Array([0x67, 0x6c, 0x54, 0x46, ...new Array(60).fill(0)])], ["thumb", "image/png", png]] as const) {
      await route((r) => upload(r, d))(new Request(`${BASE}/api/upload?id=${id}&name=${n}`, { method: "PUT", headers: { cookie: user, "content-type": t }, body: b }));
    }
    await route((r) => saveItem(r, d))(req("POST", "/api/library", { id, spec: fixtureSpec("refine.toadstool.1.json") }, user));
    const { item } = await (await route((r) => patchItem(r, d))(req("PATCH", "/api/library", { id, shared: true }, user))).json();
    const res = await route((r) => postAdmin(r, d))(req("POST", "/api/admin", { action: "takedown", token: item.shareToken }, boss));
    expect(res.status).toBe(200);
    expect(await d.kv!.get(`share:${item.shareToken}`)).toBeNull();
    expect((await route((r) => patchItem(r, d))(req("PATCH", "/api/library", { id, shared: true }, user))).status).toBe(403);
    const me = await (await getSession(req("GET", "/api/session", undefined, boss), d)).json();
    expect(me.user.role).toBe("admin");
  });
});
