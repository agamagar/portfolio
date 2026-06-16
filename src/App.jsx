import {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
  useMemo,
  createContext,
  useContext,
  Fragment,
  lazy,
  Suspense,
} from "react";
import { flushSync } from "react-dom";
import { Agentation } from "agentation";
import { FACE_VIEWBOX, FACE_COLOR, FACE_PATHS, FACE_EXTRA, FACE_EYES } from "./faceMorph";

// Project list. "Toppr" is a real, decided project; the rest are sample slots
// to fill in one at a time. Each title splits into segments; `accent: true`
// segments use the project's accent color.
// Ordered newest-first, grouped by year. `month` values are PLACEHOLDERS,
// replace with the real project months (they also set the order within a year).
const projects = [
  {
    brand: "Away",
    href: "/work/away",
    accent: "#0891B2",
    year: "2026",
    month: "12/04",
    titleSegments: [{ text: "Negotiate", accent: true }, { text: " your flights" }],
  },
  {
    brand: "Zepto",
    href: "/work/jarvis",
    accent: "#DB2777",
    year: "2026",
    month: "03/02",
    titleSegments: [{ text: "Zepto's Ad Platform Revamp" }],
  },
  {
    brand: "Zepto",
    href: "/work/zepiris",
    accent: "#4F46E5",
    year: "2026",
    month: "20/01",
    titleSegments: [{ text: "Zepto's first open source platform" }],
  },
  {
    brand: "Zepto",
    href: "/work/scheduled-delivery",
    accent: "#6B21D9",
    year: "2025",
    month: "08/08",
    titleSegments: [{ text: "Scheduling on a 10-minute platform" }],
  },
  {
    brand: "Dassh",
    href: "/work/dassh",
    accent: "#EA580C",
    year: "2025",
    month: "15/03",
    titleSegments: [{ text: "Building a B2B SaaS from the ground up" }],
  },
];

// Archived / older projects, shown in their own section.
const archived = [
  {
    brand: "Toppr",
    href: "/work/toppr",
    accent: "#2BB3A3",
    year: "2019",
    month: "04/06",
    titleSegments: [{ text: "Joyful learning experiences for students" }],
  },
];

// Research entries, swap title / venue / href for your real papers.
const research = [
  {
    title: "Responsible and Resilient Design for Society, Volume 6",
    venue: "Springer",
    year: "2025",
    month: "01/05",
    href: "https://link.springer.com/book/10.1007/978-981-96-5503-8",
  },
];

// Case studies keyed by slug (/work/<slug>). The Toppr entry was drafted with
// the design-portfolio skill's structure: bracketed [...] bits are facts only
// you can fill in, listed in `todo`.
// Per-section `split` ('text' | 'split' | 'media') tunes the text/image balance
// in presentation mode; defaults to 'split' when a section has a figure, else 'text'.
// ---- Live, animatable case-study figures (hand-rebuilt from Figma frames) ----
// The raw Figma SVG export is unusable as a figure (multi-MB, text flattened to
// outlines), so each real screen is rebuilt as a compact inline SVG with real
// <text>/<rect> nodes, so individual elements can be animated. Palette sampled
// from the exported frame. Add new screens here and reference via a section's
// `fig` key.

// Away post-login home (freemium landing): personalised greeting, a single
// natural-language search, the screenshot-upload hook, and invite-only gating.
// Simple iPhone layout — the globally callable asset type for showing a single
// app screen as a rounded phone-screen figure. Any case-study section can call
// it by setting `iphone: "<screen src>"` (wired through SectionFigure), or it
// can be rendered directly. The screen PNG is expected to carry its own
// 56px-at-360 rounded corners baked in as transparent corners (see
// tools/figma-fidelity/round-screen.py), so the `.fig-screen` drop-shadow
// follows the rounded shape instead of a hard box.
function SimpleIphoneLayout({ src, alt = "" }) {
  return <img className="fig-screen" src={src} alt={alt} loading="lazy" />;
}

// Split iPhone layout — another option in the simple-iphone-layout family: two
// SEPARATE frames placed side by side inside the figure card, the first taking
// 40% of the width and the second 60%. Call it with an array,
// `iphoneSplit: ["<first src>", "<second src>"]`; a single string is accepted
// too (shown in both panes) for backward compatibility.
function SplitIphoneLayout({ src, alt = "" }) {
  const [first, second] = Array.isArray(src) ? src : [src, src];
  return (
    <div className="fig-split" role="img" aria-label={alt}>
      <span className="fig-split__pane fig-split__pane--first">
        <img className="fig-split__screen" src={first} alt="" loading="lazy" />
      </span>
      <span className="fig-split__pane fig-split__pane--second">
        <img className="fig-split__screen" src={second} alt="" loading="lazy" />
      </span>
    </div>
  );
}

// Rive layout — the third figure asset type (alongside the simple and split
// iPhone layouts): an interactive Rive (.riv) animation. Call it on a section
// with `rive: "<src>"` (and optionally `riveStateMachines` / `riveArtboard`).
// The runtime + figure live in ./RiveFigure, lazy-loaded so the WASM player only
// ships on sections that use it. RiveFigure auto-plays the default state machine.
const RiveLayout = lazy(() => import("./RiveFigure"));

// Split-flap "departure board" hero (third-party component, Tailwind + Motion).
// Lazy so Motion only loads on the case study that uses it. Customise later.
const TextFlippingBoardDemo = lazy(() => import("./components/text-flipping-board-demo"));

// Collage layout — the fourth figure asset type: a board of real exported
// images (e.g. the AI-generated, brand-true ad-image library). Call it on a
// section with `collage: ["<src>", ...]`. In the article it renders as a
// masonry board that preserves each frame's native aspect ratio; in Present
// mode it becomes a uniform grid that always fits the slide.
function Collage({ images, variant }) {
  const slide = variant === "slide";
  if (slide) {
    return (
      <div className="fig-collage fig-collage--slide" role="img">
        {images.map((src, i) => (
          <img key={i} src={src} alt="" loading="lazy" />
        ))}
      </div>
    );
  }
  // Article: explicit 3 columns (column-major) as flex items so the whole board
  // can be vertically centered (shorter columns sit centered, not top-aligned).
  const cols = [[], [], []];
  images.forEach((src, i) => cols[i % 3].push(src));
  return (
    <div className="fig-collage" role="img">
      {cols.map((col, c) => (
        <div className="fig-collage__col" key={c}>
          {col.map((src, i) => (
            <img key={i} src={src} alt="" loading="lazy" />
          ))}
        </div>
      ))}
    </div>
  );
}

// Away post-login home (freemium landing) shown through the simple iPhone
// layout. The exact Figma landing frame (node 5933:76844), a real PNG export.
function AwayLandingFigure() {
  return (
    <SimpleIphoneLayout
      src="/figures/awayLanding-screen.png"
      alt="Away post-login home: a greeting, a natural-language flight search, the screenshot-upload card, and invite-only gating."
    />
  );
}

const figures = {
  awayLanding: AwayLandingFigure,
};

// Renders a section's figure body: a live rebuilt screen (`fig`), a real
// exported image (`image`), or the gradient placeholder. Shared by the article
// and Present-mode slide views via `variant`.
function SectionFigure({
  image,
  fig,
  iphone,
  iphoneSplit,
  rive,
  riveStateMachines,
  riveArtboard,
  collage,
  cover,
  variant,
}) {
  const Fig = fig ? figures[fig] : null;
  const slide = variant === "slide";
  // Collage asset type: a section sets `collage: ["<src>", ...]`.
  if (collage) {
    return <Collage images={collage} variant={variant} />;
  }
  if (Fig) {
    return (
      <div className={slide ? "slide__media-live" : "article__figure-live"}>
        <Fig />
      </div>
    );
  }
  // Simple iPhone layout asset type: a section sets `iphone: "<screen src>"`.
  if (iphone) {
    return (
      <div className={slide ? "slide__media-live" : "article__figure-live"}>
        <SimpleIphoneLayout src={iphone} />
      </div>
    );
  }
  // Split iPhone layout asset type: a section sets `iphoneSplit: "<screen src>"`.
  if (iphoneSplit) {
    return (
      <div className={slide ? "slide__media-live" : "article__figure-live"}>
        <SplitIphoneLayout src={iphoneSplit} />
      </div>
    );
  }
  // Rive layout asset type: a section sets `rive: "<.riv src>"`.
  if (rive) {
    return (
      <div className={slide ? "slide__media-live" : "article__figure-live"}>
        <Suspense fallback={<span className="fig-rive__loading" aria-hidden />}>
          <RiveLayout src={rive} stateMachines={riveStateMachines} artboard={riveArtboard} />
        </Suspense>
      </div>
    );
  }
  if (image) {
    return (
      <img
        className={
          slide
            ? "slide__media-img slide__media-img--real"
            : "article__figure-img article__figure-img--real"
        }
        src={image}
        alt=""
        loading="lazy"
      />
    );
  }
  return slide ? (
    <div className="slide__media-img" aria-hidden>
      <span>{cover}</span>
    </div>
  ) : (
    <div className="article__figure-img" aria-hidden />
  );
}

