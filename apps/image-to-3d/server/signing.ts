/**
 * Expiring signed links to stored files. The browser never sees a storage URL: it gets
 * /api/file?p=<pathname>&e=<expiry>&s=<HMAC>, the function checks the signature and the
 * expiry, then streams the bytes. A link can be copied, but it dies on its own (1 hour for
 * the owner's views). Revoking everything at once is rotating SESSION_SECRET.
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import type { Env } from "./env.js";

export const LINK_TTL_S = 60 * 60;

const secret = (env: Env) => env.sessionSecret ?? "dev-only-secret";
const mac = (env: Env, pathname: string, exp: number) => createHmac("sha256", secret(env)).update(`file|${pathname}|${exp}`).digest("base64url");

export function signFile(env: Env, pathname: string, ttlS = LINK_TTL_S, now = Date.now()): string {
  const exp = Math.floor(now / 1000) + ttlS;
  return `/api/file?${new URLSearchParams({ p: pathname, e: String(exp), s: mac(env, pathname, exp) })}`;
}

export function verifyFile(env: Env, params: URLSearchParams, now = Date.now()): string | null {
  const p = params.get("p");
  const e = Number(params.get("e"));
  const s = params.get("s");
  if (!p || !s || !Number.isInteger(e) || e * 1000 < now) return null;
  const want = Buffer.from(mac(env, p, e));
  const got = Buffer.from(s);
  return want.length === got.length && timingSafeEqual(want, got) ? p : null;
}
