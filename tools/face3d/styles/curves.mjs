// curves.mjs OUT.json : the same emote ("nod", FaceSV's keys) performed by every skin's motion
// profile (src/figures/faces/styleMotion.js), sampled at 60 fps: the head's pitch over time.
// curves.py draws it.
import fs from "node:fs";
import { PROFILES, stepTime, easeKey, perform } from "../../../src/figures/faces/styleMotion.js";
const base = { sx: 1, sy: 1, by: 0, tilt: 0, yaw: 0, pitch: 0, hy: 0, eyeX: 0, eyeY: 0, mouthSmileLeft: 0, mouthSmileRight: 0 };
const K = (t, o) => [t, { ...base, ...o }];
const smile = (v) => ({ mouthSmileLeft: v, mouthSmileRight: v });
const NOD = [800, [K(0, {}), K(0.25, { pitch: 0.09, hy: -0.03, ...smile(0.4) }), K(0.5, { pitch: -0.02, ...smile(0.4) }), K(0.75, { pitch: 0.06, hy: -0.02, ...smile(0.3) }), K(1, {})]];
const sample = (prof, frames, t) => {
  let i = 0;
  while (i < frames.length - 2 && t > frames[i + 1][0]) i++;
  const [ta, a] = frames[i], [tb, b] = frames[i + 1];
  const e = easeKey(prof, Math.min(1, Math.max(0, (t - ta) / (tb - ta || 1))));
  const o = {};
  for (const k of Object.keys(a)) o[k] = a[k] + (b[k] - a[k]) * e;
  return o;
};
const out = {};
for (const [id, prof] of Object.entries(PROFILES)) {
  const dur = NOD[0] * prof.durationScale, rows = [];
  for (let ms = 0; ms <= 1700; ms += 1000 / 60) {
    const t = stepTime(prof, ms), k = t / dur;
    const s = k >= 1 ? { ...base } : sample(prof, NOD[1], k);
    const p = perform(prof, s, base, Math.floor(t / (prof.stepMs || 1)));
    rows.push([Math.round(ms), p.pitch, p.mouthSmileLeft]);
  }
  out[id] = { rows, prof };
}
fs.writeFileSync(process.argv[2], JSON.stringify(out));
console.log("wrote", process.argv[2]);
