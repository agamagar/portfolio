// StellaLab (/stella) · the interactive screening call, as a full-screen application.
// The whole viewport is the product: nav rail, app header, transcript pane and the
// annotation rail. No portfolio chrome, because this is meant to read as software
// you are using, not a figure you are looking at.
//
// The same component renders contained (variant="figure") inside the case study.
// Dialogue and design rules: Claude/dassh-gujarati-research.md, dassh-failure-taxonomy.md,
// dassh-call-craft-research.md, dassh-disclosure-research.md.

import StellaSim from "./StellaSim";

export default function StellaLab({ onBack }) {
  return <StellaSim variant="page" onBack={onBack} />;
}
