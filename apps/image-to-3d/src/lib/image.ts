import type { ImagePayload } from "./api";

export interface PreparedImage {
  payload: ImagePayload;
  blob: Blob;
  url: string;
  width: number;
  height: number;
}

const ACCEPT = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif", "image/heic"];
export const MAX_INPUT_BYTES = 25_000_000;

/**
 * Decode any browser-readable image, flatten onto white (transparent PNGs),
 * and downscale so the long edge is ≤ 1024px. Claude downsizes large images
 * anyway; sending less keeps the request small and the token count honest.
 */
export async function prepareImage(file: File, maxEdge = 1024): Promise<PreparedImage> {
  if (file.type && !ACCEPT.includes(file.type)) throw new Error("That file isn't an image this browser can read. Try a JPEG, PNG or WebP.");
  if (file.size > MAX_INPUT_BYTES) throw new Error("That image is larger than 25 MB.");
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("Couldn't decode that image. Try a JPEG, PNG or WebP.");
  }
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode failed"))), "image/jpeg", 0.88));
  return { payload: { data: await blobToBase64(blob), mediaType: "image/jpeg" }, blob, url: URL.createObjectURL(blob), width, height };
}

export async function blobToBase64(blob: Blob): Promise<string> {
  const buf = new Uint8Array(await blob.arrayBuffer());
  let bin = "";
  for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode(...buf.subarray(i, i + 0x8000));
  return btoa(bin);
}

export function dataUrlToPayload(url: string): ImagePayload {
  const m = /^data:(image\/(?:jpeg|png|webp));base64,(.*)$/.exec(url);
  if (!m) throw new Error("bad data URL");
  return { mediaType: m[1] as ImagePayload["mediaType"], data: m[2] };
}

/** Decoded locally: fetch(data:) would need connect-src data: in the CSP. */
export function dataUrlToBlob(url: string): Blob {
  const { mediaType, data } = dataUrlToPayload(url);
  const bin = atob(data);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mediaType });
}
