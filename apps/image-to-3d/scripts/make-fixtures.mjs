/**
 * Writes fixtures/anthropic/*.json: real-shaped Messages API responses
 * (thinking + text blocks, stop_reason, usage) whose text is the structured
 * JSON answer. Specs are authored here as data so the refinement story
 * (v0 with flaws → v1 fixed → v2 polished) is easy to read and edit.
 *
 *   node scripts/make-fixtures.mjs
 */
import { writeFileSync, mkdirSync } from "node:fs";
import * as THREE from "three";

const OUT = new URL("../fixtures/anthropic/", import.meta.url);
mkdirSync(OUT, { recursive: true });

const clone = (o) => JSON.parse(JSON.stringify(o));
const part = (id, name, shape, position, opts = {}) => ({
  id,
  name,
  parentId: opts.parentId ?? "",
  shape,
  position,
  rotation: opts.rotation ?? [0, 0, 0],
  scale: opts.scale ?? [1, 1, 1],
  materialId: opts.materialId,
  mirrorX: opts.mirrorX ?? false,
});
const mat = (id, name, color, roughness = 0.7, extra = {}) => ({
  id,
  name,
  color,
  roughness,
  metalness: extra.metalness ?? 0,
  emissive: extra.emissive ?? "#000000",
  opacity: extra.opacity ?? 1,
});

/**
 * A point on a lathe surface: t is a fractional index along the profile,
 * angle is degrees around Y (0 = +Z, the front). Returns the position and the
 * Euler rotation (degrees) that points a flattened sphere's local Y along the
 * surface normal, so spots sit on the cap instead of inside it.
 */
function onLathe(profile, t, angleDeg, lift = 0.01) {
  const i = Math.min(profile.length - 2, Math.floor(t));
  const f = t - i;
  const [r0, y0] = profile[i];
  const [r1, y1] = profile[i + 1];
  const r = r0 + (r1 - r0) * f;
  const y = y0 + (y1 - y0) * f;
  // outward normal in the (radial, y) plane: rotate the tangent by -90°
  const n2 = new THREE.Vector2(y1 - y0, -(r1 - r0)).normalize();
  const a = (angleDeg * Math.PI) / 180;
  const radial = new THREE.Vector3(Math.sin(a), 0, Math.cos(a));
  const normal = radial.clone().multiplyScalar(n2.x).add(new THREE.Vector3(0, n2.y, 0)).normalize();
  const pos = radial.multiplyScalar(r).add(new THREE.Vector3(0, y, 0)).addScaledVector(normal, lift);
  const e = new THREE.Euler().setFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal));
  const deg = (v) => Math.round((v * 180) / Math.PI * 10) / 10;
  const round = (v) => Math.round(v * 1000) / 1000;
  return { position: [round(pos.x), round(pos.y), round(pos.z)], rotation: [deg(e.x), deg(e.y), deg(e.z)] };
}

const spot = (id, name, profile, t, angle, radius, mirrorX = false) => {
  const { position, rotation } = onLathe(profile, t, angle);
  return part(id, name, { type: "sphere", radius }, position, { parentId: "cap", materialId: "spot", rotation, scale: [1, 0.28, 1], mirrorX });
};

// ---------------------------------------------------------------------------
// toadstool in a terracotta pot
// ---------------------------------------------------------------------------

const CAP_V1 = [[0, 0], [0.74, 0], [0.82, 0.07], [0.79, 0.24], [0.64, 0.46], [0.4, 0.61], [0, 0.67]];
const CAP_V0 = [[0, 0], [0.6, 0], [0.66, 0.05], [0.6, 0.18], [0.44, 0.32], [0.24, 0.4], [0, 0.42]];

