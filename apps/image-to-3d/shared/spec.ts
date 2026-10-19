/**
 * The 3D illustration spec: the contract between Claude and the deterministic
 * three.js builder. One zod schema is the single source of truth. It produces
 *   - the JSON Schema sent to the API as a structured-output format
 *     (see `toStructuredOutputSchema` below), and
 *   - the validator/normaliser that every model response passes through before
 *     anything is built. Numeric ranges are clamped here rather than in the API
 *     schema, because structured outputs do not support min/max constraints.
 */
import { z } from "zod";

export const STYLES = ["clay", "toon", "low-poly", "felt"] as const;
export type Style = (typeof STYLES)[number];

export const STYLE_LABELS: Record<Style, string> = {
  clay: "Clay",
  toon: "Toon",
  "low-poly": "Low-poly",
  felt: "Felt",
};

export const LIGHTING_PRESETS = ["studio", "soft", "sunset", "night"] as const;
export type LightingPreset = (typeof LIGHTING_PRESETS)[number];

export const SUBJECT_KINDS = [
  "object",
  "character",
  "animal",
  "vehicle",
  "building",
  "plant",
  "food",
  "scene",
  "other",
] as const;

/**
 * Dev-only escape hatch for `customParts[].code`. Off unless ALLOW_CUSTOM_PARTS=1
 * on a non-production server (the browser never sets it: `process` is undefined there).
 */
export function customPartsAllowed(): boolean {
  if (typeof process === "undefined" || !process.env) return false;
  const e = process.env;
  return e.ALLOW_CUSTOM_PARTS === "1" && e.VERCEL_ENV !== "production" && e.NODE_ENV !== "production";
}
const MAX_DEV_CUSTOM_PARTS = 4;

export const LIMITS = {
  parts: 48,
  materials: 16,
  profilePoints: 48,
  outlinePoints: 48,
  pathPoints: 24,
  /** 0 in the public build: model-written JS never reaches a visitor's browser. See customPartsAllowed(). */
  customParts: 0,
  codeChars: 4000,
  tags: 8,
  /** Model units: the subject is modelled roughly 2 units tall. */
  maxExtent: 20,
} as const;

// ---------------------------------------------------------------------------
// helpers: lenient numbers that clamp instead of failing
// ---------------------------------------------------------------------------

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const finite = (v: number, fallback: number) => (Number.isFinite(v) ? v : fallback);

function num(lo: number, hi: number, fallback: number, description?: string) {
  const base = z.number().transform((v) => clamp(finite(v, fallback), lo, hi));
  return description ? base.describe(description) : base;
}

function vec3(lo: number, hi: number, fallback: number, description: string) {
  return z
    .array(z.number())
    .describe(description)
    .transform((arr) => {
      const out: [number, number, number] = [fallback, fallback, fallback];
      for (let i = 0; i < 3; i++) out[i] = clamp(finite(arr[i] ?? fallback, fallback), lo, hi);
      return out;
    });
}

function points2(maxPoints: number, lo: number, hi: number, description: string) {
  return z
    .array(z.array(z.number()))
    .describe(description)
    .transform((pts) =>
      pts
        .slice(0, maxPoints)
        .filter((p) => p.length >= 2 && Number.isFinite(p[0]) && Number.isFinite(p[1]))
        .map((p) => [clamp(p[0], lo, hi), clamp(p[1], lo, hi)] as [number, number]),
    );
}

function points3(maxPoints: number, description: string) {
  const m = LIMITS.maxExtent;
  return z
    .array(z.array(z.number()))
    .describe(description)
    .transform((pts) =>
      pts
        .slice(0, maxPoints)
        .filter((p) => p.length >= 3 && p.slice(0, 3).every(Number.isFinite))
        .map((p) => [clamp(p[0], -m, m), clamp(p[1], -m, m), clamp(p[2], -m, m)] as [number, number, number]),
    );
}

const HEX_RE = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;
function hex(fallback: string, description: string) {
  return z
    .string()
    .describe(description)
    .transform((s) => {
      const m = HEX_RE.exec(s.trim());
      if (!m) return fallback;
      let h = m[1].toLowerCase();
      if (h.length === 3) h = h.split("").map((c) => c + c).join("");
      return `#${h}`;
    });
}

const id = (description: string) =>
  z
    .string()
    .describe(description)
    .transform((s) => s.trim().slice(0, 48) || "part");

