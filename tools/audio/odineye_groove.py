#!/usr/bin/env python3
"""OdinEye groove: an ORIGINAL French-house / robot-funk loop (no samples, no vocals).

Rendered fully in numpy, offline, reproducibly (fixed RNG seed).

  python3 tools/audio/odineye_groove.py            # -> public/figures/marquee/odineye-groove.{m4a,mp3}

Needs numpy, scipy and ffmpeg on PATH.

TEMPO. The loop is 16 bars (64 beats) and is locked to the OdinEye video: the clip is
8.7 s, so 4 clips = 34.8 s = 16 bars -> 110.34 BPM. To change the feel:
  --bpm 118          free tempo (loop gets shorter/longer and is NO LONGER 4 video loops;
                     the site code syncs by phase modulo the clip length, so keep the
                     default unless the clip changes)
  --clip 8.7 --clips 4   re-lock to a different clip (BPM is derived = 64 beats / (clip*clips))
SOUND. Everything musical lives in the CONFIG block below: KEY (root MIDI note), CHORDS
(4-chord loop, one per bar), LEAD (motif as (step16, semitone, length16, vowel)), the vowel
formant table, and the per-layer LEVELS dict. Mute a layer by setting its level to 0.
"""
import argparse, subprocess, os, sys, tempfile, re
import numpy as np
from scipy import signal
from scipy.io import wavfile

# ------------------------------------------------------------------ CONFIG
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "public", "figures", "marquee")
OUT_NAME = "odineye-groove"
SR = 44100
OS = 2                      # internal oversampling (keeps the saws clean)
BEATS_PER_BAR, BARS = 4, 16
TARGET_LUFS = -16.0
KEY = 38                    # D2 (MIDI) = root of the progression
# one chord per bar, repeated 4x over the 16 bars. (root offset from KEY, chord tones)
CHORDS = [
    (0,  [0, 3, 7, 10, 14]),    # Dm9
    (-4, [0, 4, 7, 11, 14]),    # Bbmaj9   (root = KEY-4)
    (-9, [0, 4, 7, 11, 14]),    # Fmaj9    (root = KEY-9 -> F1; stabs sit an octave up)
    (-2, [0, 4, 7, 10, 14]),    # C9
]
# Stab rhythm in 16ths over one bar (the classic "bum-ba-da bum" push)
STAB_STEPS = [(0, 3), (3, 2), (6, 2), (10, 2), (13, 2)]  # (start16, length16)
# Bass: (step16, semitone-from-root, length16); octaves and ghost notes give the funk
BASS = [(0, 0, 2), (3, 0, 1), (4, 12, 1), (6, 7, 1), (8, 0, 2), (11, 0, 1), (12, 10, 1), (14, 7, 2)]
# Talkbox-ish lead: (step16 in a 2-bar phrase, semitone from KEY+24, length16, vowel)
LEAD = [
    (0, 7, 2, "o"), (2, 10, 2, "a"), (4, 12, 4, "o"), (10, 10, 2, "e"), (12, 7, 2, "a"),
    (16, 5, 2, "o"), (18, 7, 2, "a"), (20, 10, 6, "u"), (28, 12, 2, "e"), (30, 14, 2, "a"),
]
# vowel -> three formant centres (Hz): the "vocoder" colour; notes glide between vowels
FORMANTS = {"a": (800, 1150, 2900), "o": (450, 800, 2830), "e": (400, 2000, 2800),
            "u": (325, 700, 2700), "i": (270, 2300, 3000)}
LEVELS = dict(kick=1.2, clap=4.5, hat=0.5, ohat=0.6, bass=0.75, stab=0.9, lead=0.55,
              riser=0.5, fx=0.7)
SEED = 7
# ------------------------------------------------------------------------


def mtof(m): return 440.0 * 2 ** ((np.asarray(m, dtype=float) - 69) / 12)


