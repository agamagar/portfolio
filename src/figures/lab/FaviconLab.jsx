// The 3D favicon, at a size you can actually see, as a tuning bench.
//
// The tab icon (src/lib/favicon3d.js) is 32px, too small to judge its motion.
// This draws the same scene through the same painter at full panel size, with
// the wander bound outlined, plus the real 32px and 16px renders on a light and
// a dark tab strip. All three share one clock and one set of knobs, so what you
// tune in the big view is what the tab-size tiles (and then the icon) do.
//
// Knobs here are a preview only: to ship a value, copy it into HOLD / MORPH /
// WANDER at the top of favicon3d.js ("Copy values" puts them on the clipboard).

import { useEffect, useRef, useState } from "react";
import { createFaviconPainter, DEFAULTS, SHAPE_GROUPS, SHAPE_NAMES } from "../../lib/favicon3d";

const BIG = 480;
const GROUPS = [
  ["solid", "Solids"],
  ["round", "Round"],
  ["one-sided", "One-sided"],
  ["4d", "4D (hypothetical)"],
];
const cap = (n) => n[0].toUpperCase() + n.slice(1);

// The big view renders at 1x even on retina: every pixel is a full ray march,
// and the 24-cell at 2x (960px square) is enough work to stall the GPU.
function sizeCanvas(canvas, px, maxDpr = 2) {
  const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
  canvas.width = canvas.height = Math.round(px * dpr);
  return canvas.getContext("2d");
}

