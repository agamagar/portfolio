// One playback API for every phone frame (controls pass, 18 Oct 2026).
//
// A controller is { getState, subscribe, play, pause, restart, seek? }.
//   getState() -> { playing, ended, time, duration, seekable }   (seconds)
// Whatever animates a frame registers one on the element that owns the animation;
// <PhoneControls/> (ui/PhoneControls.jsx) finds the nearest one above (or a <video>
// inside) its frame, so the frames never pass props to the bar.
//   - video:             videoController(el), the HTMLVideoElement directly
//   - setTimeout loops:  ds/hooks useInViewLoop registers itself (pause, restart; no seek)
//   - clock timelines:   usePhonePlayback(ref, impl) (pause, restart, seek where deterministic)
//   - static pictures:   nothing registered, the bar offers expand only
import { useEffect, useRef } from "react";

const REG = new WeakMap();
export const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function registerPlayback(el, ctl) {
  REG.set(el, ctl);
  return () => { if (REG.get(el) === ctl) REG.delete(el); };
}

// nearest controller on the element or above it, else a video inside it
export function findPlayback(node) {
  for (let a = node; a; a = a.parentElement) { const c = REG.get(a); if (c) return c; }
  const v = node?.querySelector?.("video");
  return v ? videoController(v) : null;
}

export function emitter() {
  const subs = new Set();
  return { subs, subscribe: (f) => { subs.add(f); return () => subs.delete(f); }, emit: () => subs.forEach((f) => f()) };
}

const VID = new WeakMap();
export function videoController(v) {
  if (VID.has(v)) return VID.get(v);
  const { subscribe, emit } = emitter();
  const ctl = {
    kind: "video",
    getState: () => ({ playing: !v.paused && !v.ended, ended: v.ended && !v.loop, time: v.currentTime || 0, duration: Number.isFinite(v.duration) ? v.duration : 0, seekable: Number.isFinite(v.duration) && v.duration > 0 }),
    subscribe: (f) => {
      const off = subscribe(f);
      return off;
    },
    play: () => { delete v.dataset.ppUser; if (v.ended) v.currentTime = 0; v.play()?.catch?.(() => {}); },
    pause: () => { v.dataset.ppUser = "1"; v.pause(); },
    restart: () => { delete v.dataset.ppUser; v.currentTime = 0; v.play()?.catch?.(() => {}); },
    seek: (t) => { v.currentTime = t; },
  };
  ["play", "pause", "ended", "timeupdate", "seeked", "loadedmetadata", "durationchange"].forEach((e) => v.addEventListener(e, emit));
  // reduced motion: start paused on the first frame, play stays available
  if (reducedMotion() && !v.dataset.ppInit) { v.dataset.ppInit = "1"; v.autoplay = false; v.pause(); }
  VID.set(v, ctl);
  return ctl;
}

// Register a clock-driven timeline. `impl` is read live: { play, pause, restart, seek?, getState }.
// Call the returned `emit()` whenever the state changes.
export function usePhonePlayback(ref, impl) {
  const implRef = useRef(impl); implRef.current = impl;
  const em = useRef(null); if (!em.current) em.current = emitter();
  useEffect(() => {
    const el = ref.current; if (!el) return undefined;
    const i = () => implRef.current;
    const ctl = {
      kind: "timeline", subscribe: em.current.subscribe, getState: () => i().getState(),
      play: () => i().play(), pause: () => i().pause(), restart: () => i().restart(), seek: i().seek ? (t) => i().seek(t) : undefined,
    };
    return registerPlayback(el, ctl);
  }, [ref]);
  return em.current.emit;
}