def build(bpm, loop_sec):
    sr = SR * OS
    n = int(round(loop_sec * sr))
    rng = np.random.default_rng(SEED)
    beat = 60.0 / bpm
    s16 = beat / 4
    stereo = lambda: np.zeros((2, n))
    bus = {k: stereo() for k in LEVELS}
    kick_env = np.zeros(n)                         # for the sidechain

    def put(track, t, sig, pan=0.0):
        """add a mono signal at time t (s), wrapping round the loop end (seamless tails)"""
        i = int(round(t * sr)) % n
        gl, gr = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        m = len(sig)
        for ch, g in ((0, gl), (1, gr)):
            if g == 0: continue
            k = min(m, n - i)
            track[ch, i:i + k] += sig[:k] * g
            if k < m: track[ch, :m - k] += sig[k:] * g

    def tt(d): return np.arange(int(d * sr)) / sr

    def noise(d): return rng.standard_normal(int(d * sr))

    def biquad_sweep(x, f_of_t, q, kind="low", block=128):
        """time-varying RBJ biquad, coefficients per block, state carried over"""
        y = np.empty_like(x); zi = np.zeros(2)
        f_of_t = np.broadcast_to(f_of_t, x.shape)
        for a in range(0, len(x), block):
            f = float(np.clip(f_of_t[a:a + block].mean(), 20, sr * 0.45))
            w = 2 * np.pi * f / sr; al = np.sin(w) / (2 * q); c = np.cos(w)
            if kind == "low": b = [(1 - c) / 2, 1 - c, (1 - c) / 2]
            elif kind == "high": b = [(1 + c) / 2, -(1 + c), (1 + c) / 2]
            else: b = [al, 0, -al]
            ac = [1 + al, -2 * c, 1 - al]
            b = np.array(b) / ac[0]; ac = np.array(ac) / ac[0]
            y[a:a + block], zi = signal.lfilter(b, ac, x[a:a + block], zi=zi)
        return y

    # ---------------- drums
    def kick():
        t = tt(0.5)
        f = 46 + 110 * np.exp(-t * 38)
        ph = 2 * np.pi * np.cumsum(f) / sr
        body = np.sin(ph) * np.exp(-t * 7.5)
        click = noise(0.5) * np.exp(-t * 600) * 0.25
        return np.tanh(1.8 * (body + click)) * 0.9

    def clap():
        t = tt(0.35); x = noise(0.35)
        x = signal.sosfilt(signal.butter(2, [900, 3800], "bp", fs=sr, output="sos"), x)
        env = sum(np.exp(-np.clip(t - d, 0, None) * 90) * (t >= d) for d in (0, 0.011, 0.023)) * 0.5
        env += np.exp(-t * 16) * (t >= 0.03)
        return x * env * 0.5

    def hat(d, open_=False):
        x = signal.sosfilt(signal.butter(3, 7500, "hp", fs=sr, output="sos"), noise(d))
        t = tt(d); return x * np.exp(-t * (14 if open_ else 70))

    kk, cl, hh, oh = kick(), clap(), hat(0.06), hat(0.3, True)
    for bar in range(BARS):
        b0 = bar * BEATS_PER_BAR * beat
        for b in range(4):
            tk = b0 + b * beat
            put(bus["kick"], tk, kk)
            i0 = int(round(tk * sr)) % n               # kick envelope for the pump
            e = np.exp(-tt(0.45) * 5.0)
            idx = (i0 + np.arange(len(e))) % n
            kick_env[idx] = np.maximum(kick_env[idx], e)
            if b in (1, 3): put(bus["clap"], tk, cl, 0.1)
            put(bus["ohat"], tk + beat / 2, oh, 0.25)    # offbeat open hat
            for k in range(4):                           # 16th closed hats, ghosted
                if k % 2 == 1 or (k == 0 and b % 2):
                    put(bus["hat"], tk + k * s16, hh * (0.55 if k == 2 else 0.8 + 0.2 * rng.random()), -0.2)

    # ---------------- bass: saw+square through a plucky resonant lowpass
    def bass_note(freq, d):
        t = tt(d + 0.06)
        ph = 2 * np.pi * np.cumsum(np.full(len(t), freq)) / sr
        x = 0.6 * signal.sawtooth(ph) + 0.5 * np.sign(np.sin(ph)) * 0.6 + 0.5 * np.sin(ph)
        env = np.minimum(1, t * 400) * np.exp(-np.clip(t - d, 0, None) * 60)
        cut = 180 + 1400 * np.exp(-t * 14)
        x = biquad_sweep(x, cut, 2.2, "low")
        return np.tanh(x * env * 1.5) * 0.7

    for bar in range(BARS):
        root = KEY - 12 + CHORDS[bar % 4][0]
        for (st, semi, ln) in BASS:
            t0 = bar * BEATS_PER_BAR * beat + st * s16
            put(bus["bass"], t0, bass_note(mtof(root + semi), ln * s16 * 0.9))

    # ---------------- chord stabs: 5-voice detuned saws, resonant LP opening over time
    def stab(notes, d, pan_seed):
        t = tt(d + 0.25); out = np.zeros(len(t))
        for m in notes:
            for dt in (-9, -3, 4, 10):
                f = mtof(m) * 2 ** (dt / 1200)
                ph = 2 * np.pi * np.cumsum(np.full(len(t), f)) / sr + rng.random() * 6.28
                out += signal.sawtooth(ph)
        env = np.minimum(1, t * 600) * np.exp(-np.clip(t - d, 0, None) * 14) * np.exp(-t * 2.0)
        return out * env / (len(notes) * 4) * 2.2

    sweep_x = np.arange(n) / n
    # LP cutoff over the whole 16 bars: closed -> open for bars 1-12, dips, then the build
    bar_pos = sweep_x * BARS
    cut = 700 + 900 * np.clip(bar_pos / 4, 0, 1) + 1800 * np.clip((bar_pos - 8) / 4, 0, 1) \
        + 6500 * np.clip((bar_pos - 12) / 4, 0, 1) ** 2
    cut *= 1 + 0.15 * np.sin(2 * np.pi * bar_pos * 2)       # slow wobble
    stab_raw = stereo()
    for bar in range(BARS):
        if bar < 4: continue                                 # bars 1-4: drums+bass only
        rt, tones = CHORDS[bar % 4]
        notes = [KEY + 12 + rt + x for x in tones]
        for (st, ln) in STAB_STEPS:
            t0 = bar * BEATS_PER_BAR * beat + st * s16
            put(stab_raw, t0, stab(notes, ln * s16, 0), rng.uniform(-0.45, 0.45))
    for ch in (0, 1):
        stab_raw[ch] = biquad_sweep(stab_raw[ch], cut, 3.0, "low")
    bus["stab"] = stab_raw * (1 - 0.8 * kick_env)           # SIDECHAIN PUMP

    # ---------------- talkbox-ish lead (bars 9-16): saw -> 3 gliding formant resonators
    def lead_note(freq, d, v0, v1):
        t = tt(d + 0.12); m = len(t)
        vib = 1 + 0.004 * np.sin(2 * np.pi * 5.5 * t) * np.minimum(1, t * 4)
        ph = 2 * np.pi * np.cumsum(freq * vib * np.full(m, 1.0)) / sr
        src = signal.sawtooth(ph) + 0.4 * np.sign(np.sin(ph * 0.5))
        out = np.zeros(m)
        for k in range(3):
            fa, fb = FORMANTS[v0][k], FORMANTS[v1][k]
            fc = fa + (fb - fa) * np.clip(t / max(d, 1e-3), 0, 1) ** 1.5
            out += biquad_sweep(src, fc, (6, 9, 12)[k], "band", block=64) * (1.0, 0.7, 0.35)[k]
        env = np.minimum(1, t * 120) * np.exp(-np.clip(t - d, 0, None) * 30)
        return np.tanh(out * env * 2.2) * 0.5

    lead_dry = stereo()
    for bar2 in range(BARS // 2):
        if bar2 < 4: continue                                # 2-bar phrase, from bar 9
        for i, (st, semi, ln, v) in enumerate(LEAD):
            nv = LEAD[(i + 1) % len(LEAD)][3]
            t0 = bar2 * 2 * BEATS_PER_BAR * beat + st * s16
            put(lead_dry, t0, lead_note(mtof(KEY + 24 + semi), ln * s16, v, nv if ln < 4 else v), 0.0)
    # dotted-8th echo, ping-pong
    d_samp = int(round(beat * 0.75 * sr)); lead = lead_dry.copy()
    for k, g in ((1, 0.45), (2, 0.22), (3, 0.1)):
        for ch in (0, 1):
            lead[(ch + k) % 2] += np.roll(lead_dry[ch], d_samp * k) * g
    bus["lead"] = lead

    # ---------------- build (bars 13-16): noise riser sweep + snare roll + reversed-ish swell
    rs = noise(loop_sec); rs = np.zeros(n); rs += rng.standard_normal(n)
    r0 = int(12 / BARS * n); span = n - r0
    amt = np.zeros(n); amt[r0:] = (np.arange(span) / span) ** 2.2
    riser = biquad_sweep(rs, 300 + 9000 * amt, 1.4, "band") * amt
    bus["riser"] = np.stack([riser, np.roll(riser, 40)])
    snare_hit = signal.sosfilt(signal.butter(2, [1500, 6000], "bp", fs=sr, output="sos"), noise(0.2)) * np.exp(-tt(0.2) * 25)
    t = 14 * BEATS_PER_BAR * beat
    for k in range(32):                                       # 16ths -> 32nds accelerating roll, bars 15-16
        tk = 14 * BEATS_PER_BAR * beat + (k ** 1.15) * s16 * 0.55
        if tk < loop_sec: put(bus["fx"], tk, snare_hit * (0.25 + 0.75 * k / 32), 0.0)

    # ---------------- mix (at oversampled rate), reverb send for stabs/lead/clap
    def reverb(x, sec=1.1):
        ir = noise(sec) * np.exp(-tt(sec) * 4.2)
        ir = signal.sosfilt(signal.butter(2, 6000, "lp", fs=sr, output="sos"), ir)
        ir = ir / np.sqrt((ir ** 2).sum())                   # unit-energy IR
        full = [signal.fftconvolve(x[c], ir) for c in (0, 1)]
        # circular: the tail wraps onto the loop start so the seam stays seamless
        return np.stack([f[:n] + np.pad(f[n:], (0, max(0, n - len(f[n:]))))[:n] for f in full])
    wet = reverb(bus["stab"] * 0.5 + bus["lead"] * 0.5 + bus["clap"] * 0.6)
    print('  stem RMS dB:', {k: round(20*np.log10(np.sqrt((bus[k]**2).mean())*LEVELS[k]+1e-9),1) for k in bus})
    mix = sum(bus[k] * LEVELS[k] for k in bus) + wet * 0.35
    mix = mix[:, :n] * 0.16                                   # headroom before the master saturator
    # master: gentle bus compression via tanh, high-pass the rumble, decimate to SR
    mix = np.stack([signal.sosfilt(signal.butter(2, 28, "hp", fs=sr, output="sos"), mix[c]) for c in (0, 1)])
    mix = np.tanh(mix * 1.1) / np.tanh(1.1)
    out = signal.resample_poly(mix, 1, OS, axis=1)
    return out


def lufs(path):
    r = subprocess.run(["ffmpeg", "-nostats", "-i", path, "-af", "ebur128=peak=true", "-f", "null", "-"],
                       capture_output=True, text=True).stderr
    return float(re.findall(r"I:\s+(-?[\d.]+) LUFS", r)[-1])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--bpm", type=float, default=None)
    ap.add_argument("--clip", type=float, default=8.7)
    ap.add_argument("--clips", type=int, default=4)
    ap.add_argument("--out", default=os.path.abspath(OUT_DIR))
    ap.add_argument("--kbps", type=int, default=112)
    a = ap.parse_args()
    beats = BARS * BEATS_PER_BAR
    loop_sec = a.clip * a.clips if a.bpm is None else beats * 60.0 / a.bpm
    bpm = beats * 60.0 / loop_sec
    print(f"bpm {bpm:.3f}  loop {loop_sec:.3f}s  ({BARS} bars)")
    y = build(bpm, loop_sec)
    nn = int(round(loop_sec * SR)); y = y[:, :nn]
    tmp = tempfile.mkdtemp(); wav = os.path.join(tmp, "g.wav")
    gain = 1.0
    for _ in range(3):                                         # normalise to -16 LUFS, peak-safe
        z = np.tanh(y * gain)                                 # soft ceiling
        wavfile.write(wav, SR, (z.T * 32767).astype(np.int16))
        l = lufs(wav); print(f"  {l:.2f} LUFS (gain {gain:.2f})")
        if abs(l - TARGET_LUFS) < 0.3: break
        gain *= 10 ** ((TARGET_LUFS - l) / 20)
    os.makedirs(a.out, exist_ok=True)
    for ext, codec in (("m4a", ["-c:a", "aac", "-movflags", "+faststart"]), ("mp3", ["-c:a", "libmp3lame"])):
        dst = os.path.join(a.out, f"{OUT_NAME}.{ext}")
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", wav, *codec, "-b:a", f"{a.kbps}k", dst], check=True)
        print(dst, os.path.getsize(dst), "bytes")


if __name__ == "__main__":
    main()
