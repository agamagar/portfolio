// Hero v2 (Figma Portfolio 2026, node 1586:14452): a small face above a serif tagline, the Resume and
// LinkedIn links under it (rendered by Hello.jsx, shared with v1) and the timeline in the right column.
// This is only the left block's head: the face and the tagline. It reuses v1's face stack verbatim
// (MorphFace + HeroMorph + the wave hand inside .header__avatar-wrap) so the morph, its clock
// ("heromorph:t") and the reveal sequence are the same; the tagline joins the sequence as .hv2__tagline.
import MorphFace from "../MorphFace";
import HeroMorph from "./HeroMorph";
import { Guard } from "../ui/Guard";
import "./heroV2.css";

export const HERO_V2_TAGLINE = "Hello! I’m Agam, a designer at the intersection of play and tech.";

// the frame's right column, word for word (Figma 1586:14452)
const L = "Also a VR Enthusiast and an Amateur Researcher";
export const HERO_V2_ROWS = [
  { year: "2026", org: "Zepto", line: L },
  { year: "2026", org: "Zepto", line: L },
  { year: "2026", org: "Away", line: L },
  { year: "2026", org: "CaratLane", line: L },
  { year: "2026", org: "Toppr", line: L },
];

export default function HeroV2({ flyerRef, stage, reduce, replayId, replayGreeting }) {
  return (
    <div className="hv2">
      <h1 className="hv2__head" data-calm id="hello-hero-title">
        <span className="hv2__face">
          <span className="hello-hero__flyer hv2__flyer" ref={flyerRef}>
            <span className="header__avatar-wrap" onMouseEnter={replayGreeting}>
              <MorphFace key={`face-${replayId}`} still />
              <Guard name="hero-morph"><HeroMorph ready={stage === "reveal"} /></Guard>
              {!reduce && (
                <span className="header__wave" data-kind="wave" aria-hidden key={`wave-${replayId}`}>
                  <img className="header__wave-img" src="/wave.svg" alt="" width="26" height="26" />
                </span>
              )}
            </span>
          </span>
        </span>
        <span className="hv2__tagline">{HERO_V2_TAGLINE}</span>
      </h1>
    </div>
  );
}
