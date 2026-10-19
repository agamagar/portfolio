/**
 * GET /api/cron: the retention sweep. Vercel Cron calls it with `Authorization: Bearer $CRON_SECRET`.
 * Production refuses to run without CRON_SECRET; local dev runs it unauthenticated.
 */
import { createHash, timingSafeEqual } from "node:crypto";
import type { Deps } from "../deps.js";
import { HttpError, json } from "../http.js";
import { sweep } from "../retention.js";

const same = (a: string, b: string) => timingSafeEqual(createHash("sha256").update(a).digest(), createHash("sha256").update(b).digest());

export async function cron(req: Request, d: Deps): Promise<Response> {
  const secret = d.env.cronSecret;
  if (secret) {
    const got = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
    if (!got || !same(got, secret)) throw new HttpError(401, "Unauthorized", "unauthenticated");
  } else if (d.env.isProduction) {
    throw new HttpError(503, "CRON_SECRET is not set, so the retention job is disabled.", "not_configured");
  }
  return json(await sweep(d));
}
