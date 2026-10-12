/** Every environment variable the server reads, in one place. Documented in README.md and .env.example. */
export interface Env {
  anthropicApiKey: string | undefined;
  appPassword: string | undefined;
  sessionSecret: string | undefined;
  blobToken: string | undefined;
  dailyBudgetUsd: number;
  rateLimitPerMinute: number;
  maxRefinePasses: number;
  publicGallery: boolean;
  /** "fixtures" swaps the Anthropic client for recorded responses. Ignored in production. */
  mock: "fixtures" | null;
  mockDelayMs: number;
  dataDir: string;
  isProduction: boolean;
}

function number(v: string | undefined, fallback: number, lo: number, hi: number) {
  const n = v === undefined || v === "" ? NaN : Number(v);
  return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : fallback;
}

export function readEnv(e: Record<string, string | undefined> = process.env): Env {
  const isProduction = e.VERCEL_ENV === "production" || (e.NODE_ENV === "production" && !!e.VERCEL);
  return {
    anthropicApiKey: e.ANTHROPIC_API_KEY || undefined,
    appPassword: e.APP_PASSWORD || undefined,
    sessionSecret: e.SESSION_SECRET || undefined,
    blobToken: e.BLOB_READ_WRITE_TOKEN || undefined,
    dailyBudgetUsd: number(e.DAILY_BUDGET_USD, 5, 0, 10_000),
    rateLimitPerMinute: number(e.RATE_LIMIT_PER_MINUTE, 12, 1, 600),
    maxRefinePasses: Math.round(number(e.MAX_REFINE_PASSES, 3, 0, 3)),
    publicGallery: e.PUBLIC_GALLERY === "true" || e.PUBLIC_GALLERY === "1",
    mock: !isProduction && e.ANTHROPIC_MOCK === "fixtures" ? "fixtures" : null,
    mockDelayMs: number(e.MOCK_DELAY_MS, 12, 0, 1000),
    dataDir: e.DATA_DIR || ".data",
    isProduction,
  };
}
