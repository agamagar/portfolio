// /motion-check - the harness that holds the built Figma-motion components to
// the file's own numbers.
//
// Figma's get_motion_context returns EXACT keyframes - values, times, and a
// per-segment easing - and the REST API returns every node's exact box. So
// "does the build match" is not a judgment call, it is arithmetic, and this
// page does the arithmetic:
//
//   GEOMETRY   mount each component at its source-frame size, at rest, and
//              measure every layer tagged `data-node` against the spec's
//              root-relative box. Also, for every <img>: does the placed box
//              have the asset's own aspect ratio (a mismatch means the artwork
//              is being non-uniformly stretched - the "skewed" class of bug),
//              and does the asset carry enough pixels for the size it renders.
//
//   MOTION     restart the loop, sample computed styles every frame for one
//              full period, then evaluate the spec's piecewise curves -
//              keyword / bezier / spring, all shipped as data by
//              tools/figma-motion/check-spec.mjs - at each sample's time and
//              hold the measured value to the expected one.
//
// The two lessons this page exists to catch again, wired in as checks rather
// than as memories: a hidden tab freezes every timeline (document.hidden is
// checked BEFORE sampling, and a throttled rAF is reported rather than scored),
// and a layer built from a node whose ancestor is hidden in the file is a bug
// even though it renders (spec layers are flagged hidden and matched against
// the DOM).
//
// The specs are compiled artifacts, refreshed by the pipeline, never edited:
//   node tools/figma-motion/fetch-motion.mjs 80:2601 > specs/caratlane-motion.json
//   node tools/figma-motion/check-spec.mjs specs/caratlane-motion.json \
//     specs/nodes-all.json 80:2601 > src/hello/motion-checks/caratlane.check.json

import { useCallback, useEffect, useRef, useState } from "react";
import InviteReveal from "./InviteReveal";
import AwayZeroState from "./AwayZeroState";
import ScrollBand from "./ScrollBand";
import { PHONES } from "./helloData";
import caratlaneSpec from "./motion-checks/caratlane.check.json";
import awaySpec from "./motion-checks/away.check.json";
import topprSpec from "./motion-checks/toppr.check.json";

// ---- easing, straight from the spec's data form -----------------------------
// The pure math lives in curves.js so tools/figma-motion/selftest.mjs can hold
// it to the specs under Node - this page can only run in a visible tab.
import { toNum, evalTrack } from "./motion-checks/curves";

// ---- measured values ---------------------------------------------------------

function readProp(el, prop) {
  const cs = getComputedStyle(el);
  if (prop === "opacity") return +cs.opacity;
  if (prop === "height") return parseFloat(cs.height);
  if (prop === "filter") {
    const m = /blur\(([\d.]+)px\)/.exec(cs.filter);
    return m ? +m[1] : cs.filter === "none" ? 0 : null;
  }
  const t = cs.transform;
  const mx = t && t !== "none" ? new DOMMatrix(t) : new DOMMatrix();
  if (prop === "x") return mx.m41;
  if (prop === "y") return mx.m42;
  if (prop === "scaleX") return Math.hypot(mx.m11, mx.m12);
  if (prop === "scaleY") return Math.hypot(mx.m21, mx.m22);
  if (prop === "rotate") return (Math.atan2(mx.m12, mx.m11) * 180) / Math.PI;
  return null;
}

// px-valued props rescale by the layer's rendered size over its size in the
// file, so the same spec checks a 360px mount and a 269px marquee cell alike.
const PX_PROPS = new Set(["x", "y", "height"]);
function pxFactor(prop, rect, size) {
  if (!PX_PROPS.has(prop)) return 1;
  if (prop === "x") return size.w ? rect.width / size.w : 1;
  return size.h ? rect.height / size.h : 1;
}

