// A video clip pinned to a region of a phone screen, PLAY-GATED like the
// tours (annotation mskg3r0o, "play the animation only when this screen is
// centered and increased in size").
//
// The clips used to autoPlay on loop in every cell at once. The tours already
// answered why that is wrong here (msjywvoj and the reset call in msk1b8fq):
// motion belongs to the tile the row is presenting, and a screen you return
// to should start from its beginning, not from an arbitrary middle.
//
// So: `playing` follows the same gate the tours use (centred, held, clock
// running - decided by the CALLER, which owns that state), and every PLAY
// starts from frame zero. Reset-not-resume mirrors msk1b8fq exactly.
//
// THE PARKED STATE IS THE BASE STILL, NOT A VIDEO FRAME (annotation mskha2tv,
// "actually freeze frame is the base asset image without the video overlay",
// which supersedes mskh85j7's hold-the-first-frame reading). While a tile is
// not the presented one, the video FADES OUT and the screenshot underneath -
// already in every cell as `.fig-screen` - is the resting image. Arrival
// rewinds to zero, plays, and fades the video back in.
//
// This also dissolves the whole rewind-timing question that mskg2a9o and
// mskh85j7 circled: a hidden video can rewind whenever it likes, so the
// grabbed tile never snaps under the finger (the fade is the only visible
// change, and it runs on the M3 effects curve like every other opacity move
// on the site).
//
// preload="auto", not "metadata": the play() fires the moment the tile
// arrives, and a metadata-only video answers that with a visible beat of
// nothing while bytes arrive. These clips are 100-950KB local files; buffering
// them eagerly is cheaper than the flash.

import { useEffect, useRef, useState } from "react";

// A stop FADES WHILE STILL MOVING, then parks (annotations mskhdztf then
// mskhh2fj, within the hour of each other and read together): the removal
// must not be a sudden frame change, AND an inactive frame must not be
// playing video. The first pass ran the loop out to its wrap before fading -
// faithful to mskhdztf alone, but it left an off-centre tile visibly playing
// for up to a full loop, which is exactly what mskhh2fj then called out. So:
// the fade starts the moment the gate flips off, the video keeps moving
// THROUGH the fade (a pause-then-fade freezes the motion mid-air, a subtle
// stutter), and once invisible it pauses and rewinds. Nothing jumps, and an
// inactive tile is just the still within a quarter second.
const FADE_OUT_MS = 260; // just past --m3-dur-effects-default, so the pause
// lands after the fade has finished rather than freezing a visible frame

export default function ClipVideo({ clip, playing }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(playing);

  // THE VIDEO HANDS BACK TO THE STILL BEFORE THE TILE MOVES (annotation
  // msl6clo9, "the video should loop back before the frame animates out").
  // The clip fades out on its own `ended` event - its frozen final frame and
  // the still beneath are the same image, so the crossfade is invisible - and
  // the hold's 350ms tail (msl5vhx8) means the fade completes while the tile
  // is still sitting at centre. The shrink then animates a tile that has
  // already returned to rest, instead of carrying a live video out with it.
  useEffect(() => {
    const v = ref.current;
    if (!v) return undefined;
    // A LOOPING CLIP NEVER ENDS, so this only governs the one-shot ones
    // (annotation msooyc18 asked for the Zepto banner to replay).
    if (clip.loop) return undefined;
    const onEnded = () => setShown(false);
    v.addEventListener("ended", onEnded);
    return () => v.removeEventListener("ended", onEnded);
  }, [clip.loop]);

  useEffect(() => {
    const v = ref.current;
    if (!v) return undefined;
    if (playing) {
      // per-clip tempo (mskhfiyf asked for 30% slower on the Away clip);
      // set before play so the first frame already moves at the right speed
      v.playbackRate = clip.rate ?? 1;
      v.currentTime = 0;
      const p = v.play();
      // autoplay can still be refused (low-power mode); a rejected promise
      // must not surface as an uncaught error for a decorative loop
      if (p) p.catch(() => {});
      setShown(true);
      return undefined;
    }
    setShown(false);
    if (v.paused) return undefined;
    const timer = setTimeout(() => {
      v.pause();
      v.currentTime = 0;
    }, FADE_OUT_MS);
    return () => clearTimeout(timer);
  }, [playing]);

  // mu9pnjcs "this animation is not playing" (20 Sep 2026). The play() above
  // runs ONCE, on mount, because `playing` never changes for the always-on
  // clips in the work grid - and a browser is free to refuse or interrupt that
  // one attempt. The rejection is swallowed on purpose (a decorative loop must
  // not throw), so a refused clip simply stayed frozen forever: measured all
  // four grid clips paused at the same fraction of a second, minutes apart,
  // in view, readyState 4, no error, and a manual play() started them and kept
  // them running. So the attempt was lost, not blocked.
  //
  // A clip that is meant to be playing therefore retries whenever it is on
  // screen. This is also the cheaper behaviour on a phone: a clip scrolled
  // away stops instead of decoding into an empty room.
  useEffect(() => {
    const v = ref.current;
    if (!v || !playing) return undefined;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (v.paused) {
            const p = v.play();
            if (p) p.catch(() => {});
          }
        } else if (!v.paused) {
          v.pause();
        }
      },
      { threshold: 0.1 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [playing]);

  return (
    <video
      ref={ref}
      className="hm__clip"
      style={{
        left: `${clip.left ?? 0}%`,
        top: `${clip.top}%`,
        width: `${clip.width ?? 100}%`,
        height: `${clip.height}%`,
        // a full-screen clip carries the phone corner's own radius; region
        // clips fall back to the CSS default
        borderRadius: clip.radius,
        opacity: shown ? 1 : 0,
      }}
      src={clip.src}
      muted
      /* PER-CLIP, and off by default (annotation msooyc18 turned it ON for the
         Zepto banner: "loop the video back so the start of the video plays
         again"). It is opt-in rather than global because the reasoning below is
         still true of the OTHER clips - it is a property of what a given export
         is, not of the component.
         
         What it costs on a clip that opts in: the wrap is a hard cut from the
         finished composition back to frame zero. That is fine for a banner that
         reads as a running animation and wrong for an entrance. */
      loop={clip.loop ? true : undefined}
      /* NO loop by default (annotation msl5w2q9, "glitch at the end"): these exports are
         ONE-SHOT ENTRANCES, not seamless loops - the last frame is the arrived
         composition and frame zero is empty, so every wrap was a hard snap
         from finished to nothing. Played once, an ended video freezes on its
         FINAL frame, which is the same image as the still beneath it - the
         dwell ends on a freeze that already matches what the fade reveals.
         The msl5vhx8 tail stays: it now buys the frozen frame a settled beat
         instead of exposing a wrap. */
      playsInline
      preload="auto"
      tabIndex={-1}
      aria-hidden
    />
  );
}
