/**
 * Spend alerts. After every recorded charge the day's total is compared with the thresholds
 * (ALERT_THRESHOLDS, percent of DAILY_BUDGET_USD, default 50, 80, 100). Each threshold fires
 * once per UTC day, to ALERT_WEBHOOK_URL as a Slack-compatible {"text": "..."} POST (Slack,
 * Discord's /slack endpoint, Teams and most automation tools accept it). With no webhook set the alert
 * is only logged. The webhook URL is a secret: it is never logged.
 */
import type { Deps } from "./deps.js";
import { recordSpend, spentToday } from "./budget.js";
import { recordUserSpend } from "./quota.js";
import { log } from "./log.js";
import type { Env } from "./env.js";
import type { User } from "./users.js";

export async function notify(env: Env, text: string, level: "info" | "warn" | "error" = "warn", fetchImpl: typeof fetch = fetch): Promise<void> {
  log("alert", { text }, level);
  if (!env.alertWebhookUrl) return;
  try {
    const res = await fetchImpl(env.alertWebhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: `[image-to-3d] ${text}` }),
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) log("alert_webhook_failed", { status: res.status }, "error");
  } catch (err) {
    log("alert_webhook_failed", { error: (err as Error).name }, "error");
  }
}

/** Fires each crossed threshold once per day. Returns the percentages that fired. */
export async function checkBudgetAlerts(d: Deps, now = Date.now(), fetchImpl: typeof fetch = fetch): Promise<number[]> {
  if (!d.store || !d.kv || d.env.dailyBudgetUsd <= 0) return [];
  const spent = await spentToday(d.store, now);
  const pct = (spent / d.env.dailyBudgetUsd) * 100;
  const day = new Date(now).toISOString().slice(0, 10);
  const fired: number[] = [];
  for (const t of d.env.alertThresholds) {
    if (pct < t) continue;
    if (!(await d.kv.setNx(`alert:${day}:${t}`, "1", { ttlSec: 2 * 86400 }))) continue;
    fired.push(t);
    await notify(d.env, `Spend is at ${Math.round(pct)}% of today's cap ($${spent.toFixed(2)} of $${d.env.dailyBudgetUsd.toFixed(2)}, ${t}% threshold). ${t >= 100 ? "Generation is now paused until 00:00 UTC." : ""}`.trim(), t >= 100 ? "error" : "warn", fetchImpl);
  }
  return fired;
}

/** Records a charge in the global ledger and against the user, then checks the alert thresholds. */
export async function recordCharge(d: Deps, user: User, usd: number): Promise<void> {
  try {
    await Promise.all([recordSpend(d.store!, usd), recordUserSpend(d.kv!, user, usd)]);
    await checkBudgetAlerts(d);
  } catch (err) {
    log("spend_not_recorded", { userId: user.id, error: (err as Error).message }, "error");
  }
}
