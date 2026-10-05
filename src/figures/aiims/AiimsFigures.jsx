import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "../ds/hooks";
import "./aiims.css";

// Coded figures for the AIIMS empathy-VR case study. Static-first (they render
// fully on their own); a light in-view reveal enhances when JS + IO are present.
// Emerald accent, theme-aware via the site tokens.

// Tiny self-contained in-view hook: returns [ref, on]. Defaults on=true so the
// figure is never blank if IntersectionObserver is unavailable or motion is off.
function useReveal(reduce) {
  const ref = useRef(null);
  const [on, setOn] = useState(reduce);
  useEffect(() => {
    if (reduce) { setOn(true); return; }
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") { setOn(true); return; }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setOn(true)),
      { rootMargin: "0px 0px -20% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);
  return [ref, on];
}

// 0. Hero: the three research artifacts as one triad, doubling as a visual
// table of contents (measure it, train it, prove it).
const HERO = [
  { k: "Measure it", t: "A four-part empathy scale", s: "built for the Indian ward, not translated in" },
  { k: "Train it", t: "A VR patient conversation", s: "a branching scene the nurse feels in real time" },
  { k: "Prove it", t: "A control-group comparison", s: "four cohorts, designed to isolate immersion" },
];
export function AiimsHero() {
  return (
    <div className="aiims aiims-hero">
      <div className="aiims-hero__row">
        {HERO.map((c, i) => (
          <div className="aiims-hero__card" key={c.k}>
            <span className="aiims-hero__k">{c.k}</span>
            <b className="aiims-hero__t">{c.t}</b>
            <span className="aiims-hero__s">{c.s}</span>
            {i < HERO.length - 1 && <span className="aiims-hero__link" aria-hidden>&rarr;</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

// 1. The research gap: nurse-empathy studies by country (Scopus, 1952-2024).
// India is dramatically short and highlighted; the whole argument in one chart.
const GAP = [
  { name: "United States", v: 1470 },
  { name: "United Kingdom", v: 680 },
  { name: "Australia", v: 350 },
  { name: "China", v: 140 },
  { name: "Turkey", v: 120 },
  { name: "Germany", v: 45 },
  { name: "India", v: 20, india: true },
];
export function AiimsGap() {
  const reduce = useReducedMotion();
  const [ref, on] = useReveal(reduce);
  const max = GAP[0].v;
  return (
    <div className={"aiims aiims-gap" + (on ? "" : " is-off")} ref={ref}>
      <p className="aiims__title">
        Studies on nurses and empathy, 1952&ndash;2024 <b>(Scopus)</b>
      </p>
      <div className="aiims-gap__rows">
        {GAP.map((d) => (
          <div className={"aiims-gap__row" + (d.india ? " aiims-gap__row--india" : "")} key={d.name}>
            <span className="aiims-gap__name">{d.name}</span>
            <span className="aiims-gap__track">
              <span className="aiims-gap__bar" style={{ "--fill": Math.max(d.v / max, 0.012) }} />
            </span>
            <span className="aiims-gap__val">{d.v.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 2. The empathy instrument, grouped into four categories, built for the Indian context.
const FACTORS = [
  { f: "Upbringing", n: "4 items", item: "“My family has been empathetic towards me since my childhood.”" },
  { f: "Workplace", n: "4 items", item: "“When I am stressed, I may lose patience with a patient and not listen completely.”" },
  { f: "Education", n: "4 items", item: "“My nursing education taught me how to be empathetic with patients.”" },
  { f: "Empathy", n: "12 items", item: "“Empathy is a therapeutic skill without which patient care cannot happen.”" },
];
export function AiimsScale() {
  return (
    <div className="aiims aiims-scale">
      <p className="aiims__title">
        The empathy scale, in <b>four categories</b>, adapted to the Indian context
      </p>
      <div className="aiims-scale__grid">
        {FACTORS.map((c) => (
          <div className="aiims-scale__col" key={c.f}>
            <div className="aiims-scale__factor">
              <b>{c.f}</b>
              <span className="aiims-scale__n">{c.n}</span>
            </div>
            <p className="aiims-scale__item">{c.item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// 3. The VR interaction model: hover to play, click to select, release to commit.
const PlayGlyph = () => (
  <svg className="aiims-int__glyph" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M8 5v14l11-7z" fill="currentColor" />
  </svg>
);
const HandGlyph = () => (
  <svg className="aiims-int__glyph" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M10 3a1.2 1.2 0 0 1 1.2 1.2V11h.6V5.2a1.2 1.2 0 0 1 2.4 0V11h.6V6.4a1.2 1.2 0 0 1 2.4 0V13c0 3.9-2.4 6.5-6 6.5-2.2 0-3.6-.9-4.8-2.7l-2-3a1.2 1.2 0 0 1 1.9-1.4l1.1 1.3V4.2A1.2 1.2 0 0 1 10 3Z" />
  </svg>
);
const ArrowGlyph = () => (
  <svg className="aiims-int__glyph" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M5 12h13m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
export function AiimsInteraction() {
  return (
    <div className="aiims aiims-int">
      <p className="aiims__title">
        One gesture, three beats: <b>hover to play, click to select, release to commit</b>
      </p>
      <div className="aiims-int__row">
        <div className="aiims-int__step">
          <span className="aiims-int__cap">Hover to play</span>
          <div className="aiims-int__stage aiims-int__stage--ghost"><PlayGlyph /></div>
          <div className="aiims-int__pill"><b>Response 1</b><small>Hover to hear it</small></div>
        </div>
        <span className="aiims-int__arrow" aria-hidden>&rarr;</span>
        <div className="aiims-int__step">
          <span className="aiims-int__cap">Click to select</span>
          <div className="aiims-int__stage aiims-int__stage--live"><HandGlyph /></div>
          <div className="aiims-int__resp">&ldquo;Sure ma&rsquo;am, I will attend to her right away.&rdquo;</div>
        </div>
        <span className="aiims-int__arrow" aria-hidden>&rarr;</span>
        <div className="aiims-int__step">
          <span className="aiims-int__cap">Release for next step</span>
          <div className="aiims-int__stage aiims-int__stage--live"><ArrowGlyph /></div>
          <div className="aiims-int__pill"><b>Selected</b><small>Release to submit</small></div>
        </div>
      </div>
    </div>
  );
}

// 4. The comparative-study matrix: four cohorts, a real control group.
const COHORTS = ["Virtual Reality", "360 video", "2D photographic", "Control"];
const ROWS = [
  { step: "Empathy pre-test", cells: ["common", "common", "common", "common"] },
  { step: "Learner form", cells: ["Common", "Common", "Common", "na"] },
  { step: "Gameplay", cells: ["VR gameplay", "360 video", "2D mobile", "na"] },
  { step: "Empathy post-test", cells: ["common", "common", "common", "common"] },
];
export function AiimsMatrix() {
  return (
    <div className="aiims aiims-mx-wrap">
      <p className="aiims__title">
        Designed to ask not &ldquo;does VR work&rdquo; but <b>does it work better</b>: four cohorts, one control
      </p>
      <div className="aiims-mx__wrap">
        <table className="aiims-mx">
          <thead>
            <tr>
              <th className="aiims-mx__corner" />
              {COHORTS.map((c) => (<th key={c}>{c}</th>))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => {
              // collapse a fully-"common" row into one spanning cell
              const allCommon = r.cells.every((c) => c === "common");
              return (
                <tr key={r.step}>
                  <td className="aiims-mx__step">{r.step}</td>
                  {allCommon ? (
                    <td className="aiims-mx__cell aiims-mx__cell--common" colSpan={4}>Common across all cohorts</td>
                  ) : (
                    r.cells.map((c, i) =>
                      c === "na" ? (
                        <td className="aiims-mx__cell aiims-mx__cell--na" key={i}>Not administered</td>
                      ) : c === "Common" ? (
                        <td className="aiims-mx__cell aiims-mx__cell--common" key={i}>Common</td>
                      ) : (
                        <td className="aiims-mx__cell" key={i}>{c}</td>
                      )
                    )
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
