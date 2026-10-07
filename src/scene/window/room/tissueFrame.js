// A framed napkin sketch on the wall (Agam, 2026-10-05: "put a frame on the wall with
// a drawing on a tissue framed inside of it").
//
// A thin black frame about 30 cm square with a white mat, and inside it a paper
// tissue, a little crooked, softly crinkled and slightly see-through, so the mat
// shows a touch through it. On the tissue, a quick blue ballpoint sketch drawn on a
// canvas (no image file): the napkin wireframe of the Scheduled Delivery idea, a
// phone with a column of one-hour slots, one circled, a clock beside it and an arrow
// with a scribbled "later, not now". The pen line wobbles a little, like a pen on a
// soft napkin. Built in metres; the group's origin is the frame's centre, its back
// on the wall (z = 0), the picture facing +z.

import * as THREE from "three/webgpu";
import { Batch, boxGeo } from "./geom.js";

// a tiny seeded random, so the sketch and the crinkles are identical every load
function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}

function drawTissue(size = 1024) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d");
  const r = rng(11);
  // the tissue: warm off-white, faint fibres, the napkin's embossed quilt of squares
  g.fillStyle = "#efe8da"; // a warm tissue, so it parts from the whiter mat
  g.fillRect(0, 0, size, size);
  for (let i = 0; i < 2600; i++) {
    g.strokeStyle = `rgba(150,140,120,${0.03 + r() * 0.05})`;
    g.lineWidth = 0.6 + r();
    const x = r() * size, y = r() * size, a = r() * Math.PI, l = 4 + r() * 14;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
    g.stroke();
  }
  g.strokeStyle = "rgba(160,150,130,0.10)";
  g.lineWidth = 2;
  const q = size / 12;
  for (let i = 1; i < 12; i++) {
    g.beginPath(); g.moveTo(i * q, 0); g.lineTo(i * q, size); g.stroke();
    g.beginPath(); g.moveTo(0, i * q); g.lineTo(size, i * q); g.stroke();
  }

  // the pen: blue ballpoint, every stroke a slightly wobbling polyline
  const ink = "rgba(28,45,120,0.88)";
  const pen = (pts, w = 3.2) => {
    g.strokeStyle = ink;
    g.lineWidth = w;
    g.lineCap = g.lineJoin = "round";
    g.beginPath();
    pts.forEach(([x, y], i) => {
      const jx = (r() - 0.5) * 2.2, jy = (r() - 0.5) * 2.2;
      i ? g.lineTo(x + jx, y + jy) : g.moveTo(x + jx, y + jy);
    });
    g.stroke();
  };
  // a line broken into short steps, so the wobble runs along it
  const line = (x0, y0, x1, y1, w) => {
    const n = Math.max(2, Math.round(Math.hypot(x1 - x0, y1 - y0) / 14));
    pen(Array.from({ length: n + 1 }, (_, i) => [x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * i) / n]), w);
  };
  const rect = (x, y, w, h, rad = 0, lw) => {
    // a rounded rectangle, drawn as one stroke that overshoots its start a little
    const pts = [];
    const corner = (cx, cy, a0) => { for (let i = 0; i <= 4; i++) { const a = a0 + (i / 4) * (Math.PI / 2); pts.push([cx + Math.cos(a) * rad, cy + Math.sin(a) * rad]); } };
    pts.push([x + rad, y]);
    for (let i = 1; i <= 8; i++) pts.push([x + rad + ((w - 2 * rad) * i) / 8, y]);
    corner(x + w - rad, y + rad, -Math.PI / 2);
    for (let i = 1; i <= 8; i++) pts.push([x + w, y + rad + ((h - 2 * rad) * i) / 8]);
    corner(x + w - rad, y + h - rad, 0);
    for (let i = 1; i <= 8; i++) pts.push([x + w - rad - ((w - 2 * rad) * i) / 8, y + h]);
    corner(x + rad, y + h - rad, Math.PI / 2);
    for (let i = 1; i <= 8; i++) pts.push([x, y + h - rad - ((h - 2 * rad) * i) / 8]);
    corner(x + rad, y + rad, Math.PI);
    pts.push([x + rad + 18, y - 3]);
    pen(pts, lw);
  };
  const circle = (cx, cy, rad, lw, turns = 1.08, ry = rad) => {
    const n = 40;
    pen(Array.from({ length: n + 1 }, (_, i) => { const a = -1.2 + (i / n) * Math.PI * 2 * turns; return [cx + Math.cos(a) * rad * (1 + 0.03 * Math.sin(a * 3)), cy + Math.sin(a) * ry]; }), lw);
  };

  // the phone
  const px = 300, py = 150, pw = 300, ph = 600;
  rect(px, py, pw, ph, 46, 3.6);
  line(px + 120, py + 26, px + 180, py + 26, 3); // the earpiece
  line(px + 30, py + 90, px + 200, py + 90, 3); // a title bar
  // the slot list: five one-hour rows, the fourth circled and ticked
  for (let i = 0; i < 5; i++) {
    const y = py + 140 + i * 82;
    rect(px + 30, y, pw - 60, 58, 14, 2.8);
    line(px + 52, y + 29, px + 52 + 70 + (i % 2) * 20, y + 29, 2.6); // the time, a scribble
  }
  // a loose oval round the chosen row (render 1: a full circle swallowed the phone)
  circle(px + pw / 2, py + 140 + 3 * 82 + 29, 160, 3.4, 1.1, 46);
  pen([[px + pw - 74, py + 140 + 3 * 82 + 30], [px + pw - 62, py + 140 + 3 * 82 + 44], [px + pw - 38, py + 140 + 3 * 82 + 12]], 3.4);
  // the clock, top right
  circle(800, 230, 92, 3.4);
  line(800, 230, 800, 168, 3.4);
  line(800, 230, 846, 254, 3.4);
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; line(800 + Math.cos(a) * 80, 230 + Math.sin(a) * 80, 800 + Math.cos(a) * 88, 230 + Math.sin(a) * 88, 2.4); }
  // the arrow from the clock to the circled slot, and the note under it
  pen([[760, 330], [740, 420], [700, 500], [640, 560]], 3.2);
  pen([[662, 536], [640, 560], [670, 566]], 3.2);
  g.fillStyle = ink;
  g.font = 'italic 44px "Bradley Hand", "Segoe Print", "Comic Sans MS", cursive';
  g.save();
  g.translate(640, 680);
  g.rotate(-0.08);
  g.fillText("later,", 0, 0);
  g.fillText("not now?", 6, 50);
  g.restore();
  // a tiny date in the corner, like a note to self
  g.font = 'italic 30px "Bradley Hand", "Segoe Print", "Comic Sans MS", cursive';
  g.fillText("10/25", 80, 940);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/**
 * @param {Object} mats  the room's materials (mats.m)
 * @param {THREE.Object3D} parent
 * @param {{ size?: number, tiltDeg?: number }} opts  size: the frame's outer width (m)
 */
