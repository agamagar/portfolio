// Detail page v1, preserved as a live lab specimen.
//
// This is the /hello marquee's original full-page detail — the shared-element
// View Transition morph (phone-hero) plus the Evidence Card overlay
// (PhoneDetail2) — archived here the day the scan page moved to the bottom
// drawer (PhoneDetail3). Nothing is forked: this mounts the SAME PhoneDetail2
// the /hello page still uses, fed the same PHONES data, opened with the same
// morph the marquee runs. The tiles below are a miniature of the marquee's
// expanded grid, just enough of it for the transition to have a grid to fly
// out of.

import { useCallback, useRef, useState } from "react";
import { flushSync } from "react-dom";
// hello.css is normally pulled in by Hello.jsx; /lab never mounts that page,
// so the specimen imports it itself or the overlay renders unstyled.
import "../../hello/hello.css";
import PhoneDetail2 from "../../hello/PhoneDetail2";
import { PHONES } from "../../hello/helloData";

const VT_NAME = "phone-hero";
const supportsVT = () =>
  typeof document !== "undefined" && typeof document.startViewTransition === "function";

export default function DetailV1() {
  const [openIdx, setOpenIdx] = useState(null);
  const originRef = useRef(null);

  // openDetail / closeDetail, as PhoneMarqueeStep runs them: the name lives on
  // the clicked tile for the old snapshot, then on the detail phone for the
  // new one, so the browser tweens size + position between the two.
  const openDetail = useCallback((i, cellEl) => {
    const src = cellEl?.querySelector(".fig-screen");
    originRef.current = src || null;
    if (!supportsVT() || !src) {
      setOpenIdx(i);
      return;
    }
    src.style.viewTransitionName = VT_NAME;
    const vt = document.startViewTransition(() => {
      flushSync(() => setOpenIdx(i));
      src.style.viewTransitionName = "";
      const dest = document.querySelector(".pd__phone");
      if (dest) dest.style.viewTransitionName = VT_NAME;
    });
    vt.finished.finally(() => {
      const dest = document.querySelector(".pd__phone");
      if (dest) dest.style.viewTransitionName = "";
    });
  }, []);

  const closeDetail = useCallback(() => {
    const origin = originRef.current;
    if (!supportsVT()) {
      setOpenIdx(null);
      return;
    }
    const dest = document.querySelector(".pd__phone");
    if (dest) dest.style.viewTransitionName = VT_NAME;
    document
      .startViewTransition(() => {
        flushSync(() => setOpenIdx(null));
        if (origin && origin.isConnected) origin.style.viewTransitionName = VT_NAME;
      })
      .finished.finally(() => {
        if (origin) origin.style.viewTransitionName = "";
        if (dest) dest.style.viewTransitionName = "";
        originRef.current = null;
      });
  }, []);

  return (
    <div className="lab-dv1">
      <div className="lab-dv1__grid">
        {PHONES.map((p, i) => (
          <button
            type="button"
            key={p.src}
            className="lab-dv1__cell"
            aria-label={[p.brand, p.caption].filter(Boolean).join(": ")}
            onClick={(e) => openDetail(i, e.currentTarget)}
          >
            <img
              className="fig-screen lab-dv1__fig"
              src={p.screen || p.src}
              alt=""
              draggable="false"
              loading="lazy"
            />
          </button>
        ))}
      </div>
      <PhoneDetail2
        phones={PHONES}
        index={openIdx}
        onIndex={setOpenIdx}
        onClose={closeDetail}
      />
    </div>
  );
}
