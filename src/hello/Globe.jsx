// The spinning globe on the Away cluster (annotation msk1l98q).
//
// Agam pasted a `cobe` component; this is that component, adapted rather than
// dropped in, and the adaptations are the interesting part.
//
// ── WHAT CHANGED FROM THE PASTED SOURCE ─────────────────────────────────────
//
//   TypeScript -> JSX. This project is JavaScript; the types went, the logic did
//   not. The drag physics below — the velocity clamp, the 0.95 decay, the theta
//   rebound at +/-0.4 — are the original's, verbatim.
//
//   Tailwind classes -> real CSS. `relative aspect-square select-none` became
//   three declarations in hello.css, because this row is styled in plain CSS
//   with tokens and a Tailwind class here would be the only one of its kind.
//
//   THE LABELS ARE GONE, and that is the one real subtraction. They are
//   positioned with CSS Anchor Positioning (`position-anchor`, `anchor(top)`),
//   which today is Chromium-only — but the deciding fact is size, not support:
//   this renders into a satellite about 71px across, where a monospace caption
//   with a speech-bubble tail would be larger than the planet it points at. The
//   markers stay; the tooltips would have been noise.
//
//   mapSamples drops from 16000 to 5000. The reference number is for a globe
//   filling a card; at 71px it is sampling detail smaller than a pixel, and this
//   sits in a marquee that already had a frame-rate problem worth respecting.
//
// ── WHY THESE MARKERS ───────────────────────────────────────────────────────
// The demo ships SF / NYC / Tokyo. Away is an AI travel agent built out of
// Bangalore, so the pins are Bangalore and the places the product actually talks
// about, with one arc out of home. It is illustrative rather than a claim about
// routes served — but the run's standing rule is that its art is real work, and
// a globe pinned to someone else's demo cities would be the opposite.

import { useCallback, useEffect, useRef } from "react";
import createGlobe from "cobe";

export const AWAY_MARKERS = [
  { id: "blr", location: [12.9716, 77.5946], size: 0.05 }, // home
  { id: "goa", location: [15.2993, 74.124], size: 0.03 },
  { id: "dxb", location: [25.2048, 55.2708], size: 0.03 },
  { id: "sin", location: [1.3521, 103.8198], size: 0.03 },
  { id: "lhr", location: [51.5074, -0.1278], size: 0.03 },
  { id: "nrt", location: [35.6762, 139.6503], size: 0.03 },
];

export const AWAY_ARCS = [
  { id: "blr-sin", from: [12.9716, 77.5946], to: [1.3521, 103.8198] },
  { id: "blr-lhr", from: [12.9716, 77.5946], to: [51.5074, -0.1278] },
];

