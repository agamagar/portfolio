// The morph field's arithmetic off the main thread (2026-10-11, the hero): the drawing's signed
// distance field took a long task on the page.
import { drawingField } from "./morphField";

self.onmessage = ({ data: { cov2, W, H } }) => {
  const F2 = drawingField(cov2, W, H);
  self.postMessage({ F2 }, [F2.buffer]);
};