const toadstoolV1 = {
  title: "Toadstool in a pot",
  summary:
    "A cheerful red-capped toadstool with white spots and a sleepy little face, growing from a terracotta pot with a sprout and grass tufts. Lathe forms for the pot, stem and cap; flattened spheres for the spots.",
  subjectKind: "plant",
  tags: ["mushroom", "toadstool", "plant", "pot", "cute"],
  style: "clay",
  materials: [
    mat("terracotta", "Terracotta", "#c8653a", 0.85),
    mat("terracotta-dark", "Terracotta rim", "#b0532c", 0.85),
    mat("soil", "Soil", "#4b3326", 1),
    mat("stem", "Stem cream", "#f2e6cd", 0.75),
    mat("gills", "Gills", "#e6d2ad", 0.8),
    mat("cap", "Cap red", "#d93a2b", 0.55),
    mat("spot", "Spots", "#fbf5ea", 0.6),
    mat("ink", "Eyes", "#2a211d", 0.4),
    mat("blush", "Cheeks", "#f29a8e", 0.8),
    mat("leaf", "Leaf green", "#6daa45", 0.7),
  ],
  parts: [
    part("pot", "Pot", { type: "lathe", profile: [[0, 0], [0.52, 0], [0.57, 0.04], [0.7, 0.62], [0, 0.62]] }, [0, 0, 0], { materialId: "terracotta" }),
    part("pot-rim", "Pot rim", { type: "cylinder", radiusTop: 0.8, radiusBottom: 0.77, height: 0.17 }, [0, 0.68, 0], { materialId: "terracotta-dark" }),
    part("soil", "Soil", { type: "cylinder", radiusTop: 0.72, radiusBottom: 0.72, height: 0.04 }, [0, 0.76, 0], { materialId: "soil" }),
    part(
      "stem",
      "Stem",
      { type: "lathe", profile: [[0, 0], [0.27, 0], [0.31, 0.18], [0.29, 0.45], [0.23, 0.72], [0.21, 0.8], [0, 0.8]] },
      [0, 0.76, 0],
      { materialId: "stem" },
    ),
    part(
      "cap",
      "Cap",
      { type: "lathe", profile: CAP_V1 },
      [0, 0.74, 0],
      { parentId: "stem", materialId: "cap" },
    ),
    part("gills", "Gills", { type: "cylinder", radiusTop: 0.74, radiusBottom: 0.3, height: 0.08 }, [0, -0.03, 0], { parentId: "cap", materialId: "gills" }),
    spot("spot-top", "Top spot", CAP_V1, 5.55, 0, 0.14),
    spot("spot-front", "Front spot", CAP_V1, 4.3, 0, 0.12),
    spot("spot-side", "Side spot", CAP_V1, 4.1, 62, 0.11, true),
    spot("spot-back", "Back spot", CAP_V1, 4.4, 140, 0.12, true),
    spot("spot-rim", "Rim spot", CAP_V1, 2.5, 95, 0.08, true),
    part("eye", "Eye", { type: "capsule", radius: 0.03, length: 0.035 }, [0.085, 0.42, 0.28], { parentId: "stem", materialId: "ink", rotation: [-8, 16, 0], mirrorX: true }),
    part("cheek", "Cheek", { type: "sphere", radius: 0.05 }, [0.16, 0.34, 0.245], { parentId: "stem", materialId: "blush", scale: [1, 0.6, 0.45], rotation: [0, 35, 0], mirrorX: true }),
    part("sprout-stem", "Sprout stem", { type: "tube", path: [[0, 0, 0], [0.03, 0.14, 0], [-0.02, 0.26, 0]], radius: 0.018, closed: false }, [-0.5, 0.78, -0.25], {
      materialId: "leaf",
    }),
    part(
      "sprout-leaf",
      "Sprout leaf",
      { type: "extrude", outline: [[0, 0], [0.07, 0.03], [0.13, 0.1], [0.08, 0.12], [0.02, 0.07]], depth: 0.012, bevel: 0.006 },
      [-0.02, 0.26, 0],
      { parentId: "sprout-stem", materialId: "leaf", rotation: [0, 20, 15], mirrorX: true },
    ),
    part("grass", "Grass tuft", { type: "extrude", outline: [[0, 0], [0.05, 0], [0.03, 0.22], [0.01, 0.24]], depth: 0.02, bevel: 0.005 }, [0.48, 0.76, 0.32], {
      materialId: "leaf",
      rotation: [0, 30, -12],
      mirrorX: true,
    }),
    part("grass-2", "Grass tuft", { type: "extrude", outline: [[0, 0], [0.04, 0], [0.025, 0.17], [0.008, 0.18]], depth: 0.02, bevel: 0.005 }, [0.36, 0.76, 0.45], {
      materialId: "leaf",
      rotation: [0, -20, 10],
      mirrorX: true,
    }),
  ],
  pose: { description: "Standing upright, cap tilted a touch towards the viewer", adjustments: [{ partId: "cap", rotation: [6, 0, -4] }] },
  camera: { position: [2.4, 2.25, 4.3], target: [0, 1.05, 0], fov: 32 },
  lighting: { preset: "studio", keyColor: "#fff3e3", intensity: 1 },
  background: "#f2e8dc",
  customParts: [],
  notes: "The back of the pot and cap are assumed symmetric. The face is inferred from the sketch's two dots; cheeks added for the illustrated look.",
};

