/**
 * Renders the two fixture source images (an illustrated toadstool in a pot and
 * a toy robot) from inline SVG to PNG with Playwright's Chromium.
 *   node scripts/make-fixture-images.mjs
 */
import { chromium } from "@playwright/test";
import { fileURLToPath } from "node:url";

const OUT = fileURLToPath(new URL("../fixtures/images/", import.meta.url));

const toadstool = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
  <defs>
    <radialGradient id="bg" cx="50%" cy="40%" r="70%"><stop offset="0" stop-color="#fbf3e8"/><stop offset="1" stop-color="#efe1cf"/></radialGradient>
    <linearGradient id="pot" x1="0" x2="1"><stop offset="0" stop-color="#d9773f"/><stop offset=".6" stop-color="#c8653a"/><stop offset="1" stop-color="#a24c27"/></linearGradient>
    <radialGradient id="cap" cx="40%" cy="30%" r="80%"><stop offset="0" stop-color="#ef5a41"/><stop offset="1" stop-color="#c22c22"/></radialGradient>
  </defs>
  <rect width="800" height="800" fill="url(#bg)"/>
  <ellipse cx="400" cy="700" rx="230" ry="30" fill="#000" opacity=".08"/>
  <path d="M245 520 L555 520 L520 690 Q400 712 280 690 Z" fill="url(#pot)" stroke="#5a2a14" stroke-width="5"/>
  <rect x="222" y="490" width="356" height="56" rx="16" fill="#b0532c" stroke="#5a2a14" stroke-width="5"/>
  <ellipse cx="400" cy="494" rx="170" ry="16" fill="#4b3326"/>
  <path d="M330 494 Q322 410 345 330 L455 330 Q478 410 470 494 Z" fill="#f2e6cd" stroke="#5a2a14" stroke-width="5"/>
  <ellipse cx="372" cy="420" rx="9" ry="13" fill="#2a211d"/><ellipse cx="428" cy="420" rx="9" ry="13" fill="#2a211d"/>
  <ellipse cx="352" cy="444" rx="16" ry="9" fill="#f29a8e" opacity=".85"/><ellipse cx="448" cy="444" rx="16" ry="9" fill="#f29a8e" opacity=".85"/>
  <path d="M190 330 Q200 150 400 130 Q600 150 610 330 Q400 372 190 330 Z" fill="url(#cap)" stroke="#5a2a14" stroke-width="5"/>
  <path d="M215 330 Q400 362 585 330 Q560 350 400 356 Q240 350 215 330 Z" fill="#e6d2ad"/>
  <ellipse cx="400" cy="168" rx="44" ry="20" fill="#fbf5ea"/>
  <ellipse cx="300" cy="230" rx="32" ry="20" fill="#fbf5ea" transform="rotate(-25 300 230)"/>
  <ellipse cx="500" cy="230" rx="32" ry="20" fill="#fbf5ea" transform="rotate(25 500 230)"/>
  <ellipse cx="400" cy="265" rx="38" ry="22" fill="#fbf5ea"/>
  <ellipse cx="230" cy="306" rx="20" ry="12" fill="#fbf5ea" transform="rotate(-50 230 306)"/>
  <ellipse cx="570" cy="306" rx="20" ry="12" fill="#fbf5ea" transform="rotate(50 570 306)"/>
  <path d="M250 494 q-6 -60 8 -80 q4 40 6 80z M270 494 q4 -50 22 -64 q-8 34 -10 64z" fill="#6daa45" stroke="#2f5a1f" stroke-width="3"/>
  <path d="M528 494 q6 -60 -8 -80 q-4 40 -6 80z M510 494 q-4 -44 -20 -58 q8 30 8 58z" fill="#6daa45" stroke="#2f5a1f" stroke-width="3"/>
  <path d="M470 494 q8 -50 -4 -84" fill="none" stroke="#4f8a32" stroke-width="7" stroke-linecap="round"/>
  <path d="M466 412 q30 -26 52 -6 q-26 18 -52 6z" fill="#6daa45" stroke="#2f5a1f" stroke-width="3"/>