// Tolerances. Sampling reads a live compositor mid-frame, so these are wider
// than zero on purpose; anything past them has been a REAL defect every time.
function tolerance(prop, rangePx) {
  if (prop === "opacity") return 0.08;
  if (prop === "scaleX" || prop === "scaleY") return 0.04;
  if (prop === "filter") return 0.8;
  if (prop === "rotate") return 3;
  return Math.max(3, rangePx * 0.05);
}

const nice = (n) => (Math.abs(n) >= 100 ? n.toFixed(0) : Math.abs(n) >= 10 ? n.toFixed(1) : n.toFixed(2));

// ---- the three specimens -----------------------------------------------------

const SCROLL_PHONE = PHONES.find((p) => p.scroll);

const SPECIMENS = [
  {
    key: "caratlane",
    title: "CaratLane invite reveal",
    file: "InviteReveal.jsx",
    spec: caratlaneSpec,
    render: (playing) => <InviteReveal playing={playing} />,
  },
  {
    key: "away",
    title: "Away zero state",
    file: "AwayZeroState.jsx",
    spec: awaySpec,
    render: (playing) => <AwayZeroState playing={playing} reduce={false} />,
  },
  {
    key: "toppr",
    title: "Toppr scroll tour",
    file: "ScrollBand.jsx",
    spec: topprSpec,
    render: (playing) =>
      SCROLL_PHONE ? (
        <>
          <img
            className="fig-screen"
            src={SCROLL_PHONE.scroll.base || SCROLL_PHONE.screen || SCROLL_PHONE.src}
            alt=""
            style={{ width: "100%", display: "block" }}
          />
          <ScrollBand scroll={SCROLL_PHONE.scroll} reduce={false} playing={playing} />
        </>
      ) : null,
  },
];

// ---- the passes --------------------------------------------------------------

function collectTagged(host) {
  const out = [];
  host.querySelectorAll("[data-node]").forEach((el) => {
    const aspect = el.getAttribute("data-check") || "both";
    out.push({ el, id: el.getAttribute("data-node"), aspect });
  });
  return out;
}

function geometryPass(host, spec) {
  const byId = new Map(spec.layers.map((l) => [l.id, l]));
  const rootR = host.getBoundingClientRect();
  const rows = [];
  const seen = new Set();
  for (const { el, id, aspect } of collectTagged(host)) {
    seen.add(id);
    const layer = byId.get(id);
    if (!layer || !layer.found) continue;
    if (layer.hidden) {
      rows.push({ id, name: layer.name, kind: "hidden-built", pass: false, detail: "built, but an ancestor is hidden in the file" });
      continue;
    }
    if (aspect === "motion") continue;
    const r = el.getBoundingClientRect();
    const got = {
      left: ((r.left - rootR.left) / rootR.width) * 100,
      top: ((r.top - rootR.top) / rootR.height) * 100,
      width: (r.width / rootR.width) * 100,
      height: (r.height / rootR.height) * 100,
    };
    const dl = Object.fromEntries(
      Object.entries(layer.box).map(([k, v]) => [k, got[k] - v]),
    );
    const worst = Math.max(...Object.values(dl).map(Math.abs));
    rows.push({
      id,
      name: layer.name,
      kind: "box",
      pass: worst <= 1.0,
      worst,
      detail: `d left ${nice(dl.left)} / top ${nice(dl.top)} / w ${nice(dl.width)} / h ${nice(dl.height)} (pct of frame)`,
    });
  }
  // spec layers that never appeared in the DOM: correct for hidden ones, a
  // named reduction or a miss for the rest
  const unbuilt = spec.layers.filter(
    (l) => l.found && !seen.has(l.id) && !l.alias && (l.tracks?.length ?? 0) > 0,
  );
  // every img: distortion + resolution, no spec needed
  const imgs = [];
  host.querySelectorAll("img").forEach((img) => {
    if (!img.naturalWidth) return;
    const r = img.getBoundingClientRect();
    if (r.width < 8 || r.height < 8) return;
    const natural = img.naturalWidth / img.naturalHeight;
    const placed = r.width / r.height;
    const distortion = Math.abs(placed - natural) / natural;
    const scale = img.naturalWidth / (r.width * devicePixelRatio);
    imgs.push({
      src: img.src.split("/").pop(),
      distortion,
      lowRes: scale < 0.9,
      scale,
      pass: distortion <= 0.02 && scale >= 0.9,
    });
  });
  return { rows, unbuilt, imgs };
}

