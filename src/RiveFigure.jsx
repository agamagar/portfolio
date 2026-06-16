import { useEffect } from "react";
import { useRive, Layout, Fit, Alignment } from "@rive-app/react-canvas";

// Rive figure with data binding. This .riv drives its motion from a state machine
// fed by a view model variable: on load we bind the default view model, set the
// variable `key` to "all" (which selects the intended timeline), then start the
// state machine. Pass `bindings` to set other variables, `stateMachines` to pin
// a specific machine.
export default function RiveFigure({
  src,
  stateMachines,
  artboard,
  alt = "",
  bindings,
}) {
  const { rive, RiveComponent } = useRive({
    src,
    artboard,
    autoBind: true, // bind the default view model instance for data binding
    autoplay: false, // we start the state machine explicitly once vars are set
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
  });

  useEffect(() => {
    if (!rive) return;
    try {
      // set data-bound variables (default: key = "all")
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
      // start the state machine (named one, else the first), else first animation
      const sm =
        (Array.isArray(stateMachines) ? stateMachines[0] : stateMachines) ||
        rive.stateMachineNames?.[0];
      if (sm) rive.play(sm);
      else if (rive.animationNames?.length) rive.play(rive.animationNames[0]);
    } catch (e) {
      console.warn("[RiveFigure] data-bind/play failed:", e);
    }
  }, [rive, stateMachines, bindings]);

  return (
    <div className="fig-rive" role="img" aria-label={alt}>
      <RiveComponent />
    </div>
  );
}
