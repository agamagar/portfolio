// The "New" pill (mv58rul2), ONE component for the timeline row and the card so
// the two cannot drift. `corner` only positions it on a card; the look is the
// same class either way (.new-tag in hello3.css).
export default function NewTag({ corner = false }) {
  return <span className={"new-tag" + (corner ? " new-tag--corner" : "")} aria-hidden={corner ? true : undefined}>New</span>;
}