async function motionPass(host, spec, signal) {
  const byId = new Map(spec.layers.map((l) => [l.id, l]));
  const targets = collectTagged(host)
    .filter(({ id, aspect }) => aspect !== "geometry" && byId.get(id)?.found && !byId.get(id).hidden)
    .map(({ el, id }) => {
      const layer = byId.get(id);
      const rect = el.getBoundingClientRect();
      return {
        el,
        layer,
        rect,
        tracks: (layer.tracks || []).filter((t) => t.values.every((v) => toNum(v) != null)),
      };
    })
    .filter((t) => t.tracks.length);

  const D = spec.durationMs;
  const samples = [];
  const gaps = [];
  const t0 = performance.now();
  let last = t0;
  await new Promise((resolve) => {
    const tick = (now) => {
      if (signal.aborted) return resolve();
      gaps.push(now - last);
      last = now;
      const t = now - t0;
      const frame = { t, vals: [] };
      for (const tg of targets)
        for (const tr of tg.tracks) frame.vals.push(readProp(tg.el, tr.prop));
      samples.push(frame);
      if (t < D + 260) requestAnimationFrame(tick);
      else resolve();
    };
    requestAnimationFrame(tick);
  });

  gaps.sort((a, b) => a - b);
  const medianGap = gaps[Math.floor(gaps.length / 2)] || 0;

  // Phase search: the loop began at mount, a handful of frames before the
  // first sample. Slide t0 within one composition latency to best explain the
  // measurements, then score everything at that one shift.
  const cols = [];
  for (const tg of targets) for (const tr of tg.tracks) cols.push({ tg, tr });
  let bestShift = 0;
  let bestErr = Infinity;
  for (let shift = -260; shift <= 40; shift += 8) {
    let err = 0;
    let n = 0;
    for (const s of samples) {
      const tNorm = (s.t + shift) / D;
      if (tNorm < 0 || tNorm > 1) continue;
      s.vals.forEach((meas, ci) => {
        const { tg, tr } = cols[ci];
        if (tr.prop !== "opacity" || meas == null) return;
        const exp = evalTrack(tr, tNorm);
        if (exp == null) return;
        err += (meas - exp) * (meas - exp);
        n++;
      });
    }
    if (n && err / n < bestErr) {
      bestErr = err / n;
      bestShift = shift;
    }
  }

  // score each track at the chosen phase; a step segment is judged with a
  // small time slop, or a one-frame lag around a cliff reads as a huge error
  const rows = cols.map(({ tg, tr }, ci) => {
    const factor = pxFactor(tr.prop, tg.rect, tg.layer.size);
    const numsPx = tr.values.map((v) => toNum(v) * factor);
    const range = Math.max(...numsPx) - Math.min(...numsPx);
    const tol = tolerance(tr.prop, range);
    let maxErr = 0;
    let at = 0;
    samples.forEach((s) => {
      const tNorm = (s.t + bestShift) / D;
      if (tNorm < 0.01 || tNorm > 0.99) return;
      const m = s.vals[ci];
      if (m == null) return;
      let err = Infinity;
      for (const slop of [-24, -12, 0, 12, 24]) {
        const e = evalTrack(tr, (s.t + bestShift + slop) / D);
        if (e == null) continue;
        const clamped = tr.prop === "height" ? Math.max(0, e) : e;
        err = Math.min(err, Math.abs(m - clamped * factor));
      }
      if (err > maxErr && Number.isFinite(err)) {
        maxErr = err;
        at = tNorm;
      }
    });
    return {
      id: tg.layer.id,
      name: tg.layer.name,
      prop: tr.prop,
      maxErr,
      at,
      tol,
      pass: maxErr <= tol,
    };
  });

  const unscored = [];
  for (const tg of targets) {
    const skipped = (tg.layer.tracks || []).filter((t) => !t.values.every((v) => toNum(v) != null));
    for (const t of skipped) unscored.push({ id: tg.layer.id, name: tg.layer.name, prop: t.prop });
  }

  return { rows, unscored, bestShift, medianGap, sampleCount: samples.length };
}

