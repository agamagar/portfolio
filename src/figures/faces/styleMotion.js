// How each skin MOVES (2026-10-12; Agam: "animate each of them individually with their own
// characteristics"). The emotes are shared (FaceSV's EMOTES, the hero's emote engine); a skin's
// profile changes how they are performed, the way its medium would: claymation on twos with a
// thumb-boil, a stone head heavy and slow, pixel art snapped to its grid, cel on threes with
// snappy holds, rubber hose bouncing past every key. The numbers and the reasoning, with
// sources, are in tools/face3d/styles/<skin>.md.
//
// A profile's fields:
//   stepMs         ms each pose is held (0: smooth; 83: on twos at 24 fps; 125: on threes)
//   durationScale  emote durations x this (heavier media are slower)
//   amplitude      shape keys and head moves x this (from rest)
//   ease           between keys: "smooth" (slow in and out), "snap" (holds, quick in-betweens),
//                  "heavy" (a sluggish start), "bouncy" (past the key and back)
//   overshoot      how far past the key "bouncy" (and a little of "snap") goes
//   squash         the bounce's squash and stretch x this
//   boil           per-step jitter of the head (radians and units): hands re-posing a puppet,
//                  a line redrawn each frame
//   idleAmp/Rate   the idle sway's size and speed x these
//   pixelSnap      head moves land on a coarse grid (no sub-pixel motion), keys on few steps
//   turnBudget     the most an emote may turn the head (radians): the fitted textures were
//                  projected from one view and smear past about 0.35
//   keySteps       shape keys move in this many steps (replacement mouths and lids); 0: free
//
// Integration: FaceSV calls motionFor(skin.id) each frame. The hero's emote engine
// (morph/emoteEngine.js, owned by the hero) can use the same three calls: stepTime(prof, now)
// for its clock, easeKey(prof, k) inside its keyframe sampler, perform(prof, pose, step) on the
// sampled pose before it is applied, and scale its emote durations by prof.durationScale.

export const PROFILES = {
  clay: { stepMs: 83, durationScale: 1.1, amplitude: 1.0, ease: "smooth", overshoot: 0.05, squash: 0.8, boil: 0.006, idleAmp: 0.7, idleRate: 0.8, pixelSnap: false, turnBudget: 0.3, keySteps: 6 },
  claySun: { stepMs: 83, durationScale: 1.25, amplitude: 0.95, ease: "heavy", overshoot: 0.03, squash: 0.95, boil: 0.008, idleAmp: 0.9, idleRate: 0.65, pixelSnap: false, turnBudget: 0.3, keySteps: 6, boilTiltOnly: true },
  noir: { stepMs: 42, durationScale: 1.3, amplitude: 0.7, ease: "smooth", overshoot: 0, squash: 0.3, boil: 0.002, idleAmp: 0.4, idleRate: 0.6, pixelSnap: false, turnBudget: 0.25, keySteps: 0 },
  felt: { stepMs: 83, durationScale: 1.05, amplitude: 0.85, ease: "smooth", overshoot: 0.04, squash: 0.4, boil: 0.004, idleAmp: 0.8, idleRate: 0.85, pixelSnap: false, turnBudget: 0.25, keySteps: 0 },
  stone: { stepMs: 83, durationScale: 1.6, amplitude: 0.6, ease: "heavy", overshoot: 0, squash: 0.3, boil: 0.002, idleAmp: 0.15, idleRate: 0.4, pixelSnap: false, turnBudget: 0.2, keySteps: 0 },
  pixel: { stepMs: 125, durationScale: 0.9, amplitude: 1.0, ease: "snap", overshoot: 0.1, squash: 0.8, boil: 0, idleAmp: 0.6, idleRate: 0.7, pixelSnap: true, turnBudget: 0.2, keySteps: 3 },
  cel: { stepMs: 125, durationScale: 0.85, amplitude: 1.1, ease: "snap", overshoot: 0.15, squash: 1.0, boil: 0, idleAmp: 0.35, idleRate: 0.6, pixelSnap: false, turnBudget: 0.3, keySteps: 0 },
  hose: { stepMs: 83, durationScale: 0.8, amplitude: 1.3, ease: "bouncy", overshoot: 0.25, squash: 1.6, boil: 0.004, idleAmp: 1.5, idleRate: 1.5, pixelSnap: false, turnBudget: 0.3, keySteps: 0 },
  riso: { stepMs: 125, durationScale: 0.95, amplitude: 0.9, ease: "snap", overshoot: 0.05, squash: 0.4, boil: 0.009, idleAmp: 0.5, idleRate: 0.7, pixelSnap: false, turnBudget: 0.25, keySteps: 0 },
  print: { stepMs: 83, durationScale: 0.85, amplitude: 1.15, ease: "snap", overshoot: 0.15, squash: 1.1, boil: 0.002, idleAmp: 0.5, idleRate: 0.8, pixelSnap: false, turnBudget: 0.3, keySteps: 0 },
};
const NEUTRAL = { stepMs: 0, durationScale: 1, amplitude: 1, ease: "smooth", overshoot: 0, squash: 1, boil: 0, idleAmp: 1, idleRate: 1, pixelSnap: false, turnBudget: 1, keySteps: 0 };
export const motionFor = (id) => PROFILES[id] || NEUTRAL;

