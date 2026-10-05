// MOVED. The prompt library is no longer one file: it lives in ./promptLibrary/,
// one module per group, with the voice prompts composed by a real assembler and
// the global image rules declared once. See ./promptLibrary/index.js for the map.
//
// To add or edit prompts, edit the group's own file:
//   voice/frameworks.data.js, voice/moments.data.js
//   image/icons.data.js, specimen.data.js, hands.data.js, composition.data.js,
//   image/portfolioIcons.data.js, airplanes.data.js, airplaneViews.js
//
// This re-export is kept so anything still importing the old path keeps working.
export { promptLibraryData } from "./promptLibrary/index.js";
export { promptLibraryData as default } from "./promptLibrary/index.js";