export default function FaviconLab() {
  const big = useRef(null);
  const tiles = useRef([]);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [hold, setHold] = useState(DEFAULTS.hold);
  const [morph, setMorph] = useState(DEFAULTS.morph);
  const [wander, setWander] = useState(DEFAULTS.wander);
  const [readout, setReadout] = useState({ t: 0, label: "", idx: 0 });
  const [noGL, setNoGL] = useState(false);

  // everything the animation loop reads lives in one ref, so moving a slider
  // never restarts the loop (or reseeds the tumble)
  const live = useRef({ t: 0, spinX: 0, spinY: 0 });
  Object.assign(live.current, { playing, speed, hold, morph, wander });
  const cycle = hold + morph;
  const loop = cycle * SHAPE_NAMES.length;

  useEffect(() => {
    const bigPaint = createFaviconPainter(sizeCanvas(big.current, BIG, 1));
    if (!bigPaint) return setNoGL(true);
    const tilePaints = tiles.current
      .filter(Boolean)
      .map((c) => createFaviconPainter(sizeCanvas(c, +c.dataset.px), { supersample: 2 }))
      .filter(Boolean);
    let last = performance.now(), id, lastReadout = 0;
    const frame = (now) => {
      const L = live.current;
      if (L.playing) L.t += ((now - last) / 1000) * L.speed;
      last = now;
      const o = { hold: L.hold, morph: L.morph, wander: L.wander, spinX: L.spinX, spinY: L.spinY };
      bigPaint(L.t, o);
      tilePaints.forEach((p) => p(L.t, o));
      if (now - lastReadout > 100) {
        lastReadout = now;
        const { idx, next, p } = bigPaint.state(L.t, o);
        const label = p > 0 ? `${SHAPE_NAMES[idx]} → ${SHAPE_NAMES[next]} · ${Math.round(p * 100)}%` : SHAPE_NAMES[idx];
        setReadout({ t: L.t, label, idx: p > 0.5 ? next : idx });
      }
      id = requestAnimationFrame(frame);
    };
    id = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(id);
  }, []);

  // drag the big view to add your own spin on top of the tumble
  const drag = useRef(null);
  const onDown = (e) => {
    drag.current = { x: e.clientX, y: e.clientY, sx: live.current.spinX, sy: live.current.spinY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (e) => {
    const d = drag.current;
    if (!d) return;
    live.current.spinY = d.sy + (e.clientX - d.x) * 0.01;
    live.current.spinX = d.sx + (e.clientY - d.y) * 0.01;
  };
  const onUp = () => (drag.current = null);
  const resetSpin = () => Object.assign(live.current, { spinX: 0, spinY: 0 });

  // +1 ms: i * cycle can land a float hair before the boundary, i.e. at the very
  // end of the previous shape's morph
  const jump = (i) => (live.current.t = Math.floor(live.current.t / loop) * loop + i * cycle + 0.001);
  const scrub = (v) => (live.current.t = Math.floor(live.current.t / loop) * loop + v);
  const copy = () =>
    navigator.clipboard?.writeText(`const HOLD = ${hold};\nconst MORPH = ${morph};\nconst WANDER = ${wander};`);

  const slider = (label, value, set, min, max, step, fmt) => (
    <label className="favicon-lab__knob">
      <span>{label}</span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => set(+e.target.value)} />
      <output>{fmt(value)}</output>
    </label>
  );

  return (
    <section className="lab-snapshot favicon-lab" aria-label="3D favicon">
      <h2 className="lab-snapshot__title">3D favicon &mdash; tuning bench</h2>
      <p className="lab-snapshot__note">
        Every regular solid, the round ones, the one-sided Möbius strip and Klein
        bottle, then four-dimensional shapes: the 5-cell, 16-cell, tesseract and
        24-cell in a 4D double rotation, projected into 3D with depth in w drawn
        as strut thickness and tint, and a 3D slice sliding through a turning
        tesseract. Between 4D shapes the morph sweeps along w. Each shape is a distance field
        ray-marched on the GPU; the morph blends the two fields, so the surface
        itself flows into the next form. One primary colour each. Tumbles on all
        three axes about the centre of mass, which wanders inside the dashed box.
        Drag to spin it; double-click to let go. Source:{" "}
        <code>src/lib/favicon3d.js</code>.
      </p>

      <div className="favicon-lab__stage">
        <canvas
          ref={big}
          className="favicon-lab__big"
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onDoubleClick={resetSpin}
          aria-label="3D favicon, enlarged"
          role="img"
        />
        <span
          className="favicon-lab__bound"
          aria-hidden="true"
          style={{ left: `${50 - wander * 100}%`, top: `${50 - wander * 100}%`, width: `${wander * 200}%`, height: `${wander * 200}%` }}
        />
        <span className="favicon-lab__readout" aria-live="off">{readout.label}</span>
        {noGL && <span className="favicon-lab__readout">WebGL is unavailable here, so the tab keeps the static face.</span>}
      </div>

      <div className="favicon-lab__transport">
        <button type="button" onClick={() => setPlaying((v) => !v)}>{playing ? "Pause" : "Play"}</button>
        <input
          type="range"
          aria-label="Scrub through one loop"
          min={0}
          max={loop}
          step={0.01}
          value={((readout.t % loop) + loop) % loop}
          onChange={(e) => scrub(+e.target.value)}
        />
      </div>

      <div className="favicon-lab__shapes">
        {GROUPS.map(([g, title]) => (
          <div key={g} className="favicon-lab__group">
            <span>{title}</span>
            {SHAPE_NAMES.map((n, i) =>
              SHAPE_GROUPS[i] === g ? (
                <button key={n} type="button" aria-pressed={readout.idx === i} onClick={() => jump(i)}>{cap(n)}</button>
              ) : null
            )}
          </div>
        ))}
      </div>

      <div className="favicon-lab__knobs">
        {slider("Speed", speed, setSpeed, 0.1, 3, 0.05, (v) => `${v.toFixed(2)}×`)}
        {slider("Hold", hold, setHold, 0.3, 6, 0.1, (v) => `${v.toFixed(1)} s`)}
        {slider("Morph", morph, setMorph, 0.2, 4, 0.1, (v) => `${v.toFixed(1)} s`)}
        {slider("Wander", wander, setWander, 0, 0.1, 0.005, (v) => `${(v * 100).toFixed(1)}%`)}
        <button type="button" className="favicon-lab__copy" onClick={copy}>Copy values</button>
      </div>

      <div className="favicon-lab__strips">
        {["light", "dark"].map((k, s) => (
          <div key={k} className={`favicon-lab__strip favicon-lab__strip--${k}`}>
            {[32, 16].map((px, j) => (
              <canvas
                key={px}
                ref={(el) => (tiles.current[s * 2 + j] = el)}
                data-px={px}
                style={{ width: px, height: px, display: "block" }}
              />
            ))}
            <span>{k} tab, actual size</span>
          </div>
        ))}
      </div>
    </section>
  );
}