</svg>`;

const robot = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
  <rect width="800" height="800" fill="#e5eef0"/>
  <ellipse cx="400" cy="720" rx="210" ry="26" fill="#000" opacity=".08"/>
  <g stroke="#1b3a3a" stroke-width="6" stroke-linejoin="round">
    <rect x="320" y="560" width="50" height="120" rx="14" fill="#c9ccd1"/>
    <rect x="430" y="560" width="50" height="120" rx="14" fill="#c9ccd1"/>
    <rect x="300" y="668" width="90" height="44" rx="16" fill="#2f7f7d"/>
    <rect x="410" y="668" width="90" height="44" rx="16" fill="#2f7f7d"/>
    <rect x="260" y="360" width="280" height="230" rx="54" fill="#4fb3b0"/>
    <rect x="252" y="540" width="296" height="34" rx="14" fill="#2f7f7d"/>
    <path d="M400 500 L355 450 Q350 420 378 418 Q394 418 400 434 Q406 418 422 418 Q450 420 445 450 Z" fill="#ef4b5f"/>
    <path d="M262 395 Q205 430 210 520" fill="none" stroke-width="44" stroke="#1b3a3a" stroke-linecap="round"/>
    <path d="M262 395 Q205 430 210 520" fill="none" stroke-width="32" stroke="#4fb3b0" stroke-linecap="round"/>
    <path d="M538 395 Q600 360 610 280" fill="none" stroke-width="44" stroke="#1b3a3a" stroke-linecap="round"/>
    <path d="M538 395 Q600 360 610 280" fill="none" stroke-width="32" stroke="#4fb3b0" stroke-linecap="round"/>
    <circle cx="262" cy="392" r="36" fill="#2f7f7d"/><circle cx="538" cy="392" r="36" fill="#2f7f7d"/>
    <path d="M190 525 a26 26 0 1 0 40 0" fill="none" stroke="#c9ccd1" stroke-width="14" stroke-linecap="round"/>
    <path d="M592 262 a26 26 0 1 1 40 0" fill="none" stroke="#c9ccd1" stroke-width="14" stroke-linecap="round"/>
    <rect x="370" y="322" width="60" height="44" rx="10" fill="#c9ccd1"/>
    <rect x="245" y="140" width="310" height="200" rx="56" fill="#4fb3b0" transform="rotate(-5 400 240)"/>
    <rect x="285" y="190" width="230" height="100" rx="26" fill="#1d2833" transform="rotate(-5 400 240)"/>
    <circle cx="345" cy="244" r="28" fill="#bff6ff"/><circle cx="455" cy="234" r="28" fill="#bff6ff"/>
    <rect x="215" y="215" width="34" height="56" rx="12" fill="#c9ccd1" transform="rotate(-5 400 240)"/>
    <rect x="552" y="200" width="34" height="56" rx="12" fill="#c9ccd1" transform="rotate(-5 400 240)"/>
    <path d="M398 142 Q404 100 432 76" fill="none"/>
    <circle cx="436" cy="70" r="18" fill="#ef4b5f"/>
  </g>
  <circle cx="345" cy="244" r="40" fill="#5fd7ff" opacity=".25"/><circle cx="455" cy="234" r="40" fill="#5fd7ff" opacity=".25"/>
</svg>`;

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const page = await browser.newPage({ viewport: { width: 800, height: 800 } });
for (const [name, svg] of [
  ["toadstool", toadstool],
  ["robot", robot],
]) {
  await page.setContent(`<html><body style="margin:0">${svg}</body></html>`);
  await page.locator("svg").screenshot({ path: `${OUT}${name}.png` });
  console.log("wrote", `${name}.png`);
}
await browser.close();
