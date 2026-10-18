// Hero v4: the headline set large and centred in the site's grotesk, tight leaded, with the live 3D face
// inline in the middle of it, spanning two lines with the words flowing around it (the reference's shells).
// The gap is a real grid track, not an overlay: a 3-column grid (words | face | words) where the face
// takes the two middle rows. Both break the line as 3 rows (the same grid, other words
// per segment: both sets are in the DOM, CSS shows one, and both are aria-hidden next to the sr text).
// The face is v1's stack verbatim (MorphFace + HeroMorph + the wave hand), so the morph, its clock and the
// reveal sequence are unchanged; the segments join the sequence as .hv4__t.
import MorphFace from "../MorphFace";
import HeroMorph from "./HeroMorph";
import { Guard } from "../ui/Guard";
import "./heroV4.css";

export const HERO_V4_COPY = "Hello! I’m Agam, a designer at the intersection of play and tech.";
// [row-1 line, row-2 left, row-2 right, row-3 left, row-3 right, row-4 line (unused)]
// breaks picked by measured width so the two sides of the face balance (B: 434|603, 261|361; A: 217|460, 261|361)
const WIDE = ["Hello! I’m Agam, a", "designer at", "the intersection", "of play", "and tech.", ""];
const PHONE = ["Hello! I’m Agam, a designer", "at the", "intersection", "of play", "and tech.", ""];
const AREAS = ["a", "bl", "br", "cl", "cr", "d"];

const Segs = ({ words, kind }) => words.map((w, i) => w && (
  <span key={kind + i} className={`hv4__t hv4__t--${kind} hv4__t--${AREAS[i]}`} aria-hidden>{w}</span>
));

export default function HeroV4({ flyerRef, stage, reduce, replayId, replayGreeting }) {
  return (
    <div className="hv4">
      <h1 className="hv4__head" data-calm aria-labelledby="hello-hero-title">
        <span className="hello-hero__sr" id="hello-hero-title">{HERO_V4_COPY}</span>
        <Segs words={WIDE} kind="w" />
        <Segs words={PHONE} kind="p" />
        <span className="hv4__face">
          <span className="hello-hero__flyer hv4__flyer" ref={flyerRef}>
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
      </h1>
    </div>
  );
}
