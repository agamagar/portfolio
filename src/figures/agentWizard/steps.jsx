// Shared content for the agent-creation wizard figure: the four steps and the
// body of each, plus loop timings. Reused by the scaling variants (Simple, Focus)
// and the original rail version. Built from Dassh node 1306-7328.
import {
  Field, Input, Textarea, Chip, Tabs, ChecklistRow,
  PromptBanner, ImportBar, DropZone, RestrictionCard, Slider,
  IconPhone, IconCheckUser, IconChat,
} from "../ds/Primitives";

export const STEPS = [
  { title: "Basic Details", short: "Basics", sub: "Add details to help you find your group", meta: "SDE III · Technology" },
  { title: "Customise Checklist", short: "Checklist", sub: "Fine-tune your selection criteria", meta: "24 criteria tagged" },
  { title: "Add Candidates", short: "Candidates", sub: "Upload or import candidates", meta: "42 matching found" },
  { title: "Follow Up & Approval", short: "Follow-up", sub: "Define how Stella reaches out", meta: "Calls · WhatsApp · Score 20" },
];

// loop timings (ms), shared across variants
export const T = { reset: 560, expand: 360, read: 820, move: 600, click: 240, gap: 160 };

export function StepBody({ index }) {
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
