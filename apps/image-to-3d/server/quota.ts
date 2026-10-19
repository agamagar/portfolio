/**
 * Per-user limits, all in the Kv so they hold across serverless instances.
 *
 *   monthly models   q:m:<uid>:<YYYY-MM>   one "model" = one create run; its compare-and-fix
 *                                          passes, the judge and any number of reference views ride along
 *   daily user $     q:usd:<uid>:<day>     what this user's calls cost today (micro-dollars as a float)
 *   in-flight        lock:user:<uid>       at most one generation request per user at a time
 *   concurrency      sem:<n>               a global semaphore of slots; none free → "busy, retry"
 *   jobs             job:<id>              issued by a create, spent by its refines and judge
 *
 * The global daily dollar cap stays in budget.ts (the spend ledger).
 */
import { randomBytes } from "node:crypto";
import type { Env } from "./env.js";
import { HttpError } from "./http.js";
import { getJson, setJson, type Kv } from "./kv.js";
import type { User } from "./users.js";

const day = (now: number) => new Date(now).toISOString().slice(0, 10);
const month = (now: number) => new Date(now).toISOString().slice(0, 7);
/** A generation request can run up to its function's maxDuration (300 s); locks outlive that, then expire on their own. */
const LOCK_TTL_S = 330;

export interface QuotaView {
  monthly: { used: number; limit: number | null; resetsAt: string };
  daily: { spentUsd: number; limitUsd: number };
}

const monthlyLimit = (env: Env, user: User) => (user.role === "admin" ? null : env.monthlyModels);

export async function quotaView(env: Env, kv: Kv, user: User, now = Date.now()): Promise<QuotaView> {
  const used = Number((await kv.get(`q:m:${user.id}:${month(now)}`)) ?? 0);
  const spent = Number((await kv.get(`q:usd:${user.id}:${day(now)}`)) ?? 0);
  const d = new Date(now);
  return {
    monthly: { used, limit: monthlyLimit(env, user), resetsAt: new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1)).toISOString() },
    daily: { spentUsd: spent, limitUsd: env.dailyUserUsd },
  };
}

/** Counts one model against the month, or throws. Returns a refund for when the run fails without a result. */
export async function reserveModel(env: Env, kv: Kv, user: User, now = Date.now()): Promise<() => Promise<void>> {
  const key = `q:m:${user.id}:${month(now)}`;
  const limit = monthlyLimit(env, user);
  const used = await kv.incr(key, 1, { ttlSec: 40 * 86400 });
  if (limit !== null && used > limit) {
    await kv.incr(key, -1);
    throw new HttpError(429, `You've used your ${limit} free models for this month. They reset on the 1st (UTC).`, "quota_exceeded");
  }
  let refunded = false;
  return async () => {
    if (refunded) return;
    refunded = true;
    await kv.incr(key, -1).catch(() => {});
  };
}

/** Rejects when this user's spend today, plus a worst-case next call, would pass the per-user cap. */
export async function assertUserBudget(env: Env, kv: Kv, user: User, nextCallUsd: number, now = Date.now()): Promise<void> {
  const spent = Number((await kv.get(`q:usd:${user.id}:${day(now)}`)) ?? 0);
  if (spent + nextCallUsd > env.dailyUserUsd) {
    throw new HttpError(429, `You've reached today's usage limit ($${env.dailyUserUsd.toFixed(2)} of compute). It resets at 00:00 UTC.`, "user_budget_exceeded");
  }
}

export async function recordUserSpend(kv: Kv, user: User, usd: number, now = Date.now()): Promise<void> {
  if (usd > 0) await kv.incr(`q:usd:${user.id}:${day(now)}`, usd, { ttlSec: 2 * 86400 });
}

/** One generation at a time per user. */
export async function lockUser(kv: Kv, user: User): Promise<() => Promise<void>> {
  const key = `lock:user:${user.id}`;
  if (!(await kv.setNx(key, "1", { ttlSec: LOCK_TTL_S }))) {
    throw new HttpError(409, "You already have a generation running. Wait for it to finish.", "in_flight");
  }
  return () => kv.del(key).catch(() => {});
}

/** Takes a free slot of the global semaphore, or throws a 503 "busy, retry". */
export async function acquireSlot(env: Env, kv: Kv): Promise<() => Promise<void>> {
  const start = Math.floor(Math.random() * env.maxConcurrent);
  for (let i = 0; i < env.maxConcurrent; i++) {
    const key = `sem:${(start + i) % env.maxConcurrent}`;
    if (await kv.setNx(key, "1", { ttlSec: LOCK_TTL_S })) return () => kv.del(key).catch(() => {});
  }
  throw new HttpError(503, "The service is busy right now. Try again in a few seconds.", "busy", { "retry-after": "10" });
}

// --- jobs -----------------------------------------------------------------------
// Refines and the judge are only valid for a job that a create opened, so they can't be
// called on their own to run Claude for free.

interface Job {
  uid: string;
  refines: number;
  judges: number;
}

export async function openJob(kv: Kv, user: User): Promise<string> {
  const id = randomBytes(12).toString("base64url");
  await setJson(kv, `job:${id}`, { uid: user.id, refines: 0, judges: 0 } satisfies Job, { ttlSec: 3 * 3600 });
  return id;
}

export async function spendJob(kv: Kv, user: User, id: unknown, kind: "refines" | "judges", max: number): Promise<void> {
  const key = typeof id === "string" && /^[A-Za-z0-9_-]{16}$/.test(id) ? `job:${id}` : null;
  const job = key ? await getJson<Job>(kv, key) : null;
  if (!key || !job || job.uid !== user.id) throw new HttpError(400, "That generation has expired. Start a new one.", "bad_job");
  if (job[kind] >= max) throw new HttpError(400, "That generation has no passes left.", "bad_job");
  // not atomic across racing calls, but the per-user in-flight lock serialises a user's requests
  await setJson(kv, key, { ...job, [kind]: job[kind] + 1 }, { ttlSec: 3 * 3600 });
}
