// The pure math of /motion-check: spec tracks in, expected values out.
//
// A plain module with no React and no DOM, imported by MotionCheck.jsx AND
// runnable under Node (tools/figma-motion/selftest.mjs) - the scorer's
// arithmetic is verified headlessly, because the page it feeds can only run
// in a visible tab and a scorer nobody can test is a scorer nobody trusts.

// CSS keyword equivalents; motion/react and CSS agree on these curves.
export const KEYWORD = {
  easeIn: [0.42, 0, 1, 1],
  easeOut: [0, 0, 0.58, 1],
  easeInOut: [0.42, 0, 0.58, 1],
};

// A cubic-bezier easing solver: x is monotonic in t, so bisection is enough
// and has no convergence edge cases worth owning.
export function bezier([x1, y1, x2, y2]) {
  const cx = (t) => 3 * t * (1 - t) * (1 - t) * x1 + 3 * t * t * (1 - t) * x2 + t * t * t;
  const cy = (t) => 3 * t * (1 - t) * (1 - t) * y1 + 3 * t * t * (1 - t) * y2 + t * t * t;
  return (x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2;
      if (cx(mid) < x) lo = mid;
      else hi = mid;
    }
    return cy((lo + hi) / 2);
  };
}

export function easeFn(e) {
  if (!e || e.type === "linear") return (t) => t;
  if (e.type === "bezier") return bezier(e.pts);
  if (e.type === "spring")
    return (t) => 1 - Math.exp(-t * e.a) * (Math.cos(t * e.b) + e.c * Math.sin(t * e.b));
  if (KEYWORD[e.type]) return bezier(KEYWORD[e.type]);
  return (t) => t;
}

// Numeric view of a keyframe value. Strings are either "blur(Npx)" or things
// the checker does not score (boxShadow); null means unscorable.
export function toNum(v) {
  if (typeof v === "number") return v;
  const blur = /^blur\(([\d.]+)px\)$/.exec(v);
  if (blur) return +blur[1];
  return null;
}

// Expected value of a track at normalised loop time t. The easing in slot i
// governs the segment STARTING at keyframe i, exactly as the spec means it.
export function evalTrack(track, t) {
  const { times, values, eases } = track;
  const nums = values.map(toNum);
  if (nums.some((n) => n == null)) return null;
  if (t <= times[0]) return nums[0];
  if (t >= times[times.length - 1]) return nums[nums.length - 1];
  let i = 0;
  while (i < times.length - 2 && t > times[i + 1]) i++;
  const span = times[i + 1] - times[i];
  const u = span > 0 ? (t - times[i]) / span : 1;
  return nums[i] + (nums[i + 1] - nums[i]) * easeFn(eases[i])(u);
}
