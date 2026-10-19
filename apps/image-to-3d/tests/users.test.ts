/** Accounts: invite codes, admins, sessions, the Kv implementations (incl. Upstash over a fake fetch) and the Google flow. */
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { googleCallback, googleStart } from "../server/auth";
import { readEnv } from "../server/env";
import { FileKv, MemoryKv, UpstashKv } from "../server/kv";
import { createInvite, createSession, deleteUser, getUser, signInOrSignUp, userForSession } from "../server/users";

const env = (o: Record<string, string> = {}) => readEnv({ MOCK_AUTH: "1", ...o });

describe("invite codes", () => {
  it("are required for new accounts only, when the gate is on", async () => {
    const e = env({ INVITE_CODES: "beta-1" });
    const kv = new MemoryKv();
    await expect(signInOrSignUp(e, kv, { email: "a@b.co" })).rejects.toMatchObject({ code: "invite_required" });
    await expect(signInOrSignUp(e, kv, { email: "a@b.co", invite: "nope" })).rejects.toMatchObject({ status: 403 });
    const first = await signInOrSignUp(e, kv, { email: "A@B.co", invite: "BETA-1" });
    expect(first.created).toBe(true);
    // an existing account signs in without a code, and the email is case-insensitive
    const again = await signInOrSignUp(e, kv, { email: "a@b.co" });
    expect(again).toMatchObject({ created: false, user: { id: first.user.id } });
  });

  it("single-use codes can be redeemed once, even concurrently", async () => {
    const e = env({ INVITE_REQUIRED: "true" });
    const kv = new MemoryKv();
    const code = await createInvite(kv, { maxUses: 1 });
    const results = await Promise.allSettled(["x@b.co", "y@b.co", "z@b.co"].map((email) => signInOrSignUp(e, kv, { email, invite: code })));
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
  });

  it("are off in local dev unless asked for, and admins skip them", async () => {
    expect(readEnv({}).inviteRequired).toBe(false);
    expect(readEnv({ VERCEL_ENV: "production" }).inviteRequired).toBe(true);
    const e = env({ INVITE_REQUIRED: "true", ADMIN_EMAILS: "Boss@Example.com" });
    const { user } = await signInOrSignUp(e, new MemoryKv(), { email: "boss@example.com" });
    expect(user.role).toBe("admin");
  });

  it("rejects malformed emails", async () => {
    await expect(signInOrSignUp(env(), new MemoryKv(), { email: "not-an-email" })).rejects.toMatchObject({ code: "bad_email" });
  });
});

describe("sessions", () => {
  it("resolve to the user, and die with the account", async () => {
    const e = env();
    const kv = new MemoryKv();
    const { user } = await signInOrSignUp(e, kv, { email: "a@b.co" });
    const token = await createSession(kv, user.id);
    expect((await userForSession(e, kv, token))?.email).toBe("a@b.co");
    expect(await userForSession(e, kv, "x".repeat(43))).toBeNull();
    await deleteUser(kv, user);
    expect(await userForSession(e, kv, token)).toBeNull();
    expect(await getUser(e, kv, user.id)).toBeNull();
    expect(await kv.get("email:a@b.co")).toBeNull();
  });

  it("an admin removed from ADMIN_EMAILS is demoted", async () => {
    const kv = new MemoryKv();
    const { user } = await signInOrSignUp(env({ ADMIN_EMAILS: "a@b.co" }), kv, { email: "a@b.co" });
    expect((await getUser(env(), kv, user.id))?.role).toBe("user");
  });
});

