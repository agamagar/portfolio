import * as THREE from "three";
import { describe, expect, it } from "vitest";
import { JUDGE_JSON_SCHEMA, parseRefine, parseSpec, REFINE_JSON_SCHEMA, SPEC_JSON_SCHEMA, SpecError } from "../shared/spec";
import { checkSnippet, deserialize, runSnippet } from "../src/three/snippet";
import { fixtureAnswer, fixtureSpec, miniSpec, p } from "./helpers";

describe("parseSpec", () => {
  it("accepts every fixture answer", () => {
    for (const name of ["create.toadstool.json", "refine.toadstool.1.json", "refine.toadstool.2.json", "create.robot.json", "refine.robot.1.json"]) {
      const { result, warnings } = parseRefine(fixtureAnswer(name));
      expect(warnings.filter((w) => !/custom part/.test(w))).toEqual([]);
      expect(result.spec.parts.length).toBeGreaterThan(5);
    }
  });

  it("clamps out-of-range numbers instead of failing", () => {
    const raw = miniSpec([p("a", { type: "sphere", radius: 9999 }, { position: [1e9, -5, 3] })]);
    raw.camera.fov = 500;
    raw.materials[0].roughness = 7;
    const { spec } = parseSpec(raw);
    expect(spec.parts[0].shape).toEqual({ type: "sphere", radius: 20 });
    expect(spec.parts[0].position).toEqual([20, -5, 3]);
    expect(spec.camera.fov).toBe(80);
    expect(spec.materials[0].roughness).toBe(1);
  });

  it("pads short vectors and normalises colours", () => {
    const raw = miniSpec([p("a", { type: "box", size: [1] as unknown as [number, number, number], bevel: 0 })]);
    raw.materials[0].color = "F80";
    raw.background = "not a colour";
    const { spec } = parseSpec(raw);
    expect((spec.parts[0].shape as { size: number[] }).size).toEqual([1, 1, 1]);
    expect(spec.materials[0].color).toBe("#ff8800");
    expect(spec.background).toBe("#efece6");
  });

  it("repairs duplicate ids, unknown materials, missing parents and cycles with warnings", () => {
    const raw = miniSpec([
      p("a", { type: "sphere", radius: 1 }, { materialId: "nope" }),
      p("a", { type: "sphere", radius: 1 }),
      p("b", { type: "sphere", radius: 1 }, { parentId: "ghost" }),
      p("c", { type: "sphere", radius: 1 }, { parentId: "d" }),
      p("d", { type: "sphere", radius: 1 }, { parentId: "c" }),
    ]);
    const { spec, warnings } = parseSpec(raw);
    expect(spec.parts.map((x) => x.id)).toEqual(["a", "a-2", "b", "c", "d"]);
    expect(spec.parts[0].materialId).toBe("m");
    expect(spec.parts[2].parentId).toBe("");
    expect(spec.parts.filter((x) => x.parentId === "").length).toBeGreaterThanOrEqual(3);
    expect(warnings.join("\n")).toMatch(/Duplicate part id/);
    expect(warnings.join("\n")).toMatch(/unknown material/);
    expect(warnings.join("\n")).toMatch(/missing parent/);
    expect(warnings.join("\n")).toMatch(/cycle/i);
  });

  it("drops degenerate shapes and rejects a spec with nothing left", () => {
    const raw = miniSpec([p("a", { type: "lathe", profile: [[0, 0]] })]);
    expect(() => parseSpec(raw)).toThrow(SpecError);
  });

  it("rejects structurally wrong input with readable issues", () => {
    try {
      parseSpec({ title: "x", parts: "nope" });
      throw new Error("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(SpecError);
      expect((err as SpecError).issues.length).toBeGreaterThan(0);
    }
    expect(() => parseSpec("{not json")).toThrow(/not valid JSON/);
  });

  it("forces the requested style", () => {
    expect(parseSpec(fixtureSpec("create.robot.json"), { style: "felt" }).spec.style).toBe("felt");
  });
});

describe("structured output schema", () => {
  const UNSUPPORTED = ["minimum", "maximum", "minLength", "maxLength", "minItems", "maxItems", "pattern", "oneOf", "$schema", "default"];
  function walk(node: unknown, path: string, issues: string[]) {
    if (Array.isArray(node)) return node.forEach((n, i) => walk(n, `${path}[${i}]`, issues));
    if (!node || typeof node !== "object") return;
    const o = node as Record<string, unknown>;
    for (const k of UNSUPPORTED) if (k in o) issues.push(`${path}: has ${k}`);
    if (o.type === "object") {
      if (o.additionalProperties !== false) issues.push(`${path}: additionalProperties must be false`);
      const props = Object.keys((o.properties as object) ?? {});
      const req = (o.required as string[]) ?? [];
      if (props.some((k) => !req.includes(k))) issues.push(`${path}: not every property is required`);
    }
    for (const [k, v] of Object.entries(o)) walk(v, `${path}.${k}`, issues);
  }

  for (const [name, schema] of Object.entries({ SPEC_JSON_SCHEMA, REFINE_JSON_SCHEMA, JUDGE_JSON_SCHEMA })) {
    it(`${name} only uses keywords structured outputs support`, () => {
      const issues: string[] = [];
      walk(schema, "$", issues);
      expect(issues).toEqual([]);
      expect(JSON.stringify(schema)).not.toMatch(/"\$ref"/); // no recursion
    });
  }

  it("lists all nine primitives as anyOf branches", () => {
    const parts = (REFINE_JSON_SCHEMA as any).properties.spec.properties.parts.items.properties.shape;
    expect(parts.anyOf.map((b: any) => b.properties.type.const).sort()).toEqual(["box", "capsule", "cone", "cylinder", "extrude", "lathe", "sphere", "torus", "tube"]);
  });
});

describe("sandboxed snippets", () => {
  const GEAR = fixtureSpec("create.robot.json").customParts[0].code;

  it("runs the fixture gear snippet and returns serialisable geometry", () => {
    const out = runSnippet(THREE, GEAR);
    expect(out.position.length).toBeGreaterThan(100);
    expect(out.position.length % 3).toBe(0);
    const g = deserialize(THREE, out);
    expect(g.getAttribute("normal").count).toBe(g.getAttribute("position").count);
  });

  it.each([
    ["fetch('https://evil.example')", /fetch/],
    ["return self.postMessage(1)", /self/],
    ["const f = (() => {}).constructor; return f('return 1')()", /constructor/],
    ["return globalThis", /globalThis/],
    ["return THREE['con' + 'structor']", /constructor|computed/],
    ["return THREE[`x`]", /computed/],
    ["import('x')", /import/],
    ["eval('1')", /eval/],
    ["while(true){}", /return/],
  ])("rejects %s", (code, reason) => {
    expect(checkSnippet(code)).toMatch(reason);
  });

  it("rejects snippets that return something other than geometry", () => {
    expect(() => runSnippet(THREE, "return 42;")).toThrow(/BufferGeometry/);
  });

  it("rejects runaway geometry", () => {
    expect(() => runSnippet(THREE, "return new THREE.SphereGeometry(1, 600, 600);")).toThrow(/vertices/);
  });

  it("rejects geometry with coordinates far outside the model", () => {
    expect(() => runSnippet(THREE, "const g = new THREE.BoxGeometry(1,1,1); g.translate(1000,0,0); return g;")).toThrow(/range/);
  });
});

describe("model-written code is off in the public build", () => {
  it("LIMITS.customParts is 0 and customParts is not in the schema offered to Claude", async () => {
    const { LIMITS, SPEC_JSON_SCHEMA, REFINE_JSON_SCHEMA } = await import("../shared/spec");
    expect(LIMITS.customParts).toBe(0);
    expect(JSON.stringify(SPEC_JSON_SCHEMA)).not.toMatch(/customParts|BufferGeometry/);
    expect(JSON.stringify(REFINE_JSON_SCHEMA)).not.toMatch(/customParts/);
  });

  it("the prompt no longer asks for code", async () => {
    const { SYSTEM_PROMPT } = await import("../server/prompts");
    expect(String(SYSTEM_PROMPT)).not.toMatch(/customParts|BufferGeometry/);
  });

  it("parseSpec drops customParts a model wrote anyway, with a warning", async () => {
    const { parseSpec } = await import("../shared/spec");
    const raw = fixtureAnswer("create.robot.json").spec;
    expect(raw.customParts.length).toBeGreaterThan(0);
    const { spec, warnings } = parseSpec(raw);
    expect(spec.customParts).toEqual([]);
    expect(warnings.join(" ")).toMatch(/model-written code is not run/);
  });
});
