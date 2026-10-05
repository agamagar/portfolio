// The SOUND half of the feedback layer (annotation msmqar1v, "add interface
// sound and haptics across the page").
//
// Haptics already existed in ./feedback.js; this is the channel the spec has
// always described and the site never had. Both are fired by the single
// `feedback(event)` call, so a call site names an intention and never a channel.
//
// Implements §5 of Claude/Feedback Layer/feedback-base-layer.md:
//
//   SYNTHESIZED, NEVER SAMPLED. No mp3s, no sample folder, no licensing
//   question, no network cost. The whole layer is two primitives — a filtered
//   noise `tick` and a pitched `body` — parameterised per event, which is what
//   keeps seven sounds a FAMILY. Seven sample files drift apart; seven calls to
//   one function cannot.
//
//   GAIN CEILING 0.2 against a master the user controls. UI sound competes with
//   music the visitor already has playing and should lose that fight politely.
//   ATTACK UNDER 5ms — a UI sound with a slow attack feels late even when it is
//   on time. NEVER A MELODY: two notes maximum per event.
//
// THE VOICE IS MATERIAL, and that closes the spec's one open decision. The four
// candidates from `feedback-voice-harness.html` (whisper, wood, tuned, glass)
// still ship below so the comparison stays live, but the lock is Google's own
// system: Agam's call, and a better answer than any of the four because it is
// not a taste — it is a published set of rules with reasons attached. See the
// MATERIAL block below for what those rules are and what each one decided.
//
// All five are auditionable side by side at /lab.
//
// ── OFF BY DEFAULT, AND THAT IS NON-NEGOTIABLE ──────────────────────────────
// The spec marks it so, and the site already had the control: the preference
// lives on <html data-sound>, is persisted by App.jsx, and is broadcast as a
// `sound-pref` event. This file only READS it. Nothing here can turn sound on,
// which is the property that matters — a portfolio that makes noise at a
// stranger reads as a demo of the developer, not the designer.

const CEILING = 0.2; // §5.3, per event, against the master

/* ---- primitives, from the harness ---------------------------------------- */

let ctx = null;
let master = null;
let noise = null;
let dead = false;

function noiseBuffer(c, dur) {
  // one buffer, reused: every tick is the same air through a different filter,
  // and regenerating it per event was measurable in the harness
  if (noise && noise.duration >= dur) return noise;
  const n = Math.max(1, Math.ceil(c.sampleRate * dur));
  const b = c.createBuffer(1, n, c.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  noise = b;
  return b;
}

function tick(c, t, { freq = 2000, q = 6, dur = 0.03, gain = 0.3 }) {
  const src = c.createBufferSource();
  src.buffer = noiseBuffer(c, dur + 0.01);
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = freq;
  bp.Q.value = q;
  const g = c.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.001);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(bp).connect(g).connect(master);
  src.start(t);
  src.stop(t + dur + 0.02);
}

function body(c, t, { freq = 220, to = null, type = "sine", dur = 0.12, gain = 0.2, detune = 0 }) {
  const o = c.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  if (detune) o.detune.value = detune;
  const g = c.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + dur + 0.02);
}

/* ---- the voices: Material (locked) + the original four ------------------- */

