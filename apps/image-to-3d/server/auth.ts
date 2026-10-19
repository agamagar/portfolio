/**
 * Session cookie + Google OAuth (authorization-code flow, done by hand: Auth.js needs a Next or
 * Express host, and this app is a Vite SPA with plain Web-standard Vercel functions).
 *
 * The cookie holds a random token; the session itself lives in the Kv (users.ts), so signing
 * out or deleting an account takes effect at once. HttpOnly, SameSite=Lax (Lax so the cookie
 * survives the redirect back from Google; cross-site POSTs still don't carry it, and every
 * write route requires application/json), Secure over https.
 */
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { Deps } from "./deps.js";
import type { Env } from "./env.js";
import { HttpError } from "./http.js";
import { hasConsented, userForSession, type User } from "./users.js";

export const COOKIE = "i3d_session";
const STATE_COOKIE = "i3d_oauth";

export function isHttps(req: Request): boolean {
  const proto = req.headers.get("x-forwarded-proto");
  if (proto) return proto.split(",")[0].trim() === "https";
  return new URL(req.url).protocol === "https:";
}

export function readCookie(req: Request, name: string): string | null {
  const header = req.headers.get("cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return v.join("=");
  }
  return null;
}

export function sessionCookie(req: Request, token: string, maxAgeS: number): string {
  return `${COOKIE}=${token}; Path=/; Max-Age=${maxAgeS}; HttpOnly; SameSite=Lax${isHttps(req) ? "; Secure" : ""}`;
}

export function clearCookie(req: Request): string {
  return sessionCookie(req, "", 0);
}

export const sessionToken = (req: Request) => readCookie(req, COOKIE);

/** The signed-in user, or null. Throws 503 when the deployment can't safely run accounts. */
export async function currentUser(d: Deps, req: Request): Promise<User | null> {
  guardConfigured(d);
  return userForSession(d.env, d.kv!, sessionToken(req));
}

/** Requires a signed-in user. `consent: true` also requires agreement to the current Terms. */
export async function requireUser(d: Deps, req: Request, opts: { consent?: boolean } = {}): Promise<User> {
  const user = await currentUser(d, req);
  if (!user) throw new HttpError(401, "Sign in to continue.", "unauthenticated");
  if (opts.consent === true && !hasConsented(user)) throw new HttpError(403, "Agree to the Terms and Privacy Policy to continue.", "consent_required");
  return user;
}

export async function requireAdmin(d: Deps, req: Request): Promise<User> {
  const user = await requireUser(d, req);
  if (user.role !== "admin") throw new HttpError(403, "Admins only.", "forbidden");
  return user;
}

/** Fail closed: production needs durable storage for accounts and a way to sign in. */
export function guardConfigured(d: Pick<Deps, "env" | "kv">): void {
  const { env } = d;
  if (!d.kv) throw new HttpError(503, "Accounts need Upstash Redis: set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.", "not_configured");
  if (env.isProduction && !env.googleClientId) throw new HttpError(503, "Google sign-in is not configured (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET).", "not_configured");
  if (env.isProduction && !env.sessionSecret) throw new HttpError(503, "SESSION_SECRET is not set on the server.", "not_configured");
}

// --- OAuth state ----------------------------------------------------------------

function secret(env: Env): string {
  return env.sessionSecret ?? "dev-only-secret";
}
const sign = (env: Env, payload: string) => createHmac("sha256", secret(env)).update(payload).digest("base64url");

export function signValue(env: Env, payload: string): string {
  return `${payload}.${sign(env, payload)}`;
}
export function verifyValue(env: Env, signed: string | null): string | null {
  if (!signed) return null;
  const i = signed.lastIndexOf(".");
  if (i < 0) return null;
  const payload = signed.slice(0, i);
  const a = Buffer.from(signed.slice(i + 1));
  const b = Buffer.from(sign(env, payload));
  return a.length === b.length && timingSafeEqual(a, b) ? payload : null;
}

const redirectUri = (env: Env, req: Request) => `${env.publicUrl ?? new URL(req.url).origin}/api/auth?action=callback`;

/** Step 1: where to send the browser, plus the cookie that proves the callback is ours. */
export function googleStart(env: Env, req: Request, invite: string): { location: string; cookie: string } {
  if (!env.googleClientId) throw new HttpError(404, "Google sign-in is not configured.", "no_google");
  const nonce = randomBytes(16).toString("base64url");
  const state = signValue(env, JSON.stringify({ n: nonce, i: invite.slice(0, 64), t: Date.now() }));
  const q = new URLSearchParams({
    client_id: env.googleClientId,
    redirect_uri: redirectUri(env, req),
    response_type: "code",
    scope: "openid email profile",
    state: nonce,
    prompt: "select_account",
  });
  const cookie = `${STATE_COOKIE}=${Buffer.from(state).toString("base64url")}; Path=/api/auth; Max-Age=600; HttpOnly; SameSite=Lax${isHttps(req) ? "; Secure" : ""}`;
  return { location: `https://accounts.google.com/o/oauth2/v2/auth?${q}`, cookie };
}

export interface GoogleProfile {
  email: string;
  name: string;
}

/** Step 2: check state against the cookie, swap the code for a token, read the verified profile. */
export async function googleCallback(env: Env, req: Request, fetchImpl: typeof fetch = fetch): Promise<{ profile: GoogleProfile; invite: string; clearCookie: string }> {
  const url = new URL(req.url);
  const raw = readCookie(req, STATE_COOKIE);
  const payload = verifyValue(env, raw ? Buffer.from(raw, "base64url").toString() : null);
  const clear = `${STATE_COOKIE}=; Path=/api/auth; Max-Age=0; HttpOnly; SameSite=Lax`;
  if (!payload) throw new HttpError(400, "Sign-in expired. Try again.", "bad_state");
  const st = JSON.parse(payload) as { n: string; i: string; t: number };
  if (st.n !== url.searchParams.get("state") || Date.now() - st.t > 10 * 60_000) throw new HttpError(400, "Sign-in expired. Try again.", "bad_state");
  const code = url.searchParams.get("code");
  if (!code || !env.googleClientId || !env.googleClientSecret) throw new HttpError(400, "Google sign-in failed.", "oauth_failed");

  const tok = await fetchImpl("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ code, client_id: env.googleClientId, client_secret: env.googleClientSecret, redirect_uri: redirectUri(env, req), grant_type: "authorization_code" }),
  });
  const tj = (await tok.json().catch(() => null)) as { access_token?: string } | null;
  if (!tok.ok || !tj?.access_token) throw new HttpError(502, "Google sign-in failed.", "oauth_failed");
  // userinfo is fetched with the token Google just issued to us over TLS, so there's no JWT to verify
  const info = await fetchImpl("https://openidconnect.googleapis.com/v1/userinfo", { headers: { authorization: `Bearer ${tj.access_token}` } });
  const p = (await info.json().catch(() => null)) as { email?: string; email_verified?: boolean; name?: string } | null;
  if (!info.ok || !p?.email || p.email_verified === false) throw new HttpError(403, "Your Google account has no verified email.", "oauth_failed");
  return { profile: { email: p.email, name: p.name ?? "" }, invite: st.i, clearCookie: clear };
}
