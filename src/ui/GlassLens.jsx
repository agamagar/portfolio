// Refracting glass for the top-controls buttons (26 Sep 2026, "build the glass
// effect using shaders so it's more responsive to the background").
//
// A WebGL shader (or a Unicorn Studio scene) cannot see the page behind it: the
// browser never hands DOM pixels to a canvas. The one GPU path that DOES see the
// live backdrop is an SVG filter inside `backdrop-filter`, so the lens is built
// there: a displacement map (a normal map of a round lens, flat in the middle and
// bending hard at the rim) drives feDisplacementMap over whatever is behind the
// button, every frame, as the page scrolls.
//
// Chromium only renders url() inside backdrop-filter. Everywhere else the frosted
// CSS glass stays, so this adds `html.glass-lens` only on Chromium and the CSS
// switches filters behind that class.
import { useEffect, useState } from "react";

const SIZE = 38;   // the buttons are 2.375rem circles
const BEZEL = 12;  // px of rim that bends; the centre stays true

// R = x shift, G = y shift, 128 = none. Along the normal, strongest at the
// edge. The filter scale is POSITIVE so the rim samples INWARD: a backdrop
// filter only has the pixels under its own box, so an outward pull smeared the
// edge (tried at -40, 26 Sep). Inward compression reads as a convex rim.
// Works for any STADIUM (a pill; a circle is the w = h case): the nearest
// point on the pill's spine gives both the distance to the edge and the normal.
function lensMap(w, h, bezel, scale = 2) {
  const W = Math.round(w * scale), H = Math.round(h * scale);
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const ctx = c.getContext("2d");
  const img = ctx.createImageData(W, H);
  const r = H / 2, b = bezel * scale;
  const x0 = r, x1 = Math.max(r, W - r);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const px = x + 0.5, py = y + 0.5;
      const qx = Math.min(x1, Math.max(x0, px));
      const dx = px - qx, dy = py - r;
      const d = Math.hypot(dx, dy);
      const i = (y * W + x) * 4;
      let ox = 0, oy = 0;
      if (d < r && d > r - b && d > 0) {
        const t = 1 - (r - d) / b;           // 0 at the bezel start, 1 at the edge
        const k = t * t * (3 - 2 * t);       // smoothstep
        ox = (dx / d) * k; oy = (dy / d) * k;
      }
      img.data[i] = 128 + ox * 127;
      img.data[i + 1] = 128 + oy * 127;
      img.data[i + 2] = 128;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return c.toDataURL();
}

// one lens filter: displacement per colour channel for a faint prism fringe
function LensFilter({ id, w, h, map, s }) {
  const ch = (k, sc, m) => [
    <feDisplacementMap key={k} in="SourceGraphic" in2="map" scale={sc} xChannelSelector="R" yChannelSelector="G" result={k} />,
    <feColorMatrix key={k + "m"} in={k} type="matrix" values={m} result={k + k} />,
  ];
  return (
    <filter id={id} x="0" y="0" width={w} height={h} filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
      <feImage href={map} x="0" y="0" width={w} height={h} result="map" preserveAspectRatio="none" />
      {ch("r", s + 4, "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0")}
      {ch("g", s + 2, "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0")}
      {ch("b", s, "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0")}
      <feBlend in="rr" in2="gg" mode="screen" result="rg" />
      <feBlend in="rg" in2="bb" mode="screen" />
    </filter>
  );
}

export function GlassLens() {
  const [on, setOn] = useState(false);
  const [circle, setCircle] = useState(null);
  const [pill, setPill] = useState(null); // the Design / PRD / Listen tabs
  useEffect(() => {
    const brands = navigator.userAgentData?.brands || [];
    if (!brands.some((b) => /Chromium/i.test(b.brand))) return;
    setCircle(lensMap(SIZE, SIZE, BEZEL));
    setOn(true);
    document.documentElement.classList.add("glass-lens");
    return () => document.documentElement.classList.remove("glass-lens");
  }, []);
  // the pill's width follows its labels, so its map is rebuilt when it resizes
  useEffect(() => {
    if (!on) return;
    let ro, el, raf;
    const fit = () => {
      const r = el.getBoundingClientRect();
      const w = Math.round(r.width), h = Math.round(r.height);
      if (!w || !h) return;
      setPill((p) => (p && p.w === w && p.h === h ? p : { w, h, map: lensMap(w, h, BEZEL) }));
    };
    const find = () => {
      el = document.querySelector(".cs-tabs.article__index-tabs");
      if (!el) { raf = setTimeout(find, 500); return; }
      ro = new ResizeObserver(fit); ro.observe(el); fit();
    };
    find();
    return () => { clearTimeout(raf); ro?.disconnect(); };
  }, [on]);
  if (!on || !circle) return null;
  return (
    <svg width="0" height="0" aria-hidden="true" style={{ position: "absolute" }}>
      <LensFilter id="glass-lens" w={SIZE} h={SIZE} map={circle} s={20} />
      {pill && <LensFilter id="glass-lens-pill" w={pill.w} h={pill.h} map={pill.map} s={20} />}
    </svg>
  );
}
