// djAudio — a two-deck player/mixer for REAL audio files (no synthesis).
//
// Each deck is an <audio> element streamed through the Web Audio graph:
//   <audio> → MediaElementSource → lowShelf → midPeak → highShelf → volume
//           → analyser → crossfade gain → master compressor → master gain → out
//
// So EQ, channel volume, the equal-power crossfader and the analyser-driven
// reactive visuals all operate on the real track. The one <audio>/source pair
// per deck is created once; loadTrack() just swaps the element's `src`.
//
// "Scratch" jogs playbackRate (media elements can't play in reverse), the
// crossfader blends the two decks, and level()/masterLevel() feed the visuals.

import { TRACKS } from "./djTracks";

const clamp = (v, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));

export default class DjAudio {
  constructor() {
    this.ctx = null;
    this.decks = { a: null, b: null };
    this.deckPlaying = { a: false, b: false };
    this.crossfade = 0.5; // 0 = full A, 1 = full B
    this.masterVol = 0.9;
    this.deckSpec = { a: TRACKS[0], b: TRACKS[1] };
    this.deckTrackKey = { a: TRACKS[0].key, b: TRACKS[1].key };
  }

  ensure() {
    if (this.ctx) return this.ctx;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = new Ctx();
    this.ctx = ctx;

    // master bus
    const master = ctx.createGain();
    master.gain.value = this.masterVol;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -12;
    comp.knee.value = 24;
    comp.ratio.value = 3;
    comp.attack.value = 0.004;
    comp.release.value = 0.2;
    comp.connect(master);
    master.connect(ctx.destination);
    this.masterGain = master;
    const masterAnalyser = ctx.createAnalyser();
    masterAnalyser.fftSize = 256;
    comp.connect(masterAnalyser);
    this.masterAnalyser = masterAnalyser;

    for (const id of ["a", "b"]) {
      const el = new Audio();
      el.loop = true;
      el.preload = "auto";
      el.crossOrigin = "anonymous";
      el.src = this.deckSpec[id].url;
      const source = ctx.createMediaElementSource(el);
      const low = ctx.createBiquadFilter();
      low.type = "lowshelf";
      low.frequency.value = 220;
      const mid = ctx.createBiquadFilter();
      mid.type = "peaking";
      mid.frequency.value = 1000;
      mid.Q.value = 0.9;
      const high = ctx.createBiquadFilter();
      high.type = "highshelf";
      high.frequency.value = 3200;
      const vol = ctx.createGain();
      vol.gain.value = 0.85;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      const xfade = ctx.createGain();
      source.connect(low);
      low.connect(mid);
      mid.connect(high);
      high.connect(vol);
      vol.connect(analyser);
      analyser.connect(xfade);
      xfade.connect(comp);
      this.decks[id] = { el, source, low, mid, high, vol, analyser, xfade, _levels: new Uint8Array(analyser.frequencyBinCount), scratching: false, baseRate: 1 };
    }

    this.applyCrossfade();
    return ctx;
  }

  resume() {
    if (this.ctx && this.ctx.state === "suspended") this.ctx.resume();
  }

  // ---- transport -----------------------------------------------------------

  toggleDeck(id) {
    this.ensure();
    this.resume();
    this.setDeck(id, !this.deckPlaying[id]);
    return this.deckPlaying[id];
  }

  setDeck(id, on) {
    this.ensure();
    this.resume();
    this.deckPlaying[id] = on;
    const d = this.decks[id];
    if (!d) return;
    if (on) d.el.play().catch(() => {});
    else d.el.pause();
  }

  // Swap the track on a deck. If the deck is playing, the new track starts.
  loadTrack(id, track) {
    this.ensure();
    this.deckSpec[id] = track;
    this.deckTrackKey[id] = track.key;
    const d = this.decks[id];
    if (!d) return;
    d.el.src = track.url;
    d.el.load();
    if (this.deckPlaying[id]) d.el.play().catch(() => {});
  }

  // ---- mixer ---------------------------------------------------------------

  setCrossfade(x) {
    this.crossfade = clamp(x);
    this.applyCrossfade();
  }

  applyCrossfade() {
    if (!this.decks.a) return;
    const t = this.crossfade * (Math.PI / 2); // equal-power
    this.decks.a.xfade.gain.value = Math.cos(t);
    this.decks.b.xfade.gain.value = Math.sin(t);
  }

  setVolume(id, v) {
    const d = this.decks[id];
    if (d) d.vol.gain.value = clamp(v);
  }

  // band: "low" | "mid" | "high"; v in [-1, 1] → ±14 dB
  setEq(id, band, v) {
    const d = this.decks[id];
    if (!d) return;
    const gain = clamp(v, -1, 1) * 14;
    if (band === "low") d.low.gain.value = gain;
    else if (band === "mid") d.mid.gain.value = gain;
    else if (band === "high") d.high.gain.value = gain;
  }

  setMasterVolume(v) {
    this.masterVol = clamp(v);
    if (this.masterGain) this.masterGain.gain.value = this.masterVol;
  }

  // pitch / tempo fader: v in [-1, 1] → ±25% speed. Like a real turntable this
  // shifts pitch with tempo (no key-lock) — nudge two decks until they lock.
  setPitch(id, v) {
    const d = this.decks[id];
    if (!d) return;
    d.baseRate = 1 + clamp(v, -1, 1) * 0.25;
    if (!d.scratching) {
      try {
        d.el.playbackRate = d.baseRate;
      } catch (e) {
        /* out of range */
      }
    }
  }

  // ---- scratch (playback-rate jog) -----------------------------------------

  startScratch(id) {
    const d = this.decks[id];
    if (d) d.scratching = true;
  }

  moveScratch(id, angVel) {
    const d = this.decks[id];
    if (!d) return;
    // bend around the deck's current pitch (no reverse on media elements)
    const rate = clamp(d.baseRate * (1 + angVel * 3), 0.25, 3);
    try {
      d.el.playbackRate = rate;
    } catch (e) {
      /* out of range */
    }
  }

  endScratch(id) {
    const d = this.decks[id];
    if (!d) return;
    d.scratching = false;
    try {
      d.el.playbackRate = d.baseRate; // return to the pitch fader position
    } catch (e) {
      /* noop */
    }
  }

  // ---- metering ------------------------------------------------------------

  level(id) {
    const d = this.decks[id];
    if (!d) return 0;
    d.analyser.getByteTimeDomainData(d._levels);
    let sum = 0;
    for (let i = 0; i < d._levels.length; i++) {
      const v = (d._levels[i] - 128) / 128;
      sum += v * v;
    }
    return Math.min(1, Math.sqrt(sum / d._levels.length) * 3.2);
  }

  masterLevel() {
    if (!this.masterAnalyser) return 0;
    const arr = this._masterArr || (this._masterArr = new Uint8Array(this.masterAnalyser.frequencyBinCount));
    this.masterAnalyser.getByteTimeDomainData(arr);
    let sum = 0;
    for (let i = 0; i < arr.length; i++) {
      const v = (arr[i] - 128) / 128;
      sum += v * v;
    }
    return Math.min(1, Math.sqrt(sum / arr.length) * 3);
  }

  // ---- teardown ------------------------------------------------------------

  dispose() {
    for (const id of ["a", "b"]) {
      const d = this.decks[id];
      if (d && d.el) {
        d.el.pause();
        d.el.removeAttribute("src");
        d.el.load();
      }
    }
    if (this.ctx) {
      this.ctx.close().catch(() => {});
      this.ctx = null;
    }
  }
}
