// The folio page's live poster (2026-09-27, Agam: "align the poster with the real
// hero at the hand-off"). The monitor ends the dolly on exactly what the page shows
// once the camera has landed: the page's own first viewport (the hero at the top,
// the work grid under it), captured in the browser at this viewport's size and
// pixel ratio, then placed on the screen's texture where screenRectAt(1) says the
// screen lands on the canvas. The post's page composite shows the screen untone-
// mapped from p 0.8 on, so the canvas hides onto the same pixels the page draws.
//
// The page's content waits at opacity 0 until the landing (windowScene.css); opacity
// does not inherit, so the capture only has to restore it on the root's direct
// children (closed popovers keep their own visibility: hidden).

import { domToCanvas } from "modern-screenshot";

// (the scroll nudge too: it is fixed to the viewport, so it rode into the capture and the
// monitor showed a second "scroll" pill that vanished at the hand-off, 2026-09-27)
const SKIP = ["wscene__host", "hello-scene-run", "wscene__runway", "wscene-nudge"];

// The page's web fonts, embedded in the capture. The capture renders the page as an
// SVG image, which cannot load external files, and it cannot read the cross-origin
// Google Fonts stylesheet at all: the contact heading's Newsreader came out as a
// wider Georgia and re-wrapped onto three lines. So the @font-face rules are gathered
// here (the Google stylesheet fetched, it is served with open CORS; the page's own
// same-origin rules read), only the latin subsets kept, and every url() inlined as a
// data URL (the browser has the files cached from the page's own load). Once a visit.
let fontCss = null;
const toDataUrl = async (url) => {
  const blob = await (await fetch(url)).blob();
  return await new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result);
    fr.onerror = rej;
    fr.readAsDataURL(blob);
  });
};
async function inlineUrls(css, base) {
  const urls = [...new Set([...css.matchAll(/url\((['"]?)([^'")]+)\1\)/g)].map((m) => m[2]))].filter((u) => !u.startsWith("data:"));
  let out = css;
  for (const u of urls) {
    try {
      const data = await toDataUrl(new URL(u, base).href);
      out = out.split(u).join(data);
    } catch {
      /* that face falls back */
    }
  }
  return out;
}
async function pageFontCss() {
  if (fontCss !== null) return fontCss;
  const parts = [];
  for (const sheet of document.styleSheets) {
    try {
      const faces = [...sheet.cssRules].filter((r) => r instanceof CSSFontFaceRule).map((r) => r.cssText);
      if (faces.length) parts.push(await inlineUrls(faces.join("\n"), sheet.href || location.href));
    } catch {
      /* cross-origin: fetched below */
    }
  }
  for (const l of document.querySelectorAll('link[rel="stylesheet"][href*="fonts.googleapis.com"]')) {
    try {
      const css = await (await fetch(l.href)).text();
      // Google's stylesheet labels each subset in a comment before its block
      const latin = css.split(/(?=\/\*\s*[\w-]+\s*\*\/)/).filter((blk) => /^\/\*\s*latin\s*\*\//.test(blk.trim())).join("\n");
      parts.push(await inlineUrls(latin || css, l.href));
    } catch {
      /* offline: the fallbacks stand in */
    }
  }
  fontCss = parts.join("\n");
  return fontCss;
}

// The media in a band of the page, ready to be drawn (2026-09-27, Agam: "the previews
// are broken on the right side monitor"): the work grid's phone screens are lazy <img>s
// and its clips <video>s; in scene mode the grid starts a runway below the fold, so at
// capture time the images had not loaded and the clips had no frame, and the monitor
// showed black phones. Lazy images in the band are switched to eager and decoded, clips
// wait for their first frame; each capped, so a slow asset cannot hold the capture.
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
async function mediaReady(root, top, bottom, cap = 4000) {
  const inBand = (el) => {
    const r = el.getBoundingClientRect();
    const t = r.top + window.scrollY;
    return t < bottom && t + r.height > top;
  };
  const jobs = [];
  for (const im of root.querySelectorAll("img")) {
    if (!inBand(im)) continue;
    if (im.loading === "lazy") im.loading = "eager";
    if (!(im.complete && im.naturalWidth)) jobs.push(im.decode().catch(() => {}));
  }
  for (const v of root.querySelectorAll("video")) {
    if (!inBand(v) || v.readyState >= 2) continue;
    if (v.preload === "none") v.preload = "auto";
    jobs.push(new Promise((res) => v.addEventListener("loadeddata", res, { once: true })));
  }
  if (jobs.length) await Promise.race([Promise.all(jobs), wait(cap)]);
}

export async function captureLanding({ root, runway, rect, bg, dpr = 1 }) {
  if (!root || !runway || !rect) return null;
  const vw = document.documentElement.clientWidth;
  const vh = window.innerHeight;
  const scale = Math.min(2, Math.max(1, dpr));
  // the hero's top is the landing scroll; the filter drops the runway spacer (and the
  // fixed canvas), so in the clone the hero starts at the top, as it does on screen
  const landTop = runway.getBoundingClientRect().bottom + window.scrollY;
  await mediaReady(root, landTop, landTop + vh);
  const skip = (el) => el.nodeType === 1 && SKIP.some((c) => el.classList?.contains(c));
  const below = (el) => {
    if (el.nodeType !== 1 || el === root) return false;
    const r = el.getBoundingClientRect();
    return r.top + window.scrollY > landTop + vh + 40; // starts below the landing viewport
  };
  const cssText = await pageFontCss();
  const shot = await domToCanvas(root, {
    font: cssText ? { cssText } : undefined,
    width: vw,
    height: vh,
    scale,
    backgroundColor: bg,
    filter: (el) => !skip(el) && !below(el),
    onCloneNode: (clone) => {
      for (const c of clone.children || []) {
        if (SKIP.some((k) => c.classList?.contains(k))) continue;
        c.style.opacity = "1";
      }
      // the hero at rest, as it is at the landing: its scroll fade (--hero-fade, an
      // opacity and a small rise) is baked into the clone at whatever it was
      for (const c of clone.querySelectorAll?.(".hello-hero__inner, .hello-hero__table") || []) {
        c.style.opacity = "1";
        c.style.translate = "none";
      }
    },
  });
  return onScreen(shot, { rect, bg, scale, vw, vh });
}

// The page's LAST screen (the folio page's ending): the element that fills it (the
// contact section), placed where it sits in the viewport when the page is scrolled to
// the top of the ending spacer, on the page ground.
export async function captureEnd({ el, spacer, rect, bg, dpr = 1 }) {
  if (!el || !spacer || !rect) return null;
  const vw = document.documentElement.clientWidth;
  const vh = window.innerHeight;
  const scale = Math.min(2, Math.max(1, dpr));
  const r = el.getBoundingClientRect();
  const lastTop = spacer.getBoundingClientRect().top + window.scrollY - vh; // the scroll where the spacer starts
  const elTop = r.top + window.scrollY - lastTop;
  await mediaReady(el, lastTop, lastTop + vh);
  // captured on a viewport-wide box, the element at its own left: its vw-based sizes
  // then resolve against the viewport, as on the page (on its own 1200 px box the
  // heading re-wrapped onto three lines)
  const cssText = await pageFontCss();
  const shot = await domToCanvas(el, {
    font: cssText ? { cssText } : undefined,
    width: vw,
    height: Math.ceil(r.height),
    scale,
    backgroundColor: bg,
    onCloneNode: (clone) => {
      if (!clone.style) return;
      clone.style.opacity = "1";
      clone.style.width = `${r.width}px`;
      clone.style.boxSizing = "border-box";
      clone.style.marginLeft = `${r.left}px`;
      clone.style.marginRight = "0px";
    },
  });
  const view = document.createElement("canvas");
  view.width = Math.round(vw * scale);
  view.height = Math.round(vh * scale);
  const g = view.getContext("2d");
  g.fillStyle = bg;
  g.fillRect(0, 0, view.width, view.height);
  g.drawImage(shot, 0, elTop * scale, vw * scale, Math.ceil(r.height) * scale);
  return onScreen(view, { rect, bg, scale, vw, vh });
}

// a viewport-sized image onto the screen's texture: the quad the screen covers at
// p = 1 (it can run past the canvas on two sides), the viewport placed where it sits
function onScreen(shot, { rect, bg, scale, vw, vh }) {
  const qw = Math.max(1, rect.tr[0] - rect.tl[0]);
  const qh = Math.max(1, rect.bl[1] - rect.tl[1]);
  const out = document.createElement("canvas");
  out.width = Math.round(qw * scale);
  out.height = Math.round(qh * scale);
  const g = out.getContext("2d");
  g.fillStyle = bg;
  g.fillRect(0, 0, out.width, out.height);
  g.drawImage(shot, -rect.tl[0] * scale, -rect.tl[1] * scale, vw * scale, vh * scale);
  return out;
}
