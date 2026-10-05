import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "../ds/hooks";
import "./scheduled.css";
import { feedback, feedbackCoalesced } from "../../ui/feedback"; // muku5gig: the site sound engine (silent unless the sound toggle is on)

// "Meeting users where they are…" — Figma 120, file HBBgHT1u7e5jsz7BEEZ3fT node
// 3:3321, with its Dev Mode annotation "Pictionary game".
//
// SYNCED TO FIGMA'S OWN MOTION (pin mu3kt85t, "sync these with figma for layout
// and pill pin configuration and reveal animation"). The first pass had the
// pills resting as a "?" and swapping to the word, which was my invention. The
// design is better and quite specific: read off the frame's timeline, each pill
// is three parts —
//
//   Box          width 67 -> its full width, x 0 -> -half of the growth, with a
//                brief 0.92 squash first, spring ease [0.34, 1.56, 0.64, 1]
//   Text Reveal  a clip whose width goes 0 -> full, ease [0.25, 1, 0.5, 1]
//   the label    opacity 0 -> 1 and x -20 -> 0, ease [0.16, 1, 0.3, 1]
//
// So the rest state is a 67x67 PIN (67 is both the Box's start width and the
// pill's height in the frame — a circle), and it springs open while the word
// wipes out of the clip. The x offset is exactly half the width it gains, which
// is growth from the CENTRE: so each pill is positioned by its centre here and
// translated -50%, which reproduces that at any size without arithmetic.
//
// Timings are the frame's fractions x its 29.992s cohort:
//   squash 0-81ms · box opens 81-549ms · clip 180-579ms · word 219-501/579ms
//
// Two things the annotation does NOT get to override:
//   1. the answer is always available to assistive tech — the real label is the
//      button's accessible name from the first render, and only the drawn word
//      is withheld. A screen reader is not made to play a party game.
//   2. there is no prompt row and no "Show all". Both were mine, not the
//      design's, and Agam removed them (pins mu3kskdq / mu3ksn4s): the pin IS
//      the invitation. Hover, focus or tap reveals, so nothing is unreachable.
//
// 26 Sep 2026 (muicr2rh, "update this section with this", Portfolio 2026 node
// 315:29470): the three-column grid of pins became a hand-placed COLLAGE of six
// photos at their own sizes with the labels open as tags. Every box is the
// frame's own, as a % of the collage area (x of 1512; y of the 1581px from the
// top of the first row, frame y 199, to the bottom of the last, 1780). The
// tags keep the pin-to-word reveal, but it now plays by itself, staggered, when
// the collage scrolls into view, since the frame rests with every word open.
// muie0ejv / muie24y8: each tag also carries a PAIR of emoji, a mood and a
// scene (the first single set read weak). muie431c: the emoji leads the
// label and is drawn larger; Between meetings is sword fighting (meetings as
// a duel), which is what the first ask meant. muie4bwt: the others follow
// it, one emoji each. muiflkz2: now Google's ANIMATED Noto emoji. Noto has no
// animated sword, runner or curry, so meetings is 💥 (the clash), commute is
// 🏠 (heading home) and dinner is 🍽️, drawn only (the
// accessible name stays the plain label).
// mukqox8u (28 Sep): re-baked from Agam's latest drags. mujkldd0 (27 Sep): tag positions are where Agam dragged them on the page,
// converted back to frame units (not Figma's original spots any more).
// `sharp` is the tag's one square corner, the one that points at its photo.
const X = (v) => (v / 1512) * 100;
const Y = (v) => ((v - 199) / 1581) * 100;
const MOMENTS = [
  { key: "meetings", emoji: "💥", label: "Between meetings", box: [150, 199, 704, 529], tag: [482.4, 443.3], sharp: "tl", alt: "A hand holding a phone low beside a desk during a meeting" },
  { key: "bed", emoji: "🥱", label: "Heading to bed", box: [914, 301.5, 448, 324], tag: [1052.2, 455.0], sharp: "tr", alt: "Someone lying in bed at night, holding a phone overhead" },
  { key: "commute", emoji: "🏠", label: "On the way home", box: [48.5, 788, 663, 393], tag: [285.5, 916.8], sharp: "br", alt: "Walking through a station concourse with a bag and a phone" },
  // Figma reads "ocassion"; corrected here and flagged back
  { key: "occasion", emoji: "🎁", label: "Ordering for an occasion", box: [771.5, 788, 692, 459], tag: [1042.8, 985.3], sharp: "tr", alt: "Wrapping a gift on the floor, phone beside the paper" },
  { key: "dinner", emoji: "🍽️", label: "Ordering for dinner", box: [114.5, 1307, 448, 324], tag: [284.6, 1444.3], sharp: "tr", alt: "A dining table with tea and biscuits, one hand on a phone" },
  { key: "peak", emoji: "🚨", label: "Ordering during peak hours", box: [622.5, 1307, 775, 473], tag: [1009.0, 1529.6], sharp: "tl", alt: "A phone held above a street jammed with evening traffic" },
];

