#!/usr/bin/env python3
"""
Offline neural-TTS render for the PRD "Listen mode".

Renders each narration sentence with an open-source Qwen3-TTS model (via
mlx-audio on Apple Silicon), trims silence, concatenates per PRD with a small
inter-sentence gap, and writes:
    <outdir>/<slug>.mp3     one audio file per PRD (mono)
    <outdir>/<slug>.json    { sr, voice, model, duration, sentences:[{start,end}] }
The timing map lines up 1:1 with NarrationPlayer's sentence split, which drives
the karaoke highlight. The model is loaded ONCE and reused across all sentences.

IMPORTANT: use a *CustomVoice* model for preset voices. The *Base* model's
speaker table is empty (it is cloning-only, needs ref_audio), so passing --voice
to it binds to nothing and the timbre drifts per sentence. CustomVoice presets:
serena, vivian, uncle_fu, ryan, aiden, ono_anna, sohee, eric, dylan.

Setup (transient venv, deps ~1GB + model ~2GB, delete after rendering):
    python3.11 -m venv ttsenv && ./ttsenv/bin/pip install mlx-audio soundfile
Run:
    HF_HOME=./hf ./ttsenv/bin/python scripts/render_narration.py \
        --input scripts/.narration-input.json \
        --outdir public/narration \
        --model mlx-community/Qwen3-TTS-12Hz-0.6B-CustomVoice-8bit \
        --voice vivian --lang English
"""
import argparse, glob, json, os, subprocess, tempfile
import numpy as np
import soundfile as sf
from mlx_audio.tts.utils import load_model
from mlx_audio.tts.generate import generate_audio


def trim_silence(x, sr, thresh=0.012, pad_ms=40):
    if x.ndim > 1:
        x = x.mean(axis=1)
    amp = np.abs(x)
    peak = amp.max() + 1e-9
    idx = np.where(amp > thresh * peak)[0]
    if len(idx) == 0:
        return x
    pad = int(sr * pad_ms / 1000)
    a = max(0, idx[0] - pad)
    b = min(len(x), idx[-1] + pad)
    return x[a:b]


def render_sentence(model, text, voice, lang, tmp, i):
    prefix = f"s{i:04d}"
    for f in glob.glob(os.path.join(tmp, prefix + "*")):
        os.remove(f)
    generate_audio(
        text=text, model=model, voice=voice, lang_code=lang,
        output_path=tmp, file_prefix=prefix, audio_format="wav",
        verbose=False, ref_audio=None,
    )
    files = sorted(glob.glob(os.path.join(tmp, prefix + "*.wav")))
    if not files:
        raise RuntimeError(f"no audio for sentence {i}: {text[:50]!r}")
    parts, sr = [], None
    for f in files:
        a, sr = sf.read(f, dtype="float32")
        if a.ndim > 1:
            a = a.mean(axis=1)
        parts.append(a)
    return np.concatenate(parts), sr


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--input", required=True)
    ap.add_argument("--outdir", required=True)
    ap.add_argument("--model", required=True)
    ap.add_argument("--voice", default="vivian")
    ap.add_argument("--lang", default="English")
    ap.add_argument("--gap", type=float, default=0.30)
    ap.add_argument("--bitrate", default="96k")
    args = ap.parse_args()

    data = json.load(open(args.input))
    os.makedirs(args.outdir, exist_ok=True)
    print("loading model", args.model, flush=True)
    model = load_model(args.model)
    sr = int(getattr(model, "sample_rate", 24000))
    print("model sample_rate", sr, flush=True)

    with tempfile.TemporaryDirectory() as tmp:
        for prd in data:
            slug, sents = prd["slug"], prd["sentences"]
            print(f"=== {slug}: {len(sents)} sentences ===", flush=True)
            combined, timing, cursor = [], [], 0
            gap = np.zeros(int(args.gap * sr), dtype=np.float32)
            for i, s in enumerate(sents):
                audio, asr = render_sentence(model, s, args.voice, args.lang, tmp, i)
                if asr:
                    sr = asr
                    gap = np.zeros(int(args.gap * sr), dtype=np.float32)
                audio = trim_silence(audio, sr)
                start = cursor
                combined.append(audio); cursor += len(audio)
                timing.append({"start": round(start / sr, 3), "end": round(cursor / sr, 3)})
                combined.append(gap); cursor += len(gap)
                if (i + 1) % 10 == 0:
                    print(f"  {i + 1}/{len(sents)}", flush=True)
            full = np.concatenate(combined) if combined else np.zeros(1, np.float32)
            peak = float(np.abs(full).max()) + 1e-9
            full = full * min(1.0, 0.97 / peak)
            wav_path = os.path.join(tmp, f"{slug}.wav")
            sf.write(wav_path, full, sr)
            mp3_path = os.path.join(args.outdir, f"{slug}.mp3")
            subprocess.run(
                ["ffmpeg", "-y", "-loglevel", "error", "-i", wav_path,
                 "-ac", "1", "-b:a", args.bitrate, mp3_path], check=True,
            )
            meta = {
                "model": args.model, "voice": args.voice, "sr": sr, "gap": args.gap,
                "duration": round(len(full) / sr, 3), "sentences": timing,
            }
            json.dump(meta, open(os.path.join(args.outdir, f"{slug}.json"), "w"))
            kb = os.path.getsize(mp3_path) // 1024
            print(f"  wrote {mp3_path}  {round(len(full) / sr, 1)}s  {kb} KB  ({len(timing)} sentences)", flush=True)


if __name__ == "__main__":
    main()
