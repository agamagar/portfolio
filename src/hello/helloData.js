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
  { text: "Product design & more at " },
  { text: "Zepto", mark: true },
  // A NEW LINE STARTS HERE (annotation msmrysoh). The comma is not part of this
  // segment's rendering - the punctuation rule below already moves it into the
  // nowrap wrapper with "Zepto" - so line one ends "Design at Zepto," and line
  // two opens on the word that changes tense.
  { text: ", Prev. at ", br: true },
  { text: "Deutsche Bank", mark: true },
  { text: ", " },
  { text: "CaratLane", mark: true },
];

// "Amateur" -> "Hobbyist" (annotation msms63ua). Spelling corrected on the way
// in, as asked: the annotation reads "hobbiest", which is the common misspelling
// - the noun is HOBBYIST. The article changes with it, "an Amateur" -> "a
// Hobbyist", and the Title Case matches "VR Enthusiast" beside it rather than
// the lowercase the annotation was typed in.
export const ALSO = "Also a VR Enthusiast and a Hobbyist Researcher";

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
      "Jarvis AI: Leading an AI product from scratch for advertisers at Zepto.",
      // ONE PRODUCT, ONE PUBLIC NAME. This read as two fragments and looked
      // like a merged bullet; it is a single thing — Zepto's face
      // authentication, which was also its first open-source release.
      // "OdinEye" was briefly printed here alongside it and is now GONE:
      // attested 2026-08-07 as the INTERNAL CODE NAME, and an internal code
      // name is not something a portfolio should publish. ZepIris is the
      // accepted public name and the only one this record uses.
      "ZepIris: Zepto’s in-house face authentication for riders, pickers and packers, and its first open-source release. Led design and go-to-market: 100% hub coverage, up to ₹50L a month saved.",
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
    // ATTESTED 2026-08-07, and it leads on purpose. The specifics below are real
    // but read as three disconnected tools; this is what they added up to. It is
    // also the honest answer to a row whose work is largely CONFIDENTIAL: say
    // what the platform was for, not what cannot be shown.
    //
    // Lives in `bullets` rather than `headline` so it reaches BOTH surfaces that
    // read this record, the timeline row and the role card. The timeline prints
    // them in order, so it lands as summary first, then specifics.
    // CRISP FORMAT (Agam, 2026-08-11): the summary line is now the 0-to-1
    // platform sentence, which is what the four bullets added up to and was
    // already leading them. That leaves exactly three specifics under it, and
    // nothing was dropped - the headline field above still carries the "what the
    // work was" line for the role card, which reads it as a subtitle.
    headline: "Enterprise tools for sales and trading, several powered by GenAI and LLMs.",
    summary: "A 0-to-1 platform for investment banking: research, analysis and execution in one place.",
    bullets: [
      "Global News Dashboard: led the design, teams scan and act on research faster.",
      "Alerting for contract breaches and exposure, replacing manual monitoring.",
      "Tools that surface what matters from client conversations.",
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
    // END CORRECTED to Dec 2023 (attested 2026-08-07, and it is what
    // Resume/linkedin-profile.md says too). The Jan 2024 value made CaratLane
    // and Deutsche Bank share January, which is where the lenses' whole
    // "January handover" rule came from. With the real dates they are simply
    // adjacent, and the overlap that needed resolving never existed.
    end: "2023-12",
    location: "Mumbai",
    arrangement: null,
    // CRISP FORMAT (Agam, 2026-08-11): one impact line, then exactly three
    // bullets. This row already had the shape; the words are tightened and the
    // metric moved to the front of each bullet, so the three read as results
    // rather than as tasks that happen to end in a number.
    headline: "Consumer e-commerce for a leading online jewellery brand.",
    bullets: [
      "Redesigned product listing: +30% filter engagement, 15,000 product views a day.",
      "Built the referral programme end to end: 80 new users a week.",
      "Shaped the loyalty programme: a potential 10% of all new online orders.",
    ],
    positions: [
      { title: "Product Designer II", start: "2023-04", end: "2023-12" },
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
  // FIRST in the row (annotation mse9mynv, "make this the first screen").
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
    // THE SCANNABLE SPAN (annotation msrq817u, "instead of works, write a small
    // explainer for each, with all text as 50% grey and scannable text as 90%
    // white"). One substring per blurb, matched verbatim and wrapped at render -
    // see hm-bar__scan in both PhoneMarquee components. Picked as the phrase a
    // skimmer's eye would actually catch: the named product, not the sentence
    // around it.
    scan: "Toppr Plus",
    // THE SCROLLING BAND (annotation msjywvoj, "in this frame use this
    // animation" pointing at Portfolio 2026 node 80-4187). That frame animates
    // by clipping a 513-tall viewport over a 1460-tall content frame and
    // repeating the content below it, which is how a seamless scroll is drawn
    // in Figma. `body` is that tall content exported on its own (node 80:4215);
    // PhoneMarquee lays two copies end to end and translates them.
    //
    // The two offsets are the source frame's own measurements, not eyeballed:
    // the status bar is 115 of its 783 and the scrolling viewport is 513 of it.
    // Kept as data rather than CSS constants because the next screen to get
    // this treatment will have different chrome.
    // THE REAL SPEC, read off the file rather than inferred. The first build of
    // this guessed a continuous seamless loop from how the frame is CONSTRUCTED
    // (a clipped viewport over a tall strip, copies parked below) because the
    // motion could not be read: REST carries no animation data at all, and one
    // of the two Figma MCP servers has no edit access to this file. The other
    // one does, and `get_motion_context` on node 80:4215 returned the timeline
    // below verbatim.
    //
    // It is NOT a continuous loop. It is a scripted tour: hold, scroll, hold,
    // scroll, hold, scroll, hold, then run back to the top and hold — five
    // seconds, repeating. The pauses are the point, and a constant drift had
    // none of them.
    //
    // `y` IS IN THE SOURCE FRAME'S UNITS (the strip is 1460 tall there), so it
    // is divided by `frame` and applied as a percentage of the strip's own
    // height. That keeps the motion identical at any rendered size without
    // measuring anything — a px value would have been right at exactly one
    // cell width.
    scroll: {
      // THE BASE THE BAND SITS ON, and it has to be THIS frame rather than the
      // cell's usual `screen`. Both exports are 360x783 and they look
      // interchangeable, but the existing one came from a different variant
      // (44:7045, "without the View Pricing button") whose bottom fifth is more
      // scrolling content where THIS frame has a pinned offer bar. Composited
      // together the seam showed: the band's bottom edge at 80.2% had live
      // content above it and frozen content from another screen below.
      // One frame, one animation, one base.
      base: "/mockups/figma/toppr-screen-scroll.png",
      body: "/mockups/figma/toppr-body.png",
      top: 14.6871, // 115 / 783
      height: 65.5172, // 513 / 783
      // The strip's size in source units. `frame` is what `y` is measured in;
      // `frameW` is only here so the band can reserve the right box BEFORE the
      // image decodes — see ScrollBand, where a strip of unknown height made
      // every percentage in the timeline resolve to zero.
      frameW: 360,
      frame: 1460,
      // THE BAND NEEDS ITS OWN GROUND. The exported strip is RGBA with no fill
      // of its own — node 80:4215 and its clipping parent both have empty
      // `fills`, and the white you see in Figma comes from the ROOT frame
      // (80:4187, a solid #FFFFFF) further up. Exported alone, the strip is
      // transparent, so the static screenshot underneath showed straight
      // through it and the two contents overlapped into an unreadable double
      // exposure. Taken from that root fill rather than typed by eye.
      //
      // NOT theme-aware, and deliberately: this is a picture of an app's own
      // screen, not part of the page's surface. It is white in the product.
      bg: "#FFFFFF",
      y: [0, 0, -400, -400, -620, -620, -940, -940, -8, -8],
      times: [0, 0.058, 0.2779, 0.3313, 0.4352, 0.5086, 0.6528, 0.7426, 0.8426, 1],
      // one entry per segment, so nine for ten keyframes. The two beziers ending
      // above 1 are a slight overshoot and are Figma's, not a typo.
      ease: [
        "linear",
        [0.42, 0, 0, 1],
        "linear",
        [0.42, 0, 0, 1.002],
        "linear",
        [0.42, 0, 0, 1.005],
        "linear",
        "easeOut",
        "linear",
      ],
      duration: 5,
    },
    href: "/work/toppr",
    // ACTIVE CARD (annotation msu558a9, "apply this hover state to all
    // others"): the CaratLane 163:1325 treatment on every phone. Card = the
    // accent's hue at the reference card's OKLCH lightness (L 0.215), mark =
    // the accent's hue at the reference mark's chroma, lightened until it
    // clears 4.5:1 on that card. Measured: mark/card 5.70:1, white/card 16.1:1.
    // No headline given, so the card carries the cell's blurb + scan.
    active: { card: "#00261E", ink: "#FFFFFF", mark: "#00AD93", bezel: false /* off since 2026-08-15, "the frame and corner radius transition is not needed" */ },
    accent: "#2BB3A3",
    angle: "front",
    platform: "Mobile",
  },
  {
    // RE-EXPORTED 2026-08-15 from Portfolio 2026 node 163:14479 (the screen
    // frame inside 163:1325, "Frame 48096636") at 4x = 960x2088: the same
    // listing + Select sheet, but with the darker scrim Figma now carries.
    // Previous still kept at _pre-motioncheck-bak/caratlane-screen_pre-163-1325.png.
    // CORNERS SQUARED (annotation msu9zr9y, "restore the dynamic corner radius
    // for all tiles"): the Figma export carried the frame's baked 36px corner
    // as transparency, so this one tile drew a ~40px corner while the others
    // took --hm-radius (8px@188 -> 16px@269). Filled row-wise from the nearest
    // opaque pixel (tools: PIL, in the session note); the clipped export is at
    // _pre-motioncheck-bak/caratlane-screen_baked-corner-163-14479.png.
    // NOTE the hover clip's final frame still has the older, lighter scrim, so
    // the fade back to this still is a slight darkening rather than invisible.
    // `?v=2` busts the browser cache of the clipped-corner file that shipped
    // under this same path earlier today (annotation msua8o92 saw the old one).
    src: "/mockups/figma/caratlane-screen.png?v=2",
    screen: "/mockups/figma/caratlane-screen.png?v=2",
    brand: "CaratLane",
    caption: "Select invite",
    // THE INVITE REVEAL (annotation msk5ybfa, Portfolio 2026 node 80-2601).
    // A flag rather than a spec, unlike Toppr's `scroll`: that one is four
    // numbers and a strip, this is a 27-node cohort whose layout, layer offsets
    // and per-property easings only make sense together. It lives in
    // InviteReveal.jsx as one piece; here the plate only says that it HAS one.
    // THE LAYERED REBUILD IS COMMENTED OUT, NOT DELETED (annotation mskh32yq,
    // "use the caratlane.webm file from assets") - the same swap the Away cell
    // made in mskfgniu, for the same reason: the video IS the 27-node cohort,
    // stars and all, rendered by Figma itself. Uncommenting the flag brings
    // InviteReveal back; the component and its /motion-check specimen stay.
    // Transcoded VP9 -> H.264 yuv420p (Safari), 360x784. UPDATED source
    // (annotation msl4lfgh): the recut caratlane.webm is 5.0s, 160KB; the
    // loop-aligned hold recomputes from `seconds` on its own.
    // reveal: "caratlaneInvite",
    clip: {
      src: "/mockups/figma/caratlane-invite.mp4",
      left: 0,
      top: 0,
      width: 100,
      height: 100,
      // THE PLATE'S OWN CORNER, not a copy of what it measured once (Agam,
      // 2026-08-11: "2 layers creating 2 corner radii in mobile"). `--hm-radius`
      // is proportional - calc(--hm-w * 28 / 269) - so it is 28px on a 269px
      // cell and about 19.6px on the narrower mobile one, while this literal
      // stayed at 36px. The video therefore rounded LESS than the screenshot
      // beneath it and its own corner read as a second, wider arc outside the
      // phone's. Same variable now, so the two corners are one corner at every
      // width.
      radius: "var(--hm-radius)",
      seconds: 5,
    },
    blurb: "The loyalty invite, over the listing it interrupts.",
    scan: "loyalty invite",
    // THE ACTIVE STATE IS FIGMA 163:1325 (Agam, 2026-08-15: "when caratlane
    // becomes active the figma reference is the state I want to see"). The
    // frame is a 368x770 card (#250240, r24) holding the bezelled phone at
    // (64,64) 240x522 and a centred two-line headline 48 below it, 16/24 white
    // with two purple runs. Everything here is that node's numbers; the CSS
    // turns them into fractions of the phone so the card scales with --hm-w.
    active: {
      card: "#250240",
      ink: "#FFFFFF",
      // Figma's #A251F9 measures 4.38:1 on the card, a hair under the 4.5
      // text bar; #A857FA is the same hue one step lighter and clears it at
      // 4.66:1 (white on the card is 18:1).
      mark: "#A857FA",
      bezel: false /* off since 2026-08-15, "the frame and corner radius transition is not needed" */,
      // NO forced line break. The node's own "\n" after "across" was kept for
      // a while, but at the 24px the headline runs at now "Improving discovery
      // across" no longer fits one line, so the hard break landed mid-phrase
      // and left a one-word line ("across") - five ragged lines in all (Agam:
      // "the text on the active phone state is weird and breaking"). Natural
      // wrapping gives four even lines.
      headline: "Improving discovery across 500+ retail stores and designing for new revenue streams",
      marks: ["500+ retail stores", "new revenue streams"],
    },
    accent: "#3A3A3C",
    angle: "front",
    platform: "Mobile",
  },{
    src: "/figures/scheduled/sched-slots-today.png",
    // `screen` overrides the shared ROW_SCREEN for this cell only. Exported from
    // Schedule Order Handoff (71cZSn6pTNf4zFzO07O2uv) node 40000009:382973 —
    // the real Schedule Page, so the one cell that links to the Scheduled
    // Delivery case actually shows that screen instead of the generic mock.
    screen: "/mockups/figma/schedule-delivery-screen.png",
    brand: "Zepto",
    caption: "Slot picker",
    // THE BANNER IS THE REAL CLIP (annotation mskdb3xr, "you have the pink box
    // at the top, use the schedule.mp4 from the assets folder"). The lavender
    // "Introducing Schedule Delivery" strip in the export is a still of an
    // animation that actually shipped; this is that animation.
    //
    // The box is MEASURED, not guessed: sampling the screenshot for the band's
    // own colour puts it at x 36-1043, y 348-665 of the 1080x2340 export. The
    // clip lands on THAT box, not the full screen width: the still insets the
    // banner 3.3% each side, the same gutters every card below it keeps, and a
    // full-width mapping made the banner read wider than the rest of the
    // screen. The mp4 is 1080x340 (ratio 3.176) against the box's 1008x318
    // (3.170), 0.2% apart, so `fill` stretches nothing visible. Percentages,
    // so it tracks the phone at any cell size.
    clip: {
      src: "/mockups/figma/schedule-banner.mp4",
      // REPLAYS while the tile is held (annotation msooyc18). This banner is a
      // running animation rather than a one-shot entrance, so a wrap reads as
      // the loop it is - see the note in ClipVideo for why looping is opt-in.
      loop: true,
      left: 3.3333,
      top: 14.8718,
      width: 93.3333,
      height: 13.5897,
      // The clip's own length, so the carousel holds this tile long enough to
      // play it out (annotation mskex8cl). Measured with ffprobe, not guessed —
      // and it lives here rather than being read off the <video> at runtime
      // because the hold has to be decided BEFORE the tile arrives, when the
      // element may not exist yet.
      seconds: 5,
    },
    blurb: "Choosing a delivery window on a platform built for ten-minute delivery.",
    scan: "delivery window",
    href: "/work/scheduled-delivery",
    // msu558a9: mark/card 4.57:1, white/card 18.1:1 (method: see Toppr)
    active: { card: "#1E0545", ink: "#FFFFFF", mark: "#935FFF", bezel: false /* off since 2026-08-15, "the frame and corner radius transition is not needed" */ },
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
    // THE ZERO STATE, ANIMATED (annotation msk87bcy, Portfolio 2026 node
    // 95-20176). A flag, like CaratLane's `reveal`: the cohort is twenty nodes
    // whose offsets only make sense together, so it lives in its own component
    // rather than as data here.
    // THE LAYERED REBUILD IS COMMENTED OUT, NOT DELETED (annotation mskfgniu,
    // "comment out the current animation, let's use the awa-zero video").
    // Putting the flag back re-mounts AwayZeroState unchanged; the component
    // and its /motion-check specimen stay intact either way. The video is the
    // GROUND-TRUTH export of the same 2000ms cohort (assets/away-zero.webm,
    // transcoded VP9 -> H.264 yuv420p for Safari, 360x782 at 113KB) - the
    // pixel-exact rendering of the timeline the rebuild approximates, all 20
    // nodes included. Full-screen clip, so left/top 0 and 100x100; radius is
    // the phone corner's own rather than the banner default - as the variable,
    // not a literal, for the reason written out on the CaratLane clip above.
    // reveal: "awayZeroState",
    clip: {
      src: "/mockups/figma/away-zero.mp4",
      left: 0,
      top: 0,
      width: 100,
      height: 100,
      radius: "var(--hm-radius)",
      // UPDATED source (annotation msl5rtzg): the recut away-zero.webm is a
      // longer 5.0s sequence (the old 2.0s was the raw cohort loop). The
      // loop-aligned hold recomputes from seconds/rate on its own.
      seconds: 5,
      // 30% slower (annotation mskhfiyf, given against the 2s cut and KEPT -
      // an explicit call stands until countermanded). With the 5s recut this
      // makes the effective dwell ~7.1s; if that reads long, drop this line.
      rate: 0.7,
    },
    blurb: "The travel agent's first surface of the day, before you ask anything.",
    scan: "travel agent's first surface",
    href: "/work/away-agent",
    // msu558a9: mark/card 4.54:1, white/card 17.8:1 (method: see Toppr)
    active: { card: "#00114A", ink: "#FFFFFF", mark: "#337AFF", bezel: false /* off since 2026-08-15, "the frame and corner radius transition is not needed" */ },
    accent: "#2563EB",
    angle: "two-hand",
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
  // "Dassh: Agent onboarding" REMOVED (annotation mskcsk2f), for the same reason
  // as the Stella cell above and on the same day: a Web-platform frame takes its
  // natural proportion at the row's fixed height, which measured 1047px against
  // the mobile cells' 269.
  //
  // WITH BOTH GONE, NOTHING IN THIS ARRAY IS `platform: "Web"` ANY MORE. The
  // filter's Web tab and the `hasMatch` collapse still work, they simply have
  // nothing to act on — and the chips are hidden anyway (hello.css). Worth
  // knowing before adding a web screen back: it will arrive four times the width
  // of its neighbours unless the frame is capped first.
  // "Dassh: Stella" REMOVED (annotation mskcojh3, pointed straight at it). It
  // was a Web-platform cell, and a web frame takes its natural proportion at the
  // row's fixed height — measured 1047px against the mobile cells' 269, four
  // times their width and not even consistent with the other web cell's 910. It
  // only became visible at all when the platform filter was defaulted back to
  // "All" earlier today; the moment it could be seen, it was the wrong size for
  // the row. The screen still lives at /figures/dassh/stella-chat.jpg.
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
    // The node marks the IHIC 2023 conference, per the 2026-08-06 interview.
    // Agam does not recall the month; "middle of the year for now" is his own
    // placement, so mid-June, flagged approximate wherever the date is spoken.
    // The old 01/01 placeholder claimed "Published, Springer" at Jan 2023, which
    // was wrong by two years: CrossRef dates the chapter (10.1007/978-981-97-
    // 7190-5_33) online 6 Mar 2025, and the Volume 6 book (10.1007/978-981-96-
    // 5503-8) Sep 2025.
    year: 2023,
    date: "15/06",
    at: 2023.42,
    role: "Research and design",
    outcome: "Published by Springer, 2025",
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

// The stretch between the Toppr ship and the AIIMS one.
//
// NOW ATTESTED (2026-08-06 interview). The old comment here guessed "probably
// not a gap at all", and the guess was right: the AIIMS research ran Agam's
// final academic year, Jul 2021 to Jun 2022, inside the UPES degree. The break
// stays as the axis's story label for that stretch; the lenses draw the span
// itself from the aiims-research row in TENURES. Dates now match the attested
// window: 2021.5 is Jul 2021, 2022.42 is Jun 2022 (the (mm - 1) / 12 convention).
export const GAP = { from: 2021.5, to: 2022.42, label: "A research project at AIIMS Rishikesh" };

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

// ---- tenures ---------------------------------------------------------------
// The SPANS the timeline's graduated lenses draw (Registers and Ledger, from
// the Lens Lab, 2026-08-04; expanded 2026-08-06). TIMELINE deliberately carries
// no durations — each ship is one date — but ROLES above holds the LinkedIn-
// transcribed employment spans, and the 2026-08-06 interview with Agam attested
// everything the transcript never covered: the degree, three internships, the
// research year, and both ventures' real spans. Wherever a fact exists in
// ROLES or TIMELINE it is REFERENCED, never retyped, so each fact keeps one
// home.
//
// PROVENANCE. verified: true means attested — by the LinkedIn transcript or by
// Agam's own account in the interview. Where his account hedged on months
// (Siemens's summer, Dassh's exit, the IHIC node) the hedge ships too, as a
// datesNote the tooltips speak. With college (May 2018) through Cyware
// (Aug 2022) meeting CaratLane (Sep 2022), the record now has ZERO unaccounted
// months: every lived month has a claimant.
//
// start/end are "YYYY-MM". end: null means the span runs to now.

// One lookup for everything a tenure borrows from its ship: brand, accent,
// role, and the "YYYY-MM" of the ship date.
const ship = (id) => TIMELINE.find((t) => t.id === id);
const shipYM = (id) => {
  const p = ship(id);
  const mm = parseInt(p.date.split("/")[1], 10);
  return `${p.year}-${String(mm).padStart(2, "0")}`;
};
// A fractional year (GAP's format) -> "YYYY-MM", matching the (mm - 1) / 12
// convention the axis uses: 2021.0 is Jan 2021, 2022.4 is May 2022.
const decimalYM = (d) => {
  const y = Math.floor(d);
  return `${y}-${String(Math.floor((d - y) * 12) + 1).padStart(2, "0")}`;
};

export const TENURES = [
  {
    // B.Des, Interaction Design specialization, UPES Dehradun (Uttarakhand).
    // Attested 2026-08-06. The degree is the base layer of 2018 to 2022: the
    // three internships and the research year all ride on top of it.
    id: "upes",
    org: "UPES, Dehradun",
    kind: "study",
    start: "2018-05",
    end: "2022-06",
    role: "B.Des, Interaction Design",
    // ATTESTED 2026-08-07. The degree row was the longest bar on the timeline
    // and the only one that said nothing about what came of it. What carried it
    // was research: a fire-safety study and the AIIMS empathy work, which has
    // its own row because it also ran as a distinct final-year project.
    // A THIRD, SMALLER RESEARCH PROJECT EXISTS AND IS PARKED at Agam's call
    // (2026-08-07). Only the two he named are claimed. Do not add it from
    // memory: it would need what it was, and a venue and year if it was
    // published, the way the AIIMS row carries "Springer, 2025". Note also that
    // "published papers" was said in the plural and only one publication is
    // sourced, so no plural claim is made anywhere on this row.
    summary: "A B.Des in interaction design, carried by research and worked through in parallel.",
    // The third bullet is the honest shape of these four years rather than a
    // claim about the degree itself: the internships and the research ran ON
    // TOP of it, which is why the timeline shows four bars where a degree would
    // normally show one. The parked third research project is still parked
    // (2026-08-07) and is not counted here.
    outcomes: [
      "Two research projects carried it: a fire-safety study, and the AIIMS empathy work in VR.",
      "Three internships ran alongside: Toppr, Siemens, Cyware. Ed-tech, industrial, enterprise security.",
      "Left Jun 2022 with a year of enterprise product work behind me, into CaratLane that September.",
    ],
    accent: null, // study is not an entity; it wears a neutral ink hatch, and
    // AIIMS green stays reserved for AIIMS (Lens Lab audit)
    verified: true,
  },
  {
    // An internship inside the degree, not employment: attested 2026-08-06,
    // which also killed the old composed 4-month fade — the end month is real.
    id: "toppr",
    org: ship("toppr").brand,
    kind: "internship",
    start: shipYM("toppr"), // the ship month is also the internship's start
    end: "2019-12",
    accent: ship("toppr").accent,
    // THE ROLE IS THE INTERNSHIP'S, not the project card's. `ship("toppr").role`
    // reads "Product designer", which is what the case study's meta line says
    // about the work; this row is an internship and the tenure record says so
    // (attested 2026-08-06). A timeline that prints "Product designer" on a
    // six-month internship is overclaiming by one word.
    role: "Design Intern",
    // Was one line: "Shipped across multiple releases during the post-funding
    // ramp-up" - true, and it says nothing about what the work WAS. All three
    // below are from the case study (App.jsx): the product family and its 3.2M
    // daily students, Ambassador as the one thing led end to end, and the
    // competitive study that found the conversion problem.
    summary: "Interaction and visual design across the product family of one of India's largest learning platforms.",
    outcomes: [
      "Across the family: the practice tool, the Plus paywall, School OS. 3.2 million students a day.",
      "Led Toppr Ambassador end to end, from the concept to an MVP the team could ship and learn from.",
      "Studied Byju's and Unacademy on conversion: Toppr's upgrade moment asked too much, too early.",
    ],
    verified: true,
  },
  {
    // "The next year, three months, around summer" — months are Agam's own
    // approximation and the tooltip says so. Petrol is Siemens's actual brand
    // colour family; the identity is carried by the label ink regardless.
    id: "siemens",
    org: "Siemens",
    kind: "internship",
    start: "2020-06",
    end: "2020-08",
    datesNote: "summer 2020, months approximate",
    accent: "#009999",
    // ATTESTED 2026-08-07. "Design-system work" said the category and nothing
    // else. The scale is the point: an enterprise system, built in three months.
    role: "Design Intern",
    summary: "An enterprise design system, built from zero in a three-month internship.",
    // TWO BULLETS, NOT THREE, and that is deliberate rather than unfinished. The
    // whole attested record of this row is one sentence (2026-08-07): a design
    // system for enterprise applications, in three months, for a platform
    // managing EV charging at industrial scale. Split into the two things it
    // actually says. A third would have to be invented, and an invented bullet
    // on a row about a real internship is worse than a short row.
    // What would fill it: how many components or teams it served, or what
    // shipped on top of it after the internship ended.
    outcomes: [
      "Built the system in twelve weeks: components, patterns, and the rules for assembling them.",
      "It served a platform managing EV charging at industrial scale.",
    ],
    verified: true,
  },
  {
    // Runs from the final academic year past graduation, straight into CaratLane
    // — this span is what closes the record's last unaccounted stretch. Brand
    // colour unknown; the slate is a deliberate neutral, the same admission
    // CaratLane's logoBg makes. No role TITLE was attested, so none is claimed;
    // what he did attest is the work, and that is what the outcomes say.
    id: "cyware",
    org: "Cyware",
    kind: "internship",
    // ATTESTED 2026-08-11. This row printed no role at all - the earlier note
    // below says none was claimed because none had been given. It has been now.
    role: "Product Design Intern",
    // SPAN CORRECTED 2026-08-07 to Sep 2021 - Aug 2022, twelve months. The Jan
    // 2022 start came from the 2026-08-06 interview; asked again while this
    // row's outcomes were being written, Agam placed it at a full year and gave
    // the months. It now overlaps both the degree and the AIIMS research year,
    // which is correct — all three ran at once, and rows are drawn independently
    // so the overlap simply shows rather than having to be resolved.
    start: "2021-09",
    end: "2022-08",
    accent: "#475569",
    // ATTESTED 2026-08-07: the product has a name, and the internship ended in
    // an offer that was turned down.
    // SOLE OWNERSHIP, ATTESTED 2026-08-11 ("I was the sole owner of the CITX
    // product"). It leads, because it is the fact that makes the rest of the row
    // mean something: a twelve-month internship that OWNED a shipping enterprise
    // product is a different claim from one that contributed to it.
    // SOLE OWNERSHIP MOVES DOWN INTO THE BULLETS (Agam, 2026-08-11: "sole
    // designer in cyware is also a bullet point"), which also fills the third
    // slot the dropped COVID line left empty. The impact line above it now says
    // what the year AMOUNTED TO rather than repeating the ownership claim, so
    // the two are not the same sentence twice.
    summary: "Enterprise threat intelligence, owned end to end through a full rebuild.",
    outcomes: [
      "Sole designer on CTIX, the company's threat-intelligence product.",
      // THE CLIENT IS DELIBERATELY NOT NAMED. Agam attested a specific defence
      // customer, then chose the generic form for a public portfolio. That is
      // the right call and worth keeping: the sentence loses nothing, and
      // naming someone else's customer is a decision only they can make.
      "Rebuilt and launched CTIX 3.0 end to end, used by defence and enterprise security teams.",
      // The COVID / remote-handover line is dropped (Agam, 2026-08-11): it was
      // my framing of a circumstance, not something he did. Leaves two bullets
      // on this row until a third real one lands.
      // "which I turned down" removed (Agam, 2026-08-11). The offer is the
      // signal; what he did with it is a different story and not this row's.
      "Ended in a full-time offer.",
    ],
    verified: true,
  },
  {
    // The final-year research inside the degree, alongside the Cyware months.
    // Role title from the case study's own meta line ("Design Researcher").
    // Publication came later: chapter online 6 Mar 2025, Volume 6 in Sep 2025
    // (CrossRef; see the aiims TIMELINE node comment).
    id: "aiims-research",
    org: "AIIMS Rishikesh",
    kind: "research",
    start: "2021-07",
    end: "2022-06",
    role: "Design researcher",
    accent: ship("aiims").accent,
    // THE CREDIT LINE IS KEPT (case study, App.jsx): the research plan and the
    // framing were the team's, everything downstream of it was Agam's to
    // execute. So the bullets are the three things he built and ran, and the
    // summary claims the publication rather than the methodology.
    // 2025, not 2023: the paper was presented at IHIC 2023 and PUBLISHED by
    // Springer in 2025 (chapter online Mar 2025, volume Sep 2025). The case
    // study still says "2023 IHIC proceedings", which is the conference, and
    // both are true as long as neither is used as the other.
    summary: "A published framework for teaching empathy to nurses in virtual reality (Springer, 2025).",
    outcomes: [
      "Built a reliability-tested empathy scale for the Indian context, not an imported instrument.",
      "Designed the VR environment and its interaction model: a hard conversation, practised before a real patient.",
      "Ran the fieldwork and the pilots, with a control group in the evaluation design.",
    ],
    verified: true,
  },
  {
    id: "caratlane",
    // display short form of ROLES.CaratLane.company ("CaratLane - A Tanishq
    // Partnership") — a deliberate label choice, not a divergent fact
    org: "CaratLane",
    kind: "employment",
    start: ROLES.CaratLane.start,
    end: ROLES.CaratLane.end,
    // positions are listed newest-first on LinkedIn; oldest-first reads as a career
    role: ROLES.CaratLane.positions.map((p) => p.title).reverse().join(" → "),
    // the shine, not the brand near-black — #3A3A3C vanishes on the dark ground
    accent: BRAND_SHINE.CaratLane.light,
    outcomes: ROLES.CaratLane.bullets,
    verified: true,
  },
  {
    id: "db",
    org: ROLES["Deutsche Bank"].company,
    kind: "employment",
    start: ROLES["Deutsche Bank"].start,
    end: ROLES["Deutsche Bank"].end,
    role: ROLES["Deutsche Bank"].title,
    accent: BRAND_SHINE["Deutsche Bank"].light,
    // The timeline's impact line is the 0-to-1 platform sentence, not the role
    // card's "enterprise tools" subtitle. Read from ROLES rather than retyped,
    // so the two surfaces cannot drift.
    summary: ROLES["Deutsche Bank"].summary,
    outcomes: ROLES["Deutsche Bank"].bullets,
    verified: true,
  },
  {
    id: "zepto",
    org: ROLES.Zepto.company,
    kind: "employment",
    start: ROLES.Zepto.start,
    end: ROLES.Zepto.end, // null: the transcript says present
    endNote: "present",
    role: ROLES.Zepto.title,
    accent: ROLES.Zepto.logoBg,
    // THREE BULLETS, NOT FOUR (Agam, 2026-08-11: "yes drop Jarvis AI"). The
    // timeline card is one impact line and three bullets, and Jarvis is the one
    // of the four still in flight, so it is the one with no outcome to print.
    //
    // WRITTEN HERE rather than by editing ROLES.Zepto.bullets, deliberately:
    // those four are also what the role card in the credentials line shows, and
    // that card is a fuller telling with room for work in progress. This drops
    // Jarvis from the TIMELINE, which is what was asked, and leaves the record
    // itself intact. Say the word if it should go from both.
    outcomes: [
      "Scheduled Delivery: a net-new capability from zero, nearly doubling average order value.",
      "Ads Revamp: new campaign types, and a multi-crore monthly revenue line.",
      "ZepIris: in-house face authentication, and Zepto's first open source release. 100% hub coverage, up to ₹50L saved a month.",
    ],
    verified: true,
  },
  // The two ventures RUN ALONGSIDE the Zepto tenure — that overlap is the whole
  // reason Registers exists. Both are unverified spans: the start month is the
  // ship date, the end is simply "still going". PROVENANCE of the rounds: the
  // same strings live in SideQuests.jsx (rendered on /hello0, NOT on the page
  // these lenses ship on) and Dassh's also in AlongPath.jsx. Retyped here as
  // tenure outcomes for now — if a single-home SIDE_QUESTS export ever exists,
  // reference it from both places.
  {
    // CLOSED, not ongoing — the row said "ongoing" until the 2026-08-06
    // interview, which is the kind of thing only asking catches. Dassh was
    // 2025: angel conversations Dec 2024, money landed Mar 2025 (the month the
    // ship node already sat on), and Agam exited "somewhere in between" later
    // in the year. Dec 2025 is the honest close with the hedge attached rather
    // than a precise month he did not claim.
    id: "dassh",
    org: ship("dassh").brand,
    kind: "venture",
    start: "2025-01",
    end: "2025-12",
    datesNote: "exit month approximate",
    accent: ship("dassh").accent,
    role: ship("dassh").role,
    // DRAFT, TO REFINE (Agam, 2026-08-11: "Dassh helped me understand and tackle
    // enterprise challenges, help me write 3 pointers and we'll refine").
    // Each one is a different enterprise problem rather than three features:
    //   1. getting past the demo, which is where B2B pilots die
    //   2. the surface with the most human risk in it, with the numbers
    //   3. what an enterprise operator needs on opening the product
    // Every fact here is already in the case study (App.jsx): the Zydus and
    // Increff pilots, the 300 transcripts / 47 calls / 35-40% to 71%, and the
    // homepage-as-generated-report. The raise moves up into the impact line.
    // REFINED (Agam, 2026-08-11). Three changes, each answering a fault in the
    // first draft:
    //   1. The pilots and the raise move UP into the impact line. "Took it to
    //      pilots" is a company outcome, not a design one, and it was taking a
    //      bullet that a design decision should have.
    //   2. The call LEADS. It is the only line with numbers in it and the
    //      hardest thing on the row: the cheapest surface in hiring to automate
    //      and the most expensive to get wrong.
    //   3. The dashboard bullet becomes the AGENT-VERSUS-JOB correction, which
    //      is the actual enterprise lesson the pilots taught - an operator cares
    //      about jobs and people, not about the machines - and it keeps the
    //      generated report as the thing that lesson shipped as.
    // The third bullet is new and is the throughput problem every 0-to-1 B2B
    // team has: four experiences, three engineers, one designer.
    summary: "B2B hiring from zero to live inside enterprises like Zydus and Increff, and a ₹1.2 Cr round.",
    outcomes: [
      "Owned the first-round phone screen, the cheapest thing in hiring to automate and the worst to get wrong: 300 transcripts, 47 calls of my own, completion 35-40% to 71%.",
      "Corrected the model after the pilots: enterprises think in jobs and people, not agents, so the home reports on the pipeline and surfaces an agent only when one needs tuning.",
      "Built the design system that turned Figma into production code: four experiences, three engineers.",
    ],
    verified: true,
  },
  {
    // NOT "raised" — the seed has not landed. Term sheet closed mid-Jul 2026,
    // money expected mid-Aug 2026, and today is Aug 2026, so the outcome line
    // says closing rather than closed. It flips to "$1M seed, landed Aug 2026"
    // once the money is in.
    id: "away",
    org: ship("away-agent").brand,
    kind: "venture",
    start: "2026-01",
    // ENDS AT THE RAISE, ATTESTED (Agam, 2026-08-07). First given as an
    // assumption he asked for — "away raised funding that's the end, assume the
    // project ended" — then confirmed outright: "it ended". Recorded as fact
    // rather than inference, which is the only reason this row may claim a
    // closed span. The seed landing is the arc's endpoint, so it closes on that
    // month instead of running open. Zepto is now the only open span on the
    // chart.
    end: "2026-08",
    accent: ship("away-agent").accent,
    role: ship("away-agent").role,
    // Was "term sheet closed Jul 2026, landing Aug 2026", written while the
    // money was still in flight. It landed, so the hedge comes off, and it is
    // now the impact line rather than the whole record of the row.
    // REWRITTEN IN THE SAUER REGISTER (pin mtr6jclq, 07 Sep 2026: "write a
    // summary in the voice harness tone"). Gate: 0 fails, 0 warns. Every fact
    // is from this record: the consolidator fan-out and minute-by-minute deep
    // search (outcomes[1]), the agent that never takes the wheel (the
    // away-agent case's own thesis), Jan to Aug 2026 (start/end), the seed.
    // The old line, "A 0-to-1 AI travel agent, from the first bet to a $1M
    // seed.", is folded into the close.
    summary: "Booking a flight is a hundred small decisions and a long wait. Away is an agent that does the figuring-out for you: it searches across consolidators, shows its work minute by minute, and books, without ever taking the wheel. Eight months, from the first bet to a $1M seed.",
    // THE HARD PARTS OF 0-TO-1, which is what Agam asked this row to say
    // (2026-08-11: "write about things that are generally the hardest for 0-1
    // products"). Each one is a real decision from this build, not a general
    // truth about startups: the wedge, the wait, and the states.
    //
    // Nothing here is invented. The fan-out across consolidators and the
    // minute-by-minute deep-search timeline are the product's own mechanics; the
    // expiry and re-search states are in the agent's status model. What is NEW
    // is only the framing - naming why each was the difficult part rather than
    // listing the feature.
    outcomes: [
      "Picked the wedge: an agent that searches and books, not a chat box over a search form.",
      "Made the waiting honest: a deep search across consolidators, showing its work minute by minute.",
      "Designed the states no demo shows: fares that move, results that expire, answers that come back different.",
    ],
    verified: true,
  },
];