// ── MATERIAL, the locked voice ──────────────────────────────────────────────
//
// Built from Google's own sound guidelines rather than invented (Agam's call:
// "find the google material sound library and guidelines and build them").
// Sources: m2.material.io/design/sound — About sound, Applying sound to UI,
// Sound attributes — and the Material sound resources library itself, which is
// CC-BY 4.0.
//
// SYNTHESIZED, NOT THE SAMPLES, and that is a deliberate reading of the ask.
// The library ships ~40 mp3s; our own spec §5.1 says "synthesized, never
// sampled — no mp3s, no sample folder, no licensing question, no network cost".
// Shipping Google's audio would also put a CC-BY attribution obligation on a
// personal portfolio. So this implements Material's RULES and its taxonomy in
// Web Audio. Swapping to the real files later is a change of source, not of
// structure — the event names below already match their file names.
//
// WHAT MATERIAL ACTUALLY SAYS, and what each rule buys here:
//
//   TONALITY. "Tonal sounds work best to communicate personality, emotion, and
//   state changes, whereas atonal sounds better support motion transitions and
//   express a sense of haptic feedback." So the state changes (toggle, confirm,
//   reject, boundary) are pitched, and the movement events (select, navigate,
//   reveal) are filtered noise — a tap, not a note.
//
//   MOTIF DIRECTION. "Upward motion commonly indicates starting, openness,
//   positivity, or assurance. Downward motion commonly indicates ending or
//   closedness. Repetition commonly indicates thinking, waiting, or lack of
//   progress." This is the single most useful thing in the document and it
//   decides three sounds outright: confirm rises, toggle rises turning on and
//   falls turning off, and BOUNDARY REPEATS ONE PITCH — "lack of progress" is
//   exactly what hitting the end of a range is.
//
//   TIMBRE. "Brighter timbres feel more rich and playful. Muted timbres feel
//   heavier and serious... Use softer, quieter timbres for low-priority
//   sounds." navigate and select are the most frequent events on the site, so
//   they are the most muted; reject is the only bright one.
//
//   ENVELOPE. "A sharper attack is more energetic... A short decay feels small
//   and fast, a longer decay feels large and slow." Frequent events get sharp
//   attack and short decay; resolutions get room.
//
// AND THE FINDING WORTH KEEPING: Material's own library separates
// `navigation_unavailable-selection` from `alert_error-01..03`. Their system
// draws the same line our spec calls non-negotiable — a boundary is not an
// error — and it is reassuring to find it independently in someone else's.
//
// Event -> the Material library file this is modelled on:
//   toggle    ui_lock / ui_unlock          (skeuomorphic, direction by state)
//   select    ui_tap-variant-01            (atonal tap)
//   navigate  navigation_forward-selection-minimal  ("minimal" = the quiet one)
//   reveal    navigation_transition-right  (motion, therefore atonal)
//   confirm   navigation_selection-complete-celebration / state-change_confirm-up
//   reject    alert_error-01               (the only bright, sour sound)
//   boundary  navigation_unavailable-selection
const VOICES = {
  material: (c, t, ev) => {
    // One pentatonic-free set of intervals: Material asks for simple motifs and
    // "never a melody" is our own §5.3, so nothing here is more than two notes.
    switch (ev) {
      // STATE CHANGES — tonal
      case "toggle": {
        // direction carries the state: on rises, off falls. `data-sound` has
        // already been committed by the time this fires (see App.jsx), so the
        // control that governs sound describes itself accurately.
        const on = typeof document !== "undefined" && document.documentElement.dataset.sound === "on";
        body(c, t, { freq: on ? 523.25 : 622.25, to: on ? 783.99 : 415.3, type: "sine", dur: 0.11, gain: 0.16 });
        tick(c, t, { freq: 2600, q: 6, dur: 0.014, gain: 0.09 });
        break;
      }
      case "confirm":
        // upward, two notes: "positivity, or assurance"
        body(c, t, { freq: 587.33, type: "sine", dur: 0.13, gain: 0.16 });
        body(c, t + 0.085, { freq: 880.0, type: "sine", dur: 0.26, gain: 0.14 });
        tick(c, t, { freq: 3000, q: 8, dur: 0.012, gain: 0.07 });
        break;
      case "reject":
        // the only BRIGHT timbre, and the only one allowed to be sour: a minor
        // second held against itself, falling
        body(c, t, { freq: 415.3, to: 392.0, type: "triangle", dur: 0.2, gain: 0.15 });
        body(c, t, { freq: 440.0, type: "triangle", dur: 0.18, gain: 0.1, detune: -14 });
        break;
      case "boundary":
        // REPETITION = "lack of progress". One pitch, twice, going nowhere -
        // which is the whole message, and is audibly not the error sound.
        body(c, t, { freq: 349.23, type: "sine", dur: 0.075, gain: 0.13 });
        body(c, t + 0.1, { freq: 349.23, type: "sine", dur: 0.075, gain: 0.11 });
        break;

      // MOVEMENT — atonal, "a sense of haptic feedback"
      case "select":
        tick(c, t, { freq: 1900, q: 5, dur: 0.026, gain: 0.2 });
        body(c, t, { freq: 660, to: 560, type: "sine", dur: 0.035, gain: 0.06 });
        break;
      case "navigate":
        // the most frequent event on the site, therefore the most muted: less
        // high-frequency content, shortest decay of anything here
        tick(c, t, { freq: 1200, q: 4, dur: 0.018, gain: 0.13 });
        break;
      case "reveal":
        // a transition, so atonal - but rising, because something opened
        tick(c, t, { freq: 900, q: 2.5, dur: 0.06, gain: 0.14 });
        body(c, t, { freq: 330, to: 494, type: "sine", dur: 0.14, gain: 0.09 });
        break;
      default:
        break;
    }
  },
  whisper: (c, t, ev) => {
    const f = { toggle: 2400, select: 3000, navigate: 3400, reveal: 1800, confirm: 2600, reject: 900, boundary: 1400 }[ev];
    tick(c, t, { freq: f, q: 7, dur: ev === "reveal" ? 0.05 : 0.022, gain: 0.16 });
    if (ev === "confirm") tick(c, t + 0.055, { freq: 3400, q: 8, dur: 0.03, gain: 0.13 });
    if (ev === "reject") tick(c, t + 0.05, { freq: 700, q: 4, dur: 0.04, gain: 0.13 });
  },
  wood: (c, t, ev) => {
    const map = {
      toggle: { f: 190, d: 0.1 }, select: { f: 240, d: 0.085 },
      navigate: { f: 300, d: 0.065 }, reveal: { f: 150, d: 0.16 },
      confirm: { f: 260, d: 0.13 }, reject: { f: 110, d: 0.19 },
      boundary: { f: 130, d: 0.14 },
    }[ev];
    tick(c, t, { freq: map.f * 5, q: 3, dur: 0.02, gain: 0.28 });
    body(c, t, { freq: map.f, to: map.f * 0.72, type: "sine", dur: map.d, gain: 0.26 });
    if (ev === "confirm") body(c, t + 0.08, { freq: map.f * 1.5, to: map.f * 1.2, dur: 0.12, gain: 0.16 });
    if (ev === "boundary") body(c, t + 0.02, { freq: map.f * 0.99, to: map.f * 0.7, dur: 0.16, gain: 0.12, detune: -18 });
  },
  tuned: (c, t, ev) => {
    const S = [293.66, 329.63, 369.99, 440.0, 493.88, 587.33]; // D E F# A B D
    const map = {
      toggle: [S[0]], select: [S[3]], navigate: [S[1], S[2], S[3], S[4], S[5]],
      reveal: [S[0], S[3]], confirm: [S[3], S[5]], reject: [S[0] * 0.945], boundary: [S[0], S[0]],
    }[ev];
    const f = map[0];
    body(c, t, { freq: f, type: "triangle", dur: 0.16, gain: 0.17 });
    body(c, t, { freq: f * 2, type: "sine", dur: 0.07, gain: 0.05 });
    tick(c, t, { freq: f * 6, q: 9, dur: 0.012, gain: 0.07 });
    if (ev === "confirm") body(c, t + 0.09, { freq: map[1], type: "triangle", dur: 0.22, gain: 0.15 });
    if (ev === "reveal") body(c, t + 0.07, { freq: map[1], type: "triangle", dur: 0.2, gain: 0.12 });
    if (ev === "boundary") body(c, t + 0.05, { freq: f * 0.98, type: "triangle", dur: 0.14, gain: 0.1, detune: -30 });
  },
  glass: (c, t, ev) => {
    const f = { toggle: 880, select: 1046, navigate: 1174, reveal: 660, confirm: 1318, reject: 415, boundary: 587 }[ev];
    const dur = ev === "navigate" ? 0.22 : 0.42;
    body(c, t, { freq: f, type: "sine", dur, gain: 0.14 });
    body(c, t, { freq: f, type: "sine", dur: dur * 0.8, gain: 0.07, detune: 9 });
    tick(c, t, { freq: f * 3, q: 10, dur: 0.01, gain: 0.06 });
    if (ev === "confirm") body(c, t + 0.1, { freq: f * 1.5, type: "sine", dur: 0.5, gain: 0.1 });
    if (ev === "reject") body(c, t + 0.02, { freq: f * 0.97, type: "sine", dur: 0.34, gain: 0.09, detune: -22 });
  },
};

