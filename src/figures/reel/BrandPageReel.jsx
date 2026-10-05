// Presentation Mode reel: a brand page, one section at a time.
//
// One tall page, one section at a time. The camera holds the phone on the left
// while the real page scrolls inside it; a soft dim brackets the live section so
// the eye lands there without a highlight box being drawn over the design (see
// memory showreel-real-figma-assets: camera + spotlight only, never coded rings).
// The right column carries the pitch for whatever the camera is looking at.
//
// RULE: real Figma exports only. The screen here is the actual frame exported at
// 3x from Brand page extended (file K4KOkNWACR3m7ElFi9vkUU, node 1738:8751);
// only the motion is coded and composited over it. The copy is deliberately
// brand-neutral: it pitches the page format, not the brand running it.
//
// Everything about a beat except its copy is DERIVED from the section's own
// geometry in that frame: the zoom fits the section to the viewport, the scroll
// centers it, and the dwell is read off the length of the copy. So re-writing a
// line re-times the reel, and adding a section is four numbers and three strings.
//
// MOTION MODEL: there are no CSS transitions here. Every animated value is a pure
// function of one clock, `frameAt(t)`, written to the DOM imperatively. Live, the
// clock is rAF wall time; in export mode it is set frame by frame by
// tools/export-reel.mjs. That is the whole reason for the analytic timeline: a
// CSS transition cannot be seeked, so an MP4 of a transition-driven figure can
// only ever be a screen recording. This way the video and the page are the same
// animation evaluated at the same instants.
import { useEffect, useRef } from "react";
import { useReducedMotion } from "../ds/hooks";
import { useFitContain } from "./fit";
import "./brandPage.css";

const PAGE_SRC = "/figures/zepto-brand-page/brand-page.webp";

// Figma frame geometry (360 x 3701.67) and the phone it plays inside.
const PAGE_W = 360, PAGE_H = 11105 / 3;
const PH_W = 240, PH_H = 552;
const K = PH_W / PAGE_W;                 // page -> phone scale, 0.6667
const MAX_SCROLL = PAGE_H * K - PH_H;

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp = (a, b, t) => a + (b - a) * t;

// cubic-bezier as a JS easing function, so the exported frames land on exactly the
// curves the CSS used to run. Newton-Raphson on x, then evaluate y.
function bezier(x1, y1, x2, y2) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const fx = (t) => ((ax * t + bx) * t + cx) * t;
  const dfx = (t) => (3 * ax * t + 2 * bx) * t + cx;
  return (x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let n = 0; n < 6; n++) {
      const err = fx(t) - x;
      if (Math.abs(err) < 1e-5) break;
      const d = dfx(t);
      if (Math.abs(d) < 1e-6) break;
      t = clamp01(t - err / d);
    }
    return ((ay * t + by) * t + cy) * t;
  };
}
const EASE_CAM = bezier(0.6, 0, 0.18, 1);    // confident push-in
const EASE_IN = bezier(0.16, 1, 0.3, 1);     // decelerate-heavy settle
const EASE_OUT = bezier(0.4, 0, 1, 1);       // accelerate-out

// One beat per section. `y`/`h` are the section's box in the 360-wide frame, read
// off the Figma node tree, so the camera never has to be hand-aimed.
const BEATS = [
  {
    id: "hero",
    y: 0, h: 454,
    eyebrow: "Arrival",
    head: "Make a great first impression",
    line: "Your brand film greets every shopper the moment they land, backed by the numbers that build instant trust.",
  },
  {
    id: "bestsellers",
    y: 454, h: 276,
    eyebrow: "Proof by demand",
    head: "What everyone already buys",
    line: "Put your most-loved product right up front, the easiest purchase becomes the fastest one too.",
  },
  {
    id: "ugc-rail",
    y: 730, h: 322,
    eyebrow: "Social proof",
    head: "Let your customers do the talking",
    line: "Real buyers share real routines in short, watchable videos: no endless scrolling, no ratings to decode, just genuine voices building trust in your brand.",
  },
  {
    id: "concerns",
    y: 1052, h: 478,
    eyebrow: "Intent",
    head: "Help shoppers find their fit, faster",
    line: "Shoppers choose the concern that brought them here, and the right products appear instantly, so nothing gets lost in a big catalogue.",
  },
  {
    id: "compare",
    y: 1530, h: 496,
    eyebrow: "The hard part",
    head: "Make comparing effortless",
    line: "Shoppers can line up two products side by side, with price, rating, and claims all in one glance, so the back-and-forth that usually happens elsewhere happens right here, on your page.",
  },
  {
    id: "ugc-gallery",
    y: 2026, h: 555,
    eyebrow: "Content that sells",
    head: "Bring your products to life",
    line: "A shareable customer's/Brand's story fills the whole screen, with the product tagged right inside it. Shoppers can watch and shop in the same breath, without ever leaving the page.",
  },
  {
    id: "paired",
    y: 2580, h: 315,
    eyebrow: "Basket building",
    head: "A natural way to grow the basket",
    line: "Curated kits invite shoppers to complete their routine in one go",
  },
  {
    id: "poll",
    y: 2896, h: 368,
    eyebrow: "First-party data",
    head: "Get to know your shoppers",
    line: "A quick, one-question poll lets shoppers see what others prefer, while giving your brand real, first-hand insight no analytics dashboard could offer.",
  },
  {
    id: "results",
    y: 3264, h: 224,
    eyebrow: "Closing doubt",
    head: "Real people, real results",
    line: "Reviews with a name, a rating, and a place attached: the specific, relatable kind of proof that turns hesitation into confidence.",
  },
  {
    id: "footer",
    y: 3488, h: 214,
    eyebrow: "Sign-off",
    head: "One page, your whole brand",
    line: "A warm closing note and an easy path into everything else you sell, leaving shoppers with a reason to keep exploring your brand.",
  },
];

