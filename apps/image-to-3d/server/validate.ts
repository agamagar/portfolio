import { EFFORTS, isModelId, DEFAULT_MODEL, type Effort, type ModelId } from "../shared/models.js";
import { STYLES, type Style } from "../shared/spec.js";
import type { ImageInput, ViewImage } from "./claude.js";
import { HttpError } from "./http.js";
import { IMAGE_LIMITS, sanitizeImage } from "./images.js";

const MEDIA_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
/** base64 length of the largest accepted upload (5 MB), checked before decoding anything. */
const MAX_IMAGE_B64 = Math.ceil((IMAGE_LIMITS.maxBytes * 4) / 3) + 4;

/** Validates a base64 image from the client and returns the sanitised (re-encoded, metadata-free) copy. */
export async function imageInput(v: unknown, field: string): Promise<ImageInput> {
  const o = v as { data?: unknown; mediaType?: unknown } | null;
  if (!o || typeof o.data !== "string" || typeof o.mediaType !== "string") throw new HttpError(400, `${field} is missing`, "bad_request");
  if (!(MEDIA_TYPES as readonly string[]).includes(o.mediaType)) throw new HttpError(400, `${field} must be JPEG, PNG, WebP or GIF`, "bad_image");
  if (o.data.length > MAX_IMAGE_B64) throw new HttpError(413, `${field} is larger than 5 MB`, "too_large");
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(o.data)) throw new HttpError(400, `${field} is not valid base64`, "bad_image");
  if (!magicMatches(o.data, o.mediaType)) throw new HttpError(400, `${field} content doesn't match ${o.mediaType}`, "bad_image");
  const clean = await sanitizeImage(Buffer.from(o.data, "base64"), field);
  return { data: clean.bytes.toString("base64"), mediaType: clean.mediaType };
}

/**
 * The reference views of the subject. `images: {front, left?, right?}`; the old
 * single `image` field is still accepted as the front view. At most three images,
 * and no keys other than front, left and right.
 */
export async function viewImages(body: Record<string, unknown>): Promise<ViewImage[]> {
  const o = (body.images ?? {}) as Record<string, unknown>;
  if (typeof o !== "object" || Array.isArray(o)) throw new HttpError(400, "images must be an object with front, left and right", "bad_request");
  const extra = Object.keys(o).filter((k) => !["front", "left", "right"].includes(k));
  if (extra.length || Object.keys(o).length > IMAGE_LIMITS.maxImages) {
    throw new HttpError(400, `Send at most ${IMAGE_LIMITS.maxImages} images: front, left and right`, "too_many_images");
  }
  const front = o.front ?? body.image;
  const out: ViewImage[] = [{ view: "front", image: await imageInput(front, "front image") }];
  if (o.left != null) out.push({ view: "left", image: await imageInput(o.left, "left image") });
  if (o.right != null) out.push({ view: "right", image: await imageInput(o.right, "right image") });
  return out;
}

function magicMatches(b64: string, type: string): boolean {
  const head = Buffer.from(b64.slice(0, 24), "base64");
  switch (type) {
    case "image/jpeg":
      return head[0] === 0xff && head[1] === 0xd8;
    case "image/png":
      return head[0] === 0x89 && head.toString("latin1", 1, 4) === "PNG";
    case "image/webp":
      return head.toString("latin1", 0, 4) === "RIFF" && head.toString("latin1", 8, 12) === "WEBP";
    case "image/gif":
      return head.toString("latin1", 0, 3) === "GIF";
    default:
      return false;
  }
}

export function style(v: unknown): Style {
  return (STYLES as readonly string[]).includes(v as string) ? (v as Style) : "clay";
}

export function model(v: unknown): ModelId {
  return isModelId(v) ? v : DEFAULT_MODEL;
}

export function effort(v: unknown): Effort {
  return (EFFORTS as readonly string[]).includes(v as string) ? (v as Effort) : "medium";
}

export function notes(v: unknown): string {
  return typeof v === "string" ? v.replace(/"""/g, "'''").trim().slice(0, 500) : "";
}
