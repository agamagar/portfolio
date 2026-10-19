/**
 * POST /api/generate  {mode: "create" | "refine", ...}  → NDJSON event stream
 * POST /api/judge     → JSON
 *
 * Stream events (one JSON object per line):
 *   {type:"status", stage}           analysing | comparing
 *   {type:"thinking", text}          summarised thinking, as it streams
 *   {type:"progress", outputChars}   size of the JSON written so far
 *   {type:"retry", attempt, reason}  the output failed validation, retrying
 *   {type:"result", ...}             the validated spec + usage + cost
 *   {type:"error", message, code}
 */
import { estimateGeneration, type ModelId } from "../../shared/models.js";
import { SpecSchema } from "../../shared/spec.js";
import { requireUser } from "../auth.js";
import { assertBudget, recordSpend } from "../budget.js";
import { createSpec, judgeRender, refineSpec, type CallHooks } from "../claude.js";
import { requireApi, requireStore, type Deps } from "../deps.js";
import { clientIp, HttpError, json, ndjson, readJson } from "../http.js";
import * as v from "../validate.js";

const MAX_BODY = 18_000_000; // up to three views

function nextCallCeiling(model: ModelId): number {
  // the high end of a single call, so one request can't blow far past the cap
  return estimateGeneration({ model, passes: 0, imageWidth: 1024, imageHeight: 1024, views: 3 }).high;
}

export async function generate(req: Request, d: Deps): Promise<Response> {
  await requireUser(d, req);
  const api = requireApi(d);
  const store = requireStore(d);
  d.claudeLimiter.check(`claude:${clientIp(req)}`);
  const body = await readJson<Record<string, unknown>>(req, MAX_BODY);

  const mode = body.mode === "refine" ? "refine" : "create";
  const base = {
    views: v.viewImages(body),
    style: v.style(body.style),
    model: v.model(body.model),
    effort: v.effort(body.effort),
    notes: v.notes(body.notes),
  };
  let refine: { render: ReturnType<typeof v.imageInput>; specJson: string; pass: number } | null = null;
  if (mode === "refine") {
    const pass = Number(body.pass);
    if (!Number.isInteger(pass) || pass < 1 || pass > d.env.maxRefinePasses) {
      throw new HttpError(400, `pass must be 1..${d.env.maxRefinePasses}`, "bad_request");
    }
    const parsed = SpecSchema.safeParse(body.spec);
    if (!parsed.success) throw new HttpError(400, "spec is not a valid spec", "bad_spec");
    refine = { render: v.imageInput(body.render, "render"), specJson: JSON.stringify(parsed.data), pass };
  }
  await assertBudget(store, d.env.dailyBudgetUsd, nextCallCeiling(base.model));

  return ndjson(async (send) => {
    send({ type: "status", stage: mode === "create" ? "analysing" : "comparing" });
    const hooks: CallHooks = {
      onThinking: (text) => send({ type: "thinking", text }),
      onProgress: (outputChars) => send({ type: "progress", outputChars }),
      onRetry: (attempt, reason) => send({ type: "retry", attempt, reason }),
      onCost: (usd) => recordSpend(store, usd).catch((e) => console.error("[image-to-3d] spend not recorded", e)),
      signal: req.signal,
    };
    const out = refine ? await refineSpec(api, { ...base, ...refine }, hooks) : await createSpec(api, base, hooks);
    send({
      type: "result",
      mode,
      score: refine ? out.result.score : null,
      critique: out.result.critique,
      changes: out.result.changes,
      spec: out.result.spec,
      warnings: out.warnings,
      usage: out.usage,
      costUsd: out.costUsd,
      model: out.model,
      attempts: out.attempts,
    });
  });
}

export async function judge(req: Request, d: Deps): Promise<Response> {
  await requireUser(d, req);
  const api = requireApi(d);
  const store = requireStore(d);
  d.claudeLimiter.check(`claude:${clientIp(req)}`);
  const body = await readJson<Record<string, unknown>>(req, MAX_BODY);
  const image = v.viewImages(body)[0].image;
  const render = v.imageInput(body.render, "render");
  await assertBudget(store, d.env.dailyBudgetUsd, 0.01);
  const out = await judgeRender(api, { image, render }, { onCost: (usd) => recordSpend(store, usd).catch(() => {}) });
  return json({ score: out.result.score, critique: out.result.critique, usage: out.usage, costUsd: out.costUsd, model: out.model });
}
