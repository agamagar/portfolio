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
import { requireApi, requireKv, requireStore, type Deps } from "../deps.js";
import { clientIp, HttpError, json, ndjson, readJson } from "../http.js";
import { assertNotLocked, imageHash, moderateViews } from "../moderation.js";
import { acquireSlot, assertUserBudget, lockUser, openJob, recordUserSpend, reserveModel, spendJob } from "../quota.js";
import * as v from "../validate.js";

const MAX_BODY = 24_000_000; // up to three 5 MB views (base64) plus the render

function nextCallCeiling(model: ModelId): number {
  // the high end of a single call, so one request can't blow far past the cap
  return estimateGeneration({ model, passes: 0, imageWidth: 1024, imageHeight: 1024, views: 3 }).high;
}

export async function generate(req: Request, d: Deps): Promise<Response> {
  const user = await requireUser(d, req);
  const api = requireApi(d);
  const store = requireStore(d);
  const kv = requireKv(d);
  await d.claudeLimiter.check(`claude:${clientIp(req)}`);
  const body = await readJson<Record<string, unknown>>(req, MAX_BODY);

  const mode = body.mode === "refine" ? "refine" : "create";
  const base = {
    views: await v.viewImages(body),
    style: v.style(body.style),
    model: v.model(body.model),
    effort: v.effort(body.effort),
    notes: v.notes(body.notes),
  };
  let refine: { render: Awaited<ReturnType<typeof v.imageInput>>; specJson: string; pass: number } | null = null;
  if (mode === "refine") {
    const pass = Number(body.pass);
    if (!Number.isInteger(pass) || pass < 1 || pass > d.env.maxRefinePasses) {
      throw new HttpError(400, `pass must be 1..${d.env.maxRefinePasses}`, "bad_request");
    }
    const parsed = SpecSchema.safeParse(body.spec);
    if (!parsed.success) throw new HttpError(400, "spec is not a valid spec", "bad_spec");
    refine = { render: await v.imageInput(body.render, "render"), specJson: JSON.stringify(parsed.data), pass };
  }

  // limits, cheapest first. Each acquired resource is released in `finish` (or on a throw here).
  const releases: (() => Promise<void>)[] = [];
  const finish = async () => {
    for (const r of releases.reverse()) await r();
  };
  let refund: (() => Promise<void>) | null = null;
  let currentJob = "";
  const hooksForCost: Pick<CallHooks, "onCost"> = {
    onCost: (usd) => Promise.all([recordSpend(store, usd), recordUserSpend(kv, user, usd)]).then(() => {}, (e) => console.error("[image-to-3d] spend not recorded", e)),
  };
  try {
    releases.push(await lockUser(kv, user));
    if (mode === "create") {
      await assertNotLocked(kv, user);
      refund = await reserveModel(d.env, kv, user); // 1 model, however many views
    } else {
      await spendJob(kv, user, body.jobId, "refines", d.env.maxRefinePasses, base.views.map((x) => imageHash(x.image.data)));
      currentJob = String(body.jobId);
    }
    await assertUserBudget(d.env, kv, user, nextCallCeiling(base.model));
    releases.push(await acquireSlot(d.env, kv));
    await assertBudget(store, d.env.dailyBudgetUsd, nextCallCeiling(base.model));
    if (mode === "create") {
      // strict pre-check: nothing reaches the big model until every image is allowed
      const approved = await moderateViews(api, kv, user, base.views, base.notes, { ...hooksForCost, signal: req.signal });
      currentJob = await openJob(kv, user, approved);
    }
  } catch (err) {
    await refund?.();
    await finish();
    throw err;
  }

  return ndjson(async (send) => {
    let ok = false;
    try {
      send({ type: "status", stage: mode === "create" ? "analysing" : "comparing" });
      const hooks: CallHooks = {
        onThinking: (text) => send({ type: "thinking", text }),
        onProgress: (outputChars) => send({ type: "progress", outputChars }),
        onRetry: (attempt, reason) => send({ type: "retry", attempt, reason }),
        onCost: hooksForCost.onCost,
        signal: req.signal,
      };
      const out = refine ? await refineSpec(api, { ...base, ...refine }, hooks) : await createSpec(api, base, hooks);
      ok = true;
      send({
        type: "result",
        mode,
        jobId: currentJob,
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
    } finally {
      if (!ok) await refund?.();
      await finish();
    }
  });
}

export async function judge(req: Request, d: Deps): Promise<Response> {
  const user = await requireUser(d, req);
  const api = requireApi(d);
  const store = requireStore(d);
  const kv = requireKv(d);
  await d.claudeLimiter.check(`claude:${clientIp(req)}`);
  const body = await readJson<Record<string, unknown>>(req, MAX_BODY);
  const image = (await v.viewImages(body))[0].image;
  const render = await v.imageInput(body.render, "render");
  const unlock = await lockUser(kv, user);
  try {
    await spendJob(kv, user, body.jobId, "judges", 1, [imageHash(image.data)]);
    await assertUserBudget(d.env, kv, user, 0.01);
    await assertBudget(store, d.env.dailyBudgetUsd, 0.01);
    const out = await judgeRender(api, { image, render }, { onCost: (usd) => Promise.all([recordSpend(store, usd), recordUserSpend(kv, user, usd)]).then(() => {}, () => {}) });
    return json({ score: out.result.score, critique: out.result.critique, usage: out.usage, costUsd: out.costUsd, model: out.model });
  } finally {
    await unlock();
  }
}
