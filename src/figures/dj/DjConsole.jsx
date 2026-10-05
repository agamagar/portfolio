// DjConsole (/dj + home hero) · an interactive DJ console rendered in Three.js.
//
// THREE RENDER STYLES for the SAME geometry, switched by a toggle:
//   · Realistic — soft matte "clay" (lo-fi retro): cream faceplate,
//     sage mixer, matte silver platters, lit by soft studio light + contact shadows.
//   · Cardboard — everything becomes kraft corrugated cardboard (papercraft).
//   · Blueprint — flat navy fills + glowing cyan edge lines on a grid (schematic).
// Only materials / background / lighting-mode swap; the geometry never changes.
// Every mesh is tagged with a `role`; applyStyle() repaints by role.
//
// Interaction: drag a platter to scratch, slide the crossfader/faders, twist the
// EQ knobs — all wired to a synthesized groove box (djAudio.js). The CRATE
// (djTracks.js) mixes between songs with a single click (loads the faded-down
// deck, then sweeps the crossfader). Two layouts via `variant` ("page"/"hero").
// All GPU/audio resources are torn down on unmount.

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
// three/addons/* is the documented alias for three/examples/jsm/* (same file).
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { useReducedMotion } from "../ds/hooks";
import DjAudio from "./djAudio";
import { TRACKS, trackByKey } from "./djTracks";
import { analyzeTrack, findBestTransitionPoint } from "./djAnalysis";
import "./djConsole.css";

// ---- realistic (lo-fi retro) palette ---------------------------------------
const CREAM = 0xcdbf9c;
const OLIVE = 0x8a966a;
const SILVER = 0xc7c2b4;
const VINYL = 0x211e1b;
const KNOB = 0x36302a;
const BTN = 0xe2d7bf;
const RED = 0xb4432e;
const WARM = 0xc1673a; // Deck A accent
const COOL = 0x4f9c93; // Deck B accent
const DECK_X = 2.55;

// ---- render styles ---------------------------------------------------------
const STYLE_LIST = [
  { key: "realistic", label: "Realistic" },
  { key: "cardboard", label: "Cardboard" },
  { key: "blueprint", label: "Blueprint" },
  { key: "technical", label: "Technical" },
  { key: "front", label: "Front" },
];
const BP_LINE = 0x7fd8ff; // blueprint cyan
const INK = 0x33291f; // technical-drawing ink (site design-system ink)
const ENG_PAPER = 0xe4dcc7; // drafting-paper background
const ENG_FILL = 0xece5d3; // hidden-line fill (a hair lighter than the paper)
// edgeColor/detail/gridEng/top are read by applyStyle; camera swaps to ortho top
// only for the technical plan view.
const STYLE_CFG = {
  realistic: { bg: 0xbfb9ad, fog: [0xbfb9ad, 12, 26], tone: THREE.ACESFilmicToneMapping, exposure: 1.0, floor: true, grid: false, gridEng: false, edges: false, edgeColor: BP_LINE, detail: false, top: false, shadow: true },
  cardboard: { bg: 0xd8cdb6, fog: [0xd8cdb6, 13, 28], tone: THREE.ACESFilmicToneMapping, exposure: 1.05, floor: true, grid: false, gridEng: false, edges: false, edgeColor: BP_LINE, detail: false, top: false, shadow: true },
  blueprint: { bg: 0x0b1e37, fog: null, tone: THREE.NoToneMapping, exposure: 1.0, floor: false, grid: true, gridEng: false, edges: true, edgeColor: BP_LINE, detail: false, top: false, shadow: false },
  technical: { bg: ENG_PAPER, fog: null, tone: THREE.NoToneMapping, exposure: 1.0, floor: false, grid: false, gridEng: true, edges: true, edgeColor: INK, detail: true, top: true, shadow: false },
  // same engineering line-drawing as technical, but the camera starts in a front
  // elevation and eases to the top plan on hover (handled specially in the tick;
  // top:false keeps applyStyle from forcing the straight-down orthoCamera)
  front: { bg: ENG_PAPER, fog: null, tone: THREE.NoToneMapping, exposure: 1.0, floor: false, grid: false, gridEng: true, edges: true, edgeColor: INK, detail: true, top: false, shadow: false },
};

// ---- canvas-texture helpers ------------------------------------------------

function grainTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d");
  const img = g.createImageData(256, 256);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 150 + Math.random() * 90;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  return tex;
}

// kraft cardboard: corrugation stripes + fibre noise
function cardboardTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d");
  g.fillStyle = "#bb8d57";
  g.fillRect(0, 0, 256, 256);
  for (let x = 0; x < 256; x += 6) {
    g.fillStyle = (x / 6) % 2 ? "rgba(120,85,45,0.10)" : "rgba(214,178,122,0.10)";
    g.fillRect(x, 0, 3, 256);
  }
  for (let i = 0; i < 5000; i++) {
    g.fillStyle = `rgba(90,60,30,${Math.random() * 0.06})`;
    g.fillRect(Math.random() * 256, Math.random() * 256, 1, 1);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  return tex;
}

function grooveTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const g = c.getContext("2d");
  g.fillStyle = "#1b1815";
  g.fillRect(0, 0, 512, 512);
  for (let r = 250; r > 70; r -= 2) {
    g.beginPath();
    g.arc(256, 256, r, 0, Math.PI * 2);
    g.strokeStyle = `rgba(255,246,230,${0.015 + Math.random() * 0.02})`;
    g.lineWidth = 1;
    g.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 4;
  return tex;
}

// cream record label with dark type + accent ring
function labelTexture(title, sub, hex) {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d");
  const accent = "#" + hex.toString(16).padStart(6, "0");
  g.fillStyle = "#e7ddc6";
  g.fillRect(0, 0, 256, 256);
  g.strokeStyle = accent;
  g.lineWidth = 7;
  g.beginPath();
  g.arc(128, 128, 118, 0, Math.PI * 2);
  g.stroke();
  g.fillStyle = "#3a2f24";
  g.textAlign = "center";
  g.font = "700 24px Inter, system-ui, sans-serif";
  g.fillText(title, 128, 100);
  g.font = "600 19px Inter, system-ui, sans-serif";
  const words = sub.split(" ");
  let line = "";
  const lines = [];
  for (const w of words) {
    if ((line + " " + w).trim().length > 12) {
      lines.push(line.trim());
      line = w;
    } else line += " " + w;
  }
  lines.push(line.trim());
  lines.slice(0, 2).forEach((ln, i) => g.fillText(ln, 128, 130 + i * 22));
  g.fillStyle = "#211e1b";
  g.beginPath();
  g.arc(128, 128, 11, 0, Math.PI * 2);
  g.fill();
  const tex = new THREE.CanvasTexture(c);
  tex.center.set(0.5, 0.5);
  tex.name = "labelText";
  return tex;
}

// ---- per-style material factory (by role) ----------------------------------
// reg(material) tracks it for disposal on the next style switch.
function styleMaterial(role, key, ud, TEX, reg, scanFill) {
  const std = (o) => reg(new THREE.MeshStandardMaterial(o));
  const basic = (o) => reg(new THREE.MeshBasicMaterial(o));

  if (key === "blueprint") {
    const FILL = 0x123a63;
    // reactive lamps stay emissive cyan so the audio loop can animate them
    if (role === "vu" || role === "pad" || role === "pilot" || role === "powerDot")
      return std({ color: 0x0c2338, emissive: BP_LINE, emissiveIntensity: 0.12, roughness: 0.5, metalness: 0 });
    if (role === "vinyl") return [basic({ color: 0x0b2036 }), basic({ color: 0x0b2036 }), basic({ color: 0x0b2036 })];
    if (role === "label") return [basic({ color: FILL }), basic({ color: FILL }), basic({ color: FILL })];
    return basic({ color: FILL });
  }

  if (key === "technical" || key === "front") {
    // Normally every part is a flat paper-coloured fill that occludes (hidden-line
    // removal) but matches the paper, so ONLY the ink edge + detail lines read. The
    // scan widget has no paper (transparent canvas), so those fills would show as
    // solid blobs — make them fully transparent there for a pure line drawing.
    const fill = scanFill ? { color: ENG_FILL, transparent: true, opacity: 0 } : { color: ENG_FILL };
    if (role === "vinyl" || role === "label") return [basic(fill), basic(fill), basic(fill)];
    return basic(fill);
  }

  if (key === "cardboard") {
    const map = TEX.card;
    const kr = (c, o = {}) => std({ color: c, roughness: 0.96, metalness: 0, map, bumpMap: map, bumpScale: 0.015, ...o });
    switch (role) {
      case "body": return kr(0xc19a63);
      case "panel": return kr(0xb2894f);
      case "well": return kr(0x86602f);
      case "silver": return kr(0xba8c56);
      case "silver2": return kr(0xa87f4e);
      case "spindle": return kr(0x8a6236);
      case "armdark": return kr(0x6f4d2a);
      case "faderTrack": return kr(0x5a3d20);
      case "knob": return kr(0x6f4d2a);
      case "knobInd": return kr(0xd8b478);
      case "button": return kr(0xcea06a);
      case "accentHead": return kr(0xb4432e);
      case "powerDot": return std({ color: 0xb4432e, emissive: 0xb4432e, emissiveIntensity: 0.1, roughness: 0.85, map });
      case "pilot": return std({ color: ud.accent, emissive: ud.accent, emissiveIntensity: 0.2, roughness: 0.7 });
      case "vinyl": {
        const disc = kr(0x3d2812);
        return [kr(0x4a3016), disc, disc];
      }
      case "label": {
        const f = kr(0xcaa06a);
        return [kr(0x4a3016), f, f];
      }
      case "vu": return std({ color: 0x3a2c1a, emissive: ud.vuColor, emissiveIntensity: 0.08, roughness: 0.6, map });
      case "pad": return kr(0xc99a63);
      default: return kr(0xb08a52);
    }
  }

  // realistic
  const grain = TEX.grain;
  const mm = (c, o = {}) => std({ color: c, metalness: 0, roughness: 0.86, roughnessMap: grain, ...o });
  switch (role) {
    case "body": return mm(CREAM, { roughness: 0.9 });
    case "panel": return mm(OLIVE, { roughness: 0.9 });
    case "well": return mm(0x9d906f, { roughness: 0.95 });
    case "silver": return mm(SILVER, { roughness: 0.5, metalness: 0.25 });
    case "silver2": return mm(0xcac4b6, { roughness: 0.45, metalness: 0.2 });
    case "spindle": return mm(0xd8d3c6, { roughness: 0.4, metalness: 0.3 });
    case "armdark": return mm(0x413a32);
    case "faderTrack": return mm(0x2b2721, { roughness: 0.7 });
    case "knob": return mm(KNOB, { roughness: 0.7 });
    case "knobInd": return mm(0xe8ddc6, { roughness: 0.6 });
    case "button": return mm(BTN, { roughness: 0.75 });
    case "accentHead": return mm(RED, { roughness: 0.7 });
    case "powerDot": return std({ color: RED, emissive: RED, emissiveIntensity: 0.1, roughness: 0.6 });
    case "pilot": return std({ color: ud.accent, emissive: ud.accent, emissiveIntensity: 0.2, roughness: 0.5 });
    case "vinyl": {
      const disc = std({ color: VINYL, roughness: 0.7, metalness: 0.05, map: TEX.groove });
      return [mm(VINYL, { roughness: 0.8 }), disc, disc];
    }
    case "label": {
      const face = std({ map: labelTexture(ud.title, ud.trackName, ud.accent), emissive: ud.accent, emissiveIntensity: 0, roughness: 0.85 });
      return [mm(0x2a2621), face, face];
    }
    case "vu": return std({ color: 0x2c2a24, emissive: ud.vuColor, emissiveIntensity: 0.06, roughness: 0.6 });
    case "pad": return mm(BTN, { emissive: ud.accent, emissiveIntensity: 0.05, roughness: 0.8 });
    default: return mm(CREAM);
  }
}

