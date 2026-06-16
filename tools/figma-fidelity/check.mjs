#!/usr/bin/env node
/**
 * Figma fidelity check.
 *
 * For each figure in figures.json: rasterize its rebuilt SVG with resvg (using
 * the same Inter fonts the app uses) and compare it pixel-for-pixel against the
 * Figma reference PNG. Writes a side-by-side composite to ./out and prints a
 * verdict per figure. No browser, no dev server, no touching anyone's tab.
 *
 * Usage:
 *   node tools/figma-fidelity/check.mjs            # all figures
 *   node tools/figma-fidelity/check.mjs awayLanding # one figure
 */
import { Resvg } from "@resvg/resvg-js";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../../"); // portfolio project root
const manifest = JSON.parse(readFileSync(join(here, "figures.json"), "utf8"));
const only = process.argv[2];

let worst = "PASS";
const rank = { PASS: 0, WARN: 1, FAIL: 2 };
let ran = 0;

for (const fig of manifest.figures) {
  if (only && fig.name !== only) continue;
  ran++;

  const svgPath = resolve(root, fig.svg);
  const refPath = resolve(here, "refs", fig.ref);
  if (!existsSync(svgPath)) {
    console.error(`MISSING svg: ${fig.svg}`);
    worst = "FAIL";
    continue;
  }
  if (!existsSync(refPath)) {
    console.error(`MISSING ref: refs/${fig.ref} (export it from Figma node ${fig.figma?.nodeId})`);
    worst = "FAIL";
    continue;
  }

  const svg = readFileSync(svgPath, "utf8");
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: fig.renderWidth || 360 },
    font: { loadSystemFonts: true, defaultFontFamily: "Inter" },
    background: "#0B0B14",
  });
  const minePath = resolve(here, "out", `${fig.name}.mine.png`);
  writeFileSync(minePath, resvg.render().asPng());

  const comparePath = resolve(here, "out", `${fig.name}.compare.png`);
  const out = execFileSync(
    "python3",
    [resolve(here, "compare.py"), refPath, minePath, comparePath, fig.name],
    { encoding: "utf8" },
  ).trim();

  let rep;
  try {
    rep = JSON.parse(out);
  } catch {
    console.error(out);
    worst = "FAIL";
    continue;
  }
  if (rank[rep.verdict] > rank[worst]) worst = rep.verdict;
  const bar =
    rep.verdict === "PASS" ? "✓" : rep.verdict === "WARN" ? "⚠" : "✗";
  console.log(
    `${bar} ${rep.name.padEnd(16)} ${rep.verdict.padEnd(4)}  fidelity ${rep.fidelity}%  ` +
      `diff ${rep.pct_pixels_diff}% px  mae ${rep.mae}  -> ${rep.compare_png.replace(root + "/", "")}`,
  );
}

if (ran === 0) {
  console.error(only ? `No figure named "${only}" in figures.json` : "No figures in figures.json");
  process.exit(2);
}
console.log(`\nworst verdict: ${worst}`);
process.exit(worst === "FAIL" ? 1 : 0);
