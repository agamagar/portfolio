import { useEffect, useRef, useState } from "react";
import Cursor from "../figures/ds/Cursor";
import { useInViewLoop, useReducedMotion } from "../figures/ds/hooks";
import HelloLink from "./HelloLink";
import LockedLink from "./LockedLink";
import NewTag from "./NewTag";
import { LOCKED, NEW, newestFirst } from "./workMeta";
import useLinkedSpotlight from "./useLinkedSpotlight";
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
// moving them"): a hand picks a target and moves fast then slows (Fitts), on
// a slight ARC rather than a line, OVERSHOOTS a little and settles, and never
// quite holds still at rest; the arrow tilts into the direction of travel.
// A STORY (mv3mdlaf, 11 Oct 2026: "make the cursors more dynamic, popping into
// the frame; they move erratically first, then the bubble pops with the text
// and they start moving a little slower; stitch it into a story"). One script
// drives all three, looping:
//   1 ARRIVE   each cursor pops in from outside the frame (coral from the
//              right, yellow from the left, green from below), 380ms apart,
//              scaling up on a spring as it lands
//   2 SCRAMBLE quick, wide, jittery darts with barely a pause: three people
//              arriving in a file, looking around
//   3 SPEAK    one at a time (coral proposes "Let's implement it", yellow and
//              green answer) each settles near its spot, its bubble springs
//              out of the arrow and the arrow gives a small bump
//   4 CALM     having spoken, it drifts: slow, short, soft moves, long rests
//   5 LEAVE    the bubbles fold, the cursors slip out of the frame, a beat of
//              empty card, and it begins again
// THE PHONE JOINS IT (mv3t0j1r, 11 Oct 2026: "just like the cursors, the phone
// also comes in from the bottom, and then to complete the loop it all goes
// away"). The phone layer is on the same clock: it rises from below the
// card's bottom edge on a smooth ease-out (no overshoot, mv3yf1yx) and the cursors start arriving PHONE_LEAD into that rise; at LEAVE
// it slides back down with them on an ease-in, so the card empties as one.
// Transform only (translateY on .wg__live--over), nothing that lays out.
// All timing runs on requestAnimationFrame, so a hidden tab freezes it; off
// screen the script stops and resets (IntersectionObserver), and starts from
// ARRIVE when the card comes back. Reduced motion: the end state, each cursor
// at its spot with its bubble out, still.
const STORY = [
  { tone: "coral", side: "left", label: "Let’s implement it", x: "70.27%", y: "34.03%", from: "right", says: 2300 },
  { tone: "yellow", side: "right", label: "Looks Sick!", x: "12.31%", y: "39.12%", from: "left", says: 3300 },
  { tone: "green", side: "left", label: "Cool Stuff!", x: "71.62%", y: "52.08%", from: "bottom", says: 4100 },
];
const STORY_END = 10600; // the cursors leave here (ms from the loop's start)
const STAGGER = 380;
const PHONE_LEAD = 650; // the phone is mostly up before the first cursor pops in

// one cursor's body: position, tilt and scale, drawn as a single transform
function cursorActor(el, rnd, isAlive) {
  const st = { x: 0, y: 0, tilt: 0, s: 1 };
  const draw = () => { el.style.transform = `translate(${st.x.toFixed(2)}px, ${st.y.toFixed(2)}px) rotate(${st.tilt.toFixed(2)}deg) scale(${st.s.toFixed(3)})`; };
  const frames = (ms, fn) => new Promise((done) => {
    const t0 = performance.now();
    const step = (now) => {
      if (!isAlive()) return;
      const u = Math.min(1, (now - t0) / ms);
      fn(u, now - t0); draw();
      if (u < 1) requestAnimationFrame(step); else done();
    };
    requestAnimationFrame(step);
  });
  // an underdamped spring from `from` to 1: the pop on arrival and the bump
  // when the bubble comes out
  const spring = (from, ms = 520) => frames(ms, (u, t) => { st.s = 1 - (1 - from) * Math.exp(-t / 95) * Math.cos(t / 48); if (u === 1) st.s = 1; });
  // a flight on a quadratic bezier, the control point pushed sideways at
  // random; `back` is the overshoot (0 = none, the calm moves), `ease` "in" for
  // leaving the frame
  const fly = (to, { dur, back = 0.9, bulge = 0.3, ease = "out" }) => {
    const from = { x: st.x, y: st.y };
    const dx = to.x - from.x, dy = to.y - from.y; const dist = Math.hypot(dx, dy) || 1;
    const side = (rnd() < 0.5 ? -1 : 1) * (bulge * (0.5 + rnd() * 0.5)) * dist;
    const c = { x: from.x + dx / 2 - (dy / dist) * side, y: from.y + dy / 2 + (dx / dist) * side };
    let px = from.x;
    return frames(dur, (u) => {
      const v = u - 1;
      const k = ease === "in" ? u * u * u : 1 + (back + 1) * v * v * v + back * v * v; // ease-out-back
      const k1 = 1 - k;
      st.x = k1 * k1 * from.x + 2 * k1 * k * c.x + k * k * to.x;
      st.y = k1 * k1 * from.y + 2 * k1 * k * c.y + k * k * to.y;
      st.tilt = Math.max(-12, Math.min(12, (st.x - px) * 1.1)) * (1 - u * 0.6);
      px = st.x;
    });
  };
  // at rest a hand still breathes: a small lissajous drift, tilt fading out
  const idle = (ms, amp = 1) => {
    const base = { x: st.x, y: st.y }; const t0 = st.tilt;
    const f = 0.6 + rnd() * 0.8, ax = (0.6 + rnd() * 1.2) * amp, ay = (0.4 + rnd() * 0.9) * amp;
    return frames(ms, (u, t) => {
      st.x = base.x + Math.sin((t / 1000) * f * 2.1) * ax;
      st.y = base.y + (Math.cos((t / 1000) * f * 1.7) - 1) * ay;
      st.tilt = t0 * Math.max(0, 1 - t / 400);
    });
  };
  const place = (x, y, s = 1) => { Object.assign(st, { x, y, s, tilt: 0 }); draw(); };
  return { st, fly, idle, spring, place };
}

