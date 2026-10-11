// node src/figures/board/lab/export-samples.mjs <outDir>
// Writes a finished (static, self-contained) SVG of every preset. Images are inlined as data URLs.
import { writeFileSync, readFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildScene } from "../core/scene.js";
import { sceneToSVG } from "../core/svg.js";
import { PRESETS } from "../presets.js";

const out = process.argv[2] ?? "board-samples";
const root = join(dirname(fileURLToPath(import.meta.url)), "../../../../public");
mkdirSync(out, { recursive: true });
for (const [name, p] of Object.entries(PRESETS)) {
  let svg = sceneToSVG(buildScene(p.spec(p.input)), { animated: false, id: "s" });
  svg = svg.replace(/<image href="(\/[^"]+)"/g, (m, href) => {
    const f = join(root, href);
    if (!existsSync(f)) return m;
    const ext = href.split(".").pop().replace("jpg", "jpeg");
    return `<image href="data:image/${ext};base64,${readFileSync(f).toString("base64")}"`;
  });
  writeFileSync(join(out, `${name}.svg`), svg);
  console.log("wrote", join(out, `${name}.svg`), Math.round(svg.length / 1024) + " KB");
}