// ---- scene construction (geometry + role tags) -----------------------------

// A wireframe outline whose corners follow a RoundedBoxGeometry's radius, so the
// line drawing matches the solid shape. EdgesGeometry finds no hard edge on a
// rounded box (the fillets tessellate smoothly), and a plain box outline shows
// square corners that don't match the rounded solid. This traces six rounded-
// rectangle face loops instead; on filled styles the back faces are hidden by the
// solid, leaving a clean rounded outline. `steps` = arc segments per 90deg corner.
function roundedBoxEdges(w, h, d, r, steps = 6) {
  const hx = w / 2, hy = h / 2, hz = d / 2;
  r = Math.min(r, hx, hy, hz);
  const pts = [];
  const loop = (a, b, map) => {
    const rr = Math.min(r, a, b);
    const ai = a - rr, bi = b - rr;
    const poly = [];
    const corners = [
      [ai, bi, 0], [-ai, bi, Math.PI / 2], [-ai, -bi, Math.PI], [ai, -bi, 3 * Math.PI / 2],
    ];
    for (const [cx, cy, a0] of corners) {
      for (let i = 0; i <= steps; i++) {
        const t = a0 + (i / steps) * (Math.PI / 2);
        poly.push(map(cx + rr * Math.cos(t), cy + rr * Math.sin(t)));
      }
    }
    for (let i = 0; i < poly.length; i++) pts.push(poly[i], poly[(i + 1) % poly.length]);
  };
  loop(hx, hy, (u, v) => new THREE.Vector3(u, v, hz));   // +Z front
  loop(hx, hy, (u, v) => new THREE.Vector3(u, v, -hz));  // -Z back
  loop(hx, hz, (u, v) => new THREE.Vector3(u, hy, v));   // +Y top
  loop(hx, hz, (u, v) => new THREE.Vector3(u, -hy, v));  // -Y bottom
  loop(hz, hy, (u, v) => new THREE.Vector3(hx, v, u));   // +X right
  loop(hz, hy, (u, v) => new THREE.Vector3(-hx, v, u));  // -X left
  return new THREE.BufferGeometry().setFromPoints(pts);
}

function buildConsole(initial) {
  const group = new THREE.Group();
  const hitMeshes = [];
  const geoms = [];
  const g = (geo) => {
    geoms.push(geo);
    return geo;
  };
  // RoundedBoxGeometry drops its radius (it scales a unit box), so stash the params
  // for the edge pass to rebuild a rounded outline that matches the solid.
  const rbox = (w, h, d, seg, r) => {
    const geo = new RoundedBoxGeometry(w, h, d, seg, r);
    geo.userData.rbox = { w, h, d, r: Math.min(w / 2, h / 2, d / 2, r) };
    return geo;
  };
  const PH = new THREE.MeshStandardMaterial({ color: 0x808080 }); // placeholder until applyStyle
  const add = (geo, role, extra = {}, multi = false) => {
    const m = new THREE.Mesh(g(geo), multi ? [PH, PH, PH] : PH);
    m.userData.role = role;
    Object.assign(m.userData, extra);
    return m;
  };
  const pickable = (mesh, control) => {
    mesh.userData.control = control;
    hitMeshes.push(mesh);
    return mesh;
  };

  // base
  const base = add(rbox(8.4, 0.55, 4.4, 5, 0.16), "body");
  base.position.y = -0.27;
  group.add(base);

  // pilot lamps
  const underglow = { a: null, b: null };
  for (const [id, hex, sign] of [
    ["a", WARM, -1],
    ["b", COOL, 1],
  ]) {
    const lamp = add(new THREE.CylinderGeometry(0.07, 0.07, 0.05, 20), "pilot", { accent: hex });
    lamp.rotation.x = Math.PI / 2;
    lamp.position.set(sign * 0.95, 0.03, 1.78);
    group.add(lamp);
    underglow[id] = lamp;
  }

  // decks
  const platters = {};
  const labels = {};
  const powerPads = {};
  const deckHex = { a: WARM, b: COOL };

  for (const [id, hex, sign] of [
    ["a", WARM, -1],
    ["b", COOL, 1],
  ]) {
    const deckX = sign * DECK_X;

    const well = add(new THREE.CylinderGeometry(1.54, 1.54, 0.1, 48), "well");
    well.position.set(deckX, 0.0, 0);
    group.add(well);

    const spin = new THREE.Group();
    spin.position.set(deckX, 0.02, 0);
    group.add(spin);

    const platter = add(new THREE.CylinderGeometry(1.42, 1.42, 0.12, 60), "silver");
    platter.position.y = 0.06;
    spin.add(platter);
    pickable(platter, { type: "platter", deck: id });

    const vinyl = add(new THREE.CylinderGeometry(1.3, 1.3, 0.05, 64), "vinyl", {}, true);
    vinyl.position.y = 0.13;
    spin.add(vinyl);
    pickable(vinyl, { type: "platter", deck: id });

    const label = add(new THREE.CylinderGeometry(0.46, 0.46, 0.055, 48), "label", { accent: hex, title: `DECK ${id.toUpperCase()}`, trackName: initial[id].name }, true);
    label.position.y = 0.15;
    spin.add(label);
    labels[id] = label;

    const spindle = add(new THREE.CylinderGeometry(0.03, 0.03, 0.22, 16), "spindle");
    spindle.position.y = 0.22;
    spin.add(spindle);
    platters[id] = spin;

    // tonearm
    const arm = new THREE.Group();
    arm.position.set(deckX + sign * 1.16, 0.06, -1.16);
    const armBase = add(new THREE.CylinderGeometry(0.17, 0.19, 0.18, 20), "armdark");
    arm.add(armBase);
    const tube = add(new THREE.CylinderGeometry(0.026, 0.026, 1.5, 12), "silver2");
    tube.rotation.z = Math.PI / 2;
    tube.rotation.y = sign * 0.9;
    tube.position.set(sign * -0.6, 0.16, 0.55);
    arm.add(tube);
    const head = add(rbox(0.16, 0.1, 0.22, 3, 0.03), "accentHead");
    head.position.set(sign * -1.15, 0.14, 1.02);
    arm.add(head);
    group.add(arm);

    // chunky power button + red dot
    const pad = add(rbox(0.6, 0.12, 0.36, 4, 0.06), "button");
    pad.position.set(deckX, 0.06, 1.74);
    group.add(pad);
    pickable(pad, { type: "power", deck: id });
    const dot = add(new THREE.CylinderGeometry(0.05, 0.05, 0.03, 16), "powerDot");
    dot.position.set(deckX, 0.13, 1.74);
    group.add(dot);
    powerPads[id] = dot;
  }

  // mixer panel
  const panel = add(rbox(2.5, 0.24, 4.2, 4, 0.1), "panel");
  panel.position.set(0, 0.09, 0);
  group.add(panel);

  const knobGroups = { a: {}, b: {} };
  const bandsPos = [
    ["high", -1.4],
    ["mid", -0.88],
    ["low", -0.36],
  ];
  for (const [id, sign] of [
    ["a", -1],
    ["b", 1],
  ]) {
    for (const [band, z] of bandsPos) {
      const kg = new THREE.Group();
      kg.position.set(sign * 0.62, 0.22, z);
      const body = add(new THREE.CylinderGeometry(0.15, 0.17, 0.14, 28), "knob");
      body.position.y = 0.07;
      kg.add(body);
      pickable(body, { type: "knob", deck: id, band });
      const ind = add(new THREE.BoxGeometry(0.028, 0.05, 0.14), "knobInd");
      ind.position.set(0, 0.14, 0.055);
      kg.add(ind);
      group.add(kg);
      knobGroups[id][band] = kg;
    }
  }

  const faderCaps = {};
  for (const [id, sign] of [
    ["a", -1],
    ["b", 1],
  ]) {
    const trk = add(new THREE.BoxGeometry(0.07, 0.04, 1.1), "faderTrack");
    trk.position.set(sign * 0.2, 0.2, 0.72);
    group.add(trk);
    const cap = add(rbox(0.36, 0.16, 0.24, 3, 0.06), "button");
    cap.position.set(sign * 0.2, 0.27, 0.35);
    group.add(cap);
    pickable(cap, { type: "fader", deck: id });
    faderCaps[id] = cap;
  }

  const xTrack = add(new THREE.BoxGeometry(1.5, 0.04, 0.08), "faderTrack");
  xTrack.position.set(0, 0.2, 1.58);
  group.add(xTrack);
  const crossCap = add(rbox(0.26, 0.16, 0.36, 3, 0.06), "button");
  crossCap.position.set(0, 0.27, 1.58);
  group.add(crossCap);
  pickable(crossCap, { type: "crossfader" });

  const SEG = 9;
  const vu = { a: [], b: [] };
  for (const [id, sign] of [
    ["a", -1],
    ["b", 1],
  ]) {
    for (let i = 0; i < SEG; i++) {
      const col = i > SEG - 3 ? 0xd0452f : i > SEG - 5 ? 0xd79a3a : 0x7aa04a;
      // narrowed + pulled inward so the bars sit clear of the platter + knobs
      const seg = add(new THREE.BoxGeometry(0.22, 0.035, 0.1), "vu", { vuColor: col });
      seg.position.set(sign * 0.96, 0.21, -1.55 + i * 0.13);
      group.add(seg);
      vu[id].push(seg);
    }
  }

  const pads = { a: [], b: [] };
  for (const [id, sign] of [
    ["a", -1],
    ["b", 1],
  ]) {
    for (let i = 0; i < 4; i++) {
      const p = add(rbox(0.34, 0.09, 0.34, 3, 0.05), "pad", { accent: id === "a" ? WARM : COOL });
      p.position.set(sign * (1.85 + (i % 2) * 0.42) - sign * 0.2, 0.06, 0.55 + Math.floor(i / 2) * 0.42);
      group.add(p);
      pads[id].push(p);
    }
  }

  const dispose = () => {
    geoms.forEach((geo) => geo.dispose());
    PH.dispose();
  };

  // ---- the record crate, in the scene rather than in the DOM ----
  // Annotation msbdalbj asked for the crate to live INSIDE the canvas, so it is
  // built here as real geometry and added to `group`, which means applyStyle()
  // and the edge pass pick it up for free in every render style.
  //
  // Sized and placed to sit INSIDE the front camera's visible band. That band is
  // only ~4.7 world units tall in the footer (frontHeight), centred near y=-0.1,
  // so the crate has roughly y 0.8..2.2 to work with above the console. Hence
  // 0.62 tiles rather than anything console-width: a 5x2 block of them is 3.4
  // wide and 1.35 tall, which clears the console and still fits the frame.
  const crate = new THREE.Group();
  const crateTiles = {};
  const CELL = 0.78;
  const STEP = 0.88;
  for (let i = 0; i < 10; i++) {
    const col = i % 5;
    const row = Math.floor(i / 5);
    // real tracks, not placeholders: each tile IS a record you can pull
    // (annotation msbfwytg restored the interaction the DOM crate had)
    const t = TRACKS[i];
    const x = (col - 2) * STEP;
    const y = 1.32 + (0.5 - row) * STEP;

    // the sleeve: a thin upright square facing the front camera
    const sleeve = add(rbox(CELL, CELL, 0.035, 3, 0.03), "panel");
    sleeve.position.set(x, y, 0);
    crate.add(sleeve);

    // the disc peeking out of it, rotated to face +Z like the sleeve
    const disc = add(new THREE.CylinderGeometry(0.24, 0.24, 0.02, 40), "vinyl", {}, true);
    disc.rotation.x = Math.PI / 2;
    disc.position.set(x, y, 0.03);
    crate.add(disc);

    const eye = add(new THREE.CylinderGeometry(0.055, 0.055, 0.024, 16), "silver");
    eye.rotation.x = Math.PI / 2;
    eye.position.set(x, y, 0.042);
    crate.add(eye);

    if (t) {
      sleeve.userData.trackName = t.name;
      pickable(sleeve, { type: "crate", key: t.key });
      pickable(disc, { type: "crate", key: t.key });
      crateTiles[t.key] = { disc };
    }
  }
  crate.position.z = -1.5; // behind the decks, so it reads as a shelf at the back
  crate.visible = false; // opt in via the `crate` prop; /dj is unchanged by default
  group.add(crate);

  return { group, crate, crateTiles, hitMeshes, platters, labels, deckHex, faderCaps, knobGroups, crossCap, vu, pads, powerPads, underglow, dispose };
}