function CursorStory() {
  const reduce = useReducedMotion();
  const refs = useRef([]);
  useEffect(() => {
    const els = refs.current;
    const card = els[0]?.closest(".wg__card");
    if (reduce || !card || els.some((e) => !e)) return undefined;
    let seedState = 7;
    const rnd = () => ((seedState = (seedState * 9301 + 49297) % 233280) / 233280);
    let run = 0; // bumps on every stop, so a stale script dies
    // the point just outside the frame on the cursor's entry side, in its own
    // translate space (its home is 0,0)
    const outside = (el, from) => {
      const W = card.clientWidth, H = card.clientHeight, m = 18;
      if (from === "left") return { x: -(el.offsetLeft + el.offsetWidth + m), y: 20 };
      if (from === "right") return { x: W - el.offsetLeft + m, y: -24 };
      return { x: -30, y: H - el.offsetTop + m };
    };
    // mv3owgcx ("I don't see the cursors"): the resting state used to be
    // OFF-FRAME, set synchronously, with the story's first frame bringing them
    // in. Anything that holds requestAnimationFrame back left the card empty
    // for good, and Agentation does exactly that: its "freeze animations"
    // queues every rAF and timeout while Agam is annotating. So the rest
    // state is now the end state (home, bubbles out), the story hides them
    // only inside its own first frame, and a freeze puts them back at rest.
    const phone = card.querySelector(".wg__live--over");
    const rest = () => {
      els.forEach((el) => {
        el.setAttribute("data-said", "");
        el.style.transform = "";
      });
      if (phone) phone.style.transform = "";
    };
    // the phone's own tween, on rAF like the cursors (so a freeze holds it too)
    const tween = (ms, fn, alive) => new Promise((done) => {
      const s0 = performance.now();
      const step = (now) => {
        if (!alive()) return;
        const t = Math.min(ms, now - s0); fn(t / ms, t);
        if (t < ms) requestAnimationFrame(step); else done();
      };
      requestAnimationFrame(step);
    });
    const phoneTo = (y) => { if (phone) phone.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`; };
    rest();
    const story = async (id) => {
      const alive = () => run === id;
      await new Promise((r) => requestAnimationFrame(r)); if (!alive()) return;
      const pause = (a, ms) => a.idle(ms, 0.4);
      const t0 = performance.now() + PHONE_LEAD; // the cursors' clock starts once the phone is mostly up
      const at = (ms) => t0 + ms;
      const below = card.clientHeight + 8;
      // 0 RISE: from below the bottom edge, an underdamped spring into place;
      // then hold until LEAVE and slide back down with the cursors
      const phoneRun = phone ? (async () => {
        phoneTo(below);
        await tween(1000, (u) => phoneTo(below * Math.pow(1 - u, 4)), alive); // ease-out quart: decelerates into rest, no overshoot (mv3yf1yx) if (!alive()) return;
        phoneTo(0); phone.style.transform = "";
        while (alive() && performance.now() < at(STORY_END + 120)) await tween(120, () => {}, alive);
        if (!alive()) return;
        await tween(640, (u) => phoneTo(below * u * u * u), alive);
      })() : Promise.resolve();
      const actors = els.map((el) => cursorActor(el, rnd, alive));
      await Promise.all(actors.map(async (a, i) => {
        const el = els[i]; const beat = STORY[i];
        const o = outside(el, beat.from);
        el.removeAttribute("data-said");
        a.place(o.x, o.y, 0.55);
        await pause(a, PHONE_LEAD + i * STAGGER); if (!alive()) return;
        // 1 ARRIVE: in fast, past the mark, the spring pop as it lands
        const land = { x: (rnd() * 2 - 1) * 30, y: (rnd() * 2 - 1) * 20 };
        a.spring(0.55, 620);
        await a.fly(land, { dur: 420 + rnd() * 120, back: 1.4, bulge: 0.18 }); if (!alive()) return;
        // 2 SCRAMBLE: quick wide darts until it is this one's turn to speak
        while (alive() && performance.now() < at(beat.says - 380)) {
          await a.fly({ x: (rnd() * 2 - 1) * 46, y: (rnd() * 2 - 1) * 30 }, { dur: 140 + rnd() * 140, back: 1.1, bulge: 0.45 });
          if (rnd() < 0.4) await a.fly({ x: a.st.x + (rnd() * 2 - 1) * 9, y: a.st.y + (rnd() * 2 - 1) * 7 }, { dur: 90, back: 0.4 });
          await pause(a, rnd() * 140);
        }
        if (!alive()) return;
        // 3 SPEAK: settle by the spot, the bubble springs out, the arrow bumps
        await a.fly({ x: (rnd() * 2 - 1) * 6, y: (rnd() * 2 - 1) * 4 }, { dur: 380, back: 0.8, bulge: 0.2 }); if (!alive()) return;
        el.setAttribute("data-said", "");
        a.spring(0.86, 560);
        await pause(a, 700 + rnd() * 300); if (!alive()) return;
        // 4 CALM: slow, short, soft, with long rests
        while (alive() && performance.now() < at(STORY_END - 1500)) {
          await a.fly({ x: (rnd() * 2 - 1) * 16, y: (rnd() * 2 - 1) * 10 }, { dur: 1100 + rnd() * 600, back: 0, bulge: 0.25 });
          await a.idle(700 + rnd() * 1100);
        }
        while (alive() && performance.now() < at(STORY_END + i * 160)) await a.idle(60);
        if (!alive()) return;
        // 5 LEAVE: the bubble folds, then out of the frame
        el.removeAttribute("data-said");
        await pause(a, 260); if (!alive()) return;
        await a.fly(outside(el, beat.from), { dur: 520, ease: "in", bulge: 0.15 });
      }).concat(phoneRun));
      if (!alive()) return;
      await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 900)));
      if (alive()) story(id);
    };
    let inView = false;
    // Agentation's freeze state (window.__agentation_freeze). The toolbar can
    // load after this mounts, so it is read on every tick, not once.
    const isFrozen = () => !!window.__agentation_freeze?.frozen;
    let frozen = isFrozen();
    const restart = () => { run += 1; rest(); if (inView && !frozen) story(run); };
    const io = new IntersectionObserver(([e]) => { inView = e.isIntersecting; restart(); }, { threshold: 0.35 });
    io.observe(card);
    // Agentation mutes the page's setInterval while frozen, so the watch runs
    // on the original timer: the one it keeps, or, if it has not loaded yet,
    // the native one as it is now (before any patch)
    const tick = window.__agentation_freeze?.origSetInterval || window.setInterval.bind(window);
    const poll = tick(() => { if (isFrozen() !== frozen) { frozen = isFrozen(); restart(); } }, 250);
    return () => { run += 1; io.disconnect(); clearInterval(poll); };
  }, [reduce]);
  return STORY.map((b, i) => (
    <span
      key={b.tone}
      className={`wg__cur wg__cur--${b.tone} wg__cur--${b.side}`}
      style={{ "--x": b.x, "--y": b.y }}
      ref={(n) => { refs.current[i] = n; }}
      data-said={reduce ? "" : undefined}
      aria-hidden
    >
      <svg className="wg__cur-arrow" viewBox="0 0 16 16" width="15" height="15">
        <path d="M2 1.5 L2 14.2 L5.6 10.8 L8.1 15 L10.3 13.9 L7.9 9.8 L12.8 9.8 Z" />
      </svg>
      <span className="wg__cur-pill">{b.label}</span>
    </span>
  ));
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
  const sectionRef = useRef(null);
  useLinkedSpotlight(sectionRef); // mv3mbvr7: the cards and the timeline rows dim together
  return (
    <section className="wg" aria-label="Selected work" ref={sectionRef}>
      <div className="wg__grid">
        {newestFirst(CARDS.filter((c) => !c.hidden)).map((c, i) => { // mv58rul2: same newest-first order as the timeline
          const Card = LOCKED.has(c.href) ? LockedLink : HelloLink;
          return (
          <Card key={c.src} {...(LOCKED.has(c.href) ? { tip: "top" } : { to: c.href, onNavigate })} className={"wg__card" + (c.live ? " wg__card--live wg__card--" + c.live : "")} style={{ "--i": i }} data-project={c.href} aria-label={c.live ? (NEW.has(c.href) ? `${c.alt} (New)` : c.alt) : undefined}>
            {NEW.has(c.href) && <NewTag corner />}
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
                <CursorStory />
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
          </Card>
          );
        })}
      </div>
    </section>
  );
}
