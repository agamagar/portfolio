import path from "node:path";
import { fixtureMessagesApi } from "./mock.js";
import { realMessagesApi, type MessagesApi } from "./claude.js";
import { readEnv, type Env } from "./env.js";
import { FileKv, UpstashKv, type Kv } from "./kv.js";
import { HttpError } from "./http.js";
import { RateLimiter } from "./rateLimit.js";
import { BlobStore } from "./store/blobStore.js";
import { FsStore } from "./store/fsStore.js";
import type { Store } from "./store/types.js";

export interface Deps {
  env: Env;
  store: Store | null;
  /** Accounts, sessions, quotas. null only on a serverless host with no Upstash configured. */
  kv: Kv | null;
  api: MessagesApi | null;
  claudeLimiter: RateLimiter;
  loginLimiter: RateLimiter;
}

let cached: Deps | null = null;

/** Per-instance singletons, built lazily from the environment. */
export function getDeps(): Deps {
  if (cached) return cached;
  const env = readEnv();
  let store: Store | null = null;
  if (env.blobToken) store = new BlobStore(env.blobToken);
  else if (!process.env.VERCEL) store = new FsStore(path.resolve(env.dataDir));

  let kv: Kv | null = null;
  if (env.upstashUrl && env.upstashToken) kv = new UpstashKv(env.upstashUrl, env.upstashToken);
  else if (!process.env.VERCEL) kv = new FileKv(path.join(path.resolve(env.dataDir), "kv.json"));

  let api: MessagesApi | null = null;
  if (env.mock === "fixtures") api = fixtureMessagesApi(path.resolve("fixtures/anthropic"), env.mockDelayMs);
  else if (env.anthropicApiKey) api = realMessagesApi(env.anthropicApiKey);

  cached = {
    env,
    store,
    kv,
    api,
    claudeLimiter: new RateLimiter(env.rateLimitPerMinute),
    loginLimiter: new RateLimiter(8),
  };
  return cached;
}

export function requireStore(d: Pick<Deps, "store">): Store {
  if (!d.store) throw new HttpError(503, "No storage configured: connect a Vercel Blob store to this project (BLOB_READ_WRITE_TOKEN).", "no_storage");
  return d.store;
}

export function requireApi(d: Pick<Deps, "api">): MessagesApi {
  if (!d.api) throw new HttpError(503, "ANTHROPIC_API_KEY is not set on the server.", "no_api_key");
  return d.api;
}

export function requireKv(d: Pick<Deps, "kv">): Kv {
  if (!d.kv) throw new HttpError(503, "Accounts need Upstash Redis: set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.", "not_configured");
  return d.kv;
}
