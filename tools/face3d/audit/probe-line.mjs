// probe-line.mjs OUT RIG [BASE] : where does the thin pale line along the nose edge come from?
// Renders the rig at rest with: all as is / no skin texture (flat) / no baked vertex AO / normals as flat colour.
import { chromium } from "playwright";
import fs from "node:fs";
const [out, rig, base = "http://127.0.0.1:5173"] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const page = await browser.newPage();
await page.goto(base + "/faces", { timeout: 180000 });
await page.evaluate(() => import("/tools/face3d/audit/rigshot-lib.js").then((m) => (window.RS = m)));
await page.evaluate((r) => window.RS.load(r), rig);
const shot = async (name) => { const d = await page.evaluate((r) => window.RS.shot(r, "think", 0.5, 0, 0), rig); fs.writeFileSync(`${out}/${rig}_${name}.png`, Buffer.from(d.split(",")[1], "base64")); };
await shot("base");
await page.evaluate((r) => { const s = window.RS.R[r].parts.Skin.userData.mats.shaded; s.uniforms.uUseMap.value = 0; s.uniforms.uHasRaw.value = 0; }, rig);
await shot("notexture");
await page.evaluate((r) => { const s = window.RS.R[r].parts.Skin.userData.mats.shaded; s.vertexColors = false; s.defines = {}; s.needsUpdate = true; }, rig);
await shot("notexture_noao");
await page.evaluate((r) => { const s = window.RS.R[r].parts.Skin.userData.mats.shaded; s.fragmentShader = s.fragmentShader.replace("gl_FragColor = vec4(col, 1.0);", "gl_FragColor = vec4(normalize(vN) * 0.5 + 0.5, 1.0);"); s.needsUpdate = true; }, rig);
await shot("normals");
console.log("done");
await browser.close();
