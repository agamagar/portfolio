#!/usr/bin/env node
// Carnegie PDF export path: renders case-study routes to per-case PDFs using the
// system Chrome (house pattern, no puppeteer), then optionally merges them into
// one application PDF per program.
//
//   node tools/export-pdf.mjs                 # default: the MDes 7-piece set
//   node tools/export-pdf.mjs --program miips # the MIIPS subset
//   node tools/export-pdf.mjs scheduled-delivery dassh   # explicit slugs
//   node tools/export-pdf.mjs --no-build      # reuse the existing dist/
//
// How it works:
// 1. `vite build` (unless --no-build), then `vite preview` serves dist/ on a free
//    port (SPA fallback included).
// 2. For each slug, Chrome --headless=new --print-to-pdf renders
//    /work/<slug>. --force-prefers-reduced-motion parks every coded figure in its
//    designed reduced-motion state (the house rule), so animated figures export as
//    intentional static frames. --virtual-time-budget lets React render + settle.
// 3. Output: exports/pdf/<slug>.pdf + exports/pdf/<program>.pdf (merged, if the
//    optional pdf-lib dep is installed; otherwise per-case PDFs only).
//
// Page budgets (from the Carnegie audit): MIIPS caps the whole PDF at 20 pages.
// The script prints each PDF's page count so overshoot is visible immediately.

import { execFileSync, spawn } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import net from "node:net";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const OUT_DIR = path.join(ROOT, "exports", "pdf");

// Program sets per Claude/Carnegie Plan/carnegie-plan.md (2026-07-19, 7-piece plan).
// away-agent uses the trimmed WIP copy (42 -> 21 sections) as the PDF source.
// `compact: true` renders each case at ?cut=compact (the curated pdfSections
// subset) to fit hard page caps: MIIPS <=20pp, Harvard MDE inside GSD's 30pp.
const PROGRAMS = {
  mdes: {
    slugs: ["scheduled-delivery", "jarvis", "zepiris", "away-agent-trim", "dassh", "occasion-buying", "toppr"],
  },
  // MIIPS allows 3-6 projects; 3 deep beats 4 cramped against the 20pp cap.
  // Swap dassh in for zepiris if the founder-story angle is wanted (same size).
  miips: { slugs: ["scheduled-delivery", "jarvis", "zepiris"], compact: true },
  mde: { slugs: ["scheduled-delivery", "jarvis", "zepiris", "away-agent-trim"], compact: true },
};

const args = process.argv.slice(2);
const flag = (f) => {
  const i = args.indexOf(f);
  if (i === -1) return null;
  return args.splice(i, 1)[0];
};
const opt = (f) => {
  const i = args.indexOf(f);
  if (i === -1) return null;
  return args.splice(i, 2)[1];
};
const noBuild = !!flag("--no-build");
const forceCompact = !!flag("--compact");
const program = (opt("--program") || "mdes").toLowerCase();
const progDef = PROGRAMS[program];
const slugs = args.length ? args : progDef?.slugs;
const compact = forceCompact || (!args.length && !!progDef?.compact);
if (!slugs) {
  console.error(`Unknown program "${program}". Known: ${Object.keys(PROGRAMS).join(", ")}`);
  process.exit(1);
}

const freePort = () =>
  new Promise((res) => {
    const s = net.createServer();
    s.listen(0, () => {
      const p = s.address().port;
      s.close(() => res(p));
    });
  });

const waitFor = async (url, ms = 15000) => {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    try {
      const r = await fetch(url);
      if (r.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`server at ${url} did not come up in ${ms}ms`);
};

// Count pages without a pdf dep: count /Type /Page objects (works for Chrome's
// uncompressed-xref output; falls back to "?" rather than failing the run).
const pageCount = (file) => {
  try {
    const buf = readFileSync(file).toString("latin1");
    const n = (buf.match(/\/Type\s*\/Page[^s]/g) || []).length;
    return n || "?";
  } catch {
    return "?";
  }
};

const main = async () => {
  if (!existsSync(CHROME)) throw new Error("Chrome not found at " + CHROME);
  mkdirSync(OUT_DIR, { recursive: true });

  if (!noBuild) {
    console.log("building...");
    execFileSync("npx", ["vite", "build"], { cwd: ROOT, stdio: "inherit" });
  }

  const port = await freePort();
  console.log(`serving dist/ on :${port}`);
  const server = spawn("npx", ["vite", "preview", "--port", String(port), "--strictPort"], {
    cwd: ROOT,
    stdio: "ignore",
  });
  try {
    await waitFor(`http://localhost:${port}/`);

    const made = [];
    for (const slug of slugs) {
      const out = path.join(OUT_DIR, `${slug}.pdf`);
      const url = `http://localhost:${port}/work/${slug}?theme=light${compact ? "&cut=compact" : ""}`;
      console.log(`rendering ${slug}...`);
      execFileSync(CHROME, [
        "--headless=new",
        `--print-to-pdf=${out}`,
        "--no-pdf-header-footer",
        "--force-prefers-reduced-motion",
        "--hide-scrollbars",
        "--window-size=1280,1700",
        "--virtual-time-budget=25000",
        "--run-all-compositor-stages-before-draw",
        url,
      ]);
      made.push(out);
      console.log(`  -> ${path.relative(ROOT, out)} (${pageCount(out)} pages)`);
    }

    // Merge into one program PDF if pdf-lib is available (optional dep).
    let merged = false;
    try {
      const { PDFDocument } = await import("pdf-lib");
      const doc = await PDFDocument.create();
      for (const f of made) {
        const src = await PDFDocument.load(readFileSync(f));
        const pages = await doc.copyPages(src, src.getPageIndices());
        pages.forEach((p) => doc.addPage(p));
      }
      const mergedPath = path.join(OUT_DIR, `${program}.pdf`);
      writeFileSync(mergedPath, await doc.save());
      console.log(
        `merged -> ${path.relative(ROOT, mergedPath)} (${doc.getPageCount()} pages${
          program === "miips" ? ", MIIPS cap is 20" : ""
        })`
      );
      merged = true;
    } catch (e) {
      if (e.code === "ERR_MODULE_NOT_FOUND") {
        console.log("pdf-lib not installed; skipped the merged program PDF (npm i -D pdf-lib to enable)");
      } else {
        console.error("merge failed:", e.message);
      }
    }
    if (!merged) console.log("per-case PDFs are in exports/pdf/");
  } finally {
    server.kill();
  }
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
