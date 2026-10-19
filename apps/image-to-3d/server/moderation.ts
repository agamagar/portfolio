/**
 * Strict image moderation, run before the expensive model ever sees an image.
 * One Haiku call per image (in parallel). The front call also reviews the user's note.
 *
 * Privacy: blocked images are never stored or logged. We keep only a SHA-256 of the
 * re-encoded image, so a repeat upload is refused without another model call and abusers
 * can be spotted. Three blocks in a day lock the account out until 00:00 UTC.
 */
import { createHash } from "node:crypto";
import type { ModerationResult } from "../shared/spec.js";
import { moderateImage, type CallHooks, type MessagesApi, type ViewImage } from "./claude.js";
import { HttpError } from "./http.js";
import { getJson, setJson, type Kv } from "./kv.js";
import { log } from "./log.js";
import type { User } from "./users.js";

export const STRIKE_LIMIT = 3;
const day = (now: number) => new Date(now).toISOString().slice(0, 10);

export const imageHash = (data: string) => createHash("sha256").update(data, "base64").digest("hex");

const FRIENDLY: Record<string, string> = {
  sexual: "sexual content",
  minors: "photos of children",
  real_person_face: "photos of real people's faces",
  graphic_violence: "graphic violence",
  weapon: "weapons",
  hate_symbol: "hate symbols",
  other: "content that isn't allowed",
};

function blocked(view: string, category: string, reason: string): HttpError {
  const what = FRIENDLY[category] ?? FRIENDLY.other;
  return new HttpError(422, `The ${view} image can't be used: this tool doesn't accept ${what}. ${reason}`.trim(), "moderation_blocked");
}

export async function assertNotLocked(kv: Kv, user: User, now = Date.now()): Promise<void> {
  const strikes = Number((await kv.get(`mod:strikes:${user.id}:${day(now)}`)) ?? 0);
  if (strikes >= STRIKE_LIMIT) {
    throw new HttpError(403, "Too many images were declined today, so uploads are paused until 00:00 UTC.", "moderation_locked");
  }
}

/** Throws a 422 (code moderation_blocked) on the first blocked image; otherwise returns the hashes of what was approved. */
export async function moderateViews(
  api: MessagesApi,
  kv: Kv,
  user: User,
  views: ViewImage[],
  notes: string,
  hooks: CallHooks,
  now = Date.now(),
): Promise<string[]> {
  const hashes = views.map((v) => imageHash(v.image.data));
  const strike = async (view: string, hash: string, category: string, reason: string, source: "model" | "repeat") => {
    await kv.incr(`mod:strikes:${user.id}:${day(now)}`, 1, { ttlSec: 2 * 86400 });
    log("moderation_block", { userId: user.id, view, imageHash: hash, category, reason, source }, "warn");
    return blocked(view, category, reason);
  };

  // a hash we've already blocked is refused without spending a model call
  for (const [i, h] of hashes.entries()) {
    const known = await getJson<{ category: string; reason: string }>(kv, `mod:blocked:${h}`);
    if (known) throw await strike(views[i].view, h, known.category, known.reason, "repeat");
  }

  const results = await Promise.all(
    views.map(async (v, i): Promise<ModerationResult> => {
      try {
        const out = await moderateImage(api, { image: v.image, note: i === 0 ? notes : "" }, hooks);
        return out.result;
      } catch (err) {
        // the model declining to look at an image is itself a signal: treat it as a block
        if (err instanceof HttpError && err.code === "refusal") return { verdict: "block", category: "other", reason: "It could not be reviewed." };
        throw err;
      }
    }),
  );
  for (const [i, r] of results.entries()) {
    if (r.verdict === "block") {
      await setJson(kv, `mod:blocked:${hashes[i]}`, { category: r.category, reason: r.reason, at: new Date(now).toISOString() }, { ttlSec: 90 * 86400 });
      throw await strike(views[i].view, hashes[i], r.category, r.reason, "model");
    }
  }
  return hashes;
}
