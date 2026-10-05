import { useEffect, useRef } from "react";

// ===========================================================================
// BrickBackground — the Brick jali pattern studio, frozen into one look and
// rendered as a fixed, full-viewport site background.
//
// • STATIC at rest — draws a single frame then stops (one GPU frame, same
//   spirit as TexturedBackground).
// • LIFTS ON HOVER — the background can't receive pointer events (it sits
//   behind everything), so it listens on the window: as the cursor moves, a
//   soft region of bricks rises under it (the studio's hover wave). The render
//   loop runs only while there's motion, then freezes again.
// • PER-THEME — pass `theme` ("light" | "dark") and a `looks` map; the matching
//   look renders, and it re-inits when the theme flips.
//
// p5 loads on demand from the copy the studio already ships, so this adds
// nothing to the app bundle. To use YOUR looks: open /brick-lab, design one for
// each theme, click "Copy config", and paste over DARK_LOOK / LIGHT_LOOK.
// ===========================================================================

// --- paste studio "Copy config" objects here (one per theme) ----------------
export const DARK_LOOK = {
  layout: "diamond", render: "solid",
  ratioL: 4, ratioW: 2, ratioH: 1, unit: 24,
  bond: 0.5, scale: 5, detail: 2, depth: 18, contrast: 0.32,
  camX: -14, camY: 7, zoom: 1,
  strokeMode: "flat", strokeW: 1, light: 0.9, lightAngle: 125, jitter: 12,
  bg: "#0e0a07", colDark: "#160d07", colLight: "#4c3220", stroke: "#ffffff",
  hoverLift: 6, hoverReach: 3.2,
};

// Light mode is a paper/wireframe look, not solid — a lit solid relief goes
// dark in its shadows (unreadable behind dark text), whereas soft lines on a
// cream ground stay genuinely light. hoverLift still lifts the lines.
export const LIGHT_LOOK = {
  layout: "diamond", render: "wireframe", strokeMode: "flat",
  ratioL: 4, ratioW: 2, ratioH: 1, unit: 24,
  bond: 0.5, scale: 5, detail: 2, depth: 22, contrast: 0.35,
  camX: -14, camY: 7, zoom: 1,
  strokeW: 1, light: 1.0, lightAngle: 125, jitter: 8,
  bg: "#efeae0", colDark: "#dcd3c2", colLight: "#f4eee1", stroke: "#cabda4",
  hoverLift: 6, hoverReach: 3.2,
};

const DEFAULT_LOOKS = { dark: DARK_LOOK, light: LIGHT_LOOK };

// ---- engine (pure, mirrors public/brick-lab/editor.js) ---------------------
const hash = (i, j) => { const x = Math.sin(i * 127.1 + j * 311.7) * 43758.5453; return x - Math.floor(x); };
const triCont = (n) => { const m = ((n % 1) + 1) % 1; return 1 - Math.abs(m - 0.5) * 2; };
const sawFrac = (n) => ((n % 1) + 1) % 1;
const isEven = (n) => (((n % 2) + 2) % 2) === 0;
const clamp01 = (t) => Math.max(0, Math.min(1, t));
const hexToRgb = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const applyContrast = (t, c) => {
  if (c <= 0) return t;
  const k = 1 + c * 3;
  return clamp01(0.5 + Math.sign(t - 0.5) * Math.pow(Math.abs(t - 0.5) * 2, 1 / k) / 2);
};
const brickDims = (P) => ({ L: P.unit * (P.ratioL / P.ratioH), W: P.unit * (P.ratioW / P.ratioH), H: P.unit });

