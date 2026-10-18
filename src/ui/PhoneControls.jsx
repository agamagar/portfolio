// The shared control bar for every phone frame (controls pass, 18 Oct 2026): a small
// glass pill on the bottom edge of the screen with play / pause, restart, a scrubber
// (only where the content has a known time) and expand. Drop `<PhoneControls/>` as a
// child of the frame; the frame is its parent element.
//   desktop: shown on hover or keyboard focus of the frame; touch: always, subtle.
//   keyboard: Tab into the bar; Space toggles play, arrows scrub, Enter/Space on buttons.
// What it controls comes from ui/phonePlayback (a registered timeline, a loop, or a
// <video> in the frame); with none it is expand only. Expand opens the frame in the
// existing PhoneLightbox. Under reduced motion the content starts paused.
import { useCallback, useEffect, useRef, useState } from "react";
import { Play, Pause, Refresh, Expand } from "iconoir-react";
import PhoneLightbox, { collectExpandables } from "./PhoneLightbox";
import { IPHONE_FRAME_SRC } from "../figures/ds/IphoneFrame";
import { findPlayback, reducedMotion } from "./phonePlayback";
import { feedback } from "./feedback";
import "./phoneControls.css";

const IDLE = { playing: false, ended: false, time: 0, duration: 0, seekable: false };
const fmt = (t) => { const s = Math.max(0, Math.round(t)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };

export default function PhoneControls({ expand = true, label = "Phone" }) {
  const root = useRef(null);
  const hostRef = useRef(null);
  const [ctl, setCtl] = useState(null);
  const [st, setSt] = useState(IDLE);
  const [lb, setLb] = useState(null);
  const [isFs, setIsFs] = useState(false);

  const resolve = useCallback(() => {
    const c = findPlayback(hostRef.current);
    setCtl((prev) => (prev === c ? prev : c));
    return c;
  }, []);

  // the host is the frame; it reveals the bar on hover and focus, and resolves late-mounting content
  useEffect(() => {
    const host = root.current?.parentElement; if (!host) return undefined;
    hostRef.current = host;
    host.classList.add("pc-host");
    if (getComputedStyle(host).position === "static") host.style.position = "relative";
    const t = setTimeout(resolve, 0); // parents register in their own effects, after this one
    // the bar is laid out inside the frame, so a scaled figure (ds-fit) would shrink it: undo the scale
    const fit = () => {
      const r = host.getBoundingClientRect(); const w = host.offsetWidth || r.width;
      const s = w ? r.width / w : 1; if (!s) return;
      root.current?.style.setProperty("--pc-s", String(1 / s));
      root.current?.style.setProperty("--pc-w", Math.min(248, Math.max(120, r.width - 16)) * s + "px");
    };
    // a frame taller than the window keeps its bar on the visible part of the frame
    const lift = () => {
      const r = host.getBoundingClientRect(); const bar = root.current; if (!bar) return;
      const s = parseFloat(bar.style.getPropertyValue("--pc-s")) || 1;
      // the lowest visible edge: the window, or any ancestor that clips the frame (a cropped plate)
      let edge = window.visualViewport?.height || window.innerHeight;
      for (let a = host.parentElement; a && a !== document.body; a = a.parentElement) {
        const o = getComputedStyle(a); if (/(hidden|clip|auto|scroll)/.test(o.overflowY)) edge = Math.min(edge, a.getBoundingClientRect().bottom);
      }
      const want = Math.max(0, r.bottom - (edge - 12)); // visual px the frame's bottom hangs below what is visible
      const room = Math.max(0, r.height - 90);
      bar.style.setProperty("--pc-lift", Math.min(want, room) / s + "px");
    };
    let raf = 0, live = 0;
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; lift(); }); };
    const on = () => { if (live++) return; lift(); window.addEventListener("scroll", onScroll, { passive: true }); window.addEventListener("resize", onScroll); };
    const off = () => { if (!live || --live) return; window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
    const touch = window.matchMedia("(hover: none)").matches;
    let io; if (touch) { io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { live = 0; on(); } else { off(); } }); io.observe(host); }
    const enter = () => { resolve(); if (!touch) on(); };
    const leave = () => { if (!touch) off(); };
    host.addEventListener("pointerenter", enter); host.addEventListener("pointerleave", leave);
    host.addEventListener("focusin", enter); host.addEventListener("focusout", leave);
    fit();
    const ro = new ResizeObserver(() => { fit(); lift(); }); ro.observe(host);
    const fsChange = () => {
      const on = !!document.fullscreenElement && document.fullscreenElement.contains(host);
      setIsFs(on); if (!document.fullscreenElement) document.querySelectorAll(".pc-fs").forEach((n) => n.classList.remove("pc-fs"));
      setTimeout(() => { fit(); lift(); }, 60);
    };
    document.addEventListener("fullscreenchange", fsChange);
    return () => {
      clearTimeout(t); ro.disconnect(); document.removeEventListener("fullscreenchange", fsChange); io?.disconnect(); cancelAnimationFrame(raf); live = 1; off();
      host.removeEventListener("pointerenter", resolve); host.removeEventListener("pointerenter", enter); host.removeEventListener("pointerleave", leave);
      host.removeEventListener("focusin", resolve); host.removeEventListener("focusin", enter); host.removeEventListener("focusout", leave);
      host.classList.remove("pc-host");
    };
  }, [resolve]);

  // follow the controller: events, plus a 10 Hz poll while it plays (time moves between events)
  useEffect(() => {
    if (!ctl) { setSt(IDLE); return undefined; }
    const read = () => setSt((p) => { const n = ctl.getState(); return p.playing === n.playing && p.ended === n.ended && p.seekable === n.seekable && p.duration === n.duration && Math.abs(p.time - n.time) < 0.05 ? p : n; });
    read();
    const off = ctl.subscribe(read);
    const iv = setInterval(() => { if (document.visibilityState === "visible" && ctl.getState().playing) read(); }, 100);
    return () => { off(); clearInterval(iv); };
  }, [ctl]);

  const toggle = () => { feedback("select"); if (!ctl) return; (st.playing ? ctl.pause : ctl.play)(); };
  // Expand. A picture figure the page already expands (figure[data-exp], a ScrollPhone) opens in the
  // PhoneLightbox at its own slot, as it always did. Live frames (a loop, a video, a timeline) are not
  // copied (a copy is frozen): the container goes full screen, still live, and is scaled up to fill it.
  // Where element full screen is missing (iPhone Safari) a copy opens in the lightbox instead.
  const openLb = (e) => {
    e.stopPropagation(); feedback("select");
    const host = hostRef.current;
    const fs = document.fullscreenElement;
    if (fs && fs.contains(host)) { document.exitFullscreen?.(); return; }
    const fig = host.closest("figure[data-exp], .sp[data-expand]");
    if (fig && !ctl) {
      const items = collectExpandables();
      setLb({ items, start: Math.max(0, items.findIndex((it) => it.el === fig)) });
      return;
    }
    const box = host.closest(".ds-fit, .reel-fit, .autotabs, .gtmr-one, .std, .ifr, .pm-scene, .fp") || host;
    if (box.requestFullscreen) {
      const r = host.getBoundingClientRect();
      const k = Math.max(1, Math.min(innerWidth / r.width, innerHeight / r.height) * 0.92);
      box.style.setProperty("--pc-fs-k", String(k)); box.classList.add("pc-fs");
      box.requestFullscreen().catch(() => box.classList.remove("pc-fs"));
      return;
    }
    const frame = host.closest(".article__plate-phone, .ifr, .pm-scene, .fp") || host;
    frame.querySelectorAll("video").forEach((v) => v.setAttribute("data-exp-ok", ""));
    setLb({ items: [{ kind: "clone", el: frame, label: label + " screen" }], start: 0 });
  };
  const stop = (e) => { e.stopPropagation(); };
  const key = (e) => {
    if (e.key === " " && e.target.tagName === "INPUT" && ctl) { e.preventDefault(); toggle(); }
  };
  const asLabel = st.ended ? "Replay" : st.playing ? "Pause" : "Play";

  return (
    <div className="pc" ref={root} role="group" aria-label={label + " controls"} data-reduced={reducedMotion() ? "" : undefined}
      onClick={stop} onPointerDown={stop} onKeyDown={key} onDoubleClick={stop}>
      {ctl && (
        <>
          <button type="button" className="pc__btn" onClick={st.ended ? ctl.restart : toggle} aria-label={asLabel} title={asLabel}>
            {st.playing ? <Pause width={14} height={14} strokeWidth={1.8} aria-hidden="true" /> : <Play width={14} height={14} strokeWidth={1.8} aria-hidden="true" />}
          </button>
          <button type="button" className="pc__btn" onClick={() => { feedback("select"); ctl.restart(); }} aria-label="Restart" title="Restart">
            <Refresh width={14} height={14} strokeWidth={1.8} aria-hidden="true" />
          </button>
          {ctl.seek && st.seekable && (
            <input type="range" className="pc__scrub" aria-label="Seek" min={0} max={st.duration} step={Math.max(0.05, st.duration / 100)} value={Math.min(st.time, st.duration)}
              aria-valuetext={fmt(st.time) + " of " + fmt(st.duration)} style={{ "--pc-p": (st.duration ? (st.time / st.duration) * 100 : 0) + "%" }}
              onChange={(e) => ctl.seek(Number(e.target.value))} />
          )}
        </>
      )}
      {expand && (
        <button type="button" className="pc__btn pc__btn--expand" onClick={openLb} aria-label={isFs ? "Exit full screen" : label + " full page"} title={isFs ? "Exit full screen" : "Expand"} aria-haspopup="dialog">
          <Expand width={14} height={14} strokeWidth={1.8} aria-hidden="true" />
        </button>
      )}
      {lb && <PhoneLightbox items={lb.items} start={lb.start} frame={IPHONE_FRAME_SRC} onClose={() => setLb(null)} />}
    </div>
  );
}