const caseStudies = {
  toppr: {
    accent: "#2BB3A3",
    eyebrow: "Toppr · Case study",
    title: "Designing joyful learning experiences for students",
    meta: "Interaction Designer · [start – end year]",
    cover: "Toppr",
    lead:
      "Toppr is an after-school learning app used by millions of K–12 students across India. I designed [the surfaces you owned] to make daily studying feel less like a chore and more like something students return to on their own.",
    sections: [
      {
        h: "Context & problem",
        tldr: "Daily practice rarely feels worth doing; the bet was that the right interactions could make it genuinely enjoyable.",
        p: [
          "After-school learning apps win or lose on a hard truth: studying is rarely something students want to do. Toppr's bet was that the right interactions (fast feedback, visible progress, a sense of momentum) could make practice genuinely enjoyable, not just bearable.",
          "I focused on [the specific surface or flow], where students were [dropping off / losing motivation / feeling overwhelmed].",
        ],
        ul: [
          "Users: students in grades [X–Y], often on low-end devices and patchy networks across India",
          "Constraint: keep cognitive load low while exam-prep pressure runs high",
          "Success metric: [the number you set out to move, e.g. session completion, day-7 retention]",
        ],
      },
      {
        h: "My role",
        tldr: "[Your role and the flows you owned, in one line.]",
        p: [
          "[State plainly what you owned versus the team, which flows you designed end-to-end, and where you partnered with PM, engineering, and content. Recruiters scan for this first, so be specific about the decisions that were yours.]",
        ],
      },
      {
        h: "Process",
        tldr: "[The core insight and the direction you cut, in one line.]",
        p: [
          "Research & insights: I [observed / interviewed] students and studied [data] to learn how they actually study. The insights that shaped the work: [insight 1], [insight 2], [insight 3].",
          "Exploration & iteration: to make learning feel joyful I explored [streaks / micro-feedback / progress visualisation / …]. I pursued [direction A] and cut [direction B] because [reason, e.g. it added delight but slowed students down].",
        ],
        figure: "Caption: a key flow, exploration, or before/after from the work.",
        divider: true,
      },
      {
        h: "Solution",
        tldr: "[What shipped, tied back to the motivation problem.]",
        p: [
          "The shipped experience [describe the core interaction], tied directly back to the motivation problem: [how each part keeps practice rewarding and effective].",
        ],
        figure: "Caption: the final design, annotated against the problem.",
      },
      {
        h: "Impact & reflection",
        tldr: "[The headline result and one honest lesson.]",
        p: ["What shipped and what changed:"],
        ul: [
          "[Quantified result, e.g. +X% session completion, +Y% day-7 retention]",
          "[Qualitative result, e.g. student feedback or NPS]",
          "What I'd do differently: [one honest reflection]",
        ],
      },
    ],
    todo: [
      "Your exact role and the flows you owned",
      "Timeline, team, and the grades / segment served",
      "2–3 research insights and the direction you cut",
      "Real metrics for both the problem and the outcome",
      "Annotated screens to replace the figure placeholders",
    ],
  },
  "scheduled-delivery": {
    accent: "#6B21D9",
    eyebrow: "Zepto · Case study",
    title: "Bringing scheduled delivery to a 10-minute platform",
    meta: "Product Designer · Zepto · [dates]",
    cover: "Zepto",
    lead:
      "Scheduled Delivery let people order anything on Zepto for a one-hour window of their choosing, on a platform whose entire promise is 10-minute delivery. I owned the interaction design end-to-end: untangling the flows and edge cases, running two parallel directions to ground, and shipping a solution we usability-tested with 100+ people. The payoff: average order value doubled for scheduled orders (roughly ₹600 vs. ₹300 on a regular order), as high-intent users shifted from impulse buys to planning ahead.",
    sections: [
      {
        h: "Context & problem",
        tldr: "A scheduled, later-delivery option served high-intent demand that pure 10-minute delivery left on the table.",
        p: [
          "Zepto's moat is instant: groceries in ten minutes. But not every need is instant, and forcing every order to be immediate left real demand on the table. Scheduled Delivery gave users a way to order anything on Zepto for a future one-hour slot, without spending the trust that makes the platform work.",
          "Talking to users, a few high-intent personas emerged, and each reframed the feature from a nice-to-have into the reason they ordered at all.",
        ],
        ul: [
          "Commuters scheduling on the ride home so groceries arrive when they do, no second errand after reaching the door",
          "Users in geographies with patchy store coverage near home, for whom instant often wasn't serviceable",
          "Superstore shoppers buying new-category items that only stock in larger superstores, which close overnight, making a late-night order impossible without scheduling",
        ],
      },
      {
        h: "My role",
        tldr: "I owned the end-to-end interaction design, working across product and operations.",
        p: [
          "I led the interaction design end-to-end. There was an existing pitch when I picked up the problem, but it didn't feel right; it didn't account for the real spread of cases. The bulk of my work was mapping every flow and edge case, running the design exploration (including a full parallel direction), and partnering with product and operations to keep the design honest against supply-chain reality. [Add the team you worked with and the timeline.]",
        ],
      },
      {
        h: "The constraints we designed around",
        tldr: "One-hour slots, peak-time fulfilment, and an ironclad delivery-window promise shaped every decision.",
        p: [
          "Scheduled delivery sits on top of a live logistics system, so the design had to respect hard limits rather than wish them away:",
        ],
        ul: [
          "Slots could only be one hour wide, and early on, slot availability itself was unreliable",
          "Demand had to balance: pre-booked orders still had to be fulfilled through peak windows while live 10-minute demand kept flowing",
          "Trust was non-negotiable, a 6–7pm promise had to be a 6–7pm delivery every time, so promised windows were tied back to what operations could actually guarantee",
        ],
      },
      {
        h: "Process: two directions, tested to ground",
        tldr: "I ran a step-by-step flow against a single-page listing; testing with 100+ users killed the tidier one.",
        p: [
          "The hard part wasn't the happy path; it was the cart. Zepto splits a cart into multiple shipments when constraints require it, and scheduling lives at the shipment level, so one order might need a separate schedule for each delivery. I had to make that legible.",
          "I ran two directions in parallel to cover our bases. One was a progressive-disclosure flow, schedule one shipment at a time, step by step, the tidier design on paper. The other kept every shipment on a single listing page, switchable in place between instant and scheduled. The constructs were nearly identical; the UX was not.",
          "The difference only surfaced in testing. Across usability sessions with 100+ users, the step-by-step flow read as slow and hard to hold in your head; people lost track of which shipment they were on. So I killed the more elegant progressive flow and went back to the single-page listing, then optimised it until the density felt effortless. Letting the test result override the prettier design was the call that made the feature usable.",
        ],
        split: "media",
        figure: "Caption: the two explored directions: progressive disclosure vs. single-page listing. [Share screens.]",
        divider: true,
      },
      {
        h: "The details that made it work",
        tldr: "Default-expanded shipments, a continuous cross-day slot scroll, restrained go-to-market, and considered empty states.",
        p: [
          "A flexible page is easy to make overwhelming. Most of the craft went into the opposite, making a dense, stateful page feel obvious:",
        ],
        ul: [
          "The shipment you arrived from expands by default, with the others still in reach, context is never lost",
          "Per shipment, a clear instant-vs-scheduled toggle, then an in-line slot picker",
          "A continuous slot scroll that bridges days: a 10pm shopper sees tonight's 11–12 slot and tomorrow's together, with no jarring page jump, because for a night owl, late tonight and early tomorrow are the same day",
          "Non-intrusive go-to-market, surfaced only where it helps (a homepage prompt when demand is high and the cart isn't serviceable; the primary entry on the cart) rather than pushed everywhere",
          "Considered empty and exit states, what to save when someone leaves mid-flow, how each shipment's status reads at a glance, plus an OTP screen tuned for a scheduled order",
        ],
      },
      {
        h: "Impact",
        tldr: "Average order value doubled for scheduled orders, and predictable timing unlocked batching that cut last-mile cost.",
        p: [
          "We usability-tested with 100+ users before and after launch. The behavioural shift was the real story: because the order is for later, people plan, they build a bigger, more deliberate cart.",
        ],
        ul: [
          "Average order value doubled for scheduled orders, roughly ₹600+ versus ₹300 on a regular order",
          "Adoption launched at roughly 2.8% of orders and has settled around 2.1% across dark-store and superstore models",
          "More predictable order times let operations batch scheduled orders with live ones, cutting last-mile cost",
        ],
      },
      {
        h: "Reflection",
        tldr: "The real challenge was perception: keeping a scheduled option from diluting the instant promise.",
        p: [
          "The subtlest problem wasn't UX at all; it was perception. Zepto means instant; a scheduled option can feel counter to the whole brand. The answer was restraint: surface it only when it genuinely serves the user, and never let it dilute the 10-minute promise.",
          "What I'd revisit: we shipped with one-hour slots and no order editing, deliberate trade-offs to launch, not ideals. Editing came later; finer-grained slots never did. And the hardest state (a cart that stays unserviceable even with a schedule, because of a live supply-chain gap) took months of UX-and-ops work to tame. Next time I'd design for that failure state first, not last.",
          "Should the platform drop 10-minute delivery? I don't think so; instant is the moat, and without it Zepto becomes just another scheduled marketplace. But this work proved there's a real, high-value segment whose need is the opposite of instant, and meeting it quietly made the core product stronger.",
        ],
      },
    ],
    todo: [
      "Timeline and the team you partnered with (PM, eng, ops)",
      "Design-exploration screens, both directions, and the final flow",
      "Later wins worth noting (e.g. editing order times after launch)",
    ],
  },
  zepiris: {
    accent: "#4F46E5",
    eyebrow: "Zepto · ZepIris · Case study",
    title: "Reimagining scalable face authentication at Zepto",
    meta: "Product Designer · Zepto · 2 months",
    cover: "ZepIris",
    lead:
      "ZepIris (internally OdinEye, after Odin's all-seeing eye) is Zepto's in-house face-authentication system, now open-sourced. It clocks in riders, pickers, and packers and onboards new hires across every kind of Zepto site: personal phones in dark stores, shared tablets at the largest warehouses, and a web review portal. I led the design end-to-end across all three. It reached 100% coverage of Zepto's hubs and unlocked up to ₹50L/month in savings by replacing an expensive third-party vendor.",
    sections: [
      {
        h: "Context & problem",
        tldr: "Attendance ran on gameable check-ins and a costly vendor; the brief was an in-house, scalable, cheaper face-auth system.",
        p: [
          "Attendance at Zepto used to run on paper registers and app check-ins, easy to game with proxy punches. Face authentication fixes that, but the vendor Zepto relied on (Hyperverge) was neither cheap nor scalable; at Zepto's volume, every order quietly carried a slice of that cost.",
          "The brief was deceptively hard: build an in-house face-auth experience that's accurate, compliant, and cheaper at scale, and that holds up in the worst conditions, on the worst hardware, for users who have ten seconds to spare.",
        ],
        ul: [
          "Users: delivery riders, warehouse pickers and packers, and new-hire onboarding",
          "Conditions: low-end budget phones, low-light warehouses, patchy networks, and a rush of people at every shift change",
          "Goal: cut cost-per-order by dropping the vendor, without lowering verification completion or compliance",
        ],
      },
      {
        h: "My role",
        tldr: "I led the design end-to-end across phone, shared tablet, and web in a two-month build.",
        p: [
          "I led the design end-to-end, partnering with data science (the face-matching and liveness models), front-end and back-end engineering, and product. The surface was unusually wide, a phone design, a shared-tablet design, and a web portal, so much of the work was holding one coherent identity system across three form factors and three very different user contexts.",
          "It was a two-month build. The first month was mostly collaboration, planning, and design; I shipped a first end-to-end design within a week so engineering wasn't blocked, then kept refining and scaling it for new use cases as it rolled out.",
        ],
      },
      {
        h: "Two problems wearing one face",
        tldr: "A personal phone is a 1:1 match; a shared Mother Hub tablet is a 1:N search, so each needed its own flow.",
        p: [
          "The realisation that shaped everything: verifying a face is not one problem. On a personal phone in a dark store it's 1:1, one known person matching their own live selfie against their registered photo. At a Mother Hub it's 1:N, a shared tablet identifying someone out of the entire workforce, with no phone and no ID, while a queue forms behind them at shift change.",
          "Those demand different flows. The phone flow optimises for a single confident match; the tablet flow optimises for speed and resetting between people so the line keeps moving. The web portal is for reviewers, not capture. I designed each for its own context instead of forcing one compromise flow onto all three.",
        ],
        split: "media",
        image: "/zepiris-contexts.png",
        figure: "Two contexts, two flows: riders and DH verify 1:1 on their own phone; a Mother Hub identifies 1:N from a single shared tablet.",
        divider: true,
      },
      {
        h: "One camera, every condition",
        tldr: "One camera screen had to flex across an outdoor rider check and a low-light packer capture, with shared validation.",
        p: [
          "On mobile, two pieces had to scale hard: an intro screen that primes the user before the camera opens, and the camera screen itself, which carries far more than it looks. The same screen serves a rider's anti-impersonation check (capture your face so a teammate can't run your shift and pocket your pay) and a packer's onboarding capture, among others.",
          "Context changed the design more than the flow did. Riders work out in the open, bright, variable, unpredictable light; packers at a delivery hub are in relatively low light. A capture screen tuned for one fails the other, so I designed the camera to hold up across those environments, while keeping the post-capture validation states common across the board for consistency.",
        ],
        split: "media",
        image: "/zepiris-capture.png",
        figure: "The capture viewport, a face-placement ring coaches framing before a frame is ever sent.",
        divider: true,
      },
      {
        h: "Designing the capture, not just the model",
        tldr: "Real-time on-device framing guidance turned a failing capture step into a reliable one.",
        p: [
          "Capture was a design problem, not only a model one. Early on, people held the phone too close or shot off-angle and capture quietly failed. I added real-time, on-device framing guidance (face centred, both eyes open, not too close) so the screen coaches a good capture and rejects a bad one before it's ever sent. That single change significantly lifted capture success rates.",
          "Retry stays instant and judgment-free: a blurry frame just asks for another. No OTPs, no typing, just a selfie, making the right capture the path of least resistance.",
        ],
        image: "/zepiris-stack.png",
        figure: "Every validated capture becomes a 512-d ArcFace vector, matched by ANN search and wrapped in an auditable portal.",
      },
      {
        h: "Protecting the people behind the portal",
        tldr: "Nudity, blur, and spoof classifiers stop bad submissions before a human reviewer ever sees them.",
        p: [
          "Real-world capture is messy in ways a studio never is. During onboarding, people occasionally submitted photos while not fully dressed, which would then land in front of a human reviewer. So the system screens for nudity (alongside blur and spoof checks) and stops those submissions before they reach the review portal, protecting reviewers and keeping the dataset clean. Designing for who sees the failure, not just the user who causes it, became a recurring theme.",
        ],
        image: "/zepiris-classifiers.png",
        figure: "Spoof, blur, and nudity classifiers screen every submission before it reaches a human reviewer, plus an auditable matching portal.",
      },
      {
        h: "The trade-off: how strict is strict enough",
        tldr: "Match thresholds trade friction against security, so verification became configurable per workflow.",
        p: [
          "Every face-match rides on a threshold, and it's a real design tension: too strict and honest people get rejected and re-try in the cold; too loose and security slips. Attendance, onboarding, and audits don't want the same answer. So instead of one global setting, verification became configurable per workflow, each context tuned to its own balance of friction and risk. [My take on where I landed, and why (to detail).]",
        ],
      },
      {
        h: "Outcomes",
        tldr: "100% hub coverage, up to ₹50L a month in potential savings, and an open-source release.",
        p: [
          "Shipped as the default verification layer across all of Zepto's hubs, and open-sourced as ZepIris, recognised publicly by Zepto's co-founder, CTO, and data-science team.",
        ],
        ul: [
          "Coverage across Mother Hubs & Delivery Hubs: partial → 100%",
          "Monthly cost-saving potential: 0 → ₹50L as the system scales and optimises",
          "Realised monthly savings: 0 → ₹10–20L",
          "Cost-per-order: down, by reducing third-party (Hyperverge) dependency",
          "Adoption: 100%, treated by teams as a fundamental need finally solved",
        ],
      },
      {
        h: "Reflection",
        tldr: "The hard part was making one identity layer feel native across three very different contexts, cheaply, at scale.",
        p: [
          "The hard part of a system like this was never the camera screen. It was making one identity layer feel native to a rider on their own phone, a hub worker on a shared tablet, and a reviewer at a desk, in low light, on weak networks, cheaply enough to beat a vendor at Zepto's scale.",
          "[What I'd do differently next time (to add).]",
        ],
      },
    ],
    todo: [
      "Confirm your exact title for the project",
      "Your take on the threshold trade-off, where you landed and why",
      "Anything you'd do differently, for the reflection",
    ],
  },
  jarvis: {
    accent: "#DB2777",
    eyebrow: "Zepto · Jarvis · Case study",
    title: "Revamping the ads platform",
    meta: "Product Designer · Zepto · 2026",
    cover: "Jarvis",
    lead:
      "Jarvis is Zepto's ads platform, where brands build and manage campaigns. I led and contributed to a multi-part revamp focused on advertiser clarity, control, and monetisation depth, while laying scalable foundations for new formats. The redesigned creation and recommendation experience launched to roughly ₹60L a month in incremental ad revenue in its first month, recommendation adoption reached about 30%, and new campaign frameworks added more on top. Brand teams at HUL and P&G called out the clarity gains.",
    sections: [
      {
        h: "Context & problem",
        tldr: "Brands struggled to map intent to the right ad format, and monetisable inventory was limited; the revamp had to fix both.",
        p: [
          "Zepto Ads is how brands reach shoppers, but the old platform made buying hard. Advertisers struggled to map what they wanted to the right campaign type, pricing was opaque, and previews were thin, so even large brands set up campaigns with low confidence. At the same time, the platform left money on the table: monetisable inventory was limited and the levers advertisers could pull were blunt.",
          "The brief had two halves: make campaign creation clear and trustworthy, and deepen monetisation, without breaking the mental models advertisers already relied on.",
        ],
        ul: [
          "Users: brands and their agencies (including teams at HUL and P&G), plus internal ads, search, and analytics partners",
          "Goal: lift advertiser clarity and control while expanding what, where, and how much they could buy",
          "Constraint: build on a live, revenue-generating platform without disrupting existing flows",
        ],
      },
      {
        h: "My role",
        tldr: "I led and contributed across the revamp: pre-creation, recommendations, review, and the new spend frameworks.",
        p: [
          "I led and contributed to a multi-part revamp across the advertiser-facing platform (Jarvis) and the consumer ad surfaces. That spanned the pre-creation redesign, an ad recommendations system, a campaign review surface, and new advertiser frameworks (Ad Multiplier, Day-Parting, and PCA expansion). It meant working across Ads, Search, Design, Tech, and Analytics, and holding one coherent system as formats multiplied. [Add your specific lead-versus-contribute split and the timeline.]",
        ],
      },
      {
        h: "Mapping intent to the right format",
        tldr: "A clear hierarchy of campaign types, pricing, and previews lets brands match what they want to how it is bought.",
        p: [
          "The core of the creation revamp was helping a brand answer one question: which format do I actually want? I redesigned the pre-creation experience around a clear hierarchy of campaign types and sub-types, each with its pricing model and a real preview, so intent maps cleanly to format before any money is committed.",
          "Reducing that friction, understanding types, pricing, and what an ad will look like, is what brand teams at HUL and P&G singled out as the biggest clarity gain.",
        ],
        split: "media",
        figure: "Caption: the pre-creation flow, campaign types with their pricing and previews. [Figma: Ads Revamp.]",
        divider: true,
      },
      {
        h: "Recommendations and a smarter review",
        tldr: "The platform suggests campaigns from past performance and brand fit, then reviews a draft with predicted performance.",
        p: [
          "Clarity is not only about layout; it is about guidance. I built Ad Recommendations across the pre-creation and elevate flows, surfacing campaigns based on a brand's past performance and fit rather than leaving them to start from a blank slate.",
          "I also introduced a Campaign Review surface that shows predicted performance and AI-led suggestions to improve a draft before it goes live, turning the last step from a rubber-stamp into a moment of confidence.",
        ],
        figure: "Caption: ad recommendations, and the campaign review surface with predicted performance. [Figma: Ad Elevate.]",
      },
      {
        h: "A brand-true image library, built with AI",
        tldr: "Ad creatives kept bottlenecking on stock and one-off shoots, so I built an AI-generated image library, kept on-brand with Figma Weave, that gives every campaign type a ready, consistent look.",
        p: [
          "Strong creative is half of a strong ad, and it was the slow half. Every new campaign type needed hero and lifestyle imagery, and leaning on stock or one-off shoots meant uneven quality and a long lead time before a format could even be previewed. I built a product image library generated with AI, so every campaign type had a ready set of on-brand visuals to pull from.",
          "The risk with AI imagery is drift, where it quietly stops looking like you. I used Figma Weave to keep the library tied to Zepto's brand, generating against our palette, mood, and composition rules so each frame reads as Zepto rather than as generic AI stock. The library plugs straight into the pre-creation previews, so a brand sees a polished, on-brand ad the moment it picks a format.",
        ],
        split: "media",
        collage: [
          "/figures/jarvis/grocery-bag-sky.jpg",
          "/figures/jarvis/rider-bloom.jpg",
          "/figures/jarvis/marigold-night.jpg",
          "/figures/jarvis/market-street.jpg",
          "/figures/jarvis/harvest-still-life.jpg",
          "/figures/jarvis/shopper-stroll.jpg",
        ],
        figure: "A slice of the AI-generated image library. Each frame was produced and kept on-brand with Figma Weave.",
        divider: true,
      },
      {
        h: "New levers: where, when, and how much",
        tldr: "Ad Multiplier, Day-Parting, and PCA expansion let advertisers combine screen, time, and spend in one strategy.",
        p: [
          "Beyond creation, the revamp gave advertisers sharper levers. I defined the Ad Multiplier and Day-Parting frameworks, letting brands selectively amplify spend across specific screens, moments, and time windows in the user journey. In parallel, I contributed to launching new ad widgets on Pre-search product carousel ads (PCA), expanding monetisable inventory at a high-intent discovery stage.",
          "Together these let an advertiser combine three decisions in a single strategy: where (the screen), when (day-parting), and how much (the multiplier).",
        ],
        split: "media",
        figure: "Caption: the where, when, and how-much levers, and the expanded PCA widgets. [Figma: PLA and Map Pin.]",
        divider: true,
      },
      {
        h: "Shipping into a live system",
        tldr: "Since the PCA layout could not change at once, a phased transition added new widgets without breaking mental models.",
        p: [
          "The hardest part was not the new screens; it was landing them in a live, revenue-generating system. The existing PCA layout could not be changed immediately, so rather than force a rebuild, I designed a phased layout transition that introduced new widgets gradually, without disrupting the mental models that users and advertisers already depended on.",
          "That meant tight coordination across Ads, Search, Tech, and Analytics, and designing for the in-between states, not just the end state.",
        ],
      },
      {
        h: "Impact",
        tldr: "Roughly ₹60L a month in incremental revenue in month one, about 30% recommendation adoption, and new inventory adding more on top.",
        p: [
          "The revamp launched and showed business impact quickly, while raising the quality and usability of the whole ads creation experience:",
        ],
        ul: [
          "Incremental ad revenue from the revamp: 0 to roughly ₹60L a month in the first month",
          "Recommendation adoption: 0 to about 30%",
          "New PCA inventory: 0 to around ₹2Cr a month",
          "Ad Multiplier and Day-Parting: 0 to around ₹80L a month",
          "Strong qualitative validation from brand teams at HUL and P&G on clarity and confidence",
        ],
      },
      {
        h: "Reflection",
        tldr: "The work continues: restructuring creation flows for system-level consistency as formats keep multiplying.",
        p: [
          "An ads platform is never finished; it grows a new format every quarter. The ongoing work is to restructure the creation flows so the system holds together as formats multiply, the same coherence problem one level up. [What I'd do differently next time, to add.]",
        ],
      },
    ],
    todo: [
      "Your exact lead-versus-contribute split per workstream, and the timeline",
      "Confirm the revenue figures and whether they are additive",
      "Any usability-testing moment that changed the design (before to after)",
      "Screens from the four Figma files (Ads Revamp, Ad Elevate, Map Pin, PLA)",
      "A line for what you'd do differently",
    ],
  },
  dassh: {
    accent: "#EA580C",
    eyebrow: "Dassh · Case study",
    title: "Building a B2B SaaS from the ground up",
    meta: "Design consultant & Director · Dassh · 2025",
    cover: "Dassh",
    lead:
      "Dassh builds Stella, an AI recruiter that does the execution work of hiring: screening CVs, calling and messaging candidates, running first-round interviews, and keeping the ATS up to date, so the people stay free for judgement. I joined as a design consultant and a director to build the product from zero, the four experiences it ships as, the system that lets anyone create an AI hiring agent, and the design system that turned Figma files into production code. Stella now runs live hiring for enterprises like Zydus Lifesciences, Increff, Cholamandalam and Atomberg, and the work helped the company stand up a design team and raise funding. [Confirm the funding stage and the single hard metric to lead with.]",
    sections: [
      {
        h: "Context & problem",
        tldr: "Most of recruiting is not judgement, it is execution, and the execution load is what breaks hiring.",
        p: [
          "Sit with any recruiter and the same pattern shows up. A role gets posted and within a day or two the inbox is buried. At Zydus Lifesciences, one posting pulled a flood of CVs across multiple roles within one to two days. At Increff, a tech hiring push brought in more than 3,000 resumes in a single week. The people meant to evaluate that talent were instead drowning in the mechanics of moving it: screening, ranking, chasing candidates for availability, scheduling, taking notes, updating the ATS.",
          "We framed the problem as a split. About 70 percent of recruiting is execution, the repeatable work of screening, calling, scheduling and record-keeping. The other 30 percent, the final interview, the contextual read, the actual hiring decision, is where human judgement earns its keep. The trouble is that the execution load is so heavy it crowds the judgement out. Recruiters become bottlenecks, panels go unavailable, good candidates go cold, and interview-to-offer conversion suffers.",
        ],
        ul: [
          "Zydus: a large CV inflow within one to two days of posting, decentralised hiring, and an ATS talent pool sitting underused",
          "Increff: 3,000+ resumes in a week, HRs stretched across non-recruiting work, panel unavailability dragging timelines, weak interview-to-offer conversion",
          "What we set out to move: the time from posting to a shortlisted, engaged, interviewed candidate, without adding recruiter headcount",
        ],
      },
      {
        h: "My role",
        tldr: "Design consultant and director: I owned product design from zero and helped turn pilots into a company.",
        p: [
          "I came in as a design consultant and a director, which was two jobs at once. The hands-on one was owning product design end to end. There was no product yet, so I defined the information model, the four experiences Dassh ships as, the agent-creation system, the daily report, and the design system underneath all of it. The director one was helping shape the company around the product: working with the founder on positioning, contributing to the deck and fundraising conversations, and helping bring on and set up the design team.",
          "I partnered daily with the founder, product, and a small engineering team. With a team this small and a surface this broad, the constraint was never ideas, it was throughput: how to design four distinct experiences and ship them with two or three engineers. That constraint shaped almost every decision that follows, including the design system that ended up writing its own code.",
        ],
      },
      {
        h: "The bet: an AI employee, not another tool",
        tldr: "We deliberately rejected building one more recruiting dashboard and designed Stella as a teammate you hire, not a tool you operate.",
        p: [
          "The obvious version of this product is a dashboard with AI features bolted on, a smarter ATS. We killed that direction early. The market is full of tools that give recruiters more buttons to push, and more buttons is the opposite of the problem. The execution load does not drop when you add a feature, it drops when someone else does the work.",
          "So we framed Stella as an AI employee, not an automation tool. You do not configure Stella so much as brief her, the way you brief a new hire: tell her the role, hand her the criteria, point her at the candidates. She works continuously, goes live in about a day or two, runs several roles at once, and evaluates every candidate the same way. The framing was not a tagline, it set the design bar. Every screen had to read like working with a capable colleague, not operating software. Where a normal SaaS would show a settings panel, we showed a conversation.",
        ],
        split: "media",
        figure:
          "Caption: Stella as a teammate, the conversational entry point where a hiring manager briefs a role instead of filling out a form. [Add screens.]",
        divider: true,
      },
      {
        h: "Designing for four people, not one",
        tldr: "The same hiring data, surfaced as four purpose-built experiences, because a founder, an agency recruiter, a manager and a candidate do not want the same product.",
        p: [
          "Hiring is not one user. The founder who wants to ask a question, the agency recruiter living in the product eight hours a day, the manager checking in between meetings, and the candidate on the other end all think differently. Rather than ship one interface and water it down for everyone, I designed four, all reading from the same underlying data and all anchored to the same atomic unit, the job.",
          "Stella is the chat-first experience: full screen, almost no chrome, the conversation is the interface. The agency view is the dense power-user surface: tables, filters, kanban, bulk actions, built for speed. The manager view is summary-first, the system writes the first thing you see, with green, amber and red health signals so a glance is enough. The candidate experience is a light portal plus the messages, calls and interviews the agents run, designed to feel like texting a helpful person rather than navigating a portal.",
        ],
        split: "media",
        figure:
          "Caption: one data model, four experiences, chat, agency SaaS, manager smart-view and candidate portal, each tuned to how that person works. [Add screens.]",
        divider: true,
      },
      {
        h: "Making an AI agent anyone can create",
        tldr: "One four-step creation flow that turns hiring intent into a working agent, with smart defaults for the unprepared and full control for power users.",
        p: [
          "Under the four experiences sits a system of purpose-built agents, screening, calling, interview, scheduling, messaging, note-taking, each owning one step of the pipeline. The hard design problem was creation: how does a recruiter turn what they want into a working agent without learning a new vocabulary?",
          "I designed creation as one consistent four-step flow, the same spine for every agent type: link it to a job, define what it should evaluate, give it candidates, set what happens next. The evaluation step became the heart of it, a checklist where each criterion is tagged Essential, Valuable or Not preferred, so the recruiter's priorities are legible to both the AI and any human reviewer. Because people arrive with different levels of preparation, every step supports multiple paths: pick a template, generate one with AI from the job description, or upload your own. Opinionated defaults for the unprepared, full control for the power user.",
        ],
        split: "media",
        figure:
          "Caption: the agent-creation checklist, criteria tagged Essential, Valuable or Not preferred, generated by AI and editable by hand. [Add screens.]",
        divider: true,
      },
      {
        h: "What the pilots changed",
        tldr: "Running real roles for real enterprises changed the product more than any internal debate.",
        p: [
          "The strongest input was never a design review, it was watching Stella run live roles at Zydus and Increff. Putting an AI recruiter in front of real candidates and real recruiters surfaced things no mockup would.",
          "[Document the specific changes here: one or two concrete before / insight / after moments from the pilots. For example, a screening criterion that behaved differently in practice, a call script candidates reacted badly to, or a report hiring managers ignored until it was reformatted. This is the highest-value part of the story, so give it the real research findings and the success metrics that came out of them, each with its baseline.]",
        ],
        divider: true,
      },
      {
        h: "The homepage is a daily report",
        tldr: "Instead of a dashboard you have to read, the homepage is a generated briefing: what is broken, what needs you, what happened.",
        p: [
          "Most hiring software opens to a dashboard and leaves you to do the reading. I designed the Dassh homepage as a generated report instead, different every time because it reflects what actually changed since you were last there. It answers three questions in order of urgency: what is broken, a stalled pipeline or a failing agent, comes first; what needs you, the decisions only a human can make, like approving a shortlist, comes next; and what happened, the momentum, comes last.",
          "The same report adapts to the reader. The agency recruiter gets it dense and numbers-forward. The manager gets it as a short written narrative with health cards. In chat, Stella simply tells you, and can act on it in the same breath. It reaches people where they already are, in the app, as a morning email, and as a WhatsApp message from Stella.",
        ],
        split: "media",
        figure:
          "Caption: the homepage as a briefing, broken first, decisions second, momentum last, regenerated since your last visit. [Add screens.]",
        divider: true,
      },
      {
        h: "A design system that wrote its own code",
        tldr: "To ship four experiences with a tiny team, I built a design system wired to an engine that turned approved Figma frames into production React.",
        p: [
          "Four experiences and a handful of engineers do not add up unless design output stops being the bottleneck. So the most unusual piece of this project was infrastructure: a design system connected to an engine that converts Figma straight into production code. When I marked a component Ready for Dev in Figma, the engine picked it up, generated the React and CSS, compared the result against the design with a visual diff scored out of 100, and dropped it into Slack. The engineer polished the last few percent and wired up the logic.",
          "This changed what one designer could be worth. The quality of the generated code was a direct function of design hygiene, clean frame names, real component descriptions, tokens instead of hardcoded values, so the design system was not decoration, it was the contract that made the pipeline work. It is the clearest example of the project's core constraint, breadth on a small team, turned into a design decision.",
        ],
        split: "media",
        figure:
          "Caption: the Figma-to-code pipeline, mark Ready for Dev, the engine generates React, scores a visual diff out of 100, and notifies the team. [Add a diagram or the Slack score artifact.]",
        divider: true,
      },
      {
        h: "From pilots to a company",
        tldr: "The product was also the pitch: real enterprise pilots became the evidence that built a team and raised a round.",
        p: [
          "Because I was a director as much as a designer, the product and the company were the same work. The enterprise pilots were not just customers, they were proof. Zydus moved to real-time shortlisting, engagement and first-round interviews within two days of a posting, with the AI working inside their existing ATS, which helped them centralise hiring and stand up a global capability centre. Increff put Stella against that 3,000-resume week and got instant screening, stack-ranked candidates, and automated outreach over WhatsApp and AI calls.",
          "Those stories did the convincing. They anchored the deck, the one-pagers and the fundraising conversations, and the named logos, Zydus, Increff, Cholamandalam, HCPL, Atomberg, Tophire, became the credibility the company raised on. Alongside that, I helped bring on and set up the design team so the product could outlive any one contributor. [Add the funding stage and amount, the size of the team you built, and the timeline.]",
        ],
        divider: true,
      },
      {
        h: "Outcomes & reflection",
        tldr: "Live with named enterprises, faster and more consistent hiring on a tiny team, and one honest thing I would do differently.",
        p: [
          "Stella went from an idea to a product running live hiring for enterprises across pharma, retail, manufacturing and insurance. The honest headline is concrete even where it is qualitative: shortlisting, engagement and first-round interviews compressed from weeks to about two days, thousands of resumes handled without adding recruiters, and evaluation made consistent across recruiters and locations, all inside the customer's existing ATS.",
        ],
        ul: [
          "Live enterprise pilots: Zydus Lifesciences, Increff, Cholamandalam, HCPL, Atomberg, Tophire",
          "Zydus: posting to shortlisted, engaged and first-round-interviewed in about two days, versus a previously decentralised, multi-week process",
          "Increff: 3,000+ resumes in a week screened and stack-ranked, with automated candidate engagement",
          "[Add the hard numbers from your research: time-to-hire reduction, cost saving, conversion lift, and the funding raised]",
        ],
      },
      {
        h: "What I would revisit",
        tldr: "Shipping four experiences at once was the right strategic bet, but it stretched a tiny team thin.",
        p: [
          "Four experiences in parallel was the right call for the pitch and the wrong call for depth. Some surfaces went deep while others stayed shallow longer than I would have liked. If I did it again I would sequence the four more ruthlessly: take one experience, almost certainly Stella, all the way to excellent and let it pull the others, rather than advancing all four at once.",
          "Wearing both hats taught me the same lesson from the company side. Being the designer and a director at once meant I sometimes optimised for the pitch when I should have optimised for the product. Knowing which hat to wear, and when, is the part of this I am still sharpening.",
        ],
      },
    ],
    todo: [
      "Funding: stage, amount and timeline of the round the work supported",
      "Hard metrics with baselines: time-to-hire reduction, cost saving, interview-to-offer lift",
      "Two or three concrete pilot-driven design changes (before, insight, after) for 'What the pilots changed'",
      "Team: size and roles of the design team you helped build, and your exact tenure dates",
      "Real screens or a Figma link for the figures (Stella chat, agent creation, candidate ranking, daily report, the Figma-to-code pipeline)",
      "Confirm the client names are cleared to show publicly (Zydus, Increff, Cholamandalam, HCPL, Atomberg, Tophire)",
    ],
  },
  away: {
    accent: "#0891B2",
    eyebrow: "Away · Case study",
    title: "Letting people negotiate their flight, not just book it",
    meta: "Founding Designer · Away · 5 months",
    cover: "Away",
    // hero flip-board messages (overrides the default of [title]); cycles every 6s
    board: ["AWAY", "NEGOTIATE \nYOUR FLIGHTS", "NOT JUST SEARCH \nNEGOTIATE"],
    lead:
      "Away is a flight-booking app for India built on a contrarian bet: that people would rather negotiate a flight than just search and book one. Instead of scrolling a wall of near-identical fares, you pick up to three flights, tap Negotiate, and a negotiation plays out to find you a better price, while the app surfaces fares the big travel sites keep buried behind confusing names. I was the sole designer on a four-person team, defining the end-to-end experience. Early numbers back the bet: about a third of users negotiate instead of booking the listed price, across roughly 1,000 users and 200 bookings so far.",
    sections: [
      {
        h: "Context & problem",
        tldr: "Booking a flight is a search problem with a broken fare layer: limited, confusingly named options and a price you can only accept or walk away from.",
        p: [
          "Booking a flight today is a search exercise. You compare a grid of near-identical results, then take the price on the screen or leave. The fare layer underneath makes it worse: the big online travel sites (OTAs) show a fixed, limited set of fares with names that tell you nothing about what you are actually buying, and the cheaper or more useful fares often never surface at all.",
          "For India's price-sensitive travellers, that is a real gap. The market is enormous, and almost everyone is competing on the same search experience. We wanted to change the behaviour itself, not build a slightly better search box.",
        ],
        ul: [
          "Fares on OTAs are named confusingly, so people can't tell what a fare actually includes",
          "The cheapest and most relevant fares are often hidden behind a thin default set",
          "Travellers have no leverage on price: the listed number is the only number",
          "Business: a huge, fast-growing India travel market, but everyone competes on the same search experience",
        ],
      },
      {
        h: "My role",
        tldr: "Sole designer on a four-person team; I owned the end-to-end experience, from the core concept to the booking flow.",
        p: [
          "I was the only designer on the team: one product lead, two engineers, and me. An operations partner with deep airline and fare knowledge advised us, which mattered in a domain this full of hidden rules, even though he sat outside the day-to-day execution.",
          "My remit was the whole experience, not a set of screens. I defined how negotiation should feel as a behaviour, designed the fare model users see, and owned the app end to end, from listing to booking. With a team this small, design and product decisions were tightly shared, and I made the call on most of the experience direction.",
        ],
      },
      {
        h: "The bet: negotiate, don't just search",
        tldr: "We bet people would negotiate a flight if it took one tap, which makes Away a different product than a search engine.",
        p: [
          "The core idea is a behaviour change: instead of accepting a listed price, you negotiate it. On the listings page there is a Negotiate button. You select up to three flights you would be happy with, start the negotiation, and it plays out to find you a better price than the one on the screen.",
          "This is the line that separates Away from a flight search aggregator. Search engines stop at finding you a flight, and some don't even let you book. Away turns the listing into the start of a negotiation, then lets you book right there. The hard design problem was making a behaviour nobody has done before feel obvious and trustworthy on the very first try.",
        ],
        split: "media",
        // two separate frames, first at 40% width and second at 60% (see
        // SplitIphoneLayout). Stand-in assets for now: swap in the two real
        // frames for this section (the Negotiate entry point + select-flights step).
        iphoneSplit: ["/figures/awayLanding-screen.png", "/figures/awayLanding-screen.png"],
        figure:
          "Caption: the Negotiate entry point on the listings page and the select-up-to-three-flights step. [Add screens.]",
        divider: true,
      },
      {
        h: "Designing the negotiation",
        tldr: "An unfamiliar action had to feel obvious: tap Negotiate, pick up to three flights (and up to three return flights on a round trip), then watch the negotiation play out.",
        p: [
          "A new behaviour gets one chance to make sense. When you tap Negotiate, you pick up to three flights you would be happy to fly, and on a round trip you pick up to three return flights too, then you begin. I designed each step to explain itself: what the selection means, why it is capped at three, and what is happening while the negotiation runs. The cap keeps the choice light and gives the negotiation room to work across a few options instead of betting everything on one.",
          "Behind that one tap, Away fans out across hundreds of fares from a wide network of suppliers and consolidators, the bulk and agency rates that sit below the public price, and works the flights you chose down to the best deal it can find. The result comes back as a side-by-side across those flights: the original price struck through, the negotiated price beside it, and exactly how much you saved.",
        ],
        split: "media",
        // Rive animation (plain timeline, no state machine in this file).
        rive: "/figures/away-landing.riv",
        figure:
          "Caption: the negotiated result, each selected flight with its original price struck through and the new price beside it. [Add screens.]",
        divider: true,
      },
      {
        h: "Designing the wait",
        tldr: "A real negotiation takes a couple of minutes, so I turned the wait into a live timeline that shows the work happening, instead of a spinner that feels broken.",
        p: [
          "Negotiating across hundreds of supplier fares is not instant; it takes a couple of minutes. A blank spinner for that long reads as broken, and worse, it hides the very work that justifies the wait. So I designed the wait itself: a live progress timeline that narrates what is happening, scanning supplier inventory, cross-referencing fares, negotiating bulk rates, built from the user's own flights, airlines and routes and updated in real time as the backend reports in.",
          "This leans on the labour-illusion principle: when people can see the effort being spent on their behalf, they trust the result more and value it more than a price that simply appears. The timeline turns dead waiting time into the most reassuring part of the flow, and sets up the savings reveal at the end.",
        ],
        split: "media",
        figure:
          "Caption: the negotiation in progress, a live timeline narrating each step against the user's real flights. [Add screens.]",
        divider: true,
      },
      {
        h: "Making fares honest",
        tldr: "Instead of cryptic fare codes, fares are sorted into five plain-named buckets, each named for the reason you would pick it, from Non-Refundable to Max Baggage.",
        p: [
          "Underneath the negotiation sat a second fix. The OTAs bury choice in a thin, confusingly named set of fares. We surfaced the full range, including fares those sites don't show, and sorted them into five plain-named buckets, each named for the reason you would pick it: Non-Refundable for the biggest saving, No Check-in Bag for cabin-only travellers, Most Balanced for everyday value, Low Cancellation for plans that might change, and Max Baggage for when you are carrying more.",
          "The design job was to make those differences legible at a glance, so a traveller can see the trade-off they are making instead of decoding fare codes. Plain-named buckets also make the negotiated result easier to trust, because you can see exactly what you are getting for the price.",
        ],
        split: "media",
        figure:
          "Caption: every fare sorted into a plain-named bucket, Non-Refundable, No Check-in Bag, Most Balanced, Low Cancellation, Max Baggage, each showing its real policy. [Add screens.]",
        divider: true,
      },
      {
        h: "What we explored, and what we cut",
        tldr: "We started radical, learned people still anchor on the familiar flight input, and rebuilt the entry to support both a chat-style and a standard search on a simpler two-column layout.",
        p: [
          "Because the core behaviour is unfamiliar, almost every screen became a question of how far to push. The first direction for the flight input was deliberately radical, a near-complete departure from how search looks today. What we learned is the limit of how far you can move a behaviour in one step: people arrived looking for the standard, structured way of entering a flight (from, to, when), and a fully reinvented input made them hesitate before they ever reached the part that is genuinely new, the negotiation.",
          "So I rebuilt the entry to meet both instincts. It accepts a chat-style input for people who want to just say what they want, and keeps the familiar structured input for people who expect the usual fields, on a calmer two-column layout in place of the original three. That became the rule across the app: keep the on-ramp familiar so all the novelty can live in the negotiation. [More of the directions we cut elsewhere, to add.]",
        ],
        fig: "awayLanding",
        figure:
          "The post-login home: one natural-language search field that takes a chat-style request ('a city, flight type or fare'), with the screenshot-upload hook ('we'll find a better price') and invite-only gating below.",
        divider: true,
      },
      {
        h: "Outcomes",
        tldr: "About a third of users now negotiate instead of just booking, the exact behaviour shift we were betting on.",
        p: [
          "The headline is behavioural, not cosmetic: people are actually negotiating. That is the bet the whole product rides on, and early usage says the behaviour is real.",
        ],
        ul: [
          "Roughly 1 in 3 users negotiate a flight rather than booking the listed price outright",
          "About 1,000 users and around 200 bookings so far",
          "Even in the worst case, Away comes out at least 3% cheaper than other OTAs",
          "Fares are surfaced and named by real advantage, including options OTAs don't show",
        ],
      },
      {
        h: "Reflection",
        tldr: "The hard part was teaching a behaviour people were trained against; the thing I would change is collapsing the negotiation onto one page.",
        p: [
          "The difficult part of Away is not any single screen. It is convincing someone, in the few seconds they spend on a listing, that a flight price is negotiable at all, after a lifetime of being trained that it is fixed. Most of the design work was lowering the cost of trying that behaviour for the first time.",
          "The clearest thing I would change is the shape of the negotiation. Today it spans several steps and screens, selecting, negotiating, then results, and every handoff is a chance to lose momentum. It should happen on a single page: pick your flights, watch the negotiation run, and see the result without leaving the spot. That single-page version is on the roadmap, and I expect it to be the change that moves completion most.",
        ],
      },
    ],
    todo: [
      "Replace the figure placeholders one at a time with real screens, built as animated SVGs imported from Figma (Negotiate flow, the live timeline, fare buckets, results)",
    ],
  },
  sample: {
    accent: "#2BB3A3",
    eyebrow: "Company name · Sample case study",
    title: "Sample project, the impact you made",
    meta: "Product Designer · 2024 to 2025",
    cover: "Company",
    lead:
      "One or two sentences framing the project, the product, your role, and the headline outcome. This is sample copy; replace it with the real story.",
    sections: [
      {
        h: "Overview",
        tldr: "[One line on the product, the user, and where it sat in the business.]",
        p: [
          "What the product was, who it served, and where it sat in the business. Keep it tight, a reader should grasp the context in a few lines.",
        ],
      },
      {
        h: "The challenge",
        tldr: "[The core problem and the metric you aimed to move.]",
        p: ["The core problem you set out to solve, and why it mattered."],
        ul: [
          "A user pain point or business constraint",
          "Another constraint worth calling out",
          "The success metric you were aiming at",
        ],
        divider: true,
      },
      {
        h: "What I did",
        tldr: "[The approach and the key decision, in one line.]",
        p: [
          "The approach: research, exploration, the key decisions and the trade-offs behind them. Show how you think, not just what you shipped.",
        ],
        figure: "Caption: a screen, flow, or artifact from the work.",
      },
      {
        h: "Outcome",
        tldr: "[The measurable result.]",
        p: ["What shipped and the measurable result it drove."],
        ul: ["Outcome metric one", "Outcome metric two"],
      },
    ],
  },
};

