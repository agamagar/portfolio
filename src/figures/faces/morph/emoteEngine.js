// The hero head's performance engine (2026-10-12, Agam: "make the face emotions on the homepage a
// little more dramatic: more dynamic and complex movement of the face itself").
//
// Not keyframes any more: every channel (the 18 shape keys, the head's roll / pitch / yaw / lift /
// shift, the body's squash and stretch, the gaze) is a damped spring chasing a target, so
// overshoot and settle come with the physics, and each channel group has its own stiffness and
// damping. An emote is a script of beats that set targets:
//   - ANTICIPATION: a small counter-move before the main beat (a squint and a dip before a grin,
//     a blink and a squash before a surprise);
//   - OVERLAPPING ACTION: each group lags the beat by its own delay (brows first, eyes +25 ms, the
//     mouth +95, the head +170, the squash +60), so the face "builds" instead of snapping;
//   - FOLLOW-THROUGH: the springs overshoot and settle; the head is the softest, so it lands last;
//   - SQUASH AND STRETCH on the body volume (sy / sx) on the big beats;
//   - STRONGER PEAKS: key weights run to about 1.2-1.4, capped per key where the mesh breaks
//     (measured on clay and noir, 12 Oct);
//   - VARIATION: a random speed, amplitude, and mirroring each time, lopsided grins, and CHAINS
//     (surprised into laugh, think into nod, look around into grin...), so it never loops the same.
// Under it runs a continuous AMBIENT layer: breathing, a slow sway, eye darts, and blinks that
// sometimes double.
//
// The head stays clean by LIMITS (measured): the far ear opens when tilt, pitch and yaw stack, so
// the three share a budget; the neck yaw is capped one way; and the canvas frame only has so much
// room, so lift, shift and scale are clamped per rig (noir has 8 px on its left, so it can shift
// right but not left and cannot widen). The drama comes from roll, lift, squash and fast eased
// timing, not from big turns.

export const KEYS = ["eyeBlinkLeft", "eyeBlinkRight", "eyeSquintLeft", "eyeSquintRight", "eyeWideLeft", "eyeWideRight",
  "browInnerUp", "browOuterUpLeft", "browOuterUpRight", "browDownLeft", "browDownRight",
  "jawOpen", "mouthSmileLeft", "mouthSmileRight", "mouthFrownLeft", "mouthFrownRight", "mouthPucker", "cheekPuff"];
const HEAD = ["tilt", "pitch", "yaw", "hy", "hx", "sx", "sy", "eyeX", "eyeY"];
const CH = [...KEYS, ...HEAD];

// the most each key can take before the mesh breaks (looked at on both rigs, 12 Oct)
const CAP = { mouthSmile: 1.45, jawOpen: 1.35, eyeWide: 1.5, browInnerUp: 1.4, browOuterUp: 1.4, browDown: 1.4, mouthFrown: 1.5, mouthPucker: 1.25, cheekPuff: 1.45, eyeSquint: 1.2, eyeBlink: 1 };
const CAP_NOIR = { ...CAP, browInnerUp: 1.3, browOuterUp: 1.3, browDown: 1.3, eyeSquint: 1.0 };
const capOf = (k, rig) => (rig === "noir" ? CAP_NOIR : CAP)[k.replace(/(Left|Right)$/, "")] ?? 1;