// v0: first pass. Cap too small and flat, too few spots, no cheeks, camera too low.
const toadstoolV0 = clone(toadstoolV1);
toadstoolV0.parts = toadstoolV0.parts.filter((p) => !["cheek", "spot-rim", "spot-back", "grass-2"].includes(p.id));
toadstoolV0.parts.find((p) => p.id === "cap").shape.profile = CAP_V0;
toadstoolV0.parts.find((p) => p.id === "gills").shape.radiusTop = 0.6;
for (const [id, t, angle, r] of [
  ["spot-top", 5.55, 0, 0.12],
  ["spot-front", 4.3, 0, 0.1],
  ["spot-side", 4.1, 62, 0.1],
]) {
  const i = toadstoolV0.parts.findIndex((p) => p.id === id);
  toadstoolV0.parts[i] = { ...spot(id, toadstoolV0.parts[i].name, CAP_V0, t, angle, r, toadstoolV0.parts[i].mirrorX) };
}
toadstoolV0.materials.find((m) => m.id === "terracotta").color = "#b8774f";
toadstoolV0.camera = { position: [3.2, 1.2, 4.2], target: [0, 0.9, 0], fov: 34 };
toadstoolV0.pose.adjustments = [];

// v2: polish. Slightly richer red, camera matched to the sketch.
const toadstoolV2 = clone(toadstoolV1);
toadstoolV2.materials.find((m) => m.id === "cap").color = "#d6322a";
toadstoolV2.camera = { position: [2.2, 2.4, 4.4], target: [0, 1.05, 0], fov: 31 };

// ---------------------------------------------------------------------------
// toy robot (toon) with one sandboxed custom part: the gear on its back
// ---------------------------------------------------------------------------

const GEAR_CODE = `const teeth = 10, inner = 0.15, outer = 0.2;
const s = new THREE.Shape();
for (let i = 0; i < teeth * 2; i++) {
  const a = (i / (teeth * 2)) * Math.PI * 2;
  const r = i % 2 === 0 ? outer : inner;
  const x = Math.cos(a) * r, y = Math.sin(a) * r;
  if (i === 0) s.moveTo(x, y); else s.lineTo(x, y);
}
s.closePath();
const hole = new THREE.Path();
hole.absarc(0, 0, 0.05, 0, Math.PI * 2, true);
s.holes.push(hole);
const g = new THREE.ExtrudeGeometry(s, { depth: 0.05, bevelEnabled: false, curveSegments: 12 });
g.translate(0, 0, -0.025);
return g;`;