/* ---------- minimal client-side router (no deps) ---------- */
const NavContext = createContext(() => {});

function useRoute() {
  const [path, setPath] = useState(() => window.location.pathname);
  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  const navigate = useCallback((to) => {
    if (to === window.location.pathname) return;
    window.history.pushState({}, "", to);
    setPath(to);
    window.scrollTo({ top: 0 });
  }, []);
  return [path, navigate];
}

function Link({ to, className, style, children }) {
  const navigate = useContext(NavContext);
  const internal = typeof to === "string" && to.startsWith("/");
  return (
    <a
      href={to}
      className={className}
      style={style}
      onClick={(e) => {
        if (!internal) return;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        navigate(to);
      }}
    >
      {children}
    </a>
  );
}

/* ---------- icons & bits ---------- */
function Title({ segments }) {
  return (
    <span className="work__title">
      {segments.map((seg, i) => (
        <span key={i} className={seg.accent ? "accent" : undefined}>
          {seg.text}
        </span>
      ))}
    </span>
  );
}

function ArrowIcon() {
  return (
    <svg className="work__arrow" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M19 12H5" />
      <path d="m11 18-6-6 6-6" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="4" y="11" width="16" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

/* ---------- shared ---------- */
function WorkItem({ project, showYear = true }) {
  const style = undefined;
  const main = (
    <span className="work__main">
      <span className="work__year">{showYear ? project.year : ""}</span>
      <Title segments={project.titleSegments} />
    </span>
  );

  if (project.locked) {
    return (
      <div className="work__item work__item--locked" style={style}>
        {main}
        <span className="work__meta">
          {project.brand}
          <span className="work__lock">
            <LockIcon />
            Locked
          </span>
        </span>
      </div>
    );
  }

  return (
    <Link
      className={showYear ? "work__item" : "work__item work__item--noyear"}
      style={style}
      to={project.href}
    >
      {main}
      <span className="work__meta">
        <span className="work__month">{project.month}</span>
        <span className="work__sep" aria-hidden></span>
        {project.brand}
      </span>
    </Link>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <a href="mailto:agamagar117@gmail.com">
        <span className="footer__mail">
          <MailIcon />
          agamagar117@gmail.com
        </span>
      </a>
      <span className="footer__meta">
        <span>Bangalore</span>
        <span className="footer__dot" aria-hidden>·</span>
        <span>2026</span>
      </span>
    </footer>
  );
}

/* Scan-mode rows (nan.fyi-style list) built from the read-mode projects. */
const scanProjects = [
  {
    href: "/work/away",
    brand: "Away",
    year: "2026",
    accent: "#0891B2",
    title: "Rethinking how people book flights",
    blurb: "Reimagining flight booking from first search to final seat, with clarity at every step.",
  },
  {
    href: "/work/jarvis",
    brand: "Zepto",
    year: "2026",
    accent: "#DB2777",
    title: "Revamping the ads platform",
    blurb: "Rebuilding Jarvis, the ads platform powering monetisation across Zepto.",
  },
  {
    href: "/work/scheduled-delivery",
    brand: "Zepto",
    year: "2025",
    accent: "#6B21D9",
    title: "Scheduled delivery on a 10-minute platform",
    blurb: "Bringing planned, time-slotted delivery to a platform built for instant.",
  },
  {
    href: "/work/zepiris",
    brand: "Zepto",
    year: "2026",
    accent: "#4F46E5",
    title: "Scalable face authentication",
    blurb: "A privacy-first face authentication system for store operations at scale.",
  },
  {
    href: "/work/dassh",
    brand: "Dassh",
    year: "2025",
    accent: "#EA580C",
    title: "Building a B2B SaaS from the ground up",
    blurb: "Stella, an AI recruiter: four experiences, an agent system, and a design system that shipped its own code.",
  },
  {
    href: "/work/toppr",
    brand: "Toppr",
    year: "2019",
    accent: "#2BB3A3",
    title: "Joyful learning experiences for students",
    blurb: "Habit-forming, joyful learning for millions of K-12 students across India.",
  },
];

// Placeholder line-art thumbnail for scan rows (swap for real artwork later).
function ScanThumb() {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="6" y="9" width="36" height="30" rx="3" />
      <circle cx="17" cy="19" r="3.2" />
      <path d="M9 33l9-9 6 5 7-8 8 9" />
    </svg>
  );
}

function RightArrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

/* ---------- pages ---------- */
// The avatar drawn as live vector paths so it morphs point-for-point from face
// state 1 to state 2 as the wave comes in. The head silhouette (two subpaths: the
// outline + the hole) is resampled to evenly-spaced points and interpolated; the
// feature lines morph by pure coordinate interpolation; the eyes slide. No crossfade.
const FACE_HEAD = FACE_PATHS.find((p) => p.kind === "fill");
const FACE_FEATURES = FACE_PATHS.filter((p) => p.kind === "stroke");
// The state-2-only brow collapsed to its first point (its resting / state-1 look).
const FACE_EXTRA_REST = FACE_EXTRA.map((p) => {
  const n = (p.d.match(/-?\d*\.?\d+/g) || []).map(Number);
  let i = 0;
  return p.d.replace(/-?\d*\.?\d+/g, () => {
    const v = i % 2 === 0 ? n[0] : n[1];
    i += 1;
    return v.toFixed(2);
  });
});

function MorphFace() {
  const featRefs = useRef([]);
  const eyeRefs = useRef([]);
  const headRef = useRef(null);
  const extraRef = useRef(null);
  const groupRef = useRef(null);

  // Layout effect so the start state (t=0) is painted before the first frame, and
  // the resting DOM ends at state 2 to match the JSX (no revert to state 1 on re-render).
  useLayoutEffect(() => {
    const lerp = (a, b, t) => a + (b - a) * t;
    const nums = (d) => (d.match(/-?\d*\.?\d+/g) || []).map(Number);

    // Resample the head subpaths to even point counts so they interpolate cleanly.
    const N = 96;
    let head = null;
    // Horizontal-centre shift from state 1 to state 2. The group is translated by
    // dx*(1-t) so states 1 and 3 sit at state 2's horizontal position and the
    // illustration morphs in place instead of sliding right-to-left.
    let dx = 0;
    try {
      const ns = "http://www.w3.org/2000/svg";
      const hsvg = document.createElementNS(ns, "svg");
      hsvg.setAttribute("style", "position:absolute;width:0;height:0;overflow:hidden");
      const tmp = document.createElementNS(ns, "path");
      hsvg.appendChild(tmp);
      document.body.appendChild(hsvg);
      const sampleSub = (sub) => {
        tmp.setAttribute("d", sub);
        const len = tmp.getTotalLength() || 1;
        const pts = [];
        for (let i = 0; i <= N; i += 1) {
          const p = tmp.getPointAtLength((len * i) / N);
          pts.push([p.x, p.y]);
        }
        return pts;
      };
      const subs = (d) => d.split(/(?=M)/).map((s) => s.trim()).filter(Boolean);
      const s1 = subs(FACE_HEAD.d1);
      const s2 = subs(FACE_HEAD.d2);
      head = s1.map((sub, i) => ({ a: sampleSub(sub), b: sampleSub(s2[i] || sub) }));
      // Centre of the head silhouette in each state, to cancel the lateral drift.
      tmp.setAttribute("d", FACE_HEAD.d1);
      const b1 = tmp.getBBox();
      tmp.setAttribute("d", FACE_HEAD.d2);
      const b2 = tmp.getBBox();
      dx = b2.x + b2.width / 2 - (b1.x + b1.width / 2);
      document.body.removeChild(hsvg);
    } catch (e) {
      head = null;
    }
    const headD = (t) =>
      head
        .map(
          (s) =>
            "M" +
            s.a
              .map(([x, y], k) => `${lerp(x, s.b[k][0], t).toFixed(2)} ${lerp(y, s.b[k][1], t).toFixed(2)}`)
              .join("L") +
            "Z"
        )
        .join(" ");

    const feats = FACE_FEATURES.map((p) => ({ tmpl: p.d1, n1: nums(p.d1), n2: nums(p.d2) }));
    // The state-2-only brow line grows in from its first point (no opacity fade).
    const extras = FACE_EXTRA.map((p) => {
      const n2 = nums(p.d);
      return { tmpl: p.d, n1: n2.map((v, i) => (i % 2 === 0 ? n2[0] : n2[1])), n2 };
    });
    const buildD = (f, t) => {
      let i = 0;
      return f.tmpl.replace(/-?\d*\.?\d+/g, () => {
        const v = lerp(f.n1[i], f.n2[i], t);
        i += 1;
        return v.toFixed(2);
      });
    };
    const render = (t) => {
      if (groupRef.current)
        groupRef.current.setAttribute("transform", `translate(${(dx * (1 - t)).toFixed(2)} 0)`);
      if (head && headRef.current) headRef.current.setAttribute("d", headD(t));
      feats.forEach((f, i) => {
        const el = featRefs.current[i];
        if (el) el.setAttribute("d", buildD(f, t));
      });
      FACE_EYES.forEach((e, i) => {
        const el = eyeRefs.current[i];
        if (el) {
          el.setAttribute("cx", lerp(e.cx1, e.cx2, t).toFixed(2));
          el.setAttribute("cy", lerp(e.cy1, e.cy2, t).toFixed(2));
        }
      });
      if (extraRef.current && extras[0]) extraRef.current.setAttribute("d", buildD(extras[0], t));
    };

    render(0);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return; // stays at state 1
    }
    // Timeline (starts with the wave at 500ms): turn to state 2, hold there until
    // the wave finishes (wave is 2600ms long), then turn back to state 1.
    const delay = 0;
    const durOut = 250; // turn-out, 2x faster
    const durBack = 350; // turn-back, 2x faster
    const holdEnd = 3100;
    const totalEnd = holdEnd + durBack;
    const ease = (x) => 0.5 - 0.5 * Math.cos(Math.PI * x);
    let raf = 0,
      start = 0;
    const timer = setTimeout(() => {
      const step = (now) => {
        if (!start) start = now;
        const e = now - start;
        let p;
        if (e < durOut) p = ease(e / durOut);
        else if (e < holdEnd) p = 1;
        else if (e < totalEnd) p = 1 - ease((e - holdEnd) / durBack);
        else p = 0;
        render(p);
        if (e < totalEnd) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, delay);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <svg className="header__avatar" viewBox={FACE_VIEWBOX} preserveAspectRatio="xMidYMid meet" fill="none" aria-hidden>
      <g ref={groupRef}>
        {FACE_HEAD && <path ref={headRef} d={FACE_HEAD.d1} fill={FACE_COLOR} />}
        {FACE_FEATURES.map((p, i) => (
          <path
            key={p.id}
            ref={(el) => (featRefs.current[i] = el)}
            d={p.d1}
            fill="none"
            stroke={FACE_COLOR}
            strokeWidth={p.sw || undefined}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        {FACE_EXTRA.map((p, i) => (
          <path
            key={"x" + i}
            ref={extraRef}
            d={FACE_EXTRA_REST[i]}
            fill="none"
            stroke={FACE_COLOR}
            strokeWidth={p.sw}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        {FACE_EYES.map((e, i) => (
          <circle key={"e" + i} ref={(el) => (eyeRefs.current[i] = el)} cx={e.cx1} cy={e.cy1} r={e.r} fill={FACE_COLOR} />
        ))}
      </g>
    </svg>
  );
}

// The greeting assets that pop up beside the avatar, cycled on each replay.
// States 2 & 3 (the emoji pops) are hidden for now — only the hand wave plays.
// Re-add the emoji entries below to bring them back into the rotation.
const HEADER_ASSETS = [
  { kind: "wave" },
  // { kind: "emoji", items: ["🍕", "☕"] },
  // { kind: "emoji", items: ["📐", "📷"] },
];

function Home({ mode }) {
  // Replay the avatar greeting every 10s after the first run, cycling the asset
  // that pops up: hand wave -> pizza + coffee -> geometry tool + camera -> repeat.
  const [cycle, setCycle] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setCycle((c) => c + 1), 10000);
    return () => clearInterval(id);
  }, []);
  // hovering the avatar replays the current greeting gesture (the wave/asset pop)
  const [replayId, setReplayId] = useState(0);
  const replayGreeting = useCallback(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setReplayId((r) => r + 1);
  }, []);
  const asset = HEADER_ASSETS[cycle % HEADER_ASSETS.length];
  return (
    <div className={mode === "scan" ? "page page--scan" : "page"}>
      <header className="header">
        <span className="header__avatar-wrap" onMouseEnter={replayGreeting}>
          {/* the face morphs on load and again on every hover (keyed on replayId);
              the 10s auto-cycle only replays the asset, not the face. Distinct key
              namespaces so the two siblings never collide (no stacked faces). */}
          <MorphFace key={`face-${replayId}`} />
          <span className="header__wave" data-kind={asset.kind} aria-hidden key={`wave-${cycle}-${replayId}`}>
            {asset.kind === "wave" ? (
              <img className="header__wave-img" src="/wave.svg" alt="" width="26" height="26" />
            ) : (
              asset.items.map((emo, i) => (
                <span className="header__wave-emoji" style={{ "--ei": i }} key={i}>
                  {emo}
                </span>
              ))
            )}
          </span>
        </span>
        <h1 className="header__name">Agam Agarwal</h1>
        <p className="header__role">Interaction Designer · Bangalore</p>
        <p className="header__bio">
          I design products at the intersection of clarity and craft, from
          learning and retail to banking and security. Off the clock, I&rsquo;m a
          VR enthusiast, photographer, and amateur researcher.
        </p>
        <nav className="header__links">
          <a href="https://www.agamagarwal.com/img/Resume-Agam+Agarwal.pdf">Resume</a>
          <a href="https://www.linkedin.com/in/agam-agarwal/">LinkedIn</a>
        </nav>
      </header>

      <main>
        {mode === "read" ? (
          <>
            <p className="section-label">Selected Work</p>
            <div className="work">
              {projects.map((p, i) => (
                <WorkItem
                  key={i}
                  project={p}
                  showYear={i === 0 || projects[i - 1].year !== p.year}
                />
              ))}
            </div>

            <p className="section-label section-label--gap">Archived</p>
            <div className="work">
              {archived.map((p, i) => (
                <WorkItem
                  key={i}
                  project={p}
                  showYear={i === 0 || archived[i - 1].year !== p.year}
                />
              ))}
            </div>

            <p className="section-label section-label--gap">Research</p>
            <div className="work">
              {research.map((paper, i) => (
                <a className="work__item" key={i} href={paper.href}>
                  <span className="work__main">
                    <span className="work__year">{paper.year}</span>
                    <span className="work__title">{paper.title}</span>
                  </span>
                  <span className="work__meta">
                    <span className="work__month">{paper.month}</span>
                    <span className="work__sep" aria-hidden></span>
                    {paper.venue}
                  </span>
                </a>
              ))}
            </div>
          </>
        ) : (
          <div className="scan-list">
            {scanProjects.map((p, i) => (
              <Link className="scan-row" key={i} to={p.href}>
                <span className="scan-row__thumb">
                  <ScanThumb />
                </span>
                <span className="scan-row__head">
                  <span className="scan-row__title">{p.title}</span>
                  <span className="scan-row__meta">
                    {p.brand} · {p.year}
                  </span>
                </span>
                <span className="scan-row__desc">{p.blurb}</span>
                <span className="scan-row__arrow">
                  <RightArrow />
                </span>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

// Data-driven case-study / detail page. Looks up content by slug; falls back to
// the sample. Replace bracketed [...] copy with the real story.
function PlayIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M7 4.5 19.5 12 7 19.5z" />
    </svg>
  );
}

// Build a deck from a case study: a title slide, then one slide per section.
// Each section's `split` ('text' | 'split' | 'media') sets the text/image balance.
function buildSlides(cs) {
  const title = {
    kind: "title",
    eyebrow: cs.eyebrow,
    title: cs.title,
    meta: cs.meta,
    lead: cs.lead,
  };
  const sections = cs.sections.map((s) => ({
    kind: "section",
    split: s.split || (s.figure ? "split" : "text"),
    h: s.h,
    p: s.p,
    ul: s.ul,
    figure: s.figure,
    image: s.image,
    fig: s.fig,
    iphone: s.iphone,
    iphoneSplit: s.iphoneSplit,
    rive: s.rive,
    riveStateMachines: s.riveStateMachines,
    riveArtboard: s.riveArtboard,
    collage: s.collage,
    cover: cs.cover,
  }));
  return [title, ...sections];
}

function Slide({ slide }) {
  if (slide.kind === "title") {
    return (
      <div className="slide slide--title">
        <p className="slide__eyebrow">{slide.eyebrow}</p>
        <h2 className="slide__title">{slide.title}</h2>
        <p className="slide__meta">{slide.meta}</p>
        <p className="slide__lead">{slide.lead}</p>
      </div>
    );
  }
  const text = (
    <div className="slide__text">
      <h2 className="slide__h">{slide.h}</h2>
      {(slide.p || []).map((p, j) => (
        <p key={j}>{p}</p>
      ))}
      {slide.ul && (
        <ul>
          {slide.ul.map((li, k) => (
            <li key={k}>{li}</li>
          ))}
        </ul>
      )}
    </div>
  );
  const media =
    slide.split !== "text" &&
    (slide.figure || slide.iphone || slide.iphoneSplit || slide.rive || slide.collage) ? (
      <figure className="slide__media">
        <SectionFigure
          image={slide.image}
          fig={slide.fig}
          iphone={slide.iphone}
          iphoneSplit={slide.iphoneSplit}
          rive={slide.rive}
          riveStateMachines={slide.riveStateMachines}
          riveArtboard={slide.riveArtboard}
          collage={slide.collage}
          cover={slide.cover}
          variant="slide"
        />
        <figcaption>{slide.figure}</figcaption>
      </figure>
    ) : null;
  const split = media ? slide.split : "text";
  return (
    <div className={`slide slide--${split}`}>
      {text}
      {media}
    </div>
  );
}

// Presentation mode, the case study as a one-slide-at-a-time deck.
function Presentation({ cs, onExit }) {
  const slides = useMemo(() => buildSlides(cs), [cs]);
  const [i, setI] = useState(0);
  const go = useCallback(
    (d) => setI((p) => Math.min(slides.length - 1, Math.max(0, p + d))),
    [slides.length]
  );
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onExit();
      else if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        go(1);
      } else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onExit]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div className="present">
      <div className="present__bar">
        <span className="present__title">{cs.eyebrow}</span>
        <span className="present__count">
          {i + 1} / {slides.length}
        </span>
        <button className="present__exit" onClick={onExit} aria-label="Exit presentation">
          Esc ✕
        </button>
      </div>
      <div className="present__progress">
        <span style={{ width: `${((i + 1) / slides.length) * 100}%` }} />
      </div>
      <div className="present__stage">
        <Slide key={i} slide={slides[i]} />
      </div>
      <div className="present__nav">
        <button onClick={() => go(-1)} disabled={i === 0}>
          ← Prev
        </button>
        <button onClick={() => go(1)} disabled={i === slides.length - 1}>
          Next →
        </button>
      </div>
    </div>
  );
}

function CaseStudy({ slug, presenting, onExitPresent }) {
  const cs = caseStudies[slug] || caseStudies.sample;
  const [activeSection, setActiveSection] = useState(0);

  // Scroll-spy: highlight the index entry for the section currently in view.
  useEffect(() => {
    const els = cs.sections
      .map((_, i) => document.getElementById(`sec-${i}`))
      .filter(Boolean);
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveSection(Number(e.target.id.slice(4)));
        });
      },
      { rootMargin: "-12% 0px -75% 0px" }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [cs]);

  return (
    <>
    <div className="page page--article">
      <div className="article__layout">
        <nav className="article__index" aria-label="Sections">
          <Link to="/" className="back-link article__back">
            <BackIcon />
            Back
          </Link>
          <ul>
            {cs.sections.map((s, i) => (
              <li key={i}>
                <a
                  href={`#sec-${i}`}
                  className={i === activeSection ? "is-active" : undefined}
                >
                  {s.h}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <article className="article">
          <header className="article__head">
          <p className="article__eyebrow">{cs.eyebrow}</p>
          <h1 className="article__title">{cs.title}</h1>
          <p className="article__meta">{cs.meta}</p>
        </header>

        <div className="article__hero-board">
          <Suspense fallback={null}>
            <TextFlippingBoardDemo messages={cs.board || [cs.title]} />
          </Suspense>
        </div>

        <div className="article__body">
          <p className="article__lead">{cs.lead}</p>

          {cs.sections.map((s, i) => (
            <Fragment key={i}>
              <h2 id={`sec-${i}`}>{s.h}</h2>
              {s.tldr && (
                <p className="article__tldr">
                  <span className="article__tldr-label">TL;DR</span>
                  {s.tldr}
                </p>
              )}
              {(s.p || []).map((para, j) => (
                <p key={j}>{para}</p>
              ))}
              {s.ul && (
                <ul>
                  {s.ul.map((li, k) => (
                    <li key={k}>{li}</li>
                  ))}
                </ul>
              )}
              {(s.figure || s.rive || s.collage) && (
                <figure className="article__figure">
                  <SectionFigure
                    image={s.image}
                    fig={s.fig}
                    iphone={s.iphone}
                    iphoneSplit={s.iphoneSplit}
                    rive={s.rive}
                    riveStateMachines={s.riveStateMachines}
                    riveArtboard={s.riveArtboard}
                    collage={s.collage}
                    variant="article"
                  />
                  {s.figure && <figcaption>{s.figure}</figcaption>}
                </figure>
              )}
              {s.divider && (
                <p className="article__divider" aria-hidden>
                  · · ·
                </p>
              )}
            </Fragment>
          ))}

          {cs.todo && (
            <div className="article__todo">
              <p className="article__todo-title">Fill in to finish this case study</p>
              <ul>
                {cs.todo.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        </article>
      </div>

      <Footer />
    </div>
    {presenting && <Presentation cs={cs} onExit={onExitPresent} />}
    </>
  );
}

/* ---------- motion lab: a growing reference of animation techniques ----------
 * Catalogue of reusable, dependency-free animations (benji.org style:
 * SVG + CSS @keyframes + SMIL). When we build a NEW animation, add it here:
 *   1. Drop a <DemoCard name="…" technique="…">…</DemoCard> into the lab-grid.
 *   2. Add its @keyframes to the "motion lab" section in index.css.
 *   3. Keep the springy easing cubic-bezier(0.34, 1.56, 0.64, 1) for bounce,
 *      and add a prefers-reduced-motion fallback.
 * Reachable at /lab (intentionally not linked from the public site).
 * ------------------------------------------------------------------------- */
function DemoCard({ name, technique, children }) {
  return (
    <div className="demo">
      <div className="demo__stage">{children}</div>
      <p className="demo__name">{name}</p>
      <p className="demo__tech">{technique}</p>
    </div>
  );
}

const STAGGER_COLORS = ["#2BB3A3", "#6B21D9", "#D154BC", "#1FB89B", "#8A6BF0"];

// One M3 motion token, demoed as a ball traversing a track with that easing+duration.
function M3Track({ label, dur, ease }) {
  return (
    <div className="m3__row">
      <span className="m3__label">{label}</span>
      <span className="m3__dur">{dur}</span>
      <span className="m3__track">
        <span
          className="m3__ball"
          style={{ animationDuration: dur, animationTimingFunction: `var(${ease})` }}
        />
      </span>
    </div>
  );
}

function MotionLab() {
  return (
    <div className="page page--lab" style={{ "--accent": "#3e9fff" }}>
      <Link to="/" className="back-link">
        <BackIcon />
        Index
      </Link>

      <header className="article__head">
        <p className="article__eyebrow">Motion lab</p>
        <h1 className="article__title">Animation techniques, from scratch</h1>
        <p className="article__meta">
          A growing reference of dependency-free animations, SVG + CSS + SMIL,
          benji.org style. Added as we build them.
        </p>
      </header>

      <div className="lab-grid">
        {/* 1. Self-drawing path */}
        <DemoCard name="Self-drawing path" technique="SVG pathLength + stroke-dashoffset">
          <svg width="96" height="96" viewBox="0 0 80 80" fill="none">
            <circle
              className="draw"
              cx="40" cy="40" r="30"
              pathLength="1"
              stroke="var(--accent)" strokeWidth="3" strokeLinecap="round"
            />
            <path
              className="draw draw--delay"
              d="M27 41 L36 50 L54 31"
              pathLength="1"
              stroke="var(--accent)" strokeWidth="3"
              strokeLinecap="round" strokeLinejoin="round"
            />
          </svg>
        </DemoCard>

        {/* 2. Icon morph */}
        <DemoCard name="Icon morph" technique="SMIL <animate> on d, springy easing">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none"
            stroke="var(--accent)" strokeWidth="2.2"
            strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 9 L12 16 L19 9">
              <animate
                attributeName="d"
                dur="2.4s"
                repeatCount="indefinite"
                calcMode="spline"
                keyTimes="0;0.5;1"
                values="M5 9 L12 16 L19 9; M5 15 L12 8 L19 15; M5 9 L12 16 L19 9"
                keySplines="0.34 1.56 0.64 1; 0.34 1.56 0.64 1"
              />
            </path>
          </svg>
        </DemoCard>

        {/* 3. Staggered pop-in */}
        <DemoCard name="Staggered pop-in" technique="@keyframes + per-item delay, spring overshoot">
          <div className="stagger">
            {STAGGER_COLORS.map((c, i) => (
              <span
                key={i}
                className="stagger__dot"
                style={{ background: c, animationDelay: `${i * 0.12}s` }}
              />
            ))}
          </div>
        </DemoCard>

        {/* 4. Attention marker */}
        <DemoCard name="Attention marker" technique="@keyframes scale + fade (the annotation ping)">
          <div className="ping">
            <span className="ping__ring" />
            <span className="ping__ring ping__ring--2" />
            <span className="ping__dot" />
          </div>
        </DemoCard>

        {/* 5. CSS linear() spring, added from motion.dev's AI Kit */}
        <DemoCard name="linear() spring" technique="CSS linear() easing, true spring physics, no JS (motion.dev)">
          <div className="springs">
            <div className="springs__row">
              <span className="springs__track">
                <span className="springs__ball springs__ball--bezier" />
              </span>
              <span className="springs__tag">cubic-bezier</span>
            </div>
            <div className="springs__row">
              <span className="springs__track">
                <span className="springs__ball springs__ball--linear" />
              </span>
              <span className="springs__tag">linear()</span>
            </div>
          </div>
        </DemoCard>

        {/* 6. Google Material 3 motion framework, added per the M3 spec */}
        <div className="demo demo--wide">
          <div className="m3">
            <div className="m3__group">
              <p className="m3__head">
                Expressive · spatial <span>bold overshoot</span>
              </p>
              <M3Track label="fast" dur="350ms" ease="--m3-spatial-expressive-fast" />
              <M3Track label="default" dur="500ms" ease="--m3-spatial-expressive-default" />
              <M3Track label="slow" dur="650ms" ease="--m3-spatial-expressive-slow" />
            </div>
            <div className="m3__group">
              <p className="m3__head">
                Standard · spatial <span>subtle</span>
              </p>
              <M3Track label="fast" dur="350ms" ease="--m3-spatial-standard-fast" />
              <M3Track label="default" dur="500ms" ease="--m3-spatial-standard-default" />
              <M3Track label="slow" dur="750ms" ease="--m3-spatial-standard-slow" />
            </div>
          </div>
          <p className="demo__name">Google Material 3, motion tokens</p>
          <p className="demo__tech">
            Spatial easings overshoot (movement/size); effects easings don't
            (opacity/color). Full token set lives in :root.
          </p>
        </div>

        {/* 7. Composed: annotation cursor */}
        <DemoCard name="Annotation cursor" technique="Composition, move + draw + pop, on a loop">
          <div className="scene">
            <div className="scene__el" />
            <svg className="scene__box" width="220" height="150" viewBox="0 0 220 150" fill="none">
              <rect
                x="62" y="50" width="96" height="46" rx="9"
                pathLength="1"
                stroke="var(--accent)" strokeWidth="2.5"
              />
            </svg>
            <div className="scene__bubble">Tighten this ↗</div>
            <svg className="scene__cursor" width="22" height="22" viewBox="0 0 24 24" fill="#111111" stroke="#fff" strokeWidth="1.5">
              <path d="M5 3 L19 12 L12 13 L9 20 Z" />
            </svg>
          </div>
        </DemoCard>
      </div>

      <Footer />
    </div>
  );
}

// One persistent control across all pages. It never unmounts on navigation, so
// changing `variant` animates the toggle <-> play morph via CSS.
function PageControl({ variant, mode, accent, onRead, onScan, onPresent }) {
  // The selection is a sliding "thumb". On a mode switch it briefly turns to
  // glass and lifts as it travels to the other icon, then settles back to the
  // solid white selected state. `switching` is true only for the slide.
  const [switching, setSwitching] = useState(false);
  const prevMode = useRef(mode);
  useEffect(() => {
    if (prevMode.current === mode) return;
    prevMode.current = mode;
    setSwitching(true);
    const t = setTimeout(() => setSwitching(false), 500); // matches the slide duration
    return () => clearTimeout(t);
  }, [mode]);

  return (
    <div className={`page-control page-control--${variant}`}>
      <div
        className={`page-control__toggle${switching ? " is-switching" : ""}`}
        data-mode={mode}
        role="tablist"
        aria-label="View mode"
      >
        <span className="page-control__thumb" aria-hidden />
        <button
          type="button"
          aria-label="Read mode"
          className={mode === "read" ? "is-active" : undefined}
          onClick={onRead}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Scan mode"
          className={mode === "scan" ? "is-active" : undefined}
          onClick={onScan}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M3 7V5a2 2 0 0 1 2-2h2" />
            <path d="M17 3h2a2 2 0 0 1 2 2v2" />
            <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
            <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
            <path d="M7 8h8" />
            <path d="M7 12h10" />
            <path d="M7 16h6" />
          </svg>
        </button>
      </div>
      <div className="page-control__play">
        <button type="button" aria-label="Present" onClick={onPresent}>
          <PlayIcon />
        </button>
      </div>
    </div>
  );
}

// Dark / light theme toggle — a Lucide-style sun that morphs into a moon (SVG
// element animation driven by CSS when the `.dark` class flips on <html>): the
// core grows, the beams retract + fade, and a masked "bite" slides across to
// carve the crescent. No box, just the icon. Sits left of the page control.
function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      aria-pressed={isDark}
      title="Toggle theme"
      onClick={onToggle}
    >
      <svg className="theme-toggle__icon" width="18" height="18" viewBox="0 0 24 24" aria-hidden>
        <mask id="theme-moon-mask">
          <rect x="0" y="0" width="24" height="24" fill="white" />
          <circle className="theme-toggle__bite" cx="24" cy="10" r="6" fill="black" />
        </mask>
        <circle
          className="theme-toggle__core"
          cx="12"
          cy="12"
          r="6"
          fill="currentColor"
          mask="url(#theme-moon-mask)"
        />
        <g className="theme-toggle__beams" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </g>
      </svg>
    </button>
  );
}

export default function App() {
  const [path, navigate] = useRoute();
  const isLab = path === "/lab";
  const slug = path.startsWith("/work/") ? path.slice("/work/".length) : null;
  const [mode, setMode] = useState("read");
  const [presenting, setPresenting] = useState(false);
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    const saved = window.localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") return saved;
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  // Apply + persist the theme (a `dark` class on <html> drives the token overrides).
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    try {
      window.localStorage.setItem("theme", theme);
    } catch {
      /* storage unavailable */
    }
  }, [theme]);

  // Leaving / switching a case study closes the deck.
  useEffect(() => {
    setPresenting(false);
  }, [slug]);

  const variant = isLab ? "none" : slug ? "play" : "toggle";
  const accent = slug ? (caseStudies[slug] || caseStudies.sample).accent : undefined;

  return (
    <NavContext.Provider value={navigate}>
      <ThemeToggle
        theme={theme}
        onToggle={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
      />
      <PageControl
        variant={variant}
        mode={mode}
        accent={accent}
        onRead={() => setMode("read")}
        onScan={() => setMode("scan")}
        onPresent={() => setPresenting(true)}
      />
      {isLab ? (
        <MotionLab />
      ) : slug ? (
        <CaseStudy slug={slug} presenting={presenting} onExitPresent={() => setPresenting(false)} />
      ) : (
        <Home mode={mode} />
      )}
      {import.meta.env.DEV && <Agentation endpoint="http://localhost:4747" />}
    </NavContext.Provider>
  );
}
