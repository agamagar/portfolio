// djAnalysis — lightweight offline waveform analysis so the auto-mix loop can
// transition on the music instead of a blind timer. For each track we decode
// the file once (cached), compute an RMS energy envelope, and estimate a BPM
// from that envelope's onset autocorrelation.
//
// The scheduling goal mirrors how club DJs actually pick a transition point:
// they don't mix on a clock, they wait for the track's own structure to offer
// one up. Two moves cover almost every real transition —
//   · mix DURING A BREAKDOWN — a sustained low-energy stretch (the vocal/drums
//     drop out) is the forgiving, "professional" moment to blend two tracks;
//     nothing clashes because neither track is doing much there.
//   · CUT ON THE DROP — if no real breakdown shows up, snap the transition to
//     the instant energy spikes (a hard hit / drop), which reads as a bold,
//     intentional cut instead of an accidental one.
// findBestTransitionPoint() scans the outgoing track's own smoothed energy
// curve forward from "now" and picks whichever of those two moments is
// strongest — with no fixed wait: it could be 3 seconds away or 90.
//
// This is intentionally cheap — no beat-grid time-stretching or key detection,
// just enough signal to make the auto-mix feel like it's listening.

const cache = new Map(); // track.key -> Promise<Analysis>
let sharedCtx = null;

function getCtx() {
  if (!sharedCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    sharedCtx = new Ctx();
  }
  return sharedCtx;
}

function mixDown(buffer) {
  const ch0 = buffer.getChannelData(0);
  if (buffer.numberOfChannels === 1) return ch0;
  const ch1 = buffer.getChannelData(1);
  const out = new Float32Array(ch0.length);
  for (let i = 0; i < ch0.length; i++) out[i] = (ch0[i] + ch1[i]) / 2;
  return out;
}

// RMS energy in fixed-size hops across the whole track.
function computeEnvelope(mono, hopSize) {
  const n = Math.max(1, Math.floor(mono.length / hopSize));
  const env = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    let sum = 0;
    const start = i * hopSize;
    const end = Math.min(mono.length, start + hopSize);
    for (let j = start; j < end; j++) sum += mono[j] * mono[j];
    env[i] = Math.sqrt(sum / Math.max(1, end - start));
  }
  return env;
}

// Onset-novelty autocorrelation over the 80-175bpm range — cheap (hop range is
// only ~15-35 lags) and good enough to pick a beat period, not a full grid.
function estimateBpm(env, hopSec) {
  const novelty = new Float32Array(env.length);
  for (let i = 1; i < env.length; i++) novelty[i] = Math.max(0, env[i] - env[i - 1]);
  const minBpm = 80, maxBpm = 175;
  const minLag = Math.max(1, Math.round(60 / maxBpm / hopSec));
  const maxLag = Math.max(minLag + 1, Math.round(60 / minBpm / hopSec));
  let bestLag = minLag, bestScore = -Infinity;
  for (let lag = minLag; lag <= maxLag; lag++) {
    let score = 0;
    for (let i = 0; i + lag < novelty.length; i++) score += novelty[i] * novelty[i + lag];
    if (score > bestScore) { bestScore = score; bestLag = lag; }
  }
  return 60 / (bestLag * hopSec);
}

async function decode(url) {
  const res = await fetch(url);
  const buf = await res.arrayBuffer();
  // decodeAudioData detaches the buffer; a live AudioContext decodes fine
  // without ever routing the result anywhere.
  return getCtx().decodeAudioData(buf);
}

// Centered moving average — damps per-hop noise so "low energy" reads as a
// sustained breakdown (many seconds) rather than one quiet transient.
function smoothEnergy(env, windowHops) {
  const n = env.length;
  const prefix = new Float64Array(n + 1);
  for (let i = 0; i < n; i++) prefix[i + 1] = prefix[i] + env[i];
  const half = Math.floor(windowHops / 2);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const lo = Math.max(0, i - half);
    const hi = Math.min(n - 1, i + half);
    out[i] = (prefix[hi + 1] - prefix[lo]) / (hi - lo + 1);
  }
  return out;
}

