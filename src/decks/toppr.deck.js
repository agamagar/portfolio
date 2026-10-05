// Presentation deck for the Toppr (internship) case study.
// Composed from the slide-archetype library in App.jsx (see buildSlides / Slide).
// A lighter, breadth-shaped recipe than the flagship decks: title -> set the
// table -> four phases (Joy, Conversion, Consistency, Ownership) each opened by
// a phaseDivider -> a reflective close. No impact-metrics slide on purpose: the
// case has no verified outcome data, so the deck closes on what the breadth
// taught instead. Media reuses the exact collage arrays and image paths from
// the toppr case sections in App.jsx (public/figures/toppr).

export const topprDeck = [
  {
    "type": "title"
  },
  {
    "type": "statement",
    "kicker": "The shape of the work",
    "text": "One internship, six surfaces of a product that 3.2 million students use every day."
  },
  {
    "type": "splitLabeled",
    "h": "Set the table",
    "items": [
      {
        "label": "Overview",
        "body": "Toppr is one of India's largest after-school learning platforms. I worked across its product family: the practice tool, the Toppr Plus paywall, School OS, the competitive research behind conversion, and the brand's logo system."
      },
      {
        "label": "Role",
        "body": "Design intern. On most surfaces I contributed interaction and visual design alongside the product teams that owned them. One product, Toppr Ambassador, I led end to end, from the full vision down to a shippable MVP spec."
      }
    ]
  },
  {
    "type": "figure",
    "h": "The family these surfaces span",
    "p": [
      "At a startup shipping quickly, surfaces get built by different teams at different times, and the experience drifts. The practice tool, the paywall, School OS, and the brand marks no longer felt like one product. My internship sat across that seam."
    ],
    "image": "/figures/toppr/logo-lockups.png",
    "figure": "The Toppr product family these surfaces span.",
    "layout": "split"
  },
  {
    "type": "numbered",
    "kicker": "The brief",
    "h": "Two threads ran through everything",
    "items": [
      {
        "title": "Make learning feel joyful",
        "body": "Studying is rarely something a student wants to do. The bet: fast feedback, visible progress, and a sense of momentum can make practice genuinely enjoyable."
      },
      {
        "title": "Make it one product again",
        "body": "Sharpen individual surfaces while pulling a fast-built family back toward a coherent whole, for students in grades 6 to 12, often on low-end devices and patchy networks."
      }
    ]
  },
  {
    "type": "phaseDivider",
    "n": "01",
    "name": "Joy",
    "sub": "Making practice something a student comes back to"
  },
  {
    "type": "gallery",
    "h": "The feedback around the answer, not just correctness",
    "p": [
      "The practice tool was the clearest test of the joyful-learning thesis. Positive and negative nudges, carried by animation, respond to how a student is doing, not only whether the last answer was right, and success animations reward a finished set.",
      "The nudge copy is written for specific situations, a streak, a rough patch, a long absence, so encouragement reads as recognition instead of noise."
    ],
    "collage": [
      "/figures/toppr/practice-question.gif",
      "/figures/toppr/practice-nudges.png",
      "/figures/toppr/practice-scenarios.png"
    ],
    "figure": "The animated practice flow, the nudge states (a streak, a recovery, a win), and scenario-specific encouragement."
  },
  {
    "type": "phaseDivider",
    "n": "02",
    "name": "Conversion",
    "sub": "The moment an unpaid student meets the paid tier"
  },
  {
    "type": "methodFinding",
    "h": "First, a teardown of the giants",
    "finding": "Studying how Byju's and Unacademy handled login and conversion showed where Toppr's upgrade moment was asking too much, too early.",
    "p": [
      "A paywall is pure friction if it just blocks. The competitive analysis grounded the redesign in what actually convinces, rather than what merely gates."
    ]
  },
  {
    "type": "gallery",
    "h": "The Toppr Plus paywall, rebuilt as a value pitch",
    "p": [
      "Core value up front (live classes, concepts, and video), social proof through testimonials, and two clear exits: a primary upgrade CTA and a talk-to-an-expert CTA for students who needed a human before deciding."
    ],
    "collage": [
      "/figures/toppr/paywall.png",
      "/figures/toppr/paywall-2.png",
      "/figures/toppr/competitive-login-flows.png",
      "/figures/toppr/competitive-login-mobile.png",
      "/figures/toppr/competitive-conversations.png",
      "/figures/toppr/competitive-analysis.png"
    ],
    "figure": "The Toppr Plus paywall, and the competitive teardown of login, conversion, and re-engagement behind it."
  },
  {
    "type": "phaseDivider",
    "n": "03",
    "name": "Consistency",
    "sub": "Pulling a fast-built product family back into one product"
  },
  {
    "type": "gallery",
    "h": "Structure for School OS",
    "p": [
      "The product schools run on had a timetable that was bootstrapped without much design principle behind it. I gave it weekly and daily views, where the daily view doubles as a student's overview of the day's learning objectives, not just a grid of periods."
    ],
    "collage": [
      { "src": "/figures/toppr/schoolos-timetable.png", "w": "half" },
      { "src": "/figures/toppr/schoolos-dashboard.png", "w": "half" },
      { "src": "/figures/toppr/schoolos-classroom.png", "w": "half" },
      { "src": "/figures/toppr/schoolos-timetable-2.png", "w": "half" }
    ],
    "figure": "School OS: weekly and daily timetable views, and the dashboard that frames a student's day."
  },
  {
    "type": "gallery",
    "h": "One scalable logo family",
    "p": [
      "The marks across the Toppr ecosystem had the same drift problem at a smaller scale. I designed a logo family that brings the existing marks into one coherent system, one that still holds together as new products are added."
    ],
    "collage": [
      "/figures/toppr/logo-icons.png",
      "/figures/toppr/logo-plus-variants.png",
      "/figures/toppr/logo-icon-grid.png",
      "/figures/toppr/logo-icon-matrix.png"
    ],
    "figure": "One scalable logo family: the app icons, the plus variants, and the exploration behind the system."
  },
  {
    "type": "phaseDivider",
    "n": "04",
    "name": "Ownership",
    "sub": "The one product I led from zero"
  },
  {
    "type": "methodFinding",
    "h": "Toppr Ambassador: a vision and an MVP",
    "finding": "Unlike the surfaces I contributed to, here I owned the design from the ground up, as two artifacts: the full product concept, and a pared-back MVP spec.",
    "p": [
      "Ambassador was a new product within Toppr Community. Designing both the whole vision and the smallest shippable slice meant the team could ship something real and learn from it before committing to everything."
    ]
  },
  {
    "type": "gallery",
    "h": "The whole product, drawn out",
    "p": [
      "Onboarding, dashboard, lead management, demo booking, earnings, the empty states, and the mobile MVP: every screen of the flow, including the unglamorous ones."
    ],
    "collage": [
      "/figures/toppr/ambassador-onboarding.png",
      "/figures/toppr/ambassador-dashboard.png",
      "/figures/toppr/ambassador-home.png",
      "/figures/toppr/ambassador-content.png",
      "/figures/toppr/ambassador-leads.png",
      "/figures/toppr/ambassador-add-lead.png",
      "/figures/toppr/ambassador-agent-form.png",
      "/figures/toppr/ambassador-book-demo.png",
      "/figures/toppr/ambassador-demo-booked.png",
      "/figures/toppr/ambassador-trial.png",
      "/figures/toppr/ambassador-earnings.png",
      "/figures/toppr/ambassador-how-it-works.png",
      "/figures/toppr/ambassador-empty-leads.png",
      "/figures/toppr/ambassador-empty-earnings.png",
      "/figures/toppr/ambassador-mobile.png"
    ],
    "figure": "Toppr Ambassador end to end: onboarding, dashboard, lead management, demo booking, earnings, empty states, and the mobile MVP."
  },
  {
    "type": "closing",
    "h": "What the breadth taught me",
    "p": [
      "Contributing across surfaces owned by other teams taught me to land useful design fast inside someone else's context: read the constraints, sharpen what exists, leave it more coherent than I found it.",
      "Owning Ambassador taught the opposite muscle: holding a whole product in my head, then having the discipline to cut it down to a shippable first slice."
    ],
    "kind": "outcome"
  },
  {
    "type": "closing",
    "h": "Thank you",
    "p": [
      "One internship, a real cross-section of a product used by 3.2 million students a day, and one product carried from vision to MVP spec."
    ],
    "kind": "thanks"
  }
];
