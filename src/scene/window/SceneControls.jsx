// The window scene's two header controls, beside the theme toggle (30-locked-brief:
// "Controls beside the theme toggle"): whose sky the window shows (Agam's Bangalore
// sky, or the visitor's own city and clock) and the look (Dreamlike, Heightened,
// Photo-true). Shown only while the scene is on the page. They share the theme
// toggle's button (.theme-toggle), so size, colour and hover match.
//
// Sky: lib/weather.js setSkyMode (persisted, subscribable); the scene's weather
// bridge follows it. Look: lookStore.js; useWindowScene follows it.

import { useEffect, useRef, useState } from "react";
import { HomeSimple, Globe, Sparks, SunLight, Camera, Check, Antenna, CloudSunny, Cloud, Rain, Thunderstorm, Clock, HalfMoon } from "iconoir-react";
import { getSkyMode, setSkyMode, subscribeSkyMode } from "../../lib/weather";
import { LOOKS, getLook, setLook, subscribeLook } from "./lookStore.js";
import { WEATHERS, TIMES, getOutside, setOutside, subscribeOutside } from "./outsideStore.js";
import "./sceneControls.css";

const LOOK_ICON = { dreamlike: Sparks, heightened: SunLight, photo: Camera };
const WX_ICON = { live: Antenna, clear: SunLight, partly: CloudSunny, overcast: Cloud, rain: Rain, storm: Thunderstorm };
const TIME_ICON = { now: Clock, morning: SunLight, golden: SunLight, dusk: CloudSunny, night: HalfMoon };

export default function SceneControls({ i = 0, feedback }) {
  const [sky, setSky] = useState(() => getSkyMode());
  const [look, setLookState] = useState(() => getLook());
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const btnRef = useRef(null);
  // the Outside menu (outsideStore.js): weather and time
  const [out, setOut] = useState(() => getOutside());
  const [openOut, setOpenOut] = useState(false);
  const outWrapRef = useRef(null);
  const outBtnRef = useRef(null);
  useEffect(() => subscribeOutside(setOut), []);
  useEffect(() => {
    if (!openOut) return undefined;
    const onDown = (e) => {
      if (!outWrapRef.current?.contains(e.target)) setOpenOut(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpenOut(false);
        outBtnRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [openOut]);
  const timeId = TIMES.find((t) => t.tod === out.tod)?.id || "now";
  const OutIcon = WX_ICON[out.wx] || Antenna;
  const outLabel = `${WEATHERS.find((w) => w.id === out.wx)?.label || "Live"}, ${TIMES.find((t) => t.id === timeId)?.label || "Now"}`;

  useEffect(() => subscribeSkyMode(setSky), []);
  useEffect(() => subscribeLook(setLookState), []);

  // the menu closes on an outside press or Escape (focus returns to its button)
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const mine = sky !== "yours";
  const LookIcon = LOOK_ICON[look] || Sparks;
  const lookLabel = LOOKS.find((l) => l.id === look)?.label || "Dreamlike";

  return (
    <>
      <button
        type="button"
        style={{ "--i": i }}
        className="theme-toggle scene-ctl"
        data-tip
        aria-label={mine ? "Showing my sky in Bangalore. Switch to your sky" : "Showing your sky. Switch to my sky in Bangalore"}
        aria-pressed={!mine}
        onClick={() => {
          feedback?.("toggle");
          setSkyMode(mine ? "yours" : "mine");
        }}
      >
        {mine ? <HomeSimple width={15} height={15} strokeWidth={2} aria-hidden /> : <Globe width={15} height={15} strokeWidth={2} aria-hidden />}
      </button>
      <span className="scene-ctl__wrap" ref={wrapRef} style={{ "--i": i + 1 }}>
        <button
          ref={btnRef}
          type="button"
          className="theme-toggle scene-ctl"
          data-tip={open ? undefined : true}
          aria-label={`Look: ${lookLabel}`}
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => {
            feedback?.("toggle");
            setOpen((o) => !o);
          }}
        >
          <LookIcon width={15} height={15} strokeWidth={2} aria-hidden />
        </button>
        {open && (
          <span className="scene-ctl__menu" role="menu" aria-label="Look">
            {LOOKS.map((l) => {
              const Icon = LOOK_ICON[l.id] || Sparks;
              const on = l.id === look;
              return (
                <button
                  key={l.id}
                  type="button"
                  role="menuitemradio"
                  aria-checked={on}
                  className="scene-ctl__item"
                  autoFocus={on}
                  onClick={() => {
                    feedback?.("select");
                    setLook(l.id);
                    setOpen(false);
                    btnRef.current?.focus();
                  }}
                >
                  <Icon width={15} height={15} strokeWidth={2} aria-hidden />
                  <span className="scene-ctl__text">
                    <span className="scene-ctl__label">{l.label}</span>
                    <span className="scene-ctl__hint">{l.hint}</span>
                  </span>
                  {on && <Check className="scene-ctl__check" width={14} height={14} strokeWidth={2.2} aria-hidden />}
                </button>
              );
            })}
          </span>
        )}
      </span>
      <span className="scene-ctl__wrap" ref={outWrapRef} style={{ "--i": i + 2 }}>
        <button
          ref={outBtnRef}
          type="button"
          className="theme-toggle scene-ctl"
          data-tip={openOut ? undefined : true}
          aria-label={`Outside: ${outLabel}`}
          aria-haspopup="menu"
          aria-expanded={openOut}
          onClick={() => {
            feedback?.("toggle");
            setOpenOut((o) => !o);
          }}
        >
          <OutIcon width={15} height={15} strokeWidth={2} aria-hidden />
        </button>
        {openOut && (
          <span className="scene-ctl__menu" role="menu" aria-label="Outside">
            <span className="scene-ctl__group" role="presentation">Weather</span>
            {WEATHERS.map((w) => {
              const Icon = WX_ICON[w.id] || Cloud;
              const on = w.id === out.wx;
              return (
                <button key={w.id} type="button" role="menuitemradio" aria-checked={on} className="scene-ctl__item" autoFocus={on}
                  onClick={() => { feedback?.("select"); setOutside({ wx: w.id }); }}>
                  <Icon width={15} height={15} strokeWidth={2} aria-hidden />
                  <span className="scene-ctl__text">
                    <span className="scene-ctl__label">{w.label}</span>
                    <span className="scene-ctl__hint">{w.hint}</span>
                  </span>
                  {on && <Check className="scene-ctl__check" width={14} height={14} strokeWidth={2.2} aria-hidden />}
                </button>
              );
            })}
            <span className="scene-ctl__group" role="presentation">Time</span>
            {TIMES.map((t) => {
              const Icon = TIME_ICON[t.id] || Clock;
              const on = t.id === timeId;
              return (
                <button key={t.id} type="button" role="menuitemradio" aria-checked={on} className="scene-ctl__item"
                  onClick={() => { feedback?.("select"); setOutside({ tod: t.tod }); }}>
                  <Icon width={15} height={15} strokeWidth={2} aria-hidden />
                  <span className="scene-ctl__text">
                    <span className="scene-ctl__label">{t.label}</span>
                  </span>
                  {on && <Check className="scene-ctl__check" width={14} height={14} strokeWidth={2.2} aria-hidden />}
                </button>
              );
            })}
          </span>
        )}
      </span>
    </>
  );
}