function fieldValue(P, x, y, U) {
  const cell = U.L * P.scale;
  switch (P.layout) {
    case "diamond": {
      const du = (x + y) / cell, dv = (x - y) / cell;
      const fu = du - Math.round(du), fv = dv - Math.round(dv);
      return triCont((Math.abs(fu) + Math.abs(fv)) * Math.max(1, Math.round(P.detail)));
    }
    case "herringbone": {
      const bandH = U.H * (P.detail * 6);
      const dir = isEven(Math.floor(y / bandH)) ? 1 : -1;
      return triCont((x + dir * y) / cell);
    }
    case "basket": {
      const bw = cell, bh = cell * (P.detail / 2);
      return isEven(Math.floor(x / bw) + Math.floor(y / bh)) ? 0.9 : 0.1;
    }
    case "diagonal":
      return Math.min(triCont((x + y) / cell), triCont((x - y) / cell));
    case "cube": {
      const xl = Math.abs(sawFrac(x / cell) - 0.5) * 2;
      const yl = Math.abs(sawFrac(y / cell) - 0.5) * 2;
      const thresh = clamp01(0.3 + (P.detail / 8) * 0.55);
      return Math.max(xl, yl) < thresh ? 0.9 : 0.1;
    }
    default: return 0.5;
  }
}

function buildInstances(P, w, h) {
  const U = brickDims(P);
  const stepX = U.L, stepY = U.H;
  const cols = Math.ceil(w / stepX / 2) + 2;
  const rows = Math.ceil(h / stepY / 2) + 2;
  const list = [];
  for (let j = -rows; j <= rows; j++) {
    for (let i = -cols; i <= cols; i++) {
      const x = i * stepX + (Math.abs(j % 2) === 1 ? stepX * P.bond : 0);
      const y = j * stepY;
      if (Math.abs(x) > w / 2 + stepX || Math.abs(y) > h / 2 + stepY) continue;
      list.push({ x, y, t: applyContrast(clamp01(fieldValue(P, x, y, U)), P.contrast), i, j, lift: 0 });
    }
  }
  return { list, dims: [U.L, U.H, U.W] };
}

