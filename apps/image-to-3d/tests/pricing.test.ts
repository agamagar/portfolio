import { describe, expect, it } from "vitest";
import { costOf, ESTIMATE, estimateGeneration, formatUsd, imageTokens } from "../shared/models";
import { REFINE_JSON_SCHEMA } from "../shared/spec";
import { SYSTEM_PROMPT } from "../server/prompts";

describe("pricing", () => {
  it("prices every token class at the model's rate", () => {
    // Opus 5.5: $4 in, $20 out, $5 cache write, $0.20 cache read per MTok
    expect(costOf("claude-opus-5-5", { input_tokens: 1_000_000, output_tokens: 0 })).toBe(4);
    expect(costOf("claude-opus-5-5", { input_tokens: 0, output_tokens: 1_000_000 })).toBe(20);
    expect(costOf("claude-opus-5-5", { input_tokens: 0, output_tokens: 0, cache_creation_input_tokens: 1_000_000 })).toBe(5);
    expect(costOf("claude-opus-5-5", { input_tokens: 0, output_tokens: 0, cache_read_input_tokens: 1_000_000 })).toBe(0.2);
    expect(costOf("claude-haiku-5-5", { input_tokens: 1_000_000, output_tokens: 1_000_000 })).toBeCloseTo(0.6, 6);
    // unknown model (e.g. a server-side fallback) is priced conservatively as Opus
    expect(costOf("claude-something-else", { input_tokens: 1_000_000, output_tokens: 0 })).toBe(4);
  });

  it("prices the recorded fixture generation as expected", () => {
    // create.toadstool: 1612 in, 4318 cache write, 7420 out on Opus 5.5
    const create = costOf("claude-opus-5-5", { input_tokens: 1612, cache_creation_input_tokens: 4318, output_tokens: 7420 });
    expect(create).toBeCloseTo((1612 * 4 + 4318 * 5 + 7420 * 20) / 1e6, 6);
    // refine: cache reads make the repeated prefix ~20x cheaper than writing it
    const refine = costOf("claude-opus-5-5", { input_tokens: 3940, cache_read_input_tokens: 5730, output_tokens: 8150 });
    expect(refine).toBeLessThan(0.2);
  });

  it("estimates grow with passes and model price", () => {
    const base = { imageWidth: 1024, imageHeight: 1024 };
    const opus0 = estimateGeneration({ model: "claude-opus-5-5", passes: 0, ...base });
    const opus2 = estimateGeneration({ model: "claude-opus-5-5", passes: 2, ...base });
    const haiku2 = estimateGeneration({ model: "claude-haiku-5-5", passes: 2, ...base });
    expect(opus0.low).toBeLessThan(opus0.high);
    expect(opus2.low).toBeGreaterThan(opus0.low);
    expect(haiku2.high).toBeLessThan(opus2.low);
    expect(opus2.high).toBeLessThan(1); // sanity: a 2-pass Opus generation is well under a dollar
  });

  it("keeps the system-token estimate close to the real prompt + schema size", () => {
    // ~3.6 chars per token for English prose and JSON
    const approx = (SYSTEM_PROMPT.length + JSON.stringify(REFINE_JSON_SCHEMA).length) / 3.6;
    expect(approx).toBeGreaterThan(ESTIMATE.systemTokens * 0.6);
    expect(approx).toBeLessThan(ESTIMATE.systemTokens * 1.4);
    // and comfortably above the 512-token minimum cacheable prefix
    expect(SYSTEM_PROMPT.length / 4).toBeGreaterThan(512);
  });

  it("formats small amounts with enough precision", () => {
    expect(formatUsd(0.0042)).toBe("$0.0042");
    expect(formatUsd(0.123)).toBe("$0.123");
    expect(formatUsd(3.5)).toBe("$3.50");
    expect(imageTokens(1024, 768)).toBe(1049);
  });
});