const robotV1 = {
  title: "Toy robot",
  summary: "A chunky wind-up toy robot: rounded box body and head, glowing round eyes, a heart panel, capsule arms and a wind-up gear on its back.",
  subjectKind: "character",
  tags: ["robot", "toy", "character", "retro"],
  style: "toon",
  materials: [
    mat("shell", "Shell teal", "#4fb3b0", 0.5),
    mat("shell-dark", "Shell shade", "#2f7f7d", 0.55),
    mat("visor", "Visor", "#1d2833", 0.3),
    mat("eye", "Eye glow", "#bff6ff", 0.3, { emissive: "#5fd7ff" }),
    mat("heart", "Heart", "#ef4b5f", 0.5),
    mat("metal", "Metal", "#c9ccd1", 0.35, { metalness: 0.8 }),
    mat("cream", "Cream", "#f4ead6", 0.7),
  ],
  parts: [
    part("body", "Body", { type: "box", size: [1.0, 0.9, 0.7], bevel: 0.18 }, [0, 0.95, 0], { materialId: "shell" }),
    part("belt", "Belt", { type: "box", size: [1.04, 0.12, 0.74], bevel: 0.05 }, [0, -0.32, 0], { parentId: "body", materialId: "shell-dark" }),
    part("heart", "Heart panel", { type: "extrude", outline: [[0, -0.14], [0.15, 0.02], [0.13, 0.11], [0.07, 0.14], [0, 0.08], [-0.07, 0.14], [-0.13, 0.11], [-0.15, 0.02]], depth: 0.05, bevel: 0.015 }, [0, 0.05, 0.36], {
      parentId: "body",
      materialId: "heart",
    }),
    part("neck", "Neck", { type: "cylinder", radiusTop: 0.14, radiusBottom: 0.16, height: 0.14 }, [0, 0.5, 0], { parentId: "body", materialId: "metal" }),
    part("head", "Head", { type: "box", size: [0.86, 0.62, 0.62], bevel: 0.16 }, [0, 0.4, 0], { parentId: "neck", materialId: "shell" }),
    part("visor", "Visor", { type: "box", size: [0.68, 0.32, 0.06], bevel: 0.03 }, [0, 0.02, 0.3], { parentId: "head", materialId: "visor" }),
    part("eye", "Eye", { type: "cylinder", radiusTop: 0.075, radiusBottom: 0.075, height: 0.05 }, [0.16, 0.03, 0.335], { parentId: "head", materialId: "eye", rotation: [90, 0, 0], mirrorX: true }),
    part("ear", "Ear bolt", { type: "cylinder", radiusTop: 0.09, radiusBottom: 0.11, height: 0.1 }, [0.47, 0, 0], { parentId: "head", materialId: "metal", rotation: [0, 0, 90], mirrorX: true }),
    part("antenna", "Antenna", { type: "tube", path: [[0, 0, 0], [0.02, 0.14, 0], [0.08, 0.26, 0]], radius: 0.02, closed: false }, [0, 0.31, 0], { parentId: "head", materialId: "metal" }),
    part("antenna-tip", "Antenna tip", { type: "sphere", radius: 0.06 }, [0.08, 0.27, 0], { parentId: "antenna", materialId: "heart" }),
    part("shoulder-l", "Left shoulder", { type: "sphere", radius: 0.13 }, [0.56, 0.22, 0], { parentId: "body", materialId: "shell-dark" }),
    part("arm-l", "Left arm", { type: "capsule", radius: 0.09, length: 0.38 }, [0.04, -0.25, 0.02], { parentId: "shoulder-l", materialId: "shell", rotation: [0, 0, 10] }),
    part("hand-l", "Left claw", { type: "torus", radius: 0.08, tube: 0.035, arcDegrees: 250 }, [0, -0.3, 0], { parentId: "arm-l", materialId: "metal", rotation: [0, 90, -35] }),
    part("shoulder-r", "Right shoulder", { type: "sphere", radius: 0.13 }, [-0.56, 0.22, 0], { parentId: "body", materialId: "shell-dark" }),
    part("arm-r", "Right arm", { type: "capsule", radius: 0.09, length: 0.38 }, [-0.06, -0.25, 0.02], { parentId: "shoulder-r", materialId: "shell", rotation: [0, 0, -12] }),
    part("hand-r", "Right claw", { type: "torus", radius: 0.08, tube: 0.035, arcDegrees: 250 }, [0, -0.3, 0], { parentId: "arm-r", materialId: "metal", rotation: [0, 90, 35] }),
    part("leg", "Leg", { type: "cylinder", radiusTop: 0.12, radiusBottom: 0.13, height: 0.36 }, [0.24, -0.58, 0], { parentId: "body", materialId: "metal", mirrorX: true }),
    part("foot", "Foot", { type: "box", size: [0.3, 0.14, 0.42], bevel: 0.06 }, [0, -0.2, 0.05], { parentId: "leg", materialId: "shell-dark" }),
  ],
  pose: {
    description: "Standing, left arm raised in a wave, head tilted",
    adjustments: [
      { partId: "head", rotation: [0, 8, -6] },
      { partId: "shoulder-l", rotation: [0, 0, 150] },
    ],
  },
  camera: { position: [2.6, 2.1, 4.6], target: [0, 1.0, 0], fov: 32 },
  lighting: { preset: "soft", keyColor: "#ffffff", intensity: 1.05 },
  background: "#e5eef0",
  customParts: [
    {
      id: "gear",
      name: "Wind-up gear",
      description: "A toothed gear with a hole: needs a 2D path with holes, which the extrude primitive can't express.",
      code: GEAR_CODE,
      parentId: "body",
      position: [0, 0.05, -0.4],
      rotation: [0, 0, 0],
      scale: [1.4, 1.4, 1],
      materialId: "metal",
    },
  ],
  notes: "Back of the robot inferred; the gear is a guess from the wind-up key silhouette.",
};

const robotV0 = clone(robotV1);
robotV0.parts = robotV0.parts.filter((p) => !["hand-l", "hand-r", "belt", "ear"].includes(p.id));
robotV0.parts.find((p) => p.id === "head").shape.size = [0.7, 0.5, 0.55];
robotV0.parts.find((p) => p.id === "eye").shape = { type: "cylinder", radiusTop: 0.05, radiusBottom: 0.05, height: 0.05 };
robotV0.materials.find((m) => m.id === "shell").color = "#5aa6c9";
robotV0.pose.adjustments = [];

// ---------------------------------------------------------------------------

const THINK = {
  create:
    "The image shows {subject}. I'll block out the big masses first, keep proportions close to the reference, then add the details that carry the character. Choosing primitives: lathes for round silhouettes, extrudes for flat outlines, mirrored parts for paired features. Palette sampled and simplified.",
  refine:
    "Comparing the render with the source: the overall subject reads correctly, but proportions and a few details are off. Fixing the biggest differences first and keeping the part ids that already work.",
};

