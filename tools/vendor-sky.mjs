// Vendors the source-of-truth frag into src/shaders/washes.js.
// GUARD: washes.js holds the shader in a JS TEMPLATE LITERAL, so a backtick or a
// ${ in the GLSL (both perfectly legal in a comment) silently produces a file that
// parses as garbage. This bit me once: a comment reading `sky` broke the build.
import fs from "node:fs";
const frag = fs.readFileSync("public/shader-viewer/presets/living-sky.frag", "utf8").replace(/\s+$/, "\n");
if (frag.includes("`") || frag.includes("${")) {
  const line = frag.split("\n").findIndex((l) => l.includes("`") || l.includes("${")) + 1;
  console.error(`REFUSING TO VENDOR: template-hostile character at frag line ${line}`);
  process.exit(1);
}
let w = fs.readFileSync("src/shaders/washes.js", "utf8");
const a = w.indexOf("export const LIVING_SKY = `"), b = w.indexOf("`;", a);
if (a < 0 || b < 0) { console.error("markers not found"); process.exit(1); }
fs.writeFileSync("src/shaders/washes.js", w.slice(0, a) + "export const LIVING_SKY = `" + frag + w.slice(b));
console.log("vendored", frag.length, "chars");