const text = (max: number, description: string) =>
  z
    .string()
    .describe(description)
    .transform((s) => s.trim().slice(0, max));

// ---------------------------------------------------------------------------
// shapes
// ---------------------------------------------------------------------------

const M = LIMITS.maxExtent;

export const ShapeSchema = z
  .discriminatedUnion("type", [
    z.object({
      type: z.literal("sphere"),
      radius: num(0.005, M, 0.5, "Radius. Use scale on the part for ellipsoids."),
    }),
    z.object({
      type: z.literal("box"),
      size: vec3(0.005, M, 1, "[width, height, depth]"),
      bevel: num(0, 1, 0.05, "Corner rounding radius, 0 for sharp. Clamped to half the smallest side."),
    }),
    z.object({
      type: z.literal("cylinder"),
      radiusTop: num(0, M, 0.5, "Top radius"),
      radiusBottom: num(0, M, 0.5, "Bottom radius"),
      height: num(0.005, M, 1, "Height along local Y"),
    }),
    z.object({
      type: z.literal("cone"),
      radius: num(0.005, M, 0.5, "Base radius"),
      height: num(0.005, M, 1, "Height along local Y, apex up"),
    }),
    z.object({
      type: z.literal("capsule"),
      radius: num(0.005, M, 0.25, "Radius of the rounded ends"),
      length: num(0, M, 1, "Length of the straight middle section along local Y"),
    }),
    z.object({
      type: z.literal("torus"),
      radius: num(0.005, M, 0.5, "Ring radius, centre to tube centre (ring lies in local XY plane)"),
      tube: num(0.002, M, 0.1, "Tube radius"),
      arcDegrees: num(1, 360, 360, "Sweep of the ring in degrees, 360 for a full ring"),
    }),
    z.object({
      type: z.literal("lathe"),
      profile: points2(
        LIMITS.profilePoints,
        -M,
        M,
        "Silhouette revolved around local Y: [[radius, y], ...] bottom to top, radius >= 0. 4-24 points.",
      ),
    }),
    z.object({
      type: z.literal("extrude"),
      outline: points2(
        LIMITS.outlinePoints,
        -M,
        M,
        "Closed 2D outline in local XY: [[x, y], ...], 3-32 points, counter-clockwise.",
      ),
      depth: num(0.002, M, 0.2, "Extrusion depth along local Z (centred)"),
      bevel: num(0, 0.5, 0.02, "Edge bevel size"),
    }),
    z.object({
      type: z.literal("tube"),
      path: points3(LIMITS.pathPoints, "Smooth curve through these points: [[x, y, z], ...], 2-16 points."),
      radius: num(0.002, M, 0.05, "Tube radius"),
      closed: z.boolean().describe("Close the curve into a loop"),
    }),
  ])
  .describe("Primitive. No CSG: build complex forms by combining parts.");

export type Shape = z.output<typeof ShapeSchema>;
export type ShapeType = Shape["type"];
export const SHAPE_TYPES: ShapeType[] = ["sphere", "box", "cylinder", "cone", "capsule", "torus", "lathe", "extrude", "tube"];

// ---------------------------------------------------------------------------
// spec
// ---------------------------------------------------------------------------

export const MaterialSchema = z.object({
  id: id("Unique material id, e.g. 'body', 'cap-red'"),
  name: text(40, "Human name for the material"),
  color: hex("#cccccc", "Base colour, #rrggbb"),
  roughness: num(0, 1, 0.6, "0 glossy .. 1 matte"),
  metalness: num(0, 1, 0, "0 dielectric .. 1 metal"),
  emissive: hex("#000000", "Glow colour, #000000 for none"),
  opacity: num(0.05, 1, 1, "1 opaque .. 0.05 nearly invisible"),
});
export type MaterialSpec = z.output<typeof MaterialSchema>;

const transformFields = {
  position: vec3(-M, M, 0, "[x, y, z] relative to the parent's pivot (or the world origin for root parts). Y is up, ground at y = 0, subject faces +Z."),
  rotation: vec3(-720, 720, 0, "[x, y, z] Euler rotation in degrees, XYZ order"),
  scale: vec3(0.01, 50, 1, "[x, y, z] scale of this part only (children are not scaled)"),
};

