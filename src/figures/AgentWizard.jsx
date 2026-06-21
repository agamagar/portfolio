import { useRef, useState } from "react";
import { useReducedMotion, useFitScale, useInViewLoop, centerInFrame } from "./ds/hooks";
import Cursor from "./ds/Cursor";
import {
  TopBar, StepCard, Field, Input, Textarea, Chip, Tabs, ChecklistRow,
  PromptBanner, ImportBar, DropZone, RestrictionCard, Slider, RailStep,
  IconPhone, IconCheckUser, IconChat,
} from "./ds/Primitives";

// The CV-screening agent-creation flow (Dassh node 1306-7328), rebuilt on the
// design system in ./ds. The figure demos itself: one step-card open at a time,
// a cursor travels to Next and clicks, the open card collapses as the next opens.
const STEPS = [
  { title: "Basic Details", sub: "Add details to help you find your group", meta: "SDE III · Technology" },
  { title: "Customise Checklist", sub: "Fine-tune your selection criteria", meta: "24 criteria tagged" },
  { title: "Add Candidates", sub: "Upload or import candidates", meta: "42 matching found" },
  { title: "Follow Up & Approval", sub: "Define how Stella reaches out", meta: "Calls · WhatsApp · Score 20" },
];

// motion durations (kept in sync with ds/components.css)
const T = { reset: 560, expand: 360, read: 820, move: 600, click: 240, gap: 160 };

function StepBody({ index }) {
  if (index === 0)
    return (
      <div className="ds-stagger" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div className="ds-row">
          <Field label="Job*"><Input value="SDE III - Frontend" caret /></Field>
          <Field label="Group Name*"><Input placeholder="Select Title" /></Field>
          <Field label="Department*"><Input value="Technology" caret /></Field>
        </div>
        <Field label="Description"><Textarea placeholder="Enter Description" /></Field>
      </div>
    );
  if (index === 1)
    return (
      <div className="ds-stagger" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Chip>Template</Chip><Chip>Add Reviewer</Chip>
        </div>
        <PromptBanner />
        <div className="ds-checklist">
          <Tabs tabs={[{ label: "Responsibility (24)" }, { label: "Strict Criteria (12)" }, { label: "Global" }]} active={0} />
          <ChecklistRow text="Must possess full responsibility for the business sector" selected={0} />
          <ChecklistRow text="Demonstrated expertise in the relevant domain" selected={1} />
        </div>
      </div>
    );
  if (index === 2)
    return (
      <div className="ds-stagger" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <ImportBar />
        <div className="ds-drops"><DropZone /><DropZone variant="connect" /></div>
        <div className="ds-minibtns"><Chip>Import Group</Chip><Chip>Upload Files</Chip><Chip>Application Form</Chip></div>
      </div>
    );
  return (
    <div className="ds-stagger" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="ds-label" style={{ fontSize: "var(--ds-fs-section)" }}>Restrictions</div>
      <div className="ds-restr">
        <RestrictionCard icon={<IconPhone />} name="Auto Call Setup" on><Input value="Automatic" caret /></RestrictionCard>
        <RestrictionCard icon={<IconCheckUser />} name="Approval"><Input placeholder="Enter Email" /></RestrictionCard>
        <RestrictionCard icon={<IconChat />} name="Whatsapp" on><Input value="Automatic" caret /></RestrictionCard>
      </div>
      <Slider label="Minimum Dassh Score" hint="Dassh Score shows resume to JD fit" value="20" percent={22} />
    </div>
  );
}

export default function AgentWizardFigure() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(reduce ? 0 : -1); // -1 = all collapsed
  const [cursor, setCursor] = useState({ x: 320, y: 480, visible: false, press: false });
  const [clickN, setClickN] = useState(0);

  const { fitRef, frameRef } = useFitScale(660);
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
      <div className="ds-root" ref={frameRef}>
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

          <div className="ds-rail">
            <div className="ds-rail__title">Creation Overview</div>
            {STEPS.map((s, i) => (
              <RailStep
                key={s.title}
                n={i + 1}
                name={s.title}
                meta={active >= i ? s.meta : null}
                state={active === i ? "active" : active > i ? "done" : "todo"}
                last={i === STEPS.length - 1}
              />
            ))}
          </div>
        </div>

        <Cursor x={cursor.x} y={cursor.y} visible={cursor.visible} press={cursor.press} clickN={clickN} />
      </div>
    </div>
  );
}
