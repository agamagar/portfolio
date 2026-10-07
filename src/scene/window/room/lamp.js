// The black dome desk lamp (13-photo 5): a semi-matte black bell shade about 15 cm
// across with a white reflector inside, a cylindrical socket cup with a ring of
// ventilation holes (the cream swivel knuckle was removed 2026-10-05), a flat steel spring swing-arm running
// down behind the monitor, the cable along it. Its bulb is the lampHead anchor
// (lights.js hangs the SpotLight there and aims it down the anchor's local -z).
//
// Aim: the shade axis starts on the chair's line of sight to the bulb and tilts
// tiltDeg (Agam: 37) toward a direction in the chair's image plane. The lamp was
// re-aimed between the 17:41 and 18:40 photos, so the direction is per aim
// (params.room.lamp); aimFor(look) picks it and setAim() re-points the head live.

import * as THREE from "three/webgpu";
import { Batch, barGeo, clean, M } from "./geom.js";

const D2R = Math.PI / 180;

export function lampAimFor(P, look) {
  const L = P.room.lamp;
  // "photo" and "1741": the photographed pose in every look; "1840": toward the
  // 18:40 hotspot; "auto": the photographed pose in Photo-true and Heightened (true
  // geometry), the hotspot pose in Dreamlike
  const aim = L.aim === "auto" ? (look === "dreamlike" ? "1840" : "1741") : L.aim === "photo" ? "1741" : String(L.aim);
  return aim === "1840" ? L.tiltDir1840 : L.tiltDir1741;
}

// The shade axis (unit vector, world) for a tilt direction.
export function lampAxis(P, pos, chairPos, tiltDirDeg, tiltDeg = P.room.lamp.tiltDeg) {
  const L = P.room.lamp;
  const los = pos.clone().sub(chairPos).normalize();
  const imgRight = new THREE.Vector3().crossVectors(los, new THREE.Vector3(0, 1, 0)).normalize();
  const imgUp = new THREE.Vector3().crossVectors(imgRight, los).normalize();
  const dir = imgRight.clone().multiplyScalar(Math.cos(tiltDirDeg * D2R)).addScaledVector(imgUp, Math.sin(tiltDirDeg * D2R));
  void L;
  return los.clone().multiplyScalar(Math.cos(tiltDeg * D2R)).addScaledVector(dir, Math.sin(tiltDeg * D2R)).normalize();
}