// ---- 3D hand cursor --------------------------------------------------------
// A stylized soft "clay" hand that eases over to whatever control you hover:
// pinches down onto knobs / faders / buttons, and lays flat to rest on a platter
// so you can scratch. Lives outside the console group so the style system leaves
// it alone. Canonical pose: palm down (XZ plane), fingers pointing -Z.
function buildHand() {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0xdcc0a4, roughness: 0.85, metalness: 0 });
  const add = (geo, x, y, z, rx = 0, ry = 0, rz = 0) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, rz);
    g.add(m);
    return m;
  };
  add(new RoundedBoxGeometry(0.44, 0.13, 0.4, 4, 0.06), 0, 0, 0.02); // palm
  add(new RoundedBoxGeometry(0.34, 0.12, 0.18, 3, 0.05), 0, 0, 0.26); // wrist
  const fl = [0.26, 0.3, 0.28, 0.22];
  for (let i = 0; i < 4; i++) {
    const len = fl[i];
    add(new THREE.CapsuleGeometry(0.05, len, 4, 10), -0.15 + i * 0.1, 0.005, -0.2 - len / 2, -Math.PI / 2, 0, 0);
  }
  const thumb = add(new THREE.CapsuleGeometry(0.055, 0.22, 4, 10), 0.24, 0.0, 0.04, 0, 0, Math.PI / 2);
  thumb.rotateY(0.6);
  g.scale.setScalar(0.0001); // start hidden
  return { group: g, mat };
}

// ---- component -------------------------------------------------------------

const clamp = (v, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));

