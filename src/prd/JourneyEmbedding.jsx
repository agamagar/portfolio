import { useEffect, useRef, useState } from "react";

// A TensorFlow.js map of how differently people feel air travel, trained on real
// data. 600 real Skytrax airline reviews (sampled from 41k, stratified across solo /
// couple / family / business travellers) each score the same five experience
// dimensions: seat comfort, cabin staff, food, entertainment, value for money. Each
// review is a 5-D vector of what that person rewarded or punished; TensorFlow.js
// runs a gradient-descent MDS (Adam, minimising stress between the true pairwise
// distances and the 2-D layout) over the reviewers AND the eight Away personas
// jointly, so the authored personas sit inside a cloud of real travellers. Proximity
// reads as "these people weight the experience the same way"; colour is the
// traveller type from the dataset; hollow dots said they would not fly the airline
// again. tfjs + the sample load dynamically, so nothing ships on the initial page.

const VB = { w: 680, h: 460, pad: 78 };
const CLOUD_PER_TYPE = 150; // 4 types x 150 = 600 reviewers in the trained map

const TYPE_COLORS = ["#6f86c2", "#c98ab6", "#d89e58", "#6fae8f"];

// Each persona's priority profile mapped onto Skytrax's five rating dimensions
// (seat, staff, food, entertainment, value), the review pattern this persona
// would leave. Authored, and labelled as such; the cloud around them is real.
const PERSONA_DIMS = {
  "Devika": [1.5, 2.5, 1.5, 2, 5],
  "Mr. Subramanian": [5, 4.5, 3.5, 2, 2],
  "Arjun": [3.5, 3, 2, 1.5, 3],
  "Sneha": [3.5, 4.5, 3.5, 4.5, 3.5],
  "Karthik": [4, 3.5, 3, 2.5, 4.5],
  "Riya": [2.5, 3, 2.5, 3, 4.5],
  "Meera Iyer": [3, 5, 2.5, 2, 3],
  "Nikhil": [3.5, 3, 3, 3, 5],
};

