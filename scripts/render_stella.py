#!/usr/bin/env python3
"""
Offline Gujarati TTS render for Stella's lines in the interactive call sim.

The case-study narration pipeline (scripts/render_narration.py, Qwen3-TTS) CANNOT be
used here: its model supports only Chinese, English, German, Italian, Portuguese,
Spanish, Japanese, Korean, French and Russian. Stella speaks Gujarati, so this renders
with a Gujarati-capable model instead. Everything runs locally, so no candidate-facing
dialogue leaves the machine.

Two engines:
  --engine mms     (DEFAULT) facebook/mms-tts-guj. Ungated, small, native Gujarati
                   script with no romanization step. 16 kHz, which is honest for a
                   phone-screening demo since real telephony is narrowband anyway.
  --engine parler  ai4bharat/indic-parler-tts. Richer and steerable by a speaker
                   description, and the thematically apt choice (an Indian lab's model
                   for an Indian hiring call). It is a GATED repo: accept the license
                   at huggingface.co/ai4bharat/indic-parler-tts and export HF_TOKEN
                   yourself before using it.

Unlike the narration (one concatenated track + timing map), the sim is a BRANCHING
call: any node is reachable in any order, so every line is rendered as its own file.

    <outdir>/<node-id>.mp3     one file per Stella line
    <outdir>/manifest.json     { engine, model, sr, lines: { id: {dur, gloss} } }

Setup (transient venv, delete after rendering):
    python3.11 -m venv parlerenv
    ./parlerenv/bin/pip install "transformers==4.46.1" soundfile accelerate torch
    # only for --engine parler:
    ./parlerenv/bin/pip install descript-audiotools          # PyPI build; the git one
                                                             # fails checkout on macOS
    ./parlerenv/bin/pip install --no-deps git+https://github.com/huggingface/parler-tts.git
    ./parlerenv/bin/pip install sentencepiece "protobuf>=4.0.0" descript-audio-codec
Run:
    node scripts/extractStellaLines.mjs
    HF_HOME=./hf ./parlerenv/bin/python scripts/render_stella.py \
        --input scripts/.stella-lines.json --outdir public/stella
"""
import argparse, json, os, subprocess, tempfile
import numpy as np
import soundfile as sf
import torch

MMS_MODEL = "facebook/mms-tts-guj"
PARLER_MODEL = "ai4bharat/indic-parler-tts"

# Indic Parler is steered by a natural-language description of the speaker. Gujarati
# has recommended speakers in the model card; Yash is one of them. The description
# also carries the delivery this call needs: warm and unhurried, because the person
# on the other end may be on a factory floor and is under more pressure than we are.
DESCRIPTION = (
    "Yash speaks in a warm, clear and friendly tone at a moderate, unhurried pace. "
    "The recording is very close, of studio quality, with no background noise."
)


def trim_silence(x, sr, thresh=0.012, pad_ms=40):
    if x.ndim > 1:
        x = x.mean(axis=1)
    amp = np.abs(x)
    peak = amp.max() + 1e-9
    idx = np.where(amp > thresh * peak)[0]
    if len(idx) == 0:
        return x
    pad = int(sr * pad_ms / 1000)
    return x[max(0, idx[0] - pad) : min(len(x), idx[-1] + pad)]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--input", required=True)
    ap.add_argument("--outdir", required=True)
    ap.add_argument("--bitrate", default="96k")
    ap.add_argument("--limit", type=int, default=0, help="render only the first N (smoke test)")
    ap.add_argument("--engine", choices=["mms", "parler"], default="mms")
    args = ap.parse_args()

    lines = json.load(open(args.input))
    if args.limit:
        lines = lines[: args.limit]
    os.makedirs(args.outdir, exist_ok=True)

    # MPS is flaky for some ops in these models; CPU is fast enough at this volume.
    device = "cpu"

    if args.engine == "parler":
        from parler_tts import ParlerTTSForConditionalGeneration
        from transformers import AutoTokenizer
        model_id = PARLER_MODEL
        print(f"loading {model_id} on {device}", flush=True)
        model = ParlerTTSForConditionalGeneration.from_pretrained(model_id).to(device)
        tok = AutoTokenizer.from_pretrained(model_id)
        desc_tok = AutoTokenizer.from_pretrained(model.config.text_encoder._name_or_path)
        sr = model.config.sampling_rate
        desc = desc_tok(DESCRIPTION, return_tensors="pt").to(device)

        def synth(text):
            prompt = tok(text, return_tensors="pt").to(device)
            with torch.no_grad():
                audio = model.generate(
                    input_ids=desc.input_ids,
                    attention_mask=desc.attention_mask,
                    prompt_input_ids=prompt.input_ids,
                    prompt_attention_mask=prompt.attention_mask,
                )
            return audio.cpu().numpy().squeeze().astype(np.float32)
    else:
        from transformers import VitsModel, AutoTokenizer
        model_id = MMS_MODEL
        print(f"loading {model_id} on {device}", flush=True)
        model = VitsModel.from_pretrained(model_id).to(device)
        tok = AutoTokenizer.from_pretrained(model_id)
        sr = model.config.sampling_rate

        def synth(text):
            t = tok(text, return_tensors="pt").to(device)
            with torch.no_grad():
                return model(**t).waveform.cpu().numpy().squeeze().astype(np.float32)

    print("sample rate", sr, flush=True)
    # MERGE into any existing manifest. Re-rendering a single corrected line must not
    # wipe the other 52 entries, which is exactly what a fresh dict did the first time.
    manifest_path = os.path.join(args.outdir, "manifest.json")
    manifest = {"engine": args.engine, "model": model_id, "sr": sr, "lines": {}}
    if os.path.exists(manifest_path):
        try:
            prior = json.load(open(manifest_path))
            if isinstance(prior.get("lines"), dict):
                manifest["lines"] = prior["lines"]
                print(f"merging into {len(prior['lines'])} existing entries", flush=True)
        except (ValueError, OSError):
            pass
    if args.engine == "parler":
        manifest["description"] = DESCRIPTION

    with tempfile.TemporaryDirectory() as tmp:
        for i, item in enumerate(lines):
            nid, text = item["id"], item["text"]
            wav = synth(text)
            wav = trim_silence(wav, sr)
            peak = float(np.abs(wav).max()) + 1e-9
            wav = wav * min(1.0, 0.97 / peak)

            wav_path = os.path.join(tmp, f"{nid}.wav")
            sf.write(wav_path, wav, sr)
            mp3_path = os.path.join(args.outdir, f"{nid}.mp3")
            subprocess.run(
                ["ffmpeg", "-y", "-loglevel", "error", "-i", wav_path,
                 "-ac", "1", "-b:a", args.bitrate, mp3_path], check=True,
            )
            dur = round(len(wav) / sr, 3)
            manifest["lines"][nid] = {"dur": dur, "gloss": item.get("gloss", "")}
            kb = os.path.getsize(mp3_path) // 1024
            print(f"  [{i+1}/{len(lines)}] {nid}  {dur}s  {kb} KB", flush=True)

    json.dump(manifest, open(manifest_path, "w"),
              ensure_ascii=False, indent=2)
    print(f"wrote {len(manifest['lines'])} lines to {args.outdir}", flush=True)


if __name__ == "__main__":
    main()
