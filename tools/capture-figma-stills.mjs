// Stills for FigmaEmbed's fallback floor, rendered from the same live embeds (src/ui/FigmaEmbed.jsx), in a fresh
// headless context: no Figma sign-in, so a frame that renders here renders for any logged-out visitor.
//   node tools/capture-figma-stills.mjs            write the flow stills to public/figures/scheduled/figma/
//   node tools/capture-figma-stills.mjs --check    render only; print whether each one hit a sign-in wall
//   OUT=<dir> node tools/capture-figma-stills.mjs --screens   NODES=name=id,… frames to render-diff against a still
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const FILE = "R04cmbzFPQk2Q4IockGwqZ";
const OUT = process.env.OUT || "public/figures/scheduled/figma";
const SHOTS = process.argv.includes("--screens")
  ? (process.env.NODES || "cart-hubs=9:584,sheet=9:1904").split(",").map((p) => p.split("="))
  : [["flow-main", "9:154"], ["flow-slots-full", "11:3"], ["flow-exchange", "7:3"], ["flow-return", "10:3"]];
const check = process.argv.includes("--check");
const url = (n) => `https://embed.figma.com/proto/${FILE}?node-id=${n.replace(":", "-")}&starting-point-node-id=${encodeURIComponent(n)}&embed-host=portfolio&scaling=scale-down-width&hide-ui=1`;

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 360, height: 829 }, deviceScaleFactor: 2 });
let bad = 0;
for (const [name, node] of SHOTS) {
  const page = await ctx.newPage();
  await page.goto(url(node), { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(9000); // Figma paints well after load
  const wall = await page.evaluate(() => /log in|sign in|don.t have access/i.test(document.body.innerText));
  // Figma's own chrome over the frame: decline the cookie banner, drop the headless "hardware acceleration" toast
  await page.getByText("Do not allow cookies").click({ timeout: 3000 }).catch(() => {});
  await page.evaluate(() => {
    for (const el of document.querySelectorAll("body *")) {
      if (/hardware acceleration|uses cookies/i.test(el.textContent) && getComputedStyle(el).position === "fixed") el.remove();
    }
  });
  await page.waitForTimeout(600);
  if (wall) bad++;
  if (!check) await page.screenshot({ path: `${OUT}/${name}.png` });
  console.log(`${name} ${node}: ${wall ? "SIGN-IN WALL" : "renders logged-out"}`);
  await page.close();
}
await browser.close();
process.exit(bad ? 1 : 0);