// THE LOCK. One line to audition a different voice against the live site; the
// harness beside the spec is where they are compared side by side.
export const VOICE = "material";

/* ---- the preference, read only ------------------------------------------- */

function wanted() {
  if (typeof document === "undefined") return false;
  return document.documentElement.dataset.sound === "on";
}

/* ---- the context, built on the gesture that needs it ---------------------- */

// LAZY, and it has to be: an AudioContext constructed before a user gesture
// starts `suspended` in every browser, and one constructed at import time is a
// resource held open for the majority of visitors who never turn sound on.
// Built on the first event that actually wants to make a noise, which is by
// definition inside a gesture.
function engine() {
  if (dead) return null;
  if (ctx) {
    // Safari suspends the context when the tab is backgrounded and does not
    // resume it on its own; without this the first sound after coming back is
    // silently dropped.
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    return ctx;
  }
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) { dead = true; return null; }
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = CEILING;
    master.connect(ctx.destination);
    return ctx;
  } catch {
    dead = true; // never try again, never throw into a click handler
    return null;
  }
}

/**
 * Play one of the seven events, if and only if the visitor has asked for sound.
 *
 * Safe to call anywhere: no preference, no Web Audio, a suspended context or any
 * internal failure all no-op silently. Like the haptic half, this decorates an
 * interaction and must never be able to break it.
 */
