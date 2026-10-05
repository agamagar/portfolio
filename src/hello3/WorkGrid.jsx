import { useEffect, useRef, useState } from "react";
import Cursor from "../figures/ds/Cursor";
import { useInViewLoop, useReducedMotion } from "../figures/ds/hooks";
import HelloLink from "./HelloLink";
import FigmaPhone from "./FigmaPhone";
import ClipVideo from "../hello/ClipVideo";
import ScrollBand from "../hello/ScrollBand";
import { PHONES } from "../hello/helloData";

// The two live screens come from the phone row's own data, not copies of it:
// CaratLane is the invite clip (the 27-node cohort rendered by Figma, the
// swap /hello made in mskh32yq: "not this, the better animation", pin
// mtr90owp), Toppr is the scripted scroll tour read off node 80:4215.
const CARAT_CLIP = { ...(PHONES.find((p) => p.clip?.src?.includes("caratlane"))?.clip || { src: "/mockups/figma/caratlane-invite.mp4", left: 0, top: 0, width: 100, height: 100 }), loop: true, radius: 0 };
const TOPPR_SCROLL = PHONES.find((p) => p.scroll)?.scroll;
// The schedule page from the phone row: its still plus the GTM banner clip
// pinned to the banner region (schedule-banner.mp4, loop, 3.33 / 14.87 /
// 93.33 / 13.59 of the screen), the same pair the row plays.
const SCHED = PHONES.find((p) => p.clip?.src?.includes("schedule-banner"));
// Away's zero state, the same clip the phone row plays (away-zero.mp4).
const AWAY_CLIP = { ...(PHONES.find((p) => p.clip?.src?.includes("away-zero"))?.clip || { src: "/mockups/figma/away-zero.mp4", left: 0, top: 0, width: 100, height: 100 }), loop: true, radius: 0 };

// Figma: Portfolio 2026, node 643:88426, frame "109" (07 Sep 2026): the five
// project cards, 666 x 432 each in a 2-column wrap with 60 between and around,
// replacing the phone marquee at the top of the landing (pin mtqremeh). The
// cards are the frame's own compositions, exported at 2x; each links to its
// case. Card 4 (CaratLane) has no case page yet, so it goes to the list.
const CARDS = [
  // LIVE (pin mtrw76p7, 08 Sep 2026: "these 2 phones are exactly the frames
  // from the schedule delivery case study page"). The card's own photo
  // (643:94668) sits on the frame gradient, and the two phones are the
  // case's pair on the new plate: left, the schedule page with the GTM banner
  // animation (the row's still + clip); right, the slot picker (643:94889,
  // exported at 3x). Boxes from the frame's two Bezels: 214 x 466 at 52, 160
  // and 213 x 464 at 312, -139 on the 666 x 432 card.
  { src: "/hello3/cards/card-1.png", href: "/work/scheduled-delivery", alt: "Scheduled Delivery at Zepto: the schedule page and slot picker", live: "sched" },
  // LIVE (pin mtr95ljt "for the left phone add the away animated screen we
  // made earlier"). The export's phones are a different plate from the live
  // one, so overlaying doubled the frame (as it did on Toppr, mtr955dv); the
  // card is rebuilt from the frame's parts instead: the '117' gradient in
  // CSS, the AWAY mark (643:95074) at its offset, and two live phones on the
  // frame's two phone boxes (159 x 345 at 66,115 and 275,188): the left plays
  // the zero-state clip, the right shows the negotiate screen exported from
  // the frame's own phone (643:97823).
  { src: "/hello3/cards/card-2.png", href: "/work/away-agent", alt: "Away: an agent that negotiates your next flight", live: "away" },
  // HIDDEN FOR NOW (pin mtr8fkte, 07 Sep 2026): the cross-sell tile is kept
  // here but filtered out of the grid below; drop `hidden` to bring it back.
  { src: "/hello3/cards/card-3.png", href: "/work/cross-sell", alt: "Zepto Cross-Sell", hidden: true },
  // mtr8hvnw (07 Sep 2026): Toppr sits in the LEFT column of the second row, so it comes before CaratLane
  // LIVE (pin mtr90eb1 "add the toppr phone frame here"): the export stays as
  // the card (its badges and plate are in it) and the live phone sits exactly
  // over the image's own phone, node 643:99581: 234 wide at x 216, y 70 on the
  // 666 x 432 card, so the still underneath is covered edge to edge.
  { src: "/hello3/cards/card-5.png", href: "/work/toppr", alt: "Toppr: joyful learning experiences for students", live: "toppr" },
  // LIVE (pin mtr8vi9l, 07 Sep 2026: "replace the phone with the animating
  // phone frame we made earlier"). The export is replaced by the card's own
  // parts: its gradient (Figma 643:98262, in CSS) and the layered FigmaPhone
  // with the CaratLane invite reveal (the phone row's 27-node motion spec)
  // playing in its screen, at the instance's offsets in the frame: 237 wide
  // at x 214, y -179 on a 666 x 432 card. The PNG stays as the fallback src.
  { src: "/hello3/cards/card-4.png", href: "/list", alt: "CaratLane Select", live: "caratlane" },
];

