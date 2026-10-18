// "Along a path" — a new section built on <PathMarquee>.
//
// The section exists to be PLAYED WITH, not just looked at: the controls under
// the run change the path and its properties live. That is the whole point of
// writing our own instead of dropping the sample in — the sample hardcodes one
// curve and one speed, and this treats both as data.
//
// The images are real work, not stock. Per the strategy doc section 5, card and
// section art is "real product UI at recognizable fidelity", never decorative
// filler, and everything here is licensed because it is Agam's own.

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { lockBackgroundScroll } from "../ui/smoothScroll";
// mttx7x50 follow-up ("icons still look off"): the rings and the cinema close
// used Phosphor bold glyphs, the one family the site does not draw with
// anywhere except the top chip row; Iconoir at 16 / stroke 2 is the house set.
import { Xmark } from "iconoir-react";
import PathMarquee from "./PathMarquee";
import { MATERIAL_SHAPES } from "./materialShapes";
import { PATH_PRESETS, PATH_KEYS } from "./pathPresets";

// PURPOSE-BUILT DERIVATIVES, not the case-study originals. The originals run
// 720x1582 to 1080x2487 and are drawn here at about 110x148, a 16x downscale,
// and the marquee changes their scale as they travel — so every frame was
// asking the compositor to re-rasterise 11.8 megapixels of source into
// thumbnails. That, not the maths, was where the frame drops came from.
// /figures/marquee/* are the same images at 300px wide: 1.5MP total, 1.2MB down
// to 364KB. The originals are untouched, because the case studies still need
// them at full size.
const PLATES = [
  // The one moving card (annotation msd34k8a). Its own aspect, NOT the 3/4 the
  // stills use: the clip is a 500x394 landscape title card and "GET AWAY" runs
  // nearly its full width, so `cover`-cropping it into a portrait slot would
  // slice the words off both ends. Same card WIDTH as its neighbours, so the run
  // still reads as one row of objects rather than one odd size.
  // cap: the caption under the card while it rests on the centre (muksv25q), a
  // YouTube-style title and meta line with one or two metrics. Every metric is the
  // project's own attested outcome from helloData TIMELINE, nothing new
  { video: "/figures/marquee/away-60.mp4", poster: "/figures/marquee/away-poster.png", alt: "Away: get away", aspect: "500 / 394", cap: { line: "Away: AI travel agent, raised $1M in six months", title: "An agent that never takes the wheel", year: 2026, type: "Video", role: "Led interaction design", text: "Away, an AI travel agent. Raised $1M in six months." /* mv3wg2a3-63132l: the fact as Agam gave it, nothing added */, metric: "V1 live", cta: { label: "Read the case study", to: "/work/away-agent" } } },
  // OdinEye. Transcoded on the way in: the source was HEVC, which Chrome will
  // not play, and 3600x2012 / 3.9MB for a card that renders ~135px wide.
  // Now H.264 yuv420p at 800px, 75KB.
  { video: "/figures/marquee/odineye-60.mp4", audio: "/figures/marquee/odineye-groove.m4a", audioAlt: "/figures/marquee/odineye-groove.mp3", poster: "/figures/marquee/odineye-poster.png", alt: "OdinEye", aspect: "800 / 448", cap: { line: "ZepIris: Zepto’s open-source face authentication for frontline teams", title: "Zepto’s first open-source platform", year: 2026, type: "Video", role: "Led design end to end", text: "ZepIris, Zepto’s in-house face authentication for frontline teams, open-sourced to create pre-IPO buzz.", metric: "100% hub coverage", cta: { label: "Read the case study", to: "/work/zepiris" } } },
  // mtrx14ur (08 Sep 2026): the slot-picker still is now a YouTube embed,
  // https://www.youtube.com/watch?v=tatZlX0d4do, playing muted on loop in
  // the card (the run is a marquee, so it autoplays like the video plates and
  // takes no pointer). 16:9, so the card is wider than the phone stills.
  // 09 Sep 2026 (Agam's screenshot, the YouTube chrome on the card): the
  // walkthrough is served as a LOCAL plate now, like OdinEye: the video
  // (his own, "Follow that idea", youtube tatZlX0d4do) pulled at 720p and
  // transcoded to an 800px silent H.264 (739KB, 41.8s) with a poster, so it
  // plays like every other video plate, no player, no overlays, no iframe.
  // The `embed` kind stays in the renderer for another day.
  { video: "/figures/marquee/follow-that-idea-60.mp4", full: "/figures/marquee/follow-that-idea-full.mp4", poster: "/figures/marquee/follow-that-idea-poster.png", alt: "Follow that idea, a hand-drawn animation", aspect: "16 / 9", dwell: true,
    // mv3wfbqy-7nm83h (11 Oct 2026): the clip is a HAND-DRAWN ANIMATION (a
    // lightbulb, the title "Follow that idea", ending on an "Uncollab"
    // wordmark), not a Scheduled Delivery walkthrough. The old line, the link
    // to /work/scheduled-delivery and the Zepto / 2025 / AOV facts were
    // assumptions, and nothing in the repo ties the video to that case study.
    // The caption says only what the clip shows; no link until Agam names the
    // project and the page.
    // destination (11 Oct 2026, "add it to all cards"): the video's own YouTube page.
    // The id comes from this file's own earlier note on the plate; YouTube's
    // oEmbed confirms it is "Follow that idea" by Agam Agarwal.
    cap: { line: "Follow that idea: a hand-drawn animation ending on Uncollab", title: "Follow that idea", type: "Animation", cta: { label: "Watch on YouTube", to: "https://www.youtube.com/watch?v=tatZlX0d4do" } } },
  // 17 Oct 2026, Agam: "add this to the side quest flow". The Config India 2026
  // recap video (1200x1200, 26 s, AAC). Same pattern as the hand-drawn clip: a silent
  // 640px loop for the card, the full 1200px file (with its audio) for the sound
  // and the cinema. Caption carries only the title; nothing else is known.
  { video: "/figures/marquee/config-india-60.mp4", full: "/figures/marquee/config-india-full.mp4", poster: "/figures/marquee/config-india-poster.png", alt: "Config India 2026 recap", aspect: "1 / 1", dwell: true,
    // the X notification under the caption (17 Oct 2026): Dylan Field liking the post, cropped
    // from the screenshot, 920 px wide for a 300 px chip. Text is whatever the crop shows.
    cap: { line: "Config India 2026 recap", title: "Config India 2026 recap", type: "Video", chip: { src: "/figures/marquee/config-india-dylan-like.webp", alt: "Dylan Field liked your post: @zoink thanks for hosting!", w: 920, h: 241 } } },
  { src: "/figures/marquee/state-3.png", alt: "Away: deep search running", hidden: true }, // mtrx258e (08 Sep 2026): hidden, kept
  { src: "/figures/marquee/dassh-stella-system.png", alt: "Dassh: Stella, constructed", aspect: "1478 / 1080", hidden: true }, // mtrx1xxd: hidden, kept
  { src: "/figures/marquee/sched-cart-confirmed.png", alt: "Zepto: cart, slot confirmed", hidden: true }, // mtrx44o3: hidden, kept
  { src: "/figures/marquee/away-landing.jpg", alt: "Away: the search screen", focus: undefined, // mv3wgcx4-i8bwbj (11 Oct 2026): replaces night-ui.jpg ("use some other image"): Away's landing screen, search box and the upload-a-screenshot card, cropped 4:3 from public/figures/awayLanding-screen.png (1080 px wide, so 960 px here is above the ~600 px the centre card needs at 2x)
    cap: { line: "Away’s search: find a city, or upload a flight screenshot", title: "Away search", year: 2026, type: "Screen", role: "Led interaction design", text: "Away’s landing screen: a search box and an upload-a-screenshot card.", metric: "V1 live", cta: { label: "Read the case study", to: "/work/away-agent" } } },
  { src: "/figures/marquee/market-street.jpg", alt: "Zepto: market street", cap: { line: "A market street in tilt-shift, with Zepto riders", title: "Market street", type: "Image", cta: { label: "Read the case study", to: "/work/jarvis" } /* the same picture (SSIM 0.97) is in the Jarvis / Edge case study's gallery */, text: "A market street in tilt-shift, with Zepto riders on their rounds." } }, // year, role, metric, page: unknown, awaiting Agam; text describes the picture only
];

const SPEEDS = [
  { label: "Slow", value: 3 },
  { label: "Steady", value: 7 },
  { label: "Quick", value: 14 },
];

// Depth is the knob with the most range in it, so it gets real options rather
// than an on/off. Each is a different theory of how distance reads:
//   Flat        nothing recedes; the path is a track, not a space
//   Size        near things are bigger. The default, and the cheapest.
//   Air         size PLUS aerial perspective — far things pale out
//   Air + haze  adds blur. Honest about the cost: a filter repaints.
const DEPTHS = {
  flat: { label: "Flat", scaleRange: undefined, depthFade: undefined, depthBlur: 0 },
  size: { label: "Size", scaleRange: [0.82, 1.14], depthFade: undefined, depthBlur: 0 },
  air: { label: "Air", scaleRange: [0.8, 1.16], depthFade: [0.55, 1], depthBlur: 0 },
  haze: { label: "Air + haze", scaleRange: [0.8, 1.16], depthFade: [0.55, 1], depthBlur: 2.5 },
};

const DENSITIES = [
  { label: "Sparse", value: 1 },
  { label: "Full", value: 2 },
  { label: "Packed", value: 3 },
];

// Scaled up one step across the board (annotation msd6wqg9, "make these
// bigger"): the old L (124) is the new M, and L goes to 172. The DEFAULT moves
// with it, since L was already selected — bumping the ladder without moving the
// default would have changed nothing on the page.
const SIZES = [
  { label: "S", value: 92 },
  { label: "M", value: 124 },
  { label: "L", value: 172 },
];

// Spacing only goes DOWN from "Even", and that is not an oversight: at Even the
// cards already occupy the whole path, so it is the most air they can have at a
// given count. More air than that means fewer cards, which is what Density is
// for. This knob adds the other direction — deliberately bunching them.
// "Airy" goes past Even, which needs more path than exists — so it buys the
// extra gap by dropping the cards that would have wrapped past the end (see
// `shown` in PathMarquee). Fewer cards, further apart, same curve.
const SPREADS = [
  { label: "Tight", value: 0.55 },
  { label: "Close", value: 0.78 },
  { label: "Even", value: 1 },
  { label: "Airy", value: 1.4 },
];

// mtqsnan8: two modes on the section. Mode 1 is the run as it is; mode 2 shows
// whatever the page hands in as `modeTwo` (mtqsskme: the timeline).
// The timeline's design width: .tlx's max-width. Mode 2 lays out at exactly
// this and scales the result (see measure()).
const MODE2_W = 1200;

