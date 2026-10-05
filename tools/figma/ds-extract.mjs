#!/usr/bin/env node
// Read the site's design system and emit the spec a Figma build consumes.
//
// This is the code -> design half of the bridge, minus the final write. The
// write itself needs `use_figma` (Figma's Plugin API over MCP), and that channel
// has to be open; everything that has to be DECIDED, though - which components
// exist, which of their states are real variants, which tokens are colours vs
// durations vs easings - is decided here, from the source, so the build step is
// mechanical and repeatable rather than a fresh act of judgement each time.
//
// Emits tools/figma/ds-spec.json:
//   tokens[]     { name, value, kind, collection }  -> Figma variables
//   components[] { name, props[], classes[], variants{} } -> components + variant sets
//   icons[]      { name, viewBox, paths }            -> 24x24 icon components
//
// Run: node tools/figma/ds-extract.mjs [--print]

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// fileURLToPath, not .pathname: this project lives under "My Drive", and a
// space in the path comes back percent-encoded from a file: URL
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..", "..");
const DS = path.join(ROOT, "src", "figures", "ds");
const OUT = path.join(HERE, "ds-spec.json");
const PRINT = process.argv.includes("--print");

const read = (f) => fs.readFileSync(path.join(DS, f), "utf8");

// ---------------------------------------------------------------- tokens
// A Figma variable needs a TYPE, and CSS custom properties do not declare one.
// Classify by value shape first (that is the fact) and by name only to pick the
// collection (that is the convention). Anything unclassifiable stays a STRING
// rather than being guessed into a number.
function classify(name, value) {
  const v = value.trim();
  if (/^(#|rgb|hsl|oklch|oklab|color-mix|color\()/i.test(v)) return { kind: "COLOR", collection: "Colour" };
  if (/^cubic-bezier|^linear\(|^steps\(/i.test(v) || /ease/.test(name)) return { kind: "STRING", collection: "Easing" };
  if (/^-?[\d.]+m?s$/i.test(v) || /\bdur\b|duration|-beat-/.test(name)) return { kind: "FLOAT", collection: "Duration" };
  if (/^-?[\d.]+px$/.test(v)) {
    if (/-fs-|font-size/.test(name)) return { kind: "FLOAT", collection: "Type size" };
    if (/radius|-r-|corner/.test(name)) return { kind: "FLOAT", collection: "Radius" };
    return { kind: "FLOAT", collection: "Spacing" };
  }
  if (/^-?[\d.]+(rem|em)$/.test(v)) return { kind: "FLOAT", collection: /-fs-/.test(name) ? "Type size" : "Spacing" };
  if (/^-?[\d.]+$/.test(v)) return { kind: "FLOAT", collection: "Number" };
  if (/font/.test(name)) return { kind: "STRING", collection: "Font" };
  return { kind: "STRING", collection: "Other" };
}

const tokensCss = read("tokens.css");
const tokens = [];
const seen = new Set();
// only top-level declarations; a token redefined under .dark is a MODE of the
// same variable, recorded separately so the build can bind both modes
const darkBlocks = [...tokensCss.matchAll(/(?:^|\})\s*((?::root)?(?:\.dark|\[data-theme="dark"\])[^{]*)\{([^}]*)\}/g)];
const darkValues = new Map();
for (const [, , body] of darkBlocks) {
  for (const m of body.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/gi)) darkValues.set(m[1], m[2].trim());
}
for (const m of tokensCss.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/gi)) {
  const [, name, rawValue] = m;
  if (seen.has(name)) continue;
  seen.add(name);
  const value = rawValue.trim();
  const { kind, collection } = classify(name, value);
  const t = { name, value, kind, collection };
  if (darkValues.has(name) && darkValues.get(name) !== value) t.dark = darkValues.get(name);
  tokens.push(t);
}

// ---------------------------------------------------------------- icons
// The icons are inline SVG in Primitives.jsx and become 24x24 Figma components
// with their paths as vectors; pulling the `d` strings out means the build does
// not have to re-draw or re-trace anything.
const prims = read("Primitives.jsx");
const icons = [];
for (const m of prims.matchAll(/export const (Icon[A-Za-z]+)\s*=\s*\(([^)]*)\)\s*=>\s*\(<svg([^>]*)>([\s\S]*?)<\/svg>\)/g)) {
  const [, name, args, attrs, body] = m;
  const vb = /viewBox="([^"]+)"/.exec(attrs);
  icons.push({
    name,
    viewBox: vb ? vb[1] : "0 0 24 24",
    props: args.replace(/[{}]/g, "").split(",").map((s) => s.trim().split(/[:=]/)[0]).filter(Boolean),
    paths: [...body.matchAll(/\sd="([^"]+)"/g)].map((p) => p[1]),
    shapes: [...body.matchAll(/<(circle|ellipse|rect|path|line|polyline)\b/g)].map((s) => s[1]),
  });
}

