// node idmapgen.mjs GLB_URL FIT_URL OUT.png IDS [PROPS=Hat,HatBand] [HARNESS=http://127.0.0.1:58741]
//   e.g. node idmapgen.mjs /faces/face-noir.glb /faces/fit-noir.json idmap-noir.png Skin,Hair,EyeL,EyeR,BrowL,BrowR,Mouth Hat,HatBand
// Needs the fit harness (tools/face3d/work/harness) with idmapgen.js beside its index.html.
import { chromium } from "playwright";
import fs from "node:fs";
import zlib from "node:zlib";
const [glb, fit, out, ids, props = "", base = "http://127.0.0.1:58741"] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const page = await browser.newPage();
await page.goto(base + "/?skin=none");
const px = await page.evaluate(async ([glb, fit, ids, props]) => (await import("/idmapgen.js")).renderIdMap(glb, fit, ids, props), [glb, fit, ids.split(","), props.split(",").filter(Boolean)]);
await browser.close();
// an 8-bit greyscale PNG, written by hand (no image library needed)
const W = 802, H = 862;
const raw = Buffer.alloc((W + 1) * H);
for (let y = 0; y < H; y++) { raw[y * (W + 1)] = 0; for (let x = 0; x < W; x++) raw[y * (W + 1) + 1 + x] = px[y * W + x]; }
const crcT = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = (b) => { let c = 0xffffffff; for (const v of b) c = crcT[(c ^ v) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (t, d) => { const len = Buffer.alloc(4); len.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([len, td, c]); };
const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 0;
fs.writeFileSync(out, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]));
const counts = {}; for (const v of px) counts[v] = (counts[v] || 0) + 1;
console.log("wrote", out, counts);
