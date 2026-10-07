// The room around the window: the cream walls, the striped Roman blind, the
// two-strand bead chain, the desk, the BenQ MA270UP with its pole arm (its screen
// is the monitorScreen anchor), the portrait monitor (off), the Hot Wheels woodie and
// the souvenir tile on the sill, and the bottle and charging dock that the closing
// shot sees. Lengths in W unless noted; see params.room.js for sources.

import * as THREE from "three/webgpu";
import { mrt, texture as tslTexture } from "three/tsl";
import { bezelFrameGeo, rboxGeo, Batch, boxGeo, prismGeo, barGeo, clean, M } from "./geom.js";
import { buildCar } from "./car.js";
import { buildBike } from "./bike.js";
import { buildScooter } from "./scooter.js";
import { buildBobblehead } from "./bobblehead.js";
import { buildVrHeadset } from "./vrHeadset.js";
import { buildTissueFrame } from "./tissueFrame.js";
import { makeCodeScreen } from "./codeScreen.js";
import { buildBeadChain } from "./beadChain.js";

const D2R = Math.PI / 180;

export function buildInterior(P, ctx, mats, root, win) {
  const W = P.dims.W;
  const k = (v) => v * W;
  const R = P.room;
  const m = mats.m;
  const S = new Batch("interior");
  const Y = win.Y;

  // --- walls: the window wall (with its opening), the room around it ---
  const WA = R.wall;
  const f = WA.face, back = f - WA.thickness;
  const xL = -WA.left, xR = WA.right, yF = -WA.floor, yC = WA.ceiling, zB = WA.back;
  const e = win.edges;
  const sillBot = -R.sill.thickness;
  const topY = Y.headHi;
  const postX = e.L2[3] + P.room.window.rebate + 0.2;
  const pl = (x0, x1, y0, y1, z0, z1, grain = "y") => S.add(m.plaster, boxGeo(k(x0), k(x1), k(y0), k(y1), k(z0), k(z1), grain));
  pl(xL, e.casL_o, yF, yC, back, f); // left of the window
  pl(e.casL_o, postX, topY, yC, back, f); // above the left pair
  pl(e.casL_o - 0.4, postX, yF, sillBot, back, f); // below the sill
  // the wall over and under the angled right section, in its frame
  const RS = new Batch("interiorR");
  // it runs on to meet the right side wall (with the right pair flat, casR_o + 5 stopped
  // short of it and left a slot of daylight in the corner)
  const rEnd = Math.max(e.casR_o + 5, WA.right + 1);
  RS.add(m.plaster, boxGeo(k(-0.9), k(rEnd), k(topY), k(yC), k(back), k(f), "y"));
  const rBot = win.YR.bot - 0.4;
  RS.add(m.plaster, boxGeo(k(-0.9), k(rEnd), k(yF), k(rBot), k(back), k(f), "y"));
  RS.add(m.plaster, boxGeo(k(e.casR_o), k(rEnd), k(rBot), k(topY), k(back), k(f), "y"));
  RS.build(win.right);
  // the room: side walls, back wall, floor, ceiling (thin boxes so they cast the sun's shadow)
  const t = 0.3;
  const endW = win.Rw(rEnd, f);
  pl(xL - t, xL, yF, yC, f, zB, "y");
  pl(Math.max(xR, endW[0]), Math.max(xR, endW[0]) + t, yF, yC, endW[1], zB, "y");
  pl(xL, Math.max(xR, endW[0]), yF, yC, zB, zB + t, "y");
  pl(xL, Math.max(xR, endW[0]), yC, yC + t, f, zB, "x");
  S.add(m.desk, boxGeo(k(xL), k(Math.max(xR, endW[0])), k(yF - t), k(yF), k(f), k(zB), "z"));

  // --- the Roman blind at the head: soft cascading folds, sagging lower on the left ---
  // 2026-10-05 (Agam: "make the beaded rope actually work and pull the shades up and
  // down"): the blind has a DROP, 0 raised (its photographed folds, the default) to 1
  // lowered (the hem just above the sill). Lowering it releases the folds from the
  // bottom up: the fold depth and the left-hand sag fall away as the fabric comes
  // down, so a lowered blind hangs flat; raising it gathers them back. setDrop(d)
  // rewrites the vertices in place (29 x 91 per blind, cheap enough per frame)
  function romanBlind(x0, x1, zFace, parent) {
    const Bl = R.blind;
    const nx = 28, nt = 90;
    const pos = new Float32Array((nt + 1) * (nx + 1) * 3), uvs = [], idx = [];
    const lowBottom = Bl.lowBottom ?? 0.3; // W: the lowered hem, just above the sill top (y 0)
    function fill(d) {
      const bottom = Bl.bottom + (lowBottom - Bl.bottom) * d;
      const Hh = Bl.top - bottom;
      const amp = Math.pow(1 - d, 0.8); // the folds flatten as it drops
      let o = 0;
      for (let j = 0; j <= nt; j++) {
        const tt = j / nt; // 0 at the bottom hem, 1 at the head rail
        for (let i = 0; i <= nx; i++) {
          const sN = i / nx;
          const x = x0 + (x1 - x0) * sN;
          const sag = 1 + Bl.sag * amp * (1 - sN) * (1 - sN); // lower on the left
          // folds: each a soft forward bulge; the stack is compressed toward the head
          const fp = tt * Bl.folds;
          const fold = Math.sin(Math.PI * (fp % 1)) * amp;
          const z = zFace + 0.12 + Bl.depth * 0.55 * fold * (0.7 + 0.3 * (1 - tt));
          const y = bottom + Hh * tt - (1 - tt) * (sag - 1) * 0.9 - 0.12 * fold * (1 - tt);
          pos[o++] = k(x);
          pos[o++] = k(y);
          pos[o++] = k(z);
          // the texture is pinned to the fabric at the raised pose (exactly the old blind's
          // mapping, so the default look is unchanged); lowering it carries the stripes down
          if (uvs.length < (nt + 1) * (nx + 1) * 2) uvs.push(k(x), k(y + fold * 0.2));
        }
      }
    }
    fill(0);
    for (let j = 0; j < nt; j++)
      for (let i = 0; i < nx; i++) {
        const a = j * (nx + 1) + i, b = a + 1, c = a + nx + 1, d = c + 1;
        idx.push(a, b, d, a, d, c);
      }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    const mesh = new THREE.Mesh(g, m.blind);
    mesh.name = "blind";
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    mesh.userData.setDrop = (d) => {
      fill(Math.max(0, Math.min(1, d)));
      g.attributes.position.needsUpdate = true;
      g.computeVertexNormals();
      g.computeBoundingSphere();
      g.computeBoundingBox();
    };
    return mesh;
  }
  // one blind across the whole head when the right pair is flat (two, one per frame,
  // read as two windows with different sags); the angled fit keeps its two
  const blinds = [];
  if (R.window.right.flat) blinds.push(romanBlind(R.blind.left, win.right.position.x / W + e.casR_o + 0.4, f, root));
  else {
    blinds.push(romanBlind(R.blind.left, postX, f, root));
    blinds.push(romanBlind(-0.6, e.casR_o + 0.4, f, win.right));
  }
  // one chain works them all
  const setBlindDrop = (d) => blinds.forEach((b) => b.userData.setDrop(d));

  // --- the bead chain: a closed two-strand loop of ivory beads from the blind's left
  // end to about sill level, in front of the wall, simulated bead by bead (beadChain.js;
  // room.js drives it). The 17:41 photo shows both strands pale, close at the top and
  // opening to a V: 1.3 cm apart at 5 W, 4.7 cm near the sill (x 477 and 515 at
  // 1600 px). Round 1 hung an ivory and a dark brown strand 1.1 to 1.7 cm apart, so it
  // read as one strand ---
  const BC = R.beadChain;
  const chain = buildBeadChain(P, m.chainIvory, root, new THREE.Vector3(k(BC.x), k(BC.top), k(f + 0.45)), {
    zMin: -k(0.45) + BC.bead, // the wall face, less a bead
  });
  const beadChain = chain.group;

  // --- the framed napkin sketch, hung on the window wall above the portrait monitor ---
  if (R.tissueFrame) {
    const TF = R.tissueFrame;
    const fr = buildTissueFrame(mats, root, { size: TF.size, tiltDeg: TF.tiltDeg });
    fr.position.set(k(TF.x), k(TF.y), k(f));
  }

  // --- the desk ---
  const DK = R.desk;
  S.add(m.desk, boxGeo(k(DK.x0), k(DK.x1), k(DK.y) - 0.03, k(DK.y), k(f), DK.zFar, "x"));

  // --- the BenQ MA270UP: screen (anchor), bezel, body, rear, pole arm ---
  const MN = R.monitor;
  // one bezel style for both monitors: corner radius, the hole's radius, chamfer (m)
  const BEZEL = { r: MN.bezelRadius ?? 0.006, ri: MN.bezelInnerRadius ?? 0.002, ch: MN.bezelChamfer ?? 0.0012 };
  const mon = new THREE.Group();
  mon.name = "monitor";
  mon.position.set(k(MN.x), k(MN.y), P.dims.gap + MN.dz);
  mon.rotation.y = MN.yawDeg * D2R;
  root.add(mon);
  const MB = new Batch("monitor");
  const sw = MN.width, sh = MN.height, bz = MN.bezel, ch = MN.chin;
  // bezel frame on the front, the thin panel body behind it. 2026-10-05 (Agam: "make
  // both bezels of the monitors equal and same properties and add a slight corner
  // radius and chamfering"): one rounded, chamfered frame, the same bezel width on
  // all four sides (the 21 mm chin is gone), shared with the portrait monitor below
  void ch;
  MB.add(m.monBezel, bezelFrameGeo({ ow: sw + 2 * bz, oh: sh + 2 * bz, iw: sw, ih: sh, z0: -MN.depth, z1: 0.0012, ...BEZEL }));
  MB.add(m.monBlack, boxGeo(-sw / 2, sw / 2, -sh / 2, sh / 2, -MN.depth, -0.001, "x"));
  MB.add(m.monBlack, rboxGeo(-0.2, 0.2, -0.15, 0.1, -MN.back, -MN.depth, 0.008)); // the rear body, edges eased (shape QA)
  // the arm's VESA head and a black pole down to the desk clamp
  MB.add(m.monBlack, rboxGeo(-0.05, 0.05, -0.08, 0.02, -MN.back - 0.03, -MN.back, 0.006));
  MB.build(mon);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(sw, sh), new THREE.MeshBasicNodeMaterial({ color: 0xffffff }));
  screen.name = "monitorScreen";
  screen.position.z = 0.0005;
  screen.castShadow = false;
  screen.receiveShadow = false;
  mon.add(screen);
  mon.updateMatrixWorld(true);
  {
    // the pole arm (5480: a black pole rising from a desk clamp under the monitor's
    // left third, a two-link arm to the VESA head). Round 1 hid the pole straight
    // behind the screen, so the monitor floated in the closing shot; now the pole
    // stands under its left third, where the gap under the chin shows it and its
    // clamp, satin black steel that takes the room's light as a sheen
    const back = new THREE.Vector3(0, -0.03, -MN.back - 0.03).applyMatrix4(mon.matrixWorld);
    const leftBack = new THREE.Vector3(-sw * 0.2, -0.03, -MN.back - 0.06).applyMatrix4(mon.matrixWorld);
    const poleX = leftBack.x, poleZ = Math.max(k(f) + 0.035, leftBack.z);
    const deskY = k(DK.y);
    const poleTop = back.y + 0.05;
    S.add(m.steelDark, new THREE.CylinderGeometry(0.015, 0.015, poleTop - deskY, 20), M.T(poleX, (poleTop + deskY) / 2, poleZ));
    S.add(m.steelDark, new THREE.CylinderGeometry(0.017, 0.017, 0.012, 20), M.T(poleX, poleTop, poleZ)); // the cap
    // the arm: a collar on the pole, one link to an elbow, one to the VESA head
    const collarY = back.y + 0.01;
    S.add(m.monBlack, new THREE.CylinderGeometry(0.021, 0.021, 0.03, 20), M.T(poleX, collarY, poleZ));
    const elbow = new THREE.Vector3((poleX + back.x) / 2 - 0.02, collarY, Math.min(poleZ, back.z) - 0.03);
    S.add(m.monBlack, barGeo([poleX, collarY, poleZ], elbow.toArray(), 0.026, 0.02));
    S.add(m.monBlack, barGeo(elbow.toArray(), [back.x, back.y, back.z], 0.026, 0.02));
    S.add(m.monBlack, new THREE.CylinderGeometry(0.016, 0.016, 0.03, 16), M.T(elbow.x, elbow.y, elbow.z));
    // the desk clamp: a base plate on the desk and its screw knob hanging below
    S.add(m.monBlack, rboxGeo(poleX - 0.032, poleX + 0.032, deskY, deskY + 0.012, poleZ - 0.035, poleZ + 0.04, 0.005)); // eased edges (shape QA: it read as a cut-out square)
    S.add(m.steelDark, new THREE.CylinderGeometry(0.02, 0.02, 0.006, 20), M.T(poleX, deskY + 0.015, poleZ));
  }

  let portraitCursor = null;
  let portrait = null; // its group, so a toy can be carried onto its top edge (room.js)
  // --- the portrait monitor, a white cloth strip under it (its screen runs a code editor) ---
  {
    const PM = R.portrait;
    const g = new THREE.Group();
    g.name = "portraitMonitor";
    portrait = g;
    const wdt = PM.width, hgt = PM.height;
    const base = PM.base ?? 0;
    g.position.set(k(PM.right) - (wdt / 2) * Math.cos(PM.yawDeg * D2R), k(DK.y) + base + 0.004, k(PM.z) + (wdt / 2) * Math.sin(PM.yawDeg * D2R));
    g.rotation.y = PM.yawDeg * D2R;
    root.add(g);
    const PB = new Batch("portrait");
    // the SAME bezel as the BenQ (2026-10-05): its width, black, rounded and chamfered;
    // the dark panel face sits inside the hole, behind the screen
    const pbz = MN.bezel;
    PB.add(m.monBezel, bezelFrameGeo({ ow: wdt, oh: hgt, iw: wdt - 2 * pbz, ih: hgt - 2 * pbz, z0: -0.002, z1: 0.0015, cy: hgt / 2, ...BEZEL }));
    PB.add(m.portraitFace, boxGeo(-wdt / 2 + pbz, wdt / 2 - pbz, pbz, hgt - pbz, -0.002, 0.0009, "y"));
    // shape QA (2026-10-05): the housing was a square box whose corners stuck out past
    // the rounded bezel, the hard step at its corners; now it carries the same radius
    PB.add(m.champagne, rboxGeo(-wdt / 2, wdt / 2, 0, hgt, -0.032, 0, BEZEL.r, 4));
    PB.add(m.monBlack, rboxGeo(-wdt / 2 + 0.02, wdt / 2 - 0.02, 0.05, hgt - 0.05, -0.05, -0.032, 0.008));
    // (the clip-on bracket on its right edge is gone: it read as a stray black block
    // between the two monitors, Agam 2026-09-28)
    // the white cloth strip it stands on (5480): only a sliver shows at its foot.
    // Round 1's 12 cm card read as a flat unlit white board in the closing shot
    // shape QA: a crisp slab wider than the monitor read as a white plastic tray; now a
    // thin soft pad with rounded edges, tucked inside the monitor's width
    PB.add(m.cloth, rboxGeo(-wdt / 2 + 0.008, wdt / 2 - 0.008, -0.003, -0.0004, -0.054, 0.007, 0.0012), null, { cast: false });
    // its low dark steel stand: a cradle rail under the panel, a plate on the desk
    // and a short web between them, set back under the panel's rear
    if (base > 0) {
      PB.add(m.steelDark, rboxGeo(-wdt / 2 + 0.01, wdt / 2 - 0.01, -base - 0.004, -base + 0.006, -0.1, 0.03, 0.004)); // plate
      PB.add(m.steelDark, rboxGeo(-0.05, 0.05, -base + 0.006, -0.012, -0.048, -0.028, 0.004)); // web
      PB.add(m.steelDark, rboxGeo(-wdt / 2 + 0.004, wdt / 2 - 0.004, -0.012, -0.004, -0.056, 0.012, 0.003)); // cradle
    }
    PB.build(g);
    // its screen: an AI code editor open (2026-09-27, Agam), codeScreen.js; the cursor
    // is its own small mesh so it can blink (room.js update)
    const SC = PM.screen || {};
    if (SC.enabled !== false) {
      const cs = makeCodeScreen();
      const sw = wdt - 2 * MN.bezel, sh = hgt - 2 * MN.bezel; // fills the shared bezel's hole
      const scrMat = new THREE.MeshStandardNodeMaterial({ color: 0x000000, roughness: 0.3, metalness: 0, emissive: 0xffffff, emissiveMap: cs.texture, emissiveIntensity: SC.intensity ?? 0.35 });
      // only a trace of it reaches the bloom (like the main screen's params.screen.bloom):
      // at full strength the Dreamlike bloom haloed the whole panel and softened the code
      scrMat.mrtNode = mrt({ emissive: tslTexture(cs.texture).rgb.mul((SC.intensity ?? 0.35) * (SC.bloom ?? 0.04)) });
      const scr = new THREE.Mesh(new THREE.PlaneGeometry(sw, sh), scrMat);
      scr.name = "portraitScreen";
      scr.userData.code = cs; // engine.js keeps its theme on the page's
      scr.position.set(0, hgt / 2, 0.0018);
      g.add(scr);
      const cur = new THREE.Mesh(new THREE.PlaneGeometry(cs.cursor.w * sw, cs.cursor.h * sh), new THREE.MeshBasicNodeMaterial({ color: new THREE.Color("#8a8d98") }));
      cur.name = "portraitCursor";
      cur.position.set((cs.cursor.u - 0.5) * sw, hgt / 2 + (cs.cursor.v - 0.5) * sh, 0.0019);
      g.add(cur);
      portraitCursor = cur;
    }
  }

  // --- the Hot Wheels woodie on the sill (13-photo 8), about 7 cm long, facing right ---
  // on the monitor's top edge (R.car.on "monitor", the default) or on the sill
  const topOfMonitor = MN.height / 2 + MN.bezel;
  const place = (grp, C) => {
    if (C.on === "portrait" && portrait) {
      // on the portrait monitor's top (2026-10-05): mx along it, mz from its face
      grp.position.set(C.mx ?? 0, R.portrait.height, C.mz ?? -0.016);
      grp.rotation.y = (C.myawDeg ?? 0) * D2R;
      portrait.add(grp);
    } else if (C.on === "monitor") {
      grp.position.set(C.mx ?? 0, topOfMonitor, C.mz ?? -MN.depth / 2);
      grp.rotation.y = (C.myawDeg ?? 0) * D2R;
      mon.add(grp);
    } else {
      grp.position.set(k(C.x), 0, k(C.z));
      grp.rotation.y = (C.yawDeg ?? 0) * D2R;
      root.add(grp);
    }
  };
  const car = new THREE.Group();
  car.name = "car";
  place(car, R.car);
  buildCar(mats, car, { quality: P.quality });
  // the Meteor 350 miniature, where the souvenir tile was (Agam, 2026-09-27: "remove
  // that and add a small miniature model of a Meteor 350")
  const bike = new THREE.Group();
  bike.name = "bike";
  place(bike, R.bike);
  buildBike(mats, bike);
  // the Zepto scooter, the golden retriever bobblehead and the VR headset (2026-10-05)
  const mk = (name, C, build) => {
    if (!C || C.hidden) return null; // hidden: not built at all, so it cannot be hovered or dragged
    const grp = new THREE.Group();
    grp.name = name;
    place(grp, C);
    const api = build(grp);
    if (api?.update) grp.userData.bobble = api; // the bobblehead's head spring
    return grp;
  };
  const scooter = mk("scooter", R.scooter, (g) => buildScooter(mats, g));
  const bobblehead = mk("bobblehead", R.bobblehead, (g) => buildBobblehead(mats, g));
  const vr = mk("vr", R.vr, (g) => buildVrHeadset(mats, g));
  const catBobble = mk("catBobblehead", R.cat, (g) => buildBobblehead(mats, g, "cat"));
  // everything that can be picked up and carried between the monitors (room.js)
  const toys = [car, bike, scooter, bobblehead, vr, catBobble].filter(Boolean);

  // --- the Borosil bottle and the charging dock (they enter the closing shot) ---
  {
    const BT = R.bottle;
    const r = BT.radius, h = BT.height;
    const prof = [[0.0001, 0], [r, 0], [r, h * 0.82], [r * 0.93, h * 0.86], [r * 0.93, h * 0.87]].map(([a, b]) => new THREE.Vector2(a, b));
    S.add(m.steelBrushed, new THREE.LatheGeometry(prof, 32), M.T(k(BT.x), k(DK.y), k(BT.z)));
    S.add(m.monBlack, new THREE.CylinderGeometry(r * 0.92, r * 0.92, h * 0.13, 32), M.T(k(BT.x), k(DK.y) + h * 0.935, k(BT.z)));
  }
  {
    // the 3-in-1 charging dock (13-photo 6; 5480): a bevelled grey aluminium base,
    // a back panel leaning back 15 deg with the round phone pad, a watch puck on a
    // short post at its side, the white AirPods case at its foot. Round 1 was a
    // square wedge and a white box ("two grey cubes")
    const DC = R.dock;
    const g = new THREE.Group();
    g.position.set(k(DC.x), k(DK.y), k(DC.z));
    g.rotation.y = DC.yawDeg * D2R;
    root.add(g);
    const DB = new Batch("dock");
    const seg = P.quality === "low" ? 2 : 4;
    // rounded slab: w x h rounded rectangle (corner r) extruded d, bevel b; centred
    // on x and y, from z = 0 to d
    const slab = (w, h, d, r, b) => {
      const sh = new THREE.Shape();
      const x0 = -w / 2 + r, x1 = w / 2 - r, y0 = -h / 2 + r, y1 = h / 2 - r;
      sh.moveTo(x0, -h / 2);
      sh.lineTo(x1, -h / 2);
      sh.absarc(x1, y0, r, -Math.PI / 2, 0, false);
      sh.lineTo(w / 2, y1);
      sh.absarc(x1, y1, r, 0, Math.PI / 2, false);
      sh.lineTo(x0, h / 2);
      sh.absarc(x0, y1, r, Math.PI / 2, Math.PI, false);
      sh.lineTo(-w / 2, y0);
      sh.absarc(x0, y0, r, Math.PI, Math.PI * 1.5, false);
      const eg = new THREE.ExtrudeGeometry(sh, { depth: Math.max(0.0005, d - 2 * b), bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: seg, curveSegments: seg * 2 });
      eg.translate(0, 0, b);
      return eg;
    };
    // the base, lying flat (its shape in x and z)
    const base = slab(0.1, 0.075, 0.011, 0.012, 0.0025);
    base.rotateX(-Math.PI / 2);
    DB.add(m.dockGrey, base, M.T(0, 0, 0.005));
    // the back panel with the phone pad, leaning back
    const tilt = 15 * D2R;
    const panel = slab(0.085, 0.11, 0.012, 0.014, 0.003);
    DB.add(m.dockGrey, panel, M.mul(M.T(0, 0.011, -0.022), M.RX(-tilt), M.T(0, 0.055, 0)));
    const padRing = new THREE.CylinderGeometry(0.03, 0.03, 0.002, 40);
    padRing.rotateX(Math.PI / 2);
    DB.add(m.padBlack, padRing, M.mul(M.T(0, 0.011, -0.022), M.RX(-tilt), M.T(0, 0.064, 0.0125)));
    const pad = new THREE.CylinderGeometry(0.026, 0.026, 0.0024, 40);
    pad.rotateX(Math.PI / 2);
    DB.add(m.whitePlastic, pad, M.mul(M.T(0, 0.011, -0.022), M.RX(-tilt), M.T(0, 0.064, 0.0132)));
    // the watch puck on its post
    DB.add(m.dockGrey, new THREE.CylinderGeometry(0.006, 0.006, 0.03, 16), M.T(0.034, 0.026, 0.018));
    const puck = new THREE.CylinderGeometry(0.014, 0.014, 0.007, 28);
    puck.rotateX(Math.PI / 2 - 0.35);
    DB.add(m.whitePlastic, puck, M.T(0.034, 0.045, 0.022));
    // the AirPods case at its foot
    const cse = slab(0.05, 0.022, 0.045, 0.01, 0.006);
    cse.rotateX(-Math.PI / 2);
    DB.add(m.whitePlastic, cse, M.T(-0.022, 0, 0.062));
    DB.build(g);
  }

  S.build(root);
  return { beadChain, chain, setBlindDrop, monitorScreen: screen, monitor: mon, car, bike, scooter, bobblehead, vr, toys, portrait, portraitCursor };
}
