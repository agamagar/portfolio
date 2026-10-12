/**
 * Access gate: one shared password (APP_PASSWORD) exchanged for a signed,
 * HttpOnly, SameSite=Strict session cookie. Stateless, so it works across
 * serverless instances. Fails closed in production when no password is set.
 */
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import type { Env } from "./env.js";
import { HttpError } from "./http.js";

export const COOKIE = "i3d_session";
const MAX_AGE_S = 60 * 60 * 24 * 30;

function key(env: Env): Buffer {
  const material = env.sessionSecret ?? `i3d:${env.appPassword ?? ""}`;
  return createHash("sha256").update(material).digest();
}

function sign(env: Env, payload: string): string {
  return createHmac("sha256", key(env)).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function checkPassword(env: Env, password: unknown): boolean {
  if (!env.appPassword || typeof password !== "string") return false;
  return safeEqual(password, env.appPassword);
}

export function sessionCookie(env: Env, req: Request, now = Date.now()): string {
  const exp = Math.floor(now / 1000) + MAX_AGE_S;
  const value = `${exp}.${sign(env, String(exp))}`;
  return `${COOKIE}=${value}; Path=/; Max-Age=${MAX_AGE_S}; HttpOnly; SameSite=Strict${isHttps(req) ? "; Secure" : ""}`;
}

export function clearCookie(req: Request): string {
  return `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict${isHttps(req) ? "; Secure" : ""}`;
}

function isHttps(req: Request): boolean {
  const proto = req.headers.get("x-forwarded-proto");
  if (proto) return proto.split(",")[0].trim() === "https";
  return new URL(req.url).protocol === "https:";
}

function readCookie(req: Request, name: string): string | null {
  const header = req.headers.get("cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return v.join("=");
  }
  return null;
}

export function isAuthenticated(env: Env, req: Request, now = Date.now()): boolean {
  if (!env.appPassword) return !env.isProduction; // open in local dev only
  const value = readCookie(req, COOKIE);
  if (!value) return false;
  const [exp, sig] = value.split(".");
  if (!exp || !sig || !/^\d+$/.test(exp)) return false;
  if (Number(exp) * 1000 < now) return false;
  return safeEqual(sig, sign(env, exp));
}

/** Throws 401/503 unless the request carries a valid session. */
export function requireAuth(env: Env, req: Request): void {
  if (env.isProduction && !env.appPassword) {
    throw new HttpError(503, "APP_PASSWORD is not set on the server, so the app is locked.", "not_configured");
  }
  if (!isAuthenticated(env, req)) throw new HttpError(401, "Sign in to continue.", "unauthenticated");
}