export function buildLamp(P, ctx, mats, root, look) {
  const W = P.dims.W;
  const k = (v) => v * W;
  const L = P.room.lamp;
  const m = mats.m;
  const pos = new THREE.Vector3(k(L.pos[0]), k(L.pos[1]), k(L.pos[2]));
  const chairPos = new THREE.Vector3(...(ctx.chair?.position ?? [-2.6 * W, 0.5 * W, 8.8 * W]));

  const lampHead = new THREE.Object3D();
  lampHead.name = "lampHead";
  lampHead.position.copy(pos);
  root.add(lampHead);
  // the head's parts hang in a child so the anchor stays exactly the bulb
  const head = new THREE.Group();
  head.name = "lampShade";
  lampHead.add(head);

  const HB = new Batch("lampHead");
  const rd = L.domeRadius, dd = L.domeDepth;
  // bell profile (r, z): the back (+z, where the cup attaches) to the rim (-z, the
  // opening, toward the beam); the bulb sits at z about +0.01
  const zBack = dd * 0.52, zRim = -dd * 0.48;
  const sc = rd / 0.075; // the bell's shape, drawn at 15 cm, scaled to the fitted size
  const prof = [
    [0.021, zBack],
    [0.034, zBack - 0.002 * sc],
    [0.048, zBack - 0.009 * sc],
    [0.06, zBack - 0.022 * sc],
    [0.068, zBack - 0.038 * sc],
    [0.0725, zBack - 0.056 * sc],
    [0.0745, zBack - 0.072 * sc],
    [0.075, zRim + 0.004 * sc],
    [0.0762, zRim],
  ].map(([r, z]) => [r * sc, z]);
  const lathe = (pts, scale = 1) => {
    // lathe faces point outward when the profile runs toward +y (here +z): so from
    // the rim to the back
    const g = new THREE.LatheGeometry(pts.slice().reverse().map(([r, z]) => new THREE.Vector2(r * scale, z)), 48);
    g.rotateX(Math.PI / 2); // lathe +y -> +z
    return g;
  };
  // outer shell: the lathe's outward faces; inner white reflector (BackSide)
  HB.add(m.lampBlack, lathe(prof), null, { cast: false });
  HB.add(m.lampInside, lathe(prof, 0.975), null, { cast: false, receive: false });
  // a rolled rim
  const rim = new THREE.TorusGeometry(rd * 1.016, 0.0013, 6, 48);
  HB.add(m.lampBlack, rim, M.T(0, 0, zRim), { cast: false });
  // the socket cup behind the dome: a closed solid of revolution with a rounded end
  const cr = L.cupRadius, zEnd = zBack + L.cupLength;
  const cupProf = [
    [cr, zBack - 0.004],
    [cr, zEnd - 0.014],
    [cr * 0.97, zEnd - 0.007],
    [cr * 0.85, zEnd - 0.0025],
    [cr * 0.55, zEnd - 0.0004],
    [0.0001, zEnd],
  ];
  const cupG = new THREE.LatheGeometry(cupProf.map(([r, z]) => new THREE.Vector2(r, z)), 32);
  cupG.rotateX(Math.PI / 2);
  HB.add(m.lampBlack, cupG, null, { cast: false });
  // the ring of round vent holes near the cup's end (5484: about 6 to 8 mm, ten
  // round the cup), each a shallow dark well with the lit socket showing at its
  // bottom, so they read as pale dots on the black enamel as in the photo
  const nHoles = P.quality === "low" ? 8 : 10;
  for (let i = 0; i < nHoles; i++) {
    const a = (i / nHoles) * Math.PI * 2;
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(Math.cos(a), Math.sin(a), 0));
    const at = (r) => new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, zEnd - 0.02);
    const one = new THREE.Vector3(1, 1, 1);
    HB.add(m.lampBlack, new THREE.RingGeometry(cr * 0.105, cr * 0.15, 12), new THREE.Matrix4().compose(at(cr + 0.0005), q, one), { cast: false, receive: false }); // a rolled lip
    HB.add(m.dark, new THREE.CircleGeometry(cr * 0.13, 12), new THREE.Matrix4().compose(at(cr + 0.0003), q, one), { cast: false, receive: false });
    // one hole catches a faint glint of the lit socket; the rest are dark wells
    if (i === 0) HB.add(m.lampVent, new THREE.CircleGeometry(cr * 0.07, 10), new THREE.Matrix4().compose(at(cr + 0.00035), q, one), { cast: false, receive: false });
  }
  // (2026-10-05, Agam: "remove this white grey component": the cream swivel knuckle
  // under the cup, a T of two cream cylinders with a steel pivot screw at each end,
  // is gone, screws with it). The bulb:
  const bulbG = new THREE.SphereGeometry(0.017, 20, 14);
  HB.add(m.bulb, bulbG, M.T(0, 0, 0.004), { cast: false, receive: false });
  HB.build(head);

  // the live aim, so a drag (room.js) starts from wherever the head points now
  const aimNow = { dir: 0, tilt: L.tiltDeg };
  function setAim(tiltDirDeg, tiltDeg = L.tiltDeg) {
    aimNow.dir = tiltDirDeg;
    aimNow.tilt = tiltDeg;
    const axis = lampAxis(P, pos, chairPos, tiltDirDeg, tiltDeg);
    lampHead.lookAt(pos.clone().sub(axis)); // +z toward -axis, so -z is the beam
    lampHead.updateMatrixWorld(true);
  }
  // --- the swing arm, from the knuckle down behind the monitor to the desk clamp.
  // One arm per aim, both built now and toggled, so a look switch never adds
  // geometry after the engine has compiled the scene ---
  function buildArm(parent) {
    const kn = new THREE.Vector3(0, -L.cupRadius - 0.011, zBack + 0.028).applyMatrix4(lampHead.matrixWorld);
    const MN = P.room.monitor;
    const deskY = k(P.room.desk.y);
    // the monitor's face plane: z at world x (it is yawed toward the chair)
    const mx = k(MN.x), mz = P.dims.gap + MN.dz, ty = Math.tan(-MN.yawDeg * D2R);
    const behind = (v, margin = 0.05) => {
      const zMon = mz + (v.x - mx) * ty;
      if (v.y < 0.02) v.z = Math.min(v.z, zMon - margin);
      return v;
    };
    const elbow = behind(new THREE.Vector3(kn.x + 0.03, kn.y - 0.12, kn.z));
    const foot = behind(new THREE.Vector3(elbow.x + 0.05, deskY + 0.03, elbow.z - 0.04));
    const AB = new Batch("lampArm");
    // two flat black steel arms either side of the knuckle, riveted at each joint
    // (5484: silver screw heads on the plates)
    for (const off of [-0.009, 0.009]) {
      const o = new THREE.Vector3(off, 0, 0);
      AB.add(m.lampBlack, barGeo(kn.clone().add(o).toArray(), elbow.clone().add(o).toArray(), 0.004, 0.012));
      AB.add(m.lampBlack, barGeo(elbow.clone().add(o).toArray(), foot.clone().add(o).toArray(), 0.004, 0.012));
      for (const j of [kn, elbow]) {
        const sc = new THREE.CylinderGeometry(0.0032, 0.0032, 0.0014, 12);
        sc.rotateZ(Math.PI / 2);
        AB.add(m.screwSteel, sc, M.T(j.x + off + Math.sign(off) * 0.0027, j.y, j.z), { cast: false });
      }
    }
    // the hinge block at the elbow
    AB.add(m.lampBlack, new THREE.BoxGeometry(0.024, 0.016, 0.014), M.T(elbow.x, elbow.y, elbow.z));
    // coil spring along the upper segment
    const spring = [];
    const n = 60;
    const dir = elbow.clone().sub(kn);
    const len = dir.length();
    dir.normalize();
    const side = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 0, 1)).normalize();
    const up = new THREE.Vector3().crossVectors(side, dir).normalize();
    for (let i = 0; i <= n; i++) {
      const tt = i / n;
      const ang = tt * Math.PI * 2 * 16;
      spring.push(kn.clone().addScaledVector(dir, 0.02 + tt * (len - 0.04)).addScaledVector(side, 0.02 + Math.cos(ang) * 0.004).addScaledVector(up, Math.sin(ang) * 0.004));
    }
    AB.add(m.steelDark, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(spring), P.quality === "low" ? 90 : 240, 0.0008, 5, false));
    // the cable from the cup's end, sagging a little along the arm
    // the cable leaves the cup's side near its end, loops under the cup and runs
    // down the arm behind the monitor
    const cupSide = new THREE.Vector3(0, -L.cupRadius * 0.9, zBack + L.cupLength * 0.8).applyMatrix4(lampHead.matrixWorld);
    const cupUnder = new THREE.Vector3(0.012, -L.cupRadius - 0.022, zBack + L.cupLength * 0.35).applyMatrix4(lampHead.matrixWorld);
    const cab = new THREE.CatmullRomCurve3([cupSide, cupUnder, behind(kn.clone().add(new THREE.Vector3(0.014, -0.035, 0))), behind(elbow.clone().add(new THREE.Vector3(-0.014, 0, 0))), behind(foot.clone().add(new THREE.Vector3(-0.02, 0.02, 0)))]);
    AB.add(m.lampBlack, new THREE.TubeGeometry(cab, 60, 0.0022, 6, false));
    AB.build(parent);
  }
  const arms = {};
  for (const aim of ["1741", "1840"]) {
    const g = new THREE.Group();
    g.name = `lampArm${aim}`;
    root.add(g);
    setAim(aim === "1741" ? L.tiltDir1741 : L.tiltDir1840);
    buildArm(g);
    arms[aim] = g;
  }
  let current = null;
  function useAim(lk) {
    const dirDeg = lampAimFor(P, lk);
    setAim(dirDeg);
    current = Math.abs(dirDeg - L.tiltDir1741) < Math.abs(dirDeg - L.tiltDir1840) ? "1741" : "1840";
    arms["1741"].visible = current === "1741";
    arms["1840"].visible = current === "1840";
  }
  useAim(look);

  return {
    lampHead,
    pos,
    setLook(lk) {
      useAim(lk);
    },
    // the shade, for the cursor test; and a live re-aim from a drag (Agam,
    // 2026-10-05: "make the lamp movable too"). The head swivels on its knuckle
    // like the real lamp: dirDeg swings it around, tiltDeg tips it (clamped 15 to
    // 65 degrees); the SpotLight, its spill and the glow follow lampHead each frame
    shade: head,
    getAim: () => ({ ...aimNow }),
    aim(dirDeg, tiltDeg) {
      setAim(dirDeg, Math.max(15, Math.min(65, tiltDeg)));
    },
    dispose() {},
  };
}
