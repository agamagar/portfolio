import { useAgentationActive, useAgentationAccentId } from "./agentationActive";
import "./layerMap.css";

// LayerMap — invisible, *named* annotation hotspots over a flat figure, wired to
// live inside Agentation.
//
// A flat Figma export (a PNG plate, an image:/iphone:/collage: figure) is a
// single raster with no inner DOM, so Agentation can only select the whole
// screen. LayerMap reconstructs the figure's layers as real, positioned DOM
// elements — so Agentation's element picker can hit each one and report a
// precise identity (the layer name rides along as the class, aria-label, title,
// and hover tag → it lands in the annotation's element/accessibility/nearbyText).
//
// It renders only while Agentation's annotate mode is on (see agentationActive),
// so there is no separate control: turn Agentation on, a figure's layers become
// selectable; turn it off, they vanish. The hotspots also adopt Agentation's
// currently-selected annotation colour.
//
// Drop it as the LAST child of the figure's positioning context (the element the
// plate fills, e.g. `.gtmr-device`, which must be `position: relative`).
//
// Layer data shape (see schedulePageLayers.js — generate the rects with
// tools/figma-layers/extract.mjs, then hand-name them):
//   { name: "Promo banner", box: [x, y, w, h] }   // box = % of the figure
// Order parents BEFORE children: equal z-index means later-in-DOM paints on top,
// so a small child layer naturally sits above its parent → hovering the child
// selects the child, hovering the parent's gaps selects the parent (drill-down).

const slug = (s) =>
  String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default function LayerMap({ layers = [], label = "Figure layers" }) {
  const active = useAgentationActive();
  const accentId = useAgentationAccentId();
  if (!active || !layers.length) return null;
  // adopt Agentation's selected annotation colour (its global token), else fall
  // back to the page accent / a default blue
  const style = accentId
    ? { "--ds-layer-accent": `var(--agentation-color-${accentId})` }
    : undefined;
  return (
    <div className="ds-layermap" role="group" aria-label={label} data-layermap style={style}>
      {layers.map((L, i) => (
        <div
          key={(L.name || "layer") + i}
          className="ds-layer"
          // Agentation returns dataset.element verbatim as the annotation's
          // element name (its first-checked identity field), so this lands the
          // clean layer name in the output; aria-label/title are redundancy.
          data-element={L.name}
          data-layer={slug(L.name)}
          aria-label={`Layer: ${L.name}`}
          title={L.name}
          style={{
            left: `${L.box[0]}%`,
            top: `${L.box[1]}%`,
            width: `${L.box[2]}%`,
            height: `${L.box[3]}%`,
          }}
        >
          <span className="ds-layer__tag">{L.name}</span>
        </div>
      ))}
    </div>
  );
}
