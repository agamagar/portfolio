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

import { useEffect, useRef, useState } from "react";
// mttx7x50 follow-up ("icons still look off"): the rings and the cinema close
// used Phosphor bold glyphs, the one family the site does not draw with
// anywhere except the top chip row; Iconoir at 16 / stroke 2 is the house set.
import { Xmark } from "iconoir-react";
import PathMarquee from "./PathMarquee";
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
  { video: "/figures/marquee/away.mp4", poster: "/figures/marquee/away-poster.png", alt: "Away: get away", aspect: "500 / 394", cap: { title: "An agent that never takes the wheel", meta: "Away · 2026", metrics: ["V1 live", "Led interaction design"] } },
  // OdinEye. Transcoded on the way in: the source was HEVC, which Chrome will
  // not play, and 3600x2012 / 3.9MB for a card that renders ~135px wide.
  // Now H.264 yuv420p at 800px, 75KB.
  { video: "/figures/marquee/odineye.mp4", poster: "/figures/marquee/odineye-poster.png", alt: "OdinEye", aspect: "800 / 448", cap: { title: "ZepIris, Zepto’s first open source platform", meta: "Zepto · 2026", metrics: ["100% hub coverage", "Led design end to end"] } },
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
  { video: "/figures/marquee/follow-that-idea.mp4", full: "/figures/marquee/follow-that-idea-full.mp4", poster: "/figures/marquee/follow-that-idea-poster.png", alt: "Follow that idea, the walkthrough", aspect: "16 / 9", big: 1.5, dwell: true, cap: { title: "Follow that idea, the walkthrough", meta: "Zepto · Scheduled delivery · 2025", metrics: ["AOV nearly 2x"] } },
  { src: "/figures/marquee/state-3.png", alt: "Away: deep search running", hidden: true }, // mtrx258e (08 Sep 2026): hidden, kept
  { src: "/figures/marquee/dassh-stella-system.png", alt: "Dassh: Stella, constructed", aspect: "1478 / 1080", hidden: true }, // mtrx1xxd: hidden, kept
  { src: "/figures/marquee/sched-cart-confirmed.png", alt: "Zepto: cart, slot confirmed", hidden: true }, // mtrx44o3: hidden, kept
  { src: "/figures/marquee/night-ui.jpg", alt: "Away: after dark", cap: { title: "After dark", meta: "Away" } },
  { src: "/figures/marquee/market-street.jpg", alt: "Zepto: market street", cap: { title: "Market street", meta: "Zepto" } },
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
function withCap(p, card) {
  return (
    <div className="ap__slot" key={p.video || p.src || p.embed}>
      {card}
      {p.cap && (
        <div className="ap__cap" aria-hidden="true">
          <p className="ap__cap-title">{p.cap.title}</p>
          <p className="ap__cap-meta">{p.cap.meta}</p>
          {p.cap.metrics?.length > 0 && (
            <p className="ap__cap-metrics">
              {p.cap.metrics.map((m) => (
                <span key={m} className="ap__cap-metric">{m}</span>
              ))}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function DwellVideo({ plate, onOpen }) {
  const ref = useRef(null);
  return (
    <article
      className="ap__card ap__card--dwell"
      style={{ aspectRatio: plate.aspect, "--ap-opt": plate.big }}
      onClick={() => onOpen(ref.current)}
    >
      <video ref={ref} className="ap__plate" src={plate.video} poster={plate.poster} muted loop playsInline autoPlay preload="metadata" aria-label={plate.alt} />
    </article>
  );
}
function Cinema({ plate, from, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return undefined;
    v.currentTime = from || 0;
    v.muted = false;
    v.play().catch(() => { v.muted = true; v.play().catch(() => {}); });
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [from, onClose]);
  return (
    <div className="ap__cinema" role="dialog" aria-label={plate.alt} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      {/* mttjkak0: the close is a labelled pill, centred above the video */}
      <div className="ap__cinema-stack">
        <button type="button" className="ap__cinema-close" onClick={onClose}><Xmark width={16} height={16} strokeWidth={2} aria-hidden /><span>Close</span></button>
        <video ref={ref} className="ap__cinema-video" src={plate.full || plate.video} poster={plate.poster} controls playsInline />
      </div>
    </div>
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
  const [speed, setSpeed] = useState(24);
  const [showPath, setShowPath] = useState(false);
  const [rotate, setRotate] = useState(false);
  const [reverse, setReverse] = useState(false);
  const [depth, setDepth] = useState("flat");
  const [density, setDensity] = useState(1);
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
  const [cinema, setCinema] = useState(null); // mttisr5t: { plate, from }
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
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || reduce || mode !== "cards") return undefined;
    const plates = () => stage.querySelectorAll(".ap__card");
    const clear = () => plates().forEach((pl) => { pl.style.translate = ""; });
    const onOver = (e) => {
      const card = e.target.closest(".ap__card");
      if (!card || !stage.contains(card)) return;
      const item = card.closest(".pm__item") || card;
      const hoverK = parseFloat(getComputedStyle(card).getPropertyValue("--ap-hover")) || 1.3;
      const smax = parseFloat(getComputedStyle(item).getPropertyValue("--pm-smax")) || 1;
      const live = parseFloat(item.style.getPropertyValue("--pm-live") || item.style.getPropertyValue("--pm-s")) || 1;
      const r = card.getBoundingClientRect();
      const half = (r.width * (hoverK * smax / live - 1)) / 2;
      const cx = r.left + r.width / 2;
      plates().forEach((c) => {
        if (c === card) { c.style.translate = ""; return; }
        const b = c.getBoundingClientRect();
        c.style.translate = `${b.left + b.width / 2 > cx ? half : -half}px 0`;
      });
    };
    const onOut = (e) => {
      const card = e.target.closest(".ap__card");
      if (!card || card.contains(e.relatedTarget)) return;
      clear();
    };
    stage.addEventListener("pointerover", onOver);
    stage.addEventListener("pointerout", onOut);
    return () => { stage.removeEventListener("pointerover", onOver); stage.removeEventListener("pointerout", onOut); clear(); };
  }, [reduce, mode]);
  useEffect(() => {
    const root = sectionRef.current;
    // querySelectorAll, not querySelector: this started with one clip in the run
    // and a second was added later, which the single-element version would have
    // silently left decoding off-screen forever.
    const vids = [...(root?.querySelectorAll("video") || [])];
    if (!vids.length) return undefined;
    const io = new IntersectionObserver(
      ([e]) => {
        for (const v of vids) {
          if (e.isIntersecting) v.play?.().catch(() => {});
          else v.pause?.();
        }
      },
      { threshold: 0 },
    );
    io.observe(root);
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
            <p className="ap__sub">
              Screens from the work, travelling a curve you can change. Drag the run, or
              rewire it below.
            </p>
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
            className="ap__play"
            data-tip={running ? "Pause the run" : "Play the run"}
            aria-label={running ? "Pause the run" : "Play the run"}
            aria-pressed={running}
            onClick={() => setRunning((v) => !v)}
          >
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
          className="ap__run"
        >
          {/* Each plate is wrapped in a CARD container (annotation msbodd5p) so
              per-card interaction has somewhere to attach. PathMarquee already
              gives every child a positioned .pm__item, but that box belongs to
              the engine — it carries the offset-path and is rewritten by the
              animation, so it is the wrong place to hang content off. */}
          {PLATES.filter((p) => !p.hidden).map((p) => withCap(p,
            p.embed ? (
              <article key={p.embed} className="ap__card ap__card--embed" style={{ aspectRatio: p.aspect }}>
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
              <DwellVideo key={p.video} plate={p} onOpen={() => setCinema({ plate: p, from: 0 })} />
            ) : p.video ? (
              <article key={p.video} className="ap__card" style={{ aspectRatio: p.aspect, "--ap-opt": p.big }}>{/* mttilgju: `big` scales this card's slot (hello.css .ap__card reads --ap-opt) */}
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
              <article key={p.src} className="ap__card" style={p.aspect ? { aspectRatio: p.aspect } : undefined}>
                <img className="ap__plate" src={p.src} alt={p.alt} loading="lazy" draggable="false" />
              </article>
            )),
          )}
        </PathMarquee>
        )}
      </div>

      {cinema && <Cinema plate={cinema.plate} from={cinema.from} onClose={() => setCinema(null)} />}

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
            <Slider label="Speed" value={speed} min={1} max={20} onChange={setSpeed} />
            <IndexSlider label="Depth" options={Object.entries(DEPTHS).map(([k, v]) => ({ label: v.label, value: k }))} value={depth} onPick={setDepth} />
            <Slider label="Density" value={density} min={1} max={3} onChange={setDensity} format={(n) => DENSITIES.find((d) => d.value === n)?.label ?? n} />
            <Slider label="Size" value={size} min={80} max={240} step={4} onChange={setSize} format={(n) => `${n}px`} />
            <Slider label="Spacing" value={spread} min={0.4} max={1.8} step={0.05} onChange={setSpread} format={(n) => n.toFixed(2)} />
            <IndexSlider label="On hover" options={HOVERS} value={hover} onPick={setHover} />
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
