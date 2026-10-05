// The camera path: a PURE function of p (the main runway, window to monitor) and
// p2 (the bookend, monitor back out to the room). Same inputs, same pose, so
// scrolling back reverses exactly and a capture at ?p= is repeatable. No idle
// drift, no easing on top of the scroll (Lenis already smooths the wheel).
//
// Keyframes (20-question-bank "Just build" 12, 30-locked-brief.md):
//   p = 0            close on the window: the left pair, the mullion, R1's stile with
//                    the lamp glow, the lamp head just out of frame (a region of the
//                    glass plane, cover-fitted to the viewport)
//   p = ref.at       the exact 17:41 framing: 8.8 W from the glass, -2.6 W, +0.5 W,
//                    yaw 8 right, pitch +5.7, roll -0.7 (13-photo 3); the horizontal
//                    FOV of the photo is kept on wider viewports, the vertical on
//                    narrower ones
//   p = approach.at  square to the screen, `back` times the fill distance
//   p = 1            the screen's active area exactly covers the viewport, computed
//                    from its size, the FOV and the aspect (never guessed)
//   p2 = 0 -> 1      from that fill back out to a closing room shot
// Between keyframes: cubic Hermite with Catmull-Rom tangents on position, yaw,
// pitch, roll, FOV and focus (C1, so no jolt at a keyframe), zero velocity at the
// ends (the move starts from rest and arrives at rest).
//
// Angles in degrees: yaw + = right of the wall normal (looking out, -z), pitch + =
// up, roll = three.js rotation.z. Focus is the DOF focus distance in metres.

const D2R = Math.PI / 180;

// Vertical FOV for this aspect that keeps the reference's horizontal FOV on wider
// viewports and its vertical FOV on narrower ones.
export function fovForAspect(fovV, refAspect, aspect) {
  if (aspect >= refAspect) {
    const h = 2 * Math.atan(Math.tan((fovV * D2R) / 2) * refAspect);
    return (2 * Math.atan(Math.tan(h / 2) / aspect)) / D2R;
  }
  return fovV;
}

// Distance at which a width x height rectangle, seen square on, covers the whole
// viewport (height-governed up to its own aspect, width-governed past it).
export function coverDistance(width, height, fovV, aspect) {
  const t = Math.tan((fovV * D2R) / 2);
  return Math.min(height / (2 * t), width / (2 * aspect * t));
}

function anglesOf(dir) {
  const [x, y, z] = dir;
  return { yaw: Math.atan2(x, -z) / D2R, pitch: Math.atan2(y, Math.hypot(x, z)) / D2R };
}

// The chair: where the reference photo was taken from, and where it looked.
export function chairPose(P) {
  const W = P.dims.W;
  const r = P.camera.ref;
  const yaw = r.yaw * D2R, pitch = r.pitch * D2R;
  return {
    position: r.pos.map((v) => v * W),
    forward: [Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch)],
    yaw: r.yaw,
    pitch: r.pitch,
    roll: r.roll,
  };
}

// The p = 0 keyframe (the hero) for this aspect. Pure: the same aspect gives the
// same pose. Focus is metres (focus), or focusIn metres in front of the region's
// centre, or (both null) on the region's centre; bokeh multiplies the look's DOF
// bokehScale along the path (1 = the look's own).
export function windowKey(P, aspect) {
  const W = P.dims.W;
  const Cw = P.camera.window;
  const portrait = aspect < (Cw.mobileBelow ?? 0.8) && Array.isArray(Cw.regionMobile);
  const V = portrait ? { ...Cw, ...(Cw.mobile || {}), region: Cw.regionMobile } : Cw;
  const [x0, x1, y0, y1] = V.region;
  const fov = V.fovV;
  const d = coverDistance((x1 - x0) * W, (y1 - y0) * W, fov, aspect);
  // cover-fit crops the region in one direction: a viewport wider than the region
  // sees a band of it (its height (x1 - x0) / aspect), a taller one a column. The
  // band sits anchorY of the way up the region (0 bottom, 0.5 centre, 1 top) and the
  // column anchorX of the way across, so a 21:9 screen or a portrait tablet keeps the
  // handle and the keyhole instead of cutting them at the edge
  let cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const rAspect = (x1 - x0) / (y1 - y0);
  if (aspect > rAspect) {
    const hv = (x1 - x0) / aspect;
    cy = y0 + hv / 2 + (y1 - y0 - hv) * (V.anchorY ?? 0.5);
  } else {
    const wv = (y1 - y0) * aspect;
    cx = x0 + wv / 2 + (x1 - x0 - wv) * (V.anchorX ?? 0.5);
  }
  const c = [cx * W, cy * W, (V.z ?? 0) * W];
  const yaw = (V.yaw ?? 0) * D2R, pitch = (V.pitch ?? 0) * D2R;
  const f = [Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch)];
  return {
    t: 0,
    pos: [c[0] - f[0] * d, c[1] - f[1] * d, c[2] - f[2] * d],
    yaw: V.yaw ?? 0,
    pitch: V.pitch ?? 0,
    roll: V.roll ?? 0,
    fov,
    // the focus: metres (focus), or focusIn metres in front of the region's centre
    // (the subject sits that far proud of the glass line, so the focus follows it at
    // any aspect), or on the region's centre
    focus: Number.isFinite(V.focus) ? V.focus : Number.isFinite(V.focusIn) ? Math.max(0.05, d - V.focusIn) : d,
    bokeh: V.bokeh ?? 1,
    portrait,
  };
}