// Derive the shot from the section box. `zoom` fits the section to the phone
// viewport with 90px of air, so a band of the neighbouring sections always stays
// in frame: the dim needs something to act on, or "this section" reads as "the
// whole screen". Capped so the frame never gets so tight it crops the section or
// so wide the page type stops being readable. `scroll` centers the section; when
// it clamps at either end of the page the camera takes up the slack with `ty`, so
// the first and last beats stay composed instead of drifting off-center.
function shot(b) {
  const top = b.y * K;
  const height = b.h * K;
  const zoom = clamp(PH_H / (height + 90), 1.3, 1.62);
  const center = top + height / 2;
  const scroll = clamp(center - PH_H / 2, 0, MAX_SCROLL);
  const focus = center - scroll;
  // Reading pace, not a fixed beat: longer copy holds the frame longer.
  const chars = b.head.length + b.line.length;
  return {
    zoom,
    scroll,
    ty: -zoom * (focus - PH_H / 2),
    band: [top - scroll, top + height - scroll],   // the live section, in viewport coords
    dwell: clamp(900 + chars * 17, 2400, 5200),
  };
}

const SHOTS = BEATS.map(shot);
const N = BEATS.length;

const OUT = 200;                 // copy clears before the camera leaves
const IN = 520;                  // per-element entrance
const FADE = 190;                // per-element exit
const DELAYS = [0, 90, 180];     // meta, head, line

// The camera takes longer for longer moves, so the wrap from the footer back to
// the hero reads as a deliberate return rather than a whip. Copy enters at 80% of
// the move: it looks arrived well before it hits opacity 1, and entering earlier
// put readable words on screen while the spotlight was still crossing to them.
const TIMING = SHOTS.map((s, i) => {
  const prev = SHOTS[(i - 1 + N) % N];
  const dist = Math.abs(s.scroll - prev.scroll) + Math.abs(s.ty - prev.ty) * 0.6;
  const cam = clamp(620 + dist * 0.42, 700, 1600);
  return { cam, enter: cam * 0.8 };
});

const STARTS = [];
let _acc = 0;
for (let i = 0; i < N; i++) {
  STARTS.push(_acc);
  _acc += TIMING[i].enter + SHOTS[i].dwell + OUT;
}
const DURATION = _acc;
// Both the live figure and the export start here: the camera settled on beat one
// with its copy about to land, rather than mid-wrap from the footer. Rendering
// exactly DURATION ms from this point returns to the same instant, so the MP4
// loops seamlessly.
const LEAD = TIMING[0].enter;

// The whole animation, as a pure function of the clock.
export function frameAt(tRaw) {
  const t = ((tRaw % DURATION) + DURATION) % DURATION;
  let i = 0;
  while (i < N - 1 && t >= STARTS[i + 1]) i++;

  const local = t - STARTS[i];
  const cur = SHOTS[i];
  const prev = SHOTS[(i - 1 + N) % N];
  const p = EASE_CAM(clamp01(local / TIMING[i].cam));
  const outAt = TIMING[i].enter + cur.dwell;

  const copy = DELAYS.map((d) => {
    if (local < outAt) {
      const k = EASE_IN(clamp01((local - TIMING[i].enter - d) / IN));
      return { o: k, y: 10 * (1 - k) };
    }
    return { o: 1 - EASE_OUT(clamp01((local - outAt) / FADE)), y: 0 };
  });

  return {
    i,
    zoom: lerp(prev.zoom, cur.zoom, p),
    ty: lerp(prev.ty, cur.ty, p),
    scroll: lerp(prev.scroll, cur.scroll, p),
    b0: lerp(prev.band[0], cur.band[0], p),
    b1: lerp(prev.band[1], cur.band[1], p),
    copy,
  };
}

export const REEL_DURATION = DURATION;
export const REEL_LEAD = LEAD;

