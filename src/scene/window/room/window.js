// The window: casing with its moulding profile, the left French pair, the corner
// post, the right section built at an angle with R1 (the handle leaf) ajar, glass,
// glazing beads and putty lines, the brass D-handle and hinges, the torn keyhole
// slot, the room-side iron grille (two panels and their tie bars), the sill ledge,
// the brown exterior box grille and the dark plane behind R2.
//
// Every length is in W (params.room, params.dims.W) and converted to metres here.
// Proportions: 13-photo-inventory.md 4; positions: fit to the 17:41 photo (see the
// comments in params.room.js).

import * as THREE from "three/webgpu";
import { Batch, boxGeo, prismGeo, barGeo, clean, M, roundBarGeo, roundBeamX } from "./geom.js";

const D2R = Math.PI / 180;

export function buildWindow(P, ctx, mats, root) {
  const W = P.dims.W;
  const k = (v) => v * W;
  const R = P.room;
  const w = R.window;
  const m = mats.m;
  const rows = w.rows;
  const Cs = w.casing;

  // --- heights (W) ---
  const Y = {};
  Y.gb = -rows.belowSill; // glass bottom, below the ledge top
  Y.bot = Y.gb - rows.bottomRail;
  Y.C1 = rows.C;
  Y.B0 = Y.C1 + rows.railBC;
  Y.B1 = Y.B0 + rows.B;
  Y.A0 = Y.B1 + rows.railAB;
  Y.A1 = Y.A0 + rows.A;
  Y.top = Y.A1 + rows.topRail;
  Y.headLo = Y.top + w.head.gapAboveLeaf; // underside of the head casing's rebate
  Y.headHi = Y.headLo + w.rebate + Cs.width;
  const panesY = [[Y.gb, Y.C1], [Y.B0, Y.B1], [Y.A0, Y.A1]];
  const railsY = [[Y.bot, Y.gb], [Y.C1, Y.B0], [Y.B1, Y.A0], [Y.A1, Y.top]];
  const rowsL = { bot: Y.bot, top: Y.top, panes: panesY, rails: railsY };
  // the right section is taller (fit: its row C glass runs from 1.655 down to
  // -0.716 W, a 0.35 W rail, then a fourth row below; the left pair's sill ledge does
  // not cross it)
  // w.right.flat (2026-09-27, Agam: the window read as "two broken pieces"): the
  // right pair is the same frame as the left, flat on its glass line with the same
  // three rows and rails; R1 still swings open on its hinge. flat false restores the
  // angled, taller fit
  const flatR = w.right.flat === true;
  const RR = flatR ? { D0: Y.gb, D1: Y.gb, C0: Y.gb, C1: Y.C1, B0: Y.B0 } : w.right.rows;
  const YR = { D0: RR.D0, D1: RR.D1, C0: RR.C0, C1: RR.C1, B0: RR.B0 };
  YR.bot = flatR ? Y.bot : YR.D0 - rows.bottomRail;
  const rowsR = flatR ? { bot: Y.bot, top: Y.top, panes: panesY, rails: railsY } : {
    bot: YR.bot,
    top: Y.top,
    panes: [[YR.D0, YR.D1], [YR.C0, YR.C1], [YR.B0, Y.B1], [Y.A0, Y.A1]],
    rails: [[YR.bot, YR.D0], [YR.D1, YR.C0], [YR.C1, YR.B0], [Y.B1, Y.A0], [Y.A1, Y.top]],
  };
  const zb = -w.leaf.glassFromBack;
  const zf = w.leaf.depth - w.leaf.glassFromBack;

  const S = new Batch("window"); // static, room frame
  const glassGeos = { L: [], R1: [], R2: [] };

  // --- one member of a leaf (a stile or a rail) across [s0, s1] (x for a stile,
  // y for a rail) and along its axis from a0 to a1; lo / hi: a pane lies on that
  // side. Each surface is built as what it is:
  //  - behind the glass (zb..0) the glazing rebate. Its faces seen through the
  //    glass are the outside putty and paint, lit by the sky (m.rebate). Round 1
  //    drew this as unlit enamel 0.2 W deep, a dark 6 to 9 px rim inside every pane
  //    where the photo's glass stays bright to the wood (round 2, the photo critic)
  //  - in front of it the enamel, chamfered toward each pane (the sticking; the
  //    photos: chamfered rail edges, small mitres at the pane corners)
  //  - between the glass and the chamfer the pane's reveal: a thin slab in the
  //    matte, weathered m.reveal, with the putty line at the glass. Glossy there,
  //    it mirrored the bright pane at grazing view as a pale outline round every
  //    pane (round 2, both critics: "white UPVC windows")
  const REV = 0.004; // W, the reveal slab (the enamel is inset behind it)
  function member(batch, axis, s0, s1, a0, a1, lo, hi) {
    const c = w.sticking;
    const P = (pts) => pts.map(([a, b]) => [k(a), k(b)]);
    const sL = lo ? s0 + REV : s0, sR = hi ? s1 - REV : s1;
    // behind the glass: enamel, with the sky-lit rebate only on the pane sides (the
    // leaf's outer and meeting edges stay enamel: R1 ajar shows its outer edge)
    batch.add(m.enamel, prismGeo(P([[sL, zb], [sR, zb], [sR, 0], [sL, 0]]), axis, k(a0), k(a1)));
    if (hi) batch.add(m.rebate, prismGeo(P([[sR, zb], [s1, zb], [s1, 0], [sR, 0]]), axis, k(a0), k(a1)), null, { cast: false });
    if (lo) batch.add(m.rebate, prismGeo(P([[s0, zb], [sL, zb], [sL, 0], [s0, 0]]), axis, k(a0), k(a1)), null, { cast: false });
    const pts = [[sL, 0], [sR, 0]];
    if (hi) pts.push([sR, zf - c], [s1 - c, zf]);
    else pts.push([s1, zf]);
    if (lo) pts.push([s0 + c, zf], [sL, zf - c]);
    else pts.push([s0, zf]);
    batch.add(m.enamel, prismGeo(P(pts), axis, k(a0), k(a1)));
    if (hi) batch.add(m.reveal, prismGeo(P([[sR, 0], [s1, 0], [s1, zf - c], [sR, zf - c]]), axis, k(a0), k(a1)), null, { cast: false });
    if (lo) batch.add(m.reveal, prismGeo(P([[s0, 0], [sL, 0], [sL, zf - c], [s0, zf - c]]), axis, k(a0), k(a1)), null, { cast: false });
    // the putty fillet on the glass along each pane edge (a 45 deg bevel from the
    // glass up the reveal; seen face on in 5481, on edge from the hero's chair)
    const pw = w.putty?.width ?? 0.012, ph = w.putty?.height ?? 0.012;
    if (hi) batch.add(m.putty, prismGeo(P([[s1, 0], [s1 + pw, 0], [s1, ph]]), axis, k(a0), k(a1)), null, { cast: false });
    if (lo) batch.add(m.putty, prismGeo(P([[s0 - pw, 0], [s0, 0], [s0, ph]]), axis, k(a0), k(a1)), null, { cast: false });
  }

  // --- one leaf in a frame whose glass plane is z = 0; returns its x edges. The
  // stiles run full height (the rails cover the notch); the rails reach into the
  // stiles' chamfer notches so the chamfers mitre at the pane corners ---
  function leaf(batch, glassList, x0, [ls, pane, rs], rowsSpec = rowsL) {
    const x1 = x0 + ls, x2 = x1 + pane, x3 = x2 + rs;
    const c = w.sticking;
    member(batch, "y", x0, x1, rowsSpec.bot, rowsSpec.top, false, true);
    member(batch, "y", x2, x3, rowsSpec.bot, rowsSpec.top, true, false);
    const paneTops = new Set(rowsSpec.panes.map((p2) => p2[1]));
    const paneBots = new Set(rowsSpec.panes.map((p2) => p2[0]));
    for (const [y0, y1] of rowsSpec.rails) member(batch, "x", y0, y1, x1 - c, x2 + c, paneTops.has(y0), paneBots.has(y1));
    for (const [y0, y1] of rowsSpec.panes) {
      // the glass itself (UVs in metres, u right, v up)
      const g = new THREE.PlaneGeometry(k(pane), k(y1 - y0));
      g.translate(k((x1 + x2) / 2), k((y0 + y1) / 2), 0);
      const uvA = g.attributes.uv, pA = g.attributes.position;
      for (let i = 0; i < uvA.count; i++) uvA.setXY(i, pA.getX(i), pA.getY(i));
      glassList.push(clean(g));
    }
    return [x0, x1, x2, x3];
  }
  const hinge = (batch, x, sideSign) => {
    for (const yy of [0.9, Y.A1 - 0.6]) {
      const g = new THREE.CylinderGeometry(k(0.05), k(0.05), k(0.75), 10);
      batch.add(m.brass, g, M.T(k(x + sideSign * 0.02), k(yy), k(zb - 0.03)));
    }
  };

  // --- the casing: one vertical profile (x, z), from the wall edge xo to the
  // opening edge xi; dir = +1 when x grows toward the opening ---
  function casingProfile(xo, dir) {
    const f = Cs.face, bk = Cs.back;
    const X = (d) => xo + dir * d;
    const pts = [[X(0), bk], [X(0), f], [X(Cs.band), f], [X(Cs.band + Cs.groove / 2), f - Cs.grooveDepth], [X(Cs.band + Cs.groove), f]];
    const xb0 = Cs.band + Cs.groove + Cs.flat;
    pts.push([X(xb0), f]);
    const rB = Cs.beadW / 2;
    for (let i = 1; i < 6; i++) {
      const t = (i / 6) * Math.PI;
      pts.push([X(xb0 + rB - rB * Math.cos(t)), f + rB * 0.7 * Math.sin(t)]);
    }
    pts.push([X(xb0 + Cs.beadW), f]);
    const wdt = Cs.width;
    // the rebate's floor sits rebateStep below the leaf's room face (zf), so the leaf's
    // outer edge shows no lit side face
    const zr = zf - (w.rebateStep ?? 0.15);
    pts.push([X(wdt - 0.03), f - 0.01], [X(wdt), f - 0.05], [X(wdt), zr], [X(wdt + w.rebate), zr], [X(wdt + w.rebate), bk]);
    return pts.map(([a, b]) => [k(a), k(b)]);
  }

  // --- the left French pair ---
  const ms = w.meetingStile;
  const L1x0 = -(ms[1] / 2 + ms[0] + w.paneL1 + w.hingeStile);
  leaf(S, glassGeos.L, L1x0, [w.hingeStile, w.paneL1, ms[0]]);
  const L2 = leaf(S, glassGeos.L, ms[1] / 2, [ms[2], w.paneL2, w.hingeStile]);
  // the meeting stiles close on a rebated joint: no slot of sky between them. The
  // open 0.03 W slot let the fill light both stiles' sides and drew a pale line
  // down the pair (round 2, x 962 to 965 at 17:41); now a dark joint a hair below
  // the faces
  S.add(m.dark, boxGeo(k(-ms[1] / 2), k(ms[1] / 2), k(Y.bot), k(Y.top), k(zb), k(zf - w.jointDepth), "y"), null, { cast: false });
  hinge(S, L1x0, -1);
  hinge(S, L2[3], 1);
  const casL_i = L1x0 - w.rebate; // opening edge of the left casing
  const casL_o = casL_i - Cs.width; // its wall edge
  S.add(m.enamel, prismGeo(casingProfile(casL_o, 1), "y", k(Y.bot - 0.4), k(Y.headHi), { smooth: [6, 7, 8, 9, 10, 12, 13] }));

  // --- two old screw holes on L2's hinge stile (5482; 13-photo 4.4) ---
  // The fixings of a lost handle: the upper one a small torn slot (bare wood
  // showing, about 3 x 8 mm) with its dark hole at the top, the lower one a round
  // hole with a flake of paint lifted beside it. Round 1 drew a keyhole escutcheon
  // (an 8 mm keyhole in an 11 mm star of bare wood) that read as a flat icon at
  // every distance; the photo shows two small dark holes in the gloss
  {
    const KH = w.keyhole;
    const kx = L2[2] + w.hingeStile * KH.x;
    const ky = KH.y;
    const [sw, sh] = KH.slot ?? [0.034, 0.09];
    const flat = (shape, x, y, z, mat) => {
      const g = new THREE.ShapeGeometry(shape, 8);
      g.scale(W, W, 1);
      S.add(mat, g, M.T(k(x), k(y), k(zf) + z), { cast: false });
    };
    const blob = (cx, cy, rx, ry, jag, seed) => {
      const sp = new THREE.Shape();
      const pts = [];
      for (let i = 0; i < 18; i++) {
        const a = (i / 18) * Math.PI * 2;
        const j = 1 + jag * (0.6 * Math.sin(i * 2.7 + seed) + 0.4 * Math.cos(i * 5.3 + seed * 1.7));
        pts.push(new THREE.Vector2(cx + rx * j * Math.cos(a), cy + ry * j * Math.sin(a)));
      }
      sp.setFromPoints(pts);
      return sp;
    };
    // upper: the torn slot, its hole a small dark teardrop at the slot's top
    flat(blob(0, -sh * 0.12, sw / 2, sh / 2, 0.16, 1.3), kx, ky, 0.0003, m.bareWood || m.putty);
    const tear = new THREE.Shape();
    const hr = KH.hole ?? 0.011;
    tear.absarc(0, sh * 0.26, hr, -Math.PI * 0.35, Math.PI * 1.35, false);
    tear.lineTo(0, sh * 0.26 - hr * 2.1);
    tear.closePath();
    flat(tear, kx, ky, 0.0006, m.dark);
    // lower: a round hole and a flake of lifted paint to its left
    const y2 = ky - KH.screwBelow;
    const h2 = KH.hole2 ?? 0.009;
    flat(blob(-h2 * 1.9, h2 * 0.2, h2 * 1.5, h2 * 0.8, 0.25, 4.1), kx, y2, 0.0003, m.bareWood || m.putty);
    const c2 = new THREE.Shape();
    c2.absarc(0, 0, h2, 0, Math.PI * 2, false);
    flat(c2, kx, y2, 0.0006, m.dark);
  }

  // --- the right section: its own frame, glass plane at local z = 0 ---
  const Rp = w.right;
  const a = (Rp.flat ? 0 : Rp.angleDeg) * D2R;
  const origin = Rp.flat ? [Rp.origin[0], 0] : Rp.origin;
  const right = new THREE.Group();
  right.name = "rightSection";
  right.position.set(k(origin[0]), 0, k(origin[1]));
  right.rotation.y = -a; // local +x runs along the section, its right end into the room
  root.add(right);
  right.updateMatrix();
  const Rw = (lx, lz) => [origin[0] + lx * Math.cos(a) - lz * Math.sin(a), origin[1] + lx * Math.sin(a) + lz * Math.cos(a)];
  const RS = new Batch("rightSection");
  const R1B = new Batch("R1");
  // R1: hinged on its right, ajar outward; its body hangs from the pivot
  const r1w = Rp.freeStile + Rp.paneR1 + Rp.hingeStileR1;
  const handleLeaf = new THREE.Group();
  handleLeaf.name = "handleLeaf";
  handleLeaf.position.set(k(r1w), 0, k(zb));
  right.add(handleLeaf);
  const r1Body = new THREE.Group();
  r1Body.position.set(-k(r1w), 0, -k(zb));
  handleLeaf.add(r1Body);
  leaf(R1B, glassGeos.R1, 0, [Rp.freeStile, Rp.paneR1, Rp.hingeStileR1], rowsR);
  hinge(R1B, r1w, 1);
  const r2x0 = r1w + Rp.gapR;
  const R2 = leaf(RS, glassGeos.R2, r2x0, [Rp.stileR2, Rp.paneR2, Rp.stileR2out], rowsR);
  // the joint between R1's hinge stile and R2 (as the meeting stiles)
  RS.add(m.dark, boxGeo(k(r1w), k(r2x0), k(YR.bot), k(Y.top), k(zb), k(zf - w.jointDepth), "y"), null, { cast: false });
  hinge(RS, R2[3], 1);
  // right casing of the section (mirror profile) and its head
  const casR_i = R2[3] + w.rebate;
  const casR_o = casR_i + Cs.width;
  RS.add(m.enamel, prismGeo(casingProfile(casR_o, -1), "y", k(YR.bot - 0.4), k(Y.headHi)));

  // the brass D-handle on R1's free stile, centred on the B/C rail: its edge-on bow
  // glints across y 1740 to 2100 in the wide photo, and 5482 shows it beside the
  // keyhole's rail (13-photo 4.5 says A/B; the photos say B/C). params.room.window.
  // handle.enabled: false leaves it off (Agam, 2026-09-27)
  if (w.handle.enabled !== false) {
    const Hd = w.handle;
    const hx = k(Rp.freeStile * 0.45), hy = k((YR.C1 + YR.B0) / 2), hz = k(zf);
    const L = Hd.length, so = Hd.standoff;
    const path = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, L / 2, 0.004),
      new THREE.Vector3(0, L / 2 - 0.004, so * 0.75),
      new THREE.Vector3(0, L / 2 - 0.016, so),
      new THREE.Vector3(0, 0, so * 1.05),
      new THREE.Vector3(0, -L / 2 + 0.016, so),
      new THREE.Vector3(0, -L / 2 + 0.004, so * 0.75),
      new THREE.Vector3(0, -L / 2, 0.004),
    ]);
    R1B.add(m.brass, new THREE.TubeGeometry(path, 40, Hd.bar, 10, false), M.T(hx, hy, hz));
    for (const sgn of [1, -1]) {
      // turned bolster ends about 11 mm across (5482, 5484: small against the bow; round
      // 1's 15.6 mm discs read as rosettes facing the chair)
      const bol = new THREE.LatheGeometry([new THREE.Vector2(0.0001, 0), new THREE.Vector2(0.0055, 0), new THREE.Vector2(0.0057, 0.0015), new THREE.Vector2(0.0045, 0.005), new THREE.Vector2(0.0032, 0.0075), new THREE.Vector2(0.0001, 0.008)], 16);
      bol.rotateX(Math.PI / 2);
      R1B.add(m.brass, bol, M.T(hx, hy + sgn * (L / 2 + 0.001), hz));
      const screw = new THREE.CylinderGeometry(0.0022, 0.0022, 0.0012, 10);
      screw.rotateX(Math.PI / 2);
      R1B.add(m.brass, screw, M.T(hx, hy + sgn * (L / 2 + 0.0068), hz + 0.0005));
    }
  }

  // --- the corner post between L2 and the section (plan polygon, W). Fit: its
  // room face is parallel to the wall at the casing depth, from just right of L2's
  // hinge stile (x 1.69 at the step) to where R1's room face begins (the photo's
  // dark grooved band, 4230 to 4410 px); two grooves run down it ---
  {
    const f = Cs.face, bk = Cs.back;
    const Lx = L2[3]; // L2's hinge stile outer edge
    const R1c = Rw(-0.01, zf - 0.03); // just behind R1's outer room-face corner
    const x0 = Lx + 0.02, x1 = Math.min(R1c[0] - 0.03, Lx + 0.4);
    // two shallow grooves (a V 0.012 W deep under the enamel, like the casing's quirk)
    const g = (xc) => [[xc - 0.025, f], [xc, f - 0.012], [xc + 0.025, f]];
    // FLUSH (Agam, 2026-09-30: "I see this grey vertical column, please remove"):
    // the post stood 0.33 W proud of L2 and its shaded side read as a grey column
    // down the window. Its room face now runs level with the frames' faces, so there
    // is no side to see; the proud profile and its grooves are kept below, unused
    const flush = R.window.post?.flush !== false;
    const pts = (flush
      ? [[Lx, bk], [Lx, zf], [R1c[0], R1c[1]], Rw(-0.01, bk)]
      : [
          [Lx, bk],
          [Lx, zf],
          [x0, zf],
          [x0, f - 0.04],
          [x0 + 0.04, f],
          ...g(x0 + 0.1),
          ...g(x0 + 0.24),
          [x1, f],
          [R1c[0], R1c[1]],
          Rw(-0.01, bk),
        ]
    ).map(([x, z]) => [k(x), k(z)]);
    S.add(m.enamel, prismGeo(pts, "y", k(YR.bot - 0.4), k(Y.headHi)));
    // a slight space where the two windows meet the post (Agam, 2026-09-30: "there
    // should be a slight space between the two elements"): a dark reveal, set a hair
    // behind the faces, down each edge of the flush post
    if (flush) {
      const gw = R.window.post?.gap ?? 0.025; // W
      const zb2 = zf - (w.jointDepth ?? 0.02);
      S.add(m.dark, boxGeo(k(Lx), k(Lx + gw), k(YR.bot), k(Y.top), k(zb2 - 0.02), k(zf + 0.002), "y"), null, { cast: false });
    }
    if (!flush) {
    // its side facing L2 (from L2's room face out to the post's face, 0.33 W deep)
    // looks along the glass and is shaded by L2's hinge stile from most of the
    // opening; the unshadowed window fill lit it as a pale board (round 1's "right
    // casing reveal" at p=0 and the pale band beside the keyhole stile in the hero).
    // It carries the shaded enamel, a hair in front of the prism's own face
    const sw = k(f - 0.04 - zf), sh = k(Y.headHi - (YR.bot - 0.4));
    const side = new THREE.PlaneGeometry(sw, sh);
    const suv = side.attributes.uv;
    for (let i = 0; i < suv.count; i++) suv.setXY(i, suv.getX(i) * sw, suv.getY(i) * sh); // metres, v along the post
    side.rotateY(-Math.PI / 2); // faces -x
    S.add(m.enamelShade, side, M.T(k(x0) - 0.00012, k((Y.headHi + YR.bot - 0.4) / 2), k((zf + f - 0.04) / 2)), { cast: false });
    }
  }
  // head casings (hidden by the blind, but they close the frame)
  const headProf = (x0, x1) => boxGeo(k(x0), k(x1), k(Y.top), k(Y.headHi), k(Cs.back), k(Cs.face), "x");
  S.add(m.enamel, headProf(casL_o, L2[3] + w.rebate + 0.05));
  RS.add(m.enamel, headProf(-w.rebate - 0.1, casR_o));

  // --- room-side iron grille (off by default since 2026-09-27: Agam did not want the
  // metal grille inside the window; R.grille.enabled true brings it back) ---
  if (R.grille.enabled !== false) {
    // --- room-side iron grille: the left panel, skewed planDeg in plan ---
    const G = R.grille;
    const tg = Math.tan(G.planDeg * D2R);
    const gz = (x) => G.zRef + (x + 1) * tg; // bar-centre plane
    const gb = G.bar;
    const barTop = Y.headLo + 0.2;
    // the bars' section: square with filleted edges (G.fillet: the corner radius as a
    // share of the bar's width), so the gloss draws a line down each bar
    const fr = k(gb) * (G.fillet ?? 0.3);
    for (const x of G.barsL) S.add(m.iron, roundBarGeo([k(x), k(Y.bot), k(gz(x))], [k(x), k(barTop), k(gz(x))], k(gb), k(gb), fr));
    {
      // the upper tie bar: a flat bar, face `thick` tall, `depth` deep, in front of the bars
      const T = G.tieTop;
      const tt = Math.tan(T.tiltDeg * D2R);
      const pt = (x) => [k(x), k(T.yRef + (x + 1) * tt + T.thick / 2), k(gz(x) + gb / 2 + T.depth / 2 + 0.005)];
      const A0 = pt(T.x0), A1 = pt(T.x1);
      const va = new THREE.Vector3(...A0), vb = new THREE.Vector3(...A1);
      const len = va.distanceTo(vb);
      const g = roundBeamX(len, k(T.thick), k(T.depth), k(T.depth) * 0.35);
      const dir = vb.clone().sub(va).normalize();
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), dir);
      S.add(m.iron, g, new THREE.Matrix4().compose(va.clone().add(vb).multiplyScalar(0.5), q, new THREE.Vector3(1, 1, 1)));
      // a short bent tab fixing its left end onto the casing face
      S.add(m.iron, boxGeo(k(T.x0 - 0.02), k(T.x0 + 0.03), k(T.yRef + (T.x0 + 1) * tt), k(T.yRef + (T.x0 + 1) * tt + T.thick), k(Cs.face), A0[2] / W * W, "z"));
    }
    // the section's own panel: parallel to it, offset in front of its glass
    {
      const GR = G.right;
      const oz = GR.offset;
      for (const x of GR.bars) RS.add(m.iron, roundBarGeo([k(x), k(YR.bot), k(oz)], [k(x), k(barTop), k(oz)], k(gb), k(gb), fr));
      // a flat bar with rounded edges from its box (W)
      const flatBar = (x0, x1, y0, y1, z0, z1) => roundBeamX(k(x1 - x0), k(y1 - y0), k(z1 - z0), k(z1 - z0) * 0.35).translate(k((x0 + x1) / 2), k((y0 + y1) / 2), k((z0 + z1) / 2));
      const x0 = GR.bars[0] - 0.12, x1 = GR.bars[GR.bars.length - 1] + 0.2;
      RS.add(m.iron, flatBar(x0, x1, GR.tieLowY, GR.tieLowY + 0.167, oz + gb / 2, oz + gb / 2 + 0.05));
      // a flat bottom bar closing the panel on the section's own sill
      RS.add(m.iron, flatBar(x0, x1, YR.bot - 0.05, YR.bot + 0.12, oz + gb / 2, oz + gb / 2 + 0.05));
      // the upper tie falls to the right (fit: 5.92 W at the corner to 5.68 across R2)
      const tA = [k(x0), k(GR.tieTopY + 0.2), k(oz + gb / 2 + 0.03)], tB = [k(x1), k(GR.tieTopY - 0.18), k(oz + gb / 2 + 0.03)];
      const va = new THREE.Vector3(...tA), vb = new THREE.Vector3(...tB);
      const len = va.distanceTo(vb);
      const g = roundBeamX(len, k(0.167), k(0.05), k(0.05) * 0.35).translate(0, k(0.167) / 2, 0);
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), vb.clone().sub(va).normalize());
      RS.add(m.iron, g, new THREE.Matrix4().compose(va.clone().add(vb).multiplyScalar(0.5), q, new THREE.Vector3(1, 1, 1)));
    }
  }

  // --- the bottom member: top at y = 0 ---
  // 2026-09-27 (Agam: "there is no ledge at the window"): by default the bottom is a
  // flush enamel rail at the casing's face, closing the glass edge like the head, no
  // shelf; the car and the tile sit on the monitor's top instead (interior.js).
  // R.sill.ledge true restores the projecting ledge (front at dims.sillDepth + lip)
  const Sl = R.sill;
  const ledge = Sl.ledge !== false;
  const front = ledge ? P.dims.sillDepth / W + Sl.lip : Cs.face;
  const sillProf = (ledge
    ? [[-Sl.thickness, zf], [0, zf], [0, front - Sl.nose], [-Sl.nose * 0.6, front], [-Sl.thickness, front]]
    : [[-Sl.thickness, zf], [0, zf], [0, front], [-Sl.thickness, front]]
  ).map(([a2, b]) => [k(a2), k(b)]);
  const sillMat = ledge ? m.sill : m.enamel;
  // it stops at L2's edge while the corner post is flush (2026-09-30): the old run
  // 0.3 W past it was hidden by the proud post, and once the post went flush its end
  // stood out as a lit block at the post's foot (Agam: "this element shouldn't be there")
  const postFlush = R.window.post?.flush !== false;
  // no ledge, no rail (2026-09-30, Agam: "still see the rogue element"): the flush rail
  // still stood out to the casing face as a slab along the window's foot; without the
  // ledge the window now ends at its own bottom rails, the frame's, and nothing more
  if (ledge) {
    S.add(sillMat, prismGeo(sillProf, "x", k(Sl.x0), k(postFlush ? L2[3] : L2[3] + w.rebate + 0.3)));
    // the right section's own bottom member (hidden behind the desk things)
    RS.add(sillMat, prismGeo(sillProf.map(([yy, zz]) => [yy + k(YR.bot - 0.02), zz]), "x", k(-0.4), k(casR_o + 0.2)));
  }

  // --- the brown exterior box grille, beyond the glass (Q19) ---
  const E = R.exterior;
  const ez = -E.depth;
  const EB = new Batch("exterior");
  const buildExterior = E.enabled === true || (E.enabled === "auto" && !P.outside?.grid);
  const eb = E.bar, ed = E.barDepth;
  if (buildExterior) for (const x of E.xs) EB.add(m.brown, boxGeo(k(x - eb / 2), k(x + eb / 2), k(E.y0), k(E.y1), k(ez - ed), k(ez), "y"));
  if (buildExterior) for (let y = E.yStart; y <= E.y1; y += E.pitchY) EB.add(m.brown, boxGeo(k(E.x0), k(E.x1), k(y - eb / 2), k(y + eb / 2), k(ez - ed * 0.8), k(ez - 0.01), "x"));
  if (buildExterior) for (const [x0, y0, x1, y1] of E.diagonals) EB.add(m.brown, barGeo([k(x0), k(y0), k(ez - ed / 2)], [k(x1), k(y1), k(ez - ed / 2)], k(eb), k(ed * 0.6)));

  // --- the dark plane behind R2 (Q20); Dreamlike opens it ---
  const Bk = R.blocked;
  const bH = Bk.top - (YR.bot - 3);
  const blockedG = new THREE.PlaneGeometry(k(Bk.width), k(bH));
  blockedG.translate(k(Bk.x + Bk.width / 2), k(YR.bot - 3 + bH / 2), -k(Bk.depth));
  const blocked = new THREE.Mesh(clean(blockedG), m.blocked);
  blocked.name = "blockedPlane";
  blocked.receiveShadow = true;
  blocked.userData.enabled = Bk.enabled === true || (Bk.enabled === "auto" && P.outside?.blocked?.depth === undefined);
  blocked.visible = blocked.userData.enabled;
  right.add(blocked);

  // --- assemble ---
  S.build(root);
  RS.build(right);
  R1B.build(r1Body);
  EB.build(root);
  const mkGlass = (list, parent, name, mat, paneKey) => {
    if (!list.length) return null;
    const g = new THREE.Mesh(clean(list.length === 1 ? list[0] : mergeList(list)), mat);
    g.name = name;
    g.userData.paneKey = paneKey; // which leaf's dust (params.room.window.glass.panes)
    g.renderOrder = 2;
    g.castShadow = false;
    g.receiveShadow = true; // the house shades its dust from the sun; the lamp throws bar shadows on it
    parent.add(g);
    return g;
  };
  const glassR2 = mkGlass(glassGeos.R2, right, "glassR2", m.glass, "R2");
  const glassPanes = [mkGlass(glassGeos.L, root, "glassL", m.glass, "L"), mkGlass(glassGeos.R1, r1Body, "glassR1", m.glass, "R1"), glassR2].filter(Boolean);
  // R2 frosted: while the dark plane stands behind it (every look but Dreamlike) the
  // pane is a diffuser, and what the eye sees there IS the film on the glass. The
  // glass writes no depth (it is see-through), so the depth of field took the
  // film's depth from the plane half a metre behind it and blurred its crisp
  // specks into a 10 px mottle (loop 1: R2 fine grain 1.61 L* against the photo's
  // 4.06, and 5.06 with the depth of field off). A depth-only copy of the pane
  // gives the frosted pane its own depth; materials.js switches it (it discards
  // everything while R2 is clear, so it compiles with the scene and never swaps)
  if (glassR2 && m.glassFrostDepth) {
    const gd = new THREE.Mesh(glassR2.geometry, m.glassFrostDepth);
    gd.name = "glassR2FrostDepth";
    gd.renderOrder = 2;
    gd.castShadow = false;
    gd.receiveShadow = false;
    right.add(gd);
  }

  const r2Pane = { x0: k(R2[1]), x1: k(R2[2]), y0: k(YR.D0), y1: k(Y.A1) };
  const endR = Rw(casR_o, Cs.face);
  const opening = {
    center: new THREE.Vector3(k((casL_i + Rw(R2[2], 0)[0]) / 2), k((Y.gb + Y.A1) / 2), k(0.02)),
    normal: new THREE.Vector3(0, 0, 1),
    width: k(Rw(R2[2], 0)[0] - casL_i),
    height: k(Y.A1 - Y.gb),
  };

  return {
    Y,
    YR,
    right,
    handleLeaf,
    blocked,
    glassPanes,
    r2Pane,
    opening,
    Rw,
    edges: { casL_o, casL_i, L2, R2, casR_o, endR },
  };
}

function mergeList(list) {
  // merge same-attribute non-indexed geometries
  let n = 0;
  for (const g of list) n += g.attributes.position.count;
  const pos = new Float32Array(n * 3), nrm = new Float32Array(n * 3), uvs = new Float32Array(n * 2);
  let o = 0;
  for (const g of list) {
    pos.set(g.attributes.position.array, o * 3);
    nrm.set(g.attributes.normal.array, o * 3);
    uvs.set(g.attributes.uv.array, o * 2);
    o += g.attributes.position.count;
    g.dispose();
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  out.setAttribute("normal", new THREE.BufferAttribute(nrm, 3));
  out.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  return out;
}