export const PartSchema = z.object({
  id: id("Unique part id, kebab-case, e.g. 'left-ear'"),
  name: text(60, "Human name"),
  parentId: z
    .string()
    .describe("Id of the parent part (its pivot moves and rotates this part), or '' for a root part")
    .transform((s) => s.trim()),
  shape: ShapeSchema,
  ...transformFields,
  materialId: z.string().describe("Id of a material in materials[]").transform((s) => s.trim()),
  mirrorX: z.boolean().describe("Also create a copy mirrored across the X = 0 plane (eyes, arms, legs)."),
});
export type PartSpec = z.output<typeof PartSchema>;

export const CustomPartSchema = z.object({
  id: id("Unique id"),
  name: text(60, "Human name"),
  description: text(240, "What this geometry is and why the primitives can't express it"),
  code: z
    .string()
    .describe(
      "Body of a JavaScript function (THREE, params) => BufferGeometry, run in a sandboxed worker. Only THREE math/geometry classes, no DOM, no network, no loops over 20k iterations.",
    )
    .transform((s) => s.slice(0, LIMITS.codeChars)),
  parentId: z.string().describe("Parent part id or ''").transform((s) => s.trim()),
  ...transformFields,
  materialId: z.string().describe("Id of a material in materials[]").transform((s) => s.trim()),
});
export type CustomPartSpec = z.output<typeof CustomPartSchema>;

export const SpecSchema = z.object({
  title: text(60, "Short title, e.g. 'Toadstool in a pot'"),
  summary: text(400, "One or two sentences describing the subject and the modelling approach"),
  subjectKind: z.enum(SUBJECT_KINDS).describe("Broad category of the subject"),
  tags: z
    .array(z.string())
    .describe("3-6 lowercase search tags")
    .transform((t) => [...new Set(t.map((s) => s.trim().toLowerCase().slice(0, 24)).filter(Boolean))].slice(0, LIMITS.tags)),
  style: z.enum(STYLES).describe("Rendering style: echo the requested style"),
  materials: z.array(MaterialSchema).describe("2-10 materials").transform((m) => m.slice(0, LIMITS.materials)),
  parts: z.array(PartSchema).describe("All parts, parents before children. 3-40 parts.").transform((p) => p.slice(0, LIMITS.parts)),
  pose: z.object({
    description: text(200, "The pose or gesture, e.g. 'head tilted left, right arm waving'"),
    adjustments: z
      .array(
        z.object({
          partId: z.string().describe("Part whose pivot to rotate").transform((s) => s.trim()),
          rotation: vec3(-180, 180, 0, "[x, y, z] extra rotation in degrees applied on top of the part's rotation"),
        }),
      )
      .describe("Pose tweaks layered on the rest pose; [] if none")
      .transform((a) => a.slice(0, LIMITS.parts)),
  }),
  camera: z.object({
    position: vec3(-60, 60, 0, "[x, y, z] camera position, matching the framing of the source image"),
    target: vec3(-M, M, 0, "[x, y, z] point the camera looks at"),
    fov: num(10, 80, 35, "Vertical field of view in degrees"),
  }),
  lighting: z.object({
    preset: z.enum(LIGHTING_PRESETS).describe("Light rig"),
    keyColor: hex("#ffffff", "Key light colour"),
    intensity: num(0.2, 3, 1, "Overall light multiplier, 1 is neutral"),
  }),
  background: hex("#efece6", "Backdrop colour, #rrggbb"),
  // Not offered to the model (stripped from the JSON schema unless the dev flag is on) and
  // always emptied by repairSpec in the public build.
  customParts: z.array(CustomPartSchema).describe("Dev only. Always [].").optional().default([]),
  notes: text(600, "Assumptions about hidden sides and simplifications made"),
});

export type Spec = z.output<typeof SpecSchema>;
export type SpecInput = z.input<typeof SpecSchema>;

// ---------------------------------------------------------------------------
// refinement + judging outputs
// ---------------------------------------------------------------------------

export const RefineSchema = z.object({
  score: num(0, 10, 0, "How well the CURRENT render matches the source, 0-10 (10 = the same subject, proportions, colours and pose)"),
  critique: text(800, "The most important differences between the render and the source, most important first"),
  changes: z
    .array(z.string())
    .describe("The concrete edits made in the revised spec, 1-8 short items")
    .transform((c) => c.map((s) => s.trim().slice(0, 160)).filter(Boolean).slice(0, 8)),
  spec: SpecSchema,
});
export type RefineResult = z.output<typeof RefineSchema>;

export const JudgeSchema = z.object({
  score: num(0, 10, 0, "How well the render matches the source, 0-10"),
  critique: text(600, "The most important remaining differences"),
});
export type JudgeResult = z.output<typeof JudgeSchema>;

