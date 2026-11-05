// [CONFIRM: ...] and its kin in case-study copy: a check-note, shown only with the QA layer.

export const CONFIRM_RE = /(\s*\[(?:Confirm|CONFIRM|Reconcile|TODO|TBD)[^\]]*\])/g;
export function confirmNotes(text) {
  if (typeof text !== "string" || !CONFIRM_RE.test(text)) return text;
  CONFIRM_RE.lastIndex = 0;
  return text.split(CONFIRM_RE).map((part, k) => (k % 2 ? <span className="qa-confirm" key={k}>{part}</span> : part));
}
// 5 Nov 2026: a paragraph that is nothing but check-notes would render as an empty <p>, and in a section grid (no margin
// collapse) each one left a blank band (Dassh, The proof). It gets .qa-only: hidden, shown with the QA layer like its notes.
export const confirmOnly = (text) => typeof text === "string" && CONFIRM_RE.test(text) && !text.replace(CONFIRM_RE, "").trim();
