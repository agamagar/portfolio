// The clay head's emotes for the hero (2026-10-11, Agam: "once the face has turned [3D], remove
// the wave animation, and instead animate one of the emotes we have built in").
//
// The same emotes FaceSV plays (FaceSV.jsx, "motion"): each is [duration ms, keyframes], a
// keyframe being a time 0..1 and a state (every ARKit shape key, plus small head moves about
// the neck: tilt, pitch, yaw, hy; and the gaze, eyeX / eyeY), eased smoothstep between keys.
// Copied rather than imported: FaceSV builds them inside its effect, beside its own scene. If
// they change there, copy them here too.
//
// The hero plays only the ones that stay in the framing and on the surface the reference
// photographed: no lookAround, think or shy (they turn the head well away), no sad or angry.

export const KEYS = ["eyeBlinkLeft", "eyeBlinkRight", "eyeSquintLeft", "eyeSquintRight", "eyeWideLeft", "eyeWideRight",
  "browInnerUp", "browOuterUpLeft", "browOuterUpRight", "browDownLeft", "browDownRight",
  "jawOpen", "mouthSmileLeft", "mouthSmileRight", "mouthFrownLeft", "mouthFrownRight", "mouthPucker", "cheekPuff"];
const base = { tilt: 0, yaw: 0, pitch: 0, hy: 0, eyeX: 0, eyeY: 0, ...Object.fromEntries(KEYS.map((k) => [k, 0])) };
const K = (t, o) => [t, { ...base, ...o }];
const both = (n, v) => ({ [n + "Left"]: v, [n + "Right"]: v });
const smile = (v) => both("mouthSmile", v), squint = (v) => both("eyeSquint", v), blinkB = (v) => both("eyeBlink", v);

export const EMOTES = {
  blink: [220, [K(0, {}), K(0.45, blinkB(1)), K(1, {})]],
  grin: [1000, [K(0, {}), K(0.22, { ...smile(1), ...squint(0.7), jawOpen: 0.3, tilt: 0.06, hy: 0.03 }), K(0.75, { ...smile(0.95), ...squint(0.65), jawOpen: 0.25, tilt: 0.05 }), K(1, {})]],
  surprised: [1100, [K(0, {}), K(0.14, { jawOpen: 0.85, mouthPucker: 0.5, ...both("eyeWide", 1), browInnerUp: 1, ...both("browOuterUp", 0.8), hy: 0.08 }), K(0.75, { jawOpen: 0.7, mouthPucker: 0.45, ...both("eyeWide", 0.8), browInnerUp: 0.8, ...both("browOuterUp", 0.6), hy: 0.03 }), K(1, {})]],
  wink: [850, [K(0, {}), K(0.2, { eyeBlinkLeft: 1, eyeSquintRight: 0.3, mouthSmileLeft: 0.9, mouthSmileRight: 0.2, browDownLeft: 0.4, browOuterUpRight: 0.5, tilt: -0.08 }), K(0.65, { eyeBlinkLeft: 1, eyeSquintRight: 0.3, mouthSmileLeft: 0.85, mouthSmileRight: 0.2, browDownLeft: 0.4, browOuterUpRight: 0.45, tilt: -0.07 }), K(1, {})]],
  laugh: [1000, [K(0, {}), K(0.12, { hy: 0.1, ...blinkB(1), ...smile(1), jawOpen: 0.75 }), K(0.3, { ...blinkB(1), ...smile(1), jawOpen: 0.45 }), K(0.48, { hy: 0.08, ...blinkB(1), ...smile(1), jawOpen: 0.75 }), K(0.66, { ...blinkB(1), ...smile(0.9), jawOpen: 0.4 }), K(1, {})]],
  nod: [800, [K(0, {}), K(0.25, { pitch: 0.09, hy: -0.03, ...smile(0.4) }), K(0.5, { pitch: -0.02, ...smile(0.4) }), K(0.75, { pitch: 0.06, hy: -0.02, ...smile(0.3) }), K(1, {})]],
  puff: [1200, [K(0, {}), K(0.2, { cheekPuff: 1, mouthPucker: 0.7, ...both("eyeWide", 0.4), hy: 0.04 }), K(0.7, { cheekPuff: 1, mouthPucker: 0.7, ...both("eyeWide", 0.3), hy: 0.04 }), K(0.85, { jawOpen: 0.3, mouthPucker: 0.6, ...squint(0.3) }), K(1, {})]],
};

// as the hold begins; at relaxed intervals; on hover (quick)
// (no wink: Agam, 12 Oct, "remove the wink from the 3D face on the homepage"; the emote stays defined for FaceSV)
export const FIRST = "grin";
export const IDLE = ["grin", "nod", "laugh", "puff", "surprised", "blink"];
export const HOVER = ["grin", "nod"];

export function sample(frames, t) {
  let i = 0;
  while (i < frames.length - 2 && t > frames[i + 1][0]) i++;
  const [ta, a] = frames[i], [tb, b] = frames[i + 1];
  const k = Math.min(1, Math.max(0, (t - ta) / (tb - ta || 1)));
  const e = k * k * (3 - 2 * k);
  const o = {};
  for (const key of Object.keys(a)) o[key] = a[key] + (b[key] - a[key]) * e;
  return o;
}

// an emote state as faceRig3D's pose: head moves about the neck, gaze, shape keys
export function toPose(s) {
  return { tilt: s.tilt, hpitch: s.pitch, hyaw: s.yaw, hy: s.hy, eyeX: s.eyeX, eyeY: s.eyeY, keys: Object.fromEntries(KEYS.map((k) => [k, s[k]])) };
}
