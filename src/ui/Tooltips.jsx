// One tooltip for the whole page.
//
// WHY A SINGLE DELEGATED INSTANCE rather than a bubble per button:
//
//   1. `.hm-filter` is `overflow: hidden` (it clips its own pill), and the DJ
//      booth and the detail overlay have their own clipping and stacking. A
//      tooltip drawn as a `::after` on the button would be cut off inside every
//      one of them. One node at the document level, positioned `fixed`, cannot
//      be clipped by anything.
//   2. Icon buttons are scattered across App, PhoneMarquee, SideQuests and both
//      detail overlays. Delegation means a new icon button gets a tooltip by
//      adding one attribute, not by importing anything.
//
// THE LABEL IS `aria-label`, deliberately. A tooltip that says something
// different from the accessible name is two sources of truth that will drift,
// and the screen-reader text is the one that must be right. `data-tip` is only
// the opt-in flag; give it a value to override the text in the rare case where
// the visible tip should read differently.

import { useEffect, useRef } from "react";

const SHOW_DELAY = 340; // long enough that sweeping across a row stays quiet
const GAP = 10; // between the button and the bubble
const EDGE = 8; // keep the bubble this far off the viewport edges

export default function Tooltips() {
  const elRef = useRef(null);

  useEffect(() => {
    const tip = document.createElement("div");
    tip.className = "tip";
    tip.setAttribute("role", "tooltip");
    // aria-hidden: the accessible name already lives on the button as
    // `aria-label`, so announcing the bubble too would just say it twice.
    tip.setAttribute("aria-hidden", "true");
    document.body.appendChild(tip);
    elRef.current = tip;

    let timer = 0;
    let current = null;

    const place = (target) => {
      const r = target.getBoundingClientRect();
      tip.style.visibility = "hidden";
      tip.setAttribute("data-show", "true");
      const t = tip.getBoundingClientRect();

      let top = r.top - t.height - GAP;
      let side = "top";
      if (top < EDGE) {
        top = r.bottom + GAP; // no room above: flip under the button
        side = "bottom";
      }
      let left = r.left + r.width / 2 - t.width / 2;
      left = Math.max(EDGE, Math.min(left, window.innerWidth - t.width - EDGE));

      // The notch tracks the BUTTON, not the bubble: once the bubble is clamped
      // at a viewport edge the two are no longer concentric, and a centred notch
      // would point at empty space.
      const notch = r.left + r.width / 2 - left;
      tip.style.setProperty("--tip-notch", `${Math.round(notch)}px`);
      tip.dataset.side = side;
      tip.style.top = `${Math.round(top)}px`;
      tip.style.left = `${Math.round(left)}px`;
      tip.style.visibility = "";
    };

    const show = (target, instant) => {
      // A bare `data-tip` in JSX serialises to the STRING "true", so it cannot be
      // used as a truthy override test — that is how every tooltip on the page
      // ended up reading "true" the first time. Only a real value overrides.
      const override = target.dataset.tip;
      const label = override && override !== "true" ? override : target.getAttribute("aria-label");
      if (!label) return;
      current = target;
      tip.textContent = label;
      clearTimeout(timer);
      timer = setTimeout(() => place(target), instant ? 0 : SHOW_DELAY);
    };

    // A bubble a BUTTON asked for is pinned: it reports something that just
    // happened rather than describing what is under the pointer, so moving the
    // pointer off must not erase it (mtu4rkpy, "the copied tooltip should be
    // visible whether I hover over it or not"). It ends when the button says
    // so, when the anchor moves, or when a deliberate hover elsewhere takes
    // over. Escape still closes it, as it closes everything.
    let pinned = false;

    const close = () => {
      pinned = false;
      clearTimeout(timer);
      current = null;
      tip.removeAttribute("data-show");
    };
    // the pointer path's hide, which a pinned bubble ignores
    const hide = () => {
      if (pinned) return;
      close();
    };

    // mttkkkeq (09 Sep 2026): a button whose label just changed under the
    // pointer (the footer copy buttons flip to "Copied") dispatches
    // `tip:show` and the bubble re-reads it at once; `tip:hide` releases it.
    const onAsk = (e) => {
      const t = e.target.closest?.("[data-tip]");
      if (!t) return;
      pinned = true;
      show(t, true);
    };
    const onAskHide = (e) => {
      const t = e.target.closest?.("[data-tip]");
      pinned = false;
      // still under the pointer: fall back to its own label rather than
      // blinking out, so releasing "Copied" leaves "Copy email" behind
      if (t && t.matches(":hover")) show(t, true);
      else close();
    };
    const onOver = (e) => {
      const t = e.target.closest?.("[data-tip]");
      if (!t || t === current) return;
      pinned = false; // a deliberate hover elsewhere outranks a pinned bubble
      show(t, false);
    };
    const onOut = (e) => {
      const t = e.target.closest?.("[data-tip]");
      if (t && t === current) hide();
    };
    // Keyboard users get it immediately — a delay on focus reads as lag, because
    // unlike a pointer sweeping a row, a focus move is always deliberate.
    const onFocus = (e) => {
      const t = e.target.closest?.("[data-tip]");
      if (t) show(t, true);
    };
    const onKey = (e) => {
      if (e.key === "Escape") close();
    };

    document.addEventListener("pointerover", onOver);
    document.addEventListener("pointerout", onOut);
    document.addEventListener("focusin", onFocus);
    document.addEventListener("focusout", hide);
    document.addEventListener("keydown", onKey);
    document.addEventListener("tip:show", onAsk);
    document.addEventListener("tip:hide", onAskHide);
    // A tooltip anchored to a button that has since moved is worse than none,
    // pinned or not.
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onOut);
      document.removeEventListener("focusin", onFocus);
      document.removeEventListener("focusout", hide);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("tip:show", onAsk);
      document.removeEventListener("tip:hide", onAskHide);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
      tip.remove();
    };
  }, []);

  return null;
}
