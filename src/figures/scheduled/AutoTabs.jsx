// The prototype, auto-played (annotation mtmscpnv). A Figma embed cannot be
// driven from outside, so this is the same screen as a coded scene: the real
// Today and Tomorrow frames from the handoff prototype (40000084-124154 and
// 40000084-180821, exported at 3x), the base iPhone frame around them, and a
// cursor that travels to the Tomorrow tab, clicks, the screen switches, waits,
// then goes back to Today. Loops while in view; reduced motion shows Today.
import { useEffect, useRef, useState } from "react";
import { animate } from "motion/react";
import { CursorPointer as IconCursor } from "iconoir-react";
import { useInViewLoop, useReducedMotion, spring } from "../ds/hooks";
import { IPHONE_FRAME_SRC } from "../ds/IphoneFrame";

const SCREENS = { today: "/figures/scheduled/auto/today.png", tomorrow: "/figures/scheduled/auto/tomorrow.png" };
// tab centres, % of the screen (from the Figma start frame: the tab bar at
// y 31.8..37.2, Today on the left half, Tomorrow on the right)
const TABS = { today: { x: 29, y: 34.6 }, tomorrow: { x: 71, y: 34.6 } };
const REST = { x: 84, y: 60 };

export default function AutoTabs() {
  const reduce = useReducedMotion();
  const [screen, setScreen] = useState("today");
  const [pressed, setPressed] = useState(false);
  const cursor = useRef(null);
  const pos = useRef(REST);

  const moveTo = (p, duration) => {
    const el = cursor.current;
    if (!el) return Promise.resolve();
    const from = pos.current;
    pos.current = p;
    const ctrl = animate(
      el,
      { left: [from.x + "%", p.x + "%"], top: [from.y + "%", p.y + "%"] },
      { duration, ease: [0.38, 1.21, 0.22, 1] }, // the M3 expressive spatial curve
    );
    return ctrl.finished;
  };

  const loopRef = useInViewLoop(!reduce, async ({ wait, alive }) => {
    while (alive()) {
      await wait(900); if (!alive()) break;
      await moveTo(TABS.tomorrow, 0.8); if (!alive()) break;
      setPressed(true); await wait(140); setPressed(false); setScreen("tomorrow");
      await wait(1900); if (!alive()) break;
      await moveTo(TABS.today, 0.8); if (!alive()) break;
      setPressed(true); await wait(140); setPressed(false); setScreen("today");
      await wait(1400); if (!alive()) break;
      await moveTo(REST, 0.9);
      await wait(600);
    }
  });

  useEffect(() => {
    if (reduce) setScreen("today");
  }, [reduce]);

  return (
    <div className="autotabs" ref={loopRef}>
      <div className="article__plate-phone autotabs__phone">
        <div className="article__plate-screen">
          <img className={"autotabs__screen" + (screen === "today" ? " is-on" : "")} src={SCREENS.today} alt="The schedule page with Today selected" draggable="false" />
          <img className={"autotabs__screen" + (screen === "tomorrow" ? " is-on" : "")} src={SCREENS.tomorrow} alt="The schedule page with Tomorrow selected" draggable="false" />
          {!reduce && (
            <span ref={cursor} className={"autotabs__cursor" + (pressed ? " is-pressed" : "")} style={{ left: REST.x + "%", top: REST.y + "%" }} aria-hidden="true">
              <IconCursor width={22} height={22} strokeWidth={1.6} />
            </span>
          )}
        </div>
        <img className="article__plate-bezel" src={IPHONE_FRAME_SRC} alt="" draggable="false" />
      </div>
    </div>
  );
}
