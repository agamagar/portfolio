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
      "(Options 1 and 2 are parked: roleFrame.hideEditorial / hideCard in App.jsx; only Option 3, the scope map, shows.) Three copies sit under the original: 1 Editorial spread, 3 Scope map, 2 Role card. Pick one and the rest go (App.jsx roleFrame.options, RoleEditorial / RoleScopeMap / RoleCard).",
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
    sel: ".rv-map__foot",
    title: "My role options: three fixes",
    detail:
      "Option tags and the scope map's centre node were 3.6:1 in light mode (now 6.6:1); Option 1's partner lines fell back to the body font; and at phone width the scope map's numbers ran past the box.",
  },

  // ---------- reach explorer (The constraints), QA of 12 Oct ----------
  {
    id: "rex-illustrative",
    route: "/work/scheduled-delivery",
    status: "open",
    sel: ".rex__note",
    title: "Reach explorer: confirm the numbers, or label it more loudly",
    detail:
      "It is an illustrative model (seeded blocks, three made-up stores, 1.6 km instant and 3.2 km scheduled reach) and the footnote says so, but at 11px at the foot of the panel; on a phone it is below the fold. Confirm those radii and the 11 PM store hours are what you want to claim, or add an “Illustrative model” tag to the figure's heading so nobody reads 100.0% as Zepto data.",
  },
  {
    id: "rex-neutral-contrast",
    route: "/work/scheduled-delivery",
    status: "open",
    sel: ".rex__legend",
    title: "Reach explorer: the “Nothing” swatch is faint in light mode",
    detail:
      "The grey dot and its blocks measure 2.1:1 on white in light mode (3.0:1 dark), under the 3:1 non-text floor. A design call because --sdc-neutral is shared with the other charts: suggest rgba(0,0,0,.45) in light, which is about 3.4:1.",
  },
  {
    id: "rex-touch-trap",
    route: "/work/scheduled-delivery",
    status: "open",
    sel: ".rex__map svg",
    title: "Reach explorer: the map traps page scroll on a phone",
    detail:
      "The map has touch-action: none, so a thumb that lands on it drags the circle instead of scrolling the page, and on a 476px screen the map is most of the figure. Options: touch-action: pan-y with the circle moved by its handle only, or a “tap to explore” lock.",
  },
  {
    id: "rex-mobile-crop",
    route: "/work/scheduled-delivery",
    status: "open",
    sel: ".rex__map svg",
    nth: 0,
    corner: "left",
    title: "Reach explorer: on a phone the circle can leave the frame",
    detail:
      "At 476px the 640×800 map is sliced to a 4:3 window (about y 158–641), so the idle drift and a 2 km circle run off the visible edge and the numbers count blocks you cannot see. Suggest a taller map on phones (aspect 1:1) or clamping the circle to the visible window.",
  },
  {
    id: "rex-legend-leaders",
    route: "/work/scheduled-delivery",
    status: "fixed",
    sel: ".rex__legend",
    corner: "left",
    title: "Reach explorer: legend leaders and percentages",
    detail:
      "The dotted leaders were typed “.” characters clipped by the column (“Instant .”, “Schedule ..”), and the values had no % sign. They are now a dotted rule that fills the space, and the values read 91.3%.",
  },
  {
    id: "rex-idle-drift",
    route: "/work/scheduled-delivery",
    status: "fixed",
    sel: ".rex__seg",
    title: "Reach explorer: the circle kept wandering after you used the clock",
    detail:
      "Only the slider and the map stopped the idle drift, so flipping 2 PM / 11 PM left the circle moving and the numbers changing under you. The toggle now counts as touching it. Checked in the same pass: keyboard (arrow keys, shift for big steps, focus ring), reduced motion (no drift), 60 fps while dragging and drifting, no console errors, no horizontal overflow at 476.",
  },

  {
    id: "rex-confirm-model",
    route: "/work/scheduled-delivery",
    status: "open",
    sel: ".rex__panel",
    corner: "left",
    title: "[CONFIRM] Reach explorer: the model's facts",
    detail:
      "Nothing in the report or the case text backs these, so they are model assumptions, not facts: instant reach 1.6 km and scheduled reach 3.2 km from an open store; Stores A and C closing for instant at 11 PM and Store B staying open; three stores. What the case does say: a shipment can be unserviceable because its store is closed or out of stock for that window (The cart is a complex construct), and 11 pm is a planning-tonight moment (One scroll across midnight). Confirm the radii and the 11 PM rule, or soften the footnote to say they are illustrative only. Numbers are untouched.",
  },
  {
    id: "rex-placement",
    route: "/work/scheduled-delivery",
    status: "note",
    sel: ".rex",
    corner: "left",
    title: "Reach explorer: now in Impact (was Context & problem, was The constraints)",
    detail:
      "12 Oct (mv589p9j): moved on to Impact, after the availability tape, and simplified to one number and one highlight colour (the waffle and per-store bars are gone). Earlier: was in The constraints, which is about one-hour slots, booked-plus-live load and the delivery promise; the explorer shows none of those. It now follows the arriving-tomorrow scene in Context & problem, where the copy says an app that only knew how to say now had nowhere to put them: this is who gets instant, who can only schedule, and how 11 PM changes it. Labels changed to match what it counts: the panel heading “Instant, schedule, or nothing” became “Instant, schedule only, or nothing” (the schedule dots are blocks that cannot get instant) and “Get instant” became “Blocks with instant” (the share is of blocks, not carts).",
  },
  {
    id: "rex-real-map",
    route: "/work/scheduled-delivery",
    status: "open",
    sel: ".rex__map",
    corner: "left",
    title: "[CONFIRM] Reach explorer: the real Indiranagar map and the store pins",
    detail:
      "The base is now the real street map of Indiranagar, Bangalore (OpenStreetMap, ODbL, attribution in the corner; baked into indiranagarMap.json by tools/osm-indiranagar.mjs, no live tiles). The three store pins are NOT real stores: they sit at plausible spots on the map and the footnote says so. If you want them at real dark-store locations (or a different neighbourhood), give me the coordinates; I did not guess a specific store. Blocks are 100 m squares of the map kept where a street runs through them; the 1.6 / 3.2 km radii and the 11 PM closures are still the model's assumptions (see rex-confirm-model).",
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