// ---------------------------------------------------------------------------
// semantic validation (beyond shape): returns warnings, repairs what it can,
// throws SpecError only when the result would be unbuildable.
// ---------------------------------------------------------------------------

export class SpecError extends Error {
  constructor(message: string, readonly issues: string[] = []) {
    super(message);
    this.name = "SpecError";
  }
}

export interface ParsedSpec {
  spec: Spec;
  warnings: string[];
}

function formatZodIssues(err: z.ZodError): string[] {
  return err.issues.slice(0, 12).map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`);
}

/** Parse untrusted JSON (a string or an object) into a buildable spec. */
export function parseSpec(input: unknown, opts: { style?: Style } = {}): ParsedSpec {
  const raw = typeof input === "string" ? safeJson(input) : input;
  const res = SpecSchema.safeParse(raw);
  if (!res.success) throw new SpecError("The spec did not match the schema", formatZodIssues(res.error));
  return repairSpec(res.data, opts);
}

export function parseRefine(input: unknown, opts: { style?: Style } = {}) {
  const raw = typeof input === "string" ? safeJson(input) : input;
  const res = RefineSchema.safeParse(raw);
  if (!res.success) throw new SpecError("The refinement did not match the schema", formatZodIssues(res.error));
  const { spec, warnings } = repairSpec(res.data.spec, opts);
  return { result: { ...res.data, spec }, warnings };
}

export function parseJudge(input: unknown): JudgeResult {
  const raw = typeof input === "string" ? safeJson(input) : input;
  const res = JudgeSchema.safeParse(raw);
  if (!res.success) throw new SpecError("The judgement did not match the schema", formatZodIssues(res.error));
  return res.data;
}

function safeJson(s: string): unknown {
  try {
    return JSON.parse(s);
  } catch {
    throw new SpecError("The response was not valid JSON", [s.slice(0, 120)]);
  }
}

export function repairSpec(input: Spec, opts: { style?: Style } = {}): ParsedSpec {
  const spec: Spec = structuredClone(input);
  const warnings: string[] = [];
  if (opts.style) spec.style = opts.style;

  // materials: unique ids, at least one
  const matIds = new Set<string>();
  spec.materials = spec.materials.filter((m) => {
    if (matIds.has(m.id)) {
      warnings.push(`Duplicate material id '${m.id}' dropped`);
      return false;
    }
    matIds.add(m.id);
    return true;
  });
  if (spec.materials.length === 0) {
    spec.materials.push({ id: "default", name: "Default", color: "#cccccc", roughness: 0.6, metalness: 0, emissive: "#000000", opacity: 1 });
    matIds.add("default");
    warnings.push("No materials: added a neutral default");
  }
  const fallbackMat = spec.materials[0].id;

  // parts: unique ids, valid materials, parents that exist and come first, no cycles
  const seen = new Set<string>();
  const parts: Spec["parts"] = [];
  for (const p of spec.parts) {
    let pid = p.id;
    let n = 2;
    while (seen.has(pid)) pid = `${p.id}-${n++}`;
    if (pid !== p.id) warnings.push(`Duplicate part id '${p.id}' renamed to '${pid}'`);
    p.id = pid;
    seen.add(pid);
    if (!matIds.has(p.materialId)) {
      warnings.push(`Part '${p.id}' used unknown material '${p.materialId}'`);
      p.materialId = fallbackMat;
    }
    const shapeIssue = shapeProblem(p.shape);
    if (shapeIssue) {
      warnings.push(`Part '${p.id}' dropped: ${shapeIssue}`);
      seen.delete(pid);
      continue;
    }
    parts.push(p);
  }
  // parents must reference an earlier part; otherwise re-root
  const order = new Map(parts.map((p, i) => [p.id, i]));
  for (const [i, p] of parts.entries()) {
    if (p.parentId && !(order.has(p.parentId) && order.get(p.parentId)! < i)) {
      if (p.parentId === p.id || !order.has(p.parentId)) {
        warnings.push(`Part '${p.id}' had missing parent '${p.parentId}': made a root part`);
        p.parentId = "";
      } else {
        // parent exists but later: still buildable, the builder resolves in two passes
      }
    }
  }
  breakCycles(parts, warnings);
  spec.parts = parts;

  // custom parts: model-written code is dropped unless the dev flag is on
  if (!customPartsAllowed()) {
    if (spec.customParts.length) warnings.push(`Dropped ${spec.customParts.length} custom part(s): model-written code is not run in this build`);
    spec.customParts = [];
  } else spec.customParts = spec.customParts.slice(0, MAX_DEV_CUSTOM_PARTS);
  const customIds = new Set<string>();
  spec.customParts = spec.customParts.filter((c) => {
    if (customIds.has(c.id) || seen.has(c.id)) {
      warnings.push(`Custom part '${c.id}' has a duplicate id and was dropped`);
      return false;
    }
    if (!c.code.trim()) {
      warnings.push(`Custom part '${c.id}' has no code and was dropped`);
      return false;
    }
    customIds.add(c.id);
    if (!matIds.has(c.materialId)) c.materialId = fallbackMat;
    if (c.parentId && !seen.has(c.parentId)) c.parentId = "";
    return true;
  });

  if (spec.parts.length + spec.customParts.length === 0) {
    throw new SpecError("The spec has no buildable parts");
  }

  spec.pose.adjustments = spec.pose.adjustments.filter((a) => seen.has(a.partId));
  return { spec, warnings };
}

function shapeProblem(s: Shape): string | null {
  switch (s.type) {
    case "lathe":
      return s.profile.length < 2 ? "lathe needs at least 2 profile points" : null;
    case "extrude":
      return s.outline.length < 3 ? "extrude needs at least 3 outline points" : null;
    case "tube":
      return s.path.length < 2 ? "tube needs at least 2 path points" : null;
    default:
      return null;
  }
}

function breakCycles(parts: Spec["parts"], warnings: string[]) {
  const byId = new Map(parts.map((p) => [p.id, p]));
  for (const p of parts) {
    const visited = new Set<string>([p.id]);
    let cur = p.parentId;
    while (cur) {
      if (visited.has(cur)) {
        warnings.push(`Parent cycle at '${p.id}': made a root part`);
        p.parentId = "";
        break;
      }
      visited.add(cur);
      cur = byId.get(cur)?.parentId ?? "";
    }
  }
}

// ---------------------------------------------------------------------------
// JSON Schema for structured outputs
// ---------------------------------------------------------------------------

const UNSUPPORTED_KEYS = ["minimum", "maximum", "exclusiveMinimum", "exclusiveMaximum", "multipleOf", "minLength", "maxLength", "pattern", "minItems", "maxItems", "$schema", "default"];

/**
 * Structured outputs need: every object `additionalProperties: false` and every
 * property listed in `required`; no numeric/string/array constraints; anyOf
 * rather than oneOf. zod emits a close superset, so normalise it here. A unit
 * test walks the result to keep this honest.
 */
export function toStructuredOutputSchema(schema: z.ZodType): Record<string, unknown> {
  const json = z.toJSONSchema(schema, { io: "input", target: "draft-2020-12", unrepresentable: "any" }) as Record<string, unknown>;
  if (!customPartsAllowed()) dropCustomParts(json);
  return walk(json) as Record<string, unknown>;

  function walk(node: unknown): unknown {
    if (Array.isArray(node)) return node.map(walk);
    if (!node || typeof node !== "object") return node;
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(node)) {
      if (UNSUPPORTED_KEYS.includes(k)) continue;
      if (k === "oneOf") {
        out.anyOf = walk(v);
        continue;
      }
      out[k] = walk(v);
    }
    if (out.type === "object" && out.properties && typeof out.properties === "object") {
      out.additionalProperties = false;
      out.required = Object.keys(out.properties as object);
    }
    return out;
  }
}

export const SPEC_JSON_SCHEMA = toStructuredOutputSchema(SpecSchema);
export const REFINE_JSON_SCHEMA = toStructuredOutputSchema(RefineSchema);
export const JUDGE_JSON_SCHEMA = toStructuredOutputSchema(JudgeSchema);

/** Removes `customParts` from every object schema, including $defs, so the model is never offered it. */
function dropCustomParts(node: unknown): void {
  if (Array.isArray(node)) return node.forEach(dropCustomParts);
  if (!node || typeof node !== "object") return;
  const o = node as Record<string, unknown>;
  const props = o.properties as Record<string, unknown> | undefined;
  if (props && "customParts" in props) {
    delete props.customParts;
    if (Array.isArray(o.required)) o.required = o.required.filter((k) => k !== "customParts");
  }
  for (const v of Object.values(o)) dropCustomParts(v);
}
