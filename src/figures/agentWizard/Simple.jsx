import { useRef, useState } from "react";
import { useReducedMotion, useFitScale, useInViewLoop, centerInFrame } from "../ds/hooks";
import Cursor from "../ds/Cursor";
import { TopBar, StepCard } from "../ds/Primitives";
import { STEPS, StepBody, T } from "./steps";

// Variant 1 — "simplify + enlarge". The Creation Overview rail is dropped so the
// four cards get the full width, and the design is authored narrow (520) then
// scaled UP to fill the case-study box, so type reads larger/cleaner at small size.
export default function AgentWizardSimple() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(reduce ? 0 : -1);
  const [cursor, setCursor] = useState({ x: 260, y: 420, visible: false, press: false });
  const [clickN, setClickN] = useState(0);

  const { fitRef, frameRef } = useFitScale(520, 1.25);
  const nextRefs = useRef([]);

  const loopRef = useInViewLoop(!reduce, async ({ wait, alive }) => {
    while (alive()) {
      setActive(-1);
      setCursor((c) => ({ ...c, visible: false }));
      await wait(T.reset); if (!alive()) break;
      for (let i = 0; i < STEPS.length && alive(); i++) {
        setActive(i);
        await wait(T.expand + T.read); if (!alive()) break;
        const btn = nextRefs.current[i];
        if (btn && frameRef.current) {
          const { x, y } = centerInFrame(btn, frameRef.current);
          setCursor({ x, y, visible: true, press: false });
        }
        await wait(T.move); if (!alive()) break;
        setCursor((c) => ({ ...c, press: true }));
        setClickN((n) => n + 1);
        await wait(T.click); if (!alive()) break;
        setCursor((c) => ({ ...c, press: false }));
        await wait(T.gap);
      }
      await wait(T.reset);
    }
  });

  return (
    <div className="ds-fit" ref={(n) => { fitRef.current = n; loopRef.current = n; }}>
      <div className="ds-root ds-root--simple" ref={frameRef}>
        <TopBar title="CV Screening" />
        <div className="ds-body">
          <div className="ds-stack">
            {STEPS.map((s, i) => (
              <StepCard
                key={s.title}
                n={i + 1}
                title={s.title}
                sub={s.sub}
                active={active === i}
                done={active > i}
                press={cursor.press}
                cta={i === STEPS.length - 1 ? "Create Agent" : "Next"}
                ctaRef={(n) => (nextRefs.current[i] = n)}
              >
                <StepBody index={i} />
              </StepCard>
            ))}
          </div>
        </div>
        <Cursor x={cursor.x} y={cursor.y} visible={cursor.visible} press={cursor.press} clickN={clickN} />
      </div>
    </div>
  );
}
