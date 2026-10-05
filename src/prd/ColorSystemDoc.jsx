// The colour system, rendered as a PRD-style page through the shared PrdRenderer,
// the same way the prompt library is (two-level index rail: library, then group).
// Data is assembled in ./colorLibrary; see that folder's index.js for the map.
import { colorSystemData } from "./colorLibrary/index.js";
import PrdRenderer from "./PrdRenderer";

export default function ColorSystemDoc() {
  return (
    <PrdRenderer
      data={colorSystemData}
      kick="Colour system · Themes, status and invariants"
      title="The colour system"
    />
  );
}
