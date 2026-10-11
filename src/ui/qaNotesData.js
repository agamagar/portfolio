// QA NOTES for the dev QA layer (src/ui/QaNotes.jsx). One entry per finding
// from the full-page QA pass of 10 Oct 2026 on /work/scheduled-delivery (desktop
// dark + light, and a 375px phone). Each pin attaches to the first element that
// matches `sel` (and contains `text`, when given; `nth` picks a later match),
// on its top-right corner, or its top-left with corner: "left".
//
// status: "open"  - needs a decision or an answer from Agam
//         "fixed" - changed in this pass; the note says what and where
//         "note"  - a deliberate choice worth knowing, nothing to do
//
// To retire a note, delete it here. The layer only exists in dev builds.

export const QA_NOTES = [
  // ---------- open ----------
  {
    id: "confirm-gtm",
    route: "/work/scheduled-delivery",
    status: "open",
    sel: "p",
    text: "On the schedule page, an animated banner",
    title: "Check-note in the copy: go-to-market",
    detail:
      "The paragraph carries “[Confirm the exact go-to-market surfaces and any banner copy.]”. It was showing to readers; it is now hidden (amber here, in QA mode). Answer it, then delete the bracket from the copy in App.jsx (The go-to-market).",
  },
  {
    id: "confirm-stuck",
    route: "/work/scheduled-delivery",
    status: "open",
    sel: "p",
    text: "Showing the failure honestly",
    title: "Check-note in the copy: the stuck cart",
    detail:
      "“[Confirm this matches the shipped solution.]” was visible to readers; now hidden. Confirm the stuck-cart state shipped as described, then drop the bracket (App.jsx, The stuck cart).",
  },
  {
    id: "proto-private",
    route: "/work/scheduled-delivery",
    status: "open",
    sel: ".article__plate-link",
    title: "The live prototype is blank for most visitors",
    detail:
      "The Figma file (Schedule Order Handoff, 71cZSn…) is private to your personal account, so the embed renders a white screen and the new link button lands on Figma sign-in for anyone else. Either share the file as “anyone with the link can view”, or point the link at a public copy. Production builds already fall back to the still.",
  },
  {
    id: "banner-twice",
    route: "/work/scheduled-delivery",
    status: "open",
    sel: ".article__plates",
    corner: "left", // the plate-link pin already holds this row's right corner
    title: "The banner phone appears twice",
    detail:
      "The go-to-market banner phone is in this restored row and again in The go-to-market section. Keep one. Also: the left phone is cropped at the bottom and the right one at the top, so the pair does not sit on one line.",
  },
  {
    id: "role-options",
    route: "/work/scheduled-delivery",
    status: "open",
    sel: ".rv",
    title: "Pick one My role direction",
    detail:
      "Three copies sit under the original: 1 Editorial spread, 3 Scope map, 2 Role card. Pick one and the rest go (App.jsx roleFrame.options, RoleEditorial / RoleScopeMap / RoleCard).",
  },
  {
    id: "svg-ids",
    route: "/work/scheduled-delivery",
    status: "open",
    sel: "#Vector",
    title: "Duplicate SVG ids from a Figma export",
    detail:
      "#Vector, #Vector_2 and #Vector_3 each appear twice (an inline SVG pasted from Figma, rendered two times). Harmless today, but any gradient or mask that references one of those ids will pick the first copy. Rename on export or strip the ids.",
  },
  {
    id: "chart-buttons",
    route: "/work/scheduled-delivery",
    status: "open",
    sel: "button",
    text: "90d",
    title: "Chart range buttons: small and partly unnamed",
    detail:
      "Fixed: the inactive 30d / 90d / All read 1.7:1 (light) and 2.2:1 (dark); now about 5:1 and 6:1. Still open, inside the chart library: the buttons are 20px tall (24px is the floor) and five hidden twins have no accessible name.",
  },
  {
    id: "mail-target",
    route: "/work/scheduled-delivery",
    status: "open",
    sel: "a[href^='mailto:']",
    title: "Contact link is a 23px target",
    detail: "Just under the 24px minimum. A little vertical padding on the footer link fixes it.",
  },

  // ---------- fixed ----------
  {
    id: "rail-keys",
    route: "/work/scheduled-delivery",
    status: "fixed",
    sel: ".rwf-glass",
    title: "Console flooded by a duplicate React key",
    detail:
      "The phase rail keyed its rows by month, but the rows are weeks, so four rows shared a key and React warned every frame (12,000+ messages). Rows now carry their own key (SchedRoleWireframes phaseRailModel + Timeline Rail). Console is clean through a full scroll.",
  },
  {
    id: "dio-count",
    route: "/work/scheduled-delivery",
    status: "fixed",
    sel: ".dio__count",
    title: "“3 PEOPLE” was under contrast",
    detail: "White 70% on the purple pin measured 4.20:1; now 85%, 5.6:1.",
  },
  {
    id: "cmp-tags",
    route: "/work/scheduled-delivery",
    status: "fixed",
    sel: ".sdcmp__tag",
    title: "Rejected / Shipped tags in light mode",
    detail: "11px bold at 3.76:1 and 3.73:1; darkened to #c81e1e (5.9:1) and #027a48 (5.4:1). Dark mode unchanged.",
  },
  {
    id: "chip-tag",
    route: "/work/scheduled-delivery",
    status: "fixed",
    sel: ".expl-chip",
    title: "Exploration tags were 8px",
    detail: "KILLED / SCALE tags rendered at 8px, below any readable floor; now 10px with the pill grown to fit.",
  },
  {
    id: "rv-fixes",
    route: "/work/scheduled-delivery",
    status: "fixed",
    sel: ".rv-map__stats",
    title: "My role options: three fixes",
    detail:
      "Option tags and the scope map's centre node were 3.6:1 in light mode (now 6.6:1); Option 1's partner lines fell back to the body font; and at phone width the scope map's numbers ran past the box.",
  },

  // ---------- notes ----------
  {
    id: "thin-numerals",
    route: "/work/scheduled-delivery",
    status: "note",
    sel: ".rwf-tabs__panel .rwf__n",
    title: "Big numerals kept thin on purpose",
    detail:
      "The font pass set display text to weight 400, but these 56px step numbers stay at 200: at 400 they turn heavy and outshout the step titles. Say so if you want them matched.",
  },
  {
    id: "false-positives",
    route: "/work/scheduled-delivery",
    status: "note",
    sel: ".rex__lead",
    title: "Checked and fine",
    detail:
      "Flagged by the scan, verified by eye: these legend rows clip on purpose (a dot leader), the horizontal state strips scroll by design, the hero heart bleeds off the edge on phones by design, and no request on the page fails.",
  },
];
