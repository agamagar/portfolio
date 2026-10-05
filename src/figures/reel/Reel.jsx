// Presentation Mode ("Reel") — the third figure-authoring mode, alongside the
// coded `fig:` figures ("SVG mode") and the `design:` Figma plates ("Design
// mode"). A reel is a cinematic figure: ONE phone the "camera" zooms around,
// featuring one moment at a time. The phone is always maintained on screen; a
// close-up is the camera pushing in (scale + translate to center a region).
//
// RULE: showreels use REAL Figma-exported assets only (see memory
// showreel-real-figma-assets). The phone screens here are the real Zepto exports
// in public/figures/scheduled/; only the MOTION + effects (camera, glow ring,
// tap pulse, spotlight) are coded and composited OVER the real plates.
//
// Driven by the ds/ harness: useInViewLoop is the beat sequencer (plays on view,
// loops, wait()/alive() gating); useReducedMotion holds a static frame.
import { useState, useEffect, useCallback } from "react";
import { useReducedMotion, useInViewLoop } from "../ds/hooks";
import Cursor from "../ds/Cursor";
import BrandPageReel from "./BrandPageReel";
import { useFitContain } from "./fit";
import "./reel.css";

const SCREEN = "/figures/scheduled/";

// useFitContain now lives in ./fit so each reel can use it without importing back
// from this file (which owns the registry, and would close an import cycle).

// ── the Scheduled Delivery reel ──────────────────────────────────────────────
// PH_H matches the real slot-screen ratio (1080×2487) so the fixed footer (the
// "cancel up to 30 min" banner + the Confirm CTA) shows pinned at the bottom
// instead of being cropped. The page screen has no footer, so it naturally
// "goes away" there.
const PH_W = 240, PH_H = 552;

function SchedDeliveryReel({ surface = "inline" }) {
  const reduce = useReducedMotion();

  const [screen, setScreen] = useState(reduce ? "tom" : "today"); // today | late | tom (all banner-free)
  const [cam, setCam] = useState({ ty: 0, s: 1 });
  const [cur, setCur] = useState({ x: 120, y: 300, visible: reduce, hover: false, press: false });
  const [ml, setMl] = useState(
    reduce ? { text: "Scheduled · 3-4 AM", show: true } : { text: "", show: false }
  );

  const { fitRef, frameRef } = useFitContain(960, 600, {
    contain: surface === "full",
    max: surface === "full" ? 4 : 1.06,
  });

  // Center a vertical fraction of the (horizontally-centered) phone at scale s.
  const camTo = (oyFrac, s) => setCam({ s, ty: -s * (oyFrac * PH_H - PH_H / 2) });

  const loopRef = useInViewLoop(!reduce, async ({ wait, alive }) => {
    const point = (x, y) => setCur({ x, y, visible: true, hover: false, press: false });
    const hover = () => setCur((c) => ({ ...c, hover: true }));
    const press = () => setCur((c) => ({ ...c, press: true }));
    const release = () => setCur((c) => ({ ...c, press: false }));
    const hideCur = () => setCur((c) => ({ ...c, visible: false, hover: false, press: false }));
    while (alive()) {
      // ── 1: instant / schedule toggle (sched-slots-today has the toggle but no GTM banner) ──
      setScreen("today"); camTo(0.26, 2.0); hideCur();
      setMl({ text: "Scheduled delivery", show: false });
      await wait(160); if (!alive()) break; setMl((m) => ({ ...m, show: true }));
      await wait(820); if (!alive()) break; point(175, 130);        // the Schedule control
      await wait(540); if (!alive()) break; hover();
      await wait(520); if (!alive()) break; press();
      await wait(360); if (!alive()) break; release();
      await wait(760); if (!alive()) break; setMl((m) => ({ ...m, show: false }));

      // ── 2: pick a late-night slot (crossfade to the real late-night screen) ──
      setScreen("late"); camTo(0.63, 1.55); setCur((c) => ({ ...c, hover: false }));
      await wait(1000); if (!alive()) break; point(53, 359);        // 3-4 AM
      await wait(540); if (!alive()) break; hover();
      await wait(520); if (!alive()) break; press();
      await wait(360); if (!alive()) break; release();
      await wait(720); if (!alive()) break;

      // ── 3: across midnight — the real screen relabels (slots slide up) ──
      hideCur(); setScreen("tom"); camTo(0.48, 1.5);
      await wait(1950); if (!alive()) break;

      // ── 4: confirm (the fixed CTA, now properly in frame) ──
      camTo(0.93, 1.6);
      await wait(1000); if (!alive()) break; point(120, 525);       // Confirm
      await wait(520); if (!alive()) break; hover(); setMl({ text: "Scheduled · 3-4 AM", show: true });
      await wait(520); if (!alive()) break; press();
      await wait(360); if (!alive()) break; release();
      await wait(1300); if (!alive()) break; setMl((m) => ({ ...m, show: false })); hideCur();
      await wait(500); if (!alive()) break;
    }
  });

  return (
    <div
      className="reel-fit"
      data-surface={surface}
      ref={(n) => { fitRef.current = n; loopRef.current = n; }}
    >
      <div className="reel-root" ref={frameRef}>
        <div className="reel-stage">
          <div className="reel-cam" style={{ transform: `translate(0px, ${cam.ty}px) scale(${cam.s})` }}>
            <div className="reel-ph">
              <div className="reel-ph__screen">
                {/* real Figma-exported screens, crossfaded (slide up on enter) — all banner-free */}
                <img className="reel-screen" data-on={screen === "today" ? "true" : "false"} src={`${SCREEN}sched-slots-today.png`} alt="" draggable={false} />
                <img className="reel-screen" data-on={screen === "late" ? "true" : "false"} src={`${SCREEN}sched-slots-latenight.png`} alt="" draggable={false} />
                <img className="reel-screen" data-on={screen === "tom" ? "true" : "false"} src={`${SCREEN}sched-slots-tomorrow.png`} alt="" draggable={false} />

                {/* the global cursor (halo) is the only thing drawing attention — no purple boxes */}
                <Cursor x={cur.x} y={cur.y} visible={cur.visible} hover={cur.hover} press={cur.press} size={28} />
              </div>
            </div>
          </div>

          <div className="reel-spot" />
          <div className="reel-microlabel" data-show={ml.show ? "true" : "false"}>{ml.text}</div>
        </div>
      </div>
    </div>
  );
}

