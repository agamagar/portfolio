// PhoneStage: a phone on its own sky, across the full column, with any controls above it and the caption under it, in the
// figures' caption voice. One sky per surface, and the phone is the object that carries the saturation.
//   sky       "violet" | "mint" | "tangerine"; change it and the stage crossfades
//   paper     the card grain
//   mode      "light" | "dark" holds the stage in one mode
//   controls  what sits above the phone
//   children  the phone (StellaLive's, or the shell it waits in)
import { DasshSky } from "./DasshSky";
import "./dasshSpecs.css";
import "./stellaLive.css";

export function PhoneStage({ sky = "violet", paper, mode, controls, caption, children }) {
  return (
    <figure className="slive">
      <DasshSky sky={sky} paper={paper} mode={mode} className="slive__stage">
        {controls}
        {children}
      </DasshSky>
      {caption && <figcaption className="dspec__cap">{caption}</figcaption>}
    </figure>
  );
}

// the stage while the live phone's chunk loads, the same size, so nothing below it jumps
export function PhoneStageShell({ sky, paper, mode, views, spec, caption }) {
  return (
    <PhoneStage sky={views?.[0]?.sky || sky} paper={paper} mode={mode} caption={caption} controls={views?.length > 1 || spec ? <div className="slive__controls slive__controls--wait" /> : null}>
      <div className="slive__ph" aria-hidden="true" />
    </PhoneStage>
  );
}
