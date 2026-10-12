// WHAT THE TIMELINE AND THE CARDS SHARE (mv58rul2, 12 Oct 2026).
// One date per project (dd/mm from the projects list in App.jsx; CaratLane has
// no month, only its year), and the one sort both lists use: NEWEST FIRST, the
// order App.jsx's own project list already declares ("Ordered newest-first").
// Plus the projects that are gated behind an NDA until approval.
export const PROJECT_DATE = {
  "/work/away-agent": { year: 2026, date: "18/06" },
  "/work/cross-sell": { year: 2026, date: "15/06" },
  "/work/scheduled-delivery": { year: 2025, date: "08/08" },
  "/list": { year: 2023, date: "01/01" }, // CaratLane: year only
  "/work/toppr": { year: 2019, date: "04/06" },
};
const key = (href) => {
  const d = PROJECT_DATE[href]; if (!d) return 0;
  const [dd, mm] = d.date.split("/").map(Number);
  return d.year * 10000 + mm * 100 + dd;
};
export const newestFirst = (items) => [...items].sort((a, b) => key(b.href) - key(a.href));

// Shown but not openable: no link, no route prefetch, no project transition.
export const LOCKED = new Set(["/work/away-agent", "/work/cross-sell"]);
// the newest Zepto project carries a "New" tag (mv58rul2)
export const NEW = new Set(["/work/scheduled-delivery"]);
export const LOCK_COPY = "Awaiting approval: shared under NDA";