// One traveller's twelve emotion scores as a sparkline path (-3..3 mapped to y).
function sparkPath(emos, w, h, pad = 4) {
  const lo = -3, hi = 3, n = emos.length;
  return emos
    .map((e, i) => {
      const x = pad + (i / (n - 1)) * (w - 2 * pad);
      const y = pad + (1 - (e - lo) / (hi - lo)) * (h - 2 * pad);
      return `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

export default function JourneyEmbedding({ journeys }) {
  const rows = journeys.filter((j) => Array.isArray(j.stages) && j.stages.length);
  const [result, setResult] = useState(null); // { cloud:[{x,y,type,rec}], personas:[{x,y,j}], types, n }
  const [status, setStatus] = useState("loading"); // loading | ready | error
  // hover: null | { kind: "p" | "c", i } — a persona or one of the real reviewers
  const [hover, setHover] = useState(null);
  const [hurts, setHurts] = useState(null); // where-travel-hurts strip (Twitter airline sentiment)
  const alive = useRef(true);
  const svgRef = useRef(null);

  // One listener on the SVG finds the nearest point (reviewer or persona), which
  // gives every 2.6px dot a generous hit area without 600 individual handlers.
  const nearestAt = (clientX, clientY) => {
    if (!result || !svgRef.current) return null;
    const r = svgRef.current.getBoundingClientRect();
    const x = ((clientX - r.left) / r.width) * VB.w;
    const y = ((clientY - r.top) / r.height) * VB.h;
    let best = null, bestD = Infinity;
    result.personas.forEach((p, i) => {
      const d = Math.hypot(p.x - x, p.y - y);
      if (d < 16 && d - 6 < bestD) { best = { kind: "p", i }; bestD = d - 6; } // personas win ties
    });
    result.cloud.forEach((p, i) => {
      const d = Math.hypot(p.x - x, p.y - y);
      if (d < 11 && d < bestD) { best = { kind: "c", i }; bestD = d; }
    });
    return best;
  };
  const onPoint = (e) => {
    const next = nearestAt(e.clientX, e.clientY);
    setHover((h) =>
      (h && next && h.kind === next.kind && h.i === next.i) ? h : next
    );
  };

  useEffect(() => {
    alive.current = true;
    if (rows.length < 3) {
      setStatus("error");
      return;
    }
    // the strip is independent of the map: show it as soon as its data lands.
    import("./tweetHurts.json")
      .then((m) => alive.current && setHurts(m.default || m))
      .catch(() => {});
    (async () => {
      try {
        const [tf, sampleMod] = await Promise.all([
          import("@tensorflow/tfjs"),
          import("./skytraxSample.json"),
        ]);
        const sample = sampleMod.default || sampleMod;
        // WebGL makes the 600-point stress loop near-instant; the CPU fallback
        // gets a smaller cloud + fewer steps so it still lands in a few seconds.
        let gpu = false;
        try {
          gpu = await tf.setBackend("webgl");
        } catch { gpu = false; }
        if (!gpu) {
          try { await tf.setBackend("cpu"); } catch { /* keep whatever registered */ }
        }
        await tf.ready();
        const perType = gpu ? CLOUD_PER_TYPE : 75;
        const iters = gpu ? 240 : 140;

        // stratified slice of the shipped sample: rows are
        // [seat, staff, food, ent, value, overall, type, recommended]
        const byType = [[], [], [], []];
        for (const r of sample.rows) byType[r[6]]?.push(r);
        const cloudRows = byType.flatMap((arr) => arr.slice(0, perType));
        const personaRows = rows.map((j) => PERSONA_DIMS[j.user?.name] || [3, 3, 3, 3, 3]);
        const feats = [...cloudRows.map((r) => r.slice(0, 5)), ...personaRows];
        const N = feats.length;

        const pdist = (A) => {
          const sq = A.square().sum(1, true);
          const dot = A.matMul(A, false, true);
          return sq.add(sq.transpose()).sub(dot.mul(2)).relu().add(1e-9).sqrt();
        };
        // standardise on the REAL reviewers' stats, then apply to everyone.
        const { Dn, offDiag } = tf.tidy(() => {
          const Xc = tf.tensor2d(cloudRows.map((r) => r.slice(0, 5)));
          const m = tf.moments(Xc, 0);
          const X = tf.tensor2d(feats).sub(m.mean).div(m.variance.sqrt().add(1e-6));
          const D = pdist(X);
          return {
            Dn: tf.keep(D.div(D.max().add(1e-9))),
            offDiag: tf.keep(tf.scalar(1).sub(tf.eye(N))),
          };
        });
        const Y = tf.variable(tf.randomNormal([N, 2], 0, 0.4, "float32", 7));
        const opt = tf.train.adam(0.08);
        for (let i = 0; i < iters; i++) {
          opt.minimize(() => {
            const dy = pdist(Y);
            const dyn = dy.div(dy.max().add(1e-9));
            return dyn.sub(Dn).mul(offDiag).square().sum().div(N * N);
          });
          // yield to the UI a few times so the loading state can paint
          if (i % 40 === 39) await new Promise((r) => setTimeout(r, 0));
          if (!alive.current) break;
        }
        const out = Y.arraySync();
        Dn.dispose();
        offDiag.dispose();
        Y.dispose();
        if (!alive.current) return;

        const xs = out.map((c) => c[0]);
        const ys = out.map((c) => c[1]);
        const scale = (v, arr) => {
          const lo = Math.min(...arr), hi = Math.max(...arr);
          return hi - lo < 1e-6 ? 0.5 : (v - lo) / (hi - lo);
        };
        const place = (i) => ({
          x: VB.pad + scale(out[i][0], xs) * (VB.w - 2 * VB.pad),
          y: VB.pad + scale(out[i][1], ys) * (VB.h - 2 * VB.pad),
        });
        setResult({
          cloud: cloudRows.map((r, i) => ({
            ...place(i),
            type: r[6],
            rec: r[7],
            dims: r.slice(0, 5),
            overall: r[5],
          })),
          personas: rows.map((j, k) => ({ ...place(cloudRows.length + k), j })),
          types: sample.types,
          n: cloudRows.length,
        });
        setStatus("ready");
      } catch {
        if (alive.current) setStatus("error");
      }
    })();
    return () => {
      alive.current = false;
    };
  }, [rows.length]);

  return (
    <figure className="prd-embed">
      <div className="prd-embed__stage">
        {status !== "ready" && (
          <div className={`prd-embed__state prd-embed__state--${status}`}>
            {status === "loading"
              ? "Training the map on real airline reviews with TensorFlow.js…"
              : "The map could not run in this browser."}
          </div>
        )}
        {status === "ready" && result && (
          <svg
            ref={svgRef}
            viewBox={`0 0 ${VB.w} ${VB.h}`}
            className="prd-embed__svg"
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label={`A map of ${result.n} real airline reviewers and the eight Away personas, placed by how similarly they weight seat comfort, crew, food, entertainment and value for money. Computed in the browser with TensorFlow.js.`}
            onMouseMove={onPoint}
            onClick={onPoint}
            onMouseLeave={() => setHover(null)}
          >
            <g className="prd-embed__cloud" aria-hidden>
              {result.cloud.map((p, i) => {
                const on = hover?.kind === "c" && hover.i === i;
                return (
                  <circle
                    key={i}
                    cx={p.x.toFixed(1)}
                    cy={p.y.toFixed(1)}
                    r={on ? 5 : 2.6}
                    fill={p.rec ? TYPE_COLORS[p.type] : "none"}
                    stroke={TYPE_COLORS[p.type]}
                    strokeWidth={p.rec ? 0 : 1}
                    opacity={on ? 1 : 0.5}
                  />
                );
              })}
              {hover?.kind === "c" && result.cloud[hover.i] && (
                <circle
                  cx={result.cloud[hover.i].x.toFixed(1)}
                  cy={result.cloud[hover.i].y.toFixed(1)}
                  r={8}
                  fill="none"
                  className="prd-embed__ring"
                />
              )}
            </g>
            {result.personas.map((p, i) => {
              const on = hover?.kind === "p" && hover.i === i;
              const rightSide = p.x > VB.w * 0.58;
              return (
                <g
                  key={p.j.user?.name || i}
                  className={`prd-embed__node${on ? " is-on" : ""}`}
                  transform={`translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`}
                  tabIndex={0}
                  onFocus={() => setHover({ kind: "p", i })}
                  onBlur={() => setHover((h) => (h?.kind === "p" && h.i === i ? null : h))}
                >
                  <circle r={on ? 5 : 2.6} className="prd-embed__dot prd-embed__dot--persona" />
                  <text
                    x={rightSide ? -8 : 8}
                    y={4}
                    textAnchor={rightSide ? "end" : "start"}
                    className="prd-embed__label"
                  >
                    {p.j.user?.name || `Traveller ${i + 1}`}
                  </text>
                </g>
              );
            })}
          </svg>
        )}
        {status === "ready" && hover?.kind === "p" && result?.personas[hover.i] && (
          <div className="prd-embed__card" aria-hidden>
            <p className="prd-embed__card-name">
              {result.personas[hover.i].j.user?.name}
              <span>{(result.personas[hover.i].j.user?.persona || "").split(",")[0]}</span>
            </p>
            <svg viewBox="0 0 190 48" className="prd-embed__spark">
              <line x1="4" y1="24" x2="186" y2="24" className="prd-embed__spark-base" />
              <path
                d={sparkPath(result.personas[hover.i].j.stages.map((s) => s.emotion), 190, 48)}
                className="prd-embed__spark-line"
              />
            </svg>
            <p className="prd-embed__card-trip">{result.personas[hover.i].j.user?.trip}</p>
          </div>
        )}
        {status === "ready" && hover?.kind === "c" && result?.cloud[hover.i] && (() => {
          const c = result.cloud[hover.i];
          const DIM_LABELS = ["Seat", "Crew", "Food", "Entertainment", "Value"];
          return (
            <div className="prd-embed__card" aria-hidden>
              <p className="prd-embed__card-name">
                <span
                  className="prd-embed__card-type"
                  style={{ color: TYPE_COLORS[c.type] }}
                >
                  {result.types[c.type]} traveller
                </span>
                <span>
                  rated the trip {c.overall}/10 · {c.rec ? "would fly them again" : "wouldn't fly them again"}
                </span>
              </p>
              <div className="prd-embed__card-bars">
                {c.dims.map((v, k) => (
                  <div className="prd-embed__card-bar" key={DIM_LABELS[k]}>
                    <span className="prd-embed__card-bar-label">{DIM_LABELS[k]}</span>
                    <span className="prd-embed__card-bar-track">
                      <span
                        className="prd-embed__card-bar-fill"
                        style={{ width: `${(v / 5) * 100}%`, background: TYPE_COLORS[c.type] }}
                      />
                    </span>
                    <span className="prd-embed__card-bar-v">{v}</span>
                  </div>
                ))}
              </div>
              <p className="prd-embed__card-trip">One real Skytrax review from the sample.</p>
            </div>
          );
        })()}
      </div>
      {status === "ready" && result && (
        <div className="prd-embed__legend" aria-hidden>
          {result.types.map((t, i) => (
            <span className="prd-embed__key" key={t}>
              <span className="prd-embed__swatch" style={{ background: TYPE_COLORS[i] }} />
              {t}
            </span>
          ))}
          <span className="prd-embed__key">
            <span className="prd-embed__swatch prd-embed__swatch--hollow" />
            wouldn&rsquo;t fly them again
          </span>
          <span className="prd-embed__key">
            <span className="prd-embed__swatch prd-embed__swatch--persona" />
            Away personas
          </span>
        </div>
      )}
      <figcaption className="prd-embed__cap">
        {result ? result.n : "Hundreds of"} real airline reviews (Skytrax), each scoring the
        same five things, seat comfort, crew, food, entertainment, and value for money.
        TensorFlow.js trains a gradient-descent MDS in your browser to place every reviewer,
        and the eight Away personas, by how similarly they weight the experience: closer means
        they feel travel the same way. Colour is the traveller type from the dataset; hollow
        dots would not fly that airline again; the personas&rsquo; positions come from their
        authored priority profiles projected into the same space. Hover or tap any dot: a
        reviewer shows the five scores they gave, a named persona shows its emotion arc.
      </figcaption>
      {hurts && (
        <div className="prd-hurts">
          <p className="prd-hurts__head">
            Where travel actually hurts
            <span>
              {hurts.negativeTweets.toLocaleString()} unhappy tweets to US airlines, counted by
              what went wrong
            </span>
          </p>
          <ul className="prd-hurts__list">
            {hurts.strip.map((h) => {
              const max = hurts.strip[0].count;
              return (
                <li className="prd-hurts__row" key={h.label}>
                  <span className="prd-hurts__label">{h.label}</span>
                  <span className="prd-hurts__track">
                    <span
                      className="prd-hurts__bar"
                      style={{ width: `${Math.max(2, (h.count / max) * 100)}%` }}
                    />
                  </span>
                  <span className="prd-hurts__count">{h.count.toLocaleString()}</span>
                  <span className="prd-hurts__stage">{h.stage}</span>
                </li>
              );
            })}
          </ul>
          <p className="prd-hurts__cap">
            The complaints cluster after the purchase, the day of travel and being heard dwarf
            booking problems five to one, which is the product&rsquo;s whole argument: the watch,
            the verdict, and the rescue matter more than the transaction. Source: the public
            US airline Twitter sentiment dataset (14,640 tweets, 2015).
          </p>
        </div>
      )}
    </figure>
  );
}
