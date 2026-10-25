// Phones, case-study pages: the fixed chrome steps aside while you read (critique 62.1, 25 Oct). At 720px and under,
// the top controls, the chapter chip and the left rail sit over the reading column, so scrolling down hides them;
// scrolling up, reaching the top or the end, or tabbing into them brings them back. The layout never changes; the
// CSS (index.css, "62.1") scopes it to pages with an article, and wider screens keep the chrome as it was.
const PHONE = "(max-width: 720px)";
export const READING_CHROME = ".top-controls, .view-menu, .cs-tabs--circles, .cis__pill, .pal__btn, button[aria-label^='Inspect']";

export function startReadingChrome() {
  if (typeof window === "undefined" || !window.matchMedia) return;
  const mq = window.matchMedia(PHONE);
  const root = document.documentElement;
  let last = window.scrollY, run = 0, raf = 0;
  const show = (on) => (on ? root.removeAttribute("data-chrome") : root.setAttribute("data-chrome", "hidden"));
  const tick = () => {
    raf = 0;
    const y = window.scrollY;
    const dy = y - last; last = y;
    if (!mq.matches) return show(true);
    const end = root.scrollHeight - window.innerHeight;
    if (y < 120 || y > end - 80) { run = 0; return show(true); }
    run = Math.sign(dy) === Math.sign(run) ? run + dy : dy; // distance travelled in the current direction
    if (run > 24) show(false);
    else if (run < -24) show(true);
  };
  window.addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(tick); }, { passive: true });
  mq.addEventListener?.("change", tick);
  document.addEventListener("focusin", (e) => { if (e.target instanceof Element && e.target.closest(READING_CHROME)) show(true); });
}
