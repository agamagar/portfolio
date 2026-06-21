import { useRef, useState } from "react";
import { useReducedMotion, useFitScale, useInViewLoop, centerInFrame } from "../ds/hooks";
import Cursor from "../ds/Cursor";
import { AppWindow, Shimmer, SkeletonCard, SkeletonRow, AnnotationPin, AnnotationPopup, ControlBar } from "../ds/Scaffold";

// Canonical example of the "information-sensitive scaffold" preset: the whole
// dashboard is static shimmer (no real data); only the focal interaction, an
// annotation being written on the submit button, is real and animated.
const FULL = "Change to primary";

export default function AnnotationDemo() {
  const reduce = useReducedMotion();
  const [typed, setTyped] = useState(reduce ? FULL : "");
  const [press, setPress] = useState(false);
  const [cycle, setCycle] = useState(0);
  const [cursor, setCursor] = useState({ x: 420, y: 300, visible: false, press: false });
  const [clickN, setClickN] = useState(0);

  const { fitRef, frameRef } = useFitScale(660, 1.06);
  const addRef = useRef(null);

  const loopRef = useInViewLoop(!reduce, async ({ wait, alive }) => {
    while (alive()) {
      setTyped(""); setCursor((c) => ({ ...c, visible: false })); setCycle((n) => n + 1);
      await wait(900); if (!alive()) break;
      for (let i = 1; i <= FULL.length && alive(); i++) {
        setTyped(FULL.slice(0, i));
        await wait(52);
      }
      if (!alive()) break;
      await wait(750); if (!alive()) break;
      if (addRef.current && frameRef.current) {
        const { x, y } = centerInFrame(addRef.current, frameRef.current);
        setCursor({ x, y, visible: true, press: false });
      }
      await wait(560); if (!alive()) break;
      setPress(true); setCursor((c) => ({ ...c, press: true })); setClickN((n) => n + 1);
      await wait(230); if (!alive()) break;
      setPress(false); setCursor((c) => ({ ...c, press: false }));
      await wait(1100);
    }
  });

  return (
    <div className="ds-fit" ref={(n) => { fitRef.current = n; loopRef.current = n; }}>
      <div className="ds-root ds-root--scaf" ref={frameRef}>
        <AppWindow title="Benji's Dashboard">
          {/* top row of skeleton cards (focal: card 1, annotated #1) */}
          <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
            <SkeletonCard style={{ flex: 1 }} />
            <SkeletonCard style={{ flex: 1 }} />
          </div>
          {/* a skeleton table (annotated #2) */}
          <div className="ds-skcard">
            <div style={{ display: "flex", gap: 24, marginBottom: 4 }}>
              <Shimmer w="22%" h={10} /><Shimmer w="20%" h={10} /><Shimmer w="16%" h={10} />
            </div>
            <SkeletonRow /><SkeletonRow /><SkeletonRow />
          </div>

          {/* annotation pins on the focal elements */}
          <AnnotationPin n={1} pop key={`p1-${cycle}`} style={{ top: 48, left: 36 }} />
          <AnnotationPin n={2} pop key={`p2-${cycle}`} style={{ top: 150, left: 250 }} />

          {/* the real, focal interaction: writing an annotation on the submit button */}
          <AnnotationPopup
            selector="button.submit-btn"
            text={typed}
            caret
            press={press}
            addRef={addRef}
            style={{ top: 30, right: 12 }}
          />

          <ControlBar />
        </AppWindow>
        <Cursor x={cursor.x} y={cursor.y} visible={cursor.visible} press={cursor.press} clickN={clickN} />
      </div>
    </div>
  );
}
