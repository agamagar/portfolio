// Neon signs on the far towers (the Cyberpunk look; params.outside.neon).
//
// Flat emissive cards hung on the skyline's towers (outside/horizon.js draws the
// towers on its band 38.5 m out; the signs stand a few metres in front of them, so
// each one reads as mounted on a facade, never as a sticker in an empty sky).
// Nothing here is in the room, nothing is a 3D model: one merged BufferGeometry, one
// upright quad per sign turned to face the window, its shape drawn in the fragment
// shader (no glyphs, no text, no logos, no icon outlines):
//   frame    a wide lightbox across a facade or a roof: a panel lit from inside, a
//            slow gradient toward its second colour and a soft wash along it, a tube
//            down each of its long sides
//   blade    the same, tall, down a facade (a vertical sign board)
//   strip    one long straight tube (horizontal along a roofline, vertical down a
//            tower's corner), broken once in some
//   screen   a video wall: a dark backing frame round a panel with a slow two-colour
//            gradient and a coarse mosaic (at most 6 cells a side) that changes at
//            most every 1.5 s
// (2026-10-06: the first cut's rounded outlines with ladder rungs, its pill frame and
// its double chevron read as UI icons, a battery, a minus button, fast-forward; then a
// closed outline round stacked panels still read as a battery. Every shape is now a lit
// panel bracketed by two straight tubes, a plain long tube, or a screen.)
// A tube is a glass tube's glow on a distance field: a hot, near-white core (the gas
// at its brightest clips toward white) inside the colour, its width widened in
// quadrature by the lens's own blur at the sign's distance (common.js
// outdoorLensBlur) with its peak lowered to keep its light. The halo round it is the
// look's bloom (the MRT emissive, x outside.neon.bloom), never an additive card.
// Then the distance haze, as every outdoor surface takes it, scaled by
// outside.neon.haze (a lit sign burns through the air the far trees fade in).
//
// Opaque, depth written, alpha-tested on the shape's mask: the canopy's transparent
// cards draw over a sign's lower edge, and TRAA sees a plain static surface (no
// additive card to smear). Flicker: only the signs flagged `flicker`, off for a half
// second slot when a hash of the slot passes 0.92 (at most 2 changes a second; WCAG
// 2.3.1 allows 3), and never under prefers-reduced-motion, which also freezes the
// screens and the gradients. Captures stay deterministic: U.T is the frozen ?t.
//
// Built lazily by outside.js on the first frame `enabled` is true, so the other
// looks have nothing; the geometry is rebuilt only when the signs list changes.
// Every frame it writes common.js NEON: the signs' light at the window (mean, for the
// outdoor air and the room's window fill), the first two palette colours at the
// signs' radiance and where those signs stand (the rain and the wet glass catch them
// only when they look toward them).
//
// World frame: metres, x right (east), y up (0 = the sill), -z north (outside).

import * as THREE from "three/webgpu";
import { attribute, uniform, vec2, vec3, float, mix, exp, max, min, abs, length, dot, smoothstep, step, floor, fract, sin, sqrt, uv, positionWorld, cameraPosition, mrt } from "three/tsl";
import { NEON, outdoorLensBlur, D2R, smooth } from "./common.js";

const KIND = { frame: 0, blade: 1, strip: 2, screen: 3 };
const PAD = 0.35; // m of quad around a sign's nominal rectangle, room for the tube's glow
const LUMA = [0.2126, 0.7152, 0.0722];
// each kind's share of its rectangle that emits, for its light at the window (F8)
const LIT_SHARE = [0.55, 0.6, 0.12, 0.7];
// signs whose light the towers' walls take (the spill), at most
const MAX_SPILL = 8;

const hash11 = (x) => fract(sin(x.mul(127.1).add(311.7)).mul(43758.5453));
const sdBox = (p, b) => {
  const q = abs(p).sub(b);
  return length(max(q, vec2(0, 0))).add(min(max(q.x, q.y), 0));
};

function signsKey(N) {
  return JSON.stringify(N.signs || []);
}

function buildGeometry(signs) {
  const pos = [], nrm = [], uvs = [], aSign = [], aSize = [], idx = [];
  let n = 0;
  for (const s of signs) {
    const b = (s.bearing ?? 0) * D2R;
    const d = Math.max(1, s.dist ?? 20);
    const e = (s.elev ?? 9) * D2R;
    const w = Math.max(0.05, s.w ?? 1), h = Math.max(0.05, s.h ?? 1);
    const cx = Math.sin(b) * d, cy = d * Math.tan(e), cz = -Math.cos(b) * d;
    // upright, turned to face the window: right as the window sees it, up the world's
    const rx = Math.cos(b), rz = Math.sin(b);
    const W = w + 2 * PAD, H = h + 2 * PAD;
    const kind = KIND[s.kind] ?? 0;
    const cols = Array.isArray(s.colors) ? s.colors : [s.color ?? 0, s.color ?? 0];
    const seed = Math.abs(Math.sin((s.bearing ?? 0) * 12.9898 + (s.dist ?? 0) * 78.233 + n * 0.731)) % 1;
    for (const [u, v] of [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
    ]) {
      const ox = (u - 0.5) * W, oy = (v - 0.5) * H;
      pos.push(cx + rx * ox, cy + oy, cz + rz * ox);
      nrm.push(-Math.sin(b), 0, Math.cos(b)); // toward the window
      uvs.push(u, v);
      aSign.push(kind, cols[0] ?? 0, s.flicker ? 1 : 0, seed);
      aSize.push(w, h, d, cols[1] ?? cols[0] ?? 0);
    }
    const i = n * 4;
    idx.push(i, i + 1, i + 2, i + 2, i + 1, i + 3);
    n++;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  g.setAttribute("aSign", new THREE.Float32BufferAttribute(aSign, 4));
  g.setAttribute("aSize", new THREE.Float32BufferAttribute(aSize, 4));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(nrm, 3));
  g.setIndex(idx);
  g.computeBoundingSphere();
  return g;
}

