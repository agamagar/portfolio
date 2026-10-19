// Autoplaying videos decode only while they are near the viewport.
// The side-quests run, the work cards and the case figures all use <video autoplay muted loop>;
// Chrome keeps decoding every one of them (three 1200 px clips were measured playing 2,900 px
// below the fold) for frames nobody sees. One IntersectionObserver pauses an autoplay video
// that is more than 400 px off screen and plays it again as it nears; the frame it paused on
// is the frame it resumes from, so nothing visible changes. Only videos this gate paused are
// ever resumed, so a video that code or the user paused stays paused. Opt out with
// data-keep-playing.
export function startVideoGate() {
  if (typeof window === "undefined" || !("IntersectionObserver" in window) || window.__videoGate) return;
  window.__videoGate = true;
  const mine = new WeakSet();
  const seen = new WeakSet();
  const near = new WeakMap(); // last IntersectionObserver verdict per video
  const io = new IntersectionObserver((list) => {
    for (const e of list) {
      const v = e.target;
      near.set(v, e.isIntersecting);
      if (!v.isConnected) continue;
      if (e.isIntersecting) {
        if (mine.has(v)) { mine.delete(v); v.play().catch(() => {}); }
      } else if (!v.paused || v.autoplay) {
        // not yet started (autoplay still loading) counts too: pause() cancels the pending autoplay
        if (v.dataset.keepPlaying != null) continue;
        mine.add(v);
        v.pause();
      }
    }
  }, { rootMargin: "400px 400px 400px 400px", threshold: 0 });
  const watch = (v) => {
    if (seen.has(v) || !v.autoplay) return;
    seen.add(v);
    io.observe(v);
  };
  const scan = (root) => {
    if (root.nodeType !== 1) return;
    if (root.tagName === "VIDEO") watch(root);
    else root.querySelectorAll?.("video[autoplay]").forEach(watch);
  };
  // code that calls play() on a far-off video (the side-quests run starts each card as it
  // takes the centre, on a timer) is stopped again here: play events do not bubble, so capture
  document.addEventListener("play", (e) => {
    const v = e.target;
    if (near.get(v) === false && v.dataset.keepPlaying == null) { mine.add(v); v.pause(); }
  }, true);
  document.querySelectorAll("video[autoplay]").forEach(watch);
  new MutationObserver((ms) => ms.forEach((m) => m.addedNodes.forEach(scan))).observe(document.documentElement, { childList: true, subtree: true });
}
