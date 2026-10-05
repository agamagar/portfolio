// The prompt library, rendered as a PRD-style page through the shared PrdRenderer
// (two-level index rail, Cards/Table toggle, native scannable DOM). Data is
// assembled in ./promptLibrary — see that folder's index.js for the map.
import { promptLibraryData } from "./promptLibrary/index.js";
import PrdRenderer from "./PrdRenderer";

export default function PromptLibraryDoc() {
  return (
    <PrdRenderer
      data={promptLibraryData}
      kick="Prompt library · Voice and image systems"
      title="The prompt library"
    />
  );
}