// ---- load p5 once from the local copy the studio already ships -------------
let p5Promise = null;
function loadP5() {
  if (typeof window === "undefined") return Promise.reject();
  if (window.p5) return Promise.resolve(window.p5);
  if (!p5Promise) {
    p5Promise = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "/brick-lab/p5.min.js";
      s.async = true;
      s.onload = () => resolve(window.p5);
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  return p5Promise;
}

export default function BrickBackground({ theme = "dark", looks = DEFAULT_LOOKS, opacity = 1, scrim }) {
  const hostRef = useRef(null);

  useEffect(() => {
    let sketch = null;
    let cancelled = false;
    const P = { ...(looks[theme] || looks.dark || DARK_LOOK) };

    loadP5()
      .then((p5) => {
        if (cancelled || !hostRef.current) return;
        const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
        sketch = new p5((p) => {
          let instances = [], dims = [1, 1, 1];
          let cursor = null;   // {x, y} in css px, or null when the pointer has left
          let settle = 0;      // consecutive near-still frames → freeze the loop
          // living-surface state (all eased): parallax tilt toward the cursor,
          // a light azimuth that follows it, and a one-time build-in on load
          let tiltX = 0, tiltY = 0, lightOff = 0, born = 0;

          const rebuild = () => { const r = buildInstances(P, p.width, p.height); instances = r.list; dims = r.dims; };
          const resize = () => {
            const el = hostRef.current;
            if (!el) return;
            p.resizeCanvas(el.clientWidth, el.clientHeight);
            rebuild();
            p.redraw();
          };
          // the cursor drives the wave; any motion wakes the loop
          const onMove = (e) => { cursor = { x: e.clientX, y: e.clientY }; settle = 0; p.loop(); };
          const onLeave = () => { cursor = null; settle = 0; p.loop(); };

          p.setup = () => {
            const el = hostRef.current;
            const c = p.createCanvas(el.clientWidth, el.clientHeight, p.WEBGL);
            c.parent(el);
            p.pixelDensity(Math.min(window.devicePixelRatio || 1, 1.5));
            p.angleMode(p.DEGREES);
            rebuild();
            window.addEventListener("resize", resize);
            // reduced-motion → fully static: no cursor reactions, no build-in
            if (reduce) { born = 9999; p.noLoop(); return; }
            window.addEventListener("mousemove", onMove, { passive: true });
            document.addEventListener("mouseleave", onLeave);
            // loop runs for the build-in, then freezes until the pointer moves
          };
          p._cleanup = () => {
            window.removeEventListener("resize", resize);
            window.removeEventListener("mousemove", onMove);
            document.removeEventListener("mouseleave", onLeave);
          };

          p.draw = () => {
            // --- build-in reveal: relief + colour inflate from flat on load ---
            born += p.deltaTime;
            const rt = reduce ? 1 : clamp01(born / 850);
            const reveal = rt * rt * (3 - 2 * rt); // smoothstep

            // --- living surface: parallax tilt + light that follow the cursor ---
            let tTiltX = 0, tTiltY = 0, tLightOff = 0;
            if (cursor && !reduce) {
              const nx = Math.max(-0.5, Math.min(0.5, cursor.x / p.width - 0.5));
              const ny = Math.max(-0.5, Math.min(0.5, cursor.y / p.height - 0.5));
              tTiltY = nx * 7;      // wall turns toward the cursor (deg)
              tTiltX = -ny * 4.5;
              tLightOff = nx * 80;  // raking light sweeps with the cursor
            }
            const ease = 0.06;
            const dTiltX = (tTiltX - tiltX) * ease; tiltX += dTiltX;
            const dTiltY = (tTiltY - tiltY) * ease; tiltY += dTiltY;
            const dLight = (tLightOff - lightOff) * ease; lightOff += dLight;
            const easeAct = Math.abs(dTiltX) + Math.abs(dTiltY) + Math.abs(dLight) * 0.05;

            const rotXe = P.camX + tiltX;
            const rotYe = P.camY + tiltY;

            const [dr, dg, db] = hexToRgb(P.bg);
            p.background(dr, dg, db);
            const zc = P.zoom || 1;
            p.ortho(-p.width / 2 / zc, p.width / 2 / zc, -p.height / 2 / zc, p.height / 2 / zc, -4000, 4000);
            p.push();
            p.rotateX(rotXe);
            p.rotateY(rotYe);

            const [L, H, W] = dims;
            const wire = P.render === "wireframe";
            const depthStroke = wire && P.strokeMode === "depth";
            if (wire) {
              p.noFill();
              if (!depthStroke) {
                const [sr, sg, sb] = hexToRgb(P.stroke);
                p.stroke(sr, sg, sb);
                p.strokeWeight(P.strokeW);
              }
            } else {
              p.noStroke();
              const amb = 40 * P.light;
              p.ambientLight(amb, amb * 0.82, amb * 0.7);
              const la = (P.lightAngle + lightOff) * Math.PI / 180;
              p.directionalLight(255 * P.light, 224 * P.light, 188 * P.light, Math.cos(la), Math.sin(la), -0.4);
              p.directionalLight(70, 55, 80, -0.35, -0.5, 0.6);
              p.push();
              p.translate(0, 0, -Math.max(60, P.depth + 40));
              p.ambientMaterial(dr * 0.6, dg * 0.6, db * 0.6);
              p.plane(p.width * 2, p.height * 2);
              p.pop();
            }

            // inverse-project the cursor onto the brick plane (z = 0) under the
            // CURRENT tilted camera, so the lift still lands under the cursor
            let mwx = null, mwy = null;
            if (cursor) {
              const rx = rotXe * Math.PI / 180, ry = rotYe * Math.PI / 180;
              const sx = (cursor.x - p.width / 2) / zc, sy = (cursor.y - p.height / 2) / zc;
              const cx = Math.cos(rx) || 1e-3, cyy = Math.cos(ry) || 1e-3;
              mwy = sy / cx;
              mwx = (sx - mwy * Math.sin(rx) * Math.sin(ry)) / cyy;
            }
            const R = L * (P.hoverReach || 3);
            const pop = L * ((P.hoverLift || 3) / 100);

            const dark = hexToRgb(P.colDark), light = hexToRgb(P.colLight);
            let maxChange = 0;
            for (const b of instances) {
              let target = 0;
              if (cursor) {
                const dx = b.x - mwx, dy = b.y - mwy;
                const d = Math.sqrt(dx * dx + dy * dy);
                if (d < R) target = 0.5 + 0.5 * Math.cos(Math.PI * d / R);
              }
              const delta = (target - b.lift) * 0.2;
              b.lift += delta;
              const ad = Math.abs(delta);
              if (ad > maxChange) maxChange = ad;

              // reveal inflates both the relief (z) and the tonal contrast (v)
              const v = clamp01(0.5 + (b.t - 0.5) * reveal + b.lift * 0.85);
              const z = (b.t - 0.5) * P.depth * reveal + b.lift * pop;
              p.push();
              p.translate(b.x, b.y, z);
              if (!wire) {
                const jit = (hash(b.i, b.j) - 0.5) * P.jitter;
                p.ambientMaterial(
                  dark[0] + (light[0] - dark[0]) * v + jit,
                  dark[1] + (light[1] - dark[1]) * v + jit * 0.8,
                  dark[2] + (light[2] - dark[2]) * v + jit * 0.6,
                );
              } else if (depthStroke) {
                p.stroke(
                  dark[0] + (light[0] - dark[0]) * v,
                  dark[1] + (light[1] - dark[1]) * v,
                  dark[2] + (light[2] - dark[2]) * v,
                );
                p.strokeWeight(P.strokeW * (0.4 + v * 1.2));
              }
              p.box(L, H, W);
              p.pop();
            }
            p.pop();

            // freeze only when the wave, the parallax ease, and the reveal have
            // all gone still
            if (maxChange < 0.0016 && easeAct < 0.01 && rt >= 1) {
              if (++settle > 10) p.noLoop();
            } else { settle = 0; }
          };
        });
      })
      .catch(() => { /* p5 failed to load — page is unaffected */ });

    return () => {
      cancelled = true;
      if (sketch) { if (sketch._cleanup) sketch._cleanup(); sketch.remove(); }
    };
  }, [theme, looks]);

  // Readability scrim — a soft band of the look's own background colour behind
  // the central content column (transparent at the left/right margins, where
  // the pattern stays vivid). Darkens the bed in dark mode / lightens it in
  // light mode so the text always has enough contrast. `scrim` (0–1) overrides;
  // 0 disables it entirely.
  const activeLook = looks[theme] || looks.dark || DARK_LOOK;
  const scrimA = scrim == null ? (theme === "light" ? 0.5 : 0.62) : scrim;
  const [sbr, sbg, sbb] = hexToRgb(activeLook.bg);
  const scrimC = `rgba(${sbr},${sbg},${sbb},${scrimA})`;
  const scrimBg = `radial-gradient(ellipse 60% 135% at 50% 44%, ${scrimC} 0%, ${scrimC} 30%, transparent 78%)`;

  return (
    // z-index 0 (not -1): #root is statically positioned with an opaque
    // background, so a -1 layer paints behind it and vanishes. At 0 it paints
    // above #root's bg, while the .page content (positioned, later in the DOM)
    // still layers on top — so the relief shows behind readable content.
    <div
      aria-hidden="true"
      style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", opacity }}
    >
      {/* p5 parents the canvas into this inner div (React never touches its
          internals, so reconciling the scrim can't disturb the canvas) */}
      <div ref={hostRef} style={{ position: "absolute", inset: 0 }} />
      {scrimA > 0 && (
        <div style={{ position: "absolute", inset: 0, zIndex: 1, background: scrimBg, pointerEvents: "none" }} />
      )}
    </div>
  );
}