function message({ id, model, thinking, answer, usage }) {
  return {
    id,
    type: "message",
    role: "assistant",
    model,
    content: [
      { type: "thinking", thinking, signature: "EqQBCkYIBxgCKkDfixturesignatureNotReal" },
      { type: "text", text: JSON.stringify(answer), citations: null },
    ],
    stop_reason: "end_turn",
    stop_sequence: null,
    stop_details: null,
    container: null,
    context_management: null,
    usage: {
      input_tokens: usage.input,
      cache_creation_input_tokens: usage.cacheWrite ?? 0,
      cache_read_input_tokens: usage.cacheRead ?? 0,
      cache_creation: { ephemeral_5m_input_tokens: usage.cacheWrite ?? 0, ephemeral_1h_input_tokens: 0 },
      output_tokens: usage.output,
      server_tool_use: null,
      service_tier: "standard",
      inference_geo: "us",
    },
  };
}

function write(name, msg) {
  writeFileSync(new URL(name, OUT), JSON.stringify(msg, null, 2) + "\n");
  console.log("wrote", name);
}

// moderation pre-check (Haiku): one allow, one block
for (const [name, answer] of [
  ["allow", { verdict: "allow", category: "none", reason: "An everyday object." }],
  ["block", { verdict: "block", category: "weapon", reason: "It shows a realistic weapon." }],
]) {
  write(`moderate.${name}.json`, message({ id: `msg_01Fixture${name}ModerateImageTo3d`, model: "claude-haiku-5-5", thinking: "Checking the image against each rule.", answer, usage: { input: 1180, output: 96 } }));
}

let n = 0;
const msgId = () => `msg_01Fixture${String(++n).padStart(4, "0")}ImageTo3d`;

for (const [subject, label, v0, v1, v2, scores] of [
  ["toadstool", "a red-capped toadstool with white spots growing from a terracotta pot", toadstoolV0, toadstoolV1, toadstoolV2, [6.2, 8.4, 8.8]],
  ["robot", "a teal wind-up toy robot with glowing eyes and a heart panel", robotV0, robotV1, null, [6.8, 8.6]],
]) {
  write(
    `create.${subject}.json`,
    message({
      id: msgId(),
      model: "claude-opus-5-5",
      thinking: THINK.create.replace("{subject}", label),
      answer: { score: 0, critique: "", changes: [], spec: v0 },
      usage: { input: 1612, cacheWrite: 4318, output: 7420 },
    }),
  );
  write(
    `refine.${subject}.1.json`,
    message({
      id: msgId(),
      model: "claude-opus-5-5",
      thinking: THINK.refine,
      answer: {
        score: scores[0],
        critique:
          subject === "toadstool"
            ? "The cap is too small and flat compared with the source's big domed cap; the pot reads brown rather than terracotta; the face is missing its rosy cheeks; there are fewer spots than in the source; the camera is lower than the source's slightly-above view."
            : "The head is too small for the body; the shell is too blue; the eyes are smaller than the source's large round eyes; the left arm should be raised in a wave; the claws, ear bolts and belt are missing.",
        changes:
          subject === "toadstool"
            ? ["Enlarged and domed the cap profile", "Added back and rim spots", "Added cheeks", "Shifted the pot to a warmer terracotta", "Raised the camera and tilted the cap towards the viewer"]
            : ["Enlarged the head", "Shifted the shell to teal", "Enlarged the eyes", "Raised the left arm into a wave", "Added claws, ear bolts and a belt", "Tilted the head"],
        spec: v1,
      },
      usage: { input: 3940, cacheRead: 5730, output: 8150 },
    }),
  );
  if (v2) {
    write(
      `refine.${subject}.2.json`,
      message({
        id: msgId(),
        model: "claude-opus-5-5",
        thinking: THINK.refine,
        answer: {
          score: scores[1],
          critique: "Very close now. The cap red is slightly orange and the camera is a little to the right of the source's framing.",
          changes: ["Deepened the cap red", "Nudged the camera left and up"],
          spec: v2,
        },
        usage: { input: 4010, cacheRead: 5730, output: 6890 },
      }),
    );
  }
  write(
    `judge.${subject}.json`,
    message({
      id: msgId(),
      model: "claude-haiku-5-5",
      thinking: "Comparing silhouette, palette and pose.",
      answer: {
        score: scores[scores.length - 1],
        critique: subject === "toadstool" ? "Matches the source closely; small differences in spot placement." : "Matches the source closely; the arms hang a little lower than in the source.",
      },
      usage: { input: 2860, output: 412 },
    }),
  );
}
