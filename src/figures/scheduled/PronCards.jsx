// The "shed-yool / sked-jool" pronunciation pair (Figma Portfolio 2026 node
// 315-29388), rebuilt as layers so the faces can move (annotation mtmk4qua).
// Every layer is the node's own export at 3x; positions are render-bounds
// percentages of the 532x728 content box, which sits centred in the 666x862
// card. Motion runs on `motion` (Framer Motion's engine, MIT).
//
// Behaviour (mtmkbxbx, mtmkcb5l, mtmkcsp0):
//   - each card is a button; press it to hear the word (/pron/uk.m4a, us.m4a)
//   - the character idles at 30% opacity with a slow bob and a blink, and
//     rises to 100% while its clip plays, then settles back
//   - while the clip plays the mouth runs ONE shared two-syllable sequence,
//     the same keyframes for both faces, stretched to the clip's length, so
//     the mouths match and land on the audio
//   - reduced motion: no bob, no blink, opacity still follows the audio
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, animate } from "motion/react";
import { Play as IconPlay, SoundOff as IconSoundOff, SoundHigh as IconSoundHigh } from "iconoir-react";
import spec from "../../../public/figures/scheduled/pron/spec.json";

const BASE = "/figures/scheduled/pron/";
const CARDS = [
  { id: "uk", word: "shed-yool", label: "British English" },
  { id: "us", word: "sked-jool", label: "American English" },
];
const IDLE_OPACITY = 1; // mtmqv8rt: faces stay at full opacity (was 0.3, then 0.5)

const box = (s) => ({ left: s.x + "%", top: s.y + "%", width: s.w + "%" });

// one mouth sequence for both faces: two syllables then rest, as fractions
// of the clip; scaleY opens the mouth downward (origin at the top lip)
// mtmrn76a: the base state is a closed mouth (the open shape squashed to a
// line); it opens on the two syllables and closes again
const MOUTH_CLOSED = 0.28; // mtmsezdt: about 2px taller at rest
const MOUTH_Y = [MOUTH_CLOSED, 1.5, 0.6, 1.4, MOUTH_CLOSED];
const MOUTH_X = [1.1, 0.9, 1.06, 0.94, 1.1];
const MOUTH_T = [0, 0.18, 0.4, 0.62, 0.95];

