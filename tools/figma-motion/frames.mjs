#!/usr/bin/env node
// Pull evenly-spaced reference frames out of an exported Figma timeline MP4, so
// a build can be checked against the thing it is copying.
//
//   node tools/figma-motion/frames.mjs proto.mp4 out/ 9
//
// Writes out/t0.000.png … named by NORMALISED time (0..1), not seconds, because
// the only comparison that means anything is at the same fraction of the loop —
// the build and the export rarely share a frame rate and never share a clock.
//
// This is step 4 of tools/figma-motion/README.md and it is not optional. Every
// mistake that pipeline lists was invisible in the code and obvious in a frame.
// Requires ffmpeg on PATH.

import { execFileSync } from "node:child_process";
import { mkdirSync, existsSync, statSync } from "node:fs";

const [mp4, outDir = "frames", nRaw = "9"] = process.argv.slice(2);
if (!mp4) {
  console.error("usage: frames.mjs <video.mp4> [outDir] [count]");
  process.exit(1);
}
const n = Math.max(2, parseInt(nRaw, 10) || 9);

const duration = parseFloat(
  execFileSync("ffprobe", [
    "-v", "error",
    "-show_entries", "format=duration",
    "-of", "default=nw=1:nk=1",
    mp4,
  ]).toString().trim(),
);
if (!Number.isFinite(duration)) {
  console.error("could not read a duration from", mp4);
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });

// One frame's worth of slack at the end. `duration` is where the video STOPS,
// not where its last frame starts, so seeking there lands past the end and
// ffmpeg writes nothing. A 1ms nudge was not enough — it has to be a whole
// frame. Read the real frame rate rather than assuming 30.
const fps = (() => {
  const raw = execFileSync("ffprobe", [
    "-v", "error",
    "-select_streams", "v:0",
    "-show_entries", "stream=r_frame_rate",
    "-of", "default=nw=1:nk=1",
    mp4,
  ]).toString().trim();
  const [num, den] = raw.split("/").map(Number);
  const v = den ? num / den : num;
  return Number.isFinite(v) && v > 0 ? v : 30;
})();
const tail = 1 / fps;

for (let i = 0; i < n; i++) {
  const u = i / (n - 1);
  const t = Math.min(u * duration, Math.max(0, duration - tail));
  const name = `${outDir}/t${u.toFixed(3)}.png`;
  execFileSync("ffmpeg", [
    "-nostdin", "-v", "error",
    "-ss", t.toFixed(4),
    "-i", mp4,
    "-frames:v", "1",
    // `-update 1` or ffmpeg treats a single output path as a numbered sequence
    // and writes nothing at all
    "-update", "1",
    name, "-y",
  ]);
  // VERIFY, do not assume. ffmpeg exits 0 having written nothing when a seek
  // lands past the end, so the first version of this printed five happy lines
  // and produced four files. A tool whose whole job is checking the build is
  // the last place to take success on trust.
  if (!existsSync(name) || statSync(name).size === 0) {
    console.error(`FAILED to write ${name} at t=${t.toFixed(3)}s — no frame there.`);
    process.exit(1);
  }
  console.log(`${name}  t=${t.toFixed(3)}s  (${(u * 100).toFixed(1)}% of the loop)`);
}

console.log(`\n${n} frames from ${duration.toFixed(3)}s. Compare at the SAME normalised times.`);
