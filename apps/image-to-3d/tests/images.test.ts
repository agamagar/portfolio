/** Upload hardening: size, count, pixel limits and metadata stripping (real sharp, real bytes). */
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { IMAGE_LIMITS, sanitizeImage } from "../server/images";
import { imageInput, viewImages } from "../server/validate";

const solid = (w: number, h: number) => sharp({ create: { width: w, height: h, channels: 3, background: "#c33" } });

/** A JPEG that carries EXIF (a GPS tag, a copyright, an orientation) so we can see it disappear. */
async function jpegWithExif(w = 64, h = 32) {
  return solid(w, h)
    .withExif({ IFD0: { Copyright: "secret-owner" }, IFD3: { GPSLatitudeRef: "N", GPSLatitude: "51/1 30/1 0/1" } })
    .withMetadata({ orientation: 6 })
    .jpeg()
    .toBuffer();
}

describe("sanitizeImage", () => {
  it("strips EXIF, applies the orientation to the pixels and re-encodes", async () => {
    const src = await jpegWithExif();
    expect((await sharp(src).metadata()).exif).toBeTruthy();
    expect(src.toString("latin1")).toContain("secret-owner");
    const out = await sanitizeImage(src, "front image");
    const meta = await sharp(out.bytes).metadata();
    expect(meta.exif).toBeUndefined();
    expect(meta.orientation).toBeUndefined();
    expect(out.bytes.toString("latin1")).not.toContain("secret-owner");
    expect(out.mediaType).toBe("image/jpeg");
    // orientation 6 = rotate 90°, so 64×32 becomes 32×64
    expect([out.width, out.height]).toEqual([32, 64]);
  });

  it("keeps png and webp, turns gif into png", async () => {
    expect((await sanitizeImage(await solid(8, 8).png().toBuffer(), "x")).mediaType).toBe("image/png");
    expect((await sanitizeImage(await solid(8, 8).webp().toBuffer(), "x")).mediaType).toBe("image/webp");
    expect((await sanitizeImage(await solid(8, 8).gif().toBuffer(), "x")).mediaType).toBe("image/png");
  });

  it("refuses more than 4096 px on a side, without decoding it", async () => {
    const big = await solid(4097, 16).png().toBuffer();
    await expect(sanitizeImage(big, "front image")).rejects.toMatchObject({ status: 413, code: "too_large" });
    await expect(sanitizeImage(await solid(4096, 16).png().toBuffer(), "x")).resolves.toBeTruthy();
  });

  it("refuses a decompression bomb", async () => {
    // 20000×20000 of one colour compresses to a few KB but would need 1.2 GB decoded
    const bomb = await sharp({ create: { width: 20000, height: 20000, channels: 3, background: "#fff" }, limitInputPixels: false }).png({ compressionLevel: 9 }).toBuffer();
    expect(bomb.byteLength).toBeLessThan(IMAGE_LIMITS.maxBytes);
    await expect(sanitizeImage(bomb, "front image")).rejects.toMatchObject({ status: 413 });
  });

  it("refuses more than 5 MB", async () => {
    await expect(sanitizeImage(new Uint8Array(IMAGE_LIMITS.maxBytes + 1), "front image")).rejects.toMatchObject({ status: 413 });
  });

  it("refuses files that only look like images", async () => {
    const png = await solid(8, 8).png().toBuffer();
    await expect(sanitizeImage(Buffer.concat([png.subarray(0, 30), Buffer.from("garbage")]), "front image")).rejects.toMatchObject({ status: 400, code: "bad_image" });
    await expect(sanitizeImage(Buffer.from("<svg xmlns='http://www.w3.org/2000/svg'/>"), "x")).rejects.toMatchObject({ code: "bad_image" });
  });
});

describe("request images", () => {
  const b64 = async () => ({ data: (await jpegWithExif()).toString("base64"), mediaType: "image/jpeg" });

  it("returns the re-encoded copy, not the upload", async () => {
    const sent = await b64();
    const got = await imageInput(sent, "front image");
    expect(got.data).not.toBe(sent.data);
    expect(Buffer.from(got.data, "base64").toString("latin1")).not.toContain("secret-owner");
  });

  it("accepts up to three views and nothing else", async () => {
    const i = await b64();
    expect(await viewImages({ images: { front: i, left: i, right: i } })).toHaveLength(3);
    await expect(viewImages({ images: { front: i, left: i, right: i, back: i } })).rejects.toMatchObject({ code: "too_many_images" });
    await expect(viewImages({ images: { front: i, extra: i } })).rejects.toMatchObject({ code: "too_many_images" });
    await expect(viewImages({ images: [i, i, i, i] as never })).rejects.toBeTruthy();
  });

  it("rejects an image whose declared type lies about its bytes", async () => {
    const png = (await solid(8, 8).png().toBuffer()).toString("base64");
    await expect(imageInput({ data: png, mediaType: "image/jpeg" }, "front image")).rejects.toMatchObject({ code: "bad_image" });
  });
});