function Card({ card, still, playing, onPlay, muted, onToggleMute }) {
  const s = spec[card.id];
  const mouth = useRef(null);
  const word = useRef(null);
  const ipa = useRef(null);
  const view = { amount: 0.4 };
  const loop = (duration, extra = {}) => ({ duration, repeat: Infinity, ease: "easeInOut", ...extra });

  // the mouth runs once per play, stretched to the clip
  useEffect(() => {
    if (!playing || !mouth.current) return;
    const ctrl = animate(
      mouth.current,
      { scaleY: MOUTH_Y, scaleX: MOUTH_X },
      { duration: playing.duration, times: MOUTH_T, ease: "easeInOut" },
    );
    // mtmmnuje: a sweep, not a bounce. The word sits dimmed and a full-ink
    // copy is revealed left to right in sync with the clip: the first
    // syllable takes the first part of the word, a beat, then the second.
    // Native Web Animations for the sweep: it keeps time with the audio even
    // when the page's JS frame loop is throttled (background tab).
    const w = word.current && word.current.animate(
      [
        { clipPath: "inset(0 100% 0 0)", offset: 0 },
        { clipPath: "inset(0 52% 0 0)", offset: 0.38 },
        { clipPath: "inset(0 48% 0 0)", offset: 0.5 },
        { clipPath: "inset(0 0% 0 0)", offset: 0.9 },
        { clipPath: "inset(0 0% 0 0)", offset: 1 },
      ],
      { duration: playing.duration * 1000, easing: "ease-in-out", fill: "forwards" },
    );
    if (w) w.stop = () => w.cancel();
    const p = ipa.current && animate(
      ipa.current,
      { opacity: [0.55, 1, 1], y: [4, 0, 0] },
      { duration: Math.max(0.3, playing.duration), times: [0, 0.6, 1], ease: "easeOut" },
    );
    return () => { ctrl.stop(); w && w.stop(); p && p.stop(); };
  }, [playing]);

  return (
    <div className={"pron__card" + (playing ? " is-playing" : "")}>
      {/* mtmlk1wh: two circular icon buttons per card (Iconoir): play, and sound */}
      <div className="pron__btns">
        <button
          type="button"
          className="pron__btn"
          onClick={() => onPlay(card.id)}
          aria-label={`Play the ${card.label} pronunciation, ${card.word}`}
        >
          <IconPlay width={16} height={16} strokeWidth={1.8} aria-hidden="true" />
        </button>
        <button
          type="button"
          className={"pron__btn" + (muted ? " is-muted" : "")}
          onClick={onToggleMute}
          aria-pressed={!muted}
          aria-label={muted ? "Turn sound on" : "Mute"}
        >
          {muted ? <IconSoundOff width={16} height={16} strokeWidth={1.8} aria-hidden="true" /> : <IconSoundHigh width={16} height={16} strokeWidth={1.8} aria-hidden="true" />}
        </button>
      </div>
      <div className="pron__content">
        <img className="pron__layer" style={box(s.label)} src={BASE + card.id + "-label.png"} alt="" draggable="false" />
        <motion.div
          className="pron__head"
          initial={{ opacity: IDLE_OPACITY }}
          animate={{ opacity: playing ? 1 : IDLE_OPACITY }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <motion.div
            className="pron__bob"
            whileInView={still ? undefined : { y: [0, -3, 0] }}
            viewport={view}
            transition={loop(2.8)}
          >
            <img className="pron__layer" style={box(s.orb)} src={BASE + card.id + "-orb.png"} alt="" draggable="false" />
            <motion.img
              className="pron__layer pron__eyes"
              style={{ ...box(s.eyes), transformOrigin: "50% 50%" }}
              src={BASE + card.id + "-eyes.png"}
              alt=""
              draggable="false"
              whileInView={still ? undefined : { scaleY: [1, 1, 0.15, 1, 1] }}
              viewport={view}
              transition={loop(3.6, { times: [0, 0.62, 0.67, 0.72, 1], ease: "linear" })}
            />
            <img
              ref={mouth}
              className="pron__layer pron__mouth"
              style={{ ...box(s.mouth), transformOrigin: "50% 0%", transform: `scaleY(${MOUTH_CLOSED}) scaleX(1.1)` }}
              src={BASE + card.id + "-mouth.png"}
              alt=""
              draggable="false"
            />
          </motion.div>
        </motion.div>
        <div className="pron__layer pron__wordwrap" style={box(s.word)}>
          <img className={"pron__word-base" + (playing ? " is-dim" : "")} src={BASE + card.id + "-word.png"} alt="" draggable="false" />
          <img ref={word} className="pron__word" src={BASE + card.id + "-word.png"} alt="" draggable="false" />
        </div>
        <img ref={ipa} className="pron__layer pron__ipa" style={box(s.ipa)} src={BASE + card.id + "-ipa.png"} alt="" draggable="false" />
      </div>
    </div>
  );
}

export default function PronCards() {
  const still = useReducedMotion();
  const [playing, setPlaying] = useState({}); // id -> { duration }
  const audios = useRef({});
  // mtmkfkfp: sound is OFF by default; one mute and one volume for both
  // cards. A muted press still runs the face (mouth + opacity), silently.
  const [muted, setMuted] = useState(false); // mtmqvk6h: sound on by default (was off, mtmkfkfp)
  useEffect(() => {
    for (const el of Object.values(audios.current)) el.muted = muted;
  }, [muted]);

  useEffect(() => {
    const a = audios.current;
    for (const c of CARDS) {
      // mtmwxee2: real human recordings from Wikimedia Commons (uk: Soundguys,
      // CC0; us: Dvortygirl, CC BY-SA 3.0), trimmed and level-matched; the
      // version tag makes browsers refetch after the swap
      const el = new Audio(BASE + c.id + ".m4a?v=3");
      el.preload = "auto";
      el.muted = false;
      el.volume = 0.8;
      el.addEventListener("ended", () => setPlaying((p) => ({ ...p, [c.id]: null })));
      a[c.id] = el;
    }
    return () => {
      for (const el of Object.values(a)) el.pause();
    };
  }, []);

  const play = (id) => {
    const a = audios.current;
    for (const [k, el] of Object.entries(a)) {
      if (k !== id) { el.pause(); el.currentTime = 0; }
    }
    const el = a[id];
    if (!el) return;
    el.currentTime = 0;
    const start = () => {
      setPlaying((p) => ({ ...Object.fromEntries(Object.keys(p).map((k) => [k, null])), [id]: { duration: el.duration || 0.8, at: Date.now() } }));
      el.play().catch(() => setPlaying((p) => ({ ...p, [id]: null })));
    };
    if (el.readyState >= 1) start();
    else el.addEventListener("loadedmetadata", start, { once: true });
  };

  return (
    <div className="pron">
      {CARDS.map((c) => (
        <Card key={c.id} card={c} still={still} playing={playing[c.id] || null} onPlay={play} muted={muted} onToggleMute={() => setMuted((m) => !m)} />
      ))}
      {/* mtmx0aw8: the recordings credit moved to the page footer (cs.credits) */}
    </div>
  );
}
