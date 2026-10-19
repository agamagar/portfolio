/**
 * Admin API (ADMIN_EMAILS only).
 *   GET  /api/admin           → spend by day, per-user usage today, users, reports, invites
 *   POST /api/admin           {action:"create-invite", maxUses?, note?} | {action:"revoke-invite", code}
 *                             | {action:"takedown", token}
 */
import { requireAdmin } from "../auth.js";
import { spentToday } from "../budget.js";
import { requireKv, requireStore, type Deps } from "../deps.js";
import { HttpError, json, readJson } from "../http.js";
import { getJson, type Kv } from "../kv.js";
import { log } from "../log.js";
import { ROOT, type Store } from "../store/types.js";
import { createInvite, listInvites, listUsers, revokeInvite } from "../users.js";
import { takeDown } from "./shared.js";
import type { ShareDoc } from "./library.js";

const DAYS = 14;
const dayOf = (ms: number) => new Date(ms).toISOString().slice(0, 10);

export async function spendByDay(store: Store, now = Date.now()): Promise<{ day: string; usd: number; calls: number }[]> {
  const out: { day: string; usd: number; calls: number }[] = [];
  for (let i = 0; i < DAYS; i++) {
    const day = dayOf(now - i * 86_400_000);
    const files = await store.list(`${ROOT}/usage/${day}/`);
    let micros = 0;
    for (const f of files) micros += Number(/-(\d+)\.u$/.exec(f.pathname)?.[1] ?? 0);
    out.push({ day, usd: micros / 1e6, calls: files.length });
  }
  return out;
}

export async function usageSummary(d: Deps, now = Date.now()) {
  const kv = requireKv(d);
  const store = requireStore(d);
  const day = dayOf(now);
  const month = day.slice(0, 7);
  const users = await listUsers(d.env, kv);
  const rows = [];
  for (const u of users) {
    rows.push({
      id: u.id,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
      modelsThisMonth: Number((await kv.get(`q:m:${u.id}:${month}`)) ?? 0),
      usdToday: Number((await kv.get(`q:usd:${u.id}:${day}`)) ?? 0),
      blocksToday: Number((await kv.get(`mod:strikes:${u.id}:${day}`)) ?? 0),
    });
  }
  const today = await spentToday(store, now);
  return { today: { usd: today, limitUsd: d.env.dailyBudgetUsd, pct: d.env.dailyBudgetUsd ? (today / d.env.dailyBudgetUsd) * 100 : 0 }, days: await spendByDay(store, now), users: rows };
}

async function reports(kv: Kv) {
  const out = [];
  for (const k of (await kv.keys("report:")).slice(-50).reverse()) {
    const r = await getJson<Record<string, unknown>>(kv, k);
    if (r) out.push({ id: k.slice("report:".length), ...r });
  }
  return out;
}

export async function getAdmin(req: Request, d: Deps): Promise<Response> {
  await requireAdmin(d, req);
  const kv = requireKv(d);
  return json({ ...(await usageSummary(d)), reports: await reports(kv), invites: await listInvites(kv), alerts: { webhook: !!d.env.alertWebhookUrl, thresholds: d.env.alertThresholds } });
}

export async function postAdmin(req: Request, d: Deps): Promise<Response> {
  const admin = await requireAdmin(d, req);
  const kv = requireKv(d);
  const body = await readJson<{ action?: unknown; maxUses?: unknown; note?: unknown; code?: unknown; token?: unknown }>(req, 4096);
  if (body.action === "create-invite") {
    const code = await createInvite(kv, { maxUses: Number(body.maxUses) || 1, note: typeof body.note === "string" ? body.note : "" });
    log("invite_created", { by: admin.id });
    return json({ code }, 201);
  }
  if (body.action === "revoke-invite" && typeof body.code === "string") {
    await revokeInvite(kv, body.code);
    return json({ ok: true });
  }
  if (body.action === "takedown" && typeof body.token === "string") {
    const share = await getJson<ShareDoc>(kv, `share:${body.token}`);
    if (!share) throw new HttpError(404, "That model isn't shared.", "not_found");
    await takeDown(d, body.token, share);
    return json({ ok: true });
  }
  throw new HttpError(400, "Unknown action", "bad_request");
}