// ── presets gallery: every building block of the kit, looping in isolation ────
// A tiny in-view loop that advances a phase (and a tick, for retriggering
// one-shot effects) on an interval — one per preset card.
function useLoopPhase(enabled, period, n = 2) {
  const [s, setS] = useState({ phase: 0, tick: 0 });
  const ref = useInViewLoop(enabled, async ({ wait, alive }) => {
    let p = 0;
    while (alive()) { setS({ phase: p % n, tick: p }); await wait(period); p++; }
  });
  return [s.phase, s.tick, ref];
}

function Preset({ name, tech, period = 1900, n = 2, render }) {
  const reduce = useReducedMotion();
  const [phase, tick, ref] = useLoopPhase(!reduce, period, n);
  return (
    <div className="reel-preset">
      <div className="reel-preset__stage" ref={ref}>{render(phase, tick)}</div>
      <p className="reel-preset__name">{name}</p>
      <p className="reel-preset__tech">{tech}</p>
    </div>
  );
}

// Each preset applies one motion/effect of the kit over a REAL Zepto screen
// (a small phone showing the actual export), keeping the real-assets-only rule.
// The camera + spotlight presets are pure motion.
export function ReelPresets() {
  return (
    <div className="reel-presets">
      <Preset
        name="Camera push-in"
        tech="Scale + translate to center a region of the real screen"
        period={2600}
        render={(phase) => (
          <div className="rp-mini">
            <div className="rp-cam" data-zoom={phase === 1 ? "true" : "false"}>
              <div className="rp-phone2">
                <img className="reel-screen" data-on="true" src={`${SCREEN}sched-slots-today.png`} alt="" draggable={false} />
              </div>
            </div>
          </div>
        )}
      />
      <Preset
        name="Cursor focus"
        tech="The global cursor lands on a real control"
        period={1900}
        render={(phase) => (
          <div className="rp-phone2 rp-phone2--lg">
            <img className="reel-screen" data-on="true" src={`${SCREEN}sched-slots-today.png`} alt="" draggable={false} />
            <Cursor x={76} y={54} visible hover={phase === 1} press={phase === 1} size={22} />
          </div>
        )}
      />
      <Preset
        name="Screen crossfade"
        tech="Real screen to real screen (the relabel)"
        period={2200}
        render={(phase) => (
          <div className="rp-phone2 rp-phone2--lg">
            <img className="reel-screen" data-on={phase === 0 ? "true" : "false"} src={`${SCREEN}sched-slots-latenight.png`} alt="" draggable={false} />
            <img className="reel-screen" data-on={phase === 1 ? "true" : "false"} src={`${SCREEN}sched-slots-tomorrow.png`} alt="" draggable={false} />
          </div>
        )}
      />
      <Preset
        name="Microlabel"
        tech="A sparing lower-third caption"
        period={2400}
        render={(phase) => (
          <>
            <div className="rp-phone2 rp-phone2--lg rp-dim">
              <img className="reel-screen" data-on="true" src={`${SCREEN}sched-slots-tomorrow.png`} alt="" draggable={false} />
            </div>
            <div className="reel-microlabel rp-ml" data-show={phase === 1 ? "true" : "false"}>Scheduled · 3-4 AM</div>
          </>
        )}
      />
      <Preset
        name="Spotlight focus"
        tech="Breathing vignette holds the eye"
        period={3200}
        render={() => (<><div className="rp-dot" /><div className="reel-spot" /></>)}
      />
    </div>
  );
}

