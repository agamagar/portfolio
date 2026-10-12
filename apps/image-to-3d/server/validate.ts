import { EFFORTS, isModelId, DEFAULT_MODEL, type Effort, type ModelId } from "../shared/models.js";
import { STYLES, type Style } from "../shared/spec.js";
import type { ImageInput } from "./claude.js";
import { HttpError } from "./http.js";

const MEDIA_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
/** base64 of a ~3.75 MB image. Claude's own per-image limit is 5 MB; the client downsizes to ~1 MB anyway. */
const MAX_IMAGE_B64 = 5_000_000;

export function imageInput(v: unknown, field: string): ImageInput {
  const o = v as { data?: unknown; mediaType?: unknown } | null;
  if (!o || typeof o.data !== "string" || typeof o.mediaType !== "string") throw new HttpError(400, `${field} is missing`, "bad_request");
  if (!(MEDIA_TYPES as readonly string[]).includes(o.mediaType)) throw new HttpError(400, `${field} must be JPEG, PNG, WebP or GIF`, "bad_image");
  if (o.data.length > MAX_IMAGE_B64) throw new HttpError(413, `${field} is too large (max ~3.7 MB)`, "too_large");
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(o.data)) throw new HttpError(400, `${field} is not valid base64`, "bad_image");
  if (!magicMatches(o.data, o.mediaType)) throw new HttpError(400, `${field} content doesn't match ${o.mediaType}`, "bad_image");
  return { data: o.data, mediaType: o.mediaType as ImageInput["mediaType"] };
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