// THE DWELL PLAYER (pins mttisr5t + mttiyvmv, 09 Sep 2026). The video card
// carries two dwell rings at its corner, the phone row's own ring (hello.css
// .hm__ring, hm-dwell over --hm-hold): one for expanding, one for sound.
// Hover the card and both fill together over three seconds; when they are
// full the card opens as a cinema: a fixed overlay with the full 720p file
// (this one has its audio track, the plate's 800px file is silent), native
// controls for the scrubber, picking up from the plate's current time. The
// run behind is paused by the same hover it always had; closing the cinema
// (Escape, the X, the backdrop) hands back to the plate, which never stopped,
// and the run ramps up from the leave. Sound: the browser may refuse audio
// without a click (a hover is not a gesture), in which case the cinema opens
// muted with the controls showing, one click from sound.
// mtu58yp5 (09 Sep 2026): "remove the auto loaders". The two dwell rings and
// the three-second hold that opened the cinema on its own are gone, along with
// the armed state they reported. A click still opens it, which was always the
// faster path, and the card no longer decides anything for the reader.
// The caption under a card resting on the run's centre (muksv25q): a slot holds the
// card and its caption, because the card clips its own contents (overflow hidden).
// The caption is hidden until PathMarquee marks the item data-focus (hello3.css).
// ONE AREA FOR EVERY CARD (11 Oct 2026, Agam: "all the cards should roughly be
// the same size and expand to the same size, calculated by area"). hello.css
// .ap__card is width: calc(--ap-opt * 100%) of its cell, so a card of aspect a
// encloses opt^2 / a cells squared; opt = sqrt(a / REF) gives every aspect the
// same area (the mskhlfr7 rule, which this page had overridden with a per-card
// `big`). REF is the WIDEST visible plate, not the 3/4 portrait hello.css
// assumes: these plates are all landscape, and measured against a portrait
// the 16:9 cards came out 1.54 cells wide and two of them side by side
// overlapped by 56px. (Superseded below: every card is 4:3 now.)
// EVERY CARD SQUARE (17 Oct 2026, Agam: "make all cards square"): 1:1 at the same area the
// 4:3 boxes had (side = sqrt(3/4) of the cell), media cover-cropped from the centre.
// (Was: EVERY CARD 4:3, 11 Oct 2026, Agam: "in the shapes Rectangle mode, make all
// of them 4:3"), replacing the equal-area-by-own-aspect rule above: one box
// for every plate, the full cell wide (Size = the cell = the card's width, so
// 240 -> 240 x 180 in the run's units), media cropped to cover from the centre
// (hello3.css). Equal area falls out of equal boxes. A SHAPED card is square at
// that same area, so REF_ASPECT is 4:3 and its side is sqrt(3/4) of the cell.
const REF_ASPECT = 4 / 3;
function cardStyle() {
  return { aspectRatio: "1 / 1", "--ap-opt": "var(--ap-opt-square, 0.8660)" };
}

// The app's router is App.jsx's pushState + popstate listener; AlongPath is
// not handed onNavigate, so it drives the same two calls directly.
function go(to) {
  // App's router runs the project transition when it hears this (project-transition, 11 Oct)
  if (!window.dispatchEvent(new CustomEvent("app:navigate", { detail: to, cancelable: true }))) return;
  window.history.pushState({}, "", to);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo({ top: 0 });
}
// 11 Oct 2026, Agam: "the text should be centered within its own div as well"
// and "the bottom most element shouldn't be a tag, rather a larger button".
// The metrics read as one plain line now, and the caption ends on a real
// button where the card has somewhere to go (cards without a page get none
// rather than a dead control). The caption is no longer aria-hidden, since it
// holds a control; it is visibility-hidden until its card rests on the centre
// (hello3.css), which also keeps the button out of the tab order meanwhile.
// THE WALL LABEL, ONE TEMPLATE FOR EVERY CARD (11 Oct 2026, Agam: "standardise
// the text on all cards, it's all over the place", on top of mv3q1yei's gallery
// label). Every card's `cap` has the same shape: { title, year, type, role,
// text, metric, cta }, and this one component renders it in one order: title,
// the meta line (year · type · role), a hairline, the description, the metric,
// the button. Every slot is always rendered and has a fixed height
// (hello3.css): the title one line, the description three, the metric one, the
// button its 44px. A card missing a field keeps the same rhythm instead of
// collapsing, so the button sits at the same distance under every card.
function WallLabel({ cap }) {
  // ONE LINE (11 Oct 2026, Agam: "on each card when they snap, I just want a
  // simple text in our design system serif font, and write a short 7-9 word
  // explanation for the card, with a redirection arrow like the Resume one").
  // The line is set in Newsreader, the site's serif (the section headings and
  // the case studies). Where the card has a page the WHOLE line is the link,
  // wearing the hero Resume link's own classes (blue, the north-east arrow
  // that leans out on hover) rather than a copy of them. Title, year, type,
  // role, description and metric stay in the data; the facts reach screen
  // readers as the caption's description.
  const facts = [cap.title, [cap.year, cap.type, cap.role].filter(Boolean).join(" · "), cap.text, cap.metric].filter(Boolean).join(". ");
  const text = cap.line || cap.title;
  const external = /^https?:\/\//.test(cap.cta?.to || "");
  // EACH WORD IS ITS OWN UNIT (12 Oct 2026, mv4z5kxr-8bhgms: "animate this text
  // as well along when it comes in"): while the run's loop is on, AlongPath writes
  // --cap-p (0..1) on the slot from the SAME nearness that drives the card's
  // landing, and every word rises and fades with a short stagger (--i), the
  // arrow last. The last word and the arrow stay one nowrap unit so the arrow
  // can never wrap onto a line of its own.
  const words = text.split(" ");
  const last = words.pop();
  const n = words.length + 1; // index of the arrow
  const w = (t, i) => (
    <span className="ap__cap-w" style={{ "--i": i }}>{t}</span>
  );
  const body = (
    <>
      {words.map((t, i) => (
        <span key={i}>{w(t, i)} </span>
      ))}
      <span className="ap__cap-tail">
        {w(last, words.length)}
        {cap.cta && (
          <svg className="hello-hero__link-ne ap__cap-arrow" style={{ "--i": n }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M7 17 17 7" /><path d="M8 7h9v9" />
          </svg>
        )}
      </span>
    </>
  );
  return (
    <div className="ap__cap" style={{ "--cap-k": 1 + 0.1 * n }} aria-description={facts || undefined}>
      {/* mvdqolwe (Agam): the notification chip sits ABOVE the caption text */}
      {cap.chip && <img className="ap__cap-chip" src={cap.chip.src} alt={cap.chip.alt} width={cap.chip.w} height={cap.chip.h} loading="lazy" decoding="async" />}
      {cap.cta ? (
        <a
          className="ap__cap-line ap__cap-link hello-hero__link--out"
          href={cap.cta.to}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          // the run is a drag surface that captures the pointer on
          // pointerdown, which would steal this click
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            if (external || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
            e.preventDefault();
            go(cap.cta.to);
          }}
        >
          {body}
        </a>
      ) : (
        <p className="ap__cap-line">{body}</p>
      )}
    </div>
  );
}

function withCap(p, card) {
  return (
    <div className="ap__slot" key={p.video || p.src || p.embed}>
      {card}
      {p.cap && <WallLabel cap={p.cap} />}
    </div>
  );
}

