import { PRIVATE_SITE } from "../lib/site";
// WHAT THE TIMELINE AND THE CARDS SHARE (mv58rul2, 12 Oct 2026).
// One date per project (dd/mm from the projects list in App.jsx; CaratLane has
// no month, only its year), and the one sort both lists use: NEWEST FIRST, the
// order App.jsx's own project list already declares ("Ordered newest-first").
// Plus the projects that are gated behind an NDA until approval.
export const PROJECT_DATE = {
  "/work/away-agent": { year: 2026, date: "18/06" },
  "/work/cross-sell": { year: 2026, date: "15/06" },
  "/work/zepiris": { year: 2026, date: "20/01" }, // from the projects list in App.jsx
  "/work/scheduled-delivery": { year: 2025, date: "08/08" },
  "/work/dassh": { year: 2025, date: "15/03" }, // from the projects list in App.jsx
  "/list": { year: 2023, date: "01/01" }, // CaratLane: year only
  "/work/toppr": { year: 2019, date: "04/06" },
};
const key = (href) => {
  const d = PROJECT_DATE[href]; if (!d) return 0;
  const [dd, mm] = d.date.split("/").map(Number);
  return d.year * 10000 + mm * 100 + dd;
};
export const newestFirst = (items) => [...items].sort((a, b) => key(b.href) - key(a.href));

// THE PROJECTS' ROWS (moved here from Hello.jsx, Oct 2026): year, organisation and
// line for each case, read by the timeline list AND, on phones, by the caption under
// each work card (WorkGrid.jsx), so the two can never say different things.
// mtqs5nvx: year and organisation from the projects list, the line is each case's
// own title (helloData / App.jsx). CaratLane has no case page, so its line is the
// role's headline and it links to the list.
export const PROJECT_ROWS = [
  { year: "2025", org: "Zepto", line: "Scheduling on a 10-minute platform", href: "/work/scheduled-delivery" },
  { year: "2025", org: "Dassh", line: "Building a B2B SaaS from the ground up", href: "/work/dassh" },
  { year: "2026", org: "Away", line: "An agent that never takes the wheel", href: "/work/away-agent" },
  { year: "2026", org: "Zepto", line: "Zepto’s first open source platform", href: "/work/zepiris" },
  { year: "2026", org: "Zepto", line: "The half of cross-sell nobody solved", href: "/work/cross-sell" },
  { year: "2023", org: "CaratLane", line: "E-commerce for a jewelry brand" /* mtqs7lcx: shorter */, href: "/list" },
  { year: "2019", org: "Toppr", line: "Joyful learning experiences for students", href: "/work/toppr" },
];
export const projectRow = (href) => PROJECT_ROWS.find((r) => r.href === href);

// Shown but not openable: no link, no route prefetch, no project transition.
// The public site (src/lib/site.js) locks every /work/ project; the private build only the two NDA ones.
export const LOCKED = PRIVATE_SITE ? new Set(["/work/away-agent", "/work/cross-sell"]) : { has: (href) => typeof href === "string" && href.startsWith("/work/") };
// the newest Zepto project carries a "New" tag (mv58rul2)
export const NEW = new Set(["/work/scheduled-delivery"]);
export const LOCK_COPY = "Awaiting approval: shared under NDA";