// where the head can go inside the canvas frame without clipping (measured per rig)
const LIM = {
  clay: { tilt: [-0.12, 0.12], pitch: [-0.08, 0.09], yaw: [-0.03, 0.1], hy: [-0.12, 0.08], hx: [-0.06, 0.06], sx: [0.94, 1.08], sy: [0.92, 1.03] },
  noir: { tilt: [-0.12, 0.12], pitch: [-0.08, 0.09], yaw: [-0.03, 0.1], hy: [-0.12, 0.08], hx: [0, 0.1], sx: [0.94, 1.0], sy: [0.92, 1.03] },
};
const STACK = 0.125; // tilt, pitch and yaw share this budget (see the head limits above)
// KEEPING THE HEAD IN THE FRAME. The canvas has 29 px above the hair (both rigs) and, on the left,
// 40 px (clay) or only 7 (noir's hat brim). Calibrated on the renders (px of reach per unit; 12 Oct):
// lift and stretch eat the headroom together; roll, yaw and widening push the left edge out.
const REACH = {
  clay: { top: { hy: 290, sy: 770, tilt: 45, tiltNeg: 0, pitchBack: 215 }, left: { tilt: 145, yaw: 90, sx: 350, hxBack: 250 }, topBudget: 23, leftBudget: 34 },
  noir: { top: { hy: 230, sy: 630, tilt: 140, tiltNeg: 60, pitchBack: 0 }, left: { tilt: 240, yaw: 60, sx: 350, hxBack: 250 }, topBudget: 23, leftBudget: 0 },
};
const PX_PER_HX = 230; // how far a unit of head shift moves it sideways, px

// spring stiffness (rad/s) and damping ratio per channel group; below 1 overshoots
const groupOf = (ch) => {
  if (/^brow/.test(ch)) return "brows";
  if (/^eye(Blink|Squint|Wide)/.test(ch)) return "eyes";
  if (/^(mouth|jaw|cheek)/.test(ch)) return "mouth";
  if (ch === "eyeX" || ch === "eyeY") return "gaze";
  if (ch === "sx" || ch === "sy") return "squash";
  return "head";
};
const SPRING = { brows: [24, 0.5], eyes: [38, 0.75], mouth: [19, 0.5], head: [15, 0.42], squash: [21, 0.33], gaze: [70, 0.9] };
const LAG = { brows: 0, eyes: 25, squash: 60, mouth: 95, head: 170, gaze: 0 };
const spring = (ch) => { const g = groupOf(ch); return ch === "hy" || ch === "hx" ? [17, 0.4] : SPRING[g]; };

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

// ---- the emotes: beats [time ms, { channel: value }], the last beat's time is the duration ----
// L / R helpers: a pair of keys; `m` mirrors left and right (a random half of the time)
const pair = (base, v, m, lop = 0) => ({ [base + (m ? "Right" : "Left")]: v * (1 + lop), [base + (m ? "Left" : "Right")]: v * (1 - lop) });
const both = (base, v) => ({ [base + "Left"]: v, [base + "Right"]: v });
const R = (a, b, r) => a + (b - a) * r();

