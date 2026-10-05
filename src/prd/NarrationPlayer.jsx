import { useEffect, useMemo, useRef, useState } from "react";

// In-page narration player with two engines, picked automatically:
//   1. Pre-rendered audio. If narration.audio is set and a matching timing map
//      loads, we play a studio-quality file (rendered offline with Qwen3-TTS) and
//      drive the karaoke highlight from per-sentence timestamps. Same voice for
//      every visitor, works offline, nothing synthesized at runtime.
//   2. Browser SpeechSynthesis fallback. If no audio is shipped (or it fails to
//      load), we speak it live with the best local voice (see voiceScore) and a
//      voice picker. Quality is capped by whatever the visitor's OS ships.
// Either way we karaoke-highlight the active sentence and word; click a sentence
// to jump. Content is authored to split cleanly into sentences.

// Split a paragraph into sentence segments (keeps the terminal punctuation).
// NOTE: the offline render pipeline (scripts/renderNarration.mjs) MUST use this
// exact logic so sentence counts line up with the timing map.
function splitSentences(text) {
  const parts = text.match(/[^.!?]+[.!?]+["')\]]*\s*|\S[^.!?]*$/g) || [text];
  return parts.map((s) => s.trim()).filter(Boolean);
}

// Word tokens with their [start, end) char offsets, so the speech boundary event
// (a charIndex into the utterance) maps back to a word.
function tokenize(sentence) {
  const tokens = [];
  const re = /\S+/g;
  let m;
  while ((m = re.exec(sentence))) tokens.push({ word: m[0], start: m.index, end: m.index + m[0].length });
  return tokens;
}

const REDUCE =
  typeof window !== "undefined" && window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

// getVoices() returns a big pile that mixes genuinely natural voices with macOS
// novelty voices (Bad News, Zarvox, Bubbles...) and low-fi "compact" character
// voices (Eddy, Flo, Grandma...). We score every voice so the most natural one
// available wins the auto-pick, and the junk never shows up in the picker.
const VOICE_DENY =
  /\b(Albert|Bad News|Bahh|Bells|Boing|Bruce|Bubbles|Cellos|Deranged|Good News|Fred|Hysterical|Jester|Junior|Kathy|Organ|Pipe Organ|Princess|Ralph|Superstar|Trinoids|Whisper|Wobble|Zarvox|Eddy|Flo|Grandma|Grandpa|Reed|Rocko|Sandy|Shelley)\b/i;

function voiceScore(v) {
  const n = v.name || "";
  const lang = v.lang || "";
  if (!/^en/i.test(lang)) return -1; // English narration only
  if (VOICE_DENY.test(n)) return -1; // novelty / compact junk
  let s = 0;
  // Downloaded enhanced / premium / neural variants are the best tier.
  if (/premium|enhanced|neural|natural/i.test(n + " " + (v.voiceURI || ""))) s += 60;
  if (/\bSiri\b/i.test(n)) s += 55;
  // Microsoft "Online (Natural)" voices (Edge / Windows).
  if (/Microsoft/i.test(n) && /natural|online/i.test(n)) s += 46;
  // Google network voices are very natural (Chrome).
  if (/^Google\b/i.test(n)) s += 40;
  // Known-good natural macOS system voices.
  if (/\b(Ava|Zoe|Allison|Samantha|Evan|Nathan|Serena|Joelle|Noelle|Jamie|Isha|Tom|Stephanie|Kate|Oliver|Matilda|Nicky|Aaron|Susan)\b/i.test(n)) s += 28;
  if (/Microsoft/i.test(n)) s += 12;
  // Locale preference: US, then GB, then other English.
  if (/en[-_]US/i.test(lang)) s += 12;
  else if (/en[-_]GB/i.test(lang)) s += 8;
  else s += 2;
  if (v.default) s += 3;
  return s;
}

// Trim the verbose locale suffix macOS appends, keep quality markers like (Premium).
function niceVoiceName(name) {
  return name
    .replace(/\s*\(English \([^)]*\)\)\s*/i, "")
    .replace(/\s*\(en[-_][A-Za-z]+\)\s*/i, "")
    .trim();
}

// Which token is active at a fraction [0,1) through a sentence, weighting by word
// length so longer words hold the highlight a touch longer. Used in audio mode,
// where we only know the sentence's [start, end] and interpolate words across it.
function wordAtFraction(tokens, frac) {
  if (!tokens.length) return -1;
  const total = tokens.reduce((s, t) => s + t.word.length + 1, 0);
  const target = Math.max(0, Math.min(1, frac)) * total;
  let acc = 0;
  for (let i = 0; i < tokens.length; i++) {
    acc += tokens[i].word.length + 1;
    if (target <= acc) return i;
  }
  return tokens.length - 1;
}

export default function NarrationPlayer({ narration }) {
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;
  const audioBase = narration.audio || null; // e.g. "/narration/away" -> .mp3 + .json

  // Flatten to a sentence list (with paragraph grouping) once.
  const { paras, sentences } = useMemo(() => {
    const paras = [];
    const sentences = [];
    (narration.paragraphs || []).forEach((p) => {
      const ss = splitSentences(p).map((text) => {
        const seg = { gi: sentences.length, text, tokens: tokenize(text) };
        sentences.push(seg);
        return seg;
      });
      paras.push(ss);
    });
    return { paras, sentences };
  }, [narration]);

  const [status, setStatus] = useState("idle"); // idle | playing | paused
  const [active, setActive] = useState(-1); // active sentence index
  const [wordIdx, setWordIdx] = useState(-1); // active word index within active sentence
  const [rate, setRate] = useState(1);
  const [prog, setProg] = useState(0); // audio progress fraction

  // Pre-rendered audio timing map: { sentences: [{start, end}], duration }.
  const [timing, setTiming] = useState(null);
  const audioRef = useRef(null);
  // Only trust the audio path if its timing map lines up with our sentence split.
  const audioReady = !!(audioBase && timing && timing.sentences && timing.sentences.length === sentences.length);

  // Speech-synthesis voice state (only used when no audio is available).
  const [voices, setVoices] = useState([]);
  const [voiceName, setVoiceName] = useState("");
  const voiceRef = useRef(null);
  const voiceObjsRef = useRef([]);
  const activeElRef = useRef(null);
  const rateRef = useRef(rate);
  rateRef.current = rate;

  // Load the pre-rendered timing map, if this narration ships audio.
  useEffect(() => {
    if (!audioBase) return;
    let alive = true;
    fetch(`${audioBase}.json`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("no timing"))))
      .then((j) => { if (alive) setTiming(j); })
      .catch(() => { /* fall back to speech */ });
    return () => { alive = false; };
  }, [audioBase]);

  // Enumerate voices, rank them by naturalness, and pick the best one (honouring
  // a saved choice). The list populates async, so re-run on voiceschanged.
  useEffect(() => {
    if (!supported) return;
    const load = () => {
      const all = window.speechSynthesis.getVoices();
      if (!all.length) return;
      voiceObjsRef.current = all;
      const good = all
        .map((v) => ({ v, s: voiceScore(v) }))
        .filter((x) => x.s >= 0)
        .sort((a, b) => b.s - a.s)
        .map((x) => x.v);
      const list = good.length ? good : all;
      setVoices(list.map((v) => ({ name: v.name, lang: v.lang })));
      setVoiceName((prev) => {
        let saved = prev;
        if (!saved) { try { saved = localStorage.getItem("narr-voice") || ""; } catch { saved = ""; } }
        return saved && list.some((v) => v.name === saved) ? saved : list[0].name;
      });
    };
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, [supported]);

  // Keep the resolved voice object in sync with the selected name.
  useEffect(() => {
    voiceRef.current = voiceObjsRef.current.find((v) => v.name === voiceName) || null;
  }, [voiceName]);

  // Stop any speech if the player unmounts (mode switch / navigation).
  useEffect(() => () => { if (supported) window.speechSynthesis.cancel(); }, [supported]);

  // Keep the active sentence in view.
  useEffect(() => {
    if (active >= 0 && activeElRef.current) {
      activeElRef.current.scrollIntoView({ block: "center", behavior: REDUCE ? "auto" : "smooth" });
    }
  }, [active]);

  // ---- speech-synthesis engine ----
  function speakFrom(startIdx) {
    if (!supported) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    for (let i = Math.max(0, startIdx); i < sentences.length; i++) {
      const seg = sentences[i];
      const u = new SpeechSynthesisUtterance(seg.text);
      if (voiceRef.current) { u.voice = voiceRef.current; u.lang = voiceRef.current.lang; }
      u.rate = rateRef.current;
      u.pitch = 1;
      u.onstart = () => { setActive(seg.gi); setWordIdx(-1); };
      u.onboundary = (e) => {
        if (e.name && e.name !== "word") return;
        const ci = e.charIndex || 0;
        const ti = seg.tokens.findIndex((t) => ci >= t.start && ci < t.end);
        if (ti >= 0) setWordIdx(ti);
      };
      if (i === sentences.length - 1) {
        u.onend = () => { setStatus("idle"); setActive(-1); setWordIdx(-1); };
      }
      synth.speak(u);
    }
    setStatus("playing");
  }

  // ---- pre-rendered audio engine ----
  function seekToSentence(idx) {
    const a = audioRef.current;
    if (!a || !timing) return;
    a.currentTime = timing.sentences[idx]?.start ?? 0;
    a.play();
    setStatus("playing");
  }

  function onAudioTime() {
    const a = audioRef.current;
    if (!a || !timing) return;
    const t = a.currentTime;
    if (a.duration) setProg(t / a.duration);
    const segs = timing.sentences;
    let idx = -1;
    for (let i = 0; i < segs.length; i++) {
      if (t < segs[i].start) break;
      if (t < segs[i].end) { idx = i; break; }
      idx = i; // past this sentence's end but before the next starts: hold it lit
    }
    if (idx !== active) setActive(idx);
    if (idx >= 0) {
      const s = segs[idx];
      const frac = (t - s.start) / Math.max(0.01, s.end - s.start);
      const wi = wordAtFraction(sentences[idx].tokens, frac);
      if (wi !== wordIdx) setWordIdx(wi);
    }
  }

  function onAudioEnd() { setStatus("idle"); setActive(-1); setWordIdx(-1); setProg(1); }

  // ---- shared controls (branch on which engine is live) ----
  function jumpTo(idx) {
    if (audioReady) seekToSentence(idx);
    else speakFrom(idx);
  }

  function onPlayPause() {
    if (audioReady) {
      const a = audioRef.current;
      if (!a) return;
      if (a.paused) { a.play(); setStatus("playing"); }
      else { a.pause(); setStatus("paused"); }
      return;
    }
    if (!supported) return;
    const synth = window.speechSynthesis;
    if (status === "playing") { synth.pause(); setStatus("paused"); }
    else if (status === "paused") { synth.resume(); setStatus("playing"); }
    else { speakFrom(0); }
  }

  function onRestart() {
    setWordIdx(-1);
    if (audioReady) {
      const a = audioRef.current;
      if (a) { a.currentTime = 0; a.play(); setStatus("playing"); }
      return;
    }
    setActive(-1);
    speakFrom(0);
  }

  function onVoiceChange(e) {
    const name = e.target.value;
    setVoiceName(name);
    try { localStorage.setItem("narr-voice", name); } catch { /* private mode */ }
    voiceRef.current = voiceObjsRef.current.find((v) => v.name === name) || null;
    if (status !== "idle") speakFrom(Math.max(0, active)); // re-voice immediately
  }

  function cycleRate() {
    const rates = [1, 1.15, 1.35, 0.85];
    const next = rates[(rates.indexOf(rate) + 1) % rates.length];
    setRate(next);
    if (audioReady) { if (audioRef.current) audioRef.current.playbackRate = next; }
    else if (status !== "idle") speakFrom(Math.max(0, active)); // apply immediately
  }

  const canPlay = audioReady || supported;
  const progress = audioReady
    ? prog
    : sentences.length ? Math.max(0, active + 1) / sentences.length : 0;

  return (
    <div className="narr">
      {audioBase && (
        <audio
          ref={audioRef}
          src={`${audioBase}.mp3`}
          preload="metadata"
          onTimeUpdate={onAudioTime}
          onEnded={onAudioEnd}
        />
      )}

      <div className="narr-player" data-status={status}>
        <button
          className="narr-player__btn"
          onClick={onPlayPause}
          disabled={!canPlay}
          aria-label={status === "playing" ? "Pause narration" : "Play narration"}
        >
          {status === "playing" ? <PauseIcon /> : <PlayIcon />}
        </button>
        <div className="narr-player__meta">
          <p className="narr-player__title">{narration.title || "The walkthrough, narrated"}</p>
          <div className="narr-player__bar" aria-hidden="true">
            <span style={{ width: (progress * 100).toFixed(1) + "%" }} />
          </div>
          <p className="narr-player__sub">
            {narration.subtitle || "In the designer's voice"}
            {status !== "idle" && sentences.length ? `  ·  ${Math.max(1, active + 1)} / ${sentences.length}` : ""}
          </p>
        </div>
        <div className="narr-player__ctrls">
          {!audioReady && voices.length > 1 && (
            <select
              className="narr-player__voice"
              value={voiceName}
              onChange={onVoiceChange}
              disabled={!supported}
              aria-label="Narration voice"
              title="Voice"
            >
              {voices.map((v) => (
                <option key={v.name} value={v.name}>{niceVoiceName(v.name)}</option>
              ))}
            </select>
          )}
          <button onClick={onRestart} disabled={!canPlay} aria-label="Restart" title="Restart"><RestartIcon /></button>
          <button onClick={cycleRate} disabled={!canPlay} className="narr-player__rate" title="Playback speed">{rate}x</button>
        </div>
      </div>

      {!canPlay && (
        <p className="narr-nosupport">Your browser does not support in-page narration. The full transcript is below.</p>
      )}

      <div className="narr-script">
        {paras.map((ss, pi) => (
          <p className="narr-para" key={pi}>
            {ss.map((seg) => {
              const isActive = seg.gi === active;
              return (
                <span
                  key={seg.gi}
                  className="narr-sentence"
                  data-active={isActive ? "true" : "false"}
                  data-done={seg.gi < active ? "true" : "false"}
                  ref={isActive ? activeElRef : null}
                  onClick={() => jumpTo(seg.gi)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); jumpTo(seg.gi); } }}
                >
                  {isActive
                    ? seg.tokens.map((t, ti) => (
                        <span key={ti} className="narr-word" data-active={ti === wordIdx ? "true" : "false"}>
                          {t.word}{" "}
                        </span>
                      ))
                    : seg.text + " "}
                </span>
              );
            })}
          </p>
        ))}
      </div>
    </div>
  );
}

function PlayIcon() {
  return <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>;
}
function PauseIcon() {
  return <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg>;
}
function RestartIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 12a9 9 0 1 0 2.6-6.3" /><path d="M3 4v5h5" />
    </svg>
  );
}
