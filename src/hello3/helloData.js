// Content for the /hello0 landing page. Kept out of the components so copy edits
// never mean touching layout code.

// ---- the top section -------------------------------------------------------
// Figma: Portfolio 2026, node 9:1955 ("Frame 48096617"). Copy verbatim.

// Two lines, right-ranged, with the face badge pinned to the left of line one.
// U+2019, not a straight quote.
export const GREETING = ["Hello!", "I’m Agam"];

// The credentials line. The three company names are set in full ink and
// underlined while the grammar around them stays muted, so the line reads as
// three names rather than as a sentence. They are emphasis, NOT links: the
// drawing keeps them in the body ink, not the link blue.
export const CREDENTIALS = [
  { text: "Design at " },
  { text: "Zepto", mark: true },
  { text: ", Previously at " },
  { text: "Deutsche Bank", mark: true },
  { text: ", " },
  { text: "CaratLane", mark: true },
];

export const ALSO = "Also a VR Enthusiast and an Amateur Researcher";

export const LINKS = [
  // The current resume PDF (Resume_Product_Design_Agam_Agarwal.pdf), copied
  // into public/resume/. NOT agam-agarwal-base.pdf — that one is GENERATED
  // from ../Resume/resume.html and is the master the /work/resume presets
  // are built from, so it is left alone rather than overwritten.
  { label: "Resume", href: "/resume/agam-agarwal-product-design.pdf", kind: "blank" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/agam-agarwal/", kind: "blank" },
];

// The role cards behind the emphasised company names. Transcribed verbatim from
// the LinkedIn experience section, read through an authenticated session
// (LinkedIn answers HTTP 999 to anything unauthenticated, so this cannot be kept
// in sync automatically and has to be re-read by hand when the profile changes).
//
// Keyed by the text that appears in the credentials line. That text used to be
// the short form; annotation msbntf7k made it the full "Deutsche Bank", so the
// key here and the one in BRAND_SHINE had to move with it — all three are the
// SAME string by design, and a rename that touches only the visible line
// silently breaks both the role card and the shimmer colour.
//
// `start` rather than a frozen "1 yr 8 mos": the tenure is computed at render so
// a card cannot quietly go stale, which is the one thing a hardcoded tenure
// string is guaranteed to do. The counting matches LinkedIn's own (the start
// month counts as month one), verified against all three entries.
//
// logoBg values are STAND-INS. Zepto's purple and Deutsche's blue are their
// actual brand colours; CaratLane's is deliberately a neutral graphite because I
// do not know theirs and inventing one is worse than admitting it. Drop real
// logo files in public/roles/ and swap `logoWordmark` for an `logoSrc`.
export const ROLES = {
  Zepto: {
    company: "Zepto",
    logoWordmark: "zepto",
    logoBg: "#6B21D9",
    title: "Product Designer II",
    type: "Full-time",
    start: "2024-12",
    end: null,
    location: "Bangalore Urban, Karnataka, India",
    arrangement: "Hybrid",
    headline: "0-to-1 consumer and ad products for 10-minute commerce",
    bullets: [
      "Scheduled Delivery: Designed a net-new capability from zero; nearly doubled average order value.",
      "Ads Revamp: New campaign types that opened a multi-crore monthly revenue line.",
      "Jarvis AI: Leading a AI product from-scratch for advertisers at Zepto.",
      "ZepIris: Designed Zepto’s first open-source project and its go-to-market to create pre-IPO buzz. Zepto’s in-house face authentication for frontline teams.",
    ],
    // Titles of the attached media on the entry. The thumbnails themselves are
    // assets I do not have; the titles are the information, so they render as
    // text until images land in public/roles/zepto/.
    media: [
      { title: "Zepto Aces 2026" },
      { title: "Schedule Delivery: Best Project Award 2026" },
      { title: "ZepIris: Reimagining Scalable Face Authentication for Attendance at Zepto" },
    ],
    mediaMore: 2, // LinkedIn shows "Show all 5 media"
  },

  "Deutsche Bank": {
    company: "Deutsche Bank",
    logoWordmark: "db",
    logoBg: "#0018A8",
    title: "Product Designer",
    type: "Full-time",
    start: "2024-01",
    end: "2024-12",
    location: "Bangalore Urban, Karnataka, India",
    arrangement: null, // the entry lists no work arrangement
    headline: "Enterprise tools for sales and trading, several powered by GenAI and LLMs.",
    bullets: [
      "Global News Dashboard: led the design; sped up how teams scan and act on research.",
      "Alerting system for contract breaches and exposure that replaced manual monitoring.",
      "Tools to surface insights from client conversations.",
    ],
    media: [],
  },

  // A GROUPED entry: one company, two positions, which is how LinkedIn holds it
  // and how it should read. The header carries the company and the full span;
  // the positions carry their own titles and dates beneath it.
  CaratLane: {
    company: "CaratLane - A Tanishq Partnership",
    logoWordmark: "CL",
    logoBg: "#3A3A3C",
    title: null, // the company is the heading here, not a job title
    type: "Full-time",
    start: "2022-09",
    end: "2024-01",
    location: "Mumbai",
    arrangement: null,
    headline: "Consumer e-commerce for a leading online jewelry brand.",
    bullets: [
      "Redesigned the product-listing experience: +30% filter engagement, 15,000 product views a day.",
      "Built the Referral program end to end: 80 new users a week.",
      "Shaped the Loyalty program: Potential impact of 10% of all new online orders.",
    ],
    positions: [
      { title: "Product Designer II", start: "2023-04", end: "2024-01" },
      { title: "Product Designer", start: "2022-09", end: "2023-04" },
    ],
    media: [],
  },
};

// ---- phone marquee ---------------------------------------------------------
// Real, shipped screens only. Dassh is deliberately absent: it is a B2B web
// product and putting it in a phone would be a nicer-looking lie.
//
// FIVE entries, matching the drawn row. A Toppr entry was removed: its src
// pointed at /figures/toppr/competitive-login-mobile.png, which is a grey Figma
// artboard of about fifty competitor thumbnails titled "Login Flows (Mobile)" —
// a research board, not a shipped screen, and at 1.729:1 against the screen
// box's 2.175:1 it would have been cropped into unreadable grey rectangles. That
// is precisely the lie the rule two lines up exists to prevent.
//
// These entries carry no `alt` and are not currently rendered as screens at all
// (see PhoneMarquee): every cell shows the same Figma composition until the
// instances in the file carry their own. brand/href/caption are kept for when
// they do.
export const PHONES = [
  {
    src: "/figures/scheduled/sched-slots-today.png",
    // `screen` overrides the shared ROW_SCREEN for this cell only. Exported from
    // Schedule Order Handoff (71cZSn6pTNf4zFzO07O2uv) node 40000009:382973 —
    // the real Schedule Page, so the one cell that links to the Scheduled
    // Delivery case actually shows that screen instead of the generic mock.
    screen: "/mockups/figma/schedule-delivery-screen.png",
    brand: "Zepto",
    caption: "Slot picker",
    blurb: "Choosing a delivery window on a platform built for ten-minute delivery.",
    href: "/work/scheduled-delivery",
    accent: "#6B21D9",
    angle: "front",
    platform: "Mobile",
  },
  {
    // Away agent greeting, exported from Portfolio 2026 node 44:3958 ("Hey
    // Sukesh / Where are you headed?"). `src` moves with `screen` for the reason
    // the ZepIris cell documents: the row draws `screen` and the detail overlay
    // draws `src`, so leaving the old photo in `src` would show one image in the
    // row and a different one once the cell is opened. The original screenshot
    // is still at /figures/away-agent/greeting/morning-ui.jpg if it is wanted.
    src: "/mockups/figma/away-agent-screen.png",
    screen: "/mockups/figma/away-agent-screen.png",
    brand: "Away",
    caption: "Morning greeting",
    blurb: "The travel agent's first surface of the day, before you ask anything.",
    href: "/work/away-agent",
    accent: "#2563EB",
    angle: "two-hand",
    platform: "Mobile",
  },
  // Toppr replaces one of the three Away cells (Agam: "replace one of the mobile
  // mocks with this"). Away held three of the five mobile slots and all three
  // were still drawing the shared mock, so this both adds the fifth company to
  // the row and cuts a repetition rather than growing it.
  // Exported from Portfolio 2026 node 41:1605, "With the view pricing button".
  // Caption describes the SCREEN (the Toppr Plus upgrade page, features then
  // pricing), not the project — same reasoning as the ZepIris cell.
  {
    src: "/mockups/figma/toppr-screen.png",
    screen: "/mockups/figma/toppr-screen.png",
    brand: "Toppr",
    caption: "Plus upgrade",
    // Re-exported to node 44:7045, which is the same screen WITHOUT the View
    // Pricing button (41:1605 was named "With the view pricing button"). The
    // blurb used to end "...before the pricing", which pointed at a button this
    // frame no longer has, so it moved to what is actually on screen.
    blurb: "What Toppr Plus adds: four features, then Learn, Practice and Ask.",
    href: "/work/toppr",
    accent: "#2BB3A3",
    angle: "front",
    platform: "Mobile",
  },
  // The first genuinely WEB entries (annotation msbepkpl). The All tab was already
  // wired to size each cell by its own platform, but every entry was Mobile, so
  // there was nothing to mix. These are real desktop plates from Dassh (1500x715
  // and 1400x891), not phone screens relabelled — the platform field has to stay
  // true or the frame is lying about the work.
  // CaratLane, exported from Portfolio 2026 node 38:4087 — the loyalty invite
  // over the listing it interrupts. This was the row's generic fallback until
  // every other cell got a real screen; it is real shipped work, so it becomes a
  // cell of its own rather than sitting unused.
  //
  // NO `href`, deliberately. CaratLane has no case page and no TIMELINE row, and
  // pointing it at a route that does not exist would be a dead link dressed as a
  // case study. The detail overlay already hides the facts when there is no
  // TIMELINE match; it now hides the CTA when there is no href, which is the
  // same idea applied one field further.
  {
    src: "/mockups/figma/caratlane-screen.png?v=2",
    screen: "/mockups/figma/caratlane-screen.png?v=2",
    brand: "CaratLane",
    caption: "Select invite",
    blurb: "The loyalty invite, over the listing it interrupts.",
    accent: "#3A3A3C",
    angle: "front",
    platform: "Mobile",
  },
  {
    src: "/figures/dassh/onboarding.jpg",
    brand: "Dassh",
    caption: "Agent onboarding",
    blurb: "Setting up an agent, on the desktop surface the team actually works in.",
    href: "/work/dassh",
    accent: "#EA580C",
    platform: "Web",
  },
  {
    src: "/figures/dassh/stella-chat.jpg",
    brand: "Dassh",
    caption: "Stella",
    blurb: "The assistant, in the product rather than beside it.",
    href: "/work/dassh",
    accent: "#EA580C",
    platform: "Web",
  },
];

// ---- timeline --------------------------------------------------------------
// Sourced from the `projects`, `archived` and `research` arrays in App.jsx.
// `at` is a fractional year: the point in time a single entry lands on.
//
// There are deliberately NO start/end spans here. The source arrays record one
// date per project and App.jsx's own comment says even those months are
// placeholders, so a duration chart would have been precision as costume. The
// tenure/bars layout was cut for exactly this reason. Agam is supplying the real
// timeline data separately; when it lands, this array is where it goes and the
// metric-versus-typographic question for the axis gets settled with it.
export const TIMELINE = [
  {
    id: "away-agent",
    brand: "Away",
    title: "An agent that never takes the wheel",
    href: "/work/away-agent",
    accent: "#2563EB",
    year: 2026,
    date: "18/06",
    at: 2026.46,
    role: "Led interaction design",
    outcome: "V1 live",
  },
  {
    id: "zepiris",
    brand: "Zepto",
    title: "Zepto’s first open source platform",
    href: "/work/zepiris",
    accent: "#4F46E5",
    year: 2026,
    date: "20/01",
    at: 2026.05,
    role: "Led design end to end",
    outcome: "100% hub coverage",
  },
  {
    id: "scheduled-delivery",
    brand: "Zepto",
    title: "Scheduling on a 10-minute platform",
    href: "/work/scheduled-delivery",
    accent: "#6B21D9",
    year: 2025,
    date: "08/08",
    at: 2025.6,
    role: "Led interaction design",
    outcome: "AOV nearly 2x",
  },
  {
    id: "dassh",
    brand: "Dassh",
    title: "Building a B2B SaaS from the ground up",
    href: "/work/dassh",
    accent: "#EA580C",
    year: 2025,
    date: "15/03",
    at: 2025.2,
    role: "Founding designer",
    outcome: "0 to 1",
  },
  {
    id: "aiims",
    brand: "AIIMS",
    title: "Teaching empathy to nurses in virtual reality",
    href: "/work/aiims",
    accent: "#059669",
    year: 2023,
    date: "01/01",
    at: 2023.0,
    role: "Research and design",
    outcome: "Published, Springer",
  },
  {
    id: "toppr",
    brand: "Toppr",
    title: "Joyful learning experiences for students",
    href: "/work/toppr",
    accent: "#2BB3A3",
    year: 2019,
    date: "04/06",
    at: 2019.43,
    role: "Product designer",
    outcome: "Shipped to millions",
  },
];

// The stretch of years with no shipped project on this page. Shown as an
// explicit, labelled break rather than either compressed away (a lie) or drawn
// to scale (a third of the page spent on nothing).
export const GAP = { from: 2021.0, to: 2022.4, label: "Masters, research, and the move into VR" };

// Three candidates, not four. This switcher is a chooser, not a feature: we look
// at them side by side, keep one, and delete the control with the losers.
export const TIMELINE_LAYOUTS = [
  { id: "spine", name: "Spine", note: "Years as strata down a single hairline." },
  { id: "rail", name: "Rail", note: "A horizontal run of time, scrubbed by the page scroll." },
  { id: "stair", name: "Stair", note: "Time descending. Gaps become distance." },
];

// Per-name shimmer colours (annotation msbj24t5), APPROXIMATED from each brand
// rather than lifted from a brand book: no licensed palette is available here,
// so these are "in the family of", not asserted brand values.
//
// MEASURED AGAINST THE WRONG GROUND THE FIRST TIME, and that is why the sweep
// was invisible (annotation msbjurc7). The first pass scored each colour against
// the PAGE. But the band never touches the page: it paints the glyphs, replacing
// the resting ink for the moment it passes. So the number that decides whether
// anyone sees a sweep is band-vs-INK, exactly as the CSS comment beside
// --shiny-band already said. Scored that way the old pairs were:
//   Zepto  #B794F6 vs #ededed = 2.09:1   Deutsche #60A5FA = 2.17:1
// against the 7.57:1 of the neutral band they replaced. A 2:1 shift over a 32px
// ridge is nothing, which is the reported symptom exactly.
//
// There are TWO grounds to satisfy at once, which is what makes this awkward.
// The band has to differ from the ink (or no one sees a sweep) AND stay legible
// against the hero sky (or the word drops out as the band crosses it). Chasing
// only the first gives a deep band that sinks into the night sky; chasing only
// the second gives a pale band indistinguishable from the ink.
//
// A mid-tone satisfies both, and it does so in BOTH themes without a pair,
// because the hero sky flips with the ink: light theme is dark ink on a bright
// sky, dark theme is light ink on a night sky, and a vivid mid sits between the
// two either way. So these ship as single values, not light/dark pairs — the
// first time on this page that a pair has not been needed.
//
//              vs ink light  vs ink dark  vs day sky  vs night sky
//   Zepto      #7C3AED  3.31       4.87       5.70        3.38
//   Deutsche   #2E6FBF  3.72       4.33       5.07        3.80
//   CaratLane  #9333EA  3.51       4.60       5.38        3.58
// All four columns clear 3:1. Legibility never rests on the band regardless:
// the ink is a second, opaque layer underneath that the sweep only rides over.
// Still approximations in each brand's family, not asserted brand values.
const shine = (hex) => ({ light: hex, dark: hex });
export const BRAND_SHINE = {
  Zepto: shine("#7C3AED"),
  "Deutsche Bank": shine("#2E6FBF"),
  CaratLane: shine("#9333EA"),
};