const BUILD = {
  grin: (r, m) => {
    const lop = r() < 0.5 ? R(0.2, 0.45, r) : 0; // a lopsided grin half of the time
    return [
      [0, { ...both("mouthSmile", 0.2), ...both("eyeSquint", 0.2), pitch: -0.025, sy: 0.992 }], // anticipation
      [170, { ...pair("mouthSmile", R(1.25, 1.45, r), m, lop), ...both("eyeSquint", R(0.7, 1.0, r)), jawOpen: R(0.25, 0.45, r), ...both("browOuterUp", 0.5), tilt: (m ? -1 : 1) * 0.075, hy: 0.05, sy: 1.02, sx: 1.015, pitch: 0.03 }],
      [560, { ...pair("mouthSmile", 1.2, m, lop), jawOpen: 0.25, hy: 0.03, sy: 1.01 }],
      [1050, {}],
    ];
  },
  surprised: (r, m) => [
    [0, { ...both("eyeBlink", 0.55), sy: 0.975, sx: 1.02, pitch: 0.03, hy: -0.02 }], // the blink and the squash before
    [110, { ...both("eyeBlink", 0), ...both("eyeWide", 1.5), browInnerUp: 1.4, ...both("browOuterUp", 1.3), jawOpen: R(1.0, 1.3, r), mouthPucker: 0.6, hy: 0.07, sy: 1.028, sx: 0.985, pitch: -0.02 }],
    [430, { ...both("eyeWide", 1.15), browInnerUp: 1.1, ...both("browOuterUp", 1.0), jawOpen: 0.85, hy: 0.04, sy: 1.01, sx: 1 }],
    [1050, {}],
  ],
  laugh: (r, m) => [
    [0, { ...both("mouthSmile", 0.6), pitch: -0.03, sy: 0.985, hy: -0.02 }], // the breath in
    [140, { ...both("mouthSmile", 1.4), ...both("eyeBlink", 1), jawOpen: 1.15, ...both("browOuterUp", 0.5), hy: 0.06, tilt: 0.06, sy: 1.015 }],
    [310, { jawOpen: 0.45, hy: 0, sy: 0.99 }],
    [450, { jawOpen: 1.15, hy: 0.065, tilt: -0.055, sy: 1.015 }],
    [590, { jawOpen: 0.45, hy: 0.005, sy: 0.99 }],
    [730, { jawOpen: 1.0, hy: 0.055, tilt: 0.05, sy: 1.012 }],
    [870, { jawOpen: 0.35, hy: 0.01, sy: 0.995 }],
    [1010, { jawOpen: 0.8, hy: 0.04, tilt: -0.03, sy: 1.008 }],
    [1170, { jawOpen: 0.3, hy: 0.01 }],
    [1500, {}],
  ],
  nod: (r, m) => [
    [0, { pitch: -0.03, ...both("mouthSmile", 0.2) }],
    [120, { pitch: 0.075, hy: -0.03, ...both("mouthSmile", 0.6), ...both("browOuterUp", 0.3) }],
    [310, { pitch: -0.025, hy: 0.01 }],
    [450, { pitch: R(0.05, 0.07, r), hy: -0.02, ...both("mouthSmile", 0.5) }],
    [640, { pitch: 0 }],
    [900, {}],
  ],
  lookAround: (r, m) => {
    const s = m ? -1 : 1; // which way first
    return [
      [0, { [m ? "browOuterUpLeft" : "browOuterUpRight"]: 0.6 }],
      [40, { eyeX: -0.045 * s }], // the eyes lead
      [210, { yaw: -0.03 * (s > 0 ? 1 : -2.3), tilt: 0.05 * s }], // the head follows
      [760, { eyeX: 0.045 * s, [m ? "browOuterUpRight" : "browOuterUpLeft"]: 0.7, [m ? "browOuterUpLeft" : "browOuterUpRight"]: 0 }],
      [930, { yaw: 0.075 * (s > 0 ? 1 : -0.4), tilt: -0.05 * s }],
      [1400, { eyeX: 0, ...both("browOuterUp", 0.2) }],
      [1750, {}],
    ];
  },
  think: (r, m) => [
    [0, { ...both("eyeSquint", 0.3), pitch: 0.015 }],
    [90, { eyeX: 0.03, eyeY: 0.035, [m ? "browOuterUpRight" : "browOuterUpLeft"]: 1.3, [m ? "browDownLeft" : "browDownRight"]: 0.55, mouthPucker: 0.7, [m ? "mouthSmileRight" : "mouthSmileLeft"]: 0.35, ...both("eyeSquint", 0.1) }],
    [280, { yaw: 0.07, pitch: -0.05, tilt: (m ? 1 : -1) * 0.07, hy: 0.012 }],
    [1500, {}],
  ],
  shy: (r, m) => [
    [0, { pitch: -0.012, ...both("mouthSmile", 0.1) }],
    [140, { tilt: (m ? -1 : 1) * 0.09, ...both("eyeSquint", 0.75), eyeY: -0.025, ...both("mouthSmile", 0.55), mouthPucker: 0.3, cheekPuff: 0.45, hy: -0.05, sy: 0.985, browInnerUp: 0.5 }],
    [520, { hy: -0.045, tilt: (m ? -1 : 1) * 0.085, hx: 0.008 }],
    [880, { tilt: (m ? -1 : 1) * 0.06, hx: 0.012, pitch: 0.02 }],
    [1300, {}],
  ],
  sad: (r, m) => [
    [0, { pitch: -0.02, ...both("mouthSmile", 0.15) }], // a flicker of hope first
    [160, { ...both("mouthFrown", 1.5), browInnerUp: 1.4, ...both("eyeSquint", 0.5), eyeY: -0.035, hy: -0.06, tilt: (m ? -1 : 1) * 0.06, sy: 0.985, pitch: 0.04 }],
    [950, { sy: 0.975, hy: -0.075, ...both("mouthFrown", 1.3) }], // the sigh
    [1600, {}],
  ],
  angry: (r, m) => [
    [0, { ...both("browOuterUp", 0.4), pitch: -0.02 }], // rears back
    [110, { ...both("browDown", 1.4), ...both("mouthFrown", 1.2), ...both("eyeSquint", 1.0), pitch: 0.045, hy: -0.02, sx: 1.03, sy: 1.005 }],
    [340, { tilt: 0.06, hx: 0.02 }], // the shake
    [460, { tilt: -0.06, hx: -0.02 }],
    [570, { tilt: 0.05, hx: 0.015 }],
    [680, { tilt: -0.04, hx: -0.012 }],
    [840, { tilt: 0, hx: 0, sx: 1.015 }],
    [1300, {}],
  ],
  puff: (r, m) => [
    [0, { mouthPucker: 0.3, ...both("eyeWide", 0.3), sy: 0.99 }],
    [130, { cheekPuff: 1.45, mouthPucker: 1.25, ...both("eyeWide", 0.6), sx: 1.04, hy: 0.04, ...both("browOuterUp", 0.3) }],
    [640, {}],
    [760, { jawOpen: 0.8, cheekPuff: 0, mouthPucker: 0, ...both("eyeSquint", 0.5), sy: 1.02, sx: 1.0, hy: 0.06 }], // the pop
    [1100, {}],
  ],
};
// chains: [emote, start as a share of the one before]
const CHAINS = {
  surprisedLaugh: [["surprised", 0], ["laugh", 0.62]],
  thinkNod: [["think", 0], ["nod", 0.72]],
  lookGrin: [["lookAround", 0], ["grin", 0.78]],
  shyGrin: [["shy", 0], ["grin", 0.8]],
  angryPuff: [["angry", 0], ["puff", 0.8]],
  sadHope: [["sad", 0], ["grin", 0.85]],
};
export const EMOTE_NAMES = Object.keys(BUILD);
export const CHAIN_NAMES = Object.keys(CHAINS);
// (wink stays out: Agam removed it, 12 Oct)
export const FIRST = "grin";
export const IDLE = [...EMOTE_NAMES, ...CHAIN_NAMES, ...CHAIN_NAMES]; // chains twice as likely: they read richer
export const HOVER = ["grin", "nod", "lookAround", "think", "shy", "sad", "angry", "surprised", "lookGrin", "thinkNod"];

