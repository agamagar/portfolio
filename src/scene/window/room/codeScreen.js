// The portrait monitor's screen: an AI code editor (Antigravity manner, no logo)
// open on the portfolio's own source (2026-09-27, Agam: "on the code screen render a
// really dense version of the website code itself", and "the code screen should
// have the same colour as the portfolio screen"). Drawn into a canvas, no downloaded
// assets. The editor's ground is the page's own ground (#ffffff light, #0e0e11 dark)
// and post.js shows this screen 1:1 like the main one, so the two panels match. Two
// columns of the folio page's source (Hello.jsx, WorkGrid.jsx, helloData.js,
// hello3.css) at 6 px, far too small to read from the chair, a wall of real code.
// The cursor is its own small mesh, so it can blink without redrawing.

import * as THREE from "three/webgpu";
import helloSrc from "../../../hello3/Hello.jsx?raw";
import gridSrc from "../../../hello3/WorkGrid.jsx?raw";
import dataSrc from "../../../hello3/helloData.js?raw";
import cssSrc from "../../../hello3/hello3.css?raw";

// syntax colours per theme; the ground is the page's (--bg)
const THEMES = {
  dark: { bg: "#0e0e11", chrome: "#09090b", panel: "#141418", line: "#24242b", text: "#c9ccd6", dim: "#5d616d", kw: "#c792ea", fn: "#82aaff", str: "#c3e88d", num: "#f78c6c", com: "#555a69", tag: "#f07178", accent: "#8ab4f8", hl: "rgba(255,255,255,0.04)" },
  light: { bg: "#ffffff", chrome: "#f3f3f5", panel: "#f7f7f9", line: "#e3e3e8", text: "#2b2d33", dim: "#9a9daa", kw: "#8e3fd0", fn: "#2f5fd0", str: "#2e7d32", num: "#c2551c", com: "#9ca0ad", tag: "#c62f45", accent: "#1a73e8", hl: "rgba(0,0,0,0.035)" },
};