// reel registry — future reels register here, like the `figures` map.
const reels = { schedDelivery: SchedDeliveryReel, brandPage: BrandPageReel };

// Title + "about this figure" note per reel. These used to be ReelFigure's prop
// defaults, which meant every caller that passed only `name` (all of them, since
// App.jsx renders <ReelFigure name={reel} />) got the Scheduled Delivery blurb.
const REEL_META = {
  schedDelivery: {
    title: "Scheduled Delivery",
    info: "Real Zepto screens, exported from Figma. Only the motion is coded and composited over them: the camera moves, the glow ring, the tap pulses and the captions.",
  },
  brandPage: {
    title: "Brand page",
    info: "The real brand page, exported from Figma at 3x and scrolled as one continuous image. Only the motion is coded: the camera, the spotlight that brackets the live section, and the pacing, which is read off the length of each line of copy. The whole animation is one function of one clock, so tools/export-reel.mjs can step it frame by frame into an MP4.",
  },
};

// icon-only controls (info + expand-to-full-bleed)
const ICON_INFO = (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
  </svg>
);
const ICON_EXPAND = (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M16 21h3a2 2 0 0 0 2-2v-3M8 21H5a2 2 0 0 1-2-2v-3" />
  </svg>
);

// ── reel card: inline figure + icon controls (info, expand-to-full-bleed) ─────
export default function ReelFigure({ name = "schedDelivery", variant, title, info }) {
  const Comp = reels[name] || reels.schedDelivery;
  const meta = REEL_META[name] || REEL_META.schedDelivery;
  const heading = title ?? meta.title;
  const note = info ?? meta.info;
  const [expanded, setExpanded] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const close = useCallback(() => setExpanded(false), []);
  useEffect(() => {
    if (!expanded) return;
    const onKey = (e) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [expanded, close]);

  return (
    <div className={variant === "slide" ? "slide__media-live" : "article__figure-live article__figure-live--bare"}>
      <div className="reel-card">
        <Comp surface="inline" />

        {showInfo && <p className="reel-info-pop" role="note">{note}</p>}

        <div className="reel-controls">
          <button
            type="button"
            className="reel-ctrl reel-info"
            onClick={() => setShowInfo((v) => !v)}
            aria-label="About this figure"
            aria-expanded={showInfo}
          >
            {ICON_INFO}
          </button>
          <button
            type="button"
            className="reel-ctrl reel-expand"
            onClick={() => setExpanded(true)}
            aria-label="Expand to full screen"
          >
            {ICON_EXPAND}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="reel-overlay" role="dialog" aria-modal="true" aria-label={heading}>
          <div className="reel-overlay__bar">
            <span className="reel-overlay__title">{heading}</span>
            <button className="reel-overlay__exit" onClick={close} aria-label="Exit">Esc ✕</button>
          </div>
          <div className="reel-overlay__stage">
            <Comp surface="full" />
          </div>
        </div>
      )}
    </div>
  );
}

export { reels };
