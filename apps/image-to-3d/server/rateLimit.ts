import { HttpError } from "./http.js";

/**
 * Sliding-window limiter, in memory. On Vercel each warm instance keeps its own
 * window, so this is a speed bump against bursts, not a hard global cap; the
 * daily budget (budget.ts) is the hard cap on spend.
 */
export class RateLimiter {
  private hits = new Map<string, number[]>();

  constructor(
    private limit: number,
    private windowMs = 60_000,
  ) {}

  check(key: string, now = Date.now()): void {
    const since = now - this.windowMs;
    const list = (this.hits.get(key) ?? []).filter((t) => t > since);
    if (list.length >= this.limit) {
      const retry = Math.max(1, Math.ceil((list[0] + this.windowMs - now) / 1000));
      this.hits.set(key, list);
      throw new HttpError(429, `Too many requests. Try again in ${retry}s.`, "rate_limited", { "retry-after": String(retry) });
    }
    list.push(now);
    this.hits.set(key, list);
    if (this.hits.size > 5000) this.gc(since);
  }

  private gc(since: number) {
    for (const [k, v] of this.hits) if (!v.some((t) => t > since)) this.hits.delete(k);
  }
}
