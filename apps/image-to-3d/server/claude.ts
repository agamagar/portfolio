/**
 * The only module that talks to the Claude API. Server-side only: the API key
 * comes from ANTHROPIC_API_KEY and never leaves this process.
 *
 * Every call:
 *   - streams (long thinking + a large JSON spec can outlast a plain request),
 *   - uses structured outputs (output_config.format = JSON schema) so the text
 *     is always schema-shaped JSON, then validates/normalises with zod anyway,
 *   - caches the frozen system prompt and the source image (cache_control),
 *     so refinement passes re-read them at ~5% of the input price,
 *   - opts into server-side refusal fallbacks on Opus/Sonnet,
 *   - retries once with the validation errors when the output can't be used.
 */
import Anthropic from "@anthropic-ai/sdk";
import type {
  BetaContentBlockParam,
  BetaMessage,
  BetaMessageStreamParams,
  BetaRawMessageStreamEvent,
} from "@anthropic-ai/sdk/resources/beta/messages/messages";
import { costOf, JUDGE_MODEL, MODELS, type Effort, type ModelId, type Usage } from "../shared/models.js";
import {
  JUDGE_JSON_SCHEMA,
  parseJudge,
  parseRefine,
  REFINE_JSON_SCHEMA,
  SpecError,
  type JudgeResult,
  type RefineResult,
  type Style,
} from "../shared/spec.js";
import { HttpError } from "./http.js";
import { createInstruction, JUDGE_SYSTEM_PROMPT, refineInstruction, retryNote, SYSTEM_PROMPT } from "./prompts.js";

export interface MessageStreamLike extends AsyncIterable<BetaRawMessageStreamEvent> {
  finalMessage(): Promise<BetaMessage>;
}

/** The slice of the SDK this app uses; the fixture mock implements the same shape. */
export interface MessagesApi {
  stream(params: BetaMessageStreamParams, options?: { signal?: AbortSignal }): MessageStreamLike;
}

export function realMessagesApi(apiKey: string): MessagesApi {
  const client = new Anthropic({ apiKey, maxRetries: 2, timeout: 280_000 });
  return client.beta.messages as unknown as MessagesApi;
}

export interface ImageInput {
  data: string; // base64, no data: prefix
  mediaType: "image/jpeg" | "image/png" | "image/webp" | "image/gif";
}

export interface CallHooks {
  onThinking?: (text: string) => void;
  onProgress?: (outputChars: number) => void;
  onRetry?: (attempt: number, reason: string) => void;
  /** Called once per API response with its cost, including failed attempts, so spend is always recorded. */
  onCost?: (usd: number) => void | Promise<void>;
  signal?: AbortSignal;
}

export interface CallOutcome<T> {
  result: T;
  warnings: string[];
  usage: Usage;
  costUsd: number;
  model: string;
  attempts: number;
}

const MAX_ATTEMPTS = 2;

function imageBlock(img: ImageInput, cache = false): BetaContentBlockParam {
  return {
    type: "image",
    source: { type: "base64", media_type: img.mediaType, data: img.data },
    ...(cache ? { cache_control: { type: "ephemeral" as const } } : {}),
  };
}

