import { randomBytes } from "node:crypto";
import { HttpError } from "./http.js";
import { ROOT, type Store } from "./store/types.js";

/**
 * Daily spend ledger. Each Claude call appends one tiny marker file whose
 * pathname carries its cost in micro-dollars: i3d/usage/<UTC day>/<ms>-<rand>-<micros>.u
 * Summing is a single list call, needs no read-modify-write and so can't race,
 * and works the same on Blob and disk. This is the hard cap on spend.
 */
const day = (now: number) => new Date(now).toISOString().slice(0, 10);

export async function spentToday(store: Store, now = Date.now()): Promise<number> {
  const files = await store.list(`${ROOT}/usage/${day(now)}/`);
  let micros = 0;
  for (const f of files) {
    const m = /-(\d+)\.u$/.exec(f.pathname);
    if (m) micros += Number(m[1]);
  }
  return micros / 1e6;
}

export async function recordSpend(store: Store, usd: number, now = Date.now()): Promise<void> {
  if (!(usd > 0)) return;
  const micros = Math.max(1, Math.round(usd * 1e6));
  await store.put(`${ROOT}/usage/${day(now)}/${now}-${randomBytes(3).toString("hex")}-${micros}.u`, "1", "text/plain");
}

export async function assertBudget(store: Store, limitUsd: number, nextCallUsd: number, now = Date.now()): Promise<number> {
  const spent = await spentToday(store, now);
  if (limitUsd <= 0 || spent + nextCallUsd > limitUsd) {
    throw new HttpError(
      402,
      `Today's budget is used up ($${spent.toFixed(2)} of $${limitUsd.toFixed(2)}). It resets at 00:00 UTC, or raise DAILY_BUDGET_USD.`,
      "budget_exceeded",
    );
  }
  return spent;
}