// ---- the page ----------------------------------------------------------------

function Specimen({ def, state }) {
  const { spec } = def;
  // mount at the file's own size, so px in the spec are px on screen
  return (
    <div
      className="mc__stage"
      data-mc-host={def.key}
      style={{ width: spec.root.w, height: spec.root.h }}
    >
      {def.render(state === "sampling")}
    </div>
  );
}

export default function MotionCheck({ onBack }) {
  const [results, setResults] = useState({});
  const [phase, setPhase] = useState("idle"); // idle | running:<key> | done
  const [runId, setRunId] = useState(0);
  const abortRef = useRef({ aborted: false });
  // which specimen is currently animating (everything else sits at rest)
  const [sampling, setSampling] = useState(null);

  const run = useCallback(async () => {
    abortRef.current.aborted = true;
    const signal = { aborted: false };
    abortRef.current = signal;
    setResults({});
    setRunId((r) => r + 1);
    const all = {};
    // NOTHING runs in a hidden tab, geometry included. Motion cannot tick
    // there - not even the zero-duration settle that puts a paused component
    // into its arrived state - so every layer measures at its INITIAL
    // keyframe and geometry reads as one systematic failure per animated
    // ancestor (verified: the card measured +51.2 pct of frame off, which is
    // exactly its 400px entrance offset). The page re-arms on
    // visibilitychange instead and runs the moment it is actually looked at.
    if (document.hidden) {
      setPhase("hidden-tab");
      return;
    }
    const canSample = true;
    for (const def of SPECIMENS) {
      if (signal.aborted) return;
      setPhase(`running:${def.key}`);
      setSampling(null);
      // let the rest state commit and images arrive
      await new Promise((r) => setTimeout(r, 350));
      const host = document.querySelector(`[data-mc-host="${def.key}"]`);
      if (!host) continue;
      await Promise.all(
        [...host.querySelectorAll("img")].map((i) =>
          i.complete ? null : new Promise((r) => i.addEventListener("load", r, { once: true })),
        ),
      );
      const geometry = geometryPass(host, def.spec);
      let motion = null;
      if (canSample) {
        // remount playing so the timeline starts at zero, then sample it
        setSampling(def.key);
        await new Promise((r) => setTimeout(r, 30));
        motion = await motionPass(host, def.spec, signal);
        setSampling(null);
      }
      all[def.key] = { geometry, motion };
      setResults({ ...all });
    }
    setPhase(canSample ? "done" : "hidden-tab");
    window.__motionCheck = all;
  }, []);

  useEffect(() => {
    run();
    // a run that was blocked re-arms itself for the moment the tab is
    // actually looked at, so opening the page in a background tab still ends
    // in a full result without anyone pressing anything
    const onVis = () => {
      if (!document.hidden && !window.__motionCheck) run();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      abortRef.current.aborted = true;
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [run]);

  return (
    <div className="page page--mc">
      <div className="mc">
        <header className="mc__head">
          {onBack && (
            <button type="button" className="mc__back" onClick={onBack}>
              Back
            </button>
          )}
          <h1>Motion check</h1>
          <p className="mc__sub">
            The built components, held to the exact keyframes and boxes their
            Figma files report. Specs are compiled by tools/figma-motion; this
            page only measures.
          </p>
          <button type="button" className="mc__run" onClick={run}>
            Run again
          </button>
          {phase === "hidden-tab" && (
            <p className="mc__warn">
              This tab is hidden, and a hidden tab freezes every timeline -
              even the settle into the rest state - so nothing true can be
              measured. The checks run by themselves the moment the tab is
              fronted.
            </p>
          )}
        </header>

        {SPECIMENS.map((def) => {
          const res = results[def.key];
          const running = phase === `running:${def.key}`;
          const geomFails = res ? res.geometry.rows.filter((r) => !r.pass) : [];
          const imgFails = res ? res.geometry.imgs.filter((r) => !r.pass) : [];
          const motFails = res?.motion ? res.motion.rows.filter((r) => !r.pass) : [];
          const throttled = res?.motion && res.motion.medianGap > 40;
          const pending = res && !res.motion;
          const ok = res && !pending && !geomFails.length && !imgFails.length && !motFails.length && !throttled;
          return (
            <section key={def.key} className="mc__case">
              <div className="mc__stagecol">
                <Specimen key={`${def.key}-${runId}-${sampling === def.key}`} def={def} state={sampling === def.key ? "sampling" : "rest"} />
              </div>
              <div className="mc__report">
                <h2>
                  {def.title}
                  <span className="mc__file">{def.file}</span>
                  {res && (
                    <span className={`mc__pill ${ok ? "mc__pill--ok" : pending && !geomFails.length && !imgFails.length ? "" : "mc__pill--bad"}`}>
                      {ok
                        ? "matches the file"
                        : pending
                          ? geomFails.length || imgFails.length
                            ? "geometry diverges, motion pending"
                            : "geometry ok, motion pending"
                          : throttled
                            ? "throttled, rerun"
                            : "diverges"}
                    </span>
                  )}
                  {running && <span className="mc__pill">measuring</span>}
                </h2>
                {res && (
                  <>
                    <p className="mc__meta">
                      {res.motion && (
                        <>
                          {res.motion.sampleCount} samples, median frame gap {nice(res.motion.medianGap)}ms,
                          phase {res.motion.bestShift}ms.
                        </>
                      )}
                      {res.geometry.unbuilt.length > 0 && (
                        <> Not built: {res.geometry.unbuilt.map((l) => l.name).join(", ")}.</>
                      )}
                      {res.motion && res.motion.unscored.length > 0 && (
                        <> Unscored: {res.motion.unscored.map((u) => `${u.name} ${u.prop}`).join(", ")}.</>
                      )}
                    </p>
                    <table className="mc__table">
                      <thead>
                        <tr>
                          <th>layer</th>
                          <th>check</th>
                          <th>result</th>
                        </tr>
                      </thead>
                      <tbody>
                        {res.geometry.rows.map((r) => (
                          <tr key={`g-${r.id}-${r.kind}`} data-pass={r.pass}>
                            <td>{r.name}</td>
                            <td>{r.kind === "box" ? "box" : "visibility"}</td>
                            <td>{r.pass ? "ok" : r.detail}</td>
                          </tr>
                        ))}
                        {res.geometry.imgs
                          .filter((r) => !r.pass)
                          .map((r) => (
                            <tr key={`i-${r.src}`} data-pass={false}>
                              <td>{r.src}</td>
                              <td>asset</td>
                              <td>
                                {r.distortion > 0.02 && `stretched ${nice(r.distortion * 100)}pct off its own ratio. `}
                                {r.lowRes && `only ${nice(r.scale)}x the pixels this size needs.`}
                              </td>
                            </tr>
                          ))}
                        {(res.motion?.rows || []).map((r) => (
                          <tr key={`m-${r.id}-${r.prop}`} data-pass={r.pass}>
                            <td>{r.name}</td>
                            <td>{r.prop}</td>
                            <td>
                              {r.pass
                                ? "ok"
                                : `max err ${nice(r.maxErr)} (tol ${nice(r.tol)}) at t=${nice(r.at)}`}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
