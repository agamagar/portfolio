// The bottom-drawer detail view — the scan-page candidate ("v2").
//
// Same OPEN as the v1 detail (PhoneDetail2): the clicked tile flies out of the
// grid to the centre via the phone-hero View Transition — nothing about the
// morph changes, which is the point of the comparison. What changes is where
// the evidence lands: instead of the full-page aside + slide column, a
// draggable bottom drawer rises under the centred phone.
//
// The drawer mechanics are ported from the MagneticDrawer reference Agam
// supplied (Next.js/TS/Tailwind), rebuilt for this codebase: plain JSX,
// motion/react, hello.css classes, no cn/lucide. Two deliberate departures:
//   - the reference's "Open drawer" trigger button is gone — the phone frame
//     click IS the open action, threaded through the marquee's openDetail
//   - its dynamic backdrop is replaced by the site's existing .pd__scrim, so
//     both detail views dim the page the same way
//
// Snap points: 0.48 (resting, phone visible above) and 0.92 (reading). Drag
// past the bottom or flick down to close; the marquee's closeDetail then flies
// the phone back to the tile it came from.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { lockBackgroundScroll } from "../ui/smoothScroll";
import { createPortal } from "react-dom";
import { motion, useMotionValue, animate } from "motion/react";
import FigmaPhone from "./FigmaPhone";
import HelloLink from "./HelloLink";
import { TIMELINE } from "./helloData";
import { CaseStudyBody, caseStudies } from "../App";

// Resting snap per Agam's layout reference: the drawer's top edge lands a
// little above the phone's vertical middle, with the phone staying centred IN
// FRONT of the sheet rather than parked above it.
const SNAPS = [0.62, 0.92];
const SPRING = { type: "spring", damping: 30, stiffness: 300 };

function Fact({ label, children }) {
  return (
    <div className="pd2__fact">
      <span className="pd2__fact-label">{label}</span>
      <span className="pd2__fact-value">{children}</span>
    </div>
  );
}

