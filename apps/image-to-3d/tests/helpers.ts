import { readFileSync } from "node:fs";
import path from "node:path";
import type { BetaMessage } from "@anthropic-ai/sdk/resources/beta/messages/messages";
import type { RefineResult, Spec } from "../shared/spec";

export const FIXTURES = path.resolve(__dirname, "../fixtures/anthropic");
export const IMAGES = path.resolve(__dirname, "../fixtures/images");

export function fixtureMessage(name: string): BetaMessage {
  return JSON.parse(readFileSync(path.join(FIXTURES, name), "utf8")) as BetaMessage;
}

export function fixtureAnswer(name: string): RefineResult {
  const msg = fixtureMessage(name);
  const text = msg.content.find((b) => b.type === "text");
  return JSON.parse(text && text.type === "text" ? text.text : "{}");
}

export function fixtureSpec(name: string): Spec {
  return fixtureAnswer(name).spec;
}

/** A minimal valid spec for focused builder tests. */
export function miniSpec(parts: Spec["parts"], extra: Partial<Spec> = {}): Spec {
  return {
    title: "Test",
    summary: "",
    subjectKind: "object",
    tags: [],
    style: "clay",
    materials: [{ id: "m", name: "M", color: "#ff0000", roughness: 0.5, metalness: 0, emissive: "#000000", opacity: 1 }],
    parts,
    pose: { description: "", adjustments: [] },
    camera: { position: [2, 2, 4], target: [0, 1, 0], fov: 35 },
    lighting: { preset: "studio", keyColor: "#ffffff", intensity: 1 },
    background: "#eeeeee",
    customParts: [],
    notes: "",
    ...extra,
  };
}

export function p(id: string, shape: Spec["parts"][number]["shape"], extra: Partial<Spec["parts"][number]> = {}): Spec["parts"][number] {
  return {
    id,
    name: id,
    parentId: "",
    shape,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    materialId: "m",
    mirrorX: false,
    ...extra,
  };
}
