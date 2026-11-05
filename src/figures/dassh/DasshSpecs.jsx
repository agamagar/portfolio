// The Dassh case figures, by the name the case data asks for. Each figure is its own component in ./case, one file and one
// stylesheet per figure (the list, for the Figma translation, is case-study-components.md in the session notes).
//   <DasshSpec spec={{ type, caption?, ...data }} />
import { ScaleStats } from "./case/ScaleStats";
import { RuleFlow } from "./case/RuleFlow";
import { BoxCount } from "./case/BoxCount";
import { SpecTable } from "./case/SpecTable";
import { SpeakerFigure } from "./case/SpeakerThread";
import { FaceMatrix } from "./case/FaceMatrix";
import { CornerNest } from "./case/CornerNest";
import { SpacingScale } from "./case/SpacingScale";
import { OpenList } from "./case/OpenList";

const FIGURES = {
  stats: ScaleStats,
  flow: RuleFlow,
  boxes: BoxCount,
  table: SpecTable,
  speakers: SpeakerFigure,
  faces: FaceMatrix,
  corners: CornerNest,
  scale: SpacingScale,
  open: OpenList,
};

export function DasshSpec({ spec }) {
  const Figure = spec && FIGURES[spec.type];
  return Figure ? <Figure spec={spec} /> : null;
}