// All keyframes for this aspect and screen. screen = { center, normal, width,
// height } in world units, normal pointing out of the screen toward the viewer.
export function keyframes(P, { aspect, screen }) {
  const W = P.dims.W;
  const C = P.camera;

  // p = 0: the hero. A rectangle `region` (W; its size and its centre, x and y on
  // the glass plane, z its depth) faces the camera and is cover-fitted to the
  // viewport; the camera looks at its centre along yaw and pitch. Portrait
  // viewports (aspect below mobileBelow) use regionMobile and the mobile overrides.
  const k0 = windowKey(P, aspect);
  // the reference
  const r = C.ref;
  const kRef = {
    t: r.at,
    pos: r.pos.map((v) => v * W),
    yaw: r.yaw,
    pitch: r.pitch,
    roll: r.roll,
    fov: fovForAspect(r.fovV, r.aspect, aspect),
    focus: r.focus * W,
    bokeh: 1,
  };

  // the screen fill
  const n = screen.normal;
  const fovF = kRef.fov;
  const dF = coverDistance(screen.width, screen.height, fovF, aspect);
  const face = anglesOf([-n[0], -n[1], -n[2]]);
  const at = (d) => [screen.center[0] + n[0] * d, screen.center[1] + n[1] * d, screen.center[2] + n[2] * d];
  const kApp = { t: C.approach.at, pos: at(dF * C.approach.back), yaw: face.yaw, pitch: face.pitch, roll: 0, fov: fovF, focus: dF * C.approach.back, bokeh: 1 };
  const kFill = { t: 1, pos: at(dF), yaw: face.yaw, pitch: face.pitch, roll: 0, fov: fovF, focus: dF, bokeh: 1 };

  // bookend
  const cl = C.closing;
  const kBack = { t: C.bookend.backAt, pos: at(dF * C.bookend.back), yaw: face.yaw, pitch: face.pitch, roll: 0, fov: fovF, focus: dF * C.bookend.back, bokeh: 1 };
  const kClose = { t: 1, pos: cl.pos.map((v) => v * W), yaw: cl.yaw, pitch: cl.pitch, roll: cl.roll, fov: cl.fovV, focus: cl.focus * W, bokeh: cl.bokeh ?? 1 };

  return { main: [k0, kRef, kApp, kFill], bookend: [{ ...kFill, t: 0 }, kBack, kClose], fillDistance: dF };
}

const FIELDS = ["yaw", "pitch", "roll", "fov", "focus", "bokeh"];

// Cubic Hermite through keys at times k.t, Catmull-Rom tangents inside, zero at
// the two ends.
function evalPath(keys, t) {
  const n = keys.length;
  if (t <= keys[0].t) return keys[0];
  if (t >= keys[n - 1].t) return keys[n - 1];
  let i = 0;
  while (i < n - 2 && t > keys[i + 1].t) i++;
  const a = keys[i], b = keys[i + 1];
  const h = b.t - a.t;
  const s = (t - a.t) / h;
  const s2 = s * s, s3 = s2 * s;
  const h00 = 2 * s3 - 3 * s2 + 1, h10 = s3 - 2 * s2 + s, h01 = -2 * s3 + 3 * s2, h11 = s3 - s2;
  const tan = (j, get) => {
    if (j === 0 || j === n - 1) return 0;
    return (get(keys[j + 1]) - get(keys[j - 1])) / (keys[j + 1].t - keys[j - 1].t);
  };
  const lerp = (get) => h00 * get(a) + h10 * h * tan(i, get) + h01 * get(b) + h11 * h * tan(i + 1, get);
  const out = { t, pos: [0, 1, 2].map((c) => lerp((k) => k.pos[c])) };
  for (const f of FIELDS) out[f] = lerp((k) => k[f]);
  return out;
}

// The named shots: ref1741 (P.camera.ref) and the dusk close-ups solved from their
// photos (P.camera.shots: ref5480 to ref5484). Each pins its own vertical FOV
// whatever the viewport; render them at the photo's aspect (4:3 or 3:4).
export const SHOT_NAMES = ["ref1741", "ref5480", "ref5481", "ref5482", "ref5483", "ref5484"];
export function shotPose(P, shot) {
  const r = shot === "ref1741" ? P.camera.ref : P.camera.shots?.[shot];
  if (!r) return null;
  const W = P.dims.W;
  return { pos: r.pos.map((v) => v * W), yaw: r.yaw, pitch: r.pitch, roll: r.roll, fov: r.fovV, focus: r.focus * W, bokeh: r.bokeh ?? 1, path: shot };
}

// The pose for (p, p2). opts: { aspect, screen, shot }. A named shot pins its
// exact framing (ref1741: vertical FOV 56.8 deg whatever the aspect).
export function cameraPose(P, p, p2, { aspect, screen, shot = null }) {
  if (shot) {
    const s = shotPose(P, shot);
    if (s) return s;
  }
  const k = keyframes(P, { aspect, screen });
  if (p2 > 0) return { ...evalPath(k.bookend, Math.min(1, p2)), path: "bookend" };
  return { ...evalPath(k.main, Math.max(0, Math.min(1, p))), path: "main" };
}

export function applyPose(camera, pose, P) {
  camera.position.set(pose.pos[0], pose.pos[1], pose.pos[2]);
  camera.rotation.set(pose.pitch * D2R, -pose.yaw * D2R, pose.roll * D2R, "YXZ");
  if (camera.fov !== pose.fov || camera.near !== P.camera.near || camera.far !== P.camera.far) {
    camera.fov = pose.fov;
    camera.near = P.camera.near;
    camera.far = P.camera.far;
  }
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();
}
