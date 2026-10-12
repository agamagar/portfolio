// The VR headset's 3D video viewer (opened by openVrViewer.js when the headset on the
// desk is clicked). A dark "inside the headset" frame: one wide rounded viewport with a
// lens vignette, glass controls under it, a playlist rail when there is more than one
// video. Esc, the close button or a click outside the viewport closes it.
import { useCallback, useEffect, useRef, useState } from "react";
import { vrVideos } from "../vrVideos.js";
import { createSource } from "./source.js";
import { createPlayer } from "./player.js";

const MODES = [["360", "360°"], ["180", "180°"], ["flat", "Flat"]];
const fmt = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;
const siteSound = () => document.documentElement.dataset.sound === "on";

const I = {
  play: <path d="M8 5v14l11-7z" />,
  pause: <path d="M6 5h4v14H6zM14 5h4v14h-4z" />,
  vol: <path d="M3 9v6h4l5 5V4L7 9zM16.5 12A4.5 4.5 0 0 0 14 8v8a4.5 4.5 0 0 0 2.5-4z" />,
  mute: <path d="M3 9v6h4l5 5V4L7 9zM16 9.4 17.4 8 19.5 10.1 21.6 8 23 9.4 20.9 11.5 23 13.6 21.6 15 19.5 12.9 17.4 15 16 13.6 18.1 11.5z" />,
  close: <path d="M6.4 5 12 10.6 17.6 5 19 6.4 13.4 12 19 17.6 17.6 19 12 13.4 6.4 19 5 17.6 10.6 12 5 6.4z" />,
};
const Icon = ({ d }) => <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">{d}</svg>;