function DwellVideo({ plate, onOpen }) {
  const ref = useRef(null);
  return (
    <article
      className="ap__card ap__card--dwell"
      style={cardStyle(plate)}
      onClick={(e) => onOpen(e.currentTarget)}
      // 11 Oct 2026 (QA): the cinema only opened on a click, so keyboard
      // users could not reach it at all
      role="button"
      tabIndex={0}
      aria-label={`Play ${plate.alt}`}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(e.currentTarget); } }}
    >
      <video ref={ref} className="ap__plate" src={plate.video} poster={plate.poster} muted loop playsInline autoPlay preload="metadata" aria-label={plate.alt} data-audio-src={plate.audio || plate.full || undefined} data-audio-alt={plate.audioAlt || undefined} />
      {/* 17 Oct 2026 (mvcd1px4, "remove audio control from inside this card"): no speaker
          icon or sound pill inside the card. Audio still follows in view + centred with
          the fade (audioSync); the site's sound toggle and the section's sound button
          stay outside the card. */}
    </article>
  );
}
// THE POSTER (12 Oct 2026, mv583b24-dat00t: "when I click any of the cards, not
// just the video, I should be able to expand it to a full view, with the title
// coming in a bigger font, like a poster"). It replaces the old video-only
// cinema. The card's picture grows from where it sits in the run (a FLIP: the
// final layout is measured, then the picture is animated from the card's
// rectangle to it), the title sets in the serif at display size, the one-line
// caption sits under it and the case-study link is a glass button. The run
// pauses behind it (AlongPath), left / right step through the cards, Esc, the
// close button or the backdrop dismiss it, and the picture flies back. A video
// carries on from where the card's was; its sound follows the site toggle (the
// same one the run's own sound button mirrors). The overlay follows the
// PhoneLightbox's rules: a portalled aria-modal dialog, focus moves in and is
// trapped, the page behind is locked (Lenis stopped), focus goes back to the
// card. Reduced motion: a fade, no flight.
const POSTER_ITEMS = PLATES.filter((p) => !p.hidden && (p.video || p.src));
function Poster({ start, from, reduce, onClose }) {
  const [i, setI] = useState(start);
  const plate = POSTER_ITEMS[i];
  const cap = plate.cap || {};
  const root = useRef(null);
  const media = useRef(null);
  const vid = useRef(null);
  const closing = useRef(false);
  // the picture is shown whole, at its own aspect (the card crops it): the card's
  // own natural size when it opens (so the flight is measured right), then the
  // file's, once loaded, when stepping
  const [ar, setAr] = useState(from?.ar || 0);
  const natural = (w, h) => { if (w && h) setAr(w / h); };
  const [soundOn, setSoundOn] = useState(() => document.documentElement.dataset.sound === "on");
  const hasAudio = !!plate.full;
  const external = /^https?:\/\//.test(cap.cta?.to || "");
  const ease = "cubic-bezier(0.22, 1, 0.36, 1)";
  useEffect(() => lockBackgroundScroll(), []);
  useEffect(() => {
    const sync = () => setSoundOn(document.documentElement.dataset.sound === "on");
    window.addEventListener("sound-pref", sync);
    return () => window.removeEventListener("sound-pref", sync);
  }, []);
  // the picture flies out of its card (first card only; stepping cross-fades)
  const flew = useRef(false);
  useLayoutEffect(() => {
    const el = media.current, r0 = from?.rect;
    const text = root.current?.querySelectorAll(".apx__in");
    if (reduce || !el || !r0 || flew.current) { root.current?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, fill: "backwards" }); return; }
    flew.current = true;
    const r1 = el.getBoundingClientRect();
    if (!r1.width || !r0.width) return;
    el.animate([
      { transformOrigin: "0 0", transform: `translate(${r0.left - r1.left}px, ${r0.top - r1.top}px) scale(${r0.width / r1.width}, ${r0.height / r1.height})`, borderRadius: "10px" },
      { transformOrigin: "0 0", transform: "none", borderRadius: "14px" },
    ], { duration: 560, easing: ease, fill: "backwards" });
    root.current?.querySelector(".apx__scrim")?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 420, easing: "ease-out", fill: "backwards" });
    text?.forEach((t, n) => t.animate([{ opacity: 0, transform: "translateY(26px)" }, { opacity: 1, transform: "none" }], { duration: 640, delay: 180 + n * 70, easing: ease, fill: "backwards" }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // the video: from the card's own time on the first card, sound by the site toggle
  useEffect(() => {
    const v = vid.current;
    if (!v) return undefined;
    const at = i === start ? from?.time : 0;
    const seek = () => { try { if (Number.isFinite(at)) v.currentTime = at; } catch { /* not seekable yet */ } };
    if (v.readyState >= 1) seek(); else v.addEventListener("loadedmetadata", seek, { once: true });
    return () => v.removeEventListener("loadedmetadata", seek);
  }, [i]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const v = vid.current;
    if (!v) return;
    v.muted = !(soundOn && hasAudio);
    v.play().catch(() => { v.muted = true; v.play().catch(() => {}); });
  }, [soundOn, hasAudio, i]);
  const close = () => {
    if (closing.current) return;
    closing.current = true;
    const el = media.current, card = from?.el;
    const r1 = el?.getBoundingClientRect(), r0 = card?.isConnected && i === start ? card.querySelector(".ap__plate")?.getBoundingClientRect() : null;
    const done = () => onClose();
    const fade = () => root.current?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, fill: "forwards" }).finished.then(done, done);
    if (reduce || !el || !r1 || !r0 || !r0.width || r0.bottom < 0 || r0.top > window.innerHeight) { fade(); return; }
    root.current?.querySelectorAll(".apx__in, .apx__ui").forEach((t) => t.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: "forwards" }));
    root.current?.querySelector(".apx__scrim")?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 420, fill: "forwards" });
    el.animate([
      { transformOrigin: "0 0", transform: "none" },
      { transformOrigin: "0 0", transform: `translate(${r0.left - r1.left}px, ${r0.top - r1.top}px) scale(${r0.width / r1.width}, ${r0.height / r1.height})` },
    ], { duration: 480, easing: ease, fill: "forwards" }).finished.then(done, done);
  };
  const step = (d) => {
    if (closing.current) return;
    setAr(0);
    setI((n) => (n + d + POSTER_ITEMS.length) % POSTER_ITEMS.length);
    root.current?.querySelectorAll(".apx__media, .apx__in").forEach((t) => t.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 320, easing: "ease-out" }));
  };
  const closeRef = useRef(close); closeRef.current = close;
  const stepRef = useRef(step); stepRef.current = step;
  useEffect(() => {
    const opener = from?.el;
    const focusables = () => [...root.current.querySelectorAll("button, a[href]")].filter((e) => !e.disabled && e.getAttribute("aria-disabled") !== "true" && e.getClientRects().length > 0);
    root.current.querySelector(".apx__close")?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") { e.preventDefault(); closeRef.current(); }
      else if (e.key === "ArrowRight") stepRef.current(1);
      else if (e.key === "ArrowLeft") stepRef.current(-1);
      else if (e.key === "Tab") {
        const f = focusables(); if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        else if (!root.current.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); opener?.focus?.({ preventScroll: true }); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const chev = (d) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={d} /></svg>
  );
  return createPortal(
    <div className="apx" ref={root} role="dialog" aria-modal="true" aria-label={cap.title || plate.alt} onClick={(e) => { if (e.target === e.currentTarget || e.target.classList.contains("apx__stage") || e.target.classList.contains("apx__scrim")) close(); }}>
      <div className="apx__scrim" />
      <div className="apx__stage" data-lenis-prevent>
        <div className="apx__media" ref={media} style={{ "--apx-ar": ar || (plate.aspect || "3 / 4"), backgroundImage: plate.poster ? `url(${plate.poster})` : undefined }}>
          {plate.video ? (
            <video key={plate.video} ref={vid} className="apx__pic" src={plate.full || plate.video} poster={plate.poster} loop playsInline autoPlay muted aria-label={plate.alt} onLoadedMetadata={(e) => natural(e.currentTarget.videoWidth, e.currentTarget.videoHeight)} />
          ) : (
            <img className="apx__pic" src={plate.src} alt={plate.alt} draggable="false" onLoad={(e) => natural(e.currentTarget.naturalWidth, e.currentTarget.naturalHeight)} />
          )}
        </div>
        <div className="apx__text">
          <h2 className="apx__title apx__in">{cap.title || plate.alt}</h2>
          {cap.line && <p className="apx__sub apx__in">{cap.line}</p>}
          {cap.cta && (
            <a
              className="apx__cta apx__in"
              href={cap.cta.to}
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              onClick={(e) => {
                if (external || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                e.preventDefault();
                onClose();
                go(cap.cta.to);
              }}
            >
              <span>{cap.cta.label || "Read the case study"}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden width="14" height="14"><path d="M7 17 17 7" /><path d="M8 7h9v9" /></svg>
            </a>
          )}
        </div>
      </div>
      <button type="button" className="apx__close apx__ui ap__play" aria-label="Close" onClick={close}><Xmark width={16} height={16} strokeWidth={2} aria-hidden /></button>
      <button type="button" className="apx__prev apx__ui ap__play" aria-label="Previous card" onClick={() => step(-1)}>{chev("m15 6-6 6 6 6")}</button>
      <button type="button" className="apx__next apx__ui ap__play" aria-label="Next card" onClick={() => step(1)}>{chev("m9 6 6 6-6 6")}</button>
      <button
        type="button"
        className="apx__sound apx__ui ap__play"
        aria-label={soundOn ? "Mute" : "Unmute"}
        aria-pressed={!soundOn}
        aria-disabled={!hasAudio}
        onClick={() => { if (hasAudio) document.querySelector(".sound-toggle")?.click(); }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M11 5 6 9H3v6h3l5 4z" />
          {soundOn ? (<><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M18.5 5.5a9 9 0 0 1 0 13" /></>) : (<path d="m16 9 5 6M21 9l-5 6" />)}
        </svg>
      </button>
    </div>,
    document.body,
  );
}

// mtrxa2m6: the slider panel. A range per parameter; the discrete ones walk
// their option lists by index and show the option's name.
function Slider({ label, value, min, max, step = 1, onChange, format }) {
  return (
    <label className="ap__slider">
      <span className="ap__slider-head"><span>{label}</span><output>{format ? format(value) : value}</output></span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}
function IndexSlider({ label, options, value, onPick }) {
  const i = Math.max(0, options.findIndex((o) => o.value === value));
  return <Slider label={label} value={i} min={0} max={options.length - 1} onChange={(n) => onPick(options[n].value)} format={(n) => options[n]?.label ?? ""} />;
}

// CARD SHAPES (11 Oct 2026, Agam: "add an option to randomise the shape of the
// cards ... from the new Material guidelines"). The paths are the Material 3
// Expressive set, generated from AndroidX's MaterialShapes definitions
// (materialShapes.js, tools/material-shapes/generate.mjs), never hand-drawn.
// Left out for cards because they crop the work too hard: the thin or spiky
// ones (arrow, fan, triangle, pixel triangle, burst, boom, soft boom, flower)
// and the half-height semicircle. Rectangle is the default, as before.
const SHAPE_MODES = [
  { label: "Rectangle", value: "rect" },
  { label: "Mixed", value: "mixed" }, // about half the cards take a shape
  { label: "Random", value: "random" }, // every card takes one
];
const CARD_SHAPES = Object.keys(MATERIAL_SHAPES).filter(
  (k) => !["arrow", "fan", "triangle", "pixelTriangle", "burst", "boom", "softBoom", "flower", "semiCircle"].includes(k),
);
// a small seeded PRNG (mulberry32), so a seed gives the same shapes every load
function seeded(n) {
  let t = (n + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

// THE GOLDEN RATIO IN THE SNAP (11 Oct 2026, Agam: "use golden ratios for
// transitioning the card into and out of the centre snap slot"). phi = 1.618...;
// 1/phi^2 = 0.382 and 1/phi^3 = 0.236. Every constant below derives from it, in
// ONE place, so the feel is tunable without hunting:
//  - TIMING 1 : phi. A card's nearness is a function of its distance from the
//    centre, so at one run speed a zone twice as wide takes twice as long to
//    cross. Arriving crosses ZONE_IN (the run's own phase gap), leaving crosses
//    ZONE_OUT = phi x ZONE_IN: in the shorter, out the longer (about 382 : 618
//    of the whole pass).
//  - EASING from phi: in = cubic-bezier(1/phi^2, 0, 1/phi^3, 1); out is its
//    mirror, (1 - 1/phi^3, 0, 1 - 1/phi^2, 1). Both have zero slope at the
//    centre (y1 = 0), so landing and leaving are gentle.
//  - GROWTH: the centre card grows by 1/phi^3 (x1.236, then x1.2 on top: 1.483 since
//    11 Oct 2026, "the centred tile should be 20% bigger"; the settle overshoot a
//    phi spring would have; it was x1.2), a hovered or focused card to phi
//    (x1.618, was x1.5). These are the stage's --ap-focus / --ap-hover
//    (hello3.css), which read PHI_FOCUS / PHI_HOVER below in comments only.
//  - STAGGER (neighbours reacting 1/phi^2 later) is NOT applied: a lag on the
//    layout needs per-card state and reopens the landing discontinuity that
//    round 13 removed.
export const PHI = (1 + Math.sqrt(5)) / 2;
export const SNAP = {
  zoneIn: 1,
  zoneOut: PHI,
  easeIn: [1 / PHI ** 2, 0, 1 / PHI ** 3, 1],
  easeOut: [1 - 1 / PHI ** 3, 0, 1 - 1 / PHI ** 2, 1],
  // THE HOP between two cards (PathMarquee drives it): a damped spring on the
  // run's shared position. zeta 0.68 overshoots the centre by ~5.5% of a card
  // step and settles in ~1.1 s; lower zeta = looser and bouncier, 1 = no
  // overshoot. omega (rad/s) sets the pace: lower = slower and floatier.
  // lead is the time constant of the eased-in target the spring chases.
  spring: { zeta: 0.68, omega: 5.5, lead: 0.12 }, // lead (s): how softly the take-off eases in; 0 = a hard kick
  // THE AUTO-DRAG (mv847jvw): once per load, when 40% of the run is on screen and
  // the scroll has settled, the run travels two cards by itself, so the flow (the
  // wave, the depth, the parting, the snap) is shown rather than waited for. The
  // target sweeps over 1.4 s on a phi ease-in-out (1/phi, 0, 1 - 1/phi, 1): slow
  // take-off, fast middle, long landing; the hop's spring chases it, which rounds
  // the ramp and lands with a ~2% overshoot. Measured: peak speed ~1 s in, settled
  // on the card at ~2.2 s. Any press, wheel, touch or key cancels it.
  demo: { cards: 5, ms: 1900, ease: [1 / PHI, 0, 1 - 1 / PHI, 1], threshold: 0.4 },
};
// cubic-bezier(x1, y1, x2, y2) as a function of x in 0..1 (Newton + bisection)
function bezier(x1, y1, x2, y2) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const X = (t) => ((ax * t + bx) * t + cx) * t;
  const Y = (t) => ((ay * t + by) * t + cy) * t;
  const dX = (t) => (3 * ax * t + 2 * bx) * t + cx;
  return (x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 6; i++) { const e = X(t) - x; if (Math.abs(e) < 1e-5) return Y(t); const d = dX(t); if (Math.abs(d) < 1e-6) break; t -= e / d; }
    let lo = 0, hi = 1; t = x;
    for (let i = 0; i < 24; i++) { const e = X(t) - x; if (Math.abs(e) < 1e-5) break; if (e > 0) hi = t; else lo = t; t = (lo + hi) / 2; }
    return Y(t);
  };
}
const easeIn = bezier(...SNAP.easeIn);
const easeOut = bezier(...SNAP.easeOut);

const MODES = [
  { label: "Visual", value: "cards" }, // mtqstc9t
  { label: "Timeline", value: "empty" }, // mtqstfdf
];

const HOVERS = [
  { label: "Slow", value: "slow" },
  { label: "Stop", value: "pause" },
  { label: "Ignore", value: "none" },
];

// One labelled row of chips. Extracted once the control bar went past three
// groups: eight copies of the same twelve lines is where a typo hides.
function Group({ name, options, value, onPick }) {
  return (
    <div className="ap__group" role="group" aria-label={name}>
      <span className="ap__label">{name}</span>
      <div className="ap__chips">
        {options.map((o) => (
          <button
            key={o.label}
            type="button"
            className="ap__chip"
            data-active={value === o.value ? "true" : undefined}
            aria-pressed={value === o.value}
            onClick={() => onPick(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function AlongPath({ reduce, modeTwo }) {
  // THE DEFAULTS ARE THE SETTING AGAM TUNED TO, not the component's own starting
  // point: Wave / Slow / Flat / Sparse / L / Airy, hover Slow, nothing under Show.
  // Read off the live controls rather than guessed, so the section opens on the
  // arrangement he chose instead of one that has to be re-dialled every visit.
  //
  // Worth knowing when reading these: Sparse (repeat 1) is 8 cards, and Airy
  // trims to `floor(count / spread)` = 5 of them. Big cards, few of them, wide
  // apart on a calm curve — a deliberately quiet run, not a busy one.
  const [preset, setPreset] = useState("wave");
  // 3 was the speed of a run that never stopped: a 33-second lap, a slow drift
  // you read past. A carousel travels BETWEEN rests, so the same number left
  // 28 seconds of crawl between one card and the next (measured). 24 puts a
  // card at the centre about every second and a half, which with the 1.5s dwell
  // is a beat rather than a wait. The Tune slider still owns it from here.
  // 11 Oct 2026, Agam's Tune screenshot ("these are the base properties"):
  // Wave / speed 13 / Air + haze / Packed / 240px / spacing 1.60 / Stop on
  // hover, all three switches off. Phones keep their own size and spacing
  // (mu9okclr, below).
  const [speed, setSpeed] = useState(13);
  const [showPath, setShowPath] = useState(false);
  const [rotate, setRotate] = useState(false);
  const [reverse, setReverse] = useState(false);
  const [depth, setDepth] = useState("haze");
  // Edge size (Tune): the scale cards ease down to at both ends of the run
  const [edgeSize, setEdgeSize] = useState(0.1);
  const edgeRef = useRef(0.1);
  edgeRef.current = edgeSize;
  const reverseRef = useRef(false);
  reverseRef.current = reverse;
  const depthRef = useRef(DEPTHS.haze);
  depthRef.current = DEPTHS[depth];
  const [density, setDensity] = useState(3);
  // mu9okclr "this is broken on mobile". The run is authored in VIEWBOX units
  // and scaled to whatever width the stage has, so the same 240 that renders a
  // 261px tile on a 1349px window renders an 80px one at 375: the wave preset
  // is 1000 units wide against a 335px column, a scale of 0.335. Measured, both
  // numbers, before changing anything.
  //
  // The tile size is therefore a function of the screen, not a constant. 560
  // units puts the tile back at 188px on a phone, and the spread goes up to
  // match because you cannot show four 188px cards across 335px: a marquee on
  // a narrow screen is two big cards moving, not four illegible ones. Both are
  // still just the panel's own defaults, so the sliders still own them after
  // first paint.
  const NARROW = typeof window !== "undefined" && window.matchMedia("(max-width: 720px)").matches;
  const [size, setSize] = useState(NARROW ? 560 : 240); // mtrxnfas then mtry05rj (08 Sep 2026): 240px tiles by default (was 172, the "L" chip)
  // "pause", not "slow": the ask is that the moment STOPS under the cursor.
  const [hover, setHover] = useState("pause");
  const [mode, setMode] = useState("cards");
  const [panelOpen, setPanelOpen] = useState(false); // mtrxa2m6
  // mu9trf5q: the run rests on one card at a time now, and this is the only
  // control on it so far - "right now just play, add play and pause for now".
  const [running, setRunning] = useState(true);
  const [poster, setPoster] = useState(null); // mv583b24: { start, el, rect, time }
  const wasRunning = useRef(true);
  // open the poster for a card: the run pauses behind it and resumes on close
  const openPoster = (p, el) => {
    const start = POSTER_ITEMS.indexOf(p);
    if (start < 0 || poster) return;
    const pic = el?.querySelector(".ap__plate");
    wasRunning.current = running;
    setRunning(false);
    const nat = pic?.naturalWidth ? pic.naturalWidth / pic.naturalHeight : pic?.videoWidth ? pic.videoWidth / pic.videoHeight : 0;
    setPoster({ start, el, rect: pic?.getBoundingClientRect() || null, time: pic?.currentTime, ar: nat || 0 });
  };
  const closePoster = () => { setPoster(null); if (wasRunning.current) setRunning(true); };
  const [shapeMode, setShapeMode] = useState("rect");
  const [shapeSeed, setShapeSeed] = useState(1); // fixed default: the same shapes on every load; Reshuffle moves it

  // THE RING'S CLOCK (mv3pitov-madcn7, reworked 11 Oct 2026 for per-card dwell).
  // One WAAPI animation on one circle's stroke-dashoffset, never React state per
  // frame. The ring now times the REST only: it fills 0 -> 360 deg over the
  // resting card's own dwell (a video's real length), restarts empty on each
  // card, empties for the travel, freezes with "hold" and carries on with
  // "resume". It also drives the resting card's video: seeks to 0 and plays on
  // a fresh landing, pauses with the ring, plays again with it.
  // THE SOUND OF THE HAND-DRAWN ANIMATION (12 Oct 2026, Agam: "the hand-drawn
  // animation video in side quests has audio, can we make that audio come
  // through"). The plate's own files are silent (the perf copies and the 800 px
  // plate carry no audio track; only follow-that-idea-full.mp4 does, checked with
  // ffprobe), so a separate <audio> plays that file in step with the plate while
  // its card is the resting one. It plays only when ALL hold: the site's sound is
  // on (<html data-sound>, the top-right toggle), the visitor has interacted
  // (autoplay policy; before that play() is refused and we stay silent, no
  // errors), the card is resting and not held (hover / Pause / keyboard focus),
  // the section is on screen and the tab visible. It fades in and out over 400 ms. (OdinEye, 18 Oct 2026: an original French-house loop, tools/audio/odineye_groove.py, 16 bars = 4 clips, kept in phase modulo the clip.)
  const audioCtl = useRef({ el: null, drift: 0, src: "", want: false, rest: false, held: false, seen: true, interacted: false, blocked: false, vol: 0, fade: 0, card: null }).current;
  const audioSync = useRef(null);
  // how far the track runs ahead of the picture, in seconds, taken MODULO the clip: a
  // track of several clips (OdinEye's groove is 4 x 8.7 s = 16 bars) stays in phase with
  // the looping clip without being dragged back to its first clip
  const phaseOff = (a) => {
    const v = a.card?.querySelector("video");
    const P = v?.duration;
    if (!v || !Number.isFinite(P) || P <= 0 || !Number.isFinite(v.currentTime)) return null;
    const d = (a.el.currentTime - v.currentTime) % P;
    return d > P / 2 ? d - P : d < -P / 2 ? d + P : d;
  };
  audioSync.current = () => {
    const a = audioCtl;
    if (!a.el) return;
    const sound = document.documentElement.dataset.sound === "on";
    // a scroll or wheel is not a user activation, so the gate is the browser's
    // own record of one (any click, tap or key, ever) as well as our listeners
    const unlocked = a.interacted || !!navigator.userActivation?.hasBeenActive;
    const go = a.rest && !a.held && sound && unlocked && !a.blocked && a.seen && !document.hidden;
    // why the card is silent, when it is meant to be heard (a hint on the card)
    const why = a.rest && a.seen ? (!sound ? "off" : (!unlocked || a.blocked) ? "tap" : "") : "";
    if (a.card) {
      if (why) { a.card.dataset.audioHint = why; const t = a.card.querySelector(".ap__audio-hint-t"); const txt = why === "off" ? "Sound off" : "Tap for sound"; if (t && t.textContent !== txt) t.textContent = txt; }
      else a.card.removeAttribute("data-audio-hint");
    }
    a.card?.toggleAttribute("data-audio-live", !!(go && !a.el.paused));
    clearInterval(a.fade);
    const target = go ? 1 : 0;
    if (go && a.el.paused) {
      // start in step with the picture (the track loads later than the plate)
      const d = phaseOff(a);
      if (d !== null) { try { a.el.currentTime = Math.max(0, a.el.currentTime - d); } catch { /* not seekable yet */ } }
    }
    if (go && a.el.paused) a.el.play().catch(() => { /* refused: say so on the card, retry on the next gesture */ a.blocked = true; a.card?.removeAttribute("data-audio-live"); audioSync.current?.(); });
    // while live, keep the track within 0.2 s of the picture (play start latency
    // and buffering let it trail by a few tenths)
    clearInterval(a.drift);
    if (go) a.drift = setInterval(() => {
      const d = phaseOff(a);
      if (d !== null && !a.el.paused && Math.abs(d) > 0.2) { try { a.el.currentTime = Math.max(0, a.el.currentTime - d + 0.05); } catch { /* ignore */ } }
    }, 500);
    const t0 = performance.now(), v0 = a.el.volume, dur = 400;
    a.fade = setInterval(() => {
      const k = Math.min(1, (performance.now() - t0) / dur);
      try { a.el.volume = Math.max(0, Math.min(1, v0 + (target - v0) * k)); } catch { /* ignore */ }
      if (k >= 1) { clearInterval(a.fade); if (!target) { a.el.pause(); a.card?.removeAttribute("data-audio-live"); } else a.card?.toggleAttribute("data-audio-live", !a.el.paused); }
    }, 30);
  };
  useEffect(() => {
    const sync = () => audioSync.current?.();
    const gesture = () => { audioCtl.interacted = true; audioCtl.blocked = false; sync(); };
    // the hint's click: turn the site sound on (the top-right toggle owns that
    // state) if it is off, and count the click as the gesture
    const hint = () => {
      audioCtl.interacted = true; audioCtl.blocked = false;
      if (document.documentElement.dataset.sound !== "on") document.querySelector(".sound-toggle")?.click();
      sync();
    };
    window.addEventListener("sound-pref", sync);
    document.addEventListener("visibilitychange", sync);
    window.addEventListener("ap-sound-hint", hint);
    // click, touchend and keydown are the activations browsers accept; a scroll is not
    for (const t of ["pointerdown", "click", "touchend", "keydown"]) window.addEventListener(t, gesture, { passive: true });
    // "in view" for sound means about half the section is on screen (Agam, 12 Oct
    // 2026: audible only when the section is in view AND this card is centred),
    // or, when the section is taller than the window, half the window is filled
    // by it. Thresholds every 10% so the crossing is reported promptly.
    const io = new IntersectionObserver(([e]) => {
      audioCtl.seen = e.isIntersecting && (e.intersectionRatio >= 0.5 || e.intersectionRect.height >= 0.5 * window.innerHeight);
      sync();
    }, { threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1] });
    if (sectionRef.current) io.observe(sectionRef.current);
    return () => {
      window.removeEventListener("sound-pref", sync);
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("ap-sound-hint", hint);
      for (const t of ["pointerdown", "click", "touchend", "keydown"]) window.removeEventListener(t, gesture);
      io.disconnect();
      clearInterval(audioCtl.fade);
      clearInterval(audioCtl.drift);
      audioCtl.el?.pause();
    };
  }, []);
  // THE SOUND BUTTON (12 Oct 2026, Agam: "add the audio button to the left side
  // of the play button"). It MIRRORS the site-wide sound toggle (top right) rather
  // than keeping a local override, so there is one truth for "is sound on": a
  // click here flips that toggle (and is itself the gesture that unlocks audio).
  // Dimmed while the centred card has no audio track (only the hand-drawn one has).
  const [soundOn, setSoundOn] = useState(() => typeof document !== "undefined" && document.documentElement.dataset.sound === "on");
  const [cardHasAudio, setCardHasAudio] = useState(false);
  useEffect(() => {
    const sync = () => setSoundOn(document.documentElement.dataset.sound === "on");
    sync();
    window.addEventListener("sound-pref", sync);
    return () => window.removeEventListener("sound-pref", sync);
  }, []);
  const toggleSound = () => {
    audioCtl.interacted = true; audioCtl.blocked = false;
    document.querySelector(".sound-toggle")?.click();
    audioSync.current?.();
  };
  const ringRef = useRef(null);
  const ringAnim = useRef(null);
  const restVideo = useRef(null);
  const onCycle = useRef((phase, info) => {
    const el = ringRef.current;
    const sweep = (from, ms) => {
      if (!el) return;
      ringAnim.current?.cancel();
      ringAnim.current = el.animate([{ strokeDashoffset: 1 - from }, { strokeDashoffset: 0 }], { duration: Math.max(1, ms), easing: "linear", fill: "forwards" });
    };
    if (phase === "rest") {
      const v = info.item?.querySelector("video") || null;
      restVideo.current = v;
      // sound: a rest on the audio-bearing plate starts its track from 0 (or
      // carries on after a hold), silent unless every condition in audioSync holds
      let src = v?.dataset.audioSrc || "";
      setCardHasAudio(!!src);
      if (src) {
        if (!audioCtl.el) { audioCtl.el = new Audio(); audioCtl.el.preload = "auto"; audioCtl.el.volume = 0; audioCtl.el.loop = true; }
        if (v.dataset.audioAlt && !audioCtl.el.canPlayType("audio/mp4")) src = v.dataset.audioAlt; // no AAC: the mp3 twin
        if (audioCtl.src !== src) { audioCtl.el.src = src; audioCtl.src = src; }
        // seek the PICTURE first: the audio aligns to the video's clock when it starts
        if (!info.resumed) { try { v.currentTime = 0; audioCtl.el.currentTime = 0; } catch { /* not loaded yet: starts from 0 anyway */ } }
        audioCtl.card?.removeAttribute("data-audio-live");
        audioCtl.card = v.closest(".ap__card");
        audioCtl.rest = true; audioCtl.held = false;
        audioSync.current?.();
      } else { audioCtl.rest = false; audioSync.current?.(); }
      if (v) { if (!info.resumed) { try { v.currentTime = 0; } catch { /* metadata not ready: it starts from wherever it is */ } } v.play?.().catch(() => {}); }
      sweep(info.resumed ? 1 - info.remaining / info.dwell : 0, info.remaining);
    } else if (phase === "travel") {
      restVideo.current = null;
      audioCtl.rest = false; audioSync.current?.(); // fades out over 300 ms, then pauses
      ringAnim.current?.cancel();
      ringAnim.current = null; // empty ring while the run moves
    } else if (phase === "hold") {
      ringAnim.current?.pause();
      restVideo.current?.pause?.();
      audioCtl.held = true; audioSync.current?.();
    } else if (phase === "resume") {
      if (ringAnim.current?.playState === "paused") ringAnim.current.play();
      restVideo.current?.play?.().catch(() => {});
      audioCtl.held = false; audioSync.current?.();
    }
  }).current;
  // How long a card rests: a video plays from 0 for min(its real duration, 10 s)
  // (Agam, 12 Oct 2026, mv4rix6s-4kcl78: "let's play 10 sec of the video and move
  // to the next", replacing "play each card through completely"; the duration is
  // read once its metadata is in, 6 s until it is), a still gets a reading dwell.
  // The ring fills over this same time. One constant to change: VIDEO_DWELL_CAP.
  const STILL_DWELL = 3000;
  const VIDEO_DWELL_CAP = 10000;
  const dwellFor = useRef((item) => {
    const v = item?.querySelector("video");
    if (!v) return STILL_DWELL;
    const d = v.duration;
    return Math.min(VIDEO_DWELL_CAP, Number.isFinite(d) && d > 0 ? d * 1000 : 6000);
  }).current;
  // mtqsyu3o: the section keeps ONE height across modes, Visual's. The stage's
  // height is measured while the run is up and locked while the timeline is in;
  // the timeline is zoomed down to fit that height (zoom, not transform, so it
  // reflows and stays interactive at the smaller size).
  const [visualH, setVisualH] = useState(0);
  const [fit, setFit] = useState(1);
  const mode2Ref = useRef(null);
  const [spread, setSpread] = useState(NARROW ? 2.6 : 1.6); // 1.4 -> 1.6 (09 Sep 2026): the 1.5x video card overlapped its neighbour by 21px at 1.4; at 1.6 it clears by 23. NARROW: see the size note above

  // A clip decoding while nobody is looking is exactly the cost this section was
  // optimised to remove (msbkbach), and a video does not stop on its own when it
  // scrolls out of view. The marquee already pauses its animations off-screen;
  // this gives the video the same manners.
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  useEffect(() => {
    if (mode !== "cards") return undefined;
    const el = stageRef.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(() => setVisualH(Math.round(el.getBoundingClientRect().height)));
    ro.observe(el);
    return () => ro.disconnect();
  }, [mode]);
  useEffect(() => {
    if (mode !== "empty" || !visualH) return undefined;
    const el = mode2Ref.current;
    if (!el) return undefined;
    // mtr6ioi4 ("move the timeline up, bottom part not visible"): the height
    // was read ONCE, at the switch, before the timeline had finished laying out,
    // so the zoom fitted a shorter box than the one that ended up on screen and
    // the bottom fell into overflow: hidden. Re-measure whenever the timeline's
    // box changes. The natural height is the zoomed rect divided by the zoom
    // in force, so nothing has to be reset to 1 to read it.
    // mtr7912e ("make the left and right padding zero and scale
    // proportionally"): the box is laid out at the timeline's own design width
    // (MODE2_W, the .tlx max-width) and scaled to fit BOTH the stage's width
    // and its locked height, so the drawing keeps its proportions instead of
    // reflowing to whatever width 1 / zoom happened to produce. Before this
    // the natural width was stage / zoom (about 1800px), the 1200px section
    // centred inside it, and the slack read as padding either side.
    // WIDTH-FIT, height follows (mtr7912e). Fitting the locked cards-mode
    // height as well left the drawing 606px wide in a 1088px stage with 241px
    // of slack either side, which is exactly the padding the pin asked to
    // zero. So the scale is the stage's width over the design width, the
    // height is whatever that scale makes it, and the mtqsyu3o height lock
    // applies to cards mode only.
    const measure = () => {
      const w = stageRef.current?.clientWidth || MODE2_W;
      setFit(Math.min(1, w / MODE2_W));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    if (stageRef.current) ro.observe(stageRef.current);
    return () => ro.disconnect();
  }, [mode, visualH]);

  // mtqsm92w: when a card grows on hover, every card to its left and right
  // moves away by half the growth, so the gaps between cards stay what they
  // were. Delegated on the stage: the items are the engine's, and the shift
  // is written as `translate` on the CARD (09 Sep 2026, Agam: "see the black
  // content shifting"). It used to go on the plate INSIDE the card, and a
  // card clips: the video slid sideways inside its white box and left a
  // white strip. `translate` and the card's hover `scale` are separate
  // properties, so the card can carry both. Left or right is a question of
  // screen position, not DOM order, because the run wraps.
  //
  // THE RUN PARTS AROUND ITS CENTRE, CONTINUOUSLY (11 Oct 2026, Agam:
  // "basically I want the cards to move out of the way for the cards at the
  // center", after "all the cards should move" (mv3oxo6m) and the hover / snap
  // spacing asks). As the run carries a card into the centre, everything on
  // its left eases left and everything on its right eases right, and the card
  // grows into the gap; as it leaves, the gap closes behind it and opens for
  // the next. Hover and keyboard focus use the same mechanism with that card
  // as the centre, and the bigger hover growth.
  //
  // HOW, without per-frame React state or per-frame layout reads: every card
  // runs the same keyframes offset in time, so its place on the path is its
  // animation's own progress (getComputedTiming, no layout). Progress 0.5 is
  // the centre (the keyframes peak there and spacing="x" makes x linear in
  // time). Each frame, for each card, d = its progress minus the centre's,
  // wrapped to -0.5..0.5; its "nearness" is 1 - smoothstep over one card's
  // phase gap; its target is translate = sign(d) x H x (1 - nearness) and
  // scale = 1 + (K - 1) x nearness, where K is the centre card's growth
  // (--ap-focus, or --ap-hover for a hovered / focused card) and H is half that
  // growth plus --ap-gap-extra. Shown values ease toward targets (so switching
  // between the run, hover and focus is smooth) and are written as
  // `translate` and `--ap-k` only: transforms, no layout. Widths are cached and
  // refreshed by a ResizeObserver, never read in the loop. The loop runs only
  // while the section is on screen.
  //
  // The card nearest the centre (or the hovered / focused one) is the ACTIVE
  // card: data-ap-active on its item, z-index above everything (hello3.css);
  // the one it replaced keeps data-ap-was while it shrinks.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || reduce || mode !== "cards") return undefined;
    let focused = null;
    let current = null;
    let wasTimer = 0;
    let raf = 0;
    let visible = true;
    let cards = [];
    const shown = new Map(); // card -> { x, k }
    const widths = new Map(); // card -> offsetWidth (layout px), cached
    const itemW = new Map(); // item -> offsetWidth, to read its depth scale off its box
    const capW = new Map(); // card -> its caption's layout width (the one-line caption can be wider than the card)
    let gapPhase = 0.1;
    let fit = 1;
    let depth = 1; // the depth ladder's top (--pm-depth-max): the scale a card near the centre sits at
    let centreP = 0.5; // the progress that sits on the screen's centre line
    let restKnown = false;
    // THE SNAP CENTRE IS THE VIEWPORT'S (11 Oct 2026, Agam: "the centre snap
    // point ... is not horizontally centred with the entire page"): the layout's
    // anchor is documentElement.clientWidth / 2 (the viewport minus any scrollbar),
    // never the track's or the section's own middle. Screen coordinates already
    // include every transform and scale on the track, and every frame reads the
    // current width, so a resize needs no separate recompute.
    const viewMid = () => document.documentElement.clientWidth / 2;
    let pxPerP = 1000; // screen px per unit of progress (calibrated)
    let lastLead = null;
    let leadChanged = 0;
    let focusK = 1.2, hoverK = 1.5, extra = 36;

    let calCount = -1;
    let resized = true;
    const refresh = () => {
      cards = [...stage.querySelectorAll(".ap__card")];
      widths.clear();
      itemW.clear();
      for (const c of cards) {
        widths.set(c, c.offsetWidth);
        const it = c.closest(".pm__item");
        if (it) itemW.set(it, it.offsetWidth);
        const cap = c.parentElement?.querySelector(".ap__cap");
        capW.set(c, cap ? cap.offsetWidth : 0);
      }
      const cs = getComputedStyle(stage);
      focusK = parseFloat(cs.getPropertyValue("--ap-focus")) || 1.2;
      hoverK = parseFloat(cs.getPropertyValue("--ap-hover")) || 1.5;
      extra = parseFloat(cs.getPropertyValue("--ap-gap-extra")) || 0;
      const layer = stage.querySelector(".pm__layer");
      fit = parseFloat(layer?.style.getPropertyValue("--pm-fit")) || 1;
      depth = parseFloat(stage.querySelector(".pm")?.style.getPropertyValue("--pm-depth-max")) || 1;
      // recalibrate only when the geometry can have changed: a different card
      // count or a resize. React re-rendering nodes is not one (mv3sifxx).
      if (resized || cards.length !== calCount) { calibrate(); calCount = cards.length; resized = false; }
      // one card's phase gap: the smallest step between two cards' progress
      const ps = cards.map(prog).filter((p) => p != null).sort((a, b) => a - b);
      let g = 1;
      for (let i = 0; i < ps.length; i++) {
        const nx = i + 1 < ps.length ? ps[i + 1] : ps[0] + 1;
        if (nx - ps[i] > 1e-4) g = Math.min(g, nx - ps[i]);
      }
      gapPhase = g < 1 ? g : 0.1;
    };
    // WHERE IS THE CENTRE, in progress terms? Not exactly 0.5: measured, the
    // run rested 23px left of the middle with 0.5 as the centre. So fit
    // x = a + b * progress over the items' own boxes (the ITEM, which carries
    // the path position; the card inside carries our translate) and solve for
    // the stage's middle. A layout read, so it runs on refresh and then at
    // most once a second, never every frame.
    const calibrate = () => {
      if (!stage.querySelector(".pm")) return;
      const mid = viewMid();
      // LOCAL, not a fit over the whole path (that left the rest 50-64px off):
      // the item just left of the middle and the one just right of it, and
      // interpolate between their progress
      let L = null, R = null;
      for (const c of cards) {
        const p = prog(c);
        const it = c.closest(".pm__item");
        if (p == null || !it) continue;
        const r = it.getBoundingClientRect();
        if (!r.width) continue;
        const x = r.left + r.width / 2;
        if (x <= mid && (!L || x > L.x)) L = { x, p };
        if (x > mid && (!R || x < R.x)) R = { x, p };
      }
      if (!L || !R || R.x - L.x < 1) return;
      const dp = wrap(R.p - L.p);
      if (Math.abs(dp) < 1e-4) return;
      // until a card has rested, the centre progress is read off the geometry;
      // from the first rest on it is that card's own progress (see frame())
      if (!restKnown) centreP = L.p + dp * ((mid - L.x) / (R.x - L.x));
      // THE SLOPE FROM EVERY CARD, not from the pair at the middle
      // (mv3sifxx-349eqq, "the left and right spacing shifts when the card
      // lands"): the local pair's slope changed with which two cards
      // straddled the middle (the run's seam is a wider step), which changed
      // the clearance sum, and every card stepped ~17px mid-rest. A least-
      // squares fit over the whole run does not depend on the moment.
      let n = 0, sx = 0, sy = 0, sxx = 0, sxy = 0;
      for (const c of cards) {
        const p = prog(c);
        const it = c.closest(".pm__item");
        if (p == null || !it) continue;
        const r = it.getBoundingClientRect();
        if (!r.width) continue;
        const x = r.left + r.width / 2;
        n++; sx += p; sy += x; sxx += p * p; sxy += p * x;
      }
      const b = n > 2 ? (n * sxy - sx * sy) / (n * sxx - sx * sx) : 0;
      if (Number.isFinite(b) && Math.abs(b) > 1) pxPerP = b;
    };
    const anim = (card) => card.closest(".pm__item")?.getAnimations()[0];
    function prog(card) {
      const a = anim(card);
      const p = a?.effect?.getComputedTiming().progress;
      return typeof p === "number" ? p : null;
    }
    const wrap = (d) => ((((d + 0.5) % 1) + 1) % 1) - 0.5;
    const smooth = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));

    const setActive = (next) => {
      if (next === current) return;
      const prevItem = current?.closest(".pm__item");
      if (prevItem) {
        delete prevItem.dataset.apActive;
        prevItem.dataset.apWas = "true";
        clearTimeout(wasTimer);
        wasTimer = setTimeout(() => { if (prevItem.dataset.apActive === undefined) delete prevItem.dataset.apWas; }, 800);
      }
      stage.querySelectorAll(".pm__item[data-ap-was]").forEach((it) => { if (it !== prevItem) delete it.dataset.apWas; });
      current = next;
      const item = current?.closest(".pm__item");
      if (item) { delete item.dataset.apWas; item.dataset.apActive = "true"; }
    };

    let lastT = 0;
    const frame = (now) => {
      raf = 0;
      if (!visible) { lastT = 0; return; }
      const dt = lastT ? Math.min(1000, now - lastT) : 16.7;
      lastT = now;
      // calibrated when the run is (re)built or resized, never on a timer: a
      // recalibration mid-rest was a step (mv3sifxx)
      if (!cards.length || !cards[0].isConnected) refresh();
      const grabbing = stage.querySelector(".pm[data-grabbing='true']");
      const lead = (!grabbing && focused) || null;
      if (lead !== lastLead) { lastLead = lead; leadChanged = now; }
      // ONE centre for travel and rest alike (mv3sifxx): switching to the
      // resting card's own progress on landing moved every card's distance by
      // the calibration's residual, a step at exactly the landing frame
      // THE CENTRE PROGRESS IS THE LAST REST'S OWN (a hop lands exactly where the
      // previous rest was), so a resting card is at d = 0 and the layout puts it
      // at the viewport centre exactly; a geometric calibration left it 4-9 px off
      const restingCard = stage.querySelector(".pm__item[data-focus] .ap__card");
      if (restingCard) { const rp = prog(restingCard); if (rp != null) { centreP = rp; restKnown = true; } }
      const leadP = lead ? prog(lead) : centreP;
      // the centre's growth: a hovered / focused card to --ap-hover (the size
      // hover has had since mttja92x), a centre card to --ap-focus
      const K = lead ? hoverK : focusK;
      // THE ROW IS LAID OUT, NOT PUSHED (11 Oct 2026, Agam: "the size
      // contrast needs to be higher ... reduce the leftmost and rightmost cards
      // to 10% of the size"). Every card's on-screen width comes from the same
      // per-frame position as everything else: growth near the centre, the
      // EDGE FALLOFF on both sides (full size near the middle, easing to the
      // Edge size at either end, relative to that side's reach), and the depth
      // scale the engine gives its item. Then neighbours are placed exactly one
      // gap apart, outwards from the centre, which sits between the two cards
      // that straddle it (or on the hovered / focused card). So tiny edge cards
      // pack close and the big centre card gets its room, with no empty gaps or
      // overlaps by construction; the earlier "claims and pushes" model could
      // not pull small cards together. Item boxes are READ ONCE per frame,
      // before any write, so this costs one layout, not a thrash.
      const mid = viewMid();
      // the layer's fit scale, read fresh every frame (a cached one went stale
      // when the track's width changed without a card being rebuilt, leaving the
      // translate mis-scaled and the rest card 4-6 px off the centre)
      fit = parseFloat(stage.querySelector(".pm__layer")?.style.getPropertyValue("--pm-fit")) || fit;
      const edge = Math.min(1, Math.max(0.05, edgeRef.current ?? 0.1));
      let best = null, bestNear = -1;
      const rows = [];
      for (const c of cards) {
        const p = prog(c);
        if (p == null) continue;
        const it = c.closest(".pm__item");
        const r = it?.getBoundingClientRect();
        if (!r || !r.width) continue;
        const d = p - (leadP ?? centreP);
        // nearness, 1 at the centre to 0 a zone away: the zone and the curve
        // differ by side (SNAP): arriving is the shorter, leaving the longer
        const approaching = reverseRef.current ? d > 0 : d < 0;
        const near = approaching
          ? 1 - easeIn(Math.min(1, Math.abs(d) / (gapPhase * SNAP.zoneIn)))
          : 1 - easeOut(Math.min(1, Math.abs(d) / (gapPhase * SNAP.zoneOut)));
        const dc = p - centreP;
        // THE CAPTION'S OWN NEARNESS, measured from the CENTRE (not the hovered
        // card): the same phi zones and curves as `near` (arriving shorter, leaving
        // longer), so the words ease in with the landing and out with the leaving,
        // and hovering another card does not steal the resting card's caption.
        const apc = reverseRef.current ? dc > 0 : dc < 0;
        const capNear = apc
          ? 1 - easeIn(Math.min(1, Math.abs(dc) / (gapPhase * SNAP.zoneIn)))
          // LEAVING uses 1/phi of a step, not phi (the card's own exit): the caption
          // has to be gone by the time the next card's caption starts to arrive,
          // or two captions hang on screen at once (measured: the old caption was
          // still 40-55% in at one step away with the card's wider zone)
          : 1 - easeOut(Math.min(1, Math.abs(dc) / (gapPhase / PHI)));
        const capP = smooth(Math.max(0, Math.min(1, (capNear - 0.3) / 0.7)));
        const reach = Math.max(0.05, dc < 0 ? centreP : 1 - centreP);
        // the falloff completes 60% of the way to each end: measured, a
        // falloff over the whole reach left the outermost VISIBLE cards at
        // about half size (the big middle cards push the smallest off-screen)
        const sz = edge + (1 - edge) * (1 - smooth(Math.min(1, Math.abs(dc) / (reach * 0.6))));
        const ds = r.width / (itemW.get(it) || r.width);
        rows.push({ c, it, d, near, sz, ds, capP, bx: r.left + r.width / 2 });
        if (c === lead || (!lead && near > bestNear)) { bestNear = c === lead ? 2 : near; best = c; }
      }
      rows.sort((a, b) => a.d - b.d);
      for (const o of rows) {
        o.k = (o.c === best && lead ? K : 1 + (focusK - 1) * o.near) * o.sz;
        // ds is the item's measured SCREEN scale (item box / its layout width), so it
        // already includes the layer's fit: do not multiply by fit again (that
        // double count was hidden while the cached fit happened to be 1)
        o.W = (widths.get(o.c) || 0) * o.ds * o.k;
        // the card at the centre also needs room for its caption, which can
        // be wider than the card: it claims the wider of the two, by the same
        // nearness, so the neighbours make way for the line as it arrives
        // (the caption is counter-scaled when the fit shrinks the run)
        const cw = (capW.get(o.c) || 0) * o.ds * (fit < 1 ? 1 / fit : 1);
        if (cw > o.W) o.W += (cw - o.W) * smooth(Math.min(1, o.near * 1.25));
      }
      const n = rows.length;
      const G = extra;
      // the air between two cards scales with their size, so tiny edge cards
      // pack close rather than sitting a full gap apart (floor 4px)
      const gapBetween = (i, j) => (rows[i].W + rows[j].W) / 2 + Math.max(4, G * Math.min(1, (rows[i].sz + rows[j].sz) / 2));
      let lo = -1, hi = -1;
      if (lead) {
        const li = rows.findIndex((o) => o.c === lead);
        if (li >= 0) { rows[li].pos = rows[li].bx; lo = li; hi = li; }
      }
      if (lo < 0 && n) {
        let a = -1;
        for (let i = 0; i < n; i++) if (rows[i].d <= 0) a = i;
        if (a === -1) { rows[0].pos = rows[0].bx; lo = hi = 0; }
        else if (a === n - 1) { rows[a].pos = rows[a].bx; lo = hi = a; }
        else {
          const b = a + 1;
          const frac = -rows[a].d / Math.max(1e-6, rows[b].d - rows[a].d);
          const S = gapBetween(a, b);
          rows[a].pos = mid - S * frac;
          rows[b].pos = rows[a].pos + S;
          lo = a; hi = b;
        }
      }
      for (let i = lo - 1; i >= 0; i--) rows[i].pos = rows[i + 1].pos - gapBetween(i, i + 1);
      for (let i = hi + 1; i < n; i++) rows[i].pos = rows[i - 1].pos + gapBetween(i - 1, i);
      const dz = depthRef.current || {};
      for (const o of rows) {
        const { c, d, near } = o;
        const tx = (o.pos - o.bx) / Math.max(1e-6, o.ds);
        const tk = o.k;
        const sv = shown.get(c) || { x: tx, k: tk, d };
        // a card WRAPPING from one end of the run to the other changes sides,
        // so its push flips sign. Its path position jumps in that same frame,
        // so the translate jumps with it instead of gliding across the run.
        // (A taper toward the ends did this first, and let pushed cards slide
        // over the tapered ones at Packed density.)
        if (Math.sign(d) !== Math.sign(sv.d) && Math.abs(d - sv.d) > 0.5) sv.x = tx;
        sv.d = d;
        // ease toward the target: quick enough to track the run, slow enough
        // that a hover / leave / focus change is a glide, not a jump
        // tight while the run carries the cards (a loose ease lagged the
        // hand-over into a 75px overlap), a glide for ~0.6s after the pointer
        // or focus changes who leads
        // TIME-based, not per frame: after a long frame (a 680ms stall was
        // measured while other parts of the page loaded) a per-frame ease left
        // the cards a whole step behind the run
        // ALL AXES IN LOCKSTEP (11 Oct 2026, Agam: "translation in all axes
        // should be synced"). The path's x and y and its depth scale come from
        // the engine's animation at this frame's time; the parting, growth,
        // shrink, stacking, haze and brightness are computed here from that
        // SAME frame's progress. Earlier each had its own ease (0.5 for x, 0.35
        // for size and depth), so size and depth trailed the motion by a few
        // frames. Now, while the run carries the cards, every value is the
        // target itself (no lag on any axis); only when hover, focus or a leave
        // CHANGES the target do they glide, all with one shared ease, so they
        // still arrive together.
        const glide = now - leadChanged < 600;
        const a = glide ? 1 - Math.pow(1 - 0.14, dt / 16.7) : 1;
        sv.x += (tx - sv.x) * a;
        sv.k += (tk - sv.k) * a;
        const ak = a;
        // DEPTH IS CONTINUOUS (11 Oct 2026, Agam: "the z axis should gradually
        // change, not abruptly, along the animation timeline"). Each card's
        // "presence" (1 at the centre, falling linearly to the run's ends, and
        // never below its nearness) eases in time like everything else, and
        // drives its stacking, haze, fade and a slight brightness lift. So the
        // nearer card is always in front, and the only order change, between
        // the two cards straddling the centre, lands at the hand-over midpoint
        // where the parting has already pulled them apart. Inline !important,
        // because the engine's keyframes animate z-index, filter and opacity
        // and an animation beats any normal rule.
        // saturates at 1 a little before the exact centre, so a resting card
        // (whose nearness sits just under 1 with the calibrated centre) is fully
        // sharp and bright; still continuous
        const presT = Math.max(smooth(Math.min(1, near * 1.25)), 1 - Math.min(1, Math.abs(d) / 0.5));
        if (sv.p === undefined) sv.p = presT;
        sv.p += (presT - sv.p) * ak;
        const it = c.closest(".pm__item");
        if (it) {
          it.style.setProperty("z-index", String(100 + Math.round(sv.p * 800)), "important");
          // near the centre the filter is an identity: drop it rather than
          // send the card through the filter path for a 0.01px blur
          const bpx = dz.depthBlur ? dz.depthBlur * (1 - sv.p) : 0;
          const blur = bpx >= 0.05 ? `blur(${bpx.toFixed(2)}px) ` : "";
          // the filter goes on the CARD, not the item: WebKit clips a filtered
          // element's painting to about its own box, and the card is translated
          // out of the item by the parting, so in Safari every card lost a
          // straight-edged strip (found on the shaped cards, 11 Oct 2026). The
          // item's keyframed haze is switched off so the two don't stack.
          it.style.setProperty("filter", "none", "important");
          const bright = 0.88 + 0.12 * sv.p;
          c.style.filter = !blur && bright > 0.995 ? "" : `${blur}brightness(${bright.toFixed(3)})`;
          if (dz.depthFade) it.style.setProperty("opacity", (dz.depthFade[0] + (dz.depthFade[1] - dz.depthFade[0]) * sv.p).toFixed(3), "important");
          else it.style.removeProperty("opacity");
        }
        shown.set(c, sv);
        // on the SLOT (card + caption), so the caption stays under the card
        c.parentElement.style.translate = `${sv.x.toFixed(2)}px 0`;
        const slot = c.parentElement;
        const cp = o.capP.toFixed(3);
        if (slot.__capP !== cp) { slot.__capP = cp; slot.style.setProperty("--cap-p", cp); slot.toggleAttribute("data-cap-live", o.capP > 0.02); slot.toggleAttribute("data-cap-on", o.capP > 0.6); }
        c.style.setProperty("--ap-k", sv.k.toFixed(4));
      }
      setActive(best);
      raf = requestAnimationFrame(frame);
    };
    const kick = () => { if (!raf && visible) raf = requestAnimationFrame(frame); };

    const onFocusIn = (e) => { const c = e.target.closest?.(".ap__card"); if (c && e.target.matches(":focus-visible")) focused = c; };
    const onFocusOut = (e) => { const c = e.target.closest?.(".ap__card"); if (c && focused === c) focused = null; };
    stage.addEventListener("focusin", onFocusIn);
    stage.addEventListener("focusout", onFocusOut);
    const ro = new ResizeObserver(() => { cards = []; resized = true; });
    ro.observe(stage);
    const mo = new MutationObserver(() => { cards = []; });
    // data-shape too: a shaped card is square (hello3.css), so its width
    // changes and the parting has to re-read it
    mo.observe(stage, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-shape"] });
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); }, { threshold: 0 });
    io.observe(stage);
    stage.dataset.apContinuous = "true";
    kick();
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(wasTimer);
      io.disconnect(); ro.disconnect(); mo.disconnect();
      stage.removeEventListener("focusin", onFocusIn);
      stage.removeEventListener("focusout", onFocusOut);
      delete stage.dataset.apContinuous;
      stage.querySelectorAll(".ap__card").forEach((c) => { c.style.translate = ""; c.parentElement.style.translate = ""; c.parentElement.style.removeProperty("--cap-p"); c.parentElement.removeAttribute("data-cap-live"); c.parentElement.removeAttribute("data-cap-on"); c.parentElement.__capP = undefined; c.style.removeProperty("--ap-k"); c.style.filter = ""; });
      stage.querySelectorAll(".pm__item").forEach((it) => { it.style.removeProperty("z-index"); it.style.removeProperty("filter"); it.style.removeProperty("opacity"); });
      stage.querySelectorAll(".pm__item[data-ap-active], .pm__item[data-ap-was]").forEach((it) => { delete it.dataset.apActive; delete it.dataset.apWas; });
    };
  }, [reduce, mode]);

  // Each CARD (not each plate: the run repeats plates, and copies should not
  // match) takes a shape from the seed and its place in the run, as an SVG
  // clip-path in objectBoundingBox units, so the video or image inside is
  // clipped and the shape stretches with the card exactly as Compose's
  // RoundedPolygon.toShape() does. Applied once per change, never per frame;
  // a MutationObserver re-applies when the engine rebuilds its items.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || mode !== "cards") return undefined;
    // a shaped card is SQUARE (Agam: the shapes were "almost correct but
    // squished": the clip stretched a 1:1 shape over a 16:9 or 3:4 card).
    // Same area as every other card: opt = sqrt(1 / REF_ASPECT).
    stage.style.setProperty("--ap-opt-square", Math.sqrt(1 / REF_ASPECT).toFixed(4));
    const apply = () => {
      stage.querySelectorAll(".ap__card").forEach((c, i) => {
        let shape = null;
        if (shapeMode !== "rect") {
          const take = shapeMode === "random" || seeded(shapeSeed * 7919 + i * 31 + 1) < 0.5;
          if (take) shape = CARD_SHAPES[Math.floor(seeded(shapeSeed * 104729 + i * 131 + 7) * CARD_SHAPES.length)];
        }
        const v = shape ? `url(#ap-shape-${shape})` : "";
        if (c.style.clipPath !== v) c.style.clipPath = v;
        if (shape) c.dataset.shape = shape;
        else delete c.dataset.shape;
      });
    };
    apply();
    const mo = new MutationObserver(apply);
    mo.observe(stage, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, [shapeMode, shapeSeed, mode]);
  useEffect(() => {
    const root = sectionRef.current;
    // querySelectorAll, not querySelector: this started with one clip in the run
    // and a second was added later, which the single-element version would have
    // silently left decoding off-screen forever.
    const vids = [...(root?.querySelectorAll("video") || [])];
    if (!vids.length) return undefined;
    // perf (11 Oct): one observer PER VIDEO instead of one for the section. The section
    // observer played every clip while any of it was on screen, including the cards the
    // spread trims (display:none, 0x0, still decoding) and the ones the run has carried
    // past the viewport edge: 9 decoders for 6 visible cards, and the frame rate sat at 30.
    // A display:none or off-screen video reports not-intersecting, so it pauses; it plays
    // again when it comes back.
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) e.target.play?.().catch(() => {});
          else e.target.pause?.();
        }
      },
      { threshold: 0 },
    );
    vids.forEach((v) => io.observe(v));
    return () => io.disconnect();
  }, [reduce]);

  return (
    <section className="ap" ref={sectionRef} aria-label="Work along a path">
      <header className="ap__head">
        {/* mtqswfyp: the section heading follows the mode. Visual keeps "Side
            quests!"; Timeline takes the timeline's own title and copy, whose own
            header is hidden while it sits in here. */}
        {mode === "empty" ? (
          <>
            <h2 className="ap__title">
              A journey through <span className="tlx__title-mark">space-time</span> and projects
            </h2>
            <p className="ap__sub">
              I started in ed-tech in 2019 and have not stayed in one category since. A
              research project at AIIMS Rishikesh, a B2B SaaS from zero, a 10-min grocery
              platform, and now an AI travel agent.
            </p>
          </>
        ) : (
          <>
            <h2 className="ap__title">Side quests!</h2>
            {/* mv3ur64j-32e3pd (11 Oct 2026): "Making things worth making" is the
                SUBTITLE of Tony Fadell's book Build: An Unorthodox Guide to Making
                Things Worth Making (Harper Business, 2022): the book's framing
                line, not a sentence quoted from its text, so it is credited as
                the book, not as a quote. */}
            {/* mv4foqt6-46v6r3 / mv4fowhs-fbsm8x (12 Oct 2026): the section's plain
                .ap__sub (Google Sans Flex, muted). "Making things worth making" is
                the subtitle of Tony Fadell's book Build (Harper Business, 2022); the
                credit line was removed on request. */}
            <p className="ap__sub">Making things worth making...</p>{/* three plain periods as Agam wrote them (mv4fp9yr-aap38q) */}
          </>
        )}
      </header>

      <div className={"ap__stage" + (mode === "empty" && !modeTwo ? " ap__stage--empty" : "")} ref={stageRef} style={undefined /* mtr7912e: no locked height in mode 2, the zoomed timeline sets it */}>
        {/* mu9trf5q: "once it's at the center, below that card, there will be a
            bunch of controls that make sense" - this is the first of them, and
            it sits under the middle of the run because that is where the card
            it governs comes to rest. */}
        {mode !== "empty" && (
          <button
            type="button"
            className="ap__play ap__sound"
            data-tip={!cardHasAudio ? "This card has no sound" : soundOn ? "Mute" : "Unmute"}
            aria-label={soundOn ? "Mute" : "Unmute"}
            aria-pressed={!soundOn}
            aria-disabled={!cardHasAudio}
            data-off={!soundOn ? "" : undefined}
            onClick={() => { if (cardHasAudio) toggleSound(); }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M11 5 6 9H3v6h3l5 4z" />
              {soundOn ? (<><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M18.5 5.5a9 9 0 0 1 0 13" /></>) : (<path d="m16 9 5 6M21 9l-5 6" />)}
            </svg>
          </button>
        )}
        {mode !== "empty" && (
          <button
            type="button"
            className="ap__play"
            data-tip={running ? "Pause the run" : "Play the run"}
            aria-label={running ? "Pause the run" : "Play the run"}
            aria-pressed={running}
            onClick={() => setRunning((v) => !v)}
          >
            {/* mv3pitov-madcn7: "a timer-like stroke that fills from 0 to 360
                degrees, timed to the widget". Driven by PathMarquee's own clock
                (onCycle below): it fills through the card's rest and the
                travel to the next card, restarts on each card, and freezes
                whenever the run is held. */}
            <svg className="ap__ring" viewBox="0 0 48 48" aria-hidden>
              <circle className="ap__ring-track" cx="24" cy="24" r="22" pathLength="1" />
              <circle className="ap__ring-fill" ref={ringRef} cx="24" cy="24" r="22" pathLength="1" />
            </svg>
            {running ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                <line x1="9" y1="5" x2="9" y2="19" /><line x1="15" y1="5" x2="15" y2="19" />
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden>
                <path d="M7 4.5 19.5 12 7 19.5z" />
              </svg>
            )}
          </button>
        )}
        {mode === "empty" ? (modeTwo ? <div className="ap__mode2" ref={mode2Ref} style={{ zoom: fit, width: MODE2_W }}>{modeTwo}</div> : null) : (
        <PathMarquee
          preset={preset}
          speed={speed}
          direction={reverse ? "reverse" : "normal"}
          showPath={showPath}
          rotate={rotate}
          repeat={density}
          spacing="x"
          itemWidth={size}
          spread={spread}
          carousel
          playing={running}
          hoverMode={hover}
          scaleRange={DEPTHS[depth].scaleRange}
          depthFade={DEPTHS[depth].depthFade}
          depthBlur={DEPTHS[depth].depthBlur}
          reduce={reduce}
          onCycle={onCycle}
          dwellFor={dwellFor}
          spring={SNAP.spring}
          demo={SNAP.demo}
          className="ap__run"
        >
          {/* Each plate is wrapped in a CARD container (annotation msbodd5p) so
              per-card interaction has somewhere to attach. PathMarquee already
              gives every child a positioned .pm__item, but that box belongs to
              the engine — it carries the offset-path and is rewritten by the
              animation, so it is the wrong place to hang content off. */}
          {PLATES.filter((p) => !p.hidden).map((p) => withCap(p,
            p.embed ? (
              <article key={p.embed} className="ap__card ap__card--embed" style={cardStyle(p)}>
                <div className="ap__plate ap__plate--embed">
                  <iframe
                    // mtrxnqrv asked for a full player, mtrxzp4x then "remove all
                    // youtube controls": no controls, no annotations, no related
                    // videos, the pointer still lands on it (hello3.css). It plays
                    // muted on loop so the card moves with the run.
                    src={`https://www.youtube-nocookie.com/embed/${p.embed}?autoplay=1&mute=1&loop=1&playlist=${p.embed}&controls=0&disablekb=1&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3`}
                    title={p.alt}
                    loading="lazy"
                    allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                </div>
              </article>
            ) : p.video && p.dwell ? (
              // mttj9avx: the cinema always starts from the first frame, not the plate's current time
              <DwellVideo key={p.video} plate={p} onOpen={(el) => openPoster(p, el)} />
            ) : p.video ? (
              <article key={p.video} className="ap__card" style={cardStyle(p)} onClick={(e) => openPoster(p, e.currentTarget)} role="button" tabIndex={0} aria-label={`Open ${p.alt} full size`} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openPoster(p, e.currentTarget); } }}>{/* --ap-opt: equal area, see cardStyle (was mttilgju's per-card `big`) */}
                {/* muted + playsInline are what make autoplay legal on iOS at all;
                    `reduce` swaps it for the poster frame rather than motion. */}
                <video
                  className="ap__plate"
                  src={reduce ? undefined : p.video}
                  poster={p.poster}
                  aria-label={p.alt}
                  autoPlay={!reduce}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  tabIndex={-1}
                />
              </article>
            ) : (
              <article key={p.src} className="ap__card" style={cardStyle(p)} onClick={(e) => openPoster(p, e.currentTarget)} role="button" tabIndex={0} aria-label={`Open ${p.alt} full size`} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openPoster(p, e.currentTarget); } }}>
                <img className="ap__plate" src={p.src} alt={p.alt} loading="lazy" draggable="false" style={p.focus ? { objectPosition: p.focus } : undefined} />
              </article>
            )),
          )}
        </PathMarquee>
        )}
      </div>

      {poster && <Poster start={poster.start} from={poster} reduce={reduce} onClose={closePoster} />}

      {/* the shape library's clip paths, only while shapes are on */}
      {shapeMode !== "rect" && (
        <svg className="ap__shape-defs" width="0" height="0" aria-hidden focusable="false">
          <defs>
            {CARD_SHAPES.map((k) => (
              <clipPath key={k} id={`ap-shape-${k}`} clipPathUnits="objectBoundingBox">
                <path d={MATERIAL_SHAPES[k]} />
              </clipPath>
            ))}
          </defs>
        </svg>
      )}

      {/* mtrxa2m6: the slider panel, replacing the chip rows below (hidden on
          this page by mtrwr8ac). Same state, different control. */}
      <div className={"ap__panel" + (panelOpen ? " ap__panel--open" : "")}>
        <button type="button" className="ap__panel-toggle" aria-expanded={panelOpen} onClick={() => setPanelOpen((v) => !v)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M3 7h11M18 7h3M3 17h3M10 17h11" /><circle cx="16" cy="7" r="2" /><circle cx="8" cy="17" r="2" /></svg>
          Tune
        </button>
        {panelOpen && (
          <div className="ap__panel-body">
            <IndexSlider label="Mode" options={MODES} value={mode} onPick={setMode} />
            <IndexSlider label="Path" options={PATH_KEYS.map((k) => ({ label: PATH_PRESETS[k].label, value: k }))} value={preset} onPick={setPreset} />
            <Slider label="Speed" value={speed} min={1} max={40} onChange={setSpeed} />{/* max was 20 under a default of 24 (11 Oct 2026) */}
            <IndexSlider label="Depth" options={Object.entries(DEPTHS).map(([k, v]) => ({ label: v.label, value: k }))} value={depth} onPick={setDepth} />
            <Slider label="Density" value={density} min={1} max={3} onChange={setDensity} format={(n) => DENSITIES.find((d) => d.value === n)?.label ?? n} />
            <Slider label="Size" value={size} min={80} max={NARROW ? 600 : 240} step={4} onChange={setSize} format={(n) => `${n}px`} />
            <Slider label="Spacing" value={spread} min={0.4} max={NARROW ? 3 : 1.8} step={0.05} onChange={setSpread} format={(n) => n.toFixed(2)} />
            <IndexSlider label="On hover" options={HOVERS} value={hover} onPick={setHover} />
            <Slider label="Edge size" value={edgeSize} min={0.1} max={1} step={0.05} onChange={setEdgeSize} format={(n) => `${Math.round(n * 100)}%`} />
            <IndexSlider label="Shapes" options={SHAPE_MODES} value={shapeMode} onPick={setShapeMode} />
            <button type="button" className="ap__reshuffle" disabled={shapeMode === "rect"} onClick={() => setShapeSeed((n) => n + 1)}>
              Reshuffle shapes
            </button>
            <div className="ap__switches">
              <label className="ap__switch"><input type="checkbox" checked={showPath} onChange={(e) => setShowPath(e.target.checked)} /> The path</label>
              <label className="ap__switch"><input type="checkbox" checked={rotate} onChange={(e) => setRotate(e.target.checked)} /> Face the curve</label>
              <label className="ap__switch"><input type="checkbox" checked={reverse} onChange={(e) => setReverse(e.target.checked)} /> Reverse</label>
            </div>
          </div>
        )}
      </div>

      {/* The controls ARE the exhibit. A path that can only be changed in the
          source is not "customisable" to anyone reading the page. */}
      <div className="ap__controls">
        <Group name="Mode" options={MODES} value={mode} onPick={setMode} />
        <Group
          name="Path"
          options={PATH_KEYS.map((k) => ({ label: PATH_PRESETS[k].label, value: k }))}
          value={preset}
          onPick={setPreset}
        />
        <Group name="Speed" options={SPEEDS} value={speed} onPick={setSpeed} />
        <Group
          name="Depth"
          options={Object.entries(DEPTHS).map(([k, v]) => ({ label: v.label, value: k }))}
          value={depth}
          onPick={setDepth}
        />
        <Group name="Density" options={DENSITIES} value={density} onPick={setDensity} />
        <Group name="Size" options={SIZES} value={size} onPick={setSize} />
        <Group name="Spacing" options={SPREADS} value={spread} onPick={setSpread} />
        <Group name="On hover" options={HOVERS} value={hover} onPick={setHover} />

        <div className="ap__group" role="group" aria-label="Options">
          <span className="ap__label">Show</span>
          <div className="ap__chips">
            <button type="button" className="ap__chip" data-active={showPath ? "true" : undefined}
              aria-pressed={showPath} onClick={() => setShowPath((v) => !v)}>
              The path
            </button>
            <button type="button" className="ap__chip" data-active={rotate ? "true" : undefined}
              aria-pressed={rotate} onClick={() => setRotate((v) => !v)}>
              Face the curve
            </button>
            <button type="button" className="ap__chip" data-active={reverse ? "true" : undefined}
              aria-pressed={reverse} onClick={() => setReverse((v) => !v)}>
              Reverse
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
