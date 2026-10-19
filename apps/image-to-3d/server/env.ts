/** Every environment variable the server reads, in one place. Documented in README.md and .env.example. */
export interface Env {
  anthropicApiKey: string | undefined;
  /** Signs session-adjacent values (OAuth state, file links). Required in production. */
  sessionSecret: string | undefined;
  blobToken: string | undefined;
  upstashUrl: string | undefined;
  upstashToken: string | undefined;
  googleClientId: string | undefined;
  googleClientSecret: string | undefined;
  /** Public origin, e.g. https://3d.agamagarwal.com. Used for the OAuth redirect; defaults to the request origin. */
  publicUrl: string | undefined;
  /** Emails that are admins and skip the invite gate. */
  adminEmails: string[];
  /** Static invite codes (comma separated), in addition to codes an admin creates. */
  inviteCodes: string[];
  /** New accounts need an invite code. Default: on in production, off in local dev. */
  inviteRequired: boolean;
  /** Local-only email sign-in with no password. Never on in production. */
  mockAuth: boolean;
  dailyBudgetUsd: number;
  rateLimitPerMinute: number;
  maxRefinePasses: number;
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

const list = (v: string | undefined, lower = false) =>
  (v ?? "")
    .split(",")
    .map((s) => (lower ? s.trim().toLowerCase() : s.trim()))
    .filter(Boolean);

const flag = (v: string | undefined) => v === "true" || v === "1";

export function readEnv(e: Record<string, string | undefined> = process.env): Env {
  const isProduction = e.VERCEL_ENV === "production" || (e.NODE_ENV === "production" && !!e.VERCEL);
  const mock = !isProduction && e.ANTHROPIC_MOCK === "fixtures" ? "fixtures" : null;
  const inviteCodes = list(e.INVITE_CODES);
  return {
    anthropicApiKey: e.ANTHROPIC_API_KEY || undefined,
    sessionSecret: e.SESSION_SECRET || undefined,
    blobToken: e.BLOB_READ_WRITE_TOKEN || undefined,
    upstashUrl: e.UPSTASH_REDIS_REST_URL || e.KV_REST_API_URL || undefined,
    upstashToken: e.UPSTASH_REDIS_REST_TOKEN || e.KV_REST_API_TOKEN || undefined,
    googleClientId: e.GOOGLE_CLIENT_ID || undefined,
    googleClientSecret: e.GOOGLE_CLIENT_SECRET || undefined,
    publicUrl: e.PUBLIC_URL ? e.PUBLIC_URL.replace(/\/+$/, "") : undefined,
    adminEmails: list(e.ADMIN_EMAILS, true),
    inviteCodes,
    inviteRequired: e.INVITE_REQUIRED === undefined || e.INVITE_REQUIRED === "" ? isProduction || inviteCodes.length > 0 : flag(e.INVITE_REQUIRED),
    mockAuth: !isProduction && (mock === "fixtures" || flag(e.MOCK_AUTH)),
    dailyBudgetUsd: number(e.DAILY_BUDGET_USD, 5, 0, 10_000),
    rateLimitPerMinute: number(e.RATE_LIMIT_PER_MINUTE, 12, 1, 600),
    maxRefinePasses: Math.round(number(e.MAX_REFINE_PASSES, 3, 0, 3)),
    mock,
    mockDelayMs: number(e.MOCK_DELAY_MS, 12, 0, 1000),
    dataDir: e.DATA_DIR || ".data",
    isProduction,
  };
}