async function build(track) {
  const audioBuffer = await decode(track.url);
  const hopSize = 2048; // ~46ms at 44.1kHz — coarse but plenty for envelope + tempo
  const hopSec = hopSize / audioBuffer.sampleRate;
  const mono = mixDown(audioBuffer);
  const envelope = computeEnvelope(mono, hopSize);
  const bpm = estimateBpm(envelope, hopSec);
  const smoothed = smoothEnergy(envelope, Math.max(1, Math.round(2 / hopSec))); // ~2s window
  let avg = 0;
  for (let i = 0; i < envelope.length; i++) avg += envelope[i];
  avg = envelope.length ? avg / envelope.length : 0;
  return { bpm, hopSec, envelope, smoothed, avgEnergy: avg, duration: audioBuffer.duration };
}

// Cached, de-duped analysis. Safe to call repeatedly for the same track.
export function analyzeTrack(track) {
  if (!cache.has(track.key)) {
    cache.set(track.key, build(track).catch((err) => {
      cache.delete(track.key); // let a retry happen later, don't poison the cache
      throw err;
    }));
  }
  return cache.get(track.key);
}

// Energy (0..~1, relative to the track's own average) at a point in playback
// time, wrapping for looped decks.
export function relativeEnergyAt(analysis, timeSec) {
  const { envelope, hopSec, avgEnergy } = analysis;
  if (!envelope.length || !avgEnergy) return 0.5;
  const t = ((timeSec % (envelope.length * hopSec)) + envelope.length * hopSec) % (envelope.length * hopSec);
  const i = Math.min(envelope.length - 1, Math.floor(t / hopSec));
  return envelope[i] / avgEnergy;
}

// Scan forward from `fromTimeSec` (wrapping for looped decks) on `bars`-beat
// phrase boundaries — assuming beat 0 sits at buffer offset 0, a simplification
// good enough to land near a downbeat rather than mid-bar — and score each
// candidate by its smoothed energy relative to the track's own average.
// No fixed wait: the return could be a few seconds out or most of `horizonSec`,
// whichever phrase boundary is the deepest breakdown or the sharpest hit.
export function findBestTransitionPoint(analysis, fromTimeSec, { bars = 8, horizonSec = 180 } = {}) {
  const { smoothed, hopSec, avgEnergy, bpm } = analysis;
  if (!smoothed?.length || !avgEnergy || !bpm) {
    return { atSec: fromTimeSec + 8, kind: "blend", strength: 0 };
  }
  const beatPeriod = 60 / bpm;
  const phrase = beatPeriod * bars;
  const trackLenSec = smoothed.length * hopSec;
  let bestLow = null; // deepest breakdown found (lowest relative energy)
  let bestHigh = null; // sharpest hit found (highest relative energy)
  const firstOffset = phrase - (fromTimeSec % phrase);
  for (let t = firstOffset; t <= horizonSec; t += phrase) {
    const atSec = fromTimeSec + t;
    const idx = Math.min(smoothed.length - 1, Math.floor((atSec % trackLenSec) / hopSec));
    const rel = smoothed[idx] / avgEnergy;
    if (!bestLow || rel < bestLow.rel) bestLow = { atSec, rel };
    if (!bestHigh || rel > bestHigh.rel) bestHigh = { atSec, rel };
  }
  // A real breakdown (well below average, sustained by the smoothing window)
  // is the safer, more "professional" move — prefer it whenever one exists.
  if (bestLow && bestLow.rel < 0.55) {
    return { atSec: bestLow.atSec, kind: "breakdown", strength: 1 - bestLow.rel };
  }
  // No lull worth waiting for — ride the loudest hit in range as a hard cut.
  if (bestHigh && bestHigh.rel > 1.25) {
    return { atSec: bestHigh.atSec, kind: "drop", strength: bestHigh.rel - 1 };
  }
  // Nothing decisive nearby: take the best (lowest-energy) candidate anyway,
  // it's still the gentlest spot on offer.
  return { atSec: bestLow ? bestLow.atSec : fromTimeSec + phrase, kind: "steady", strength: 0 };
}
