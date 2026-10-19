/**
 * Every image that enters the server is decoded and re-encoded with sharp: EXIF/XMP/ICC
 * metadata (GPS, camera serials, thumbnails) is dropped, orientation is applied to the pixels,
 * and anything that isn't really a JPEG, PNG, WebP or GIF of sane size is refused. What Claude
 * sees, and what is stored, is the re-encoded copy, never the upload.
 */
import sharp from "sharp";
import { HttpError } from "./http.js";

export const IMAGE_LIMITS = {
  /** Bytes of the decoded upload. */
  maxBytes: 5 * 1024 * 1024,
  /** Longest side, in pixels. */
  maxSide: 4096,
  /** Reference views per job: front, left, right. */
  maxImages: 3,
} as const;

export type SafeType = "image/jpeg" | "image/png" | "image/webp";

const FORMAT_TYPE: Record<string, SafeType> = { jpeg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/png" };

export async function sanitizeImage(bytes: Uint8Array, field: string): Promise<{ bytes: Buffer; mediaType: SafeType; width: number; height: number }> {
  if (bytes.byteLength > IMAGE_LIMITS.maxBytes) {
    throw new HttpError(413, `${field} is larger than ${IMAGE_LIMITS.maxBytes / 1024 / 1024} MB`, "too_large");
  }
  try {
    // limitInputPixels stops a small file that decodes to a gigantic bitmap (a decompression bomb)
    const base = sharp(Buffer.from(bytes), { limitInputPixels: IMAGE_LIMITS.maxSide * IMAGE_LIMITS.maxSide, failOn: "error", animated: false });
    const meta = await base.metadata();
    const type = meta.format ? FORMAT_TYPE[meta.format] : undefined;
    if (!type || !meta.width || !meta.height) throw new HttpError(400, `${field} must be a JPEG, PNG, WebP or GIF image`, "bad_image");
    const [w, h] = meta.orientation && meta.orientation >= 5 ? [meta.height, meta.width] : [meta.width, meta.height];
    if (Math.max(w, h) > IMAGE_LIMITS.maxSide) {
      throw new HttpError(413, `${field} is ${w}×${h}px; the maximum is ${IMAGE_LIMITS.maxSide}px on a side`, "too_large");
    }
    const img = base.rotate(); // bakes the EXIF orientation into the pixels; metadata isn't kept unless asked for
    const out = await (type === "image/jpeg" ? img.jpeg({ quality: 92, mozjpeg: false }) : type === "image/webp" ? img.webp({ quality: 92 }) : img.png()).toBuffer({ resolveWithObject: true });
    return { bytes: out.data, mediaType: type, width: out.info.width, height: out.info.height };
  } catch (err) {
    if (err instanceof HttpError) throw err;
    if (/pixel limit|exceeds/i.test(String((err as Error).message))) throw new HttpError(413, `${field} is larger than ${IMAGE_LIMITS.maxSide}×${IMAGE_LIMITS.maxSide}px`, "too_large");
    throw new HttpError(400, `${field} could not be read as an image`, "bad_image");
  }
}
