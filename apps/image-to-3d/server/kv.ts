/**
 * Small key-value store for accounts, sessions, quotas and locks.
 *
 *  - UpstashKv: Upstash Redis over its REST API (no dependency, just fetch). Used when
 *    UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set (the Vercel Marketplace
 *    integration adds them, as KV_REST_API_URL / KV_REST_API_TOKEN, which are read too).
 *  - FileKv: a JSON file under DATA_DIR. Local dev only: it survives restarts.
 *  - MemoryKv: tests, and the last resort.
 *
 * Every method is atomic per call on all three (the file and memory stores are single-process).
 * Neon is not implemented: Upstash covers every access pattern here, and the interface is small
 * enough to add a Postgres version later.
 */
import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";

export interface Kv {
  readonly kind: "upstash" | "file" | "memory";
  get(key: string): Promise<string | null>;
  /** ttlSec: expire after this many seconds. */
  set(key: string, value: string, opts?: { ttlSec?: number }): Promise<void>;
  /** Set only if the key doesn't exist. True when it was set. The basis of locks. */
  setNx(key: string, value: string, opts?: { ttlSec?: number }): Promise<boolean>;
  del(key: string): Promise<void>;
  /** Atomic add on a number (float ok); returns the new value. Creates the key at `by`. */
  incr(key: string, by?: number, opts?: { ttlSec?: number }): Promise<number>;
  /** Keys starting with prefix (small sets only: users, invites, reports). */
  keys(prefix: string): Promise<string[]>;
}

export async function getJson<T>(kv: Kv, key: string): Promise<T | null> {
  const raw = await kv.get(key);
  if (raw == null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}
export const setJson = (kv: Kv, key: string, value: unknown, opts?: { ttlSec?: number }) => kv.set(key, JSON.stringify(value), opts);

interface Entry {
  v: string;
  exp?: number;
}

/** Shared logic of the two in-process stores. */
abstract class LocalKv implements Kv {
  abstract readonly kind: "file" | "memory";
  protected data = new Map<string, Entry>();
  protected persist(): void {}

  private live(key: string, now = Date.now()): Entry | undefined {
    const e = this.data.get(key);
    if (e?.exp !== undefined && e.exp <= now) {
      this.data.delete(key);
      return undefined;
    }
    return e;
  }
  private exp(ttlSec?: number) {
    return ttlSec ? Date.now() + ttlSec * 1000 : undefined;
  }
  async get(key: string) {
    return this.live(key)?.v ?? null;
  }
  async set(key: string, value: string, opts: { ttlSec?: number } = {}) {
    this.data.set(key, { v: value, exp: this.exp(opts.ttlSec) });
    this.persist();
  }
  async setNx(key: string, value: string, opts: { ttlSec?: number } = {}) {
    if (this.live(key)) return false;
    this.data.set(key, { v: value, exp: this.exp(opts.ttlSec) });
    this.persist();
    return true;
  }
  async del(key: string) {
    this.data.delete(key);
    this.persist();
  }
  async incr(key: string, by = 1, opts: { ttlSec?: number } = {}) {
    const cur = this.live(key);
    const next = (cur ? Number(cur.v) || 0 : 0) + by;
    this.data.set(key, { v: String(next), exp: cur?.exp ?? this.exp(opts.ttlSec) });
    this.persist();
    return next;
  }
  async keys(prefix: string) {
    const out: string[] = [];
    for (const k of [...this.data.keys()]) if (k.startsWith(prefix) && this.live(k)) out.push(k);
    return out.sort();
  }
}

export class MemoryKv extends LocalKv {
  readonly kind = "memory" as const;
}

export class FileKv extends LocalKv {
  readonly kind = "file" as const;
  constructor(private file: string) {
    super();
    try {
      const raw = JSON.parse(readFileSync(file, "utf8")) as Record<string, Entry>;
      for (const [k, e] of Object.entries(raw)) this.data.set(k, e);
    } catch {
      /* first run */
    }
  }
  protected persist() {
    mkdirSync(path.dirname(this.file), { recursive: true });
    const tmp = `${this.file}.tmp`;
    writeFileSync(tmp, JSON.stringify(Object.fromEntries(this.data)));
    renameSync(tmp, this.file);
  }
}

export class UpstashKv implements Kv {
  readonly kind = "upstash" as const;
  constructor(
    private url: string,
    private token: string,
    private fetchImpl: typeof fetch = fetch,
  ) {}

  private async cmd<T = unknown>(...args: (string | number)[]): Promise<T> {
    const res = await this.fetchImpl(this.url, {
      method: "POST",
      headers: { authorization: `Bearer ${this.token}`, "content-type": "application/json" },
      body: JSON.stringify(args),
    });
    const body = (await res.json().catch(() => null)) as { result?: T; error?: string } | null;
    if (!res.ok || !body || body.error) throw new Error(`Upstash ${String(args[0])} failed: ${body?.error ?? res.status}`);
    return body.result as T;
  }

  async get(key: string) {
    return (await this.cmd<string | null>("GET", key)) ?? null;
  }
  async set(key: string, value: string, opts: { ttlSec?: number } = {}) {
    await (opts.ttlSec ? this.cmd("SET", key, value, "EX", opts.ttlSec) : this.cmd("SET", key, value));
  }
  async setNx(key: string, value: string, opts: { ttlSec?: number } = {}) {
    const r = await (opts.ttlSec ? this.cmd("SET", key, value, "EX", opts.ttlSec, "NX") : this.cmd("SET", key, value, "NX"));
    return r === "OK";
  }
  async del(key: string) {
    await this.cmd("DEL", key);
  }
  async incr(key: string, by = 1, opts: { ttlSec?: number } = {}) {
    const r = Number(await this.cmd<string | number>("INCRBYFLOAT", key, by));
    // first write: set the expiry once (NX keeps an existing one)
    if (opts.ttlSec) await this.cmd("EXPIRE", key, opts.ttlSec, "NX").catch(() => {});
    return r;
  }
  async keys(prefix: string) {
    const out: string[] = [];
    let cursor = "0";
    do {
      const [next, batch] = await this.cmd<[string, string[]]>("SCAN", cursor, "MATCH", `${prefix.replace(/[*?[\]\\]/g, "\\$&")}*`, "COUNT", 500);
      out.push(...batch);
      cursor = next;
    } while (cursor !== "0");
    return out.sort();
  }
}