export function playSound(event, voiceName = VOICE) {
  if (!wanted()) return;
  const voice = VOICES[voiceName];
  if (!voice) return;
  const c = engine();
  if (!c) return;
  try {
    voice(c, c.currentTime + 0.001, event);
  } catch {
    /* no-op */
  }
}

/**
 * Audition any voice regardless of the saved preference — for /lab only.
 *
 * It exists because the bench has to make a noise to be a bench, and `wanted()`
 * is deliberately the only gate in this file. Rather than weaken that gate for
 * everyone, this is a separate door: nothing on the public site imports it, and
 * it cannot be reached without landing on an unlisted page and pressing a
 * button, which is consent by any reading.
 */
export function auditionSound(event, voiceName = VOICE) {
  const voice = VOICES[voiceName];
  if (!voice) return;
  const c = engine();
  if (!c) return;
  try {
    voice(c, c.currentTime + 0.001, event);
  } catch {
    /* no-op */
  }
}

export const VOICE_NAMES = Object.keys(VOICES);

/* ---- motion CUES (28 Sep, muku9xkn) ---------------------------------------
   Sound for ANIMATION, not interaction, per the motion-sound doctrine
   (~/.claude/skills/motion-sound/references/doctrine.md): motion is ATONAL
   (rule 1), upward = starting (rule 2), repeats vary (rule 5), soft attack =
   ambient (rule 6). Same primitives as the Material voice so the hero is one
   family with the UI sounds (rule 4), same gate (silent unless the toggle is
   on) and every cue under the per-event CEILING.
     morph     a bright crackle, rising: a shape turns into another
     morphBack the same gesture, lower and softer (a repeat must vary)
     swell     filtered noise opening over `dur` seconds: a bloom            */
function sweep(c, t, { from = 400, to = 3200, dur = 1.2, q = 1.2, gain = 0.12 }) {
  const src = c.createBufferSource();
  src.buffer = noiseBuffer(c, dur + 0.05);
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.Q.value = q;
  bp.frequency.setValueAtTime(from, t);
  bp.frequency.exponentialRampToValueAtTime(to, t + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + dur * 0.8); // soft attack: ambient
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.25);
  src.connect(bp).connect(g).connect(master);
  src.start(t);
  src.stop(t + dur + 0.3);
}
const CUES = {
  // a card flipping up into place: skeuomorphic (doctrine rule 10, the Card
  // gesture), a papery flick then a soft landing, non-harmonic
  flip: (c, t) => {
    sweep(c, t, { from: 2600, to: 900, dur: 0.12, q: 1.6, gain: 0.08 });
    tick(c, t + 0.13, { freq: 520, q: 1.8, dur: 0.045, gain: 0.14 });
  },
  morph: (c, t) => {
    tick(c, t, { freq: 3400, q: 5, dur: 0.018, gain: 0.12 });
    tick(c, t + 0.035, { freq: 4200, q: 6, dur: 0.014, gain: 0.08 });
    sweep(c, t, { from: 900, to: 5200, dur: 0.22, q: 2.5, gain: 0.09 });
  },
  morphBack: (c, t) => {
    tick(c, t, { freq: 2600, q: 5, dur: 0.018, gain: 0.09 });
    sweep(c, t, { from: 3800, to: 1100, dur: 0.24, q: 2.5, gain: 0.07 });
  },
  swell: (c, t, dur = 1.2) => {
    sweep(c, t, { from: 300, to: 2400, dur, q: 1.1, gain: Math.min(CEILING, 0.13) });
    body(c, t + dur * 0.55, { freq: 196, to: 293.66, type: "sine", dur: dur * 0.6, gain: 0.05 });
  },
};
/** Fire a motion cue at an animation beat. Same gate as playSound. */
export function playCue(name, arg) {
  if (!wanted()) return;
  const cue = CUES[name];
  if (!cue) return;
  const c = engine();
  if (!c) return;
  try {
    cue(c, c.currentTime + 0.001, arg);
  } catch {
    /* no-op */
  }
}

/** Run `fn(ctx, master)` through the site's audio graph, under the same gate as
 *  playSound (silent unless the sound toggle is on). Lets the motion-sound
 *  engine's voice() render into the site mix (28 Sep, muku9xkn / mukuloci). */
export function withAudio(fn) {
  if (!wanted()) return;
  const c = engine();
  if (!c || !master) return;
  try { fn(c, master); } catch { /* no-op */ }
}
