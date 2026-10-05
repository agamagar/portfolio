// The closing room.
//
// Everything above this point is a page. This is a place. The room has its own
// ground in both themes, from first paint, with no scroll-triggered darkening:
// a room that is a different room is a fact about the page, and facts do not
// need to be revealed.
//
// The three.js console is only mounted once the room is close to the viewport.
// A WebGL context, a render loop and an audio graph at the bottom of a landing
// page should not be running while somebody is still reading the greeting.

import { Suspense, lazy, useCallback, useEffect, useRef, useState } from "react";

const DjConsole = lazy(() => import("../figures/dj/DjConsole"));

// `variant="card"` is the /hello booth: no 3D record crate, and the manual
// play button back on (annotation msbhza4n). The crate and the play control are
// alternatives, not companions — the crate WAS the transport once it became
// pickable, so keeping both would give the same job two affordances.
export default function DjBooth({ variant }) {
  const isCard = variant === "card";
  const ref = useRef(null);
  const [near, setNear] = useState(false);
  const apiRef = useRef(null);
  const [decks, setDecks] = useState(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      // One viewport of warning, so the console has finished its first frame by
      // the time the room is actually on screen.
      { rootMargin: "100% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // The global sound preference (the toggle in .top-controls) gates the booth's
  // master volume, so unmuting mid-session takes effect without tearing down the
  // audio graph.
  //
  // NB this must NEVER be called from inside a DjConsole callback. The console's
  // setMaster calls its own syncHud, which sets React state; invoking it from
  // within onApi/onDecks — themselves fired from the console's effects — put a
  // child setState inside the parent's callback and produced a genuine
  // "Maximum update depth exceeded" loop that stopped the console mounting at
  // all. Applying it from an effect keyed on `decks` runs it after render,
  // outside that chain.
  const applySound = useCallback((on) => {
    // 0.9 is the console's own default master, not 1 — matching it means the
    // toggle only ever gates sound, it never changes the mix.
    apiRef.current?.current?.setMaster?.(on ? 0.9 : 0);
  }, []);
  useEffect(() => {
    const onPref = (e) => applySound(!!e.detail?.on);
    window.addEventListener("sound-pref", onPref);
    return () => window.removeEventListener("sound-pref", onPref);
  }, [applySound]);
  // `decks` turning non-null is the signal that the scene effect has populated
  // apiRef, so this is where the initial mute lands. The ref guard keeps it to
  // one call however often decks updates afterwards.
  const soundAppliedRef = useRef(false);
  useEffect(() => {
    if (!decks || soundAppliedRef.current) return;
    soundAppliedRef.current = true;
    applySound(document.documentElement.dataset.sound === "on");
  }, [decks, applySound]);

  // Stable identities: DjConsole calls these from effects, and a new function
  // every render would re-fire them on every parent update.
  const handleApi = useCallback((ref_) => {
    apiRef.current = ref_;
  }, []);
  const handleDecks = useCallback((d) => setDecks(d), []);

  return (
    // No wrappers left: the room and its outer div are gone (annotation
    // msb8uck3), so the floor is a direct child of the page footer and carries
    // the measure and the vertical rhythm itself. The IntersectionObserver ref
    // moved here with them.
    //
    // The crate is no longer a DOM sibling at all (msbdalbj) — it is geometry
    // inside the console's own scene — so this holds the console and nothing
    // else. That also retired the DOM VinylWall and, with it, the pull-a-record
    // -to-mix interaction; the shelf is currently scenery, not a control.
    <div className="booth__floor" ref={ref}>
      <div className="booth__console">
        {near ? (
          <Suspense fallback={<div className="booth__loading" aria-hidden />}>
            {/* The exact compact widget from the index page (scan mode): a
                transparent, fill-less front-elevation line drawing (ms9q8s9d). */}
            {/* hover={false}: in the footer the console is decoration, so it
                should not react to a pointer passing over it (annotation
                msb98tdb). Pulling a record still works. */}
            {/* frontHeight 4.7 halves the camera's world box (annotation
                msbbntyj): the console is 8.4 x 0.55, so the default 9.4 is mostly
                empty air above and below it. Safe to crop HERE specifically
                because hover is off, so the camera never swings up to the top
                plan (which needs the extra room). /dj and the index embed keep
                the 9.4 default. .booth__console's aspect-ratio must stay 13/4.7
                to match, or the ortho pads the width instead. */}
            {/* hover is back on for /hello (annotation msbivfrw): the front
                elevation eases up into the top plan under the pointer. Safe in
                this variant only because the crate is off — the swing needs the
                vertical room frontHeight 4.7 halves, and the top plan is 4.4
                world units deep against a 4.7 band, so it fits with little to
                spare. Re-check that if either number moves. */}
            {/* crate: the record shelf now lives INSIDE the scene rather than
                as a DOM grid beside it (annotation msbdalbj), so it is drawn by
                the same camera and repainted by the same style system. It is
                placed to fit the frontHeight 4.7 band; if that number changes,
                re-check that the crate still clears the top of frame. */}
            <DjConsole
              variant="scan"
              controls={isCard}
              hover={isCard}
              frontHeight={4.7}
              crate={!isCard}
              onApi={handleApi}
              onDecks={handleDecks}
            />
          </Suspense>
        ) : (
          <div className="booth__loading" aria-hidden />
        )}
      </div>
    </div>
  );
}