// `onApi` hands the caller the imperative control ref (mixTo / toggleDeck /
// queueTo / …) so a surface outside the console can drive it — the /hello record
// wall pulls a sleeve and mixes to that track. `onDecks` reports which track is
// loaded on each deck and whether it is playing, which is what lets that wall
// show the two records that are physically out of it. Both are optional; every
// existing call site is unaffected.
// `hover` turns off every hover response: the per-control edge highlight, the
// clay-hand cursor, and the Front style's front→top camera swing. Dragging and
// clicking still work — this is about the console reacting to a passing pointer,
// which is unwanted where it is decoration rather than the main event (the page
// footer). Per annotation msb98tdb.
// `frontHeight` is the world-space HEIGHT of the box the front elevation is fitted
// into (its width is fixed at 13.0). Lower it to crop the empty air above and
// below the console; the container's aspect-ratio must be set to 13 / frontHeight
// to match, or the ortho fit pads the other axis instead.
export default function DjConsole({ onBack, onOpen, variant = "page", onApi, onDecks, controls = true, hover = true, frontHeight = 9.4, crate = false }) {
  const reduce = useReducedMotion();
  const isHero = variant === "hero";
  // "scan": a compact, technical-only widget (used in the portfolio scan header)
  const isScan = variant === "scan";
  const mountRef = useRef(null);
  const audioRef = useRef(null);
  const apiRef = useRef({});
  const styleRef = useRef("realistic");
  // read inside the scene effect, which never re-runs on prop changes
  const hoverRef = useRef(hover);
  hoverRef.current = hover;
  const frontHeightRef = useRef(frontHeight);
  frontHeightRef.current = frontHeight;
  // `crate` shows the 5x2 record shelf inside the scene (annotation msbdalbj).
  // Read through a ref because the scene effect never re-runs on prop changes.
  const crateRef = useRef(crate);
  crateRef.current = crate;
  const ctrlRef = useRef({
    playing: { a: false, b: false },
    vol: { a: 0.85, b: 0.85 },
    crossfade: 0.5,
    crossTarget: null,
    master: 0.9,
    pitch: { a: 0, b: 0 },
    eq: { a: { low: 0, mid: 0, high: 0 }, b: { low: 0, mid: 0, high: 0 } },
  });

  const [hud, setHud] = useState({
    playing: { a: false, b: false },
    crossfade: 0.5,
    master: 0.9,
    pitch: { a: 0, b: 0 },
    deck: { a: TRACKS[0].key, b: TRACKS[1].key },
  });
  const [started, setStarted] = useState(false);
  const [style, setStyle] = useState(isScan ? "front" : "realistic");
  styleRef.current = style;
  // song crate + controls overlay hidden by default; press "u" to toggle it back
  const [showUI, setShowUI] = useState(false);
  // per-disc floaters: screen anchor for each deck + which deck's queue is open
  const [deckAnchor, setDeckAnchor] = useState(null);
  const [queueOpen, setQueueOpen] = useState({ a: false, b: false });
  // ---- auto-mix (scan widget): two parallel "now playing" slots. Slot 1 is the live
  // deck; slot 2 is an empty "up next" you tap to queue a song — then a timer runs a
  // DJ transition to it, the decks swap roles, and the slot resets for the next queue.
  const [nowDeck, setNowDeck] = useState("a");
  const [amQueued, setAmQueued] = useState(null); // queued track key (on the idle deck)
  const [amPhase, setAmPhase] = useState("idle"); // idle | queued | mixing
  const [amPickOpen, setAmPickOpen] = useState(false);
  const [amCountdown, setAmCountdown] = useState(0);
  const [amMethod, setAmMethod] = useState("Blend");
  const amTimers = useRef({ mix: null, tick: null, done: null });
  const amMethodIx = useRef(0);
  const amAnalysisRef = useRef(null); // outgoing track's waveform analysis, once ready
  const amTargetRef = useRef(null); // { atSec, kind, strength } chosen transition point
  const amPhaseRef = useRef("idle"); // live mirror of amPhase for async callbacks

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const audio = new DjAudio();
    audioRef.current = audio;
    const ctrl = ctrlRef.current;
    const initialTracks = { a: TRACKS[0], b: TRACKS[1] };

    const syncHud = () =>
      setHud({
        playing: { ...ctrl.playing },
        crossfade: ctrl.crossfade,
        master: ctrl.master,
        pitch: { ...ctrl.pitch },
        deck: { ...audio.deckTrackKey },
      });

    // ---- renderer / scene / camera ----
    // the scan widget renders on a transparent canvas (no cream "fill") so the line
    // drawing sits straight on the page; its ink flips with the page theme so it
    // reads on both a light and a dark page.
    const pageDark = () => typeof document !== "undefined" && document.documentElement.classList.contains("dark");
    const scanInk = () => (pageDark() ? 0xe8e2d6 : INK);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: isScan, powerPreference: "high-performance" });
    if (isScan) renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.shadowMap.enabled = true;
    // r186 removed PCFSoftShadowMap; PCFShadowMap is now the soft one (a 5-tap
    // Vogel disk scaled by light.shadow.radius). See key.shadow.radius below.
    renderer.shadowMap.type = THREE.PCFShadowMap;
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.touchAction = isHero || isScan ? "pan-y" : "none";

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, mount.clientWidth / mount.clientHeight, 0.1, 100);
    // fixed framing, pulled back so the whole console (both decks) fits
    const camBase = new THREE.Vector3(0, 9.2, 10.0);
    const camTarget = new THREE.Vector3(0, -0.3, 0.2);
    camera.position.copy(camBase);
    camera.lookAt(camTarget);

    // orthographic straight-down camera for the Technical plan view
    const orthoCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
    orthoCamera.position.set(0, 14, 0);
    orthoCamera.up.set(0, 0, -1); // console front points to the bottom of the plan
    orthoCamera.lookAt(0, 0, 0);

    // "Front" style camera: an ortho front elevation that eases up and over into the
    // straight-down top plan on hover. frontProg 0 = front, 1 = top; the tick lerps
    // position/up/target between the two poses.
    const frontCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
    const FRONT_POS = new THREE.Vector3(0, 5.0, 11.6);
    const FRONT_UP = new THREE.Vector3(0, 1, 0);
    const FRONT_TGT = new THREE.Vector3(0, -0.1, 0.2);
    const TOP_POS = new THREE.Vector3(0, 14, 0);
    const TOP_UP = new THREE.Vector3(0, 0, -1);
    const TOP_TGT = new THREE.Vector3(0, 0, 0);
    frontCamera.position.copy(FRONT_POS);
    frontCamera.up.copy(FRONT_UP);
    frontCamera.lookAt(FRONT_TGT);
    let frontProg = 0;
    // the .dj root, one level up from the stage — where --dj-front is published
    const root = mount.parentElement;
    let lastFront = -1;
    const _fpos = new THREE.Vector3();
    const _fup = new THREE.Vector3();
    const _ftgt = new THREE.Vector3();

    const sizeOrtho = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (!w || !h) return;
      const aspect = w / h;
      const needW = 13.0; // world X extent to fit (console width + generous side margin)
      const needH = 7.6; // world Z extent to fit (depth + floater room)
      let vw, vh;
      if (needW / needH > aspect) {
        vw = needW / 2;
        vh = vw / aspect;
      } else {
        vh = needH / 2;
        vw = vh * aspect;
      }
      orthoCamera.left = -vw;
      orthoCamera.right = vw;
      orthoCamera.top = vh;
      orthoCamera.bottom = -vh;
      orthoCamera.updateProjectionMatrix();
      // The world box the front elevation is fitted into. The console body is
      // 8.4 x 0.55, so at the default 9.4 the drawing is a wide, short object in a
      // tall frame and most of the height is empty — fine on /dj, where hovering
      // swings the camera up to the top plan and needs the room, wrong in the
      // footer where hover is off and it just reads as padding. Hence the prop.
      const fW = 13.0;
      const fH = frontHeightRef.current;
      let fvw, fvh;
      if (fW / fH > aspect) {
        fvw = fW / 2;
        fvh = fvw / aspect;
      } else {
        fvh = fH / 2;
        fvw = fvh * aspect;
      }
      frontCamera.left = -fvw;
      frontCamera.right = fvw;
      frontCamera.top = fvh;
      frontCamera.bottom = -fvh;
      frontCamera.updateProjectionMatrix();
    };
    sizeOrtho();
    let activeCamera = camera;

    // soft studio lighting (used by realistic + cardboard; blueprint is unlit)
    scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8172, 0.85));
    scene.add(new THREE.AmbientLight(0xfff4e6, 0.35));
    const key = new THREE.DirectionalLight(0xfff3e2, 2.1);
    key.position.set(-3.5, 8.5, 5.5);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 30;
    key.shadow.camera.left = -7;
    key.shadow.camera.right = 7;
    key.shadow.camera.top = 7;
    key.shadow.camera.bottom = -7;
    key.shadow.bias = -0.0004;
    // 1.5 texels matches the old PCFSoftShadowMap kernel (which ignored radius, so
    // the 5 that used to sit here never did anything). Measured 2026-09-26 with
    // casters switched on in a scratch copy: 1.5 gave the smallest difference from
    // the r169 shadow (1 and 2 close behind, 5 was 3.5x further off). Note that no
    // console mesh sets castShadow today, so this only matters if one ever does.
    key.shadow.radius = 1.5;
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xdfe8ff, 0.5);
    fill.position.set(4, 3, 4);
    scene.add(fill);

    // studio floor (realistic/cardboard) + blueprint grid
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshStandardMaterial({ color: 0xaea79b, roughness: 1, metalness: 0 }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.55;
    floor.receiveShadow = true;
    scene.add(floor);
    const grid = new THREE.GridHelper(70, 70, BP_LINE, 0x2b5f8f);
    grid.position.y = -0.549;
    grid.visible = false;
    scene.add(grid);
    // fine graph-paper grid for the Technical plan view (faint ink on paper)
    const gridEng = new THREE.GridHelper(70, 280, 0x9a8f76, 0xc3b99f);
    gridEng.position.y = -0.549;
    gridEng.visible = false;
    scene.add(gridEng);

    // shared textures (created once, disposed on unmount)
    const TEX = { grain: grainTexture(), card: cardboardTexture(), groove: grooveTexture() };

    const con = buildConsole(initialTracks);
    con.crate.visible = crateRef.current;
    scene.add(con.group);

    // ---- 3D hand cursor ----
    const hand = buildHand();
    scene.add(hand.group);
    const reachQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.95, 0, 0)); // fingers dip down onto a control
    const flatQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.18, 0, 0)); // palm resting flat on a platter
    const handState = { active: false, pressed: false, pos: new THREE.Vector3(0, 2, 5), quat: new THREE.Quaternion().copy(flatQuat) };
    const _hwp = new THREE.Vector3();
    const _htmp = new THREE.Vector3();
    const setHand = (obj, type, pressed) => {
      obj.getWorldPosition(_hwp);
      handState.active = true;
      handState.pressed = pressed;
      if (type === "platter") {
        // lay flat, resting on the front of the disk where you'd scratch
        handState.pos.set(_hwp.x, 0.34 - (pressed ? 0.03 : 0), 0.66);
        handState.quat.copy(flatQuat);
      } else {
        // reach in from just above the front and pinch down onto the control
        handState.pos.set(_hwp.x, _hwp.y + (pressed ? 0.28 : 0.34), _hwp.z + 0.13);
        handState.quat.copy(reachQuat);
      }
    };

    // cyan edge overlays (blueprint) — one LineSegments child per role-tagged mesh
    const edgeMat = new THREE.LineBasicMaterial({ color: BP_LINE, transparent: true, opacity: 0.92 });
    // hover: the pointed-at control's edge line switches to this bright accent
    const hoverEdgeMat = new THREE.LineBasicMaterial({ color: WARM, transparent: true, opacity: 1 });
    let hoveredMesh = null;
    const clearHover = () => {
      if (hoveredMesh?.userData.edge) hoveredMesh.userData.edge.material = edgeMat;
      hoveredMesh = null;
    };
    const edgeGeoms = [];
    con.group.traverse((o) => {
      if (o.isMesh && o.userData.role) {
        // Rounded-box parts (body, panel, pads, buttons, headshell) tessellate so
        // smoothly that EdgesGeometry finds NO hard edge at 24° — and a plain box
        // outline would show square corners that don't match the rounded solid. Use
        // a rounded-box wireframe (rebuilt from the stashed radius) so the outline
        // follows the fillets. Sharp-box parts keep their real EdgesGeometry.
        const rb = o.geometry.userData && o.geometry.userData.rbox;
        let eg;
        if (rb) {
          eg = roundedBoxEdges(rb.w, rb.h, rb.d, rb.r);
        } else {
          eg = new THREE.EdgesGeometry(o.geometry, 24);
          const empty = !eg.getAttribute("position") || eg.getAttribute("position").count === 0;
          if (empty) {
            // safety net for any smooth non-rbox geometry: bounding-box outline
            o.geometry.computeBoundingBox();
            const bb = o.geometry.boundingBox;
            const boxGeo = new THREE.BoxGeometry(bb.max.x - bb.min.x, bb.max.y - bb.min.y, bb.max.z - bb.min.z);
            boxGeo.translate((bb.max.x + bb.min.x) / 2, (bb.max.y + bb.min.y) / 2, (bb.max.z + bb.min.z) / 2);
            eg.dispose();
            eg = new THREE.EdgesGeometry(boxGeo, 1);
            boxGeo.dispose();
          }
        }
        edgeGeoms.push(eg);
        const seg = new THREE.LineSegments(eg, edgeMat);
        seg.visible = false;
        o.add(seg);
        o.userData.edge = seg;
      }
    });

    // ---- Technical plan detail lines: grooves, gauges, ticks (ink) ----
    // Only visible in the "technical" style. Parented onto the spinning decks /
    // knob groups so they sit exactly on the part. Two weights: solid ink for the
    // main linework, fainter for fine grooves.
    const engMat = new THREE.LineBasicMaterial({ color: isScan ? scanInk() : INK, transparent: true, opacity: 0.85 });
    const engFaint = new THREE.LineBasicMaterial({ color: isScan ? scanInk() : INK, transparent: true, opacity: 0.4 });
    // dash-dot centre-line material (engineering convention: circular features get a
    // cross-hair through their axis)
    const engCenter = new THREE.LineDashedMaterial({ color: isScan ? scanInk() : INK, transparent: true, opacity: 0.5, dashSize: 0.17, gapSize: 0.1 });
    const engGeoms = [];
    const engLines = [];
    const ring = (radius, y, mat, segs = 72) => {
      const pts = [];
      for (let i = 0; i <= segs; i++) {
        const a = (i / segs) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(a) * radius, y, Math.sin(a) * radius));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      engGeoms.push(geo);
      const line = new THREE.Line(geo, mat);
      line.visible = false;
      engLines.push(line);
      return line;
    };
    const ticks = (rInner, rOuter, y, count, mat, x0 = 0, z0 = 0) => {
      const pts = [];
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2;
        const c = Math.cos(a);
        const s = Math.sin(a);
        pts.push(new THREE.Vector3(x0 + c * rInner, y, z0 + s * rInner), new THREE.Vector3(x0 + c * rOuter, y, z0 + s * rOuter));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      engGeoms.push(geo);
      const seg = new THREE.LineSegments(geo, mat);
      seg.visible = false;
      engLines.push(seg);
      return seg;
    };
    for (const id of ["a", "b"]) {
      const spin = con.platters[id];
      const yv = 0.15; // just above the vinyl/label top (local to the spin group)
      // concentric vinyl grooves
      for (let r = 0.5; r <= 1.27; r += 0.055) spin.add(ring(r, yv, engFaint));
      // record + platter rims, centre label + spindle
      spin.add(ring(1.3, yv, engMat));
      spin.add(ring(1.42, yv, engMat));
      spin.add(ring(0.46, yv + 0.005, engMat));
      spin.add(ring(0.08, yv + 0.005, engMat));
      // strobe ticks around the platter rim (like a real turntable)
      spin.add(ticks(1.33, 1.4, yv, 48, engMat));
    }
    // EQ knobs → gauge ring + tick marks + a pointer line
    for (const dk of ["a", "b"]) {
      for (const band of ["low", "mid", "high"]) {
        const kg = con.knobGroups[dk][band];
        const yk = 0.15; // knob top (local to the knob group)
        kg.add(ring(0.16, yk, engMat, 40));
        kg.add(ticks(0.16, 0.2, yk, 11, engMat));
      }
    }
    // helpers for the slider caps
    const rectLine = (hx, hz, y, mat) => {
      const pts = [
        new THREE.Vector3(-hx, y, -hz),
        new THREE.Vector3(hx, y, -hz),
        new THREE.Vector3(hx, y, hz),
        new THREE.Vector3(-hx, y, hz),
        new THREE.Vector3(-hx, y, -hz),
      ];
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      engGeoms.push(geo);
      const line = new THREE.Line(geo, mat);
      line.visible = false;
      engLines.push(line);
      return line;
    };
    const seg2 = (a, b, mat) => {
      const geo = new THREE.BufferGeometry().setFromPoints([a, b]);
      engGeoms.push(geo);
      const l = new THREE.LineSegments(geo, mat);
      l.visible = false;
      engLines.push(l);
      return l;
    };
    // slider caps: a bold outline + a centre grip line so the handle position
    // reads clearly on the track (these are children of the caps → they follow).
    for (const cap of [con.faderCaps.a, con.faderCaps.b]) {
      cap.add(rectLine(0.2, 0.14, 0.095, engMat));
      cap.add(seg2(new THREE.Vector3(-0.15, 0.095, 0), new THREE.Vector3(0.15, 0.095, 0), engMat));
    }
    con.crossCap.add(rectLine(0.16, 0.21, 0.095, engMat));
    con.crossCap.add(seg2(new THREE.Vector3(0, 0.095, -0.15), new THREE.Vector3(0, 0.095, 0.15), engMat));

    // Clean rounded-rectangle plan outlines for the base plate + mixer panel. The
    // parts' own bevels are too soft for EdgesGeometry to draw a crisp outline, so
    // these are traced explicitly — a single continuous line per plate, the defining
    // edge of the drawing (engineering plan convention). Shown with the detail lines.
    const roundRectLine = (hx, hz, r, y, mat) => {
      const pts = [];
      const arc = 6; // points per 90° corner
      const corners = [
        [hx - r, hz - r, 0],
        [-(hx - r), hz - r, Math.PI / 2],
        [-(hx - r), -(hz - r), Math.PI],
        [hx - r, -(hz - r), Math.PI * 1.5],
      ];
      for (const [cx, cz, a0] of corners) {
        for (let i = 0; i <= arc; i++) {
          const a = a0 + (i / arc) * (Math.PI / 2);
          pts.push(new THREE.Vector3(cx + Math.cos(a) * r, y, cz + Math.sin(a) * r));
        }
      }
      pts.push(pts[0].clone());
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      engGeoms.push(geo);
      const line = new THREE.Line(geo, mat);
      line.visible = false;
      engLines.push(line);
      return line;
    };
    // (base plate + mixer faceplate outlines now come from their 3D box wireframes)

    // Centre-lines: a dash-dot cross-hair through each platter axis, extended just
    // past the rim (engineering convention for circular features). Static (added to
    // the console group, not the spinning platter) so they don't rotate.
    const centerCross = (cx, cz, r, y) => {
      for (const [a, b] of [
        [new THREE.Vector3(cx - r, y, cz), new THREE.Vector3(cx + r, y, cz)],
        [new THREE.Vector3(cx, y, cz - r), new THREE.Vector3(cx, y, cz + r)],
      ]) {
        const geo = new THREE.BufferGeometry().setFromPoints([a, b]);
        engGeoms.push(geo);
        const l = new THREE.Line(geo, engCenter);
        l.computeLineDistances();
        l.visible = false;
        engLines.push(l);
        con.group.add(l);
      }
    };
    for (const id of ["a", "b"]) centerCross(con.platters[id].position.x, 0, 1.62, 0.16);

    // Axis-of-symmetry centre-line removed per annotation msbnatmm. The platter
    // cross-hairs above still carry the engineering convention where it means
    // something (a circular feature gets an axis); a line down the middle of the
    // whole console only restated that the console is symmetrical.

    // Overall width + depth dimension lines removed per annotation msan048l.

    // ---- style application ----
    let styleMats = [];
    const applyStyle = (styleKey) => {
      styleRef.current = styleKey;
      styleMats.forEach((m) => m.dispose());
      styleMats = [];
      const reg = (m) => {
        styleMats.push(m);
        return m;
      };
      const cfg = STYLE_CFG[styleKey] || STYLE_CFG.realistic;
      scene.background = isScan ? null : new THREE.Color(cfg.bg); // scan: transparent, no fill
      scene.fog = cfg.fog ? new THREE.Fog(cfg.fog[0], cfg.fog[1], cfg.fog[2]) : null;
      renderer.toneMapping = cfg.tone;
      renderer.toneMappingExposure = cfg.exposure;
      renderer.shadowMap.enabled = cfg.shadow;
      floor.visible = cfg.floor;
      grid.visible = cfg.grid;
      gridEng.visible = cfg.gridEng && !isScan; // scan widget: no graph-paper grid
      edgeMat.color.setHex(isScan ? scanInk() : cfg.edgeColor); // cyan blueprint / ink technical / theme-ink scan
      // Front style uses its own hover-animated ortho camera (starts at the front)
      activeCamera = styleKey === "front" ? frontCamera : cfg.top ? orthoCamera : camera;
      if (styleKey === "front") frontProg = 0;
      clearHover(); // drop any hover highlight across a style change
      for (const l of engLines) l.visible = cfg.detail;
      con.group.traverse((o) => {
        if (!o.isMesh || !o.userData.role) return;
        // dispose the previous realistic label texture (not the shared maps)
        if (o.userData.role === "label" && Array.isArray(o.material)) {
          const old = o.material[1]?.map;
          if (old && old.name === "labelText") old.dispose();
        }
        o.material = styleMaterial(o.userData.role, styleKey, o.userData, TEX, reg, isScan);
        if (o.userData.edge) o.userData.edge.visible = cfg.edges;
        // (base plate + mixer faceplate now render as 3D box wireframes via the
        // bounding-box fallback above — edge-only, since the scan fill is transparent —
        // so they show their height edges in the front elevation, not just a top plane.)
      });
    };
    apiRef.current.setStyle = applyStyle;
    applyStyle(styleRef.current); // paint the initial style

    // ---- control geometry ----
    const faderZ = (v) => THREE.MathUtils.lerp(1.15, 0.28, clamp(v));
    const crossX = (v) => THREE.MathUtils.lerp(-0.7, 0.7, clamp(v));
    const setFaderVisual = (id) => (con.faderCaps[id].position.z = faderZ(ctrl.vol[id]));
    const setCrossVisual = () => (con.crossCap.position.x = crossX(ctrl.crossfade));
    const setKnobVisual = (id, band) => (con.knobGroups[id][band].rotation.y = -ctrl.eq[id][band] * 2.35);
    setFaderVisual("a");
    setFaderVisual("b");
    setCrossVisual();
    for (const id of ["a", "b"]) for (const b of ["low", "mid", "high"]) setKnobVisual(id, b);

    const updateLabel = (id, tk) => {
      const mesh = con.labels[id];
      mesh.userData.trackName = tk.name;
      if (styleRef.current === "realistic" && Array.isArray(mesh.material)) {
        const face = mesh.material[1];
        const next = labelTexture(mesh.userData.title, tk.name, mesh.userData.accent);
        if (face.map?.name === "labelText") face.map.dispose();
        face.map = next;
        face.needsUpdate = true;
      }
    };

    // ---- transport ----
    const toggleDeck = (id) => {
      const on = audio.toggleDeck(id);
      ctrl.playing[id] = on;
      setStarted(true);
      syncHud();
    };
    // per-deck "a record just landed" reaction: progress 0->1, driven in the tick
    // loop (spin-up burst + a little scale pop on the platter). Set by landRecord.
    const landing = { a: 0, b: 0 };
    // discs mid-flight from a crate sleeve to a platter (annotation msbfwytg)
    const flights = [];
    const _flyTo = new THREE.Vector3();
    const mixTo = (trackKey) => {
      const tk = trackByKey(trackKey);
      const incoming = ctrl.crossfade < 0.5 ? "b" : "a";
      audio.loadTrack(incoming, tk);
      audio.setDeck(incoming, true);
      ctrl.playing[incoming] = true;
      updateLabel(incoming, tk);
      ctrl.crossTarget = incoming === "b" ? 1 : 0;
      if (reduce) {
        ctrl.crossfade = ctrl.crossTarget;
        ctrl.crossTarget = null;
        audio.setCrossfade(ctrl.crossfade);
        setCrossVisual();
      }
      setStarted(true);
      syncHud();
    };
    apiRef.current.toggleDeck = toggleDeck;
    apiRef.current.mixTo = mixTo;
    // which deck the next mixTo will load onto (read before mixTo flips the fader)
    apiRef.current.nextDeck = () => (ctrl.crossfade < 0.5 ? "b" : "a");
    // the platter's centre in viewport (page) coordinates, so a flown-in record
    // can land exactly on the turntable
    apiRef.current.deckScreen = (id) => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (!w || !h) return null;
      const rect = mount.getBoundingClientRect();
      activeCamera.updateMatrixWorld();
      con.platters[id].getWorldPosition(_proj);
      _proj.y = 0.13; // the top of the vinyl
      _proj.project(activeCamera);
      return { x: rect.left + (_proj.x * 0.5 + 0.5) * w, y: rect.top + (-_proj.y * 0.5 + 0.5) * h };
    };
    // the turntable catches a record: spin it up with a small pop
    apiRef.current.landRecord = (id) => {
      if (id === "a" || id === "b") landing[id] = 0.0001;
    };
    apiRef.current.setMaster = (v) => {
      ctrl.master = clamp(v);
      audio.setMasterVolume(ctrl.master);
      syncHud();
    };
    apiRef.current.setPitch = (id, v) => {
      ctrl.pitch[id] = clamp(v, -1, 1);
      audio.setPitch(id, ctrl.pitch[id]);
      syncHud();
    };
    // load a specific track onto a specific deck + play it (from a disc floater)
    apiRef.current.queueTo = (deck, key) => {
      const tk = trackByKey(key);
      audio.loadTrack(deck, tk);
      audio.setDeck(deck, true);
      ctrl.playing[deck] = true;
      updateLabel(deck, tk);
      setStarted(true);
      syncHud();
    };
    // snap the crossfader to a deck immediately (no tween) — used to seat the auto-mix
    // widget on its "now playing" deck before the first transition
    apiRef.current.setCrossNow = (v) => {
      ctrl.crossTarget = null;
      ctrl.crossfade = clamp(v);
      audio.setCrossfade(ctrl.crossfade);
      setCrossVisual();
      syncHud();
    };
    apiRef.current.stopDeck = (id) => {
      audio.setDeck(id, false);
      ctrl.playing[id] = false;
      syncHud();
    };
    // current playback position on a deck, for waveform-aware auto-mix timing
    apiRef.current.getDeckTime = (id) => audio.decks[id]?.el.currentTime || 0;
    // Auto-mix transition: glide the crossfader to `toDeck` over `durationSec`, in the
    // style of a DJ transition method. "cut" = fast; "bassswap" = drop the incoming
    // lows then restore them mid-blend (a real bass-swap); "blend" = long smooth fade.
    apiRef.current.crossfadeTo = (toDeck, durationSec = 4, method = "blend") => {
      const target = toDeck === "b" ? 1 : 0;
      const dist = Math.abs(target - ctrl.crossfade) || 1;
      ctrl.crossRate = reduce ? 999 : dist / Math.max(0.35, durationSec);
      if (method === "bassswap") {
        audio.setEq(toDeck, "low", -1); // incoming comes in with no bass
        setTimeout(() => audio.setEq(toDeck, "low", 0), durationSec * 520); // swap it in
      }
      ctrl.crossTarget = target;
      setStarted(true);
      syncHud();
    };

    // ---- pointer interaction ----
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    let drag = null;
    let hovering = false;
    const pointer = { x: 0, y: 0 };

    const toNdc = (e) => {
      const r = renderer.domElement.getBoundingClientRect();
      ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      pointer.x = ndc.x;
      pointer.y = -ndc.y;
      return r;
    };
    const screenCenterOf = (obj, rect) => {
      const v = new THREE.Vector3().setFromMatrixPosition(obj.matrixWorld);
      v.project(activeCamera);
      return { x: rect.left + ((v.x + 1) / 2) * rect.width, y: rect.top + ((1 - v.y) / 2) * rect.height };
    };
    const angleWrap = (a) => {
      while (a > Math.PI) a -= Math.PI * 2;
      while (a < -Math.PI) a += Math.PI * 2;
      return a;
    };

    // Raycaster.intersectObjects does NOT skip invisible meshes, and the crate
    // is hidden unless the `crate` prop is set — without this guard, clicking
    // the empty air above the console on /dj would hit the invisible sleeves
    // and silently start a mix.
    const visibleHit = (hits) =>
      hits.find((h) => {
        for (let o = h.object; o; o = o.parent) if (o.visible === false) return undefined;
        return true;
      });
    const onDown = (e) => {
      const rect = toNdc(e);
      raycaster.setFromCamera(ndc, activeCamera);
      const hits = raycaster.intersectObjects(con.hitMeshes, false);
      const hit0 = visibleHit(hits);
      if (!hit0) return;
      const control = hit0.object.userData.control;
      renderer.domElement.setPointerCapture?.(e.pointerId);
      if (control.type === "crate") {
        // Pulling a record from the shelf, restored from the DOM crate
        // (msbfwytg). The order matters: `incoming` must be read BEFORE mixTo
        // flips the crossfade target, and mixTo must run inside this pointer
        // handler's own call stack — it is the audio-unlock gesture.
        const incoming = ctrl.crossfade < 0.5 ? "b" : "a";
        mixTo(control.key);
        const tile = con.crateTiles[control.key];
        if (reduce || !tile) {
          landing[incoming] = 0.0001;
          return;
        }
        const m = tile.disc.clone();
        tile.disc.getWorldPosition(m.position);
        m.rotation.copy(tile.disc.rotation);
        scene.add(m);
        flights.push({ mesh: m, from: m.position.clone(), deck: incoming, t: 0 });
        return;
      }
      if (control.type === "power") {
        setHand(hit0.object, "power", true);
        toggleDeck(control.deck);
        return;
      }
      if (control.type === "platter") {
        const center = screenCenterOf(con.platters[control.deck], rect);
        drag = { ...control, center, prevAngle: Math.atan2(e.clientY - center.y, e.clientX - center.x) };
        audio.startScratch(control.deck);
        con.platters[control.deck].userData.scratching = true;
        setHand(con.platters[control.deck], "platter", true);
      } else if (control.type === "fader") {
        drag = { ...control, startY: e.clientY, startVal: ctrl.vol[control.deck] };
        setHand(con.faderCaps[control.deck], "fader", true);
      } else if (control.type === "knob") {
        drag = { ...control, startY: e.clientY, startVal: ctrl.eq[control.deck][control.band] };
        setHand(con.knobGroups[control.deck][control.band], "knob", true);
      } else if (control.type === "crossfader") {
        drag = { ...control, startX: e.clientX, startVal: ctrl.crossfade };
        ctrl.crossTarget = null;
        setHand(con.crossCap, "crossfader", true);
      }
    };

    const onMove = (e) => {
      const rect = toNdc(e);
      if (!drag) {
        // hover responses off (annotation msb98tdb): no highlight, no hand, no
        // cursor change. Press-and-drag below is untouched.
        if (!hoverRef.current) {
          clearHover();
          handState.active = false;
          renderer.domElement.style.cursor = "default";
          return;
        }
        raycaster.setFromCamera(ndc, activeCamera);
        const hit = visibleHit(raycaster.intersectObjects(con.hitMeshes, false));
        const lineMode = styleRef.current === "blueprint" || styleRef.current === "technical" || styleRef.current === "front";
        if (hit) {
          const mesh = hit.object;
          // hover highlight — swap this control's edge line to the accent colour
          if (mesh !== hoveredMesh) {
            clearHover();
            hoveredMesh = mesh;
            if (mesh.userData.edge) {
              const dk = mesh.userData.control.deck;
              hoverEdgeMat.color.setHex(dk === "a" ? WARM : dk === "b" ? COOL : 0x2f6ea0);
              mesh.userData.edge.material = hoverEdgeMat;
            }
          }
          setHand(mesh, mesh.userData.control.type, false);
          // the clay hand clashes with the line styles → normal pointer there
          renderer.domElement.style.cursor = lineMode ? "pointer" : "none";
        } else {
          clearHover();
          handState.active = false;
          renderer.domElement.style.cursor = "default";
        }
        return;
      }
      if (drag.type === "platter") {
        const a = Math.atan2(e.clientY - drag.center.y, e.clientX - drag.center.x);
        const d = angleWrap(a - drag.prevAngle);
        drag.prevAngle = a;
        con.platters[drag.deck].rotation.y += d;
        audio.moveScratch(drag.deck, d);
        setHand(con.platters[drag.deck], "platter", true);
      } else if (drag.type === "fader") {
        const dv = (drag.startY - e.clientY) / (rect.height * 0.55);
        ctrl.vol[drag.deck] = clamp(drag.startVal + dv);
        audio.setVolume(drag.deck, ctrl.vol[drag.deck]);
        setFaderVisual(drag.deck);
        setHand(con.faderCaps[drag.deck], "fader", true);
      } else if (drag.type === "knob") {
        const dv = (drag.startY - e.clientY) / (rect.height * 0.4);
        ctrl.eq[drag.deck][drag.band] = clamp(drag.startVal + dv, -1, 1);
        audio.setEq(drag.deck, drag.band, ctrl.eq[drag.deck][drag.band]);
        setKnobVisual(drag.deck, drag.band);
        setHand(con.knobGroups[drag.deck][drag.band], "knob", true);
      } else if (drag.type === "crossfader") {
        const dv = (e.clientX - drag.startX) / (rect.width * 0.5);
        ctrl.crossfade = clamp(drag.startVal + dv);
        audio.setCrossfade(ctrl.crossfade);
        setCrossVisual();
        setHand(con.crossCap, "crossfader", true);
        syncHud();
      }
    };

    const onUp = (e) => {
      if (drag?.type === "platter") {
        audio.endScratch(drag.deck);
        con.platters[drag.deck].userData.scratching = false;
      }
      handState.pressed = false; // relax the grip; next move re-poses the hand
      renderer.domElement.releasePointerCapture?.(e.pointerId);
      drag = null;
    };

    const el = renderer.domElement;
    // Hover drives the Front style's front->top camera swing, and with it
    // --dj-front, which the scan bar's reveal rides.
    //
    // The REGION is opt-in from the page, not hardcoded to the canvas (annotation
    // mscuenbz: "the entire area is the hover area for the dj console"). A page
    // that wants a bigger target marks an ancestor `data-dj-hover-root` and the
    // console listens there instead; without one it falls back to its own canvas,
    // so /dj and every other embed are unaffected.
    //
    // pointerenter/leave rather than pointerover/out on purpose: they do not fire
    // again as the pointer crosses between descendants, so moving from the footer
    // text onto the canvas is one continuous hover rather than a leave/enter pair
    // that would make the camera stutter.
    const hoverEl = el.closest("[data-dj-hover-root]") || el;
    let canvasHover = false;
    const onEnter = () => { canvasHover = hoverRef.current; };
    const onLeave = () => { canvasHover = false; };
    hoverEl.addEventListener("pointerenter", onEnter);
    hoverEl.addEventListener("pointerleave", onLeave);
    // scan: re-flip the transparent widget's ink when the page theme changes
    let themeObs;
    if (isScan) {
      themeObs = new MutationObserver(() => {
        const ink = scanInk();
        edgeMat.color.setHex(ink);
        engMat.color.setHex(ink);
        engFaint.color.setHex(ink);
        engCenter.color.setHex(ink);
      });
      themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    }
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);

    // ---- animation loop ----
    // THREE.Timer replaces the deprecated THREE.Clock (r183). connect() zeroes the
    // delta while the tab is hidden, so a long background stint never jumps.
    const timer = new THREE.Timer();
    timer.connect(document);
    const sm = { a: 0, b: 0 };
    let raf = 0;

    const tick = () => {
      raf = requestAnimationFrame(tick);
      timer.update();
      const dt = Math.min(timer.getDelta(), 0.05);

      if (ctrl.crossTarget != null) {
        const dir = Math.sign(ctrl.crossTarget - ctrl.crossfade);
        ctrl.crossfade = clamp(ctrl.crossfade + dir * dt * (ctrl.crossRate || 0.6));
        if ((dir >= 0 && ctrl.crossfade >= ctrl.crossTarget) || (dir <= 0 && ctrl.crossfade <= ctrl.crossTarget)) {
          ctrl.crossfade = ctrl.crossTarget;
          ctrl.crossTarget = null;
        }
        audio.setCrossfade(ctrl.crossfade);
        setCrossVisual();
        setHud((h) => ({ ...h, crossfade: ctrl.crossfade }));
      }

      const la = audio.level("a");
      const lb = audio.level("b");
      sm.a += (la - sm.a) * 0.35;
      sm.b += (lb - sm.b) * 0.35;
      const lev = { a: sm.a, b: sm.b };
      const bp = styleRef.current === "blueprint";

      // records in flight: sleeve -> platter with a small arc, laying flat as
      // they go; on arrival the deck plays its catch pop (landing).
      for (let i = flights.length - 1; i >= 0; i--) {
        const f = flights[i];
        f.t = Math.min(1, f.t + dt / 0.6);
        const e2 = f.t * f.t * (3 - 2 * f.t);
        con.platters[f.deck].getWorldPosition(_flyTo);
        _flyTo.y = 0.13;
        f.mesh.position.lerpVectors(f.from, _flyTo, e2);
        f.mesh.position.y += Math.sin(e2 * Math.PI) * 0.9;
        f.mesh.rotation.x = (Math.PI / 2) * (1 - e2);
        f.mesh.rotation.y += dt * 5;
        if (f.t >= 1) {
          scene.remove(f.mesh);
          landing[f.deck] = 0.0001;
          flights.splice(i, 1);
        }
      }
      for (const id of ["a", "b"]) {
        const spin = con.platters[id];
        const rate = ctrl.playing[id] ? 2.2 : isHero ? 0.5 : 0;
        // a freshly-landed record: a spin-up burst that decays + a quick scale pop
        let extra = 0;
        if (landing[id] > 0) {
          landing[id] = Math.min(1, landing[id] + dt / 0.8);
          const p = landing[id];
          spin.scale.setScalar(1 + Math.sin(p * Math.PI) * 0.14);
          extra = (1 - p) * 10;
          if (p >= 1) {
            landing[id] = 0;
            spin.scale.setScalar(1);
          }
        }
        if (!spin.userData.scratching && !reduce) spin.rotation.y += (rate + extra) * dt;
        const l = lev[id];
        const face = con.labels[id].material[1];
        if (face && "emissiveIntensity" in face) face.emissiveIntensity = l * (bp ? 1.4 : 0.5);
        const s = 1 + l * 0.04;
        con.labels[id].scale.set(s, 1, s);
        con.underglow[id].material.emissiveIntensity = ctrl.playing[id] ? (bp ? 0.8 : 0.5) + l * 1.6 : bp ? 0.3 : 0.15;
        con.powerPads[id].material.emissiveIntensity = ctrl.playing[id] ? (bp ? 0.7 : 0.4) + l * 1.2 : bp ? 0.25 : 0.1;
        const segs = con.vu[id];
        const lit = Math.round(l * segs.length);
        for (let i = 0; i < segs.length; i++) segs[i].material.emissiveIntensity = i < lit ? (bp ? 1.5 : 1.1) : bp ? 0.12 : 0.06;
        const pads = con.pads[id];
        for (let i = 0; i < pads.length; i++) {
          pads[i].material.emissiveIntensity = (bp ? 0.15 : 0.05) + Math.max(0, l - 0.15) * 1.2 * (0.6 + 0.4 * ((i + 1) / pads.length));
        }
      }

      // ease the 3D hand cursor toward the hovered / held control (or hide it).
      // Hidden entirely in the line styles (blueprint / technical) where a clay
      // hand would clash with the drawing.
      {
        const lineMode = styleRef.current === "blueprint" || styleRef.current === "technical" || styleRef.current === "front";
        const targetScale = handState.active && !lineMode ? 1 : 0.0001;
        const cs = hand.group.scale.x + (targetScale - hand.group.scale.x) * (reduce ? 1 : 0.25);
        hand.group.scale.setScalar(cs);
        if (handState.active) {
          _htmp.copy(handState.pos);
          if (!reduce && !handState.pressed) _htmp.y += Math.sin(timer.getElapsed() * 3) * 0.02; // gentle idle float
          hand.group.position.lerp(_htmp, reduce ? 1 : 0.2);
          hand.group.quaternion.slerp(handState.quat, reduce ? 1 : 0.25);
        }
      }

      // Front style: ease the camera between the front elevation and the top plan
      let frontEase = 0;
      if (styleRef.current === "front") {
        const target = canvasHover ? 1 : 0;
        frontProg = reduce ? target : frontProg + (target - frontProg) * Math.min(1, dt * 3.6);
        const e = frontProg * frontProg * (3 - 2 * frontProg); // smoothstep
        frontEase = e;
        _fpos.lerpVectors(FRONT_POS, TOP_POS, e);
        _fup.lerpVectors(FRONT_UP, TOP_UP, e).normalize();
        _ftgt.lerpVectors(FRONT_TGT, TOP_TGT, e);
        frontCamera.position.copy(_fpos);
        frontCamera.up.copy(_fup);
        frontCamera.lookAt(_ftgt);
      }
      // ONE CLOCK FOR BOTH OBJECTS (annotation msbovycc). The scan bar used to
      // fall on its own `transition: transform 0.3s` while the camera eased on
      // this lerp — 0.3s against roughly 0.8s, two unrelated motions that started
      // together and finished a half second apart. Publishing the camera's own
      // eased progress as a custom property and letting the bar read it makes
      // them literally the same animation: there is now one curve, computed once.
      //
      // Written GATED and QUANTISED, for the reason learned on the path marquee:
      // a custom-property write invalidates the whole subtree, and this element's
      // subtree is the HUD. At 0.02 steps it writes about 50 times across a
      // transition instead of every frame, for a sub-pixel difference.
      if (root) {
        const q = Math.round(frontEase * 50) / 50;
        if (q !== lastFront) {
          lastFront = q;
          root.style.setProperty("--dj-front", String(q));
        }
      }
      renderer.render(scene, activeCamera);
    };
    tick();

    // project a point above each disc to screen px so the DOM floater can anchor
    // there. The camera is fixed, so this only needs to run on setup + resize.
    const _proj = new THREE.Vector3();
    const projectDecks = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (!w || !h) return;
      // ortho isn't the render camera yet right after a style switch, so its
      // matrixWorldInverse is stale — refresh it before projecting.
      activeCamera.updateMatrixWorld();
      const topView = activeCamera === orthoCamera;
      const out = {};
      for (const id of ["a", "b"]) {
        con.platters[id].getWorldPosition(_proj);
        if (topView) {
          // top-down plan: screen-up is world -Z; sit in the paper margin above the deck
          _proj.y = 0;
          _proj.z = -2.45;
        } else {
          _proj.y = 1.7; // above the disc in the perspective view
        }
        _proj.project(activeCamera);
        out[id] = { x: (_proj.x * 0.5 + 0.5) * w, y: (-_proj.y * 0.5 + 0.5) * h };
      }
      setDeckAnchor(out);
    };
    projectDecks();
    // re-anchor the floaters after a style switch (perspective ↔ ortho top view)
    apiRef.current.reproject = projectDecks;

    const resize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      sizeOrtho();
      renderer.setSize(w, h);
      projectDecks();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    return () => {
      cancelAnimationFrame(raf);
      timer.dispose();
      flights.forEach((f) => scene.remove(f.mesh));
      flights.length = 0;
      ro.disconnect();
      themeObs?.disconnect();
      hoverEl.removeEventListener("pointerenter", onEnter);
      hoverEl.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      audio.dispose();
      // dispose live label textures
      for (const id of ["a", "b"]) {
        const m = con.labels[id].material;
        if (Array.isArray(m) && m[1]?.map?.name === "labelText") m[1].map.dispose();
      }
      styleMats.forEach((m) => m.dispose());
      edgeGeoms.forEach((g2) => g2.dispose());
      edgeMat.dispose();
      hoverEdgeMat.dispose();
      engGeoms.forEach((g2) => g2.dispose());
      engMat.dispose();
      engFaint.dispose();
      grid.geometry.dispose();
      grid.material.dispose();
      gridEng.geometry.dispose();
      gridEng.material.dispose();
      Object.values(TEX).forEach((t) => t.dispose());
      hand.group.traverse((o) => o.geometry && o.geometry.dispose());
      hand.mat.dispose();
      con.dispose();
      floor.geometry.dispose();
      floor.material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce, isHero]);

  // ---- outward-facing handles (both optional, both no-ops when unused) ----
  // The ref object itself is handed over rather than a snapshot of its contents,
  // because the scene effect populates apiRef.current after this runs and would
  // otherwise hand back an empty object.
  useEffect(() => {
    if (!onApi) return undefined;
    onApi(apiRef);
    return () => onApi(null);
  }, [onApi]);

  // syncHud only fires on discrete transport events, never per frame, so this is
  // a handful of calls across a session rather than a render loop.
  useEffect(() => {
    onDecks?.({ deck: hud.deck, playing: hud.playing });
  }, [hud.deck, hud.playing, onDecks]);

  // apply style changes to the already-built scene, then re-anchor the disc
  // floaters (the Technical view swaps to an orthographic top camera)
  useEffect(() => {
    apiRef.current.setStyle?.(style);
    apiRef.current.reproject?.();
  }, [style]);

  // press "u" to show/hide the song + controls overlay (it starts hidden)
  useEffect(() => {
    const onKey = (e) => {
      if ((e.key === "u" || e.key === "U") && !e.metaKey && !e.ctrlKey && !e.altKey) setShowUI((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ---- auto-mix loop (scan widget) ----
  const AM_METHODS = ["Blend", "Bass swap", "Cut"];
  const amIdleDeck = nowDeck === "a" ? "b" : "a";
  const clearAmTimers = () => {
    clearTimeout(amTimers.current.mix);
    clearInterval(amTimers.current.tick);
    clearTimeout(amTimers.current.done);
  };
  const amWaitSec = 8; // fallback idle time if waveform analysis isn't ready yet
  // (re)arm the countdown + mix timer for a given wait, replacing any prior schedule
  const scheduleMix = (deck, waitSec) => {
    clearAmTimers();
    setAmCountdown(Math.ceil(waitSec));
    amTimers.current.tick = setInterval(
      () => setAmCountdown((c) => Math.max(0, c - 1)),
      1000
    );
    amTimers.current.mix = setTimeout(() => amRunTransition(deck), waitSec * 1000);
  };
  // queue a song into the empty "up next" slot and arm the auto-transition timer.
  // Fires on a fallback timer immediately (so the UI never stalls), then — once the
  // outgoing track's waveform has been analysed — re-aligns to whatever the track's
  // own structure offers up: a breakdown to blend through, or a drop to cut on. No
  // fixed wait — the transition rides the music, however long that takes.
  const amQueueSong = (key) => {
    const deck = amIdleDeck;
    const outgoing = trackByKey(hud.deck[nowDeck]);
    apiRef.current.setCrossNow?.(nowDeck === "a" ? 0 : 1); // seat fully on the live deck
    if (!hud.playing[nowDeck]) apiRef.current.toggleDeck?.(nowDeck); // something to mix from
    apiRef.current.queueTo?.(deck, key); // load + play the incoming deck (silent, faded down)
    setAmQueued(key);
    setAmPickOpen(false);
    setAmPhase("queued");
    amPhaseRef.current = "queued";
    amAnalysisRef.current = null;
    amTargetRef.current = null;
    scheduleMix(deck, amWaitSec);
    analyzeTrack(outgoing)
      .then((analysis) => {
        if (amPhaseRef.current !== "queued") return; // cancelled, or already fired
        amAnalysisRef.current = analysis;
        const elapsed = apiRef.current.getDeckTime?.(nowDeck) || 0;
        const target = findBestTransitionPoint(analysis, elapsed, { bars: 8, horizonSec: 180 });
        amTargetRef.current = target;
        scheduleMix(deck, Math.max(1, target.atSec - elapsed));
      })
      .catch(() => {}); // no waveform data — the fallback timer already covers it
  };
  // fire the DJ transition to the queued deck, then swap roles + reset the slot.
  // Method + duration follow the transition point findBestTransitionPoint chose:
  // a breakdown gets a long blend (the safe pro move), a drop gets a hard cut,
  // anything in between gets a bass swap. No analysis yet → round-robins as before.
  const amRunTransition = (deck) => {
    clearInterval(amTimers.current.tick);
    const analysis = amAnalysisRef.current;
    const target = amTargetRef.current;
    let label;
    if (target) {
      label = target.kind === "breakdown" ? "Blend" : target.kind === "drop" ? "Cut" : "Bass swap";
    } else {
      label = AM_METHODS[amMethodIx.current % AM_METHODS.length];
    }
    const dur = analysis
      ? Math.min(12, Math.max(label === "Cut" ? 0.5 : 1.5, (60 / analysis.bpm) * (label === "Cut" ? 1 : label === "Bass swap" ? 8 : 16)))
      : label === "Cut" ? 0.8 : label === "Bass swap" ? 3.6 : 4.6;
    setAmMethod(label);
    setAmPhase("mixing");
    amPhaseRef.current = "mixing";
    apiRef.current.crossfadeTo?.(deck, dur, label.toLowerCase().replace(" ", ""));
    amTimers.current.done = setTimeout(() => {
      apiRef.current.stopDeck?.(nowDeck); // free the outgoing deck
      setNowDeck(deck);
      setAmQueued(null);
      setAmPhase("idle");
      amPhaseRef.current = "idle";
      amAnalysisRef.current = null;
      amTargetRef.current = null;
      amMethodIx.current += 1;
    }, dur * 1000 + 350);
  };
  const amCancel = () => {
    clearAmTimers();
    setAmQueued(null);
    setAmPhase("idle");
    amPhaseRef.current = "idle";
    amAnalysisRef.current = null;
    amTargetRef.current = null;
    setAmPickOpen(false);
  };
  useEffect(() => () => clearAmTimers(), []);

  const deckOf = (k) => (hud.deck.a === k ? "a" : hud.deck.b === k ? "b" : null);
  const fmtPitch = (v) => {
    const p = v * 25; // ±1 → ±25%
    return `${p > 0 ? "+" : ""}${p.toFixed(1)}%`;
  };

  return (
    <div className={`dj dj--${style} ${isScan ? "dj--scan" : isHero ? "dj--hero" : "dj--page"}`}>
      <div className="dj__stage" ref={mountRef} />

      {/* compact scan widget: two parallel "now playing" slots — the live deck and an
          empty "up next" you tap to queue, which then auto-mixes across on a timer.
          `controls={false}` (the booth) hides this whole bar (annotation msan1dl6). */}
      {isScan && controls && (
        <div className="dj__scanbar dj__scanbar--dual" data-feedback-toolbar="true">
          {/* slot 1 — the live deck */}
          <div className="dj__scan-slot">
            <button
              type="button"
              className={`dj__scan-play${hud.playing[nowDeck] ? " is-live" : ""}`}
              onClick={() => apiRef.current.toggleDeck?.(nowDeck)}
              aria-label={hud.playing[nowDeck] ? "Pause" : "Play"}
            >
              {hud.playing[nowDeck] ? "❚❚" : "▶"}
            </button>
            <span className="dj__scan-meta">
              <span className="dj__scan-eyebrow">{hud.playing[nowDeck] ? "Now playing" : "Cued"}</span>
              <span className="dj__scan-name">{trackByKey(hud.deck[nowDeck]).name}</span>
            </span>
          </div>

          {/* slot 2 — up next / queue + auto-mix */}
          <div className={`dj__scan-slot dj__scan-slot--next is-${amPhase}`}>
            {amPhase === "idle" ? (
              <button
                type="button"
                className="dj__scan-add"
                onClick={() => setAmPickOpen((o) => !o)}
                aria-expanded={amPickOpen}
              >
                <span className="dj__scan-plus" aria-hidden="true">+</span>
                <span className="dj__scan-meta">
                  <span className="dj__scan-eyebrow">Up next</span>
                  <span className="dj__scan-name dj__scan-name--empty">Tap to queue a song</span>
                </span>
              </button>
            ) : (
              <div className="dj__scan-meta dj__scan-upnext">
                <span className="dj__scan-eyebrow">
                  {amPhase === "mixing" ? `Mixing · ${amMethod}` : `Up next · ${amCountdown}s`}
                </span>
                <span className="dj__scan-name">{trackByKey(amQueued).name}</span>
                {amPhase === "queued" && (
                  <button type="button" className="dj__scan-cancel" onClick={amCancel} aria-label="Cancel queue">✕</button>
                )}
                {amPhase === "mixing" && <span className="dj__scan-mixing" aria-hidden="true" />}
              </div>
            )}
            {amPickOpen && amPhase === "idle" && (
              <div className="dj__scan-picker">
                {TRACKS.filter((t) => t.key !== hud.deck[nowDeck]).map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    className="dj__scan-pick"
                    style={{ "--chip": t.accent }}
                    onClick={() => amQueueSong(t.key)}
                  >
                    <span className="dj__scan-pick-genre">{t.genre}</span>
                    <span className="dj__scan-pick-name">{t.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* per-disc floaters — now playing + a tap-to-queue song list */}
      {!isScan &&
        deckAnchor &&
        ["a", "b"].map((id) => {
          const tk = trackByKey(hud.deck[id]);
          const anchor = deckAnchor[id];
          const open = queueOpen[id];
          return (
            <div
              key={id}
              className={`dj__disc dj__disc--${id}${hud.playing[id] ? " is-live" : ""}${open ? " is-open" : ""}`}
              style={{ left: `${anchor.x}px`, top: `${anchor.y}px` }}
              data-feedback-toolbar="true"
            >
              <div className="dj__disc-bar">
                <button
                  type="button"
                  className="dj__disc-play"
                  onClick={() => apiRef.current.toggleDeck?.(id)}
                  aria-label={hud.playing[id] ? "Pause" : "Play"}
                >
                  {hud.playing[id] ? "❚❚" : "▶"}
                </button>
                <button type="button" className="dj__disc-now" onClick={() => setQueueOpen((q) => ({ ...q, [id]: !q[id] }))}>
                  <span className="dj__disc-eyebrow">{hud.playing[id] ? "Now playing" : "Cued"} · Deck {id.toUpperCase()}</span>
                  <span className="dj__disc-name">{tk.name}</span>
                </button>
                <span className="dj__disc-caret" aria-hidden="true">{open ? "▾" : "▸"}</span>
              </div>
              {open && (
                <div className="dj__disc-queue">
                  {TRACKS.map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      className={`dj__disc-track${t.key === hud.deck[id] ? " is-current" : ""}`}
                      style={{ "--chip": t.accent }}
                      onClick={() => {
                        apiRef.current.queueTo?.(id, t.key);
                        setQueueOpen((q) => ({ ...q, [id]: false }));
                      }}
                    >
                      <span className="dj__disc-track-genre">{t.genre}</span>
                      <span className="dj__disc-track-name">{t.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

      {!isScan && (
        <header className="dj__head">
          {onBack && (
            <button type="button" className="dj__back" onClick={onBack}>
              Back
            </button>
          )}
          <p className="dj__eyebrow">Interactive · WebGL</p>
          <h1 className="dj__title">DJ Console</h1>
          {isHero &&
            (onOpen ? (
              <button type="button" className="dj__open" onClick={onOpen}>
                Full screen ↗
              </button>
            ) : (
              <a className="dj__open" href="/dj">
                Full screen ↗
              </a>
            ))}
        </header>
      )}

      {/* render-style toggle — always visible (independent of the U hide-toggle) */}
      {!isScan && (
        <div className="dj__styles" data-feedback-toolbar="true" role="group" aria-label="Render style">
          {STYLE_LIST.map((s) => (
            <button
              key={s.key}
              type="button"
              className={`dj__style${style === s.key ? " is-active" : ""}`}
              onClick={() => setStyle(s.key)}
              aria-pressed={style === s.key}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {!isScan && showUI && !started && (
        <div className="dj__hint" aria-hidden="true">
          <span>Tap a song below to start mixing</span>
        </div>
      )}

      {!isScan && showUI && (
      <div className="dj__dock">
        {/* THE CRATE — one click blends into the next song */}
        <div className="dj__crate" data-feedback-toolbar="true">
          <div className="dj__crate-rail">
            {TRACKS.map((t) => {
              const on = deckOf(t.key);
              const live = on && hud.playing[on];
              return (
                <button
                  key={t.key}
                  type="button"
                  className={`dj__song${on ? " is-loaded" : ""}${live ? " is-live" : ""}`}
                  style={{ "--chip": t.accent }}
                  onClick={() => apiRef.current.mixTo?.(t.key)}
                  title={`Mix into ${t.name}`}
                >
                  <span className="dj__song-top">
                    <span className="dj__song-genre">{t.genre}</span>
                    {on && <span className={`dj__song-tag dj__song-tag--${on}`}>{on.toUpperCase()}</span>}
                  </span>
                  <span className="dj__song-name">{t.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="dj__transport" data-feedback-toolbar="true">
          <div className="dj__decks">
            {["a", "b"].map((id) => {
              const tk = trackByKey(hud.deck[id]);
              return (
                <button
                  key={id}
                  type="button"
                  className={`dj__deck dj__deck--${id}${hud.playing[id] ? " is-live" : ""}`}
                  onClick={() => apiRef.current.toggleDeck?.(id)}
                >
                  <span className="dj__deck-dot" />
                  <span className="dj__deck-name">Deck {id.toUpperCase()}</span>
                  <span className="dj__deck-state">{hud.playing[id] ? tk.name : `${tk.name} · paused`}</span>
                </button>
              );
            })}
          </div>

          <div className="dj__meta">
            <div className="dj__xf">
              <span>A</span>
              <div className="dj__xf-track">
                <div className="dj__xf-fill" style={{ left: `${hud.crossfade * 100}%` }} />
              </div>
              <span>B</span>
            </div>
            <div className="dj__pitch">
              {["a", "b"].map((id) => (
                <label
                  key={id}
                  className={`dj__pitch-ch dj__pitch-ch--${id}`}
                  title={`Deck ${id.toUpperCase()} pitch — nudge to beat-match, double-click to reset`}
                >
                  <span className="dj__pitch-lbl">{id.toUpperCase()}</span>
                  <input
                    type="range"
                    min="-1"
                    max="1"
                    step="0.002"
                    value={hud.pitch[id]}
                    onChange={(e) => apiRef.current.setPitch?.(id, parseFloat(e.target.value))}
                    onDoubleClick={() => apiRef.current.setPitch?.(id, 0)}
                  />
                  <span className="dj__pitch-val">{fmtPitch(hud.pitch[id])}</span>
                </label>
              ))}
            </div>
            <label className="dj__master">
              <span>Master</span>
              <input type="range" min="0" max="1" step="0.01" value={hud.master} onChange={(e) => apiRef.current.setMaster?.(parseFloat(e.target.value))} />
            </label>
          </div>
        </div>

        <p className="dj__help">
          <b>Click a song</b> to blend into it · <b>pitch</b> nudges a deck to beat-match · drag a <b>platter</b> to scratch · <b>render style</b> top-right.
        </p>
      </div>
      )}
    </div>
  );
}