function buildParams(opts: {
  model: ModelId;
  effort: Effort;
  system: string;
  schema: Record<string, unknown>;
  content: BetaContentBlockParam[];
  maxTokens: number;
}): BetaMessageStreamParams {
  const params: BetaMessageStreamParams = {
    model: opts.model,
    max_tokens: opts.maxTokens,
    system: [{ type: "text", text: opts.system, cache_control: { type: "ephemeral" } }],
    thinking: { type: "adaptive", display: "summarized" },
    output_config: { effort: opts.effort, format: { type: "json_schema", schema: opts.schema } },
    messages: [{ role: "user", content: opts.content }],
  };
  if (MODELS[opts.model].serverFallback) {
    // Server-side refusal fallback, routed by refusal category.
    Object.assign(params, { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" });
  }
  return params;
}

/** Text of the answer that was actually served (after any fallback switch point). */
export function answerText(msg: BetaMessage): string {
  const blocks = msg.content;
  let start = 0;
  blocks.forEach((b, i) => {
    if (b.type === "fallback") start = i + 1;
  });
  return blocks
    .slice(start)
    .filter((b): b is Extract<typeof b, { type: "text" }> => b.type === "text")
    .map((b) => b.text)
    .join("");
}

function toUsage(u: BetaMessage["usage"]): Usage {
  return {
    input_tokens: u.input_tokens ?? 0,
    output_tokens: u.output_tokens ?? 0,
    cache_creation_input_tokens: u.cache_creation_input_tokens ?? 0,
    cache_read_input_tokens: u.cache_read_input_tokens ?? 0,
  };
}

/** Maps SDK errors to user-facing HTTP errors. Typed classes, most specific first. */
export function mapApiError(err: unknown): never {
  if (err instanceof HttpError || err instanceof SpecError) throw err;
  if (err instanceof Anthropic.AuthenticationError || err instanceof Anthropic.PermissionDeniedError)
    throw new HttpError(500, "The server's Anthropic API key was rejected. Check ANTHROPIC_API_KEY.", "api_key");
  if (err instanceof Anthropic.RateLimitError)
    throw new HttpError(429, "The Claude API is rate limiting this key. Wait a minute and try again.", "upstream_rate_limit");
  if (err instanceof Anthropic.BadRequestError)
    throw new HttpError(400, `The Claude API rejected the request: ${err.message}`, "upstream_bad_request");
  if (err instanceof Anthropic.APIConnectionError) throw new HttpError(502, "Couldn't reach the Claude API. Try again.", "upstream_unreachable");
  if (err instanceof Anthropic.InternalServerError || (err instanceof Anthropic.APIError && (err.status ?? 0) >= 500))
    throw new HttpError(503, "The Claude API is overloaded right now. Try again shortly.", "upstream_unavailable");
  if (err instanceof Anthropic.APIError) throw new HttpError(502, `Claude API error: ${err.message}`, "upstream_error");
  throw err;
}

async function streamOnce(api: MessagesApi, params: BetaMessageStreamParams, hooks: CallHooks): Promise<BetaMessage> {
  let chars = 0;
  let lastReport = 0;
  const stream = api.stream(params, { signal: hooks.signal });
  for await (const ev of stream) {
    if (ev.type !== "content_block_delta") continue;
    const d = ev.delta;
    if (d.type === "thinking_delta" && d.thinking) hooks.onThinking?.(d.thinking);
    else if (d.type === "text_delta") {
      chars += d.text.length;
      if (chars - lastReport > 400) {
        lastReport = chars;
        hooks.onProgress?.(chars);
      }
    }
  }
  return stream.finalMessage();
}

async function structuredCall<T>(opts: {
  api: MessagesApi;
  model: ModelId;
  effort: Effort;
  system: string;
  schema: Record<string, unknown>;
  content: BetaContentBlockParam[];
  maxTokens: number;
  parse: (text: string) => { value: T; warnings: string[] };
  hooks: CallHooks;
}): Promise<CallOutcome<T>> {
  let usage: Usage = { input_tokens: 0, output_tokens: 0, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 };
  let costUsd = 0;
  let lastIssues: string[] = [];
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    // The retry note goes AFTER the cached prefix, so a retry still reads the cache.
    const content = attempt === 1 ? opts.content : [...opts.content, { type: "text" as const, text: retryNote(lastIssues) }];
    let msg: BetaMessage;
    try {
      msg = await streamOnce(opts.api, buildParams({ ...opts, content }), opts.hooks);
    } catch (err) {
      mapApiError(err);
    }
    const u = toUsage(msg.usage);
    usage = {
      input_tokens: usage.input_tokens + u.input_tokens,
      output_tokens: usage.output_tokens + u.output_tokens,
      cache_creation_input_tokens: (usage.cache_creation_input_tokens ?? 0) + (u.cache_creation_input_tokens ?? 0),
      cache_read_input_tokens: (usage.cache_read_input_tokens ?? 0) + (u.cache_read_input_tokens ?? 0),
    };
    const callCost = costOf(msg.model, u);
    costUsd += callCost;
    await opts.hooks.onCost?.(callCost);

    if (msg.stop_reason === "refusal") {
      const cat = msg.stop_details && "category" in msg.stop_details ? msg.stop_details.category : null;
      throw new HttpError(422, `Claude declined to process this image${cat ? ` (${cat})` : ""}. Try a different image.`, "refusal");
    }
    try {
      if (msg.stop_reason === "max_tokens") throw new SpecError("The answer was cut off at the token limit", ["output truncated: be more economical"]);
      const { value, warnings } = opts.parse(answerText(msg));
      return { result: value, warnings, usage, costUsd, model: msg.model, attempts: attempt };
    } catch (err) {
      if (!(err instanceof SpecError)) throw err;
      lastIssues = [err.message, ...err.issues].slice(0, 8);
      if (attempt < MAX_ATTEMPTS) opts.hooks.onRetry?.(attempt + 1, err.message);
    }
  }
  throw new HttpError(502, `Claude's answer couldn't be turned into a model after ${MAX_ATTEMPTS} attempts: ${lastIssues.join("; ")}`, "invalid_output", {
    "x-cost-usd": costUsd.toFixed(6),
  });
}

export interface SpecRequest {
  image: ImageInput;
  style: Style;
  model: ModelId;
  effort: Effort;
  notes: string;
}

export function createSpec(api: MessagesApi, req: SpecRequest, hooks: CallHooks = {}) {
  return structuredCall<RefineResult>({
    api,
    model: req.model,
    effort: req.effort,
    system: SYSTEM_PROMPT,
    schema: REFINE_JSON_SCHEMA,
    maxTokens: 32000,
    content: [imageBlock(req.image, true), { type: "text", text: createInstruction(req.style, req.notes) }],
    parse: (text) => {
      const { result, warnings } = parseRefine(text, { style: req.style });
      return { value: { ...result, score: 0, critique: "", changes: [] }, warnings };
    },
    hooks,
  });
}

export function refineSpec(api: MessagesApi, req: SpecRequest & { render: ImageInput; specJson: string; pass: number }, hooks: CallHooks = {}) {
  return structuredCall<RefineResult>({
    api,
    model: req.model,
    effort: req.effort,
    system: SYSTEM_PROMPT,
    schema: REFINE_JSON_SCHEMA,
    maxTokens: 32000,
    content: [
      imageBlock(req.image, true), // same first block as createSpec → shared cached prefix
      imageBlock(req.render),
      { type: "text", text: refineInstruction(req.style, req.pass, req.specJson, req.notes) },
    ],
    parse: (text) => {
      const { result, warnings } = parseRefine(text, { style: req.style });
      return { value: result, warnings };
    },
    hooks,
  });
}

export function judgeRender(api: MessagesApi, req: { image: ImageInput; render: ImageInput }, hooks: CallHooks = {}) {
  return structuredCall<JudgeResult>({
    api,
    model: JUDGE_MODEL,
    effort: "low",
    system: JUDGE_SYSTEM_PROMPT,
    schema: JUDGE_JSON_SCHEMA,
    maxTokens: 4000,
    content: [
      { type: "text", text: "Reference image:" },
      imageBlock(req.image),
      { type: "text", text: "Render to score:" },
      imageBlock(req.render),
    ],
    parse: (text) => ({ value: parseJudge(text), warnings: [] }),
    hooks,
  });
}
