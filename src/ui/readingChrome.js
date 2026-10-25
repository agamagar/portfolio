// Phones, case-study and doc pages: the fixed chrome stays off the reading column (critique 62.1, 72.1, 25 Oct).
// At 720px and under, the top controls, the chapter chip and the left rail sit over the text. Two rules:
//   - scrolling down hides all of it; scrolling up, reaching the top or the end, or tabbing into it brings the top
//     controls and the chip back (html[data-chrome="hidden"]);
//   - the left rail starts collapsed, even at rest at the top, where it covered a page's first lines; it comes in on a
//     scroll up or a tap on the page that isn't on a control, and leaves on a scroll down (html[data-rail="shown"]).
// The layout never changes; the CSS (index.css, "62.1") scopes it to pages with an article or a doc, and wider
// screens keep the chrome as it was.
const PHONE = "(max-width: 720px)";
export const READING_CHROME = ".top-controls, .view-menu, .cs-tabs--circles, .cis__pill, .pal__btn, button[aria-label^='Inspect']";
const RAIL = ".view-menu, .cs-tabs--circles, .pal__btn, button[aria-label^='Inspect']";
const CONTROL = "a, button, input, select, textarea, label, summary, iframe, video, [role='button'], [role='tab'], [role='slider'], [tabindex]:not([tabindex='-1']), .pc-host, .smo__hit";

export function startReadingChrome() {
  if (typeof window === "undefined" || !window.matchMedia) return;
  const mq = window.matchMedia(PHONE);
  const root = document.documentElement;
  let last = window.scrollY, run = 0, raf = 0;
  const show = (on) => (on ? root.removeAttribute("data-chrome") : root.setAttribute("data-chrome", "hidden"));
  const rail = (on) => (on ? root.setAttribute("data-rail", "shown") : root.removeAttribute("data-rail"));
  const tick = () => {
    raf = 0;
    const y = window.scrollY;
    const dy = y - last; last = y;
    if (!mq.matches) { rail(false); return show(true); }
    run = Math.sign(dy) === Math.sign(run) ? run + dy : dy; // distance travelled in the current direction
    if (run > 24) rail(false);
    else if (run < -24) rail(true);
    const end = root.scrollHeight - window.innerHeight;
    if (y < 120 || y > end - 80) { run = 0; return show(true); }
    if (run > 24) show(false);
    else if (run < -24) show(true);
  };
  window.addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(tick); }, { passive: true });
  mq.addEventListener?.("change", tick);
  document.addEventListener("focusin", (e) => {
    if (!(e.target instanceof Element)) return;
    if (e.target.closest(RAIL)) rail(true);
    if (e.target.closest(READING_CHROME)) show(true);
  });
  // a tap on the page that isn't on a control brings the rail in (or sends it away again)
  let down = null;
  document.addEventListener("pointerdown", (e) => { down = e.pointerType === "touch" ? { x: e.clientX, y: e.clientY, t: e.timeStamp } : null; }, { passive: true });
  document.addEventListener("pointerup", (e) => {
    const d = down; down = null;
    if (!d || !mq.matches || !(e.target instanceof Element)) return;
    if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > 10 || e.timeStamp - d.t > 500) return;
    if (e.target.closest(CONTROL) || e.target.closest(READING_CHROME)) return;
    if (!document.querySelector(".page--article, .page--locked-doc")) return;
    rail(!root.hasAttribute("data-rail")); show(true);
  }, { passive: true });
}