// a small seeded generator, so a run can be replayed
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

export function createEmoteEngine({ seed = (Math.random() * 1e9) | 0 } = {}) {
  const r = rng(seed);
  const pos = {}, vel = {}, tgt = {}; // the emote layer
  const apos = {}, avel = {}, atgt = {}; // the ambient layer
  for (const c of CH) { pos[c] = 0; vel[c] = 0; tgt[c] = 0; apos[c] = 0; avel[c] = 0; atgt[c] = 0; }
  pos.sx = pos.sy = tgt.sx = tgt.sy = 1;
  let clock = 0, events = [], playingUntil = 0, last = null, ambient = true, rig = "clay";
  // ambient timers
  let tBlink = 1200 + r() * 2200, tDart = 900 + r() * 1500, blinkPhase = [], t0 = r() * 100;
  const noise = (t, k) => Math.sin(t * 0.7 + k) * 0.5 + Math.sin(t * 1.31 + k * 2.1) * 0.3 + Math.sin(t * 0.37 + k * 0.7) * 0.2;

  const integrate = (P, V, T, dt) => {
    let rest = dt;
    while (rest > 0) {
      const h = Math.min(rest, 4) / 1000; rest -= 4;
      for (const c of CH) { const [w, z] = spring(c); const a = w * w * (T[c] - P[c]) - 2 * z * w * V[c]; V[c] += a * h; P[c] += V[c] * h; }
    }
  };

  // schedule a script: beats get each channel's group lag; the last beat releases everything
  // keep: channels a later part of a chain drives (the release must not undo them)
  function schedule(beats, at, scale, amp, keep = new Set()) {
    const touched = new Set();
    for (const [, spec] of beats) for (const c in spec) touched.add(c);
    const dur = beats[beats.length - 1][0] * scale;
    beats.forEach(([t, spec], i) => {
      const final = i === beats.length - 1;
      const set = {};
      if (final) for (const c of touched) if (!keep.has(c)) set[c] = c === "sx" || c === "sy" ? 1 : 0;
      for (const c in spec) set[c] = KEYS.includes(c) ? spec[c] * amp : spec[c];
      for (const c in set) events.push({ at: at + t * scale + LAG[groupOf(c)] * scale, c, v: set[c] });
    });
    return dur;
  }

  return {
    // a name from EMOTE_NAMES or CHAIN_NAMES; quick: the hover version (shorter, snappier)
    play(name, { quick = false } = {}) {
      if (clock < playingUntil) return false;
      const parts = CHAINS[name] || [[name, 0]];
      const scale = R(0.9, 1.15, r) * (quick ? 0.72 : 1);
      const amp = R(0.92, 1.1, r);
      const scripts = parts.map(([n]) => BUILD[n](r, r() < 0.5));
      let start = clock, end = clock, prevDur = 0;
      scripts.forEach((beats, i) => {
        if (i > 0) start += prevDur * parts[i][1];
        const later = new Set();
        for (let j = i + 1; j < scripts.length; j++) for (const [, spec] of scripts[j]) for (const c in spec) later.add(c);
        prevDur = schedule(beats, start, scale, amp, later);
        end = Math.max(end, start + prevDur);
      });
      playingUntil = end + 80;
      events.sort((a, b) => a.at - b.at);
      return true;
    },
    active: () => clock < playingUntil,
    reset() { events = []; playingUntil = 0; for (const c of CH) { pos[c] = tgt[c] = c === "sx" || c === "sy" ? 1 : 0; vel[c] = 0; apos[c] = atgt[c] = avel[c] = 0; } },
    setAmbient(on) { ambient = on; },
    // advance dt ms; returns the pose for faceRig3D's pose (head moves in radians and units, keys by name)
    tick(dt, rigName = "clay") {
      rig = rigName; clock += dt;
      while (events.length && events[0].at <= clock) { const e = events.shift(); tgt[e.c] = e.v; }
      integrate(pos, vel, tgt, dt);
      // ambient: breathing, a slow sway, eye darts, blinks (some double); quiet while an emote runs
      const t = (clock / 1000) + t0, calm = clock < playingUntil ? 0.3 : 1;
      if (ambient) {
        tBlink -= dt; tDart -= dt;
        if (tDart <= 0) { atgt.eyeX = R(-0.022, 0.022, r) * calm; atgt.eyeY = R(-0.012, 0.012, r) * calm; tDart = R(900, 3200, r); if (r() < 0.3) { atgt.eyeX = 0; atgt.eyeY = 0; } }
        if (tBlink <= 0 && clock >= playingUntil) { blinkPhase = r() < 0.2 ? [0, 170] : [0]; tBlink = R(2600, 6200, r); blinkPhase = blinkPhase.map((x) => clock + x); }
        let blink = 0; for (const b of blinkPhase) if (clock >= b && clock < b + 90) blink = 1;
        blinkPhase = blinkPhase.filter((b) => clock < b + 90);
        atgt.eyeBlinkLeft = atgt.eyeBlinkRight = blink;
        atgt.sy = 0.006 * Math.sin(t * 1.75) * calm; // breathing
        atgt.hy = 0.004 * Math.sin(t * 1.75 + 0.6) * calm;
        atgt.tilt = 0.012 * noise(t, 1) * calm; atgt.hx = (rig === "noir" ? 0.003 : 0.004) * (noise(t, 2) + (rig === "noir" ? 1 : 0)) * calm; atgt.yaw = 0.008 * noise(t, 3) * calm; atgt.pitch = 0.008 * noise(t, 4) * calm;
      } else for (const c of CH) atgt[c] = 0;
      integrate(apos, avel, atgt, dt);
      // sum, cap, clamp, share the rotation budget
      const L = LIM[rig] || LIM.clay;
      const out = {};
      const keys = {};
      for (const k of KEYS) keys[k] = clamp(pos[k] + apos[k] * (/Blink/.test(k) && pos[k] > 0.3 ? 0 : 1), 0, capOf(k, rig));
      let { tilt, pitch, yaw } = { tilt: pos.tilt + apos.tilt, pitch: pos.pitch + apos.pitch, yaw: pos.yaw + apos.yaw };
      tilt = clamp(tilt, ...L.tilt); pitch = clamp(pitch, ...L.pitch); yaw = clamp(yaw, ...L.yaw);
      const stack = 0.8 * Math.abs(tilt) + Math.abs(pitch) + 2 * Math.max(0, -yaw) + 0.5 * Math.max(0, yaw);
      const k = stack > STACK ? STACK / stack : 1;
      out.keys = keys; out.tilt = tilt * k; out.hpitch = pitch * k; out.hyaw = yaw * k;
      out.hy = clamp(pos.hy + apos.hy, ...L.hy); out.hx = clamp(pos.hx + apos.hx, ...L.hx);
      out.sx = clamp(pos.sx + apos.sx, ...L.sx); out.sy = clamp(pos.sy + 1 * apos.sy, ...L.sy) ;
      out.eyeX = pos.eyeX + apos.eyeX; out.eyeY = pos.eyeY + apos.eyeY;
      // keep the head inside the canvas
      const Z = REACH[rig] || REACH.clay;
      const rise = Z.top.hy * Math.max(0, out.hy) + Z.top.sy * Math.max(0, out.sy - 1) + Z.top.tilt * Math.max(0, out.tilt) + Z.top.tiltNeg * Math.max(0, -out.tilt) + Z.top.pitchBack * Math.max(0, -out.hpitch);
      if (rise > Z.topBudget) { const f = Z.topBudget / rise; if (out.hy > 0) out.hy *= f; if (out.sy > 1) out.sy = 1 + (out.sy - 1) * f; out.tilt *= f; }
      const left = Z.left.tilt * Math.max(0, out.tilt) + Z.left.yaw * Math.max(0, out.hyaw) + Z.left.sx * Math.max(0, out.sx - 1) + Z.left.hxBack * Math.max(0, -out.hx);
      if (rig === "noir") { out.hx = Math.max(0, out.hx) + (left * 1.2) / PX_PER_HX; }   // push right by what would spill out
      else if (left > Z.leftBudget) { const f = Z.leftBudget / left; if (out.tilt > 0) out.tilt *= f; if (out.sx > 1) out.sx = 1 + (out.sx - 1) * f; }
      return out;
    },
  };
}

// the engine's output is already in faceRig3D's pose terms (hpitch, hyaw, hy, hx, sx, sy, gaze, keys)
export const toPose = (st) => st;
