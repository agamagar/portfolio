/**
 * Accounts: users, server-side sessions and invite codes, all in the Kv.
 *
 *   user:<id>              User JSON
 *   email:<email>          → user id
 *   sess:<sha256(token)>   {uid} with a TTL. The cookie holds the random token; only its hash is stored.
 *   invite:<code>          {maxUses, uses, note, createdAt} for codes an admin made
 *
 * Roles: an email in ADMIN_EMAILS is an admin (decided at read time, so removing it demotes the
 * account). Admins skip the invite gate.
 */
import { createHash, randomBytes } from "node:crypto";
import type { Env } from "./env.js";
import { HttpError } from "./http.js";
import { getJson, setJson, type Kv } from "./kv.js";

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  role: "user" | "admin";
  /** Version of the Terms/Privacy the user agreed to, and when. */
  consent?: { version: string; at: string };
}

export const SESSION_TTL_S = 60 * 60 * 24 * 30;
/** Bump when the Terms or Privacy page changes materially: everyone is asked to agree again. */
export const TERMS_VERSION = "2026-10-19";

const hash = (token: string) => createHash("sha256").update(token).digest("hex");
export const normalizeEmail = (e: unknown) => (typeof e === "string" ? e.trim().toLowerCase() : "");
export const validEmail = (e: string) => e.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

function withRole(env: Env, u: User): User {
  return { ...u, role: env.adminEmails.includes(u.email) ? "admin" : "user" };
}

export async function getUser(env: Env, kv: Kv, id: string): Promise<User | null> {
  const u = await getJson<User>(kv, `user:${id}`);
  return u ? withRole(env, u) : null;
}

export async function listUsers(env: Env, kv: Kv): Promise<User[]> {
  const out: User[] = [];
  for (const k of await kv.keys("user:")) {
    const u = await getJson<User>(kv, k);
    if (u) out.push(withRole(env, u));
  }
  return out.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

// --- sessions -------------------------------------------------------------------

export async function createSession(kv: Kv, userId: string): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  await setJson(kv, `sess:${hash(token)}`, { uid: userId, at: Date.now() }, { ttlSec: SESSION_TTL_S });
  return token;
}

export async function userForSession(env: Env, kv: Kv, token: string | null): Promise<User | null> {
  if (!token || token.length < 32 || token.length > 128) return null;
  const s = await getJson<{ uid: string }>(kv, `sess:${hash(token)}`);
  return s ? getUser(env, kv, s.uid) : null;
}

export async function destroySession(kv: Kv, token: string | null): Promise<void> {
  if (token) await kv.del(`sess:${hash(token)}`);
}

// --- invites --------------------------------------------------------------------

interface InviteDoc {
  maxUses: number;
  uses: number;
  note: string;
  createdAt: string;
}

/** A readable code like "k7mq-x2fd". */
function newCode(): string {
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  const b = randomBytes(8);
  const ch = (i: number) => alphabet[b[i] % alphabet.length];
  return `${ch(0)}${ch(1)}${ch(2)}${ch(3)}-${ch(4)}${ch(5)}${ch(6)}${ch(7)}`;
}

export async function createInvite(kv: Kv, opts: { maxUses?: number; note?: string } = {}): Promise<string> {
  const code = newCode();
  const doc: InviteDoc = { maxUses: Math.min(1000, Math.max(1, Math.round(opts.maxUses ?? 1))), uses: 0, note: (opts.note ?? "").slice(0, 80), createdAt: new Date().toISOString() };
  await setJson(kv, `invite:${code}`, doc);
  return code;
}

export async function listInvites(kv: Kv): Promise<(InviteDoc & { code: string })[]> {
  const out = [];
  for (const k of await kv.keys("invite:")) {
    const d = await getJson<InviteDoc>(kv, k);
    if (d) out.push({ code: k.slice("invite:".length), ...d });
  }
  return out;
}

export async function revokeInvite(kv: Kv, code: string): Promise<void> {
  await kv.del(`invite:${code.trim().toLowerCase()}`);
}

/**
 * Spends one use of a code. Static codes (INVITE_CODES) are reusable; codes an admin created
 * count their uses atomically so a single-use code can't be redeemed twice by two requests.
 */
async function redeemInvite(env: Env, kv: Kv, raw: unknown): Promise<boolean> {
  const code = typeof raw === "string" ? raw.trim() : "";
  if (!code || code.length > 64) return false;
  if (env.inviteCodes.some((c) => c.toLowerCase() === code.toLowerCase())) return true;
  const key = code.toLowerCase();
  const doc = await getJson<InviteDoc>(kv, `invite:${key}`);
  if (!doc) return false;
  const used = await kv.incr(`invite-uses:${key}`, 1);
  if (used > doc.maxUses) {
    await kv.incr(`invite-uses:${key}`, -1);
    return false;
  }
  await setJson(kv, `invite:${key}`, { ...doc, uses: used });
  return true;
}

// --- sign in / sign up ----------------------------------------------------------

/**
 * Finds the account for a verified email, or creates it. New accounts need an invite code
 * (when the gate is on), unless the email is an admin's.
 */
export async function signInOrSignUp(env: Env, kv: Kv, input: { email: string; name?: string; invite?: unknown }): Promise<{ user: User; created: boolean }> {
  const email = normalizeEmail(input.email);
  if (!validEmail(email)) throw new HttpError(400, "That doesn't look like an email address.", "bad_email");
  const existingId = await kv.get(`email:${email}`);
  const existing = existingId ? await getUser(env, kv, existingId) : null;
  if (existing) return { user: existing, created: false };

  const admin = env.adminEmails.includes(email);
  if (env.inviteRequired && !admin && !(await redeemInvite(env, kv, input.invite))) {
    throw new HttpError(403, "You need a valid invite code to create an account during the beta.", "invite_required");
  }
  const id = randomBytes(12).toString("hex");
  const user: User = { id, email, name: (input.name ?? "").trim().slice(0, 80) || email.split("@")[0], createdAt: new Date().toISOString(), role: "user" };
  // claim the email first so two concurrent sign-ups can't make two accounts
  if (!(await kv.setNx(`email:${email}`, id))) {
    const winner = await kv.get(`email:${email}`);
    const u = winner ? await getUser(env, kv, winner) : null;
    if (u) return { user: u, created: false };
    throw new HttpError(409, "Try signing in again.", "conflict");
  }
  await setJson(kv, `user:${id}`, user);
  return { user: withRole(env, user), created: true };
}

export async function recordConsent(env: Env, kv: Kv, user: User): Promise<User> {
  const next: User = { ...user, consent: { version: TERMS_VERSION, at: new Date().toISOString() } };
  await setJson(kv, `user:${user.id}`, next);
  return withRole(env, next);
}

export function hasConsented(user: User): boolean {
  return user.consent?.version === TERMS_VERSION;
}

/** Removes the account record and every session of it. (Files are removed by the library code.) */
export async function deleteUser(kv: Kv, user: User): Promise<void> {
  await kv.del(`user:${user.id}`);
  await kv.del(`email:${user.email}`);
  for (const k of await kv.keys("sess:")) {
    const s = await getJson<{ uid: string }>(kv, k);
    if (s?.uid === user.id) await kv.del(k);
  }
}
