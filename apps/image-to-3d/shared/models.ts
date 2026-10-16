/**
 * Models offered in the UI and their list prices (USD per million tokens,
 * Claude API first-party rates, October 2026). Cache writes are the 5-minute
 * TTL rate (1.25x input); cache reads as published per model.
 */
export const MODELS = {
  "claude-opus-5-5": {
    label: "Opus 5.5",
    blurb: "Best fidelity (default)",
    input: 4,
    output: 20,
    cacheWrite: 5,
    cacheRead: 0.2,
    serverFallback: true,
  },
  "claude-sonnet-5-5": {
    label: "Sonnet 5.5",
    blurb: "Balanced",
    input: 2,
    output: 10,
    cacheWrite: 2.5,
    cacheRead: 0.2,
    serverFallback: true,
  },
  "claude-haiku-5-5": {
    label: "Haiku 5.5",
    blurb: "Cheap drafts",
    input: 0.1,
    output: 0.5,
    cacheWrite: 0.125,
    cacheRead: 0.01,
    serverFallback: false,
  },
} as const;

export type ModelId = keyof typeof MODELS;
export const MODEL_IDS = Object.keys(MODELS) as ModelId[];
export const DEFAULT_MODEL: ModelId = "claude-opus-5-5";
export const DRAFT_MODEL: ModelId = "claude-haiku-5-5";
/** Scoring a finished render is a simple comparison: always use the cheap model. */
export const JUDGE_MODEL: ModelId = "claude-haiku-5-5";

export const EFFORTS = ["low", "medium", "high"] as const;
export type Effort = (typeof EFFORTS)[number];

export function isModelId(v: unknown): v is ModelId {
  return typeof v === "string" && v in MODELS;
}

export interface Usage {
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens?: number | null;
  cache_read_input_tokens?: number | null;
}

/** Price of one response. Unknown models (e.g. a server-side fallback) price as Opus 5.5. */
export function costOf(model: string, u: Usage): number {
  const p = MODELS[(model in MODELS ? model : DEFAULT_MODEL) as ModelId];
  const usd =
    (u.input_tokens * p.input +
      (u.cache_creation_input_tokens ?? 0) * p.cacheWrite +
      (u.cache_read_input_tokens ?? 0) * p.cacheRead +
      u.output_tokens * p.output) /
    1_000_000;
  return Math.round(usd * 1e6) / 1e6;
}

export function addUsage(a: Usage, b: Usage): Usage {
  return {
    input_tokens: a.input_tokens + b.input_tokens,
    output_tokens: a.output_tokens + b.output_tokens,
    cache_creation_input_tokens: (a.cache_creation_input_tokens ?? 0) + (b.cache_creation_input_tokens ?? 0),
    cache_read_input_tokens: (a.cache_read_input_tokens ?? 0) + (b.cache_read_input_tokens ?? 0),
  };
}

export const ZERO_USAGE: Usage = { input_tokens: 0, output_tokens: 0, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 };

/** Claude's documented approximation: tokens ≈ width × height / 750 after resizing. */
export function imageTokens(width: number, height: number): number {
  return Math.ceil((width * height) / 750);
}

/**
 * Rough pre-flight estimate for one full generation (spec + N refinement
 * passes + a final judge). Ranges, not promises: thinking length varies.
 * System prompt + schema are cached after the first call in a 5-minute window.
 */
export const ESTIMATE = {
  systemTokens: 4200, // measured: prompt + schema description, see tests/pricing.test.ts
  specOutput: [3500, 9000] as const, // spec JSON + adaptive thinking
  refineOutput: [4000, 10000] as const,
  judgeOutput: [300, 900] as const,
  specJsonTokens: 2500, // the current spec sent back in each refine call
};

export function estimateGeneration(opts: {
  model: ModelId;
  passes: number;
  imageWidth: number;
  imageHeight: number;
  /** number of reference views sent (front + sides), default 1 */
  views?: number;
  renderSize?: number;
}): { low: number; high: number } {
  const img = imageTokens(opts.imageWidth, opts.imageHeight) * Math.max(1, opts.views ?? 1);
  const render = imageTokens(opts.renderSize ?? 768, opts.renderSize ?? 768);
  const range = (k: 0 | 1) => {
    const first: Usage = {
      input_tokens: img + 200,
      cache_creation_input_tokens: k === 1 ? ESTIMATE.systemTokens : 0,
      cache_read_input_tokens: k === 0 ? ESTIMATE.systemTokens : 0,
      output_tokens: ESTIMATE.specOutput[k],
    };
    let usd = costOf(opts.model, first);
    for (let i = 0; i < opts.passes; i++) {
      usd += costOf(opts.model, {
        input_tokens: img + render + ESTIMATE.specJsonTokens + 300,
        cache_read_input_tokens: ESTIMATE.systemTokens,
        output_tokens: ESTIMATE.refineOutput[k],
      });
    }
    if (opts.passes > 0) {
      usd += costOf(JUDGE_MODEL, {
        input_tokens: img + render + 600,
        output_tokens: ESTIMATE.judgeOutput[k],
      });
    }
    return usd;
  };
  return { low: range(0), high: range(1) };
}

export function formatUsd(v: number): string {
  if (v < 0.01) return `$${v.toFixed(4)}`;
  if (v < 1) return `$${v.toFixed(3)}`;
  return `$${v.toFixed(2)}`;
}
