/**
 * Client-side orchestration of one generation:
 *   create spec → build → [render → compare & fix → build] × passes → judge
 * Every version is kept with its score; the best one wins. The render sent to
 * Claude is taken from the spec camera at a fixed size, so passes are comparable.
 */
import type { Effort, ModelId } from "../../shared/models";
import type { Spec, Style } from "../../shared/spec";
import type { Stage } from "../three/stage";
import { api, ApiError, generate, type GenerateEvent, type ImagePayload } from "./api";
import { dataUrlToPayload } from "./image";

export type StepStatus = "pending" | "active" | "done" | "skipped" | "error";
export interface Step {
  id: string;
  label: string;
  status: StepStatus;
  detail?: string;
}

export interface Version {
  n: number;
  spec: Spec;
  score: number | null;
  critique: string;
  changes: string[];
  preview: string;
  warnings: string[];
  triangles: number;
}

export interface PipelineState {
  running: boolean;
  steps: Step[];
  thinking: string;
  outputChars: number;
  versions: Version[];
  bestIndex: number;
  shownIndex: number;
  costUsd: number;
  error: string | null;
  model: ModelId;
}

export interface PipelineOptions {
  stage: Stage;
  images: { front: ImagePayload; left?: ImagePayload; right?: ImagePayload };
  style: Style;
  model: ModelId;
  effort: Effort;
  notes: string;
  passes: number;
  signal: AbortSignal;
}

const RENDER_SIZE = 768;
const GOOD_ENOUGH = 9.2;

export function initialSteps(passes: number): Step[] {
  const steps: Step[] = [
    { id: "spec", label: "Reading the image", status: "pending" },
    { id: "build-0", label: "Building version 1", status: "pending" },
  ];
  for (let p = 1; p <= passes; p++) {
    steps.push({ id: `pass-${p}`, label: `Compare & fix, pass ${p}`, status: "pending" });
    steps.push({ id: `build-${p}`, label: `Building version ${p + 1}`, status: "pending" });
  }
  if (passes > 0) steps.push({ id: "judge", label: "Scoring the last version", status: "pending" });
  return steps;
}

export function pickBest(versions: Version[]): number {
  let best = versions.length - 1;
  let bestScore = -1;
  versions.forEach((v, i) => {
    // ties go to the later (more refined) version
    if (v.score !== null && v.score >= bestScore) {
      bestScore = v.score;
      best = i;
    }
  });
  return Math.max(0, best);
}

export async function runPipeline(opts: PipelineOptions, emit: (s: PipelineState) => void): Promise<PipelineState> {
  const state: PipelineState = {
    running: true,
    steps: initialSteps(opts.passes),
    thinking: "",
    outputChars: 0,
    versions: [],
    bestIndex: 0,
    shownIndex: 0,
    costUsd: 0,
    error: null,
    model: opts.model,
  };
  const publish = () => emit({ ...state, steps: state.steps.map((s) => ({ ...s })), versions: state.versions.slice() });
  const step = (id: string, status: StepStatus, detail?: string) => {
    const s = state.steps.find((x) => x.id === id);
    if (s) Object.assign(s, { status, detail: detail ?? s.detail });
    publish();
  };
  const onEvent = (e: GenerateEvent) => {
    if (e.type === "thinking") state.thinking = (state.thinking + e.text).slice(-1200);
    else if (e.type === "progress") state.outputChars = e.outputChars;
    else if (e.type === "retry") state.thinking += `\n↻ Retrying: ${e.reason}\n`;
    publish();
  };
  const build = async (spec: Spec, id: string): Promise<Version> => {
    step(id, "active");
    const shown = await opts.stage.show(spec, { style: opts.style });
    const preview = opts.stage.snapshot(RENDER_SIZE, "image/jpeg");
    step(id, "done", `${shown.stats.parts} parts · ${shown.stats.triangles.toLocaleString()} triangles`);
    return { n: state.versions.length + 1, spec, score: null, critique: "", changes: [], preview, warnings: shown.warnings, triangles: shown.stats.triangles };
  };

  const common = { images: opts.images, style: opts.style, model: opts.model, effort: opts.effort, notes: opts.notes };
  let current = "spec";
  try {
    // 1. create
    step("spec", "active");
    const created = await generate({ mode: "create", ...common }, onEvent, opts.signal);
    state.costUsd += created.costUsd;
    step("spec", "done", `${created.spec.parts.length} parts · ${created.spec.title}`);
    current = "build-0";
    const v0 = await build(created.spec, "build-0");
    v0.warnings.unshift(...created.warnings);
    state.versions.push(v0);
    state.shownIndex = 0;
    publish();

    // 2. compare and fix
    let stoppedEarly = false;
    for (let pass = 1; pass <= opts.passes; pass++) {
      if (stoppedEarly) {
        step(`pass-${pass}`, "skipped", "Already a close match");
        step(`build-${pass}`, "skipped");
        continue;
      }
      current = `pass-${pass}`;
      state.thinking = "";
      state.outputChars = 0;
      step(current, "active");
      const prev = state.versions[state.versions.length - 1];
      const res = await generate(
        { mode: "refine", ...common, jobId: created.jobId, pass, spec: prev.spec, render: dataUrlToPayload(prev.preview) },
        onEvent,
        opts.signal,
      );
      state.costUsd += res.costUsd;
      prev.score = res.score;
      prev.critique = res.critique;
      step(current, "done", `v${prev.n} scored ${res.score?.toFixed(1)}/10`);
      if ((res.score ?? 0) >= GOOD_ENOUGH) {
        stoppedEarly = true;
        step(`build-${pass}`, "skipped", "Kept the current version");
        continue;
      }
      current = `build-${pass}`;
      const next = await build(res.spec, current);
      next.changes = res.changes;
      next.warnings.unshift(...res.warnings);
      state.versions.push(next);
      state.shownIndex = state.versions.length - 1;
      publish();
    }

    // 3. score the last version (refine passes only score the version they were given)
    const last = state.versions[state.versions.length - 1];
    if (opts.passes > 0 && last.score === null) {
      current = "judge";
      step("judge", "active");
      const j = await api.judge(opts.images.front, dataUrlToPayload(last.preview), created.jobId);
      state.costUsd += j.costUsd;
      last.score = j.score;
      last.critique = j.critique;
      step("judge", "done", `v${last.n} scored ${j.score.toFixed(1)}/10`);
    } else if (opts.passes > 0) {
      step("judge", "skipped");
    }

    // 4. keep the best
    state.bestIndex = pickBest(state.versions);
    if (state.bestIndex !== state.versions.length - 1) {
      await opts.stage.show(state.versions[state.bestIndex].spec, { style: opts.style });
    }
    state.shownIndex = state.bestIndex;
    state.running = false;
    publish();
    return state;
  } catch (err) {
    const cancelled = opts.signal.aborted || (err instanceof ApiError && err.code === "aborted");
    state.error = cancelled ? null : err instanceof Error ? err.message : String(err);
    step(current, cancelled ? "skipped" : "error", cancelled ? "Cancelled" : state.error ?? undefined);
    state.steps.forEach((s) => s.status === "pending" && (s.status = "skipped"));
    state.running = false;
    if (state.versions.length) {
      state.bestIndex = pickBest(state.versions);
      state.shownIndex = state.versions.length - 1;
    }
    publish();
    return state;
  }
}
