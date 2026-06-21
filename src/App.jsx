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
import TexturedBackground from "./TexturedBackground";
import AgentWizardFigure from "./figures/AgentWizard";
import AgentWizardCompare from "./figures/agentWizard/Compare";
import AgentWizardFFF from "./figures/agentWizard/AgentWizardFFF";
import StellaOnboarding from "./figures/onboarding/StellaOnboarding";
import AnnotationDemo from "./figures/scaffold/AnnotationDemo";
import ExecutionFlood from "./figures/concepts/ExecutionFlood";
import DailyReport from "./figures/concepts/DailyReport";
import FigmaToCode from "./figures/concepts/FigmaToCode";
import EvolutionTimeline from "./figures/concepts/EvolutionTimeline";
import DecisionEngine from "./figures/concepts/DecisionEngine";
import DesignFigure from "./figures/design/DesignFigure";
import SchedUsers from "./figures/scheduled/SchedUsers";
import AwClarify from "./figures/awayAgent/AwClarify";
import AwHome from "./figures/awayAgent/AwHome";
import AwDeepSearch from "./figures/awayAgent/AwDeepSearch";
import AwVet from "./figures/awayAgent/AwVet";
import AwBook from "./figures/awayAgent/AwBook";
import AwConfirm from "./figures/awayAgent/AwConfirm";
import AwHub from "./figures/awayAgent/AwHub";
import AwTransit from "./figures/awayAgent/AwTransit";
import AwDisruption from "./figures/awayAgent/AwDisruption";
import AwRecap from "./figures/awayAgent/AwRecap";
import AwOnboard from "./figures/awayAgent/AwOnboard";
import AwPreDep from "./figures/awayAgent/AwPreDep";
import AwIntakeBrief from "./figures/awayAgent/AwIntakeBrief";
import AwSearchFlow from "./figures/awayAgent/AwSearchFlow";
import AwSmartPin from "./figures/awayAgent/AwSmartPin";
import AwResultCard from "./figures/awayAgent/AwResultCard";
import SchedDirections from "./figures/scheduled/SchedDirections";
import SchedSinglePage from "./figures/scheduled/SchedSinglePage";
import SchedStuckCart from "./figures/scheduled/SchedStuckCart";
import SchedImpact from "./figures/scheduled/SchedImpact";
import SchedSplit from "./figures/scheduled/SchedSplit";
import SchedCartStates from "./figures/scheduled/SchedCartStates";
import SchedPageStates from "./figures/scheduled/SchedPageStates";
import SchedDateSwitch from "./figures/scheduled/SchedDateSwitch";
import SchedGtm from "./figures/scheduled/SchedGtm";

// Project list. "Toppr" is a real, decided project; the rest are sample slots
// to fill in one at a time. Each title splits into segments; `accent: true`
// segments use the project's accent color.
// Ordered newest-first, grouped by year. `month` values are PLACEHOLDERS,
// replace with the real project months (they also set the order within a year).
const projects = [
  {
    brand: "Away",
    href: "/work/away-agent",
    accent: "#2563EB",
    year: "2026",
    month: "18/06",
    titleSegments: [{ text: "An agent that never " }, { text: "takes the wheel", accent: true }],
  },
  {
    brand: "Away",
    href: "/work/away-agent-human",
    accent: "#2563EB",
    year: "2026",
    month: "19/06",
    titleSegments: [{ text: "Designed for the " }, { text: "moments, not the screens", accent: true }],
  },
  {
    brand: "Zepto",
    href: "/work/occasion-buying",
    accent: "#9826C9",
    year: "2026",
    month: "15/06",
    titleSegments: [{ text: "Rebuilding the aisle " }, { text: "a search box deleted", accent: true }],
  },
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

// Research. Each entry is a publication (a static title line) with two links
// beneath: the official Publication page and a readable PDF. Publication urls are
// filled in; add the PDF urls (the readable copy) where marked.
const research = [
  {
    title:
      "A Framework for Development of a Virtual Reality Environment for Building Empathy in Indian Nursing Professionals",
    venue: "Springer",
    year: "2025",
    links: {
      publication: "https://link.springer.com/chapter/10.1007/978-981-97-7190-5_33",
      // the IHIC 2023 e-book, opened straight to this chapter's first page (493)
      pdf: "/research/ihic-2023.pdf#page=493",
    },
  },
  {
    title: "Responsible and Resilient Design for Society, Volume 6",
    venue: "Springer",
    year: "2025",
    links: {
      publication: "https://link.springer.com/book/10.1007/978-981-96-5503-8",
      pdf: "#", // add the readable PDF link
    },
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
const HeroShader = lazy(() => import("./HeroShader"));
// Generic WebGL canvas for the case-study section shader boxes (golden-hour /
// iridescent). Lazy so the shaders only load on a page that uses them.
const ShaderCanvas = lazy(() => import("./ShaderCanvas"));

// Collage layout — the fourth figure asset type: a board of real exported
// images. Call it on a section with `collage: [...]`. Each entry is either a
// bare "<src>" (full-width) or `{ src, w }` where w ∈ "full" | "half" | "third"
// to control how wide that image sits. The article variant is a flex-wrap board
// that honours those widths (fulls stack; halves pair 2-up; thirds run 3-up);
// Present mode collapses to a uniform grid that always fits the slide.
function Collage({ images, variant }) {
  const items = images.map((it) =>
    typeof it === "string" ? { src: it, w: "full" } : it,
  );
  const slide = variant === "slide";
  if (slide) {
    return (
      <div className="fig-collage fig-collage--slide" role="img">
        {items.map((it, i) => (
          <img key={i} src={it.src} alt="" loading="lazy" />
        ))}
      </div>
    );
  }
  return (
    <div className="fig-collage" role="img">
      {items.map((it, i) => (
        <img
          key={i}
          src={it.src}
          alt=""
          loading="lazy"
          className={
            it.w === "half"
              ? "fig-collage__img--half"
              : it.w === "third"
                ? "fig-collage__img--third"
                : "fig-collage__img--full"
          }
        />
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
  agentWizard: AgentWizardFigure,
  agentWizardCompare: AgentWizardCompare,
  agentWizardFff: AgentWizardFFF,
  stellaOnboarding: StellaOnboarding,
  executionFlood: ExecutionFlood,
  dailyReport: DailyReport,
  figmaToCode: FigmaToCode,
  evolutionTimeline: EvolutionTimeline,
  decisionEngine: DecisionEngine,
  schedUsers: SchedUsers,
  awClarify: AwClarify,
  awHome: AwHome,
  awIntakeBrief: AwIntakeBrief,
  awSearchFlow: AwSearchFlow,
  awSmartPin: AwSmartPin,
  awResultCard: AwResultCard,
  awDeepSearch: AwDeepSearch,
  awVet: AwVet,
  awBook: AwBook,
  awConfirm: AwConfirm,
  awHub: AwHub,
  awTransit: AwTransit,
  awDisruption: AwDisruption,
  awRecap: AwRecap,
  awOnboard: AwOnboard,
  awPreDep: AwPreDep,
  schedDirections: SchedDirections,
  schedSinglePage: SchedSinglePage,
  schedStuckCart: SchedStuckCart,
  schedImpact: SchedImpact,
  schedSplit: SchedSplit,
  schedCartStates: SchedCartStates,
  schedPageStates: SchedPageStates,
  schedDateSwitch: SchedDateSwitch,
  schedGtm: SchedGtm,
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
  design,
  cover,
  variant,
  bare,
}) {
  const Fig = fig ? figures[fig] : null;
  const slide = variant === "slide";
  // Design Mode asset type: a section sets `design: { mocks: [...] }` — a
  // pixel-perfect Figma plate over directed animated regions. Sits in the same
  // figure card (`*-live`) as the coded figures, for consistency.
  if (design) {
    return (
      <div className={slide ? "slide__media-live" : "article__figure-live"}>
        <DesignFigure design={design} variant={variant} />
      </div>
    );
  }
  // Collage asset type: a section sets `collage: ["<src>", ...]`.
  if (collage) {
    return <Collage images={collage} variant={variant} />;
  }
  if (Fig) {
    return (
      <div className={slide ? "slide__media-live" : `article__figure-live${bare ? " article__figure-live--bare" : ""}`}>
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
    title: "Designing joyful learning experiences for students and teachers",
    meta: "Design Intern · Toppr · [dates]",
    cover: "Toppr",
    heroImage: "/figures/toppr/context-hero.png",
    lead:
      "Toppr is one of India's largest after-school learning platforms, used by more than 3.2 million students a day. Over an internship I worked across its product family, the practice tool, the Toppr Plus paywall, School OS, the competitive research behind conversion, and the brand's logo system, and I led design end to end on Toppr Ambassador, a new community product. The brief running through all of it: make learning feel joyful, and make a family of fast-built products feel like one product again.",
    sections: [
      {
        h: "Context & problem",
        tldr: "Studying rarely feels worth doing, and a startup's fast-built product family had drifted out of sync; my brief was both.",
        p: [
          "After-school learning lives or dies on a hard truth: studying is rarely something a student wants to do. Toppr's bet was that the right interactions (fast feedback, visible progress, a sense of momentum) could make practice genuinely enjoyable rather than just bearable.",
          "The second problem was consistency. At a startup shipping quickly, surfaces get built by different teams at different times and the experience drifts: the practice tool, the paywall, School OS, and the brand marks no longer felt like one product. My internship sat across that seam, sharpening individual surfaces while pulling them back toward a coherent whole.",
        ],
        ul: [
          "Users: students in grades 6–12, often on low-end devices and patchy networks across India",
          "Constraint: keep cognitive load low while exam-prep pressure runs high",
          "Constraint: many parallel product teams and a startup's shipping pace",
        ],
        image: "/figures/toppr/logo-lockups.png",
        figure: "The Toppr product family these surfaces span.",
      },
      {
        h: "My role",
        tldr: "A design intern contributing across several surfaces, and the design lead on one new product built from zero.",
        p: [
          "I was a design intern working across Toppr's product family. On most surfaces I contributed interaction and visual design alongside the product teams that owned them; on Toppr Ambassador I led design end to end, from the full product vision down to a shippable MVP spec. [Confirm exact title, dates, and the PMs / engineers / content partners you worked with on each surface.]",
        ],
      },
      {
        h: "Making practice feel rewarding",
        tldr: "I designed the feedback around the answer, not just correctness: animated nudges, success moments, and a daily-challenge loop to pull students back.",
        p: [
          "The practice tool was the clearest test of the joyful-learning thesis. The goal was simple to state and hard to earn: get students in grades 6–12 to practise more, and to come back on their own.",
          "Correctness alone doesn't do that, so I designed the moments around the answer. Positive and negative nudges, carried by animation, respond to how a student is doing rather than only whether the last answer was right, and success animations reward a finished set so the tool feels worth returning to. The nudge copy is written for specific situations (a streak of right answers, a rough patch, a long absence) so encouragement reads as recognition instead of noise. To give that effort a destination, I proposed a Daily Challenges layer: a light, repeatable reason to open the app each day.",
        ],
        collage: [
          "/figures/toppr/practice-question.gif",
          "/figures/toppr/practice-nudges.png",
          "/figures/toppr/practice-scenarios.png",
        ],
        figure: "The animated practice flow, the nudge states (a streak, a recovery, a win), and scenario-specific encouragement.",
        divider: true,
      },
      {
        h: "Designing the upgrade moment",
        tldr: "I rebuilt the Toppr Plus paywall as a focused value pitch, informed by how Byju's and Unacademy handled login and conversion.",
        p: [
          "Toppr Plus is the paid tier, and the paywall is where an unpaid student meets it: the screen shown when they try to open a premium feature. A paywall is pure friction if it just blocks, so the objective was to make the upgrade feel concise and purposeful, a clear answer to \"why pay\" rather than a wall.",
          "I structured it around what actually convinces: the core value up front (live classes, concepts, and video), social proof through testimonials, and two clear exits, a primary upgrade CTA and a talk-to-an-expert CTA for students who needed a human before deciding.",
          "To ground the conversion work, I ran a competitive analysis of the largest ed-tech players, Byju's and Unacademy, focused on their login flows and the factors that drove conversion. It showed where Toppr's upgrade moment was asking too much, too early.",
        ],
        collage: [
          "/figures/toppr/paywall.png",
          "/figures/toppr/paywall-2.png",
          "/figures/toppr/competitive-login-flows.png",
          "/figures/toppr/competitive-login-mobile.png",
          "/figures/toppr/competitive-conversations.png",
          "/figures/toppr/competitive-analysis.png",
        ],
        figure: "The Toppr Plus paywall, and the competitive teardown of login, conversion, and re-engagement behind it.",
      },
      {
        h: "Bringing structure to School OS",
        tldr: "School OS, the product schools run on, had a bootstrapped timetable; I gave it weekly and daily views with real structure.",
        p: [
          "School OS, the product schools run on, had a timetable that was bootstrapped and built without much design principle behind it. I gave it structure: weekly and daily views, where the daily view doubles as a student's overview of the day's learning objectives, not just a grid of periods.",
        ],
        collage: [
          { src: "/figures/toppr/schoolos-timetable.png", w: "half" },
          { src: "/figures/toppr/schoolos-dashboard.png", w: "half" },
          { src: "/figures/toppr/schoolos-classroom.png", w: "half" },
          { src: "/figures/toppr/schoolos-timetable-2.png", w: "half" },
        ],
        figure: "School OS: weekly and daily timetable views, and the dashboard that frames a student's day.",
      },
      {
        h: "One scalable logo family",
        tldr: "The marks across the Toppr ecosystem had drifted apart; I unified them into one system that scales as products are added.",
        p: [
          "The brand marks had the same drift problem at a smaller scale. The logos across the Toppr ecosystem had grown apart, so I designed a scalable logo family that brings the existing marks into one coherent system, one that still holds together as new products are added.",
        ],
        collage: [
          "/figures/toppr/logo-icons.png",
          "/figures/toppr/logo-plus-variants.png",
          "/figures/toppr/logo-icon-grid.png",
          "/figures/toppr/logo-icon-matrix.png",
        ],
        figure: "One scalable logo family: the app icons, the plus variants, and the exploration behind the system.",
      },
      {
        h: "Leading a product from zero: Toppr Ambassador",
        tldr: "The one product I owned end to end: a new addition to Toppr Community, designed as both a full vision and a shippable MVP.",
        p: [
          "Toppr Ambassador was the project I led, a soon-to-launch product within Toppr Community. Unlike the surfaces I contributed to, here I owned the design from the ground up: the full product concept and a pared-back MVP spec, so the team could ship something real and learn from it before committing to the whole vision.",
          "[Describe what Ambassador does in a line or two (the community / referral / student-ambassador concept), who it is for, and the core flow you designed. This is your strongest ownership signal, so make it concrete, and note whether it launched.]",
        ],
        collage: [
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
          "/figures/toppr/ambassador-mobile.png",
        ],
        figure: "Toppr Ambassador end to end: onboarding, dashboard, lead management, demo booking, earnings, empty states, and the mobile MVP.",
        divider: true,
      },
      {
        h: "Impact & reflection",
        tldr: "Range across a product family used by millions, plus one product owned from zero; the honest gap is outcome data.",
        p: [
          "In one internship the work spanned a real cross-section of a product used by 3.2 million students a day: the practice experience, the paid-conversion moment, a school-facing tool, the competitive research underneath it, and the brand system, plus one new product owned end to end.",
        ],
        ul: [
          "[Add real outcomes: any change in practice usage, paywall conversion, and whether Daily Challenges or Ambassador shipped and how they performed]",
          "Delivered a unified, scalable logo family across the Toppr ecosystem",
          "What I'd do differently: [one honest lesson, e.g. on trading breadth for depth across many teams, or pushing harder to instrument the practice nudges so their effect was measurable]",
        ],
      },
    ],
    todo: [
      "Exact role title, dates, and the team you partnered with on each surface",
      "What Toppr Ambassador actually is, and whether it launched",
      "Real metrics: practice-usage lift, paywall conversion, Ambassador / Daily Challenges results",
      "Annotate the screens with the decision each one represents",
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
        h: "The central question",
        tldr:
          "Adding \"later\" to a platform whose entire promise is \"now\" is a trust problem before it is a UX problem.",
        p: [
          "Zepto means instant. The moment you offer a future slot, you are asking people to trust that \"later\" will arrive exactly when promised, on the one app they use precisely because they never have to wait. So every decision traced back to a single question: how do you make \"later\" trustworthy without spending the trust that makes \"now\" work?",
        ],
      },
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
        fig: "schedUsers",
        figure: "Three high-intent moments where instant isn't the answer. The contextual prompt surfaces only when the cart can't be served now; each user has the same answer: later, not now.",
        divider: true,
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
        h: "The cart conundrum: one order, many hubs",
        tldr:
          "Zepto fulfils from tiered hubs, so a single cart routinely splits into separate shipments, and scheduling lives at the shipment level. The worst case was a four-way split where every shipment had a different answer.",
        p: [
          "Behind every Zepto order is a tiered supply chain. A Mother Hub is the largest warehouse and stocks effectively everything; it feeds two kinds of fulfilment sites: superstores, larger warehouses carrying a broad catalogue, and dark stores, the small local sites that make 10-minute delivery possible. Categories are stored deliberately, fast-moving daily items sit in the dark store close to you, while bulkier or long-tail items live only in the superstore.",
          "That topology is invisible until you build a mixed cart. Add ten things and some may be served from the dark store nearby while others can only come from the superstore, so the order does not arrive as one delivery. Zepto splits it into separate shipments, one per fulfilling site, and a single order can fan out to as many as four.",
          "Scheduling is what made the split bite. A slot is not a property of the order; it is a property of each shipment, because each shipment is fulfilled by a different site with its own capacity. So the moment someone schedules, every shipment has to answer the slot question independently, and the answers rarely agree. That produces a small matrix of cases the design had to hold all at once:",
        ],
        ul: [
          "Every shipment is schedulable for the chosen slot, the clean case",
          "Some shipments are schedulable and others are not, the common and awkward case",
          "No shipment is schedulable for that slot, so the user has to move their timing",
          "A shipment is unserviceable outright, because its store is closed or out of stock for that window",
        ],
        fig: "schedSplit",
        figure:
          "One cart, many hubs. A mixed cart fans out by fulfilling site (Mother Hub feeds the superstore and the dark store), so it ships in pieces, up to four. Scheduling is per shipment, so each answers the slot question on its own: the worst case is four shipments at once, one scheduled, one unavailable, one closed.",
        divider: true,
      },
      {
        h: "Two directions, and the sentence that decided them",
        tldr: "I ran a tabbed flow against a single-page listing; one sentence in testing killed the tidier one.",
        p: [
          "\"I might forget the slots I picked for shipment one by the time I'm choosing the slot for shipment two.\"",
          "A participant said it out loud, mid-task, and it ended a debate I had been running for weeks.",
          "The task we set was the real worst case, not the happy path: a cart with some items unavailable or unserviceable for instant delivery, and the job was to find scheduling and book the unavailable item for a later slot. Almost all real scheduling happens on exactly these mixed carts, so the test had to start there. The hard part was never the happy path; it was that Zepto splits a cart into multiple shipments, and scheduling lives at the shipment level, so one order can need a separate schedule per shipment.",
          "The two directions were nearly identical in construct and opposite in feel. One was tabbed: a tab per shipment, each holding its own instant-versus-schedule choice and slot grid, the simpler build and tidier on paper. The other kept every shipment on a single page, switchable in place. Because people almost always had more than one thing to schedule, the tabbed flow broke: the moment you moved to shipment two, what you had chosen for shipment one was on another tab and out of view. No running summary, no confirmation to hold onto, so people lost the picture and stopped trusting the earlier choice had even saved.",
          "The single page won, and not because it was prettier. It kept the summary of your own actions in front of you the whole time: every shipment and its chosen slot stayed visible, so scheduling across shipments stayed legible. A persistent summary is itself a trust mechanism: you commit to \"later\" because you can see exactly what you committed to. I killed the simpler flow and spent the craft on making that dense, stateful page feel effortless.",
        ],
        fig: "schedDirections",
        figure: "Before and after. Left, the killed tabbed direction: move to shipment two and shipment one's chosen slot is on another tab, out of view. Right, the shipped single-page listing: every shipment and its chosen slot stay visible at once.",
        divider: true,
      },
      {
        h: "Then the real work: grinding one page to ground",
        tldr: "Choosing one page settled the concept, not the interaction; where each control lived took numbered iterations.",
        p: [
          "Picking the single page was the start, not the end. A flexible, stateful page is easy to make overwhelming, so most of the craft went into the opposite: making density feel obvious. The open questions were where every control should live, whether the slot picker should be a bottom sheet or sit inline, which shipment should be open on arrival, and how to keep five shipments legible at once. It ran for several numbered iterations before it landed.",
          "Where it landed:",
        ],
        ul: [
          "The slot picker sits inline inside the expanded shipment, not in a bottom sheet, so picking a slot never pulls you away from the other shipments you still have to handle [add the one-line reason inline beat the bottom sheet]",
          "The shipment you arrived from expands by default; the rest stay collapsed but visible, status readable at a glance, so context is never lost",
          "Per shipment, a clear instant-versus-scheduled toggle, then the inline slot picker, with a Today and Tomorrow day row at launch (a later iteration dissolved that day boundary, the next section)",
          "Non-intrusive go-to-market, surfaced only where it helps (a homepage prompt when demand is high and the cart is not serviceable; the primary entry on the cart) rather than pushed everywhere",
          "Considered empty and exit states: what to save when someone leaves mid-flow, how each shipment's status reads at a glance, and an OTP screen tuned for a scheduled order",
        ],
        fig: "schedDateSwitch",
        figure: "The shipped slot picker, rebuilt from the real component: switching Today and Tomorrow re-animates the slot list. The detail that earns trust is honesty about supply, today is partial because earlier slots have already passed, while tomorrow opens a full day, so the day row is doing real work, not decoration.",
        divider: true,
      },
      {
        h: "One scroll across midnight",
        tldr: "The Today and Tomorrow day row shipped first; a later iteration dissolved the midnight boundary into one continuous scroll, because someone scheduling at 11pm is planning tonight-a-bit-later, not tomorrow.",
        p: [
          "The day row worked, but it carried a quiet assumption, that midnight is a wall. For the late-night shopper it is not. Someone picking a slot at 11pm is not planning tomorrow, they are planning tonight, a little later, and a hard jump from today's slots to a separate Tomorrow tab broke that thought in half.",
          "So a later iteration removed the seam. The slots became one continuous scroll across the day's edge: tonight's 11 to 12 window sits directly above tomorrow's earliest, no tab to switch and no page jump to re-orient around. It reads as a single timeline because that is how the moment is lived, late tonight and early tomorrow as one shopping decision rather than two calendar days. [Confirm against the shipped scroll: exact slot labels and where the day divider sits.]",
        ],
        fig: "schedSinglePage",
        figure:
          "The continuous cross-day scroll: the slot list runs straight past midnight, tonight's last window meeting tomorrow's first in one timeline, no jarring page jump, because late tonight and early tomorrow are the same shopping moment.",
        divider: true,
      },
      {
        h: "The go-to-market: showing up only when it helps",
        tldr:
          "A new behaviour on a 10-minute platform lives or dies on how it is introduced, so the go-to-market was deliberately restrained, framed by a small animated banner at the top of the schedule page and a prompt that appears only when instant cannot serve the cart.",
        p: [
          "Push a new option everywhere and it reads as clutter that quietly dilutes the instant promise; hide it and no one finds it. So the go-to-market was a design problem in its own right: surface scheduling only where it earns its place, and let motion do the introducing rather than a hard sell.",
          "On the schedule page, an animated banner sits at the very top, a small, friendly motion that frames the feature the moment you arrive in the flow. Away from it, the prompt to schedule appears only when it genuinely helps, when demand is high and the cart is not serviceable for instant, so it meets a real need instead of interrupting a working one. [Confirm the exact go-to-market surfaces and any banner copy.]",
        ],
        fig: "schedGtm",
        figure:
          "The go-to-market motion at the top of the schedule page: a calm animated promo that frames scheduling as you arrive, restrained so it never competes with the instant promise. [Coded stand-in for the real banner animation; swap with the production Lottie.]",
        divider: true,
      },
      {
        h: "Designing for the cart that stays stuck",
        tldr: "The hardest state was a cart that stays unserviceable even with a schedule; I designed it in plain sight, not hidden.",
        p: [
          "The test scenario was deliberately the worst case, and it was also the hardest state to ship: a cart where an item stays unserviceable even with scheduling, because of a live supply gap. The instinct is to hide the broken thing. I did the opposite. The unserviceable shipment is flagged in place, with the honest consequence stated up front (the items are unavailable and will be removed on save) and, where a store is simply closed, an option to schedule for when it reopens.",
          "Showing the failure honestly is the same trust argument as the rest of the feature: people forgive a clear \"we cannot do this part\" far more than a cart that silently drops items. This state took months of UX-and-ops work to tame, and getting it right mattered more to trust than any happy-path screen. [Confirm this matches the shipped solution.]",
        ],
        fig: "schedStuckCart",
        figure: "The hardest state, shown in plain sight: the unserviceable shipment is flagged in place, the consequence stated up front (these items are removed on save), and where a store is simply closed, an option to schedule for when it reopens.",
        divider: true,
      },
      {
        h: "Every cart-page state we handled",
        tldr:
          "The cart page is where each shipment's fate resolves before you ever schedule, so the real design surface was a serviceability matrix, not a single screen. I drew and shipped every combination.",
        p: [
          "On a platform built on instant, the cart is the moment of truth: it has to read honestly whatever the supply situation is. Because one cart can split up to four ways and each shipment can be in a different state, the cart page is not a screen, it is a matrix. The job was to make every cell of that matrix legible, from the clean all-instant cart to the worst-case four-way mix, without the page ever feeling like an error log.",
          "So I mapped and designed each case rather than the happy path plus a catch-all. Every one of these is a real state the cart can land in:",
        ],
        ul: [
          "A single shipment, instant: the default 10-minute path, no scheduling surfaced at all",
          "Several shipments, all instant: nothing to schedule, the option stays out of the way",
          "One shipment scheduled, the rest instant: the common mixed cart",
          "Every shipment scheduled: a fully planned, later order",
          "Some shipments served, others unavailable for the slot: flagged in place, removed on save",
          "A shipment from a closed store: offered a slot for when it reopens",
          "The four-way split, scheduled, unavailable and closed shipments in one cart: the worst case we set as the test task",
          "An entirely unserviceable cart, nothing now and nothing later, said plainly, plus the contextual prompt that surfaces only when the cart cannot be served now",
        ],
        fig: "schedCartStates",
        figure:
          "The cart-page matrix, one tile per case: every combination of instant, scheduled, unavailable and closed shipments across a one-to-four-way split, each designed so the cart reads honestly. [Reconcile against the shipped set, exact labels and counts.]",
        divider: true,
      },
      {
        h: "Every scheduled-page state we handled",
        tldr:
          "The slot picker is the dense, stateful page, so I mapped its full state set, from the default arrival through the empty and confirmation states, and designed each so density never tipped into confusion.",
        p: [
          "If the cart page is the matrix, the scheduled page is the one screen where all that complexity has to feel effortless. A flexible, stateful page is easy to make overwhelming, so the work was the opposite: give every situation a deliberate state rather than letting the page degrade. That meant designing the empty and failure states with the same care as the happy path, because on a trust feature those are exactly the moments that decide whether someone schedules again.",
          "The full set I designed for the page:",
        ],
        ul: [
          "Default arrival: the shipment you came from expanded, the rest collapsed but visible",
          "Instant versus scheduled, per shipment: the toggle that starts every choice",
          "The inline slot picker, revealed in place, never a bottom sheet that hides the other shipments",
          "A slot picked: the chosen one-hour window held in the running summary",
          "Today booked out: tomorrow's slots lead, so the page is never a dead end",
          "No slots at all for a shipment: an honest empty state, not a silent failure",
          "The continuous cross-day scroll: tonight's last slot meets tomorrow's first, no jarring jump",
          "A partial schedule: some shipments set, some still instant, the summary keeping it legible",
          "Empty and exit states: what to save when someone leaves mid-flow",
          "An OTP and confirmation screen tuned for an order that arrives later",
        ],
        fig: "schedPageStates",
        figure:
          "The scheduled-page state set, one tile per case: default, instant, scheduled, slot picked, today-full, no-slots, cross-day, partial and the scheduled OTP, each designed so a dense page stays effortless. [Reconcile against the shipped set.]",
        divider: true,
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
        fig: "schedImpact",
        figure: "The behavioural shift: because the order is for later, people plan and build a bigger cart. Average order value roughly doubled for scheduled orders; adoption settled around 2.1%; predictable timing let operations batch scheduled with live orders.",
        divider: true,
      },
      {
        h: "The same slots, in reverse: returns and refunds",
        tldr:
          "Once scheduling existed for delivery, the same one-hour slots became the backbone of a self-service returns and refunds flow, the reverse trip, with the refund made instant where it mattered most. [Confirm the R&R scope, the bot's nature, and the outcome.]",
        p: [
          "Returns are where consumer trust is quietly won or lost, and they are usually where you end up talking to support. With scheduling already built, the reverse trip became something you could self-serve: choose the items to send back, decide how the money comes back, and book the pickup on the very same one-hour slots that power delivery. [Confirm the exact framing of the R&R (returns and refunds) bot, and whether it is a guided self-service flow or a conversational assistant.]",
          "Two decisions carried it. The refund method is a speed-versus-source choice made legible: instant store credit (Zepto Cash, credited the moment you confirm) sits against a refund to the original account (3 to 5 working days), so the trade between speed and where the money lands is the user's to make, both stated plainly. And the pickup reuses the exact scheduled-delivery slot picker, including the same honest instant-is-unavailable-schedule-it-for-later fallback when reverse-logistics capacity is tight, so the dense, stateful page I had already ground to ground did double duty.",
          "[Confirm the problem this replaced (support-driven returns, slow or opaque refunds, or both) and any outcome: support deflection, refund time, return-completion rate, and your role and dates on it.]",
        ],
        ul: [
          "Item selection for return, with the refund total shown live",
          "Refund method as a speed-and-trust choice: instant Zepto Cash against a 3 to 5 day refund to source",
          "Pickup booked on the same one-hour slots, with the instant-unavailable-schedule-later fallback",
          "Return guidelines stated up front (unused, original condition, tags and labels intact) so a pickup does not bounce at the door",
          "A confirmation that names the slot and the address, with a short self-attestation before Confirm",
        ],
        figure:
          "The self-service returns screen, real from the Schedule Order Handoff file: the items to return and the refund total, the instant-versus-source refund choice, and pickup booked on the same slot picker as delivery. [Plate the real Review Items screen, or rebuild the refund-method choice as a focused figure.]",
        divider: true,
      },
      {
        h: "Reflection",
        tldr: "The real challenge was perception: keeping a scheduled option from diluting the instant promise.",
        p: [
          "The subtlest problem wasn't UX at all; it was perception. Zepto means instant; a scheduled option can feel counter to the whole brand. The answer was restraint: surface it only when it genuinely serves the user, and never let it dilute the 10-minute promise.",
          "What I'd revisit: we shipped with one-hour slots and no order editing, deliberate trade-offs to launch, not ideals. Editing came later; finer-grained slots never did.",
          "Should the platform drop 10-minute delivery? I don't think so; instant is the moat, and without it Zepto becomes just another scheduled marketplace. But this work proved there's a real, high-value segment whose need is the opposite of instant, and meeting it quietly made the core product stronger.",
        ],
      },
    ],
    todo: [
      "Team and timeline: PM, eng, ops, and research partners, plus the dates",
      "One line: why the inline slot picker beat the bottom sheet",
      "Confirm the shipped unserviceable-cart solution (frames show items removed on save, plus schedule-for-when-we-open)",
      "Reconcile the coded story figures against the real Schedule Order frames (slot labels, the exact AOV and adoption numbers, the shipped stuck-cart copy)",
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
      "Dassh builds Stella, an AI recruiter that does the execution work of hiring: screening CVs, calling and messaging candidates, running first-round interviews, and keeping the ATS up to date, so the people stay free for judgement. I joined as a design consultant and a director to build the product from zero, the four experiences it ships as, the system that lets anyone create an AI hiring agent, and the design system that turned Figma files into production code. Stella now runs live hiring for enterprises like Zydus Lifesciences, Increff, Cholamandalam and Atomberg. Over 2025 the work took it from zero to those pilots and, as the year closed, a ₹1.2 crore raise.",
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
        fig: "executionFlood",
        figure:
          "The execution flood: a role goes live and CVs pour in faster than anyone can read, the work that buries hiring.",
        divider: true,
      },
      {
        h: "My role",
        tldr: "Design consultant and director: I owned product design from zero and helped turn pilots into a company.",
        p: [
          "Across 2025 I was Dassh's design consultant and a director, which was two jobs at once. The hands-on one was owning product design end to end. There was no product yet, so I defined the information model, the four experiences Dassh ships as, the agent-creation system, the daily report, and the design system underneath all of it. The director one was helping shape the company around the product: working with the founder on positioning, and contributing to the deck and the fundraising conversations.",
          "The founding team was four people: I was the only one on product and design, alongside three engineers. With a surface this broad and a team this small, the constraint was never ideas, it was throughput, how to design four distinct experiences and ship them with three engineers. That constraint shaped almost every decision that follows, including the design system that ended up writing its own code.",
        ],
      },
      {
        h: "The bet: an AI employee, not another tool",
        tldr: "We deliberately rejected building one more recruiting dashboard and designed Stella as a teammate you hire, not a tool you operate.",
        p: [
          "The obvious version of this product is a dashboard with AI features bolted on, a smarter ATS. We killed that direction early. The market is full of tools that give recruiters more buttons to push, and more buttons is the opposite of the problem. The execution load does not drop when you add a feature, it drops when someone else does the work.",
          "So we framed Stella as an AI employee, not an automation tool. The line we kept coming back to put it plainly: recruiters do not need another tool, they need a teammate. You do not configure Stella so much as brief her, the way you brief a new hire: tell her the role, hand her the criteria, point her at the candidates. She works continuously, goes live in about a day or two, runs several roles at once, and evaluates every candidate the same way. The framing was not a tagline, it set the design bar. Every screen had to read like working with a capable colleague, not operating software. Where a normal SaaS would show a settings panel, we showed a conversation.",
        ],
        split: "media",
        image: "/figures/dassh/stella-chat.jpg",
        figure:
          "Stella as a teammate: the conversational home where a hiring manager briefs a role instead of filling out a form.",
        divider: true,
      },
      {
        h: "Designing for four people, not one",
        tldr: "The same hiring data, surfaced as four purpose-built experiences, because a founder, an agency recruiter, a manager and a candidate do not want the same product.",
        p: [
          "Hiring is not one user. The founder who wants to ask a question, the agency recruiter living in the product eight hours a day, the manager checking in between meetings, and the candidate on the other end all think differently. Rather than ship one interface and water it down for everyone, I designed four, all reading from the same underlying data and all anchored to the same atomic unit, the job.",
          "Stella is the chat-first experience: full screen, almost no chrome, the conversation is the interface. The agency view is the dense power-user surface: tables, filters, kanban, bulk actions, built for speed. The manager view is summary-first, the system writes the first thing you see, with green, amber and red health signals so a glance is enough. The candidate experience is a light portal plus the messages, calls and interviews the agents run, designed to feel like texting a helpful person rather than navigating a portal.",
        ],
        fig: "stellaOnboarding",
        figure:
          "Onboarding is a conversation: Stella greets you and guides setup, connect the ATS, set preferences, pick a plan, ticking the checklist off as you go.",
        divider: true,
      },
      {
        h: "Making an AI agent anyone can create",
        tldr: "One four-step creation flow that turns hiring intent into a working agent, with smart defaults for the unprepared and full control for power users.",
        p: [
          "Under the four experiences sits a system of purpose-built agents, screening, calling, interview, scheduling, messaging, note-taking, each owning one step of the pipeline. The hard design problem was creation: how does a recruiter turn what they want into a working agent without learning a new vocabulary?",
          "I designed creation as one consistent four-step flow, the same spine for every agent type: link it to a job, define what it should evaluate, give it candidates, set what happens next. The evaluation step became the heart of it, a checklist where each criterion is tagged Essential, Valuable or Not preferred, so the recruiter's priorities are legible to both the AI and any human reviewer. Because people arrive with different levels of preparation, every step supports multiple paths: pick a template, generate one with AI from the job description, or upload your own. Opinionated defaults for the unprepared, full control for the power user.",
          "Rather than open with every option, the entry collapses to a few clear intents, hire for a role, screen existing candidates, call and qualify, with the rest tucked behind progressive disclosure. And the screening agent returns more than a yes or no: a match score, skill and experience breakdowns, a gap analysis and a priority ranking, so a human can audit the call in seconds instead of re-reading the CV.",
        ],
        fig: "agentWizardFff",
        figure:
          "The four-step creation flow: link a job, define what to evaluate, add candidates, set what happens next, the same spine for every agent.",
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
        h: "How the use case evolved",
        tldr: "[One line: how users' use of Stella grew, e.g. from a screening assist to a full hiring teammate.]",
        p: [
          "[Replace with the real evolution story: what users first hired Stella to do, and how that widened as the pilots proved each step. The scaffold below is a placeholder framing.]",
          "Early on the use was narrow: [the first job users trusted Stella with, e.g. screening the inbound flood]. As that earned trust the use case widened, [calling and qualifying], then [running first-round interviews], then [scheduling, messaging and keeping the ATS current], until Stella was operating the whole execution layer of a role rather than a single task.",
        ],
        fig: "evolutionTimeline",
        figure:
          "How the use case grew: the surface morphs from a screening list to a dashboard to a holistic workspace to a grid of agents running.",
        divider: true,
      },
      {
        h: "The homepage is a daily report",
        tldr: "Instead of a dashboard you have to read, the homepage is a generated briefing: what is broken, what needs you, what happened.",
        p: [
          "Most hiring software opens to a dashboard and leaves you to do the reading. I designed the Dassh homepage as a generated report instead, different every time because it reflects what actually changed since you were last there. It answers three questions in order of urgency: what is broken, a stalled pipeline or a failing agent, comes first; what needs you, the decisions only a human can make, like approving a shortlist, comes next; and what happened, the momentum, comes last.",
          "The same report adapts to the reader. The agency recruiter gets it dense and numbers-forward. The manager gets it as a short written narrative with health cards. In chat, Stella simply tells you, and can act on it in the same breath. It reaches people where they already are, in the app, as a morning email, and as a WhatsApp message from Stella.",
        ],
        fig: "dailyReport",
        figure:
          "The homepage as a briefing that writes itself, broken first, decisions second, momentum last, regenerated since your last visit.",
        divider: true,
      },
      {
        h: "A design system that wrote its own code",
        tldr: "To ship four experiences with a tiny team, I built a design system wired to an engine that turned approved Figma frames into production React.",
        p: [
          "Four experiences and a handful of engineers do not add up unless design output stops being the bottleneck. So the most unusual piece of this project was infrastructure: a design system connected to an engine that converts Figma straight into production code. When I marked a component Ready for Dev in Figma, the engine picked it up, generated the React and CSS, compared the result against the design with a visual diff scored out of 100, and dropped it into Slack. The engineer polished the last few percent and wired up the logic.",
          "This changed what one designer could be worth. The quality of the generated code was a direct function of design hygiene, clean frame names, real component descriptions, tokens instead of hardcoded values, so the design system was not decoration, it was the contract that made the pipeline work. It is the clearest example of the project's core constraint, breadth on a small team, turned into a design decision.",
        ],
        fig: "figmaToCode",
        figure:
          "The Figma-to-code engine: mark Ready for Dev, the engine generates React and scores a visual diff out of 100, then drops it to the team.",
        divider: true,
      },
      {
        h: "From pilots to a company",
        tldr: "The product was also the pitch: real enterprise pilots became the evidence that built a team and raised a round.",
        p: [
          "Because I was a director as much as a designer, the product and the company were the same work. The enterprise pilots were not just customers, they were proof. Zydus moved to real-time shortlisting, engagement and first-round interviews within two days of a posting, with the AI working inside their existing ATS, which helped them centralise hiring and stand up a global capability centre. Increff put Stella against that 3,000-resume week and got instant screening, stack-ranked candidates, and automated outreach over WhatsApp and AI calls.",
          "Those stories did the convincing. They anchored the deck, the one-pagers and the fundraising conversations, and the named logos, Zydus, Increff, Cholamandalam, HCPL, Atomberg, Tophire, became the credibility the company raised on. As the year closed, that evidence turned into a ₹1.2 crore round, and the company that started as four people grew to around twenty.",
        ],
        split: "media",
        image: "/figures/dassh/clients.jpg",
        figure:
          "The enterprises running live hiring on Stella, the proof the deck and the fundraise were built on.",
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
          "Built in a year from zero to a ₹1.2 crore raise (about $140K) as 2025 closed; the founding four grew to a team of around twenty",
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
      "Pilot-outcome metrics with baselines: time-to-hire reduction, cost saving, interview-to-offer lift (deferred with the pilot section)",
      "Verify before publishing: '100+ CVs in about 3 minutes' and 'about 95% screening accuracy' (these came through as unverified marketing claims)",
      "Two or three concrete pilot-driven design changes (before, insight, after) for 'What the pilots changed' (you're handling this later)",
      "Two figures still need art (best as Figma exports or a diagram): the daily-report homepage and the Figma-to-code pipeline. The other four are wired from the deck.",
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
        shader: "golden",
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
        shader: "iridescent",
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
  "away-agent": {
    accent: "#2563EB",
    eyebrow: "Away · Case study",
    title: "An agent for the whole trip, that never takes the wheel",
    meta: "Founding Designer · Away · 2026",
    cover: "Away",
    board: ["AWAY", "NOT A WRAPPER, \nTHE WHOLE CASE", "OWNS IT, NEVER \nTAKES THE WHEEL"],
    lead:
      "Most AI agents are a chat box with good manners: they answer, and then they disappear. But the hard part of almost any job is not the answer, it is the follow-through, the failure, the 2am call, and a thing that forgets you on close can never reach it. Away is built the other way, to own the whole case, not the turn: a travel agent you keep that finds the flight, vets it, books it, watches it for months, and steps in when the trip goes wrong, and talks to you like the friend who just got back from that exact trip. The hard design problem was holding two opposites at once, an agent complete enough to do all of that and disciplined enough to never take the wheel: it does the figuring-out, you still travel. I led design end to end as the only designer on a five-person founding team, across the entire trip lifecycle, tuning how much the agent says, does, and decides at every moment from the first search to a cancelled flight at 2am. We shipped v1, and in its first week, live to an invite-only group, it was already doing around ₹50K in bookings a day, and the number has only grown since.",
    sections: [
      {
        h: "The bet",
        tldr: "Most agents fail the same way, as wrappers that answer a turn and vanish, when the value lives in owning the whole case over time, especially the hard parts no one wants to do.",
        p: [
          "The mistake almost every AI agent makes is to optimise for the turn: answer a question well, then be gone. But booking a flight is the part everyone competes on, and a booking is rarely the hard part of travel. The hard parts come later: the cheap fare that quietly hides a self-transfer, the schedule change three weeks out, the connection you are about to miss, the compensation you are owed and never claim. A chat box that disappears after the answer cannot touch any of it, which is exactly where the value is.",
          "So Away is built to own the case, not the turn. That reframes the problem from 'a better booking flow' into 'a relationship across the whole trip', a much larger and stranger thing to design: the agent has to be present for months without nagging, sharpen as departure nears, go calm and competent in a crisis, and celebrate when it all works. And there is a second trap on the other side, the over-correction to a wrapper is an agent that takes the wheel and breaks trust the first time it is wrong. So the real target is completeness without autonomy: present and prepared for every step, and still leaving the commit to you. It does the figuring-out; you still travel.",
        ],
        ul: [
          "The failure mode of most agents: a wrapper that answers a turn and forgets you, when the real job lives across time",
          "The value is the whole lifecycle, find, vet, book, watch, rescue, remember, not just the booking",
          "Two kinds of crisis to design for: the app failing you, and the trip failing you",
          "Completeness without autonomy: do the whole job, and never take the wheel, one wrong move and it is a chauffeur",
          "Indian travellers are trained on OTAs, so the familiar habit of scroll-and-pick has to survive inside the new thing",
        ],
      },
      {
        h: "My role",
        tldr: "[Sole] designer on a small founding team; I designed the agent across the full trip lifecycle, its behaviour, its surfaces, and the voice it speaks in.",
        p: [
          "I led design end to end as the only designer on a five-person founding team: the CEO, the CTO, two developers, and me. My remit was the agent as a whole experience, not a set of screens.",
          "Concretely, I designed how the agent searches, vets and recommends, how it gates the booking, and how it behaves across every phase of the trip after, including the disruption moments. I also owned the voice: the line between when the agent is allowed an opinion and when it goes quiet, which on a product where the words are the product is itself most of the design.",
        ],
      },
      {
        h: "The dial",
        shader: "golden",
        tldr: "The agent has a strong personality, and the craft is knowing when to turn it down: loud and opinionated when it is winning for you, quiet and calm when your money is moving or the trip is breaking.",
        p: [
          "The brand gave me the spine. Away is the friend in the trade: warm and generous pointed at you, dry and unimpressed pointed at the airlines and OTAs that profit from your confusion. The enemy is never the traveller; it is the industry. So the agent has a real point of view, and the whole design is one question asked at every moment: which way is it facing, and how loud is it?",
          "I think of it as a dial. The edge runs free where the agent is on your side against the industry, the verdict on a search, the warning about a trap, the compensation you are owed. It softens to plain and calm exactly where you are exposed, the first thirty seconds, anything touching money, any error. And it goes all warmth, zero edge, in a real crisis, because a joke in the wound is unforgivable. 'Crisis' and 'delight' are not two piles of screens; they are the two ends of that one dial, and this case study is the dial.",
          "Two rules hold it all together. The agent does the work of the best human agent on the phone and then exceeds it, the long price watch, the passport check, the compensation claim, things no human agent actually does. And it never takes the wheel: it prepares, recommends, and hands off, but the person always commits. One skill runs the length of it, negotiation, the same muscle that beats the fare is what has your back when the trip goes wrong.",
        ],
        figure:
          "The dial: the agent is loudest when it is winning for you against the industry, and quietest when your money is moving or the trip is breaking. [Add the lifecycle dial infographic.]",
        divider: true,
      },
      {
        h: "Onboarding",
        group: "Zero state",
        tldr: "The first thirty seconds set the relationship: the boot is framed as the concierge waking, the agent is named to you immediately, and the gate is generous, the whole agent is free and only booking is invite-only.",
        p: [
          "Before the agent does anything, it earns the room. The loading screen is not 'Loading', it is 'Activating your concierge', so the show-the-work principle starts at second one. You give a name and the next screen is already personal, and every input state is designed, the OTP idle, typing, verified, error and resend, because a stumble here is the first impression.",
          "Then the gate, the most generous version of a private club: the whole agent is yours for free, to search, vet, watch and rescue. Only the booking sits behind an invite, so you feel the value before you are ever asked to commit.",
        ],
        fig: "awOnboard",
        figure:
          "Onboarding: the concierge wakes (the boot as a ritual), a named welcome, every OTP state, and the freemium gate, free agent and invite to book.",
        divider: true,
      },
      {
        h: "The home",
        group: "Zero state",
        tldr: "The home meets you where you are, the input expands from a sentence into only the fields it needs, and the result is not a wall of fares but a vetted shortlist with the traps flagged.",
        p: [
          "The home adapts to how well the agent knows you. A stranger lands on a convince-first surface, the agent showing what only someone in the trade would know, a route at a three-month low, a season about to peak, with a calm input waiting. A regular lands input-first, their trips and watches on top. You can type, speak, or paste a screenshot of a fare you found elsewhere, and as you go, a single input blooms into just the structured pickers it still needs, location, dates, travellers, so the fast path is never blocked by a form.",
          "The agent does not interrogate your preferences; it infers them and reflects them back with a point of view, the friend who knows the route, not a dumb echo: 'mid-December is brutal on this one, want me to peek at the week after?' And when your wants conflict, it does not silently pick one. It names the fight and claims it as the work: 'cheap and lie-flat usually fight on this route, that gap is the part worth working.' That single turn is the whole product in a sentence.",
          "Then the result. Indian travellers are trained to scroll a list and pick, so I did not fight that. The agent gives you a list, but one it has already vetted: sorted by which is right rather than merely cheapest, the traps flagged inline with the reason, a hidden self-transfer, a connection one in four people miss, and the fares the OTAs bury surfaced. Even the honest no-win is a trust moment: when the negotiation cannot beat the public fare, the agent says so plainly, shows the work it did, then goes back and offers nearby dates or a reroute, because the one thing no OTA will ever tell you is that you already have the best price.",
        ],
        fig: "awHome",
        figure:
          "The adaptive home: convince-first for a stranger (insider proof), the single input blooming into the pickers it needs, and input-first for a regular with the watched trip on top.",
        divider: true,
      },
      {
        h: "Time of day",
        group: "Zero state",
        tldr: "The same home greets you differently through the day: the sky behind it shifts from a bright morning to a golden hour to a calm night, so the agent feels present rather than generic.",
        p: [
          "Most apps open to the same screen at 7am and at 11pm. Away's home reads the clock. The greeting holds steady while the sky behind it moves with the day, a bright morning, a golden-hour evening, a quiet night, so the first thing you see already feels set for the moment you arrived in.",
          "These are the exact production screens, pixel for pixel, with only the sky brought to life. It is a small touch with a specific job: a home that feels alive and personal lowers the cost of trying an unfamiliar behaviour, while everything that has to stay legible, the greeting and the input, stays perfectly still.",
        ],
        design: {
          w: 360,
          h: 791,
          bg: "#0e0e12",
          label:
            "The Away home at three times of day: a live morning sky, a golden-hour evening, and a late-night glow behind the same greeting.",
          mocks: [
            {
              base: "/figures/away-agent/greeting/morning-ui.jpg",
              alt: "Away home in the morning, the greeting over a bright cloud sky.",
              regions: [
                { box: [0, 0, 100, 30], kind: "shader", preset: "clouds", dark: false, blend: "screen", maskFade: [52, 100] },
              ],
            },
            {
              base: "/figures/away-agent/greeting/evening-ui.jpg",
              alt: "Away home in the evening, the greeting over a golden-hour sky.",
              regions: [
                { box: [0, 0, 100, 30], kind: "shader", preset: "golden", dark: false, blend: "screen", maskFade: [52, 100] },
              ],
            },
            {
              base: "/figures/away-agent/greeting/night-ui.jpg",
              alt: "Away home late at night, the greeting over a calm dark glow.",
              regions: [
                { box: [0, 0, 100, 30], kind: "shader", preset: "iridescent", dark: true, blend: "screen", maskFade: [52, 100] },
              ],
            },
          ],
        },
        figure:
          "The Away home at three times of day, a live morning sky, a golden-hour evening, and a late-night glow behind the same greeting. The exact Figma screens, with only the directed sky region animated.",
        divider: true,
      },
      {
        h: "Slow decision",
        group: "Zero state",
        tldr: "A flight is bought over weeks, not minutes, so the home is a re-entry surface, not a launchpad.",
        p: [
          "People shop a fare across about 45 days and dozens of visits, and abandon most of it. So the zero state is built to win the return: it drops you onto the one thing you were closest to acting on, and reads differently each visit.",
        ],
        screen: "The home as a re-entry surface, the returning traveller dropped onto their nearest unfinished decision.",
        divider: true,
      },
      {
        h: "Return visit",
        group: "Zero state",
        tldr: "The same home slot becomes a different card by where you left off.",
        p: [
          "Three returns earn the top of the screen: a watched fare that moved, a held booking with the clock kept honest, and a search you wandered off from, seeded with what changed. One slot, the right card for each person.",
        ],
        screen: "One home slot, three returns: a price that moved, a held booking, an abandoned search.",
        divider: true,
      },
      {
        h: "The brief",
        group: "Search",
        tldr: "The agent collects a complete brief as a conversation, never a form, and reads a messy all-at-once request just as well as a tidy one.",
        p: [
          "A good search needs a lot of facts, so the agent gathers them one tappable question at a time, in a deliberate order, and never asks twice for where you fly from, that is captured the moment you open the app. The preferences you give last, direct only, extra bag, cheapest, low cancellation, become the lens it vets with later.",
          "And not everyone answers one step at a time. One client typed a single paragraph carrying eleven constraints at once, two flexible origins, a date range with tolerance, carriers to avoid, a stop limit, a transit-visa rule. The agent pulls each out into a structured brief, so the messy, real request is never the worse path.",
        ],
        fig: "awIntakeBrief",
        figure:
          "A real test-run brief, untangled: one paragraph carrying eleven constraints, each pulled out and turned into a structured field.",
        divider: true,
      },
      {
        h: "Asks first",
        group: "Search",
        tldr: "A wrong guess is cheap in a chatbot and expensive in a booking, so when the agent is missing a detail it asks, and the input box you are already looking at morphs into a tappable card.",
        p: [
          "If you type just a city, the agent does not invent dates and start spending. It asks. But a question that scrolls up the thread is where chat interfaces get awkward, so the question is not a chat bubble: the composer morphs in place into a card, the question on top and tappable options below. Tapping one sends it as your answer instantly.",
          "Because only the latest question ever lives in that one slot, stale cards are structurally impossible, there is nothing to clutter and nothing to clean up. Under the hood an answer is just an ordinary message, the same path as anything you type, so the design stays honest to how the system actually works. The whole pattern is a trust mechanism wearing the clothes of an input field.",
        ],
        fig: "awClarify",
        figure:
          "The composer morphs in place into a clarifying-question card: the agent asks rather than guesses, a tap sends the answer, and only the latest card ever shows.",
        divider: true,
      },
      {
        h: "The wait",
        group: "Search",
        tldr: "A real negotiation takes a couple of minutes, so the agent narrates it as a live timeline built from your own flights, and holds an honesty line: it names the category of work truthfully without claiming a step it cannot guarantee.",
        p: [
          "Negotiating across hundreds of supplier fares is not instant, and a blank spinner for two minutes reads as broken while hiding the work that justifies the price. So the agent narrates: a live timeline built from your actual airlines and routes, scanning inventory, cross-referencing supplier prices, negotiating bulk rates, scoring your options. It leans on the labour-illusion principle, that visible effort is trusted and valued more than a number that simply appears.",
          "I held a clear line on honesty here. The narration names the category of work truthfully and never claims a specific action the system cannot guarantee, and it resolves on the one thing that is unambiguous, the money: the public fare struck through, the negotiated price beside it.",
        ],
        fig: "awDeepSearch",
        figure:
          "The deep-search timeline: the agent thinking out loud, a live sequence built from your flights, resolving on the savings reveal.",
        divider: true,
      },
      {
        h: "Trap check",
        group: "Search",
        tldr: "Indian travellers are trained to scroll a list and pick, so the agent gives them a list, but one it has already vetted, sorted by what is right, with the trap flagged and the negotiated win shown against the public fare.",
        p: [
          "A search engine stops at 'here are flights'. Away's promise pays off here: the list is sorted by which is right, not merely cheapest, and the trap is flagged inline with the reason, a hidden self-transfer, a connection one in four people miss. That warning, the agent spending its own credibility to talk you out of a cheaper option, is the highest-trust moment in the product.",
          "You still drive, scroll and pick a couple to negotiate, and the payoff is unmistakable: the public fare struck through, the negotiated price beside it. The honest no-win is a trust moment too, when nothing beats the public fare the agent says so plainly and goes back to offer nearby dates or a reroute.",
        ],
        fig: "awVet",
        figure:
          "The vetted listing: sorted by what is right, the trap flagged with its reason, you pick a couple to negotiate, and the public fare struck through for the new one.",
        divider: true,
      },
      {
        h: "The verdict",
        group: "Search",
        tldr: "A results card is an argument in six layers, not a list.",
        p: [
          "The card carries the whole round trip, a price-by-date strip when you are flexible, a lens that re-ranks and constraints that filter, the agent's pick with the fine print on tap, the real edge over the OTAs, and one or two defensible reasons. It renders a verdict, then lets you overrule it.",
        ],
        fig: "awResultCard",
        divider: true,
      },
      {
        h: "One thread",
        group: "Search",
        tldr: "One chat holds every output, so a smart pin keeps it navigable.",
        p: [
          "Search, negotiation, booking, boarding pass, rescue all live in one conversation. A pinned bar at the top, the WhatsApp pattern made agent-managed, always points at what matters now and jumps you there, so the single thread keeps its soul without becoming a maze.",
        ],
        fig: "awSmartPin",
        divider: true,
      },
      {
        h: "The gate",
        group: "Book",
        tldr: "The whole agent is free; only the booking sits behind an invite. The gate proves the engine with a few real fares and locks the rest, and the agent never charges a card without your tap.",
        p: [
          "Away is invite-only, but I gated the booking, not the agent. The entire thing, search, negotiation, the watch, the rescue, is free; the invite only bites when you go to book. At that moment the agent does not slam a wall up, it proves itself, showing a few real negotiated fares and locking the rest, so you feel the value before you are asked to join. The most generous possible version of a private club.",
          "Money is where the dial goes fully calm. The receipt is clean and understated, 'it is taken care of.' The most careful screen in the app is the one right after you pay: it never reads a slow gateway as a failure, it holds you steady ('confirming your payment, this usually takes a few seconds, do not close the app') and polls until it has a real answer, and if the airline is slow to issue the ticket it says so plainly and gives you a place to watch it, so your money is never somewhere you cannot see. And the line the whole product rides on: the agent prepares the booking, but you tap to commit. It never books, and never rebooks, on its own.",
        ],
        fig: "awBook",
        figure:
          "Gate the booking, not the agent: a few real fares shown and the rest locked behind the invite, then the money-in-flight screen that holds you steady, a declined card with no blame, and the receipt that starts the 90-day watch.",
        divider: true,
      },
      {
        h: "Group fares",
        group: "Book",
        tldr: "Booking for a family surfaces the structure under the fare, honestly, before you pay.",
        p: [
          "A group fare is cheap because your seat sits in a block the airline confirms to a name only about 24 hours out, and sometimes it slips; a self-transfer across two airlines is protected by no one. The agent sets these expectations up front, not at the airport. Honest caveat: the shipped app does not yet model series fares or PNR-stitching, so this is the designed target, not yet built.",
        ],
        screen: "The family booking: the series-fare confirmation window and the protected-versus-self-transfer distinction, made legible before commit. (proposed, not yet in the shipped data model)",
        divider: true,
      },
      {
        h: "Confirmation",
        group: "First hours",
        tldr: "Confirmation is the emotional payoff and a quiet danger zone, the gap between paid and ticketed, so the agent reassures, makes the ticket structure legible, and never leaves your money in a void.",
        p: [
          "The moment you book, the agent's job is reassurance: 'you're going to Goa', the tickets handed over, and the trip structure made legible from minute one, one ticket or two, protected or a self-transfer, so it is never a surprise at the airport. It is also where the agent says, in effect, I have it from here, and starts the watch.",
          "The danger hides inside the happy moment: the airline often takes minutes to issue the PNR, and that gap, real money spent and no ticket in hand, is the scariest stretch in the product. The agent holds you there, 'issuing your ticket, this is normal, I'll ping you the second it's done', never a dead spinner and always a place to watch it.",
        ],
        fig: "awConfirm",
        figure:
          "Confirmation: the emotional payoff, a legible protected-connection ticket, and the paid-but-not-yet-ticketed gap held steady, never a void.",
        divider: true,
      },
      {
        h: "Charged twice",
        group: "First hours",
        tldr: "A worried double-tap must never become a double charge.",
        p: [
          "The payment screen locks back-navigation and polls the gateway to a real answer, so a parent who taps twice is held, not charged twice. A decline lands as a calm retry with no blame. Honest gap: there is no server-side idempotency guard in the current code, the locked screen is the real guard.",
        ],
        screen: "The money-in-flight screen holding a double-tap steady, and a declined card retried without blame.",
        divider: true,
      },
      {
        h: "What you bought",
        group: "First hours",
        tldr: "A confirmation email rarely says what matters, so the agent reads it back.",
        p: [
          "Once the PNR lands the agent says it plainly: one ticket or two, protected or a self-transfer you own, which leg a partner operates, and a passport-and-visa check run weeks early while it is cheap to fix. The point is not the data, it is you're protected, and here is why.",
        ],
        screen: "The booking read back in plain terms: protection, operated-by, and an early document check.",
        divider: true,
      },
      {
        h: "The watch",
        group: "During the trip",
        tldr: "After booking, the agent is awake the whole trip, a steady stream of small anticipations that change as the trip nears, with the rescue moments as the punctuation.",
        p: [
          "This is where 'the agent you keep' becomes real, and where it most exceeds a human agent. The trip is one surface that transforms by phase. At confirmation it reassures and hands over the tickets. In the long quiet middle it is a silent steward: no nagging pings, just a living record of what it is watching, and one genuinely useful proactive act, it checks your passport and visa against this trip early, while there is still time to fix a problem, not the night before. As departure nears it sharpens into an operator: it checks you in, tells you when to leave with traffic in mind, reads the terminal and the security line. In motion it is a companion doing the anxious math for you, 'you have forty-seven minutes, your gate is a twelve-minute walk, you are fine.' After, it closes the loop with a recap of what it saved you.",
          "Most of that value is small and quiet, a hundred things handled before you thought to ask. The drama is the exception, not the rule, which is exactly why the quiet competence is what earns the trust the dramatic moments spend.",
        ],
        fig: "awHub",
        figure:
          "The quiet middle of the trip: the agent watches without nagging (a living diary), catches a passport problem early while it is still fixable, and calls back weeks later when the fare drops.",
        divider: true,
      },
      {
        h: "Pre-departure",
        group: "During the trip",
        tldr: "The one trip surface transforms by the clock, from 'check in now' to the boarding pass, with the agent quietly handling the airport friction, and a close-in cancellation breaks through with the fix already prepared.",
        p: [
          "In the pre-departure window the agent shifts from quiet steward to active operator, and the surface transforms with it: at T-72 it becomes 'check in now' and can do it for you, on the day it is the boarding pass with the leave-by time and the gate. Most of this value is small and invisible, a hundred things handled before you thought to ask.",
          "And when the stakes are high and the runway short, prominence scales to match: a cancellation close to departure breaks through with the smart move already worked out. The voice stays calm, all warmth, zero edge.",
        ],
        fig: "awPreDep",
        figure:
          "One surface across the pre-departure window: 'check in now' at T-72, the day-of boarding pass with a leave-by time, and a close-in cancellation that breaks through with the fix ready.",
        divider: true,
      },
      {
        h: "In motion",
        group: "During the trip",
        tldr: "In transit the agent is a companion doing the connection arithmetic for you, calm when you are fine, sharper as it tightens, and clear about who is on the hook if you miss it.",
        p: [
          "The single most valuable surface in motion is live connection monitoring, the thing no airline app does well: 'you have forty-seven minutes, your gate is a twelve-minute walk, you're fine.' It does the anxious math so you do not have to, and gets sharper as the layover tightens.",
          "And if the connection is missed, the response depends on the ticket structure, which is exactly where the agent's value peaks: on one ticket the airline owes you the next flight and the agent hands you the desk and the script; on a self-transfer no airline is obligated, and the agent is the only one on your side.",
        ],
        fig: "awTransit",
        figure:
          "In transit: the agent doing the connection math (forty-seven minutes, the gate's a walk), the layover tightening, and the missed connection with who is on the hook.",
        divider: true,
      },
      {
        h: "Missed connection",
        group: "During the trip",
        tldr: "What the agent says next depends entirely on how the ticket was built.",
        p: [
          "On a protected itinerary the airline owes you the rebook: the agent arrives holding the move, points you at the right desk, and hands you the words. On a self-transfer nobody owes you, so it arms you with the move, the script, and an honest read of what you are and are not owed. Same calm voice, opposite mechanics.",
        ],
        screen: "The missed-connection rescue, two branches: protected (airline rebooks) versus self-transfer (you own it), each with the move pre-loaded.",
        divider: true,
      },
      {
        h: "When it breaks",
        group: "During the trip",
        tldr: "In a disruption the agent goes calm and operational, shows you the smartest move, and, crucially, knows what you are actually owed, a rights engine no OTA encodes.",
        p: [
          "A cancelled flight at 2am is the moment that justifies the whole product, and it is a completely different design from everything before it. The voice goes calm, all warmth, no edge. The prominence scales with the stakes: a minor schedule change weeks out is a quiet line; a cancellation close to departure breaks through with the fix already prepared. The agent does not rebook for you, it never takes the wheel, but it arrives holding the smart move and hands off cleanly, the right desk, a drafted message, a deep link, so you take it from there with the panic already done for you.",
          "What makes this more than reassurance is the rights line. Airline obligations are a maze most travellers never navigate, and they hinge on details the industry is happy to keep murky: whether your ticket is one booking or two, whether a delay was the airline's fault, which country you are in. So I had the real rules researched and encoded. In India the airline owes you care and a refund even when a cancellation is force majeure, and fixed compensation for a same-ticket missed connection it caused. In the EU a long delay can owe you cash, not just an apology. A separate-ticket self-transfer is the trap where no airline is obligated and the agent's warning matters most. An agent that actually knows your rights, in the moment, is the clearest version of Away knowing the way.",
        ],
        fig: "awDisruption",
        figure:
          "The rescue surface: what changed, what you are actually owed (the rights engine, here EU261), the one smart move already worked out, and a clean hand-off, because the agent preps but you commit.",
        divider: true,
      },
      {
        h: "The recap",
        group: "Post trip",
        tldr: "The delights are not confetti, they are the agent's competence made visible: the verdict, the savings, the recap, and the compensation it claims back for you.",
        p: [
          "Because the agent spends its goodwill in the hard moments, the good moments have to refill it, and the way they do is by making competence visible. The negotiation ends on a reveal, the public fare struck through, the negotiated price beside it, the saving unmistakable. The trip ends on a recap that plays your trip back: time saved, money saved, the comfort and flexibility you chose. And the single best delight is one no other app offers, after the trip the agent tells you about money you did not know you were owed and helps you claim it: 'your Frankfurt flight was delayed six hours, you are owed about six hundred euros, here is the claim, I have drafted it.' Most travellers never claim it. Away does it for you.",
          "Through all of it, one house rule keeps the charm honest: charm and clarity never share a sentence. Personality lives in greetings, the wait, the recap, the win against the airline. Buttons, errors, and anything touching money stay plain and calm. An agent that cracks a joke while your payment is confirming has not earned the joke.",
        ],
        fig: "awRecap",
        figure:
          "The peak-end: the trip played back as a four-param recap (time, money, comfort, flex), then the single best delight, the agent surfacing compensation you did not know you were owed and drafting the claim.",
        divider: true,
      },
      {
        h: "Case map",
        tldr: "The full set of screens and states behind the story, grouped by stage, so this doubles as the build list. The voice tags mark where the agent runs warm and opinionated (win), stays plain and calm (steady), or goes all-warmth in a real crisis.",
        p: [
          "Reading top to bottom, here is every case the agent has to handle. Each line is a screen or state to design. Build from this, hand me the Figma frames, and I will place each against the matching section above.",
        ],
        ul: [
          "Onboard: splash into 'Activating your concierge' (show the work from second one); the four-story pitch (paradigm, enemy, promise, agent); phone and OTP with every state (idle, typing, verified, error, expired, resend); name capture into a personalised welcome; the invite gate as freemium, the whole agent free and only booking gated.",
          "Find: the adaptive home in two states (cold, convince-first, with insider discovery; warm, input-first, with your trips and watches on top); the expanding 'cloud' input (type, voice, or paste a screenshot, blooming into location, date, passengers, travel type); the reflected brief with a point of view ('mid-December is brutal on this route, want the week after?'); the one-gap clarifying card; tension-as-the-work ('cheap and lie-flat fight here, that gap is the work'); deep search running (the labour-illusion timeline plus thinking dots); the empty or impossible brief (calm correction, nearest viable change); a search timeout.",
          "Vet: the vetted listing (sorted by what is right, with the verdict line 'eight flights, three worth your time'); the trap flag inline (visa trap, tight connection, junk fare, self-transfer) with the why; per-flight Negotiate, pick up to three; the savings reveal (public fare struck through, negotiated price beside it); the honest no-win ('already the best price', the work shown, then nearby dates and reroutes offered); the all-traps result (least-bad, or change the parameters).",
          "Book: the invite gate partial reveal (a few real fares shown, the rest locked); the commit (you tap to book, the agent never auto-books); money in flight ('confirming your payment, do not close the app', polling); the payment timeout ('still processing, track in My Bookings'); a declined card ('card declined, your fare is still held', retry); the receipt (clean, then 'I will watch this for 90 days'); the 24-hour free hold.",
          "The trip, phase 1 (confirmation): 'You are going to {city}' with the tickets and the PNR protection badge; the paid-but-not-yet-ticketed gap ('issuing your ticket, this is normal, I will ping you').",
          "The trip, phase 2 (hub): the silent steward with a 'what I have been watching' diary; the proactive doc-check ('your passport is inside the six-month window'); a net-positive price-drop alert; a far-out schedule change shown as a quiet line.",
          "The trip, phase 3 (pre-departure): the surface morphing ('Check in now' into day-of into the boarding pass); auto web check-in and its fallback; leave-by, terminal and security reads; a cancellation close to departure (takeover prominence, breaks through Do-Not-Disturb, the fix prepared).",
          "The trip, phase 4 (in transit): live connection monitoring ('forty-seven minutes, the gate is a twelve-minute walk'); the missed connection (protected versus self-transfer); lost baggage.",
          "The trip, phase 5 (post-trip): the recap (the four-param echo, shareable); the proactive 'you are owed this' compensation claim; a refund chase; the reopen ('where next').",
          "Cross-cutting: the trip-structure / PNR visibility (a protected versus self-transfer badge, operated-by clarity); the disruption surface anatomy (what changed, your rights, the one smart move, what the agent is holding, the hand-off: deep-link the airline, the right desk, a drafted message); the rights engine by country (India care-and-refund even in force majeure, the EU cash for 3h-plus delays, the US refund regime, the self-transfer gap); and the system-crisis backbone everywhere (a dropped stream into a silent resume, the offline banner, every error stating what broke and the next step).",
        ],
        divider: true,
      },
      {
        h: "Outcomes",
        tldr: "v1 has shipped and is growing: in its first week, invite-only, the agent was already doing around ₹50K in bookings a day, and climbing.",
        p: [
          "The honest headline is that it shipped, and it is working. In its first week, live to an invite-only group, the agent was doing around ₹50K in bookings a day, and the number has kept climbing since. That is the bet paying off: people are handing a real, end-to-end booking to the agent, not just searching with it. The earlier negotiate experiment, about one in three users negotiating rather than booking the listed price across roughly 1,000 users and 200 bookings, is the baseline this overhaul built on.",
        ],
        ul: [
          "Around ₹50K in bookings a day in the first week, invite-only, and growing",
          "[A 'caught before it hurt' signal: passport, self-transfer, and compensation catches, to confirm]",
          "[Repeat use: do people come back for the next trip, to confirm]",
        ],
      },
      {
        h: "What I'd revisit",
        tldr: "The line I watch hardest is autonomy versus the co-pilot rule, and the honest tension in an agent that advises on your rights without taking the action.",
        p: [
          "The hardest line in the whole design is how much the agent does for you versus how much it leaves in your hands. Never take the wheel is the right constraint for trust, but every time the agent stops at 'here is the smart move, you take it from there', there is a real cost in the moment: a stranded traveller would often rather it just fixed it. Holding that line honestly, doing everything up to the commit and not past it, is the thing I am least finished thinking about, and where I would test hardest with real travellers in a real disruption.",
          "The other is the rights engine. Encoding passenger rights is the product's clearest moat, but the rules change and vary by country, and an agent that confidently tells you what you are owed had better be right. I scoped it to the regimes Indian travellers hit most and flagged the ones I could not yet verify rather than guess. Keeping that current, and never letting confidence outrun the source, is an ongoing discipline, not a one-time research task.",
          "[Add the standout moment: a real user reaction or test that changed the design, for example how travellers responded to the agent advising but not acting in a disruption. A real before, insight, after is the most valuable thing this case study can carry.]",
        ],
      },
    ],
    todo: [
      "Replace figure placeholders with real screens (animated SVGs from Figma): the adaptive home + expanding input, the vetted listing, the booking-gate partial reveal, the money-in-flight screen, the five-phase trip surface, the disruption + rights surface, and the savings reveal + recap + compensation claim",
      "Build the lifecycle dial infographic as the hero (the edge-to-calm dial across the trip); a first version is already drafted",
      "Confirm role, exact title, dates, and team shape for this version of Away",
      "Instrument the secondary metrics (adoption past booking, caught-before-it-hurt, repeat use); week-one bookings ran around ₹50K a day, invite-only, and growing",
      "Add one test-driven change (before, insight, after); the standout signal reviewers prize",
      "Finish the rights engine's unverified jurisdictions (Canada, Brazil, Australia, GCC, live Montreal caps) before any rights copy ships",
      "Deep entry; consider a clarity-gate trim for a 5-minute reviewer once figures are in",
    ],
  },
  "away-agent-human": {
    "accent": "#2563EB",
    "eyebrow": "Away · Case study",
    "title": "Designed for the moments, not the screens",
    "meta": "Founding Designer · Away · 2026",
    "cover": "Away",
    "board": [
      "AWAY",
      "THE MOMENTS, \nNOT THE SCREENS",
      "MY TRIP \nWENT WRONG"
    ],
    "lead": "A booking takes five minutes. The trip is everything around it: the itch to go somewhere before you even have a query, the cheap fare that hides a trap, the family booking with thirty seats on one ticket, the connection you are about to miss, the cancellation at 2am, the six hundred euros you are owed and will never claim. Most travel apps are built around their own screens, search, book, manage; I built Away around the moments a traveller actually lives through, and I have written this case study the same way, by the moment, not the screen. Under each moment is the real spread of ways it happens, the edge cases most apps only meet on the happy path, and how the agent shows up for each: complete enough to do the whole job, disciplined enough to never take the wheel. I led design end to end as the only designer on a five-person founding team. We shipped v1, and in its first week, invite-only, it was already doing around ₹50K in bookings a day, and the number has only grown since.",
    "sections": [
      {
        "h": "Built around moments, not screens",
        "tldr": "Most travel apps organise around their own machinery, search, book, manage, and lose the trip in the gaps; I organised the product, and this case study, around the moments a traveller actually lives through.",
        "p": [
          "Open almost any travel app and you are looking at its filing cabinet: a search tab, a bookings tab, a manage tab. The booking is the part everyone competes on, and it is rarely the part that goes wrong. What goes wrong are moments, the cheap fare that hides a self-transfer, the schedule change three weeks out, the connection you are about to miss, the six hundred euros you are owed and never claim. An app organised by its own screens has nowhere to put any of that.",
          "So I organised Away, and this case study, around those moments instead. Every section ahead is a situation in the traveller's own words, then the real spread of ways it actually happens, the thirty-seat group fare, the two-ticket trip no airline protects, the cancellation that is nobody's fault, and how the agent shows up for each. The screens are the evidence; the moment is the spine. And one line runs under all of them: the agent does the whole job, every one of these moments, and still never takes the wheel. It does the figuring-out; you travel."
        ]
      },
      {
        "h": "My role",
        "tldr": "[Sole] designer on a small founding team; I designed the agent across the full trip lifecycle, its behaviour, its surfaces, and the voice it speaks in.",
        "p": [
          "I led design end to end as the only designer on a five-person founding team: the CEO, the CTO, two developers, and me. My remit was the agent as a whole experience, not a set of screens.",
          "Concretely, I designed how the agent searches, vets and recommends, how it gates the booking, and how it behaves across every phase of the trip after, including the disruption moments. I also owned the voice: the line between when the agent is allowed an opinion and when it goes quiet, which on a product where the words are the product is itself most of the design."
        ]
      },
      {
        "h": "The thesis: a personality dial",
        "shader": "golden",
        "tldr": "The agent has a strong personality, and the craft is knowing when to turn it down: loud and opinionated when it is winning for you, quiet and calm when your money is moving or the trip is breaking.",
        "p": [
          "The brand gave me the spine. Away is the friend in the trade: warm and generous pointed at you, dry and unimpressed pointed at the airlines and OTAs that profit from your confusion. The enemy is never the traveller; it is the industry. So the agent has a real point of view, and the whole design is one question asked at every moment: which way is it facing, and how loud is it?",
          "I think of it as a dial. The edge runs free where the agent is on your side against the industry, the verdict on a search, the warning about a trap, the compensation you are owed. It softens to plain and calm exactly where you are exposed, the first thirty seconds, anything touching money, any error. And it goes all warmth, zero edge, in a real crisis, because a joke in the wound is unforgivable. 'Crisis' and 'delight' are not two piles of screens; they are the two ends of that one dial, and the moments below are where it turns.",
          "Two rules hold it all together. The agent does the work of the best human agent on the phone and then exceeds it, the long price watch, the passport check, the compensation claim, things no human agent actually does. And it never takes the wheel: it prepares, recommends, and hands off, but the person always commits. One skill runs the length of it, negotiation, the same muscle that beats the fare is what has your back when the trip goes wrong."
        ],
        "figure": "The dial: the agent is loudest when it is winning for you against the industry, and quietest when your money is moving or the trip is breaking. [Add the lifecycle dial infographic.]",
        "divider": true
      },
      {
        "h": "\"I want to get away.\"",
        "group": "The zero state",
        "tldr": "Almost nobody arrives with a clean query, so the zero state reads two things before you type, the time of day and how well it knows you, and opens as a different screen for each.",
        "p": [
          "Almost nobody arrives at a travel app with a clean query. They arrive with an itch: a long weekend coming up, a fare a friend forwarded, a vague 'somewhere warm'. A search box punishes all of that, it asks for origin, destination, dates and travellers before it does a thing, and the person who only half-knows what they want bounces off the form. So I refused to start with a form. Before you type a word, the home reads two things, the time of day and how well it already knows you, and opens at the right altitude for that person at that moment.",
          "So the zero state, the screen you land on before you have done anything, is never the same screen twice. It greets you differently at 7am and at 11pm, and it shows a first-time stranger a completely different surface from a regular who books every month. The header here is the same home, read three ways."
        ],
        "design": {
          "w": 360,
          "h": 783,
          "bg": "#0e0e12",
          "label": "The zero state, read three ways: the same home shifting with the time of day and with how well the agent knows you.",
          "mocks": [
            {
              "base": "/figures/away-agent/greeting/zero-ui.jpg",
              "alt": "Away home in the morning, the greeting over a bright cloud sky.",
              "regions": [
                {
                  "box": [
                    0,
                    0,
                    100,
                    100
                  ],
                  "kind": "image",
                  "src": "/figures/away-agent/greeting/glow-morning.svg",
                  "blend": "screen"
                }
              ]
            },
            {
              "base": "/figures/away-agent/greeting/zero-ui.jpg",
              "alt": "Away home in the evening, the greeting over a golden-hour sky.",
              "regions": [
                {
                  "box": [
                    0,
                    0,
                    100,
                    100
                  ],
                  "kind": "image",
                  "src": "/figures/away-agent/greeting/glow-evening.svg",
                  "blend": "screen"
                }
              ]
            },
            {
              "base": "/figures/away-agent/greeting/zero-ui.jpg",
              "alt": "Away home late at night, the greeting over a calm dark glow.",
              "regions": [
                {
                  "box": [
                    0,
                    0,
                    100,
                    100
                  ],
                  "kind": "image",
                  "src": "/figures/away-agent/greeting/glow-night.svg",
                  "blend": "screen"
                }
              ]
            }
          ]
        },
        "figure": "The zero state, read three ways: the same home shifting with the time of day and with how well the agent knows you. [Three final screens to come; shown here with the time-of-day treatment.]",
        "divider": true
      },
      {
        "h": "Booking a flight takes time",
        "group": "The zero state",
        "tldr": "A flight is not bought in one sitting, people shop for weeks across dozens of searches and abandon most of it, so the real design problem is not the first search, it is the return.",
        "p": [
          "Watch one person actually book a flight and the tidy funnel falls apart. They search on a Tuesday, half-decide, forget, get a fare forwarded by a friend, check again from the office, wait to see if it drops, and book, maybe, three weeks later. The numbers back the mess: Expedia's clickstream puts the active shopping window around 45 days, inside a roughly 71-day stretch of thinking about it; an older Expedia count had people running close to 48 searches before they commit; and across the industry close to 88% of travel carts are abandoned, the highest rate of any sector. The first search almost never books.",
          "That changes what the home is for. If a booking takes six weeks and a dozen visits, the zero state is not a launchpad you use once, it is a re-entry surface that has to win the return, again and again. Its whole job is to drop the coming-back traveller straight onto the one unfinished thing they were closest to acting on, and to read differently for each person on each visit. That is what the adaptable cards do, and it is where the leverage is: re-engaging people in a category this slow is worth more than any first impression, the price that moved is the strongest pull there is, and Hopper built half its revenue on exactly that instinct."
        ],
        "figure": "Booking a flight is a 45-day decision: an active shopping window of weeks and dozens of searches, with most carts abandoned, so the zero state is designed as a re-entry surface, not a one-time launchpad. [Build as the shopping-window stat figure.]",
        "divider": true
      },
      {
        "h": "The agent is proactive",
        "group": "The zero state",
        "tldr": "An empty home is a ranking problem, not a fixed layout, so I gave it one rule, surface the single thing this person is most likely to act on right now, and let the agent's posture follow from where they are.",
        "p": [
          "The hardest screen to design is the one with nothing on it. A stranger has handed you no signal; a regular has handed you ten. So instead of a fixed menu I wrote the home as one question it runs every time it opens: what is the single thing this person is most likely to act on right now? The answer is ranked, not hardcoded, a live negotiation outranks a trip already booked, which outranks a recent search, which outranks an empty slate, and the winner takes the top of the screen.",
          "That ladder also decides how loud the agent is. High on it, a negotiation in flight, a trip next week, the home is purely functional: get them back to it, no selling. Low on it, a stranger with no history, it switches to persuasion, because the right move for an empty account is to prove the agent is worth a first message, a route at a three-month low, a season about to peak, the kind of read only someone in the trade volunteers. Time of day tints the framing without ever touching the function, and every suggestion carries the reason it surfaced, so even the emptiest home reads as intelligence, not filler."
        ],
        "figure": "The zero-state options framework: a precedence ladder that ranks what earns the top of an empty screen, and the posture, convince, seed, or get out of the way, that follows from where the signal sits. [Build as the options-decision diagram.]",
        "divider": true
      },
      /* hidden for now, section: "Three returns the zero state is built to win"
      {
        "h": "Designing the return visit",
        "group": "The zero state",
        "tldr": "The same slot on the home becomes a different card depending on where you left off, and three returns are where it pays off most: a negotiated fare that moved, a held booking, an abandoned search.",
        "p": [
          "The rule produces a short list of things worth surfacing, and three returns are where re-entry actually moves the numbers. Each is the same slot rendering as a different card, chosen by where you stopped. The first and strongest is a price that moved on a fare you were watching, the pull Hopper turned into half its revenue, except here it is not a generic alert but the result of a negotiation you asked for, coming back to find you: your Goa fare is cheaper than when you left it.",
          "The second is the largest pool of intent there is, the held or half-finished booking, because close to 88% of travel carts are abandoned; the card simply resumes it with the clock kept honest, your Delhi to Mumbai booking, the fare is still held. The third is the broad top of the funnel, the search you wandered off from across a 45-day, dozens-of-visits window; the card picks the thread back up, carry on your Lisbon search, seeded with what changed since you last looked, so the return is never a cold restart. Three different people, one slot, the right card each time."
        ],
        "fig": "awHome",
        "figure": "The same home slot, three returns: a negotiated fare that moved, a held booking, and an abandoned search, each rendered as a different adaptable card by where the traveller left off.",
        "divider": true
      },
      */
      {
        "h": "What the agent needs, in order",
        "group": "Search",
        "tldr": "A complete brief, origin, destination, dates, cabin, party, timing, and what you actually care about, collected never as a form: the one fact that never changes is captured at the door, the rest comes one tappable question at a time, and the preferences quietly steer every result after.",
        "p": [
          "A good search needs a lot of facts, and the lazy way to get them is a seven-field form that the half-decided traveller bounces straight off. So the agent collects the same brief as a short conversation, each question the composer itself morphing into a tappable card, asked in a deliberate order: a where before a when, the trip shape before the fine print, the things that unlock the next decision before the things that merely refine it. The one fact it never asks twice is where you fly from, captured the moment you open the app and kept for good, because it almost never changes and everything downstream leans on it.",
          "The last thing it asks is the one that keeps paying off. Your preferences, direct only, extra baggage, cheapest, low cancellation, are not a filter it applies once and forgets; they become the lens it vets with, mapped onto the four parameters the verdict scores on, so the brief you hand over at the door is the exact brief the agent argues from a few screens later when it tells you which flight is right.",
          "And not everyone answers one question at a time. Some hand over the whole thing in a breath. One client, in a test run, typed a single paragraph carrying eleven constraints at once, two flexible origins, a flexible arrival, a date range with a tolerance, a fare-and-bag rule, carriers to avoid, a stop limit, a maximum total time, and a transit-visa condition. The same intake reads that too, pulling each requirement out of the sentence and turning it into the structured brief, so a messy, real, all-at-once request is never a worse path than the tidy one."
        ],
        "fig": "awIntakeBrief",
        "figBare": true,
        "figure": "A real test-run brief, untangled: one paragraph carrying eleven constraints (two flexible origins, a flexible arrival, a date range with a tolerance, a cabin and bag rule, carriers to avoid, a stop limit, a max total time, a transit-visa condition), each pulled out and turned into a structured field.",
        "divider": true
      },
      {
        "h": "Designing the wait",
        "group": "Search",
        "tldr": "The agent has more than one kind of wait, and designs each to its work: an idle home that invites the first move, an honest shimmer for an ordinary fetch, and a narrated, minutes-long timeline for the deep search, the only wait actually doing expensive work.",
        "p": [
          "A travel agent that does real work has to wait in public, and not every wait means the same thing, so I refused to paper them all over with one spinner. The home before you have asked for anything is not a loader at all, it is an invitation, the agent showing what it knows and offering the first move. Ordinary flights coming back from a source get an honest shimmer, a skeleton of the rows about to land, so the structure is visible before the data is. And the deep search, the one wait that does minutes of real work on your behalf, is the only one that earns a show, because here a shimmer would be a lie that hides the effort that is the whole point. The rule under all three is the same: the treatment matches the work. A short wait stays quiet; a long wait doing something expensive for you is allowed to say so.",
          "Hand the agent a brief and the next thing that happens is that long wait, a real one, a couple of minutes long. A blank spinner here would read as broken, and worse, it would hide the work that justifies the whole product, so I treated it as something to design, not something to survive: the agent narrates what it is doing, out loud, the entire time.",
          "And there is real work to narrate. 'Negotiate' is a deep search that fans out across the fare consolidators the public never sees, Riya, Akbar, Cleartrip, Tripjack, TBO, for bulk and agency rates below the headline B2C price. The wait is a live timeline assembled from your actual airlines and routes, scanning inventory, cross-referencing supplier prices, negotiating bulk rates, scoring your options, so the effort is visible. It leans on a simple truth: visible effort is trusted, and valued, more than a number that just appears. The frontend polls patiently underneath, every few seconds for as long as it takes, so it is never a dead spinner.",
          "I held one hard line through it: honesty. The narration names the category of work truthfully and never claims a specific action the system cannot guarantee, no theatre it cannot back. And it resolves on the one thing that is unambiguous, the money, the public fare and the negotiated price beside it, and when the negotiation cannot beat that price, which is often, it says so plainly rather than invent a saving. The wait ends on proof, even when the proof is that you already had the best price."
        ],
        "fig": "awDeepSearch",
        "figure": "The two-minute wait as a live timeline built from your own flights: scanning inventory, negotiating bulk rates across the consolidators, scoring your options, resolving on the savings reveal.",
        "divider": true
      },
      {
        "h": "Navigating one long chat",
        "group": "Search",
        "tldr": "Away runs the whole trip inside one conversation, so the thread fills with very different outputs, a search, a negotiation, a booking, a boarding pass, a rescue, and the hard part is getting back to any one of them, which I solved with a smart pin at the top, the WhatsApp pattern, agent-managed so it always points at what matters now.",
        "p": [
          "Away is one continuous conversation that does the whole job, find, vet, book, watch, rescue. That is the bet, one relationship, not an app with tabs. But it creates an interface problem ordinary chat never faces: the thread does not hold messages, it holds heavy, persistent, wildly different outputs, a vetted shortlist, a live negotiation, a booking with a PNR, a boarding pass, a disruption surface with a rights claim. Stretched across a 45-day trip they pile up, and scrolling a long mixed thread to find 'my booking' or 'those flights' is the kind of friction that quietly kills a one-screen product.",
          "The easy fixes all broke the premise. Tabs would shatter the single-conversation feeling that is the entire point. A separate 'my trips' screen would split the context the agent works so hard to keep in one place. So the constraint was strict: keep it one thread, and still make any important output reachable in a single tap.",
          "The answer is a smart pin at the very top, the pinned-message pattern people already know from WhatsApp, made agent-managed. The agent pins the output that matters right now and the bar jumps you straight to that part of the chat. The 'smart' part is the agent moving the pin by the trip's state on its own: it is your live negotiation while you are shopping, it flips to your booking the moment you commit, it becomes the boarding pass on the day, and the disruption surface if something breaks. You never curate it; it always points at the thing you would otherwise be scrolling to find, and one tap takes you there. The single chat keeps its soul, and stops being a maze."
        ],
        "fig": "awSmartPin",
        "figure": "The smart pin: one chat holds every output (search, negotiation, booking, boarding pass), and the agent-managed pin at the top, the WhatsApp pattern, follows the trip's state and jumps you straight to the one that matters now.",
        "divider": true
      },
      {
        "h": "Vetting the deal for traps",
        "group": "Negotiations",
        "tldr": "A vetted shortlist sorted by what is right, not what is cheapest, with the trap flagged inline and the verdict backed by a scoring engine instead of a vibe.",
        "p": [
          "Indian travellers are trained to scroll a fare list and pick. So I did not fight the habit, I gave a list, but one the agent had already vetted on the person's behalf. The feeling under the situation is suspicion: every OTA dangles a low headline and buries the catch in a checkout step, so a cheap row reads as a question, not a relief. The job here is to answer the question the traveller is too tired to ask: is this actually good, and is the cheapest one going to bite me. I sorted the shortlist by what is right rather than merely cheapest, and put the verdict, not the raw fares, in the first position.",
          "And the list does not arrive raw. By the time you see a row, the agent already knows things about every flight that a fare table never carries: it has scored each on the Flight Index, parsed the fare rules and the real baggage allowance, read the on-time history, caught the self-transfer and the tight connection, marked operated-by and protected-versus-separate-ticket, and set the negotiated price against the airline's own public fare. A search engine hands you raw fares and leaves the knowing to you; this listing is pre-loaded with the homework, so the first thing you read is a judgement, not data.",
          "The substance is in the cases below, because 'a good deal' is never one thing. Each row carries the negotiated price struck against the airline's public fare (the response object holds both, original_price next to negotiated_price, so the saving is a fact, not a claim), and a flag when the cheapest option is a trap. The hardest decision I made was to let the agent spend its own credibility to talk you out of a cheaper flight: an amber row that says, in plain words, this one is a self-transfer, you re-check your bags and one in four people miss it. An agent willing to argue against the lower number is the highest-trust moment in the product, and it only works because there is a scoring engine, the Flight Index, behind the verdict, so it can be defended line by line instead of asserted.",
          "And I held a rule for the honest no-win: when nothing beats the public fare, the agent says so. It names it plainly, then offers nearby dates and reroutes, because the one thing no OTA will ever tell you is that you already have the best price. That line, 'this is already the best price we found, you are not missing anything,' is the whole trust argument in a sentence."
        ],
        "ul": [
          "Is the price actually good: each row shows the negotiated fare against the airline's own public price, so the saving is shown as a number the agent earned, not a discount it invented. The deep search runs across 500-plus supplier prices before it scores anything.",
          "Is the cheapest a trap: the cheapest option is flagged amber inline, with the reason in words, a hidden self-transfer where you re-check your own bags between airlines, the kind of connection one in four people miss. The agent ranks it below a costlier flight and says why.",
          "What will I really pay: the honest total folds the extras back into the headline, the LITE fare that quietly carries NIL check-in baggage, the paid seat, the change fee, the cost of the self-transfer risk, so the number you compare is the number you pay, not the bait.",
          "What did you throw out for me: a 'what I skipped' view lists each rejected cheaper option with its single disqualifying reason, so the shortlist reads as a set of decisions made on your behalf, not a filtered table you still have to audit.",
          "A specific worry: 'ask about this flight' takes a real question (is the layover long enough, will my bag transfer) and answers it against that itinerary, shown visually on the segments rather than buried in fine print."
        ],
        "fig": "awVet",
        "figure": "The moment a cheaper option is the wrong one: a vetted shortlist with the trap flagged amber inline and the reason spelled out, the agent arguing against the lower number.",
        "divider": true
      },
      {
        "h": "Rendering a verdict, not a list",
        "group": "Negotiations",
        "tldr": "By the time eight flights come back, the traveller can barely tell them apart, so the output cannot be a list; it has to answer the questions they are too tired to ask, assemble itself from only the parts each result needs, and let them argue with the answer.",
        "p": [
          "Picture the moment the results land. The traveller has eight options that cost about the same, each hiding a different catch, and no energy left to compare fare rules. A search engine hands them that list and wishes them luck. The agent has already done the ranking, so its job here is the opposite: answer the questions they would otherwise have to ask, and make the answer something they can push back on.",
          "So the surface is built as an argument, and every part of it settles one of those questions. Is this the whole trip? One card carries both legs, paired and priced, marked protected or self-transfer, so you never assemble it yourself. Should I have flown a different day? A price-by-date strip appears only if you said you were flexible, the cheapest date lit, the swap named in words. Why is this one first? A thin line under the card gives the one or two reasons that earned its rank, 94% on-time, the cheapest here hides a self-transfer, with the full breakdown a tap away. And which knob is mine to turn? The lens, four parameters you re-weight to re-rank the whole list, while the hard limits from your brief quietly keep the wrong flights out.",
          "None of this is a fixed template; the layout is composed per result from parts that each earn their place. One card stands in for a whole round trip, the price-by-date strip appears only if you said you were flexible, the why-strip only when there is a reason worth naming, and an answer is drawn straight on the segments when you ask about a specific layover. The same surface stretches from a clean one-way to a thirty-seat family booking without becoming a different screen. The agent renders the argument the result actually needs, not the maximal one.",
          "Then the question the whole company rides on: did the negotiation actually save me anything? Often the honest answer is barely, or nothing, and the hardest discipline in the design is to say that as proudly as it shows a win. 'We checked every source, this is already the best price' has to land as a result, not a shrug, or the product becomes the OTA theatre it set out to replace. One thread holds it together: the agent ranks and you re-weight, every claim traces to a real number you can pull on, and when there is nothing worth saying about a flight, the card stays quiet."
        ],
        "fig": "awResultCard",
        "figure": "The results read as an argument, not a list: one card for the whole round trip, a price-by-date strip when you're flexible, the negotiation told honestly, and a why-strip under each card, the legend names each layer.",
        "divider": true
      },
      {
        "h": "The screen after you pay",
        "group": "Book",
        "fig": "awBook",
        "tldr": "The screen right after you pay is the most careful surface in the app, and I wrote it to do almost nothing on purpose: poll to a real answer, never read slow as failed, and hold a worried person steady.",
        "p": [
          "Money leaves the account in a second; the answer from the gateway does not. So the payment screen does one thing well: 'confirming your payment, this usually takes a few seconds, do not close the app', over a loader that polls every two seconds until it gets a real terminal answer, captured, failed, or still-processing. Back-navigation is locked the whole time so a worried parent cannot escape mid-verify and double-charge the family. A pending result is never quietly treated as a failure, the bug most apps ship. And a declined card lands on 'payment failed' with a retry and no blame, because a bank decline is not the traveller's mistake to feel bad about. This is the one screen where warmth means restraint."
        ],
        "figure": "Money in flight: the most careful screen in the app, polling the gateway to a real answer with back-navigation locked, and a declined card held with a calm retry and no blame.",
        "divider": true
      },
      {
        "h": "You always tap to pay",
        "group": "Book",
        "tldr": "Away is invite-only, but I gated the booking, not the agent: it proves the engine with a few real negotiated fares, locks the rest, and never charges a card without your tap.",
        "p": [
          "Away is invite-only, and the fares it negotiates are the proof, so at the booking moment the gate does not slam a wall up, it proves itself. A few real negotiated fares are shown in full and the rest locked behind the invite, the most generous version of a private club: you can see the deals are genuine before you are asked to belong, not a paywall that hides everything. And the line the whole product rides on holds even here, the agent prepares the booking, but you are the one who taps to commit. It never books, and never rebooks, on its own."
        ],
        "divider": true
      },
      {
        "h": "Group fares and seat risk",
        "group": "Book",
        "tldr": "A group fare is cheap because your seat sits inside a block the airline only confirms to a name about 24 hours before departure, and sometimes that slips, so the agent never sells it as done.",
        "p": [
          "Booking for a family or a group is where the structure under the fare actually bites. Travel agents pre-book blocks of group tickets months ahead at a low price, and your seat sits inside that block, which the airline only confirms to a name about 24 hours before departure. Sometimes the confirmation slips. A great human agent earns their fee right here, by telling you the awkward part before you pay, not at the airport. So the agent never sells a series fare as done: it sets the expectation in plain words up front, this is a group fare, the seat firms up close to departure, shows the confirmation window honestly, and works the booking when it slips instead of going silent."
        ],
        "divider": true
      },
      {
        "h": "Protected, or a self-transfer",
        "group": "Book",
        "tldr": "The structure that decides everything later: a protected codeshare the airline covers end to end versus a self-transfer nobody covers, made legible in the fare before you commit, never discovered at a transfer desk.",
        "p": [
          "The single most consequential fact about a trip is also the one most travellers never notice until it is too late: is this one ticket or two? A same-PNR codeshare is one booking the airline protects end to end; a self-transfer stitched across two airlines is two bookings nobody protects, so a missed connection is entirely on you. That difference decides who owes you a flight when things go wrong, so I made it legible right in the fare, the amber codeshare caution and the self-transfer flag living in the fare tags, before you commit. Never a thing you discover at a transfer desk with kids and bags."
        ],
        "divider": true
      },
      {
        "h": "I paid. Where is my ticket?",
        "group": "The first hours",
        "tldr": "Payment is captured but the PNR is not issued yet; the booking sits in ticketing and the screen says it is fetching your tickets and will notify you, with a way out to My Bookings and the agent.",
        "p": [
          "The money is gone but the ticket is not here yet, which is the most anxious gap in the whole trip. The governing principle: be honest that this is normal async work, never show a dead spinner, and always leave a way out (My Bookings, the agent). The real app is passive here, it polls booking details on a cadence rather than pushing live ticketing progress, so the honesty has to carry the wait."
        ],
        "spec": [
          {
            "label": "States",
            "items": [
              "VerifyPollStatus reaches captured (payment confirmed on gateway). For Razorpay the SDK callback is already terminal so no polling occurred; for Cashfree polling to captured is mandatory. Source of truth that money is in.",
              "BookingStatus moves payment_processing -> ticketing (airline securing the ticket). This is the defining booking-level state of this moment.",
              "PaymentPhase derives to issuing_ticket (booking.status='ticketing') via derivePaymentPhase. This is the UI branch that governs the whole screen.",
              "Per-flight TicketStatus is pending or ticketing on one or more flights; pnr is still null on those flights.",
              "Per-payment IPayment.status sits at 'captured' (TripPayments prefers the captured record to show the settled bill breakdown).",
              "Booking-details query is invalidated on payment success and polling begins: created_at under 1 hour polls every 10s, else 60s; BNPL settle flow can override to 5s.",
              "Terminal exits from this moment: every flight TicketStatus='issued' with pnr set -> PaymentPhase confirmed; or any flight TicketStatus='failed' / booking.status='ticketing_failed' -> PaymentPhase failed; or is_expired / status='expired' -> PaymentPhase expired."
            ]
          },
          {
            "label": "Edge cases",
            "items": [
              "Razorpay terminal callback (success confirmed client-side) -> no polling needed; route straight to postBookingDetails with 'Success!' / 'Payment ID' toast, then land in ticketing.",
              "Cashfree onVerify fires even on dismiss -> POST /payments/verify polling is mandatory to confirm captured before this moment is entered; a 'created' status after the 5s CREATED_GRACE_MS is treated as user-dismissed, not entry to ticketing.",
              "Payment captured but booking stays non-confirmed (ticketing fails mid-flight) -> that flight TicketStatus='failed', booking can become ticketing_failed, PaymentPhase becomes failed; show the failure honestly, stop fetching.",
              "Partial ticketing on a round trip (return issued, outbound failed) -> per-flight status is independent; show 'Fetching your tickets... We'll notify you' if ANY flight is in pending/ticketing/failed.",
              "Poll exceeds the 30s verify window before capture confirms -> VerifyPollStatus='timeout'; show 'Still processing... check in My Bookings', never block forever.",
              "Verification network error during polling -> keep polling silently until timeout (no exponential backoff or jitter in code, real gap); only surface an error at timeout, never mid-poll.",
              "User navigates back (Android hardware back / iOS swipe) during verify polling -> back is locked while status='polling' (BackHandler + SwipeGestureEnabled=false) to prevent checkout abort; once captured and in ticketing, back is free.",
              "Booking expiry race during the wait -> useExpiryWatcher on focus; if is_expired or status='expired', stop and show the expired path instead of a stuck fetch. Gap: expiry is only re-checked on focus / next poll, so a mid-wait expiry is not flagged until the next 10 to 60s tick.",
              "Away Advance (BNPL) booking -> after /away-pay/settle captures, booking still moves through ticketing the same way; this moment is identical.",
              "Terminal-state race (Strict Mode double-invoke, concurrent effects) -> handledTerminalRef ensures the success toast and navigation fire only once, preventing duplicate toasts on entry to this moment."
            ]
          },
          {
            "label": "What the agent shows",
            "items": [
              "A confirmation surface (awConfirm) headed by the captured payment: 'Payment confirmed' / 'Success!' with 'Payment ID: {pg_payment_id}'.",
              "A ticketing strip per flight: 'Fetching your tickets...' with 'We'll notify you', shown while any flight is pending/ticketing/failed.",
              "Spinner icon next to the PNR slot on the upcoming trip card (PNR field empty until issued); 'Fetching Tickets' shown in the PNR strip during ticketing.",
              "Route header 'Onward' / 'Return' labels; on round trips, the issued leg can already show its PNR while the other still fetches.",
              "Bill summary already settled: 'Total Amount', 'Away Cash' applied, 'Payment gateway charge ({pct}%)', 'Payment Method'. Note: PG fee is non-refundable even on cancellable fares.",
              "A clear escape: 'Track in My Bookings' / 'Go to My Bookings' so the user is never trapped on this screen.",
              "Post-booking chat empty state with the agent available (UseSkillsChatComponent); chat status line shows 'Your flight ticket is being fetched' during ticketing."
            ]
          },
          {
            "label": "What the agent does",
            "items": [
              "On payment success, clear floating chat state and invalidate ['booking-details-by-id', bookingId] to force the UI onto the ticketing/confirmed state.",
              "Begin polling booking details (10s for fresh bookings under 1 hour, else 60s) to watch for TicketStatus transitions and pnr population.",
              "Render the per-flight 'Fetching your tickets... We'll notify you' notification while any leg is unticketed.",
              "Hand off control: surface 'Track in My Bookings' and let the person leave; the wait continues server-side and a push notification is registered to call them back.",
              "On notification tap (data.screen=concierge + booking_id), route to /postBookingDetails (Chat tab) so the user lands where the answer is.",
              "When every leg reaches issued, populate pnr, drop the fetching strip, show the confirmation; agent line flips to 'Your flight ticket is successfully booked'.",
              "If a leg fails, stop fetching for it and route to the honest failure surface with support access ('Talk to us')."
            ]
          },
          {
            "label": "Analysis parameters",
            "items": [
              "Aggregate per-flight TicketStatus across all flights[]: show fetching if ANY in (pending, ticketing, failed); show confirmed only if ALL issued.",
              "booking.created_at recency to set poll cadence (under 1 hour -> 10s, else 60s; BNPL settle -> 5s).",
              "derivePaymentPhase inputs: booking.status, payment_type, away_advance_status, is_expired -> branches this screen to issuing_ticket vs confirmed vs failed vs expired.",
              "pnr presence per leg gates whether that leg shows a code or a spinner.",
              "is_expired / expires_at watched on focus to abort a stuck wait.",
              "Whether capture came from Razorpay (terminal, no poll) or Cashfree (polled to captured) to decide entry path.",
              "IPayment.status='captured' preferred to source the displayed amount_breakdown (subtotal, taxes, pg_fee, pg_fee_pct, total)."
            ]
          },
          {
            "label": "Agent copy",
            "items": [
              "\"Payment confirmed\"",
              "\"Success!\" / \"Payment ID: {pg_payment_id}\"",
              "\"Fetching your tickets...\"",
              "\"We'll notify you\"",
              "\"Fetching Tickets\" (PNR strip)",
              "\"Your flight ticket is being fetched\"",
              "\"Your flight ticket is successfully booked\"",
              "\"Still processing\" / \"We'll notify you once it's confirmed. You can check the status in My Bookings.\"",
              "\"Track in My Bookings\" / \"Go to My Bookings\"",
              "\"Talk to us\" (failure path support access)"
            ]
          },
          {
            "label": "Failure modes",
            "items": [
              "Verify times out before capture confirms (status='timeout') -> 'Still processing... We'll notify you once it's confirmed. Check My Bookings,' with a button home; no blocking spinner.",
              "Ticketing fails after capture (TicketStatus='failed' / status='ticketing_failed') -> stop fetching, show the failure plainly. The existing failure copy 'No payment was taken. Our team can help sort this out' is WRONG here since money WAS captured; this exact money-captured-but-ticket-failed copy is not in code (speculative) and must be authored, paired with 'Talk to us'.",
              "Captured but confirmation never lands (seat lock expired, fare inventory depleted) -> the UI can sit in ticketing with no recovery flow (real product gap); honest recovery is to surface support and the booking in My Bookings rather than an infinite fetch.",
              "Push notification not delivered (stale token, Pusher reconnecting) -> the wait still resolves server-side; My Bookings remains the reliable place to check, so the user is never solely dependent on the alert (no guaranteed delivery, real gap).",
              "Cashfree webhook lands after the 30s window -> marked timeout but may settle later; be explicit it is still processing, do not declare failure (no webhook-late fallback in code, real gap).",
              "No client duplicate-charge guard is visible; reliance is on gateway idempotency and fresh order_id per attempt (real gap), so a retap-during-ticketing edge is unguarded client-side.",
              "Chat metadata is reset on payment success; if a concierge message was in flight, the agent may answer with stale booking context (real gap)."
            ]
          },
          {
            "label": "If it is a group / multi-PNR booking",
            "items": [
              "Per-flight ticket_status is tracked independently, so a round trip can have outbound issued and return still ticketing or failed; the fetching strip persists until every leg is issued.",
              "The issued leg shows its PNR immediately; the unissued leg shows the spinner, so the user sees partial progress rather than all-or-nothing.",
              "One failed leg flips PaymentPhase to failed even if the other is issued; the moment splits into 'one ticket is here, one needs help'.",
              "Gap: there is no model for same-PNR vs two-ticket / self-transfer, no field flags multi-leg vs single-itinerary structure, and no partial-refund or per-passenger proration flow if one of two passengers/legs fails (real product gaps), so partial failure cannot be cleanly resolved in-app and must route to support.",
              "Gap: no per-passenger refund display even though passengers can be partially selected elsewhere, so a partial group failure has no honest in-app accounting (speculative to add)."
            ]
          }
        ],
        "divider": true
      },
      {
        "h": "Preventing a double charge",
        "group": "The first hours",
        "tldr": "Money was captured but ticketing failed or stalled, and the honest move is to tell the traveller plainly, suppress every re-pay path so they cannot double-charge, and hand them to a human with the case pre-assembled. The app has no auto-rebook, no refund tracker, and no parsed decline reason, so it must not pretend to recover on its own.",
        "p": [
          "This is the worst kind of moment because the irreversible thing (the charge) already happened while the reversible thing (the ticket) did not. The governing principle is radical honesty plus a fast human handoff. A real design tension sits at the centre: the only shipped reassurance string is \"No payment was taken. Our team can help sort this out.\", which is comforting but technically wrong when payments[].status='captured'. The spec keeps the verbatim string for fidelity but flags it as the one place where shipped copy and ledger reality disagree, and proposes honest phrasing for the captured case (speculative)."
        ],
        "spec": [
          {
            "label": "States",
            "items": [
              "BookingStatus leaves payment_processing into one of: ticketing (still trying), ticketing_failed (terminal), cancelled (terminal), or stays non-confirmed while a charge exists (seat lock / inventory lost). [bookingDetailsTypes.ts:134-143]",
              "Per-flight TicketStatus diverges independently: outbound ticket_status='issued' while return ticket_status='failed' on a round trip. [bookingDetailsTypes.ts:146]",
              "PaymentPhase derived view: 'issuing_ticket' while status='ticketing'; flips to 'failed' on status='cancelled' or 'ticketing_failed'; 'expired' on is_expired or status='expired'. [bookingPhase.ts:6-13]",
              "VerifyPollStatus already resolved on the gateway before ticketing: 'captured' (money taken, the case here), 'failed' (declined OR SDK dismissed after 5s grace), or 'timeout' (>30s poll window, may settle later). [usePaymentVerifyPoll.ts:9-20]",
              "VerifyPaymentResponse.status has FOUR values: captured, failed, pending, and 'created' (order exists, no payment attempt = user dismissed SDK). 'created' must NOT be read as a decline. [useVerifyPayment.ts:11-16]",
              "IPayment.status='captured' present in payments[] while booking.status is not 'confirmed' (the core contradiction this moment surfaces). [bookingDetailsTypes.ts:168]",
              "TripsDetailsComponent shows 'Fetching your tickets...' whenever ANY flight ticket_status is in (pending, ticketing, failed), so in-progress and partial-failure look identical until a leg goes terminal.",
              "priceStatus can co-fire: useBookingPriceUpdate may report fare_unavailable (any_fare_changed=true) or price_changed during the same window, so the stall can be a vanished fare, not a payment fault. [useBookingPriceUpdate.ts]",
              "handledTerminalRef gates terminal side-effects to once, so the captured-but-failed handling does not double-toast or double-navigate. [terminal race handling]"
            ]
          },
          {
            "label": "Edge cases",
            "items": [
              "Captured but ticketing fails mid-flight (seat lock expired / fare inventory depleted) -> booking sits non-confirmed or ticketing_failed; agent kills any success path and routes to a human. This is a named real GAP: no recovery flow for captured-but-confirmation-failed.",
              "Partial ticketing on a round trip: outbound issued, return failed -> per-flight ticket_status tracked independently; agent names exactly which leg failed and which is safe, never implies the whole trip is lost.",
              "ticketing_failed on an Away Advance booking -> AwayPayDueCard is suppressed (it excludes status='ticketing_failed' even if away_advance_status='awaiting_payment'), so the traveller is never billed for a failed booking. [payment-ticketing edge cases]",
              "Fare vanished during the stall -> priceStatus='fare_unavailable' blocks payment with no override UI; agent surfaces 'Fare No Longer Available' / 'Search for Alternatives' rather than a payment retry. [useBookingPriceUpdate]",
              "Duplicate-charge fear (user retapped Pay) -> each tap mints a fresh order_id and old polling is cancelled; gateway rejects re-payment of the old order_id server-side. There is NO client-side duplicate-charge guard; reliance is on gateway idempotency, and it is unclear if order_id doubles as the idempotency key (real GAP, surfaced to support, not hidden).",
              "No parsed decline reason -> gateway decline codes / issuer messages are not parsed, so the agent must NOT guess 'insufficient funds' / 'card expired' / 'issuer blocked'; it says 'Transaction was declined.' or routes to a human (real GAP).",
              "Created vs declined -> if verify returns 'created' (or Cashfree cancel events 'dropped'/'user_exit'/'user_close'/'cancel'), the user dismissed checkout; this is NOT a decline and must not be framed as a failed payment. [usePaymentVerifyPoll CREATED_GRACE_MS 5s]",
              "Name-mismatch rejection from the airline -> not validated pre-payment (no min length / title / special-char checks against airline rules); if it caused the ticketing failure the agent cannot diagnose it and hands off (real GAP).",
              "Cashfree webhook lands late -> a booking marked 'timeout' may actually settle later; agent says 'Still processing, check My Bookings' rather than declaring failure (real GAP, honest hedge).",
              "Insufficient Away Cash mid-flow -> InsufficientWalletBalanceBottomSheet lets the user top up, but the recomputed final total after top-up is not shown (silent re-calc, real GAP); if this preceded the stall the displayed amount may not match what was captured.",
              "Booking expired during the stall -> is_expired or status='expired' flips PaymentPhase to 'expired'; agent shows the expired surface and prompts re-search via ExpiredDeepSearchBottomSheet, does not keep a dead spinner.",
              "PG-fee reversal on later refund -> PG fee is marked non-refundable in UI but what happens to it on a platform refund of a failed booking is unspecified in code (real GAP); agent does not promise PG-fee return."
            ]
          },
          {
            "label": "What the agent shows",
            "items": [
              "awConfirm figure re-skinned to the trouble state: no green checkmark, a neutral status block, neutral header 'Something went wrong' (verbatim, no blame).",
              "Per-leg status rows on a round trip: 'Onward' with its issued PNR shown, 'Return' marked failed (uses the real 'Onward'/'Return' labels).",
              "Reassurance line on the money: 'No payment was taken. Our team can help sort this out.' (verbatim real string). DESIGN TENSION: this is the only shipped reassurance and it contradicts payments[].status='captured'; see Agent copy for honest captured-case phrasing (speculative).",
              "Two actions only: 'Go back home' and 'Talk to us' (verbatim). No 'Retry' button that would re-charge.",
              "If still in-flight (status='ticketing'): 'Fetching your tickets...' with 'We'll notify you' (verbatim), not a blocking modal.",
              "If verify timed out: 'Still processing' + \"We'll notify you once it's confirmed. You can check the status in My Bookings.\" with 'Track in My Bookings' (verbatim).",
              "If the payment record is missing entirely: 'We couldn't find your payment details. Please check My Bookings.' with 'Go to My Bookings' (verbatim).",
              "Bill summary still reachable so the traveller can see the captured amount and the PG fee; the non-refundable note stays honest: 'Note: Payment gateway (PG) fees are non-refundable, even on cancellable fares.'",
              "No fabricated refund timeline, refund-status tracker, or compensation/rights estimate (the app has none; do not show one)."
            ]
          },
          {
            "label": "What the agent does",
            "items": [
              "1. Detect terminal/non-confirmed state via polling (every 10s if booking <1h old, else 60s; BNPL flow uses 5s) and STOP polling on terminal states to avoid a dead spinner. [schedule-change-disruption; usePaymentVerifyPoll 30s timeout]",
              "2. Invalidate ['booking-details-by-id', bookingId] to force a fresh read so the UI cannot keep showing 'Success!'.",
              "3. Suppress every payment CTA: no Pay, no Retry, no AwayPayDueCard, and clear floating-chat checkout state, so the traveller cannot double-charge while confused.",
              "4. State the contradiction plainly: money captured, ticket not (yet) issued; on a round trip name the exact failed leg.",
              "5. Disambiguate before messaging: distinguish 'timeout' (hedge, may settle), 'failed' (true decline), 'created' (user dismissed, not a charge), and 'fare_unavailable' (re-search), and pick language accordingly.",
              "6. Open the handoff: 'Talk to us' routes into the post-booking concierge thread (resetChat flow='concierge', flowId=bookingId) so the human has booking context.",
              "7. Offer the safe exit: 'Go back home' so the traveller is not trapped.",
              "8. Hand off, do not act: prepare the case (booking_id, captured pg_payment_id, pg_order_id, failed flight ids) but never auto-cancel or auto-rebook. There is no rebooking tool in the codebase; CancelBooking exists per-passenger (ui_cancel_booking) but is initiation only, no result/confirmation surface."
            ]
          },
          {
            "label": "Analysis parameters",
            "items": [
              "booking.status terminality: ticketing (keep waiting), ticketing_failed/cancelled (declare failure), or expired (re-search). [derivePaymentPhase]",
              "Presence of payments[].status='captured' vs booking not confirmed -> the trigger for the captured-but-failed framing.",
              "verify outcome: captured vs failed vs timeout vs created -> picks hedged vs definite vs 'you dismissed checkout' language.",
              "Per-leg ticket_status across flights[] -> full failure vs partial (issued + failed) messaging.",
              "payment_type: standard vs away_advance -> whether to suppress AwayPayDueCard.",
              "priceStatus: idle vs price_changed vs fare_unavailable -> is this a payment fault or a vanished fare needing re-search.",
              "is_expired / expires_at -> 'stuck' messaging vs 'expired, re-search'.",
              "Whether a credits top-up happened mid-flow (silent recompute) -> whether displayed total can be trusted against captured amount.",
              "What it deliberately does NOT compute (real GAPS): parsed decline reason, refund eligibility/amount/timeline/method, name-mismatch validity, duplicate-charge confirmation beyond gateway idempotency, PG-fee reversal outcome, DGCA/EU261 compensation rights."
            ]
          },
          {
            "label": "Agent copy",
            "items": [
              "\"No payment was taken. Our team can help sort this out.\" (verbatim shipped string; flagged: contradicts a captured charge).",
              "Honest captured-case phrasing (speculative, not in code): \"Your payment went through but the ticket didn't issue. Your money is safe with us and our team will sort this, talk to us.\"",
              "\"Talk to us\" / \"Go back home\" (the two actions, verbatim).",
              "\"Transaction was declined.\" (only on a true decline; never a guessed cause).",
              "\"Something went wrong\" (neutral header, verbatim).",
              "\"Fetching your tickets...\" / \"We'll notify you\" (still in progress, verbatim).",
              "\"Still processing\" / \"We'll notify you once it's confirmed. You can check the status in My Bookings.\" / \"Track in My Bookings\" (timeout, verbatim).",
              "\"We couldn't find your payment details. Please check My Bookings.\" / \"Go to My Bookings\" (missing payment record, verbatim).",
              "Partial-leg (speculative, plain): \"Your onward ticket is confirmed. The return didn't go through. Your money is safe and our team will fix the return, talk to us.\" (per-leg data is real, this exact line is not in code).",
              "\"Note: Payment gateway (PG) fees are non-refundable, even on cancellable fares.\" (kept honest, not hidden)."
            ]
          },
          {
            "label": "Failure modes",
            "items": [
              "Dead spinner: polling never reaching terminal -> bounded by the 30s verify timeout flipping to 'Still processing... check My Bookings', not an infinite spin. [usePaymentVerifyPoll]",
              "Stale 'Success!' toast: Razorpay SDK callback is terminal client-side and fires 'Success! Payment ID: ...' before async ticketing fails -> query invalidation forces refetch; agent must not leave the success route up once booking is non-confirmed.",
              "Late webhook contradicts a 'failed' message -> hedge with 'still processing, we'll notify you' for timeout bookings (real GAP, honest hedge).",
              "Double charge from a panicked retap -> old order_id rejected server-side; no app-level guard, so support gets order/payment ids to reconcile (honest: this is the recovery, not a guarantee).",
              "Network error during polling -> polling continues blindly with no backoff/jitter until timeout (real GAP); only surfaced at timeout, not mid-flight.",
              "'created'/cancel misread as decline -> without the 5s CREATED_GRACE_MS distinction the agent could wrongly tell a user their card failed when they just closed checkout.",
              "Concurrent effects firing duplicate toasts/navigations -> handledTerminalRef ensures terminal handling runs once.",
              "Notification not delivered (stale push token / Pusher reconnecting) -> traveller may never learn the outcome; recovery is the always-available 'Talk to us' and My Bookings status, not a promised push.",
              "Stale concierge context: chat metadata reset on payment success can clear booking context, and an in-flight message may use stale data (real GAP) -> agent re-scopes to flowId=bookingId on handoff.",
              "No refund-status surface at all -> honest recovery is a human in 'Talk to us'; agent must not invent a refund tracker, ETA, or compensation amount."
            ]
          },
          {
            "label": "If it is a group / multi-PNR booking",
            "items": [
              "Per-passenger / per-leg failure is the norm, not the exception: one passenger on a 2-flight round trip can fail while others issue; the agent enumerates exactly who and which leg, never collapses to 'booking failed'.",
              "No partial-refund support exists: if 1 of 2 passengers fails ticketing, payment was taken for all but the partial failure is not auto-reconciled (real GAP); the agent states this plainly and routes to support.",
              "Multi-PNR stitching is not modelled: flights[] hold separate ids/supplier_ids with no field saying they share a PNR; baggage, connection-time, and misconnection liability are unmodelled, so the agent speaks per leg and cannot promise legs are linked. [booking-itinerary-model GAP]",
              "No proration display for partial-passenger cancels: ui_cancel_booking allows selecting which passengers to cancel and shows 'Cancel Booking initiated for flights', but there is no per-passenger refund calculation and no rebooking tool, so the agent can only initiate cancel and hand off, never rebuild the trip. [claims-rights GAP]",
              "Round-trip bulk handling (outbound cancelled implies both legs need handling) is not automated; listed as a missing mature-system capability, the human owns it. (speculative as an ideal; absent in code)"
            ]
          }
        ],
        "divider": true
      },
      {
        "h": "What you actually bought",
        "group": "The first hours",
        "tldr": "Once the ticket issues, the agent lays out the proof and the fine print in plain language: PNR, ticket PDF, per-leg cards, passengers, airline contact, bill summary, and fare rules made legible, including the structural truths the data model leaves implicit. It translates everything and flags every risk, but hands every binding action (check-in, cancel) to the person.",
        "p": [
          "This moment is hard because the supplier data is technically complete but humanly opaque: a PNR string, a refundable boolean, a \"2x23kg\" baggage string, two flights in an array, a tiered cancellation policy in hours-from-departure. The governing principle is legibility before liability: the agent translates every artifact and flags every structural risk (self-transfer, codeshare, terminal change, non-refundable PG fee) before the traveller relies on it, but takes no binding action itself. The honest constraint: several truths a mature post-booking screen would assert (single-PNR vs two-ticket, connection protection, refund timeline and method) are simply not in Away's data model, so the agent must mark them as needing confirmation rather than fake certainty."
        ],
        "spec": [
          {
            "label": "States",
            "items": [
              "BookingStatus = 'confirmed' (booking-level terminal-success state). Other terminal states: 'cancelled', 'expired', 'ticketing_failed'. [bookingDetailsTypes.ts]",
              "Per-flight ticket_status reaches 'issued' on each leg; flight.pnr populated only at 'issued' (null before). Independent per leg. [bookingDetailsTypes.ts]",
              "PaymentPhase (derived) = 'confirmed' for standard; 'away_advance_due' (away_advance_status awaiting_payment|overdue) or 'away_advance_settled' for BNPL; 'failed' if cancelled|ticketing_failed; 'expired' if is_expired|status=expired. [bookingPhase.ts]",
              "Transitional: one or more legs still pending|ticketing|failed. App shows 'Fetching your tickets... We'll notify you' with a spinner next to the PNR strip; post-booking chat shows 'Your flight ticket is being fetched'. Only fully ready when all legs reach 'issued', at which point chat shows 'Your flight ticket is successfully booked'.",
              "Partial-issued: outbound = 'issued' while return = 'failed' (real, per TripsDetailsComponent). Each leg's artifacts and recovery render independently; the issued leg is never blocked by the failed one.",
              "check_in.status per leg = not_open | open | closed. In the first hours almost always 'not_open' (web check-in opens about 24h out). PNR + check_in.status='open' gates the check-in affordance; in this moment it is not yet actionable.",
              "BNPL face: payment_type='away_advance' + away_advance_status='awaiting_payment' renders 'Booked with away credits / Pay now to avoid cancellation' with an [H]H [M]M LEFT countdown to payment_due_at, not a clean confirmed face.",
              "Post-confirmation price drift (real): a 'booking-price-updated' Pusher event can still fire; priceStatus = price_changed | fare_unavailable | price_verified. Relevant mostly pre-ticketing, but the channel is live. [useBookingPriceUpdate]"
            ]
          },
          {
            "label": "Edge cases",
            "items": [
              "One leg issued, the other still ticketing -> render the issued leg's PNR/PDF/cards fully; show 'Fetching your tickets... We'll notify you' on the pending leg, never a blank card.",
              "One leg failed ticketing (ticket_status='failed', booking can be 'ticketing_failed') -> show issued leg normally; on failed leg show honest failure copy plus 'Talk to us'. Real gap: no partial-refund and no auto-rebook flow exists, so the agent must say a human will sort it.",
              "parsed_fare_rules is null (backend failed to parse supplier data) -> fall back to the raw cancel_policy free-text string, or show 'Rules not available' rather than fabricating tiers. [booking-itinerary-model edge cases]",
              "changeable = null (supplier did not state changeability) -> UI treats null as not changeable; copy says 'Changes not confirmed by the airline' rather than 'non-changeable'.",
              "Codeshare leg: FlightSegment.operated_by differs from marketing airline -> amber 'Codeshare' tag, 'Operated by [operated_by_name]', and a note that check-in/baggage is handled by the operating carrier. Real gap: no codeshare_status or partner_airline field; relies on backend supplying operated_by. [flightTagConfig, amber]",
              "Terminal change between adjacent segments (current arrival terminal differs from next departure terminal) -> TerminalChange warning rendered; terminal sourced from segment.departure_terminal/arrival_terminal, falling back to live flight_info status. [LayoutDetails]",
              "Two flights under separate airlines with no through-fare (self-transfer / two-ticket) -> NOT modelled in code (no field flags single-PNR vs multi-PNR). Speculative stitched display: agent flags 'You collect bags and re-check in at [city]; a delay on leg 1 is not the airline's responsibility for leg 2.'",
              "ticket_pdf_url missing though ticket issued -> show PNR + 'View' disabled with 'Ticket PDF still arriving', offer 'Talk to us'; never a dead 'View' that errors. Real string on PDF open failure: 'Could not open ticket'.",
              "PG fee on a refundable fare -> explicitly label it non-refundable so a later cancel is not a surprise. [FareDetailsBottomSheet, FinalPaymentCalculationCard]",
              "Booking is Away Advance awaiting payment -> show 'Booked with away credits / Pay now to avoid cancellation' with the [H]H [M]M LEFT countdown, not a clean 'confirmed' face.",
              "Domestic booking -> passport/nationality fields were never collected; passenger rows show name/type only. International booking -> passport details were required before payment; no six-month-validity or visa check exists (real gap), so the agent must not imply documents are cleared.",
              "Fare rules differ per leg -> surface the stricter cancellation/no-show terms prominently; do not let the traveller assume the whole trip follows the better leg's rule.",
              "Notification/Pusher miss on ticket-issued -> the focus-time poll still flips the state on next open; no dead state."
            ]
          },
          {
            "label": "What the agent shows",
            "items": [
              "Confirmation header: 'Your trip to [destination]', subtitle '[origin] - [destination]' with the date range. [PostBookingDetails]",
              "Per-leg cards labelled 'Onward' and 'Return' (round trip) or a single card (one-way), each with airline, flight number, cabin class, route/layover summary ('Direct flight [origin] to [destination]' or 'This flight has N stop(s)'). [LayoutDetails]",
              "PNR strip per leg: label 'PNR Number', code tappable to copy, toast 'PNR copied to clipboard'. Spinner + 'Fetching Tickets' if that leg is not yet issued.",
              "Documents section: heading 'Documents', 'Ticket(s)' with a 'View' link opening a bottom sheet titled 'Tickets to [destination]' listing PNR and the ticket PDF (ticket_pdf_url). [TripDocuments]",
              "Passengers section: 'Passengers' header with per-passenger rows tagged Adult / Child / Infant. PNR is shared per leg across passengers. [TripPassengers]",
              "Airline contact: airline name, phone, website surfaced from IAirlineInfo for when the traveller needs the carrier directly. Real gap: no guided contact flow, just the raw details.",
              "Fare rules made legible per leg: a summary line ('Refundable · Changeable', 'Non-refundable', or 'Non refundable' with XCircle icon) plus a collapsible 'Cancellation' and 'Date Change' rendered as a time-based timeline (from_hours/to_hours, fee, 'From [amount]'). [PolicySummary, PolicyTimeline]",
              "Amber 'Codeshare' tag with 'Operated by [operated_by_name]' on any leg where operated_by differs; Terminal Change warning where adjacent terminals differ.",
              "Bill summary on tap: 'Subtotal', 'Taxes & Fees', 'Payment gateway charge (X%)', 'Away Cash', 'Total', with the non-refundable PG-fee note. [TripPayments, FareDetailsBottomSheet]",
              "Structural-truth callouts (speculative, no field exists): a one-ticket vs self-transfer banner, baggage-recheck note at the transfer point, and connection-liability note, all marked as needing confirmation."
            ]
          },
          {
            "label": "What the agent does",
            "items": [
              "1. On payment success, invalidate ['booking-details-by-id', bookingId] to force a refetch so the screen flips to ticketing/confirmed. [payment-ticketing]",
              "2. Poll booking details (10s if created_at < 1h old, else 60s) until every leg's ticket_status reaches 'issued' or a terminal failure; BNPL flow may poll at 5s. [useBookBookingDetailsById]",
              "3. As each leg issues, populate its PNR strip and enable its 'View' ticket PDF; surface 'Your flight ticket is successfully booked' in the post-booking chat once all legs are done.",
              "4. Translate each fare's parsed_fare_rules into the plain summary line + tier timeline; fall back to raw cancel_policy if null, or 'Rules not available'.",
              "5. Flag codeshare legs amber and name the operating carrier; flag terminal changes; (speculative) flag self-transfer / two-ticket structure and baggage/connection liability.",
              "6. Make the PNR one-tap copyable and pre-stage the airline contact so the person can act, but take no binding action itself.",
              "7. If a leg failed, surface the honest failure state and route to 'Talk to us' rather than retrying silently.",
              "8. After the poll window with no terminal state, stop the spinner and hand off to 'My Bookings' ('Track in My Bookings') rather than freezing the screen."
            ]
          },
          {
            "label": "Analysis parameters",
            "items": [
              "Per-leg ticket_status across flights[] -> decides issued vs fetching vs failed rendering (each leg independent).",
              "flight.pnr presence -> gates the PNR strip and any later check-in affordance (!!pnr required; check-in also needs check_in.status='open').",
              "fare.refundable (bool), fare.changeable (bool|null), parsed_fare_rules.cancellation.is_non_refundable -> decides the summary chip wording.",
              "parsed_fare_rules.cancellation.tiers (from_hours/to_hours/fee) -> renders the cancellation timeline; null -> raw cancel_policy text fallback.",
              "segment.operated_by vs marketing carrier -> codeshare amber flag and operating-carrier name.",
              "segment departure_terminal/arrival_terminal across adjacent segments -> Terminal Change warning. [LayoutDetails]",
              "search_params.trip_type + flights[].direction -> Onward/Return grouping and expected leg count (1 for one_way, 2 for round_trip).",
              "Cross-leg airline/supplier_id comparison (speculative; no field exists) -> infer single-PNR vs self-transfer to decide the liability banner.",
              "payment_type + away_advance_status + payment_due_at -> whether to show the 'Pay now to avoid cancellation' countdown instead of a clean confirmed face.",
              "amount_breakdown.pg_fee + pg_fee_pct, credits_applied -> the bill summary and the non-refundable fee callout; convenience fee computed on (grand_total - credits_applied).",
              "isDomesticBooking -> whether passport/nationality were collected; gates any document-status language (which the app does not actually verify)."
            ]
          },
          {
            "label": "Agent copy",
            "items": [
              "'Your flight ticket is successfully booked.'",
              "'Your flight ticket is being fetched.' (any leg still ticketing)",
              "'PNR copied to clipboard'",
              "'Fetching your tickets... We'll notify you.'",
              "'Onward' / 'Return'",
              "'Refundable · Changeable' / 'Non refundable'",
              "'Cancellation: From [amount] if you cancel inside [N]h of departure.' (assembled from tiers)",
              "'Changes not confirmed by the airline for this fare.' (changeable = null; speculative wording)",
              "'This leg is operated by [operated_by_name], not [marketing airline]. Check in and bag drop are with [operated_by_name].' (codeshare; speculative wording)",
              "'Heads up: your terminal changes between flights at [city].' (terminal change; assembled)",
              "'These are two separate tickets. You collect your bags and check in again at [city]. If leg one is late, leg two is not protected.' (self-transfer; speculative, not in code)",
              "'Note: Payment gateway (PG) fees are non-refundable, even on cancellable fares.'",
              "'Could not open ticket.'",
              "'No payment was taken. Our team can help sort this out.' / 'Talk to us' (failed leg)",
              "'Still processing... We'll notify you once it's confirmed. You can check the status in My Bookings.' / 'Track in My Bookings' (stuck non-confirmed)"
            ]
          },
          {
            "label": "Failure modes",
            "items": [
              "Ticket issued but PDF URL missing -> show PNR and a 'Ticket PDF still arriving' state with 'Talk to us', never a 'View' that throws. On real open failure: 'Could not open ticket.'",
              "One leg fails ticketing after payment captured -> honest per-leg failure card + 'Talk to us'; agent states a human will resolve it, because no partial-refund or auto-rebook flow exists. (Real gap.)",
              "parsed_fare_rules null -> raw cancel_policy text or 'Rules not available'; agent never invents tiers, refund method, or refund timeline (none of which are modelled).",
              "Payment captured but booking stuck non-confirmed (seat lock expired / inventory gone) -> known real gap; show 'Still processing... We'll notify you once it's confirmed. You can check the status in My Bookings.' with 'Track in My Bookings', not an endless spinner.",
              "Polling never reaches terminal -> after the poll window, stop the spinner and hand to 'My Bookings' rather than freezing the confirmation screen.",
              "Notification/Pusher miss on ticket-issued -> the focus-time poll still flips the state on next open; no dead state.",
              "Codeshare/self-transfer/connection-protection structure unknowable from data -> the agent says only what it can verify and marks the rest as needing confirmation rather than asserting a false 'single ticket'.",
              "No offline cache of ticket/PNR (real gap) -> if the device is offline when the traveller wants the ticket, the PDF may not load; agent should note PNR is the copyable fallback."
            ]
          },
          {
            "label": "If it is a group / multi-PNR booking",
            "items": [
              "Round trip renders two stacked cards (Onward, Return), each with its own PNR, ticket PDF, fare rules, and codeshare flag; a leg can be 'issued' while the other is still 'Fetching your tickets'.",
              "Outbound and return ticketed under different airlines / separate PNRs -> the data model has NO field marking this (real gap); the agent must stitch it: state two PNRs, two check-ins, and that the legs are not protected against each other (speculative).",
              "Self-transfer banner (speculative): baggage recheck point named, minimum connection caveat, and 'a delay on leg one does not entitle you to rebooking on leg two'.",
              "Multi-passenger: 'Passengers' lists each traveller; PNR is shared per leg. No in-app way to share the booking with co-travellers (real gap) -> agent offers to relay PNR/PDF on request.",
              "Fare rules can differ per leg -> show the stricter cancellation/no-show terms prominently so the traveller does not assume the whole trip follows the better leg's rule.",
              "Partial cancel of one passenger or one leg is selectable in the agent's cancel tool (CancelBookingInput multi-select) but has no proration display, no refund-status page, and no result confirmation beyond 'Cancel Booking initiated for flights' (real gap) -> agent is explicit that amounts and timeline come from a human follow-up."
            ]
          }
        ],
        "divider": true
      },
      {
        "h": "Checking your travel documents",
        "group": "The first hours",
        "tldr": "The agent runs the document check Away never built: passport presence, the six-month validity rule, transit visas per stop, entry visas per nationality, who is missing what, framed against departure with the real 17-day cutoff so there is still time to fix it. Every visa claim carries an honest \"verify on the official source\" caveat, because the app has zero real visa enforcement today.",
        "p": [
          "This moment is hard because document failures are silent until the airport, and the real app collects passport_number and passport_expiry but validates neither, has no six-month rule, no transit-visa collection, and no entry-requirement check (all confirmed GAPS in doc-check-passport-visa). The principle: surface every blocking gap early, by name, per passenger, with time to act, hand the fix to the person, and never assert a visa rule the agent cannot ground, because being wrong here strands a traveller at the gate. The agent's honest job is triage and hand-off, not clearance."
        ],
        "spec": [
          {
            "label": "States",
            "items": [
              "passengers_pending: booking exists, passport fields collected but unvalidated (real BookingStatus). The doc check fires here.",
              "Doc-check: idle (domestic booking, isDomesticBooking=true; check skipped entirely, no passport/visa UI rendered, matches real conditional rendering)",
              "Doc-check: running (agent reads itinerary and per-passenger fields, computes requirements; rendered via agent-progress style timeline)",
              "Doc-check: clear (every international passenger has passport present, passes six-month rule, no known visa gap; one quiet line, no checklist theatre)",
              "Doc-check: gaps-found-soft (>17 days out, isDepartureMoreThan17Days=true; gaps shown as a to-do, not a payment blocker, mirrors real deferral)",
              "Doc-check: gaps-found-hard (within 17 days; gaps block readiness for payment, mirrors the real isPassengerRowComplete / isReadyForPayment gate on the Pay button)",
              "Doc-check: visa-uncertain (agent cannot ground a transit or entry rule with confidence; flagged 'verify yourself', never asserted as fact) (speculative; no visa engine exists)",
              "Doc-check: assumption-made (passport_country never set by UI, so agent assumed nationality default 'IN' for rule lookup; surfaced as a thing to confirm) (speculative)",
              "ready_for_payment: reached only after every passenger row is complete and addPassengersToAllFlights succeeds (real transition)",
              "Agent-stream interrupted: ChatStatus error or >3s background during the running check; on resume, re-run from booking state, show last good result, never a frozen card (real silent-resume behaviour)"
            ]
          },
          {
            "label": "Edge cases",
            "items": [
              "Domestic booking (India to India, isDomesticBooking=true) -> check does not run; no passport/visa UI at all (real conditional rendering)",
              "International leg but passport missing entirely -> reuse real 'Passport details missing - Tap to add' card, deep-link to the AddPassenger editor",
              "Saved passenger reused from a past domestic trip with no passport on file -> the real forceOpenEditor auto-opens the editor; agent explains why it appeared (real app does NOT otherwise re-check destination, a confirmed GAP)",
              "Passport present but expires within six months of the return date -> flag 'expires too soon for this trip', show exact expiry and the six-month threshold date (the real app has NO six-month rule and lets a passport expiring tomorrow pass; speculative validation)",
              "Passport expires after departure but before return -> separate, louder flag: 'valid to leave, not to come back'",
              "Passport_expiry set to today or near-term (real DateTimePicker only blocks past dates) -> agent catches the borderline case the UI permits",
              "Passport number looks malformed (real input accepts any alphanumeric up to 8 chars, no format check) -> 'this passport number looks off, double-check it', do not silently pass (speculative)",
              "Transit stop needs a transit visa for this nationality -> surface as a named per-stop gap; today only a red 'Transit Visa' display tag exists with no collection or enforcement, so agent states it, caveats it, and hands off (speculative enforcement)",
              "Destination needs an entry visa for the passenger's nationality -> flag with 'verify on the official source', never claim approval (no visa_obtained field exists; speculative)",
              "Mixed group: one clear, one missing passport, one expiring -> per-passenger breakdown, never a single blended verdict",
              "Departure >17 days out -> passport deferrable to proceed (real isDepartureMoreThan17Days), gap framed 'you have time', deadline stated",
              "Departure within 17 days -> gap becomes a hard block to payment readiness, framed with urgency but no shame",
              "passport_country never set by UI -> agent assumes nationality field (defaults 'IN') and says so, flags the assumption to confirm",
              "Infant or child on an international leg -> still needs a passport; do not skip them even though infants are excluded from ancillaries (real maxAncillaryPassengers excludes infants, but document rules do not)",
              "Visa rule unknown for an unusual nationality or route -> state uncertainty plainly, point to the official government source, do not guess",
              "Booking expires or is_expired during the check (real expires_at window) -> stop, surface the expiry, do not present a stale doc card"
            ]
          },
          {
            "label": "What the agent shows",
            "items": [
              "A per-passenger checklist card (awHub hub layout): each passenger row with name and a status chip (Clear / Missing passport / Expires too soon / Visa to check)",
              "Passport line per international passenger: number masked, expiry date, and a computed 'valid through' verdict against the trip dates",
              "The six-month threshold date shown explicitly, not just pass or fail (e.g. 'needs validity past 14 Dec 2026') (speculative)",
              "Per-stop visa strip for multi-leg itineraries: each transit airport with required / not-required / verify status (speculative)",
              "Reuse of the real red 'Transit Visa' tag styling for flagged stops",
              "Deadline line framed against departure: 'X days to departure' plus the real 17-day cutoff when relevant",
              "A single primary action per gap: 'Add passport' (opens AddPassenger editor) or 'Open official visa page' (hand-off link)",
              "A visible 'assumed Indian nationality' note whenever passport_country is unset and the agent fell back to the default",
              "A quiet all-clear state when nothing is wrong: one line, no checklist theatre",
              "Honest source caveat on every visa claim: 'Confirm on the official government site, requirements change'",
              "A 'Re-check documents' affordance, so a stale card after an edit is never a dead end"
            ]
          },
          {
            "label": "What the agent does",
            "items": [
              "1. Detect international leg via isDomesticBooking; if domestic, do nothing",
              "2. Read passengers[] and each passport_number, passport_expiry, nationality (or assume 'IN' default, flag the assumption)",
              "3. Compute trip date window: earliest departure_time and latest return arrival from the itinerary",
              "4. For each passenger, check passport presence, then expiry against the six-month-past-return rule (speculative; not in code), and the can-you-even-leave check against departure",
              "5. Sanity-check passport number shape, flag anything that looks malformed (speculative; UI does no format check)",
              "6. For each segment and transit stop, look up transit-visa and entry-visa need for that nationality, tagging each with a confidence level (speculative; today only a display tag exists)",
              "7. Roll up per-passenger and per-stop gaps; rank by severity (missing > expiring > visa-to-verify)",
              "8. Frame the deadline: compute days-to-departure and apply the real 17-day cutoff (deferrable vs required)",
              "9. Present the checklist, lead with the worst gap, offer one concrete fix per item",
              "10. Hand off: open the passport editor (forceOpenEditor) or the official visa page; never mark a visa 'obtained' on the user's behalf",
              "11. Re-run the check when the user saves a passport edit, update the card in place; on stream interrupt, re-run from booking state and show last good result"
            ]
          },
          {
            "label": "Analysis parameters",
            "items": [
              "isDomesticBooking (gates the whole check)",
              "passport presence per passenger (real completeness check; the only thing the app actually validates today)",
              "passport_expiry vs (latest return date + 6 months) -> the validity verdict (speculative)",
              "passport_expiry vs departure date -> the can-you-leave check",
              "passport_number shape vs expected format -> malformed-data flag (speculative)",
              "days-to-departure vs 17-day cutoff (real isDepartureMoreThan17Days) -> soft to-do vs hard block",
              "whether nationality is real or the assumed 'IN' default (passport_country is never set by UI) -> reliability of the visa lookup",
              "passenger nationality -> which visa rule set applies",
              "each transit airport code -> transit-visa requirement for that nationality (speculative)",
              "destination country code -> entry-visa requirement for that nationality (speculative)",
              "PassengerType (infant/child/adult) -> infants and children still need passports internationally; do not skip",
              "confidence of each visa rule -> assert vs 'verify yourself' caveat",
              "leg direction (outbound/return on flights[]) -> a visa needed only on the return must still surface"
            ]
          },
          {
            "label": "Agent copy",
            "items": [
              "\"You are flying internationally, so I checked everyone's documents.\"",
              "\"Priya's passport expires 12 Aug 2026. Most countries want six months past your return, which here means valid past 14 Dec 2026. You will likely be turned away. Renew before you travel.\"",
              "\"Two passengers still have no passport on file. Tap to add it and I will re-check.\"",
              "\"Arjun's passport is valid to leave but expires before your return date. You can fly out, not back. Sort this before you go.\"",
              "\"Your stop in Doha may need a transit visa for an Indian passport. I cannot confirm that here, so please check the official Qatar site before you fly.\"",
              "\"You are 24 days out, so this is not blocking your payment yet. It is worth fixing now while there is time.\"",
              "\"You are 9 days from departure. The passport gap has to be sorted before you can pay and ticket.\"",
              "\"I assumed Indian nationality for the visa check. If that is wrong for anyone, tell me and I will redo it.\"",
              "\"Everyone's documents look in order for this trip. I will flag it again if anything changes.\""
            ]
          },
          {
            "label": "Failure modes",
            "items": [
              "Visa rule unknown for the nationality or route -> say so plainly and link the official source; never fabricate a requirement or a clearance",
              "Agent asserts a visa rule that is wrong -> worst failure here, strands a traveller; mitigated by defaulting to 'verify yourself' whenever confidence is not high, never the other way",
              "Passport data garbled (real app accepts any alphanumeric up to 8 chars) -> flag 'this passport number looks off' rather than silently passing",
              "Itinerary has no resolvable transit info (no PNR-stitching model exists, confirmed GAP) -> show the legs you can read, mark the rest 'could not check', never a blank or a spinner",
              "Agent stream drops mid-check (real >3s background, silent-resume) -> on return re-run from booking state and show the last good result, not a frozen card",
              "User edits passport but card does not refresh -> re-trigger on save; if still stale, offer the manual 'Re-check documents' action",
              "Six-month logic gives a borderline result (expiry within days of the threshold) -> show exact dates and let the person judge, do not round to a false pass",
              "Over-blocking risk within 17 days -> always state exactly what is missing and the one action to clear it, so the block never feels like a dead end",
              "Booking expires mid-check (real expires_at) -> abandon the doc card and surface the expiry, do not leave the user acting on a dead booking"
            ]
          },
          {
            "label": "If it is a group / multi-PNR booking",
            "items": [
              "The check is per-passenger, never a single group verdict: a clear lead traveller does not hide a co-traveller's missing passport",
              "Each passenger keeps their own nationality and therefore their own visa rule set; one Indian and one foreign-passport traveller on the same booking get different transit and entry checks",
              "Multi-leg itineraries (real flights[] with direction outbound/return) get a per-stop visa strip per direction; a transit visa needed only on the return is still surfaced",
              "The app stores both legs in flights[] with no PNR-stitching model (confirmed GAP); the agent treats every transit airport as a real document checkpoint regardless of how it is ticketed, and says it cannot verify connection-level transit rights",
              "The deadline uses the earliest departure across the group, so the strictest clock governs everyone",
              "One passenger blocking within 17 days holds payment readiness for the whole booking; the agent names exactly who, so the group can chase the right person",
              "Saved passengers quick-added from one member's profile may carry stale or missing passport data for others; agent checks each row independently, not just the slots filled manually"
            ]
          }
        ],
        "divider": true
      },
      {
        "h": "Watching your booked flight",
        "group": "The first hours",
        "tldr": "Today Away watches three concrete things (price drift before capture, the check-in window opening, on-demand live status) and pings you on real Pusher events plus best-effort push; the always-on 90-day steward and active schedule-change monitor are the intended promise, not yet the code. The honest answer to \"is anyone watching\" is: the booking is being confirmed and a few things are armed, but live disruption is fetched only when you open it.",
        "p": [
          "The minute payment clears the traveller wants to stop worrying and hand the vigilance to someone else. The honest principle here is to name exactly what is actively watched (price, check-in, ticketing progress) versus what is passive and needs them to open the booking (live flight status, schedule changes), so the calm we offer is earned and not theatre. Over-claiming \"we've got it\" when a schedule change can pass silently would be the real betrayal."
        ],
        "spec": [
          {
            "label": "States",
            "items": [
              "BookingStatus: passengers_pending to ready_for_payment to payment_pending to payment_processing to ticketing to confirmed (terminal also cancelled, expired, ticketing_failed); this moment begins at 'ticketing' and settles at 'confirmed' (src/common/types/bookingDetailsTypes.ts).",
              "VerifyPollStatus: polling to captured or failed or timeout; the payment-gateway verify loop (2s interval, 30s window) that precedes 'ticketing', Cashfree-mandatory, Razorpay terminal-on-callback (src/features/paymentProcessing/hooks/usePaymentVerifyPoll.ts). This is the literal first minute of the moment.",
              "TicketStatus per flight: pending to ticketing to issued to failed; pnr is null until 'issued', so the watch cannot fully arm and check-in cannot unlock until tickets are in hand.",
              "PaymentPhase derived view: pending, issuing_ticket, away_advance_due, away_advance_settled, confirmed, failed, expired (derivePaymentPhase in src/features/bookingDetails/helpers/bookingPhase.ts); drives whether the card shows 'Fetching your tickets', the BNPL due card, or the live watch surface.",
              "PriceStatus (useBookingPriceUpdate.ts): idle to price_changed or fare_unavailable to price_verified; the only real-time price watch in code, fired by the booking-price-updated Pusher event. Note: this fires during the confirm/capture window, not as an open-ended post-booking price-drop monitor.",
              "CheckInStatus: not_open to open to closed; flips via booking-details polling, surfacing the 'Check in' button per leg.",
              "Polling cadence state: useBookBookingDetailsById polls every 10s when created_at is under 1 hour old, else 60s (callers can override, e.g. BNPL uses 5s); this 'first hours' window is the fast-poll window. Polling STOPS on terminal states (confirmed standard, cancelled, expired, ticketing_failed).",
              "FlightStatus.status ('Scheduled', 'On Time', 'Arrived', plus cancelled/diverted booleans, progress_percent): populated only on-demand when the booking is opened with include_flight_info=true (passive, not a background watch).",
              "AwayAdvanceStatus: awaiting_payment, settled, overdue; independent of BookingStatus, gates the 'Pay now to avoid cancellation' countdown.",
              "PusherConnectionStatus: CONNECTED or DISCONNECTED with exponential backoff (1s to 30s, max 8 attempts); determines whether a real-time ping can even land.",
              "Speculative: a persistent 90-day 'steward' state machine, an active schedule-change monitor, and a smart-hold/auto-rebook state; none exist in code (per concierge-agent-surface and schedule-change-disruption notes, the home copy 'Away is ready to negotiate your next flight' is a recurring nudge, NOT a time-gated post-booking watch)."
            ]
          },
          {
            "label": "Edge cases",
            "items": [
              "Cashfree dismissed without choosing a method during verify -> status stays 'created', wait CREATED_GRACE_MS (5s) for webhook, then treat as failed, distinct from a real decline.",
              "Verify exceeds 30s still pending -> VerifyPollStatus=timeout; show 'Still processing... check My Bookings', never an endless spinner. Hardware back / iOS swipe are locked while polling so the traveller cannot abort mid-capture.",
              "Tickets still issuing when the watch should start -> show 'Fetching your tickets... We'll notify you', keep fast-polling; do not promise live status until ticket_status='issued' and pnr exists.",
              "Payment captured but booking never confirms (seat lock expires, inventory depleted) -> real gap: user may see 'Payment confirmed' while booking is stuck non-confirmed; honest recovery is route to support, not implied calm.",
              "Supplier price drifts up or down before capture -> booking-price-updated fires any_price_changed=true; PriceStatus=price_changed, show old vs new per flight, user accepts new price (payment restarts with fresh order_id) or re-searches. Accept-or-block, never silent.",
              "Net price delta across flights is zero -> silently accept, no bottom sheet (avoid noise for a non-event).",
              "Fare itself becomes unavailable -> any_fare_changed=true; PriceStatus=fare_unavailable, payment blocked, only path is 'Search for Alternatives'. There is no override.",
              "Check-in window opens for only one leg of a round trip -> surface 'Check in' for the leg whose check_in.status='open' and airline_url exists; HomeUpcomingTripCard scans for the first checkin-ready flight, not just flights[0]. No unified all-legs check-in.",
              "Check-in window not yet open or already closed -> show 'Opens [time]' (no CTA) or 'Closed, head to the counter about 90 min before departure' (no CTA); never a dead button.",
              "Live status partial or missing mid-air -> degrade to basic segments plus check-in; render history breakdown only if history[] length > 0; multi-segment shows a tab bar per segment_index; never a dead 'loading status' state.",
              "Terminal change between connecting segments -> if arrival terminal of one segment differs from departure terminal of the next, render the TerminalChange warning.",
              "Away Advance awaiting payment -> not a clean 'watched' state; show 'Booked with Away credits, pay now to avoid cancellation' with the HH MM LEFT countdown from payment_due_at instead of the calm watch.",
              "Schedule change pushed by the airline (departure moved hours) -> NOT detected today; the app will not know until the user opens the booking and live status is fetched (real gap, no proactive alert).",
              "Push token stale or Pusher reconnecting -> a real-time ping can be missed entirely; recovery is the next booking-details poll, so the watch is eventually-consistent, not guaranteed real-time.",
              "Stream interrupted while app backgrounded >3s during an agent reply -> gated resume heals on foreground, no duplicate assistant message; the concierge answer is not lost."
            ]
          },
          {
            "label": "What the agent shows",
            "items": [
              "A booking/hub card (awHub) headed by route, dates, and current phase badge ('Confirmed', or 'Fetching your tickets...'); also surfaced as HomeUpcomingTripCard on the home tab once the booking is upcoming.",
              "PNR strip (tap to copy, toast 'PNR copied to clipboard') once ticket_status='issued'; shows 'Fetching Tickets' spinner while still ticketing.",
              "A quiet 'what we're keeping an eye on' line listing the real watches honestly: price (until capture), check-in window, and live status on request.",
              "Price-change bottom sheet when it fires: 'Prices Have Changed' / 'Flight prices were updated during verification. Review the changes below.', per-flight old vs new, buttons 'Looks Good, Continue' and 'Search for Alternatives'.",
              "Fare-unavailable sheet: 'Fare No Longer Available' / 'Your selected fare is no longer available. Please select a new fare.' with 'Search for Alternatives'.",
              "'Check in' button appearing in place when check_in.status flips to 'open' ('Web-check has started, click check-in to proceed'); tapping copies the PNR and opens the airline URL in an in-app browser.",
              "Live status badge and on-time history breakdown only after the user taps to fetch (include_flight_info=true): gate, boarding time, terminal, baggage claim, weather, 'On time N% of the time', with cancelled/diverted counts in the history bars.",
              "BNPL due card with the HH MM LEFT countdown when payment_type='away_advance' and away_advance_status='awaiting_payment'.",
              "Concierge entry point so the person can ask 'is my flight on time?' or cancel a passenger at any moment; quick-reply suggestion chips (suggestions Pusher event) like 'Check delay', 'Cancel flight', 'View receipt'."
            ]
          },
          {
            "label": "What the agent does",
            "items": [
              "1. Confirm the booking is real: after the verify poll captures, poll booking-details fast (10s under 1 hour old) until BookingStatus='confirmed' and every flight ticket_status='issued'; stop polling on any terminal state.",
              "2. Subscribe to the booking-price-updated Pusher channel for this booking and arm the price watch through the capture window.",
              "3. The moment tickets issue, surface the PNR and copy affordance; invalidate the booking-details query so the UI flips to confirmed.",
              "4. Watch check_in.status via polling and reveal the 'Check in' button per leg when it opens; auto-copy PNR and open the airline URL on tap.",
              "5. On any non-zero price event, raise the accept-or-block sheet and wait for the person to decide (never auto-accept a non-zero delta; re-verify before commit).",
              "6. On request only, fetch live FlightStatus (ui_request_flight_details) and render gate, boarding time, terminal, and on-time history; per segment if multi-leg.",
              "7. Hand off, do not drive: every consequential action (accept new price, cancel a passenger via ui_cancel_booking, check in) is initiated by the agent and committed by the person. Real tools today: search_flights, ui_request_flight_details, ui_web_checkin, ui_cancel_booking, ui_navigate, ask_user_questions. Amend is shown as a chat skill button but has NO backing tool; there is no rebooking tool.",
              "8. Register a push token (/devices/push-token) so disruption pings can route to the booking's Chat tab; delivery is best-effort, not guaranteed.",
              "Speculative (intended, not coded): proactively re-price the route over 90 days and offer a rebook on a real drop; actively poll airline schedule-change feeds and alert before the traveller asks; auto-rebook both legs when one is cancelled."
            ]
          },
          {
            "label": "Analysis parameters",
            "items": [
              "Verify-poll state and elapsed time vs the 30s window, plus gateway (Razorpay terminal vs Cashfree poll-mandatory) to decide capture confidence.",
              "Booking recency (created_at vs now, the 1-hour threshold) to pick 10s vs 60s poll cadence; terminal-state check to stop polling.",
              "Per-flight ticket_status and presence of pnr to decide whether the watch is fully armed (leg by leg).",
              "any_price_changed vs any_fare_changed booleans to choose price_changed (accept) vs fare_unavailable (block).",
              "Net price delta summed across flights[] (zero = silent accept, non-zero = surface sheet).",
              "check_in.web_opens_at / web_closes_at vs now, plus airline_url presence, to gate the per-leg check-in CTA.",
              "departure_delay_minutes / arrival_delay_minutes bucketed (15m or under on-time, 15 to 30, 30 to 45, 45m plus) for the on-time readout; cancelled/diverted flags counted separately.",
              "payment_type, away_advance_status, and payment_due_at vs now to drive the BNPL countdown vs the calm watch.",
              "Pusher connection health and push-token freshness to know whether a real-time ping is even deliverable (and to fall back to poll).",
              "include_flight_info presence and history[] length to decide whether live status and on-time bars can render at all.",
              "Speculative: route price history and a drop threshold worth a rebook; layover_minutes vs incoming delay for missed-connection risk; schedule-change delta vs original segment times."
            ]
          },
          {
            "label": "Agent copy",
            "items": [
              "From here, Away is keeping an eye on a few things for you: the price while we confirm, when check-in opens, and live flight status whenever you ask.",
              "Your tickets are being fetched. We'll notify you the moment your PNR is ready.",
              "Prices changed during verification. Here's the old and new for each flight, your call.",
              "This fare is no longer available. I can look for alternatives on the same route and dates.",
              "Web check-in has started. Tap to check in on the airline's site, I've copied your PNR.",
              "Want me to pull the live status? I can show the gate, boarding time, and how often this flight runs on time.",
              "Honest note: I don't yet auto-alert on airline schedule changes. To be sure, open the booking and I'll refresh the live status.",
              "Still processing your payment. We'll notify you once it's confirmed, you can check My Bookings."
            ]
          },
          {
            "label": "Failure modes",
            "items": [
              "Payment verify times out (still pending at 30s) -> 'Still processing... We'll notify you once it's confirmed', route to My Bookings; never block forever. Risk: Cashfree webhook may land later, so a 'timeout' can actually settle (real gap, no reconciliation UI).",
              "Ticketing fails after payment (ticket_status='failed', status='ticketing_failed') -> stop polling, drop the calm framing, say plainly 'No payment was taken. Our team can help sort this out', offer 'Talk to us'. Never an endless spinner.",
              "Live status fetch returns null or partial -> show what we have (segments, check-in) and say status is unavailable right now, not a blank loading card.",
              "Price Pusher event missed (socket reconnecting) -> the next booking-details poll reconciles; if a stale price is shown, the accept step re-verifies before any commit.",
              "Push notification not delivered (stale token, Pusher down) -> the watch degrades to open-the-booking-to-refresh; be honest that real-time alerts are best-effort.",
              "Booking expires mid-window (Away Advance unpaid, or pre-booking window closes) -> no warning until the next poll interval; surface the countdown and 'Pay now to avoid cancellation' rather than implying it is safely watched.",
              "Airline schedule change happens silently -> today this is simply not caught; do not imply otherwise. Honest recovery is the on-demand live-status refresh.",
              "Insufficient Away Cash at capture -> top-up modal opens a fresh gateway session, but the recomputed total after credits is not clearly re-shown (real gap)."
            ]
          },
          {
            "label": "If it is a group / multi-PNR booking",
            "items": [
              "Each flight carries its own ticket_status and pnr; the watch arms leg-by-leg, so one leg can show 'Confirmed' while another still says 'Fetching your tickets'.",
              "Round trips can have staggered check-in windows; surface 'Check in' per leg as each check_in.status flips to 'open', not all at once (no unified all-legs check-in exists).",
              "Price events arrive per flight in the booking-price-updated flights[] array; show per-flight deltas and let the net-zero rule suppress noise across the set.",
              "Partial ticketing failure is possible (outbound issued, return failed); show the failed leg honestly and route to support rather than a blanket 'confirmed'.",
              "Per-passenger cancellation is selectable in ui_cancel_booking (multi-select with 'Select All Passengers'), but the watch does not track per-passenger refund proration (gap), and cancel only emits 'Cancel Booking initiated' with no refund status follow-up.",
              "Domestic vs international affects what was even collected: passport/visa are only gathered for international bookings, and there is no 6-month-validity or transit-visa enforcement (the 'Clearing transit & visa requirements' timeline line is theatre).",
              "No model distinguishes single-PNR from self-transfer two-ticket structures, so connection-risk and through-baggage are not watched across legs (speculative to add)."
            ]
          }
        ],
        "divider": true
      },
      {
        "h": "\"My flight time just moved\"",
        "group": "During the trip",
        "tldr": "A schedule change lands weeks out; the agent reads the new itinerary back, says plainly what got worse, and lays out the options, but the person decides whether to keep, change, or cancel. It never silently rebooks, and it is honest that there is no real rebooking tool and no proactive watch in the shipped app.",
        "p": [
          "A schedule change arrives as a cold airline fact, weeks out; the traveller must decode what changed and whether it still works. The agent does the diffing and reads it back plainly, recommends a path, and hands off the commit. It never silently rebooks. Speculative and load-bearing to state up front: the real app has NO proactive schedule-change detection, NO push for it, NO downgrade or equipment-swap flag, NO missed-connection detection, and NO rebooking tool. FlightStatus is only fetched on demand when the booking is opened (include_flight_info=true). The \"change\" path the user expects is partly a dead end: an amend_booking chat button renders (TimeSetting icon) but has no backing tool. The honest spine of this moment is: detect-on-open, diff, read back, recommend, hand off to cancel-and-re-search."
        ],
        "spec": [
          {
            "label": "States",
            "items": [
              "Quiet (real): booking is confirmed + ticketed (BookingStatus=confirmed, all flights ticket_status=issued, PNR present). No schedule-change signal exists in code. Live FlightStatus is only fetched when the user opens the booking with include_flight_info=true; until then the agent has only booked segments[] times.",
              "Stale-by-design (real): even when open, live data is polled every 10s (booking <1hr old) or 60s (older), so the agent's view can lag the airline. The agent should not imply real-time watching.",
              "Detected (speculative): a schedule change for a ticketed flight has been picked up. Severity not modelled in code; proposed buckets are minor time shift, major reschedule, equipment swap, involuntary downgrade.",
              "Surfaced: agent posts a disruption card in the post-booking concierge thread and/or a booking banner; old vs new itinerary diff shown. Note: home feed (isBookingUpcoming) filters out cancelled/expired but has no disruption card, so a still-confirmed reschedule would not show on home today (speculative to add).",
              "Reading-out: agent reads back what changed in plain language and names the single most important consequence first (tight connection now, earlier wake-up, land after midnight, different cabin).",
              "Deciding: options laid out (keep as-is, ask airline for a change, cancel for refund/credit). Agent recommends one. User has not committed.",
              "Handoff: user taps to keep, or to start cancel (real CancelBookingInput tool, passenger multi-select), or is routed to manual re-search (real: search_flights in chat). Agent prepares, person commits. There is no in-app 'change my flight' commit (amend_booking button has no backing tool).",
              "Resolved/closed: user kept the new times, or cancel was initiated (status='cancel_booking_initiated'), or a fresh booking was created via re-search. Thread shows what was sent; refund status is NOT tracked (real gap).",
              "Degraded: detection or live data unavailable; agent falls back to booked segments[] times it can actually show and is honest about the gap rather than inventing a time."
            ]
          },
          {
            "label": "Edge cases",
            "items": [
              "Minor time shift (small departure_delay_minutes) -> agent shows the diff but de-emphasises it: 'small change, nothing you need to do.' No recommendation to act.",
              "Major reschedule (departure moved hours, or different flight number) -> agent leads with the new time, flags downstream effect (check-in window, arrival night), recommends reviewing and offers cancel-for-refund if fare allows (reads parsed_fare_rules and changeable/refundable).",
              "Equipment swap (speculative; no equipment_swap flag) -> if inferable from flight_info[].airplane.model_name changing, agent notes it neutrally ('aircraft changed to A320'); only escalates if it implies seat or cabin loss.",
              "Involuntary downgrade (speculative; no cabin_downgrade flag) -> agent states the cabin paid for (search_params.cabin) vs the cabin now, names this as a likely compensation case, hands off to contacting the airline. It does not promise compensation (no rights calculator in code).",
              "Round-trip, only one leg changed -> agent diffs per IBookingFlight.direction (outbound/return), changes only the affected leg's card (Onward/Return label), leaves the other untouched.",
              "Multi-segment leg, one segment changed -> live data is tabbed by segment_index; agent diffs the affected segment and surfaces the terminal-change warning if arrival terminal of one segment differs from the next departure terminal (real TerminalChange logic).",
              "Connection now too tight (speculative; no missed-connection detection) -> agent computes new layover vs a minimum and warns: 'your connection in DXB is now 35 min, that is tight.' Marked as proposed analysis, not shipped.",
              "Change lands while booking is not yet ticketed (ticket_status pending/ticketing) -> agent waits; it does not surface a schedule change on an unconfirmed seat. Falls back to real string 'Fetching your tickets... We'll notify you.'",
              "Ticketing failed (ticket_status=failed, BookingStatus=ticketing_failed) -> derivePaymentPhase='failed'; this is not a reschedule, agent routes to support/re-search, not a diff.",
              "Airline already cancelled the flight (FlightStatus.cancelled=true or BookingStatus=cancelled) -> this is the cancellation moment, not a reschedule; agent routes to cancel/refund and manual re-search. Note: a cancelled booking is filtered off the home feed, so the only surface is the thread.",
              "Flight diverted (FlightStatus.diverted=true) -> distinct from delay; agent states the alternate airport from live data and does not guess onward logistics.",
              "Live status partial or null (mid-data, mid-air) -> agent shows booked times from segments[], renders only history[] that exists, says live data is unavailable rather than inventing a time.",
              "Price-change event collides with schedule change -> separate channels (useBookingPriceUpdate any_price_changed/any_fare_changed vs the proposed schedule watch); agent keeps them as two distinct cards and does not conflate a fare change with a time change. If any_fare_changed=true on an unticketed hold, that is the 'Fare No Longer Available' path, not a reschedule.",
              "User taps the disruption from a killed app via push -> usePushNotifications routes data.screen='concierge'+booking_id to /postBookingDetails?tab=Chat so the card and agent context are right there.",
              "Fare rules unparsed (parsed_fare_rules null) -> agent falls back to the raw cancel_policy string: 'I can't read the exact change rules here, let's confirm with the airline.'",
              "User asks to be rescheduled in-app -> the amend_booking button exists but has no backing tool; agent must not pretend to amend. It cancels-and-re-searches instead, and says so."
            ]
          },
          {
            "label": "What the agent shows",
            "items": [
              "Disruption card (awDisruption figure) in the post-booking concierge thread: a clear 'Your flight time changed' header, with the affected leg labelled Onward or Return (real labels).",
              "Old vs new diff row: original departure/arrival muted, new departure/arrival emphasised, with the delta ('+2h 40m later').",
              "A one-line consequence under the diff ('You now land after midnight' or 'Connection in DXB is now 35 min').",
              "Severity tone, not a numeric badge: minor changes look calm and grey; major changes get warmer, more prominent treatment. No severity field exists in code, so tone is the only carrier (speculative styling).",
              "Fare-rule context from parsed_fare_rules: changeable / refundable and the cancellation tier (from_hours/to_hours/fee) that applies now.",
              "Action options as buttons/chips: 'Keep these times', 'Look at alternatives' (runs search_flights), 'Cancel for refund' (real cancel uses CancelBookingInput passenger-select UI). No 'amend' button, since it has no tool.",
              "Live operational details when fetched: gate, terminal, baggage_claim, on-time history (real string 'On time {N}% of the time') from flight_info[].history, and weather (origin_weather/destination_weather) if it helps set expectations.",
              "Codeshare note: if FlightSegment.operated_by differs from the marketing airline, agent names who actually operates the flight so the user contacts the right carrier.",
              "PNR strip (copyable, real string 'PNR copied to clipboard') so the user can deal with the airline directly.",
              "Quick-reply suggestion chips at the bottom of chat (real suggestions Pusher event), e.g. 'Cancel flight', 'Check delay', 'View receipt'."
            ]
          },
          {
            "label": "What the agent does",
            "items": [
              "1. Detect the change (speculative) and pull the current itinerary; in the real app this is a FlightStatus fetch via include_flight_info=true when the booking is opened (ui_request_flight_details in chat).",
              "2. Diff new vs booked segments[] times per leg and per segment_index, compute deltas and downstream effect (arrival hour, connection slack, check-in window from check_in.web_opens_at/closes_at).",
              "3. Read parsed_fare_rules to know changeable/refundable and which cancellation tier applies now; fall back to raw cancel_policy if null.",
              "4. Post the disruption card and, if push is wired, send a notification routed to the booking's Chat tab.",
              "5. Read the change back in plain words and name the single most important consequence first.",
              "6. Recommend one path (keep / change / cancel) based on severity and fare flexibility, and say why.",
              "7. Hand off: present the buttons but do not act. For cancel, open CancelBookingInput (passenger multi-select); for alternatives, run search_flights in chat. There is no auto-rebook and no amend tool.",
              "8. If the user asks a vague question ('reschedule me'), run ask_user_questions to get the missing date/constraint before doing anything; the answer comes back as plain text.",
              "9. After the user commits, confirm what was sent in the thread (real: CancelBookingOutput shows 'Cancel Booking initiated for flights'). Do not claim a refund is confirmed, there is no refund-status surface."
            ]
          },
          {
            "label": "Analysis parameters",
            "items": [
              "Departure delta and arrival delta in minutes (new vs booked segment times; mirrors FlightStatus.departure_delay_minutes / arrival_delay_minutes, which can be negative for early).",
              "Severity bucket (speculative): minor (small shift), major (hours / flight-number change), equipment swap, involuntary downgrade. No severity field exists in code today; all delays are treated equally in the real on-time calc.",
              "Fare flexibility: changeable (boolean|null, null treated as no), refundable, and the active cancellation tier (from_hours/to_hours/fee). PG fee is non-refundable even on refundable fares (real), so 'refund' is never the full amount.",
              "Connection slack (speculative): new layover minutes vs a minimum connection threshold, per multi-leg itinerary; not computed in code.",
              "Downstream timing: does the new time push arrival past midnight, collide with check_in.web_opens_at/web_closes_at, or break a terminal-change connection (real TerminalChange detection).",
              "Cabin/seat impact (speculative): booked search_params.cabin vs inferred new cabin; flight_info[].airplane.model_name change.",
              "Which leg(s) and which segment(s) affected (IBookingFlight.direction, segment_index) and whether the booking is one_way or round_trip (search_params.trip_type).",
              "Time to departure: days/hours out, to decide urgency. Data staleness: how recently FlightStatus was last polled (10s vs 60s cadence).",
              "Compensation eligibility is NOT computed: no rights/EU261/DGCA calculator exists; agent flags 'likely worth a claim' only as a pointer, never a figure."
            ]
          },
          {
            "label": "Agent copy",
            "items": [
              "'Your flight time changed. Etihad moved your Mumbai departure 2h 40m later, now 9:15pm instead of 6:35pm.'",
              "'Small change here, nothing you need to do. Just flagging it so the new time isn't a surprise.'",
              "'Heads up: you now land at 1:40am instead of 11pm. Same flight, same seat, just later.'",
              "'This is a bigger change. Your connection in DXB is now 35 minutes, which is tight. Want me to look at alternatives?'",
              "'Your fare is changeable, so the airline should move you for free. I can't make the change from here, but I can lay out the options and you decide.'",
              "'Looks like the aircraft changed and your booked cabin isn't on it. That's usually grounds for compensation. I'd contact the airline directly. Here's your PNR.'",
              "'I'm seeing this from your booking, not a live feed, so it may lag the airline by a minute. Here's what I have.'",
              "'I can't see live status for this flight right now. Here are your booked times, and I'll keep what changed honest rather than guess.'",
              "'I can start a cancellation for you, but I can't rebook automatically. If you cancel, you'll re-search and I'll help you find the next one.'",
              "'Want me to keep these new times, or look at what else flies that day?'"
            ]
          },
          {
            "label": "Failure modes",
            "items": [
              "No detection exists (real gap) -> the honest baseline: the change only surfaces when the user opens the booking and FlightStatus is fetched. The agent must never claim to be watching the flight; if a proactive watch ships, say so plainly.",
              "Live status fetch fails or returns null -> show booked times from segments[], state 'live data unavailable', offer the PNR and airline link instead of a spinner.",
              "Push not delivered (stale token / Pusher reconnecting) -> the disruption still renders in-app on next open; agent opens with 'You may have missed an airline update' rather than assuming the user saw it.",
              "Chat message lost while offline (real gap: no offline queueing) -> if the user types 'please help' while Pusher is disconnected, the message is dropped with no local draft; agent cannot rely on it arriving. Surface a send-failure rather than silently swallowing it.",
              "Fare rules unparsed -> fall back to raw cancel_policy and route to the airline; never invent a refund amount or a change fee.",
              "User asks to rebook or amend -> there is no rebooking tool and amend_booking has no backing tool. Agent is upfront: it can cancel and help re-search, but cannot move the seat itself. No fake 'rebooking...' or 'amending...' state.",
              "Cancel initiated but no result surface (real gap: CancelBookingOutput only confirms 'Cancel Booking initiated', no refund-status tracking) -> agent says what was sent and that the user will hear back, does not pretend a refund is confirmed or name a timeline.",
              "Stream drops mid-explanation -> gated silent resume (resumeStream, fires on cold mount or >3s background) heals the thread; the disruption card persists, so facts survive even if the prose is interrupted.",
              "Agent lacks live booking price/fee context (real gap) -> it admits uncertainty on 'is this refundable' rather than guessing, and points to fare rules plus the airline."
            ]
          },
          {
            "label": "Honesty rails",
            "items": [
              "Single most important consequence first: agent picks one (arrival hour, connection slack, cabin loss) and leads with it, rather than dumping every delta.",
              "Never imply a watch: all framing is detect-on-open until a proactive channel ships; the only real proactive channel today is price (useBookingPriceUpdate), not schedule.",
              "Never imply an in-app change: 'change' always means cancel-and-re-search (search_flights) or contact-the-airline, never a one-tap amend.",
              "Never name a refund figure or timeline: no rights calculator, no refund-status surface; agent points to fare tier and the airline.",
              "Never conflate channels: a fare-price change (Pusher) and a schedule change (proposed) stay two distinct cards."
            ]
          },
          {
            "label": "If it is a group / multi-PNR booking",
            "items": [
              "Per-leg, per-PNR diffing: round trips store both flights in flights[] with separate ids and supplier_ids; the agent diffs and surfaces each affected leg independently (Onward / Return labels).",
              "Multi-PNR / self-transfer is not modelled in code (no field flags single-PNR vs separate PNRs). So if outbound and return are on different tickets, the agent treats each as its own change and says so, rather than implying one airline will fix both.",
              "A change on one leg can break the other (speculative): e.g. outbound now lands too late for a tight return connection. Agent flags the knock-on, but cannot orchestrate a joint rebook (no bulk-rebook tool).",
              "Per-passenger: real CancelBookingInput supports selecting which passengers to cancel; for a group, the agent shows the passenger multi-select so the traveller can cancel some and keep others. No per-passenger refund proration is shown (real gap).",
              "Per-flight ticket_status independence: one leg can be issued while another failed; the agent only surfaces schedule changes on legs that are actually ticketed (issued, PNR present).",
              "Codeshare in a group: if operated_by differs from the marketing airline, the agent names the operating carrier so the group contacts the right airline.",
              "Honest limit: for any multi-PNR mess the agent prepares the full picture (what changed on each ticket, what each fare allows) and hands off; it explicitly cannot stitch a single rebooking across two airlines, and there is no refund-status tracking to follow up on."
            ]
          }
        ],
        "divider": true
      },
      {
        "h": "When the airline cancels",
        "group": "During the trip",
        "tldr": "The agent can cancel the dead booking and tee up a fresh search, but it cannot rebook for you: you re-search and re-book the new flight by hand, and you commit every step.",
        "p": [
          "This is the worst moment of the trip and the one the app is least equipped for. There is a cancel_booking tool but no rebooking tool, no PNR-stitching model, no proactive disruption alert, and no refund-status or compensation flow. Detection is passive: live flight status is only fetched when the booking is opened with include_flight_info=true. The agent must do everything it honestly can (detect, explain, cancel, search alternatives, hand off) without pretending it can put you on the next flight itself. The person commits every cancel, every payment, every ticket."
        ],
        "spec": [
          {
            "label": "States",
            "items": [
              "Entry is passive: the cancellation is surfaced only when the user opens booking details (no proactive push). FlightStatus.cancelled=true is read from /bookings/{id}?include_flight_info=true; full-booking cancellation shows as BookingStatus='cancelled'. Polling cadence is 10s if created_at is within 1 hour, else 60s.",
              "BookingStatus path for a fully cancelled booking: confirmed -> cancelled. derivePaymentPhase() returns 'failed'. Polling stops (terminal state). Home feed drops the card: isBookingUpcoming() returns false, so there is no disruption card on home.",
              "Per-flight live state: IBookingFlight.flight_info[].status.cancelled=true and/or FlightStatus.diverted=true; on-time history (history[]) still renders if present. Multi-segment itineraries render a FlightInfoSection tab bar per segment_index, each with its own status.",
              "Per-flight ticket_status is independent (pending/ticketing/issued/failed): on a round trip the return can read 'issued' while the outbound's flight is cancelled. PNR is null until ticket_status='issued'.",
              "Agent surface state (ChatStatus): 'submitted' -> 'streaming' -> 'ready' while it explains and prepares the search; 'error' if the stream drops (autoResumeArmed: one reconnect after 1s in foreground; gated attemptResume() on >3s background).",
              "Clarifying-question state: if the user says 'reschedule me' or 'my flight got cancelled' without a date, the agent can run ask_user_questions; the composer morphs into a QuestionCard (only the most recent card is interactive). Multi-question answers are gathered in a stepper and composeAnswers() sends them as one message.",
              "Cancel tool lifecycle (ToolState): input-streaming -> input-available -> output-available. CancelBookingInput renders the passenger multi-select; on submit, status='cancel_booking_initiated' posts to backend; CancelBookingOutput shows 'Cancel Booking initiated for flights'. Note: cancel is a fire-and-initiate tool with no result/status card after.",
              "Price-change state on the still-live booking (Pusher 'booking-price-updated', useBookingPriceUpdate): PriceStatus idle -> price_changed (same fare, new price, user can accept or dismiss) or fare_unavailable (any_fare_changed=true, payment blocked, 'Search for Alternatives'). Relevant if the dead leg's sibling is still mid-payment.",
              "Re-search state (speculative as a single stitched flow; the pieces exist separately): ui_initiate_flight_search / search_flights -> deep search timeline (TimelineStepStatus pending/active/completed, 15 hardcoded TIMELINE_STEPS) -> DeepSearchFlightResultsResponse.status processing/completed/failed/expired -> new ICreateBookingResponse -> payment -> ticketing -> confirmed. This is a brand-new booking, not a modification of the cancelled one.",
              "Re-book payment state on the new booking: VerifyPollStatus polling/captured/failed/timeout (2s poll, 30s window); Razorpay SDK callback is terminal, Cashfree onVerify requires the polling screen. Away Advance (BNPL) path adds away_advance_status awaiting_payment/settled/overdue.",
              "No rebooking state exists in code. There is no 'rebooked', no 'rebook_pending', no link between old and new booking records (real gap)."
            ]
          },
          {
            "label": "Edge cases",
            "items": [
              "Only the airline cancelled the flight, booking still reads 'confirmed' -> agent reads FlightStatus.cancelled=true from flight_info and explains the flight is cancelled even though the booking record has not flipped; offers to initiate cancel_booking and start a fresh search.",
              "Whole booking already shows BookingStatus='cancelled' -> derivePaymentPhase()='failed', no payment UI, no cancel action needed; agent moves straight to 'let's find you another flight' and a new search.",
              "Round trip, only the outbound leg cancelled -> per-flight independence: flights[0].direction='outbound' is dead while flights[1].direction='return' is fine, and the return can still be ticket_status='issued' with a copyable PNR. Speculative gap: cancelling the whole booking via cancel_booking risks taking down the still-valid return; there is no clean per-direction cancel (CancelBookingInput selects passengers, not legs cleanly per direction), so the agent must warn and let the person decide leg by leg.",
              "Diverted not cancelled (FlightStatus.diverted=true) -> agent reports the diversion and on-time history but has no rebook/compensation tool; hands off to airline counter / support.",
              "Equipment swap, cabin downgrade, missed connection, or airline schedule change (departure pushed back) -> not detectable: FlightStatus has no cabin_downgrade/equipment_swap flag, no layover-vs-delay missed-connection check, no schedule-change monitoring (real gaps). Agent can only report live status it can see.",
              "Ticketing already failed before departure (BookingStatus='ticketing_failed') -> not a true cancellation; phase='failed', agent points to 'No payment was taken. Our team can help sort this out.' / 'Talk to us' rather than a re-search.",
              "Refund of the dead booking -> no refund-status tracking exists post-cancel. cancel_booking sends the request; there is no screen showing approved/amount/timeline/method. Agent must say the refund is handled off-app and not promise a number or date.",
              "PG fee on the original booking -> non-refundable even on refundable fares ('Note: Payment gateway (PG) fees are non-refundable, even on cancellable fares.'). Agent states this honestly.",
              "Cancellation policy is tiered -> parsed_fare_rules.cancellation.tiers (from_hours/to_hours/fee) and is_non_refundable set expectations, but the agent does NOT compute a refund amount (no calculator exists).",
              "New search comes back pricier than the dead fare -> agent shows real new prices via deep search results ('Found X new fares'); never claims it 'rebooked you at the same price'. Honest framing only: a few percent under other OTAs in the worst case.",
              "New booking's fare shifts before payment (Pusher 'booking-price-updated') -> PriceUpdateBottomSheet: price_changed shows old/new and lets the user accept; fare_unavailable ('Fare No Longer Available') blocks payment and offers 'Search for Alternatives'.",
              "Codeshare on the replacement flight -> operated_by differs from marketing carrier; amber 'Codeshare' tag shown. Agent should flag the operating carrier for check-in/counter clarity.",
              "International replacement -> passport_number/passport_expiry required again on the new booking (isDomesticBooking=false); no 6-month-validity or transit-visa enforcement exists (real gaps), so the agent must not imply the app verified entry requirements.",
              "Booking expiry mid re-book (new booking) -> useExpiryWatcher / ExpiredDeepSearchBottomSheet; agent prompts to re-search rather than dead-ending.",
              "Stream drops while agent is mid-explanation -> error status + autoResumeArmed triggers one reconnect after 1s; on background >3s, gated attemptResume() heals from history. No lost-thread dead end."
            ]
          },
          {
            "label": "What the agent shows",
            "items": [
              "A plain status line in booking details: the flight is cancelled (live status badge from FlightStatus), with the affected leg labelled 'Onward' or 'Return'.",
              "If multiple segments: a FlightInfoSection tab bar so the user can see which segment is cancelled vs on time, with per-segment history breakdown.",
              "Post-booking chat empty state via UseSkillsChatComponent with 'Cancel Booking' (Eraser icon) and 'Amend Booking' (TimeSetting icon) buttons. Note: 'Amend Booking' has NO backing tool in aiToolComponents, so it should be hidden or disabled in this moment (speculative cleanup).",
              "CancelBookingInput card: flight summary + passenger multi-select with 'Select All Passengers'.",
              "CancelBookingOutput card: 'Cancel Booking initiated for flights' + the flight cards it sent, so the user sees exactly what was actioned. There is no follow-up status/result card after this.",
              "Quick-reply suggestion chips (suggestions Pusher event), e.g. 'Find another flight', 'Cancel this booking', 'View receipt'.",
              "Clarifying-question card (ask_user_questions) when date/route context is missing, with chip/date/date_range options; date answers render as 'DD Mon YYYY' (e.g. '15 Jun 2026').",
              "For the new search: the deep search timeline (hardcoded TIMELINE_STEPS theatre, LLM subtitles) and results grouped by FareCategory (Steal Deal, Hand Baggage, Standard, Flexible, Baggage) with 'Saving INR X' shown honestly per card.",
              "Original price breakdown still viewable (Bill Summary / TripPayments) with the PG-fee non-refundable note.",
              "PNR strip on any still-valid leg remains copyable ('PNR copied to clipboard'); check-in button shows on that leg if check_in.status='open'."
            ]
          },
          {
            "label": "What the agent does",
            "items": [
              "1. On the user opening the booking or saying 'my flight got cancelled', fetch live status (ui_request_flight_details / include_flight_info=true) and confirm the cancellation from FlightStatus.cancelled.",
              "2. If date/route context is missing (e.g. 'reschedule me'), run ask_user_questions and wait for the tapped or typed answer before searching.",
              "3. State plainly what happened and what it can and cannot do: it can cancel and help search; it cannot put you on the next flight automatically.",
              "4. If the booking record is still 'confirmed', offer cancel_booking and render CancelBookingInput; wait for the person to pick passengers and confirm. The agent never auto-cancels. On a round trip, warn that cancelling can take down a still-valid leg.",
              "5. On confirm, post status='cancel_booking_initiated' and show CancelBookingOutput. Tell the user the request was sent and the refund is processed off-app, so it cannot show a status or amount here.",
              "6. Immediately offer to start a fresh search for the same route/date (search_flights / ui_initiate_flight_search), pre-filling origin, destination, date, trip_type, cabin and the passenger set from the dead booking's search_params.",
              "7. Run deep search if the user wants negotiation, surface results grouped by FareCategory, let the user select a fare. The agent recommends; the person taps to add and proceeds to a NEW booking.",
              "8. Hand off to the standard book-and-pay flow (passengers, payment via Razorpay/Cashfree, ticketing). The person commits payment; the agent does not.",
              "9. Offer airline contact info for anything off-app (refund chase, counter rebooking, compensation) since the app has no compensation or refund-status flow."
            ]
          },
          {
            "label": "Analysis parameters",
            "items": [
              "Cancellation confirmation source: FlightStatus.cancelled (live) vs BookingStatus='cancelled' (record). Agent weighs whether the record has caught up to reality before suggesting a manual cancel.",
              "Leg scope on a round trip: which direction(s) cancelled (flights[].direction), each leg's ticket_status, and whether cancelling the booking would also kill a still-valid leg.",
              "Refundability of the dead fare: IBookingFareDetails.refundable + parsed_fare_rules.cancellation.tiers (from_hours/to_hours/fee) + is_non_refundable, plus the non-refundable PG fee, to set honest expectations (the agent does NOT compute a refund amount; no calculator exists).",
              "Route/date/passenger continuity: pull search_params (origin, destination, trip_type, cabin) and passenger set from the dead booking to pre-fill the new search.",
              "New-fare honesty: original_price vs negotiated_price/effective_price and savings_percent, framed as 'a few percent under other OTAs', never as recovering the cancelled fare.",
              "Time pressure: how close to departure (departure_time) to decide urgency of the handoff to airline counter vs an in-app re-search.",
              "Payment-model continuity: was the dead booking standard or away_advance (payment_type), and was any payment captured, to explain what is owed/refundable on the new booking.",
              "Speculative (not in code): no missed-connection, no compensation-eligibility (DGCA/EU261), no schedule-change severity triage, no involuntary-downgrade detection to weigh."
            ]
          },
          {
            "label": "Agent copy",
            "items": [
              "'Your flight was cancelled by the airline. I can cancel this booking and help you find another, but I can't move you onto a new flight myself, you'll pick and book it.'",
              "'Want me to cancel this booking? Choose who it's for and I'll send the request.'",
              "'Cancel Booking initiated for flights.' (CancelBookingOutput, verbatim)",
              "'The refund is handled by the airline and our team, not in the app, so I can't show you a status or amount here.'",
              "'Heads up: payment gateway fees aren't refundable, even on a refundable fare.' (grounded in 'Note: Payment gateway (PG) fees are non-refundable, even on cancellable fares.')",
              "'Just so you know, cancelling this booking can also cancel your still-valid return leg, there's no way to cancel one leg cleanly in the app.'",
              "'Let me look for another flight on the same route.' / 'Found 5 new fares.' (honest result copy, no inflated savings)",
              "'This is a fresh booking, not a change to the cancelled one, so the price and seats may differ.'",
              "'No payment was taken. Our team can help sort this out.' / 'Talk to us' (verbatim failure-path strings)"
            ]
          },
          {
            "label": "Failure modes",
            "items": [
              "Cancel request posts but nothing confirms it landed -> there is no result/status page after cancel_booking_initiated. Recovery: agent states the request was sent, gives the airline contact, and tells the user to watch My Bookings; it does not spin on a fake 'cancelling...' state.",
              "Live flight status unavailable (flight_info null/partial) -> agent degrades to record-level BookingStatus and basic details, says it can't confirm live status right now, and still offers cancel + re-search instead of blocking.",
              "Stream drops mid-conversation -> autoResumeArmed reconnect (1s) or gated attemptResume() on foreground; history refetch heals the thread. Never a dead spinner.",
              "New search returns no fares / deep search expires (status='expired') -> ExpiredDeepSearchBottomSheet 'rerun' path or 'I couldn't find anything on that route right now, want me to widen the dates?'; hands to airline if still empty.",
              "New booking's payment fails or times out -> standard payment recovery: 'Payment failed' / 'Please try again' (retry mints a fresh order_id), or 'Still processing... We'll notify you once it's confirmed. You can check the status in My Bookings'; never claims the rebooking succeeded.",
              "Payment captured but new booking sticks non-confirmed (ticketing_failed, seat/fare inventory gone) -> real gap: user may see 'Payment confirmed' then a stuck booking. Agent must not assert success; point to My Bookings and 'Talk to us'.",
              "Refund expectation gap -> the biggest honest failure: user assumes 'cancelled' means 'refunded'. Agent must repeatedly avoid implying a refund amount/timeline the app cannot track.",
              "Pusher disconnected, user's 'please help' message lost (no offline queue, no draft save) -> on reconnect the agent should re-surface; until then the message can be silently lost, so the agent should flag if a send fails (known gap)."
            ]
          },
          {
            "label": "If it is a group / multi-PNR booking",
            "items": [
              "The app has NO PNR-stitching model: a round trip is two flights in flights[] with separate IDs/supplier_ids and no field saying they share one PNR or are two separate PNRs. Cross-leg and cross-traveller liability, baggage, and connection-time validation are invisible to the agent (real gap).",
              "Round trip, one leg cancelled: cancelling via cancel_booking risks taking down the still-valid leg, and there's no clean per-direction cancel; the agent must warn the person and let them decide, leg by leg, with the airline if needed.",
              "Group across separate PNRs (travellers booked in different bookings): there is no group-sync concept in code. Each booking is independent; the agent can only act on the one open booking and must tell the user the other travellers' bookings are not linked and need handling separately (speculative: a 'these N bookings are one trip' model does not exist).",
              "Re-search for a group: the new booking carries its own passenger set; the agent pre-fills passengers from the dead booking, but there is no bulk rebook and no guarantee everyone lands on the same new flight/fare. The person confirms each.",
              "Partial passenger cancel: CancelBookingInput supports selecting a subset of passengers, but there is no per-passenger refund/proration display, so the agent cannot show who gets what back.",
              "Partial ticketing reality: per-flight ticket_status is independent, so on a multi-passenger round trip one leg or passenger can already be 'issued' while another is dead, with no unified view of who is where.",
              "Honest stance for groups: the agent prepares each cancellation and each new search and recommends keeping the group together, but every commit (cancel, pay, ticket) stays with the people; it never auto-syncs or auto-rebooks the group."
            ]
          }
        ],
        "divider": true
      },
      {
        "h": "When the rules change later",
        "group": "During the trip",
        "tldr": "The app stores passport data and shows fare rules captured at booking, but never re-checks visa or entry requirements over time and never re-verifies fare rules after purchase. The only drift it genuinely catches in-trip is operational: live flight status and gate via on-demand FlightStatus, the check-in window opening and closing, and terminal status drift (cancelled, ticketing_failed) via polling. Fare and price re-checks fire only before payment is captured. The app is passive: nothing is watched unless the traveller opens the booking.",
        "p": [
          "This moment is hard because rules drift silently after commitment, and the honest truth is the app validates almost none of it: visa and entry checks are theatre, fare rules are a snapshot, and there is no proactive watcher, so the only things that update are the ones the traveller pulls by opening the booking. The governing principle is do not pretend to a certainty we never had: surface what we know (live status, check-in window, the captured snapshot), say plainly what we do not check (entry rules, passport validity, post-purchase fare terms), and hand the traveller to the airline or a human for the rest."
        ],
        "spec": [
          {
            "label": "States",
            "items": [
              "BookingStatus (booking lifecycle): confirmed is the steady state during the trip; can drift to cancelled or ticketing_failed if a supplier or airline acts. derivePaymentPhase maps both to PaymentPhase 'failed'. [bookingDetailsTypes.ts, bookingPhase.ts]",
              "TicketStatus (per-flight): issued is normal post-ticketing and pnr is populated; pending | ticketing | failed are the off-nominal values. No state represents a fare-rule change after issue, because none is tracked.",
              "FlightStatus (live, on-demand only): status string ('Scheduled', 'On Time', 'Arrived'), departure_delay_minutes / arrival_delay_minutes, cancelled, diverted, departure_gate, arrival_gate, baggage_claim, progress_percent. This is real in-trip operational drift, but ONLY fetched when the booking is opened with include_flight_info=true; never pushed. [flightListing/types.ts]",
              "check_in.status (CheckInStatus): not_open | open | closed. The one add-on window that opens and closes on a real timestamp (web_opens_at, web_closes_at). [bookingDetailsTypes.ts]",
              "PriceStatus (real-time): idle | price_changed | fare_unavailable | price_verified. The only genuine fare-drift detection in the app; fires via Pusher up to payment capture (it can fire after payment is submitted but before ticketing, blocking confirmation). It stops the moment payment is captured. [useBookingPriceUpdate.ts]",
              "DeepSearchHighlightType / TIMELINE_STEPS: the deep-search timeline step 'Clearing transit & visa requirements' is a hardcoded theatre label, not an enforcement state. (real as a label, speculative as enforcement)",
              "isDomesticBooking (derived): true if all legs are IN-to-IN; gates whether passport fields were ever collected. No destination-based re-evaluation over time. [isDomesticFlight.ts]",
              "No state for: visa_obtained, entry-requirement status, passport-validity flag, schedule-change waiver, or post-purchase fare-rule version. None exist in the model. (gap)"
            ]
          },
          {
            "label": "Edge cases",
            "items": [
              "Entry rule for the destination changes after booking (new visa, new health doc) -> NOT handled. No entry-requirement engine, no visa_obtained field, no destination lookup. Traveller is on their own; agent can only acknowledge in chat if asked. (gap)",
              "Passport now inside the 6-month-validity window for the destination -> NOT handled. passport_expiry is stored but never checked against a 6-month rule or against departure date; the DatePicker even allows an expiry of today. App accepts a passport expiring tomorrow. (gap)",
              "Transit visa becomes required for a layover -> NOT handled for the user's own passport. transit_visa_required exists only as a red 'Transit Visa' tag on search results at selection time; never collected, never re-checked, never tied to the booked itinerary. (gap)",
              "Fare rule changes after purchase (airline tightens cancellation or change terms) -> NOT re-checked. parsed_fare_rules.cancellation / date_change / no_show are a snapshot captured at booking and shown read-only. No repricing or re-fetch over time. (gap)",
              "Airline schedule change after booking (departure pushed, equipment swap, cabin downgrade) -> NOT proactively detected. No schedule-change monitoring, no equipment_swap / cabin_downgrade flag. A live delay or cancellation shows ONLY if the user opens the booking and FlightStatus is fetched; no push alert is sent. (gap)",
              "Flight is delayed, cancelled, or diverted live -> surfaced but passively: FlightStatus.cancelled / diverted / delay_minutes render a status badge and on-time history in the booking card, only on open. No automatic rebooking; agent can cancel_booking but has no rebook tool. (partial)",
              "Terminal changes between two connecting segments -> handled honestly at display: LayoutDetails compares this segment's arrival terminal to the next segment's departure terminal and renders a TerminalChange warning. The one structural in-trip drift the UI flags by itself.",
              "Add-on / check-in window opens or closes -> handled honestly. check_in.status flips via booking-details polling (every 10s if created within 1 hour, else 60s); UI shows 'Check in' only when status=open and airline_url exists, 'Opens [time]' when not_open, 'Closed, head to the counter' when closed.",
              "Price or fare drifts before payment is captured -> handled. Pusher 'booking-price-updated' fires; any_price_changed -> price_changed sheet (accept or re-search); any_fare_changed -> fare_unavailable, payment blocked, 'Search for Alternatives'. Net-zero delta across flights is accepted silently. [useBookingPriceUpdate.ts]",
              "Fare rules failed to parse at booking (parsed_fare_rules null) -> handled at display: UI falls back to raw cancel_policy text or 'Rules not available'. No drift detection, just a graceful blank.",
              "Saved passenger with no passport re-used on an international booking -> handled at entry only: editor auto-opens to collect passport. Once collected, never re-validated against destination or expiry. (partial)",
              "Booking drifts to cancelled / ticketing_failed during the trip -> handled as terminal: polling stops, derivePaymentPhase -> 'failed', no payment UI, user routed to support. No automatic rebooking exists."
            ]
          },
          {
            "label": "What the agent shows",
            "items": [
              "Booking detail (PostBookingDetails): confirmed status, PNR strip (tap to copy, 'PNR copied to clipboard'), per-leg 'Onward' / 'Return' labels.",
              "Live status (only when include_flight_info fetched): status badge, gate, boarding time, baggage claim, and on-time history breakdown from FlightHistoryEntry. Multiple segments render a tab bar to switch per leg. This is the real in-trip drift the screen can show.",
              "Fare rules section (read-only): collapsible cancellation / date-change / no-show tiers from parsed_fare_rules, time-tiered ('From [amount]'), 'Non refundable' with XCircle icon when is_non_refundable, 'Refundable, Changeable' otherwise. This is the snapshot, shown as-is.",
              "Web check-in card (WebCheckInCard / ui_web_checkin): status-driven, 'Check in on [airline]' when open, 'Opens [time]', 'Closes [time]', or 'Closed, head to the counter about 90 min before departure'.",
              "TerminalChange warning between connecting segments where arrival and departure terminals differ.",
              "'Transit Visa' red tag on flight results at selection time only (not on the booked itinerary in-trip).",
              "Pre-payment only: 'Prices Have Changed' / 'Fare No Longer Available' bottom sheets with old vs new per-flight deltas.",
              "Post-booking chat empty state: UseSkillsChatComponent with 'Cancel Booking' and 'Amend Booking' buttons (the amend button has no backing tool). (partial)",
              "NOT shown (the honest gaps): no entry-requirement checklist, no passport-expiry warning, no visa status, no 'rules changed since you booked' banner, no proactive delay alert. The screen looks calm because, until you open it, nothing is watching."
            ]
          },
          {
            "label": "What the agent does",
            "items": [
              "On opening the booking, poll /bookings/{id} (10s within the first hour, else 60s; BNPL overrides to 5s) to refresh status and check_in.status; with include_flight_info=true, fetch live FlightStatus. This catches check-in windows opening, terminal status drift, and live operational status; it does NOT catch entry or fare-rule drift, and it only runs while the booking is open.",
              "Pre-payment, subscribe to Pusher 'booking-price-updated' and surface any price or fare change immediately as an accept-or-re-search decision the user commits to. On a dropped socket, reconnect with backoff (1s to 30s, max 8 attempts) and refetch so the change still surfaces before capture.",
              "In chat, if the user asks 'is my visa ok' or 'did the rules change', reference the stored parsed_fare_rules, the booked itinerary, live status, and weather, but state plainly there is no tool to validate entry requirements rather than imply a check happened.",
              "Cancel but not rebook: ui_cancel_booking initiates a cancellation; there is no rebooking tool. For a real disruption, route the user to search new flights or to a human. amend_booking is a chat button with no implementation. (gap)",
              "Hand off, not take over: for check-in, open the airline URL in-browser and copy the PNR; for rule or visa questions it cannot verify, route to the airline or 'Talk to us' (human). The agent prepares and recommends; the person commits.",
              "Never run the 'Clearing transit & visa requirements' theatre line as if it were a real clearance for an in-trip rule change; that label belongs only to the pre-booking deep-search animation. (repurposing it here would be dishonest)"
            ]
          },
          {
            "label": "Analysis parameters",
            "items": [
              "isDomesticBooking: derived from leg country codes (IN-to-IN). Determines only whether passport was ever collected, not whether requirements still hold.",
              "Departure date vs now: used today only for check-in window math and the isDepartureMoreThan17Days passport-prompt timing at booking. NOT used to compute a 6-month passport buffer or an entry-doc deadline. (the missing computation)",
              "Polling cadence vs created_at: faster (10s) for bookings under 1 hour old, else 60s; the recency heuristic that governs how fresh status and check-in state are.",
              "check_in.web_opens_at / web_closes_at vs now: the one real time-window computation in this moment.",
              "FlightStatus.departure_delay_minutes / arrival_delay_minutes and cancelled / diverted vs scheduled segment times: the live operational delta, computed only on fetch, bucketed in history as on-time (<=15m) through 45m+ late.",
              "Connecting-segment terminals: this segment arrival_terminal vs next segment departure_terminal -> drives the TerminalChange warning.",
              "parsed_fare_rules tiers (from_hours / to_hours / fee): read for display of cancellation and change cost; never re-weighed against a changed live rule.",
              "Pre-payment price delta: net difference summed across flights; if net is zero the change is accepted silently, if non-zero the sheet is shown.",
              "Speculative (not in code): destination requirement = f(nationality, destination, transit points, passport_expiry, departure_date); 6-month-validity flag = passport_expiry minus departure_date < 6 months; missed-connection risk = layover_minutes vs inbound delay. These would power warnings the app does not yet have."
            ]
          },
          {
            "label": "Agent copy",
            "items": [
              "'I can show you the fare rules we captured when you booked, but I can't confirm they're still current with the airline. Want me to pull up what we have, or connect you to the airline?'",
              "'I don't verify visa or entry requirements, so please check the official source for [destination] before you fly. I can tell you your passport on file expires [date].' (only honest if a real expiry warning is built; speculative)",
              "'Check-in opens [Opens 15 Jun 2026, 09:00]. I'll surface the button here the moment it's live.'",
              "'Closed, head to the counter about 90 min before departure.' (verbatim, WebCheckInCard)",
              "'Fetching your tickets...' / 'We'll notify you' (verbatim, in-trip ticketing-in-progress)",
              "'Your selected fare is no longer available. Please select a new fare.' / 'Search for Alternatives' (verbatim, pre-payment fare drift)",
              "'Flight prices were updated during verification. Review the changes below.' / 'Looks Good, Continue' (verbatim, pre-payment price drift)",
              "'No payment was taken. Our team can help sort this out.' / 'Talk to us' (verbatim, the honest human handoff)"
            ]
          },
          {
            "label": "Failure modes",
            "items": [
              "Visa or entry rule actually changed and the traveller is denied boarding -> the app gave no warning and cannot. Honest recovery: agent never claims to have checked; in chat it points to the airline and 'Talk to us', and the design should add a plain 'we don't verify entry requirements' line rather than reassuring silence. (gap)",
              "Fare rule the user relied on (e.g. free change) no longer holds at the airline -> app shows the stale snapshot. Recovery: present rules as 'captured at booking' and route cancellation or change intent to the airline / human, not a confident in-app quote.",
              "Airline cancels or majorly reschedules the flight -> no proactive alert; user discovers it only on opening the booking (live status) or from the airline directly. Agent can cancel but cannot rebook, so recovery is a manual re-search or human handoff. (gap)",
              "Pusher disconnected so a pre-payment price change is missed -> backoff reconnect (1s to 30s, max 8 attempts); on reconnect the booking query refetches so the change still surfaces before capture rather than a dead spinner.",
              "Polling silent on a stale token or lost socket -> check-in window, live status, or terminal status may lag; UI degrades to last known state plus copyable PNR and airline URL, never an infinite spinner.",
              "parsed_fare_rules null -> 'Rules not available' instead of a broken section; agent offers to connect to the airline for the real terms.",
              "passport_country never populated and no format validation on passport_number -> stored data may be incomplete or malformed; the agent should not present passport details as airline-verified. (gap)",
              "Deep-search visa theatre line read as a real guarantee -> the genuine failure of trust; mitigation is to never surface that label in-trip and to keep entry-requirement copy explicitly hand-off."
            ]
          },
          {
            "label": "If it is a group / multi-PNR booking",
            "items": [
              "Per-passenger passport completeness is tracked at booking (per-row complete check) but none of it is re-validated in-trip; one traveller's passport slipping inside a validity window is invisible for the whole party. (gap)",
              "Round trip stores both legs in flights[] with independent direction, ticket_status and check_in windows; check-in can open for return before outbound, and the card filters to whichever leg has status=open, so each leg is handed off separately. No unified 'check in everyone on every leg'. (gap)",
              "No same-PNR vs self-transfer modelling: a transit-visa requirement on a connection is never validated against the party's nationalities, multi-PNR legs are not stitched, and a rule change or delay on one segment does not flag the others. Missed-connection risk on a tight layover is not computed. (gap)",
              "Per-flight ticket_status independence means one leg can drift to failed while another stays issued; the trip shows 'Fetching your tickets...' if any leg is pending/ticketing/failed, and the agent should name which leg, not the whole booking.",
              "Per-flight live status independence: FlightInfoSection tabs per segment, so one leg can be delayed or cancelled while another is on time; a disruption answer has to be given leg by leg.",
              "Fare rules differ per leg (each fare priced independently); the snapshot shown is per-leg, so a 'rules changed' worry has to be answered leg by leg, and the agent should be explicit about which leg it can and cannot speak to."
            ]
          }
        ],
        "divider": true
      },
      {
        "h": "When the price moves mid-checkout",
        "group": "During the trip",
        "tldr": "A real-time fare drift arrives mid-checkout. Away shows the exact old/new delta per leg, recomputes the fee, and hands the commit decision to the person. It never auto-accepts a stale fare, and if the fare itself is gone it blocks payment with an honest dead-end.",
        "p": [
          "This moment is hard because the person is seconds from paying when the ground shifts under them. The governing principle: the agent surfaces the change in full and lets the person commit. It never silently re-prices or pays on a stale fare. Two real honesty limits shape it: price_locked exists as a field but its enforcement code is not visible in the explored codebase (so \"payment is blocked\" is partly aspirational), and the app is passive about detection, it reads the new price on the next Pusher event or the next 10 to 60s booking refetch, there is no guaranteed instant alert."
        ],
        "spec": [
          {
            "label": "States",
            "items": [
              "PriceStatus = idle: booking held, no drift detected, payment CTA shows the real price (e.g. 'Pay Rs 14,200').",
              "PriceStatus = price_changed: booking-price-updated fired with any_price_changed=true, same fare, supplier price shifted up or down. PriceUpdateBottomSheet shown with per-leg old/new deltas.",
              "PriceStatus = fare_unavailable: event fired with any_fare_changed=true, the fare itself changed. 'Fare No Longer Available' sheet shown, the only exit is re-search.",
              "PriceStatus = price_verified: person tapped 'Looks Good, Continue', booking query refetched at the new confirmed price, payment resumes with a fresh order_id.",
              "Silent-accept sub-state (real): net diff across all flights computes to 0 (one leg up, one leg down). No sheet shown, booking proceeds at the refetched price.",
              "Underlying BookingStatus during this window is typically payment_pending or payment_processing; on accept it continues toward ticketing. On 'Search for Alternatives' it routes back to flight listing / deep search. derivePaymentPhase reports 'pending' throughout.",
              "(speculative) A dedicated 'payment blocked by price_lock' state: price_locked is set as a field but no enforcement code is visible, so today blocking relies on the sheet gating the CTA, not on a hard server lock."
            ]
          },
          {
            "label": "Edge cases",
            "items": [
              "Same fare, price went UP: price_changed; sheet shows old vs new with the positive diff, person must tap 'Looks Good, Continue' to pay the higher amount or 'Search for Alternatives'. The agent never auto-pays.",
              "Same fare, price went DOWN: price_changed; sheet shows the lower new price, person still confirms (we ask them to commit even to good news).",
              "Net diff = 0 across legs (round-trip, one up one down): silently accepted, no popup, booking proceeds at the new confirmed total (real behaviour in useBookingPriceUpdate).",
              "Fare changed entirely (any_fare_changed=true): fare_unavailable; no override UI exists, only 'Search for Alternatives'. Honest dead-end by design.",
              "Event fires AFTER payment initiated but before capture: price_locked is set on the booking; pre-flight screen shows the sheet; on accept, payment is restarted with a fresh order_id and the old poll is cancelled (Cashfree rejects re-payment of the old order_id server-side).",
              "Event fires during active gateway polling (usePaymentVerifyPoll, 2s interval to 30s): verification continues. If it captures, the person is past the drift. If it fails, the retry re-prices against the new confirmed fare.",
              "Booking expires while the sheet is open (useExpiryWatcher / is_expired): ExpiredDeepSearchBottomSheet supersedes the price sheet; the price decision is moot, the person re-searches.",
              "No expiry recalc while the sheet sits open: there is no live countdown on the price sheet, so a booking can lapse with the sheet still showing until the next 10 to 60s poll (real gap, useExpiryWatcher fires on focus, not on a timer).",
              "Multiple rapid price events on the same booking: hook reconciles to the latest flights[] payload (newest price_confirmed_at wins); the sheet reflects the most recent confirmed price, not a stale or flickering one.",
              "Person dismisses the sheet without choosing: treated as not-yet-committed; payment does not proceed on the stale fare (no silent commit).",
              "Pusher disconnected at the moment of drift: no instant sheet. The app is passive, so the new price surfaces on the next booking refetch (10s if booking under 1 hour old, else 60s) or on the next payment retry. The user is never charged a stale amount, but the sheet can be delayed.",
              "Insufficient Away Cash purchased mid-flow to cover a higher new total: InsufficientWalletBalanceBottomSheet lets the person top up, but the recomputed final total after the top-up is not re-shown (real gap, silent recalc)."
            ]
          },
          {
            "label": "What the agent shows",
            "items": [
              "PriceUpdateBottomSheet titled 'Prices Have Changed' with subline 'Flight prices were updated during verification. Review the changes below.'",
              "Per-leg delta rows: leg label ('Onward' / 'Return'), old price, new price, and the direction of change (up or down) for each flight in flights[].",
              "Net total impact line: the summed difference the person actually commits to (this is why one-up-one-down can net to zero).",
              "Two CTAs: primary 'Looks Good, Continue' (commit at the new price) and 'Search for Alternatives' (abandon and re-search).",
              "For fare_unavailable: a distinct 'Fare No Longer Available' sheet with body 'Your selected fare is no longer available. Please select a new fare.' and a single 'Search for Alternatives' action (no continue button).",
              "Bill Summary context remains visible: Total price, Payment gateway charge (pg_fee_pct%), Away Cash applied, Total Amount, so the new fee math is visible too.",
              "Note line carried from checkout: 'Note: Payment gateway (PG) fees are non-refundable, even on cancellable fares.'",
              "(speculative, not in code) An audit line showing the original negotiated price vs the drifted price, so the person can see the deal is still a few percent under the OTAs; today the drift delta is shown but the original deep-search baseline is not persisted for this comparison."
            ]
          },
          {
            "label": "What the agent does",
            "items": [
              "1. Listens on the Pusher channel for booking-price-updated for this booking.id (usePusherProvider + useBookingPriceUpdate).",
              "2. On event, reads any_price_changed / any_fare_changed and the flights[] array (flight_id, total_price, supplier_price, price_confirmed_at).",
              "3. Computes the per-leg delta and the net total difference across legs.",
              "4. If net diff is 0, silently accepts and lets the existing booking proceed (no interruption).",
              "5. If any_fare_changed, presents the fare_unavailable sheet (re-search only). price_locked is set on the booking, though hard enforcement code is not visible.",
              "6. If any_price_changed with a non-zero net, presents the price_changed sheet with the full breakdown and stops payment from auto-proceeding.",
              "7. On 'Looks Good, Continue': sets price_verified, invalidates and refetches ['booking-details-by-id', bookingId], mints a fresh gateway order_id, resumes payment, recomputes the convenience fee on (grand_total - credits_applied).",
              "8. On 'Search for Alternatives': abandons this booking price and routes back to flight listing / deep search with prior selections (initialTab preserved).",
              "9. If Pusher was down, relies on the booking refetch/payment-retry path to read the new confirmed price (passive backstop, no proactive push)."
            ]
          },
          {
            "label": "Analysis parameters",
            "items": [
              "any_price_changed (bool) vs any_fare_changed (bool): decides the price_changed branch vs the harder fare_unavailable block.",
              "Per-leg diff = new total_price minus old total_price, and its sign (up / down) per flight_id.",
              "Net diff = sum of per-leg diffs; zero leads to silent accept, non-zero shows the sheet.",
              "price_confirmed_at: freshness key, used to pick the latest event when several arrive.",
              "supplier_price vs total_price: confirms the drift is supplier-side (the real source) so the new pg_fee can be recomputed on (grand_total - credits_applied).",
              "Recomputed convenience fee = ceil(((grand_total - credits_applied) * pg_fee_pct) / 100); the person must see the new Total Amount, not the old one.",
              "direction field (outbound/return), rendered as 'Onward' / 'Return', to attribute each delta to the correct leg.",
              "price_locked flag: gates intent to block payment, but its enforcement is not fully wired, so treat it as advisory until confirmed.",
              "Booking recency (created_at within 1 hour) and is_expired: govern how fast the passive refetch backstop catches a drift the Pusher event missed."
            ]
          },
          {
            "label": "Agent copy",
            "items": [
              "'Prices Have Changed'",
              "'Flight prices were updated during verification. Review the changes below.'",
              "'Looks Good, Continue'",
              "'Search for Alternatives'",
              "'Fare No Longer Available'",
              "'Your selected fare is no longer available. Please select a new fare.'",
              "'Note: Payment gateway (PG) fees are non-refundable, even on cancellable fares.'",
              "(proposed, warmth-up on a price increase, speculative) 'The supplier nudged this fare up by Rs 320 since you opened it. Still a few percent under the OTAs. Your call to continue or look again.'"
            ]
          },
          {
            "label": "Failure modes",
            "items": [
              "Pusher disconnected when the price actually drifted: the gateway/verify step and the 10 to 60s booking refetch are the backstop; the new confirmed price is read on next sync, so the person is never silently charged a stale amount. The cost is a delayed sheet, not a dead spinner.",
              "price_locked set but unenforced: because enforcement code is not visible, a determined retry path could in theory attempt payment before the sheet gates it. The sheet gating the CTA is the real guard, not a server lock (real gap).",
              "Event arrives but flights[] is malformed / empty: the hook cannot compute a delta. Safest path is to not auto-proceed and fall back to a booking refetch before payment resumes (speculative hardening, current code assumes a well-formed payload).",
              "Person taps 'Looks Good, Continue' but the refetch fails: show a retry rather than spinning; do not start payment against an unconfirmed price (speculative, current code assumes the refetch succeeds).",
              "Payment captured but a late price event lands afterward: capture is terminal, the drift is moot, there is no reversal UI and no client-side recompute post-capture (honest gap).",
              "Payment captured but the booking then fails to confirm (seat lock or inventory lost): the person sees success while the booking is stuck non-confirmed; no recovery flow exists for this race (real product gap).",
              "Double event causing flicker: reconcile to the latest price_confirmed_at so the sheet does not bounce between two prices.",
              "Net diff zero but each leg moved a lot: silently accepted even though the per-leg composition changed; the person is not told a leg moved, only that the total held (honest behaviour, but a transparency gap)."
            ]
          },
          {
            "label": "If it is a group / multi-PNR booking",
            "items": [
              "Round-trip (two flights in flights[]) is the common multi-leg case: deltas are shown per direction ('Onward' / 'Return') and the net is summed, which is why a one-leg-up one-leg-down case can net to zero and silently accept.",
              "fare_unavailable on only one leg still blocks the whole payment (the booking is atomic in current code); there is no partial-leg continue, the person must re-search.",
              "Multi-passenger bookings: the price delta is at flight level, not per passenger; the sheet shows the flight total and the recomputed pg_fee applies to the whole grand_total (no per-passenger proration, honest gap).",
              "True multi-PNR / self-transfer (separate airline tickets) is NOT modelled: flights[] hold separate ids but no field stitches them across PNRs, so a price event on one supplier does not coordinate with the other; each is just another row in the same booking (real product gap).",
              "Per-flight ticketing is independent (outbound can issue while return fails), but pricing and payment are not: a price drift cannot be accepted for one leg and re-searched for the other.",
              "(speculative) A mature version would let the person accept the unchanged leg and only re-search the drifted one; current code does not support partial re-pricing."
            ]
          }
        ],
        "divider": true
      },
      {
        "h": "Seats, bags, and meals",
        "group": "During the trip",
        "tldr": "In the quiet pre-payment moment, Away offers seat, bag, and meal honestly: only what the supplier actually sells for this flight, what is already free in the fare shown plainly, infants excluded, and the traveller decides. The agent prepares and recommends; it never selects on anyone's behalf.",
        "p": [
          "Add-ons are where honest products turn pushy. The principle: offer only what the supplier genuinely sells, show what is already included so nobody pays twice, and let the person commit. The agent cannot select seats or baggage directly (those are user-driven flows in PreBookingFlights); it can suggest, surface the running total and PG-fee impact, and hand off. One honest caveat runs through this whole moment: in the real code ancillaries are selected at flight level, not true segment level, even though baggage carries per-segment supplier refs, so \"per segment\" below is the data model's intent more than the shipped UI granularity."
        ],
        "spec": [
          {
            "label": "States",
            "items": [
              "BookingStatus = passengers_pending or ready_for_payment. This is the ONLY window where ancillaries are selectable. There is no post-payment seat/bag/meal amend flow in code (any such flow is speculative).",
              "Once payment is initiated, the booking moves toward payment_pending / payment_processing and price_locked is set; ancillary editing is no longer the live surface. The handoff out of this moment is one-way short of a payment failure.",
              "PreBookingFlights open; passenger rows complete or in progress (isPassengerRowComplete gates Pay). For international fares passenger rows can also be blocked on passport, which keeps the traveller in this moment even if add-ons are done.",
              "Per-flight ancillary availability resolved: for each leg, seat_maps / baggage / meals either present (offer shown) or absent (offer hidden). Resolution is by segment_index in the data, but selection is tracked at flight level (product GAP).",
              "Selection state tracked per passenger (adults + children; infants excluded via maxAncillaryPassengers). Running ancillary subtotal feeds amount_breakdown.ancillaries and the Bill Summary.",
              "Price-drift watch active: useBookingPriceUpdate listens on the booking-price-updated Pusher event; PriceUpdateBottomSheet can interrupt with price_changed (same fare, new price) or fare_unavailable (fare gone, payment blocked).",
              "Booking expiry watch active (expires_at / is_expired): the pre-payment window itself can time out while the traveller is choosing add-ons (useExpiryWatcher, ExpiredDeepSearchBottomSheet).",
              "Hand-off state: traveller taps Pay; ancillary selections submit with passengers (addPassengersToAllFlights) before the payment gateway opens; the agent does not auto-commit."
            ]
          },
          {
            "label": "Edge cases",
            "items": [
              "No seat map for a leg -> seat UI is not rendered (PreBookingFlights checks seat_maps.some(segment_index match)); the agent says seats are not offered here rather than showing an empty grid.",
              "Fare already includes the bag (checkin_baggage / cabin_baggage non-empty, e.g. '1x23kg') -> show the included allowance plainly so the traveller does not pay twice; only offer EXTRA bags beyond what is free.",
              "Fare has meals_included = true -> do not upsell a paid meal; state the meal is already in the fare.",
              "Infant passenger -> excluded from seat/meal/bag selection entirely (maxAncillaryPassengers = adults + children); no ancillary row shown for the infant.",
              "Baggage carries per-segment, per-supplier refs (segment_index, supplier_ref, ssid/fuid), but the shipped UI selects ancillaries at flight level, not true segment level (product GAP). Be honest: a bag chosen for a direction is not modelled as two separate segment choices, and the agent should not imply finer control than exists.",
              "Multiple bag tiers for one flight (e.g. 15kg, 25kg, 40kg) -> show all tiers with prices; one tier per passenger.",
              "checkin_baggage strings like '1x32kg+1x23kg' are parsed on the client for display only; no model for piece/weight combinations and no warning if added bags exceed an airline weight limit (product GAP).",
              "Price drifts while choosing: price_changed -> PriceUpdateBottomSheet shows old vs new, traveller accepts (booking refetch, fresh order) or re-searches. If net diff across flights is zero it is silently accepted. fare_unavailable -> payment is blocked, 'Search for Alternatives'.",
              "Pre-payment window expires mid-selection -> ExpiredDeepSearchBottomSheet; the traveller must re-search, and ancillary picks on the dead booking are lost (no carry-over). Surface the countdown honestly.",
              "Payment fails after selecting add-ons -> initial snapshots cleared so the traveller can edit seats/bags/meals before retrying Pay; next Pay re-submits passengers + ancillaries (no forced re-entry).",
              "Self-transfer / two-PNR itinerary -> app does not flag same-PNR vs separate-ticket (product GAP). A checked bag may need re-checking between tickets; the app will not stitch this, so the agent must warn rather than rely on a field.",
              "Speculative and explicitly NOT offered: lounge access, travel insurance, price protection, seat amenities (extra legroom / exit row / bulkhead). None exist in code; the agent must never invent them.",
              "No post-payment change and no post-booking seat-map view: once paid, there is no in-app flow to add or swap a seat/bag/meal. The agent says so plainly and points to the airline."
            ]
          },
          {
            "label": "What the agent shows",
            "items": [
              "Per-flight ancillaries entry, legs labelled 'Onward' and 'Return' inside PreBookingFlights.",
              "Seat map grid for a leg when seat_maps for that segment_index exists, with per-seat price; nothing when it does not.",
              "Baggage options: included allowance (from fare.checkin_baggage / cabin_baggage) shown as already-covered, plus paid extra-bag tiers with prices.",
              "Meal options when meals[n] exists; if meals_included, an 'included in fare' line instead of an upsell.",
              "Per-passenger selector (adults + children only; infants absent).",
              "Bill Summary with the 'Ancillaries' line from amount_breakdown, plus 'Payment gateway charge ({pgFeePct}%)' noting PG fee applies on the credited subtotal including ancillaries, and 'Note: Payment gateway (PG) fees are non-refundable, even on cancellable fares.'",
              "Away Cash / credits line if credits reduce the payable amount (PG fee is computed on grand_total minus credits_applied).",
              "Pay button reflecting the new total; if passengers incomplete, 'Add passengers to complete booking' instead of price."
            ]
          },
          {
            "label": "What the agent does",
            "items": [
              "Resolve, per leg, what the supplier actually sells (seat_maps / baggage / meals) before showing anything.",
              "Surface what is already free first (included baggage, included meal) so the traveller is not upsold a thing they already have.",
              "Offer the remaining honest add-ons, per passenger, infants excluded.",
              "Recommend lightly only with a real reason (e.g. self-transfer connection, no free checked bag in this fare), but never pre-select (agent cannot select ancillaries directly; user must open the modal).",
              "Keep the running total and PG-fee impact visible as choices change, and show the credits effect on the payable amount.",
              "Hand off: the traveller taps Pay; selections submit with passengers; the agent does not commit or skip the seat/bag step for them.",
              "On price drift, pause and present the change (price_changed accept/re-search, or fare_unavailable block) rather than silently re-pricing add-ons.",
              "If the pre-payment window is close to expiry, flag the countdown so the traveller is not caught choosing add-ons on a dying booking."
            ]
          },
          {
            "label": "Analysis parameters",
            "items": [
              "Per leg: does seat_maps[segment_index] / baggage / meals exist? (offer vs hide).",
              "Fare's free allowance: checkin_baggage, cabin_baggage strings parsed; meals_included boolean (avoid double-charging).",
              "Passenger eligibility: type != infant; count against adults + children quota (maxAncillaryPassengers).",
              "Ancillary subtotal and its effect on pg_fee = ceil(((grand_total + ancillaries - credits_applied) * pg_fee_pct)/100); PG fee is non-refundable even on refundable fares.",
              "Connection / leg structure (self-transfer vs single PNR) to judge whether a checked-bag re-check is implied; note the app does not store this distinction (product GAP), so the judgement is heuristic.",
              "price_locked / price-drift signal and booking expiry (expires_at, is_expired) before commit.",
              "Honesty gate: never surface lounge, insurance, price protection, or seat amenities (not in code)."
            ]
          },
          {
            "label": "Agent copy",
            "items": [
              "\"This fare already includes 1x23kg checked and 7kg cabin. You only need to add a bag if you are carrying more.\"",
              "\"Seats are not offered by the airline for this flight, so there is nothing to pick here.\"",
              "\"Extra checked bag on your onward flight: 15kg for the listed price. Your return is a separate choice.\"",
              "\"A meal is already included on this fare, so no need to add one.\"",
              "\"Heads up: this looks like a self-transfer, so you would re-check the bag for the second flight.\"",
              "\"Note: Payment gateway (PG) fees are non-refundable, even on cancellable fares.\"",
              "\"You can change seats and bags right up until you pay. After that, you would contact the airline directly.\"",
              "\"This booking holds for a limited time, so decide on add-ons before it expires.\"",
              "\"I have set this up; you decide what to add and tap Pay.\""
            ]
          },
          {
            "label": "Failure modes",
            "items": [
              "Ancillary data fails to load for a leg -> show the flight without the add-on block and say the seat and bag options did not load for this leg rather than a dead spinner; let the traveller proceed without add-ons.",
              "Seat map present but a chosen seat is taken by submit time -> surface the rejection, return to the map, never silently drop the charge. (Note: there is no seat-lock model in code, so this is a known weak point, not a guarded path.)",
              "Price drift mid-selection -> PriceUpdateBottomSheet (price_changed accept/re-search, or fare_unavailable hard block); do not bury the change.",
              "Booking expires mid-selection -> ExpiredDeepSearchBottomSheet; ancillary picks are lost and the traveller re-searches. Say so; do not pretend they carry over.",
              "Payment fails with add-ons selected -> snapshots cleared, selections recoverable, retry Pay; no forced re-entry. Gateway decline reasons are not parsed into specific guidance (product GAP).",
              "Payment captured but ticketing fails (ticket_status failed / status ticketing_failed) -> the add-ons were paid for; there is no per-ancillary refund or partial-refund UI (product GAP). Be honest that resolution is support-driven.",
              "Traveller expects to add a seat after paying -> honest dead-end: no post-payment ancillary flow in app, contact the airline (no fake 'manage seat' button).",
              "PG-fee on ancillaries surprises the traveller -> the fee line and percentage are shown before Pay, not after; and the fee is non-refundable even if the fare is refundable."
            ]
          },
          {
            "label": "If it is a group / multi-PNR booking",
            "items": [
              "Per-passenger ancillary rows multiply (each adult and child gets seat/bag/meal choices; infants excluded), so the modal is longer and the subtotal larger.",
              "Round-trip / multi-leg: Onward and Return stack as separate sets of choices (an onward bag is not carried to the return). If only one direction was negotiated, the other shows original B2C pricing; ancillary offers still resolve from its own data.",
              "Self-transfer / two-ticket itineraries: the app does not flag same-PNR vs separate-PNR (product GAP), so the agent should warn that a checked bag may need re-checking between tickets, since the app will not stitch them.",
              "No bulk 'apply this seat/bag to everyone' helper exists (speculative); each passenger choice is made individually.",
              "Partial ticketing on a round trip (one leg issued, the other failed) means add-ons may be split across a confirmed and a failed leg; there is no proration or partial-refund surface (product GAP), so the agent should set expectations and route to support."
            ]
          },
          {
            "label": "Real outcomes and honest scope",
            "items": [
              "Away has roughly 1,000 users and about 200 bookings; about 1 in 3 users opt into negotiation. Real negotiation savings are near zero rupees in practice; the honest claim is a few percent under other OTAs (at least 3% cheaper in the worst case), not large savings. Add-ons here are about honesty, not upsell revenue.",
              "Ancillaries are a thin, user-driven surface: the agent prepares and recommends, the traveller selects in the modal, and nothing about seats/bags/meals is auto-applied or auto-committed.",
              "Everything marked (speculative) above (post-payment amend, segment-true selection, seat amenities, lounge/insurance/protection, bulk apply, PNR stitching, per-ancillary refunds) is design intent, not shipped code, and is labelled so the case study stays honest."
            ]
          }
        ],
        "divider": true
      },
      {
        "h": "Time to check in",
        "group": "During the trip",
        "tldr": "When the airline's web check-in window opens, Away surfaces a button, copies the leg's PNR to the clipboard, and hands you off to the airline's site in an in-app browser. It opens the right door at the right time; it does not check you in for you, pick seats, or store a boarding pass.",
        "p": [
          "Check-in is the airline's job, not Away's, so the honest move is to open the right door at the right time and carry the boring details (PNR, surnames) across. The principle is hand-off not take-over, and each leg is its own door. The on-page surface is deliberately minimal (open-only); the depth lives in the booking-details view and the agent."
        ],
        "spec": [
          {
            "label": "States",
            "items": [
              "Precondition gate: flight.ticket_status must be 'issued' AND flight.pnr non-null before any check-in surface can appear. If ticket_status in (pending|ticketing|failed) the PNR is absent; instead the 'Fetching your tickets... We'll notify you' banner shows and the PNR strip shows a spinner.",
              "check_in.status = 'open': web_opens_at has passed, web_closes_at not yet, airline_url present. This is the only state the on-page carousel renders; agent card renders it with a 'Closes [time]' line.",
              "check_in.status = 'not_open': window opens in the future. NOT rendered on-page at all (filtered out). Only the agent's WebCheckInCard shows 'Opens [time]' with no button.",
              "check_in.status = 'closed': web_closes_at has passed. NOT rendered on-page (filtered out). Only the agent's WebCheckInCard shows the static counter message, no button.",
              "Per-leg state: each flight in flights[] carries its own check_in object and its own status. Outbound can be 'open' while return is 'not_open'. No rollup across legs anywhere.",
              "Surfacing states: (a) Home upcoming-trip card shows one button for the first leg with check-in available; (b) PostBookingDetails CheckIn carousel shows one card per OPEN leg (horizontal, paging). Status flips not_open to open between polls (include_flight_info=true).",
              "Two different code paths with different copy and different states: the on-page carousel (open-only, fixed 'Check-in has started' copy) vs the agent WebCheckInCard tool (renders all three states with opens-at / closes-at / counter copy). They are not the same component."
            ]
          },
          {
            "label": "Edge cases",
            "items": [
              "Window not open yet -> on-page surfaces show nothing for that leg (filtered out); the traveller only learns the opens-at time if the agent renders WebCheckInCard, which prints 'Opens [time]'. (Gap: the booking screen itself does not tell the user when check-in will open.)",
              "Window closed -> on-page nothing; agent WebCheckInCard shows the counter message. Airline counter is the only path.",
              "Ticketing still pending when user opens the page -> PNR absent, check-in gate fails, 'Fetching your tickets... We'll notify you' banner shown; PNR strip shows spinner.",
              "airline_url missing or broken -> carousel filter requires check_in.airline_url, so the leg is dropped (never a dead button); WebCheckInCard type-guards the URL. User falls back to the airline app or counter, PNR still copyable.",
              "Multi-leg, only one leg open -> Home searches for the first leg with pnr + status 'open' (not just flights[0]); each open leg gets its own card in the carousel. A ready return can surface before a not-yet-open outbound if timings invert.",
              "Live flight data partial or absent -> page degrades to basic details + PNR + check-in; gate/terminal omitted if null (terminal falls back from segment data to flight_info real-time data when present).",
              "Status stale between polls -> next poll (10s for <1h-old bookings, else 60s) flips not_open to open; the agent can also render WebCheckInCard on demand in chat.",
              "User taps PNR strip instead of check-in -> PNR copied to clipboard with toast. Note: on Home the strip copies firstFlight.pnr specifically, which may differ from the leg actually being checked in on a multi-leg booking (latent mismatch).",
              "Multi-PNR / different airline per leg -> each flight carries its own pnr and airline_url; there is no field flagging same-PNR vs two-ticket (product GAP). Each open leg is treated as an independent door."
            ]
          },
          {
            "label": "What the agent shows",
            "items": [
              "On-page carousel card (CheckIn.tsx): route + date line, 'Check-in has started', 'Click to check-in via airline', and a single 'Check in' button. Open legs only; paging dots when more than one.",
              "Agent WebCheckInCard (ui_web_checkin): airline logo, selectable PNR, passenger surnames, one status line, and (when open) a 'Check in on [airline_name]' button with an external-link arrow.",
              "When open (agent card): 'Closes [formatIsoDateTimeShort(closes_at)]' line plus the button.",
              "When not_open (agent card only): 'Opens [time]', no button.",
              "When closed (agent card only): the head-to-the-counter message, no button.",
              "Home upcoming-trip card: 'Web-check has started, click 'check-in' to proceed' line plus a Check in button for the first ready leg, and a tappable PNR strip.",
              "Tappable PNR with 'PNR copied to clipboard' toast.",
              "Adjacent context already on the booking screen: terminal/gate (when flight_info present), on-time history, ticket PDF under Documents, passenger names."
            ]
          },
          {
            "label": "What the agent does",
            "items": [
              "Polls booking details (include_flight_info=true) and flips check_in.status to 'open' when web_opens_at passes; the carousel then includes that leg.",
              "On check-in tap (carousel): copies that specific leg's flight.pnr to clipboard, shows 'PNR copied to clipboard', then opens check_in.airline_url in an in-app browser (expo-web-browser openBrowserAsync, PAGE_SHEET on iOS).",
              "For multi-leg, surfaces each open leg separately and lets the traveller check in whichever is ready first; there is no unified 'check in all legs' action (product GAP).",
              "In chat, renders WebCheckInCard via the fire-and-forget ui_web_checkin tool when asked, opening the airline URL on tap.",
              "Stops at the airline door: Away does not enter passenger details, pick seats, or generate/store a boarding pass; the person commits on the airline site.",
              "Does NOT proactively notify when the window opens: there is no 24-hour reminder push and no 'check-in is open' notification; the traveller must open the booking or ask the agent (product GAP)."
            ]
          },
          {
            "label": "Analysis parameters",
            "items": [
              "ticket_status === 'issued' AND pnr present: precondition to show any check-in surface.",
              "check_in.status: drives which surface shows. On-page surfaces require 'open'; not_open/closed exist only in the agent card.",
              "airline_url presence (filtered on-page, type-guarded in agent card): whether a button/leg can be shown at all.",
              "Per-leg evaluation: status and airline_url computed independently per flight; no rollup across legs.",
              "Which leg to surface on Home: first leg where !!pnr && status==='open', not necessarily the outbound.",
              "Polling cadence: created_at recency (<1h => 10s, else 60s) sets how fast a not_open to open flip is caught.",
              "PNR source per surface: carousel copies the tapped leg's pnr; Home strip copies firstFlight.pnr (can diverge on multi-leg)."
            ]
          },
          {
            "label": "Agent copy",
            "items": [
              "'Check-in has started' (on-page carousel)",
              "'Click to check-in via airline' (on-page carousel)",
              "'Check in' (on-page carousel button)",
              "'Check in on [airline_name]' (agent WebCheckInCard button)",
              "'Opens [time]' (agent card, not_open)",
              "'Closes [time]' (agent card, open)",
              "'Closed, head to the counter about 90 min before departure' (agent card, closed; real string in code uses an em-dash and tilde, removed here)",
              "'Web-check has started, click 'check-in' to proceed' (Home card)",
              "'PNR copied to clipboard'",
              "'Fetching your tickets... We'll notify you' (shown when ticketing not yet complete, so check-in is not yet possible)"
            ]
          },
          {
            "label": "Failure modes",
            "items": [
              "airline_url missing or malformed -> leg dropped on-page (never a dead button); PNR stays copyable for manual entry at the airline app or counter.",
              "Airline site fails to load in the in-app browser -> the traveller still has the PNR on the clipboard and surnames on the agent card to retry in the airline's own app or at the counter.",
              "Window technically open but PNR not yet issued (ticketing lag) -> gate fails, 'Fetching your tickets... We'll notify you' shown rather than a broken check-in.",
              "Status stale (flip missed) -> next poll corrects it, or the agent re-renders WebCheckInCard on request; the user is not stuck.",
              "Window closed -> on-page shows nothing for that leg; recourse is the agent card's counter message or the airline counter directly. (The on-page surface going silent on a closed window is honest-by-omission rather than an explicit on-page 'go to counter' message; the explicit message lives only in the agent card.)",
              "No proactive nudge when the window opens: there is NO 24-hour reminder push and NO 'check-in is open' notification. Honest recovery is that the status is always live once the user opens the booking or asks the agent, not that we pinged them.",
              "Home PNR-copy mismatch on multi-leg: the Home strip copies firstFlight.pnr while the surfaced check-in button may be for a later leg; the copied PNR could be the wrong leg's (latent bug worth noting, not user-facing copy)."
            ]
          },
          {
            "label": "If it is a group / multi-PNR booking",
            "items": [
              "Each leg checks in separately: there is NO unified 'check in all legs' flow (product GAP). Outbound and return are independent doors.",
              "Round-trip with staggered windows -> only the open leg appears in the on-page carousel; the not-yet-open leg is invisible on-page (its opens-at time is visible only via the agent card). The traveller returns later for the second leg.",
              "Surfacing: PostBookingDetails shows a per-open-leg carousel; Home surfaces the first ready leg, so a ready return can appear before a not-yet-open outbound.",
              "Self-transfer / two-ticket itineraries are not explicitly modelled (product GAP: no same-PNR vs multi-PNR flag). Each flight carries its own pnr and airline_url and is treated as its own check-in regardless of whether airlines differ.",
              "Multiple passengers on one PNR: surnames are listed on the agent card for reference, but Away does not enter them; the airline site collects them. No per-passenger check-in state is tracked.",
              "No boarding-group, seat-assignment, or boarding-pass storage after hand-off (product GAPS); the airline owns everything past the door for every leg."
            ]
          }
        ],
        "divider": true
      },
      {
        "h": "The morning of your flight",
        "group": "During the trip",
        "tldr": "A day-of read that pulls terminal, gate, boarding time, baggage claim, on-time history, live progress and weather into one booking-detail card, and warns about a terminal change between connections, but it stops short of telling you when to leave, and it only loads when you open the booking (no home-screen live status, no proactive alert).",
        "p": [
          "A day-of read that pulls terminal, gate, boarding time, baggage claim, on-time history, live progress and weather into one booking-detail card, and warns about a terminal change between connections, but it stops short of telling you when to leave, and it only loads when you open the booking (no home-screen live status, no proactive alert)."
        ],
        "spec": [
          {
            "label": "States",
            "items": [
              "Confirmed and ticketed (precondition): BookingStatus=confirmed, every flight ticket_status=issued, pnr present. The day-of read renders meaningfully only here. If any leg ticket_status in (pending, ticketing, failed), the booking shows 'Fetching your tickets... We'll notify you' and the day-of read is suppressed for that leg.",
              "Live data not yet fetched: flight_info[] empty because the detail was opened without include_flight_info=true, or the fetch has not returned. UI degrades to the booked itinerary only (segment times, airports, supplier terminal if present).",
              "Live data present, partial (mid-air or pre-assignment): flight_info[].status exists but departure_gate / arrival_gate / baggage_claim are null. Each null field shows 'Not assigned yet' / 'Available after landing', never blank. progress_percent may drive a live progress section for in-air flights.",
              "Live data present, full: status string ('Scheduled' / 'On Time' / 'Arrived'), terminal, gate, boarding time, delay minutes, post-landing baggage_claim, and optionally a Flight Plan section (filed airspeed/altitude/ETE) and seat-availability-by-cabin when those fields are non-null.",
              "On-time history available: flight_info[].history[] length > 0, so the on-time percentage and delay/cancel/divert breakdown bar render. Empty history omits the breakdown entirely (no fabricated stat).",
              "Terminal-change warning state (connections only): current segment arrival_terminal differs from next segment departure_terminal, LayoutDetails renders the TerminalChange component.",
              "Check-in window states: check_in.status = not_open ('Opens [time]'), open ('Check in on [airline]' button opens airline_url), closed (counter message). Layered on top of the live read.",
              "Polling state: detail re-fetches every 10s if created within the last hour, else 60s; gate/terminal/baggage/status can change between polls. BNPL flow overrides to 5s.",
              "Terminal booking state: if the booking goes cancelled / expired / ticketing_failed, polling stops and PaymentPhase becomes failed/expired; the day-of read no longer self-updates.",
              "Codeshare leg (speculative relevance here): operated_by differs from marketing airline; flight tag 'Codeshare' (amber) may apply, which can confuse which airline's check-in/app to use."
            ]
          },
          {
            "label": "Edge cases",
            "items": [
              "Live status never fetched (offline, fetch skipped, or fetch failed) -> fall back to booked itinerary times and supplier terminal; show an explicit 'Live airport info isn't loaded yet' note rather than implying everything is on time.",
              "Gate not assigned yet -> render 'Gate: not assigned yet' and (speculative) a line that gates are usually posted closer to departure; never show a stale or guessed gate.",
              "Baggage claim null before landing -> 'Available after landing'; baggage_claim is a string only set post-arrival in FlightStatus.",
              "Terminal missing from supplier segment but present in real-time data -> LayoutDetails prefers segment terminal, falls back to flight_info status.departure_terminal so terminal is never null when any source has it.",
              "Terminal change between connecting flights -> TerminalChange warning rendered; copy flags transfer effort but does NOT compute whether the connection is makeable (no layover-vs-delay math exists in code).",
              "Flight delayed (departure_delay_minutes > 0) -> show the delay on the status badge; the app does NOT auto-rebook, push an alert, or recompute a leave-by time (no proactive disruption surface).",
              "Flight cancelled or diverted (cancelled / diverted true) -> surface the flag in the status badge and history counts; hand off to the concierge agent, since there is no in-app rebooking flow (agent can cancel/explain, not rebook).",
              "Mid-air with partial live data -> status may be null while progress_percent / Flight Plan fields exist; UI degrades to whatever is populated, history bar only if history[] present.",
              "Multi-segment itinerary with different live statuses -> FlightInfoSection renders a tab per segment_index; each tab shows that leg's status, history, weather, terminal.",
              "On-time history empty -> omit the percentage line entirely; never show '0%' or a placeholder.",
              "Check-in already done by user on the airline site -> the app cannot detect it; check_in.status stays as the airline reports; PNR remains copyable for counter fallback.",
              "Data changes mid-view (gate reassigned) -> next poll updates silently; no full remount. But there is NO live status on the home screen, so a user who only glances at the home card sees no update at all.",
              "Push notification disruption (Pusher reconnecting or stale token) -> may not arrive; opening the booking re-fetches live status, so the read is self-healing on open but not before."
            ]
          },
          {
            "label": "What the agent shows",
            "items": [
              "Day-of header: 'Your trip to [destination]' with route '[origin] - [destination]' and the date range (PostBookingDetails).",
              "Live status badge per leg: status string ('Scheduled', 'On Time', 'Arrived') plus delay minutes when non-zero.",
              "Info grid: Departure terminal, Gate Number, Boarding Time, and (post-landing) baggage claim. Null fields shown as 'Not assigned yet' / 'Available after landing'.",
              "On-time line when history exists: 'On time [N]% of the time' with a delay breakdown bar (on-time <=15m, 15-30m, 30-45m, 45m+, plus cancelled/diverted counts).",
              "Weather chips for origin and destination from origin_weather/destination_weather, framed as expectation-setting, not a forecast guarantee.",
              "Aircraft model line (e.g. 'Airbus A320') from airplane.model_name; optional Flight Plan section and seats-by-cabin when those fields are present.",
              "Route / Layover section header ('Direct flight [origin] to [destination]' or 'This flight has [N] stop(s)').",
              "Terminal Change warning block between connecting segments when terminals differ.",
              "Check-in card: PNR (tap to copy), passenger surnames, and the open/not_open/closed state with the airline button when open.",
              "Per-segment tab bar for multi-leg trips.",
              "Documents: ticket PDF view (ticket_pdf_url) and PNR, separate from the live read."
            ]
          },
          {
            "label": "What the agent does",
            "items": [
              "On opening the booking detail, fetch live status (include_flight_info=true) and begin polling at the recency-based cadence (10s/60s, 5s in BNPL).",
              "Resolve terminal from supplier segment first, then real-time fallback, so a terminal shows whenever any source has one.",
              "Compare each segment's arrival terminal to the next segment's departure terminal and raise Terminal Change when they differ.",
              "Compute the on-time percentage and delay/cancel/divert breakdown from history[] only when records exist.",
              "Surface check-in when check_in.status=open, airline_url and pnr exist; copy PNR to clipboard on tap and open the airline portal via expo-web-browser.",
              "Keep refreshing gate/terminal/boarding/baggage silently as polls return new values; stop polling on terminal booking states.",
              "Route notification taps for this booking to the Chat tab of /postBookingDetails (usePushNotifications).",
              "Hand off, never drive: for a delay, cancellation, diversion, or terminal-change worry, route the traveller to the concierge agent (which can fetch live details via ui_request_flight_details and explain), since the app takes no rebooking action."
            ]
          },
          {
            "label": "Analysis parameters",
            "items": [
              "Terminal source priority: supplier segment terminal vs real-time FlightAware terminal (prefer supplier, fall back to live).",
              "Terminal-change trigger: arrival_terminal(segment n) != departure_terminal(segment n+1).",
              "On-time bucketing: arrival_delay_minutes into <=15m (on time), 15-30m, 30-45m, 45m+ late; plus counts of cancelled and diverted history entries.",
              "Delay sign: departure_delay_minutes / arrival_delay_minutes can be negative (early) or positive (late).",
              "Field nullability: gate and baggage_claim treated as 'not yet known' rather than absent; baggage_claim only meaningful post-landing.",
              "Poll cadence: created_at within 1 hour -> 10s, else 60s; BNPL override 5s; terminal booking states stop polling.",
              "Check-in gate: show button only if check_in.status=open AND airline_url present AND pnr present.",
              "Surface where: live read lives in the booking-detail screen only; the home upcoming-trip card carries no live status, just static itinerary + a check-in button when one leg is open.",
              "Speculative (not computed in code): leave-by time, drive/traffic ETA, security-queue buffer, missed-connection probability, schedule-change detection, digital boarding pass. None are derived; the spec must not imply they are."
            ]
          },
          {
            "label": "Agent copy",
            "items": [
              "'Your trip to [destination]' / '[origin] - [destination]'",
              "'On Time' (status badge) and, when delayed, 'Delayed [N] min'",
              "'Gate Number' / 'Boarding Time' (info grid labels)",
              "'Gate: not assigned yet. Gates are usually posted closer to departure.' (speculative copy for null gate)",
              "'On time [N]% of the time' (only when history exists)",
              "'Available after landing.' (pre-arrival baggage null state)",
              "'Terminal Change' plus 'Your connection departs from a different terminal. Give yourself extra time to transfer.' (warning copy; honest, no makeable/not-makeable claim)",
              "'Live airport info isn't loaded yet. Showing your booked times.' (fetch-failed fallback)",
              "'Looks like [origin] departure is facing headwinds, you might see slight delays.' (weather framing, agent chat, grounded in real behaviour)",
              "'Web-check has started, click check-in to proceed' / 'Check in on [airline]' / 'Opens [time]' / 'Closed, head to the counter about 90 min before departure'",
              "'PNR copied to clipboard'",
              "Honest gap line for chat: 'I can't tell you when to leave home yet (no traffic or security-wait estimate), but here's your terminal, gate and boarding time.' (speculative, names the gap)"
            ]
          },
          {
            "label": "Failure modes",
            "items": [
              "Live fetch fails or times out -> show booked itinerary with the 'Live airport info isn't loaded yet' note and a retry; never leave a spinner on the gate/terminal row.",
              "Gate/terminal genuinely unassigned -> explicit 'not assigned yet' copy, not a blank or a dash that reads as missing data.",
              "Stale data between polls (gate reassigned but poll hasn't fired) -> next poll corrects it silently; acceptable because cadence is 10 to 60s and the badge reflects the last read.",
              "History array empty -> on-time line omitted, not faked.",
              "No home-screen live status -> a user who never opens the booking detail sees no gate, terminal or delay; the honest failure is that the live read is opt-in by navigation, not pushed.",
              "Push notification for a disruption not delivered (Pusher reconnecting with exponential backoff, or stale token) -> traveller may not be alerted; recovery is that opening the booking re-fetches; nothing warns them to open it.",
              "Terminal-change false alarm (terminals differ but transfer is trivial) -> warning is conservative and may over-warn; copy stays advisory ('give yourself extra time'), not alarmist.",
              "No leave-by reminder exists -> the honest failure is omission; the agent states it plainly rather than implying it will remind the traveller."
            ]
          },
          {
            "label": "If it is a group / multi-PNR booking",
            "items": [
              "Round trip / multi-leg: each leg renders in its own segment tab with its own status, terminal, gate, boarding time, history and weather; the traveller reads each leg separately. ticket_status and check_in are per flight, so one leg can still be 'Fetching tickets' while another is fully readable, and outbound can be 'On Time' while return is delayed.",
              "Check-in is per leg, not orchestrated: if outbound and return open at different times there is no 'check in all legs' flow; the home card surfaces only the first leg whose check_in.status=open (gap).",
              "Connections are where Terminal Change matters most: the warning fires per connection boundary, comparing arrival terminal of one leg to departure terminal of the next, but does not validate connection time against any live delay.",
              "Multi-PNR / self-transfer is NOT modelled (data gap): both flights live in flights[] with separate ids but no field flags one PNR vs two, and connection time is never validated, so the day-of read cannot warn that a missed first leg jeopardises a separately-ticketed second leg. Mark clearly as a known gap, not a handled case.",
              "Multi-passenger: surnames show on the check-in card, but there is no group coordination, shared day-of view, or way to share the booking across travellers (gap)."
            ]
          }
        ],
        "divider": true
      },
      {
        "h": "When ticketing is still pending",
        "group": "During the trip",
        "tldr": "Ticketing happens after payment, asynchronously and per leg, so the agent is honest about a pending state, surfaces the PNR the moment a leg issues, and does not hide it when one leg fails, even though there is no automated refund or rebook to offer.",
        "p": [
          "This moment is hard because the money is already gone but the ticket is not yet certain, and each flight tickets independently, so a round trip can be half done; the governing principle is honesty without panic. The agent does the whole job of watching and reporting, but the recovery decision (cancel, wait, contact support) stays with the person, and there is no partial-refund flow to lean on. The honest constraint, confirmed in code: there is no proactive disruption or ticketing-failure push beyond the polled booking state and a best-effort notification, so the screen, not the alert, is the source of truth."
        ],
        "spec": [
          {
            "label": "States",
            "items": [
              "BookingStatus = ticketing: airline is securing the ticket. derivePaymentPhase returns 'issuing_ticket'. Screen shows 'Fetching your tickets'.",
              "Per-flight TicketStatus = pending: leg has not started ticketing yet. No PNR.",
              "Per-flight TicketStatus = ticketing: this leg is actively being issued. Spinner next to that leg.",
              "Per-flight TicketStatus = issued: PNR populated on that flight. PostBookingDetails treats the leg as ticketed iff pnr is present; confirmation and check-in gate unlock for that leg only.",
              "Per-flight TicketStatus = failed: this leg could not be ticketed. PNR stays null for it.",
              "BookingStatus = confirmed but at least one leg still pending/ticketing/failed: TripsDetailsComponent still shows 'Fetching your tickets... We'll notify you' because any non-issued leg keeps the banner up.",
              "BookingStatus = ticketing_failed: a leg failed in a way that fails the whole booking. derivePaymentPhase returns 'failed'. Polling stops (terminal). Excluded from AwayPayDueCard even if away_advance_status = awaiting_payment. Post-booking chat empty-state skills (Cancel/Amend) do not show.",
              "Mixed round-trip state: outbound TicketStatus = issued (PNR shown) while return TicketStatus = failed, surfaced together as one screen with two different per-leg states.",
              "Per-leg CheckInStatus = not_open | open | closed: independent of ticket_status; check-in only unlocks at open AND a non-null pnr AND a present airline_url, so an issued leg can still show no check-in button until its window opens.",
              "Captured-but-not-confirmed (real gap): payment status='captured' yet BookingStatus has not reached confirmed (e.g. seat lock expiry / inventory loss mid-ticketing); user can see 'Payment confirmed' while the booking is stuck non-confirmed, then resolve to confirmed or ticketing_failed.",
              "Polling cadence state: useBookBookingDetailsById polls every 10s if created_at within 1 hour, else 60s (BNPL flow overrides to 5s). Terminal states (confirmed all-issued, cancelled, expired, ticketing_failed) stop polling."
            ]
          },
          {
            "label": "Edge cases",
            "items": [
              "Payment captured, booking still 'ticketing' for a while -> keep 'Fetching your tickets... We'll notify you', no fake progress bar, no time promise; honest that it is in the airline's hands.",
              "Outbound issued, return failed (per-flight independence) -> show the issued leg's PNR as real and usable, show the failed leg plainly as failed; do not let the good leg hide the bad one.",
              "Whole booking flips to ticketing_failed after payment was confirmed -> stop polling, show failed phase, route to support copy; there is NO automated partial refund or rebook in code, so the agent hands off to a human rather than promising money back.",
              "Captured payment but booking confirmation fails (seat lock expires, fare inventory depleted) -> user sees 'Payment confirmed' but booking stuck non-confirmed; honest recovery is the persistent banner plus a path to support, never a silent claim that it is done (real gap, no recovery flow in code).",
              "One leg keeps showing 'failed' but booking is still 'confirmed' -> banner persists (TripsDetailsComponent treats pending|ticketing|failed all as 'still fetching'); agent should clarify in chat that one specific leg failed, not the whole trip (speculative: code lumps failed into the same banner, so chat disambiguation is the honest fix).",
              "PNR appears for a leg -> unlock that leg's confirmation, copy-to-clipboard, and check-in gate (!!pnr && check_in.status === 'open'); do not unlock check-in for a leg without a PNR, and do not unlock it before the leg's check-in window opens even with a PNR.",
              "App backgrounded during ticketing -> on foreground, refetch booking details; no dead spinner, state reconciles from the server.",
              "Push notification 'ticket issued' tapped from killed state -> route to /postBookingDetails (Chat tab if data.screen = concierge) so the person lands on the booking, not a blank home.",
              "Ticketing never resolves and stays pending -> there is no client timeout for ticketing in code (unlike the 30s payment poll); honest recovery is the persistent 'We'll notify you' plus a path to chat/support, not an infinite silent spinner.",
              "ticket_pdf_url not yet present though pnr is set -> show PNR now, surface the PDF in Documents when its URL lands; do not block PNR display on the PDF.",
              "No proactive failure alert: the app does not push 'a leg failed'; the polled booking state and a best-effort notification are the only surfaces, so the agent must rely on the open screen rather than assume the person was told."
            ]
          },
          {
            "label": "What the agent shows",
            "items": [
              "'Fetching your tickets...' headline with 'We'll notify you' subline while any leg is non-issued (TripsDetailsComponent strings).",
              "Per-leg rows labelled 'Onward' and 'Return' so the two legs of a round trip are visually separate.",
              "On an issued leg: 'PNR Number' label with the PNR code, tappable to copy ('PNR copied to clipboard'); spinner icon replaced by the code.",
              "On a still-fetching leg: 'Fetching Tickets' inline in the PNR strip with a spinner.",
              "On a failed leg / failed booking: a plain failed state (not a red scary wall), with support contact path; post-booking chat shows 'Your flight ticket is being fetched' during ticketing and switches to 'Your flight ticket is successfully booked' once issued.",
              "Documents tab: 'Ticket(s)' with 'View' once ticket_pdf_url exists; 'Tickets to {destination}' sheet with 'PNR'.",
              "Post-booking concierge entry point (Chat tab) so the person can ask 'did my return come through?' in plain language.",
              "No countdown, no progress percentage for ticketing (there is none in the data); only the honest pending banner. (The only countdown in this area is the Away Advance payment-due timer, a separate flow.)"
            ]
          },
          {
            "label": "What the agent does",
            "items": [
              "Poll booking details on cadence (10s if booking < 1hr old, else 60s) and update each leg's TicketStatus live without a manual refresh.",
              "The moment a leg's ticket_status flips to issued, populate its PNR, unlock its confirmation and check-in gate, and stop showing the spinner for that leg.",
              "Invalidate the booking-details query (['booking-details-by-id', bookingId]) on relevant payment/ticketing events so the UI reflects ticketing/confirmed without stale data.",
              "Send a best-effort push notification on resolution ('ticket issued') and route the tap to the booking's Chat/Trip view; treat the screen, not the notification, as the source of truth.",
              "If the booking goes ticketing_failed, stop polling, present the failed phase, and hand off to support copy rather than auto-acting.",
              "In chat, answer status questions by reading the live per-leg ticket_status (issued vs failed vs ticketing) and state plainly which leg is which.",
              "Keep the issued leg fully usable (PNR copy, check-in when window opens) even while the other leg is unresolved.",
              "Guard once-per-status-change side effects (toast, navigate) with the handledTerminalRef pattern so Strict-mode / duplicate effects do not double-fire.",
              "Never auto-cancel, auto-refund, or auto-rebook; prepare the facts and the support path, let the person decide."
            ]
          },
          {
            "label": "Analysis parameters",
            "items": [
              "Per-flight ticket_status for every leg (pending | ticketing | issued | failed), evaluated independently, not collapsed to a single booking truth.",
              "Whether ANY leg is in pending|ticketing|failed -> drives the 'Fetching your tickets' banner (TripsDetailsComponent rule).",
              "Booking.status vs derived PaymentPhase: 'ticketing' -> issuing_ticket; 'ticketing_failed'/'cancelled' -> failed; used to decide screen and whether to stop polling.",
              "pnr presence per leg -> gates PNR display, copy, and the check-in button (!!pnr && check_in.status === 'open').",
              "check_in.status per leg (not_open | open | closed) and airline_url presence -> whether and when the check-in CTA appears, independent of ticketing.",
              "created_at age -> polling interval (fast for < 1hr, slow after; BNPL overrides to 5s).",
              "payment_type and away_advance_status -> whether an Away Advance due card should show (suppressed when status = ticketing_failed).",
              "Terminal vs non-terminal status -> whether to keep polling or stop.",
              "ticket_pdf_url presence -> whether the Documents 'View' action is live.",
              "payment record status ('captured') vs BookingStatus -> detect the captured-but-not-confirmed mismatch the agent must speak to honestly."
            ]
          },
          {
            "label": "Agent copy",
            "items": [
              "'Fetching your tickets...'",
              "'We'll notify you'",
              "'Your flight ticket is being fetched'",
              "'Your flight ticket is successfully booked'",
              "'PNR Number'",
              "'PNR copied to clipboard'",
              "'Onward' / 'Return'",
              "'Tickets to {destination}'",
              "'Ticket(s)' / 'View' (Documents tab, live once ticket_pdf_url exists)",
              "Honest chat disambiguation for the mixed case (speculative, not a verbatim code string): 'Your onward flight is ticketed, PNR {X}. The return leg did not ticket. I have not been refunded or rebooked automatically, so let us sort the return out together.'",
              "For a fully failed booking with no capture, reuse the existing honest support copy: 'No payment was taken. Our team can help sort this out.' / 'Go back home' / 'Talk to us' (note: this string assumes no capture; if payment WAS captured but a leg failed, the copy must be adjusted to not falsely claim no payment was taken, since there is no partial-refund flow, see Failure modes)."
            ]
          },
          {
            "label": "Failure modes",
            "items": [
              "Ticketing stalls indefinitely in 'pending' -> no client-side timeout exists for ticketing (only payment polling has the 30s/'Still processing' fallback); honest recovery is the persistent 'We'll notify you' banner plus an always-available path into chat/support, never a silent dead spinner.",
              "Payment captured but a leg fails with NO partial-refund or rebook flow in code -> the real gap; the agent must not promise a refund it cannot trigger. Honest recovery: state clearly that the leg failed, that money for it is not auto-returned, and hand to a human ('Talk to us'). Do not reuse the 'No payment was taken' string here, it would be false.",
              "Captured-but-not-confirmed -> 'Payment confirmed' shown while the booking is stuck non-confirmed (seat lock / inventory loss); no recovery flow in code, so the agent must surface the real stuck state and route to support, not imply success.",
              "Push notification not delivered (stale token / Pusher reconnecting) -> the person opens the booking and the polled state still updates; the screen, not the notification, is the source of truth.",
              "Booking shows 'confirmed' overall but the banner will not clear because one leg is 'failed' -> banner logic treats failed like still-fetching, which is misleading; recovery is explicit chat disambiguation of which leg failed (speculative fix; code currently conflates them).",
              "PNR shown but ticket PDF missing -> surface PNR immediately, mark the PDF as pending in Documents, do not block usage of the PNR.",
              "Strict-mode / duplicate effect could double-toast or double-navigate on a status change -> guarded once-per-change (handledTerminalRef pattern from payment flow) so the person is not yanked around.",
              "Name-mismatch, decline-code, or inventory-loss ticketing failures -> not parsed into a specific reason in code; the agent should say it does not yet know the exact reason and route to support rather than guess."
            ]
          },
          {
            "label": "If it is a group / multi-PNR booking",
            "items": [
              "Round trip stores both legs in flights[] with separate ids, supplier_ids, and independent ticket_status; the code does NOT model whether legs share one PNR or are two separate PNRs, and there is no field flagging same-PNR vs two-ticket, so PNR display is purely per-leg.",
              "Each leg surfaces its own pnr when issued; the person may end up with two PNRs (outbound and return) shown under 'Onward' and 'Return', but the app makes no claim about whether they are stitched.",
              "The 'Fetching your tickets' banner stays up until EVERY leg is issued, so a half-issued trip still reads as pending at the booking level even though one leg is usable.",
              "Per-passenger ticketing failure on a multi-passenger booking is not surfaced separately in the explored UI; ticket_status is tracked per flight, so a single failed passenger maps to the leg, and there is no per-passenger refund proration shown.",
              "Check-in is per leg and can stagger (each leg's check_in window opens on its own schedule); there is no unified 'check in all legs' flow, so the agent guides each leg as its pnr and window become ready.",
              "No bulk recovery for a round trip where one direction fails: no automated handling of 'outbound issued, return failed' beyond showing both states; the person must decide whether to keep the one good leg or contact support to unwind, and the agent prepares that, it does not act."
            ]
          }
        ],
        "divider": true
      },
      {
        "h": "Making a tight connection",
        "group": "During the trip",
        "tldr": "A connection monitor that does the layover-versus-delay math and warns when a connection goes from comfortable to tight to gone, with warmth that scales as the margin shrinks. The whole state machine is speculative: the real app has no missed-connection detection and does not parse layover time against delay. It rides on real FlightStatus, TerminalChange, and check_in data, and on the real agent surface (search_flights, cancel_booking, no rebooking tool).",
        "p": [
          "This moment is hard because the traveller cannot see the math: layover minutes minus inbound delay, against minimum connection time, while in motion and often offline. The principle: the agent does the whole calculation and recommends, but never rebooks on its own (it has no rebooking tool, only cancel_booking and a fresh search_flights); the person commits. Warmth scales up as the margin collapses; the confident edge drops to zero. Honesty is the other principle: the real app is a passive monitor (it fetches FlightStatus only on booking open or foreground via include_flight_info=true, sends no proactive alerts, and cannot guarantee push delivery), so every claim must be tagged by how fresh the data is and the agent must never imply an auto-rebook or a guaranteed warning."
        ],
        "spec": [
          {
            "label": "States",
            "items": [
              "Comfortable (speculative computed state): inbound on time or delay small, scheduled layover minutes minus inbound arrival_delay_minutes still safely above minimum connection time. Quiet, no alert.",
              "Tight (speculative): projected ground time has dropped near minimum connection time; surface a soft watch banner, no commitment asked.",
              "At risk (speculative): projected ground time below minimum connection time but the onward flight has not departed; surface the missed-connection warning and prepared options.",
              "Gone (speculative): connection mathematically unmakeable, or inbound landed too late, or a hard override fired (diverted/cancelled); shift fully to recovery.",
              "Real underlying flight states this rides on: FlightStatus.status (string, e.g. 'Scheduled' | 'On Time' | 'Arrived'), departure_delay_minutes / arrival_delay_minutes (can be negative = early), cancelled (bool), diverted (bool), progress_percent (0 to 100 mid-air), departure_gate / arrival_gate, departure_terminal / arrival_terminal, baggage_claim (src/features/flightListing/types.ts).",
              "Real booking/ticket states: BookingStatus (passengers_pending ... ticketing | confirmed | cancelled | expired | ticketing_failed), per-flight TicketStatus (pending | ticketing | issued | failed), pnr present only when ticket_status='issued', check_in.status (not_open | open | closed) (src/common/types/bookingDetailsTypes.ts).",
              "Data-availability state (real): FlightStatus / flight_info[] only exist when the booking is fetched with include_flight_info=true; without it the monitor has no live numbers and must say so rather than guess.",
              "Polling-recency state (real): useBookBookingDetailsById polls every 10s if created_at is within 1 hour, else 60s. A connection monitored hours after booking refreshes only every 60s, so the projection can be up to a minute stale (speculative use of a real cadence).",
              "Pusher connection state (real): CONNECTED | DISCONNECTED with exponential backoff. While disconnected, any push-driven warning may never arrive; the monitor must self-heal on next foreground/open."
            ]
          },
          {
            "label": "Edge cases",
            "items": [
              "No live flight data fetched (include_flight_info not set) -> agent states it is working from scheduled times only, shows scheduled layover, and offers to pull live status; never fabricates a delay number.",
              "Inbound diverted (FlightStatus.diverted=true) -> treat connection as at risk or gone regardless of delay minutes; divert means alternate airport or unknown re-route; jump to recovery and say plainly the connection cannot be assumed.",
              "Inbound cancelled (FlightStatus.cancelled=true) -> connection is gone by definition; go straight to recovery and rights, skip tight/at-risk language.",
              "Onward leg cancelled or ticketing_failed (real BookingStatus / TicketStatus) -> there is no connection to protect; pivot to the onward-leg recovery, not the inbound math.",
              "Terminal change between the two legs (real: LayoutDetails.tsx compares segment N arrival_terminal to segment N+1 departure_terminal and renders the TerminalChange warning) -> add a walking/transit buffer to required ground time so the math is honest about a tight transfer; the terminal value may come from supplier data or fall back to FlightStatus real-time data.",
              "Terminal data missing entirely (no segment terminal and no live terminal) -> do not silently assume same-terminal; flag that terminal info is unknown and treat the buffer as uncertain.",
              "Two-PNR / self-transfer connection (real gap: flights[] hold separate ids and supplier_ids with no field flagging single-PNR vs split-ticket, no PNR-stitching model) -> agent must warn the airline is not obligated to protect or rebook; the margin warning matters more and recovery is on the traveller plus Away.",
              "Codeshare inbound (real: FlightSegment.operated_by differs from marketing carrier, 'Codeshare' amber tag) -> the desk to call for recovery may be the operating carrier, not the airline on the ticket; surface both if known.",
              "Layover is generous and inbound recovers time (negative arrival_delay_minutes) -> downgrade from tight back to comfortable, actively dismiss the banner; do not leave a stale warning up.",
              "Live status partial (mid-air, status null or delay fields missing) -> show progress_percent and scheduled arrival, label the projection 'estimated', do not assert a hard outcome (matches real degrade-to-basic behaviour).",
              "Multiple segments with different live statuses (real: FlightInfoSection renders a per-segment tab bar) -> compute the margin against the correct adjacent pair, not just segment 0.",
              "Pusher disconnected or push token stale (real: no guaranteed delivery, no offline message queue) -> the warning may arrive late or not at all; on next foreground/booking-open, recompute and surface immediately rather than assuming it was seen.",
              "Check-in for the onward leg already closed (check_in.status='closed', real string 'Closed, head to the counter about 90 min before departure') -> even if the math is makeable, flag that web check-in is shut and the counter is the only path, which eats buffer.",
              "Booking expired or moved to a terminal state mid-monitor (real: polling stops on terminal states, isBookingUpcoming filters it out of the home feed) -> stop asserting a live connection projection and explain the booking is no longer active."
            ]
          },
          {
            "label": "What the agent shows",
            "items": [
              "A margin readout: scheduled layover, current inbound arrival_delay_minutes, projected ground time at the connecting airport, and minimum connection time, with the gap stated in minutes (speculative computation).",
              "A status chip on the connection: Comfortable / Tight / At risk / Gone, calm-to-urgent color, reusing the awDisruption / BookingCard live status surface.",
              "The live inbound badge from real FlightStatus.status ('On Time', 'Arrived', delay minutes) and the progress_percent bar when mid-air (real BookingCard live status section).",
              "A terminal-change line when arrival terminal differs from onward departure terminal (real TerminalChange component), with the added-buffer note.",
              "Gate and boarding for the onward leg when available (real FlightStatus.departure_gate, departure_terminal; real labels 'Gate Number', 'Boarding Time').",
              "When at risk or gone: a prepared options block (alternative flights via the agent's search_flights tool) plus the airline desk number (real IAirlineInfo phone/url) and the PNR (copyable; real 'PNR copied to clipboard' pattern).",
              "An explicit data-source line: 'live status' vs 'scheduled times only', so the traveller knows how solid the number is.",
              "An explicit freshness note when the projection is from a 60s-cadence or backgrounded fetch (speculative surfacing of the real polling cadence)."
            ]
          },
          {
            "label": "What the agent does",
            "items": [
              "On booking open / foreground, fetch booking with include_flight_info=true to get current FlightStatus (real on-demand fetch; this is the only detection path, the app sends no proactive alert).",
              "Compute projected ground time = scheduled layover minus inbound arrival_delay_minutes, then subtract a terminal-change/transfer buffer where TerminalChange applies (speculative).",
              "Compare projected ground time to minimum connection time and assign Comfortable / Tight / At risk / Gone (speculative).",
              "If Tight: post a soft watch banner, keep monitoring on the existing poll cadence, do not interrupt.",
              "If At risk: surface the warning and, in the background, pre-run search_flights for same-route/date alternatives so options are ready before the traveller asks (agent prepares, does not book).",
              "If Gone: present alternatives, surface airline contact and rights/policy context (real parsed_fare_rules cancellation/date_change/no_show tiers), and offer to start the search; hand the commit to the person.",
              "Recompute and re-surface on every foreground / booking-open rather than trusting that a push was delivered (real Pusher/push has no guaranteed delivery).",
              "Hand off cleanly: the agent has NO rebooking tool (confirmed real gap); for any change it can only initiate cancel_booking (real tool, passenger multi-select) or assist a fresh search_flights; the new booking is the traveller's tap. Never imply an auto-rebook."
            ]
          },
          {
            "label": "Analysis parameters",
            "items": [
              "scheduled layover minutes (derived from inbound segment arrival vs onward segment departure, real FlightSegment times).",
              "inbound arrival_delay_minutes (real FlightStatus, can be negative = early).",
              "minimum connection time for the airport/terminal pair (speculative: not in code; would need a reference table or buffer constant).",
              "terminal-change buffer when arrival terminal != onward departure terminal (real TerminalChange signal; buffer value speculative).",
              "diverted / cancelled booleans (real) as hard overrides to Gone.",
              "check_in.status of the onward leg (real) as a secondary squeeze on usable buffer.",
              "single-PNR vs split-ticket protection (real gap: not modelled) as a confidence/risk modifier on whether the airline will hold or rebook.",
              "codeshare operated_by vs marketing carrier (real) as a modifier on which desk handles recovery.",
              "data freshness: whether FlightStatus was actually fetched vs scheduled-only, plus poll recency (10s vs 60s) and whether the last fetch was foreground or background, which sets how hard a claim the agent may make.",
              "onward BookingStatus / TicketStatus (real): if the onward leg is itself cancelled/failed, the connection math is moot."
            ]
          },
          {
            "label": "Agent copy",
            "items": [
              "Comfortable: 'Your inbound is on time. You have about 1h 10m on the ground at DEL, that is comfortable for this connection.'",
              "Tight: 'Heads up, your inbound is running about 35 minutes late. That leaves roughly 40 minutes to connect, and your gates are in different terminals. It is doable but tight, I am watching it.'",
              "At risk: 'This connection is now at risk. Inbound is 1h 20m late and you would have under 25 minutes on the ground. I have already pulled a few later options on the same route so they are ready if you want them.'",
              "Gone (warm, edge to zero): 'I do not think this connection is makeable now, and I would rather tell you straight than have you run for it. Here are the next flights I found, and the airline desk number for AI. I can start the search, you decide.'",
              "Data-only honesty: 'I am working from scheduled times right now, I have not got live status for this flight yet. Want me to pull the latest?'",
              "Stale-data honesty: 'This is from a check a minute ago, let me refresh before you act on it.'",
              "Two-PNR caution: 'These two flights are on separate tickets, so the airline is not obligated to rebook you if the first runs late. That makes the timing matter more here.'",
              "No-rebook honesty: 'I cannot rebook you myself, but I can line up the options and you complete the booking, or I can give you the desk number. Which is easier right now?'"
            ]
          },
          {
            "label": "Failure modes",
            "items": [
              "Live status never loads (fetch fails or no FlightStatus) -> show scheduled layover, label it clearly as scheduled-only, offer a manual retry; never show a spinning 'calculating' with no fallback.",
              "Pusher/push delivery fails so the at-risk alert is late or never sent (real gap: no guaranteed delivery) -> recompute and surface on the very next foreground or booking-open; the banner appears even if the push did not.",
              "Projection is uncertain (mid-air, missing delay fields) -> say 'estimated' and give a range, do not assert Gone on thin data.",
              "Alternatives search (search_flights) returns nothing or errors -> say so plainly and pivot to airline contact and rights, rather than leaving an empty results state.",
              "Agent has no rebooking tool (confirmed real gap) -> be explicit that it can prepare and hand off but the traveller must complete the new booking or call the airline; never imply an auto-rebook.",
              "Stale warning after recovery -> if inbound recovers time, actively clear the at-risk banner so the traveller is not left anxious by an outdated state.",
              "Chat message lost while offline (real gap: no offline queue) -> if the traveller sends 'help me' while Pusher is reconnecting, it can be dropped; on reconnect, recompute and re-offer rather than assuming the request landed.",
              "Cancel handoff has no result surface (real gap: cancel_booking has an input form and an 'initiated' output but no refund/status tracking) -> after initiating, tell the traveller it is initiated and that status and refund are tracked separately, do not imply a confirmed cancellation or refund."
            ]
          },
          {
            "label": "If it is a group / multi-PNR booking",
            "items": [
              "Round-trip or multi-leg under one booking (real: flights[] with direction outbound/return): compute the margin per connection, not just the first leg; surface whichever connection is tightest.",
              "Split-ticket / self-transfer (real gap: no PNR-stitching field): warn that no airline protects the connection, raise the urgency of the margin warning, and make recovery the traveller's responsibility with the agent assisting.",
              "Multiple passengers on one PNR: a miss affects everyone on the booking; a recovery search must hold all passenger seats together, and a partial cancel (real cancel_booking allows passenger multi-select) should be framed carefully so the group is not split by accident.",
              "Onward leg of a group connection that fails: flag both the immediate missed segment and the downstream impact (return or next leg), since the real model tracks each flight's ticket_status and direction independently.",
              "Partial ticketing across the group (real: round-trip can have outbound='issued', return='failed') -> if a leg never ticketed, there is no protected connection on that leg; surface that distinctly from a delay-driven miss.",
              "Away Advance (BNPL) booking still awaiting_payment or overdue (real away_advance_status) -> a missed connection on an unpaid booking is doubly fragile; note the payment state because the booking itself can lapse independent of the delay."
            ]
          }
        ],
        "divider": true
      },
      {
        "h": "When the airline owes you",
        "group": "During the trip",
        "tldr": "On a protected single-PNR itinerary the airline owes the rebook; Away has no rebooking or compensation tool, so it fetches live truth, holds the booking untouched, points at the right airline desk, and hands over the exact words and the PNR to say them with.",
        "p": [
          "This moment is hard because the traveller is stranded, time-pressured, and unsure who owes them what; the governing principle is that the agent does the whole job of preparing and pointing but never cancels or pays on its own, because cancelling a protected PNR can forfeit the airline's duty to rebook, and because no rebooking or compensation tool exists in the code to do otherwise."
        ],
        "spec": [
          {
            "label": "States",
            "items": [
              "Confirmed and ticketed: BookingStatus='confirmed', each leg TicketStatus='issued', pnr present, derivePaymentPhase='confirmed'. This is the protected single-PNR case (search_params.trip_type='round_trip' or multi-segment under one PNR). Single PNR is inferred, NOT modelled: code stores both legs in flights[] with separate ids and supplier_ids and no field flagging same-PNR vs two-ticket (booking-itinerary-model GAP).",
              "Live status fetched: agent runs ui_request_flight_details which sets include_flight_info=true; FlightStatus arrives per segment with departure_delay_minutes / arrival_delay_minutes, cancelled, diverted, gate, terminal, progress_percent, on-time history. Until this fires the app is passive and shows only the booked itinerary (no proactive alert exists).",
              "Disruption recognised (speculative): inbound leg delay or cancellation makes the booked connection time on segments[] unreachable. App has NO missed-connection detection in code (it does not compare layover vs delay), so this state is entered by the user telling the agent or by the agent reading the fetched FlightStatus.",
              "Agent prepares the handoff: gathers PNR, leg times, the correct airline contact (check_in.airline_url / IAirlineInfo), ticket_pdf_url if present, and drafts the words. No move is made on the booking.",
              "Held: agent explicitly does NOT call cancel_booking. The booking stays 'confirmed' so the airline's duty to rebook the protected PNR is preserved.",
              "Handed off: agent surfaces airline contact and the script; the person calls or goes to the desk and commits. Agent stays available for follow-up and to re-fetch status.",
              "Chat clarification: if context is thin (which leg, what time now) the agent runs ask_user_questions and renders a question card in the conciergePage composer; user taps an option or types free text (concierge-agent-surface).",
              "Away Advance overdue mid-trip (compounding): if payment_type='away_advance' and away_advance_status='overdue', the booking is at cancellation risk from the lender side at the same moment as the disruption; agent must flag that settling the due amount is what keeps the very ticket alive that the airline is meant to rebook.",
              "Live status partial or absent: flight_info present but status null / fields missing (mid-air, stale FlightAware). App degrades to booked times only; history breakdown renders only if history[] length > 0."
            ]
          },
          {
            "label": "Edge cases",
            "items": [
              "Inbound leg cancelled outright (FlightStatus.cancelled=true) -> agent confirms the whole protected PNR is the airline's to re-route, tells the traveller NOT to cancel or self-book, points at the airline rebooking desk with PNR ready.",
              "Inbound delayed but connection technically still makeable -> agent shows the real numbers (arrival_delay_minutes vs booked connection gap from segments[]) and lets the person decide whether to run for it; it does not declare a miss it cannot verify.",
              "Inbound diverted (FlightStatus.diverted=true) -> different recovery airport; agent flags the connection is almost certainly gone and that re-routing is the airline's, but cannot compute new routing (no tool).",
              "User asks Away to just rebook me -> agent is honest there is NO rebooking tool (real gap) and that on a protected PNR the airline owes the new flight at no cost; rebooking through Away would mean a fresh paid booking via search_flights and could forfeit that right. It hands off instead.",
              "User asks Away to cancel so I can book myself -> agent warns cancelling the protected PNR likely ends the airline's rebook obligation; it holds and does not call cancel_booking. cancel_booking is fired only on explicit, informed instruction.",
              "Two-ticket / self-transfer itinerary (separate PNRs per leg) -> agent flags this is NOT protected: the onward airline owes nothing for an inbound delay on a different ticket. Code cannot tell the two apart (no PNR-stitching field), so the agent states the assumption and asks the traveller to confirm single PNR.",
              "Codeshare leg (FlightSegment.operated_by differs from marketing carrier, amber 'Codeshare' tag) -> the desk that owes the rebook can be ambiguous (marketing vs operating airline). No codeshare_status field resolves this (real gap); agent names both and tells the traveller to start with the operating carrier at the airport.",
              "Terminal change between the inbound and onward leg (TerminalChange warning component) -> agent adds the terminal hop to the time-pressure read and the desk-finding instructions.",
              "Compensation question (am I owed money) -> agent explains that on a protected PNR the airline owes the rebook and care (and per route/rules possibly meals or hotel), but is explicit there is NO compensation calculator, rights engine, or claim tool in Away (real gap) and no DGCA/EU261 logic; it points to the airline and to parsed_fare_rules where relevant.",
              "User already cancelled in panic before reaching the agent -> BookingStatus='cancelled', derivePaymentPhase='failed', no rebook leverage left; agent is honest the protection is likely gone and shifts to airline contact for any residual refund. There is no refund-status tracking in code (gap).",
              "Pusher disconnected / push not delivered -> the disruption may never have alerted the user proactively (NO proactive alerts in code); the moment starts when the user opens the booking or messages. Agent does not pretend it caught it first.",
              "Stale live data from slow polling -> bookings poll every 10s if created_at < 1h else 60s; numbers shown may lag reality. Agent frames live figures as last-fetched and offers a fresh pull."
            ]
          },
          {
            "label": "What the agent shows",
            "items": [
              "awDisruption figure: the affected leg with its live status badge (FlightStatus.status, e.g. delayed/cancelled/diverted), departure/arrival delay minutes, and the booked connection window from segments[]; per-segment if multi-leg (FlightInfoSection tab by segment_index).",
              "A clear 'the airline owes this' line with the PNR shown and copyable (PNR copy-to-clipboard exists; toast 'PNR copied to clipboard').",
              "Airline contact block from check_in.airline_url / IAirlineInfo (phone/website) as the handoff target; both marketing and operating carrier named if codeshare. NO in-app rebooking button (none exists).",
              "A ready-to-read script block (the words to say at the desk), selectable for copy.",
              "ticket_pdf_url / PNR as proof to present at the desk if the leg is ticketed.",
              "On-time / disruption history for the leg from FlightHistoryEntry if present (history[] length > 0), as context only.",
              "A held-state note: the booking is untouched and still 'confirmed'; nothing has been cancelled.",
              "If payment_type='away_advance' and overdue: the 'Pay now to avoid cancellation' due card and countdown, flagged as keeping the ticket alive for the airline to honour.",
              "Quick-reply suggestion chips via the SuggestionsEvent Pusher event, e.g. real strings 'Check delay', 'Cancel flight', 'View receipt' (NOT a fabricated 'Rebook' chip, which has no tool).",
              "If context is missing: an ask_user_questions card in the composer ('Which leg are you on?' style) rather than a guess."
            ]
          },
          {
            "label": "What the agent does",
            "items": [
              "1. Fetch live truth: run ui_request_flight_details (include_flight_info=true) to pull FlightStatus for the inbound leg and the right segment_index.",
              "2. Read the gap: compare arrival_delay_minutes against the booked connection time from segments[] to judge whether the connection is missed; factor terminal change if flagged.",
              "3. Confirm protection: check this is one PNR (state the assumption out loud, ask via ask_user_questions if unsure) so the airline's rebook duty applies.",
              "4. HOLD: deliberately do not call cancel_booking or amend; keep the PNR alive. Cancel only on explicit informed instruction.",
              "5. Identify the right desk: surface airline contact from IAirlineInfo / check_in.airline_url; for codeshare, name marketing and operating carrier and steer to the operating one.",
              "6. Equip them: copy the PNR, point at ticket_pdf_url, and hand the exact script (what they are owed, leg, PNR).",
              "7. Cover the BNPL trap: if away_advance is overdue, tell them to settle the due amount so the ticket survives for the airline to rebook.",
              "8. Stay: keep the chat thread open, offer to re-fetch status. Rebooking and compensation themselves are left to the airline and the person (no tool exists)."
            ]
          },
          {
            "label": "Analysis parameters",
            "items": [
              "Inbound arrival_delay_minutes vs booked connection gap (next segment departure_time minus this segment arrival_time from segments[]) -> is the connection actually missed.",
              "cancelled / diverted flags on the inbound leg -> hard miss vs soft risk vs alternate-airport recovery.",
              "Single-PNR vs two-ticket (inferred from booking structure; not a real field) -> whether the airline owes the rebook at all.",
              "Codeshare (operated_by differs from marketing carrier) -> which carrier's desk owes the rebook.",
              "Terminal change between inbound and onward leg -> added time cost to making or re-routing the connection.",
              "TicketStatus='issued' and pnr present (and ticket_pdf_url) -> there is a real ticket and PNR to invoke at the desk.",
              "Fare context from parsed_fare_rules (refundable/changeable, no_show) -> only to set expectations, not to compute a claim.",
              "Route domestic vs international (isDomesticBooking) -> which care/rebook norms to mention, kept vague since no rules engine exists.",
              "payment_type / away_advance_status -> whether a BNPL overdue is silently jeopardising the same ticket.",
              "Live data availability and freshness (FlightStatus null/partial; 10s vs 60s poll) -> whether to speak from live numbers or only booked times.",
              "Time pressure (minutes to onward departure) -> how urgently to push the handoff."
            ]
          },
          {
            "label": "Agent copy",
            "items": [
              "\"Your inbound got in late and the connection is gone. Because both legs are on one ticket, the airline owes you the rebook at no cost.\"",
              "\"Don't cancel anything and don't book a new flight yourself, that can end their duty to re-route you. Go to the airline's rebooking desk with this PNR.\"",
              "\"Here are the words: 'My connection was missed due to the inbound delay on a single PNR. I need to be rebooked on the next available flight at no charge.'\"",
              "\"PNR copied to clipboard.\"",
              "\"I can't rebook from here, but I've held everything as-is so your ticket stays valid for them to fix.\"",
              "\"Airline desk and number are below. I'll stay here, tell me how it goes and I'll pull fresh status if you need it.\"",
              "\"This leg is operated by a partner airline, so start at the operating carrier's desk, not the one you booked under. I've listed both.\"",
              "\"Heads up: your pay-later balance is overdue. Settle it so the ticket the airline is meant to rebook doesn't get cancelled from your side first.\"",
              "\"Looks like these are two separate tickets, not one PNR, so the onward airline isn't obligated for the inbound delay. Let me lay out your options before you spend anything.\"",
              "\"I can't see live status for this leg right now. Here's your booked connection time and the desk to call.\""
            ]
          },
          {
            "label": "Failure modes",
            "items": [
              "Live status fetch returns null/partial (mid-air, stale FlightAware) -> agent says plainly it can't see live data, shows booked times, still hands off desk + script. No dead spinner.",
              "User taps a chip expecting an in-app rebook -> there is NO rebook tool; agent states this honestly and routes to the airline rather than silently failing.",
              "Agent misreads two-ticket as protected -> mitigated by stating the single-PNR assumption out loud and asking the traveller to confirm before promising the airline owes anything.",
              "Agent points at the wrong carrier on a codeshare -> mitigated by naming both marketing and operating carrier and defaulting to the operating one at the airport.",
              "Pusher reconnecting / push token stale -> no proactive alert ever fired; recovery is that the moment works fully on-demand the instant the user opens the booking or asks.",
              "User already cancelled in panic -> BookingStatus='cancelled', derivePaymentPhase='failed', no rebook leverage left; agent is honest the protection is likely gone and shifts to airline contact for any residual refund. No refund-status tracking exists to follow it.",
              "Airline contact missing (no airline_url / IAirlineInfo) -> agent gives the script and the PNR and tells the person which desk to find, rather than a blank handoff.",
              "Agent tempted to call cancel_booking to tidy up -> hard constraint: never cancel a protected PNR in this moment; cancel only on explicit informed user instruction.",
              "Away Advance silently overdue while disruption is handled -> agent surfaces and resolves the BNPL risk first so the ticket is not cancelled from the lender side mid-rebook.",
              "User submits 'please help' while Pusher disconnected -> no offline message queue exists (gap); message can be lost. Recovery is the user re-sending once reconnected."
            ]
          },
          {
            "label": "If it is a group / multi-PNR booking",
            "items": [
              "Per-passenger: CancelBookingInput supports selecting a subset of passengers, but here the agent cancels nobody; for a group all travellers on the same PNR are rebooked together by the airline, so the script asks for the whole party by PNR.",
              "Round-trip / multi-leg: only the disrupted leg's connection is affected; the agent is explicit about which leg ('Onward'/'Return' labels) and leaves the untouched leg alone. Code tracks per-flight ticket_status and direction independently.",
              "True multi-PNR (separate tickets per airline) -> protection does NOT carry across PNRs; the agent must say each ticket stands alone and the onward airline owes nothing for a delay on a different PNR. No through-passenger record or misconnection liability is modelled in code (real gap), so the agent states this from booking structure and confirms with the traveller.",
              "Mixed party (some pax already flew the onward leg) -> agent handles only the stranded travellers and surfaces each affected PNR/leg separately, since per-leg and per-passenger state are tracked independently but no group-coordination or co-passenger sharing UI exists (gap).",
              "No proration display: if some passengers are affected and others not, there is no per-passenger refund/care calculation surface (gap); agent keeps it qualitative and routes to the airline."
            ]
          }
        ],
        "divider": true
      },
      {
        "h": "When nobody owes you",
        "group": "During the trip",
        "tldr": "You missed your second flight on a self-transfer, no airline owes you a rebook, and the agent gives you the move, the desk script, and an honest read of what you are and are not owed, then hands you the wheel to search, book, and pay for a replacement.",
        "p": [
          "This moment is hard because two separate tickets mean no single airline is liable for the misconnection, and the real app cannot detect it: there is no through-ticket flag, no liability model, no missed-connection parsing (layover vs delay), and no proactive disruption alert at all, so the agent only learns of the miss when the person tells it. The agent has to be honest about that gap, carry the weight, reason from two distinct PNRs instead of a stored field, and let the person commit money to fix it because the only real recovery path in code is a fresh search plus a new booking."
        ],
        "spec": [
          {
            "label": "States",
            "items": [
              "Existing booking stays BookingStatus='confirmed', both legs ticket_status='issued', PaymentPhase='confirmed'. The miss changes no booking state in the app (real gap: no missed-connection detection, no proactive alert; the agent only knows because you told it).",
              "Live status on the missed leg: FlightStatus fetched only via include_flight_info=true; may show cancelled=true, diverted=true, or arrival_delay_minutes on the inbound leg that caused the miss. May be null or partial if no real-time data.",
              "Concierge ChatStatus moves submitted -> streaming -> ready as the agent works the problem; THINKING_TEXTS cycle ('On it...', 'Looking into it...', 'One moment...'). On a dropped stream, status can hit 'error' with a single armed auto-resume.",
              "ask_user_questions card reaches output-available when the agent needs to confirm which leg, what time, and whether you are still airside; only the most recent card is interactive.",
              "search_flights running state: agent fetches replacement options for the second leg (the only real recovery path in code is a fresh search plus a new booking).",
              "If the agent initiates ui_cancel_booking on the missed leg (real tool, initiate-only): output shows 'Cancel Booking initiated for flights'; backend may set that leg's booking to cancelled. No refund or rebook is guaranteed by this; it is just a request.",
              "Hand-off state: agent prepares the move and the script but does not book. You commit by tapping Pay on a NEW booking, which runs the standard payment -> ticketing path (Razorpay terminal callback, or Cashfree mandatory /payments/verify polling, 2s interval, 30s timeout)."
            ]
          },
          {
            "label": "Edge cases",
            "items": [
              "No self-transfer flag exists -> agent treats a booking whose legs carry distinct supplier_ids and (post-ticketing) distinct PNRs as separate tickets and says so plainly. It reasons from two distinct objects, not a stored field (SPECULATIVE inference).",
              "Inbound leg delayed but not yet landed -> agent fetches FlightStatus via ui_request_flight_details, reads arrival_delay_minutes, and warns the connection is at risk. Note: the real app has NO automatic missed-connection warning and does not parse layover vs delay; this is agent-initiated on your prompt only.",
              "You already missed it -> agent does not pretend a rebook is owed; states no airline liability across two tickets, then moves to options.",
              "Missed leg shows cancelled=true or diverted=true on the FIRST ticket's airline -> that airline may owe you something; agent flags the distinction (your miss vs their cancellation) because liability differs.",
              "Live status unavailable (FlightStatus null or partial) -> agent says it cannot confirm the live state and asks what the gate or airline told you, rather than guessing.",
              "Outbound missed on a round trip -> agent notes the return leg booking is untouched and still confirmed; no bulk rebooking exists, so each is handled separately.",
              "You ask the agent to just rebook me -> agent cannot; no rebooking tool exists (real gap). It can search and prepare, and optionally initiate cancel on the missed leg, but you create and pay for the new booking.",
              "New search fares drift at payment -> on the NEW booking only, useBookingPriceUpdate fires: price_changed shows PriceUpdateBottomSheet (accept or re-search), fare_unavailable blocks payment with 'Your selected fare is no longer available. Please select a new fare.'",
              "Original booking was Away Advance and still unpaid (away_advance_status='awaiting_payment' or 'overdue') -> the missed leg may also be at risk of airline cancellation for non-payment; agent flags this is a separate problem from the miss.",
              "Chat drops on airport wifi -> silent stream resume on foreground (>3s background) heals an in-flight reply. BUT there is no offline message queueing: a message you send while Pusher is disconnected is lost with no local draft (real gap), so the agent may need you to resend."
            ]
          },
          {
            "label": "What the agent shows",
            "items": [
              "A live status badge on the booking card for the missed leg ('Cancelled', delay minutes) when include_flight_info is fetched; on-time history from FlightStatus.history[] if present.",
              "An honest liability statement block: this was two separate tickets, so airline B is not obligated to rebook you for free.",
              "A 'what you are owed' vs 'what you are not owed' two-line summary (SPECULATIVE; no rights model in code, agent composes from reasoning, not a calculator).",
              "Replacement-flight result cards from search_flights for the second leg, priced as new purchases near OTA rates ('a few percent under other OTAs' at best, not big savings; real negotiation savings are near zero rupees).",
              "A copy-ready script block (selectable text) for the airline desk.",
              "ask_user_questions card with 2 to 5 tappable chips to confirm leg, time, and whether you are still airside.",
              "Quick-reply suggestion chips (suggestions Pusher event), for example 'Find next flight', 'What do I say at the desk', 'View my ticket'.",
              "The PNR of the leg you are dealing with, copyable (tap to copy, toast 'PNR copied to clipboard'). PNR is null if that leg was never ticketed.",
              "A clear hand-off CTA on any replacement: you book and pay; the agent does not auto-charge."
            ]
          },
          {
            "label": "What the agent does",
            "items": [
              "1. Acknowledge warmly and take the weight: name that the miss is stressful and that it will walk you through it.",
              "2. Fetch live status of the missed leg via ui_request_flight_details (include_flight_info=true) to confirm cancelled/diverted/delay before advising.",
              "3. State liability honestly: two separate tickets means no through-ticket protection; airline B is not obligated to you for free (SPECULATIVE reasoning, no liability field).",
              "4. Separate the two cases: if the FIRST airline caused the miss by cancel or divert, flag they may owe you; if you simply missed it, say so.",
              "5. Ask only the minimum clarifying questions (which leg, what time, still airside) via ask_user_questions.",
              "6. Read parsed_fare_rules.no_show and refundable on the missed leg's fare to tell you whether a no-show refund is even possible (usually not).",
              "7. Run search_flights for the replacement second leg; rank by soonest workable departure and price.",
              "8. Prepare the move and the script: the exact next flight to buy and the words to use at the desk.",
              "9. Optionally initiate ui_cancel_booking on the missed leg if you ask, making clear it is a request, not a guaranteed refund.",
              "10. Hand off: present the new booking for you to confirm and pay (standard payment flow). The agent never takes the wheel.",
              "11. Note the return leg is untouched if applicable, so you do not panic-cancel something still valid. Can ui_navigate you to the relevant booking or search."
            ]
          },
          {
            "label": "Analysis parameters",
            "items": [
              "Whether the two legs are separate tickets: inferred from distinct supplier_ids and (post-ticketing) distinct PNRs (SPECULATIVE; no through-ticket vs self-transfer field exists).",
              "Cause of the miss: read FlightStatus.cancelled / diverted / arrival_delay_minutes on the inbound leg to decide if any airline liability attaches.",
              "Time pressure: minutes until the next viable departure on the second leg's route (from search_flights results vs now).",
              "Cost to recover: price of replacement second-leg fares, framed honestly as new purchases near OTA rates, not negotiated savings. Note PG fee is non-refundable even on cancellable fares.",
              "Validity of remaining legs: is the return or other direction booking still confirmed and untouched.",
              "Whether you are still airside vs landside (changes what the counter can do), asked via ask_user_questions.",
              "Refundability of the missed leg: read parsed_fare_rules.no_show and cancellation tiers plus fare.refundable on that flight to state whether a no-show refund exists (usually non-refundable; honest about it).",
              "Original booking payment state: payment_type and away_advance_status, to flag if the existing booking itself is at risk for non-payment, separate from the miss."
            ]
          },
          {
            "label": "Agent copy",
            "items": [
              "\"You missed the connection. That is rough, and I am going to help you sort it.\"",
              "\"These were two separate tickets, so the second airline is not obligated to rebook you for free. Here is what that actually means for you.\"",
              "\"What you are owed: likely nothing automatic on this leg, since it was a separate ticket and counts as a no-show.\"",
              "\"What you are not owed: a free rebook or compensation from airline B. I will not pretend otherwise.\"",
              "\"If your first flight was the one that was delayed or cancelled, that airline may owe you something. Let me check its live status.\"",
              "\"This leg was non-refundable, so there is no refund coming back for the missed ticket. I want to be straight with you on that.\"",
              "\"Quickest workable option I can find is the [time] flight on [route]. I have it ready for you to book, near the going rate, a few percent under the OTAs at best.\"",
              "\"At the desk, say: 'I missed my onward flight on a separate ticket because my inbound was late. Can you put me on the next available flight, and what will it cost?'\"",
              "\"I cannot book this for you, that part is yours. When you are ready, tap to pay and I will track the ticket coming through.\"",
              "\"Your return flight is untouched and still confirmed. Do not cancel it.\""
            ]
          },
          {
            "label": "Failure modes",
            "items": [
              "Live status returns null or partial -> agent says 'I cannot confirm the flight's live status right now' and asks what the gate or airline told you, instead of a dead spinner.",
              "search_flights returns no workable replacement soon -> agent says so honestly, offers the next best later option plus the desk script as fallback, never an empty result.",
              "Chat stream drops in the airport -> silent resume on foreground heals an in-flight reply; if it cannot resume, history refetch reloads where you were. But a message sent while Pusher is disconnected is lost (no offline queue): agent may ask you to resend.",
              "Stale price or fare context on the new booking -> fare_unavailable or price_changed surfaces 'Your selected fare is no longer available. Please select a new fare.' before you pay.",
              "User expects an auto-rebook -> agent is explicit it has NO rebooking tool and the booking step is theirs; no false promise of an auto-fix (the amend button in chat has no backing tool either).",
              "Payment on the new booking fails (gateway decline or you dismiss checkout) -> 'Payment failed', 'Please try again'; tap Pay to retry, fresh order_id minted, no charge lost. Cashfree dismiss waits a 5s grace before treating as failed.",
              "New booking payment captured but ticketing fails -> ticket_status='failed', BookingStatus='ticketing_failed'; agent surfaces the failure rather than implying you are confirmed.",
              "No-show refund expected but fare is non-refundable -> agent states there is no refund for the missed ticket, rather than implying money is coming back.",
              "ui_cancel_booking initiated on the missed leg but no result page exists (real gap: no refund-status tracking) -> agent sets expectations that confirmation and any refund are handled out of band."
            ]
          },
          {
            "label": "Honesty rails",
            "items": [
              "All status and outcome strings here are verbatim from the shipped app: 'Fetching your tickets...', 'Payment failed', 'Please try again', 'PNR copied to clipboard', 'Your selected fare is no longer available. Please select a new fare.', 'Cancel Booking initiated for flights'. THINKING_TEXTS verbatim: 'On it...', 'Looking into it...', 'One moment...'.",
              "Any 'what you are owed' rights language is composed by the agent from reasoning and is explicitly NOT backed by a DGCA or EU261 calculator in code (real gap)."
            ]
          },
          {
            "label": "If it is a group / multi-PNR booking",
            "items": [
              "This moment IS the multi-PNR case: the two legs already live as separate objects with distinct supplier_ids and PNRs, which is exactly why no airline is liable end to end. There is no PNR stitching and no through-passenger record (real gap).",
              "With multiple passengers, replacement second-leg search must cover everyone; agent confirms passenger count and that all travellers missed the same leg before searching. Infants are excluded from ancillary selection on the new booking.",
              "Each new booking runs its own create-booking + payment + per-leg ticket_status flow; ticketing is independent per flight, so one passenger can issue while another fails (ticket_status='failed' shows 'Fetching your tickets...' until resolved); the agent surfaces partial outcomes, not an all-or-nothing state.",
              "The desk script shifts to plural ('we missed our onward flight on a separate ticket') and the agent notes the airline may not seat the whole party on the same next flight.",
              "Return-leg booking(s) for the group stay untouched and confirmed; agent warns against cancelling any of them.",
              "Real gap: no PNR stitching, no through-passenger record, no group or bulk round-trip rebooking; every leg and traveller is a separate object, and the agent is honest that it is coordinating, not stitching."
            ]
          }
        ],
        "divider": true
      },
      {
        "h": "Trouble at the airport",
        "group": "During the trip",
        "tldr": "When a delay, gate change, or lost bag hits at the airport, the agent pulls live status on demand and lays out the facts, but it cannot rebook, file a claim, or alert you first. The honest job is doing all the legwork and handing off cleanly.",
        "p": [
          "This is the moment the traveller is most stressed and least patient, standing in a terminal with a problem they did not cause. The governing principle: be maximally warm and do all the legwork (fetch, explain, surface the airline channel), but never pretend to powers the app does not have. Away is passive here by design, it does not watch flights in the background, so the agent must be upfront that it is reacting to a question, not monitoring. Honesty about what Away cannot do at the airport is the whole job."
        ],
        "spec": [
          {
            "label": "States",
            "items": [
              "Booking is BookingStatus='confirmed' with flights[].ticket_status='issued' and a PNR present, so the trip is live (grounded: bookingDetailsTypes.ts). PaymentPhase derives to 'confirmed' (grounded: bookingPhase.ts).",
              "FlightStatus.status live badge: 'Scheduled' | 'On Time' | 'Arrived' | etc, populated ONLY when the booking-details GET is fired with include_flight_info=true (grounded: flightListing/types.ts). No fetch means no badge; the data lives on flight_info[], not on the immutable booked segments[].",
              "FlightStatus delay fields active: departure_delay_minutes / arrival_delay_minutes (can be negative for early), cancelled (bool), diverted (bool).",
              "FlightStatus.progress_percent (0 to 100 for mid-air flights) and the Flight Plan block (filed_airspeed_knots, filed_altitude_hundreds_ft, filed_ete_seconds) render only if present (grounded: flightListing/types.ts).",
              "Gate / terminal / baggage state: FlightStatus.departure_gate, arrival_gate, departure_terminal, arrival_terminal, baggage_claim (carousel, set post-landing). Any can be null if the airline has not assigned yet.",
              "check_in.status cycles not_open -> open -> closed with web_opens_at / web_closes_at; gate-side this is usually closed, and the agent should say so rather than offer a dead check-in button (grounded: checkin-predeparture).",
              "Multi-segment: FlightInfoSection renders a tab per segment_index, each with its own live status, history breakdown, and origin_weather / destination_weather (grounded: schedule-change-disruption notes).",
              "Concierge thread state for this booking: resetChat(flow:'concierge', flowId:bookingId); ChatStatus cycles submitted -> streaming -> ready; thread_id format userId:concierge:bookingId (grounded: conciergePage, concierge-agent-surface).",
              "Polling cadence: useBookBookingDetailsById polls every 10s if created_at < 1 hour old, else 60s; this refreshes status but is passive (user must be on the screen). At airport time the booking is old, so 60s is the effective cadence.",
              "PusherConnectionStatus CONNECTED | DISCONNECTED governs whether chat and agent-progress events flow; terminal Wi-Fi flaps put this in DISCONNECTED with exponential backoff to 30s, max 8 attempts (grounded: concierge-agent-surface).",
              "Terminal booking states still reachable: BookingStatus='cancelled' or 'ticketing_failed' both derive PaymentPhase='failed' and STOP polling (grounded). is_expired / 'expired' also stop polling. The agent must not show stale live data on a closed booking.",
              "SPECULATIVE: there is NO disruption-severity state, NO compensation-eligibility state, NO rebooking state, NO schedule-change-monitoring state, NO equipment-swap or cabin-downgrade flag. The app has no enum for 'flight cancelled by airline -> needs rebook'."
            ]
          },
          {
            "label": "Edge cases",
            "items": [
              "Flight delayed (departure_delay_minutes > 0) -> agent fetches live status via ui_request_flight_details and reports the delay plus the on-time history bucket; it does NOT push an alert first (grounded: agent fetches live status on 'my flight is delayed').",
              "Gate change -> the live FlightStatus.departure_gate value simply updates on the next on-demand fetch; the badge/grid shows the new gate. There is no diff or 'gate changed' callout (SPECULATIVE: no gate-change notification).",
              "Terminal change between connecting segments -> LayoutDetails compares this segment's arrival_terminal to the next segment's departure_terminal and renders a TerminalChange warning; agent can call this out for a tight connection (grounded: checkin-predeparture, LayoutDetails.tsx).",
              "Live status fetched but partial (mid-air, no real-time feed) -> status may be null or fields missing; FlightInfoSection degrades to basic flight details + passengers + check-in, history breakdown renders only if history[] length > 0 (grounded).",
              "Baggage claim before landing -> baggage_claim is null until set post-landing; agent can only say it is not assigned yet. SPECULATIVE: there is NO lost/delayed-baggage claim workflow at all, the agent hands off to the airline.",
              "Flight cancelled by airline (FlightStatus.cancelled=true) -> app shows the cancelled live state but has NO rebooking tool; agent can run cancel_booking on the Away booking and/or use search_flights in chat to help start a fresh booking, but cannot auto-rebook (grounded: 'No rebooking flow').",
              "Denied boarding / overbooking -> SPECULATIVE: not modelled. No involuntary-denied-boarding flag, no compensation flow. Agent can only explain and point to the airline desk.",
              "Equipment swap or involuntary cabin downgrade -> SPECULATIVE: FlightStatus has no equipment-swap or cabin_downgrade flag; the app cannot detect or surface it (grounded gap).",
              "Weather or strike disruption -> surfaces only as the live status badge / delay minutes if the feed reflects it; agent can mention origin_weather / destination_weather from flight_info[n] to set expectations (grounded). No strike-specific handling.",
              "Diverted (FlightStatus.diverted=true) -> flag shown in live status and counted in history breakdown; no diversion-specific guidance beyond surfacing the fact.",
              "Multi-segment with mixed statuses -> user switches segment tabs; each shows its own delay/gate (grounded).",
              "Missed connection -> SPECULATIVE: app does NOT compare layover_minutes vs delay, so it cannot warn of a missed connection before it happens (grounded gap).",
              "User is offline in the terminal -> chat messages sent while Pusher is disconnected are lost, no local draft saved (grounded gap); PNR and ticket need internet to refetch. On reconnect the silent stream resume heals the thread but does not resurrect the lost outbound message (grounded: concierge-agent-surface).",
              "Push notification tap from a killed app -> usePushNotifications routes data.screen='concierge' + booking_id to /postBookingDetails Chat tab; if booking_id is stale the agent should reload context, not answer with no booking scope (grounded)."
            ]
          },
          {
            "label": "What the agent shows",
            "items": [
              "Live status badge on the BookingCard (e.g. 'On Time', 'Arrived') once include_flight_info has been fetched.",
              "Live-status info grid: 'Gate Number', 'Boarding Time', terminal, and (post-landing) baggage claim carousel; progress_percent and a Flight Plan block for mid-air legs if present.",
              "On-time history hint: 'On time {N}% of the time' computed from FlightHistoryEntry[] for this flight number/route.",
              "Delay history breakdown bar chart (on-time <=15m, 15-30m, 30-45m, 45m+ late, plus cancelled/diverted counts).",
              "Segment tab bar when the itinerary has more than one segment.",
              "Copyable PNR strip ('PNR Number' label) with tap-to-copy and toast 'PNR copied to clipboard' so the user can give it at the airline desk.",
              "Check-in card if still pre-boarding and check_in.status='open': 'Check in' button opening airline_url in an in-app browser; when status='closed' it shows 'Closed, head to the counter about 90 min before departure' with no CTA (grounded: WebCheckInCard).",
              "Documents: ticket_pdf_url via the Documents tab ('View', 'Tickets to {destination}') so the user has the ticket at the counter (grounded: checkin-predeparture).",
              "Concierge composer pinned to this booking, plus quick-reply suggestion chips from the suggestions Pusher event (e.g. 'Check delay', 'Cancel flight', 'View receipt').",
              "SPECULATIVE additions a mature version would show but does NOT today: a 'Flight cancelled, here are alternatives' card, a baggage-claim file button, a compensation-eligibility readout, a proactive disruption banner on the Home upcoming-trip card (Home filters out cancelled/expired and shows no disruption card today)."
            ]
          },
          {
            "label": "What the agent does",
            "items": [
              "1. On the user asking (e.g. 'my flight is delayed'), call ui_request_flight_details to fetch live FlightStatus (passive, on-demand trigger, grounded). This is a fire-and-forget tool, so the client must not auto-send or loop after it (grounded: shouldAutoSendAfterToolCall).",
              "2. Read back the concrete facts: current status, delay minutes, current gate, boarding time, terminal.",
              "3. Add context from history: the on-time percentage and typical delay bucket for this flight number.",
              "4. If the user lacks context (e.g. which leg, or 'reschedule me' with no date), run ask_user_questions to clarify; the question card renders in the composer, the user taps an option or types, and the answer comes back as plain text (grounded: only the most recent card is interactive).",
              "5. Offer the actions it actually has: copy PNR, open airline check-in URL, view the ticket PDF, or (if the user wants out) initiate cancel_booking with selected flights/passengers.",
              "6. If rebooking is needed, run search_flights in chat to help start a NEW booking, making explicit this is a fresh search, not an automatic rebook.",
              "7. Hand off honestly to the airline counter/app for anything Away cannot do (baggage claim, denied-boarding compensation, involuntary rebooking, schedule-change waivers).",
              "8. Be upfront that Away is passive: it did not alert because it does not watch flights in the background; it can only pull status now and keep refreshing while the user is on the screen.",
              "NEVER: claim to have rebooked, claim to have filed a claim, claim a compensation amount, or imply it was monitoring the flight. The agent prepares and hands off; the person commits."
            ]
          },
          {
            "label": "Analysis parameters",
            "items": [
              "Live status fields: FlightStatus.status, departure_delay_minutes, arrival_delay_minutes, cancelled, diverted, progress_percent (the raw inputs it reports).",
              "On-time computation: bucketing of FlightHistoryEntry[] arrival_delay_minutes into <=15 / 15-30 / 30-45 / 45+ and counting cancelled/diverted, to produce the 'On time {N}%' figure.",
              "Gate/terminal source precedence: prefer segment.departure_terminal (supplier), fall back to flight_info[].status.departure_terminal (FlightAware) so the value is never needlessly null (grounded: LayoutDetails.tsx).",
              "Terminal-change detection across connecting segments: compares this segment's arrival terminal to the next segment's departure terminal, renders a TerminalChange warning (grounded).",
              "Refundability/changeability for 'should I cancel?': reads fare.refundable, fare.changeable (boolean | null, where null is treated as no change allowed), parsed_fare_rules.cancellation tiers (from_hours/to_hours/fee) to explain what cancelling would cost; note PG fee is non-refundable even on refundable fares (grounded: claims-rights-credits-recap).",
              "Polling recency: created_at age decides 10s vs 60s refresh.",
              "NOT computed (SPECULATIVE): disruption severity score, missed-connection risk (layover vs delay), denied-boarding compensation eligibility (DGCA/EU261), rebooking options, refund timeline/method after a cancel, per-passenger refund proration."
            ]
          },
          {
            "label": "Agent copy",
            "items": [
              "\"I pulled the live status: AI2982 is showing a 45 minute delay, now boarding from Gate 24, Terminal 3.\"",
              "\"On this route it leaves on time about 62% of the time, and when it's late it's usually under 30 minutes.\"",
              "\"Baggage claim isn't assigned yet, it'll show here once the flight lands.\"",
              "\"I can't file a baggage claim from here, that has to go through the airline's desk or app. I can pull up your PNR so it's ready to give them.\"",
              "\"PNR copied to clipboard.\"",
              "\"I can't rebook you onto another flight directly. I can cancel this booking and help you search fresh fares right now, but you'd commit to the new one yourself. Want me to start a search?\"",
              "\"That's an airline call on compensation, I can't process or promise an amount. Here's your PNR and flight details to take to the counter.\"",
              "\"I don't have a live feed for this leg right now, so I can only show the scheduled details. I'll keep refreshing while you're on this screen.\"",
              "\"I didn't ping you about this because I don't watch flights in the background yet. Here's the live status now, and I'll keep it fresh while you're here.\"",
              "\"Heads up: your connection lands and departs from different terminals, so leave time to move between them.\""
            ]
          },
          {
            "label": "Failure modes",
            "items": [
              "Live status fetch returns null/partial -> never a dead spinner: fall back to scheduled segment details + passengers + check-in, and say plainly 'I don't have a live feed right now' (grounded degrade path).",
              "Pusher disconnected in the terminal -> chat won't send and the message is lost (grounded gap). Honest recovery (SPECULATIVE): show a 'not connected, your message wasn't sent' state and let the user retry, rather than swallowing it.",
              "Stream drops mid-reply (backgrounded app, flaky Wi-Fi) -> gated silent resume (resumeStream with a 2s timeout, one armed auto-retry) heals the thread on foreground; partial assistant message is dropped before replay to avoid duplication (grounded: concierge-agent-surface).",
              "User expects a proactive alert that never came -> the app is passive; recovery is to be upfront ('I don't watch flights in the background yet, but here's the live status now') instead of implying it was monitoring.",
              "User asks to rebook and expects it done -> there is no rebooking tool; recovery is to offer cancel + fresh search_flights and state the limit, not to stall.",
              "baggage_claim/gate null for a long time -> say it's not assigned yet and offer to refetch, not an empty field.",
              "Booking already cancelled/ticketing_failed (BookingStatus terminal) -> polling has stopped and PaymentPhase='failed'; agent should explain the booking is closed and route to support/airline rather than show stale live data.",
              "Push notification tap from a killed app -> routes to /postBookingDetails Chat tab; if booking_id is stale the agent should reload context rather than answer with no booking scope.",
              "Check-in window closed at the gate -> WebCheckInCard shows 'closed' with no CTA; agent should not dangle a check-in action and instead point to the counter."
            ]
          },
          {
            "label": "If it is a group / multi-PNR booking",
            "items": [
              "Multi-passenger single PNR: live status and gate apply to everyone on the booking; the PNR strip and check-in are shared, so one fetch covers the group.",
              "Round trip (outbound + return in flights[], each with its own direction and ticket_status): the disrupted leg is fetched independently; the other leg's status is unaffected. Per-flight ticket_status is independent, so one leg can be 'issued' while the other 'failed'. Agent must be explicit about WHICH leg is delayed/cancelled.",
              "SPECULATIVE: there is no PNR-stitching or multi-PNR model, so if a self-transfer trip is booked as two separate airline records, Away cannot reason about misconnection liability or coordinate a rebook across both; it can only show each flight's own status (grounded gap: no same-PNR vs two-ticket flag).",
              "Partial-passenger action: cancel_booking lets the user select a subset of passengers (CancelBookingInput multi-select, 'Select All Passengers'), but there is no per-passenger refund/proration display, so the agent cannot quote what each traveller gets back (grounded gap).",
              "Bulk handling for a cancelled outbound that should also unwind the return is NOT modelled (listed product gap); agent must handle each leg as a separate decision and say so.",
              "Codeshare leg (FlightSegment.operated_by differs from marketing carrier) -> shown with an amber 'Codeshare' tag; agent should name the operating carrier so the user knows which desk to approach (grounded: booking-itinerary-model)."
            ]
          }
        ],
        "divider": true
      },
      {
        "h": "Pay-later, due mid-trip",
        "group": "During the trip",
        "tldr": "An Away Advance (pay-later) balance is coming due on a live trip; the app shows a deadline and a one-tap settle, but enforcement is server-side and the only honest risk is airline cancellation if it goes unpaid. The settle reuses the standard gateway and polling flow, so it inherits the same Cashfree-vs-Razorpay handling and the same overdue blind spot the real app has today.",
        "p": [
          "This is hard because money is owed mid-trip and the downside (airline cancellation) is real but invisible to the client; the governing principle is that the agent prepares and hands off the settle, the person commits the payment, and warmth rises as the deadline nears while no false urgency is invented. The honesty test: the app cannot see when the airline will act, so it must not imply a precise client-side cutoff, must not claim it will auto-settle, and must keep a recoverable surface alive once the card silently disappears at overdue."
        ],
        "spec": [
          {
            "label": "States",
            "items": [
              "PaymentPhase = away_advance_due: booking.status='confirmed', payment_type='away_advance', away_advance_status='awaiting_payment'. Live due state; AwayPayDueCard + HH MM countdown render.",
              "away_advance_status='overdue' (server-set after payment_due_at passes): derivePaymentPhase still returns away_advance_due, but the AwayPayDueCard render gate requires away_advance_status='awaiting_payment', so the card stops showing. SPECULATIVE gap (confirmed real): no overdue escalation UI; the due card just disappears.",
              "Settle in flight: VerifyPollStatus='polling' (2s interval, up to 30s). Razorpay SDK callback is terminal, no poll; Cashfree onVerify forces the mandatory poll.",
              "Settle terminal: captured -> ['booking-details-by-id', bookingId] invalidated and refetched, moves to away_advance_settled (PaymentPhase) or issuing_ticket if not yet ticketed; failed -> back to due card, retry allowed; timeout -> 'Still processing' state, check My Bookings.",
              "away_advance_settled: status='confirmed' + away_advance_status='settled'. Due card gone, balance cleared.",
              "Excluded state: status='ticketing_failed' even with away_advance_status='awaiting_payment' -> AwayPayDueCard suppressed (do not ask a user to settle a booking that failed ticketing; route to support).",
              "Excluded state: is_expired=true or status='expired' -> derivePaymentPhase returns 'expired' (checked before away_advance), booking read-only, due card not shown. In practice an away_advance booking is already 'confirmed', so this mainly guards stale/edge data.",
              "Wallet top-up sub-state (speculative coupling): InsufficientWalletBalanceBottomSheet runs its own credit-purchase poll (usePurchaseCredits, 2.5s up to 30s, pending|captured|failed) before the user can return to settle."
            ]
          },
          {
            "label": "Edge cases",
            "items": [
              "payment_due_at already passed (server flips to overdue) -> client has no timer or escalation; AwayPayDueCard simply stops rendering. Honest recovery: agent surfaces it in chat / My Bookings and offers to retry settle while the booking is still 'confirmed' (SPECULATIVE: this surfacing is a design proposal, not in code).",
              "User dismisses Cashfree checkout without choosing a method -> onVerify fires, VerifyPaymentResponse.status='created', poll waits CREATED_GRACE_MS (5s) for webhook; if still 'created', treated as failed, not a false success. User taps Pay to retry (fresh order_id).",
              "Cashfree cancel event (dropped / user_exit / user_close / cancel) -> promise rejected with 'Payment cancelled'; returns to due card, no charge.",
              "Settle poll exceeds 30s, still pending -> status='timeout', show 'Still processing' with Track in My Bookings; never an infinite spinner. SPECULATIVE gap: payment may actually settle later via webhook, so the next poll/refetch is what flips it.",
              "Network error mid-poll -> catch blocks keep polling until 30s timeout, only surface error at timeout. SPECULATIVE gap: no backoff or jitter (thundering-herd risk if many users retry at once).",
              "Insufficient Away Cash to cover the credited portion -> InsufficientWalletBalanceBottomSheet lets user top up via a fresh gateway session, then settle. SPECULATIVE gap: recomputed final total after top-up is silent.",
              "Duplicate Pay taps -> each tap mints a fresh gateway order_id, old poll cancelled, Cashfree rejects re-pay of stale order server-side. SPECULATIVE gap: no explicit API-level duplicate-charge guard; relies on gateway idempotency.",
              "Captured but booking not yet confirmed (ticketing races / seat lock / inventory) -> per-flight ticket_status drives 'Fetching your tickets...'; settle is done even though ticketing is still async. SPECULATIVE gap: no recovery if capture succeeds but confirmation never lands.",
              "App backgrounded mid-poll -> back/swipe locks hold during 'polling'; on foreground the poll resumes or times out gracefully (no auto-charge on return).",
              "Strict Mode / concurrent effect re-fire -> handledTerminalRef ensures the success toast and navigation fire once per status change.",
              "Booking expired or cancelled -> away_advance_due no longer applies; due card not shown.",
              "Email/phone needed by settle endpoint missing -> settle body requires email/phone/payment_mode; absent contact info would block the POST (SPECULATIVE: prefill from profile, not verified in explored code)."
            ]
          },
          {
            "label": "What the agent shows",
            "items": [
              "AwayPayDueCard with header 'Payment Due' and 'by {formatDeadline(payment_due_at)}'.",
              "Countdown on the home upcoming-trip card: 'Booked with away credits' / 'Pay now to avoid cancellation' with a 'Pay now' button and a '{hours}H {minutes}M LEFT' timer (button routes to booking details, it does not charge inline).",
              "Bill summary rows: 'Amount', 'Away Cash' (credits applied), 'Payment gateway charge ({convenienceFeeRate}%)', 'Total Amount'.",
              "'Payment Method' selector (pre-filled from preferredPaymentStore for this booking) and a primary 'Pay ₹{totalAmount}' button (shows 'Please wait...' while initiating).",
              "During settle: polling screen 'Confirming your payment... This usually takes a few seconds. Don't close the app.' with Android back lock and iOS swipe lock.",
              "On timeout: 'Still processing' + 'We'll notify you once it's confirmed. You can check the status in My Bookings.' + 'Track in My Bookings'.",
              "On failure: 'Payment failed' / 'Please try again.' returning to the due card.",
              "Explicit note that PG fee is non-refundable even on cancellable fares (consistent with FinalPaymentCalculationCard / FareDetailsBottomSheet copy).",
              "If any flight still ticketing after settle: 'Fetching your tickets...' / 'We'll notify you'."
            ]
          },
          {
            "label": "What the agent does",
            "items": [
              "Detect away_advance_due on booking load and render the due card + countdown (surfacing is on open; no proactive push exists). Poll booking details at the faster BNPL cadence (pollIntervalMs=5s) so settled state reflects quickly.",
              "Pre-select the saved payment method (preferredPaymentStore, bookingId-scoped) so settle is one tap.",
              "On Pay: POST /bookings/{id}/away-pay/settle with email/phone/payment_mode, receive PaymentGateway (razorpay or cashfree), open the same checkout the standard flow uses.",
              "Razorpay: treat SDK callback as terminal; on success route to post-booking with a success toast. Cashfree: route to the mandatory polling screen, poll POST /payments/verify every 2s up to 30s.",
              "On capture: clear floating-chat state, invalidate ['booking-details-by-id', bookingId] to refetch, move UI to away_advance_settled / issuing_ticket.",
              "On failure: toast the gateway message, return to the due card, leave retry open (fresh order each attempt). SPECULATIVE gap: decline codes are not parsed into specific guidance (e.g. insufficient funds vs expired card).",
              "Hand off, do not auto-charge: the person taps Pay and commits; the agent only prepares the order and the method.",
              "Block floating-chat expansion during the checkout/poll window."
            ]
          },
          {
            "label": "Analysis parameters",
            "items": [
              "Render gate for the due card: status='confirmed' AND payment_type='away_advance' AND away_advance_status='awaiting_payment' AND status != 'ticketing_failed'.",
              "Phase precedence: is_expired/status='expired' is evaluated before away_advance in derivePaymentPhase, so an expired booking never shows as due.",
              "Time left = payment_due_at minus now, formatted as HH MM (display only; no client-side enforcement of the deadline).",
              "totalAmount = ceil(grand_total + convenienceFee - creditsApplied), where convenienceFee = ceil(((grand_total - creditsApplied) * rate) / 100). PG fee is charged on the credited (post-Away-Cash) subtotal.",
              "Whether Away Cash balance covers credits_applied (else trigger top-up sheet).",
              "Gateway choice (razorpay vs cashfree) returned per-transaction by the settle endpoint, deciding terminal-vs-poll handling.",
              "Whether any flight ticket_status is still pending/ticketing/failed (drives 'Fetching your tickets...' after settle).",
              "Polling cadence in effect: BNPL override 5s for booking-details refetch; 2s for /payments/verify; vs base 10s/60s by booking recency."
            ]
          },
          {
            "label": "Agent copy",
            "items": [
              "'Booked with away credits. Pay now to avoid cancellation.'",
              "'2H 14M LEFT' (the HH MM countdown, value illustrative).",
              "'Payment Due, by 22 Jun 2026, 6:30 PM' (deadline value illustrative).",
              "'Away Cash applied. Payment gateway charge (2%) is added and is non-refundable, even on cancellable fares.'",
              "'Pay ₹14,210' (value illustrative).",
              "'Confirming your payment... This usually takes a few seconds. Don\\'t close the app.'",
              "'Still processing. We\\'ll notify you once it\\'s confirmed. You can check the status in My Bookings.'",
              "'Payment failed. Please try again.' (returns to the due card; tap Pay to retry)",
              "On overdue (SPECULATIVE surfacing): 'Your pay-later balance is past due. Settle now to keep this booking from being cancelled by the airline.' (honest, not invented urgency; only the airline can cancel, and the app cannot see when)."
            ]
          },
          {
            "label": "Failure modes",
            "items": [
              "Deadline passes and server marks overdue -> card silently vanishes; user is left unsure. Honest fix (SPECULATIVE): keep a 'past due, settle now' surface in My Bookings / chat while status is still 'confirmed', instead of going blank.",
              "Cashfree webhook never lands in 30s -> status='timeout'; payment may actually settle later. Recovery: 'Still processing' + Track in My Bookings, never a frozen spinner; rely on the next poll/refetch to flip to settled. SPECULATIVE gap: no webhook-failure fallback.",
              "Settle captured but booking confirmation lags (seat lock / inventory) -> show 'Fetching your tickets... We\\'ll notify you' rather than a false 'all done'. SPECULATIVE gap: no explicit recovery if confirmation never completes after a real charge.",
              "Gateway decline / user abort -> toast the real message, return to due card, retry mints a fresh order_id. SPECULATIVE gap: no API-level duplicate-charge guard; relies on gateway idempotency; decline reasons not parsed.",
              "Wallet top-up to cover credits succeeds but final total silently recomputes -> user may see a different 'Pay' figure than expected (SPECULATIVE gap, real).",
              "App backgrounded mid-poll -> back/swipe locks hold during 'polling'; on return the poll resumes or times out gracefully.",
              "No client-side overdue timer means the app cannot warn before the airline acts; the only honest message is that overdue risks airline cancellation, and the remedy is to settle.",
              "PG fee non-refundable even if a later platform refund occurs -> UI states non-refundable, but there is no modelled PG-fee reversal or credit issuance path (SPECULATIVE gap, real)."
            ]
          },
          {
            "label": "If it is a group / multi-PNR booking",
            "items": [
              "Away Advance is a single booking-level balance (one payment_due_at, one grand_total). One settle covers the whole booking, not per passenger or per PNR.",
              "Round-trip / multi-flight: ticketing is per-flight (ticket_status independent), so after settle one leg can show 'issued' while another is still 'Fetching your tickets...'; the due balance is still cleared once.",
              "If any flight is 'ticketing_failed', the due card is suppressed for the whole booking even if a balance is owed (do not collect on a failed ticket); route the traveller to chat/support instead.",
              "No partial settle and no per-passenger proration in code; the person settles the full amount or the booking stays at risk of airline cancellation.",
              "No model for separate-PNR self-transfer itineraries: both flights live in flights[] with separate ids but the balance and settle are still one booking-level action; the app does not flag stitched-vs-single-PNR risk (SPECULATIVE gap, real)."
            ]
          }
        ],
        "divider": true
      },
      {
        "h": "Home, owed more than I knew",
        "group": "Post trip",
        "tldr": "The trip ends on a recap that makes the agent's quiet competence visible, then does the one move no OTA makes: tells you about money you are owed and drafts the claim.",
        "p": [
          "This is the peak-end, and I designed it on a debt. Across the trip the agent spends goodwill in the hard moments: it interrupts you to flag a fare trap, it wakes you at 2am when a connection breaks. The good moment at the end is where it pays that goodwill back, by making the work it did legible. The recap plays the trip back as four things the traveller actually chose: time saved, money saved (Rs 11,200 on this one), the comfort they picked (lie-flat twice), and the flexibility they bought (one free change). Not a brag reel, a receipt. A great human agent earns the next trip by being undeniably worth it on this one; the recap is that argument, made in numbers the person can check.",
          "Then the single best delight, the move no OTA makes: the agent tells you about money you did not know you were owed, and has already drafted the claim. \"your Frankfurt flight was delayed six hours, you're owed about six hundred euros, most people never claim it. i've drafted the EU261 claim.\" Most travellers never file, because they never know the right exists and the airline has no reason to tell them. This is not a guess; it is a researched rights engine that encodes obligations by jurisdiction and looks up the disruption that already happened on your trip. Knowing your rights in the moment is the clearest version of Away knowing the way, and it is the law of doing the whole job a great human does and then exceeding it, made concrete.",
          "The engine is honest about where the line falls, which matters more than the win. It does not promise cash where none is owed; it routes each case to the real remedy. And one house rule keeps the whole section trustworthy: charm and clarity never share a sentence. The agent can be loud and pleased on your behalf, but the number, the eligibility, and the claim are stated plain, because this is still money. It prepares the claim and hands it to you; you file it. The agent never takes the wheel, even on the good news."
        ],
        "ul": [
          "EU long delay or cancellation (EU261): a 3-hour-plus arrival delay or cancellation on a covered flight owes fixed cash, EUR 250 / 400 / 600 by distance. The Frankfurt six-hour delay is exactly this case, so the agent surfaces the around 600 euros and drafts the claim rather than leaving it to lapse.",
          "India, force majeure cancellation: even when weather or a strike waives the airline's cash, refund, rerouting, and duty of care (meals, hotel) are still owed. The agent never tells you weather wiped out your rights; it claims the care and the refund that survive.",
          "India, same-ticket missed connection the airline caused: treated like a short-notice cancellation, so a fixed Rs 5,000 / 7,500 / 10,000 by block time plus an alternate flight or refund. The agent files it; most people do not know this cash exists.",
          "US significant change (DOT automatic-refund regime): no general delay cash, but a 3-hour-plus domestic or 6-hour-plus international schedule change, an added connection, or a downgrade triggers an automatic refund to the original payment method. The agent claims the refund and refuses the voucher you would otherwise be nudged toward.",
          "Separate-ticket self-transfer, the gap: when you self-connected across two tickets, no single airline is obligated to protect the link. The agent says so plainly, points to insurance as the real backstop, and does not manufacture a claim that does not exist. The honesty is the trust."
        ],
        "fig": "awRecap",
        "figure": "Home from Bali: the trip played back as a receipt, then the agent surfaces the EU261 cash you never knew you were owed and hands you the drafted claim.",
        "divider": true
      },
      {
        "h": "Outcomes",
        "tldr": "v1 has shipped and is growing: in its first week, invite-only, the agent was already doing around ₹50K in bookings a day, and climbing.",
        "p": [
          "The honest headline is that it shipped, and it is working. In its first week, live to an invite-only group, the agent was doing around ₹50K in bookings a day, and the number has kept climbing since. That is the bet paying off: people are handing a real, end-to-end booking to the agent, not just searching with it. The earlier negotiate experiment, about one in three users negotiating rather than booking the listed price across roughly 1,000 users and 200 bookings, is the baseline this overhaul built on."
        ],
        "ul": [
          "Around ₹50K in bookings a day in the first week, invite-only, and growing",
          "[A 'caught before it hurt' signal: passport, self-transfer, and compensation catches, to confirm]",
          "[Repeat use: do people come back for the next trip, to confirm]"
        ]
      },
      {
        "h": "What I would revisit",
        "tldr": "The line I watch hardest is autonomy versus the co-pilot rule, and the honest tension in an agent that advises on your rights without taking the action.",
        "p": [
          "The hardest line in the whole design is how much the agent does for you versus how much it leaves in your hands. Never take the wheel is the right constraint for trust, but every time the agent stops at 'here is the smart move, you take it from there', there is a real cost in the moment: a stranded traveller would often rather it just fixed it. Holding that line honestly, doing everything up to the commit and not past it, is the thing I am least finished thinking about, and where I would test hardest with real travellers in a real disruption.",
          "The other is the rights engine. Encoding passenger rights is the product's clearest moat, but the rules change and vary by country, and an agent that confidently tells you what you are owed had better be right. I scoped it to the regimes Indian travellers hit most and flagged the ones I could not yet verify rather than guess. Keeping that current, and never letting confidence outrun the source, is an ongoing discipline, not a one-time research task.",
          "The negotiation also has to stay honest with itself. The whole bet is built on beating the price, yet in the real data the negotiated edge is often a few percent and sometimes nothing, so the design has to make the honest no-win, 'this is already the best price', feel like as much of a win as a saving, or the product tips into the very OTA theatre it was built to oppose. Keeping the saving real and the no-win loud is a discipline, not a feature.",
          "And there are three places my confidence outruns my evidence, where I would put real travellers ahead of my own taste: a results list that re-sorts live as you nudge the lens, elegant on a slide and probably disorienting in the hand when the row you were about to tap moves; the agent parsing a messy all-at-once brief with no 'did I get this right?' step, where one silently missed constraint, a transit visa, a carrier to avoid, can strand a family; and the agent pairing your round trip and managing your pin for you, the right default until it is the wrong one and you wanted the control. Each is a test I would rather run than win an argument about."
        ]
      }
    ],
    "todo": [
      "This is the human-first cut of the Away agent case study (companion to /work/away-agent); decide which one leads the portfolio, or whether this replaces it.",
      "Drop in the three zero-state header screens (the home by time of day and by how well it knows you); currently filled with the time-of-day greeting screens as a stand-in.",
      "Build the zero-state options-framework diagram (the precedence ladder + posture).",
      "Replace the remaining figure placeholders with the real animated screens; reuse the away-agent figure set.",
      "Confirm role, exact title, and dates.",
      "Add one test-driven change (before, insight, after)."
    ]
  },
  "occasion-buying": {
    accent: "#9826C9",
    eyebrow: "Zepto · Theme & occasion buying · Case study",
    title: "Rebuilding the aisle a search box deleted",
    meta: "Product Designer · Zepto Ads · 2026",
    cover: "Occasion",
    lead:
      "I led the interaction design for Theme & occasion buying, the feature that gives Zepto's search-only store the discovery of a physical one. Every quick-commerce app kept the warehouse and threw away the showroom: you search one item, add it, and leave, and the basket you would have built walking the aisles never forms. The feature rebuilds that aisle as a dynamic, per-user layout across three ad surfaces, reading the occasion you are shopping (movie night, the lunchbox, guests coming) from signals the session already carries, then pairing the right adjacent products, without ever slowing the shopper who came for one thing. The goal is to grow GSV while giving brands big and small a more democratic, occasion-relevant way to reach shoppers. One surface, a paired add-two card, is live; the other two are green-lit for an A/B test against a modelled 20% lift on adjacent categories that the test exists to prove or kill.",
    sections: [
      {
        h: "The central question",
        tldr: "How do you give a search-only store the discovery of a real one, without slowing down the search that makes it fast?",
        p: [
          "A physical store is a machine for adjacency: chips lead to dips, shampoo sits beside conditioner, and roughly a third of a grocery basket was never on the list. A search box deletes that machinery; it returns the one shelf you named and nothing of what sits beside it. So every decision traced back to a single question: how do you rebuild the aisle, the occasion and the basket it builds, on top of a search box, without ever taxing the decisive shopper who came for exactly one thing? Discovery for the open shopper, stillness for the decisive one. That tension is the spine of the design.",
        ],
      },
      {
        h: "Context & problem",
        tldr: "Adjacency is how the rest of retail prints money, and it was the line item Zepto did not bill, leaving demand and ad inventory on the floor every session.",
        p: [
          "Zepto Ads was monetising a single aisle: the search result. But adjacency is where retail earns. Recommendations drive up to 35% of Amazon's revenue, cross-selling lifts sales around 20%, and combos already contribute 12 to 15% of order value in promo windows on a direct competitor. The academic record is blunt too: the same shopper builds a narrower basket, with measurably fewer impulse buys, in an app than in a store. The interface itself was shrinking the basket to the size of the user's vocabulary, a business problem (unbilled inventory and un-built baskets), a product problem (search can only return demand you already know how to name), and a brand problem at once.",
        ],
        ul: [
          "Users: every shopper, but in five intent-states a single search box treats identically",
          "Business: grow GSV by billing the cross-sell and occasion inventory that did not exist yet, with committed brand budget already waiting on it",
          "Constraint: build on a live, revenue-generating platform, and never tax the decisive single-item shopper",
        ],
      },
      {
        h: "My role",
        tldr: "I led the interaction design for the feature end to end, from the business framing down to the guardrails and empty states.",
        p: [
          "I led the interaction design across all three surfaces and the model that feeds them (internally the project is Zepto cross-sell). The first surface shipped; the other two I designed to a green-lit, testable spec. The work was less about drawing screens than about deciding what the feature is allowed to do: the occasion taxonomy, the confidence rules, and the moments where the right design is to show nothing.",
        ],
      },
      {
        h: "Designed backward: business, product, user, brand",
        tldr: "I did not start from a widget. I started from the business case, derived the product bet, grounded it in real user intent-states, and validated it against brand demand, in that order.",
        p: [
          "The feature only earns its place if the logic runs backward from value, not forward from an idea. Business first: there is committed, net-new brand budget (25 to 30% of aligned ad spend from a set of brands) with no surface to spend it on, and because the ads-to-sales ratio is fixed, every sale the feature creates compounds straight into ad revenue and GSV.",
          "Product next: the only thing that unlocks that budget is inventory search cannot produce, impressions for the adjacent and the unsearched, so the bet is an occasion-aware adjacency layer, not a better ranker. User then: that layer maps to how people actually shop, by occasion, not category. Brand last, and this is what converged the design: understanding not just that brands wanted it, but why. Two big names, Beardo and Philips, had independently asked for the same pairing, grooming cream with trimmers, which proved the demand was real. The sharper signal came from the smaller brands. A brand known for protein wants to sell BCAA, a tougher adjacent category it cannot crack by outbidding the giants on the search keyword, because that economics only works at scale. A surface that shows what pairs with what you already buy hands that brand a democratic way in: the shopper who buys protein discovers BCAA, and the brand that makes it, exactly when it is relevant. Seeing the feature serve the challenger as much as the incumbent, and the shopper most of all (no hunting, the right thing surfaced naturally), is what settled the design on a pairs-with-your-basket surface rather than one more paid slot.",
        ],
        split: "media",
        figure:
          "Caption: the backward chain on one page, business (committed, compounding budget) to product (adjacency, not ranking) to user (occasion, not category) to brand (independent demand converging on the same pairing). [Build as the backward-chain diagram; spec in the figure-specs note.]",
        divider: true,
      },
      {
        h: "The user, mapped as intent-states not personas",
        tldr: "The same person shops in five modes a week, and a single search box serves exactly one of them well.",
        p: [
          "Personas were the wrong tool, because the same human shops completely differently within a single day. The unit that matters is the intent-state at the moment of the session, and naming the five made the gaps obvious. Search is a competent tool for one of them and a partial tool for none of the rest. That is the size of the miss, and it is what told me the feature could not be one component; it had to meet different states at different points in the journey.",
        ],
        ul: [
          "The Restocker knows exactly what they want, types it, wants out. Search already serves them; the design job is to not get in their way.",
          "The Mission Shopper is shopping an occasion they can name (guests, movie night, the lunchbox) but is forced to assemble it one search at a time. This is who search fails most expensively.",
          "The Wanderer is browsing, open, often late at night, with intent but no query, so search literally cannot serve them.",
          "The Forgetter wanted three things and will remember the fourth only when they see it, the exact job the end-cap was invented for.",
          "The Emergency needs one thing fast, in a context where the adjacent buy is often bigger than the trigger one.",
        ],
      },
      {
        h: "The engine: inferring the occasion",
        tldr: "Four signals the session already carries, collapsed into a confidence-scored occasion, with the confidence to decline.",
        p: [
          "The solution is only as good as the model under it. Every session already carries four cheap signals: time (hour, day, and the calendar layer of festival, match day, payday), location (home, office, travel, weather), search and browse intent (the query, its category, and whether the session is decisive or aimless), and cart composition, the strongest and most under-used signal of all. Chips plus cola at 11pm at home is not snacks plus beverages; it is a movie night. I shaped those into a Zepto-native occasion taxonomy, breakfast, tonight's dinner, movie or match night, guests, gifting and festival, late-night craving, grooming, baby and health, on-the-go, each a named moment the surface can dress itself in. The crucial decision was not what the model shows but when it stays quiet: the engine carries a confidence floor and a set of refusals, because its credibility dies the first time it pairs condolence flowers with party poppers.",
        ],
        fig: "decisionEngine",
        figure:
          "The decision as a mind map: signals to occasion to surface to basket, built one column at a time. The options not chosen, including none, stay on screen, so the figure shows the reasoning, not just the result.",
        divider: true,
      },
      {
        h: "Surface 1: the paired card, and its states",
        tldr: "The live surface: one high-confidence pair at the top of search, with a single add-two action, designed for restraint over reach.",
        p: [
          "The first surface is live. It fires at the top of search results with one high-confidence, functional pair, the conditioner to your shampoo, behind a single add-two control that turns a one-item basket into a sensible two-item one in a tap. Three rules earned its place on the fast path: it never blocks the searched item, which stays the hero; it carries a one-line reason (Goes with shampoo) that does almost all the trust work, signalling a shopkeeper rather than a banner; and it holds to exactly one pair, because a second turns help into noise. The states I specified: the default pair, the pressed-and-adding state, the add-two confirmation (the first real micro-delight), the already-in-cart suppression, and the below-confidence state where the card simply does not render.",
        ],
        split: "media",
        figure:
          "Caption: the paired card across its states, default pair with reason string, mid-add, the add-two confirmation, and the suppressed state when the pair is already in the cart. [Export from the live build plus the spec frames.]",
        divider: true,
      },
      {
        h: "Surface 2: the occasion widget, the end-cap rebuilt",
        tldr: "The most store-like surface: a named, dressed module mid-feed with horizontal category tabs, where the basket assembles as you shop the occasion.",
        p: [
          "The second surface is the end-cap, and the biggest design opportunity. It fires mid-feed for a Mission Shopper or a Wanderer, and unlike competitors' hand-authored themed banners it is predicted live: the same feed slot can read movie night for one user and baby's morning for another at the same instant. The module names the occasion in its header (Movie night, sorted?) and lays adjacent categories out as horizontal tabs, Snacks, Drinks, Dessert, Dips, each a mini-aisle. The signature interaction is that tapping across tabs visibly assembles a basket: you are shopping an occasion, not hunting SKUs. I specified the full state set most teams skip: the named high-confidence module, a generic fallback header at medium confidence, and the honest below-threshold state where the slot does not render at all. An empty, truthful feed beats a confident wrong guess every time.",
        ],
        split: "media",
        figure:
          "Caption: the occasion widget, the named module with category tabs, the basket assembling as tabs are tapped, and the low-confidence state where the slot stays empty. [Build the three states as animated SVG; the basket-build is the hero.]",
        divider: true,
      },
      {
        h: "Surface 3: the post-cart tabs, the checkout aisle",
        tldr: "After add-to-cart, themed tabs replace the flat product rail, reframing the last add as completing the set, not buying more.",
        p: [
          "The third surface fires the instant something enters the cart, the digital checkout aisle. Today that slot is a flat product rail; I replaced it with themed tabs and, more importantly, reframed the words. After ice cream goes in, the prompt is not more products, it is Make it a movie night? After paneer, Everything for the curry? The user has already committed, so one more relevant add reads as completeness rather than pressure, but only if it is relevant, which is why this surface has the hardest guardrails of the three. The states matter most here because this is post-commitment, where a pushy or wrong suggestion does the most brand damage: the themed-complete state, the single-best-pair fallback, and a clean no-suggestion state when nothing genuinely fits.",
        ],
        figure:
          "Caption: the post-cart widget, themed completion tabs after add-to-cart, the single-pair fallback, and the empty state when nothing fits. [Add screens / spec frames.]",
      },
      {
        h: "Designing the states nobody screenshots",
        tldr: "The feature's credibility lives in its refusals: the guardrails, the sensitive categories, and the deliberately still path for the decisive shopper.",
        p: [
          "The depth of this work is not in the happy path; it is in the moments the model is told to hold back. A personal shopper you do not trust is just a pest, so I spent the most time on the states a portfolio screenshot never shows. Sensitive categories, health, baby, contraception, bereavement-adjacent, never get occasion theming or jokey copy; some aisles are quiet on purpose. The engine never cross-sells what is already in the cart and never pairs two substitutes. And the single most important rule: if the session reads as decisive single-item intent, the surfaces go still, one functional pair at most, no theme, no motion. The fastest path stays the fastest path. Treating restraint as the primary feature, not an afterthought, is what lets the delight in the other states land.",
        ],
        ul: [
          "Confidence floor: below threshold, the themed surfaces do not render at all",
          "Sensitivity exclusions: no theming or humour on health, baby, and bereavement-adjacent categories",
          "No double-dipping: never pair a substitute, never re-pair what is already in the cart",
          "Respect the Restocker: decisive sessions stay calm, still, and fast",
        ],
        divider: true,
      },
      {
        h: "The delight layer, placed by the peak-end rule",
        tldr: "I spent the delight budget where memory is made, the basket-build peak and the doorstep end, and kept the decisive path silent.",
        p: [
          "People do not remember an experience as an average of every second; they remember its most intense moment and its ending, the peak-end rule. So delight here is placed, not sprinkled. The peak is the basket assembling itself as you tap across occasion tabs, the animation that turns a list of transactions into the feeling of completing a plan. The end is the doorstep: the order arriving is the most charged moment in quick commerce, so a small occasion-aware grace note there (Enjoy movie night) colours the whole memory and costs nothing.",
          "Between them, smaller beats earn their keep: the add-two confirmation gives a crisp scale-tick and a single light haptic; the ten-minute wait, usually a dead map, gets dressed to the occasion you just shopped, a nod to the contextual screens Swiggy already explores. The house rule that kept it from tipping into noise: the funny line and the functional line are never the same line, so charm lives in occasion titles and empty states while buttons and reason strings stay plainly useful.",
        ],
        split: "media",
        figure:
          "Caption: the emotional curve across the journey, delight concentrated at the basket-build peak and the doorstep end, with the decisive Restocker path held deliberately flat. This is the one moment the case study lingers on. [Build the peak-end map as the signature figure.]",
        divider: true,
      },
      {
        h: "The edge: a personal shopper, not a store map",
        tldr: "Competitors ship static occasion theming; the same surface, predicted live per user, is a different product.",
        p: [
          "The competition is already building themed widgets and category tabs, but theirs are static: hardcoded themes per keyword, authored by a calendar. The bet is that the same surface, made dynamic, is a categorically better product. A competitor sees a shampoo search and shows hair products. Zepto sees a shampoo search at 7pm from a user who last bought conditioner six weeks ago, and surfaces a hair mask at the right moment for that specific person. The difference is not the widget; it is the engine behind it, and the engine already runs in production.",
        ],
        split: "media",
        figure:
          "Caption: competitor versus Zepto across pairing logic, occasion inference, and guardrails, static keyword rules against cart-plus-history-plus-time prediction. [Comparison figure.]",
        divider: true,
      },
      {
        h: "Impact, honestly framed",
        tldr: "One surface is live and the model already runs; the headline number is directional by design, and the A/B test exists to prove or kill it.",
        p: [
          "The honest status: the paired card is live in production, the prediction engine is built and running, the brand pipeline is committed, and the other two surfaces are designed and green-lit. The behavioural bet, that an occasion-aware aisle builds a bigger, more complete basket and grows GSV, is what the experiment measures: a control of standard search against a test of all three surfaces, watched not just for cross-sell conversion but for cannibalisation of the primary category, because if the aisle steals from the search it sits next to, the feature does not ship.",
          "The 20% incremental-sales figure on adjacent categories is a directional, impression-backward model, not a promise; I was deliberate about framing it as the question the test answers, not a result in hand. Leading with the mechanism and the committed demand, and being explicit about what is still unproven, is the honest version of this story. [Add real test results, adoption, and the cannibalisation read once the experiment reports.]",
        ],
        ul: [
          "Live: the paired add-two card in production; the prediction engine running",
          "Committed: net-new brand budget (25 to 30% of aligned ad spend) waiting on the surfaces, with smaller brands a new occasion-relevant way in",
          "Directional: 20% modelled incremental sales on adjacent categories, framed as the A/B hypothesis, not a claim",
          "[Fill: measured cross-sell conversion, add-two tap rate, session GSV, and the cannibalisation result from the test]",
        ],
      },
      {
        h: "Reflection",
        tldr: "The subtlest problem was not the widget; it was keeping a persuasive feature on the right side of the line, and proving restraint reads as craft.",
        p: [
          "Adjacency works precisely because it operates just below deliberate decision-making, which is the same property that defines a dark pattern. The whole bet, that being dynamic and genuinely useful beats static theming, only pays if users believe the store is on their side, so the ethics were not a footnote; they were the product. The feature helps you finish the basket you actually came for; it does not manufacture needs, fake scarcity, or bury the thing you searched for.",
          "What I would revisit: the directional model leaned harder on the high-volume parent category (milk) than I would like, and the real validation has to come from the breadth of occasions, not one base subcategory. And there is a live tension I am still sitting with: how much familiarity (we have got your Friday movie night ready) is delightful before it tips into feeling watched. That line is one notification wide, and I would want the experiment, not my taste, to find it. [Add your own honest revisit once the test runs.]",
        ],
      },
    ],
    todo: [
      "Confirm your exact title and the dates (collaborators intentionally left out, this entry is craft-first)",
      "Metrics update as the A/B test reports: cross-sell conversion, add-two tap rate, session GSV, and especially the cannibalisation read",
      "Confirm which surfaces are live vs green-lit at publish time (paired card is described as shipped)",
      "Build the seven figure assets per Claude/2026-06-19_occasion-buying-figure-specs.md (start with the occasion-widget basket-build, the hero)",
      "Clarity-gate / length: still around 2,050 narrative words; consider a section-level trim toward the 900-1,400 target if it reads long for an HM",
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
        <span>2026</span>
      </span>
    </footer>
  );
}

/* Scan-mode rows (nan.fyi-style list) built from the read-mode projects. */
const scanProjects = [
  {
    href: "/work/away-agent",
    brand: "Away",
    year: "2026",
    accent: "#2563EB",
    title: "An agent that never takes the wheel",
    blurb: "An AI travel agent for the whole trip, find, vet, book, watch, rescue, that does the work of the best human agent on the phone and never takes the wheel.",
  },
  {
    href: "/work/away-agent-human",
    brand: "Away",
    year: "2026",
    accent: "#2563EB",
    title: "Designed for the moments, not the screens",
    blurb: "The same Away agent, told human-first: organised by the moments a traveller lives through, each with the real ways it goes wrong and how the agent meets it.",
  },
  {
    href: "/work/occasion-buying",
    brand: "Zepto",
    year: "2026",
    accent: "#9826C9",
    title: "Rebuilding the aisle a search box deleted",
    blurb: "Theme & occasion buying: a dynamic, per-user cross-sell layer that rebuilds physical-store adjacency across three Zepto ad surfaces.",
  },
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
        <p className="header__role">Interaction Designer · Bangalore, India</p>
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
                <Fragment key={i}>
                  {/* publication title — a static label, not a link */}
                  <div className="work__item work__item--static">
                    <span className="work__main">
                      <span className="work__year">{paper.year}</span>
                      <span className="work__title">{paper.title}</span>
                    </span>
                    <span className="work__meta">{paper.venue}</span>
                  </div>
                  {/* redirect links — each opens in a new tab */}
                  <div className="work__links">
                    <a
                      className="work__link"
                      href={paper.links.publication}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Publication
                    </a>
                    <a
                      className="work__link"
                      href={paper.links.pdf}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      PDF
                    </a>
                  </div>
                </Fragment>
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
    design: s.design,
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
    (slide.figure || slide.iphone || slide.iphoneSplit || slide.rive || slide.collage || slide.design) ? (
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
          design={slide.design}
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
            {cs.sections
              .reduce((groups, s, i) => {
                // consecutive sections sharing a group key collapse into one block
                const last = groups[groups.length - 1];
                if (s.group && last && last.group === s.group) {
                  last.items.push({ s, i });
                } else if (s.group) {
                  groups.push({ group: s.group, items: [{ s, i }] });
                } else {
                  groups.push({ items: [{ s, i }] });
                }
                return groups;
              }, [])
              .map((g, gi) => {
                const link = ({ s, i }) => (
                  <li key={i}>
                    <a
                      href={`#sec-${i}`}
                      className={i === activeSection ? "is-active" : undefined}
                    >
                      {s.h}
                    </a>
                  </li>
                );
                return g.group ? (
                  <li className="article__index-group" key={`g-${gi}`}>
                    <span className="article__index-group-head">{g.group}</span>
                    <ul className="article__index-group-list">
                      {g.items.map(link)}
                    </ul>
                  </li>
                ) : (
                  link(g.items[0])
                );
              })}
          </ul>
        </nav>

        <article className="article">
          <header className="article__head">
          <p className="article__eyebrow">{cs.eyebrow}</p>
          <h1 className="article__title">{cs.title}</h1>
          <p className="article__meta">{cs.meta}</p>
        </header>

        {cs.board ? (
          <div className="article__hero-board article__hero-board--shader">
            <Suspense fallback={null}>
              <HeroShader className="article__hero-shader" />
            </Suspense>
            <div className="article__hero-board-inner">
              <Suspense fallback={null}>
                <TextFlippingBoardDemo messages={cs.board} />
              </Suspense>
            </div>
          </div>
        ) : cs.heroImage ? (
          // a project-specific hero image sits in the header frame
          <div className="article__hero-board article__hero-board--image">
            <img className="article__hero-img" src={cs.heroImage} alt="" />
          </div>
        ) : (
          // the departure-board frame is Away-specific; other projects get a
          // blank frame placeholder until their own hero asset is added
          <div className="article__hero-board article__hero-board--blank" aria-hidden="true" />
        )}

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
                <Fragment key={j}>
                  <p>{para}</p>
                  {/* an optional figure copy that sits inline under the first paragraph */}
                  {j === 0 && s.inlineFig && (
                    <figure className="article__figure">
                      <SectionFigure fig={s.inlineFig} variant="article" bare={s.inlineFigBare} />
                      {s.inlineFigCaption && <figcaption>{s.inlineFigCaption}</figcaption>}
                    </figure>
                  )}
                </Fragment>
              ))}
              {/* a living shader in a framed box, like the cloud hero (golden |
                  iridescent) */}
              {s.shader && (
                <div
                  className={`article__shader-box article__shader-box--${s.shader}`}
                  aria-hidden="true"
                >
                  <Suspense fallback={null}>
                    <ShaderCanvas preset={s.shader} className="article__shader-canvas" />
                  </Suspense>
                </div>
              )}
              {s.ul && (
                <ul>
                  {s.ul.map((li, k) => (
                    <li key={k}>{li}</li>
                  ))}
                </ul>
              )}
              {/* a labelled spec block: exhaustive states / edge cases / parameters,
                  shown as titled mini-lists. Used while a moment is being spec'd out
                  before it is written up as prose. */}
              {s.spec && (
                <div className="article__spec">
                  {s.spec.map((blk, k) => (
                    <div className="article__spec-block" key={k}>
                      <p className="article__spec-label">{blk.label}</p>
                      <ul>
                        {(blk.items || []).map((it, m) => (
                          <li key={m}>{it}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
              {(s.figure || s.rive || s.collage || s.design) && (
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
                    design={s.design}
                    variant="article"
                    bare={s.figBare}
                  />
                  {s.figure && <figcaption>{s.figure}</figcaption>}
                </figure>
              )}
              {/* a deliberate empty slot for a screen still to be designed:
                  a dashed placeholder captioned with what the screen should show. */}
              {s.screen && (
                <figure className="article__figure article__screen">
                  <div className="article__screen-box" aria-hidden>
                    <span className="article__screen-tag">Screen</span>
                  </div>
                  <figcaption>{s.screen}</figcaption>
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

      {/* Featured preset: information-sensitive scaffold (shimmer + focal annotation) */}
      <div style={{ margin: "8px 0 36px" }}>
        <p className="demo__name" style={{ marginBottom: 4 }}>Information-sensitive scaffold</p>
        <p className="demo__tech" style={{ marginBottom: 16 }}>
          Preset: render the UI as static shimmer; keep only the focal element + its annotation real and animated.
        </p>
        <AnnotationDemo />
      </div>

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

  // Toggle the theme with a circular reveal that sweeps out from the toggle
  // (View Transitions API); falls back to an instant swap where unsupported or
  // when the user prefers reduced motion.
  const toggleTheme = (event) => {
    const next = theme === "dark" ? "light" : "dark";
    // toggle the class synchronously so the view-transition snapshot captures the
    // new theme (the useEffect runs after paint, too late for the snapshot)
    const apply = () => {
      document.documentElement.classList.toggle("dark", next === "dark");
      setTheme(next);
    };
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const x = event?.clientX ?? window.innerWidth - 56;
    const y = event?.clientY ?? 44;
    // tactile WebGL wavefront that sweeps out from the toggle point
    const fireRipple = () =>
      window.dispatchEvent(new CustomEvent("theme-ripple", { detail: { x, y } }));
    if (typeof document.startViewTransition !== "function" || reduce) {
      apply();
      fireRipple();
      return;
    }
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );
    const transition = document.startViewTransition(() => flushSync(apply));
    transition.ready.then(() => {
      // Feathered circular reveal. A *fixed* soft-edged radial mask is grown by
      // animating mask-size + mask-position (lengths only) — never the gradient
      // string itself, since interpolating a gradient on a VT snapshot banded
      // and glitched. The opaque core reaches endRadius at the end; the soft
      // band beyond it gives the feathered edge.
      const opaque = 0.85; // opaque core as a fraction of the soft circle radius
      const side = (endRadius / opaque) * 2; // mask square so core radius == endRadius
      const mask = `radial-gradient(circle closest-side, #000 0%, #000 ${opaque * 100}%, transparent 100%)`;
      const half = side / 2;
      document.documentElement.animate(
        {
          maskImage: [mask, mask],
          WebkitMaskImage: [mask, mask],
          maskRepeat: ["no-repeat", "no-repeat"],
          WebkitMaskRepeat: ["no-repeat", "no-repeat"],
          maskPosition: [`${x}px ${y}px`, `${x - half}px ${y - half}px`],
          WebkitMaskPosition: [`${x}px ${y}px`, `${x - half}px ${y - half}px`],
          maskSize: ["0px 0px", `${side}px ${side}px`],
          WebkitMaskSize: ["0px 0px", `${side}px ${side}px`],
        },
        {
          duration: 560,
          easing: "cubic-bezier(0.4, 0, 0.2, 1)",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    });
    // fire the texture ripple once the reveal finishes, so the whole wavefront
    // plays live (the View Transition freezes the page during its run).
    transition.finished.then(fireRipple, fireRipple);
  };

  // Leaving / switching a case study closes the deck.
  useEffect(() => {
    setPresenting(false);
  }, [slug]);

  const variant = isLab ? "none" : slug ? "play" : "toggle";
  const accent = slug ? (caseStudies[slug] || caseStudies.sample).accent : undefined;

  return (
    <NavContext.Provider value={navigate}>
      {/* tactile WebGL grain behind all content; ripples from the toggle on theme
          change. Skipped on case studies so the cloud-shader hero (also WebGL)
          isn't starved of a GPU context by a third simultaneous canvas. */}
      {!slug && <TexturedBackground theme={theme} />}
      {/* one fixed, right-anchored row so the theme toggle always sits a fixed
          gap to the left of the page control and follows it as it morphs */}
      <div className="top-controls">
        <ThemeToggle
          theme={theme}
          onToggle={toggleTheme}
        />
        <PageControl
          variant={variant}
          mode={mode}
          accent={accent}
          onRead={() => setMode("read")}
          onScan={() => setMode("scan")}
          onPresent={() => setPresenting(true)}
        />
      </div>
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