export default function VrViewer({ onClose, reduced, delay = 0 }) {
  const rootRef = useRef(null), canvasRef = useRef(null), playerRef = useRef(null), srcRef = useRef(null);
  const [shown, setShown] = useState(false);
  const [idx, setIdx] = useState(0);
  const entry = vrVideos[idx];
  const [mode, setMode] = useState(entry.mode);
  const [mono, setMono] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [dur, setDur] = useState(entry.duration || 0);
  const [muted, setMuted] = useState(!siteSound());
  const [note, setNote] = useState("");
  const [gyro, setGyro] = useState(false);
  const [closing, setClosing] = useState(false);
  const closingRef = useRef(false);

  // fade in once the camera has dollied up to the headset
  useEffect(() => {
    const t = setTimeout(() => setShown(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  // the three.js player, one per open
  useEffect(() => {
    const p = createPlayer(canvasRef.current);
    playerRef.current = p;
    const ro = new ResizeObserver(() => p.resize());
    ro.observe(canvasRef.current);
    return () => {
      ro.disconnect();
      srcRef.current?.dispose();
      srcRef.current = null;
      p.dispose();
      playerRef.current = null;
    };
  }, []);

  // the current video: load it, pause and dispose the previous one
  useEffect(() => {
    const p = playerRef.current;
    if (!p) return undefined;
    setNote("");
    setPlaying(false);
    setTime(0);
    const s = createSource(entry);
    srcRef.current?.dispose();
    srcRef.current = s;
    s.muted = muted || s.generated;
    p.setSource(s, entry.stereo);
    p.setMode(entry.mode);
    setMode(entry.mode);
    setDur(s.duration);
    s.onready = () => {
      setDur(s.duration);
      p.setSource(s, entry.stereo);
      p.setMode(entry.mode); // the frame's real size is known now
    };
    s.onerror = () => { setNote(s.error); s.pause(); setPlaying(false); };
    // start playing (a video starts muted: autoplay rules; unmuting is the toggle's)
    s.play?.().then(() => setPlaying(true)).catch(() => setPlaying(false));
    if (s.generated) setPlaying(true);
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  // the clock for the scrubber
  useEffect(() => {
    const id = setInterval(() => {
      const s = srcRef.current;
      if (!s) return;
      setTime(s.time);
      setDur(s.duration);
      setPlaying(!s.paused);
    }, 200);
    return () => clearInterval(id);
  }, []);

  useEffect(() => playerRef.current?.setMode(mode), [mode]);
  useEffect(() => playerRef.current?.setStereoMono(mono), [mono]);
  // the site sound toggle: follow it while the viewer is open
  useEffect(() => {
    const mo = new MutationObserver(() => setMuted(!siteSound()));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-sound"] });
    return () => mo.disconnect();
  }, []);
  useEffect(() => {
    const s = srcRef.current;
    if (s && !s.generated) s.muted = muted;
  }, [muted, idx]);

  const close = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    setClosing(true);
    srcRef.current?.pause();
    setTimeout(onClose, reduced ? 220 : 320);
  }, [onClose, reduced]);

  // keys: Esc closes, arrows look around, space plays; Tab stays inside
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); close(); return; }
      if (e.key === "Tab") {
        const f = [...rootRef.current.querySelectorAll("button:not([disabled]), input, [tabindex='0']")].filter((n) => n.offsetParent !== null);
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (!rootRef.current.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
        else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        return;
      }
      const p = playerRef.current;
      const step = e.shiftKey ? 15 : 5;
      if (e.target.tagName !== "INPUT") {
        if (e.key === "ArrowLeft") { p?.nudge(-step, 0); e.preventDefault(); }
        else if (e.key === "ArrowRight") { p?.nudge(step, 0); e.preventDefault(); }
        else if (e.key === "ArrowUp") { p?.nudge(0, step); e.preventDefault(); }
        else if (e.key === "ArrowDown") { p?.nudge(0, -step); e.preventDefault(); }
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [close]);

  // focus into the dialog when it shows
  useEffect(() => {
    if (shown) rootRef.current?.querySelector("[data-autofocus]")?.focus({ preventScroll: true });
  }, [shown]);

  const toggle = () => {
    const s = srcRef.current;
    if (!s) return;
    if (s.paused) s.play().then(() => setPlaying(true)).catch(() => {}); else { s.pause(); setPlaying(false); }
  };
  const stereo = entry.stereo !== "mono";
  const canGyro = playerRef.current?.canGyro;

  return (
    <div
      ref={rootRef}
      className="vrv"
      data-shown={shown && !closing ? "" : undefined}
      data-reduced={reduced || undefined}
      role="dialog"
      aria-modal="true"
      aria-label="3D video viewer"
      data-lenis-prevent
      onWheel={(e) => e.stopPropagation()}
      onPointerDown={(e) => { if (e.target === e.currentTarget || e.target.dataset.outside != null) close(); }}
    >
      <div className="vrv__viewport" data-outside={undefined}>
        <canvas ref={canvasRef} className="vrv__canvas" aria-label="Video, drag or use the arrow keys to look around" />
        <div className="vrv__lens" aria-hidden="true" />
        {note && <p className="vrv__note" role="status">{note}</p>}
        {entry.placeholder && <span className="vrv__badge">Placeholder</span>}
      </div>

      <div className="vrv__bar" role="group" aria-label="Playback controls">
        <button type="button" className="vrv__btn" data-autofocus onClick={toggle} aria-label={playing ? "Pause" : "Play"}>
          <Icon d={playing ? I.pause : I.play} />
        </button>
        <span className="vrv__time">{fmt(time)}</span>
        <input
          className="vrv__scrub"
          type="range"
          min={0}
          max={Math.max(0.1, dur)}
          step={0.05}
          value={Math.min(time, dur || 0)}
          aria-label="Seek"
          onChange={(e) => { srcRef.current?.seek(+e.target.value); setTime(+e.target.value); }}
        />
        <span className="vrv__time">{fmt(dur)}</span>
        <button
          type="button"
          className="vrv__btn"
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? "Unmute" : "Mute"}
          aria-pressed={muted}
          disabled={!!srcRef.current?.generated}
          title={srcRef.current?.generated ? "The test pattern has no sound" : siteSound() ? "" : "Site sound is off: turn it on to hear video"}
        >
          <Icon d={muted ? I.mute : I.vol} />
        </button>
        <div className="vrv__seg" role="radiogroup" aria-label="Projection">
          {MODES.map(([m, label]) => (
            <button key={m} type="button" role="radio" aria-checked={mode === m} className="vrv__segbtn" onClick={() => setMode(m)}>{label}</button>
          ))}
        </div>
        {stereo && (
          <button type="button" className="vrv__pill" aria-pressed={mono} onClick={() => setMono((v) => !v)} title="Side-by-side and top-bottom video holds two eyes in one frame">
            {mono ? "One eye" : "Both eyes"}
          </button>
        )}
        {canGyro && (
          <button type="button" className="vrv__pill" aria-pressed={gyro} onClick={async () => setGyro(await playerRef.current.setGyro(!gyro) ? !gyro : false)}>
            Gyro
          </button>
        )}
        <button type="button" className="vrv__btn vrv__close" onClick={close} aria-label="Close viewer">
          <Icon d={I.close} />
        </button>
      </div>

      {vrVideos.length > 1 && (
        <ul className="vrv__rail" aria-label="Videos">
          {vrVideos.map((v, i) => (
            <li key={v.id}>
              <button type="button" className="vrv__item" aria-current={i === idx || undefined} onClick={() => setIdx(i)}>
                <span className="vrv__itemTitle">{v.title}</span>
                <span className="vrv__itemNote">{v.note}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
