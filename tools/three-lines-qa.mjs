// Closed-loop QA for the Three Lines icon system: render the INTERMEDIATE
// states of every morph the canvas actually performs (cycle order pairs +
// representative cross-jumps) as a static contact sheet, screenshot it with
// headless Chrome, and judge the frames by eye. Columns: t = 0, .25, .5,
// .75, 1, and 1.15 (spring overshoot extrapolation).
import { writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { pathToFileURL, fileURLToPath } from "node:url";

const DATA = pathToFileURL(
  "/Users/agamagarwal/My Drive/Active - Portfolio/Portfolio/src/figures/threeLines/threeLinesData.js",
).href;
const { ICONS, samplePoints, pathD, rotatePoints, shortestDelta, STROKE } =
  await import(DATA);

const byKey = Object.fromEntries(ICONS.map((i) => [i.key, i]));
const TS = [0, 0.25, 0.5, 0.75, 1, 1.15];

// every transition the auto-cycle performs, plus notable manual jumps
const pairs = ICONS.map((ic, i) => [ic, ICONS[(i + 1) % ICONS.length]]);
pairs.push(
  [byKey.menu, byKey.user],
  [byKey.seed, byKey.play],
  [byKey.close, byKey["arrow-right"]],
  [byKey["arrow-left"], byKey["arrow-up"]],
  [byKey["arrow-up"], byKey["arrow-right"]],
  [byKey["arrow-left"], byKey["arrow-right"]],
);

function frame(a, b, t) {
  const rotational = a.rot && b.rot && a.rot.group === b.rot.group;
  if (rotational) {
    const delta = shortestDelta(a.rot.angle, b.rot.angle);
    return a.lines.map((s) => rotatePoints(samplePoints(s), delta * t));
  }
  return a.lines.map((s, i) => {
    const from = samplePoints(s);
    const to = samplePoints(b.lines[i]);
    return from.map((p, k) => [
      p[0] + (to[k][0] - p[0]) * t,
      p[1] + (to[k][1] - p[1]) * t,
    ]);
  });
}

const cell = (pts) =>
  `<svg viewBox="-3 -3 30 30" width="86" height="86" fill="none" stroke="#111" stroke-width="${STROKE}" stroke-linecap="round" stroke-linejoin="round">${pts
    .map((p) => `<path d="${pathD(p)}"/>`)
    .join("")}</svg>`;

const rows = pairs
  .map(([a, b]) => {
    const rotational = a.rot && b.rot && a.rot.group === b.rot.group;
    const cells = TS.map((t) => `<td>${cell(frame(a, b, t))}</td>`).join("");
    return `<tr><th>${a.key} to ${b.key}${rotational ? " (ROT)" : ""}</th>${cells}</tr>`;
  })
  .join("\n");

const html = `<!doctype html><meta charset="utf-8"><style>
body{font:12px ui-monospace,monospace;background:#fff;color:#111;margin:16px}
table{border-collapse:collapse}
th{text-align:right;padding:0 10px;font-weight:400;white-space:nowrap}
td{border:1px solid #ddd}
thead td{border:0;text-align:center;padding:4px}
</style><table><thead><tr><td></td>${TS.map((t) => `<td>t=${t}</td>`).join("")}</tr></thead>
<tbody>${rows}</tbody></table>`;

const OUT = fileURLToPath(new URL("./three-lines-sheet.html", import.meta.url));
writeFileSync(OUT, html);
execFileSync("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
  "--headless=new",
  `--screenshot=${OUT.replace(/html$/, "png")}`,
  "--window-size=860,2100",
  "--hide-scrollbars",
  `file://${OUT}`,
]);
console.log("wrote", OUT.replace(/html$/, "png"), `${pairs.length} pairs`);
