import { chromium } from "playwright-core";
const b = await chromium.launch({ channel: "chrome", args: ["--ignore-gpu-blocklist"] });
const p = await b.newPage(); await p.goto("about:blank");
console.log(await p.evaluate(() => { const gl = document.createElement("canvas").getContext("webgl2"); const e = gl.getExtension("WEBGL_debug_renderer_info"); return gl.getParameter(e.UNMASKED_RENDERER_WEBGL); }));
await b.close();
