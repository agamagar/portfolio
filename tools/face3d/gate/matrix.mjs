// The render matrix. Cases per face; sizes and themes are derived from the native render in checks (box-filtered
// down to 256 and 83 px; light #f2f2f2 and dark #121212 ground composited under the transparent canvas).
export const VIEWS = { front: [0, 0], q3L: [-0.6, 0], q3R: [0.6, 0], profL: [-1.45, 0], profR: [1.45, 0], up: [0, -0.2], down: [0, 0.2] };
export const BLINK_MID = 0.22, BLINK_CLOSED = 0.45;
export const cases = (emotes, peaks) => {
  const c = {};
  for (const [v, [yaw, pitch]] of Object.entries(VIEWS)) c["rest_" + v] = { yaw, pitch };
  c.blinkmid_front = { emote: "blink", t: BLINK_MID };
  c.blinkclosed_front = { emote: "blink", t: BLINK_CLOSED };
  c.blinkclosed_q3L = { emote: "blink", t: BLINK_CLOSED, yaw: -0.6 };
  c.blinkclosed_q3R = { emote: "blink", t: BLINK_CLOSED, yaw: 0.6 };
  for (const e of emotes) if (e !== "blink") c["emote_" + e] = { emote: e, t: peaks[e] };
  // three consecutive frames of the resting head drifting 0.003 rad per frame (the hero's idle sway) and an identical
  // re-render of the middle one: a smooth drift has a near-zero second difference, z-fighting and flicker do not
  for (let i = 0; i < 3; i++) c["flick" + i] = { yaw: 0.003 * i, noIds: true };
  c.flickSame = { yaw: 0.003, noIds: true };
  return c;
};
// the fast subset (qa-smoke): hero size, front + 3/4, light only, rest and blink
export const FAST = ["rest_front", "rest_q3L", "rest_q3R", "blinkclosed_front"];