// ---------------------------------------------------------------- components
// Props are the component's real API, so they are the candidate Figma component
// properties. Which of them become VARIANTS (a fixed axis) rather than plain
// properties is decided by what the CSS actually branches on - see below.
const components = [];
const compRe = /export (?:function|const) ([A-Z][A-Za-z0-9]*)\s*(?:=\s*)?\(\s*(\{[\s\S]*?\}|[a-z]*)\s*\)/g;
for (const m of compRe.matchAll ? [] : []) void m; // (kept for clarity; loop below)
for (const m of prims.matchAll(compRe)) {
  const [, name, argRaw] = m;
  if (name.startsWith("Icon")) continue;
  const props = argRaw
    .replace(/^\{|\}$/g, "")
    .split(/,(?![^{[(]*[}\])])/)
    .map((s) => s.trim().split(/[:=]/)[0].trim())
    .filter((s) => s && /^[a-zA-Z]/.test(s));
  components.push({ name, props, classes: [], variants: {} });
}

// The CSS is the evidence for variants: a `--modifier` class is a discrete
// option, a `[data-x]` attribute is a boolean or enum the component toggles,
// and a pseudo-class is an interaction state Figma models as its own variant.
const css = read("components.css");
const classes = new Map();
for (const m of css.matchAll(/(\.ds-[a-z0-9-]+)((?:[:[][^,{\s]*)*)/g)) {
  const base = m[1].replace(/--.*$/, "");
  const mod = m[1].includes("--") ? m[1].slice(m[1].indexOf("--") + 2) : null;
  const rec = classes.get(base) || { modifiers: new Set(), states: new Set(), data: new Set() };
  if (mod) rec.modifiers.add(mod);
  for (const s of m[2].matchAll(/:((?:hover|focus-visible|focus|active|disabled|checked))/g)) rec.states.add(s[1]);
  for (const a of m[2].matchAll(/\[data-([a-z-]+)(?:="([^"]*)")?\]/g)) rec.data.add(a[2] ? `${a[1]}=${a[2]}` : a[1]);
  classes.set(base, rec);
}
const classList = [...classes.entries()].map(([name, r]) => ({
  name,
  modifiers: [...r.modifiers].sort(),
  states: [...r.states].sort(),
  data: [...r.data].sort(),
}));

// attach each component's own classes by name convention (Button -> .ds-btn/.ds-button)
const alias = { Button: ["ds-btn", "ds-button"], Textarea: ["ds-textarea", "ds-input"], Segmented: ["ds-seg", "ds-segmented"], ChecklistRow: ["ds-crow", "ds-checklist"], PromptBanner: ["ds-prompt"], ImportBar: ["ds-import"], DropZone: ["ds-drop", "ds-drops"], RestrictionCard: ["ds-restr"], StepCard: ["ds-card", "ds-step"], TopBar: ["ds-topbar", "ds-head"] };
for (const c of components) {
  const want = alias[c.name] || [`ds-${c.name.toLowerCase()}`];
  c.classes = classList.filter((cl) => want.some((w) => cl.name === `.${w}`));
  for (const cl of c.classes) {
    if (cl.modifiers.length) c.variants[cl.name + " modifier"] = cl.modifiers;
    if (cl.states.length) c.variants[cl.name + " state"] = ["rest", ...cl.states];
    if (cl.data.length) c.variants[cl.name + " data"] = cl.data;
  }
}

const spec = {
  generatedAt: new Date().toISOString(),
  source: { tokens: "src/figures/ds/tokens.css", components: "src/figures/ds/Primitives.jsx", css: "src/figures/ds/components.css" },
  counts: {
    tokens: tokens.length,
    tokensWithDarkMode: tokens.filter((t) => t.dark).length,
    collections: [...new Set(tokens.map((t) => t.collection))].length,
    components: components.length,
    icons: icons.length,
    cssClasses: classList.length,
  },
  collections: Object.fromEntries(
    [...new Set(tokens.map((t) => t.collection))].map((c) => [c, tokens.filter((t) => t.collection === c).length])),
  tokens,
  components,
  icons,
  classes: classList,
};

fs.writeFileSync(OUT, JSON.stringify(spec, null, 2));
console.log(`wrote ${path.relative(ROOT, OUT)}`);
console.log(JSON.stringify(spec.counts, null, 2));
console.log("collections:", JSON.stringify(spec.collections));
if (PRINT) {
  console.log("\ncomponents:");
  for (const c of components) {
    const v = Object.entries(c.variants).map(([k, o]) => `${k}=${o.length}`).join(" ");
    console.log(`  ${c.name.padEnd(16)} props[${c.props.join(",")}] ${v}`);
  }
  console.log("\nicons:", icons.map((i) => i.name).join(", "));
}