// --- THE SKYLINE: the towers the signs hang on ------------------------------------------------
// The horizon band (horizon.js, 38.5 m) cannot rise past about 16 deg: above that the
// sky dome (a 40 m sphere) stands in front of it. So the towers the Cyberpunk look
// needs in the top panes (10 to 22 deg at the hero) are their own flat cards here,
// 26 to 32 m out (inside the dome up to 40 deg), each facing the window: a dark facade
// in the sky's light, faint storey lines, a few lit floors, a neon tube along some
// roofs and down one corner, a narrower crown on some, and the signs' own light
// pooled on the wall round each sign (the spill: what mounts a sign on its tower and
// gives it a glow in the air of the street, opaque, so TRAA sees a plain surface).
// Angular sizes are what matter (a 40 m tower 600 m away is 3.8 deg wide, drawn here
// 2 m wide at 30 m).
// outside.neon.skyline: towers [{ bearing, dist, w (deg), top (deg), bottom (deg) }],
// color (the facade, display hex), haze [day, night] (its mix toward the air's colour),
// windows { level, share, warm, cool, cell [deg], size [deg] }, trim { level, share,
// colors, bloom }, spill { level, reach (deg), bloom }. Built with the signs; nothing
// here exists in the other looks.
function buildTowerGeometry(towers) {
  const pos = [], uvs = [], aT = [], aD = [], idx = [];
  let n = 0;
  for (const t of towers) {
    const b = (t.bearing ?? 0) * D2R;
    const d = Math.max(5, t.dist ?? 30);
    const wDeg = Math.max(0.2, t.w ?? 3);
    const e0 = t.bottom ?? 1, e1 = Math.max(e0 + 0.5, t.top ?? 18);
    const half = d * Math.tan((wDeg / 2) * D2R);
    const cx = Math.sin(b) * d, cz = -Math.cos(b) * d;
    const rx = Math.cos(b), rz = Math.sin(b);
    const seed = Math.abs(Math.sin((t.bearing ?? 0) * 7.13 + d * 3.71 + n * 1.37)) % 1;
    for (const [u, v] of [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
    ]) {
      const ox = (u - 0.5) * 2 * half;
      const y = d * Math.tan((e0 + (e1 - e0) * v) * D2R);
      pos.push(cx + rx * ox, y, cz + rz * ox);
      uvs.push(u, v);
      aT.push(wDeg, e0, e1, seed);
      aD.push(d, t.crown ?? (seed > 0.45 ? 1 : 0), t.bearing ?? 0, 0);
    }
    const i = n * 4;
    idx.push(i, i + 1, i + 2, i + 2, i + 1, i + 3);
    n++;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  g.setAttribute("aT", new THREE.Float32BufferAttribute(aT, 4));
  g.setAttribute("aD", new THREE.Float32BufferAttribute(aD, 4));
  g.setIndex(idx);
  g.computeBoundingSphere();
  return g;
}

// sR: the signs as the towers see them (buildNeon fills it every frame): rect[i]
// (bearing, elevation, half width, half height; deg) and col[i] (the sign's light at
// the wall, linear, scene units; 0 for an unused slot)
function buildSkyline(P, U, nU, sR) {
  const group = new THREE.Group();
  group.name = "skyline";
  const sU = {
    color: uniform(new THREE.Color(0.01, 0.012, 0.016)),
    haze: uniform(0.3),
    winLevel: uniform(0),
    winShare: uniform(0.2),
    winGap: uniform(0),
    winWarm: uniform(new THREE.Color(1, 0.8, 0.9)),
    winCool: uniform(new THREE.Color(0.8, 0.95, 1)),
    winCell: uniform(new THREE.Vector2(0.4, 0.32)),
    winSize: uniform(new THREE.Vector2(0.3, 0.08)),
    trimLevel: uniform(0),
    trimShare: uniform(0.5),
    trimA: uniform(new THREE.Color(1, 0.2, 0.6)),
    trimB: uniform(new THREE.Color(0, 0.8, 1)),
    trimBloom: uniform(0),
    spillReach: uniform(0.8),
    spillBloom: uniform(0),
  };
  const aT = attribute("aT", "vec4"); // width (deg), bottom, top (deg), seed
  const aD = attribute("aD", "vec4"); // distance (m), crown (0/1), bearing (deg)
  const seed = aT.w;
  const wDeg = aT.x;
  const xDeg = uv().x.sub(0.5).mul(wDeg); // deg from the tower's axis
  const hDeg = aT.z.sub(aT.y);
  const el = aT.y.add(uv().y.mul(hDeg)); // deg up
  const bDeg = aD.z.add(xDeg); // deg, the bearing this point is seen at
  // a crown on some: the top 12 % of the tower narrower (a setback)
  const crownH = hDeg.mul(0.12).mul(aD.y);
  const inCrownBand = step(aT.z.sub(crownH), el);
  const crownHalf = wDeg.mul(mix(float(0.28), float(0.4), fract(seed.mul(9.1))));
  const cut = inCrownBand.mul(step(crownHalf, abs(xDeg)));
  const roofEl = aT.z.sub(crownH.mul(float(1).sub(step(abs(xDeg), crownHalf))));
  // the lens's blur at this distance (deg), for the windows' and tubes' widths
  const blurDeg = outdoorLensBlur(U, aD.x).mul(180 / Math.PI);
  // facade: the sky's light on a dark wall, faint storey lines, a little per tower
  const storey = smoothstep(0.8, 0.95, fract(el.div(sU.winCell.y))).mul(0.25);
  const facade = vec3(sU.color).mul(float(1).sub(storey)).mul(float(0.8).add(fract(seed.mul(5.3)).mul(0.4))).mul(vec3(U.skyAmb).mul(0.6).add(vec3(U.groundAmb).mul(0.3)));
  // lit floors: a share of the storeys lit (a hash per storey against share x the lit
  // share of the hour), each one a thin band of light right across the tower, brighter
  // and dimmer bay by bay (no gaps: short dashes read as a stack of pills once the
  // lens blurs them, single windows as confetti)
  const row = floor(el.sub(aT.y).div(sU.winCell.y));
  const fy = fract(el.sub(aT.y).div(sU.winCell.y)).sub(0.5).mul(sU.winCell.y); // deg from the storey's middle
  const bay = floor(xDeg.add(wDeg.mul(0.5)).div(sU.winCell.x));
  const hRow = hash11(row.mul(3.17).add(seed.mul(41.7)));
  const hBay = hash11(bay.mul(17.31).add(row.mul(5.13)).add(seed.mul(13.9)));
  const rowOn = step(hRow, sU.winShare.mul(U.city.x));
  const hy = sU.winSize.y.mul(0.5).add(blurDeg.mul(0.3));
  const inset = wDeg.mul(0.5).sub(sU.winSize.x); // the band stops short of the corners
  const line = float(1).sub(smoothstep(hy.mul(0.5), hy, abs(fy))).mul(float(1).sub(smoothstep(inset, inset.add(blurDeg.max(0.05)), abs(xDeg))));
  const lineK = sU.winSize.y.div(hy.mul(2)).min(1); // the blur spreads it, the light kept
  const wTone = mix(vec3(sU.winWarm), vec3(sU.winCool), step(0.5, fract(hRow.mul(13.7))));
  const belowRoof = float(1).sub(smoothstep(roofEl.sub(sU.winCell.y.mul(0.8)), roofEl.sub(sU.winCell.y.mul(0.4)), el));
  // (r3) a share of the bays dark (windows.gap: none below it on the bay's hash; 0 =
  // every bay lit): an unbroken band on every lit floor read as a shelf of books
  const windows = wTone.mul(line).mul(lineK).mul(rowOn).mul(belowRoof).mul(sU.winLevel).mul(U.lightGain).mul(U.city.w).mul(float(0.45).add(hBay.mul(0.55))).mul(step(sU.winGap, hBay));
  // trims: a tube along the roof (a little under it) on a share of the towers, and
  // down one corner on some
  const tw = max(blurDeg.mul(0.5), 0.04);
  const trimOn = step(fract(seed.mul(23.7)), sU.trimShare);
  const dRoof = el.sub(roofEl.sub(0.25)).div(tw);
  const roofT = exp(dRoof.mul(dRoof).negate()).mul(step(abs(xDeg), wDeg.mul(0.5).sub(0.1)));
  const side = mix(float(-1), float(1), step(0.5, fract(seed.mul(57.3))));
  const dSide = xDeg.sub(side.mul(wDeg.mul(0.5).sub(0.18))).div(tw);
  const sideT = exp(dSide.mul(dSide).negate()).mul(step(el, roofEl.sub(0.25))).mul(step(0.4, fract(seed.mul(91.7))));
  const trimCol = mix(vec3(sU.trimA), vec3(sU.trimB), step(0.5, fract(seed.mul(41.3))));
  const trims = trimCol.mul(max(roofT, sideT)).mul(trimOn).mul(sU.trimLevel).mul(U.lightGain).mul(U.city.w).mul(float(0.04).div(tw).min(1));
  // the signs' light on the wall round them: each sign's colour falling off with the
  // angular distance from its box (an exponential over spillReach deg, and a softer,
  // wider second term for the light in the street's air)
  let spill = vec3(0);
  for (let i = 0; i < sR.rect.length; i++) {
    const r = sR.rect[i];
    const q = abs(vec2(bDeg.sub(r.x), el.sub(r.y))).sub(vec2(r.z, r.w));
    const d = length(max(q, vec2(0, 0)));
    const fall = exp(d.div(sU.spillReach).negate()).mul(0.85).add(exp(d.div(sU.spillReach.mul(2.5)).negate()).mul(0.15));
    spill = spill.add(vec3(sR.col[i]).mul(fall));
  }
  // the murk and the air
  const inCloud = smoothstep(U.murk.y.sub(U.murk.z), U.murk.y.add(U.murk.z), el).mul(U.murk.x);
  const murkCol = vec3(U.hazeCol).add(vec3(U.glowCol).mul(U.murk.w));
  const lightsT = windows.add(trims).mul(float(1).sub(inCloud.mul(0.85)));
  const lit = mix(mix(facade, vec3(U.hazeCol), sU.haze), murkCol, max(inCloud, U.murk.x.mul(0.25)));
  const spillT = spill.mul(float(1).sub(inCloud.mul(0.6)));
  const c = lit.add(lightsT).add(spillT);
  const mat = new THREE.MeshBasicNodeMaterial({ side: THREE.DoubleSide });
  mat.name = "neonSkyline";
  mat.colorNode = c;
  mat.opacityNode = float(1).sub(cut);
  mat.alphaTest = 0.5;
  mat.mrtNode = mrt({ emissive: lit.mul(U.bloom).add(windows.mul(1.5)).add(trims.mul(sU.trimBloom)).add(spillT.mul(sU.spillBloom)).mul(float(1).sub(inCloud.mul(0.6))) });
  mat.fog = false;

  let mesh = null;
  let key = "";
  function setUniforms(S, night) {
    sU.color.value.setStyle(S.color || "#10141c", THREE.SRGBColorSpace);
    const hz = S.haze || [0.4, 0.15];
    sU.haze.value = hz[0] + (hz[1] - hz[0]) * night;
    const Wn = S.windows || {};
    sU.winLevel.value = Wn.level ?? 0;
    sU.winShare.value = Wn.share ?? 0.2;
    sU.winGap.value = Wn.gap ?? 0;
    sU.winWarm.value.setStyle(Wn.warm || "#ffd0e0", THREE.SRGBColorSpace);
    sU.winCool.value.setStyle(Wn.cool || "#d0f4ff", THREE.SRGBColorSpace);
    sU.winCell.value.set(Wn.cell?.[0] ?? 0.4, Wn.cell?.[1] ?? 0.32);
    sU.winSize.value.set(Wn.size?.[0] ?? 0.3, Wn.size?.[1] ?? 0.08);
    const Tr = S.trim || {};
    sU.trimLevel.value = Tr.level ?? 0;
    sU.trimShare.value = Tr.share ?? 0.5;
    sU.trimA.value.setStyle(Tr.colors?.[0] || "#ff3c9c", THREE.SRGBColorSpace);
    sU.trimB.value.setStyle(Tr.colors?.[1] || Tr.colors?.[0] || "#00d8ff", THREE.SRGBColorSpace);
    sU.trimBloom.value = Tr.bloom ?? 0;
    const Sp = S.spill || {};
    sU.spillReach.value = Math.max(0.05, Sp.reach ?? 0.8);
    sU.spillBloom.value = Sp.bloom ?? 0;
  }
  function update(S, night) {
    const towers = S?.towers || [];
    const k = JSON.stringify(towers);
    if (k !== key) {
      key = k;
      if (mesh) {
        mesh.geometry.dispose();
        group.remove(mesh);
        mesh = null;
      }
      if (towers.length) {
        mesh = new THREE.Mesh(buildTowerGeometry(towers), mat);
        mesh.name = "neonSkyline";
        mesh.castShadow = false;
        mesh.receiveShadow = false;
        mesh.raycast = () => {};
        group.add(mesh);
      }
    }
    setUniforms(S || {}, night);
  }
  return {
    group,
    update,
    dispose() {
      mesh?.geometry.dispose();
      mat.dispose();
    },
  };
}

export function buildNeon(P, U) {
  const group = new THREE.Group();
  group.name = "neon";

  const nU = {
    k: uniform(0), // the signs' radiance scale this frame (update: night level x G, or day x the sky)
    bloom: uniform(1),
    tube: uniform(0.05),
    hot: uniform(1), // the tube's near-white core, x its colour's peak
    panel: uniform(0.4), // a lightbox panel's level, x a tube's
    boxTubes: uniform(1), // x a lightbox's two side tubes
    boxHot: uniform(0), // a lightbox's hot middle, x a tube's level
    haze: uniform(1), // x the distance haze's mix
    motion: uniform(1), // 0 under prefers-reduced-motion: the screens freeze, nothing flickers
    flicker: uniform(1), // motion x (outside.neon.flicker > 0)
    flat: uniform(0), // the placement sweep: whole cards, flat colours
    pal: [0, 1, 2, 3].map(() => uniform(new THREE.Vector3(1, 1, 1))),
  };
  // the signs as the towers see them, for the spill (update fills them)
  const sR = {
    rect: Array.from({ length: MAX_SPILL }, () => uniform(new THREE.Vector4(0, -90, 0, 0))),
    col: Array.from({ length: MAX_SPILL }, () => uniform(new THREE.Vector3(0, 0, 0))),
  };

  // prefers-reduced-motion, followed live (the listener goes with the module)
  const mq = typeof window !== "undefined" && window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  let reduced = !!mq?.matches;
  const onMq = (e) => {
    reduced = !!e.matches;
  };
  mq?.addEventListener?.("change", onMq);

  // --- the material ---------------------------------------------------------------------
  const aSign = attribute("aSign", "vec4"); // kind, colour index, flicker, seed
  const aSize = attribute("aSize", "vec4"); // w, h (m), distance (m), second colour index
  const kind = aSign.x;
  const seed = aSign.w;
  const hw = aSize.x.mul(0.5), hh = aSize.y.mul(0.5);
  const p = uv().sub(0.5).mul(vec2(aSize.x.add(2 * PAD), aSize.y.add(2 * PAD))); // m from the centre
  const tw = nU.tube;
  // the lens's blur at this distance widens every edge and tube (in quadrature); a
  // tube's peak falls as it spreads, its light kept
  const blur = outdoorLensBlur(U, aSize.z).mul(aSize.z);
  const wEff = sqrt(tw.mul(tw).add(blur.mul(blur)));
  const peak = tw.div(wEff);
  const Ts = U.T.mul(nU.motion);

  const kFrame = float(1).sub(step(0.5, kind));
  const kBlade = step(0.5, kind).mul(float(1).sub(step(1.5, kind)));
  const kStrip = step(1.5, kind).mul(float(1).sub(step(2.5, kind)));
  const kScreen = step(2.5, kind);
  const kBox = kFrame.add(kBlade); // the two lightboxes

  // the palette: a colour index picks one of four slots
  const pick = (i) => {
    const w0 = float(1).sub(step(0.5, i));
    const w1 = step(0.5, i).mul(float(1).sub(step(1.5, i)));
    const w2 = step(1.5, i).mul(float(1).sub(step(2.5, i)));
    const w3 = step(2.5, i);
    return vec3(nU.pal[0]).mul(w0).add(vec3(nU.pal[1]).mul(w1)).add(vec3(nU.pal[2]).mul(w2)).add(vec3(nU.pal[3]).mul(w3));
  };
  const colA = pick(aSign.y);
  const colB = pick(aSize.w);
  const maxc = (c) => max(max(c.x, c.y), c.z);

  // the sign's box (negative inside), its cover softened by the blur
  const dBox = sdBox(p, vec2(hw, hh));
  const inside = float(1).sub(smoothstep(wEff.negate(), wEff, dBox));
  // the long axis: along it (m from the middle), across it, and the half lengths
  const horiz = step(aSize.y, aSize.x);
  const along = mix(p.y, p.x, horiz);
  const across = mix(p.x, p.y, horiz);
  const halfLen = mix(hh, hw, horiz);
  const halfAcr = mix(hw, hh, horiz);
  // a lightbox's tubes: one down each LONG side, just inside the box, stopping short
  // of its ends (two lines bracketing a lit panel, never an outline round it: a closed
  // rounded outline read as a UI button)
  const sideIn = halfAcr.sub(tw.mul(1.5));
  const dSides = length(vec2(max(abs(along).sub(halfLen.sub(tw.mul(2))), 0), abs(across).sub(sideIn)));
  // a strip: one straight tube along the long side, broken once in some (a dark gap
  // at a hashed place, 0.15 to 0.35 of the way along, never in the middle)
  const dStrip = length(vec2(max(abs(along).sub(halfLen.sub(tw)), 0), across));
  const gapAt = halfLen.mul(mix(float(-0.7), float(0.4), fract(seed.mul(5.31)))); // m along
  const gapHalf = halfLen.mul(0.05);
  const broken = step(0.4, fract(seed.mul(3.7)));
  const gapCut = mix(float(1), smoothstep(gapHalf, gapHalf.add(wEff), abs(along.sub(gapAt))), broken.mul(kStrip));

  // the tube's profile: the glow and the hot core (a third as wide), the core clipping
  // toward white (the gas at its brightest)
  const dTube = mix(dSides, dStrip, kStrip);
  const glowT = exp(dTube.div(wEff).mul(dTube.div(wEff)).negate());
  const coreW = wEff.mul(0.42);
  const coreT = exp(dTube.div(coreW).mul(dTube.div(coreW)).negate());
  // (r3, 2026-10-06) a lightbox's two side tubes are x outside.neon.boxTubes: two
  // parallel bright bars read as a pause glyph once the lens blurs them; at 0 the box
  // glows from its own middle instead (boxHot, below)
  const hasTube = kBox.mul(nU.boxTubes).add(kStrip);
  // the tubes in the sign's first colour: two hues finer than the lens's blur average
  // to grey (a magenta panel with cyan tubes read lavender-grey at the hero)
  const tubeCol = colA;
  const tubeE = tubeCol.mul(glowT).add(vec3(maxc(tubeCol)).mul(coreT).mul(nU.hot)).mul(peak).mul(gapCut).mul(hasTube);

  // a lightbox panel: lit from inside, brightest down its long middle (the tubes behind
  // the diffuser), a two-colour gradient along it that drifts slowly, and a slow wash of
  // brighter and dimmer patches across it (a printed panel seen out of focus: never a
  // flat enamel colour)
  const uA = along.div(max(halfLen, 1e-3)), uC = across.div(max(halfAcr, 1e-3)); // -1..1
  const diffuse = float(0.6).add(float(0.4).mul(float(1).sub(uC.mul(uC)).clamp(0, 1)));
  const grad = smoothstep(-0.8, 0.8, sin(uA.mul(1.3).add(Ts.mul(0.15)).add(seed.mul(6.28))));
  const wash = float(0.75).add(sin(uA.mul(5.1).add(seed.mul(17)).add(Ts.mul(0.3))).mul(sin(uC.mul(2.3).add(seed.mul(9)))).mul(0.25));
  const boxCol = mix(colA, mix(colA, colB, 0.35), grad);
  // the screen: a dark backing frame round the lit panel, a coarse mosaic over a slow
  // two-colour gradient (at most 6 cells a side, a new pattern at most every 1.5 s)
  const ux = p.x.div(max(hw, 1e-3)), uy = p.y.div(max(hh, 1e-3));
  const bw = min(hw, hh).mul(0.12);
  const dInner = sdBox(p, vec2(hw.sub(bw), hh.sub(bw)));
  const innerS = float(1).sub(smoothstep(wEff.mul(-0.5), wEff.mul(0.5), dInner));
  const cells = floor(seed.mul(2.999)).add(4); // 4 to 6 a side
  const cell = floor(ux.mul(0.5).add(0.5).mul(cells)).add(floor(uy.mul(0.5).add(0.5).mul(cells)).mul(9));
  const slot = floor(Ts.div(1.5));
  const tile = hash11(cell.mul(1.37).add(slot.mul(2.71)).add(seed.mul(17)));
  const sGrad = sin(ux.mul(1.6).add(uy.mul(0.9)).add(Ts.mul(0.2)).add(seed.mul(6.28))).mul(0.5).add(0.5);
  const screenCol = mix(colA, colB, sGrad).mul(float(0.5).add(tile.mul(0.7)));
  const panelCol = boxCol.mul(diffuse).mul(wash).mul(kBox).add(screenCol.mul(innerS).mul(kScreen));
  // a lightbox's hot middle (outside.neon.boxHot, x a tube's level; 0 = none): the gas
  // behind the diffuser at its brightest down the box's long middle, clipping toward
  // white, the colour kept toward the rim (a lit sign seen out of focus: a hot core in
  // a saturated glow, never an outline)
  const boxCore = exp(uC.mul(uC).div(0.07).negate()).mul(float(1).sub(smoothstep(0.55, 1.0, abs(uA))));
  const boxHotE = mix(boxCol, vec3(maxc(boxCol)), 0.55).mul(boxCore).mul(nU.boxHot).mul(kBox);
  const panelE = panelCol.mul(nU.panel).add(boxHotE).mul(inside).mul(float(1).sub(kStrip));

  // flicker: half-second slots, a hashed share of them dark, only where flagged
  const off = step(0.92, hash11(floor(U.T.mul(2)).add(seed.mul(53.7)))).mul(nU.flicker).mul(aSign.z);
  const lit = float(1).sub(off);
  const E = tubeE.add(panelE).mul(nU.k).mul(lit);
  // the screen's backing frame: a dark surface lit by the sky
  const backing = vec3(U.skyAmb).mul(0.03).mul(kScreen).mul(float(1).sub(innerS)).mul(inside);
  // the distance haze, as every outdoor surface takes it (x outside.neon.haze)
  const dist = positionWorld.sub(cameraPosition).length();
  const f = float(1).sub(exp(dist.div(U.hazeDist).negate())).clamp(0, 0.97).mul(nU.haze);
  // the murk (outside.horizon.murk, outside.js U.murk): a sign above the lit cloud's
  // base shows through it, dimmed and veiled in the cloud's colour
  const pw = positionWorld;
  const elDeg = pw.y.div(max(length(vec2(pw.x, pw.z)), 1e-3)).atan().mul(180 / Math.PI);
  const inCloud = smoothstep(U.murk.y.sub(U.murk.z), U.murk.y.add(U.murk.z), elDeg).mul(U.murk.x).mul(0.35);
  const murkCol = vec3(U.hazeCol).add(vec3(U.glowCol).mul(U.murk.w));
  const hazed = mix(mix(E.add(backing), vec3(U.hazeCol), f), murkCol, inCloud);
  const flatCol = colA.mul(0.5);
  const c = mix(hazed, flatCol, nU.flat);
  // the mask the alpha test cuts on: the panels' box, a strip's tube
  const mask = max(max(inside.mul(float(1).sub(kStrip)), glowT.mul(kStrip).mul(gapCut).mul(1.2)), nU.flat);

  const mat = new THREE.MeshBasicNodeMaterial({ side: THREE.DoubleSide });
  mat.name = "neonSigns";
  mat.colorNode = c;
  mat.opacityNode = mask;
  mat.alphaTest = 0.5;
  // the bloom: the sign's own light only (not the haze it sits in)
  mat.mrtNode = mrt({ emissive: E.mul(float(1).sub(f)).mul(float(1).sub(inCloud.mul(0.5))).mul(mix(nU.bloom, float(0), nU.flat)) });
  mat.fog = false;

  // the towers the signs hang on (above)
  const skyline = buildSkyline(P, U, nU, sR);
  group.add(skyline.group);

  let mesh = null;
  let key = "";
  function ensureGeometry(N) {
    const k = signsKey(N);
    if (k === key && mesh) return;
    key = k;
    if (mesh) {
      mesh.geometry.dispose();
      group.remove(mesh);
      mesh = null;
    }
    if (!(N.signs || []).length) return;
    mesh = new THREE.Mesh(buildGeometry(N.signs), mat);
    mesh.name = "neonSigns";
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    // never in a raycast (the lamp's glow placement, the moon check): it is distance
    mesh.raycast = () => {};
    group.add(mesh);
  }

  const tmp = new THREE.Color();
  const lin = [new THREE.Color(), new THREE.Color(), new THREE.Color(), new THREE.Color()];
  const dirA = new THREE.Vector3(), dirB = new THREE.Vector3(), dv = new THREE.Vector3();
  const dbg = { motion: 1, signs: 0, mean: [0, 0, 0] };

  function zero() {
    NEON.mean.setRGB(0, 0, 0);
    NEON.a.value.set(0, 0, 0);
    NEON.b.value.set(0, 0, 0);
    NEON.spread.value.set(0, 0);
  }

  function update(state) {
    const N = P.outside.neon || {};
    const on = !!N.enabled;
    group.visible = on;
    if (!on) {
      zero();
      return;
    }
    ensureGeometry(N);
    // the signs' own switch-on (outside.neon.onAlt [full day, full night], the sun's
    // altitude in deg; absent = U.night, +5 to -5): the city lights its signs before
    // the sky is dark, so the 17:41 switch-on shows lit neon
    const alt = state?.weather?.sun?.alt;
    const OA = N.onAlt;
    const night = Array.isArray(OA) && Number.isFinite(alt) ? 1 - smooth(OA[1], OA[0], alt) : U.night.value;
    skyline.update(N.skyline, night);
    // the palette, each colour held to at most lumCap of luminance (linear): a bright
    // cyan tube at the magenta's level clipped to a pale mint under the tone mapper
    const pal = N.palette || [];
    const cap = N.lumCap ?? 1;
    for (let i = 0; i < 4; i++) {
      lin[i].setStyle(pal[i] || pal[0] || "#ffffff", THREE.SRGBColorSpace);
      const l = LUMA[0] * lin[i].r + LUMA[1] * lin[i].g + LUMA[2] * lin[i].b;
      if (l > cap) lin[i].multiplyScalar(cap / l);
      nU.pal[i].value.set(lin[i].r, lin[i].g, lin[i].b);
    }
    nU.bloom.value = (N.dayBloom ?? N.bloom ?? 1) + ((N.bloom ?? 1) - (N.dayBloom ?? N.bloom ?? 1)) * night;
    nU.tube.value = Math.max(0.005, N.tube ?? 0.05);
    nU.hot.value = N.hot ?? 1;
    nU.panel.value = N.panel ?? 0.4;
    nU.boxTubes.value = N.boxTubes ?? 1;
    // by day the hot middle is dayHot of it (a lit panel in daylight keeps its colour;
    // a white middle read as a grey ghost against the bright smog), eased like the level
    nU.boxHot.value = (N.boxHot ?? 0) * ((N.dayHot ?? 1) + (1 - (N.dayHot ?? 1)) * night);
    nU.haze.value = Math.max(0, Math.min(1, N.haze ?? 1));
    nU.motion.value = reduced ? 0 : 1;
    nU.flicker.value = reduced || !(N.flicker > 0) ? 0 : 1;
    nU.flat.value = N.debugFlat ? 1 : 0;
    // the signs' light this frame (radiance scale, scene units). At night: level x the
    // light gain G (physical light, as the city's windows). By day: dayLevel x the sky
    // light outdoor surfaces receive (U.skyAmb's luminance), per unit of lumCap, so a
    // sign holds its place against the sky whatever the camera does. Eased by U.night
    // (sun +5 to -5 deg). In rain and storm the wet air spreads each sign's light
    // (wetBloom x the bloom, by U.wet)
    const sa = U.skyAmb.value;
    const skyL = LUMA[0] * sa.r + LUMA[1] * sa.g + LUMA[2] * sa.b;
    const kNight = (N.level ?? 0.6) * U.lightGain.value;
    const kDay = ((N.dayLevel ?? 1) * skyL) / Math.max(1e-3, N.lumCap ?? 1);
    // (in rain the signs burn at their night level against the dark deck: wetNight x the
    // wetness of the way from the day's level to the night's)
    const k = kDay + (kNight - kDay) * Math.max(night, (N.wetNight ?? 0) * U.wet.value);
    nU.k.value = k;
    nU.bloom.value *= 1 + ((N.wetBloom ?? 1) - 1) * U.wet.value;
    // what reaches the window: each sign's colour x its radiance x its solid angle /
    // 2 pi x the share of it that is lit; and where the first two colours' signs stand
    NEON.mean.setRGB(0, 0, 0);
    dirA.set(0, 0, 0);
    dirB.set(0, 0, 0);
    for (const s of N.signs || []) {
      const d = Math.max(1, s.dist ?? 20);
      const omega = ((s.w ?? 1) * (s.h ?? 1)) / (d * d);
      const ci = Array.isArray(s.colors) ? s.colors : [s.color ?? 0];
      const share = LIT_SHARE[KIND[s.kind] ?? 0] * (N.panel ?? 0.4) + (s.kind === "strip" ? 1 : 0.1);
      tmp.setRGB(0, 0, 0);
      for (const c of ci) tmp.add(lin[Math.max(0, Math.min(3, c | 0))]);
      tmp.multiplyScalar((k * omega * share) / (2 * Math.PI * ci.length));
      NEON.mean.add(tmp);
      const b = (s.bearing ?? 0) * D2R, e = (s.elev ?? 9) * D2R;
      dv.set(Math.sin(b) * Math.cos(e), Math.sin(e), -Math.cos(b) * Math.cos(e)).multiplyScalar((s.w ?? 1) * (s.h ?? 1));
      if (ci.includes(0)) dirA.add(dv);
      if (ci.includes(1)) dirB.add(dv);
    }
    // the spill: each sign's light on the wall round it (outside.neon.skyline.spill
    // level x the sign's radiance, its colours' mean x its lit share), the first
    // MAX_SPILL signs
    const Sp = N.skyline?.spill || {};
    const spl = (Sp.level ?? 0) * k;
    const signs = N.signs || [];
    for (let i = 0; i < MAX_SPILL; i++) {
      const s = signs[i];
      if (!s || !(spl > 0)) {
        sR.rect[i].value.set(0, -90, 0, 0);
        sR.col[i].value.set(0, 0, 0);
        continue;
      }
      const d = Math.max(1, s.dist ?? 20);
      const ci = Array.isArray(s.colors) ? s.colors : [s.color ?? 0];
      tmp.setRGB(0, 0, 0);
      for (const c of ci) tmp.add(lin[Math.max(0, Math.min(3, c | 0))]);
      const lk = (spl * (s.kind === "strip" ? 0.35 : 1)) / ci.length;
      sR.rect[i].value.set(s.bearing ?? 0, s.elev ?? 9, Math.atan((s.w ?? 1) / 2 / d) / D2R, Math.atan((s.h ?? 1) / 2 / d) / D2R);
      sR.col[i].value.set(tmp.r * lk, tmp.g * lk, tmp.b * lk);
    }
    NEON.a.value.set(lin[0].r * k, lin[0].g * k, lin[0].b * k);
    NEON.b.value.set(lin[1].r * k, lin[1].g * k, lin[1].b * k);
    if (dirA.lengthSq() > 0) NEON.dirA.value.copy(dirA.normalize());
    if (dirB.lengthSq() > 0) NEON.dirB.value.copy(dirB.normalize());
    // spread (deg, sigma): how far from those directions a drop still catches them
    const sp = N.dropSpread || [12, 30];
    const inv = (deg) => (deg > 0 ? 1 / Math.pow(deg * D2R, 2) : 0);
    NEON.spread.value.set(inv(sp[0]), inv(sp[1]));
    dbg.motion = nU.flicker.value;
    dbg.reduced = reduced;
    dbg.signs = (N.signs || []).length;
    dbg.mean = [NEON.mean.r, NEON.mean.g, NEON.mean.b].map((v) => +v.toFixed(6));
    dbg.radiance = +k.toFixed(5);
  }

  // the signs' rim on the bamboo's edges (outside.neon.rim; 0 = none): the rim colour
  // (palette[rimColor]) at rim x the light gain G (physical light, like the signs'
  // night level), by night, from where those signs stand (the outdoor materials' rim
  // term, U.moonRim / U.moonDir, which only Dreamlike's moon drives otherwise).
  // Returns false when it sets nothing
  function rim(U2) {
    const N = P.outside.neon || {};
    const r = N.enabled ? N.rim ?? 0 : 0;
    if (!(r > 0)) return false;
    const c = lin[Math.max(0, Math.min(3, N.rimColor ?? 0))];
    const k = r * U2.lightGain.value * U2.night.value;
    U2.moonRim.value.setRGB(c.r * k, c.g * k, c.b * k);
    U2.moonDir.value.copy(N.rimColor === 1 ? NEON.dirB.value : NEON.dirA.value);
    return true;
  }

  return {
    group,
    update,
    rim,
    debug: () => ({ ...dbg }),
    stats: () => ({ signs: dbg.signs }),
    dispose() {
      mq?.removeEventListener?.("change", onMq);
      zero();
      mesh?.geometry.dispose();
      mat.dispose();
      skyline.dispose();
      group.removeFromParent();
    },
  };
}