// the clock, held on the profile's steps (one step = one exposure)
export const stepTime = (prof, now) => (prof.stepMs > 0 ? Math.floor(now / prof.stepMs) * prof.stepMs : now);

// 0..1 between two keys -> 0..1 (may pass 1 for "bouncy")
export function easeKey(prof, k) {
  const ss = (x) => x * x * (3 - 2 * x);
  switch (prof.ease) {
    case "snap": {
      // hold the old key, cross quickly, hold the new one (a small kick past it on arrival)
      const x = Math.min(1, Math.max(0, (k - 0.3) / 0.4));
      const e = ss(x);
      return e + prof.overshoot * 0.5 * Math.sin(Math.PI * Math.min(1, Math.max(0, (k - 0.7) / 0.3)));
    }
    case "heavy":
      return ss(Math.pow(k, 1.6)); // slow to get going, slow to stop
    case "bouncy": {
      // past the key and back (an out-back curve)
      const c = 1.70158 * (prof.overshoot / 0.1) * 0.6, x = k - 1;
      return 1 + (c + 1) * x * x * x + c * x * x;
    }
    default:
      return ss(k);
  }
}

// a deterministic jitter per step (the same step always boils the same way)
const hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x) - 0.5; };
const HEAD = ["yaw", "pitch", "tilt", "hy", "eyeX", "eyeY"];
const clamp01 = (x) => Math.min(1, Math.max(0, x));

// a sampled pose (FaceSV's: sx, sy, by, tilt, yaw, pitch, hy, eyeX, eyeY and the ARKit shape keys)
// performed in the profile's manner. base is the rest pose; step the exposure index (for boil)
export function perform(prof, s, base, step = 0) {
  const o = { ...s };
  for (const k of Object.keys(o)) {
    if (k === "sx" || k === "sy" || k === "by") o[k] = base[k] + (o[k] - base[k]) * prof.squash;
    else if (HEAD.includes(k)) o[k] = base[k] + (o[k] - base[k]) * prof.amplitude;
    else if (typeof o[k] === "number") {
      let w = clamp01(o[k] * prof.amplitude);
      if (prof.keySteps > 0) w = Math.round(w * prof.keySteps) / prof.keySteps; // replacement shapes, not tweens
      o[k] = w;
    }
  }
  if (prof.turnBudget < 1) o.yaw = Math.max(-prof.turnBudget, Math.min(prof.turnBudget, o.yaw));
  if (prof.boil > 0) {
    o.tilt += prof.boil * hash(step * 3 + 1);
    if (!prof.boilTiltOnly) { o.yaw += prof.boil * 0.6 * hash(step * 3 + 2); o.hy += prof.boil * 0.5 * hash(step * 3 + 3); }
  }
  if (prof.pixelSnap) {
    // no sub-pixel motion: head moves land on a coarse grid (a few canvas pixels a notch)
    for (const k of ["yaw", "pitch", "tilt"]) o[k] = Math.round(o[k] / 0.02) * 0.02;
    for (const k of ["hy", "by", "eyeX", "eyeY"]) o[k] = Math.round(o[k] / 0.01) * 0.01;
  }
  return o;
}