const KW = /^(?:const|let|var|return|function|export|import|from|if|else|for|of|in|new|async|await|true|false|null|undefined|throw|try|catch|default|continue|break|typeof)$/;
// one line into [text, role] runs: enough to read as code from across a room
function tokens(line) {
  const out = [];
  const re = /(\/\/.*$|\/\*.*?(?:\*\/|$))|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`[^`]*`)|(\b\d+(?:\.\d+)?\b)|(<\/?[A-Za-z][\w.]*)|([A-Za-z_$][\w$-]*)(\s*\()?|(\s+)|(.)/g;
  let m;
  while ((m = re.exec(line))) {
    if (m[1]) out.push([m[1], "com"]);
    else if (m[2]) out.push([m[2], "str"]);
    else if (m[3]) out.push([m[3], "num"]);
    else if (m[4]) out.push([m[4], "tag"]);
    else if (m[5]) {
      out.push([m[5], KW.test(m[5]) ? "kw" : m[6] ? "fn" : "text"]);
      if (m[6]) out.push([m[6], "text"]);
    } else out.push([m[0], "text"]);
    if (m[0] === "") re.lastIndex++;
  }
  return out;
}

// Returns { texture, cursor: { u, v, w, h } (UV, y up), setTheme(theme) }.
export function makeCodeScreen({ width = 1080, height = 1912, theme = "dark" } = {}) {
  const cv = document.createElement("canvas");
  cv.width = width;
  cv.height = height;
  const g = cv.getContext("2d");
  const mono = (px) => `${px}px "SF Mono", Menlo, Consolas, monospace`;
  const sans = (px, wgt = 500) => `${wgt} ${px}px -apple-system, "Segoe UI", Inter, sans-serif`;
  const src = [helloSrc, gridSrc, dataSrc, cssSrc].join("\n").split("\n").map((l) => l.replace(/\t/g, "  "));
  let cursor = null;

  const draw = (th) => {
    const C = THEMES[th] || THEMES.dark;
    g.fillStyle = C.bg;
    g.fillRect(0, 0, width, height);
    // title bar
    g.fillStyle = C.chrome;
    g.fillRect(0, 0, width, 34);
    ["#ff5f57", "#febc2e", "#28c840"].forEach((c, i) => {
      g.fillStyle = c;
      g.beginPath();
      g.arc(18 + i * 18, 17, 5, 0, Math.PI * 2);
      g.fill();
    });
    g.fillStyle = C.dim;
    g.font = sans(13);
    g.textAlign = "center";
    g.fillText("portfolio  ·  Antigravity", width / 2, 22);
    g.textAlign = "left";
    // activity bar and a thin file tree
    const ab = 34, tree = 120;
    g.fillStyle = C.chrome;
    g.fillRect(0, 34, ab, height - 34);
    for (let i = 0; i < 6; i++) {
      g.fillStyle = i === 0 ? C.accent : C.line;
      g.fillRect(10, 52 + i * 34, 14, 14);
    }
    g.fillStyle = C.panel;
    g.fillRect(ab, 34, tree, height - 34);
    g.font = sans(10);
    const files = ["src/", "  hello3/", "    Hello.jsx", "    WorkGrid.jsx", "    helloData.js", "    hello3.css", "    HeroChips.jsx", "    PhoneMarquee.jsx", "  scene/", "    window/", "  lib/", "    weather.js", "    astro.js", "  App.jsx", "  index.css", "public/", "package.json"];
    files.forEach((f, i) => {
      g.fillStyle = f.trim() === "Hello.jsx" ? C.text : C.dim;
      g.fillText(f, ab + 10, 54 + i * 15);
    });
    // tabs
    const x0 = ab + tree;
    g.fillStyle = C.panel;
    g.fillRect(x0, 34, width - x0, 24);
    g.fillStyle = C.bg;
    g.fillRect(x0, 34, 96, 24);
    g.fillStyle = C.accent;
    g.fillRect(x0, 56, 96, 2);
    g.font = sans(11);
    g.fillStyle = C.text;
    g.fillText("Hello.jsx", x0 + 12, 50);
    g.fillStyle = C.dim;
    g.fillText("WorkGrid.jsx", x0 + 110, 50);
    g.fillText("hello3.css", x0 + 208, 50);

    // the code: two dense columns, a hairline between, a minimap on the right
    const agentTop = Math.round(height * 0.92);
    const top = 70, lh = 7.5, fs = 6, mapW = 44, mapX = width - mapW - 6;
    const colGap = 14, colW = (mapX - 8 - x0 - colGap) / 2;
    const rows = Math.floor((agentTop - top - 6) / lh);
    g.font = mono(fs);
    const drawCol = (cx, start) => {
      const gut = 22;
      for (let i = 0; i < rows && start + i < src.length; i++) {
        const y = top + i * lh;
        g.fillStyle = C.dim;
        g.textAlign = "right";
        g.fillText(String(start + i + 1), cx + gut - 4, y);
        g.textAlign = "left";
        let x = cx + gut;
        for (const [t, role] of tokens(src[start + i])) {
          if (x > cx + colW - 4) break;
          g.fillStyle = C[role];
          g.fillText(t, x, y);
          x += g.measureText(t).width;
        }
      }
    };
    drawCol(x0 + 4, 0);
    g.fillStyle = C.line;
    g.fillRect(x0 + 4 + colW + colGap / 2, top - 8, 1, agentTop - top);
    drawCol(x0 + 4 + colW + colGap, rows);
    // the cursor at the end of a line a third of the way down the left column
    const curLine = Math.round(rows * 0.34);
    let curX = x0 + 4 + 22;
    for (const [t] of tokens(src[curLine] || "")) curX += g.measureText(t).width;
    curX = Math.min(curX, x0 + colW);
    const curY = top + curLine * lh;
    g.fillStyle = C.hl;
    g.fillRect(x0, curY - 6, colW + 4, lh);
    // minimap: the whole source as bars
    const mlh = Math.max(0.6, (agentTop - top) / src.length);
    for (let i = 0; i < src.length; i++) {
      let mx = mapX;
      for (const [t, role] of tokens(src[i])) {
        const w = Math.min(mapW - (mx - mapX), t.length * 0.5);
        if (w <= 0) break;
        if (t.trim()) {
          g.fillStyle = C[role];
          g.globalAlpha = 0.5;
          g.fillRect(mx, top - 6 + i * mlh, w, Math.max(0.6, mlh * 0.7));
          g.globalAlpha = 1;
        }
        mx += t.length * 0.5;
      }
    }
    g.fillStyle = th === "light" ? "rgba(26,115,232,0.08)" : "rgba(138,180,248,0.1)";
    g.fillRect(mapX - 2, top - 6, mapW + 4, rows * 2 * mlh);
    // the agent strip
    g.fillStyle = C.panel;
    g.fillRect(x0, agentTop, width - x0, height - agentTop);
    g.fillStyle = C.line;
    g.fillRect(x0, agentTop, width - x0, 1);
    g.font = sans(12, 600);
    g.fillStyle = C.text;
    g.fillText("Agent", x0 + 14, agentTop + 22);
    g.font = sans(10);
    g.fillStyle = C.dim;
    g.fillText("Editing Hello.jsx  ·  3 files changed", x0 + 60, agentTop + 22);
    g.fillStyle = C.str;
    g.fillText("The window scene lands on the page's top: 0 errors on both backends.", x0 + 14, agentTop + 42);
    g.fillStyle = C.chrome;
    g.fillRect(x0 + 10, height - 48, width - x0 - 20, 34);
    g.strokeStyle = C.line;
    g.lineWidth = 1;
    g.strokeRect(x0 + 10, height - 48, width - x0 - 20, 34);
    g.fillStyle = C.dim;
    g.fillText("Ask anything, @ to mention files", x0 + 22, height - 27);
    cursor = { u: (curX + 1) / width, v: 1 - (curY + 1) / height, w: 1.5 / width, h: 7 / height };
  };
  draw(theme);

  const texture = new THREE.CanvasTexture(cv);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  let current = theme;
  return {
    texture,
    cursor,
    setTheme(th) {
      if (th === current) return;
      current = th;
      draw(th);
      texture.needsUpdate = true;
    },
  };
}