export function buildTissueFrame(mats, parent, { size = 0.3, tiltDeg = 0 } = {}) {
  const group = new THREE.Group();
  group.name = "tissueFrame";
  parent.add(group);

  const frameM = new THREE.MeshStandardMaterial({ name: "frameBlack", color: 0x1c1a19, roughness: 0.5, metalness: 0.05 });
  const matM = new THREE.MeshStandardMaterial({ name: "frameMat", color: 0xfbfaf7, roughness: 0.92 });
  const B = new Batch("tissueFrame");
  const h = size / 2, bar = 0.016, depth = 0.022;
  // the four bars of the frame, mitred look not needed at this size
  B.add(frameM, boxGeo(-h, h, h - bar, h, 0, depth, "x"));
  B.add(frameM, boxGeo(-h, h, -h, -h + bar, 0, depth, "x"));
  B.add(frameM, boxGeo(-h, -h + bar, -h + bar, h - bar, 0, depth, "y"));
  B.add(frameM, boxGeo(h - bar, h, -h + bar, h - bar, 0, depth, "y"));
  // the white mat, set a little back inside the frame
  B.add(matM, boxGeo(-h + bar, h - bar, -h + bar, h - bar, 0, depth - 0.006, "y"));
  B.build(group);

  // the tissue: a 20 cm napkin, crinkled, a few degrees crooked, a millimetre off the mat
  if (typeof document !== "undefined") {
    const T = size * 0.66;
    const geo = new THREE.PlaneGeometry(T, T, 40, 40);
    const r = rng(5);
    const p = geo.attributes.position;
    // crinkles: a few soft folds plus fine noise, and the corners curling a hair
    const folds = Array.from({ length: 5 }, () => ({ a: r() * Math.PI, k: 18 + r() * 30, ph: r() * 6.28, amp: 0.0006 + r() * 0.0009 }));
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i);
      let z = 0;
      for (const f of folds) z += f.amp * Math.sin((x * Math.cos(f.a) + y * Math.sin(f.a)) * f.k + f.ph);
      z += (r() - 0.5) * 0.0005;
      const cr = Math.max(Math.abs(x), Math.abs(y)) / (T / 2);
      z += 0.0025 * Math.pow(Math.max(0, cr - 0.75) / 0.25, 2);
      p.setZ(i, z);
    }
    geo.computeVertexNormals();
    const tissueM = new THREE.MeshStandardMaterial({ name: "tissue", map: drawTissue(), roughness: 0.95, transparent: true, opacity: 0.94, side: THREE.DoubleSide });
    const tissue = new THREE.Mesh(geo, tissueM);
    tissue.name = "tissue";
    // clear of the mat by more than the crinkles' depth (render 2: the folds dipped
    // behind the mat and it showed through as white blotches)
    tissue.position.z = depth - 0.006 + 0.0045;
    tissue.rotation.z = -0.05; // pinned in a little crooked
    tissue.receiveShadow = true;
    group.add(tissue);
  }
  group.rotation.z = (tiltDeg * Math.PI) / 180; // the frame itself hangs a hair off level
  return group;
}