function BrandPageReel({ surface = "inline" }) {
  const reduce = useReducedMotion();
  const el = useRef({ beat: -1 });

  const { fitRef, frameRef } = useFitContain(960, 600, {
    contain: surface === "full",
    max: surface === "full" ? 4 : 1.06,
  });

  // One writer for every animated property. Text only changes on a beat boundary,
  // so the per-frame work is six style writes.
  const apply = (t) => {
    const n = el.current;
    if (!n.cam) return;
    const f = frameAt(t);
    n.cam.style.transform = `translate(0px, ${f.ty.toFixed(2)}px) scale(${f.zoom.toFixed(4)})`;
    n.page.style.transform = `translateY(${(-f.scroll).toFixed(2)}px)`;
    n.dimA.style.transform = `translateY(${(f.b0 - PH_H).toFixed(2)}px)`;
    n.dimB.style.transform = `translateY(${f.b1.toFixed(2)}px)`;
    for (let k = 0; k < 3; k++) {
      const node = [n.meta, n.head, n.line][k];
      node.style.opacity = f.copy[k].o.toFixed(3);
      node.style.transform = `translateY(${f.copy[k].y.toFixed(2)}px)`;
    }
    if (f.i !== n.beat) {
      n.beat = f.i;
      const b = BEATS[f.i];
      n.idx.textContent = String(f.i + 1).padStart(2, "0");
      n.eyebrow.textContent = b.eyebrow;
      n.head.textContent = b.head;
      n.line.textContent = b.line;
      n.ticks.forEach((tick, k) => {
        tick.dataset.state = k < f.i ? "done" : k === f.i ? "on" : "todo";
      });
    }
  };

  // Live clock: rAF while on screen, restarting from the lead-in on re-entry.
  // Reduced motion parks the figure on beat one, fully settled.
  useEffect(() => {
    if (surface === "export") return;
    if (reduce) { apply(LEAD + IN + DELAYS[2]); return; }
    const host = fitRef.current;
    if (!host) return;
    let raf = 0, t0 = 0, running = false;
    const tick = (now) => {
      if (!running) return;
      apply(LEAD + (now - t0));
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !running) {
          running = true;
          t0 = performance.now();
          raf = requestAnimationFrame(tick);
        } else if (!e.isIntersecting && running) {
          running = false;
          cancelAnimationFrame(raf);
        }
      },
      { threshold: 0.35 }
    );
    io.observe(host);
    return () => { running = false; cancelAnimationFrame(raf); io.disconnect(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce, surface]);

  // Export clock: tools/export-reel.mjs drives this over CDP, one frame at a time.
  useEffect(() => {
    if (surface !== "export") return;
    window.__reel = {
      duration: DURATION,
      seek: (ms) => { apply(LEAD + ms); return true; },
      ready: async () => {
        await document.fonts.ready;
        const img = el.current.page;
        if (img && !img.complete) await img.decode().catch(() => {});
        return true;
      },
    };
    apply(LEAD);
    return () => { delete window.__reel; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surface]);

  const first = BEATS[0];

  return (
    <div className="reel-fit" data-surface={surface} ref={fitRef}>
      <div className="reel-root bpr-root" ref={frameRef}>
        <div className="bpr-stage">
          <div className="bpr-cam" ref={(n) => (el.current.cam = n)}>
            <div className="reel-ph bpr-ph">
              <div className="reel-ph__screen">
                {/* the real 3x export, scrolled as one continuous page */}
                <img
                  className="bpr-page"
                  ref={(n) => (el.current.page = n)}
                  src={PAGE_SRC}
                  alt="A brand page, scrolled from the hero film through to the footer."
                  draggable={false}
                />
                {/* spotlight: the page either side of the live section falls back,
                    which is dimming, not a highlight drawn over the design */}
                <div className="bpr-dim" ref={(n) => (el.current.dimA = n)} />
                <div className="bpr-dim bpr-dim--after" ref={(n) => (el.current.dimB = n)} />
              </div>
            </div>
          </div>

          <div className="reel-spot" />

          <div className="bpr-copy">
            <p className="bpr-copy__meta" ref={(n) => (el.current.meta = n)}>
              <span className="bpr-copy__idx">
                <b ref={(n) => (el.current.idx = n)}>01</b>
                {` / ${String(N).padStart(2, "0")}`}
              </span>
              <span className="bpr-copy__eyebrow" ref={(n) => (el.current.eyebrow = n)}>
                {first.eyebrow}
              </span>
            </p>
            <h3 className="bpr-copy__head" ref={(n) => (el.current.head = n)}>{first.head}</h3>
            <p className="bpr-copy__line" ref={(n) => (el.current.line = n)}>{first.line}</p>
          </div>

          {/* Each tick is as wide as its beat is long, so the rail shows the
              pacing it is counting: the sections with more to say hold longer. */}
          <ol
            className="bpr-rail"
            aria-hidden
            ref={(n) => { el.current.ticks = n ? Array.from(n.children) : []; }}
          >
            {BEATS.map((b, n) => (
              <li
                key={b.id}
                className="bpr-rail__tick"
                style={{ flexGrow: SHOTS[n].dwell }}
                data-state={n === 0 ? "on" : "todo"}
              />
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

export default BrandPageReel;