const SRC = "/figures/scheduled/moments/";

export default function SchedMoments() {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  // mujtwppb (27 Sep): tags rest COLLAPSED (a circle with the emoji centred)
  // and open only when clicked; clicking again closes. Was: all opened on view.
  const [open, setOpen] = useState(() => new Set());
  const toggle = (k) => { feedback("toggle"); setOpen((o) => { const n = new Set(o); n.has(k) ? n.delete(k) : n.add(k); return n; }); };
  // muiekp2c "animate them on scroll": scroll-LINKED, not a one-shot. As the
  // collage travels up the viewport each photo fades and rises in (28px, a
  // slight 0.96 -> 1 scale), staggered in reading order; after that they keep
  // drifting at slightly different rates (DEPTH, px over the whole trip) so
  // the collage reads as layered. Uses translate/scale, never transform.
  useEffect(() => {
    const el = ref.current;
    if (!el || reduce) return;
    const imgs = [...el.querySelectorAll(".smo__photo")];
    const DEPTH = [-18, 26, 10, -24, 20, -12];
    let raf = 0;
    const clamp = (v) => Math.max(0, Math.min(1, v));
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.visualViewport?.height || window.innerHeight;
      const p = clamp((vh - r.top) / (vh + r.height)); // 0 entering, 1 leaving
      imgs.forEach((img, i) => {
        const t = clamp((p - 0.04 - i * 0.045) / 0.18);
        const e = 1 - Math.pow(1 - t, 3);
        const drift = (p - 0.5) * DEPTH[i % DEPTH.length];
        img.style.opacity = e.toFixed(3);
        img.style.translate = `0 ${((1 - e) * 28 + drift).toFixed(1)}px`;
        img.style.scale = (0.96 + 0.04 * e).toFixed(4);
      });
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll, { capture: true });
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduce]);
  // muifkzti: every tag can be picked up and dragged; it lifts while held.
  // mujk8cpo: it stays wherever it is dropped.
  // translate only, so it never fights the open/close transitions.
  const dragTag = (e) => {
    if (e.button !== 0) return;
    const n = e.currentTarget;
    e.preventDefault();
    try { n.setPointerCapture(e.pointerId); } catch { /* synthetic pointer */ }
    const x0 = e.clientX - (n._dx || 0), y0 = e.clientY - (n._dy || 0);
    const sx = e.clientX, sy = e.clientY;
    n._moved = false;
    n.classList.add("is-held");
    const move = (m) => {
      if (Math.hypot(m.clientX - sx, m.clientY - sy) > 4) n._moved = true; // a drag, not a click
      n._dx = m.clientX - x0; n._dy = m.clientY - y0;
      n.style.translate = `${n._dx}px ${n._dy}px`;
    };
    // mujk8cpo: a dropped tag STAYS where it is put (was: spring home); the
    // next pick-up continues from there via n._dx / n._dy
    const up = () => {
      n.removeEventListener("pointermove", move);
      n.removeEventListener("pointerup", up);
      n.removeEventListener("pointercancel", up);
      n.classList.remove("is-held");
      if (n._moved) feedback("select"); // a drag that lands; a plain tap is the toggle's sound
    };
    n.addEventListener("pointermove", move);
    n.addEventListener("pointerup", up);
    n.addEventListener("pointercancel", up);
  };
  return (
    <div className="smo" ref={ref} data-reduce={reduce ? "true" : undefined}>
      <p className="smo__title">Meeting users where they are...</p>
      <ul className="smo__collage">
        {MOMENTS.map((m, i) => {
          const [x, y, w, h] = m.box;
          return (
            <li className="smo__cell" key={m.key}>
              <img
                className="smo__photo" src={`${SRC}${m.key}-v2.webp`} alt={m.alt} loading="lazy" decoding="async"
                style={{ left: X(x) + "%", top: Y(y) + "%", width: X(w) + "%", height: (h / 1581) * 100 + "%" }}
              />
              <span
                className={`smo__pill smo__pill--${m.sharp}`}
                role="button" tabIndex={0} aria-expanded={open.has(m.key)} aria-label={m.label}
                data-on={open.has(m.key) ? "true" : undefined}
                onPointerDown={dragTag}
                onClick={(e) => { if (!e.currentTarget._moved) toggle(m.key); }}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(m.key); } }}
                style={{ left: X(m.tag[0]) + "%", top: Y(m.tag[1]) + "%" }}
              >
                {/* muiflkz2: Google's animated Noto emoji (CC BY 4.0), self-hosted at
                    72px; decorative, the label carries the name. Outside the clip so
                    it shows, centred, while the tag is collapsed. */}
                <img className="smo__emoji smo__emoji--anim" src={`${SRC.replace("moments/", "emoji/")}${m.key}.webp`} alt="" width="72" height="72" decoding="async" />
                {/* the clip is Figma's "Text Reveal": the word is wiped out of it */}
                <span className="smo__clip" aria-hidden>
                  <span className="smo__word">{m.label}</span>
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
