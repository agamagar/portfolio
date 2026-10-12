import { mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";
import type { Store, StoredFile } from "./types.js";

/** Local-disk store for dev and tests. Files are served by the dev server at /files/<pathname>. */
export class FsStore implements Store {
  readonly kind = "fs" as const;
  constructor(readonly dir: string) {}

  private abs(pathname: string) {
    const p = path.resolve(this.dir, pathname);
    if (!p.startsWith(path.resolve(this.dir) + path.sep)) throw new Error("path escapes store");
    return p;
  }

  async put(pathname: string, data: Uint8Array | string, _contentType: string, opts: { randomSuffix?: boolean } = {}): Promise<StoredFile> {
    let name = pathname;
    if (opts.randomSuffix) {
      const ext = path.extname(pathname);
      name = `${pathname.slice(0, pathname.length - ext.length)}-${randomBytes(6).toString("hex")}${ext}`;
    }
    const abs = this.abs(name);
    await mkdir(path.dirname(abs), { recursive: true });
    await writeFile(abs, data);
    const s = await stat(abs);
    return { pathname: name, url: `/files/${name}`, size: s.size, uploadedAt: s.mtime.toISOString() };
  }

  async read(file: StoredFile): Promise<Uint8Array> {
    return new Uint8Array(await readFile(this.abs(file.pathname)));
  }

  async list(prefix: string): Promise<StoredFile[]> {
    const out: StoredFile[] = [];
    const walk = async (dir: string) => {
      let entries;
      try {
        entries = await readdir(dir, { withFileTypes: true });
      } catch {
        return;
      }
      for (const e of entries) {
        const abs = path.join(dir, e.name);
        if (e.isDirectory()) await walk(abs);
        else {
          const rel = path.relative(this.dir, abs).split(path.sep).join("/");
          if (!rel.startsWith(prefix)) continue;
          const s = await stat(abs);
          out.push({ pathname: rel, url: `/files/${rel}`, size: s.size, uploadedAt: s.mtime.toISOString() });
        }
      }
    };
    // walk from the deepest existing directory of the prefix
    const dirPart = prefix.includes("/") ? prefix.slice(0, prefix.lastIndexOf("/")) : "";
    await walk(path.resolve(this.dir, dirPart));
    return out.sort((a, b) => a.pathname.localeCompare(b.pathname));
  }

  async del(files: StoredFile[]): Promise<void> {
    await Promise.all(files.map((f) => rm(this.abs(f.pathname), { force: true })));
  }
}
