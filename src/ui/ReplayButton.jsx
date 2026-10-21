// "Replay animations": the global replay for the section controller (sectionPlay.js). It sits in the
// left stack above the eye, the same glass round button; every entrance currently in view resets and
// plays again from its start. Hidden when nothing is registered (reduced motion, or a page with no
// entrances).
import { Refresh } from "iconoir-react";
import { replayAll } from "./sectionPlay";
import { useSectionCount } from "./useSectionPlay";

export default function ReplayButton({ feedback }) {
  const n = useSectionCount();
  if (!n) return null;
  return (
    <button
      type="button"
      className="theme-toggle replay-btn"
      data-tip
      aria-label="Replay animations"
      onClick={() => { feedback?.("toggle"); replayAll(); }}
    >
      <Refresh width={15} height={15} strokeWidth={2} aria-hidden />
    </button>
  );
}