describe("Kv implementations", () => {
  const exercise = async (kv: MemoryKv | FileKv) => {
    expect(await kv.get("a")).toBeNull();
    await kv.set("a", "1");
    expect(await kv.setNx("a", "2")).toBe(false);
    expect(await kv.setNx("b", "2", { ttlSec: 60 })).toBe(true);
    expect(await kv.incr("n", 0.5)).toBe(0.5);
    expect(await kv.incr("n", 1)).toBe(1.5);
    expect(await kv.keys("")).toEqual(["a", "b", "n"]);
    await kv.del("a");
    expect(await kv.get("a")).toBeNull();
    await kv.set("gone", "x", { ttlSec: 1 });
    const realNow = Date.now;
    Date.now = () => realNow() + 5000;
    try {
      expect(await kv.get("gone")).toBeNull();
    } finally {
      Date.now = realNow;
    }
  };
  it("memory", () => exercise(new MemoryKv()));
  it("file persists across instances", async () => {
    const dir = mkdtempSync(path.join(tmpdir(), "i3d-kv-"));
    try {
      const f = path.join(dir, "kv.json");
      await exercise(new FileKv(f));
      expect(await new FileKv(f).get("b")).toBe("2");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("upstash speaks the REST protocol: POST [command, ...args] with a bearer token", async () => {
    const seen: unknown[][] = [];
    const fake = (async (url: string, init: RequestInit) => {
      expect(url).toBe("https://redis.test");
      expect((init.headers as Record<string, string>).authorization).toBe("Bearer tok");
      const cmd = JSON.parse(String(init.body)) as unknown[];
      seen.push(cmd);
      const result = cmd[0] === "SET" && cmd.includes("NX") ? "OK" : cmd[0] === "INCRBYFLOAT" ? "2.5" : cmd[0] === "SCAN" ? ["0", ["k1", "k2"]] : null;
      return new Response(JSON.stringify({ result }));
    }) as unknown as typeof fetch;
    const kv = new UpstashKv("https://redis.test", "tok", fake);
    expect(await kv.setNx("lock", "1", { ttlSec: 30 })).toBe(true);
    expect(await kv.incr("n", 2.5, { ttlSec: 86400 })).toBe(2.5);
    expect(await kv.keys("user:")).toEqual(["k1", "k2"]);
    expect(seen[0]).toEqual(["SET", "lock", "1", "EX", 30, "NX"]);
    expect(seen.map((c) => c[0])).toContain("EXPIRE");
    await expect(new UpstashKv("https://redis.test", "tok", (async () => new Response(JSON.stringify({ error: "WRONGPASS" }), { status: 401 })) as unknown as typeof fetch).get("x")).rejects.toThrow(/WRONGPASS/);
  });
});

describe("Google sign-in", () => {
  const e = env({ GOOGLE_CLIENT_ID: "cid", GOOGLE_CLIENT_SECRET: "sec", SESSION_SECRET: "s3cret", PUBLIC_URL: "https://3d.agamagarwal.com/" });

  const start = () => googleStart(e, new Request("https://3d.agamagarwal.com/api/auth?action=google"), "beta-1");

  it("sends the right authorize request and sets a state cookie", () => {
    const { location, cookie } = start();
    const u = new URL(location);
    expect(u.origin + u.pathname).toBe("https://accounts.google.com/o/oauth2/v2/auth");
    expect(u.searchParams.get("redirect_uri")).toBe("https://3d.agamagarwal.com/api/auth?action=callback");
    expect(u.searchParams.get("client_id")).toBe("cid");
    expect(cookie).toMatch(/HttpOnly/);
    expect(cookie).not.toContain("beta-1\"");
  });

  const fakeGoogle = (profile: object) =>
    (async (url: string) =>
      new Response(JSON.stringify(String(url).includes("token") ? { access_token: "at" } : profile), { status: 200 })) as unknown as typeof fetch;

  it("completes the flow when state matches, returning the invite from the cookie", async () => {
    const { location, cookie } = start();
    const state = new URL(location).searchParams.get("state")!;
    const req = new Request(`https://3d.agamagarwal.com/api/auth?action=callback&code=abc&state=${state}`, { headers: { cookie: cookie.split(";")[0] } });
    const out = await googleCallback(e, req, fakeGoogle({ email: "g@x.co", email_verified: true, name: "G" }));
    expect(out).toMatchObject({ profile: { email: "g@x.co", name: "G" }, invite: "beta-1" });
  });

  it("rejects a wrong state, a missing cookie, a tampered cookie and an unverified email", async () => {
    const { location, cookie } = start();
    const state = new URL(location).searchParams.get("state")!;
    const c = cookie.split(";")[0];
    const cb = (qs: string, headers: Record<string, string> = {}) => new Request(`https://x.test/api/auth?action=callback&code=abc${qs}`, { headers });
    await expect(googleCallback(e, cb("&state=other", { cookie: c }), fakeGoogle({}))).rejects.toMatchObject({ code: "bad_state" });
    await expect(googleCallback(e, cb(`&state=${state}`), fakeGoogle({}))).rejects.toMatchObject({ code: "bad_state" });
    await expect(googleCallback(e, cb(`&state=${state}`, { cookie: c.slice(0, -3) + "AAA" }), fakeGoogle({}))).rejects.toMatchObject({ code: "bad_state" });
    await expect(googleCallback(e, cb(`&state=${state}`, { cookie: c }), fakeGoogle({ email: "g@x.co", email_verified: false }))).rejects.toMatchObject({ code: "oauth_failed" });
  });
});