export default function Globe({
  markers = AWAY_MARKERS,
  arcs = AWAY_ARCS,
  markerColor = [0.55, 0.36, 0.96],
  baseColor = [0.32, 0.32, 0.36],
  arcColor = [0.55, 0.36, 0.96],
  glowColor = [0.16, 0.16, 0.18],
  dark = 1,
  mapBrightness = 4,
  markerElevation = 0.01,
  arcWidth = 0.5,
  arcHeight = 0.25,
  speed = 0.003,
  theta = 0.2,
  diffuse = 1.5,
  mapSamples = 5000,
}) {
  const canvasRef = useRef(null);
  const pointerInteracting = useRef(null);
  const lastPointer = useRef(null);
  const dragOffset = useRef({ phi: 0, theta: 0 });
  const velocity = useRef({ phi: 0, theta: 0 });
  const phiOffsetRef = useRef(0);
  const thetaOffsetRef = useRef(0);
  const isPausedRef = useRef(false);

  const onPointerDown = useCallback((e) => {
    pointerInteracting.current = { x: e.clientX, y: e.clientY };
    if (canvasRef.current) canvasRef.current.style.cursor = "grabbing";
    isPausedRef.current = true;
  }, []);

  const onPointerMove = useCallback((e) => {
    if (pointerInteracting.current === null) return;
    const dx = e.clientX - pointerInteracting.current.x;
    const dy = e.clientY - pointerInteracting.current.y;
    dragOffset.current = { phi: dx / 300, theta: dy / 1000 };
    const now = Date.now();
    if (lastPointer.current) {
      const dt = Math.max(now - lastPointer.current.t, 1);
      const max = 0.15;
      const clamp = (v) => Math.max(-max, Math.min(max, v));
      velocity.current = {
        phi: clamp(((e.clientX - lastPointer.current.x) / dt) * 0.3),
        theta: clamp(((e.clientY - lastPointer.current.y) / dt) * 0.08),
      };
    }
    lastPointer.current = { x: e.clientX, y: e.clientY, t: now };
  }, []);

  const onPointerUp = useCallback(() => {
    if (pointerInteracting.current !== null) {
      phiOffsetRef.current += dragOffset.current.phi;
      thetaOffsetRef.current += dragOffset.current.theta;
      dragOffset.current = { phi: 0, theta: 0 };
      lastPointer.current = null;
    }
    pointerInteracting.current = null;
    if (canvasRef.current) canvasRef.current.style.cursor = "grab";
    isPausedRef.current = false;
  }, []);

  useEffect(() => {
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [onPointerMove, onPointerUp]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    let globe = null;
    let raf = 0;
    let phi = 0;
    let ro = null;

    // ONLY WHILE IT IS ON SCREEN. The pasted version runs its rAF forever; this
    // one lives inside a marquee that travels off both edges, and a WebGL globe
    // redrawing behind the viewport is exactly the cost this section was tuned
    // to remove once already.
    let visible = true;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    io.observe(canvas);

    const init = () => {
      const width = canvas.offsetWidth;
      if (width === 0 || globe) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      globe = createGlobe(canvas, {
        devicePixelRatio: dpr,
        width,
        height: width,
        phi: 0,
        theta,
        dark,
        diffuse,
        mapSamples,
        mapBrightness,
        baseColor,
        markerColor,
        glowColor,
        markerElevation,
        markers,
        arcs,
        arcColor,
        arcWidth,
        arcHeight,
        opacity: 0.7,
      });

      const frame = () => {
        if (visible) {
          if (!isPausedRef.current) {
            phi += speed;
            if (
              Math.abs(velocity.current.phi) > 0.0001 ||
              Math.abs(velocity.current.theta) > 0.0001
            ) {
              phiOffsetRef.current += velocity.current.phi;
              thetaOffsetRef.current += velocity.current.theta;
              velocity.current.phi *= 0.95;
              velocity.current.theta *= 0.95;
            }
            // the drag is allowed to tip the pole, but it springs back rather
            // than letting you spin the globe onto its head
            const lo = -0.4;
            const hi = 0.4;
            if (thetaOffsetRef.current < lo) {
              thetaOffsetRef.current += (lo - thetaOffsetRef.current) * 0.1;
            } else if (thetaOffsetRef.current > hi) {
              thetaOffsetRef.current += (hi - thetaOffsetRef.current) * 0.1;
            }
          }
          globe.update({
            phi: phi + phiOffsetRef.current + dragOffset.current.phi,
            theta: theta + thetaOffsetRef.current + dragOffset.current.theta,
            dark,
            mapBrightness,
            markerColor,
            baseColor,
            arcColor,
            markerElevation,
            markers,
            arcs,
          });
        }
        raf = requestAnimationFrame(frame);
      };
      frame();
      // the canvas fades up once it has something to show, so it never flashes
      // as a black disc while the map samples
      setTimeout(() => canvas && (canvas.style.opacity = "1"));
    };

    if (canvas.offsetWidth > 0) {
      init();
    } else {
      ro = new ResizeObserver((entries) => {
        if (entries[0]?.contentRect.width > 0) {
          ro.disconnect();
          init();
        }
      });
      ro.observe(canvas);
    }

    return () => {
      if (raf) cancelAnimationFrame(raf);
      io.disconnect();
      ro?.disconnect();
      globe?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <span className="ap__globe">
      <canvas ref={canvasRef} onPointerDown={onPointerDown} />
    </span>
  );
}
