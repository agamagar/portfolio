import { mountBoard, PRESETS } from "../index.js";
import { SD_BOARDS } from "../boards.scheduledDelivery.js";

const $ = (id) => document.getElementById(id);
const q = new URLSearchParams(location.search);
if (q.has("bare")) document.body.classList.add("bare");

const layoutSel = $("layout"), input = $("input"), err = $("err"), host = $("board"), scrub = $("scrub");
for (const [k, v] of Object.entries(PRESETS)) layoutSel.add(new Option(v.label, k));
let ctl = null, timer = 0, scrubbing = false;

function specFrom() {
  const p = PRESETS[layoutSel.value];
  const spec = p.spec(input.value);
  if ($("seed").value) spec.seed = $("seed").value;
  spec.pace = +$("pace").value;
  return spec;
}
function run({ animate = q.get("static") ? false : true } = {}) {
  err.textContent = "";
  let spec;
  try { spec = specFrom(); } catch (e) { err.textContent = "Content error: " + e.message; return; }
  try {
    ctl?.destroy();
    ctl = mountBoard(host, spec, { animate, forceMotion: true, onTime: (t, d) => { if (!scrubbing) { scrub.value = t / d; $("time").textContent = t.toFixed(1) + "s"; } } });
    $("dur").textContent = ctl.duration.toFixed(1) + "s";
    window.__board = ctl;
  } catch (e) { err.textContent = e.stack || String(e); console.error(e); }
}
function load(name) {
  layoutSel.value = name;
  input.value = PRESETS[name].input;
  $("seed").value = "";
  run();
}
layoutSel.onchange = () => load(layoutSel.value);
input.oninput = () => { clearTimeout(timer); timer = setTimeout(() => run({ animate: false }), 350); };
$("seed").oninput = $("pace").oninput = () => run({ animate: false });
$("replay").onclick = () => run({ animate: true });
$("finish").onclick = () => ctl?.finish();
scrub.oninput = () => { scrubbing = true; ctl?.pause(); ctl?.seek(scrub.value * ctl.duration); $("time").textContent = (scrub.value * ctl.duration).toFixed(1) + "s"; };
scrub.onchange = () => { scrubbing = false; };
const download = (blob, name) => { const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); };
$("svg").onclick = () => download(new Blob([ctl.exportSVG()], { type: "image/svg+xml" }), `board-${layoutSel.value}.svg`);
$("png").onclick = async () => download(await ctl.toPNG(2), `board-${layoutSel.value}.png`);

// Annotate tool: click the image to drop a note there; "Use my image" swaps in any picture.
host.addEventListener("click", (e) => {
  if (layoutSel.value !== "annotate" || !ctl) return;
  const svg = ctl.svg, r = svg.getBoundingClientRect();
  const bx = ((e.clientX - r.left) / r.width) * ctl.scene.w, by = ((e.clientY - r.top) / r.height) * ctl.scene.h;
  const im = ctl.scene.items.find((i) => i.kind === "image");
  if (!im || bx < im.x || bx > im.x + im.w || by < im.y || by > im.y + im.h) return;
  let spec;
  try { spec = JSON.parse(input.value); } catch { return; }
  const kinds = ["circle", "box", "underline", "star", "check"];
  spec.notes = [...(spec.notes ?? []), { at: [+((bx - im.x) / im.w).toFixed(3), +((by - im.y) / im.h).toFixed(3)], text: "Note " + ((spec.notes?.length ?? 0) + 1), kind: kinds[(spec.notes?.length ?? 0) % kinds.length] }];
  input.value = JSON.stringify(spec, null, 2);
  run({ animate: false });
});
$("file").onchange = (e) => {
  const f = e.target.files[0];
  if (!f) return;
  const url = URL.createObjectURL(f), img = new Image();
  img.onload = () => {
    let spec;
    try { spec = JSON.parse(input.value); } catch { spec = { notes: [] }; }
    spec.image = { href: url, w: img.naturalWidth, h: img.naturalHeight };
    spec.notes = []; spec.title = "Notes";
    layoutSel.value = "annotate";
    input.value = JSON.stringify(spec, null, 2);
    run({ animate: false });
  };
  img.src = url;
};

if (q.get("sd") && SD_BOARDS[q.get("sd")]) {
  // ?sd=goToMarket|directions|reflection : the boards placed in the Scheduled Delivery case study
  ctl = mountBoard(host, SD_BOARDS[q.get("sd")].board, { animate: q.get("static") ? false : true, forceMotion: true });
  window.__board = ctl;
} else load(q.get("layout") && PRESETS[q.get("layout")] ? q.get("layout") : "mindmap");
if (q.get("seek")) { ctl.pause(); ctl.seek(+q.get("seek")); }