// A multiplayer-style cursor: the arrow, then the name pill hanging off its
// tail (arrow on the LEFT of the pill for the two coral/green tags, on the
// RIGHT for the yellow one, as drawn). Colour gate for the 12px white label:
// coral #ff7859 is 2.60 with white, so the PILL is ink-darkened to #c94a2d
// (4.67); green #2e833c passes as drawn (4.74); yellow #ebc252 cannot be
// darkened without stopping being yellow (even #9c7110 is 4.39), so its pill
// keeps the colour and carries a dark ink instead (#3b2b00, about 9:1). The
// ARROWS keep the frame's exact fills; they carry no text.
// HUMAN MOTION (pin mtrwwb8c, "make the cursors move more like humans are
// moving them"). The first pass was CSS keyframes: straight lines, one
// easing, identical holds, which is how a robot moves a mouse. A hand does
// four things a keyframe does not: it picks a target and moves fast then
// slows (Fitts: the time grows with the distance), it travels a slight ARC
// rather than a line, it OVERSHOOTS a little and corrects, and while it
// "rests" it never quite holds still. So each tag runs its own loop: choose a
// point within its wander radius, fly there on an ease-out along a quadratic
// bezier whose control point is pushed sideways at random, land a few px past
// and settle back, then idle with a low drift for a random beat before the
// next move. Timings are drawn from ranges, so the three never fall into
// step. The arrow tilts a few degrees into the direction of travel.
// Reduced motion: the tags sit at their home points.
function useHumanCursor(ref, seed) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return undefined;
    let rand = seed * 9301 + 49297; // a small deterministic PRNG per tag, so reloads look the same
    const rnd = () => ((rand = (rand * 9301 + 49297) % 233280) / 233280);
    const R = { x: 26, y: 18 }; // wander radius from home
    let raf = 0; let alive = true;
    let pos = { x: 0, y: 0 }; let tilt = 0;
    const draw = (x, y, t) => { el.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) rotate(${t.toFixed(2)}deg)`; };
    const sleep = (ms) => new Promise((r) => { const t0 = performance.now(); const tick = (now) => { if (!alive) return; if (now - t0 >= ms) r(); else raf = requestAnimationFrame(tick); }; raf = requestAnimationFrame(tick); });
    const fly = (to) => new Promise((done) => {
      const from = { ...pos };
      const dx = to.x - from.x, dy = to.y - from.y; const dist = Math.hypot(dx, dy);
      const dur = 260 + dist * 9 + rnd() * 160; // Fitts-ish: farther takes longer
      const side = (rnd() < 0.5 ? -1 : 1) * (0.18 + rnd() * 0.22) * dist; // the arc's bulge
      const ctrl = { x: from.x + dx / 2 - dy / dist * side, y: from.y + dy / 2 + dx / dist * side };
      const over = 0.06 + rnd() * 0.08; // overshoot, as a share of the trip
      const t0 = performance.now();
      const step = (now) => {
        if (!alive) return;
        const u = Math.min(1, (now - t0) / dur);
        const e = 1 - Math.pow(1 - u, 3); // ease-out cubic
        const p = e * (1 + over) - (u > 0.7 ? (e - 1) * 0 : 0);
        const q = Math.min(p, 1 + over * (1 - Math.max(0, (u - 0.75) / 0.25))); // past the mark, then back
        const k = q; const k1 = 1 - k;
        const x = k1 * k1 * from.x + 2 * k1 * k * ctrl.x + k * k * to.x;
        const y = k1 * k1 * from.y + 2 * k1 * k * ctrl.y + k * k * to.y;
        const vx = 2 * k1 * (ctrl.x - from.x) + 2 * k * (to.x - ctrl.x);
        tilt = Math.max(-10, Math.min(10, vx * 0.12 * (1 - u)));
        pos = { x, y }; draw(x, y, tilt);
        if (u < 1) raf = requestAnimationFrame(step); else done();
      };
      raf = requestAnimationFrame(step);
    });
    const idle = (ms) => new Promise((done) => {
      const t0 = performance.now(); const base = { ...pos };
      const ax = 0.6 + rnd() * 1.2, ay = 0.4 + rnd() * 0.9, f = 0.6 + rnd() * 0.8;
      const step = (now) => {
        if (!alive) return;
        const t = (now - t0) / 1000;
        const x = base.x + Math.sin(t * f * 2.1) * ax, y = base.y + Math.cos(t * f * 1.7) * ay;
        pos = { x, y }; draw(x, y, tilt * Math.max(0, 1 - t));
        if (now - t0 < ms) raf = requestAnimationFrame(step); else done();
      };
      raf = requestAnimationFrame(step);
    });
    (async () => {
      await sleep(400 + rnd() * 1800);
      while (alive) {
        await fly({ x: (rnd() * 2 - 1) * R.x, y: (rnd() * 2 - 1) * R.y });
        if (rnd() < 0.35) await fly({ x: pos.x + (rnd() * 2 - 1) * 6, y: pos.y + (rnd() * 2 - 1) * 4 }); // a small correction
        await idle(700 + rnd() * 2200);
      }
    })();
    return () => { alive = false; cancelAnimationFrame(raf); };
  }, [ref, seed]);
}

function CursorTag({ tone, side, label, style, seed = 1 }) {
  const ref = useRef(null);
  useHumanCursor(ref, seed);
  return (
    <span className={`wg__cur wg__cur--${tone} wg__cur--${side}`} style={style} ref={ref} aria-hidden>
      <svg className="wg__cur-arrow" viewBox="0 0 16 16" width="15" height="15">
        <path d="M2 1.5 L2 14.2 L5.6 10.8 L8.1 15 L10.3 13.9 L7.9 9.8 L12.8 9.8 Z" />
      </svg>
      <span className="wg__cur-pill">{label}</span>
    </span>
  );
}

// The Away right phone's reveal, LOCKED TO THE LEFT PHONE'S CLIP (pin
// mtrwm6fu, "sync the reveal animation for both phones"). The CSS loop used to
// run on its own 5s clock while the clip looped on its own length at its own
// rate, so the two drifted. Now the reveal's duration is the clip's real loop
// (duration / playbackRate, read off the <video> once its metadata is in) and
// the animation restarts the moment the clip wraps (currentTime falls back),
// so the two phones start together every time. Reduced motion has no
// animation, so nothing to sync.
function AwayReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    const card = el?.closest(".wg__card");
    const video = card?.querySelector("video");
    if (!el || !video) return undefined;
    const imgs = [...el.querySelectorAll("img")];
    const setDur = () => {
      if (!Number.isFinite(video.duration) || !video.duration) return;
      el.style.setProperty("--reveal-dur", `${video.duration / (video.playbackRate || 1)}s`);
    };
    const restart = () => {
      imgs.forEach((i) => { i.style.animation = "none"; });
      void el.offsetWidth; // flush, so the re-set below is a fresh run
      imgs.forEach((i) => { i.style.animation = ""; });
    };
    let last = 0;
    const onTime = () => {
      if (video.currentTime < last - 0.4) restart();
      last = video.currentTime;
    };
    const onPlay = () => { setDur(); last = 0; restart(); };
    setDur();
    video.addEventListener("loadedmetadata", setDur);
    video.addEventListener("ratechange", setDur);
    video.addEventListener("play", onPlay);
    video.addEventListener("timeupdate", onTime);
    return () => {
      video.removeEventListener("loadedmetadata", setDur);
      video.removeEventListener("ratechange", setDur);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("timeupdate", onTime);
    };
  }, []);
  return (
    <span className="wg__reveal" ref={ref}>
      <img className="wg__reveal-top" src="/hello3/cards/away-screen-right.png" alt="" draggable="false" />
      <img className="wg__reveal-modal" src="/hello3/cards/away-screen-right.png" alt="" draggable="false" />
    </span>
  );
}

// THE SLOT TOUR on the Scheduled Delivery right phone (pin mtrwmle3, "play
// the slot animation on the right phone"): the case's "One scroll across
// midnight" figure (SchedPageReal), screens, taps, timings and pointer
// verbatim, minus its rail of notes. The stage is the figure's own 232 x 504
// screen space (the tap targets are in those units) zoomed to the phone's
// screen width, so nothing had to be re-measured.
const SLOT_SCREENS = [
  { key: "today", src: "/figures/scheduled/sched-today-all.png" },
  { key: "tmrMore", src: "/figures/scheduled/sched-tomorrow-more.png" },
  { key: "tmrAll", src: "/figures/scheduled/sched-tomorrow-all.png" },
];
// THE ACTUAL PROTOTYPE (pin mtrwwro0, "for the second phone bring the actual
// proto"): the same Figma embed the case's "Two screens, in motion" plate
// runs (file 71cZSn6pTNf4zFzO07O2uv, node 40000084-123917), the same URL
// shape as App.jsx's figmaEmbedUrl: scale to width, no footer, hints or
// viewport controls. It supersedes the SlotTour below, which stays for a
// swap back. The client-id (VITE_FIGMA_EMBED_CLIENT_ID) is optional, as in
// the case.
// eslint-disable-next-line no-unused-vars -- kept for the day the file is shared (PROTO_EMBED)
const PROTO_URL = `https://embed.figma.com/proto/71cZSn6pTNf4zFzO07O2uv?node-id=40000084-123917&embed-host=portfolio&scaling=scale-down-width&footer=false&hotspot-hints=false&viewport-controls=false${import.meta.env.VITE_FIGMA_EMBED_CLIENT_ID ? `&client-id=${import.meta.env.VITE_FIGMA_EMBED_CLIENT_ID}` : ""}`;
// mtrxq1us ("sometimes the second frame does not load"): two fixes. The
// iframe was loading="lazy" while positioned absolutely inside a cropped
// phone, which is exactly the case where a lazy iframe can sit unloaded;
// it is eager now. And the slot tour runs UNDERNEATH the iframe as the
// floor: the embed is transparent until Figma paints, so whatever happens on
// Figma's side (slow, offline, rate-limited) the phone shows the case's own
// screens rather than a blank, and once the prototype paints it covers them.
// mtu4sxky (09 Sep 2026), "I see a weird artifact, can we please remove it":
// the Figma file is not public, so for anyone who is not signed in (which is
// every visitor) the embed rendered its LOGIN WALL inside the phone - a white
// screen reading "Log in to Figma to view this". The iframe is off until the
// prototype is shared as Anyone with the link can view; the local slot tour,
// which was always running underneath it as the floor, is the screen now.
const PROTO_EMBED = false;
function ProtoScreen() {
  return (
    <span className="wg__proto">
      <SlotTour />
      {PROTO_EMBED && <iframe src={PROTO_URL} title="Scheduled Delivery prototype" loading="eager" allowFullScreen />}
    </span>
  );
}
const SLOT_TAB_TMR = { x: 162, y: 174 };
const SLOT_MORE = { x: 117, y: 424 };
// The slot tour: the ProtoScreen's floor (mtrxq1us), and the screen on its own
// if the prototype ever comes out again.
function SlotTour() {
  const reduce = useReducedMotion();
  const [beat, setBeat] = useState(reduce ? 2 : 0);
  const [touch, setTouch] = useState({ x: SLOT_TAB_TMR.x, y: SLOT_TAB_TMR.y + 70, visible: false, hover: false, press: false, n: 0 });
  const boxRef = useRef(null);
  const loopRef = useInViewLoop(!reduce, async ({ wait, alive }) => {
    const tapTo = async (target, onPress) => {
      setTouch((t) => ({ ...t, x: target.x, y: target.y + 70, visible: true, hover: false, press: false }));
      await wait(220); if (!alive()) return false;
      setTouch((t) => ({ ...t, x: target.x, y: target.y }));
      await wait(560); if (!alive()) return false;
      setTouch((t) => ({ ...t, hover: true }));
      await wait(420); if (!alive()) return false;
      setTouch((t) => ({ ...t, press: true, n: t.n + 1 }));
      await wait(200); if (!alive()) return false;
      onPress();
      setTouch((t) => ({ ...t, press: false }));
      await wait(360); if (!alive()) return false;
      setTouch((t) => ({ ...t, visible: false, hover: false }));
      return true;
    };
    while (alive()) {
      setBeat(0);
      setTouch({ x: SLOT_TAB_TMR.x, y: SLOT_TAB_TMR.y + 70, visible: false, hover: false, press: false, n: 0 });
      await wait(1800); if (!alive()) break;
      if (!(await tapTo(SLOT_TAB_TMR, () => setBeat(1)))) break;
      await wait(900); if (!alive()) break;
      if (!(await tapTo(SLOT_MORE, () => setBeat(2)))) break;
      await wait(1900); if (!alive()) break;
    }
  });
  // the 232-unit stage zooms to the screen's width
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const fit = () => el.style.setProperty("--z", String(el.clientWidth / 232));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <span className="wg__slots" ref={(n) => { boxRef.current = n; loopRef.current = n; }}>
      <span className="wg__slots-stage">
        {SLOT_SCREENS.map((sc, i) => (
          <img key={sc.key} className="wg__slots-img" src={sc.src} alt="" draggable="false" data-on={beat === i} />
        ))}
        <Cursor x={touch.x} y={touch.y} visible={touch.visible} hover={touch.hover} press={touch.press} clickN={touch.n} size={24} />
      </span>
    </span>
  );
}

