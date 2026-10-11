import { createRoot } from "react-dom/client";
import Whiteboard from "../../Whiteboard";
import { PRESETS } from "../presets";

const spec = (name) => PRESETS[name].spec(PRESETS[name].input);

createRoot(document.getElementById("root")).render(
  <main>
    <h1>Easel with generated boards</h1>
    <p className="lede">The same hand-drawn easel, now holding boards written by the engine. Tap one: it writes itself out in the lightbox.</p>
    <div className="grid">
      <Whiteboard board={spec("mindmap")} alt="Mind map: scheduled delivery" caption="A mind map from a plain outline." />
      <Whiteboard board={spec("flow")} alt="Flow: from cart to doorstep" caption="Steps become boxes joined by arrows." />
      <Whiteboard board={spec("annotate")} alt="Notes on the slot picker screen" caption="Annotating a screenshot." />
      <Whiteboard board={spec("stickies")} alt="Sticky-note clusters" caption="Affinity clusters." />
      <Whiteboard src="/figures/whiteboard/zero-states.png" alt="The original easel image" caption="The original image mode still works." />
    </div>
  </main>,
);
