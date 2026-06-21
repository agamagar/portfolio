import { useEffect, useRef } from "react";
import { useRive, Layout, Fit, Alignment } from "@rive-app/react-canvas";

// Rive figure with data binding. This .riv drives its motion from a state machine
// fed by a view model variable: on load we bind the default view model, set the
// variable `key` to "all" (which selects the intended timeline), then start the
// state machine. Pass `bindings` to set other variables, `stateMachines` to pin
// a specific machine.
//
// Playback is tied to visibility via an IntersectionObserver: the machine plays
// whenever the figure is on screen and pauses when it scrolls away. Without this
// it would run (and settle on its end frame) off-screen on mount, so by the time
// the section came into view it looked stuck.
export default function RiveFigure({
  src,
  stateMachines,
  artboard,
  alt = "",
  bindings,
}) {
  const wrapRef = useRef(null);
  const { rive, RiveComponent } = useRive({
    src,
    artboard,
    autoBind: true, // bind the default view model instance for data binding
    autoplay: false, // playback is driven by the visibility observer below
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
  });

  // bind view-model variables once the file is loaded (default: key = "all")
  useEffect(() => {
    if (!rive) return;
    try {
      const vmi = rive.viewModelInstance;
      if (vmi) {
        const vars = bindings || { key: "all" };
        for (const [name, value] of Object.entries(vars)) {
          const en = vmi.enum(name); // most likely: an enum option
          if (en) {
            en.value = value;
            continue;
          }
          const str = vmi.string(name);
          if (str) {
            str.value = value;
            continue;
          }
          if (typeof value === "number") {
            const num = vmi.number(name);
            if (num) num.value = value;
          } else if (typeof value === "boolean") {
            const bool = vmi.boolean(name);
            if (bool) bool.value = value;
          }
        }
      }
    } catch (e) {
      console.warn("[RiveFigure] data-bind failed:", e);
    }
  }, [rive, bindings]);

  // play while visible, pause while off screen
  useEffect(() => {
    if (!rive) return;
    const el = wrapRef.current;
    if (!el) return;

    const target =
      (Array.isArray(stateMachines) ? stateMachines[0] : stateMachines) ||
      rive.stateMachineNames?.[0] ||
      rive.animationNames?.[0];

    // restart from the top: stop() rewinds the state machine / animation to its
    // initial state, play() runs it again — so the section always shows the
    // animation from the beginning, never frozen on a settled end frame.
    const playFromStart = () => {
      try {
        rive.stop();
        target ? rive.play(target) : rive.play();
      } catch (e) {
        console.warn("[RiveFigure] restart failed:", e);
      }
    };
    const pause = () => {
      try {
        rive.pause();
      } catch {
        /* no-op */
      }
    };

    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? playFromStart() : pause()),
      { threshold: 0.2 },
    );
    io.observe(el);

    // resume if the tab is refocused while the figure is on screen (rAF throttling
    // in a backgrounded tab is a common way a state machine ends up stalled)
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      const r = el.getBoundingClientRect();
      const onScreen = r.top < window.innerHeight && r.bottom > 0;
      if (onScreen) playFromStart();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [rive, stateMachines]);

  return (
    <div ref={wrapRef} className="fig-rive" role="img" aria-label={alt}>
      <RiveComponent />
    </div>
  );
}
