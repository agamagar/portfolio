// The feedback layer, finally expressible on the web.
//
// This implements the SEVEN EVENTS from Claude/Feedback Layer/feedback-base-layer.md.
// It deliberately does not invent a vocabulary: every call site names one of
// toggle / select / navigate / reveal / confirm / reject / boundary, and this file
// is the only place that knows what those feel like. That is the whole point of
// the base layer — the same intention across web, iOS and Android.
//
// ── WHY THIS NOW EXISTS AT ALL ──────────────────────────────────────────────
//
// The spec's own platform table said, of mobile Safari: "None. `navigator.vibrate`
// is not implemented. NO WORKAROUND EXISTS." On that basis section 2 concluded a
// haptic layer on the site was "close to a no-op" and open question 2 answered
// itself "spec-only".
//
// `web-haptics` (MIT, Lochie Axon, zero runtime deps) falsifies that premise. iOS
// 17.4+ ships a native switch control — `<input type="checkbox" switch>` — and the
// system plays a real haptic when it toggles. The library keeps one hidden switch
// in a hidden label and calls `.click()` on the label to fire it. So iOS Safari
// CAN receive haptics; it just cannot be asked politely.
//
// Consequence for us: `toggle` and `select` on this site now reach roughly the
// whole mobile audience rather than Android only. Desktop is still nothing, and
// that part of the spec stands.
//
// ── TWO THINGS ABOUT THE LIBRARY WORTH KNOWING ─────────────────────────────
//
// 1. `WebHaptics.isSupported` is `typeof navigator.vibrate === "function"`. That is
//    the ANDROID test. It is FALSE on iOS, the very platform the switch trick was
//    written for — so never gate the call on it. Internally the library does the
//    right thing: vibrate where it exists, the switch click where it does not.
// 2. It can play a synthesized click through Web Audio, but ONLY when
//    `debug: true`. Checked in the bundle: every `playClick` is behind that flag.
//    Which matters, because "sound defaults OFF on web" is marked non-negotiable
//    in the spec — a portfolio that makes noise at a stranger reads as a demo of
//    the developer, not the designer. We never pass `debug`.

import { WebHaptics } from "web-haptics";
import { playSound } from "./sound";

// The web column of the spec's haptic mapping table, section 4. Durations in ms;
// intensity is the library's own 0-1 and is what lets iOS express more than
// `navigator.vibrate`'s "how many milliseconds" ever could.
//
// The spec's rule "rigid and heavy are a budget" is respected: only `reject` and
// `boundary` sit at the top of the range.
const EVENTS = {
  // a binary state flips and the flip is the point
  toggle: [{ duration: 12, intensity: 0.45 }],
  // a choice commits: chip, filter, card
  select: [{ duration: 8, intensity: 0.3 }],
  // position changes within a sequence. The spec says "lightest, or none"
  navigate: [{ duration: 6, intensity: 0.25 }],
  // content arrives that was not there
  reveal: [{ duration: 10, intensity: 0.4 }, { delay: 40, duration: 14, intensity: 0.55 }],
  // a positive resolution
  confirm: [{ duration: 14, intensity: 0.5 }, { delay: 60, duration: 22, intensity: 0.9 }],
  // refused or invalid. The only event allowed to be sour
  reject: [{ duration: 26, intensity: 0.9 }, { delay: 50, duration: 26, intensity: 0.9 }],
  // the end of a range. NOT reject: hitting the end of a deck is not an error,
  // and the spec is explicit that these two must not share a vocabulary
  boundary: [{ duration: 18, intensity: 0.7 }],
};

let engine = null;
let denied = false;

// REDUCED MOTION SUPPRESSES HAPTICS, and this is a judgement call worth stating.
// The spec says haptics follow the OS system-haptics setting — but the web has no
// such API, so there is nothing to read. `prefers-reduced-motion` is the only
// signal a browser gives about wanting less physical stimulation, and someone who
// has asked for less movement has not asked to be buzzed instead. Easy to revisit:
// it is this one function.
function suppressed() {
  if (denied) return true;
  if (typeof window === "undefined" || !window.matchMedia) return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// LAZY, and on purpose: the library appends a label and a switch to <body> the
// first time it fires. Constructing it at import time would put two nodes in the
// DOM of every visitor including the desktop majority who can never feel any of
// this, and would run before the page has decided anything.
function get() {
  if (engine || suppressed()) return engine;
  try {
    engine = new WebHaptics(); // debug:false and showSwitch:false are the defaults
  } catch {
    denied = true; // never try again, never throw into a click handler
  }
  return engine;
}

/**
 * Fire one of the seven events.
 *
 * ONE EVENT, ONE FEEDBACK, however many things move — section 8. A confirm that
 * animates six elements still gets exactly one `confirm`.
 *
 * Always safe to call: unsupported platforms, reduced motion and any internal
 * failure all no-op silently. Feedback is an enhancement and must never be able
 * to break the interaction it decorates.
 */
export function feedback(event) {
  const pattern = EVENTS[event];
  if (!pattern) {
    if (import.meta.env?.DEV) console.warn(`[feedback] unknown event "${event}" — use one of ${Object.keys(EVENTS).join(", ")}`);
    return;
  }

  // ── SOUND, THE SECOND CHANNEL (annotation msmqar1v) ───────────────────────
  // Fired FIRST, and the order is from the spec §4: "haptic leads sound by a
  // hair, or they fire together" - but a haptic that has to construct its
  // hidden switch on first use takes longer to reach the skin than an
  // already-warm AudioContext takes to reach the ear, so calling sound first is
  // what makes them land together. Both are off by default in their own way:
  // sound needs an explicit preference, haptics need a platform that has them.
  //
  // NAVIGATE GETS ONE CHANNEL, NOT TWO - §6, the load-bearing "when NOT to
  // fire" section, names this exact case. It is the highest-frequency event on
  // the site (every rail month, every marquee step), and doubling it up is how
  // a feedback layer becomes a nuisance. So: sound when the visitor has asked
  // for sound, haptics otherwise, never both.
  const soundOn = typeof document !== "undefined" && document.documentElement.dataset.sound === "on";
  playSound(event);
  if (event === "navigate" && soundOn) return;

  const wh = get();
  if (!wh) return;
  // the promise is deliberately not awaited or surfaced; a rejected haptic is
  // not something a click handler should ever have to think about
  try {
    wh.trigger(pattern)?.catch?.(() => {});
  } catch {
    /* no-op */
  }
}

/**
 * The same seven events, COALESCED — §6: "anything repeated faster than ~120ms.
 * Coalesce. Held key-repeat, a fast swipe through a carousel, and a drag that
 * crosses many snap points get ONE feedback, not forty."
 *
 * This is the call for anything driven by a continuous gesture. Sweeping the
 * rail crosses a hundred months in about a second; firing per month is a buzz,
 * not feedback, and it is the single fastest way to make the layer intolerable.
 *
 * Leading-edge: the first crossing fires immediately, because feedback belongs
 * to the input and a 120ms wait would put it behind the visual. Everything
 * inside the window after that is dropped rather than queued — a trailing fire
 * would land after the gesture had already moved on and describe a position the
 * user had left.
 */
const lastAt = new Map();
export function feedbackCoalesced(event, minGapMs = 120) {
  const now = typeof performance !== "undefined" ? performance.now() : Date.now();
  const prev = lastAt.get(event) || 0;
  if (now - prev < minGapMs) return;
  lastAt.set(event, now);
  feedback(event);
}

export const FEEDBACK_EVENTS = Object.keys(EVENTS);
