// renders the folio landing posters: the scene's real first frame, page chrome hidden
import { webkit } from 'playwright';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
const OUT = process.env.OUT;
const RATIOS = { '21x9': [2520, 1080, 1], '16x9': [1920, 1080, 1], '16x10': [1728, 1080, 1], '4x3': [1440, 1080, 1], '3x4': [810, 1080, 1.5], 'phone': [390, 844, 2.5] };
const TODS = { day: 10.5, golden: 17.3, dusk: 18.5, night: 21 };
const only = process.argv[2] ? process.argv[2].split(',') : null;
const browser = await webkit.launch();
fs.mkdirSync(OUT, { recursive: true });
for (const [rk, [w, h, dpr]] of Object.entries(RATIOS)) for (const [tk, tod] of Object.entries(TODS)) for (const theme of ['light', 'dark']) {
  const name = `${rk}-${tk}-${theme}`;
  if (only && !only.includes(name)) continue;
  // a full run skips stills already there (resume after a crash); named stills always re-render
  if (!only && fs.existsSync(`${OUT}/${name}.jpg`)) continue;
  for (let attempt = 0; attempt < 3; attempt++) { try {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dpr, colorScheme: theme });
  await ctx.addInitScript((th) => { try { localStorage.setItem('theme', th); } catch {} }, theme);
  const page = await ctx.newPage();
  await page.goto(`${process.env.BASE || 'http://localhost:5173'}/portfolio?scene=window&tod=${tod}&wx=clear&theme=${theme}`, { waitUntil: 'load' });
  await page.addStyleTag({ content: '.top-controls,.wscene-nudge,.wscene__poster,[data-agentation-root],[data-agentation-toolbar],[data-feedback-toolbar],agentation-root{display:none!important}' });
  const ok = await page.evaluate(async () => { for (let i = 0; i < 120 && !window.__windowScene; i++) await new Promise(r => setTimeout(r, 250)); return Promise.race([window.__windowScene?.ready, new Promise(r => setTimeout(() => r('timeout'), 60000))]); });
  await page.waitForTimeout(4000); // live page capture onto the monitor + TRAA settle
  const cls = await page.evaluate(() => document.documentElement.className);
  const png = `${OUT}/${name}.png`;
  await page.screenshot({ path: png });
  const jw = Math.min(Math.round(w * dpr), 1920);
  execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '78', '--resampleWidth', String(jw), png, '--out', `${OUT}/${name}.jpg`], { stdio: 'ignore' });
  fs.unlinkSync(png);
  console.log(name, ok, cls.includes('dark') ? 'dark' : 'light', Math.round(fs.statSync(`${OUT}/${name}.jpg`).size / 1024) + 'KB');
  await ctx.close();
  break; } catch (e) { console.log(name, 'retry', attempt, e.message.split('\n')[0]); } }
}
await browser.close();
