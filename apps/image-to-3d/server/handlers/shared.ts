/**
 * Public, read-only view of a model its owner chose to share.
 *   GET  /api/shared?t=<token>  → { item, spec }   no sign-in; no source photos, no owner, no cost
 *   POST /api/shared            {t, reason, details?}  report it
 * Sharing is off by default and is switched on and off by the owner (PATCH /api/library {shared}).
 * Enough independent reports take a model down on their own; admins can do it by hand.
 */
import { createHash, randomBytes } from "node:crypto";
import { requireKv, requireStore, type Deps } from "../deps.js";
import { clientIp, HttpError, json, readJson } from "../http.js";
import { getJson, setJson } from "../kv.js";
import { MODEL_TTL_MS, presentItem, readIndex } from "../library.js";
import { notify } from "../alerts.js";
import { log } from "../log.js";
import type { ShareDoc } from "./library.js";

export const REPORT_REASONS = ["sexual", "minors", "violence", "hate", "illegal", "copyright", "other"] as const;
/** Distinct reporters needed to take a shared model down automatically. */
export const AUTO_TAKEDOWN_REPORTS = 3;

function token(v: unknown): string {
  if (typeof v !== "string" || !/^[A-Za-z0-9_-]{20,32}$/.test(v)) throw new HttpError(404, "This link isn't valid.", "not_found");
  return v;
}

export async function getShared(req: Request, d: Deps): Promise<Response> {
  const kv = requireKv(d);
  const store = requireStore(d);
  await d.publicLimiter.check(`pub:${clientIp(req)}`);
  const t = token(new URL(req.url).searchParams.get("t"));
  const share = await getJson<ShareDoc>(kv, `share:${t}`);
  const gone = () => new HttpError(404, "This model isn't shared any more.", "not_found");
  if (!share) throw gone();
  const { doc } = await readIndex(store, share.uid);
  const item = doc.items.find((i) => i.id === share.id && i.shareToken === t);
  if (!item || Date.now() - Date.parse(item.createdAt) > MODEL_TTL_MS) throw gone();
  const p = presentItem(d.env, item, { includeSources: false });
  const specPath = item.files.spec;
  const specFile = specPath ? (await store.list(specPath)).find((f) => f.pathname === specPath) : undefined;
  const spec = specFile ? JSON.parse(new TextDecoder().decode(await store.read(specFile))) : null;
  return json({
    item: { id: p.id, title: p.title, tags: p.tags, style: p.style, triangles: p.triangles, createdAt: p.createdAt, expiresAt: p.expiresAt, files: { glb: p.files.glb, thumb: p.files.thumb } },
    spec,
  });
}

export async function reportShared(req: Request, d: Deps): Promise<Response> {
  const kv = requireKv(d);
  const ip = clientIp(req);
  await d.reportLimiter.check(`report:${ip}`);
  const body = await readJson<{ t?: unknown; reason?: unknown; details?: unknown }>(req, 4096);
  const t = token(body.t);
  const reason = (REPORT_REASONS as readonly string[]).includes(body.reason as string) ? (body.reason as string) : "other";
  const details = typeof body.details === "string" ? body.details.trim().slice(0, 500) : "";
  const share = await getJson<ShareDoc>(kv, `share:${t}`);
  if (!share) throw new HttpError(404, "This model isn't shared any more.", "not_found");

  // one count per reporter (hashed IP: we don't keep raw addresses), so one person can't take a model down alone
  const reporter = createHash("sha256").update(`${ip}|${t}`).digest("hex").slice(0, 16);
  const id = `${new Date().toISOString().replace(/[^0-9]/g, "")}-${reporter}-${randomBytes(3).toString("hex")}`;
  const fresh = await kv.setNx(`reported:${t}:${reporter}`, "1", { ttlSec: 30 * 86400 });
  await setJson(kv, `report:${id}`, { token: t, uid: share.uid, itemId: share.id, reason, details, at: new Date().toISOString(), reporter }, { ttlSec: 90 * 86400 });
  log("report", { reason, itemId: share.id, userId: share.uid, reporter }, "warn");
  let takenDown = false;
  if (fresh && (await kv.incr(`report-count:${t}`, 1, { ttlSec: 90 * 86400 })) >= AUTO_TAKEDOWN_REPORTS) {
    await takeDown(d, t, share);
    takenDown = true;
    await notify(d.env, `A shared model was taken down after ${AUTO_TAKEDOWN_REPORTS} reports (reason: ${reason}).`);
  }
  return json({ ok: true, takenDown }, 201);
}

/** Unshares a model and blocks it from being shared again. */
export async function takeDown(d: Deps, t: string, share: ShareDoc): Promise<void> {
  const kv = requireKv(d);
  await kv.del(`share:${t}`);
  await setJson(kv, `takedown:${share.uid}:${share.id}`, { at: new Date().toISOString(), token: t });
  log("takedown", { itemId: share.id, userId: share.uid }, "warn");
}
