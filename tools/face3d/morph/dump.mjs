// dump the ids and the shaded render at a pose (full size, 802 x 862) as PNGs
import { chromium } from "/Users/agamagarwal/portfolio/node_modules/playwright/index.mjs";
import fs from "fs";
const [out, poseJson] = process.argv.slice(2);
const b = await chromium.launch({ args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] });
const p = await b.newPage();
p.on("pageerror", (e) => console.log("ERR", e.message));
await p.goto("http://localhost:58731/?fit");
await p.waitForFunction(() => window.F, null, { timeout: 60000 });
const r = await p.evaluate(async (pose) => {
  const F = await window.fitPose.makeFitter(1);
  const ids = F.ids3(pose);
  const c = document.createElement("canvas"); c.width = F.w; c.height = F.h;
  const g = c.getContext("2d"); const im = g.createImageData(F.w, F.h);
  for (let i = 0; i < ids.length; i++) { im.data[i * 4] = ids[i]; im.data[i * 4 + 1] = ids[i]; im.data[i * 4 + 2] = ids[i]; im.data[i * 4 + 3] = 255; }
  g.putImageData(im, 0, 0);
  const idPng = c.toDataURL("image/png");
  F.rig.pose(pose); F.rig.shaded(F.renderer, null);
  const shaded = F.renderer.domElement.toDataURL("image/png");
  return { idPng, shaded };
}, JSON.parse(poseJson));
fs.writeFileSync(out + "_ids.png", Buffer.from(r.idPng.split(",")[1], "base64"));
fs.writeFileSync(out + "_shaded.png", Buffer.from(r.shaded.split(",")[1], "base64"));
await b.close();
