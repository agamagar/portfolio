import { useRef, useState } from "react";
import { useReducedMotion, useFitScale, useInViewLoop, centerInFrame } from "../ds/hooks";
import Cursor from "../ds/Cursor";
import { TopBar } from "../ds/Primitives";
import { STEPS, StepBody, T } from "./steps";

// Variant 3 — "focused". A compact stepper across the top; only the active step
// is shown, as one large card with full-size legible content. As the cursor
// clicks Next the card's content swaps to the next step and the stepper advances.
export default function AgentWizardFocus() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [cursor, setCursor] = useState({ x: 300, y: 360, visible: false, press: false });
  const [clickN, setClickN] = useState(0);
  const [press, setPress] = useState(false);

  const { fitRef, frameRef } = useFitScale(600, 1.12);
  const nextRef = useRef(null);

  const loopRef = useInViewLoop(!reduce, async ({ wait, alive }) => {
    while (alive()) {
      for (let i = 0; i < STEPS.length && alive(); i++) {
        setActive(i);
        setCursor((c) => ({ ...c, visible: false }));
        await wait(T.expand + T.read); if (!alive()) break;
        if (nextRef.current && frameRef.current) {
          const { x, y } = centerInFrame(nextRef.current, frameRef.current);
          setCursor({ x, y, visible: true, press: false });
        }
        await wait(T.move); if (!alive()) break;
        setPress(true); setCursor((c) => ({ ...c, press: true })); setClickN((n) => n + 1);
        await wait(T.click); if (!alive()) break;
        setPress(false); setCursor((c) => ({ ...c, press: false }));
        await wait(T.gap);
      }
      await wait(T.reset);
    }
  });

  const step = STEPS[active];
  return (
    <div className="ds-fit" ref={(n) => { fitRef.current = n; loopRef.current = n; }}>
      <div className="ds-root ds-root--focus" ref={frameRef}>
        <TopBar title="CV Screening" />
        <div className="ds-focus">
          <div className="ds-stepper">
            {STEPS.map((s, i) => (
              <div className="ds-stepper__item" key={s.title} data-state={i === active ? "active" : i < active ? "done" : "todo"}>
                <span className="ds-stepper__dot">{i < active ? "✓" : i + 1}</span>
                <span className="ds-stepper__label">{s.short}</span>
              </div>
            ))}
          </div>

          <div className="ds-card ds-focus__card" data-active="true" data-press={press}>
            <div className="ds-card__head">
              <span className="ds-step">{active + 1}</span>
              <div className="ds-head__txt">
                <div className="ds-head__title">{step.title}</div>
                <div className="ds-head__sub">{step.sub}</div>
              </div>
            </div>
            <div className="ds-focus__body" key={active}>
              <StepBody index={active} />
            </div>
            <div className="ds-foot">
              <span className="ds-btn" ref={nextRef}>{active === STEPS.length - 1 ? "Create Agent" : "Next"}</span>
            </div>
          </div>
        </div>
        <Cursor x={cursor.x} y={cursor.y} visible={cursor.visible} press={cursor.press} clickN={clickN} />
      </div>
    </div>
  );
}