export default function PhoneDetail3({ phones, index, onIndex, onClose, onNavigate }) {
  const open = index != null;
  const p = open ? phones[index] : null;
  const closeRef = useRef(null);
  const returnRef = useRef(null);

  // viewport height = the drawer's travel range, kept fresh on resize
  const [vh, setVh] = useState(() =>
    typeof window !== "undefined" ? window.innerHeight : 0,
  );
  useEffect(() => {
    const onResize = () => setVh(window.innerHeight);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const y = useMotionValue(vh);
  // THE TEXT STARTS BELOW THE PHONE (annotation msuhpbeb, "make the text start
  // from below the phone"). The phone is centred in the VIEWPORT and the
  // drawer slides under it, so how much of the phone hangs over the sheet
  // depends on where the sheet currently is - a typed padding would be right
  // at one snap and wrong at the other, and wrong throughout a drag. So the
  // clearance is measured live from the two boxes and published as
  // `--pd3-clear`, which the body's top padding reads: the first line always
  // begins just under the phone, wherever the sheet has been dragged to.
  const stageRef = useRef(null);
  const drawerRef = useRef(null);
  // which snap point the drawer is settled on; drag can move between them
  const [snap, setSnap] = useState(SNAPS[0]);

  // the same evidence join the v1 card uses — nothing invented here either
  const t = useMemo(() => (p ? TIMELINE.find((x) => x.href === p.href) : null), [p]);
  // the case study for this phone's slug (/work/<slug>), or nothing
  const caseBody = useMemo(() => {
    const slug = p?.href?.startsWith("/work/") ? p.href.slice("/work/".length) : null;
    const cs = slug ? caseStudies[slug] : null;
    return cs ? (
      <div className="pd3__case page--article">
        <hr className="pd3__case-rule" />
        <CaseStudyBody cs={cs} />
      </div>
    ) : null;
  }, [p]);

  const go = useCallback(
    (delta) => {
      if (index == null) return;
      onIndex((index + delta + phones.length) % phones.length);
    },
    [index, phones.length, onIndex],
  );

  useEffect(() => {
    if (!open) return undefined;
    const sync = () => {
      const drawer = drawerRef.current;
      const phone = stageRef.current?.querySelector(".fp") || stageRef.current;
      if (!drawer || !phone) return;
      const gap = 28; // the same air the body keeps at its sides
      const clear = phone.getBoundingClientRect().bottom + gap - drawer.getBoundingClientRect().top;
      drawer.style.setProperty("--pd3-clear", `${Math.max(0, Math.round(clear))}px`);
    };
    sync();
    const unsub = y.on("change", sync);
    window.addEventListener("resize", sync);
    return () => {
      unsub();
      window.removeEventListener("resize", sync);
    };
  }, [open, y, vh]);

  // Reset to the resting snap whenever a phone opens this. The drawer mounts
  // at y = vh (offscreen, `initial`) and springs up declaratively via the
  // `animate` prop — the View Transition's "new" snapshot renders live, so the
  // drawer is seen sliding up while the phone is still flying in.
  useEffect(() => {
    if (open) setSnap(SNAPS[0]);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    returnRef.current = document.activeElement;
    closeRef.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    // body overflow AND Lenis, together (see lockBackgroundScroll)
    const unlock = lockBackgroundScroll();
    return () => {
      window.removeEventListener("keydown", onKey);
      unlock();
      const back = returnRef.current;
      if (back && back.isConnected) back.focus?.();
    };
  }, [open, go, onClose]);

  // The reference's magnetic settle, verbatim in behaviour: a hard downward
  // flick or a drawer dragged under 10% closes; otherwise the nearest snap
  // wins, with velocity allowed to push one snap further in its direction.
  const handleDragEnd = useCallback(
    (_, info) => {
      const velocity = info.velocity.y;
      const ratio = (vh - y.get()) / vh;
      if (velocity > 500 || ratio < 0.1) {
        onClose();
        return;
      }
      let best = SNAPS[0];
      let minDiff = Infinity;
      for (const point of SNAPS) {
        const diff = Math.abs(ratio - point);
        if (diff < minDiff) {
          minDiff = diff;
          best = point;
        }
      }
      if (velocity < -500) {
        const up = SNAPS.find((s) => s > ratio);
        if (up) best = up;
      }
      // the `animate` prop owns the settle; if the snap is unchanged the prop
      // does not re-fire, so nudge the value home imperatively too
      setSnap(best);
      animate(y, vh * (1 - best), SPRING);
    },
    [vh, y, onClose],
  );

  if (!open) return null;

  return createPortal(
    <div
      className="pd pd3"
      role="dialog"
      aria-modal="true"
      aria-label={[p.brand, t ? t.title : p.caption].filter(Boolean).join(": ")}
    >
      <button className="pd__scrim" aria-label="Close" onClick={onClose} />

      {/* the morph target: the phone parks in the space the resting drawer
          leaves free. Clicking the empty stage closes, same as v1's. */}
      <div
        className="pd3__stage"
        ref={stageRef}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <FigmaPhone
          screen={p.src}
          alt={[p.brand, p.caption].filter(Boolean).join(": ")}
          width={300}
          className="pd__phone"
        />
      </div>

      <motion.div
        className="pd3__drawer" data-lenis-prevent
        ref={drawerRef}
        style={{ y, height: vh }}
        initial={{ y: vh }}
        animate={{ y: vh * (1 - snap) }}
        transition={SPRING}
        drag="y"
        dragConstraints={{ top: 0, bottom: vh }}
        dragElastic={0.05}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
      >
        <div className="pd3__grip-row">
          {/* HIDDEN (annotation msnekfnb, "hide these"). The prev/next/close
              cluster goes; the drawer is still dismissible by DRAG (the grip row
              this sat on is the drag handle) and by Escape, and projects are
              still reachable from the row behind it. Commented rather than
              deleted so the cluster comes back as one line if the drag and
              Escape turn out not to be enough on their own. */}
          {false && (
          <div className="pd__nav pd3__nav">
            <button className="pd__arrow" onClick={() => go(-1)} data-tip aria-label="Previous">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M10 3l-5 5 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button className="pd__arrow" onClick={() => go(1)} data-tip aria-label="Next">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button className="pd__close" ref={closeRef} onClick={onClose} data-tip aria-label="Close">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          )}
        </div>

        {/* same evidence card contents as v1, keyed the same way so arrowing
            between projects swaps the card without tearing down the drawer */}
        <div className="pd3__body pd2__swap" key={p.src}>
          <p className="pd2__eyebrow">
            {[p.brand, t?.year, p.platform].filter(Boolean).join(" / ")}
          </p>
          <h3 className="pd2__title">{t ? t.title : p.caption}</h3>
          <p className="pd2__blurb">{p.blurb}</p>

          {t && (
            <div className="pd2__facts">
              <Fact label="Outcome">
                <strong>{t.outcome}</strong>
              </Fact>
              <Fact label="Role">{t.role}</Fact>
            </div>
          )}

          {p.href && (
            <HelloLink to={p.href} onNavigate={onNavigate} className="pd2__cta">
              Read the case study
              <span aria-hidden>→</span>
            </HelloLink>
          )}

          {/* THE CASE STUDY ITSELF, IN THE DRAWER (annotation msudmgyq, "add
              scroll here and populate the case study here"). The same body the
              /work page renders (CaseStudyBody, lifted out of App.jsx for
              exactly this), keyed by the phone's href slug, under the summary
              card. .pd3__body already scrolls (min-height 0 / overflow auto /
              overscroll contain) and is a Lenis-prevented tray, so the article
              scrolls inside the drawer with the page locked behind it. The CTA
              above still jumps to the full page for the index, presenting and
              listen modes, which are not carried in here. */}
          {caseBody}
        </div>
      </motion.div>
    </div>,
    document.body,
  );
}