export default function WorkGrid({ onNavigate }) {
  return (
    <section className="wg" aria-label="Selected work">
      <div className="wg__grid">
        {CARDS.filter((c) => !c.hidden).map((c, i) => (
          <HelloLink key={c.src} to={c.href} onNavigate={onNavigate} className={"wg__card" + (c.live ? " wg__card--live wg__card--" + c.live : "")} style={{ "--i": i }} aria-label={c.live ? c.alt : undefined}>
            {c.live === "caratlane" ? (
              <span className="wg__live" aria-hidden>
                <FigmaPhone plate="pro17" className="wg__phone" screen={<ClipVideo clip={CARAT_CLIP} playing />} alt="" />
              </span>
            ) : c.live === "sched" ? (
              <>
                <span className="wg__badge wg__badge--sd-bg" aria-hidden><img src="/hello3/cards/sd-bg.png" alt="" draggable="false" /></span>
                <span className="wg__live wg__live--over" aria-hidden>
                  <FigmaPhone
                    plate="pro17"
                    className="wg__phone wg__phone--sd-l"
                    screen={SCHED ? (
                      <>
                        <img className="wg__still" src={SCHED.screen} alt="" draggable="false" />
                        <ClipVideo clip={{ ...SCHED.clip, loop: true }} playing />
                      </>
                    ) : "/figures/scheduled/schedule-page-ui.png"}
                    alt=""
                  />
                  <FigmaPhone plate="pro17" className="wg__phone wg__phone--sd-r" screen={<ProtoScreen />} alt="" />
                </span>
              </>
            ) : c.live === "away" ? (
              <>
                <span className="wg__badge wg__badge--away-logo" aria-hidden><img src="/hello3/cards/away-logo.png" alt="" draggable="false" /></span>
                <span className="wg__live wg__live--over" aria-hidden>
                  <FigmaPhone plate="pro17" className="wg__phone wg__phone--away-l" screen={<ClipVideo clip={AWAY_CLIP} playing />} alt="" />
                  {/* mtrw7zcv "do a reveal animation for the right frame as
                      well": two clipped copies of the same screen, the region
                      above the search modal (0 to 30.5%, the frame's own split
                      at y 105.3 of 344.8) fading up first, then the modal
                      rising into place; a 5s loop in CSS (.wg__reveal). */}
                  <FigmaPhone
                    plate="pro17"
                    className="wg__phone wg__phone--away-r"
                    screen={<AwayReveal />}
                    alt=""
                  />
                </span>
              </>
            ) : c.live === "toppr" ? (
              <>
                {/* mtr955dv "I see double phone frames": the export's own phone
                    showed around the live plate, so the export is gone. The
                    card is its gradient (CSS) plus the three badge groups
                    exported on their own (643:99563 / 99569 / 99575, at their
                    frame offsets), and the live phone. */}
                {/* mtrcyd2p "build this on the website and bring them to life
                    how a cursor behaves": the three badges are now real
                    elements, a cursor arrow and a name pill each (Figma
                    643:99563 / 99569 / 99575: pill 30 tall, 12px Helvetica
                    Neue, 1.28 stroke, the arrow 14.5 with a white hairline),
                    and each one wanders its own short path in bursts with
                    holds, the way a live cursor does. The PNG exports stay in
                    public/hello3/cards as the record of the frame. */}
                <CursorTag tone="coral" side="left" seed={3} style={{ "--x": "70.27%", "--y": "34.03%" }} label="Let’s implement it" />
                <CursorTag tone="green" side="left" seed={7} style={{ "--x": "71.62%", "--y": "52.08%" }} label="Cool Stuff!" />
                <CursorTag tone="yellow" side="right" seed={11} style={{ "--x": "12.31%", "--y": "39.12%" }} label="Looks Sick!" />
                <span className="wg__live wg__live--over" aria-hidden>
                  <FigmaPhone
                    plate="pro17"
                    className="wg__phone wg__phone--toppr"
                    screen={TOPPR_SCROLL ? (
                      <>
                        <img className="wg__still" src={TOPPR_SCROLL.base} alt="" draggable="false" />
                        <ScrollBand scroll={TOPPR_SCROLL} reduce={false} playing />
                      </>
                    ) : undefined}
                    alt=""
                  />
                </span>
              </>
            ) : (
              <img src={c.src} alt={c.alt} width="666" height="432" loading="lazy" draggable="false" />
            )}
          </HelloLink>
        ))}
      </div>
    </section>
  );
}
