import { del, list, put } from "@vercel/blob";
import type { Store, StoredFile } from "./types.js";

/**
 * Vercel Blob. Blobs are public-by-URL but every item lives under a random
 * UUID and uploads get a random suffix, so URLs are unguessable. Public URLs
 * are what make the GLB embeddable on other sites.
 */
export class BlobStore implements Store {
  readonly kind = "blob" as const;
  constructor(private token: string) {}

  async put(pathname: string, data: Uint8Array | string, contentType: string, opts: { randomSuffix?: boolean } = {}): Promise<StoredFile> {
    const body = typeof data === "string" ? data : Buffer.from(data.buffer, data.byteOffset, data.byteLength);
    const res = await put(pathname, body, {
      access: "public",
      contentType,
      addRandomSuffix: !!opts.randomSuffix,
      allowOverwrite: false,
      token: this.token,
    });
    return {
      pathname: res.pathname,
      url: res.url,
      size: typeof data === "string" ? Buffer.byteLength(data) : data.byteLength,
      uploadedAt: new Date().toISOString(),
    };
  }

  async read(file: StoredFile): Promise<Uint8Array> {
    const res = await fetch(file.url, { cache: "no-store" });
    if (!res.ok) throw new Error(`blob read failed: ${res.status}`);
    return new Uint8Array(await res.arrayBuffer());
  }

  async list(prefix: string): Promise<StoredFile[]> {
    const out: StoredFile[] = [];
    let cursor: string | undefined;
    do {
      const page = await list({ prefix, cursor, limit: 1000, token: this.token });
      for (const b of page.blobs) out.push({ pathname: b.pathname, url: b.url, size: b.size, uploadedAt: new Date(b.uploadedAt).toISOString() });
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);
    return out.sort((a, b) => a.pathname.localeCompare(b.pathname));
  }

  async del(files: StoredFile[]): Promise<void> {
    if (files.length) await del(files.map((f) => f.url), { token: this.token });
  }
}
