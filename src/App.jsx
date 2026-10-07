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
import MorphFace from "./MorphFace";
import TexturedBackground from "./TexturedBackground";
import AgentWizardFigure from "./figures/AgentWizard";
import AgentWizardCompare from "./figures/agentWizard/Compare";
import AgentWizardFFF from "./figures/agentWizard/AgentWizardFFF";
import StellaOnboarding from "./figures/onboarding/StellaOnboarding";
import AnnotationDemo from "./figures/scaffold/AnnotationDemo";
import SeqDemo from "./figures/systemExplainer/SeqDemo";
import FanOutDemo from "./figures/systemExplainer/FanOutDemo";
import TriageDemo from "./figures/systemExplainer/TriageDemo";
import TradeOffDemo from "./figures/systemExplainer/TradeOffDemo";
import BacktrackDemo from "./figures/systemExplainer/BacktrackDemo";
import UpdateDemo from "./figures/systemExplainer/UpdateDemo";
import RecoverDemo from "./figures/systemExplainer/RecoverDemo";
import DecomposeDemo from "./figures/systemExplainer/DecomposeDemo";
import SpineDemo from "./figures/systemExplainer/SpineDemo";
import LoopDemo from "./figures/systemExplainer/LoopDemo";
import WeighDemo from "./figures/systemExplainer/WeighDemo";
import HedgeDemo from "./figures/systemExplainer/HedgeDemo";
import WatchDemo from "./figures/systemExplainer/WatchDemo";
import SystemSheet, { Ref } from "./figures/lab/SystemSheet";
import ModesGuide from "./figures/lab/ModesGuide";
import DeckPresets from "./figures/lab/DeckPresets";
import FeedbackBench from "./figures/lab/FeedbackBench";
import AlongPathV1 from "./figures/lab/alongpath-v1/AlongPathV1";
import TimelineVerticalV1 from "./figures/lab/timeline-v1/TimelineVerticalV1";
import DetailV1 from "./figures/lab/DetailV1";
import HandsSheet from "./figures/hands/HandsSheet";
import MockupLab from "./figures/mockup/MockupLab";
import IconShowcase from "./figures/zeptoPremium/IconShowcase";
import BrickLab from "./figures/brickLab/BrickLab";
import ShaderGallery from "./figures/shaders/ShaderGallery";
import SkyLab from "./figures/sky/SkyLab";
import ThreeLinesLab from "./figures/threeLines/ThreeLinesLab";
import PixelMascotLab from "./figures/pixelMascot/PixelMascotLab";
import StellaLab from "./figures/stella/StellaLab";
import Hello from "./hello/Hello";
import Hello3 from "./hello3/Hello";
import StellaSim from "./figures/stella/StellaSim";
import AwayReveal from "./figures/consumer/AwayReveal";
import PhysicalSheet from "./figures/physicality/PhysicalSheet";
import "./figures/systemExplainer/skins.css";
import ExecutionFlood from "./figures/concepts/ExecutionFlood";
import CallJourney from "./figures/concepts/CallJourney";
import DailyReport from "./figures/concepts/DailyReport";
import FigmaToCode from "./figures/concepts/FigmaToCode";
import EvolutionTimeline from "./figures/concepts/EvolutionTimeline";
import DecisionEngine from "./figures/concepts/DecisionEngine";
import OccasionWidget from "./figures/concepts/OccasionWidget";
import BannerLab from "./figures/concepts/BannerLab";
import CrossSellTable from "./figures/concepts/CrossSellTable";
import { feedback, feedbackCoalesced } from "./ui/feedback";
import { playCue } from "./ui/sound"; // mukuatqi: motion cues for the scroll-scene layers
import HeroChips from "./hello3/HeroChips";
import DesignFigure from "./figures/design/DesignFigure";
import Whiteboard from "./figures/Whiteboard";
import ReelFigure, { ReelPresets, reels } from "./figures/reel/Reel";
import CrossSellTree from "./figures/crosssell/CrossSellTree";
import XsFramework from "./figures/crosssell/XsFramework";
import XsTrips from "./figures/crosssell/XsTrips";
import XsObjective from "./figures/crosssell/XsObjective";
import XsDirections from "./figures/crosssell/XsDirections";
import XsRail from "./figures/crosssell/XsRail";
import XsWait from "./figures/crosssell/XsWait";
import XsLedger from "./figures/crosssell/XsLedger";
import XsWalk from "./figures/crosssell/XsWalk";
import XsIntents from "./figures/crosssell/XsIntents";
import XsNotebook from "./figures/crosssell/XsNotebook";
import XsSecondPull from "./figures/crosssell/XsSecondPull";
import XsReview from "./figures/crosssell/XsReview";
import XsPairs from "./figures/crosssell/XsPairs";
import XsCloud from "./figures/crosssell/XsCloud";
import XsProjector from "./figures/crosssell/XsProjector";
import XsMotion from "./figures/crosssell/XsMotion";
import SchedUsers from "./figures/scheduled/SchedUsers";
import NarrationPlayer from "./prd/NarrationPlayer";
import { scheduledCaseNarration } from "./prd/scheduledNarration";
import { dasshCaseNarration } from "./prd/dasshCaseNarration";
import "./prd/prd.css";
import EdgeFloater from "./figures/jarvis/EdgeFloater";
import EdgeCard from "./figures/jarvis/EdgeCard";
import EdgeAltitudes from "./figures/jarvis/EdgeAltitudes";
import EdgeOos from "./figures/jarvis/EdgeOos";
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
import AwFareCards from "./figures/awayAgent/AwFareCards";
import SchedDirections from "./figures/scheduled/SchedDirections";
import SchedSinglePage from "./figures/scheduled/SchedSinglePage";
import SchedStuckCart from "./figures/scheduled/SchedStuckCart";
import SchedImpact from "./figures/scheduled/SchedImpact";
import SchedSplit from "./figures/scheduled/SchedSplit";
import SchedMoments from "./figures/scheduled/SchedMoments";
import SchedCartStates from "./figures/scheduled/SchedCartStates";
import SchedPageStates from "./figures/scheduled/SchedPageStates";
import SchedDateSwitch from "./figures/scheduled/SchedDateSwitch";
import SchedGtm from "./figures/scheduled/SchedGtm";
import SchedExplorations from "./figures/scheduled/SchedExplorations";
import SchedPostBooking from "./figures/scheduled/SchedPostBooking";
import SchedGtmReal, { SchedGtmRealOne, SchedGtmCartOne } from "./figures/scheduled/SchedGtmReal";
import SchedRnR from "./figures/scheduled/SchedRnR";
import SchedPageReal from "./figures/scheduled/SchedPageReal";
import { AiimsHero, AiimsGap, AiimsScale, AiimsInteraction, AiimsMatrix } from "./figures/aiims/AiimsFigures";
import { scheduledDeck } from "./decks/scheduledDelivery.deck";
import { awayAgentDeck } from "./decks/awayAgent.deck";
import { zepirisDeck } from "./decks/zepiris.deck";
import { dasshDeck } from "./decks/dassh.deck";
import { topprDeck } from "./decks/toppr.deck";
import Tooltips from "./ui/Tooltips";

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
  // Cross-sell promoted from the WIP shelf per annotation mtllf048 (2026-09-03).
  {
    brand: "Zepto",
    href: "/work/cross-sell",
    accent: "#0F6E56",
    year: "2026",
    month: "15/06",
    titleSegments: [{ text: "The half of cross-sell " }, { text: "nobody solved", accent: true }],
  },
  // Moved to the WIP shelf (src/wip.local.jsx, git-ignored) per annotations
  // mqxryvos/mqxryvot/mqxryvou/mqxs0y6o/mqxrzyc0: away-agent-human, away-prd,
  // away, jarvis.
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
    brand: "AIIMS",
    href: "/work/aiims",
    accent: "#059669",
    year: "2023",
    month: "01/01",
    titleSegments: [{ text: "Teaching empathy to nurses in " }, { text: "virtual reality", accent: true }],
  },
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
const HoverBorderGradient = lazy(() =>
  import("./components/ui/hover-border-gradient").then((m) => ({ default: m.HoverBorderGradient }))
);
const HeroShader = lazy(() => import("./HeroShader"));
// Generic WebGL canvas for the case-study section shader boxes (golden-hour /
// iridescent). Lazy so the shaders only load on a page that uses them.
const ShaderCanvas = lazy(() => import("./ShaderCanvas"));
// The home header's live weather sky (Living Sky + src/lib/weather.js). Lazy for
// the same reason: the first paint must not wait on WebGL or on two fetches.
const WeatherSky = lazy(() => import("./WeatherSky"));
// Interactive Three.js DJ console (/dj). Lazy so three.js (~600KB) is code-split
// into its own chunk and never weighs down the home page or case studies.
const DjConsole = lazy(() => import("./figures/dj/DjConsole"));
// the window scene's header controls (sky and look), only while the scene is on
const SceneControls = lazy(() => import("./scene/window/SceneControls"));
// The window scene sandbox (/window, unlisted): three r186 WebGPU, lazy like /dj
// so its chunk never reaches any other page. See src/scene/window/.
const WindowScenePage = lazy(() => import("./scene/window/WindowScenePage"));
// Scheduled Delivery slot availability replayed through liveline (unlisted).
const SdAvailability = lazy(() => import("./figures/sdAvailability/SdAvailability"));
// mujk4cl5 (27 Sep): the hero is now the Figma 231:8842 loop; the old entrance-only
// hero (SchedHeartHero.jsx) is kept on disk
const SchedHeartHero = lazy(() => import("./figures/scheduled/SchedHeartLoop"));
const PronCards = lazy(() => import("./figures/scheduled/PronCards"));
const SdImpactCharts = lazy(() => import("./figures/sdAvailability/SdImpactCharts"));
const SchedMetricStory = lazy(() => import("./figures/scheduled/SchedMetricStory"));
const SchedCartStrip = lazy(() => import("./figures/scheduled/SchedCartStrip")); // mukxwvur
const SchedReachExplorer = lazy(() => import("./figures/scheduled/SchedReachExplorer")); // 5 Oct, the Morphocode-style explorer
const SchedResearchStory = lazy(() => import("./figures/scheduled/SchedResearchStory")); // mukx7ffq
const SchedEtaScroll = lazy(() => import("./figures/scheduled/SchedEtaScroll"));
const SchedCartGrid = lazy(() => import("./figures/scheduled/SchedCartGrid"));
const AutoTabs = lazy(() => import("./figures/scheduled/AutoTabs"));
const PlateCursor = lazy(() => import("./figures/scheduled/PlateCursor")); // mto4v1ka
// mto4ygd5: Figma Embed Kit 2.0 URL. The client-id (a Figma OAuth app, with the
// site's origin in its allowed embed origins) unlocks the Embed API; set it in
// Portfolio/.env.local as VITE_FIGMA_EMBED_CLIENT_ID.
const FIGMA_EMBED_CLIENT_ID = import.meta.env.VITE_FIGMA_EMBED_CLIENT_ID || "";
// mtpdtjwt: a "\n" in a case title is a forced line break
function withBreaks(str) {
  const parts = String(str || "").split("\n");
  return parts.length === 1 ? str : parts.map((t, i) => (i ? [<br key={"b" + i} />, t] : t));
}
// LIVE FIGMA EMBEDS ARE OFF (20 Sep 2026: "iu see the figma login here, why?
// please fix").
//
// Because the file is PRIVATE. Checked rather than guessed: the embed URL
// answers an anonymous request with a 302 (Figma redirecting to sign-in), and
// the file - "Schedule Order Handoff", 71cZSn... - lives in Agam's personal
// account, not the Zepto one. So every visitor who is not him, including him on
// his phone, met a Figma login where a prototype should be.
//
// The plate falls back to a still of the prototype's own start frame, exported
// from that same file (node 40000084:180821, "Today: all slots"), so what shows
// is still the real design rather than a placeholder.
//
// To bring the live prototype back: set that file's share link to "Anyone with
// the link can view" in Figma, then flip this to true. It cannot be done from
// here - the REST API has no endpoint for share permissions - and it is worth a
// deliberate decision rather than a reflex, since it publishes Zepto work from
// a personal file.
// mukq9kl9 (28 Sep): ON for presenting on localhost (Agam: "we don't have to
// worry about public viewability just yet"). The file is still private, so the
// embed renders only in a browser signed in to a Figma account with access;
// anyone else sees Figma's sign-in wall. Flip back to false before publishing.
// 5 Oct (going live): on in dev for presenting, off in any production build
const PROTO_EMBED = !import.meta.env.PROD;
const PROTO_STILL = "/figures/scheduled/proto-start.png";

const figmaEmbedUrl = (fileKey, nodeId) =>
  `https://embed.figma.com/proto/${fileKey}?node-id=${nodeId}&embed-host=portfolio&scaling=scale-down-width&footer=false&hotspot-hints=false&viewport-controls=false` +
  (FIGMA_EMBED_CLIENT_ID ? `&client-id=${FIGMA_EMBED_CLIENT_ID}` : "");
// post an Embed API command into a prototype iframe (target origin per the docs)
const figmaEmbedPost = (iframe, msg) => iframe?.contentWindow?.postMessage(msg, "https://www.figma.com");
import { IPHONE_FRAME_SRC } from "./figures/ds/IphoneFrame"; // base iPhone frame, Scheduled Delivery only for now
import { animate as motionAnimate } from "motion";
import { Refresh as IconRefresh, CursorPointer as IconCursor } from "iconoir-react";
import { spring as dsSpring, useMediaQuery } from "./figures/ds/hooks";
import { GlassLens } from "./ui/GlassLens";
import SchedInsight from "./figures/scheduled/SchedInsight";
import { Compass, Buildings, Handshake } from "@phosphor-icons/react";
import SchedUseCases from "./figures/scheduled/SchedUseCases";
import SchedRoleWireframes from "./figures/scheduled/SchedRoleWireframes";
import { manualTheme, setManualTheme, themeForTime } from "./lib/autoTheme";
import { windowSceneOn } from "./lib/sceneFlag";
// Art mode (src/art/ArtMode.jsx) is no longer mounted: removed with read mode (mtqpu3f2 + the 07 Sep ask); the file stays.
const MotionCheck = lazy(() => import("./hello/MotionCheck"));
// The Away PRD, rendered as native portfolio DOM (was an iframe → unscannable by
// Agentation). Lazy so its ~300KB data module loads only on the PRD page.
const PrdDoc = lazy(() => import("./prd/PrdDoc"));
const DasshPrdDoc = lazy(() => import("./prd/DasshPrdDoc"));
const ScheduledPrdDoc = lazy(() => import("./prd/ScheduledPrdDoc"));
const JarvisPrdDoc = lazy(() => import("./prd/JarvisPrdDoc"));
const ZepirisPrdDoc = lazy(() => import("./prd/ZepirisPrdDoc"));
const AwayAnalyticsDoc = lazy(() => import("./prd/AwayAnalyticsDoc"));
const PromptLibraryDoc = lazy(() => import("./prd/PromptLibraryDoc"));
const TeamPromptsDoc = lazy(() => import("./prd/TeamPromptsDoc"));
const ColorSystemDoc = lazy(() => import("./prd/ColorSystemDoc"));
const Resume = lazy(() => import("./Resume"));

// The framed section shader. Expand-on-intent: the box stays 100% with normal
// spacing until the pointer lingers ~2s (dwell) or it's clicked — then it scales
// to 150% and grows its margin so neighbouring text moves to make room (see
// .article__shader-box--zoom), collapsing back on mouse-leave. superSample keeps
// the canvas crisp at the enlarged size.
function ShaderBox({ shader }) {
  const [expanded, setExpanded] = useState(false);
  const dwellRef = useRef(null);
  useEffect(() => () => clearTimeout(dwellRef.current), []);
  const armDwell = () => {
    clearTimeout(dwellRef.current);
    dwellRef.current = setTimeout(() => setExpanded(true), 2000); // linger >2s
  };
  const collapse = () => {
    clearTimeout(dwellRef.current);
    setExpanded(false);
  };
  const expandNow = () => {
    clearTimeout(dwellRef.current); // click is the fast path, skip the wait
    setExpanded(true);
  };
  return (
    <div
      className={`article__shader-box article__shader-box--${shader} article__shader-box--zoom${expanded ? " is-expanded" : ""}`}
      aria-hidden="true"
      onMouseEnter={armDwell}
      onMouseLeave={collapse}
      onClick={expandNow}
    >
      <Suspense fallback={null}>
        <ShaderCanvas preset={shader} className="article__shader-canvas" superSample={1.5} />
      </Suspense>
      {/* hover affordance: a fullscreen icon in a 2s timer ring — "keep hovering
          (or click) to expand". Fills over the same 2s as the dwell, hidden once
          expanded (CSS, see .shader-zoom-hint). */}
      <span className="shader-zoom-hint" aria-hidden="true">
        <svg className="shader-zoom-hint__timer" viewBox="0 0 36 36">
          <circle className="shader-zoom-hint__track" cx="18" cy="18" r="15" />
          <circle className="shader-zoom-hint__ring" cx="18" cy="18" r="15" />
        </svg>
        <svg className="shader-zoom-hint__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M16 21h3a2 2 0 0 0 2-2v-3M8 21H5a2 2 0 0 1-2-2v-3" />
        </svg>
      </span>
    </div>
  );
}

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
  // Scheduled Delivery hero: the 2026 slot-availability tape (liveline), lazy.
  sdAvailabilityHero: () => (
    <Suspense fallback={null}>
      <SdAvailability hero />
    </Suspense>
  ),
  // Impact: the chart grid (mtmkh1h3).
  sdImpactCharts: () => (
    <Suspense fallback={null}>
      <SdImpactCharts />
    </Suspense>
  ),
  // 27 Sep ("stitch a story with all of the metrics"): the same data as a plot
  // mukw52nu (28 Sep): six cart moments, each a phone crop, 2 x 3
  schedCartGrid: () => (
    <Suspense fallback={null}>
      <SchedCartGrid />
    </Suspense>
  ),
  // mukvt7cp (28 Sep): the ETA callout variants, a horizontal scroll-in row
  schedEtaScroll: () => (
    <Suspense fallback={null}>
      <SchedEtaScroll />
    </Suspense>
  ),
  // mukxfh9s (28 Sep): three image boxes, waiting on Agam's assets. To fill one,
  // drop the file in public/figures/scheduled/three-boxes/ and set its src below
  schedThreeBoxes: () => (
    <div className="tbox" role="group" aria-label="Three images">
      {[null, null, null].map((src, i) => (
        <div className="tbox__cell" key={i}>
          {src ? <img src={src} alt="" /> : <span className="tbox__ph">Image {i + 1}</span>}
        </div>
      ))}
    </div>
  ),
  schedCartStrip: () => (
    <Suspense fallback={null}>
      <SchedCartStrip />
    </Suspense>
  ),
  schedReachExplorer: () => (
    <Suspense fallback={null}>
      <SchedReachExplorer />
    </Suspense>
  ),
  schedResearchStory: () => (
    <Suspense fallback={null}>
      <SchedResearchStory />
    </Suspense>
  ),
  schedMetricStory: () => (
    <Suspense fallback={null}>
      <SchedMetricStory />
    </Suspense>
  ),
  // 28 Sep, the presenting cut, for a product DESIGN lead: Act 1 (it shipped)
  // and Act 4 (the trouble), the two that say what the numbers made us change
  schedMetricStoryCore: () => (
    <Suspense fallback={null}>
      {/* 28 Sep: the interviewer is a PRODUCT HEAD hiring a design lead, so value (Act 3) is back beside shipped and trouble */}
      <SchedMetricStory acts={[0, 2, 3]} />
    </Suspense>
  ),
  // The pronunciation pair with animated faces (mtmk4qua).
  pronCards: () => (
    <Suspense fallback={null}>
      <PronCards />
    </Suspense>
  ),
  // Scheduled Delivery hero: the heart lockup from Figma, animated (mtmgr6eg).
  schedHeartHero: () => (
    <Suspense fallback={null}>
      <SchedHeartHero />
    </Suspense>
  ),
  aiimsHero: AiimsHero,
  aiimsGap: AiimsGap,
  aiimsScale: AiimsScale,
  aiimsInteraction: AiimsInteraction,
  aiimsMatrix: AiimsMatrix,
  awayLanding: AwayLandingFigure,
  agentWizard: AgentWizardFigure,
  agentWizardCompare: AgentWizardCompare,
  agentWizardFff: AgentWizardFFF,
  stellaOnboarding: StellaOnboarding,
  executionFlood: ExecutionFlood,
  callJourney: CallJourney,
  stellaSim: StellaSim,
  dailyReport: DailyReport,
  figmaToCode: FigmaToCode,
  evolutionTimeline: EvolutionTimeline,
  decisionEngine: DecisionEngine,
  occasionWidget: OccasionWidget,
  bannerLab: BannerLab,
  crossSellTable: CrossSellTable,
  schedUsers: SchedUsers,
  edgeFloater: EdgeFloater,
  edgeCard: EdgeCard,
  edgeAltitudes: EdgeAltitudes,
  edgeOos: EdgeOos,
  awClarify: AwClarify,
  awHome: AwHome,
  awIntakeBrief: AwIntakeBrief,
  awSearchFlow: AwSearchFlow,
  awSmartPin: AwSmartPin,
  awResultCard: AwResultCard,
  awFareCards: AwFareCards,
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
  schedMoments: SchedMoments,
  schedCartStates: SchedCartStates,
  schedPageStates: SchedPageStates,
  schedDateSwitch: SchedDateSwitch,
  schedGtm: SchedGtm,
  schedExplorations: SchedExplorations,
  schedPostBooking: SchedPostBooking,
  schedGtmReal: SchedGtmReal,
  schedGtmRealOne: SchedGtmRealOne, // one phone, no frame (mtmm2p84)
  schedGtmCartOne: SchedGtmCartOne, // muky9xug: the cart screen alone
  schedRnR: SchedRnR,
  schedPageReal: SchedPageReal,
  xsTree: CrossSellTree,
  xsFramework: XsFramework,
  xsTrips: XsTrips,
  xsObjective: XsObjective,
  xsDirections: XsDirections,
  xsRail: XsRail,
  xsWait: XsWait,
  xsLedger: XsLedger,
  xsWalk: XsWalk,
  xsIntents: XsIntents,
  xsNotebook: XsNotebook,
  xsSecondPull: XsSecondPull, // the second pull, five panels (2026-09-04)
  xsReview: XsReview,
  xsPairs: XsPairs,
  xsCloud: XsCloud, // the theme space point cloud, third pull (2026-09-04)
  xsProjector: XsProjector, // the embedding projector on the same sample (2026-09-04)
  xsMotion: XsMotion, // the Figma Motion composition, coded from its keyframes (2026-09-17)
  reelPresets: ReelPresets,
};

// A showreel video that reliably autoplays. React's `muted` JSX prop does not
// always set the DOM property, so browsers block muted-autoplay and the clip
// looks frozen; we force el.muted = true and call play() via a ref.
function VideoFigure({ src, poster, caption }) {
  const ref = useRef(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    v.defaultMuted = true;
    const p = v.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  }, [src]);
  return (
    <figure className="article__figure article__video-fig">
      <video
        ref={ref}
        className="article__video"
        src={src}
        poster={poster}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
      />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

// A smart comparison table: scannable grid that replaces a stack of parallel
// prose sections. `table = { cols:[...], rows:[[...]], caption? }`. First cell of
// each row is the row header. Scrolls horizontally on narrow screens.
function SmartTable({ table }) {
  const { cols = [], rows = [], caption } = table;
  return (
    <figure className="article__figure article__table-fig">
      <div className="article__table-wrap">
        <table className="article__table">
          <thead>
            <tr>
              {cols.map((c, i) => (
                <th key={i} scope="col">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                {r.map((cell, j) =>
                  j === 0 ? (
                    <th key={j} scope="row">
                      {cell}
                    </th>
                  ) : (
                    <td key={j}>{cell}</td>
                  )
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

// Lightweight data-viz for the quantitative beats. `chart = { type, title?,
// data:[{label,value,suffix?,note?,display?}], max?, caption? }`.
//   type "stats" -> big-number stat band (headline figures)
//   type "bars"  -> horizontal labelled bars (comparisons / percentages)
function DataViz({ chart }) {
  const { type = "bars", title, data = [], caption } = chart;
  const num = (v) => (typeof v === "number" ? v : parseFloat(v) || 0);
  const max = chart.max || Math.max(...data.map((d) => num(d.value)), 1);
  return (
    <figure className="article__figure article__viz">
      {title && <p className="article__viz-title">{title}</p>}
      {type === "stats" ? (
        <div className="article__stats">
          {data.map((d, i) => (
            <div className="article__stat" key={i}>
              <span className="article__stat-value">
                {d.value}
                {d.suffix && <span className="article__stat-suffix">{d.suffix}</span>}
              </span>
              <span className="article__stat-label">{d.label}</span>
              {d.note && <span className="article__stat-note">{d.note}</span>}
            </div>
          ))}
        </div>
      ) : (
        <div className="article__bars">
          {data.map((d, i) => (
            <div className="article__bar-row" key={i}>
              <span className="article__bar-label">{d.label}</span>
              <span className="article__bar-track">
                <span
                  className="article__bar-fill"
                  style={{ width: `${Math.max(3, Math.round((num(d.value) / max) * 100))}%` }}
                />
              </span>
              <span className="article__bar-value">{d.display || `${d.value}${d.suffix || ""}`}</span>
            </div>
          ))}
        </div>
      )}
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

// Renders a section's figure body: a live rebuilt screen (`fig`), a real
// exported image (`image`), or the gradient placeholder. Shared by the article
// and Present-mode slide views via `variant`.
// Scroll progress of an element through the viewport: 0 when its top meets the
// bottom edge, 1 when its bottom leaves the top edge. Capture-phase scroll so a
// scrolling container counts too; reduced motion pins it mid-way.
function useScrollProgress(ref, onProgress) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onProgress(0.5, el);
      return;
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      // a hidden or suspended pane can report a zero viewport; skip rather
      // than compute a progress that parks every one-shot layer
      const vh = window.visualViewport?.height || window.innerHeight || document.documentElement.clientHeight;
      if (!(vh > 0) || !(r.height > 0)) return;
      onProgress(Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height))), el);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll, { capture: true });
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

const clamp01 = (v) => Math.min(1, Math.max(0, v));

// A Figma plate taken apart into layers that move with the scroll. A section
// sets `scene: { aspect, bg, base, layers: [{ src, x, y, w, fx }] }`, x/y/w as
// percentages of the plate. Two effects so far:
//   flip   (mtmh68zb): the layer lies edge-on, stands up as the plate climbs
//          into view, holds, then falls away as it leaves. rotateX, scroll-linked.
//   reveal (mtmh6om7): layers arrive one after another, each a short slide up
//          and fade, staggered by index, held once shown.
// One-shot layers (flip, pop, notify) park out of view and fire once on the
// way in; the scene's replay button (mtmlir34) parks and re-fires them all.
const ONE_SHOT = new Set(["flip", "pop", "notify"]);
function parkLayer(node) {
  const fx = node.dataset.fx;
  const img = node.firstElementChild;
  node.dataset.armed = "1";
  if (node._anim) { node._anim.stop(); node._anim = null; }
  if (fx === "flip") { img.style.transform = "rotateX(-90deg)"; img.style.opacity = "0"; }
  else if (fx === "pop") { img.style.transform = "scale(0.2)"; img.style.opacity = "0"; }
  else if (fx === "notify") { img.style.transform = "translateY(-70%)"; img.style.opacity = "0"; }
  else if (fx === "magic") {
    // mto5bsxs: the text waits blurred; a click reveals it
    img.style.filter = `blur(${MAGIC_BLUR}px)`; img.style.opacity = String(MAGIC_DIM); img.style.transform = "none"; // mtpawmqu: same scale blurred and sharp
    node.dataset.on = "0";
    // a reveal stopped mid-flight can still commit its final opacity a tick
    // later (WAAPI), so re-assert the parked values after it
    img.getAnimations?.().forEach((a) => a.cancel());
    setTimeout(() => {
      if (node.dataset.on === "0") { img.style.filter = `blur(${MAGIC_BLUR}px)`; img.style.opacity = String(MAGIC_DIM); img.style.transform = "none"; }
    }, 80);
  }
}
// mtp6aj71: the parked blur is soft enough that the blurred glyphs still read
// as words (4px on a ~170px-wide label, was 12), and the dim is lighter.
const MAGIC_BLUR = 4;
const MAGIC_DIM = 0.7;
// mto5bsxs: the Apple-keynote text reveal. The glyphs sharpen and settle
// (blur -> 0, scale 1.06 -> 1, dim -> full) on the expressive spring. Click
// again to blur. (The masked light sweep was removed, mtp78lno.)
function magicLayer(node) {
  const img = node.firstElementChild;
  if (node._anim) { node._anim.stop(); node._anim = null; }
  if (node._blur) { node._blur.stop(); node._blur = null; }
  if (node.dataset.on === "1") { parkLayer(node); return; }
  node.dataset.on = "1";
  node._anim = motionAnimate(
    img,
    { opacity: [MAGIC_DIM, 1] },
    { ...dsSpring("throw", { stiffness: 120, damping: 20, mass: 1 }), opacity: { duration: 0.6 } },
  );
  // the blur is driven as a value from motion's own frame loop (a `filter`
  // keyframe goes through WAAPI, which left the layer parked in this pane)
  if (node._blur) node._blur.stop();
  node._blur = motionAnimate(MAGIC_BLUR, 0, {
    duration: 0.9, ease: [0.2, 0.8, 0.2, 1],
    onUpdate: (v) => { img.style.filter = v < 0.05 ? "blur(0px)" : `blur(${v.toFixed(2)}px)`; },
  });
}
function fireLayer(node, i) {
  const fx = node.dataset.fx;
  const img = node.firstElementChild;
  node.dataset.armed = "0";
  // Per-property transforms (rotateX / scale / y): motion drives these from its
  // own frame loop, which re-runs cleanly on every replay. (Animating the
  // `transform` string went through the Web Animations API and a second run on
  // the same element ended parked.)
  // mukuatqi (28 Sep): each one-shot layer is scored as it fires (silent
  // unless the sound toggle is on): flip = a card flick, pops = one reveal for
  // the staggered set, notify = a reveal
  if (fx === "flip") playCue("flip");
  else if (fx === "pop") feedbackCoalesced("reveal", 400);
  else if (fx === "notify") feedback("reveal");
  if (fx === "flip") {
    node._anim = motionAnimate(
      img,
      { rotateX: [-90, 0], opacity: [0, 1] },
      { ...dsSpring("throw", { stiffness: 170, damping: 19, mass: 1.1 }), opacity: { duration: 0.25 } },
    );
  } else if (fx === "pop") {
    const order = parseInt(node.dataset.order || i, 10);
    node._anim = motionAnimate(
      img,
      { scale: [0.2, 1], opacity: [0, 1] },
      { ...dsSpring("bloom"), delay: 0.12 + order * 0.22, opacity: { duration: 0.2, delay: 0.12 + order * 0.22 } },
    );
  } else if (fx === "notify") {
    // mtmlts43: on the spring too (the CSS transition needed a painted parked
    // frame, so a replay snapped instead of dropping)
    node._anim = motionAnimate(
      img,
      { y: ["-70%", "0%"], opacity: [0, 1] },
      { ...dsSpring("throw", { stiffness: 150, damping: 18, mass: 1.1 }), opacity: { duration: 0.22 } },
    );
  }
}

// muidhm8w (26 Sep): a prose section laid out like Context and Objective,
// heading + TL;DR on the left (the TL;DR as a post-it), text on the right, every
// block rising in with the same reveal the scenes use (fade + 28px, staggered)
// the first time the section is on screen.
// muim39ah (27 Sep): "My role" as Figma 944-65104. Case study frame default
// size and padding; label left in the Context and Objective face, the
// statement at the section-heading size (24px), the role paragraph set in
// three columns below. Rises in like the other frames.
function RoleFrame({ s, i }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const items = [...el.querySelectorAll("[data-rise]")];
    items.forEach((n) => { n.style.opacity = "0"; n.style.transform = "translateY(28px)"; });
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      items.forEach((n, k) => motionAnimate(n, { opacity: [0, 1], y: [28, 0] },
        { duration: 0.7, delay: 0.1 + k * 0.12, ease: [0.22, 1, 0.36, 1] }));
    }, { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div className="role-frame" ref={ref}>
      <h2 id={`sec-${i}`} className="role-frame__label" data-rise>{s.h}</h2>
      <div className="role-frame__main">
        <p className="role-frame__statement role-frame__statement--solo" data-rise>{s.roleFrame.statement}</p>
        {/* mujvays4 (27 Sep): the three-column body removed ("remove these");
            the copy stays in the data as roleFrame.body */}
        {/* mujvc9e0: Role at a glance, merged in */}
        {/* mujvkmg7 (27 Sep): the "Lead designer" line removed; icons replace the rules above the three points (placeholders, to be replaced later) */}
        {s.roleFrame.leadership && (
          <ul className="role-frame__leadership" data-rise>{s.roleFrame.leadership.map((l, k) => { const I = [Compass, Buildings, Handshake][k]; return <li key={l}>{I && <span className="role-frame__icon" aria-hidden><I weight="fill" /></span>}{l}</li>; })}</ul>
        )}
      </div>
    </div>
  );
}

function SplitSection({ s, i }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const items = [...el.querySelectorAll("[data-rise]")];
    items.forEach((n) => { n.style.opacity = "0"; n.style.transform = "translateY(28px)"; });
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      items.forEach((n, k) => motionAnimate(n, { opacity: [0, 1], y: [28, 0] },
        { duration: 0.7, delay: 0.1 + k * 0.12, ease: [0.22, 1, 0.36, 1] }));
    }, { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  // muidykpc: the note can be peeled off and stuck anywhere on the page.
  // Press: the corner peels up (.is-peeling), then it lifts off the paper
  // (.is-held, a bigger shadow and a small scale-up). Drag: it follows the
  // pointer and swings with the horizontal speed, like paper in air. Release:
  // it slaps down (a quick squash), settles at a fresh small tilt, and stays.
  // Moves use the individual translate / rotate / scale properties so they
  // never fight the reveal, which animates `transform`.
  const peelNote = (e) => {
    if (e.button !== 0) return;
    const n = e.currentTarget;
    e.preventDefault();
    try { n.setPointerCapture(e.pointerId); } catch { /* a synthetic pointer has nothing to capture */ }
    // start from wherever it actually sits, including the CSS default spot
    // (muifeh3v), not an assumed 0,0, so the first pick-up never jumps
    const [tx, ty] = n.dataset.at
      ? n.dataset.at.split(",").map(Number)
      : (getComputedStyle(n).translate.split(" ").map(parseFloat).concat(0, 0)).slice(0, 2).map((v) => v || 0);
    const x0 = e.clientX - tx, y0 = e.clientY - ty;
    let lastX = e.clientX, lastT = performance.now(), swing = 0, raf = 0, nx = tx, ny = ty;
    n.classList.add("is-peeling");
    const lift = setTimeout(() => n.classList.add("is-held"), 140);
    const paint = () => {
      raf = 0;
      n.style.translate = `${nx}px ${ny}px`;
      n.style.rotate = `${(-2 + swing).toFixed(2)}deg`;
    };
    const move = (m) => {
      const now = performance.now();
      const vx = (m.clientX - lastX) / Math.max(1, now - lastT); // px per ms
      lastX = m.clientX; lastT = now;
      swing = Math.max(-14, Math.min(14, swing * 0.8 + vx * 6));
      nx = m.clientX - x0; ny = m.clientY - y0;
      if (!n.classList.contains("is-held")) n.classList.add("is-held");
      if (!raf) raf = requestAnimationFrame(paint);
    };
    const up = () => {
      clearTimeout(lift);
      n.removeEventListener("pointermove", move);
      n.removeEventListener("pointerup", up);
      n.removeEventListener("pointercancel", up);
      if (raf) cancelAnimationFrame(raf);
      n.dataset.at = `${nx},${ny}`;
      n.style.translate = `${nx}px ${ny}px`;
      const rest = -4 + Math.random() * 5; // every placement gets its own tilt
      n.classList.remove("is-held", "is-peeling");
      n.classList.add("is-stuck");
      motionAnimate(n, { rotate: [`${-2 + swing}deg`, `${rest}deg`], scale: [1.06, 0.97, 1] },
        { duration: 0.32, ease: [0.2, 0.9, 0.3, 1] });
      setTimeout(() => n.classList.remove("is-stuck"), 340);
    };
    n.addEventListener("pointermove", move);
    n.addEventListener("pointerup", up);
    n.addEventListener("pointercancel", up);
  };
  return (
    <div className="article__split" ref={ref}>
      <div className="article__split-side">
        <h2 id={`sec-${i}`} data-rise>{s.h}</h2>
        {s.tldr && !s.hideTldr && (
          // muie8ipv: the WRAP carries the drag, the tilt and the shadow (a
          // drop-shadow, so it traces the paper's real outline); the paper
          // inside has its peeled corner actually cut away (clip-path), and
          // the flap is the folded-over underside, a separate piece
          <div className="article__postit-wrap" data-rise onPointerDown={peelNote}>
            <p className="article__postit">
              <span className="article__tldr-label">TL;DR</span>
              {s.tldr}
            </p>
            <span className="article__postit-curl" aria-hidden />
          </div>
        )}
      </div>
      <div className="article__split-main">
        {(s.p || []).map((para, j) => <p key={j} data-rise>{para}</p>)}
        {s.ul && (
          <ul data-rise>
            {s.ul.map((li, k) => <li key={k}>{li?.t ? `${li.t}: ${li.d}` : li}</li>)}
          </ul>
        )}
      </div>
    </div>
  );
}

// muif5084 (26 Sep): the opening question as LIVE TEXT in Figma 107's own
// 50/50 layout (two flex-1 columns), replacing the bridged PNG layers, which
// could not rewrap into half the width without shrinking the type ~30%.
// Sizes are the 1512 frame's x 0.54: label 36 light -> ~19px, question 48 ->
// ~26px. Keeps what the scene had: the staggered rise on first view
// (muic4w44) and pick-up-and-spring-home dragging (muic1wju).
function IntroQuestion({ label, question }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const items = [...el.querySelectorAll("[data-rise]")];
    items.forEach((n) => { n.style.opacity = "0"; n.style.transform = "translateY(28px)"; });
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      items.forEach((n, k) => motionAnimate(n, { opacity: [0, 1], y: [28, 0] },
        { duration: 0.7, delay: 0.15 + k * 0.12, ease: [0.22, 1, 0.36, 1] }));
    }, { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const drag = (e) => {
    const node = e.currentTarget;
    if (e.button !== 0) return;
    try { node.setPointerCapture(e.pointerId); } catch { /* synthetic pointer */ }
    node._back?.stop();
    const x0 = e.clientX - (node._dx || 0), y0 = e.clientY - (node._dy || 0);
    const move = (m) => {
      node._dx = m.clientX - x0; node._dy = m.clientY - y0;
      node.style.translate = `${node._dx}px ${node._dy}px`;
    };
    const up = () => {
      node.removeEventListener("pointermove", move);
      node.removeEventListener("pointerup", up);
      node.removeEventListener("pointercancel", up);
      node.classList.remove("is-dragging");
      const from = { x: node._dx || 0, y: node._dy || 0 };
      node._back = motionAnimate(1, 0, { ...dsSpring("throw", { stiffness: 260, damping: 20 }),
        onUpdate: (k) => { node._dx = from.x * k; node._dy = from.y * k; node.style.translate = `${node._dx}px ${node._dy}px`; } });
    };
    node.classList.add("is-dragging");
    node.addEventListener("pointermove", move);
    node.addEventListener("pointerup", up);
    node.addEventListener("pointercancel", up);
  };
  return (
    <div className="iq" ref={ref}>
      <div className="iq__col iq__col--label"><p className="iq__label" data-rise onPointerDown={drag}>{label}</p></div>
      <div className="iq__col"><p className="iq__question" data-rise onPointerDown={drag}>{question}</p></div>
    </div>
  );
}

function ScrollScene({ scene: sceneIn }) {
  // Mobile (2026-09-06): a scene may carry a `mobile` variant (aspect, layers,
  // bg) that replaces the desktop composition on phones. The desktop scenes are
  // 1512-wide Figma frames, so their text exports shrink to 6px at 375; the
  // variant re-lays the same exports one under another at readable widths.
  const phone = useMediaQuery("(max-width: 700px)");
  const scene = phone && sceneIn.mobile ? { ...sceneIn, ...sceneIn.mobile } : sceneIn;
  const ref = useRef(null);
  const hasOneShot = scene.layers.some((l) => ONE_SHOT.has(l.fx) || l.fx === "magic"); // magic: replay re-blurs
  const replay = () => {
    const el = ref.current;
    if (!el) return;
    const layers = [...el.querySelectorAll(".sscene__layer")];
    // every one-shot is motion-driven from explicit keyframes now, so no
    // painted frame is needed in between: park, then fire, synchronously
    // (rAF does not run in a hidden document, which is where this failed)
    layers.forEach(parkLayer);
    // a beat between stop and start: motion drops an animation started in the
    // same tick as the one it just stopped on that element (a timeout, not
    // rAF, since rAF does not run in a hidden document)
    setTimeout(() => layers.forEach((n, i) => ONE_SHOT.has(n.dataset.fx) && fireLayer(n, i)), 30);
  };
  useScrollProgress(ref, (p, el) => {
    // muif6v96: a scene title rises in with the layers, just ahead of them
    const title = el.querySelector(".sscene__title");
    if (title) {
      const t = clamp01((p - 0.04) / 0.16);
      title.style.opacity = t.toFixed(3);
      title.style.transform = `translateY(${((1 - t) * 28).toFixed(1)}px)`;
    }
    const layers = el.querySelectorAll(".sscene__layer");
    layers.forEach((node, i) => {
      const fx = node.dataset.fx;
      const img = node.firstElementChild;
      if (ONE_SHOT.has(fx)) {
        const out = p <= 0.0 || p >= 1.0;
        if (out) parkLayer(node);
        else if (p >= 0.3 && p <= 0.85 && node.dataset.armed !== "0") fireLayer(node, i);
      } else if (fx === "drift") {
        // a layer taller than the plate slides through it with the scroll:
        // data-to is the end translateY as a % of the layer's own height
        const to = parseFloat(node.dataset.to || "0");
        img.style.transform = `translateY(${(p * to).toFixed(2)}%)`;
      } else if (fx === "reveal" && !scene.revealIntro) {
        const t = clamp01((p - (0.1 + i * 0.08)) / 0.16);
        // mu3ku986 ("reveal on scroll"): a TINTED layer is painted by its
        // ::after, which no inline style on the <img> can reach - so adding the
        // dark-mode tint had silently frozen these layers fully visible. The
        // whole layer carries the reveal in that case, which moves the ::after
        // with it; untinted layers keep animating the img exactly as before.
        // a split layer (muikq572) also paints its text in ::after, so the whole
        // layer carries the reveal, as a tinted one does
        const target = node.classList.contains("sscene__layer--tint") || node.classList.contains("sscene__layer--split") ? node : img;
        target.style.opacity = t.toFixed(3);
        target.style.transform = `translateY(${((1 - t) * 28).toFixed(1)}px)`;
      }
    });
  });
  // muic4w44: a scene that opens the page is already a fifth of the way through
  // its scroll range on load, so the scroll-linked reveal froze it half-faded.
  // `revealIntro` plays the SAME reveal (fade + 28px rise, staggered) on a
  // clock once the scene is on screen.
  useEffect(() => {
    const el = ref.current;
    if (!scene.revealIntro || !el) return;
    const targets = [...el.querySelectorAll(".sscene__layer--reveal")].map((n) =>
      n.classList.contains("sscene__layer--tint") ? n : n.firstElementChild);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    targets.forEach((t) => { t.style.opacity = "0"; t.style.transform = "translateY(28px)"; });
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      targets.forEach((t, i) => motionAnimate(t, { opacity: [0, 1], y: [28, 0] },
        { duration: 0.7, delay: 0.15 + i * 0.12, ease: [0.22, 1, 0.36, 1] }));
    }, { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, [scene.revealIntro, phone]);
  // muic1wju: `draggable` scenes let you pick a layer up; it springs home on release
  const onDragStart = (e) => {
    const node = e.currentTarget;
    if (e.button !== 0) return;
    node.setPointerCapture(e.pointerId);
    node._back?.stop();
    const x0 = e.clientX - (node._dx || 0), y0 = e.clientY - (node._dy || 0);
    const move = (m) => {
      node._dx = m.clientX - x0; node._dy = m.clientY - y0;
      node.style.translate = `${node._dx}px ${node._dy}px`;
    };
    const up = () => {
      node.removeEventListener("pointermove", move);
      node.removeEventListener("pointerup", up);
      node.removeEventListener("pointercancel", up);
      node.classList.remove("is-dragging");
      const from = { x: node._dx || 0, y: node._dy || 0 };
      node._back = motionAnimate(1, 0, { ...dsSpring("throw", { stiffness: 260, damping: 20 }),
        onUpdate: (k) => { node._dx = from.x * k; node._dy = from.y * k; node.style.translate = `${node._dx}px ${node._dy}px`; } });
    };
    node.classList.add("is-dragging");
    node.addEventListener("pointermove", move);
    node.addEventListener("pointerup", up);
    node.addEventListener("pointercancel", up);
  };
  // muifb2es: `aspect: "default"` = the global case study frame default
  const isDefault = scene.aspect === "default";
  const [W, H] = isDefault ? [1512, 982] : scene.aspect || [1392, 862];
  return (
    <div className={"sscene" + (scene.draggable ? " sscene--drag" : "")+ (scene.noframe ? " sscene--noframe" : "")} ref={ref} style={{ aspectRatio: isDefault ? "var(--case-study-frame-default)" : `${W} / ${H}`, background: scene.bg }}>
      {scene.base && <img className="sscene__base" src={scene.base} alt="" draggable="false" />}
      {scene.title && <p className="sscene__title">{scene.title}</p>}
      {hasOneShot && (
        <button type="button" className="sscene__replay" aria-label="Replay the animation" onClick={replay}>
          <IconRefresh width={15} height={15} strokeWidth={1.8} aria-hidden="true" />
        </button>
      )}
      {scene.layers.map((l, i) => {
        const layer = (
          <div
            key={i}
            className={`sscene__layer sscene__layer--${l.fx}${l.card ? " sscene__layer--card" : ""}${l.tint ? " sscene__layer--tint" : ""}${l.split ? " sscene__layer--split" : ""}${l.lift ? " sscene__layer--lift" : ""}`}
            data-fx={l.fx}
            data-to={l.to}
            data-order={l.order}
            data-armed="1"
            onPointerDown={scene.draggable ? onDragStart : undefined}
            // mu3jl3kt: a `tint` layer is a FLAT-COLOUR export (the Figma slide's
            // own type), so it is painted as a mask in the theme's ink rather
            // than shown as a picture - see .sscene__layer--tint
            style={{ left: l.x + "%", top: l.y + "%", width: l.w + "%", ...(l.tint ? { "--tint-src": `url(${l.src})` } : null), ...(l.split ? { "--split-src": `url(${l.src})`, "--split": l.split + "%" } : null) }}
            {...(l.fx === "magic" ? {
              role: "button", tabIndex: 0, "aria-label": l.alt ? `Reveal: ${l.alt}` : "Reveal the text",
              onClick: (e) => magicLayer(e.currentTarget),
              onKeyDown: (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); magicLayer(e.currentTarget); } },
            } : {})}
          >
            {/* mtmkl036: a layer may pivot from a named point (a bubble's tail) */}
            <img src={l.src} alt="" draggable="false" style={l.origin ? { transformOrigin: l.origin } : undefined} />
            {/* mto5bsxs had a light sweep through the glyphs here; mtp78lno: removed, the sharpening alone is the reveal */}
            {/* mtp67ai5: only the text blurs; the box under it stays crisp (a second export, behind) */}
            {l.under && <img className="sscene__under" src={l.under} alt="" draggable="false" />}
          </div>
        );
        // mtmk2odv: a layer can be clipped to a box on the plate (a phone's
        // screen, say); its x/y/w are then relative to that box.
        return l.clip ? (
          <div
            key={i}
            className="sscene__clip"
            style={{ left: l.clip.x + "%", top: l.clip.y + "%", width: l.clip.w + "%", height: l.clip.h + "%", borderRadius: l.clip.r }}
          >
            {layer}
          </div>
        ) : layer;
      })}
    </div>
  );
}

// mtmrvqyu: the parallax with the plates beside it, and a toggle between the
// stacked view (plates under the figure, the current one) and the side-by-side
// view (figure left, plates right).
function DuoFigure({ figure, plates }) {
  const [view, setView] = useState("stack"); // mtmvwa1g: stacked is the default
  return (
    <div className="article__duo-wrap">
      <div className="fig-toggle" role="group" aria-label="Layout">
        {[["stack", "Stacked"], ["side", "Side by side"]].map(([k, label]) => (
          <button key={k} type="button" className={"fig-toggle__btn" + (view === k ? " is-active" : "")} aria-pressed={view === k} onClick={() => setView(k)}>
            {label}
          </button>
        ))}
      </div>
      <div className={"article__duo article__duo--" + view}>
        <div className="article__duo-main">{figure}</div>
        <div className="article__duo-side">{plates}</div>
      </div>
    </div>
  );
}

// mtmrira8: a stack of plates that read as windows onto ONE gradient. The
// wrapper measures where each plate sits in the stack and hands every plate
// ground the same gradient sized to the whole stack, offset to its position.
function PlatesStack({ stack, gradient, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !gradient) return;
    const apply = () => {
      const top = el.getBoundingClientRect().top;
      const total = el.getBoundingClientRect().height;
      el.querySelectorAll(".article__plate-ground").forEach((g) => {
        const r = g.getBoundingClientRect();
        g.style.backgroundImage = gradient;
        g.style.backgroundSize = `100% ${total}px`;
        g.style.backgroundPosition = `0 ${-(r.top - top)}px`;
        g.style.backgroundRepeat = "no-repeat";
      });
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    el.querySelectorAll(".article__plate").forEach((n) => ro.observe(n));
    return () => ro.disconnect();
  }, [gradient]);
  return (
    <div ref={ref} className={"article__plates" + (stack ? " article__plates--stack" : "")}>
      {children}
    </div>
  );
}

// Annotation mtmguhc9: the still as a scroll parallax. The card is the Figma
// card (1392x862, lavender gradient); the phone is the full unclipped export
// (672x1373) and is taller than the card, so it slides up as the section
// travels the viewport: top of the phone showing as the section enters at the
// bottom, the bottom showing as it leaves at the top. Scroll-linked, so it is
// interruptible by nature; no easing, the scroll is the easing.
function ScrollPhone({ src, long }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.setProperty("--p", "0.5");
      return;
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.visualViewport?.height || window.innerHeight;
      const raw = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
      // mtmhgirk: start a little later, end a little sooner. The travel runs
      // over the middle of the section's trip, still for the first 15% and
      // done by 80%.
      // mtmjsv3q: later still. Still for the first 30%, done by 85%.
      const p = Math.min(1, Math.max(0, (raw - 0.3) / 0.55));
      el.style.setProperty("--p", p.toFixed(4));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    // capture: the page may scroll inside a container rather than the window
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll, { capture: true });
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  // mtmph4a6: the base iPhone frame (Figma 492-48278) around the bare screen
  // export; the whole phone travels through the card with the scroll
  return (
    // `long` (mukxenvq): a full-length page export; it also scrolls INSIDE the screen
    <div className={"sp" + (long ? " sp--long" : "")} ref={ref}>
      <div className="sp__phone">
        <div className="sp__screen">
          <img src={src} alt="" draggable="false" />
        </div>
        <img className="sp__bezel" src={IPHONE_FRAME_SRC} alt="" draggable="false" />
      </div>
    </div>
  );
}

// Annotation mtmglh43: a reel section that also carries a `still` image gets
// a Video / Image toggle above the figure. Video is the default; the still is
// the same frame as a flat plate for readers who want to look, not watch.
function ReelOrStill({ reel, still, parallax, variant }) {
  const [view, setView] = useState("image"); // mtmh9k6x: image is the default
  const slide = variant === "slide";
  return (
    <div className="fig-switch">
      <div className="fig-toggle" role="group" aria-label="Figure media">
        {[["video", "Video"], ["image", "Image"]].map(([k, label]) => (
          <button
            key={k}
            type="button"
            className={"fig-toggle__btn" + (view === k ? " is-active" : "")}
            aria-pressed={view === k}
            onClick={() => setView(k)}
          >
            {label}
          </button>
        ))}
      </div>
      {view === "video" ? (
        <ReelFigure name={reel} variant={variant} />
      ) : parallax ? (
        <ScrollPhone src={still} />
      ) : (
        <img
          className={slide ? "slide__media-img slide__media-img--real" : "article__figure-img article__figure-img--real"}
          src={still}
          alt=""
          loading="lazy"
        />
      )}
    </div>
  );
}

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
  whiteboard,
  reel,
  still,
  stillParallax,
  scene,
  cover,
  variant,
  bare,
}) {
  const Fig = fig ? figures[fig] : null;
  const slide = variant === "slide";
  // Whiteboard asset type: a section sets `whiteboard: "<src>"` or
  // `{ src, alt, caption }` — any image on a hand-drawn whiteboard easel that
  // expands to a lightbox on click. Manages its own (centered) wrapper.
  if (whiteboard) {
    const wb = typeof whiteboard === "string" ? { src: whiteboard } : whiteboard;
    return <Whiteboard {...wb} />;
  }
  // Presentation Mode asset type: a section sets `reel: "<reelName>"` — a
  // cinematic motion figure (cursor close-up + micro-animation + phone flow).
  // ReelFigure renders its own card wrapper and owns the expand-to-full-bleed
  // surface, so it is returned directly (like DesignFigure).
  // Scroll scene: a layered Figma plate whose parts move with the scroll.
  if (scene) {
    return <ScrollScene scene={scene} />;
  }
  if (reel && still) {
    return <ReelOrStill reel={reel} still={still} parallax={stillParallax} variant={variant} />;
  }
  // mtmlfoo3: a still without a reel (the video moved to the lab)
  if (still && stillParallax) {
    return <ScrollPhone src={still} long={stillParallax === "long"} />;
  }
  if (reel) {
    return <ReelFigure name={reel} variant={variant} />;
  }
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
        {/* Live figures resolve their own theme from the `dark` class on
            documentElement (ds/hooks useDsTheme), so an embedded product window
            follows the page it is embedded in instead of asserting dark. */}
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

export const caseStudies = {
  toppr: {
    accent: "#2BB3A3",
    deck: topprDeck,
    eyebrow: "Toppr · Case study",
    title: "Designing joyful learning experiences for students and teachers",
    meta: "Design Intern · Toppr · [dates]",
    // Compact PDF cut (?cut=compact): ownership + form resolution lead.
    pdfSections: [
      "Context & problem",
      "My role",
      "Leading a product from zero: Toppr Ambassador",
      "One scalable logo family",
      "Making practice feel rewarding",
      "Impact & reflection",
    ],
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
  aiims: {
    accent: "#059669",
    eyebrow: "AIIMS · Research · Case study",
    title: "Teaching empathy in virtual reality, for the nurses no curriculum trains for it",
    meta: "Design Researcher · AIIMS · Published in Springer (IHIC 2023)",
    cover: "AIIMS",
    heroFig: "aiimsHero",
    // Compact PDF cut (?cut=compact): the research spine only.
    pdfSections: [
      "The skill no one is taught",
      "A gap in the research, not just the ward",
      "My role",
      "An empathy scale India could actually use",
      "Designing the moment, not just the model",
      "The comparison the framework is built to run",
      "Outcome",
      "What I would revisit",
    ],
    lead:
      "Empathy is the one thing a nurse uses in every patient interaction, and the one thing Indian nursing training has no room to teach. Working with AIIMS, I built a way to change that: a reliability-tested empathy scale made for the Indian context, and a virtual-reality environment where a nurse practises a hard conversation and feels its weight before a real patient ever does. I did everything but the research plan, from the instrument and the VR interaction model to the on-ground fieldwork and the pilots. The result is a published framework (Springer, 2023 IHIC proceedings) with a control-group comparison built into its evaluation design, and an empathy measure made for the Indian context rather than borrowed from the West.",
    sections: [
      {
        h: "The skill no one is taught",
        tldr: "Nurses carry more patient contact than anyone in the ward, yet empathy is the one competency their training has no room for.",
        p: [
          "A nurse spends more time at the bedside than any doctor. They are the ones who explain the diagnosis again after the consultant has left, who sit with the family, who read the fear in a patient before the patient can name it. More than any clinical skill, empathy is what turns that contact into care, and the research is blunt about it: patient wellbeing tracks closely with how empathetic their nurse is.",
          "Indian nursing training has almost no room for it. The curriculum, understandably, spends its hours on practical skills and medical knowledge; empathy is assumed, not taught. And the conditions make it harder, not easier. India runs at roughly 1.7 nurses per 1,000 people, a fraction of what a safe system needs, so nurses work under a level of stress and time-scarcity that erodes the very patience empathy asks for. The skill that matters most is the one the system has the least space to build.",
        ],
        ul: [
          "Users: practising nurses across Indian hospital settings, from diverse sociodemographic backgrounds",
          "Constraint: no dedicated empathy training exists in the nursing curriculum to build on",
          "Constraint: chronic understaffing (about 1.7 nurses per 1,000) makes bedside stress the norm, not the exception",
        ],
      },
      {
        h: "A gap in the research, not just the ward",
        tldr: "You cannot train what you cannot measure, and the standard empathy scale was built for a different world.",
        p: [
          "Before you can teach empathy, you have to measure it, and here the ground fell away. Empathy in nurses is one of the most-studied topics in the field almost everywhere except India: run the numbers through Scopus and the country that needs it most sits at the very bottom of the chart. The work simply had not been done here.",
          "Worse, the instrument everyone reaches for, the Jefferson Scale of Empathy, was never adapted to the Indian context. Its items assume a clinical culture, a family structure, and a way of talking about feelings that do not translate cleanly. Measuring Indian nurses with it is measuring with someone else's ruler, and reading the result as truth. So the first design problem was not the training at all. It was building a measure the training could even be judged against.",
        ],
        fig: "aiimsGap",
        figure:
          "Studies on nurses and empathy by country (Scopus, 1952-2024). India, where the nurse-to-patient ratio is among the most stretched, has among the least research to draw on.",
        split: "media",
        divider: true,
      },
      {
        h: "My role",
        tldr: "I did everything but the research plan: the scale, the VR environment and its interaction model, the fieldwork, and the pilots.",
        p: [
          "This was an academic project with AIIMS, and I want to draw the line cleanly, because it matters. The research plan, the overarching methodology and framing, was the team's. Everything downstream of it was mine to execute. I built the empathy scale and ran its reliability testing; I designed the VR environment, its conversation scenario, and the interaction model a nurse uses inside it; I ran the on-ground research, the observation and focus groups with nurses that grounded the whole thing; and I ran the pilots that tested both the scale and the prototype. The project is published (Springer, in the 2023 IHIC proceedings), which is the honest ceiling on how strongly I lean on any single result: these are peer-reviewed, pilot-scale findings, framed as a framework others can build on, not a deployed product.",
        ],
      },
      {
        h: "An empathy scale India could actually use",
        tldr: "A new instrument in four categories, grounded in what actually shapes a nurse's empathy here, and checked for reliability at pilot scale.",
        p: [
          "The scale had to come from the context, not be imported into it. Talking to nurses and reading the field, empathy here is not a single trait a person either has or lacks; it is shaped by four forces that pull in different directions. So the instrument I built groups its questions into four categories. Upbringing: the empathy a nurse received growing up, which shapes the empathy they can give. Workplace: the stress and resource-scarcity that quietly burns it down (\"when I am stressed, I may lose patience with a patient and not listen completely\"). Education: whether their training built the skill at all. And Empathy itself: their beliefs and practice at the bedside.",
          "I tested the draft with 18 nurses from a deliberate mix of backgrounds and upbringings, then checked it for reliability rather than trusting my own wording. It is a pilot-scale check, not a full psychometric validation, and I hold it as exactly that. Building the ruler first, even a rough one, is what let everything after it mean something.",
        ],
        fig: "aiimsScale",
        figure:
          "The empathy scale in four categories: upbringing, workplace, education, and empathy at the bedside, each with items written for the Indian nursing context rather than translated from a Western instrument.",
        divider: true,
      },
      {
        h: "Why put a nurse in a headset",
        tldr: "VR is already proven for clinical skills; the bet was that the harder skill, sitting with someone's fear, is exactly what immersion can teach.",
        p: [
          "Virtual reality earning its place in healthcare training is old news for the technical side: surgeons rehearse procedures in it, emergency teams drill mass-casualty triage in it. But clinical competence was never the gap. Nursing students, as the literature keeps pointing out, also have to learn the psychological and emotional side of care, and that is the part a textbook cannot rehearse.",
          "The bet the project runs on is that empathy is learned, at least in part, by standing in someone else's place, which is almost literally what a headset can offer: if immersion can teach a surgeon to feel a procedure, maybe it can teach a nurse to feel a conversation, the moment you tell a frightened patient hard news, and have to choose, in real time, how to hold them through it. That \"maybe\" is exactly what the comparative study is designed to test, rather than assume. A few pioneers pointed the way (Embodied Labs putting caregivers inside an end-of-life experience, for one), but none we could find were built for Indian nurses, in an Indian ward, in the languages and manners they actually work in.",
        ],
      },
      {
        h: "Designing the moment, not just the model",
        tldr: "The scenario is a branching conversation with a distressed patient; the interaction is one calm gesture that keeps the nurse present instead of fiddling with controls.",
        p: [
          "The scenario I designed is a conversation, not a procedure. A patient has just been diagnosed with cancer and is distressed; the nurse has to respond, and every response opens a different path. I wrote it as a decision tree, so the same scene can go gently or badly depending on what the nurse chooses, and the learning lives in feeling that difference, not in being told the right answer.",
          "The interaction model was the subtle part. In an empathy exercise, the interface itself must never break the spell; the moment a learner is hunting for a button, they have left the room emotionally. So I reduced the whole interaction to one continuous gesture. You hover over a possible response to hear it, click to select it, and release to commit and move the conversation forward. Hover, click, release: no menus, no reading instructions mid-scene, the hand stays where the attention should be, on the patient. It is the same instinct I bring to any product, that the best interface is the one that disappears, applied to the highest-stakes possible moment.",
        ],
        fig: "aiimsInteraction",
        figure:
          "The interaction model: hover a response to hear it, click to select, release to commit. One gesture keeps the nurse present in the conversation instead of operating a menu.",
        divider: true,
      },
      {
        h: "Does it feel like it works?",
        tldr: "A separate learner-feedback instrument, checked for reliability, showed nurses read the prototype as real, usable, and worth learning from. That is perception, not proof of learning; the empathy test is what measures learning.",
        p: [
          "A VR scene can be immersive and still teach nothing, so I built a second instrument to check how it lands, a learner-feedback form measuring four things a training tool has to earn: whether it feels close to the real clinical context, whether it is usable, whether it is engaging, and whether people believe they will remember and use what they learned. I ran it as a pilot with 60 nurses on a seven-point scale, and checked the form itself for reliability before trusting its output (Cronbach's alpha above 0.70, the standard bar).",
          "Every dimension landed close to six out of seven: nurses read the prototype as contextually aligned and worth their time, not just politely rated it. I want to be exact about what that is, though. This measures perception, whether the experience feels real and usable, not learning itself. Whether it actually moves empathy is the job of the before-and-after empathy test in the next section. It is pilot-scale evidence of a good reception, gathered with an instrument I could defend rather than a show of hands.",
        ],
      },
      {
        h: "The comparison the framework is built to run",
        tldr: "Not \"does VR work\" but \"does VR work better than cheaper formats or nothing\": a pre/post empathy test across four cohorts with a control arm, specified as the framework's evaluation for a future study to execute.",
        p: [
          "The strongest decision in the whole project was refusing the easy question. \"Does our VR thing work\" is a demo. The question worth answering is whether full VR actually beats the cheaper things a real hospital might reach for first, a 360-degree video, a flat 2D version on a phone, or no intervention at all.",
          "So the framework specifies a comparative study, and designing that evaluation was as much of the design work as designing the headset. Every nurse takes the empathy scale before and after, the common spine across all four cohorts. Three cohorts then experience the same scenario at descending levels of immersion (VR, 360 video, 2D photographic), and a fourth is a control group that gets no intervention between the two tests, though it still takes the same before-and-after measure. The control arm is what would turn a nice prototype into a claim you could stand behind: it isolates the immersion, so any empathy shift reads against doing nothing, and the formats can be ranked by cost against effect. To be clear about status: what I piloted is the VR arm and the instruments; the full four-cohort comparison is the study this framework was built to make runnable, not one I am reporting results from.",
        ],
        fig: "aiimsMatrix",
        figure:
          "The comparative-study design: four cohorts (VR, 360 video, 2D, control) share a common pre- and post-test empathy measure; only the intervention format changes, so a future run can isolate immersion and rank formats by cost against effect.",
        split: "media",
        divider: true,
      },
      {
        h: "Outcome",
        tldr: "A published framework: an empathy scale made for Indian nurses, a working VR training environment, and a replicable, control-armed way to test whether it teaches the skill their curriculum skips.",
        p: [
          "The work is published in the Springer proceedings of IHIC 2023, which matters most as a stamp on its method: peer review looked at the instrument, the VR framework, and the comparative design, and let them stand. What that leaves is not a one-off demo but a reusable framework, an empathy measure other researchers can adopt, a VR scenario pattern others can extend, and an evaluation design others can run.",
        ],
        ul: [
          "A new empathy scale in four categories, built for the Indian nursing context rather than translated from a Western one, and checked for reliability at pilot scale",
          "A working VR empathy-training environment: a branching patient conversation with a present-keeping hover-click-release interaction model",
          "A comparative-study design with a control arm, so a future study can isolate the immersion effect and rank formats by cost against impact",
          "Learner-feedback pilot with 60 nurses: context, usability, engagement, and perceived learnability all close to 6 of 7, on a form reliable enough to trust (Cronbach's alpha above 0.70)",
          "Published: Springer, IHIC 2023 proceedings (Responsible and Resilient Design for Society)",
        ],
      },
      {
        h: "What I would revisit",
        tldr: "The honest edges: pilot-scale samples, self-reported and perception-based effect, and a framework that still has to prove itself longitudinally at real deployment scale.",
        p: [
          "I want to be precise about what this does and does not prove. What I measured runs on a reliability-checked empathy scale and a learner-feedback instrument, which is to say on self-report and perception, not yet on observed change in real patient interactions over time. The samples are pilot-scale (18 for the scale, 60 for the feedback pilot), enough to pressure-test the instruments and the direction, not enough to claim a population effect. And any empathy shift we might measure right after a headset session is not the same as a nurse who is kinder at the bedside six months later.",
          "So the contribution I stand behind is the framework, not a finished cure: a way to measure empathy in a context that had no measure, a way to train it that nurses find real and usable, and an evaluation rigorous enough to tell whether the expensive format is worth it. What I would build next is the longitudinal, larger-cohort study the framework was deliberately designed to make possible, and the thing this project taught me carries into every brief since: when the tools were built for a different world, the first design job is often the ruler, not the product.",
        ],
      },
    ],
    todo: [
      "Confirm exact role title and dates, and the AIIMS collaborators / co-authors to credit",
      "Drop in real VR-environment stills and the scenario decision-tree screenshot (deck pp.13-17, not yet extracted)",
      "Confirm the published effectiveness figures cleared for public use (empathy pre/post deltas per cohort) before quoting any beyond the pilot-feedback scores",
      "Add the exact scale item counts per factor if they differ from the figure's placeholders",
      "Optional: a coded pilot-results bars figure (4 dimensions, about 6 of 7) to sit in 'Does it feel like it works?'",
    ],
  },
  "scheduled-delivery": {
    slideLayout: true, // mujvribt (27 Sep): every section in the My role slide layout
    accent: "#6B21D9",
    // Annotation mtmhgqek: the Figma-authored header animation (assets/schedule/
    // header.gif, converted to alpha video). mtmsdz2t: the coded SchedHeartHero
    // animation is the default view again, with an Animation / Video toggle.
    heroFig: "schedHeartHero",
    hideCaptions: true, // mtmvvzbk: no figure captions on this case until asked for
    // mtmx0aw8: the pronunciation recordings credit lives in the footer, not under the cards
    // mukx4arl (28 Sep): footer credit removed (key parked). NB the American clip is CC BY-SA, which needs attribution while it plays
    _credits: "Pronunciation recordings from Wikimedia Commons: British by Soundguys (CC0), American by Dvortygirl (CC BY-SA 3.0).",
    // mtmhmszl: the gif has real alpha, so the video keeps it (no white matte):
    // HEVC-with-alpha .mov for Safari, VP9-with-alpha .webm elsewhere.
    heroVideo: { mov: "/figures/scheduled/header.mov", webm: "/figures/scheduled/header.webm" },
    heroPoster: "/figures/scheduled/header-poster.png",
    heroSpeed: 0.7, // mtmhq999
    heroLoop: false, // mtmhrtlb looped it; mtmkjwp3: play once, replay button
    heroToggleHidden: true, // mtpauadr: the Animation / Video toggle is hidden; the coded heart hero is the header
    heroFirst: true, // mtpavlcs: the heart hero sits above the facts header
    heroAlt: "Schedule Delivery: the lockup settling inside a lavender heart",
    eyebrow: "Zepto · Case study",
    // mtparlyq: title wording and the facts header from Figma Portfolio 2026
    // node 559-7888 ("convert this to this"). Was: "Bringing scheduled delivery
    // to a 10-minute platform".
    title: "Bringing Schedule\nDelivery to a 10-min delivery platform", // mtpdtjwt: forced break before Delivery
    headFacts: [
      { label: "Organisation", value: "Zepto" },
      { label: "Timeline", value: "5 Months" },
    ],
    meta: "Product Designer · Zepto · 2025",
    // Compact PDF cut (?cut=compact): the spine only, for hard page caps.
    pdfSections: [
      "The central question",
      "Context & problem",
      "My role",
      "The cart is a complex construct",
      "The explorations",
      "One scroll across midnight",
      "Impact",
    ],
    cover: "Zepto",
    // Render the section index as a flat list (no "Problem / Directions / …" group
    // headers) — the grouped rail read as cluttered on this page.
    flatIndex: true,
    lead:
      "Scheduled Delivery let people order anything on Zepto for a one-hour window of their choosing, on a platform whose entire promise is 10-minute delivery. I owned the interaction design end-to-end: untangling the flows and edge cases, running two parallel directions to ground, and shipping a solution we usability-tested internally through design and then validated, after launch, with a 45-user mixed-method study. The payoff lands in the order itself: a scheduled order was worth about ₹1,450 against ₹543 for an instant one in August 2026, and a year of data later the feature is quietly becoming the channel large appliances are delivered through.",
    deck: scheduledDeck,
    sections: [
      {
        // mtmh4tl2 / mtp8qt8d: the Figma question frame (Portfolio 2026 node
        // 315-29335) as a scroll-reveal scene; layers are the node's own exports,
        // positions the node's absoluteRenderBounds as % of the 1512 x 982 frame.
        // Bridge 2026-09-06 04:55: Agam reordered the Figma column (hero, header,
        // question, phone, context, plates, cards), so the intro is five sections.
        h: "Before we start",
        // muif5084: rendered as live text, 50/50 (IntroQuestion); the bridged
        // `scene` below is kept for bridge-107 but no longer drawn
        introQuestion: { label: "Before we start...", question: "When did you last order something, you didn't need delivered in 10 min?" },
        noHeading: true,
        figBare: true,
        // muiceb40 / muiceb3s: the three dots above and below (mtpdu1jv) removed
        scene: {
          aspect: [1512, 982],
          bg: "transparent",
          noframe: true,
          revealIntro: true, // muic4w44
          draggable: true, // muic1wju
          // BRIDGED, DO NOT HAND-EDIT the two layer arrays below. Agam drafts
          // this question straight in Figma (node 315:29335) and it is rendered
          // here as PNG exports of its text layers, because the slide is set in
          // Stack Sans Headline and the site does not load that face. Every
          // rewrite changes the line count, which changes both the export and
          // where it sits, so `python3 tools/figma/bridge-107.py` re-exports,
          // re-places from the frame's render bounds, and rewrites everything
          // between the markers. Layer count is whatever Figma has: on 14 Sep
          // a third line was added under the question.
          // <bridge-107 desktop>
          layers: [
            { src: "/figures/scheduled/dup/3-2708.png", x: 36.91, y: 44.91, w: 53.19, fx: "reveal", tint: true },
            { src: "/figures/scheduled/dup/3-2706.png", x: 8.86, y: 48.52, w: 17.53, fx: "reveal", tint: true },
          ],
          // </bridge-107 desktop>
          // phones: the same layers stacked at reading size, the label at 42%
          // and the rest at 84%, with the box sized so the margins and the gap
          // hold whatever the line count is
          // <bridge-107 mobile>
          mobile: {
            aspect: [375, 96],
            layers: [
              { src: "/figures/scheduled/dup/3-2706.png", x: 8, y: 12.8, w: 42, fx: "reveal", tint: true },
              { src: "/figures/scheduled/dup/3-2708.png", x: 8, y: 42.9, w: 84, fx: "reveal", tint: true },
            ],
          },
          // </bridge-107 mobile>
        },
      },
      {
        // mtpbdzjv: this section leads the body so the parallax is the second asset on the page, after the hero
        h: "Scheduled delivery, in motion",
        noHeading: true, // mtpc44e2: heading hidden, the parallax opens the body
        hideTldr: true, // mtpc410h: TL;DR hidden
        tldr:
          "A short walk through the flow before the detail, one component at a time, from the toggle to a confirmed slot.",
        // Annotation mtmlfoo3: the reel and the Video / Image toggle are gone
        // from here (the reel lives in the lab, /lab); only the parallax still
        // stays. Earlier: mtmglh43 (toggle), mtmguhc9 (parallax, group 460-53124).
        still: "/figures/scheduled/in-motion-screen.png", // bare screen (460-53125); the frame is the base iPhone
        stillParallax: true,
        figBare: true,
        // mtmqmw9z: caption removed; the parallax needs no line under it.
        figure: "",
        // mtmlg1wh: two horizontal plates under the parallax; pin Figma nodes to fill them.
        // mtmlmth1: the go-to-market banner animation first, on the purple card ground.
      },
      {
        // mtp8th5p / mtp8tht6: Context and Objective, node 315-29373, six text
        // layers revealing top to bottom. Bridge: sits after the phone, as in Figma.
        h: "Context and objective",
        noHeading: true,
        figBare: true,
        scene: {
          aspect: "default", // muifb2es: this box DEFINES --case-study-frame-default
          bg: "transparent", // mtpeowii: no box fill, no stroke
          noframe: true,
          layers: [
            { src: "/figures/scheduled/dup2/context-chip.png", x: 7.94, y: 12.22, w: 10.38, fx: "reveal", tint: true },
            { src: "/figures/scheduled/dup2/context-1.png", x: 54.04, y: 13.44, w: 37.46, fx: "reveal", tint: true },
            { src: "/figures/scheduled/dup2/context-2.png", x: 54.15, y: 28.44, w: 34.95, fx: "reveal", tint: true },
            { src: "/figures/scheduled/dup2/objective-chip.png", x: 7.94, y: 56.11, w: 12.24, fx: "reveal", tint: true },
            { src: "/figures/scheduled/dup2/objective-1.png", x: 54.06, y: 57.33, w: 28.8, fx: "reveal", tint: true },
            { src: "/figures/scheduled/dup2/objective-2.png", x: 54.04, y: 78.64, w: 24.63, fx: "reveal", tint: true },
          ],
          // phones: one column, chip then lines, at reading size (2026-09-06)
          mobile: {
            aspect: [375, 450],
            layers: [
              { src: "/figures/scheduled/dup2/context-chip.png", x: 8, y: 5.8, w: 22, fx: "reveal", tint: true },
              { src: "/figures/scheduled/dup2/context-1.png", x: 8, y: 17.3, w: 84, fx: "reveal", tint: true },
              { src: "/figures/scheduled/dup2/context-2.png", x: 8, y: 32.4, w: 78, fx: "reveal", tint: true },
              { src: "/figures/scheduled/dup2/objective-chip.png", x: 8, y: 48.4, w: 26, fx: "reveal", tint: true },
              { src: "/figures/scheduled/dup2/objective-1.png", x: 8, y: 60, w: 66, fx: "reveal", tint: true },
              { src: "/figures/scheduled/dup2/objective-2.png", x: 8, y: 84.4, w: 60, fx: "reveal", tint: true },
            ],
          },
        },
      },
      // mukx078o + mukx11r8 (28 Sep): the two-plate row that sat here was split up:
      // the banner phone went to The go-to-market, the live prototype to Slot-page states
      // Bridge (2026-09-06 05:10): Agam deleted the two plate frames (560:11533,
      // 560:11536) and moved 134 'Context & problem' up to sit after frame 146 and
      // before the three cards. The plates section is gone from here; the hero
      // banner mp4 and the prototype embed still exist as assets and helpers.
      {
        h: "Context & problem",
        split: true, // muidhm8w: Context and Objective layout, TL;DR as a post-it
        group: "Problem",
        // mujp57h2 (27 Sep): re-voiced in the Fadell register (writing harness,
        // gate 0/0); was "Some demand wants groceries later, not now, and a
        // ten-minute-only app had nowhere to put it."
        tldr: "Not every order is urgent. Some people wanted their groceries later. And an app built only for ten minutes had nowhere to put them. So that demand walked out the door.",
        p: [
          // mujk799p (27 Sep): re-voiced with the writing harness (Sauer register,
          // gate 0/0), same facts; was one dense paragraph, now claim then turn
          "Zepto's whole promise is speed: groceries at your door in ten minutes. But not every need is urgent. Some orders are for tonight, some for tomorrow morning, and an app that only knew how to say now had nowhere to put them.",
          "Scheduled Delivery let people order anything on Zepto for a one-hour slot of their choosing, without spending the trust that ten minutes had earned.",
        ],
        _pBefore27Sep: [
          "Zepto's moat is instant: groceries in ten minutes. But not every need is instant, and forcing every order to be immediate left real demand on the table. Scheduled Delivery gave users a way to order anything on Zepto for a future one-hour slot, without spending the trust that makes the platform work.",
        ],
        // 26 Sep: PARKED, it repeated the use-cases lead line word for word
        // (SchedUseCases); move it back into `p` to restore
        _p2: [
          "Talking to users, a few high-intent personas emerged. Each one reframed the feature from a nice-to-have into the reason they ordered at all.",
        ],
        // 26 Sep: bullets PARKED (the three personas now have their own frames,
        // SchedUseCases); drop the underscore to bring them back
        _ul: [
          "Commuters scheduling on the ride home so groceries arrive when they do, no second errand after reaching the door",
          "Users in geographies with patchy store coverage near home, for whom instant often wasn't serviceable",
          "Superstore shoppers buying new-category items that only stock in larger superstores, which close overnight, making a late-night order impossible without scheduling",
        ],
        // Annotation mtmgqeqk: the three-persona figure moved to "What users told us".
        // Annotation mtmgxe0z: image frame from Figma Portfolio 2026 node 480-23182.
        // Annotation mtmh6om7: the five reasons arrive one at a time on scroll.
        scene: {
          aspect: [1392, 1034], // muif89sl: 20% taller (862 -> 1034) for breathing room
          bg: "var(--sd-reasons-bg, #f7f7f7)", // muiejocv: the box is back; muikq572: a var so dark mode can repaint it
          // muiejocv: the heading moved inside the box (was figureTop, above it)
          title: "When instant delivery fails",
          // muikq572: dark mode. `split` = where the icon ends and the text starts
          // (% of the export, measured from its alpha); in dark the text part is
          // repainted light and the icon keeps its colour. `lift` brightens the
          // two icons that fall under 3:1 on the dark box (moon 1.99, hexagon 2.22).
          // muifd33t: was "Five reasons instant can't answer"
          // muif6v96: rows re-spaced under the heading (were 12.88..79.7, set for
          // a box with no heading). muif89sl: box 20% taller, same content size,
          // centred. muifckmg: more air under the heading (~40 -> ~75px): heading
          // at 14.5%, rows 31.5 / 43.2 / 54.9 / 66.6 / 78.3
          layers: [
            { src: "/figures/scheduled/reasons/row-1.png", x: 36.78, y: 31.5, w: 26.44, fx: "reveal", split: 20.31, lift: true },
            { src: "/figures/scheduled/reasons/row-2.png", x: 37.64, y: 43.2, w: 24.78, fx: "reveal", split: 22.61, lift: true },
            { src: "/figures/scheduled/reasons/row-3.png", x: 32.61, y: 54.9, w: 34.84, fx: "reveal", split: 15.77 },
            { src: "/figures/scheduled/reasons/row-4.png", x: 36.85, y: 66.6, w: 26.29, fx: "reveal", split: 21.11 },
            { src: "/figures/scheduled/reasons/row-5.png", x: 37.64, y: 78.3, w: 24.71, fx: "reveal", split: 21.22 },
          ],
        },
        figure:
          "Out of hours, a disruption, an address beyond coverage, an item out of stock, a store at capacity. Each one is demand with nowhere to go.",
        // muieho5p: the dots under the five reasons removed
      },
      // muic2lhk (26 Sep): moved to sit just below Context & problem (was after the question); the phone moves up with it (muic1wk2)
      {
        // mtmjhj5d / mtmke32q / mtmvfzrl: began as three cards with three labels.
        // 16 Sep 2026, read back from Figma 120 (3:3321): the slide is SIX
        // photographs now, with six different labels, and it carries a Dev Mode
        // annotation reading "Pictionary game" - so the labels are word cards
        // you guess. The old `scene` of duplicated card PNGs is gone; the
        // component owns the grid, the pills and the reveal.
        h: "Six moments",
        noHeading: true,
        fig: "schedMoments",
        figure: "Six of them, and not one is an emergency: between meetings, heading to bed, at the dinner table, in peak-hour traffic, on the way home, and wrapping a gift.",
        // muicr2rh: the heading now sits ABOVE the collage (Figma 315:29470), inside SchedMoments
      },
      {
        h: "The central question",
        insightBefore: true, // muienfze: Figma 942:64899 above the mango scene
        insightAfterFigure: true, // mujukg3s (27 Sep): "move this section one place up", the mango scene now sits above the key finding
        noHeading: true, // mtnwdrvi: "remove this" on the h2; the serif question carries the section
        // Annotation mtmjlgwj: the question itself, big, in the system serif.
        // mtmvwqwy: rewritten in the Sauer register (claim first, then the question), gate green
        // muif9f05 (26 Sep): the serif question, TL;DR and prose are PARKED,
        // not deleted: to bring them back for the final push, drop the leading
        // underscore from the three keys below. The key finding frame
        // (insightBefore) and the mango scene stay.
        _serif: "Zepto means now. How do you promise later without breaking the trust of 10-min delivery?",
        _tldr:
          "Offering later on an app built for now is a trust problem before it is a design one.",
        _p: [
          "Zepto means instant. People open it precisely because they never have to wait, and that reflex is the whole reason they open it at all. So the moment you offer a future slot, you are asking for something the app has never asked before: trust that \"later\" will arrive exactly when promised, from the one product built on not making you wait.",
          "And \"later\" is the easy part to draw and the hard part to keep. Every hour it sits unfulfilled, it leans on the same instinct that makes \"now\" feel safe. So one question sat under every decision, and I kept coming back to it: how do you make \"later\" trustworthy without spending the trust that makes \"now\" work?",
        ],
        // Annotation mtmgd7ug: image frame from Figma Portfolio 2026 node 460-53090.
        // Annotation mtmh68zb: the card flips up as you scroll (photo + card as layers).
        scene: {
          aspect: [1392, 862],
          base: "/figures/scheduled/mango-photo.png",
          layers: [{ src: "/figures/scheduled/mango-card.png", x: 16.9, y: 40.7, w: 66.21, fx: "flip" }],
        },
        figure:
          "The promise, written down. A scheduled shipment is a card that says a time and keeps it, with one word left for changing your mind.",
      },
      {
        h: "My role",
        group: "Problem",
        // muim39ah + mujogrh9 (27 Sep): Figma 944-65104 layout (from Agam's
        // screenshot): label left, the statement large, the role paragraph
        // flowing through three columns, at case study frame default size.
        roleWireframes: true, // draft run after the role frame (SchedRoleWireframes)
        roleFrame: {
          // mujvc9e0: merged from the Role at a glance slide (Agam, 27 Sep)
          lead: "Lead designer on the project.",
          leadership: [
            "Working directly with design leadership and the CPO",
            "Managing expectations with the C-suite",
            "Partnering with the Senior Director of New Category", // mukpnlvb: ", in product" removed
          ],
          statement: "I led the interaction design end-to-end across product, content, and operations, over two 2025 releases.",
          // the body is the ORIGINAL role paragraph, as the Figma frame sets it
          body: "I led the interaction design end-to-end, working closely with my design manager, Shreya Garg. There was an existing pitch when I picked up the problem, but it didn't feel right, it didn't account for the real spread of cases. So the bulk of my work was mapping every flow and edge case, running the exploration (including a full parallel direction), and partnering with product and operations to keep the design honest against supply-chain reality. The core ran August to November 2025 across two releases, a deliberately narrow M1 in late October and the full multi-shipment M2 in mid-November, with PMs Nishit Raj and Kavya Jain, content design by Ciara Greenwood, and an engineering group that pushed hard on the edge cases. The post-launch validation study I ran with the PMs.",
        },
        tldr: "I led the interaction design end to end with my manager Shreya Garg, across product, content and operations, over two 2025 releases.",
        p: [
          "I led the interaction design end to end, working closely with my design manager, Shreya Garg. There was an existing pitch when I picked up the problem, but it didn't feel right. It didn't account for the real spread of cases, so I set it aside and started again from the map.",
        ],
        // mu3johvc: expanded on what leading it meant; every item sourced from Claude/Case Studies/2026-06-24_schedule-order-handoff-timeline.md
        // PARKED 27 Sep (not in the Figma frame): the "Leading it meant owning the
        // parts nobody hands you:" lead-in and these bullets; rename _ul to ul to restore
        _ul: [
          "The problem before the screens. In the first ten days I laid the whole problem space onto the canvas myself, before anyone reviewed it: the order lifecycle from placed to failed delivery, and edge cases from address changes and daily order limits to pharmacy and EMI orders. Most of those came back in engineering questions months later, already answered.",
          "The decisions, framed as bets. Where the pay button went on an unserviceable cart ran as two experiments, not an opinion. And I ran a full parallel direction to ground rather than defending the first one.",
          "The thread through every handover. The core ran August to November 2025 across two releases, a deliberately narrow M1 in late October and the full multi-shipment M2 in mid-November. The PM changed from Nishit Raj to Kavya Jain between them, content design came in with Ciara Greenwood's copy pass in October, and the design stayed one coherent system across all of it.",
          "Operations as a design partner. Slots, store hours and store capacity are supply-chain facts, so product and operations were in the room to keep every promise on screen one the warehouse could keep.",
          "The work after launch. Engineering pushed hard on the edge cases, and the answers were design answers: open the first day with a free slot instead of greying out an empty tab, and say plainly when a chosen slot has gone. I ran the post-launch validation study with the PMs, and the slot picker went on to carry the returns pickup flow.",
        ],
        // Annotation mtmhosfg: image frame from Figma Portfolio 2026 node 460-53298.
        // Annotation mtmhr8i0: the Figma frame is a 3285px column of Now / Later
        // clipped by an 862px card, so the motion is the column scrolling
        // through, between the purple ground and the egg cartons. Desktop MCP
        // was off, so the timing is scroll-linked rather than Figma's keyframes.
        scene: {
          aspect: [1392, 862],
          base: "/figures/scheduled/role/photo.png",
          layers: [
            // mtmhw76e: half the travel, so the words drift rather than rush
            { src: "/figures/scheduled/role/column.png", x: 10.8, y: -12.5, w: 77.6, fx: "drift", to: -35 },
            { src: "/figures/scheduled/role/overlay.png", x: -5.0, y: 0, w: 110.1, fx: "static" },
          ],
        },
        figure: "Now, later, now, later. The two words the whole job turned on, and the eggs that don't care which one you picked.",
      },
      {
        h: "The constraints",
        // mukvlu72 / mukvy9ql / mukw85nf: tried inside the section. mukwgm7k (28 Sep): the
        // text sits right of the heading again (the standard layout) and the animated
        // board runs FULL WIDTH, right after the section
        figNext: "schedExplorations",
        group: "Problem",
        // mukxbblb (28 Sep): the TL;DR takes the intro line, verbatim; was "One-hour
        // slots, peak-time fulfilment, and an ironclad delivery-window promise shaped
        // every decision." mukxaiwm: the paragraph that carried it is removed
        tldr: "Scheduled delivery sits on top of a live logistics system, so the design had to respect hard limits rather than wish them away:",
        // mukwqanr (28 Sep): "bigger font ... under that, a small explanation. The
        // bullet points don't work." Each constraint is now a title in the heading
        // size with a short line under it ({ t, d } items, see .article__terms)
        ul: [
          { t: "One-hour slots, on shaky ground", d: "Every slot was an hour wide, and early on, slot availability itself was unreliable." },
          { t: "Booked and live, side by side", d: "Pre-booked orders still had to go out through the peak windows, while live 10-minute demand kept flowing." },
          { t: "A promise kept, every time", d: "A 6–7pm slot had to mean 6–7pm. Behind the hour a user picked sat a fulfilment window of about ninety minutes, margin for the dark store, and we kept tuning it against real conditions." },
        ],
        // 5 Oct: the reach explorer (Pinterest ref, Morphocode Explorer): drag a
        // circle over a modelled city and watch instant, schedule-only and
        // unserviceable recount, with the 11 PM store closures one tap away
        figsAfter: [{ fig: "schedReachExplorer", bare: true }],
        // Annotation mtmh8tov: the availability tape moved to Impact.
        // Annotation mtmhxqlv: Figma Portfolio 2026 node 460-53299, taken apart
        // (mtmj7y2h): the phone is the ground, the notification card drops in
        // like a real banner when the section is reached.
        scene: {
          aspect: [1392, 862],
          bg: "radial-gradient(circle at 100% 0%, #c4a5f5 0%, #8b5cf6 100%)",
          layers: [
            { src: "/figures/scheduled/notify/phone.png?v=3", x: 15.22, y: 18.19, w: 69.41, fx: "static" },
            // clipped to the phone screen (wallpaper box 284,204 825x1793 of the
            // 1392x862 card; corner radius about 113px), so the drop-in is never
            // seen outside the phone (mtmk2odv). Card offsets are relative to it.
            {
              src: "/figures/scheduled/notify/card.png", fx: "notify",
              clip: { x: 20.4, y: 23.67, w: 59.27, h: 76.33, r: "13.7% / 17.2%" },
              x: -8.74, y: -4.99, w: 117.1,
            },
          ],
        },
        figure: "The promise on the lock screen: a date, a one-hour window, and a scooter that has to make it true.",
      },
      {
        // Annotation mtmi98gy: the breaker. mtmqq4xn: moved up one, now before One cart, many hubs.
        // Figma Portfolio 2026 node 315-29388.
        // mujqp1k6 (27 Sep): no longer a breaker; its own section, copy via the
        // writing harness (Sauer, gate 0/0), the cards below it.
        h: "Schedule means different things to different people. Even how they say it.", // mukw91sk (28 Sep); was "Two ways to say it"
        center: true, // mukwatlg (28 Sep): heading and text centred
        nav: "Two ways to say it", // the side index keeps the short name
        stack: true, // mukvym27 + mukvyska (28 Sep): the text sits below the heading
        group: "Problem",
        p: [
          "India is a diverse place, and it shows even in one word. One group says shed-yool. Another says sked-jool.",
          // "Either way, the word asks the same thing of someone: to wait. So the work was making that wait feel safe, however you say it.", // mukwb44m (28 Sep): removed
        ],
        // mtmk4qua: coded, so the faces move (PronCards); the flat export stays
        // at /figures/scheduled/pronunciation.png.
        // mukvom35 (28 Sep): the cards live INSIDE the section frame now, under the explanation
        figIn: "pronCards",
      },
      // 27 Sep, Figma 273:5430: stock stacked crate on crate, the tiered hubs the section explains
      // mukupuxq + mukvosrs (28 Sep): the crates breaker removed at Agam's request
      // { breaker: true, image: "/figures/scheduled/photos/crates-greens.webp" },
      {
        h: "The cart is a complex construct", // mujuxhxi (27 Sep): the heading says the claim (was "One cart, many hubs")
        group: "Problem",
        tldr:
          "Zepto ships from tiered hubs, so one cart splits into several shipments, each needing its own slot. The worst case split four ways.",
        // mujuytgf (27 Sep): Agam's four points, in the Figma 46:15909 layout.
        // "OSS" spelled out for readers: out-of-stock and unserviceable items.
        // points: ["Multiple shipments", "Pharmacy orders", "Out-of-stock and unserviceable items", "And more"], // mukuzieb (28 Sep): hidden for now, uncomment to restore
        pointsLabel: "What makes the cart complex",
        p: [
          "Behind every Zepto order is a tiered supply chain. A Mother Hub is the largest warehouse and stocks effectively everything; it feeds two kinds of fulfilment sites: superstores, larger warehouses carrying a broad catalogue, and dark stores, the small local sites that make 10-minute delivery possible. Categories are stored deliberately: fast-moving daily items sit in the dark store close to you, while bulkier or long-tail items live only in the superstore.",
          "That topology stays invisible until you build a mixed cart. Add ten things and some may be served from the dark store nearby while others can only come from the superstore, so the order does not arrive as one delivery. Zepto splits it into separate shipments, one per fulfilling site, and a single order can fan out to as many as four.",
          "Scheduling is what made the split bite. A slot is not a property of the order; it is a property of each shipment, because each shipment is fulfilled by a different site with its own capacity. So the moment someone schedules, every shipment has to answer the slot question independently, and the answers rarely agree. That produces a small matrix of cases the design had to hold all at once:",
        ],
        ul: [
          "Every shipment is schedulable for the chosen slot, the clean case",
          "Some shipments are schedulable and others are not, the common and awkward case",
          "No shipment is schedulable for that slot, so the user has to move their timing",
          "A shipment is unserviceable outright, because its store is closed or out of stock for that window",
        ],
        // fig: "schedSplit", // mukw52nu (28 Sep): replaced by the cart grid; uncomment to restore
        fig: "schedCartGrid",
        figBare: true, // mtmrnolv: no figure card around coded figures
        figure:
          "One cart, many hubs. A mixed cart fans out by fulfilling site (Mother Hub feeds the superstore and the dark store), so it ships in pieces, up to four. Scheduling is per shipment, so each answers the slot question on its own: the worst case is four shipments at once, one scheduled, one unavailable, one closed.",
        // divider: true, // mukxl134 (28 Sep): removed
      },
      {
        // mukxenvq (28 Sep): the sixth cart-grid tile became a section of its own:
        // the whole cart page (Figma Cart Master File 5C34trG8bBJZi3P48736Lb 1:25562,
        // 2x) inside the phone from the top of the page, scrolling as you pass
        h: "The whole cart, top to bottom",
        group: "Problem",
        tldr: "Every one of those constructs lives on one page. Scroll it end to end and you see how much the cart already carries before scheduling asks for room.",
        still: "/figures/scheduled/cart-page-full.webp",
        stillParallax: "long",
        figBare: true,
        figure: "The full cart page, top to bottom.",
        divider: true,
      },
      {
        h: "The explorations",
        figIn: "schedEtaScroll", // mukvt7cp (28 Sep): the callout variants, scrolling in right to left inside the section
        group: "Directions",
        tldr:
          "Before settling the flow I went wide on three questions: where scheduling lives, how the cart holds it, and how slots get picked.",
        // mukwz62i (28 Sep): "comment the explanation out for now", the body
        // paragraphs and list are parked; uncomment to restore
        // p: [
        // "Picking the eventual flow was the end of a longer search, not the start. The interesting decisions sat upstream: where in the app scheduling should even appear, how a multi-shipment cart should carry it, and what shape the slot picker should take. I explored each as its own question and kept only the answers that earned their place.",
        // "The most instructive failure was placement. I tried putting scheduling on the product page, so an out-of-stock item could be instant-scheduled right at the point of discovery. It went straight against the booking model. Scheduling is a management tactic you reach for once you have decided what to buy, not a discovery feature, and on a product page it read as a negative listing that made the option feel intimidating, exactly the fear we had that people would ask why they needed to schedule this at all. So it came back out, and scheduling stayed on the cart, where the decision is already made.",
        // "The cart and the slot picker had their own dead ends. A bottom sheet for the cart was lightweight but did not scale past a couple of shipments. A tab-per-shipment hid the other choices and lost trust (the sentence that decided it comes next). A merged-cart version blurred the per-shipment reality the whole feature depends on. For slots, a calendar was overkill for a Today-and-Tomorrow window. What was left standing was the shipped answer: scheduling on the cart opens a dedicated page that keeps every shipment distinct, each with its own slot picker.",
        // ],
        // ul: [
        // "Placement: PDP (killed, it fought the booking model and read as a negative listing) vs a restrained home prompt vs the cart, per shipment",
        // "Cart structure: a bottom sheet (didn't scale) vs a tab per shipment (killed, hid the other choices) vs one combined cart (blurred the per-shipment reality) vs the single-page listing",
        // "Slot picker: a calendar (overkill for a Today-and-Tomorrow window) vs the per-shipment picker on the dedicated schedule page that shipped (the inline-on-the-page treatment came later, for returns and refunds)",
        // ],
        // mukuyuyb (28 Sep): the explorations board moved to just below The constraints (figNext there)
        // figsAfter: [{ fig: "schedThreeBoxes", bare: true }], // muky4dn5 moved here; muky9i8p (28 Sep): hidden for now
        divider: true,
      },
      {
        // mukxfh9s (28 Sep): a new section below The explorations with three image
        // boxes; the title, TL;DR and the three assets are still to come
        // mukxmirl (28 Sep): this and Two directions below are ONE section now
        h: "Different ways we explored how schedule could exist on the app",
        group: "Directions",
        tldr: "I ran a tabbed flow against a single-page listing. One sentence in testing killed the tidier one.",
        p: [
          "\"I might forget the slots I picked for shipment one by the time I'm choosing the slot for shipment two.\"",
          "A participant said it out loud, mid-task, halfway through a cart she was trying to schedule. She was not complaining, just narrating her own worry. And in one sentence she ended a debate I had been running with myself for weeks.",
          "We had pointed her at the real worst case, not the happy path: a cart with some items unavailable or unserviceable for instant delivery, and the job was to find scheduling and book the unavailable item for a later slot. That was deliberate. Almost all real scheduling happens on exactly these mixed carts, so the test had to start there. The hard part was never the happy path. It was that Zepto splits a cart into multiple shipments, and scheduling lives at the shipment level, so one order can need a separate schedule per shipment.",
          "I had carried two directions into the room, nearly identical in construct and opposite in feel. One was tabbed: a tab per shipment, each holding its own instant-versus-schedule choice and slot grid, the simpler build and tidier on paper. The other kept every shipment on a single page, switchable in place. Then I watched what happened with more than one thing to schedule, which is to say almost always. The tabbed flow broke at exactly the moment her sentence named: move to shipment two, and what you chose for shipment one is on another tab, out of view. No running summary, nothing to hold onto, so people lost the picture and stopped trusting the earlier choice had even saved.",
          "The single page won, and not because it was prettier. It kept the record of your own choices in front of you the whole time: every shipment and its slot stayed visible, so scheduling across a fanned-out cart stayed legible. That is the lesson I took away, and it outlived this project: a summary you can see is itself a trust mechanism, because you commit to \"later\" only when you can see exactly what you committed to. So the evidence killed the tabbed flow, and I spent the craft on the harder one, making that dense, stateful page feel effortless.",
        ],
        // muky4dn5 (28 Sep): the three image boxes moved up into The explorations
        fig: "schedDirections",
        figBare: true,
        figure: "Before and after. Left, the rejected tabbed direction: move to shipment two and shipment one's chosen slot is on another tab, out of view. Right, the shipped single-page listing: every shipment and its chosen slot stay visible at once.",
        divider: true,
      },
      // mukxmirl (28 Sep): Two directions merged INTO the section above (its tldr, prose and figure moved there)
      // {
      //   h: "Two directions",
      //   noHeading: true, // mukxmirl (28 Sep): continues the section above, no heading of its own
      //   group: "Directions",
      //   tldr: "I ran a tabbed flow against a single-page listing. One sentence in testing killed the tidier one.",
      //   p: [
      //     "\"I might forget the slots I picked for shipment one by the time I'm choosing the slot for shipment two.\"",
      //     "A participant said it out loud, mid-task, halfway through a cart she was trying to schedule. She was not complaining, just narrating her own worry. And in one sentence she ended a debate I had been running with myself for weeks.",
      //     "We had pointed her at the real worst case, not the happy path: a cart with some items unavailable or unserviceable for instant delivery, and the job was to find scheduling and book the unavailable item for a later slot. That was deliberate. Almost all real scheduling happens on exactly these mixed carts, so the test had to start there. The hard part was never the happy path. It was that Zepto splits a cart into multiple shipments, and scheduling lives at the shipment level, so one order can need a separate schedule per shipment.",
      //     "I had carried two directions into the room, nearly identical in construct and opposite in feel. One was tabbed: a tab per shipment, each holding its own instant-versus-schedule choice and slot grid, the simpler build and tidier on paper. The other kept every shipment on a single page, switchable in place. Then I watched what happened with more than one thing to schedule, which is to say almost always. The tabbed flow broke at exactly the moment her sentence named: move to shipment two, and what you chose for shipment one is on another tab, out of view. No running summary, nothing to hold onto, so people lost the picture and stopped trusting the earlier choice had even saved.",
      //     "The single page won, and not because it was prettier. It kept the record of your own choices in front of you the whole time: every shipment and its slot stayed visible, so scheduling across a fanned-out cart stayed legible. That is the lesson I took away, and it outlived this project: a summary you can see is itself a trust mechanism, because you commit to \"later\" only when you can see exactly what you committed to. So the evidence killed the tabbed flow, and I spent the craft on the harder one, making that dense, stateful page feel effortless.",
      //   ],
      //   fig: "schedDirections",
      //   figBare: true, // mtmrnolv: no figure card around coded figures
      //   figure: "Before and after. Left, the rejected tabbed direction: move to shipment two and shipment one's chosen slot is on another tab, out of view. Right, the shipped single-page listing: every shipment and its chosen slot stay visible at once.",
      //   divider: true,
      // },
      {
        hidden: true, // muky55mj (28 Sep): "hide this section"
        h: "The real work",
        group: "Directions",
        tldr: "Choosing one page settled the concept, not the interaction. Where each control lived took numbered iterations.",
        p: [
          "Picking the single page was the start, not the end. A flexible, stateful page is easy to make overwhelming, so most of the craft went into the opposite: making density feel obvious. The open questions were where every control should live, whether the slot picker should be a bottom sheet or sit inline, which shipment should be open on arrival, and how to keep five shipments legible at once. It ran for several numbered iterations before it landed.",
          "Where it landed:",
        ],
        ul: [
          "Scheduling opens as its own full page, not a bottom sheet over the cart, listing every shipment at once so the whole order stays in view while you pick a slot per shipment (the slots-inline-on-the-same-page treatment came a step later, built for the returns and refunds flow)",
          "The shipment you arrived from expands by default; the rest stay collapsed but visible, status readable at a glance, so context is never lost",
          "Per shipment, a clear instant-versus-scheduled toggle, then its slot picker, with a Today and Tomorrow day row at launch (a later iteration dissolved that day boundary, the next section)",
          "Non-intrusive go-to-market, surfaced only where it helps (a homepage prompt when demand is high and the cart is not serviceable; the primary entry on the cart) rather than pushed everywhere",
          "Considered empty and exit states: what to save when someone leaves mid-flow, how each shipment's status reads at a glance, and an OTP screen tuned for a scheduled order",
        ],
        fig: "schedDateSwitch",
        figBare: true, // mtmrnolv: no figure card around coded figures
        figure: "The shipped slot picker, rebuilt from the real component: switching Today and Tomorrow re-animates the slot list. The detail that earns trust is honesty about supply, today is partial because earlier slots have already passed, while tomorrow opens a full day, so the day row is doing real work, not decoration.",
        divider: true,
      },
      {
        h: "One scroll across midnight",
        group: "Solution",
        tldr: "Today and Tomorrow shipped first. Later we dissolved the midnight line into one scroll, because at 11pm you are planning tonight, not tomorrow.",
        // mukxp4ks (28 Sep): three paragraphs condensed into one; the originals are
        // parked in _pLong below
        p: [
          "At 11pm you are not planning tomorrow, you are planning tonight, a little later, and a hard jump to a separate Tomorrow tab broke that one thought in half. The slots were always one-hour windows bucketed by time of day, with Earliest holding whatever is next bookable. The six post-midnight windows belong to both days: Late Night for today, Early Morning for tomorrow. So crossing the day relabels them in place instead of resetting, and a later iteration removed the seam entirely, one scroll straight past midnight.",
        ],
        _pLong: [
          "Picture it at eleven at night. The day row worked, but it carried a quiet assumption the clock does not share: that midnight is a wall. For the late-night shopper it is not. Someone picking a slot at 11pm is not planning tomorrow, they are planning tonight, a little later, and a hard jump from today's slots to a separate Tomorrow tab broke that single thought in half. The interface was filing the moment under two days; the person living it felt one.",
          "Underneath, the slots were always the same atom: one-hour windows, six shown at a time, bucketed by time of day. Earliest, Afternoon, Evening, Night, and then the edge cases, Late Night and Early Morning. Earliest is the dynamic one, it holds whatever is next bookable from now, so at 3pm Earliest might be the 3-to-6 block while Evening starts at six. That small move made the timeline read like the day actually feels rather than a fixed grid you have to translate.",
          "The detail I am proudest of lives exactly at the day's edge, in those six post-midnight windows. They belong to both days at once: the tail of today as Late Night, the head of tomorrow as Early Morning, the same hours wearing two names. So when you cross from Today to Tomorrow, those slots do not vanish and reappear. They relabel in place, Late Night becoming Early Morning, and you feel the switch as continuity rather than a reset. A later iteration went further and removed the seam entirely, letting the whole thing scroll as one timeline, because that is how the moment is actually lived: late tonight and early tomorrow as one shopping decision, not two calendar days.",
        ],
        fig: "schedPageReal",
        figBare: true, // mtmrnolv: no figure card around coded figures
        figure:
          "The continuous cross-day scroll: the slot list runs straight past midnight, Late Night giving way to Early Morning across the day's edge. The same six windows belong to both days, so crossing into tomorrow relabels them in place rather than jumping, because late tonight and early tomorrow are one shopping moment.",
        divider: true,
      },
      {
        h: "The go-to-market",
        group: "Solution",
        tldr:
          "We introduced it quietly: one small animated banner on the schedule page, and a prompt only when instant cannot serve the cart.",
        p: [
          "Push a new option everywhere and it reads as clutter that quietly dilutes the instant promise. Hide it and no one finds it. So the go-to-market was a design problem in its own right: surface scheduling only where it earns its place, and let motion do the introducing rather than a hard sell.",
          "On the schedule page, an animated banner sits at the very top, a small, friendly motion that frames the feature the moment you arrive in the flow. Away from it, the prompt to schedule appears only when it genuinely helps, when demand is high and the cart is not serviceable for instant, so it meets a real need instead of interrupting a working one. [Confirm the exact go-to-market surfaces and any banner copy.]",
        ],
        // fig: "schedGtmReal", // muky18to: moved into the plates box below
        figBare: true, // mtmrnolv: no figure card around coded figures
        _figure: // muky18to: parked with the figure (a caption alone draws an empty frame)
          "The exact schedule page, plated pixel-for-pixel from Figma, with only the top banner brought to life: a calm scheduled-time motion that frames the feature as you arrive, restrained so it never competes with the instant promise. [The banner motion is a coded stand-in; swap in the production Lottie to match exactly.]",
        // mukx11r8 (28 Sep): the banner playing on the phone, moved down from the top plates row
        platesStack: false,
        platesGradient: "linear-gradient(112deg, #f2e8ff 8%, #9674db 100%)",
        plates: [
            {
              fig: "schedGtmRealOne",
              figBare: true,
              bg: "linear-gradient(112deg, #f2e8ff 8%, #9674db 100%)",
              alt: "The go-to-market banner animation, on the phone: a sweeping clock and slot chips popping in.",
              // heading/sub retained but off while the frame is side by side
              _heading: "The go-to-market banner",
              _sub: "A small animated banner at the top of the schedule page introduces the feature the moment you arrive, restrained so it never competes with the instant promise.",
            },
          // mukxxiz5 (28 Sep): a second box to the right of the banner phone, content to come
          // muky18to (28 Sep): the schedule-page figure moved INTO this box from the section figure
          // muky60th removed the schedule page; muky9xug (28 Sep): only the RIGHT screen
          // was meant, so the box keeps the cart (the screen muky18to picked)
          { fig: "schedGtmCartOne", figBare: true, bg: "linear-gradient(112deg, #f2e8ff 8%, #9674db 100%)", alt: "The Zepto cart with the Introducing scheduled delivery banner" },
        ],
        divider: true,
      },
      {
        h: "The stuck cart",
        group: "Solution",
        tldr: "The hardest state was a cart that stays unserviceable even with a slot. I put it in plain sight.",
        p: [
          "The test scenario was deliberately the worst case, and it was also the hardest state to ship: a cart where an item stays unserviceable even with scheduling, because of a live supply gap. The instinct is to hide the broken thing. I did the opposite. The unserviceable shipment is flagged in place, with the honest consequence stated up front (the items are unavailable and will be removed on save) and, where a store is simply closed, an option to schedule for when it reopens.",
          "Showing the failure honestly is the same trust argument as the rest of the feature: people forgive a clear \"we cannot do this part\" far more than a cart that silently drops items. This state took months of UX-and-ops work to tame, and getting it right mattered more to trust than any happy-path screen. [Confirm this matches the shipped solution.]",
        ],
        fig: "schedStuckCart",
        figBare: true, // mtmrnolv: no figure card around coded figures
        figure: "The hardest state, shown in plain sight: the unserviceable shipment is flagged in place, the consequence stated up front (these items are removed on save), and where a store is simply closed, an option to schedule for when it reopens.",
        divider: true,
      },
      // mukycihg (28 Sep): the packed-crate photo moved up to open Cart-page states
      { breaker: true, image: "/figures/scheduled/photos/crate-packed.webp" },
      {
        h: "Cart-page states",
        group: "Solution",
        tldr:
          "The cart decides each shipment's fate before you ever pick a slot, so the real surface was a matrix. I drew and shipped every combination.",
        p: [
          "On a platform built on instant, the cart is the moment of truth: it has to read honestly whatever the supply situation is. Because one cart can split up to four ways and the Instant-versus-Schedule control resolves shipment by shipment, the cart page is not a screen, it is a matrix. The hard part is the Schedule button itself, which can be open, disabled, hidden, the only thing you can do, or gone entirely depending on what that shipment's store can actually honour.",
          "So I mapped and designed each cell rather than the happy path plus a catch-all. Every one of these is a real state a shipment can land in:",
        ],
        ul: [
          "Instant and Schedule both open: take it in 10 minutes, or book a later slot",
          "Instant works but no slot is open: Schedule is disabled, deliberately greyed rather than hidden, so the option still reads as real",
          "The PIN code cannot schedule at all: the Schedule button never appears, so it does not tease an option that is not there",
          "Instant cannot serve the shipment: Schedule becomes the only action, enabled and highlighted so the path forward is obvious",
          "Neither instant nor schedule works: the shipment is honestly blocked as store unserviceable",
          "A guardrail hit: scheduling caps at two ongoing orders at a time and five a day, so at the ceiling the Schedule option goes unavailable",
          "A first-run coach-mark teaching the new Schedule button the first time it shows up",
          "Items that go unavailable while you linger get moved to another shipment, and on save you can keep them in a wishlist",
          "Your chosen slot lapses while you step away: we ask you to review the schedule again before paying, rather than failing silently at checkout",
        ],
        fig: "schedCartStrip", // mukxwvur (28 Sep): was "schedCartStates", the fitted matrix
        figBare: true, // mtmrnolv: no figure card around coded figures
        figure:
          "The cart-page matrix, one tile per case: the Instant and Schedule control resolving per shipment (open, disabled, hidden, schedule-only, unserviceable), plus the guardrails and live-cart flow errors. [Reconcile against the shipped set, exact labels.]",
        divider: true,
      },
      {
        h: "Slot-page states",
        group: "Solution",
        tldr:
          "The slot picker is the dense page, so I mapped every state and designed each one so density never tipped into confusion.",
        p: [
          "If the cart page is the matrix, the scheduled page is the one screen where all that complexity has to feel effortless. A flexible, stateful page is easy to make overwhelming, so the work was the opposite: give every situation a deliberate state rather than letting the page degrade. That meant designing the empty and failure states with the same care as the happy path, because on a trust feature those are exactly the moments that decide whether someone schedules again.",
          "The full set I designed for the page:",
        ],
        ul: [
          "Default arrival: the shipment you came from expanded, the rest collapsed but visible",
          "Instant versus scheduled, per shipment: the toggle that starts every choice",
          "The per-shipment slot picker on the dedicated schedule page, with every shipment still listed behind it so the full order stays in view",
          "A slot picked: the chosen one-hour window held in the running summary",
          "Today booked out: tomorrow's slots lead, so the page is never a dead end",
          "No slots at all for a shipment: an honest empty state, not a silent failure",
          "The continuous cross-day scroll: tonight's last slot meets tomorrow's first, no jarring jump",
          "A partial schedule: some shipments set, some still instant, the summary keeping it legible",
          "Empty and exit states: what to save when someone leaves mid-flow",
          "An OTP and confirmation screen tuned for an order that arrives later",
        ],
        fig: "schedPageStates",
        figBare: true, // mtmrnolv: no figure card around coded figures
        figure:
          "The scheduled-page state set, one tile per case: default, instant, scheduled, slot picked, today-full, no-slots, cross-day, partial and the scheduled OTP, each designed so a dense page stays effortless. [Reconcile against the shipped set.]",
        // muky1muk (28 Sep): the prototype plate removed from here (kept below, commented)
        // // mukx078o (28 Sep): the live schedule-page prototype, moved down from the top plates row
        // platesStack: false,
        // platesGradient: "linear-gradient(112deg, #f2e8ff 8%, #9674db 100%)",
        // plates: [
        //     {
        //       auto: false,
        //       embed: figmaEmbedUrl("71cZSn6pTNf4zFzO07O2uv", "40000084-123917"),
        //       embedClickNode: "40000084:180821",
        //       bg: "linear-gradient(112deg, #f2e8ff 8%, #9674db 100%)",
        //       cueBox: [48.5, 30.6, 45, 7.8],
        //       cueLabel: "Click here",
        //       cueNoPointer: true,
        //       cueNoBox: true,
        //       cueClick: true,
        //       alt: "The scheduled order prototype, live from Figma",
        //       _heading: "The schedule page, live",
        //       _sub: "The shipped flow as a Figma prototype: switch to Tomorrow and the slot list re-animates. The cursor shows where to tap.",
        //     },
        // ],
        divider: true,
      },
      // 27 Sep, Figma 273:5431: the order packed, what booking sets in motion
      {
        hidden: true, // muky6p44 + muky6uaw (28 Sep): hidden for now, with its post-booking figure
        h: "After you book",
        // mukukpft (28 Sep): moved here from the central question; the tracking
        // card IS the after-booking promise. mukub9lc: the mango scene, duplicated with a different
        // element on a different background. Figma HBBgHT1u7e5jsz7BEEZ3fT
        // 284:6334: the purple crates, and the "Scheduled / Arriving today,
        // 7-8 AM" tracking card flipping up in the centre (586 x 642 on the
        // 1392 x 862 frame: x 28.95%, y 12.77%, w 42.1%).
        sceneAfter: {
          aspect: [1392, 862],
          base: "/figures/scheduled/tracking-crates.webp",
          layers: [{ src: "/figures/scheduled/tracking-card.webp", x: 28.95, y: 12.77, w: 42.1, fx: "flip" }],
        },
        group: "After booking",
        tldr:
          "Later is only trustworthy if it arrives, so most of the trust work sits after checkout: tracking built for a slot, reminders, and a hand-off back to instant.",
        p: [
          "A scheduled order spends almost all of its life after you have paid, and that is exactly where trust is kept or lost. Zepto's tracking page is built to say \"arriving in 10 minutes\"; for a scheduled order that line is wrong. So I designed a new card that leads with the commitment, \"Scheduled for Today, 6 to 7 PM\", and carries the same status onto the home page and into My Orders. The promise stays in front of you the whole time, not buried in a confirmation email.",
          "Because the order is hours away, it has to come find you. Reminders fan out across the channels people actually watch: a push notification, an in-app banner pinned to the foot of the home page, and a WhatsApp message. [WhatsApp was designed for; we did not have a WhatsApp engine live, so treat it as the intended reach, not a shipped channel.]",
          "The moment that matters most is the hand-off. Roughly half an hour before your slot the order \"wakes up\" and rejoins the normal flow: a rider is assigned, heads to the store, and the experience becomes the familiar 10-minute one, just landing inside your window instead of right now. The 10-minute promise is not abandoned for scheduling. It is deferred, then honoured. And you keep control of it: the slot is editable before you confirm, and the order is cancellable up to 30 minutes before the window, through the support chat. Fuller post-order editing came later. Riders get their own scheduled-order screen, so the operational side keeps up. And on the rare miss the feature stays honest rather than hopeful: if the slot slips you can cancel once it passes, and a longer breach auto-cancels with an apology and a ₹50 credit, so a broken promise ends cleanly instead of leaving you watching a countdown that never resolves. [Confirm the exact wake-up window and the rider-screen details.]",
        ],
        ul: [
          "A \"Scheduled for\" tracking card that replaces the default 10-minute line, mirrored on home and in My Orders",
          "Reminders across push, in-app (pinned at the home foot) and WhatsApp (designed-for)",
          "The roughly 30-minute wake-up: rider assigned, reaching the store, then the 10-minute experience inside your slot",
          "Slot edits before you confirm, and cancel up to 30 minutes before via the support chat (fuller post-order reschedule came later), plus a dedicated rider screen for scheduled orders",
          "A delight layer explored: an iOS Dynamic-Island live activity carrying the slot and rider status on the lock screen",
        ],
        fig: "schedPostBooking",
        figBare: true, // mtmrnolv: no figure card around coded figures
        figure:
          "The order's second life: a \"Scheduled for 6 to 7 PM\" tracking card, reminders across push, in-app and WhatsApp, and the roughly 30-minute wake-up where a rider is assigned and the 10-minute experience resumes inside your slot, carried on a Dynamic-Island live activity. [Plate the real tracking card and rider screen.]",
        divider: true,
      },
      // 27 Sep, Figma 273:5432: the order landed at the door, before the results
      // muky37n5 (28 Sep): the doorstep photo moved INTO Impact, right of the text
      // { breaker: true, image: "/figures/scheduled/photos/bag-doorstep.webp" },
      {
        h: "Impact",
        group: "After booking",
        sideImage: "/figures/scheduled/photos/bag-doorstep.webp", // muky37n5
        // muky37n5 (28 Sep): streamlined, "really difficult to read"; was the long
        // one-sentence version (adoption, 3x value, cancellation, appliances)
        tldr: "Adoption peaked at 1.72% of all orders and settled near 1.4%. A scheduled cart is worth almost three times an instant one. The real problem was cancellation, not lateness, and appliances are now over half the money.",
        // mukx8uu0 (28 Sep): "hide all this explanation info for now", the prose and
        // bullets are parked (underscored); drop the underscores to restore
        _p: [
          "The number I would put on a slide is not the one I would defend in a room. A year on, a month-by-month pull settles it: scheduled delivery grew from a two-store pilot in October 2025 to 1.81 million orders in May 2026, its best month, which was 1.72% of everything Zepto delivered. It has eased to about 1.4% since. That is a small, real slice of a very large business, and it is the number I would defend.",
          "It is not a planning-adoption number, though, and the honest version of this section is about why. When we decomposed it earlier, only about 1.3% of orders chose a slot in the windows when instant was fully available; the climb above that came from the windows when instant could not serve the cart. That matches what users told us: most people schedule as a fallback, not a plan. The warehouse still cannot prove it, because nothing records a customer who opened the slot picker and found nothing bookable. That gap is instrumentation we never built, and it is the first thing I would add.",
          "The value story is cleaner, and it got bigger when we measured it properly. In August 2026 a scheduled order was worth about 1,450 rupees against 543 for an instant one, and carried 5.85 items against 4.65. The 550-against-300 pair I had been quoting for a year turned out to be the median, not the mean; the medians are 561 and 332, so both numbers were right and I had been telling the quieter half of the story.",
          "Then the September pull explained the gap, and the answer was not the one I had been giving. I had been saying a scheduled cart is the weekly shop. The median cart is nothing of the sort, it is an instant order with a chosen hour, and the mean is carried by a tail that turns out to be large appliances. Items per order never moved: 5.4 to 6.3 all year, no break anywhere. Price per item went from about 160 rupees to 291, because Electronics and Appliances went from 21% of scheduled GMV in June to 54% by September, at 10,810 rupees an item. Only about 5% of scheduled orders contain one. Scheduled delivery is quietly becoming the appliance-delivery channel, which makes complete sense the moment you say it out loud: a fridge needs a time slot, a packet of biscuits does not.",
          "That reframes the feature rather than flattering it. An appliance delivery is a different product with different needs, installation, two-person handling, a real returns path, and we have been measuring it as though it were groceries. The failure numbers say so too: an appliance order is cancelled 34.4% of the time against 26.6% for every other scheduled order, that gap has widened three months running, and one in three never arrives at all. What it is NOT is the reason scheduled delivery looks bad overall, because support tickets are identical between the two groups at 166 per thousand. The 2.6 times ticket rate is ours, not the fridge's.",
          "And then the part that is harder to put on a slide. The most valuable order in the business is the one we serve worst. Scheduled orders raise 147 support tickets per thousand against 57 for instant, rate 3.98 against 4.32, and are cancelled 27.4% of the time against about 11%. Every one of those cancellations is somebody who booked an hour and did not get it. That is the bill for the promise, and it is the argument for spending on the feature rather than the argument against it.",
          "The last finding is the one I did not expect, and it changed which number I would report. Delivery inside the booked hour fell from 92.6% in February to 76.8% in September, which reads like a collapse. It is not. The fall is almost entirely early arrivals, up from 2.6% to 17%, while lateness peaked in May and recovered. Split August's ratings by arrival and early orders score 4.14 against 4.07 for orders that land inside the window, which is not a significant difference; late ones score 3.81, which very much is. So the claim the data supports is that arriving early is no worse, not that it is better. That is enough. If early arrivals are no worse, a metric that counts them as failures is measuring the wrong thing, and \"not late\" is the honest headline: by that measure the promise has held at 93 to 96% all year.",
          "I want to be careful here, because this is the slice the whole argument rests on and it has two problems. Late orders are 1.5 times more likely to be rated than early ones, so the sample self-selects on the thing being measured. And the week does not reconcile with its own month: it reports 13.3% late where the August table says 5.8%. The conclusion survives both, but it survives as a direction, not a decimal, and I would say so in the room.",
          "The other thing that did not survive is the explanation. The report reads early arrivals as a side effect of the move to 6 AM slots, riders setting off before a morning window opens. Decompose the 14.4 point rise against the slot mix and only 0.3 points come from the mix; 13.2 come from the rate rising inside every band at once, and by September the daytime band is the earliest of the three. The cause that fits that shape is batching: three quarters of scheduled orders ride along with an instant one, and a batched order inherits the instant order's dispatch clock, which is almost always earlier than the window. That is a better beat anyway, because it is a design problem rather than a rider one.",
          "And then the number nobody put on a slide, including me. Across eleven months, 3.66 million scheduled orders were cancelled. August alone is 421,145, and valuing each group's cancellations at its own order value puts that month at roughly 76 crore rupees of booked basket, of which 44 crore is appliances. Seven and a half percent of the orders, fifty-eight percent of the cancelled money. Rebase the reasons, and because the team confirmed a blank reason is a customer cancelling through the bot, 95.9% of those are people changing their minds and 3.6% are operations failing to serve the order. For instant orders the mix runs the other way. Lateness is an operations problem I can escalate. This one is a design problem, it is an order of magnitude larger, and I had been arguing about on-time rates instead.",
          "May is worth one more line, because it is the only month that looks like a demand story and is not one. Volume jumped by half, and the slot snapshot says why: on a flat store count, capacity at the 6 AM slot rose 64% and the number of open early-morning slots rose 37%. Sell-outs fell even as orders doubled. The demand had been sitting behind a supply wall the whole time, and 6 AM has been the busiest hour of the day ever since. Which raises the uncomfortable question the data cannot close: with sell-outs down to 7.8% and orders per store down a third from the May peak, supply stopped being the constraint and nothing replaced it. The one measurement that would tell us whether demand is being lost at the slot picker is the one nobody built.",
        ],
        _ul: [
          "Peak adoption 1.72% of all orders (May 2026, 1.81M scheduled orders), settling near 1.4%; about 1.3% in the windows when instant was fully available, so the rest is the unserviceable-window fallback",
          "Average order value about ₹1,450 against ₹543 for an instant order, and 5.85 items against 4.65 (August 2026); the medians are ₹561 and ₹332",
          "The mean is carried by large appliances, not big grocery shops: items per order never moved, price per item went ₹160 to ₹291, and Electronics & Appliances went from 21% of scheduled GMV in June to 54% by September",
          "An appliance order is cancelled 34.4% of the time against 26.6%, and one in three never arrives; but support tickets are identical between the two groups, so the gap against instant is not appliance-driven",
          "The cost of the promise: 2.6 times the support tickets, 2.5 times the cancellations and 0.34 stars lower than an instant order",
          "\"Not late\" has held at 93 to 96% all year; the within-slot metric fell 16 points only because it counts an early arrival as a failure, and the ratings say an early arrival is no worse than an on-time one",
          "The early arrivals are not the 6 AM move: 0.3 of the 14.4 point rise is slot mix, 13.2 is the rate rising in every band, which points at batching (75% of scheduled orders are batched)",
          "3.66M scheduled orders cancelled in eleven months, about ₹76 crore of booked basket in August alone and 58% of that value is appliances; rebased, 95.9% are customers changing their minds and 3.6% are operations failing",
          "The basket gap is a tail, not a typical cart: the MEDIAN gap is only ₹229, and 47.6% of September's orders were booked under two hours ahead",
          "GMV grew while orders fell: ₹94 Cr in May to ₹118 Cr in August, about ₹823 Cr since December, all of it order value rather than order count",
          "May 2026 was a supply release, not a demand shift: 6 AM capacity up 64% on a flat store count, and sell-outs fell while orders doubled",
          "More predictable order times let operations batch scheduled orders with live ones, cutting last-mile cost",
        ],
        // Annotation mtmh8tov: the 2026 slot-availability tape, under the first paragraph.
        inlineFig: "sdAvailabilityHero",
        inlineFigBare: true,
        inlineFigCaption:
          "Slot availability across 2026, replayed live: the share of carts offered at least one scheduled slot, per day. The two cliffs, in March and April, are the supply side the number above sits on.",
        // Annotation mtmkh1h3: the chart grid, built where the data exists and
        // specced where it does not. Sits before the phone figure.
        figsAfter: [
          // mukx9cdw (28 Sep): the availability tape, once hung off the (now parked)
          // first paragraph, stands on its own as the section's first figure
          { fig: "sdAvailabilityHero", figBare: true, bare: true, caption: "Slot availability across 2026, replayed live: the share of carts offered at least one scheduled slot, per day." },
          {
            // 27 Sep: the dashboard grid became a story (SchedMetricStory);
            // swap the fig back to "sdImpactCharts" to restore the grid
            fig: "schedMetricStory",
            figBare: true, // mtmrnolv: no figure card around coded figures
            bare: true,
            caption: "The graphs, from the verified month-by-month pull: volume and adoption, when people book and how far ahead, whether the promise was kept, the basket and what it costs, the slot supply underneath it, and the September threshold experiment. Four questions the warehouse still cannot answer are left as spec cards rather than estimated.",
          },
        ],
        fig: "schedImpact",
        figBare: true, // mtmrnolv: no figure card around coded figures
        figure: "The honest read: adoption peaked at 1.72% of all orders and sits near 1.4%, and only about 1.3% chose a slot when instant was fully available, so much of the lift is the unserviceable-window fallback rather than planned demand. The carts that did schedule were worth almost three times an instant one: ₹1,452 against ₹543 in August 2026.",
        divider: true,
      },
      {
        h: "What users told us",
        group: "After booking",
        // mukx7ffq (28 Sep): this section and Returns & refunds became ONE story
        // (SchedResearchStory), like the Impact metrics; the prose, stats, quotes
        // and personas figure are parked (underscored) and Returns is commented out below
        tldr:
          "We interviewed 45 users after launch. Most had scheduled because instant was unavailable, not because they planned to, and several asked why schedule on an app built for now.",
        _p: [
          "After the rollout we ran a mixed-method study: behavioural frames of several thousand users, 45 moderated phone interviews across twelve cities sampling the whole funnel, from people who scheduled and loved it to people who ended up confused about where their order was, and a read of the support tickets the feature threw off. The point was not to confirm we were right. It was to find where the feature was thinnest.",
          "The most useful finding cut against the original pitch. Of the people who placed a scheduled order, roughly eight in ten did it as a fallback, because instant was not available at that moment, not because they had planned ahead. The planning segment we designed for is real, the commuter ordering in the morning for the evening turned up almost word for word, but it is smaller than the fallback flow that an unserviceable cart creates. That reframes scheduling as much as a graceful answer to \"we cannot serve you now\" as it is a planning tool.",
          "And the trust thesis stopped being our hypothesis and became a direct quote. We had argued for two years that adding \"later\" to a \"now\" platform was a trust problem. Users said it back to us, unprompted: \"Why would I schedule an order if Zepto has already made a habit to get it at the earliest?\" One person, just seeing the slots, wondered whether instant had gone away entirely, and was relieved to learn it had not. That is the dilution fear, live, and it is exactly what the restraint was for.",
          "The sharpest feature ask was precision. The one-hour window, the thing we had ground so hard to get right, was still the top complaint: people wanted fifteen or thirty-minute slots, because a one-hour window leaves you guessing whether it lands at the start of seven or the end of eight.",
          "The hardest number was quieter and worse. Four hundred and fifty-four \"where is my order\" tickets came in from about 366 users, each on an order that was going to arrive exactly on time, and every single one was raised before the slot had even started. They were fallback users who never registered they had booked the future, so they panicked when \"now\" did not come. The worst of it clustered at midnight, where a same-day twelve-to-one slot reads as either AM or PM, and people cancelled thinking it had slipped to tomorrow. That one is on us, and it turned straight into design: an explicit \"Arriving today\" on the cart, morning and evening slot sections instead of a raw clock, and a notification that repeats the exact window after you book. The fix for a trust feature is almost always to say the true thing one more time.",
        ],
        _chart: {
          type: "stats",
          title: "Mixed-method, just after launch",
          data: [
            { value: "8", suffix: " in 10", label: "scheduled as a fallback, not a plan", note: "instant was unavailable" },
            { value: "454", label: "pre-slot \"where is my order\" tickets", note: "all raised before the slot began" },
            { value: "#1", label: "ask was finer slots, 15 to 30 min", note: "unprompted, most-named friction" },
          ],
          caption: "Most adoption was instant-unavailability fallback, not planned demand; the loudest objection was the trust one, the loudest request was precision, and the hardest number was hundreds of tickets raised before the slot had even begun.",
        },
        _ul: [
          "\"Why would I schedule an order if Zepto has already made a habit to get it at the earliest?\" the dilution objection, said out loud",
          "\"I was in back-to-back meetings and didn't want to forget to order later, so I was glad I could just schedule it\" the planning win, when it landed",
          "\"The ambiguity in a one-hour slot is there, I don't know if I will get it at the beginning of 7 or end of 8\" the top feature ask",
          "\"I ordered at night but it didn't come, I saw later it was delivering in the morning\" the confusion that drove cancellations",
        ],
        // Annotation mtmgqeqk: moved here from Context & problem; the personas
        // sit beside the study that found them.
        fig: "schedResearchStory",
        _figPrev: "schedUsers",
        figBare: true, // mtmrnolv: no figure card around coded figures
        figure: "After launch we asked, and the answers reshaped the feature: a fallback more than a plan, the trust fear said out loud, a window still too wide, and the same slots run backwards for returns.", // the figure only renders with a caption (hidden on this case)
        _figure: "Three high-intent moments where instant isn't the answer. The contextual prompt surfaces only when the cart can't be served now; each user has the same answer: later, not now.",
        divider: true,
      },
      // mukx7ffq (28 Sep): Returns & refunds folded into the What users told us story
      // {
      //   h: "Returns & refunds",
      //   group: "After booking",
      //   tldr:
      //     "The same one-hour slots became the backbone of a self-service returns and refunds flow, the reverse trip.",
      //   p: [
      //     "Returns are where consumer trust is quietly won or lost, and they are usually where you end up talking to support. With scheduling already built, the reverse trip became something you could self-serve: choose the items to send back, decide how the money comes back, and book the pickup on the very same one-hour slots that power delivery. [Confirm the exact framing of the R&R (returns and refunds) bot, and whether it is a guided self-service flow or a conversational assistant.]",
      //     "Two decisions carried it. The refund method is a speed-versus-source choice made legible: instant store credit (Zepto Cash, credited the moment you confirm) sits against a refund to the original account (3 to 5 working days), so the trade between speed and where the money lands stays the user's to make, both stated plainly. The pickup then reuses the exact scheduled-delivery slot picker, down to the same honest instant-is-unavailable-schedule-it-for-later fallback when reverse-logistics capacity is tight. The dense, stateful page I had already ground to ground did double duty.",
      //     "[Confirm the problem this replaced (support-driven returns, slow or opaque refunds, or both) and any outcome: support deflection, refund time, return-completion rate, and your role and dates on it.]",
      //   ],
      //   ul: [
      //     "Item selection for return, with the refund total shown live",
      //     "Refund method as a speed-and-trust choice: instant Zepto Cash against a 3 to 5 day refund to source",
      //     "Pickup booked on the same one-hour slots, with the instant-unavailable-schedule-later fallback",
      //     "Return guidelines stated up front (unused, original condition, tags and labels intact) so a pickup does not bounce at the door",
      //     "A confirmation that names the slot and the address, with a short self-attestation before Confirm",
      //   ],
      //   fig: "schedRnR",
      //   figBare: true, // mtmrnolv: no figure card around coded figures
      //   figure:
      //     "The self-service returns screen, real from the Schedule Order Handoff file: the items to return and the refund total, the instant-versus-source refund choice, and pickup booked on the same slot picker as delivery.",
      //   divider: true,
      // },
      {
        h: "Reflection",
        tldr: "The real challenge was perception: keeping a scheduled option from diluting the instant promise.",
        p: [
          "The subtlest problem was not UX at all. It was perception. Zepto means instant, so a scheduled option can feel counter to the whole brand. The answer was restraint: surface it only when it genuinely serves the user, and never let it dilute the 10-minute promise.",
          "What I would revisit: we shipped with one-hour slots and only in-flow slot edits, no full post-order editing, deliberate trade-offs to launch, not ideals. Fuller editing came later. Finer-grained slots never did.",
          "Should the platform drop 10-minute delivery? I do not think so. Instant is the moat, and without it Zepto becomes just another scheduled marketplace. But this work proved there is a real, high-value segment whose need is the opposite of instant, and meeting it quietly made the core product stronger.",
        ],
      },
      // mukq5ujj (28 Sep): "What I'd do differently" moved to the very bottom of the case study
      { h: "What I'd do differently", noHeading: true, roleWireframes: true, roleWireframesOnly: ["What I'd do differently"] },
    ],
    _todo: [ // mukx4g4z (28 Sep): hidden, drop the underscore to restore
      "Team and timeline: PM, eng, ops, and research partners, plus the dates",
      "One line: why a dedicated schedule page beat a bottom sheet over the cart",
      "Confirm the shipped unserviceable-cart solution (frames show items removed on save, plus schedule-for-when-we-open)",
      "Reconcile the coded story figures against the real Schedule Order frames (slot labels, the exact AOV and adoption numbers, the shipped stuck-cart copy)",
    ],
  },
  zepiris: {
    accent: "#4F46E5",
    deck: zepirisDeck,
    eyebrow: "Zepto · ZepIris · Case study",
    title: "Reimagining scalable face authentication at Zepto",
    meta: "Product Designer · Zepto · 2026",
    // Compact PDF cut (?cut=compact).
    pdfSections: [
      "Ten seconds at shift start",
      "The system everyone could game",
      "Two problems wearing one face",
      "Designing the capture, not just the model",
      "Protecting the people behind the portal",
      "The trade-off: how strict is strict enough",
      "Built for Zepto. Open for builders.",
      "Outcomes",
      "Reflection",
    ],
    cover: "ZepIris",
    lead:
      "ZepIris (internally OdinEye, after Odin's all-seeing eye) is Zepto's in-house face-authentication system, and its first open-source project. It clocks in riders, pickers, and packers and onboards new hires across every kind of Zepto site: personal phones in dark stores, shared tablets at the largest warehouses, and a web review portal. I led the design end-to-end across all three, and then the launch: the name, the brand, the carousel, the story. It reached 100% coverage of Zepto's hubs, unlocked up to ₹50L/month in savings by replacing an expensive third-party vendor, and shipped to GitHub as ZepIris.",
    sections: [
      {
        h: "Ten seconds at shift start",
        tldr: "Tens of thousands of shift-starts a day, each one a ten-second identity check in the worst possible conditions.",
        p: [
          "Every morning across Zepto, the same small moment repeats tens of thousands of times: a rider straddling a bike outside a dark store, a packer stepping out of a low-lit aisle, a queue forming at a Mother Hub gate at shift change. Each of them has to prove one thing before the shift can start: I am me, and I am here. They have about ten seconds, a budget Android phone or a shared tablet, and whatever light the warehouse or the street happens to offer.",
          "Attendance is the quietest system in a company like this, right up until it breaks. And at Zepto's scale, it was breaking.",
        ],
      },
      {
        h: "The system everyone could game",
        tldr: "OTPs slowed every check-in, buddy punching grew with scale, and a third-party vendor quietly taxed every order.",
        p: [
          "Attendance ran on paper registers and app check-ins, easy to game with proxy punches: a teammate runs your shift, you split the pay. OTPs slowed every check-in as headcount grew, and incentive programs turned small mistakes into real fraud. Face authentication fixes that, but the vendor Zepto relied on (Hyperverge) was neither cheap nor scalable; at Zepto's volume, every single order quietly carried a slice of that cost.",
          "The stakes ran higher than cost. India had already tried face-authenticated attendance at national scale for its lowest-income workforce, and the field record was grim: MGNREGA worksites where only one worker's attendance was captured in 45 minutes of retries, and wages lost to patchy networks. Whatever we built, a failure had to cost a retry, never a wage.",
        ],
        ul: [
          "Users: delivery riders, warehouse pickers and packers, and new-hire onboarding",
          "Conditions: low-end budget phones, low-light warehouses, patchy networks, and a rush of people at every shift change",
          "Goal: cut cost-per-order by dropping the vendor, without lowering verification completion or compliance",
        ],
      },
      {
        h: "The brief, and the clock",
        tldr: "Design end-to-end across phone, tablet, and web, in a two-month build, with the first end-to-end design shipped inside week one.",
        p: [
          "I led the design end-to-end, partnering with data science (the face-matching and liveness models), front-end and back-end engineering, and product. The surface was unusually wide, a phone design, a shared-tablet design, and a web portal, so much of the work was holding one coherent identity system across three form factors and three very different user contexts.",
          "It was a two-month build. The first month was mostly collaboration, planning, and design; I shipped a first end-to-end design within a week so engineering was never blocked, then kept refining and scaling it for new use cases as it rolled out.",
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
          "Capture was a design problem, not only a model one. Early on, people held the phone too close or shot off-angle and capture quietly failed. I added real-time, on-device framing guidance, built on Google's ML Kit face detection (face centred, both eyes open, not too close), so the screen coaches a good capture and rejects a bad one before a single byte is ever sent. That single change significantly lifted capture success rates, and it is also the cost model: the backend only ever pays for one validated frame per attempt.",
          "Retry stays instant and judgment-free: a blurry frame just asks for another. No OTPs, no typing, just a selfie, making the right capture the path of least resistance. Every rejected frame doubles as instruction, so the camera coaches instead of judging.",
        ],
        image: "/zepiris-stack.png",
        figure: "Every validated capture becomes a 512-d ArcFace-family vector (AuraFace or InsightFace buffalo_l), matched by Milvus ANN search and wrapped in an auditable portal.",
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
          "Every face-match rides on a threshold, and it's a real design tension: too strict and honest people get rejected and re-try in the cold; too loose and security slips. Attendance, onboarding, and audits don't want the same answer. So instead of one global setting, verification became configurable per workflow, each context tuned to its own balance of friction and risk. The launch blog later confirmed it verbatim as a shipped capability: configurable thresholds per workflow type. Where I landed was a single bias: fail toward a retry, never toward a wrong accept or a lost wage. A false accept is a security breach, while a false reject just costs another try, so strictness scales with how permanent and how rare the decision is. Onboarding and audits, where a face is bound to an identity once and for keeps, sit strict. Daily attendance, run thousands of times a shift in the worst light, sits deliberately forgiving, because there an over-strict threshold does not just add friction, it leaves a worker re-trying in the cold to get paid. The call that settled every close one was the principle the project started from: failure should cost a retry, never a wage.",
          "The same principle showed up at enrolment: every new registration runs a one-to-many search against the whole workforce first, so a face that already exists gets flagged before it can become a duplicate identity, one of those quiet backend rules that saves the 1:N search from slowly filling with ghosts.",
        ],
      },
      {
        h: "Built for Zepto. Open for builders.",
        tldr: "I designed the release itself: the name, the zep.IRIS lockup, the launch carousel, and the story of why Zepto opened it up.",
        p: [
          "Then came the part I did not expect to own: the release. Open-sourcing ZepIris was Zepto's first, and a first needs a face. I named the launch story, built the zep.IRIS brand lockup, and designed the launch carousel and post with the data-science team: the problem statement, the two-contexts framing, the pipeline in three beats, and the closing invitation, /clone ZepIris. Built for Zepto. Open for builders.",
          "The open-source boundary is telling: what shipped to GitHub is the backend (the API, the ML inference service, the vector-search stack). The entire capture experience, the ring, the coaching, the kiosk choreography, the review portal, stayed internal. The repo is the engine; the experience layer is the product.",
          "It landed. v1.0.0 went up in late May 2026 and picked up hundreds of stars within weeks, with public recognition from Zepto's co-founder, CTO, and the data-science team.",
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
          "Open source: v1.0.0 in May 2026, hundreds of GitHub stars in the first weeks",
        ],
      },
      {
        h: "Next: capture that adapts to you",
        tldr: "The v2 thesis, researched and specified: the system reads the person and the conditions, and adapts to them, never the other way round.",
        p: [
          "The v1 flow asks every face to satisfy one canonical capture. But faces genuinely differ (adult eye-to-eye distance alone spans a 1.5x range), light differs, phones differ. So I researched and specified the next layer: a capture ring that fits itself to your face's geometry and asks only for the shortest correction; a ladder of low-light interventions that starts with invisible camera moves and ends with the screen itself becoming the light source, because on a budget phone, simply brightening a dim screen physically cannot deliver the roughly 100 lux a clean exposure needs; and the same adaptive thinking for the shared kiosk, which digitally pans to meet each worker at their own height.",
          "The research behind it reframed the whole idea: NIST traces demographic accuracy gaps in face recognition to capture quality, not faces, which means capture that adapts to the person is not a nicety, it is a fairness intervention. The full spec, sixteen patterns, a motion system, and the evidence, lives in the ZepIris PRD.",
        ],
      },
      {
        h: "Reflection",
        tldr: "The hard part was making one identity layer feel native across three very different contexts, cheaply, at scale.",
        p: [
          "The hard part of a system like this was never the camera screen. It was making one identity layer feel native to a rider on their own phone, a hub worker on a shared tablet, and a reviewer at a desk, in low light, on weak networks, cheaply enough to beat a vendor at Zepto's scale.",
          "And the deepest lesson sits in what the system must never do: in a product where the failure currency is someone's wage, every dead end has to land on a human who can say yes. A camera can coach, a model can match, but the last word belongs to a person.",
          "[What I'd do differently next time (to add).]",
        ],
      },
    ],
    todo: [
      "Confirm your exact title for the project",
      "Your take on the threshold trade-off, where you landed and why",
      "Link the co-founder/CTO launch posts (the public-recognition evidence) before using the word viral anywhere",
      "Anything you'd do differently, for the reflection",
    ],
  },
  jarvis: {
    accent: "#DB2777",
    eyebrow: "Zepto · JARVIS, shipping as Edge · Case study",
    title: "The layer someone else was building",
    meta: "Product Designer · Zepto · 2026",
    // Compact PDF cut (?cut=compact).
    pdfSections: [
      "The question after the dashboard",
      "Someone else was building our layer",
      "My role",
      "The wedge, run as experiments",
      "Two rules the product cannot break",
      "Five widgets, one workhorse",
      "Decisions",
      "The scoreboard",
    ],
    cover: "Jarvis",
    lead:
      "JARVIS is the AI product I lead inside Zepto Ads, shipping to brands as Edge. It began with a question every advertiser asked and no dashboard could answer: I can see my numbers, now what do I do? We tested the first answer as live experiments, AI campaign recommendations and a predicted-performance review; about 30% of advertisers adopted them and they added roughly ₹60L a month. Then we discovered someone else was building the rest of the answer: an outside bot, founded by ex-Blinkit operators, selling brands an AI layer on top of Zepto's own data. This is the story of designing Edge, the copilot that closes the loop from metric to insight to one-click action, on two rules that make the trust math work: serve the brand's goal, not Zepto's revenue, and make every suggestion legible and reversible.",
    sections: [
      {
        h: "The platform underneath",
        tldr: "Zepto Ads is where brands buy reach; a revamp I worked across had just made buying clear, and made the platform worth defending.",
        p: [
          "Zepto Ads is how brands reach shoppers on a quick-commerce app. Through 2026 I led and contributed to a revamp of the buying experience: a pre-creation flow built around a clear hierarchy of campaign types, each with its pricing and a real preview, plus sharper spend levers (Ad Multiplier, Day-Parting, expanded PCA inventory). Brand teams at HUL and P&G called out the clarity gains, and the new inventory and frameworks added crores a month.",
          "That work matters here as the stage. It made the platform legible enough that brands started asking the next question, and valuable enough that the answer was worth fighting for.",
        ],
        split: "media",
        figure: "Caption: the pre-creation flow, campaign types with their pricing and previews. [Figma: Ads Revamp.]",
        divider: true,
      },
      {
        h: "The question after the dashboard",
        tldr: "Brands could finally see their numbers; they still could not act on them. And destination surfaces had already proven they don't get visited.",
        p: [
          "Every advertiser conversation ended at the same wall. The dashboards answered 'how did I do?' but the money question is 'what do I do next?', and answering it meant a human analyst, a spreadsheet, and a week. Worse, when a metric moved, the tools showed the symptom, never the driver; in a mesh of brands, cities, SKUs, and campaigns, naive correlation credits the wrong cause.",
          "We also knew where the answer could not live. Elevate, our existing insights destination, taught us the hard number: when users have to go somewhere to get intelligence, only about 22% open it and under 4% engage. Whatever we built had to come to the brand, in the flow where they already work.",
        ],
      },
      {
        h: "Someone else was building our layer",
        tldr: "GobbleCube, founded by ex-Blinkit operators, was already selling brands an AI optimisation layer on top of Zepto, without Zepto's data or consent.",
        p: [
          "While we debated, the market answered. GobbleCube, a startup founded by ex-Blinkit operators, raised a reported $15M Series A and reached roughly $2M ARR in nine months, selling about 400 brands, including HUL, Tata, and Reckitt, an AI layer that watches their quick-commerce performance and tells them what to do, across Amazon, Blinkit, Flipkart, and Zepto.",
          "Read that again from Zepto's side: an outside company was becoming the intelligence layer for our own advertisers, on scraped and exported views of our own data. If a bot owns the 'what do I do next?' conversation, the platform becomes a dumb pipe that executes someone else's decisions. Zepto's own tools, Atom and Zepto GPT, could answer questions when asked, but nothing was proactive and nothing closed the loop into action. That gap was the brief.",
        ],
        divider: true,
      },
      {
        h: "My role",
        tldr: "I lead design for JARVIS end to end: the problem framing, the product structure, the widget system, the voice, and the rollout design.",
        p: [
          "I lead design for JARVIS end to end. That has meant the unglamorous whole of it: framing the problem before any screens, structuring what v1 is and deliberately is not, designing the widget system and both surfaces, writing the product's voice, and designing how it rolls out to live, revenue-carrying accounts. Day to day the build runs as a small core: the data-science head, a senior PM from the ads team, and the dev leads of the ads front-end and back-end teams, with the key-account org joining for rollout. As this is written, v1 is rolling out.",
        ],
      },
      {
        h: "The wedge, run as experiments",
        tldr: "Before betting on a copilot, we ran guidance as live experiments: AI recommendations and a predicted-performance review reached about 30% adoption and roughly ₹60L a month, de-risking v1.",
        p: [
          "Before betting the platform on a copilot, we ran the smallest version of guidance as live experiments, deliberately scoped to test whether v1 was feasible at all. Ad Recommendations surfaces campaigns from a brand's past performance and fit instead of a blank slate, and Campaign Review reads a draft and shows predicted performance with suggestions before it goes live, turning the last click from a rubber-stamp into a moment of confidence.",
          "The experiments worked. Adoption reached about 30% of advertisers and the work added roughly ₹60L a month in incremental revenue in its first month, with HUL and P&G teams calling out the confidence gain. More important than the revenue was what the reads proved: brands will act on machine guidance when the reasoning is visible. That evidence is what made the full copilot fundable, and v1 ships on the back of it.",
        ],
        split: "media",
        figure: "Caption: ad recommendations, and the campaign review surface with predicted performance. [Figma: Ad Elevate.]",
      },
      {
        h: "A brand-true image library, built with AI",
        tldr: "Ad creatives kept bottlenecking on stock and one-off shoots, so I built an AI-generated image library, kept on-brand with Figma Weave, that gives every campaign type a ready, consistent look.",
        p: [
          "Guidance was one half of the AI story; creative was the other. Every new campaign type needed hero and lifestyle imagery, and leaning on stock or one-off shoots meant uneven quality and a long lead time before a format could even be previewed. I built a product image library generated with AI, so every campaign type had a ready set of on-brand visuals to pull from.",
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
        h: "Framing before screens",
        tldr: "Edge started as a problem-framing exercise: seven how-might-we questions, a 35-source competitive teardown, and six problem statements, which surfaced a whitespace no incumbent touches.",
        p: [
          "Edge did not start in Figma. It started as a framing document: seven how-might-we questions, from 'how might we tell a brand what moves what, defensibly?' to 'how might we time and pace proactivity so it lands as help, not noise?'. Then a competitive teardown across 12 incumbents, from GobbleCube to Amazon Ads to Tableau Pulse, run as a multi-agent research sweep over 35 cited sources, with every vendor claim tagged and fact-checked before it was allowed to shape a decision.",
          "The synthesis became six problem statements, and one of them turned out to be whitespace. A media buyer, a brand lead, and a leadership team need the same data at three different altitudes, but every incumbent differentiates by permission, not by altitude, so executives get operator noise and operators get executive abstraction. Nobody markets a fix. Rendering one data spine at three altitudes became Edge's most defensible idea, and it came from the framing, not from a screen.",
        ],
        table: {
          cols: ["Problem", "Who hurts", "The move"],
          rows: [
            ["Brand families", "HUL-scale advertisers with dozens of sub-brands, and SMBs drowning in hierarchy they don't need", "A brand-family tree with weighted roll-up for giants; a flat, prescriptive next-best-action list for SMBs"],
            ["Trustworthy drivers", "Anyone whose ROAS moved and got a symptom, not a cause", "Decompose the change into a significance-ranked waterfall, control confounders, show confidence and caveats"],
            ["What and when", "Brands buried in pings that ignore their goal", "The brand's stated goal reshapes which suggestions generate; rank by uplift, pace to an attention budget"],
            ["Legibility of money moves", "Brands asked to spend more by the platform that profits from it", "Formula-backed derivations, predicted impact, honest scope, approve-with-audit"],
            ["Role and altitude", "Buyers, brand leads, and leadership all served one framing", "One data spine rendered at three altitudes; the whitespace no incumbent markets"],
            ["Competitive defense", "Zepto itself, versus the outside bot", "Close the loop with first-party fidelity: live stock binding, one-click write-back, a scoped trust boundary"],
          ],
          caption: "Six problem statements from the framing phase; each traces back to a how-might-we and forward to a v1 decision.",
        },
        fig: "edgeAltitudes",
        figure: "The whitespace, drawn: one data spine rendered at three altitudes. The buyer acts, the lead steers, leadership glances; no incumbent differentiates this way.",
      },
      {
        h: "Two rules the product cannot break",
        tldr: "Serve the brand's goal, not Zepto's revenue. Make every suggestion legible and reversible. Everything else is negotiable.",
        p: [
          "An ads platform recommending more ad spend has an obvious conflict of interest, and brands are not stupid. So Edge's constitution is two invariants, written before the widget system and enforced through it.",
          "First: every suggestion must visibly advance the brand's stated goal, iROAS, awareness, or conversion, never platform revenue. The goal is an input that reshapes what gets suggested at all. Second: every suggestion must be legible and reversible. It leads with the symptom, names the driver with a confidence level and an honest scope note (down to 'this ignores margin'), quantifies the predicted impact, and gates any money-moving action behind a one-click approve with an audit trail and a 24-hour undo.",
          "These two rules are why the trust math works. The outside bot can claim neutrality; Edge has to prove it, structurally, on every card.",
        ],
        divider: true,
      },
      {
        h: "Five widgets, one workhorse",
        tldr: "The whole product is five primitives, and one locked rule: the moment a message carries an action, it becomes a card, not prose.",
        p: [
          "Edge ships as two surfaces, a persistent floater that rides the pages brands already use and a full tab that makes Edge legible as a product, sharing one conversation state. Underneath, the entire system is five primitives: a launcher, an inline prompt attached to any metric or campaign row ('Why did this drop?'), an insight card, a chat panel in three sizes, and a toast-and-bell pair for urgent alerts.",
          "The insight card is the workhorse. Five variants (suggestion, alert, diagnostic, draft, comparison) share one anatomy: a variant badge, one claim sentence, one primary action, a 'why?' toggle that opens the reasoning, and a dismiss. And one rendering rule is locked: as soon as a message carries a primary action, it is a card, never styled prose. Chat can explain; only a card can act. That single rule keeps conversation and consequence visually distinct, which is what makes one-click apply feel safe.",
          "The MVP discipline was equally explicit: launcher, sidebar chat, two card variants, inline prompts on Analytics only, one toast. Everything else, three more card variants, the bell backlog, the reasoning toggle, full-page chat, was deliberately sequenced behind it.",
        ],
        fig: "edgeCard",
        figure: "The workhorse, dissected: one anatomy carrying five variants. The parts never move; only the voice changes. And the locked rule underneath: carries an action, so it is a card, never prose.",
      },
      {
        h: "Decisions",
        tldr: "The forks that shaped Edge, and the directions we turned down on evidence, not taste.",
        p: [
          "Six forks in the design, and the option we said no to at each one:",
        ],
        table: {
          cols: ["The fork", "The call", "Why"],
          rows: [
            ["Where Edge lives", "A floater riding existing pages, plus a tab; not a destination bot", "Elevate proved destinations fail: about 22% open, under 4% engage. The floater meets nearly all traffic where it already is"],
            ["What Edge may touch", "Mutate with explicit approval; not read-only, not autonomous", "Approval makes 'action taken on Edge' a real, measurable metric; autonomy waits for audit, rollback, and safety evals in v2"],
            ["Action rendering", "Any message with an action becomes a card", "Conversation and consequence must look different for one-click apply to feel safe"],
            ["Proactivity pacing", "Interrupt cap of about one a day, digest for the rest, festival-aware baselines, dismissal cool-downs", "A stream of pings reads as noise; pacing is what makes proactivity land as help"],
            ["Sample prompts", "A curated, fixed set in v1; not model-generated", "Predictable behaviour for evaluation before we let the model improvise"],
            ["Rollout", "Top 50 brands by spend with account managers in the loop, then 50%, then 100%", "Live money deserves named-account betas before general release"],
          ],
          caption: "Each 'no' had a number or a precedent behind it; these six rows are the case study's honest spine.",
        },
        fig: "edgeFloater",
        figure: "The biggest fork, animated: Edge lives as a pill on the pages brands already use. It escalates only when money is burning, and opens already knowing what you are looking at.",
        divider: true,
      },
      {
        h: "The voice",
        tldr: "Edge talks like a sharp ops lead who has already done your homework: short sentences, real numbers, the next move ready to go.",
        p: [
          "AI products default to a voice that is polite, hedged, and long. For a brand manager mid-campaign, that voice is friction. I wrote Edge's voice as a design system in its own right: direct, tactical, forward. Specific numbers over adjectives ('₹12K wasted' beats 'significant waste'). Verbs that move: shift, pause, rotate, cut. Every message ends with a next step. No emoji, no exclamation marks, no 'Great question!', and a banned-word list that executes the corporate register on sight: leverage, synergize, seamless, circle back.",
          "The before-and-after makes the case faster than the rules do. Before: 'I've analyzed your campaign performance and noticed that the click-through rate has experienced a noticeable decline over the past few days. This may be attributable to a number of factors we should investigate together.' After: 'CTR dropped 22% on Monday. Likely creative fatigue on banner B, live 14 days, frequency 8.2. Rotate two variants?'",
          "The same fingerprint runs from the floater's idle pill ('Ask Edge') to the empty state ('Hey Beco. I run your numbers, ship campaigns, and catch what's bleeding.') to the apply confirmation ('Done. Live in 4 minutes.' with Undo beside it). Voice is the part of an AI product users touch most often; it deserved a spec, not an afterthought.",
        ],
      },
      {
        h: "Shipping into live money",
        tldr: "The scariest alert is also the wedge: 'this SKU is being advertised and goes out of stock by 7 PM.' Only Zepto can know that, and Edge is how brands find out in time.",
        p: [
          "Edge's launch design starts from the one alert no outside bot can build: the real-time join between what a brand is advertising and what its dark stores are about to run out of. '3 advertised SKUs going OOS in BLR-South by 7 PM' is money actively burning, it is quick-commerce-native, and it is only knowable with first-party stock data. That alert is v1's magic moment and, honestly, its single biggest data dependency.",
          "The rest of the shipping design is restraint. Single-user threads with shared alerts in v1, multi-user write permissions deferred. WhatsApp alerts deferred. Conversation state continuous between floater and tab so no thread is ever orphaned. And the rollout runs top-50 brands with key-account managers in the loop for the first weeks, then 50%, then everyone: live budgets earn a slow ramp.",
        ],
        fig: "edgeOos",
        figure: "The magic alert, start to finish: the toast lands, the card explains the join, one click pauses the SKUs, and the undo stays open. No outside bot can see both sides of this.",
      },
      {
        h: "The scoreboard",
        tldr: "Edge is rolling out now, so this study declares its scoreboard rather than quoting early numbers: the metrics were designed before launch, at three levels.",
        p: [
          "The wedge experiments and their reads are above. Edge v1 is rolling out as this is written, and a product built on legibility should not quote numbers before the cohorts behind them have matured. What I can show is the scoreboard we committed to before launch, designed at three levels so product wins cannot hide business losses, or the other way around.",
        ],
        table: {
          cols: ["Signal", "The question it answers", "Level"],
          rows: [
            ["Edge interactions per brand per week", "Is it part of the weekly workflow, or a demo?", "Product"],
            ["Apply rate: actions taken via Edge", "Does advice convert into action? The metric the approval gate exists to make real", "Product"],
            ["Month-on-month budget per Edge-active brand, versus control", "Does guided spending grow accounts?", "Business"],
            ["Budget utilisation rate", "Do brands actually spend what they book?", "Business"],
            ["Median and p95 latency, and cost per successful interaction", "Can we afford the copilot at scale?", "System"],
            ["Hallucination rate on a curated eval set", "Can the reasoning be trusted before it touches money?", "System"],
            ["Thumbs-up rate and NPS", "Do brands want it back tomorrow?", "Product"],
          ],
          caption: "The scoreboard, declared before the score. Numbers land here as the rollout cohorts mature.",
        },
      },
      {
        h: "Reflection",
        tldr: "The docs skew HUL-shaped; the SMB promise must not become a footnote. And the eval set is design work, not an engineering chore.",
        p: [
          "Two honest worries, written down now so they cannot be quietly forgotten. First, almost every hard example in Edge's framing is an HUL-shaped enterprise, yet the design promises SMBs a flat, prescriptive mode; if the long tail gets a scaled-down enterprise product instead, we will have failed the persona that needed guidance most. Second, the hallucination eval is on the scoreboard, which means someone has to design what 'wrong' means for a suggestion that moves money; I count that as design work, and it is mine to shape.",
          "The autonomy line will also move. v2 plans a rule engine that acts within guardrails, and the only reason that will be safe to ship is the discipline v1 builds now: approvals, audits, undo, and a scoreboard that measures trust instead of assuming it.",
        ],
      },
    ],
    todo: [
      "Team CONFIRMED (Agam, 2026-07-05): DS head + senior PM (ads) + dev leads of ads FE and BE teams. Add individual names only if Agam wants them public. STATUS UPDATE (Agam, 2026-07-20): v1 IS ROLLING OUT NOW; the 'month from rollout' lines are corrected. Next: fill the scoreboard with real cohort numbers as they land, which is the single highest-value upgrade to this case",
      "Wedge numbers CONFIRMED as feasibility experiments for v1 (not shipped product); reframed accordingly. Fill the scoreboard as v1 cohort numbers stabilise",
      "GobbleCube naming CLEARED by Agam (2026-07-05); deep competitor dossier stays in the locked /work/jarvis-prd (passcode edge2026)",
      "Real screens still to export from Figma: Ads Revamp (pre-creation) and Ad Elevate (recs + review) for the two design-plate placeholders",
      "The old revamp-only sections (pre-creation detail, Multiplier/Day-Parting, PCA phasing) were compressed into 'The platform underneath'; parked in git history if a separate platform-revamp entry is ever wanted",
    ],
  },
  dassh: {
    accent: "#EA580C",
    deck: dasshDeck,
    eyebrow: "Dassh · Case study",
    title: "Building a B2B SaaS from the ground up",
    meta: "Design consultant & Director · Dassh · 2025",
    // Compact PDF cut (?cut=compact).
    pdfSections: [
      "Context & problem",
      "My role",
      "The bet: an AI employee, not another tool",
      "Designing the call",
      "What the pilots changed",
      "Asking about the day, not the dashboard",
      "The homepage is a daily report",
      "From pilots to a company",
      "Outcomes & reflection",
    ],
    cover: "Dassh",
    lead:
      "Dassh builds Stella, an AI recruiter that does the execution work of hiring: screening CVs, calling and messaging candidates, running first-round interviews, and keeping the ATS up to date, so the people stay free for judgement. I joined as a design consultant and a director to build the product from zero, the four experiences it ships as, the agent system underneath, including the conversation design of the calls Stella makes to real candidates, and the design system that turned Figma files into production code. Stella now runs live hiring for enterprises like Zydus Lifesciences and Increff. Over 2025 the work took it from zero to those pilots and, as the year closed, a ₹1.2 crore raise.",
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
          "Stella is the chat-first experience: full screen, almost no chrome, the conversation is the interface. The agency view is the dense power-user surface: tables, filters, kanban, bulk actions, built for speed. The manager view is summary-first, the system writes the first thing you see, with green, amber and red health signals so a glance is enough. The candidate experience is a light portal plus the messages, calls and interviews the agents run, designed to feel like texting a helpful person rather than navigating a portal. Two rules hold that last surface together: density follows the audience, the operator needs the detail but the candidate only needs the meaning, so their components distil rather than display; and wherever a candidate meets Stella, app, email, WhatsApp or a call, it is the same voice carrying one continuing conversation.",
        ],
        fig: "stellaOnboarding",
        figure:
          "Onboarding is a conversation: Stella greets you and guides setup, connect the ATS, set preferences, pick a plan, ticking the checklist off as you go.",
        divider: true,
      },
      {
        h: "Designing the call",
        tldr: "The deepest design problem was the calling agent, and we earned it with research: persona-tuned call flows at Zydus, and a 43-call field study that found the calls dying inside our own system, not at the candidate's no.",
        p: [
          "Of all the agents, the calling agent carried the hardest problem, and it is not a modelling problem. A first-round phone screen looks like the most automatable object in hiring: short, repetitive, the same few fitment questions every time. Now take the other end of the line. The candidate is often answering in their second or third language, from a noisy room or a shared phone, and they need the job far more than the system needs them. That power asymmetry changes everything downstream: tone, pacing, what counts as an acceptable failure. The recruiter wants a fast filter, and designed carelessly, that filter becomes a fast, cheap, multilingual machine for humiliating people at scale. So we made a deliberate call: on this one surface, the candidate, not the recruiter, is the primary user.",
          "The first lessons came from running real calls at Zydus, where the roles that needed AI calling most were factory workers. Pickup was the first wall, and it fell to timing, not pitch: reachability turned out to be persona-dependent, a factory worker and a mid-manager answer at different hours, and pickup improved substantially once calls moved to each persona's hour (directional, the exact lift was not logged). Completion was the real nightmare, and it only cracked when we customised the conversation flow per persona: some people need to be greeted and warmed up first, others want the point straight away, and one script cannot serve both. Because the hires were Ahmedabad-based, the flows also had to carry little bits of Gujarati woven into the conversation, since that is how the callers actually speak. The lesson that stuck, and it became a house rule: the agent is only as good as the user research behind it.",
          "So the research went formal, and I owned it end to end, the research and the UX; the engineers owned the calling stack. The base ran to about 300 people across the pilots. The sharpest instrument inside it was a field study for a tech-recruiting deployment that treated every candidate as a user of the calling experience: a 43-call log over ten days, every outcome coded into six candidate-experience categories, every recruiter note kept. The headline finding inverted our assumption. The dominant failure mode was not candidates saying no, it was the system breaking: about a quarter of the calls, 10 of the 43, connected and then died before a single question was asked. The mechanism is latency. Production voice agents respond in 1.4 to 1.7 seconds where a human expects a gap of roughly 200 milliseconds, and past about a second of dead air people decide the call is broken and hang up. The log held sharper injuries too: one candidate was dialled 3 times in a single week, and another told us the brand 'always calls but never follows up with real opportunities', which in a market averaging 16.8 spam calls per person per month is exactly how a recruiter becomes spam. The highest-leverage fix was never persuasion; it was making the system stop collapsing on the people who did answer.",
          "Those findings set the call's design contract, the decisions no default is allowed to make. The agent discloses it is an AI early and plainly (which India's telecom rules now mandate for AI calls in any case), asks the candidate's preferred language, and switches fully to it, because real callers code-switch mid-sentence and rarely stay in one language. The structure is agent-led: a small set of concrete, answerable questions, one at a time, with the load-bearing facts, experience, location, availability, confirmed explicitly. The opening frames the stakes down, a quick fitment check rather than a pass or fail interrogation, because fear is what makes people freeze or hang up. And repair is where the craft went: misrecognition and dead air are normal, not exceptional, so the agent recovers out loud instead of going silent, rephrases, offers an easier way to answer, and the repair path is designed three failures deep, because the third failure is where systems abandon people. Every call closes the same way regardless of fitment: what happens next, when, and how to reach a human.",
          "Customisation was the deep second half: an HR person has to be able to tune this call without being a conversation designer, and without being able to break the parts that protect the person on the other end. The resolution was a split. The recruiter owns what the call asks: the questions, the criteria checklist with each item tagged Essential, Valuable or Not preferred, the persona-fit of the flow, the language mix. The system owns how the call behaves: disclosure, pacing, confirmation, repair, the respectful close. You can make Stella ask about a forklift certification; you cannot make her interrogate someone.",
          "The output side holds the same line. The call writes structured facts back to the pipeline, and where it produces a fitment read, that read has to be explainable and contestable, because nobody should be silently filtered out by an accent the model handled poorly. And this is the part I can say plainly: it all shipped. The dead-air recovery, the dedup lock, the concurrency cap tied to backend throughput, the compliance stack with disclosure built in. The number moved with it: of the calls that connect, 71% now complete the whole screen, up from 35 to 40% before the work. The pilot rates are a separate measure and stay separate: about 4 in 10 dials reached a human at all. The one piece still directional is the equity evaluation, disaggregating outcomes by language and dialect, which waits on the next instrumented run.",
        ],
        ul: [
          "43-call field log over ten days, 39 unique numbers, outcomes coded into six candidate-experience categories, cross-checked against published latency, spam and telecom-regulation benchmarks",
          "10 of 43 calls, about a quarter, connected and then died before the first question; roughly 9% of dials were duplicates; at least one clearly interested candidate was lost to a system bug, not disinterest",
          "Projected to a 1,000-candidate campaign, the pilot's rates meant about 350 dead-air experiences and about 90 duplicate calls, all avoidable before a single script word changes",
          "Every recommendation shipped, and completion of connected calls climbed to 71%, up from 35 to 40% before the work",
        ],
        fig: "callJourney",
        figure:
          "The candidate journey from the field study: ring, screen, pick up, engage, outcome. The cliff is at engage, about a quarter of calls die after hello and before the first question, which is why the first fix is recovering out loud instead of going silent. Then the payoff: everything shipped, and 71% of connected calls now complete the screen.",
        divider: true,
      },
      {
        h: "What the pilots changed",
        tldr: "Users kept asking for agent performance. They actually cared about job performance. Catching that misread reshaped the whole reporting layer.",
        p: [
          "The strongest input was never a design review, it was watching Stella run live roles at Zydus and Increff. Putting an AI recruiter in front of real candidates and real recruiters surfaced things no mockup would. The clearest example was a misread we almost built.",
          "In every early conversation, users asked for agent performance: how many CVs did the screening agent read overnight, how accurate is it, which agent is pulling its weight. It sounded like exactly the right question for an AI product, the metrics already existed in our framework, and honestly we felt the same pull, because a wall of live counters looks like proof the thing works. We came close to shipping a control panel for the machines.",
          "Then we mocked it and put it in front of a recruiter. She glanced at the overnight screening count, said okay, and every question that followed walked straight past the number: which of these do I actually need to look at, is my req going to close, if I forward this shortlist and one candidate is wrong it is my name in the room, not the agent's. That was the tell. She was asking about the machine because no tool had ever shown her the job. Agent performance was the doorway; job performance was the room.",
          "The correction became a rule we still design by: job performance is the end, agent performance is the means. Every surface now leads with the outcome the person is accountable for, is this role going to close, well, fast and fairly, in their own register, and agent activity is demoted to a drill-down you open only when a job is off-track and you need to know which agent to tune. Nobody checks the calling agent's connect rate because it is Tuesday; they check it because a role went cold and they want to know why. The founder never sees an agent counter at all. The recruiter gets the agent's reasoning behind each shortlisted candidate, the trust layer one tap in. And the candidate sees no machine anywhere, just her status, a real date, and a human behind the decision.",
        ],
        divider: true,
      },
      {
        h: "Asking about the day, not the dashboard",
        tldr: "We stopped asking users what they wanted on screen and started asking about their week. One sentence kept coming back, and it collapsed the traditional dashboard into a briefing: agents summarized up top, the jobs list below, a generative read across it.",
        p: [
          "The misread above was caught by a method, not luck. Our earliest interviews had started the obvious way, asking recruiters what they would like to see on the screen, and those answers were not working: ask people what they want and they design their old tools back at you. So we switched to Mom Test questions and asked about their days instead. Walk me through yesterday. What did you check first this morning? What does a bad week look like? Only after that, a couple of pointed questions about needs. Across every one of those conversations, one sentence kept coming back in different words: I want to know how the job is doing.",
          "Our first translation of that was embarrassingly standard: a traditional dashboard that showed everything at once, every metric, every agent, every pipeline, the layout every ATS ships. It looked complete, and it answered nothing, because it left the reader to do the reading.",
          "The composition that won was quieter. Agents summarized in one strip at the top, present but compressed. The jobs list beneath, because jobs are what people are accountable for. And a generative layer across the top of it all that reads the day for you: what changed, what is off-track, what needs a decision. It optimized every case at once. When things are fine you glance and go; when something is wrong the summary names it; and the detail is one tap deep, never the landing view. That same composition then mapped to every persona at its own altitude, the founder's portfolio view, the recruiter's dense req list, the manager's narrative cards, which is why four experiences feel like one product.",
        ],
        fig: "evolutionTimeline",
        figure:
          "The surface finding its shape: from a screening list to a show-everything dashboard to the workspace that won, agents summarized up top, jobs below, a generative read across the day.",
        divider: true,
      },
      {
        h: "The homepage is a daily report",
        tldr: "Instead of a dashboard you have to read, the homepage is a generated briefing: what is broken, what needs you, what happened.",
        p: [
          "Most hiring software opens to a dashboard and leaves you to do the reading. I designed the Dassh homepage as a generated report instead, different every time because it reflects what actually changed since you were last there. It answers three questions in order of urgency: what is broken, a stalled pipeline or a failing agent, comes first; what needs you, the decisions only a human can make, like approving a shortlist, comes next; and what happened, the momentum, comes last. This is the agent-versus-job correction from the pilots, shipped: the report is about the jobs and the people, and the machines only surface when something needs tuning.",
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
      "Pilot-outcome metrics with baselines: time-to-hire reduction, cost saving, interview-to-offer lift (still open)",
      "Marketing claims ('100+ CVs in about 3 minutes', 'about 95% accuracy') DROPPED entirely per Agam 2026-07-05; do not reintroduce",
      "Client names CONFIRMED for public use per Agam 2026-07-05, but mention SPARINGLY: full six-name roster appears once (From pilots to a company + outcomes list); lead trimmed to Zydus + Increff; story mentions keep only where load-bearing",
      "Two pilot-driven changes now documented (agent-vs-job misread; show-everything dashboard -> summarized-agents/jobs-list/generative-read composition, from Mom Test interviews per Agam)",
      "Check the evolutionTimeline figure still matches the reworked 'Asking about the day' section (its beats: screening list -> dashboard -> workspace -> agent grid)",
      "Two figures still need art (best as Figma exports or a diagram): the daily-report homepage and the Figma-to-code pipeline. The other four are wired from the deck.",
      "2026-07-22: 'Designing the call' replaced the agent-creation-wizard section (agentWizardFff fig now unused by this case; Essential/Valuable/Not-preferred moved into the call section). Sources = Claude/dassh-voice-agent-spec.md + R5/R6 in dassh-user-requirements.md + the 43-call collision study (Claude/dassh-call-research-collision-study.docx). Evidence layer added same day: Zydus persona/timing/Gujarati arc + the 34.9% collapse finding, candidate details ANONYMIZED (source log has real names/numbers, keep it that way). Figure BUILT (callJourney, incl. the 71% payoff beat). RESOLVED by Agam 2026-07-22: complete owner of the UX (not the coding); everything the study recommended shipped and call success climbed to 71%; about 300 people = base research pool (the 43-call log is the coded instrument inside it; 300/500/1000 in the report stay projection tiers). 71% DEFINED (2026-07-22): completion of screening calls, dialled candidates who finish the whole screen. STILL OPEN: client naming in prose kept to Zydus only, the collision study says 'a tech-recruiting deployment' (Tophire name public elsewhere in the case, Agam to call if it should be named here too).",
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
    deck: awayAgentDeck,
    eyebrow: "Away · Case study",
    title: "An agent for the whole trip, that never takes the wheel",
    meta: "Founding Designer · Away · 2026",
    cover: "Away",
    board: ["AWAY", "NOT A WRAPPER, \nTHE WHOLE CASE", "OWNS IT, NEVER \nTAKES THE WHEEL"],
    lead:
      "Most AI agents are a chat box with good manners: they answer, and then they disappear. But the hard part of almost any job is not the answer. It is the follow-through, the failure, the 2am call, and a thing that forgets you on close can never reach it. Away is built the other way, to own the whole case, not the turn: a travel agent you keep that finds the flight, vets it, books it, watches it for months, and steps in when the trip goes wrong. It talks to you like the friend who just got back from that exact trip. The hard design problem was holding two opposites at once: an agent complete enough to do all of that and disciplined enough to never take the wheel. It does the figuring-out, you still travel. I led design end to end as the only designer on a five-person founding team, across the entire trip lifecycle, tuning how much the agent says, does, and decides at every moment from the first search to a cancelled flight at 2am. We shipped v1. It is live with an invite-only group and the traction is real; the numbers are still young, so this study closes on the measures we fixed before launch rather than a week-one spike.",
    sections: [
      {
        h: "The bet",
        tldr: "Most agents fail the same way, as wrappers that answer a turn and vanish, when the value lives in owning the whole case over time, especially the hard parts no one wants to do.",
        p: [
          "The mistake almost every AI agent makes is to optimise for the turn: answer a question well, then be gone. But booking a flight is the part everyone competes on, and a booking is rarely the hard part of travel. The hard parts come later: the cheap fare that quietly hides a self-transfer, the schedule change three weeks out, the connection you are about to miss, the compensation you are owed and never claim. A chat box that disappears after the answer cannot touch any of it, which is exactly where the value is.",
          "So Away is built to own the case, not the turn. That reframes the problem from 'a better booking flow' into 'a relationship across the whole trip', a much larger and stranger thing to design: the agent has to be present for months without nagging, sharpen as departure nears, go calm and competent in a crisis, and celebrate when it all works. And there is a second trap on the other side. The over-correction to a wrapper is an agent that takes the wheel and breaks trust the first time it is wrong. So the real target is completeness without autonomy: present and prepared for every step, and still leaving the commit to you. It does the figuring-out, you still travel.",
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
        h: "They already know",
        tldr: "Across every scenario we walked travellers through, one sentence kept coming back about human agents: 'I reach out to my agent, and they already know what's going on. I don't have to worry.' That sentence became the bar the agent has to clear.",
        p: [
          "Before the screens, I kept walking travellers through their real trips: how they book, what they do when a flight moves, who they call when something breaks abroad. The scenarios differed and the travellers differed, but one line did not. Every single person who used a human agent described the relationship the same way: 'when I'm travelling internationally, I reach out to my agent, and they already know what's going on. I don't have to worry.'",
          "Read it carefully and it is not a compliment about service, it is a load-bearing assumption. The relationship is predicated on the agent already knowing. Nobody briefs their own agent; the moment you have to explain your trip to the person who is supposed to be watching it, the relationship is dead and they are a call centre.",
          "That one sentence set the bar for everything after the booking. The watch keeps a diary so the agent can show what it has been watching, not claim it. The doc-check speaks up before you ask. And when a trip breaks, the disruption surface opens already knowing, what changed, what you are owed, the one smart move, never 'how can I help you today?'. The whole design of phases two through five is that you never, ever catch the agent up.",
        ],
        divider: true,
      },
      {
        h: "My role",
        tldr: "The sole designer on a five-person founding team; I designed the agent across the full trip lifecycle, its behaviour, its surfaces, and the voice it speaks in.",
        p: [
          "I led design end to end as the only designer on a five-person founding team: the CEO, the CTO, two developers, and me. My remit was the agent as a whole experience, not a set of screens.",
          "Concretely, I designed how the agent searches, vets and recommends, how it gates the booking, and how it behaves across every phase of the trip after, including the disruption moments. I also owned the voice: the line between when the agent is allowed an opinion and when it goes quiet, which on a product where the words are the product is itself most of the design.",
        ],
      },
      {
        h: "Decisions",
        tldr: "The five forks that shaped the agent, and what I turned down at each. The through-line: do the whole job, and never take the wheel.",
        p: [
          "Every hard call on this product sat between doing more and staying trustworthy. Read as a ledger, the design is as much the set of things the agent deliberately does not do as the things it does.",
        ],
        table: {
          cols: ["The fork", "What I chose", "Why, and what I turned down"],
          rows: [
            ["Answer the turn, or own the case", "Own the whole trip: find, vet, book, watch, rescue, remember", "The value lives in the follow-through, not the booking. I turned down the wrapper that answers well and vanishes."],
            ["Take the wheel, or hand off", "Prepare, recommend, and hand off; the person always commits", "One wrong auto-action breaks trust on a product moving real money. I turned down autonomy, even where it would feel faster in a crisis."],
            ["Split domestic and international, or one system", "One system that shifts gears on the price anchor, not the border", "The fare data showed the passport was the wrong line to draw. I abandoned the two-flow build I had almost started."],
            ["A new paradigm, or the trained habit", "Keep scroll-and-pick, but hand back a vetted, trap-flagged list", "Indian travellers are OTA-trained, so I upgraded the habit instead of fighting the muscle memory."],
            ["One voice, or a dial", "Three registers, edge, calm, and warmth, routed by how exposed you are", "A joke in the wound is unforgivable, so the agent goes quiet exactly where money moves or the trip breaks."],
          ],
          caption: "The agent as a decisions ledger: each row is a fork, the choice, and the direction I turned down.",
        },
        divider: true,
      },
      {
        h: "The dial",
        shader: "golden",
        tldr: "The agent has a strong personality, and the craft is knowing when to turn it down: loud and opinionated when it is winning for you, quiet and calm when your money is moving or the trip is breaking.",
        p: [
          "The brand gave me the spine. Away is the friend in the trade: warm and generous pointed at you, dry and unimpressed pointed at the airlines and OTAs that profit from your confusion. The enemy is never the traveller; it is the industry. So the agent has a real point of view, and the whole design is one question asked at every moment: which way is it facing, and how loud is it?",
          "I think of it as a dial. The edge runs free where the agent is on your side against the industry, the verdict on a search, the warning about a trap, the compensation you are owed. It softens to plain and calm exactly where you are exposed, the first thirty seconds, anything touching money, any error. And it goes all warmth in a real crisis, because a joke in the wound is unforgivable. 'Crisis' and 'delight' are not two piles of screens, they are the two ends of that one dial, and this case study is the dial.",
          "Two rules hold it all together. The agent does the work of the best human agent on the phone and then exceeds it: the long price watch, the passport check, the compensation claim, things no human agent actually does. And it never takes the wheel. It prepares, recommends, and hands off, but the person always commits. One skill runs the length of it, negotiation: the same muscle that beats the fare is what has your back when the trip goes wrong.",
        ],
        table: {
          cols: ["Register", "How it sounds", "Where it shows up"],
          rows: [
            ["Edge", "Loud, opinionated, dry at the industry", "The verdict on a search, a trap flagged, the compensation you are owed"],
            ["Calm", "Plain and restrained, no jokes", "The first thirty seconds, anything touching money, any error"],
            ["Warmth", "All warmth, zero edge", "A real crisis, a missed connection at 2am"],
          ],
          caption: "One dial, three registers: it faces the industry loudly and goes quiet exactly where you are exposed.",
        },
        divider: true,
      },
      {
        h: "Cards, not chat",
        tldr: "The agent does not just reply, it renders. Every real action, add a passenger, cancel a booking, check in, is a tool the agent calls that draws its own interactive card in the chat, and you are the one who taps commit. The co-pilot rule is not only a tone I write in, it is the architecture.",
        p: [
          "Under the friendly voice, the agent works by calling tools, and a tool does not answer in words, it renders a small interactive surface right in the conversation. Ask it to cancel a booking and it cancels nothing: it draws a card of your flights and passengers and waits for you to choose who and press the button. Ask it to add a traveller and a passenger form appears in the thread. Search, refine, filter, the fare calendar, web check-in: each is a tool with its own card. The reply is a piece of UI, not a paragraph, so the agent can do the whole job without leaving the conversation, and without ever taking the last step for you.",
          "This is where never take the wheel stops being a slogan and becomes a state machine. A tool call moves through a fixed set of states: the arguments stream in, the card becomes ready, and for anything consequential it waits in an approval state until you respond, which resolves to done or, just as deliberately, to denied. Denied is a first-class outcome, the system is built to hear no. Nothing that spends money or changes a booking can skip that gate. The card can be completely prepared, the passengers pre-filled, the cheapest rebooking already worked out, and it still waits for your tap. The design principle and the code are the same sentence.",
          "Two smaller choices keep it from feeling like a form wizard. When the agent only needs a fact it cannot infer, it asks with a tappable card, and your answer travels back as an ordinary message, the same path as anything you type, so nothing dangles if you ignore the card and say something else instead. And while a tool's arguments are still streaming, its loading card mounts once and fills in place rather than flashing and remounting, so the surface settles quietly instead of blinking.",
        ],
        table: {
          cols: ["The agent's tool", "The card it draws", "Who commits"],
          rows: [
            ["Ask a question", "The question with tappable options", "You, by answering in a tap"],
            ["Search, refine, filter, calendar", "A live flight search, re-ranked in place", "You pick the flight"],
            ["Add passengers", "A passenger form inside the thread", "You fill it and confirm"],
            ["Web check-in", "A per-leg check-in card", "You, at the airline's door"],
            ["Cancel a booking", "Your flights and passengers to select", "You approve, or deny"],
            ["Navigate", "A jump to the right screen", "You tap through"],
          ],
          caption: "The agent acts by calling tools, and every tool renders its own control. The last tap is always the traveller's.",
        },
        spec: [
          {
            label: "Honest scope",
            items: [
              "The tool set is deliberately small: the moments where handing you a real control beats another sentence, not every action the agent could take.",
              "The disruption rescue and the compensation claim are still designed surfaces ahead of the tools that will back them; today they are rendered, not yet tool-driven.",
            ],
          },
        ],
        divider: true,
      },
      /* Onboarding section hidden per annotation (mqnrmrjj) — uncomment to restore
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
      */
      {
        h: "The home",
        group: "Zero state",
        tldr: "The home meets you where you are, the input expands from a sentence into only the fields it needs, and the result is not a wall of fares but a vetted shortlist with the traps flagged.",
        p: [
          "The home adapts to how well the agent knows you. A stranger lands on a convince-first surface, the agent showing what only someone in the trade would know, a route at a three-month low, a season about to peak, with a calm input waiting. A regular lands input-first, their trips and watches on top. You can type, speak, or paste a screenshot of a fare you found elsewhere, and as you go, a single input blooms into just the structured pickers it still needs, location, dates, travellers, so the fast path is never blocked by a form.",
          "The agent does not interrogate your preferences; it infers them and reflects them back with a point of view, the friend who knows the route, not a dumb echo: 'mid-December is brutal on this one, want me to peek at the week after?' And when your wants conflict, it does not silently pick one. It names the fight and claims it as the work: 'cheap and lie-flat usually fight on this route, that gap is the part worth working.' That single turn is the whole product in a sentence.",
          "Then the result. Indian travellers are trained to scroll a list and pick, so I did not fight that. The agent gives you a list, but one it has already vetted: sorted by which is right rather than merely cheapest, the traps flagged inline with the reason, a hidden self-transfer, a connection one in four people miss, and the fares the OTAs bury surfaced. Even the honest no-win is a trust moment. When the negotiation cannot beat the public fare, the agent says so plainly, shows the work it did, then goes back and offers nearby dates or a reroute, because the one thing no OTA will ever tell you is that you already have the best price.",
        ],
        table: {
          cols: ["", "A stranger", "A regular"],
          rows: [
            ["Lands on", "A convince-first surface", "An input-first surface"],
            ["Leads with", "Insider proof: a route at a three-month low, a season about to peak", "Their trips and watches, on top"],
            ["The input", "A calm box waiting to type, speak, or paste a fare", "Pick up where they left off"],
          ],
          caption: "The home adapts to how well the agent knows you: convince a stranger, get out of a regular's way.",
        },
        /* figure + caption hidden per annotation (mqnrnbjn / mqnrni7p) — uncomment to restore
        fig: "awHome",
        figure:
          "The adaptive home: convince-first for a stranger (insider proof), the single input blooming into the pickers it needs, and input-first for a regular with the watched trip on top.",
        */
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
        chart: {
          type: "stats",
          title: "How a flight actually gets bought",
          data: [
            { value: "45", suffix: " days", label: "active shopping window", note: "Expedia clickstream" },
            { value: "48", label: "searches before booking", note: "Expedia" },
            { value: "88", suffix: "%", label: "of travel carts abandoned", note: "Amadeus / SaleCycle" },
          ],
          caption: "A flight is bought over weeks and dozens of visits, so the home is a re-entry surface, not a launchpad.",
        },
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
          "A good search needs a lot of facts, so the agent gathers them one tappable question at a time, in a deliberate order. It never asks twice for where you fly from: that is captured the moment you open the app. The preferences you give last, direct only, extra bag, cheapest, low cancellation, become the lens it vets with later.",
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
          "I held a clear line on honesty here. The narration names the category of work truthfully and never claims a specific action the system cannot guarantee. It resolves on the one thing that is unambiguous, the money: the public fare struck through, the negotiated price beside it.",
        ],
        fig: "awDeepSearch",
        figure:
          "The deep-search timeline: the agent thinking out loud, a live sequence built from your flights, resolving on the savings reveal.",
        divider: true,
      },
      {
        h: "What the data changed",
        group: "Search",
        tldr: "I assumed domestic and international were two different searches and almost built two flows. The real fare data said the split that matters is not the border, it is whether the traveller has any idea what good costs.",
        p: [
          "The obvious move was to treat domestic and international as two products: a fast scan for the home routes, a richer and slower flow for the big trips abroad. I was close to building it that way. Then I pulled the actual fare payloads, and the border turned out to be the wrong line to draw.",
          "What separates the two is not the passport, it is the price anchor. A four-hour Bangalore to Dubai hop is non-stop, predictably priced, and behaves exactly like a domestic scan: the traveller roughly knows the number, so the job is just to show the options. A thirty-one-hour Bangalore to US trip does not: it is almost always two stops, a third of the fares quietly drop the checked bag, and the price swings through a different hub each time. There the traveller has no idea what good even costs, and that, not the destination, is what calls for the agent to slow down and form an opinion.",
          "So I built one system that shifts gears instead of two products that drift apart. It reads three signals, the price magnitude, how strong a price anchor the route has, and how much the options actually vary, and dials itself from a quick scan toward a slower, more opinionated vetting. Short-haul international rides the scan path; a gnarly long-haul earns the full treatment. The passport never decides it, the shape of the decision does.",
        ],
        table: {
          cols: ["", "Short-haul international", "Long-haul international"],
          rows: [
            ["Example", "Bangalore to Dubai, 4h", "Bangalore to the US, 31h"],
            ["Stops", "Non-stop", "Almost always two"],
            ["Price anchor", "Strong, you know the number", "None, no idea what good costs"],
            ["Checked bag", "Included", "A third of fares quietly drop it"],
            ["Price behaviour", "Predictable", "Swings through a different hub each time"],
            ["Agent gear", "Quick scan", "Slow, opinionated vetting"],
          ],
          caption: "The border was the wrong line to draw: the price anchor, not the passport, decides how hard the agent works.",
        },
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
        tldr: "A results card is an argument, not a row in a list: the one flight the agent would book, and underneath it, the ones it ruled out and exactly why each is a trap.",
        p: [
          "Most search tools hand you the cheapest and let you discover the catch at the gate. The verdict card does the opposite. It leads with the single flight the agent would book, then shows its work: a short dossier of the options it threw out, each with the reason it lost. The cabin-bag-only fare that is not actually the cheapest once the counter charge lands. The self-transfer on two tickets no airline will cover if the first leg slips. The fare that is cheap because it is a twenty-one-hour grind. Naming the rejected options out loud is the move no OTA makes, and it is what retires the fear that something better was hiding.",
          "Under the headline, the card is an argument in layers, and the price-by-date strip is the one I want to be precise about, because it looks like a filter and is deliberately not one. It is evidence: proof the agent swept the whole landscape and this is the floor, not a slider you drag to do the agent's work. I built a version with an Airbnb-style price range you could drag, then cut it. In an agent product, making you operate the controls is the failure, not the feature. The bars stay as proof, the handles go.",
        ],
        ul: [
          "The pick, stated first, with the fine print one tap away",
          "The ruled-out traps, each with the reason it lost",
          "A price-by-date strip as evidence the floor was found, not a filter to operate",
          "A lens that re-ranks and constraints that filter, for when you want to drive",
          "The real edge over the OTAs, the negotiated fare set against the public one",
          "One or two defensible reasons, and the freedom to overrule the whole thing",
        ],
        fig: "awResultCard",
        divider: true,
      },
      {
        h: "Under the verdict",
        group: "Search",
        tldr: "The verdict is not a vibe. It rests on a scoring engine that grades every flight on the four things travel trades on, against an absolute bar, and disqualifies traps no matter how cheap they look.",
        p: [
          "A confident pick needs something defensible underneath it, so the verdict sits on an index that scores each flight on the four things travel actually trades on: price, time, flexibility, comfort. The load-bearing decision was to score against an absolute reference, the route's own history and a real sense of good, rather than against the other flights in the set. Grade a flight only against the poor options beside it and you manufacture a false best out of a bad day, which is the exact illusion the product exists to kill.",
          "On top of the score sit hard gates that a low price cannot buy back. A self-transfer no airline backstops, a connection that changes airports, a layover under the safe minimum: each is disqualified from the recommendation however cheap the fare, because the cost when it goes wrong is the whole reason to vet. The blended score only ranks the options behind the scenes and is never shown; what you meet is the verdict and the reasons. v1 leans on the signals computable today and degrades honestly rather than inventing a number it cannot stand behind.",
        ],
        divider: true,
      },
      {
        h: "Fares are verdicts",
        group: "Search",
        tldr: "Airlines sell a thousand messy branded fares; a traveller wants an outcome. So Away stops reselling brands and renders a verdict on every fare across six axes, then names a handful of honest fare types anyone can act on.",
        p: [
          "I pulled 45,000 real international fares out of the deep search, and the first thing the data killed was leaning on airline fare brands. There were over a thousand distinct brand strings, Normal, PUBLISHED, SME, TACTICAL, ECO FLEX, half of them supplier-internal noise. You cannot build a shelf out of that. So Away does not resell fare brands; it reads every fare as a point across six axes, cabin, route shape, baggage, flexibility, comfort, and the all-in price with its source, and renders a verdict on it rather than handing over a bare row.",
          "The old four buckets, Best Price, High Luggage, Low Cancellation, Standard, had to go: no cabin axis, baggage and flexibility flattened into labels when they are really spectrums, and Best Price made the default when it is usually the trap. In their place is a small set of value types, each a verdict with the catch on its face: the Best Value with your seat and bag already inside, the honest Cheapest, the Bare Fare shown unmasked with its stripped atoms greyed, the Low-cancellation, the High-luggage, and the Cabin step-up. Same card, a different verdict.",
          "One thing is deliberately not a fare type: how the ticket is built. Whether the trip is one ticket all the way, a codeshare flown by a partner, or a self-transfer stitched from separate unprotected tickets is a property of the flight, not a category of fare. So Away highlights it once on the flight itself and carries it into every fare beneath, with the self-transfer flagged red wherever it appears and never sold as just another cheap option.",
          "The honesty is load-bearing, because the data is unsentimental: across those 45,000 fares the negotiated price beat the public reference only about half the time, and when it did the typical edge was 3.4 percent. So when a constructed rate does not win, the card says already the best price here and shows the public one. It never invents a discount, and where a baggage string or a ticket structure cannot be confirmed, it says so rather than guessing.",
        ],
        chart: {
          type: "stats",
          title: "What 45,000 real fares said",
          data: [
            { value: "1,013", label: "distinct fare-brand strings in the dump, unusable as a shelf" },
            { value: "50", suffix: "%", label: "of negotiated fares beat the public price at all", note: "the rest tie or cost more" },
            { value: "3.4", suffix: "%", label: "typical edge when negotiation does win", note: "median of the winners" },
          ],
        },
        fig: "awFareCards",
        figure:
          "Structure lives on the flight, highlighted as one of one-ticket, codeshare, or self-transfer; the fare types below are pure value variations. Tap a type to see its verdict: the badge, the true all-in with its source, the attribute strip, the trap ledger, and the honest catch. The Bare fare shows its stripped atoms greyed with the made-whole price beneath.",
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
        h: "Ticket structure",
        group: "Book",
        tldr: "How a ticket is built decides who owes you a flight when something goes wrong, so the agent makes the structure legible before you commit, not at the airport. Four cases are worth knowing, each shown below.",
        p: [
          "This sits between search and booking: you have a fare you like, and the structure under it is the part most travellers never notice until it is too late. The agent surfaces it up front, sets honest expectations on what it cannot control, and still leaves the commit to you.",
          "Honest caveat: the shipped app stores both flights in one list but does not yet model PNR-stitching, a codeshare flag, or series-fare holds, so the four cases below are the designed target, not yet built.",
        ],
        table: {
          cols: ["", "Who protects it", "If you misconnect", "Confirmed", "Best for"],
          rows: [
            ["One ticket, one PNR", "The airline, end to end", "Their problem to fix", "At booking", "Peace of mind"],
            ["Two tickets, self-transfer", "Nobody", "On you, usually non-refundable", "At booking", "The lowest fare, eyes open"],
            ["Group or series fare", "The airline, once named", "Their problem once confirmed", "About 24h before departure", "Families and groups"],
            ["Many passengers or mixed", "Per leg", "The weakest leg decides", "Varies by leg", "Complex trips"],
          ],
          caption: "The four ticket structures at a glance: who is on the hook when it breaks. Each is detailed below.",
        },
        divider: true,
      },
      {
        h: "One ticket",
        group: "Book",
        tldr: "One ticket, one PNR: a single booking the airline protects the whole way.",
        p: [
          "When both legs sit on one PNR, often a codeshare, it is a single ticket the airline protects end to end; if you misconnect, fixing it is their problem, not yours. The marketed airline may not actually fly every leg, so the agent names the operating partner up front. This is the safe option, and it says so plainly rather than burying it.",
        ],
        screen: "One ticket, one PNR: the protected itinerary, the operating partner named, the protection stated plainly.",
        divider: true,
      },
      {
        h: "Two tickets",
        group: "Book",
        tldr: "Two airlines, two PNRs, a self-transfer nobody protects.",
        p: [
          "A self-transfer stitches two separate tickets across two airlines. Nobody protects the connection, so a missed first leg is on you, and usually non-refundable. It is often the cheapest row in the results, which is exactly why the agent flags it loudest: it shows the real layover, the minimum safe connection time, and what happens if the inbound is late, all before you commit.",
        ],
        screen: "Two tickets, self-transfer: the unprotected connection flagged loudest, with the real layover and the if-leg-one-is-late case.",
        divider: true,
      },
      {
        h: "Group fares",
        group: "Book",
        tldr: "A block fare confirmed to a name only about 24 hours before departure.",
        p: [
          "Group and series fares are blocks pre-booked months ahead at a low price; your seat is confirmed to a name only about 24 hours before departure, and sometimes that confirmation slips. The agent never sells it as done: it states the confirmation window up front and works the booking if it slips, instead of going silent. Best for a family or a group on a fixed budget, where a surprise at the airport is the worst outcome.",
        ],
        spec: [
          {
            label: "How a series fare runs (the copy on the card)",
            items: [
              "Now: your seat is confirmed inside the group booking and payment is held; there is no PNR yet, which is normal for this fare, not a fault.",
              "About 48 to 72 hours out: passenger names are locked with the airline, so the exact passport name is due before then.",
              "The last 24 hours: the airline releases the PNR and ticket number; the agent issues it and pings you the moment it lands, in time to check in.",
              "Changes and cancellations are limited, the honest trade for the lower group price; if plans might move, the agent steers you to a movable fare instead.",
            ],
          },
        ],
        screen: "Group and series fares: the confirmation window shown honestly, the seat firming up close to departure, never sold as done.",
        divider: true,
      },
      {
        h: "Many passengers",
        group: "Book",
        tldr: "Rules differ per passenger and per leg; the agent reconciles them into one picture.",
        p: [
          "With several passengers or a mixed itinerary, fare rules, baggage, and seats can differ per person and per segment. The agent reconciles them into one clear picture instead of a pile of policies, and on a mixed trip, one protected leg and one self-transfer, it walks the journey leg by leg with the weakest link called out.",
        ],
        screen: "Multiple passengers and mixed itineraries: per-passenger and per-leg rules reconciled into one picture, the weakest link called out.",
        divider: true,
      },
      {
        h: "Seats and bags",
        group: "Book",
        tldr: "In the quiet moment before you pay, the agent offers seat, bag, and meal honestly, only what the airline actually sells, with whatever is already free shown plainly, and you decide.",
        p: [
          "Add-ons are where honest products turn pushy. The rule here: offer only what the supplier genuinely sells for this flight, show what the fare already includes so nobody pays twice, and let the person choose. The agent suggests and surfaces the running total and the fee impact; it never selects a seat or a bag on your behalf.",
        ],
        spec: [
          {
            label: "States",
            items: [
              "Selectable only before payment, while the passenger rows are still open; there is no post-payment amend flow.",
              "Per leg, the agent shows what is available: a seat map, a bag, a meal, or nothing if the airline sells nothing.",
              "What is already included in the fare is shown plainly, so a free bag is never sold back to you.",
              "The running total and the fee impact update as you add, before you commit.",
            ],
          },
          {
            label: "Honest scope",
            items: [
              "Add-ons are tracked at flight level, not true per-segment, even though baggage carries per-segment refs; per-segment is the intent, not yet the shipped granularity.",
              "Infants are excluded from seat and bag selection.",
            ],
          },
        ],
        screen: "The add-ons moment before payment: only what the airline sells, the already-free items shown plainly, the running total updating, and nothing selected for you.",
        divider: true,
      },
      {
        h: "Tap to pay",
        group: "Book",
        tldr: "Away never charges your card without your tap. You hold the money: the agent prepares the booking and hands you the commit, the convenience fee on UPI is zero, and with Away Advance the ticket is issued before you settle.",
        p: [
          "The commit is the one thing the agent never does for you. It finds, vets, and prepares the whole booking, then hands you the tap, no stored-card surprise, no auto-charge, no fare quietly pushed through while you were not looking. Money is where the dial goes fully calm: the screen right after you pay never reads a slow gateway as a failure, it holds you steady and polls until it has a real answer, so your money is never somewhere you cannot see.",
          "Two things make paying feel safe rather than tense. On UPI the convenience fee is zero, so the price you agreed to is the price you pay. And the order is reversed from a normal OTA: with Away Advance the flight is booked and the ticket issued first, then you settle, so you are never paying into a void and hoping a PNR appears. You commit, the ticket lands, then the money moves.",
        ],
        video: "/figures/away-convenience-reel.mp4",
        videoPoster: "/figures/away-convenience-reel-poster.png",
        videoCaption: "What you see is what you pay: the fare breakdown with a zero convenience fee on UPI and no last-minute surprises. Exported from the Away Figma motion reel.",
        divider: true,
        spec: [
          {
            label: "States",
            items: [
              "You tap to pay, nothing is charged before that.",
              "Confirming: the gateway is polled to a real answer while the screen holds you steady.",
              "Captured: the money is in, the ticket is not issued yet.",
              "On UPI the convenience fee is zero.",
              "With Away Advance the ticket is issued first and you settle after.",
            ],
          },
          {
            label: "If it goes wrong",
            items: [
              "A slow gateway is never read as a failure, it keeps polling.",
              "A declined card lands on a calm retry, no blame.",
            ],
          },
        ],
      },
      {
        h: "Price moved",
        group: "Book",
        tldr: "If the fare moves while the agent is verifying your payment, you are told exactly what changed before a rupee is charged, never a silent stale price.",
        p: [
          "Fares can shift in the seconds between choosing and paying. When that happens the agent stops and shows the delta, per leg, onward and return, recomputes the convenience fee on the new total, and asks before continuing. A small rise is yours to accept or to look again; a fare that is simply gone sends you back to search rather than charging you for something you cannot have.",
        ],
        spec: [
          {
            label: "States",
            items: [
              "Price confirmed unchanged: payment proceeds normally.",
              "Price moved: a sheet shows the per-leg delta and the recomputed total, you choose to continue or search again.",
              "Fare no longer available: the agent says so plainly and sends you back to pick a new fare.",
            ],
          },
          {
            label: "Honest rails",
            items: [
              "A stale price is never charged silently, the gateway check or the booking refetch is the backstop if a live event is missed.",
              "The convenience fee is non-refundable, and the agent says so rather than hiding it.",
              "Honest gap: if both legs move and net to zero, the total is accepted even though each leg changed; the per-leg shift is not yet called out.",
            ],
          },
        ],
        screen: "The price-changed sheet: the per-leg delta, the recomputed total, and a clear choice to continue or search again, before anything is charged.",
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
        table: {
          cols: ["State", "What you see", "What the agent does"],
          rows: [
            ["Paid, confirming", "Payment confirmed, the bill already settled", "Clears the chat, starts polling the booking"],
            ["Ticketing", "Fetching your tickets, a spinner where the PNR will be", "Polls every 10s, then 60s, watching each leg"],
            ["Issued", "The PNR lands, you are going", "Surfaces the PNR and flips the screen to confirmed"],
            ["Ticketing fails", "An honest problem with a next step, never an eternal spinner", "Surfaces it plainly, not silence"],
            ["You step away", "Track in My Bookings", "Holds the wait server-side and pings you when it is done"],
          ],
        },
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
        spec: [
          {
            label: "States",
            items: [
              "A worried double tap is held, not charged twice, back-navigation is locked while it verifies.",
              "A decline is retried calmly, with no blame.",
            ],
          },
          {
            label: "Honest gap",
            items: [
              "There is no server-side idempotency guard yet, the locked screen is the real guard.",
            ],
          },
        ],
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
        spec: [
          {
            label: "States",
            items: [
              "The PNR read back in plain words: one ticket or two, protected or a self-transfer, which leg a partner flies.",
            ],
          },
        ],
      },
      {
        h: "Documents",
        group: "First hours",
        tldr: "A passport-and-visa check run against this exact trip, early, so a missing document is a fixable problem now, not a denied boarding at the gate.",
        p: [
          "The things that strand people are boring and predictable: a passport inside the six-month window, a transit visa for a stop you did not think about, a name that does not match. The agent checks them against this specific itinerary the moment the trip is booked, while there are weeks to fix anything, and flags exactly who is missing what and by when.",
        ],
        spec: [
          {
            label: "States",
            items: [
              "Clear: every passenger has what this trip needs, said once, then quiet.",
              "Passport expiry inside the six-month window flagged, with the deadline.",
              "A transit visa required for a specific stop, surfaced per stop, not just per destination.",
              "A missing passport number or detail on an international booking, caught early rather than at check-in.",
            ],
          },
        ],
        screen: "The document check against this trip: passport validity, transit visas per stop, and who is missing what, with weeks to fix it.",
        divider: true,
      },
      {
        h: "The win, paid back",
        group: "First hours",
        tldr: "You negotiated instead of just booking, so confirmation is also the moment the agent pays that effort back, honestly.",
        p: [
          "Someone who negotiated instead of just booking did real work: comparing fares, waiting through a search, choosing between trade-offs. Confirmation is where that effort gets acknowledged, not with an inflated savings number, but with the terms they actually won read back as a win: a lower-cancellation fare locked, a free check-in bag included, the specific thing they picked for and got.",
          "(speculative) Two smaller ideas sit alongside this, not yet built: a small Away-cash credit for a completed booking, and a report card built from the trip's own history, how many days they watched, how many searches, how many fares compared, turned into one shareable card. Both are one-tap-to-share by design, so the gratification is also a referral.",
        ],
        spec: [
          {
            label: "States",
            items: [
              "Fare won, read back in the same language as the fare card: bucket name plus the concrete benefit, not a rupee figure.",
              "(speculative) A booking reward credited automatically.",
              "(speculative) A report card summarising the search effort behind this booking, one tap to share.",
            ],
          },
          {
            label: "Honesty rails",
            items: [
              "Real negotiation savings run a few percent under other OTAs, not a large number, so the win is framed on terms won, never on an inflated price delta.",
              "Nothing here celebrates before the PNR is confirmed real.",
            ],
          },
        ],
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
        table: {
          cols: ["What it watches", "What you see", "What the agent does"],
          rows: [
            ["Tickets issuing", "Fetching tickets, then a tap-to-copy PNR", "Polls fast until issued, then flips to confirmed"],
            ["Price, until capture", "A prices-have-changed sheet if a fare drifts", "Subscribes to the price channel, asks before continuing, never auto-accepts"],
            ["Check-in window", "A Check in button per leg when it opens", "Polls the window, reveals the button, copies the PNR"],
            ["The quiet middle", "A plain line of what it is keeping an eye on", "Watches in silence, pings only when there is something to do"],
          ],
        },
      },
      {
        h: "The due date",
        group: "During the trip",
        tldr: "If you booked on Away Advance, the settle date can land while you are already traveling, so the agent keeps it from becoming a surprise.",
        p: [
          "Pay-later is a relief at booking and a trap if it goes quiet. When the ticket was issued first on Away Advance, the amount is due later, sometimes mid-trip. The agent reminds you ahead of the date, shows exactly what is owed, and makes settling a tap, so the clock never runs out unseen while you are focused on the trip.",
        ],
        spec: [
          {
            label: "States",
            items: [
              "Settled: nothing owed, no reminders.",
              "Due soon: a gentle heads-up ahead of the date, with the amount and a tap to pay.",
              "Due while traveling: surfaced inside the trip, not buried, so it is not a surprise on the day.",
            ],
          },
          {
            label: "Honest gap",
            items: [
              "Enforcement is server-side; today the UI simply stops showing the pay-later card once due, there is no client-side countdown or escalation yet.",
            ],
          },
        ],
        screen: "The Away Advance due date handled mid-trip: a heads-up ahead of time, the amount owed, and settling in a tap.",
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
        table: {
          cols: ["When", "What you see", "What the agent does"],
          rows: [
            ["Check-in opens", "A Check in on the airline button, per leg", "Reveals it when the window opens, copies the PNR, stops at the airline door"],
            ["Not open or closed", "Opens at a time, or head to the counter", "Says so honestly, no dead button"],
            ["Morning of", "Live status, gate, terminal, boarding, on-time history, weather", "Fetches live status, resolves the terminal, flags a terminal change"],
          ],
        },
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
        table: {
          cols: ["State", "What you see", "What the agent does"],
          rows: [
            ["Comfortable", "A calm margin readout, a green chip", "Does the math in the background, says nothing"],
            ["Tight", "A soft watch banner, an amber chip", "Keeps monitoring, does not interrupt"],
            ["At risk", "A warning, options appearing", "Pre-runs a same-route search so alternatives are ready"],
            ["Gone", "The connection is missed, the rescue surface", "Protected hands you the desk and the words, self-transfer arms you"],
          ],
        },
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
        spec: [
          {
            label: "Cases",
            items: [
              "Protected, one PNR: the airline owes you the rebook, the agent arrives holding the move, points you at the desk, and hands you the words.",
              "Self-transfer, two tickets: nobody owes you, the agent arms you with the move, the script, and an honest read of what you are and are not owed.",
              "Same calm voice in both, opposite mechanics.",
            ],
          },
        ],
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
        table: {
          cols: ["Case", "What you see", "What the agent does"],
          rows: [
            ["Delayed", "Live status, delay minutes, gate, on-time history", "Reads back the facts, adds the route's typical delay, offers the actions it has"],
            ["Cancelled", "A plain cancelled status, Cancel or Amend in chat", "Says what it can and cannot do, runs the cancel you confirm, never rebooks in the dark"],
            ["A rule changed", "The read-only fare-rule tiers and your booked terms", "Answers from the stored rules, flags, never silently acts"],
            ["At the airport", "The live gate, terminal, and baggage carousel", "Fetches live status on ask, reads back the facts, hands you the actions"],
          ],
        },
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
        spec: [
          {
            label: "States",
            items: [
              "The trip closes with a recap of what it saved and handled.",
              "Compensation you are owed, a delay or cancellation under the rules, surfaced with the claim prepared.",
              "Credits and refunds tracked to completion, not dropped.",
            ],
          },
        ],
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
        whiteboard: {
          src: "/figures/whiteboard/zero-states.png",
          alt: "The zero-states planning whiteboard: the agent's screens and states sketched out by hand.",
          caption: "Where the case map started: every screen and state sketched on one whiteboard. Tap to expand.",
        },
        divider: true,
      },
      {
        h: "The scoreboard",
        tldr: "v1 is live and the early signal is good, but the numbers are still rolling in. So instead of dressing up early noise, here is every number this study will carry, fixed in advance, and the design bet each one tests.",
        p: [
          "The honest headline today: v1 shipped, it is live with an invite-only group, and the traction is real. But a product built on trust should not quote numbers it does not trust yet, so I am doing the more useful thing and declaring the measurement spec up front. Each signal below is tied to the bet it will prove or break; the numbers land here as they stabilise.",
        ],
        table: {
          cols: ["Signal", "The question it answers", "The bet it tests"],
          rows: [
            ["Bookings through the agent, end to end", "Do people hand over the whole job, not just the search?", "Own the case, not the turn"],
            ["Repeat trips per traveller", "Do they come back for the next trip, unprompted?", "An agent you keep: the relationship bet"],
            ["Caught before it hurt", "Passport flags acted on, self-transfer traps dodged, junk fares avoided", "The vet and the watch pay for themselves"],
            ["Compensation claims filed and won", "Does the agent actually collect what you are owed?", "The rights engine as the moat"],
            ["Negotiated wins vs the listed fare", "How often does the negotiation beat the public price?", "The earlier experiment ran one in three; this build inherits that baseline"],
            ["Dropped-stream recovery rate", "When the connection breaks mid-task, does the case survive?", "Worst-day-first: the crisis backbone"],
            ["Verdict override rate", "How often do travellers pick against the agent's sort?", "Trust in the vetted list over the raw list"],
          ],
          caption: "Every number here is tied to the design bet it will prove or break, written down before any results existed.",
        },
      },
      {
        h: "What I'd revisit",
        tldr: "The line I watch hardest is autonomy versus the co-pilot rule, and the honest tension in an agent that advises on your rights without taking the action.",
        p: [
          "The hardest line in the whole design is how much the agent does for you versus how much it leaves in your hands. Never take the wheel is the right constraint for trust, but every time the agent stops at 'here is the smart move, you take it from there', there is a real cost in the moment: a stranded traveller would often rather it just fixed it. Holding that line honestly, doing everything up to the commit and not past it, is the thing I am least finished thinking about, and where I would test hardest with real travellers in a real disruption.",
          "The other is the rights engine. Encoding passenger rights is the product's clearest moat, but the rules change and vary by country, and an agent that confidently tells you what you are owed had better be right. I scoped it to the regimes Indian travellers hit most and flagged the ones I could not yet verify rather than guess. Keeping that current, and never letting confidence outrun the source, is an ongoing discipline, not a one-time research task.",
        ],
      },
    ],
    todo: [
      "Replace figure placeholders with real screens (animated SVGs from Figma): the adaptive home + expanding input, the vetted listing, the booking-gate partial reveal, the money-in-flight screen, the five-phase trip surface, the disruption + rights surface, and the savings reveal + recap + compensation claim",
      "Build the lifecycle dial infographic as the hero (the edge-to-calm dial across the trip); a first version is already drafted",
      "Figure for Cards, not chat: a tool card moving through its states (arguments streaming in, the card ready, the approval gate, then done or denied), grounded in the real toolRegister lifecycle",
      "Fill the scoreboard as numbers stabilise; held back deliberately (Agam, 2026-07-05): week-one ran around ₹50K a day in bookings, invite-only and growing, reinstate once the numbers settle",
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
  // THE cross-sell case. Until 2026-09-03 there were two: this engine case
  // (the objective function, the half nobody solved, the licence to recommend)
  // and "occasion-buying", the surface-craft case (the Ads widgets, the three
  // surfaces, the Final Experiments board). Agam asked for one. The surface
  // sections now live here as the "The surfaces" group, plus "Why the brands
  // wanted it" in Setup; the old entry is archived verbatim at
  // Claude/2026-09-03_occasion-buying-entry-archive.jsx.txt and its URL
  // /work/occasion-buying aliases here (CASE_ALIASES).
  //
  // HARD RULE for this entry, set with Agam 2026-08-23: NO internal Zepto number
  // appears anywhere in it, not even tagged as a placeholder. Where one would
  // sit, the case shows the query that would produce it and the attack that
  // would break it. Every figure quoted is public: filings, engineering blogs,
  // the CCPA order, or peer-reviewed work. The method is the evidence.
  //
  // Draft, structure and source ledger: Claude/2026-08-23_crosssell-engine-case-study.md
  //
  // 2026-09-03 EXCEPTION, UNRESOLVED: the section "Then the data came back"
  // (fig xsNotebook) carries real internal search and table counts, added at
  // Agam's request. It conflicts with the rule above. Decide before publish:
  // keep and retire the rule, redact to shapes, or move it to the local
  // /writing page. See the todo.
  // Routed at /work/cross-sell. Intentionally NOT in the `projects` index yet:
  // the role line is unresolved and the citations need re-verification at source.
  "cross-sell": {
    accent: "#0F6E56",
    eyebrow: "Zepto · Cross-sell · Case study",
    title: "The half of cross-sell nobody solved",
    meta: "Product Designer · Zepto Ads · 2026",
    // Portfolio 2026 (dUwMRorsFMXh9G6wlHOh5B) frame "121", node 228:60364, 1512x982,
    // exported at 2x via REST (figma-pat) on 2026-09-03.
    heroImage: "/cross-sell/hero.png",
    pdfSections: [
      "The walk did the selling",
      "The ask",
      "The central question",
      "Mapping intents",
      "Where I started, and the document that came out of it",
      "The first decision the model makes is what to suppress",
      "The objective function is the design",
      "Then we built the mechanism together",
      "Five directions were one direction",
      "The proof metric is the prosecution's exhibit",
      "Lift over volume: bought-together isn't belongs-together",
      "The screen that proved the problem",
      "What actually ran: split at add-to-cart, start where the traffic is",
      "Designing the states nobody screenshots",
      "Split the slots by confidence, not by surface",
      "The surface nobody claimed",
      "What I could not know, and the brief I wrote to find out",
      "Then I asked it to attack me",
      "Then the data came back, and it was less polite than the brief",
      "Reflection",
    ],
    cover: "Cross-sell",
    lead:
      "Cross-sell is the cheapest gross profit a quick-commerce platform can buy. No new dark stores, no new cities, no new ad sales. The extra unit rides a trip already dispatched. So everyone builds it, and everyone builds the same half: read the cart, predict the next item. That half was never hard. A trivial baseline, recommend what this person already buys, fills almost all of a next basket on its own. The valuable half, introducing someone to a category they've never bought, sits near zero recall in every published method. This case is what a designer does with that. I wrote the framework the engine would be judged against. Six weeks later, a production model overtook its ship list. So I rebased the work onto the part no model decides: which trips get nothing, what the objective may optimise, and how you keep a persuasive engine on the right side of a live regulatory order, when the number that proves it works is the same number the regulator used as evidence of harm.",
    sections: [
      {
        h: "The walk did the selling",
        nav: "The walk",
        group: "Setup",
        tldr: "How often do you check out with something you did not walk in for? In a big store, all the time. In this app, never.",
        p: [
          "In a DMart, all the time. You went for atta and rice. You left with a mop, a bag of frozen peas and a torch. Nobody sold you those. The walk did. Aisles, end caps, the queue at the till. A big store is a machine for making you pass things.",
          "Now open Zepto. You search, you tap, you pay. Forty seconds. You never walk past anything, because there is nothing on the way to anything.",
          "So the question stops being what did you buy. It becomes: with no aisles left, what does the walking? That is the job. Give back what the shelf used to do, in an app where nobody browses, on a trip that ends in ten minutes.",
        ],
        fig: "xsWalk",
        figBare: true,
        figure:
          "The aisle against the app. Left, the walk wanders past four things nobody came for. Right, three taps make a straight line that passes nothing, and the same four things sit off to the side, never seen.",
        divider: true,
      },
      {
        h: "The ask",
        nav: "The ask",
        group: "Setup",
        tldr: "Three groups, one sentence: sell the things people don't know we carry. Nobody said recommender, and the difference is the whole case.",
        p: [
          "Three groups walked in with the same request. Brands wanted their lesser-known categories seen. Product wanted a rail that did it. Business wanted the margin that came with it. Nobody said recommender. They said: sell the things people don't know we carry.",
          "That sentence is the whole case. It is not a request for a next-item predictor. It is a request for discovery, which is the half of the problem every published method leaves near zero. The brief was easy to read and hard to build, and the first job was making sure the room knew the difference.",
        ],
        divider: true,
      },
      {
        h: "Why the brands wanted it",
        nav: "The brands",
        group: "Setup",
        tldr: "Two big names asked for the same pairing. The sharper signal came from the small ones.",
        p: [
          "There was committed brand budget with nowhere to land. A set of brands had set aside 25 to 30 percent of aligned ad spend for a surface that didn't exist yet. And because the ads-to-sales ratio is fixed, every sale a cross-sell surface creates compounds straight into ad revenue. Search couldn't produce that inventory. Only impressions for the adjacent and the unsearched could.",
          "Two big names, Beardo and Philips, had independently asked for the same pairing: grooming cream with trimmers. That proved the demand was real. The sharper signal came from the smaller brands. A brand known for protein wants to sell BCAA, a tougher adjacent category it can't crack by outbidding the giants on the keyword, because that economics only works at scale. A surface that shows what pairs with what you already buy hands that brand a way in. The shopper who buys protein discovers BCAA, exactly when it's relevant.",
          "Seeing the feature serve the challenger as much as the incumbent, and the shopper most of all, is what settled the design on a pairs-with-your-basket surface rather than one more paid slot.",
        ],
        divider: true,
      },
      {
        h: "The central question",
        nav: "The question",
        group: "Setup",
        tldr: "Everyone solved the same half of the recommender. It was the half that was never hard.",
        p: [
          "Cross-sell compounds against orders you already serve. The extra unit rides a trip that's already dispatched, so its marginal delivery cost is close to zero. Structurally, it's the cheapest gross profit a quick-commerce platform can buy.",
          "So of course everyone builds it, and everyone builds the same thing: read the cart, predict the next item. The trouble is a trivial baseline, recommend what this person already buys, fills almost all of a next basket on its own. The best deep models beat it by a few points. Recommending a category the user has never bought sits near zero recall in every published method. The easy half is nearly finished. The valuable half is barely started.",
          "So the question I took the work on to answer wasn't how do we suggest better. It was: what do you design when the profitable half is already solved and the valuable half isn't tractable?",
        ],
        fig: "xsTree",
        figBare: true,
        figure:
          "The whole exploration set, resolved. Seven areas of the app, forty-one approaches, each tagged by where it came from: the framework and its surface score, the Figma board, the ideation thread, the ones ruled out in review, and the evidence dossier. Under each best-suited approach, the metrics that judge it and the public evidence that ranked it. Pick an area on the left. Note the counts: search holds nine approaches, the wait window holds three, and the framework scored those two surfaces equal.",
        divider: true,
      },
      {
        h: "Mapping intents",
        nav: "Intents",
        group: "Setup",
        tldr: "Sort the evidence by intent and the shape falls out. Two of the four are close to finished. One is the half nobody has solved.",
        p: [
          "Before the framework, I sorted the public evidence by what the shopper was trying to do. Not by where a widget could go. Four intents. Discovery, where search already serves the shopper who can name the thing. Explore, where the home feed is mostly for buying what you've bought before, and the published numbers say so. Build, where a shipped model reads the cart in front of the shopper and that half is close to finished. And buy new, where introducing someone to a category they've never bought sits near zero recall in every published method.",
          "That is the case in one row of cards. Two intents solved, one nearly, and the one that carries the brief still open.",
        ],
        fig: "xsIntents",
        figBare: true,
        figure:
          "Four intents, one card each: the claim, and the public evidence under it. Swipe or pick a tab. Every number is from a filing, an engineering blog or a paper. None is internal.",
        divider: true,
      },
      {
        h: "Where I started, and the document that came out of it",
        nav: "The framework",
        group: "Framework",
        tldr: "Before a single screen, I wrote the framework the engine would be judged against. Five pillars, five intent-states, one objective function, ten refusals.",
        p: [
          "I didn't open Figma. I wrote a framework, paired with a model whose assumptions all sat in one tab, so anyone could flex the case before taking it anywhere.",
          "Five pillars. Intent-state, because the right suggestion for a Restocker is the wrong one for someone buying paracetamol at midnight. Surface times moment: five surfaces scored on reach, intent, inventory match and margin tilt, three of which shipped. Signal stack, ordered by priority and deliberately short. Ranking objective, the real design decision, which gets its own section below. And guardrails, ten of them, written as things we wouldn't do.",
          "Leading with a document isn't diligence theatre. A recommender is a policy, not a screen. Once the ranker is live, the policy is whatever the objective function says it is, and no interface craft downstream can argue with it. Design the objective first, or someone defaults it to click-through.",
        ],
        fig: "xsFramework",
        figBare: true,
        figure:
          "The framework's front page: five pillars and the ten refusals. Pillar one is lit because trip type is the first decision the model makes and everything else is downstream of it. Open a pillar for what it decided, and a refusal for the reason it was written.",
        divider: true,
      },
      {
        h: "The first decision the model makes is what to suppress",
        nav: "Suppression",
        group: "Framework",
        tldr: "The trip classifier's most consequential output isn't which surface to show. It's which surface to kill.",
        p: [
          "Five intent-states, the same five the occasion work mapped: the Restocker who knows exactly what they want, the Mission Shopper assembling an occasion one search at a time, the Wanderer with intent but no query, the Forgetter who'll remember the fourth thing only when they see it, and the Emergency. The classifier can be cheap. A rules-plus-logistic hybrid over time of day, basket size at the moment of suggestion, whether the session searched or browsed, any age-gated or medicinal items, and time since the last order. Retrained weekly. Good enough.",
          "The output I actually cared about was the emergency branch, where the correct number of suggestions in the checkout path is zero. A missed cross-sell on an emergency trip costs a little. A slowed checkout on the same trip costs a lot, and it's charged against the one promise the whole company is built on. The adjacent buy on that trip is real, and often bigger than the trigger one. It doesn't vanish. It moves to the post-order wait window, after the promise is kept.",
          "Designing the suppression first is a posture, not a feature. The lesson: the surface is a guest in someone else's errand.",
        ],
        ul: [
          "Emergency trips: every in-session surface suppressed before ranking. The adjacent buy moves to the post-order wait window",
          "A per-trip cap of three surfaces, because the second exposure is worth half the first",
          "Availability as a hard filter, not a ranking signal: suggesting out-of-stock breaks the speed promise even when the cart goes through",
        ],
        fig: "xsTrips",
        figBare: true,
        figure:
          "The five intent-states, and the one that gets nothing. The emergency branch is a deliberate blank: the classifier's most consequential output is which surface never fires.",
        divider: true,
      },
      {
        h: "The objective function is the design",
        nav: "The objective",
        group: "Framework",
        tldr: "I optimised for incremental gross profit per impression, and refused both of the things everyone actually optimises for.",
        p: [
          "Click-through? Ruled out. A rail can post a beautiful click rate and cause nothing, because the items would've been added anyway, or the cart abandoned under the extra load. Click-through measures whether the widget was noticed, not whether it helped.",
          "Margin? Ruled out too. Lead with margin and the catalogue collapses to detergent and house-brand staples within a quarter. Relevance goes, and the rail becomes furniture people learn to scroll past. What survives: pick the most relevant set first, then break ties on margin.",
          "So the ranker was relevance, times a hard availability filter against the user's own dark store, times one plus a tunable margin tilt on the margin z-score. The tilt starts gentle, and it lives in a named cell in the model, not in someone's head. I also wrote its escalation trigger. If that dial gets pushed past a threshold in production, cross-sell has started to feel margin-led to users, and the answer is a different objective, not a bigger number in the same one.",
          "Write the trigger down on day one, because nobody notices a dial moving. They notice the quarter it stops working.",
        ],
        fig: "xsObjective",
        figBare: true,
        figure:
          "The ranker, annotated with what each term is there to protect, and the two things it refuses to be. The margin-tilt starting value is omitted on purpose.",
        divider: true,
      },
      {
        h: "Then we built the mechanism together",
        nav: "Built together",
        group: "What happened",
        tldr: "Six weeks after I dated the framework, engineering had a production Transformer reading live carts. That wasn't a team going around a document. It was the document doing its job.",
        p: [
          "Six weeks after I dated the framework, the engineering team had a production Transformer reading live carts. A twelve-layer model over current cart contents plus city, day and hour, with published lift on add-to-cart, order value and gross profit per order. That wasn't a team going around a document. It was the document doing its job. The objective, the availability filter and the refusals went into the model room with me, and the ranker was tuned against them.",
          "What the shipped model made plain was the pivot. It reads the basket in front of the shopper, not the history behind them. That's the tractable half, done well. The unsolved half, introducing someone to a category they've never bought, wasn't a hypothesis anymore. It was disclosed, dated, and precisely shaped.",
        ],
        divider: true,
      },
      {
        h: "Five directions were one direction",
        nav: "Five directions",
        group: "What happened",
        tldr: "The board had converged beautifully, and the convergence hid the fact that nothing on it touched the problem.",
        p: [
          "By review time there were five directions on the board. A bundled product-combo card. An expansion under a buy-again row. A post-add-to-cart injection. A hoisted feedback module. An end-of-page rail. Real work, well built: a tabbed, category-themed module that scaled cleanly across hair care, gym, dry fruits and electronics.",
          "Read as strategy, five options. Read honestly, one mechanism on one surface, differing by trigger and by position on the search results page. And every one was category completion. Shampoo leads to conditioner, mask, serum. That's basket-deepening inside a category the shopper has already accepted. It works, it'll show lift, and it's the right v1. It also never touches a category they've never bought, which was the entire premise.",
          "Two other things had drifted, and naming drift is most of the job. Nearly every card in the final frames carried an ad label, while the framework's rule was that v1 cross-sell is organic and sponsored stays separate. That may be the better answer. But it should be a decision with a relevance floor attached, not something that happened in the pixels. And the surface the framework scored joint-highest, the post-order wait, had never been designed at all.",
        ],
        ul: [
          "Product combo: no trigger, in-grid, with a bottom-sheet breakdown of its two constituents",
          "Buy Again: user-initiated, expands inline under the row (the only explicit trigger in the set)",
          "Post-ATC: fires on add-to-cart, injects under the added row, plus a full-screen variant",
          "ShopX feedback: no trigger, hoisted near the top of the results",
          "More to explore: no trigger, end of page, after the out-of-stock block",
        ],
        fig: "xsDirections",
        figBare: true,
        figure:
          "The five directions read as trigger against position. Five options on the board. One mechanism on one surface underneath, and every one of them category completion.",
        divider: true,
      },
      {
        h: "The query that settles it",
        nav: "The query",
        group: "What happened",
        tldr: "Whether an engine completes errands or starts them is one pull: the top pairs by lift, tagged in-category or cross-category, and the share that stays inside.",
        p: [
          "The convergence on the board was a hypothesis about the data, so I wrote the pull that would test it. Take the top few hundred source-to-recommendation pairs by lift. Tag each pair in-category or cross-category against the source item. The one number that matters is the share that stays inside the source's own category, because that share is the engine's honest ratio of errand-finishing to errand-starting.",
          "The prediction, before running it: the strongest pairs will be the ones a shopkeeper would guess blind. Leash to collar. Test strips to lancets. Kite thread to kites. Even the clearest discovery category on the platform, baby care, should cross-sell hardest into itself, gift set to dress, blanket to swaddle. Association mining is spectacular at finishing an errand and structurally silent on starting one. The pull exists so the room argues with a ratio, not an anecdote.",
          "And the attack on it, written in the same brief: high lift on a rare pair is noise, so floor the support before ranking. Pairs inherit the catalogue's category tree, so a taxonomy quirk can masquerade as discovery. And an in-category share measured on what the engine already recommends is partly the engine grading itself. The honest denominator is co-purchase, not co-recommendation.",
        ],
        divider: true,
      },
      {
        h: "The proof metric is the prosecution's exhibit",
        nav: "The regulator",
        group: "What happened",
        tldr: "A regulator used a measured uplift in basket size as the evidence of the dark pattern. Attach rate went up is not the defence.",
        p: [
          "This finding changes how you design, not what you design. Every cross-sell surface is measured on lift. There's now a live order in this market, against this platform, where a measured engagement uplift from an interface choice was treated as evidence the design was driving user decisions, not proof that it helped. The same order held that remediation begun after scrutiny doesn't excuse the earlier violation.",
          "No phrasing gets you out of that. The mechanism a regulator described and the mechanism a cross-sell surface uses are, in the general case, the same mechanism. What separates them is whether the person wanted the thing. So wanting has to be measured, on the same dashboard, at the same cadence, from day one.",
          "Ship a regret metric beside every lift metric. Cross-sell items removed before checkout. Items flagged unwanted on the next order. Return rate and rating on cross-sell-attributed units. Make the launch gate a ratio, not a lift, so a surface can't pass just by being more persuasive. And keep the holdout, because without it lift claims are unfalsifiable, and an unfalsifiable claim is worth nothing in a review room and less in a hearing.",
        ],
        ul: [
          "Every lift metric ships with its paired regret metric, or the surface does not ship",
          "The gate is a ratio, not a lift",
          "A persistent five to ten percent holdout, for the life of the experiment",
          "Checkout add-ons are affirmative and unticked, because the alternative is a documented violation rather than a design risk",
        ],
        divider: true,
      },
      {
        h: "The engine: inferring the occasion",
        nav: "Occasion engine",
        group: "The surfaces",
        tldr: "Four signals the session already carries, collapsed into a confidence-scored occasion, with the confidence to decline.",
        p: [
          "Every session already carries four cheap signals. Time: hour, day, and the calendar layer of festival, match day, payday. Location: home, office, travel, weather. Search and browse intent: the query, its category, and whether the session is decisive or aimless. And cart composition, the strongest and most under-used signal of all. Chips plus cola at 11pm at home isn't snacks plus beverages. It's a movie night.",
          "I shaped those into a Zepto-native occasion taxonomy: breakfast, tonight's dinner, movie or match night, guests, gifting and festival, late-night craving, grooming, baby and health, on-the-go. Each a named moment the surface can dress itself in. The crucial decision wasn't what the model shows. It was when it stays quiet. The engine carries a confidence floor and a set of refusals, because its credibility dies the first time it pairs condolence flowers with party poppers.",
        ],
        fig: "decisionEngine",
        figure:
          "The decision as a mind map: signals to occasion to surface to basket, built one column at a time. The options not chosen, including none, stay on screen, so the figure shows the reasoning, not just the result.",
        divider: true,
      },
      {
        h: "Lift over volume: bought-together isn't belongs-together",
        nav: "Lift",
        group: "The surfaces",
        tldr: "Pairings come from a million-row co-buy table. I ranked by lift, not order count, and roughly a third of the pairings evaporated.",
        p: [
          "The data is a trap. Pairings are mined from a co-purchase table of roughly a million category pairs, and the easy mistake is to read a high co-buy count as a strong pair. It usually isn't. A large share of co-purchases are basket-padding to clear the free-delivery threshold, one weekly stock-up mixing unrelated needs, or a ubiquitous item that sits in half of all baskets. Milk, bread, chips. They co-occur with everything.",
          "So I ranked candidate pairs by lift: how much more often two things appear together than chance would predict. The gap is stark enough to put on a slide. For Hair Conditioner the top raw co-buys are Toothpaste and Cream Biscuits, and both carry a lift below 1. They appear together less often than chance. Pure padding. Rank the same anchor by lift and the real story surfaces: Hair Mask at 56x, then Hair Cream, Hair Spray, Cleanser. A clean hair-care occasion. Roughly a third of the raw pairings fail this test and get dropped. The de-noising is the feature, because a confidently wrong pair is exactly what teaches a user to ignore the surface forever.",
        ],
        ul: [
          "Lift around 1: co-occurs only because the rider is popular, the free-delivery padding",
          "Lift below 1: actively unrelated, surfaced by raw volume alone",
          "Direction is data too: items like tissues and muesli appear almost only as riders, never anchors",
        ],
        divider: true,
      },
      {
        h: "The screen that proved the problem",
        nav: "Burger bun",
        group: "The surfaces",
        tldr: "A live \"pairs best with these\" slot was ranked by ad spend, not affinity. A substitute bun and a weak dip, while the real complements were missing. The whole case, in one screenshot.",
        p: [
          "The strongest argument for this work was a screen already in production. On a search for Burger Bun, a slot titled \"Your product pairs best with these!\" surfaced two things: another burger bun and a garlic dip, both carrying an Ad tag.",
          "Held against the data, it falls apart. The other bun is a substitute, not a complement. A bun shown against a bun search is the one move a pairing slot must never make. The garlic dip is a real but thin association, around 128 co-orders, below the confidence floor I set. And the genuinely high-confidence companions for a bun were nowhere on screen: Patty at a lift of 107 on roughly 7,000 co-orders, and Cheese Slice at a lift of 14. The actual build-a-burger basket.",
          "The diagnosis is one line. The slot was ranked by ad spend, not by affinity, and labelling an ad-sorted row \"pairs best with these\" spends the exact trust the feature exists to build. Rank by lift first. Let ads compete within relevant items rather than override them. Hard-exclude substitutes from any slot that claims things go together. It's also why occasion isn't a story I imposed. The build-a-burger cluster falls straight out of the de-noised data.",
        ],
        ul: [
          "Shown (ad-ranked): a substitute burger bun + a garlic dip, around 128 co-orders, below floor",
          "Missing (affinity-ranked): Patty (lift 107, roughly 7,000 orders) and Cheese Slice (lift 14)",
          "The fix: affinity-first ranking, ads blended within relevance, substitutes excluded",
        ],
        divider: true,
      },
      {
        h: "Surface 1: the paired card, and its states",
        nav: "Paired card",
        group: "The surfaces",
        tldr: "The live surface: one high-confidence pair at the top of search, one add-two action, restraint over reach.",
        p: [
          "The first surface is live. It fires at the top of search results with one high-confidence, functional pair, the conditioner to your shampoo, behind a single add-two control. One tap turns a one-item basket into a sensible two-item one. Three rules earned its place on the fast path. It never blocks the searched item, which stays the hero. It carries a one-line reason, Goes with shampoo, and that line does almost all the trust work. It signals a shopkeeper, not a banner. And it holds to exactly one pair, because a second turns help into noise.",
          "The states I specified: the default pair, the pressed-and-adding state, the add-two confirmation, the already-in-cart suppression, and the below-confidence state where the card simply doesn't render.",
        ],
        divider: true,
      },
      {
        h: "What actually ran: split at add-to-cart, start where the traffic is",
        nav: "The experiments",
        group: "The surfaces",
        tldr: "The experiment set reorganised the surfaces around one behavioural pivot, the add-to-cart, and one rule: every variant debuts on search, then scales.",
        p: [
          "As the work moved from spec to experiment, two decisions reorganised everything above. The first is the pivot. The sharpest behavioural line in a session is the add-to-cart. Before it, intent is generic, a query like Shampoo, so the surface pairs against the search. After it, intent is specific, a committed product, so the surface switches anchors and pairs against the exact item just added, down to wearing that brand's dress. Best pairs with Shampoo before the add becomes Best pairs with Yellow Naturals after it. Generic before commitment, specific after. The whole set hangs on that switch.",
          "The second is allocation. Rather than launching all three surfaces everywhere, every variant debuts on the search results page. It's the highest-traffic entry in the app, so an experiment reads fastest there. What wins on SRP scales outward to the feed and the existing post-add surfaces. The You-might-also-like rail gets re-ranked by lift rather than replaced.",
          "Pre-ATC, two variants ran head to head on the SRP grid. A one-to-one slot ad, one cell of the grid given to the paired product. Against it, a many-to-many full-row widget, the tabbed Best-pairs strip that breaks the grid for one row. Post-ATC, the compact one-pair card ran against the brand-anchored widget in its collapsed, expanded and tab-switched states.",
        ],
        ul: [
          "The pivot: pair against the query before add-to-cart, against the added product after it",
          "The beachhead: every variant starts on SRP, the highest-traffic surface, then scales to feed and post-add rails",
          "Pre-ATC: one-to-one slot ad vs the many-to-many full-row widget",
          "Post-ATC: single-pair card vs the brand-dressed tabbed widget, the existing YML rail re-ranked by lift",
        ],
        fig: "xsMotion",
        figBare: true,
        figure:
          "The tabbed widget's entrance, designed in Figma Motion and running on a phone from the same keyframes, through the Figma MCP. Move the cursor across it to scrub the sequence.",
        divider: true,
      },
      {
        h: "Surface 2: the occasion widget, the end-cap rebuilt",
        nav: "Occasion widget",
        group: "The surfaces",
        tldr: "The most store-like surface: a named, dressed module mid-feed with horizontal category tabs, where the basket assembles as you shop the occasion.",
        p: [
          "The second surface is the end-cap, and the biggest design opportunity. It fires mid-feed for a Mission Shopper or a Wanderer. Unlike competitors' hand-authored themed banners it's predicted live: the same feed slot can read movie night for one user and baby's morning for another at the same instant. The module names the occasion in its header, Movie night, sorted?, and lays adjacent categories out as horizontal tabs. Snacks, Drinks, Dessert, Dips. Each a mini-aisle. The signature interaction is that tapping across tabs visibly assembles a basket. You're shopping an occasion, not hunting SKUs.",
          "I specified the full state set most teams skip: the named high-confidence module, a generic fallback header at medium confidence, and the honest below-threshold state where the slot doesn't render at all. An empty, truthful feed beats a confident wrong guess every time.",
        ],
        fig: "bannerLab",
        figure:
          "Ideating only the banner, tabbed by composition family: type, image, product, object, and minimal, with a few variants in each. Same Movie-night copy and the same widget shell throughout. Only the banner's layout changes. Tap a tab to browse.",
        divider: true,
      },
      {
        h: "Twenty occasions, one banner system",
        nav: "Banner system",
        group: "The surfaces",
        tldr: "The same banner and shell, re-skinned across twenty real pairings from the cross-sell data sheet. The heading carries the charm, the copy stays plainly functional.",
        p: [
          "The banner scales because nothing about it is bespoke. Feed any anchor and its lift-ranked pair through a small set of heading patterns and a background token, and the occasion falls out. Here are twenty, straight from the data sheet, the range the one widget has to cover.",
        ],
        fig: "crossSellTable",
        figure:
          "Twenty occasion banners generated from the cross-sell data: the anchor and its pair, the heading (the charm) and the copy (the plain reason). Baby and comfort stay neutral. Alcohol is age-gated.",
        divider: true,
      },
      {
        h: "Surface 3: the post-cart tabs, the checkout aisle",
        nav: "Post-cart tabs",
        group: "The surfaces",
        tldr: "After add-to-cart, themed tabs replace the flat product rail, reframing the last add as completing the set, not buying more.",
        p: [
          "The third surface fires the instant something enters the cart. The digital checkout aisle. Today that slot is a flat product rail. I replaced it with themed tabs and, more importantly, reframed the words. After ice cream goes in, the prompt isn't more products. It's Make it a movie night? After paneer, Everything for the curry? The user has already committed, so one more relevant add reads as completeness rather than pressure. But only if it's relevant, which is why this surface has the hardest guardrails of the three.",
          "The states matter most here, because this is post-commitment, where a pushy or wrong suggestion does the most brand damage. The themed-complete state. The single-best-pair fallback. And a clean no-suggestion state when nothing genuinely fits.",
        ],
        divider: true,
      },
      {
        h: "The delight layer, placed by the peak-end rule",
        nav: "Peak-end",
        group: "The surfaces",
        tldr: "I spent the delight budget where memory is made, the basket-build peak and the doorstep end, and kept the decisive path silent.",
        p: [
          "People don't remember an experience as an average of every second. They remember its most intense moment and its ending. So delight here is placed, not sprinkled. The peak is the basket assembling itself as you tap across occasion tabs, the animation that turns a list of transactions into the feeling of completing a plan. The end is the doorstep. The order arriving is the most charged moment in quick commerce, so a small occasion-aware grace note there, Enjoy movie night, colours the whole memory and costs nothing.",
          "Between them, smaller beats earn their keep. The add-two confirmation gives a crisp scale-tick and a single light haptic. The ten-minute wait, usually a dead map, gets dressed to the occasion you just shopped. And the house rule that kept it from tipping into noise: the funny line and the functional line are never the same line. Charm lives in occasion titles and empty states. Buttons and reason strings stay plainly useful.",
        ],
        divider: true,
      },
      {
        h: "The edge: a personal shopper, not a store map",
        nav: "The edge",
        group: "The surfaces",
        tldr: "Competitors ship static occasion theming. The same surface, predicted live per user, is a different product.",
        p: [
          "The competition is already building themed widgets and category tabs, but theirs are static: hardcoded themes per keyword, authored by a calendar. The bet is that the same surface, made dynamic, is a categorically better product. A competitor sees a shampoo search and shows hair products. Zepto sees a shampoo search at 7pm from a user who last bought conditioner six weeks ago, and surfaces a hair mask at the right moment for that person. The difference isn't the widget. It's the engine behind it, and the engine already runs in production.",
        ],
        divider: true,
      },
      {
        h: "Split the slots by confidence, not by surface",
        nav: "The discovery slot",
        group: "Proposal",
        tldr: "Every rail becomes N minus one high-confidence completers plus exactly one labelled discovery slot, judged on a different metric entirely.",
        p: [
          "This is the load-bearing idea, and it's small on purpose. The completer slots keep the existing ranker and the existing objective. Slot N is the discovery slot. It's allowed to be wrong. It's labelled new to you. And it's never judged on same-session add. It's judged on thirty and ninety day category repeat, the only honest measure of whether an introduction worked.",
          "What that buys is containment. The accuracy problem of the unsolved half no longer pollutes the whole rail, because it's quarantined in one slot with its own budget and its own scoreboard. A rail that's ninety percent reliable and ten percent curious reads as a good shop. A rail that's uniformly speculative reads as noise, and shoppers learn to skip it within a week.",
          "Two riders. Cross-sell the category, not the SKU, in that slot. Category-level prediction is an order of magnitude more tractable, published work finds a shopper's repeat categories outnumber their repeat items, and the platform's own filing shows the mechanism is real: a cohort widening from under three categories at acquisition to eighteen by month twenty-three. And index the slot on tenure, because that curve is steepest in the first year. Month one gets an adjacent category. Month twelve can meet something genuinely new.",
        ],
        ul: [
          "Completer slots: incremental gross profit, relevance first, availability filtered",
          "The discovery slot: labelled, category-level, judged on 30 and 90 day repeat, never on same-session add",
          "A separate novelty dial that can only ever apply to slot N, so the corruption is contained architecturally rather than by policy",
        ],
        fig: "xsRail",
        figBare: true,
        figure:
          "One rail, two scoreboards. Three completers judged on incremental gross profit, one labelled discovery slot judged on thirty and ninety day category repeat, and indexed on tenure.",
        divider: true,
      },
      {
        h: "The surface nobody claimed",
        nav: "The wait window",
        group: "Proposal",
        tldr: "Ten minutes of committed attention, at effectively zero marginal delivery cost, and no competitor has designed anything there.",
        p: [
          "The framework scored the post-order wait joint-highest and the roadmap put it third. That was wrong. It should've been first, and the reason is economic before it's experiential. In that window the order is placed, the trip is dispatched, and the attention is relaxed. An add rides a vehicle already in motion, so it carries the least marginal cost of any unit on the platform. And a miss costs nothing, because the person already bought what they came for.",
          "That last property makes it the right home for the discovery slot, and for the emergency trip's adjacent buy, which is often bigger than the trigger one and gets nothing in the checkout path. Everywhere else, a speculative suggestion competes with a conversion in progress. Here it competes with waiting. And on the evidence it's genuinely unclaimed: no published effectiveness or design work on order-tracking or post-delivery surfacing anywhere in the base I assembled.",
          "As a real screen it needs three things. A live merge countdown. An honest guarantee that adds before the cutoff ride the same trip. A hard stop that doesn't read as punishment. The countdown is the whole interaction, and it's the one place I'd spend the motion budget, because the merge deadline is the only genuinely urgent thing on the surface. Manufactured urgency anywhere else would be exactly the pattern under scrutiny.",
        ],
        fig: "xsWait",
        figBare: true,
        figure:
          "The merge window as a state ladder, including the state most teams never draw: the moment after the cutoff, said plainly rather than hidden.",
        divider: true,
      },
      {
        h: "Trust as the licence: the deposit, not the disclaimer",
        nav: "Trust",
        group: "Proposal",
        tldr: "Occasionally recommend something that lowers the basket, and log it. It costs a little revenue and buys the right to make every other suggestion.",
        p: [
          "Three moves, in rising order of how uncomfortable they are to propose. First, why this, on every suggestion: you buy this about every eleven days, this goes with the dip in your cart, this is new near you. Ranking-parameter disclosure is already statutory. The cheap version is compliance. The good version is a reason to believe, and it lets the discovery slot read as help instead of inventory.",
          "Second, negative cross-sell. Sometimes surface the thing that reduces the order. You already have this arriving Tuesday. The larger pack is cheaper per litre. You don't need two. It costs measurable short-term revenue, and it's the only documentable evidence that the engine acts against its own immediate interest. In the room described two sections above, a policy promise is worth nothing and a log is worth something.",
          "Third, sampling instead of suggestion. For genuine discovery, don't ask for an add at all. Drop a free or near-free sachet into the basket with one-tap removal, brand-funded. That turns an impression into an actual trial, digitises the one lever that already works in physical retail, and fixes the incentive, because the brand pays for the introduction instead of the platform pricing the discovery slot by margin.",
        ],
        divider: true,
      },
      {
        h: "The economics I would settle before the ranker hardens",
        nav: "One auction",
        group: "Proposal",
        tldr: "Don't keep organic and sponsored in separate stacks. Convert the bid into the same unit as the organic score and make the paid slot clear the organic bar.",
        p: [
          "The framework parked sponsored cross-sell to protect relevance. Watching the ad labels appear across the final frames convinced me the deferral was the mistake. The question doesn't wait for the roadmap.",
          "One auction, one currency. Translate a brand's bid into expected incremental gross profit and let it compete head to head with the organic candidate on that single axis. A paid slot wins only when it clears the organic slot's expected value. That's a hard relevance floor expressed in the ranker, not a relevance promise expressed in a document. The difference matters: a peer-reviewed audit of this market found sponsored results costlier than the top organic result in roughly three quarters of cases, and lower-rated in nearly half.",
          "There's a second rebasing underneath. The P&L story of cross-sell isn't attach rate. It's that these units amortise a last-mile cost that's already sunk. Measured per trip instead of per order, cross-sell is the cheapest contribution the platform can buy. And that framing is what argues for the wait window over everything else on the list.",
        ],
        divider: true,
      },
      {
        h: "What I could not know, and the brief I wrote to find out",
        nav: "The brief",
        group: "The brief",
        tldr: "The whole discovery direction rests on one question I had no data for. So I wrote the pull, then I wrote the attack on it.",
        p: [
          "The idea under the unsolved half was merchandising by benefit, not by category. Good for gut health, no added sugar, high protein: language people actually search, cutting across aisles the taxonomy keeps apart. And the case for it rests on exactly one number, cross-category attribute affinity. If buying one high-protein item lifts high-protein purchase in a different category, a benefit-led rail can travel. If it doesn't, the direction doesn't survive, and it should be dropped cheaply.",
          "So the brief starts by refusing to analyse anything. Part A is schema discovery with a hard stop for review, and its real job is the true fill rate on the product attribute fields, not their existence. If the claims and nutrition data are sparse or free-text mush, benefit-led discovery is a content and catalogue project, not a ranking project. That's a different team, a different budget and a different year. Better to learn that on day one than in month three.",
          "Part B is six analyses. Whether category breadth is actually stalling, and when. Which categories combine low penetration with high repeat after trial. Baby care worked end to end, the clearest case of a shopper who doesn't know what to buy. The attribute affinity question. Where discovery could live, including the wait window. And a deliberately small sizing model, because a defensible small number beats an impressive one.",
        ],
        split: "media",
        figure:
          "Caption: Part A of the brief, the stop-gate paragraph, pulled as a quote block. [Typeset from the real file.]",
        divider: true,
      },
      {
        h: "Then I asked it to attack me",
        nav: "The attack",
        group: "The brief",
        tldr: "Part C turns the same analyst into the hostile reviewer, because three specific findings were going to be taken apart, and all three deserved it.",
        p: [
          "I couldn't defend numbers I hadn't seen. Neither could the analyst producing them, unless the brief forced it. So the second half is an audit of the first half, and it names the attacks instead of waiting for them.",
          "Breadth over tenure is survivorship. Users with eighteen months of history are, by definition, the ones who didn't churn. So rerun it on a fixed signup cohort, everyone who left included, and show both curves on the same axes. The category cohort is selected on its outcome. Everyone in a first-baby-care-purchase cohort has already found baby care, so add matched users of the same tenure and spend who never bought it. High-breadth versus low-breadth shoppers isn't causal. Broad shoppers are heavy shoppers, so control for frequency and spend and report what survives. And widget adds aren't incremental. The ranker shows the item most likely to be added anyway, then takes credit for the add. State what fraction is plausibly organic and name the experiment that would settle it.",
          "Then the hygiene, none of it optional. Reconcile against finance's own books before any interpretation. Row counts before and after every join, fan-out checked. Confidence intervals and a minimum detectable effect on every rate. Cells under fifty users suppressed, never silently dropped. And the top findings rerun on a prior window and a half sample, with anything that moves labelled noise.",
          "The output contract is the part I'd defend hardest. One claim ledger. Every claim as a row, tagged measured, modelled or assumed, with its source, its sample size, an honest confidence, the strongest argument against it, and what would change my mind. Anything with the word because in it is modelled. Anything from extracted free text is modelled. All sizing is assumed. Then three lists: what survives unqualified, what survives with the exact sentence to say when challenged, and what doesn't survive and what would fix it. Then one page titled how I would attack this, minimum five bullets. A brief where everything comes back high confidence hasn't been audited.",
        ],
        fig: "xsLedger",
        figBare: true,
        figure:
          "The claim ledger, empty. The columns are the artefact: every row the analysis produces has to survive all seven of them.",
        divider: true,
      },
      {
        h: "Then the data came back, and it was less polite than the brief",
        nav: "The first pull",
        group: "The brief",
        tldr: "One notebook on the search side of the problem. Five things it said, and none of them were the numbers I'd have guessed.",
        p: [
          "The brief asked for cross-category affinity. The first pull that came back covered the ground that number would stand on instead. Which terms people type. How they split into head, torso and tail. What a themes table built on top of them looked like. So that got read first.",
          "Five things came out of it. Search is a mountain with a very small peak. The complement signal behind cheese is real, and thin. The themes table disagreed with the central table on exactly the terms that carry volume, because a festival moves faster than a stored label. The table was rebuilt while the notebook was open. And where the seed guess was weak, the theme on top of it was nonsense, and you could see it coming from one column.",
          "The lesson that survived all five: the interesting number is never the coverage, it's the share behind it. A table can cover every head term and still be wrong at the root.",
        ],
        fig: "xsNotebook",
        figBare: true,
        figure:
          "Five panels from one notebook, cells run 31 August to 3 September 2026. Every number is a real count from the table named on the panel.",
        divider: true,
      },
      {
        // 2026-09-04: the second pull. Facts measured from the 3 September
        // Databricks export (sections 2, 5, 6, 7: the L3 cross-sell table
        // data_science.public.prod_l3_cross_sell_ads joined to sku_info),
        // computed in-session; Fadell register, writing-craft gate green.
        // Part B (B1..B6) and Part C in that export are SQL with no results.
        // NOTE: internal recommendation counts and lifts; the entry's
        // no-internal-numbers rule (2026-08-23) is still open for Agam.
        h: "The query came back, and the shopkeeper was right",
        nav: "The second pull",
        group: "The brief",
        tldr: "Top pairs by lift, export dated 3 September. Four in five stay inside their own aisle, and the ones that cross are the catalogue tree talking, not the shopper.",
        p: [
          "The pull I wrote to settle the argument came back on 3 September. It ran against the live L3 cross-sell table, joined to the catalogue so every pair had a name. Two hundred rows by lift. By catalogue id that's 102 pairs. By name it's 66, because the same shelf sits under more than one tree, and that turned out to matter. The lowest lift in the set is 1,741. The top is 14,527, and it's leash to collar. I'd written that exact pair down as the prediction before the query ran.",
          "Four in five rows stay inside the source's own category: 158 of 200. Just over half never leave the subcategory. Gift set to baby dress at 4,050. Charcoal burner to hookah chillum at 9,808. Under eye serum to under eye cream. Errands, finished. The engine is very good at the one thing I said it would be good at.",
          "So what about the fifth that crosses? Ten distinct pairs, and I read every one. Glue gun to glue gun, filed under Stationery on one side and Home Needs on the other. Saree to blouse, because saree sits under Home Needs. Arm sleeve to biking sleeves, the same sleeve in two trees. Kurta to pyjamas. Chopsticks to disposable chopsticks. Nearly all of it is one item living in two places, or an accessory to itself. One pair reads like a different errand: humidifier to scented oil, at 2,605. One in a hundred. That's the discovery rate of association mining, measured, and it's about what I'd guessed blind.",
          "Then the two aisles the brief cared about. Skincare has 507 recommendation rows pointed at it, and 272 of them start outside skincare. That looked like discovery for about a minute. The top of the list is foot filer to foot scrub and acne treatment to spot corrector: next-door shelves with a category line drawn through them. Further down, baking powder, cake mould, choco chips and whipping cream all recommend Essence, at lifts between 119 and 197. Essence is filed under skincare, and everything that recommends it is baking. The engine is right and the tree is wrong, and a rail built on that tree would put it in a face-care row.",
          "Milk did what the universal item always does. Toned milk's strongest partner is milk bread, at a lift of 2.1. Then curd, buttermilk, brown bread, all under 2. It's in every basket, so it lifts nothing. The highest lift anywhere on the milk list is premium milk chocolates to dark chocolates at 254, which is the word milk matching a string, not a dairy shopper. And baby care, the clearest discovery category on the platform, cross-sells hardest into itself: a median lift of 115 inside, 54 out. The out list is the same errand continued in another aisle. Bottle brush to bottle cleaner. Gift set to rattle. Cotton balls to cotton wool. What pulls people into baby care is the mirror image: bottle cleaner, rattle, clothing set. Nobody arrives from outside the errand.",
          "Two things this pull can't say, and the brief predicted both. There's no support column in the table, so the floor I asked for couldn't be applied, and a rare pair with a huge lift is still noise until it is. And the ratio is measured on what the engine already recommends. The denominator is co-recommendation, not co-purchase. The engine is grading itself. Part B, the six analyses that would fix that, is still SQL with nothing under it. Written, not run.",
          "The lesson I carry out of two pulls in a week: the engine will never start an errand, and it doesn't need to. Let it finish them. Put the starting somewhere else, on a surface that doesn't ask a co-purchase table for permission. That's the rule. And it's the rule the walk taught me before there was a query at all."
        ],
        table: {
          cols: ["Pair", "Lift", "Where it lives"],
          rows: [
            ["Leash and pet collar", "14,527", "Pet Care, both sides"],
            ["Charcoal burner and hookah chillum", "9,808", "Paan Corner, both sides"],
            ["Glue gun and glue gun & hot gun", "9,267", "Stationery on one side, Home Needs on the other: one item, two trees"],
            ["Baby gift set and baby dress", "4,050", "Baby Care, both sides"],
            ["Saree and blouse", "3,589", "Saree filed under Home Needs, blouse under Apparel"],
            ["Humidifier and scented oil", "2,605", "Electronics to Home Needs: the one pair that reads like a different errand"],
            ["Under eye serum and under eye cream", "1,149", "Skincare, the strongest pair pointed into it"],
            ["Toned milk to milk bread", "2.1", "The best partner the universal item has"],
          ],
          caption: "From the 3 September export of the L3 cross-sell table joined to the catalogue. Lift is how much more often the pair appears together than chance predicts.",
        },
        // 2026-09-04 (this session): the five-panel figure of the second pull,
        // after the other session's xsPairs on the same section.
        figsAfter: [
          {
            fig: "xsSecondPull",
            bare: true,
            caption: "Five panels from the second pull: the aisle share, the top pairs, where skincare's recommendations come from, lift by aisle on one log axis, and baby care in and out.",
          },
        ],
        fig: "xsPairs",
        figure:
          "The fourteen largest categories, each one's best partner ranked by orders and then by lift. Computed on the co-purchase export with the 200-order support floor the other table could not supply; duplicate rows per pair summed, corrected 8 September 2026.",
        divider: true,
      },
      {
        // 2026-09-04: the third pull. The themes table adjudicated end to end -
        // 1,021,654 rows across Head, Head of Tail, Torso and Tail. Engine,
        // aggregates, five workbooks and the four exploratory views live in
        // Active - Zepto/Ads & Strategy/Cross-Sell/theme-review/; session note
        // 2026-09-04_cross-sell-theme-review-four-segments.md. Figure xsReview.
        // NOTE: internal counts again, and the underlying tables carry named
        // seed categories. Agam extended the xsNotebook exception to cover this
        // on 2026-09-04. The no-internal-numbers rule (2026-08-23) is now open
        // on two figures; settle both before publish.
        h: "So I graded the whole table, and the grader disagreed with the humans",
        nav: "The third pull",
        group: "The brief",
        tldr: "Every theme row scored against one rule set, then the rule set scored against the humans who had already done it by hand. The instrument was the finding.",
        p: [
          "Two pulls had told me what the engine was good at. Neither told me whether the themes sitting on top of it were safe to show anyone. So I wrote the rule set down and ran it over all of it: every search term crossed with every seed category crossed with every candidate theme, across all four volume bands. A million rows and change. Three verdicts. Ship, review, pull.",
          "The pull bucket is the one that ends careers, so it went first and it stayed narrow. A tab from a reputationally sensitive world sitting next to a seed, a query and a theme name that give it no reason to be there. Sexual wellness, menstrual, innerwear, medicine, body image, tobacco, alcohol. Adjacent worlds excuse each other, because a panty liner beside sanitary pads is the same aisle and pretending otherwise is theatre. Everything softer became review, not pull, and every ambiguous call went to review too. Uncertainty gets to be slow. It doesn't get to be confident.",
          "Then the part that mattered more than any of it. One of the four bands had already been graded by hand, eighteen and a half thousand rows of human verdicts sitting in a column. So I stopped grading themes and graded the grader. It pulls one per cent of what the humans approved, and it flags three quarters of what they rejected. It also approves thirty-five per cent of a band where the humans approved ninety-six. The instrument is far more nervous than the people, and now I know by exactly how much, in which direction, and on which rules.",
          "Building it against those labels is what exposed the bugs, and they were the stupid kind. Hair Serum was reading as alcohol, because rum is inside serum. Highlighter was reading as tobacco, because lighter is inside highlighter. Baby Corn was reading as baby. Naive substring matching, and it had put sixteen hundred perfectly good rows on the pull list. Word boundaries and an adjacency rule took that to a hundred and seventy-nine. The engine that catches your escalation risk will happily manufacture some of its own.",
          "One more, and this one is not mine to fix. The hour-targeting column arrives as text in one export and as numbers in another. Comparing the two never matches and never errors, so a rule I trusted fired on twelve per cent of a band and quietly pulled things like a breakfast theme aimed at six in the morning. A hundred and seventeen thousand rows became fifteen thousand once the types agreed. I only caught it because that band's pull rate didn't look like its neighbours'. Nothing downstream of that column is safe until it is fixed at source.",
          "What the four panels below are actually for: the pile is not a tangle. Three quarters of everything in review fails exactly one rule, and one threshold - a single number in a single config - holds two hundred and forty thousand rows on its own. Two of my rules turned out to be asking the same question. And the thing that predicts whether a theme is any good is not its category at all. It is how many product worlds it reaches into. One world ships half the time. Four ships never.",
        ],
        // 2026-09-04: the point cloud from the same workbook sits AFTER the four
        // panels. The renderer paints figsAfter before the main figure, so the
        // four panels ride in figsAfter and the cloud is the section's main fig.
        figsAfter: [
          {
            fig: "xsReview",
            bare: true,
            caption: "Four panels on the adjudication of 1,021,654 theme rows, 4 September 2026. The rule combinations, the threshold, the overlap between rules, and the one relationship that behaves like a mechanism.",
          },
          {
            fig: "xsCloud",
            bare: true,
            caption: "The theme space. 40,866 of the 1,021,654 rows, every 25th, each row's 51-number fingerprint projected onto its first two principal components. The axes fell out of the data, food-ness across and body-ness up, and the verdicts do not separate in them: quality problems sit across the whole catalogue, not in one aisle.",
          },
        ],
        // 2026-09-04: the embedding projector (after Google's Embedding
        // Projector, 2016) on the same sample: PCA in 3D, t-SNE, two custom
        // supervised axes, nearest neighbours in the full 51-d space, search.
        fig: "xsProjector",
        figBare: true,
        figure:
          "The same rows as an embedding projector, in the 49 features that are not the verdict itself. Rotate the first three components, switch to t-SNE for local neighbourhoods, or ask the space directly with two supervised axes, Pull to Ship across and Head to Tail up. Click a point for its six nearest neighbours in that space, with distances. Pull has a shape the space can find. Ship against Review is one threshold, and it cannot.",
        divider: true,
      },
      {
        h: "The guardrails, written before there was anything to guard",
        nav: "The refusals",
        group: "The brief",
        tldr: "Ten refusals, and the ones about vulnerable inference aren't negotiable at any lift.",
        p: [
          "Aggregates only. No personally identifying data. No cell under fifty users. No individual-level inference about a child, a health condition or a pregnancy, ever, at any confidence, for any uplift. The age-stage question in the baby care analysis is answered from aggregate purchase sequences and stays there. Free-text search queries get screened for names and numbers before they appear in any document.",
          "And in the product: age-gated and medicinal categories enforce gating before serving. Sensitive categories get neutral copy, reviewed before ship. Substitutes never appear while the anchor is in stock. First-order users get category heuristics, not pseudo-personalised noise. No more than three surfaces fire on one trip.",
          "Unglamorous, and they're the actual deliverable. Everything else in this case a model could overtake. These, only a person writes.",
        ],
        divider: true,
      },
      {
        h: "What I would do, in order",
        nav: "In order",
        group: "Close",
        tldr: "Three things, and two of them aren't features.",
        p: [
          "The wait-window surface first. It's the largest unclaimed inventory on the platform, it has the best marginal economics of anything on the list, and it's the one place a speculative suggestion costs nothing when it misses.",
          "The one-discovery-slot architecture with its own scoreboard second. It's the only proposal here that touches the unsolved half, and it's a bounded build on rails that already exist.",
          "The single auction third, settled now rather than later, because it decides the ranker's shape and is expensive to retrofit once organic and paid have grown separate plumbing.",
          "And under all three, the regret metric shipped with the lift metric, and negative cross-sell in the log. Those aren't garnish. With a live order in this market against this exact mechanism, they're what makes the other three shippable.",
        ],
        divider: true,
      },
      {
        h: "Reflection",
        nav: "Reflection",
        group: "Close",
        tldr: "The framework I'm proudest of is the one that got overtaken, because of what it forced me to learn about where design value sits in a recommender.",
        p: [
          "I wrote a good document aimed at the tractable half, and a capable team solved that half on their own schedule, publicly, six weeks later. The lesson isn't that the document was wasted. The completer engine was always going to get built by someone. The parts still doing work today are the ones no model produces: which trips get nothing, what the objective may optimise, what the surface owes the person on the other side of it, and which questions we're not permitted to ask of the data.",
          "The second lesson is about honesty as a design material. Everything persuasive in this project lives one bad quarter away from being the thing a regulator describes. The only durable answer I found is to instrument the doubt. Measure regret next to lift. Keep a holdout you can't argue with. Publish the reason under every suggestion. And occasionally recommend the smaller basket, and keep the receipt.",
          "The third is quieter. I spent a fortnight designing how I'd find out instead of designing a screen, and the brief and its attack half are the artefacts I'd most want a hiring manager to read. A recommendation surface is easy to draw and nearly impossible to defend. Learning to write the defence first changed what I think the job is.",
        ],
        divider: true,
      },
      {
        h: "The rule",
        nav: "The rule",
        group: "Close",
        tldr: "A recommender runs millions of times with no designer present, and the refusals are the only part of your judgement that scales.",
        p: [
          "Turns out the design was never the prediction. A model now writes the suggestions. It doesn't decide which trips get nothing. It doesn't decide what the objective may optimise. It doesn't decide what you refuse to ask of the data. So the rule I carry: a recommender runs millions of times with no designer present, and the refusals are the only part of your judgement that scales.",
        ],
      },
    ],
    todo: [
      "2026-09-03: MERGED the occasion-buying case into this one (Agam: 'I see 3 separate cross-sell case studies, combine into one'). Added 'Why the brands wanted it' (Setup) and a 'The surfaces' group of ten sections (occasion engine, lift over volume, burger bun, paired card, the experiments, occasion widget, banner system, post-cart tabs, peak-end, the edge), rephrased into the Fadell register with no new facts. DROPPED from the old entry: central question, context, role, intent-states (contradicted the six trip types here), 'states nobody screenshots' (covered by suppression + guardrails), Impact (all [PLACEHOLDER] invented numbers), Reflection. The merged sections carry internal figures (Hair Mask 56x, burger-bun lifts, the 25-30% brand budget): same conflict as the notebook section below. Old entry archived verbatim in Claude/2026-09-03_occasion-buying-entry-archive.jsx.txt; /work/occasion-buying now aliases here.",
      "2026-09-04: ADDED 'So I graded the whole table' + fig xsReview (the adjudication of all 1,021,654 theme rows: UpSet of rule combinations, the intent-share unlock curve, the rule-overlap arcs, and ship rate against product worlds spanned). Agam EXTENDED the xsNotebook exception to cover it on 2026-09-04, so the no-internal-numbers rule (2026-08-23) is now open on TWO figures and this one also sits on tables carrying named seed categories. Settle both together before publish: keep and retire the rule, redact to shapes, or move both to the local /writing page. Source: Active - Zepto/Ads & Strategy/Cross-Sell/theme-review/ + Claude/2026-09-04_cross-sell-theme-review-four-segments.md.",
      "2026-09-03: ADDED 'Then the data came back' + fig xsNotebook (five findings from the 'pv_id and cross sell info' Databricks notebook) at Agam's request. It carries INTERNAL search and table counts, which conflicts with the no-internal-numbers rule below. Agam to decide before publish: keep and retire the rule, redact the panels to shapes, or move the section to the local /writing page.",
      "2026-09-02: integrated the mobile Fadell draft (2026-08-29_case-studies-mobile.html) - added The walk did the selling, The ask, The query that settles it, The rule. WITHHELD per the no-internal-numbers rule: the association-table results (in-category share, the lift figures) and the 'What shipped' slot lift, all still [CONFIRM]-marked in the draft anyway. The draft's alternate kicker ('I wrote what it's not allowed to do, and I wrote it first') is undecided - swap if preferred.",
      "RESOLVE ROLE LINE before any submission or publish: the framework and both Databricks briefs are single-authored, which supports a strong line, but say it exactly once and say it true. Same unresolved question as /work/occasion-buying.",
      "RE-VERIFY EVERY PUBLIC CITATION AT SOURCE: the cart-Transformer figures and blog date, the CCPA order wording and penalty, the filing cohort curve (2.6 to 18.0 categories), E-Commerce Rules 5(3)(f) and 4(9), the sponsored-quality audit percentages, and two papers for the repeat-baseline and new-category-recall claims. Anything that will not verify gets CUT, not softened.",
      "NO internal Zepto number may be added to this entry, in any form, including tagged placeholders. That rule is the case's whole pitch (set with Agam 2026-08-23).",
      "Confirm nothing in 'The objective function' or 'The economics' discloses a non-public ranker detail. The starting margin-tilt value is omitted on purpose; keep it omitted.",
      "All eight figures are built (2026-08-24). Two still want real assets rather than coded stand-ins: the five-directions board would be stronger with the Final Experiments exports beside it, and the framework plate could be the real document page.",
      "2026-09-03: 'Then the mechanism shipped without us' REPLACED by 'Then we built the mechanism together' (annotation: tell the collaboration story, not what happened). Text from the mobile draft minus its [CONFIRM]-marked affinity-query paragraph; the draft still asks which of objective / availability filter / refusals the model actually enforced.",
      "Not in the `projects` index yet, so it is reachable only by URL. Add it once the role line and citations are resolved.",
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

// Duplicate of the scheduled-delivery case study for a concise / clarity-gate cut
// (Agam verifies first, then I trim this copy to a 5-8 minute read while the
// full version above stays intact). Deep-cloned, so trimming one never touches
// the other. Routes at /work/scheduled-delivery-trim.
caseStudies["scheduled-delivery-trim"] = JSON.parse(JSON.stringify(caseStudies["scheduled-delivery"]));
caseStudies["scheduled-delivery-trim"].eyebrow = "Zepto · Case study · concise cut";

// 28 Sep 2026: THE PRESENTING CUT of Scheduled Delivery, for presenting end to
// end to a product leader (about 20 minutes). A deep clone, reordered into the
// setup -> crisis -> resolution arc; the live page is never touched. Routes at
// /work/scheduled-delivery-present. What changed against the live page:
//   - order: hook, stakes, role, why it is hard, the search, the crisis (stuck
//     cart + state matrices), the resolution, launch, results, learning, reach, close
//   - My role keeps two of its slides (team, timeline); the rest are backup on
//     the live page. "What I'd do differently" moves to the close
//   - "Two ways to say it" is cut (a detour for this audience)
//   - Impact tells Acts 1 to 4 of the metrics story
//   - every "[Confirm ...]" note is stripped and the fill-in box dropped
//   - styleKey keeps every data-case="scheduled-delivery" rule applying
caseStudies["scheduled-delivery-present"] = JSON.parse(JSON.stringify(caseStudies["scheduled-delivery"]));
{
  const t = caseStudies["scheduled-delivery-present"];
  t.styleKey = "scheduled-delivery";
  t.eyebrow = "Zepto · Case study · presenting cut";
  delete t.todo;
  const strip = (v) => {
    if (typeof v === "string") return v
      .replace(/\s*\[Confirm[^\]]*\]/g, "")
      .replace(/\[WhatsApp was designed for;[^\]]*\]/g, "(WhatsApp was designed for, but it never went live.)");
    if (Array.isArray(v)) return v.map(strip);
    if (v && typeof v === "object") { for (const k of Object.keys(v)) v[k] = strip(v[k]); return v; }
    return v;
  };
  t.sections = strip(t.sections);
  const pool = t.sections;
  const take = (h) => {
    const i = pool.findIndex((s) => s.h === h);
    return i === -1 ? null : pool.splice(i, 1)[0];
  };
  const breaker = (img) => {
    const i = pool.findIndex((s) => s.breaker && (s.image || "").includes(img));
    return i === -1 ? null : pool.splice(i, 1)[0];
  };
  const role = take("My role");
  // design lead: leadership over logistics (team + how I led the crits and pods)
  if (role) role.roleWireframesOnly = ["Who I worked with", "Team leadership"];
  const impact = take("Impact");
  if (impact) {
    impact.figsAfter = (impact.figsAfter || []).map((f) => (f.fig === "schedMetricStory" ? { ...f, fig: "schedMetricStoryCore" } : f));
    impact.p = (impact.p || []).slice(0, 3); // headline number, why it is mostly fallback, and the value story (a product head asks about value first)
  }
  // THE PRINCIPLES, named once and pointed back to at each decision. Every one
  // is from the record: the first product review (positive copy, the real date),
  // the test sentence that killed the tabbed flow, and the stuck cart.
  // 28 Sep: the interviewer is a PRODUCT HEAD hiring a design lead. The story
  // is framed as a bet, and each key beat closes on its product "so what".
  const withSo = (sec, line, close) => (sec ? { ...sec, soWhat: line, soWhatClose: !!close } : sec);
  const bet = {
    h: "The bet",
    tldr: "A company built on now could earn trust for later, without weakening now.",
    points: ["Earn trust for later", "Never dilute now", "Design the promise, not the screen", "Let the data correct us"],
    pointsLabel: "The bet, in four parts",
    p: [
      "The risk was never the slot picker. It was that scheduling could teach people Zepto is sometimes slow, and instant is the moat. So the design job was to make later trustworthy while leaving now untouched. The bet partly paid off and partly surprised us, and the surprise is the most useful part of this story.",
    ],
    divider: true,
  };
  const principles = {
    h: "What I designed to",
    tldr: "Four rules held every decision, from the first review to the last edge case.",
    points: ["Positive copy, always", "Show the real date", "Keep every choice in view", "Put the hard state in plain sight"],
    pointsLabel: "Four design principles",
    p: [
      "Each one came from evidence, not taste. The first two came out of the first product review and never left. The third came from one sentence a participant said mid-task, which ended the tabbed direction. The fourth came from months on the cart that stays stuck even with a slot.",
    ],
    divider: true,
  };
  // LEARNING, framed as belief then evidence
  const learned = take("What users told us");
  if (learned) {
    learned.h = "What we believed, what we learned";
    learned.p = ["Before launch we believed people wanted to plan ahead. After it, 45 interviews told us something harder.", ...(learned.p || [])];
  }
  // THE CLOSE, as a design reflection rather than a business one
  const reflection = take("Reflection");
  if (reflection) {
    reflection.p = [
      (reflection.p || [])[0],
      "What I would revisit: we shipped one-hour slots and only in-flow slot edits, deliberate trade-offs to launch. Fuller editing came later; finer slots never did, and they were the top ask. I would also have instrumented the empty slot picker from day one, because nothing records a customer who opened it and found nothing bookable.",
      "What I would take to any team: a summary you can see is itself a trust mechanism, and the fix for a trust feature is almost always to say the true thing one more time.",
    ].filter(Boolean);
  }
  take("Schedule means different things to different people. Even how they say it."); // the pronunciation section, renamed (mukw91sk)
  // the opening question is a section without a heading, so it is found by its flag
  const hookAt = pool.findIndex((s) => s.introQuestion);
  // every unnamed section that sat before Context & problem on the live page
  // (the hook's plates and figures) stays with the hook, in its original order
  const ctxAt = pool.findIndex((s) => s.h === "Context & problem");
  const opening = ctxAt > 0 ? pool.splice(0, ctxAt) : [];
  const hook = null;
  t.sections = [
    ...opening,
    take("Context & problem"),
    (() => { const i = pool.findIndex((s) => s.fig === "schedMoments"); return i === -1 ? null : pool.splice(i, 1)[0]; })(), // the six moments
    withSo(take("The constraints"), "This wasn't a feature request. It was lost revenue from carts we couldn't serve."),
    take("The central question"),
    bet,
    principles,
    role,
    breaker("crates-greens"),
    take("The cart is a complex construct"),
    take("The explorations"),
    withSo(take("Two directions"), "I killed the simpler build because it would have cost trust at exactly the moment of commitment."),
    withSo(take("The stuck cart"), "Hiding failure is cheaper to build and more expensive to own. Support tickets are a design cost."),
    take("Cart-page states"),
    take("Slot-page states"),
    take("The real work"),
    breaker("crate-packed"),
    take("After you book"),
    withSo(take("The go-to-market"), "The restraint was strategic. If scheduling showed up everywhere, it would teach people that Zepto is sometimes slow."),
    breaker("bag-doorstep"),
    withSo(impact, "The number I'd defend isn't the biggest one. It's the one that tells us what to build next."),
    withSo(learned, "We designed for planners and got mostly rescuers. That isn't failure. It's the market telling us where the value is."),
    take("One scroll across midnight"),
    take("Returns & refunds"),
    withSo(reflection, "I design the promise, not just the screen. And when the data tells me I was wrong, that's the part I get most excited about.", true),
    take("What I'd do differently"), // the live page's own closing section (mukq5ujj)
    ...pool, // anything not named above keeps its place at the end, so nothing is silently lost
  ].filter(Boolean);
}

// WIP concise cut of the Away Agent case (Carnegie: 42 sections is 2-3x every
// sibling; MIIPS 20-page budget). Deep-cloned then trimmed by merging the short
// ladder sections into their parent beats; the live away-agent entry is never
// touched. Merged donors keep their prose and bullets; their figures are dropped
// (page economy is the point). Routes at /work/away-agent-trim.
caseStudies["away-agent-trim"] = JSON.parse(JSON.stringify(caseStudies["away-agent"]));
{
  const t = caseStudies["away-agent-trim"];
  t.eyebrow = "Away · Case study · concise cut (WIP)";
  const pool = t.sections;
  const take = (h) => {
    const i = pool.findIndex((s) => s.h === h);
    if (i === -1) return null;
    return pool.splice(i, 1)[0];
  };
  const merge = (hostH, donorHs) => {
    const host = take(hostH);
    if (!host) return null;
    for (const dh of donorHs) {
      const d = take(dh);
      if (!d) continue;
      if (d.p) host.p = [...(host.p || []), ...d.p];
      if (d.ul) host.ul = [...(host.ul || []), ...d.ul];
      if (d.table && !host.table) host.table = d.table;
    }
    return host;
  };
  // "Missed connection" is cut outright: "In motion" already carries the same
  // ticket-structure-dependent response in its second paragraph.
  take("Missed connection");
  const trimmed = [
    take("The bet"),
    take("They already know"),
    take("My role"),
    take("Decisions"),
    take("The dial"),
    take("Cards, not chat"),
    merge("The home", ["Time of day", "Slow decision", "Return visit"]),
    take("The brief"),
    take("Asks first"),
    take("The wait"),
    take("What the data changed"),
    merge("The verdict", ["Under the verdict", "Trap check"]),
    take("Fares are verdicts"),
    merge("Ticket structure", ["One thread", "One ticket", "Two tickets", "Group fares", "Many passengers", "Seats and bags"]),
    merge("Tap to pay", ["Price moved", "Charged twice"]),
    merge("Confirmation", ["What you bought", "Documents", "The win, paid back"]),
    merge("The watch", ["The due date", "Pre-departure", "In motion"]),
    take("When it breaks"),
    merge("The recap", ["Case map"]),
    take("The scoreboard"),
    take("What I'd revisit"),
  ].filter(Boolean);
  // Re-scope the merged hosts' tldr lines to cover what they absorbed.
  const retldr = (h, s) => {
    const sec = trimmed.find((x) => x && x.h === h);
    if (sec) sec.tldr = s;
  };
  retldr("The home", "The home adapts to how well the agent knows you, reads the clock through the day, and treats the zero state as a re-entry surface for a decision made over weeks, not minutes.");
  retldr("The verdict", "A results card is an argument, not a row in a list: the one flight the agent would book, the scoring engine and hard gates underneath it, and the trap flagged inline with its reason.");
  retldr("Ticket structure", "How a ticket is built decides who owes you a flight when something goes wrong, so the agent makes the structure legible up front, across one ticket, two, group fares, many passengers, and add-ons.");
  retldr("Tap to pay", "Away never charges without your tap, and the two ways paying goes sideways, a fare that moves mid-verify and a worried double-tap, are both designed to resolve without harm.");
  retldr("Confirmation", "Confirmation is the emotional payoff and a quiet danger zone, so the agent bridges the paid-to-ticketed gap, reads back what you actually bought, runs the document check early, and pays the negotiation effort back.");
  retldr("The watch", "After booking, the agent stays awake for the whole trip: the settle-date reminder, the pre-departure clock, and live connection arithmetic in motion.");
  t.sections = trimmed;
  // Compact PDF cut (?cut=compact) for the trim: thesis + signature beats only.
  t.pdfSections = [
    "The bet",
    "They already know",
    "My role",
    "Decisions",
    "The dial",
    "Cards, not chat",
    "The verdict",
    "When it breaks",
    "The scoreboard",
    "What I'd revisit",
  ];
  t.todo = [
    "WIP trim (2026-07-19): 42 sections -> " + trimmed.length + " by merging the ticket/payment/watch ladders; live away-agent untouched",
    "Merged donor sections lost their figures; review whether any dropped figure (time-of-day, trap-check, one-thread, due-date, pre-departure, in-motion) must be re-homed",
    "Seam pass done 2026-07-19: Trap check re-homed under The verdict (was misfiled under The wait; its first line also echoes The home's vetted-list paragraph, candidate for a prose dedupe), Missed connection cut as redundant with In motion, merged hosts' tldrs re-scoped",
    "Further trim candidates if still long for MIIPS: compress Fares are verdicts (347w); dedupe the vetted-list idea between The home and Trap check prose",
    "When approved, decide whether this replaces the live entry or ships as the PDF/MIIPS source only",
  ];
}

// FROM-SCRATCH REWRITE of the Dassh case study (started 2026-07-22). Deep-cloned
// from the live entry so /work/dassh is never touched while the rewrite is authored
// against the full research corpus (the voice-agent spec, the 43-call collision
// study, R1-R6 in dassh-user-requirements.md, and the interview answers Agam gives).
// The clone is only a starting surface: `sections` gets replaced wholesale, it is
// not an edit of the old prose. Routes at /work/dassh-v2.
caseStudies["dassh-v2"] = JSON.parse(JSON.stringify(caseStudies["dassh"]));
{
  const v2 = caseStudies["dassh-v2"];
  v2.eyebrow = "Dassh · Case study · rewrite";
  v2.title = "The call that had to be worth answering";
  v2.meta = "Design consultant & Director · Dassh · 2025";
  v2.cover = "Dassh";
  v2.lead =
    "Dassh builds Stella, an AI recruiter that does the execution work of hiring. I was its design consultant and a director through 2025, and the piece of it I want to talk about is the smallest surface in the product and the one that frightened me most: the first-round phone screen. A screening call is the cheapest thing in hiring to automate and the most expensive thing to get wrong, because the person on the other end needs the job far more than the system needs them. I owned that call end to end, the research and the design, while the engineers owned the stack underneath it. Roughly 300 transcripts, 47 candidates I called myself, and one coded field log later, the calls were completing at 71% of everyone who picked up, against 35 to 40% when I started. This is how they got there, beginning with the man we failed.";
  // FULL DRAFT written end to end, 2026-07-24, per Claude/dassh-rewrite-brief.md and the
  // locked decisions in it (spine = the call, second act = the agent-vs-job reversal,
  // designer-first ownership, hero = the candidate answered by a form). Defaults applied
  // per the brief's own "if unanswered" guidance where Agam's answer was pending: the
  // recruiter-mock scene is CUT (unsourced, traced to an auto-generated file built on a
  // fabricated persona) and rewritten as a design argument; no hire is claimed (Agam:
  // "not sure if should mention it"); the four-experiences tour, the design system section
  // and the fundraise are compressed to context rather than kept as standalone sections,
  // per the locked "only the reversal survives" decision.
  v2.sections = [
    {
      h: "What he told us",
      tldr:
        "A candidate said out loud what he wanted. The agent, working exactly as designed, did not hear a word of it.",
      p: [
        "He picked up, and somewhere in the first few seconds he said the thing that mattered: he was looking for a job. Not a maybe, not a someday. He was telling the machine on the other end the one fact the whole system existed to act on.",
        "Stella carried on with the script. She confirmed his details, thanked him, and hung up, because that was precisely her mandate, confirm the fields, not capture intent. Every log for that call would have read as a success. The details were confirmed. The call completed. Nothing in the data would ever have shown a man who volunteered exactly what he needed and was answered by a form.",
        "I only found him because I was reading transcripts one by one, which is a slow way to spend three weeks and the only reason I know this story at all. Then I called him myself and told him he was still in the pipeline. That call is the least scalable thing I did on this project and the most important, because it is the moment the problem stopped being a metric and became a person. Everything below is what changed after it.",
      ],
      divider: true,
    },
    {
      h: "The hardest surface",
      tldr:
        "A phone screen looks like the most automatable thing in hiring. Turn it around and it is the least forgiving.",
      p: [
        "From the recruiter's side, a first-round screen is the most repetitive thing they do, the same handful of fitment questions, hundreds of times, in a language the candidate may or may not share. It is the obvious thing to hand to a machine, which is why every hiring product on the market is racing to do exactly that.",
        "Now stand at the other end of the line. The candidate is often answering in a second or third language, from a factory floor or a shared room or a moving bus, on a phone that may not be theirs, from a number they do not recognize, in a country where job scams are common enough that suspicion is the rational default. They need this job. The system does not need them.",
        "That asymmetry is the whole design problem. Tone, pacing, disclosure and repair are not settings, they are the product, and every one of them defaults badly. Built carelessly, the same tool is a fast, cheap, multilingual machine for humiliating people at scale. So I made one decision early and let it govern everything else: on this surface, the candidate is the primary user, not the recruiter paying for it.",
      ],
      divider: true,
    },
    {
      h: "Three hundred transcripts",
      tldr: "I read every call, then rang forty seven people to find out what the transcripts were lying about.",
      p: [
        "The research base was roughly 300 candidate call transcripts across the pilots, read rather than sampled. Inside that sat the instrument, a 43-call field log over ten days, 39 unique numbers, every outcome coded into six mutually exclusive categories of what the candidate actually experienced, the recruiter's own note kept against each one.",
        "Then I called 47 of them myself, over three weeks. That is the part I would keep if I had to cut this case in half, because it told me two things no transcript could. The captured data was quietly wrong sometimes, what the system had recorded and what the person had actually meant were not the same, which means every downstream decision was running on a slightly false record. And candidates kept raising things the system had no field for. That is the man from the first section, generalized. We had built something that could hear answers and not people.",
      ],
      divider: true,
    },
    {
      h: "We were the failure",
      tldr: "The calls were not dying because candidates said no. They were dying because we broke, right after the hard part.",
      p: [
        "The assumption going in, the one the entire outbound calling industry runs on, was that the problem is reach, not enough people pick up, so dial more. The log said otherwise.",
        "Of the 43 coded calls, about a quarter, 10 of them, connected and then died before a single screening question was asked. The candidate had already done the hard part. They had answered an unknown number, decided we were not a scam, and stayed on the line, and then the system dropped them. Three of those calls carry the diagnosis in the recruiter's own words: one logged simply as incomprehensible, one where the agent could not pronounce the candidate's name and had no fallback for it, and one where the agent fell silent after its own first sentence, a candidate the study itself flags as clearly interested and lost to the failure, not to disinterest.",
        "The mechanism is latency. Production voice agents were answering in 1.4 to 1.7 seconds where a human conversation runs on a gap of roughly two tenths of a second, and past about a second of silence a person does not think the machine is thinking. They think the call has dropped, and they hang up, and the log records it as a failure to engage.",
        "The log held two more injuries worth naming. Around 9% of dials were duplicates, one candidate rung three separate times in a single week, which is not a data hygiene issue, it is a person being harassed by software. And one candidate told us plainly that the brand always calls and never follows up with anything real. In a market that saturated with spam, an empty check-in is indistinguishable from spam, and once you are filed under spam you do not get filed back.",
      ],
      ul: [
        "43 calls coded over ten days, 39 unique numbers, six candidate-experience categories, a recruiter note kept against each one",
        "10 of 43 connected and then died before the first question, about a quarter; roughly 9% of dials were duplicates; at least one clearly interested candidate was lost to a system failure, not disinterest",
        "The mechanism: 1.4 to 1.7 seconds of agent latency against the roughly two tenths of a second a human conversation expects",
      ],
      fig: "callJourney",
      figure:
        "The candidate journey from the field log: ring, screen, pick up, engage, outcome. The cliff sits at engage, where about a quarter of connected calls die after hello and before the first question, which is why the first fix taught the agent to recover out loud instead of going silent.",
      divider: true,
    },
    {
      h: "The agent I killed",
      tldr: "We built one ambitious, open, do-everything agent. Granularity beat it.",
      p: [
        "The first version is the one you would build too. A single agent, one flow, an open conversation that could handle anyone who picked up, because handling anyone is what a capable system should do, and because we thought we were breaking ground.",
        "It failed on completion, and completion was the nightmare. People would answer and then leak out of the middle of the call. What killed the generalist was not intelligence, it was granularity, the specifics of each use case turned out to be decisive, and one flow could not hold four axes of difference at once. Role level, because a factory worker and a mid-manager are not having the same conversation. Language and region, because how much Gujarati sits inside an English sentence is not a toggle. Job function, because the vocabulary of a technical role and a plant role diverge immediately. And candidate temperature, because someone who applied yesterday and someone being re-engaged cold from a database two years old need entirely different first sentences.",
        "So I split it. Not into more intelligence, into more specificity, which is the opposite of where the instinct pulls you when the thing you are building is an AI.",
      ],
      divider: true,
    },
    {
      h: "When to call",
      tldr: "Before a single word of the script changed, pickup moved. Timing turned out to be a design variable, not an operations one.",
      p: [
        "Pickup was abysmal at the start, and the first real gain had nothing to do with what the agent said. It came from when it dialled. Availability by hour differs predictably by job type, so we stopped dialling a list and started profiling before dialling: job type and shift pattern, the hour a candidate had applied, what had happened on previous attempts to that person, and where they lived relative to the job.",
        "The finding I did not expect is that for some roles the best window was the commute. The conversation is short, and a candidate on a bus has nothing else competing for the next few minutes, no supervisor, no machine noise, no reason to cut it short. The worst thing you can do to a factory worker is ring them mid-shift, which is exactly what a naive dialer does at eleven in the morning, because that is when call centres are staffed.",
        "Honest limit: the retiming and the per-flow rewrite went out in the same window, and nobody logged their effects separately. I can tell you both moved. I cannot tell you the split between them, which is a measurement mistake I would not repeat.",
      ],
      divider: true,
    },
    {
      h: "Asking first",
      tldr: "The agent asks whether now is a good time. Most people do not say no, they say when.",
      p: [
        "Every call opens by asking whether this is a good moment to talk. In a cold sales call this is close to the worst opening you can use, data from tens of thousands of recorded sales calls puts it among the lowest performing lines measured, because it hands a stranger the easiest possible exit. I knew that going in and used the line anyway, because a job screen is not a sales call, and the psychology runs the other way.",
        "An unscheduled AI call to someone who already applied for a job is exactly the kind of interaction that makes a person feel cornered, and the well established finding on that feeling is that people resist it rather than comply with it. Asking, and meaning it, hands the choice back. Most candidates did not take the exit. They proposed a time of their own instead, and those callbacks turned into the most engaged conversations in the set, because a person who sets their own appointment has committed to it, which is a steadier yes than one you talk someone into on the spot.",
        "It is also the honest expression of the stance underneath all of this. If the candidate is the primary user, their time is the constraint the system bends around, not the other way about.",
      ],
      divider: true,
    },
    {
      h: "How it sounds",
      tldr:
        "Silence reads as a dropped call, but the fix was never to make the machine sound more human. It was an old telephony trick, and saying plainly what it is.",
      p: [
        "Latency was the killer, 1.4 to 1.7 seconds where a real conversation runs on a gap closer to two tenths of a second, and the instinct once you know that is to make the agent as fast as possible everywhere. That is not quite right either. A study that spliced a 1.2 second delay into otherwise ordinary conversations found people did not just notice the lag, they rated the other person as less attentive and less friendly for it, character judged by a number nobody consciously registered. So the wait time moves in both directions depending on the moment: as fast as the pipeline allows almost everywhere, and deliberately slower right after a candidate says something that cost them something, because an instant reply there reads as nobody having listened.",
        "The harder call was the silence itself, and I want to be precise about what I can and cannot claim here. Telephone systems have synthesized a low background hum during silent stretches for decades, for exactly one reason: total digital silence gets misread as a dropped line. That much is a real, decades-old engineering standard, not a hunch. What I cannot claim, because I went looking for the research and it is not there, is that adding ambient sound makes an AI voice feel more human or more trustworthy. The nearest evidence actually points the other way, background noise tends to read as less professional, not more. So the ambient bed in this call does one job only: telling the candidate the line is live. It is not standing in for a person, and I kept it from reading that way on purpose, because dressing a machine up to sound like a busy human office is the same move that cost Google real credibility with Duplex. The honest fix for a fake sense of humanity was never more atmosphere. It was saying plainly what the caller is.",
        "Which Stella did, every time. She introduced herself as an AI assistant before asking anything. No law in India requires that today, and I want to be honest that this was a choice, not a box I was ticking. But every serious version of this regulation anywhere in the world converges on the same rule for exactly this situation, and the research on what happens when people find out afterward that a call went undisclosed says it more bluntly: getting caught not telling someone costs more trust than telling them would have. Silence was never the safe option. It only felt like one.",
      ],
      divider: true,
    },
    {
      h: "Whose language",
      tldr:
        "Ahmedabad hires speak Gujarati woven into English, not one language handed to a machine, so almost every default I started with turned out wrong.",
      p: [
        "The roles that needed the calling agent most were factory roles in Ahmedabad, and factory-floor candidates there speak Gujarati, or Gujarati and English inside the same sentence. That is the whole design problem in one line: a system that offers a clean choice between two languages has already misread how its user talks.",
        "On address alone I got several defaults wrong before I got them right. Tame, the honorific you, never tu, on every call to every candidate regardless of role or age, because a model left to choose gets it wrong roughly one time in five, and it gets it wrong in exactly the direction that reads as an employer talking down to an applicant. The name is spoken with bhai or ben resolved once from the record, never the general politeness particle ji, and never a guessed kinship word like kaka or masi, because those carry an age assumption a phone call has no way to check. And the greeting is kem chho, never namaste or jai shri krishna, because both carry real religious weight and roughly one candidate in seven in Ahmedabad district is Muslim. Kem chho carries none of that, and it still does the honorific work, in the same word.",
        "The place I was wrong in an earlier draft of this case: I wrote that the agent asks a candidate their preferred language and switches fully to it. It does not, and it should not. Proficiency is not something you can ask about honestly on a cold call, people say they are comfortable in English out of politeness and then struggle through it. What actually works is a light nudge: open in Gujarati with a word or two of English already inside it, job, interview, shift, the words people already borrow, then mirror whatever the candidate does on their first real answer. The call finds the mix. It is never assigned one at the start.",
        "The sharpest failure point was never comprehension, it was numbers and names. Gujarati's teens and twenties into the fifties share their base with the following ten, so a clipped syllable can turn a forty-nine into a fifty-nine and nobody notices until the wrong candidate gets a callback. So every number that matters, a salary, a notice period, a shift time, gets read back and confirmed before it is written down, never accepted on the first pass. Same rule for a name the agent has never pronounced before: read it back, or ask, never guess and move on.",
        "Honest scope: this is the part of the project with the furthest still to go. We never disaggregated completion by dialect or by how comfortable a candidate was in Gujarati against Hindi against English, so I cannot tell you whether the system quietly worked worse for someone calling in with a rural accent than for someone calling from central Ahmedabad. That is the equity question this design opens and does not yet answer.",
      ],
      divider: true,
    },
    {
      h: "Listening underneath",
      tldr: "The fix the man in the first section forced: a script that confirms, and agents underneath it that listen.",
      p: [
        "His call failed for a structural reason, not a careless one. The agent had one job, confirming a set of fields, and it did that job perfectly while a person told it something more important than any of them. You cannot script your way out of that. No version of a questionnaire anticipates everything a person might volunteer, and adding more questions makes the call longer, which is the thing already killing it.",
        "So the fix was to stop asking one agent to do two kinds of work. The scripted flow keeps doing what it is good at, moving through the fitment questions in order. Underneath it, sub-agents run in parallel across the same conversation, listening for what the script cannot: intent, what this person actually wants and is telling us unprompted; distress, when someone is upset or confused rather than merely quiet; comprehension, whether they are genuinely following or politely agreeing; and escalation, the moment this needs a human and no more machine.",
        "The design principle underneath it is one sentence. A person is more than the fields you called to collect. The architecture is that sentence made literal, and it is the piece of this project I am proudest of, because it came from one wasted phone call rather than from a framework.",
      ],
      fig: "stellaSim",
      figure:
        "Take the call yourself. You play the candidate, and every reply you can pick is a real case from the field log, including the ones that broke the system. Tap any of Stella's lines to see the decision behind it. The path worth taking is the one where you tell her you badly need work, because it forks: what the old script did with that, and what the rebuilt one does.",
      divider: true,
    },
    {
      h: "The dashboard nobody wanted",
      tldr: "Everyone asked for agent performance. What they were accountable for was the job.",
      p: [
        "This one is not about the call, and it earns its place here because it is the same mistake in a different coat.",
        "In the product's earliest shape, every conversation with users pulled toward agent performance, how many CVs did the screening agent read overnight, how accurate is it, which agent is pulling its weight. It sounds like exactly the right question for an AI product, the metrics already existed, and honestly the pull was real on our side too, because a wall of live counters looks like proof the thing works. We came close to shipping a control panel for the machines.",
        "It answers nothing anyone is accountable for. Nobody is measured on a calling agent's connect rate. People are measured on whether a role closes, well and fast and fairly, and whether the shortlist they forward with their own name on it holds up in the room. Agent performance was the doorway. Job performance was the room.",
        "The correction became a rule we designed by afterward: job performance is the end, agent performance is the means. Every surface leads with the outcome a person is accountable for, and agent activity demotes to a drill-down you open only when a role is off track and you need to know what to tune. It rhymes with the calling story exactly. Both are a system showing you what it cares about instead of what you needed.",
      ],
      divider: true,
    },
    {
      h: "What changed",
      tldr: "Of the calls that connect, 71% now finish the screen, up from 35 to 40% before.",
      p: [
        "Every recommendation from the field work shipped: recovering out loud instead of falling silent, a hard limit against dialling the same person twice, a concurrency cap tied to what the backend could actually hold at conversational speed, the disclosure line, the retiming, the split flows, and the listening layer underneath. Stella introduces herself as an AI assistant on every call, which is both the honest thing and, increasingly, the direction the law is heading even where it does not yet require it.",
        "The number that moved is completion. Of the calls that connect, 71% now run all the way through the screen, up from 35 to 40% when I started. I want to be careful with it, because it is easy to state a number in a way that flatters. It is measured over calls that connected, not over everyone dialled, and the connect rate is a separate measure with its own denominator that I will not blend into the same sentence just to make the arc look steeper.",
        "The human version matters more to me. A candidate who picks up now gets told plainly what this is and how long it will take, gets asked whether now actually suits them, gets heard when they say something the form did not ask for, and gets told what happens next whether or not they fit. That is the outcome I would defend. The number is just the shape it makes in the data.",
      ],
      ul: [
        "Completion of connected calls: 71%, up from 35 to 40% before the work",
        "Shipped: dead-air recovery, a per-candidate dedup lock, a concurrency cap tied to real backend throughput, AI disclosure, persona-split flows, predictive call timing, and the parallel listening layer",
        "Method behind it: roughly 300 transcripts read, 47 candidates called personally over three weeks, 43 calls coded against six candidate-experience categories",
      ],
      divider: true,
    },
    {
      h: "What I would revisit",
      tldr: "We measured whether the call finished. We never measured whether it was fair, or whether the machine was right.",
      p: [
        "Two changes shipped in the same window, the retiming and the per-persona flows, and nobody logged their effects apart. I can tell you completion moved. I cannot tell you which idea was the good one, and that is a measurement discipline I would build in from day one next time, not add afterward.",
        "The deeper gap sits under the language work. We never disaggregated completion by dialect or by how comfortable a candidate was in Gujarati against Hindi against English. If the system was quietly working worse for a rural accent than a city one, our aggregate number would have hidden it perfectly, and it would still have gone up. That is the instrumentation I would build before any new capability.",
        "And we built a whole trust layer, legible reasoning, a human able to override every call, a real escalation path, and never measured the one number that tells you whether any of it was earning its keep: how often a human actually disagreed with what the system recommended. A screening system that only reports speed and volume is, from the outside, indistinguishable from a very fast way of rejecting people. I would instrument that first, before I built anything else.",
      ],
    },
  ];
  v2.pdfSections = [
    "What he told us",
    "The hardest surface",
    "Three hundred transcripts",
    "We were the failure",
    "The agent I killed",
    "When to call",
    "Asking first",
    "How it sounds",
    "Whose language",
    "Listening underneath",
    "The dashboard nobody wanted",
    "What changed",
    "What I would revisit",
  ];
  v2.todo = [
    "FULL DRAFT WRITTEN END TO END, 2026-07-24, per Claude/dassh-rewrite-brief.md. 13 sections: hero opening, the hard problem, method, the disaster, the kill, timing, asking first, sound, language, the architectural fix, the reversal, outcomes, reflection. All numbers corrected (71% of CONNECTED calls, 10 of 43 recounted from 34.9%). All research-backed claims (Gujarati register, turn-taking/comfort-noise, permission psychology, disclosure law) sourced from the four verified briefs in Claude/.",
    "DEFAULTS APPLIED where Agam's answer was still pending, per the brief's own fallback guidance: the recruiter-mock scene is CUT entirely (it traced to an auto-generated file built on a fabricated persona, Sneha Krishnan; the misread itself is real and is told straight as a design argument in 'The dashboard nobody wanted' with no quoted dialogue). No hire is claimed anywhere (Agam: 'not sure if should mention it'); the case closes on the personal callback plus the honest reflection instead. The four-experiences tour, the design-system section and the fundraise are NOT included as sections, per the locked decision that only the reversal survives outside the call spine.",
    "STILL OPEN, none of them block reading the draft: (1) should a real hire be mentioned if one exists; (2) the shipped-vs-designed ledger for anything beyond the calling agent, since this draft only covers the calling agent and the reversal, not the four experiences or the design system, those are cut rather than resolved; (3) the raw 43-row log, to tighten '10 of 43' to an exact count if Agam pulls it; (4) post-2025 status and whether specific dates can be published; (5) whether the case should stay narrow to the calling agent (current draft) or fold back in a compressed 'zero to one' context section for breadth.",
    "Deck (dassh.deck.js) and PRD (dasshPrdData.js, dasshPersonaData.js) do not yet reflect this narrative; they still carry the four-experiences framing. Sync only after Agam reviews this draft.",
    "When approved, decide whether this replaces the live /work/dassh entry or stays a parallel cut.",
  ];
}

// A passcode-gated case study: the full interactive Away PRD, embedded behind a
// soft lock. NOTE: cosmetic only — the doc at prdSrc is a public asset and the
// passcode ships in the client bundle, so change `passcode` to taste but do not
// treat it as real security. Routes at /work/away-prd.
caseStudies["away-prd"] = {
  locked: true,
  accent: "#2563EB",
  brand: "Away",
  eyebrow: "Away · Product requirements",
  title: "The Away PRD",
  blurb:
    "The full interactive product-requirements doc for the Away agent: the build ladder, the live spec, and the risks. Protected, enter the passcode, or request access.",
  passcode: "away2026",
  prdSrc: "/prd/away-prd.html",
};

// The prompt library (WIP): two families under one roof, the voice frameworks that
// write product copy and the image systems that draw everything else, rendered as a
// native PRD-style page. Routes at /work/prompt-library.
caseStudies["prompt-library"] = {
  locked: true,
  doc: "prompt-library",
  accent: "#7c8cff",
  brand: "Craft",
  eyebrow: "Craft · Prompt systems",
  title: "The prompt library",
  blurb:
    "Two kinds of prompt in one place. The voice frameworks behind Away and Zepto: personas, principles, word lists, rules, and the moments they generate. And seven image systems: icons, composition, specimen cards, doodle hands, and aircraft turnarounds, each a constant style plus a few dials. Work in progress. Protected, enter the passcode, or request access.",
  passcode: "away2026",
};

// Team prompts (WIP): text prompts that do each function's working documents, for the
// seven teams Agam collaborated with. Moved out of the prompt library onto its own
// route on 2026-09-04. Routes at /work/team-prompts.
caseStudies["team-prompts"] = {
  locked: true,
  doc: "team-prompts",
  accent: "#7c8cff",
  brand: "Craft",
  eyebrow: "Craft · Prompt systems",
  title: "Team prompts",
  blurb:
    "Seven roles, forty-four tasks, one assembler. Data science, product, last mile, backend and frontend engineering, design leads and company leadership, each a persona plus the function's own principles, vocabulary, rules and test, every clause sourced from its practitioners. Work in progress. Protected, enter the passcode, or request access.",
  passcode: "away2026",
};

// The colour system (WIP): colour libraries under one roof, the way the prompt
// library holds its voice and image systems. First library is Zepto (six themes,
// five status states, ten invariants), every ratio computed at render time.
// Routes at /work/color-system.
caseStudies["color-system"] = {
  locked: true,
  doc: "color-system",
  accent: "#8B5CF6",
  brand: "Craft",
  eyebrow: "Craft · Colour systems",
  title: "The colour system",
  blurb:
    "Colour libraries in one place. Zepto: six themes from green to lavender, five unavailability states where hue is the domain and depth the severity, and ten invariants each learned by breaking it. Away: the brand palette, the app's twelve ramps, and the three accents that disagree. Every contrast ratio on the page is computed from the hex beside it, never typed. Work in progress. Protected, enter the passcode, or request access.",
  passcode: "away2026",
};

// The Away Deep Search analytics dashboard (WIP). Same soft-lock, but renders the
// self-contained, theme-aware HTML at `embedSrc` in an iframe that switches with
// the site's light/dark (via postMessage). Routes at /work/away-deep-search.
caseStudies["away-deep-search"] = {
  locked: true,
  doc: "away-analytics", // native PostHog analytics page (was embedSrc iframe)
  accent: "#6d5cf0",
  brand: "Away",
  eyebrow: "Away · Deep search analytics",
  title: "Deep search & negotiation",
  blurb:
    "A live analytics read of Away's AI negotiation engine: search volume, the retail-vs-negotiated split, credit economics, the results funnel, and the carriers it negotiates on. Work in progress. Protected, enter the passcode, or request access.",
  passcode: "away2026",
};

// The Away design system (WIP). Same embedSrc iframe pattern — the living
// design-system gallery (tokens, uiKit primitives, chart/dashboard components),
// theme-aware so it follows the site's light/dark. Routes at /work/away-design-system.
caseStudies["away-design-system"] = {
  locked: true,
  embedSrc: "/prd/away-design-system.html",
  accent: "#41aecc",
  brand: "Away",
  eyebrow: "Away · Design system",
  title: "The Away design system",
  blurb:
    "The living design-system reference for the Away app: color ramps, semantic tokens, spacing, radius, typography, the uiKit primitives, and the WIP chart/dashboard components — in light and dark. Work in progress. Protected, enter the passcode, or request access.",
  passcode: "away2026",
};

// The Dassh design system playground (WIP). Embeds the @dassh/ui Storybook static
// build (public/sds-playground/) in an iframe so components can be poked with live
// controls/knobs. Regenerate: build Storybook in Code/dassh-ui, copy dist/storybook
// → public/sds-playground/. Routes at /work/dassh-sds.
caseStudies["dassh-sds"] = {
  locked: true,
  embedSrc: "/sds-playground/index.html",
  accent: "#F26A1B",
  brand: "Dassh",
  eyebrow: "Dassh · Design system",
  title: "The Dassh design system (@dassh/ui)",
  blurb:
    "The centralized Dassh design system as a live Storybook: primitives, layout, compositions, hooks and icons, each with interactive controls to fine-tune. Work in progress.",
  passcode: "dassh2026",
};

// The Dassh PRD (WIP). Same soft-lock pattern as away-prd, but rendered from the
// native React doc (DasshPrdDoc) rather than an embedded HTML asset. `doc: "dassh"`
// tells LockedCaseStudy which doc component to mount. Routes at /work/dassh-prd.
caseStudies["dassh-prd"] = {
  locked: true,
  doc: "dassh",
  accent: "#F26A1B",
  brand: "Dassh",
  eyebrow: "Dassh · Product requirements",
  title: "The Dassh PRD",
  blurb:
    "The global product-requirements doc for Dassh: the agent fabric, the personas, the Daily Report, and the risks. Work in progress. Protected, enter the passcode, or request access.",
  passcode: "dassh2026",
};

// The Scheduled Delivery PRD (WIP). Same soft-lock pattern as dassh-prd, rendered
// from the native React doc (ScheduledPrdDoc). `doc: "scheduled"` tells
// LockedCaseStudy which doc component to mount. Routes at /work/scheduled-prd.
caseStudies["scheduled-prd"] = {
  locked: true,
  doc: "scheduled",
  accent: "#6B21D9",
  brand: "Zepto",
  eyebrow: "Zepto · Product requirements",
  title: "The Scheduled Delivery PRD",
  blurb:
    "The product-requirements doc for Zepto Scheduled Delivery: the trust bet, the per-shipment model, the slot system, the state matrix, the field gap analysis, and the risks. Work in progress. Protected, enter the passcode, or request access.",
  passcode: "zepto2026",
};

// The Edge (JARVIS) problem-framing PRD (WIP). Same soft-lock pattern, rendered
// from the native React doc (JarvisPrdDoc). `doc: "jarvis"` tells LockedCaseStudy
// which doc component to mount. IDEO steps 1 to 4. Routes at /work/jarvis-prd.
caseStudies["jarvis-prd"] = {
  locked: true,
  doc: "jarvis",
  accent: "#9826C9",
  brand: "Zepto",
  eyebrow: "Zepto · Edge · Product requirements",
  title: "The Edge PRD",
  blurb:
    "The problem-framing and discovery doc for Edge (codename JARVIS), Zepto Ads' AI intelligence layer: the competitor map, the driver and trust problems, the role-altitude whitespace, and the ideas, run through the IDEO process steps 1 to 4. Work in progress. Protected, enter the passcode, or request access.",
  passcode: "edge2026",
};

// The ZepIris PRD (WIP v0.2). Same soft-lock pattern, rendered from the native
// React doc (ZepirisPrdDoc). `doc: "zepiris"` tells LockedCaseStudy which doc
// component to mount. Retroactive v1 record + researched v2 adaptive-capture
// layer, 70+ verified citations. Routes at /work/zepiris-prd.
caseStudies["zepiris-prd"] = {
  locked: true,
  doc: "zepiris",
  accent: "#4F46E5",
  brand: "Zepto",
  eyebrow: "Zepto · ZepIris · Product requirements",
  title: "The ZepIris PRD",
  blurb:
    "The requirements doc for ZepIris (codename OdinEye), Zepto's open-sourced face-authentication platform: the verified field research (NIST, ISO, ICAO, India's own deployments), the repo read closely, the 16-pattern Adaptive Capture layer, the motion spec, and the honesty ledger. Work in progress. Protected, enter the passcode, or request access.",
  passcode: "zepiris2026",
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

// `...rest` (20 Sep 2026): this used to destructure exactly four props and drop
// everything else, so an `aria-label` passed to a Link silently never reached
// the DOM. That is invisible until a link has no text - the icon-only Back
// arrow rendered as an unnamed link, announced as just "link". The explicit
// props still come after the spread, so they win.
function Link({ to, className, style, children, ...rest }) {
  const navigate = useContext(NavContext);
  const internal = typeof to === "string" && to.startsWith("/");
  return (
    <a
      {...rest}
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
    const inner = (
      <>
        {main}
        <span className="work__meta">
          {project.brand}
          {/* "Locked" badge commented out — the passcode gate is gone site-wide,
              so the tag is misleading. Restore this span to bring it back. */}
          {/* <span className="work__lock"><LockIcon />Locked</span> */}
        </span>
      </>
    );
    // a locked item with an href opens its passcode gate; without one it is an
    // inert "locked" teaser.
    return project.href ? (
      <Link className="work__item work__item--locked" style={style} to={project.href}>
        {inner}
      </Link>
    ) : (
      <div className="work__item work__item--locked" style={style}>
        {inner}
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

function Footer({ credits }) {
  return (
    <footer className="footer">
      {/* per-page credits (a licence that needs attribution, say) */}
      {credits && <span className="footer__credits">{credits}</span>}
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

/* Scan-mode rows (nan.fyi-style list) built from the read-mode projects.
 *
 * v1 (full list) — KEPT FOR REFERENCE. The live scan page now renders the
 * curated 6-project `scanProjects` list defined below. To revert the scan page
 * to the full list, render `scanProjectsV1` instead of `scanProjects` in Home. */
const scanProjectsV1 = [
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
    href: "/work/cross-sell",
    brand: "Zepto",
    year: "2026",
    accent: "#0F6E56",
    title: "The half of cross-sell nobody solved",
    blurb: "Cross-sell at Zepto, end to end: the objective function and the framework, the three ad surfaces that shipped or were green-lit, and the discovery half no engine has solved.",
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
    title: "The layer someone else was building",
    blurb: "Designing Edge (JARVIS), the AI copilot that closes the loop from metric to one-click action on Zepto Ads.",
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
  {
    href: "/work/aiims",
    brand: "AIIMS",
    year: "2023",
    accent: "#059669",
    title: "Teaching empathy to nurses in virtual reality",
    blurb: "A published AIIMS study: an India-first empathy scale and a VR environment where nurses practise a hard conversation, evaluated against a real control group.",
  },
];

/* v2 (live) — curated to 6. Three confirmed case studies, then three AI-project
 * slots to be decided. Fill a placeholder by replacing it with a real entry
 * (href / brand / year / accent / title / blurb) and dropping `placeholder`.
 *
 * v3 "departure board / promise ledger" fields (scan view only):
 *  - status: the outcome as a split-flap board chip (uppercase, short; outcomes
 *    stay ratio-only per the resume's confidentiality rule — no absolute numbers)
 *  - role: what Agam personally did (the chip both recruiters and CMU hunt for).
 *    Omitted where not yet confirmed (away-agent awaits real role facts). */
const scanProjects = [
  {
    href: "/work/away-agent",
    brand: "Away",
    year: "2026",
    accent: "#2563EB",
    title: "An agent that never takes the wheel",
    blurb: "An AI travel agent for the whole trip, find, vet, book, watch, rescue, that does the work of the best human agent on the phone and never takes the wheel.",
    status: "V1 LIVE",
    role: "Led interaction design",
  },
  {
    href: "/work/scheduled-delivery",
    brand: "Zepto",
    year: "2025",
    accent: "#6B21D9",
    title: "Scheduled delivery on a 10-minute platform",
    blurb: "A scheduled cart settles at nearly twice the value of an instant one. Planned, time-slotted delivery on a platform built for 10 minutes, without diluting the promise that made it.",
    status: "AOV NEARLY 2X",
    role: "Led interaction design",
  },
  {
    href: "/work/zepiris",
    brand: "Zepto",
    // 2026, not 2025. Every other source says so — TIMELINE in helloData
    // (20/01/2026), the `projects` list above, and scanProjectsV1. This row was
    // the only place carrying 2025. Corrected 2026-08-07 even though this board
    // is currently unrendered: a wrong year left in place is a wrong year the
    // day someone puts the board back.
    year: "2026",
    accent: "#4F46E5",
    title: "The face that clocks in every Zepto site",
    // "(OdinEye)" removed 2026-08-07: attested as the INTERNAL code name, and
    // an internal code name is not something a portfolio should publish.
    blurb: "ZepIris: Zepto's in-house face authentication for riders, pickers and packers, and its first open-source release. I led design end-to-end and the launch. 100% hub coverage, up to ₹50L/month saved, shipped to GitHub.",
    status: "OPEN SOURCE",
    role: "Led design end-to-end",
  },
  {
    href: "/work/dassh",
    brand: "Dassh",
    year: "2025",
    accent: "#EA580C",
    title: "Building a B2B SaaS from the ground up",
    blurb: "Stella, an AI recruiter: four experiences, an agent system, and a design system that shipped its own code.",
    status: "0 TO 1",
    role: "Founding designer",
  },
  { placeholder: true, accent: "#6366F1", title: "AI project", blurb: "To be decided.", status: "SCHEDULED" },
  { placeholder: true, accent: "#6366F1", title: "AI project", blurb: "To be decided.", status: "SCHEDULED" },
  { placeholder: true, accent: "#6366F1", title: "AI project", blurb: "To be decided.", status: "SCHEDULED" },
];

// Split-flap status chip for scan rows: each letter is a board tile with a
// midline seam that flips in once, staggered, on the row's own entry delay
// (see .scan-flap__cell in index.css; reduced motion parks the settled state).
// Words are separate flex groups so multi-word statuses wrap cleanly.
function StatusFlap({ text }) {
  let fi = 0;
  return (
    <span className="scan-flap" role="img" aria-label={text}>
      {text.split(" ").map((word, w) => (
        <span className="scan-flap__word" key={w} aria-hidden="true">
          {word.split("").map((ch, c) => (
            <span className="scan-flap__cell" style={{ "--fi": fi++ }} key={c}>
              {ch}
            </span>
          ))}
        </span>
      ))}
    </span>
  );
}

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

// States 2 & 3 (the emoji pops) are hidden for now — only the hand wave plays.
// Re-add the emoji entries below to bring them back into the rotation.
const HEADER_ASSETS = [
  { kind: "wave" },
  // { kind: "emoji", items: ["🍕", "☕"] },
  // { kind: "emoji", items: ["📐", "📷"] },
];

// Optional WIP shelf: src/wip.local.jsx is git-ignored and present only locally.
// import.meta.glob resolves to {} when the file is absent, so the build never
// breaks — the section simply doesn't render where the file isn't there.
const wipMods = import.meta.glob("./wip.local.jsx", { eager: true });
const WipSection = Object.values(wipMods)[0]?.WipSection || null;

// Optional /socials page: src/socials.local.jsx is git-ignored and present only
// locally (private drafts). Resolves to null in any build where the file is
// absent, so the route falls through to Home and nothing ships publicly.
const socialsMods = import.meta.glob("./socials.local.jsx", { eager: true });
const SocialsPage = Object.values(socialsMods)[0]?.SocialsPage || null;

// Optional /carnegie page: src/carnegie.local.jsx is git-ignored and present only
// locally (private grad-application workspace). Resolves to null when the file is
// absent, so the route falls through to Home and nothing ships publicly.
const carnegieMods = import.meta.glob("./carnegie.local.jsx", { eager: true });
const CarnegiePage = Object.values(carnegieMods)[0]?.CarnegiePage || null;

// Optional /pepo-house page: src/pepohouse.local.jsx is git-ignored and present
// only locally (private client tracker). Resolves to null when the file is
// absent, so the route falls through to Home and nothing ships publicly.
const pepoHouseMods = import.meta.glob("./pepohouse.local.jsx", { eager: true });
const PepoHousePage = Object.values(pepoHouseMods)[0]?.PepoHousePage || null;

// Optional /writing page: src/writing.local.jsx is git-ignored and present only
// locally — the writing-craft harness's Fadell-register drafts, one tab per piece.
const writingMods = import.meta.glob("./writing.local.jsx", { eager: true });
const WritingPage = Object.values(writingMods)[0]?.WritingPage || null;

// Optional /claude-files page: src/claudefiles.local.jsx is git-ignored and
// present only locally (private registry of Claude-built docs/harnesses/pipelines).
// Resolves to null when the file is absent, so the route falls through to Home.
const claudeFilesMods = import.meta.glob("./claudefiles.local.jsx", { eager: true });
const ClaudeFilesPage = Object.values(claudeFilesMods)[0]?.ClaudeFilesPage || null;

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
  // Phone-width flag for the scan DJ embed: below 760px the widget is a
  // full-width band, and the camera's world box drops to the /hello booth's
  // 4.7 (the 9.4 default is mostly empty air above/below the console — fine
  // beside the header on desktop, dead space on a phone). The CSS aspect-ratio
  // for .scan-dj-embed at this width must stay 13/4.7 to match.
  const [compact, setCompact] = useState(
    () => window.matchMedia("(max-width: 760px)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 760px)");
    const onChange = (e) => setCompact(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return (
    <div className={mode === "scan" ? "page page--scan" : "page"}>
      {/* DJ console hero intentionally NOT embedded here yet — building it out on
          the standalone /dj route first, then it gets placed on the home page. */}

      {/* The reader's own sky: real local time, real current weather, city-level
          location from the IP with no permission prompt. Lazy + Suspense-null so
          WebGL and the fetches never sit in front of the first paint. */}
      <Suspense fallback={null}>
        <WeatherSky />
      </Suspense>

      <header className="header">
        <span className="header__avatar-wrap" onMouseEnter={replayGreeting}>
          {/* the face morphs on load, on every hover (replayId), and on the 10s
              auto-cycle (cycle) so it animates in step with the looping wave.
              Distinct key namespace so the two siblings never collide (no stacked faces). */}
          <MorphFace key={`face-${cycle}-${replayId}`} />
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
          <a href="/resume/agam-agarwal-product-design.pdf" target="_blank" rel="noopener noreferrer">Resume</a>
          <a href="https://www.linkedin.com/in/agam-agarwal/">LinkedIn</a>
        </nav>
      </header>

      {/* Scan mode only: a compact technical-drawing DJ console + play/pause,
          parked at the right of the header. Lazy so three.js loads only here. */}
      {mode === "scan" && (
        <Suspense fallback={null}>
          <div className="scan-dj-embed" aria-label="DJ console">
            <DjConsole variant="scan" frontHeight={compact ? 4.7 : 9.4} />
          </div>
        </Suspense>
      )}

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

            {WipSection && <WipSection WorkItem={WorkItem} Link={Link} />}
          </>
        ) : (
          <>
            {/* Scan v3: the departure board. A claim line states the ledger's
                thesis, a mono board header names the columns, and each row lands
                its outcome as a split-flap status chip. Read mode untouched. */}
            <div className="scan-list">
              {scanProjects.map((p, i) =>
                p.placeholder ? (
                  <div
                    className="scan-row scan-row--placeholder"
                    style={{ "--accent": p.accent }}
                    key={i}
                    aria-hidden
                  >
                    <span className="scan-row__thumb">
                      <ScanThumb />
                    </span>
                    <span className="scan-row__body">
                      <span className="scan-row__head">
                        <span className="scan-row__title">{p.title}</span>
                        <span className="scan-row__meta">TBD</span>
                      </span>
                      <span className="scan-row__desc">{p.blurb}</span>
                    </span>
                    <span className="scan-row__status">
                      {p.status && <StatusFlap text={p.status} />}
                    </span>
                    <span className="scan-row__arrow" />
                  </div>
                ) : (
                  <Link
                    className="scan-row"
                    style={{ "--accent": p.accent }}
                    key={i}
                    to={p.href}
                  >
                    <span className="scan-row__thumb">
                      <ScanThumb />
                    </span>
                    <span className="scan-row__body">
                      <span className="scan-row__head">
                        <span className="scan-row__title">{p.title}</span>
                        <span className="scan-row__meta">
                          {p.brand} · {p.year}
                          {p.role && (
                            <span className="scan-row__role">{p.role}</span>
                          )}
                        </span>
                      </span>
                      <span className="scan-row__desc">{p.blurb}</span>
                    </span>
                    <span className="scan-row__status">
                      {p.status && <StatusFlap text={p.status} />}
                    </span>
                    <span className="scan-row__arrow">
                      <RightArrow />
                    </span>
                  </Link>
                )
              )}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

// Data-driven case-study / detail page. Looks up content by slug; falls back to
// the sample. Replace bracketed [...] copy with the real story.
// "use line icons": was a solid wedge, drawn now, on the same 2px stroke as the
// back arrow it sits beside.
function PlayIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden>
      <path d="M7 4.5 19.5 12 7 19.5z" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Presentation deck framework.
//
// A case study renders to a deck of slides. Two paths:
//  - Deck mode: the case study declares an explicit `deck: [{ type, ... }]`
//    composed from the archetype library below (flexible backbone, any order).
//  - Legacy fallback: no deck, so one `figure` slide per section.
//
// Archetype library (the `type` values): title · statement · splitLabeled ·
// numbered · phaseDivider · phaseIntro · figure · methodFinding · gallery ·
// compare · impact · closing. Each renders in the site's own visual language
// (the same tokens, type and motion as the live article).
// ---------------------------------------------------------------------------
function buildSlides(cs) {
  const title = {
    kind: "title",
    type: "title",
    eyebrow: cs.eyebrow,
    title: cs.title,
    meta: cs.meta,
    lead: cs.lead,
  };

  // Deck mode: a hand-authored, presentation-ready sequence.
  if (Array.isArray(cs.deck) && cs.deck.length) {
    const deck = cs.deck.map((s) => ({ ...s, cover: cs.cover }));
    if (deck[0]?.type === "title") {
      return deck.map((s, i) => (i === 0 ? { ...title, ...s } : s));
    }
    return [title, ...deck];
  }

  // Legacy fallback: derive one slide per section.
  const sections = cs.sections.filter((s) => !s.breaker).map((s) => ({
    kind: "section",
    type: "figure",
    layout: s.split || (s.figure ? "split" : "text"),
    h: s.h,
    p: s.p,
    ul: s.ul?.map((li) => (li?.t ? `${li.t}: ${li.d}` : li)), // { t, d } items (mukwqanr) flatten for slides
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
    whiteboard: s.whiteboard,
    reel: s.reel,
    cover: cs.cover,
  }));
  return [title, ...sections];
}

// Shared: the media half of a slide, reusing the article's figure renderer.
// A "needs" placeholder: a dashed box that names the asset or context still
// missing, so a whole case study can render in present mode at the screen level
// with a clear, labelled gap wherever the real material is not in yet.
function NeedsBox({ label, hint, big, dim }) {
  return (
    <div
      className={`slide__needs${big ? " slide__needs--big" : ""}`}
      role="img"
      aria-label={`Placeholder, needs: ${label}`}
    >
      {/* Figma-selection framing (after the Diagram deck): corner handles + a dimension chip,
          so a missing screen reads as a sized, selected artboard waiting to be designed. */}
      <span className="slide__needs-handle slide__needs-handle--tl" aria-hidden="true" />
      <span className="slide__needs-handle slide__needs-handle--tr" aria-hidden="true" />
      <span className="slide__needs-handle slide__needs-handle--bl" aria-hidden="true" />
      <span className="slide__needs-handle slide__needs-handle--br" aria-hidden="true" />
      <span className="slide__needs-mark" aria-hidden="true">
        +
      </span>
      <span className="slide__needs-tag">Needs</span>
      <p className="slide__needs-label">{label}</p>
      {hint && <p className="slide__needs-hint">{hint}</p>}
      {dim && (
        <span className="slide__needs-dim" aria-hidden="true">
          {dim}
        </span>
      )}
    </div>
  );
}

// Base asset: an outlined "stamp" badge with underlined link text and a slight tilt
// (after Smith & Diction / Andreas Maris, "See full case study" / "Click to see more").
function StampBadge({ children, tilt = -4 }) {
  return (
    <span className="deck-stamp" style={{ "--stamp-tilt": `${tilt}deg` }}>
      <span className="deck-stamp__text">{children}</span>
    </span>
  );
}

// Base asset: a marker-swipe highlight on an inline term (after Smith & Diction).
function Mark({ children, tone }) {
  return (
    <mark className="deck-mark" data-tone={tone}>
      {children}
    </mark>
  );
}

function SlideMedia({ slide, layout, wide }) {
  const hasMedia =
    slide.fig ||
    slide.reel ||
    slide.image ||
    slide.iphone ||
    slide.iphoneSplit ||
    slide.rive ||
    slide.collage ||
    slide.design ||
    slide.whiteboard;
  if (layout === "text") return null;
  // No real asset yet: render the labelled placeholder if the slide says what it needs.
  if (!hasMedia) {
    return slide.need ? (
      <figure className={`slide__media${wide ? " slide__media--wide" : ""}`}>
        <NeedsBox label={slide.need} hint={slide.needHint} dim={slide.needDim} />
      </figure>
    ) : null;
  }
  return (
    <figure className={`slide__media${wide ? " slide__media--wide" : ""}`}>
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
        whiteboard={slide.whiteboard}
        reel={slide.reel}
        cover={slide.cover}
        variant="slide"
      />
      {slide.stamp && <StampBadge>{slide.stamp}</StampBadge>}
      {slide.figure && <figcaption>{slide.figure}</figcaption>}
    </figure>
  );
}

const SlideText = ({ slide }) => (
  <div className="slide__text">
    {slide.h && <h2 className="slide__h">{slide.h}</h2>}
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

function Slide({ slide, onGoto, idMap }) {
  const type = slide.type || (slide.kind === "title" ? "title" : "figure");

  switch (type) {
    case "title":
      return (
        <div className={`slide slide--title is-${slide.frame || "corner"}`}>
          <p className="slide__eyebrow">{slide.eyebrow}</p>
          <h2 className="slide__title">{slide.title}</h2>
          {slide.meta && <p className="slide__meta">{slide.meta}</p>}
          {slide.lead && <p className="slide__lead">{slide.lead}</p>}
        </div>
      );

    case "statement":
      return (
        <div className={`slide slide--statement is-${slide.frame || "quiet"}`}>
          {slide.kicker && <p className="slide__eyebrow">{slide.kicker}</p>}
          <p className="slide__statement">{slide.text}</p>
          {slide.cite && <p className="slide__cite">{slide.cite}</p>}
        </div>
      );

    case "splitLabeled":
      return (
        <div className="slide slide--labeled">
          {slide.h && <h2 className="slide__h">{slide.h}</h2>}
          <div className="slide__labeled-grid" data-cols={(slide.items || []).length}>
            {(slide.items || []).map((it, i) => (
              <div className="slide__labeled-item" key={i}>
                <span className="slide__label">{it.label}</span>
                <p>{it.body}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case "numbered":
      return (
        <div className={`slide slide--numbered${slide.frame ? " is-" + slide.frame : ""}`}>
          {slide.kicker && <p className="slide__eyebrow">{slide.kicker}</p>}
          {slide.h && <h2 className="slide__h">{slide.h}</h2>}
          <div className="slide__num-grid" data-cols={(slide.items || []).length}>
            {(slide.items || []).map((it, i) => (
              <div className="slide__num-item" key={i}>
                <span className="slide__num-badge">{i + 1}</span>
                <h3 className="slide__num-title">{it.title}</h3>
                {it.body && <p className="slide__num-body">{it.body}</p>}
              </div>
            ))}
          </div>
        </div>
      );

    case "phaseDivider":
      return (
        <div className={`slide slide--phase is-${slide.frame || "scaffold"}`}>
          <span className="slide__phase-n">{slide.n}</span>
          <h2 className="slide__phase-name">{slide.name}</h2>
          {slide.sub && <p className="slide__phase-sub">{slide.sub}</p>}
        </div>
      );

    case "phaseIntro":
      return (
        <div className="slide slide--intro">
          <div className="slide__text">
            {slide.phase && <p className="slide__eyebrow">{slide.phase}</p>}
            {slide.h && <h2 className="slide__h">{slide.h}</h2>}
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
        </div>
      );

    case "methodFinding": {
      const media = <SlideMedia slide={slide} layout={slide.fig || slide.need ? "split" : "text"} />;
      return (
        <div className={media ? "slide slide--split" : "slide slide--text"}>
          <div className="slide__text">
            {slide.h && <h2 className="slide__h">{slide.h}</h2>}
            {slide.finding && <p className="slide__finding">{slide.finding}</p>}
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
            {slide.data && (
              <dl className="slide__data">
                {slide.data.map((d, i) => (
                  <div key={i}>
                    <dt>{d.k}</dt>
                    <dd>{d.v}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
          {media}
        </div>
      );
    }

    case "gallery": {
      const hasFig = slide.fig || slide.reel || slide.design || slide.collage || slide.image || slide.whiteboard;
      return (
        <div className="slide slide--gallery">
          <div className="slide__text slide__text--top">
            {slide.h && <h2 className="slide__h">{slide.h}</h2>}
            {(slide.p || []).map((p, j) => (
              <p key={j}>{p}</p>
            ))}
          </div>
          {hasFig || slide.need ? (
            <SlideMedia slide={slide} layout="media" wide />
          ) : (
            <div className="slide__tiles">
              {(slide.tiles || []).map((t, i) => (
                <div className="slide__tile" key={i}>
                  <span className="slide__tile-label">{t.label}</span>
                  {t.sub && <span className="slide__tile-sub">{t.sub}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    case "compare": {
      const side = (s, won) =>
        s ? (
          <div className={`slide__compare-side${won ? " is-winner" : ""}`}>
            <span className="slide__compare-label">{s.label}</span>
            <p>{s.body}</p>
            {s.verdict && <span className="slide__compare-verdict">{s.verdict}</span>}
          </div>
        ) : null;
      return (
        <div className="slide slide--compare">
          {slide.h && <h2 className="slide__h">{slide.h}</h2>}
          <div className="slide__compare-grid">
            {side(slide.a, slide.winner === "a")}
            {side(slide.b, slide.winner === "b")}
          </div>
          {slide.note && <p className="slide__compare-note">{slide.note}</p>}
        </div>
      );
    }

    case "impact": {
      const heroIndex = Number.isInteger(slide.heroIndex) ? slide.heroIndex : 0;
      return (
        <div className={`slide slide--impact is-monument${slide.frame ? " is-" + slide.frame : ""}`}>
          {slide.mark && <span className="slide__impact-mark">{slide.mark}</span>}
          {slide.h && <h2 className="slide__impact-h">{slide.h}</h2>}
          <div className="slide__metrics" data-cols={(slide.metrics || []).length}>
            {(slide.metrics || []).map((m, i) => (
              <div
                className={`slide__metric${i === heroIndex ? " slide__metric--hero" : ""}`}
                key={i}
              >
                <span className="slide__metric-value">{m.value}</span>
                <span className="slide__metric-label">{m.label}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case "closing":
      return (
        <div className={`slide ${slide.kind === "thanks" ? "slide--thanks" : "slide--outcome"}`}>
          {slide.kind === "thanks" ? (
            <h2 className="slide__title">{slide.h}</h2>
          ) : (
            <h2 className="slide__h">{slide.h}</h2>
          )}
          <div className="slide__text">
            {(slide.p || []).map((p, j) => (
              <p key={j}>{p}</p>
            ))}
          </div>
        </div>
      );

    case "needs":
      return (
        <div className="slide slide--text slide--needs-full">
          {slide.kicker && <p className="slide__eyebrow">{slide.kicker}</p>}
          {slide.h && <h2 className="slide__h">{slide.h}</h2>}
          {(slide.p || []).map((p, j) => (
            <p key={j} className="slide__needs-intro">
              {p}
            </p>
          ))}
          <NeedsBox label={slide.label || slide.need} hint={slide.hint || slide.needHint} dim={slide.dim || slide.needDim} big />
        </div>
      );

    case "index": // global archetype name for the interactive table of contents
    case "contents":
      return (
        <div className={`slide slide--contents${slide.type === "index" ? " is-index" : ""}`}>
          <p className="slide__eyebrow slide__contents-kick">{slide.kicker || "Contents"}</p>
          <ol className="slide__contents-list">
            {(slide.items || []).map((it, i) => {
              const target = it.to && idMap ? idMap[it.to] : undefined;
              const clickable = Number.isInteger(target);
              return (
                <li className="slide__contents-item" key={i} data-on={clickable ? "true" : "false"}>
                  <span className="slide__contents-n">{it.n != null ? it.n : String(i + 1).padStart(2, "0")}</span>
                  {clickable ? (
                    <button type="button" className="slide__contents-label" onClick={() => onGoto && onGoto(target)}>
                      {it.label}
                    </button>
                  ) : (
                    <span className="slide__contents-label" aria-disabled="true">{it.label}</span>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      );

    case "figure":
    default: {
      const layout = slide.layout || slide.split || (slide.fig || slide.reel || slide.need ? "split" : "text");
      const media = <SlideMedia slide={slide} layout={layout} />;
      return (
        <div className={media ? `slide slide--${layout}` : "slide slide--text"}>
          <SlideText slide={slide} />
          {media}
        </div>
      );
    }
  }
}

// Presentation mode, the case study as a one-slide-at-a-time deck.
function Presentation({ cs, onExit, theme, toggleTheme }) {
  const slides = useMemo(() => buildSlides(cs), [cs]);
  const [i, setI] = useState(0);
  const go = useCallback(
    (d) => setI((p) => Math.min(slides.length - 1, Math.max(0, p + d))),
    [slides.length]
  );
  // Absolute jump, for the interactive contents index.
  const goTo = useCallback(
    (idx) => setI(Math.min(slides.length - 1, Math.max(0, idx))),
    [slides.length]
  );
  // Map a slide's `id` to its index, so contents rows can jump to their section.
  const idMap = useMemo(() => {
    const m = {};
    slides.forEach((s, k) => { if (s && s.id) m[s.id] = k; });
    return m;
  }, [slides]);
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

  // Running chapter label for the deck chrome: the most recent phase divider's name.
  const chapter = useMemo(() => {
    for (let k = i; k >= 0; k--) {
      if (slides[k] && slides[k].type === "phaseDivider") return slides[k].name;
    }
    return "";
  }, [slides, i]);

  // Present chrome shows the year instead of the "Case study" label (derived from
  // the case-study meta, e.g. "… · 2025"), so the running frame reads "Zepto · 2025".
  const deckYear = (cs.meta || "").match(/\b(?:19|20)\d{2}\b/)?.[0];
  const presentEyebrow = deckYear
    ? (cs.eyebrow || "").replace(/case study/i, deckYear)
    : cs.eyebrow;

  return (
    <div className="present">
      {/* Deck chrome: a running document frame on every slide (after Smith & Diction /
          Andreas Maris). Identity top-left, the live chapter in serif italic centre,
          page + exit right; identity / nav / tagline along the foot. */}
      <header className="present__chrome present__chrome--top">
        <span className="present__id">{presentEyebrow}</span>
        <span className="present__chapter">{chapter}</span>
        <span className="present__meta">
          <span className="present__count">
            {i + 1} / {slides.length}
          </span>
          {toggleTheme && <ThemeToggle theme={theme} onToggle={toggleTheme} />}
          <button className="present__exit" onClick={onExit} aria-label="Exit presentation">
            Esc ✕
          </button>
        </span>
      </header>
      <div className="present__stage">
        {/* every slide sits in one consistent slate card (fixed aspect ratio + the
            shared colour treatment) so the deck reads as one designed surface */}
        <div className="slide-card" key={i}>
          <Slide slide={slides[i]} onGoto={goTo} idMap={idMap} />
        </div>
      </div>
      <footer className="present__chrome present__chrome--bottom">
        <span className="present__id present__id--foot">{cs.title}</span>
        <div className="present__nav">
          <button onClick={() => go(-1)} disabled={i === 0} aria-label="Previous slide">
            ←
          </button>
          <button onClick={() => go(1)} disabled={i === slides.length - 1} aria-label="Next slide">
            →
          </button>
        </div>
      </footer>
    </div>
  );
}

// A passcode-gated case study. NOTE: this is a cosmetic gate only — the embedded
// doc is a public asset and the passcode lives in the client bundle, so it is not
// real protection, just a "share the code" soft lock.
// Renders a self-contained HTML doc (cs.embedSrc) in an iframe, passing the
// site's current light/dark theme in via ?theme + postMessage so the embedded
// component switches with the global website mode.
// Related-surfaces tabs: some case studies ship as a family of views (Dassh: the
// design case study, the PRD, and the design system). This renders a small tab
// switcher across them so you can move between the three; the active one is lit.
// Shown on every surface in the family (the native case study + the locked docs).
const CS_FAMILIES = [
  [
    { slug: "dassh", label: "Design" },
    { slug: "dassh-prd", label: "PRD" },
    { slug: "dassh-sds", label: "System" },
  ],
  [
    { slug: "scheduled-delivery", label: "Design" },
    { slug: "scheduled-prd", label: "PRD" },
  ],
  [
    { slug: "away-agent", label: "Design" },
    { slug: "away-prd", label: "PRD" },
    { slug: "away-design-system", label: "System" },
  ],
];
// mtpb0swq: `listen` = { on, set } puts the Listen mode in this row as a third
// tab; the current view's tab reads as active only while not listening, and
// clicking it returns to reading.
function CaseStudyTabs({ slug, className, listen }) {
  const tabs = CS_FAMILIES.find((fam) => fam.some((t) => t.slug === slug));
  if (!tabs) return null;
  return (
    <nav className={`cs-tabs${className ? " " + className : ""}`} aria-label="Related views">
      {tabs.map((t) => {
        const current = t.slug === slug;
        const active = current && !(listen && listen.on);
        // the site's Link does not forward onClick, so the current tab becomes
        // a button when Listen is in the row: it only has to leave Listen mode
        if (current && listen) {
          return (
            <button
              key={t.slug}
              type="button"
              className={`cs-tabs__tab${active ? " is-active" : ""}`}
              aria-pressed={active}
              onClick={() => listen.set(false)}
            >
              {t.label}
            </button>
          );
        }
        return (
          <Link
            key={t.slug}
            to={`/work/${t.slug}`}
            className={`cs-tabs__tab${active ? " is-active" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            {t.label}
          </Link>
        );
      })}
      {listen && (
        <button
          type="button"
          className={`cs-tabs__tab cs-tabs__listen${listen.on ? " is-active" : ""}`}
          aria-pressed={listen.on}
          onClick={() => listen.set(true)}
        >
          Listen
        </button>
      )}
    </nav>
  );
}

function EmbedDoc({ src, title, slug }) {
  const ref = useRef(null);
  const isDark = () => document.documentElement.classList.contains("dark");
  const tell = () => {
    try {
      ref.current?.contentWindow?.postMessage({ type: "theme", value: isDark() ? "dark" : "light" }, "*");
    } catch (e) {}
  };
  useEffect(() => {
    const obs = new MutationObserver(tell);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return (
    <div className="page page--locked-doc">
      <div className="locked-doc__bar">
        <Link to="/" className="back-link">
          <BackIcon />
          Back
        </Link>
        <CaseStudyTabs slug={slug} className="locked-doc__tabs" />
      </div>
      <iframe
        ref={ref}
        title={title || "Embedded document"}
        src={`${src}?theme=${isDark() ? "dark" : "light"}`}
        onLoad={tell}
        style={{ width: "100%", flex: "1 1 auto", minHeight: 0, border: 0, display: "block" }}
      />
    </div>
  );
}

function LockedCaseStudy({ cs, slug }) {
  const [code, setCode] = useState("");
  // Passcode gate removed: render the doc directly. Keep the `locked` routing so
  // the doc/embed/analytics dispatch still works; the gate form below is now dead.
  const [unlocked, setUnlocked] = useState(true);
  const [error, setError] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (code.trim().toLowerCase() === String(cs.passcode || "").toLowerCase()) {
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  if (unlocked) {
    if (cs.embedSrc) {
      return <EmbedDoc src={cs.embedSrc} title={cs.title} slug={slug} />;
    }
    return (
      <div className="page page--locked-doc page--locked-doc--native">
        <div className="locked-doc__bar">
          <Link to="/" className="back-link">
            <BackIcon />
            Back
          </Link>
          <CaseStudyTabs slug={slug} className="locked-doc__tabs" />
        </div>
        {/* Native portfolio DOM (not an iframe) so Agentation can scan/annotate
            every element of the PRD. `cs.doc` selects which PRD to mount. */}
        <Suspense fallback={null}>
          {cs.doc === "dassh" ? <DasshPrdDoc /> : cs.doc === "scheduled" ? <ScheduledPrdDoc /> : cs.doc === "jarvis" ? <JarvisPrdDoc /> : cs.doc === "zepiris" ? <ZepirisPrdDoc /> : cs.doc === "away-analytics" ? <AwayAnalyticsDoc /> : cs.doc === "prompt-library" ? <PromptLibraryDoc /> : cs.doc === "team-prompts" ? <TeamPromptsDoc /> : cs.doc === "color-system" ? <ColorSystemDoc /> : <PrdDoc />}
        </Suspense>
      </div>
    );
  }

  return (
    <div className="page page--gate">
      <div className="gate">
        <Link to="/" className="back-link gate__back">
          <BackIcon />
          Back
        </Link>
        <span className="gate__lock" aria-hidden>
          <LockIcon />
        </span>
        {cs.eyebrow && <p className="gate__eyebrow">{cs.eyebrow}</p>}
        <h1 className="gate__title">{withBreaks(cs.title)}</h1>
        {cs.blurb && <p className="gate__blurb">{cs.blurb}</p>}
        <form className="gate__form" onSubmit={submit}>
          <input
            className={`gate__input${error ? " gate__input--error" : ""}`}
            type="password"
            inputMode="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setError(false);
            }}
            placeholder="Passcode"
            aria-label="Passcode"
            autoFocus
          />
          <button className="gate__submit" type="submit">
            Unlock
          </button>
        </form>
        {error && (
          <p className="gate__error" role="alert">
            That passcode does not match. Try again, or request access below.
          </p>
        )}
        <a
          className="gate__request"
          href={`mailto:agamagar117@gmail.com?subject=${encodeURIComponent(
            "Access request: " + cs.title
          )}`}
        >
          Request access
        </a>
      </div>
    </div>
  );
}

// Case studies with an authored spoken walkthrough (Listen mode). The narration is
// the complete-project interview answer, with the interviewer layer (asks) rendered
// as "?" marks by NarrationPlayer. Add a case here once its script is written.
const CASE_NARRATIONS = {
  "scheduled-delivery": scheduledCaseNarration,
  "dassh-v2": dasshCaseNarration,
};


// THE ARTICLE BODY ON ITS OWN (annotation msudmgyq, "add scroll here and
// populate the case study here" - the phone drawer wants the real case study
// inside it). Lifted out of CaseStudy verbatim so the page and the drawer
// render ONE body from one place; CaseStudy calls it right where the block
// used to be. Exported for src/hello/PhoneDetail3.jsx.
// mujvribt: the role-slide layout for a section's prose, or nothing at all
function SecWrap({ on, stack, center, side, children }) {
  // `stack` (28 Sep): label on top, then heading, explanation and figure, one column
  // `center` (mukwatlg): the stacked content centred, text centre-aligned
  return on ? <div className={"cs-sec" + (stack ? " cs-sec--stack" : "") + (center ? " cs-sec--center" : "") + (side ? " cs-sec--side" : "")}>{children}</div> : <>{children}</>;
}

export function CaseStudyBody({ cs }) {
  // the plates row (mtmlg1wh); shared by the standalone render and the duo view
  const renderPlates = (s) => (
            <PlatesStack stack={s.platesStack} gradient={s.platesGradient}>
              {s.plates.map((pl, k) => (
                <figure className={"article__plate" + (pl.wide ? " article__plate--wide" : "") + (pl.heading ? " article__plate--copy" : "") + (pl.src || pl.video ? "" : " article__plate--empty")} key={`pl-${k}`}>
                  {/* mtpevnfg: a heading and subheading beside the plate */}
                  {pl.heading && (
                    <figcaption className="article__plate-copy">
                      <h3>{pl.heading}</h3>
                      {pl.sub && <p>{pl.sub}</p>}
                    </figcaption>
                  )}
                  {pl.auto ? (
                    // mtmscpnv: the prototype auto-played as a coded scene
                    <div className="article__plate-embed article__plate-ground" style={s.platesGradient ? undefined : { background: pl.bg }}>
                      <Suspense fallback={null}>
                        <AutoTabs />
                      </Suspense>
                    </div>
                  ) : pl.embed ? (
                    // mtmoja90: a live Figma prototype in the plate, inside a
                    // phone frame on the card ground, centred, with an optional
                    // tap cue at [x%, y%] of the screen
                    <div className="article__plate-embed article__plate-ground" style={s.platesGradient ? undefined : { background: pl.bg }}>
                      {/* mtmoueoi: the real bezel (the iPhone 17 Pro export used by the
                          notification scene) over a screen cutout that holds the prototype */}
                      <div className="article__plate-phone">
                        <div className="article__plate-screen">
                          {PROTO_EMBED ? (
                            <iframe
                              src={pl.embed}
                              title={pl.alt || "Figma prototype"}
                              loading="lazy"
                              allowFullScreen
                              data-embed={`pl-${k}`}
                            />
                          ) : (
                            <img
                              src={PROTO_STILL}
                              alt={pl.alt || "The scheduled order prototype"}
                              loading="lazy"
                              decoding="async"
                              width="720"
                              height="1566"
                            />
                          )}
                          {/* mtmpd3cb: a dotted rectangle on the target; the pointer sits outside */}
                          {pl.cueBox && !pl.cueNoBox && (
                            <span
                              className="article__plate-cuebox"
                              style={{ left: pl.cueBox[0] + "%", top: pl.cueBox[1] + "%", width: pl.cueBox[2] + "%", height: pl.cueBox[3] + "%" }}
                              aria-hidden="true"
                            />
                          )}
                          {/* mto4v1ka: a cursor that goes and clicks the cue box's centre, looping in view */}
                          {pl.cueBox && pl.cueClick && (
                            <Suspense fallback={null}>
                              <PlateCursor
                                target={{ x: pl.cueBox[0] + pl.cueBox[2] / 2, y: pl.cueBox[1] + pl.cueBox[3] / 2 }}
                                // mto4ygd5: the press drives the prototype to the tab's frame, the
                                // return leg steps it back (needs the client-id, see figmaEmbedUrl)
                                onPress={pl.embedClickNode ? () => figmaEmbedPost(document.querySelector(`iframe[data-embed="pl-${k}"]`), { type: "NAVIGATE_TO_FRAME_AND_CLOSE_OVERLAYS", data: { nodeId: pl.embedClickNode } }) : undefined}
                                onReturn={pl.embedClickNode ? () => figmaEmbedPost(document.querySelector(`iframe[data-embed="pl-${k}"]`), { type: "NAVIGATE_BACKWARD" }) : undefined}
                              />
                            </Suspense>
                          )}
                        </div>
                        <img className="article__plate-bezel" src={IPHONE_FRAME_SRC} alt="" draggable="false" />
                        {/* mtmq59fw: a multiplayer-style cursor (Iconoir pointer) with a
                            name pill, nudging toward the tab */}
                        {pl.cueBox && !pl.cueNoPointer && (
                          <span className="article__plate-pointer" style={{ top: (2.59 + 0.949 * (pl.cueBox[1] + pl.cueBox[3] / 2)) + "%" }} aria-hidden="true">
                            <span className="article__plate-cursor">
                              <IconCursor width={20} height={20} strokeWidth={1.6} />
                            </span>
                            <b>{pl.cueLabel || "Click here"}</b>
                          </span>
                        )}
                      </div>
                    </div>
                  ) : pl.fig ? (
                    // mtmlrqyb: a coded figure (the phone with the banner) on the card ground
                    <div className="article__plate-video article__plate-video--fig article__plate-ground" style={s.platesGradient ? undefined : { background: pl.bg }}>
                      <SectionFigure fig={pl.fig} variant="article" bare />
                    </div>
                  ) : pl.video ? (
                    // mtmlmth1: an animation on the Figma card ground
                    <div className="article__plate-video article__plate-ground" style={s.platesGradient ? undefined : { background: pl.bg }}>
                      <video src={pl.video} autoPlay muted loop playsInline aria-label={pl.alt || ""} />
                    </div>
                  ) : pl.blank ? (
                    // mukxxiz5: a box on the same card ground, waiting for its content
                    <div className="article__plate-video article__plate-ground" style={s.platesGradient ? undefined : { background: pl.bg }} aria-hidden="true" />
                  ) : pl.src ? (
                    <img className="article__figure-img article__figure-img--real" src={pl.src} alt={pl.alt || ""} loading="lazy" />
                  ) : (
                    <div className="article__plate-empty" aria-hidden="true"><span>Plate {k + 1}</span></div>
                  )}
                  {pl.caption && <figcaption>{pl.caption}</figcaption>}
                </figure>
              ))}
            </PlatesStack>
  );
  return (
    <div className={"article__body" + (cs.hideCaptions ? " article__body--nocaps" : "")}>
      {!cs.headFacts && <p className="article__lead">{cs.lead}</p>}

      {/* muky55mj (28 Sep): `hidden: true` parks a whole section (page, index) */}
      {cs.sections.map((s, i) => s.hidden ? null : s.breaker ? (
        // Annotation mtmi98gy: a breaker, an image that marks the turn from
        // context to solution. No heading, no index entry, no slide.
        <figure className="article__figure article__figure--breaker" key={i} aria-hidden={s.figure ? undefined : true}>
          {s.fig ? (
            <SectionFigure fig={s.fig} variant="article" bare />
          ) : (
            <img className="article__figure-img article__figure-img--real" src={s.image} alt="" loading="lazy" />
          )}
          {s.figure && <figcaption>{s.figure}</figcaption>}
          {/* Figma 120 (14:57): a display-size line under the figure, kept visible past hideCaptions */}
          {s.figureHeading && <figcaption className="article__figcap-heading">{s.figureHeading}</figcaption>}
        </figure>
      ) : (
        <Fragment key={i}>
          {s.dividerBefore && (
            <p className="article__divider" aria-hidden>
              · · ·
            </p>
          )}
          {s.split && <SplitSection s={s} i={i} />}
          {s.roleFrame && <RoleFrame s={s} i={i} />}
          {/* 27 Sep: go-broad wireframes expanding My role, draft only */}
          {s.roleWireframes && <SchedRoleWireframes only={s.roleWireframesOnly} />}
          {/* mtmvvd0m: a section can drop its heading */}
          {/* mujvribt (27 Sep): on a slideLayout case the prose part of every
              section takes the role-slide layout (label column + statement +
              body); figures after it stay full width. SecWrap is a Fragment
              everywhere else, so other case studies' DOM is unchanged. */}
          <SecWrap on={cs.slideLayout && !s.split && !s.roleFrame && !s.noHeading} stack={s.stack} center={s.center} side={!!s.sideImage}>
          {s.split || s.roleFrame ? null : s.noHeading ? <span id={`sec-${i}`} /> : <h2 id={`sec-${i}`}>{s.h}</h2>}
          {/* mtmjlgwj: a big serif line, the system's Newsreader thesis voice,
              first under the heading */}
          {s.serif && <p className="article__serif">{s.serif}</p>}
          {/* a big open question, set large (Before we start) */}
          {s.ask && <p className="article__ask">{s.ask}</p>}
          {/* muky37n5: a photo beside the heading and TL;DR, 50/50 */}
          {s.sideImage && <img className="cs-sec__side" src={s.sideImage} alt="" loading="lazy" />}
          {s.tldr && !s.hideTldr && !s.split && !s.roleFrame && (
            <p className="article__tldr">
              <span className="article__tldr-label">TL;DR</span>
              {s.tldr}
            </p>
          )}
          {/* mujuytgf: numbered points, Figma HBBgHT1u7e5jsz7BEEZ3fT 46:15909
              (big numeral over a light label, one column each) */}
          {s.points && (
            <ol className="cpts" aria-label={s.pointsLabel || s.h}>
              {s.points.map((pt, k) => (
                <li className="cpts__item" key={k}>
                  <p className="cpts__n" aria-hidden>{k + 1}.</p>
                  <p className="cpts__label">{pt}</p>
                </li>
              ))}
            </ol>
          )}
          {(s.split || s.roleFrame ? [] : s.p || []).map((para, j) => (
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
          {s.shader && <ShaderBox shader={s.shader} />}
          {s.ul && !s.split && !s.roleFrame && (
            <ul className={s.ul[0]?.t ? "article__terms" : undefined}>
              {s.ul.map((li, k) => (
                <li key={k}>{li?.t ? <><p className="article__term-t">{li.t}</p><p className="article__term-d">{li.d}</p></> : li}</li>
              ))}
            </ul>
          )}
          {/* 28 Sep, the presenting cut: the product "so what" that closes a beat */}
          {s.soWhat && <p className={"cs-sowhat" + (s.soWhatClose ? " cs-sowhat--close" : "")}>{s.soWhat}</p>}
          {/* mukvom35 (28 Sep): a figure INSIDE the section frame, under the
              explanation (the section and its cards are one idea) */}
          {s.figIn && cs.slideLayout && (
            <div className="cs-sec__in" data-fig={s.figIn}>
              <SectionFigure fig={s.figIn} variant="article" bare />
            </div>
          )}
          {/* mukvlu72 (28 Sep): a figure inside the section on the RIGHT; the
              label, heading and explanation stack on the left */}
          {s.figSide && cs.slideLayout && (
            <div className="cs-sec__side">
              <SectionFigure fig={s.figSide} variant="article" bare />
            </div>
          )}
          </SecWrap>
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
          {s.table && <SmartTable table={s.table} />}
          {s.chart && <DataViz chart={s.chart} />}
          {/* extra figures after the main one: [{ fig, caption, bare }] */}
          {(s.figsAfter || []).map((f, k) => (
            <figure className="article__figure" key={`fa-${k}`}>
              {/* mtp8qt8d: an extra figure may be a scene or a still, not only a coded fig */}
              <SectionFigure fig={f.fig} scene={f.scene} still={f.still} variant="article" bare={f.bare} />
              {f.caption && <figcaption>{f.caption}</figcaption>}
            </figure>
          ))}
          {/* muienfze: the key finding + central question frame, above the figure */}
          {/* muilckke: the use-cases frames (Figma 1167:43070), above the key finding */}
          {s.insightBefore && <SchedUseCases />}
          {s.insightBefore && !s.insightAfterFigure && <SchedInsight />}
          {s.introQuestion && <IntroQuestion {...s.introQuestion} />}
          {(s.figure || s.rive || s.collage || s.design || s.reel || s.whiteboard || s.still || s.scene) && !s.introQuestion && (
            <figure className="article__figure">
              {/* muidtvae: a heading above the figure, outside its box */}
              {s.figureTop && <p className="article__figtop">{s.figureTop}</p>}
              {s.platesToggle ? (
                <DuoFigure figure={<SectionFigure
                image={s.image}
                fig={s.fig}
                iphone={s.iphone}
                iphoneSplit={s.iphoneSplit}
                rive={s.rive}
                riveStateMachines={s.riveStateMachines}
                riveArtboard={s.riveArtboard}
                collage={s.collage}
                design={s.design}
                whiteboard={s.whiteboard}
                reel={s.reel}
                still={s.still}
                stillParallax={s.stillParallax}
                scene={s.scene}
                variant="article"
                bare={s.figBare}
              />} plates={renderPlates(s)} />
              ) : (
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
                whiteboard={s.whiteboard}
                reel={s.reel}
                still={s.still}
                stillParallax={s.stillParallax}
                scene={s.scene}
                variant="article"
                bare={s.figBare}
              />
              )}
              {s.figure && <figcaption>{s.figure}</figcaption>}
              {s.figureHeading && <figcaption className="article__figcap-heading">{s.figureHeading}</figcaption>}
            </figure>
          )}
          {/* mujukg3s (27 Sep): the mango scene moved one place up, so the key finding follows it */}
          {/* mukuyuyb (28 Sep): a coded figure moved in from another section, right after this one's */}
          {s.figNext && (
            <figure className="article__figure">
              <SectionFigure fig={s.figNext} variant="article" bare />
            </figure>
          )}
          {/* mukub9lc (28 Sep): a second scroll scene right after the main one */}
          {s.sceneAfter && (
            <figure className="article__figure">
              <SectionFigure scene={s.sceneAfter} variant="article" bare />
            </figure>
          )}
          {s.insightBefore && s.insightAfterFigure && <SchedInsight />}
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
          {/* a showreel exported from Figma motion, a phone-format MP4 that
              autoplays muted and loops. */}
          {s.video && (
            <VideoFigure
              src={s.video}
              poster={s.videoPoster}
              caption={s.videoCaption}
            />
          )}
          {/* mtmlg1wh: a row of horizontal plates under the figure; a plate
              without a src is a placeholder waiting for a Figma node */}
          {s.plates && !s.platesToggle && renderPlates(s)}
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
  );
}

function CaseStudy({ slug, presenting, onExitPresent, theme, toggleTheme }) {
  // ?cut=compact renders only the case's curated pdfSections subset. Used by
  // tools/export-pdf.mjs to hit hard page caps (MIIPS 20pp, GSD 30pp); cases
  // without a pdfSections list render in full regardless of the param.
  const base = caseStudies[slug] || caseStudies.sample;
  const compact =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("cut") === "compact" &&
    Array.isArray(base.pdfSections);
  const cs = compact
    ? { ...base, sections: base.sections.filter((s) => base.pdfSections.includes(s.h)) }
    : base;
  const [activeSection, setActiveSection] = useState(0);
  // Listen mode: the spoken interview walkthrough, for cases that have one.
  const narration = CASE_NARRATIONS[slug] || null;
  const [listening, setListening] = useState(false);
  // mtmsdz2t: Animation / Video toggle for the hero when a case has both
  const [heroMode, setHeroMode] = useState("anim");
  useEffect(() => {
    setListening(false);
  }, [slug]);

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
  }, [cs, listening]);

  return (
    <>
    <div className="page page--article" data-case={cs.styleKey || slug}>
      <div className="article__layout">
        <nav className="article__index" aria-label="Sections">
          <div className="article__index-top">
            {/* Back is not here any more: it moved into .top-controls so the
                page has ONE bar of chrome instead of two clusters. The lab's
                own "Index" link, same base class, is untouched. */}
            {/* mtmm3lt0 put the Read / Listen switch in the sidebar; mtpb0swq folds
                Listen into the Design / PRD row and drops the separate switch */}
            <CaseStudyTabs slug={slug} className="article__index-tabs" listen={narration ? { on: listening, set: setListening } : null} />
          </div>
          <ul>
            {(cs.flatIndex
              ? // flat: every section is its own ungrouped entry (no group heads)
                cs.sections.flatMap((s, i) => (s.breaker || s.noHeading || s.hidden ? [] : [{ items: [{ s, i }] }]))
              : cs.sections.reduce((groups, s, i) => {
                  if (s.breaker || s.noHeading || s.hidden) return groups; // breakers and heading-less sections have no index entry
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
                }, []))
              .map((g, gi) => {
                const link = ({ s, i }) => (
                  <li key={i}>
                    <a
                      href={`#sec-${i}`}
                      className={i === activeSection ? "is-active" : undefined}
                    >
                      {s.nav || s.h}
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
          {/* mtpavlcs: the hero can sit above the header (cs.heroFirst) */}
          {cs.heroFirst ? (<>
        {cs.heroVideo && cs.heroFig && figures[cs.heroFig] && !cs.heroToggleHidden && (
          <div className="fig-toggle fig-toggle--hero" role="group" aria-label="Hero">
            {[["anim", "Animation"], ["video", "Video"]].map(([k, label]) => (
              <button key={k} type="button" className={"fig-toggle__btn" + (heroMode === k ? " is-active" : "")} aria-pressed={heroMode === k} onClick={() => setHeroMode(k)}>
                {label}
              </button>
            ))}
          </div>
        )}
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
        ) : cs.heroVideo && !(cs.heroFig && figures[cs.heroFig] && heroMode === "anim") ? (
          // a project-specific hero animation (Figma export, converted to mp4);
          // plays once and holds its last frame, which is also the poster.
          // Reduced motion gets the poster alone.
          <div className="article__hero-board article__hero-board--image article__hero-board--video">
            <video
              className="article__hero-img"
              poster={cs.heroPoster}
              autoPlay={!(typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches)}
              muted
              playsInline
              loop={!!cs.heroLoop}
              preload="auto"
              aria-label={cs.heroAlt || ""}
              // mtmhq999: playback speed as a fraction of real time (0.7 = 70%)
              onLoadedMetadata={(e) => { if (cs.heroSpeed) e.currentTarget.playbackRate = cs.heroSpeed; }}
              onPlay={(e) => { if (cs.heroSpeed) e.currentTarget.playbackRate = cs.heroSpeed; }}
            >
              {/* mtmhmszl: alpha video, no matte. HEVC-with-alpha first so
                  Safari takes it, VP9-with-alpha WebM for everyone else. */}
              {(cs.heroVideo.mov || cs.heroVideo.hevc) && (
                <source src={cs.heroVideo.mov || cs.heroVideo.hevc} type='video/mp4; codecs="hvc1"' />
              )}
              {cs.heroVideo.webm && <source src={cs.heroVideo.webm} type="video/webm" />}
              {typeof cs.heroVideo === "string" && <source src={cs.heroVideo} />}
            </video>
            {/* mtmkjwp3: replay, bottom right */}
            <button
              type="button"
              className="article__hero-replay"
              aria-label="Replay the header animation"
              onClick={(e) => {
                const v = e.currentTarget.parentElement.querySelector("video");
                if (!v) return;
                v.currentTime = 0;
                if (cs.heroSpeed) v.playbackRate = cs.heroSpeed;
                v.play();
              }}
            >
              {/* mtmlir34: Iconoir only */}
              <IconRefresh width={15} height={15} strokeWidth={1.8} aria-hidden="true" />
            </button>
          </div>
        ) : cs.heroFig && figures[cs.heroFig] ? (
          // a project-specific coded figure fills the header frame
          <div className="article__hero-board article__hero-board--fig">
            {(() => {
              const HeroFig = figures[cs.heroFig];
              return <HeroFig />;
            })()}
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
          {cs.headFacts ? (
          // mtparlyq: the header as in Figma Portfolio 2026 node 559-7888: the
          // title and the lead on the left, label/value facts on the right; no
          // eyebrow, no meta line. The lead moves up here from the body.
          <header className="article__head article__head--facts">
            <div className="article__head-main">
              <h1 className="article__title article__title--display">{withBreaks(cs.title)}</h1>
              <p className="article__lead article__lead--head">{cs.lead}</p>
            </div>
            <dl className="article__facts">
              {cs.headFacts.map((f) => (
                <div className="article__fact" key={f.label}>
                  <dt className="article__fact-label">{f.label}</dt>
                  <dd className="article__fact-value">{f.value}</dd>
                </div>
              ))}
            </dl>
          </header>
          ) : (
          <header className="article__head">
          <p className="article__eyebrow">{cs.eyebrow}</p>
          <h1 className="article__title">{withBreaks(cs.title)}</h1>
          <p className="article__meta">{cs.meta}</p>
        </header>
          )}
          </>) : (<>
          {cs.headFacts ? (
          // mtparlyq: the header as in Figma Portfolio 2026 node 559-7888: the
          // title and the lead on the left, label/value facts on the right; no
          // eyebrow, no meta line. The lead moves up here from the body.
          <header className="article__head article__head--facts">
            <div className="article__head-main">
              <h1 className="article__title article__title--display">{withBreaks(cs.title)}</h1>
              <p className="article__lead article__lead--head">{cs.lead}</p>
            </div>
            <dl className="article__facts">
              {cs.headFacts.map((f) => (
                <div className="article__fact" key={f.label}>
                  <dt className="article__fact-label">{f.label}</dt>
                  <dd className="article__fact-value">{f.value}</dd>
                </div>
              ))}
            </dl>
          </header>
          ) : (
          <header className="article__head">
          <p className="article__eyebrow">{cs.eyebrow}</p>
          <h1 className="article__title">{withBreaks(cs.title)}</h1>
          <p className="article__meta">{cs.meta}</p>
        </header>
          )}
        {cs.heroVideo && cs.heroFig && figures[cs.heroFig] && !cs.heroToggleHidden && (
          <div className="fig-toggle fig-toggle--hero" role="group" aria-label="Hero">
            {[["anim", "Animation"], ["video", "Video"]].map(([k, label]) => (
              <button key={k} type="button" className={"fig-toggle__btn" + (heroMode === k ? " is-active" : "")} aria-pressed={heroMode === k} onClick={() => setHeroMode(k)}>
                {label}
              </button>
            ))}
          </div>
        )}
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
        ) : cs.heroVideo && !(cs.heroFig && figures[cs.heroFig] && heroMode === "anim") ? (
          // a project-specific hero animation (Figma export, converted to mp4);
          // plays once and holds its last frame, which is also the poster.
          // Reduced motion gets the poster alone.
          <div className="article__hero-board article__hero-board--image article__hero-board--video">
            <video
              className="article__hero-img"
              poster={cs.heroPoster}
              autoPlay={!(typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches)}
              muted
              playsInline
              loop={!!cs.heroLoop}
              preload="auto"
              aria-label={cs.heroAlt || ""}
              // mtmhq999: playback speed as a fraction of real time (0.7 = 70%)
              onLoadedMetadata={(e) => { if (cs.heroSpeed) e.currentTarget.playbackRate = cs.heroSpeed; }}
              onPlay={(e) => { if (cs.heroSpeed) e.currentTarget.playbackRate = cs.heroSpeed; }}
            >
              {/* mtmhmszl: alpha video, no matte. HEVC-with-alpha first so
                  Safari takes it, VP9-with-alpha WebM for everyone else. */}
              {(cs.heroVideo.mov || cs.heroVideo.hevc) && (
                <source src={cs.heroVideo.mov || cs.heroVideo.hevc} type='video/mp4; codecs="hvc1"' />
              )}
              {cs.heroVideo.webm && <source src={cs.heroVideo.webm} type="video/webm" />}
              {typeof cs.heroVideo === "string" && <source src={cs.heroVideo} />}
            </video>
            {/* mtmkjwp3: replay, bottom right */}
            <button
              type="button"
              className="article__hero-replay"
              aria-label="Replay the header animation"
              onClick={(e) => {
                const v = e.currentTarget.parentElement.querySelector("video");
                if (!v) return;
                v.currentTime = 0;
                if (cs.heroSpeed) v.playbackRate = cs.heroSpeed;
                v.play();
              }}
            >
              {/* mtmlir34: Iconoir only */}
              <IconRefresh width={15} height={15} strokeWidth={1.8} aria-hidden="true" />
            </button>
          </div>
        ) : cs.heroFig && figures[cs.heroFig] ? (
          // a project-specific coded figure fills the header frame
          <div className="article__hero-board article__hero-board--fig">
            {(() => {
              const HeroFig = figures[cs.heroFig];
              return <HeroFig />;
            })()}
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
          </>)}

        {narration && listening ? (
          <div className="article__body article__body--listen">
            <NarrationPlayer narration={narration} />
          </div>
        ) : (
        <CaseStudyBody cs={cs} />
        )}
        </article>
      </div>

      <Footer credits={cs.credits} />
    </div>
    {presenting && <Presentation cs={cs} onExit={onExitPresent} theme={theme} toggleTheme={toggleTheme} />}
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
      {/* section index, like the case-study pages: fixed left rail with the Back link
          on top and jump links to each part of the lab */}
      <nav className="article__index page--lab-index" aria-label="Sections">
        <div className="article__index-top">
          <Link to="/" className="back-link article__back">
            <BackIcon />
            Index
          </Link>
        </div>
        <ul>
          {[
            ["lab-modes", "Motion modes"],
            ["lab-decks", "Deck presets"],
            ["lab-hands", "Doodle hands"],
            ["lab-system", "System catalog"],
            ["lab-appendix", "Live specimens"],
          ].map(([id, label]) => (
            <li key={id}>
              <a
                href={`#${id}`}
                onClick={(e) => {
                  e.preventDefault();
                  // explicit "instant": the page's html{scroll-behavior:smooth} makes a
                  // plain scrollIntoView no-op here, so force the jump
                  document.getElementById(id)?.scrollIntoView({ behavior: "instant", block: "start" });
                }}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* The lab, grouped by animation MODE: each mode's properties (live, copiable)
          + a live example + its reference, in one place. The consumer register and
          the per-case skins are folded into their mode sections. */}
      <section id="lab-modes"><ModesGuide /></section>

      {/* Every present-mode deck preset + base asset, as viewable specimens. */}
      <section id="lab-decks"><DeckPresets /></section>

      {/* The 25-pose doodle hand set (prompt library, Doodle hands group) as
          hand-coded SVG; click a tile to copy its standalone markup. */}
      <section id="lab-hands"><HandsSheet /></section>

      {/* The Specimen Sheet: the deeper field guide / full system catalog. */}
      <section id="lab-system"><SystemSheet /></section>

      {/* Appendix: the live framework specimens at full size + the raw technique grid. */}
      <div className="ss-appendix" id="lab-appendix">
        <p className="article__eyebrow">Appendix A</p>
        <h2 className="ss-appendix__title">Live specimens, at full size</h2>
        <div style={{ margin: "8px 0 36px" }}>
          <p className="demo__name" style={{ marginBottom: 4 }}>Hover border gradient</p>
          <p className="demo__tech" style={{ marginBottom: 16 }}>
            A pill whose border is a soft radial highlight that idles around the four edges (top, left, bottom, right, one step per second) and, on hover, blooms into a single blue glow centred on the button. The border is a blurred gradient layer behind an inset black plate, so the "stroke" is light rather than a line.
          </p>
          <Suspense fallback={null}>
            <HoverBorderGradient>
              <span>Emerald UI Components</span>
            </HoverBorderGradient>
          </Suspense>
          <Ref label="HoverBorderGradient (registry component)" src="src/components/ui/hover-border-gradient.tsx" />
        </div>
        <div style={{ margin: "8px 0 36px" }}>
          <p className="demo__name" style={{ marginBottom: 4 }}>Cross-sell: the exploration set, resolved</p>
          <p className="demo__tech" style={{ marginBottom: 16 }}>
            Figure 8 for the cross-sell engine case. Every concept that got built or argued for, sorted by the area of the app it lives in, then tiered, with the metrics that judge each best-suited approach hanging off it. The trip classifier sits above the tree rather than inside it, because on an emergency trip none of the branches are reachable. The leaf cycles while on screen; click a row to pin it.
          </p>
          <CrossSellTree />
          <Ref label="CrossSellTree (cross-sell case, figure 8)" src="src/figures/crosssell/CrossSellTree.jsx" />
        </div>
        <div style={{ margin: "8px 0 36px" }}>
          <p className="demo__name" style={{ marginBottom: 4 }}>Physicality and interruptibility (§14)</p>
          <p className="demo__tech" style={{ marginBottom: 16 }}>
            The Devouring Details layer, live. A real bottom sheet you can grab: it enters from its own edge, tracks the pointer 1:1 while held, carries your flick's momentum on release, and can be caught mid-dismiss and dragged back. Springs, not durations. Try dragging it.
          </p>
          <PhysicalSheet />
          <Ref label="PhysicalSheet (§14 physicality exemplar)" src="src/figures/physicality/PhysicalSheet.jsx" />
          <Ref label="ds/hooks · spring() presets (throw / bloom / scrub)" src="src/figures/ds/hooks.js" />
        </div>
        <div style={{ margin: "8px 0 36px" }}>
          <p className="demo__name" style={{ marginBottom: 4 }}>Detail page v1 (Evidence Card)</p>
          <p className="demo__tech" style={{ marginBottom: 16 }}>
            The /hello marquee's original click-to-full-view, archived live the day the scan page moved to the bottom drawer. Click a tile: the phone flies out of the grid to the centre via the phone-hero shared-element View Transition, and the full-page Evidence Card (aside + slide column) lands around it. This mounts the real PhoneDetail2 on the real PHONES data, not a copy.
          </p>
          <DetailV1 />
          <Ref label="PhoneDetail2 (the v1 full-page detail)" src="src/hello/PhoneDetail2.jsx" />
          <Ref label="PhoneMarqueeStep · openDetail/closeDetail (the morph)" src="src/hello/PhoneMarqueeStep.jsx" />
          <Ref label="PhoneDetail3 (the v2 bottom drawer that replaced it on scan)" src="src/hello/PhoneDetail3.jsx" />
        </div>
        <div style={{ margin: "8px 0 36px" }}>
          <p className="demo__name" style={{ marginBottom: 4 }}>Information-sensitive scaffold</p>
          <p className="demo__tech" style={{ marginBottom: 16 }}>
            Render the UI as static shimmer; keep only the focal element and its annotation real and animated.
          </p>
          <AnnotationDemo />
          <Ref label="AnnotationDemo (scaffold preset demo)" src="src/figures/scaffold/AnnotationDemo.jsx" />
        </div>
        <div style={{ margin: "8px 0 36px" }}>
          <p className="demo__name" style={{ marginBottom: 4 }}>System-Explainer · extract</p>
          <p className="demo__tech" style={{ marginBottom: 16 }}>
            One messy input untangled into a structured brief, one mapping per step. Paired panels and a connector.
          </p>
          <AwIntakeBrief />
          <Ref label="AwIntakeBrief (extract archetype)" src="src/figures/awayAgent/AwIntakeBrief.jsx" />
          <Ref label="ds kit · Panel/Field/Mark/Connector (used here)" src="src/figures/ds/SystemExplainer.jsx" />
          <p className="demo__name" style={{ margin: "28px 0 4px" }}>System-Explainer · sequence to score</p>
          <p className="demo__tech" style={{ marginBottom: 16 }}>
            Same kit, different archetype: a timeline that advances the agent's work, resolving into weighted scores.
          </p>
          <SeqDemo />
          <Ref label="SeqDemo (sequence to score)" src="src/figures/systemExplainer/SeqDemo.jsx" />
          <Ref label="ds kit · Panel/Track/ScoreMeter (used here)" src="src/figures/ds/SystemExplainer.jsx" />
          <p className="demo__name" style={{ margin: "28px 0 4px" }}>System-Explainer · fan-out / gather</p>
          <p className="demo__tech" style={{ marginBottom: 16 }}>
            A third archetype from the universe research: one query fans out to many sources in parallel, fares return, the field reconciles to the negotiated winner. The Away deep-search, drawn as a hub-and-spoke.
          </p>
          <FanOutDemo />
          <Ref label="FanOutDemo (fan-out / gather archetype)" src="src/figures/systemExplainer/FanOutDemo.jsx" />

          <p className="demo__name" style={{ margin: "28px 0 4px" }}>System-Explainer · triage</p>
          <p className="demo__tech" style={{ marginBottom: 16 }}>
            Many items sorted into a priority order, a cut-line fencing the few that need you. The Dassh daily report.
          </p>
          <TriageDemo />
          <Ref label="TriageDemo (triage archetype)" src="src/figures/systemExplainer/TriageDemo.jsx" />

          <p className="demo__name" style={{ margin: "28px 0 4px" }}>System-Explainer · trade-off (Pareto)</p>
          <p className="demo__tech" style={{ marginBottom: 16 }}>
            No option wins on every axis, so the honest answer is the frontier: cheapest, fastest, and the balance, the rest beaten on both.
          </p>
          <TradeOffDemo />
          <Ref label="TradeOffDemo (trade-off / Pareto archetype)" src="src/figures/systemExplainer/TradeOffDemo.jsx" />

          <p className="demo__name" style={{ margin: "28px 0 4px" }}>System-Explainer · backtrack</p>
          <p className="demo__tech" style={{ marginBottom: 16 }}>
            Reasoning that explores, hits a dead end, rewinds to the fork, and takes the other branch. An agent debugging.
          </p>
          <BacktrackDemo />
          <Ref label="BacktrackDemo (backtrack archetype)" src="src/figures/systemExplainer/BacktrackDemo.jsx" />

          <p className="demo__name" style={{ margin: "28px 0 4px" }}>System-Explainer · update (Bayesian)</p>
          <p className="demo__tech" style={{ marginBottom: 16 }}>
            A confidence number revised as each piece of evidence lands, order mattering. The Zepto face-auth verdict.
          </p>
          <UpdateDemo />
          <Ref label="UpdateDemo (update / Bayesian archetype)" src="src/figures/systemExplainer/UpdateDemo.jsx" />

          <p className="demo__name" style={{ margin: "28px 0 4px" }}>System-Explainer · recover</p>
          <p className="demo__tech" style={{ marginBottom: 16 }}>
            A plan breaks and is repaired while keeping the goal, the dead end shown honestly. The Away disruption reroute.
          </p>
          <RecoverDemo />
          <Ref label="RecoverDemo (recover archetype)" src="src/figures/systemExplainer/RecoverDemo.jsx" />

          <p className="demo__name" style={{ margin: "28px 0 4px" }}>System-Explainer · decompose</p>
          <p className="demo__tech" style={{ marginBottom: 16 }}>
            One unanswerable question cleaved into non-overlapping, covering parts (MECE), then one branch unfolded into runnable checks.
          </p>
          <DecomposeDemo />
          <Ref label="DecomposeDemo (decompose archetype)" src="src/figures/systemExplainer/DecomposeDemo.jsx" />

          <p className="demo__name" style={{ margin: "28px 0 4px" }}>System-Explainer · spine (root-cause)</p>
          <p className="demo__tech" style={{ marginBottom: 16 }}>
            One effect, many causes clustered into a few bones, then the one that matters. A fishbone for cart abandonment.
          </p>
          <SpineDemo />
          <Ref label="SpineDemo (spine / root-cause archetype)" src="src/figures/systemExplainer/SpineDemo.jsx" />

          <p className="demo__name" style={{ margin: "28px 0 4px" }}>System-Explainer · sense-plan-act</p>
          <p className="demo__tech" style={{ marginBottom: 16 }}>
            The agent's core, drawn as a closed loop: perceive, decide, act, on repeat, the world changing between laps.
          </p>
          <LoopDemo />
          <Ref label="LoopDemo (sense-plan-act archetype)" src="src/figures/systemExplainer/LoopDemo.jsx" />

          <p className="demo__name" style={{ margin: "28px 0 4px" }}>System-Explainer · weigh</p>
          <p className="demo__tech" style={{ marginBottom: 16 }}>
            Reasons for and against landing on a balance until one side tips. Book now, or wait?
          </p>
          <WeighDemo />
          <Ref label="WeighDemo (weigh archetype)" src="src/figures/systemExplainer/WeighDemo.jsx" />

          <p className="demo__name" style={{ margin: "28px 0 4px" }}>System-Explainer · hedge</p>
          <p className="demo__tech" style={{ marginBottom: 16 }}>
            A conclusion held with its spread, the band narrowing as evidence lands but never faking a single number.
          </p>
          <HedgeDemo />
          <Ref label="HedgeDemo (hedge archetype)" src="src/figures/systemExplainer/HedgeDemo.jsx" />

          <p className="demo__name" style={{ margin: "28px 0 4px" }}>System-Explainer · watch</p>
          <p className="demo__tech" style={{ marginBottom: 16 }}>
            Long quiet monitoring that earns attention at the one right moment. The silent steward, weeks of nothing, then a catch.
          </p>
          <WatchDemo />
          <Ref label="WatchDemo (watch archetype)" src="src/figures/systemExplainer/WatchDemo.jsx" />
        </div>
        <div style={{ margin: "8px 0 36px" }}>
          <p className="demo__name" style={{ marginBottom: 4 }}>Presentation-mode kit</p>
          <p className="demo__tech" style={{ marginBottom: 16 }}>
            The building blocks behind the Scheduled-Delivery reel, each looping on its own: the camera push-in, the glow ring, the tap pulse, the screen crossfade, the microlabel, and the spotlight.
          </p>
          <ReelPresets />
        </div>

        <div style={{ margin: "8px 0 36px" }}>
          {/* mtmlfoo3: the reel moved here from the Scheduled Delivery case */}
          <p className="demo__name" style={{ marginBottom: 4 }}>Presentation mode · Scheduled Delivery reel</p>
          <p className="demo__tech" style={{ marginBottom: 16 }}>
            The full reel: one phone the camera zooms around, each component of the schedule order animating in turn, from the schedule toggle to the cross-midnight relabel to a confirmed slot.
          </p>
          <ReelFigure name="schedDelivery" />
        </div>

        <div style={{ margin: "8px 0 36px" }}>
          <p className="demo__name" style={{ marginBottom: 4 }}>Presentation mode · split walkthrough</p>
          <p className="demo__tech" style={{ marginBottom: 16 }}>
            The second reel shape: one tall page instead of a flow of screens. The camera holds the phone left and the real Zepto brand page scrolls inside it, a soft dim brackets the live section, and the pitch for that section lands on the right. Zoom, scroll and dwell are all derived from the section box and the copy length, so re-writing a line re-times the reel.
          </p>
          <ReelFigure name="brandPage" />
          <Ref label="BrandPageReel (split walkthrough)" src="src/figures/reel/BrandPageReel.jsx" />
        </div>
      </div>

      <p className="article__eyebrow" style={{ marginTop: "1rem" }}>Appendix B</p>
      <h2 className="ss-appendix__title">Raw technique demos</h2>
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
function PageControl({ variant, mode, onScan, onRead, onPresent, i = 0 }) {
  // 07 Sep 2026: the view toggle is back on the index (pin mtqrg97m) as two
  // views: scan (the phone-frames landing, default) and read (the list). Art
  // mode stays removed. The sliding thumb is the same as before.
  const [switching, setSwitching] = useState(false);
  const prevMode = useRef(mode);
  useEffect(() => {
    if (prevMode.current === mode) return;
    prevMode.current = mode;
    setSwitching(true);
    const t = setTimeout(() => setSwitching(false), 500);
    return () => clearTimeout(t);
  }, [mode]);
  return (
    <div className={`page-control page-control--${variant}`} style={{ "--i": i }}>
      <div className={`page-control__toggle${switching ? " is-switching" : ""}`} data-mode={mode} role="tablist" aria-label="View mode">
        <span className="page-control__thumb" aria-hidden />
        <button type="button" aria-label="Scan mode" className={mode === "scan" ? "is-active" : undefined} onClick={() => { if (mode !== "scan") feedback("toggle"); onScan(); }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" /><path d="M7 8h8" /><path d="M7 12h10" /><path d="M7 16h6" />
          </svg>
        </button>
        <button type="button" aria-label="Read mode" className={mode === "read" ? "is-active" : undefined} onClick={() => { if (mode !== "read") feedback("toggle"); onRead(); }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
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
// The site's two persistent switches are both `toggle` events — a binary state
// flips and the flip is the point. See src/ui/feedback.js and the base layer doc.
function ThemeToggle({ theme, onToggle, i = 0 }) {
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      style={{ "--i": i }}
      className="theme-toggle"
      data-tip
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      aria-pressed={isDark}
      onClick={() => {
        feedback("toggle");
        onToggle();
      }}
    >
      {/* "use line icons and match the size of the back arrow icon": 18 -> 15,
          and the core is a drawn ring rather than a solid disc. The moon mask
          still bites it, so dark mode reads as an outlined crescent. */}
      {/* "use line icons and match the size of the back arrow icon" (15px, 2px
          stroke), then "dark mode icon broken".

          The moon used to be made by MASKING the core: a solid disc with a
          circle bitten out of it is a crescent. That only works on a FILLED
          shape. Once the core became a drawn ring, the same bite just cut the
          ring open and left a bare arc, a "C" rather than a moon.

          So the moon is its own crescent PATH now (Iconoir HalfMoon, the house
          set), and the two states cross-fade instead of morphing through a
          mask. The sun keeps its ring and its retracting beams. */}
      <svg className="theme-toggle__icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle className="theme-toggle__core" cx="12" cy="12" r="6" />
        <g className="theme-toggle__beams">
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </g>
        <path className="theme-toggle__moon" d="M3 11.5066C3 16.7497 7.25034 21 12.4934 21C16.2209 21 19.4466 18.8518 21 15.7259C12.4934 15.7259 8.27411 11.5066 8.27411 3C5.14821 4.55344 3 7.77915 3 11.5066Z" />
      </svg>
    </button>
  );
}

// Sound toggle — the theme toggle's sibling (annotation msb82xcx). Same shape:
// no box, one 18px icon that morphs between two states, sitting in .top-controls.
//
// It is OFF by default and stays off until it is asked for. A landing page that
// makes noise on arrival is the thing everybody hates about landing pages, and
// autoplay policy would block it anyway. The preference is global — it lives on
// <html data-sound> so any surface can read it without prop-drilling — and is
// broadcast as a `sound-pref` event so already-mounted audio (the booth) can
// react without a re-render.
const SOUND_KEY = "sound";
export function readSoundPref() {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(SOUND_KEY) === "on";
  } catch {
    return false;
  }
}

function SoundToggle({ on, onToggle, i = 0 }) {
  return (
    <button
      type="button"
      style={{ "--i": i }}
      className="sound-toggle"
      data-tip
      aria-label={on ? "Mute sound" : "Unmute sound"}
      aria-pressed={on}
      title="Toggle sound"
      onClick={() => {
        // THE MUTE CONTROL IS ITSELF A `toggle`, and per §7 it is the one
        // control allowed to confirm itself in the channel it governs.
        //
        // ORDER MATTERS, and the first version had it wrong (annotation
        // msmqar1v): it fired BEFORE flipping the preference, so switching
        // sound ON was silent - at that instant the preference still said off
        // and the sound layer correctly refused to make a noise. The one press
        // that is supposed to demonstrate the channel was the one press that
        // could not. Flip first, then fire.
        //
        // Turning it OFF stays silent: a parting sound from a control whose
        // whole purpose is to stop sounds is a joke that lands once. The haptic
        // still fires either way, which is what confirms the press itself.
        // ALWAYS FLIP FIRST, THEN FIRE - one path, and the preference does the
        // rest. Turning ON: the flip lands, the sound layer now says yes, and
        // the press confirms itself. Turning OFF: the flip lands, the sound
        // layer says no, and the press is silent - a parting noise from the
        // control whose job is to stop noises is a joke that lands once.
        //
        // The haptic fires either way, so the press is still confirmed on the
        // way out; it just uses the channel that is still open.
        onToggle();
        requestAnimationFrame(() => feedback("toggle"));
      }}
      data-on={on ? "true" : undefined}
    >
      {/* Drawn to the same optical size as ThemeToggle — artwork fills ~19x16 of
          the 24 grid, one 2px stroke weight throughout — so the pair reads as one
          set rather than a big sun beside a small speaker (annotation msb8bruz). */}
      <svg className="sound-toggle__icon" width="15" height="15" viewBox="0 0 24 24" aria-hidden>
        {/* the speaker body is constant; only the waves and the slash change */}
        <mask id="sound-cut">
          <rect x="0" y="0" width="24" height="24" fill="white" />
          <line
            className="sound-toggle__cut"
            x1="2.1"
            y1="3.6"
            x2="18.9"
            y2="20.4"
            stroke="black"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </mask>
        <g mask="url(#sound-cut)">
          <path
            d="M3 9h3.7L11.5 4.2v15.6L6.7 15H3z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <g
            className="sound-toggle__waves"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          >
            <path className="sound-toggle__wave" d="M15.1 8.8a4.6 4.6 0 0 1 0 6.4" />
            <path className="sound-toggle__wave" d="M18.2 5.7a8.8 8.8 0 0 1 0 12.6" />
          </g>
        </g>
        {/* The slash CROSSES the speaker (annotation msbe04ei). It used to sit
            beside it, in the gap the waves vacate, which read as a stray diagonal
            floating next to a speaker rather than a mute mark. Running it over the
            speaker needs a gap punched through whatever it crosses, or the line
            vanishes into the filled cone: the mask does that, with a cut stroke
            2px wider than the slash so a 1px margin shows on each side. Cut and
            slash share the dash animation so they arrive and leave together. */}
        {/* nudged 1.5 units left of the geometric diagonal (annotation msbg811r):
            the speaker sits left of the viewBox centre, so the true diagonal read
            as right-heavy against the artwork */}
        <line
          className="sound-toggle__slash"
          x1="2.1"
          y1="3.6"
          x2="18.9"
          y2="20.4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}

/* ---------- Resume viewer (WIP tool) ----------
   A tabbed viewer for the resume and its per-role tailored presets. Each preset is
   one tab: the org or person it is aimed at, a note on how the base was customized
   for them, the PDF inline, and a download. Add a preset by dropping one object into
   RESUME_PRESETS and putting its PDF in public/resume/. Routed at /work/resume via
   the WIP shelf. The base PDF is generated from ../Resume/resume.html — re-copy it to
   public/resume/agam-agarwal-base.pdf after regenerating. */
const RESUME_PRESETS = [
  {
    id: "format",
    label: "Two-column",
    aim: "The live two-column layout",
    note: "Edited in code (src/Resume.jsx). Download PDF prints this page; a tailored version can open in its own tab.",
    html: true,
  },
  {
    id: "base",
    label: "Base",
    aim: "The master resume",
    note: "Positioned for experience-led, high-growth consumer product companies (Series A to C): 0-to-1 product design, craft, and data-informed impact. Every tailored version starts from this.",
    pdf: "/resume/agam-agarwal-base.pdf",
    file: "Agam Agarwal - Product Designer.pdf",
  },
  {
    id: "classic",
    label: "Classic",
    aim: "Classic two-column format",
    note: "The same content in a more traditional, prose-led two-column layout (blue title, monospace dates), for recruiters who prefer a familiar resume shape.",
    pdf: "/resume/agam-agarwal-classic.pdf",
    file: "Agam Agarwal - Product Designer (Classic).pdf",
  },
  {
    id: "headout",
    label: "Headout",
    aim: "Sent to Headout, Lead Product Designer",
    note: "Tailored to the JD's five asks. Selected Projects moved up so the travel work (Away) and the AI trust work (Dassh) sit high; Scheduled Delivery reframed around defining the right problem; Jarvis reframed as the confirmation moment before money moves; skills lead with shipping production front-end in Claude Code.",
    pdf: "/resume/agam-agarwal-headout.pdf",
    file: "Agam Agarwal - Product Designer (Headout).pdf",
  },
  // Add a tailored preset like this (drop the PDF in public/resume/):
  // {
  //   id: "groww",
  //   label: "Groww",
  //   aim: "Sent to Groww, Product Designer",
  //   note: "Led with the Zepto 0-to-1 and AOV story; reordered skills to mirror Groww's JD (product thinking, motion, research).",
  //   pdf: "/resume/agam-agarwal-groww.pdf",
  //   file: "Agam Agarwal - Groww.pdf",
  // },
];

function ResumeViewer() {
  const [active, setActive] = useState(RESUME_PRESETS[0].id);
  const [open, setOpen] = useState(false);
  const preset = RESUME_PRESETS.find((p) => p.id === active) || RESUME_PRESETS[0];
  return (
    <div className="resume-viewer">
      <div className="resume-bar">
        <Link to="/" className="back-link">
          <BackIcon />
          Back
        </Link>
        <span className="resume-bar__label">{preset.label} resume</span>
        {preset.html ? (
          <button type="button" className="resume-download" onClick={() => window.print()}>
            Download PDF
          </button>
        ) : (
          <a className="resume-download" href={preset.pdf} download={preset.file}>
            Download PDF
          </a>
        )}
      </div>
      {preset.note && (
        <p className="resume-note">
          {preset.aim && <strong>{preset.aim}. </strong>}
          {preset.note}
        </p>
      )}
      <div className="resume-stage">
        {preset.html ? (
          <div className="resume-html-scroll">
            <Suspense fallback={null}>
              <Resume />
            </Suspense>
          </div>
        ) : (
          <iframe
            key={preset.id}
            className="resume-frame"
            title={`Resume, ${preset.label}`}
            src={`${preset.pdf}#view=FitH&navpanes=0`}
          />
        )}
      </div>

      {/* version switcher as a bottom floating toggle: expand to the list; the base
          shows inline, and any version can be opened (and kept) in a new tab. */}
      <div className={`resume-floater${open ? " resume-floater--open" : ""}`}>
        {open && (
          <div className="resume-floater__panel" role="listbox" aria-label="Resume versions">
            <p className="resume-floater__head">Versions</p>
            {RESUME_PRESETS.map((p) => (
              <div key={p.id} className={`resume-vrow${p.id === active ? " resume-vrow--active" : ""}`}>
                <button
                  type="button"
                  className="resume-vrow__pick"
                  role="option"
                  aria-selected={p.id === active}
                  onClick={() => { setActive(p.id); setOpen(false); }}
                >
                  <span className="resume-vrow__label">{p.label}</span>
                  {p.aim && <span className="resume-vrow__aim">{p.aim}</span>}
                </button>
                <a
                  className="resume-vrow__tab"
                  href={p.pdf || "/work/resume"}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open in a new tab"
                  aria-label={`Open the ${p.label} resume in a new tab`}
                >↗</a>
              </div>
            ))}
          </div>
        )}
        <button
          type="button"
          className="resume-floater__btn"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Switch resume version"
        >
          <span className="resume-floater__now">{preset.label}</span>
          <span className="resume-floater__meta">
            {RESUME_PRESETS.length} version{RESUME_PRESETS.length === 1 ? "" : "s"}
          </span>
          <svg className="resume-floater__chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d={open ? "M6 9l6 6 6-6" : "M6 15l6-6 6 6"} />
          </svg>
        </button>
      </div>
    </div>
  );
}

// 5 Oct (going live): the public build strips every "[Confirm ...]" writing
// note from every case and drops the fill-in boxes, the same clean-up the
// presenting cut gets. Dev still shows them, so they stay visible to fix.
if (import.meta.env.VITE_PUBLIC_SITE === "1") {
  const stripNotes = (v) => {
    if (typeof v === "string") return v.replace(/\s*\[Confirm[^\]]*\]/gi, "");
    if (Array.isArray(v)) return v.map(stripNotes);
    if (v && typeof v === "object" && !v.$$typeof) { for (const k of Object.keys(v)) v[k] = stripNotes(v[k]); return v; }
    return v;
  };
  for (const cs of Object.values(caseStudies)) { delete cs.todo; stripNotes(cs); }
}

export default function App() {
  const [rawPath, navigate] = useRoute();
  // 5 Oct (going live): the public build (VITE_PUBLIC_SITE=1, set in amplify.yml)
  // serves only the home page and the case studies. Any other route (the labs,
  // /dj, /stella, /carnegie...) falls back to the home page. Dev keeps them all.
  const PUBLIC_ONLY = import.meta.env.VITE_PUBLIC_SITE === "1";
  // /work/resume (the tailored-CV builder) is private too; the header's single
  // product-design PDF is the only resume that ships
  const isPublicRoute = rawPath === "/" || rawPath === "/portfolio" || (rawPath.startsWith("/work/") && rawPath !== "/work/resume");
  const path = PUBLIC_ONLY && !isPublicRoute ? "/" : rawPath;
  const isLab = path === "/lab";
  // The cross-sell decision tree, standalone and edge to edge (unlisted, like
  // /lab and /mockups). Same component as figure 1 of /work/cross-sell.
  const isCrossSellTree = path === "/cross-sell-tree";
  const isReelExport = path === "/reel-export";
  const isMockups = path === "/mockups";
  const isZeptoIcons = path === "/zepto-premium-icons";
  const isBrickLab = path === "/brick-lab";
  const isShaders = path === "/shaders";
  // Every state the Living Sky can be in: weather x time x season x latitude,
  // plus a contact sheet of all fifteen conditions (unlisted, like /shaders).
  const isSky = path === "/sky";
  const isThreeLines = path === "/three-lines";
  // The Figma-motion verification harness (unlisted, like /lab and /mockups):
  // mounts the motion-built components and holds them to the exact keyframes
  // and boxes their source files report. See tools/figma-motion/README.md.
  const isMotionCheck = path === "/motion-check";
  const isMascot = path === "/mascot";
  const isStella = path === "/stella";
  const isDj = path === "/dj";
  const isWindow = path === "/window";
  const isSdAvail = path === "/sd-availability";
  // RENAMED. What was /hello2 is now /hello — it is the live candidate, so it
  // gets the plain name; the earlier version it was compared against moved to
  // /hello0. /hello2 still resolves, as an alias rather than a redirect: the URL
  // is what annotations are keyed on and what open tabs are sitting at, and a
  // silent replaceState would strand both.
  const isHello0 = path === "/hello0";
  const isHello = path === "/hello" || path === "/hello2";
  const isHello3 = path === "/hello3";
  // /portfolio: the phone-frames landing (Hello3), same as the root (07 Sep). The
  // old list home moved to /list so it stays reachable.
  const isPortfolio = path === "/portfolio";
  const isList = path === "/list";
  const isSocials = path === "/socials" && SocialsPage;
  const isCarnegie = (path === "/carnegie" || path === "/masters") && CarnegiePage;
  const isPepoHouse = path === "/pepo-house" && PepoHousePage;
  const isClaudeFiles = path === "/claude-files" && ClaudeFilesPage;
  const isWriting = path === "/writing" && WritingPage;
  // Old case URLs that were merged into another entry keep resolving.
  const CASE_ALIASES = { "occasion-buying": "cross-sell" };
  const rawSlug = path.startsWith("/work/") ? path.slice("/work/".length) : null;
  const slug = rawSlug ? CASE_ALIASES[rawSlug] || rawSlug : null;
  // SCAN IS THE DEFAULT. The index opens on the scannable list rather than the
  // read-through page, so the first thing a visitor gets is the whole body of
  // work at a glance and the choice of where to go, instead of a document to
  // start reading. Read mode is one tap away and unchanged.
  //
  // Nothing else needed adjusting: both toggle buttons derive `is-active` from
  // this value and the thumb is placed off `data-mode`, so the control comes up
  // already on the right-hand side rather than sliding there - a transition does
  // not run on a value that was never anything else.
  //
  // The scroll-reset effect below still skips its first run, so defaulting here
  // cannot yank a deep link or a restored scroll position to the top.
  const [mode, setMode] = useState("scan"); // mtqpu3f2: read mode is gone; scan or art only
  // A MODE CHANGE REPLACES THE PAGE'S CONTENT, so the scroll offset from the old
  // one means nothing on the new one. Switching to scan at y=700 left you at
  // y=674 on the hello page — most of the way down, past the hero, at a spot you
  // never asked for. Same in reverse.
  //
  // AFTER THE COMMIT, NOT IN THE CLICK HANDLER. A layout effect runs once the
  // new tree is committed and before paint, so the scroll lands on the page that
  // is actually there. Scrolling from the handler would fire against the OLD
  // document, before the swap, and leave the browser free to adjust the offset
  // again while the content is replaced. Keyed on `mode` rather than wired into
  // the buttons for the same reason: any future way of changing mode is covered
  // without having to remember this.
  //
  // INSTANT, and that part is deliberate too. `html { scroll-behavior: smooth }`
  // is global (index.css), so a bare scrollTo({top: 0}) animates 700px over
  // content that has already been torn out from under it. Smooth scrolling says
  // "you are moving through this"; here there is no through, the destination is
  // a different page. Motion implying continuity that does not exist is worse
  // than no motion at all.
  //
  // Skips the FIRST run: this fires on mount too, and a page that yanks itself
  // to the top on load would break a deep link or a restored scroll position.
  const modeRef = useRef(mode);
  useLayoutEffect(() => {
    if (modeRef.current === mode) return;
    modeRef.current = mode;
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [mode]);
  const [presenting, setPresenting] = useState(false);
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    // ?theme=light|dark overrides saved/system theme; used by tools/export-pdf.mjs
    // so PDF exports always render the light tokens regardless of the machine.
    const forced = new URLSearchParams(window.location.search).get("theme");
    if (forced === "dark" || forced === "light") return forced;
    // 7 Oct (Agam: "default mode is still light mode"): DARK is the default
    // everywhere, dev included, whatever the hour; a theme the visitor picked with
    // the toggle still wins until the next dusk or dawn (lib/autoTheme.js). The
    // time-of-day theme (27 Sep) is retired; themeForTime still drives the pick's expiry
    return manualTheme() ?? "dark";
  });
  // while the clock drives it, re-check each minute, so the page turns at dusk
  useEffect(() => {
    const forced = new URLSearchParams(window.location.search).get("theme");
    if (forced === "dark" || forced === "light") return undefined;
    return undefined; // 7 Oct: dark by default everywhere, no dusk/dawn flip (the clock code is kept below, unused)
    // eslint-disable-next-line no-unreachable
    const id = setInterval(() => {
      if (manualTheme()) return;
      const t = themeForTime();
      setTheme((cur) => {
        if (cur !== t) document.documentElement.classList.toggle("dark", t === "dark");
        return t;
      });
    }, 60000);
    return () => clearInterval(id);
  }, []);

  // Sound preference: off until asked for (see SoundToggle).
  const [sound, setSound] = useState(readSoundPref);
  useEffect(() => {
    document.documentElement.dataset.sound = sound ? "on" : "off";
    try {
      window.localStorage.setItem(SOUND_KEY, sound ? "on" : "off");
    } catch {
      /* storage unavailable */
    }
    // already-mounted audio (the booth's console) listens for this rather than
    // being re-rendered, so an unmute never restarts the WebGL/audio graph
    window.dispatchEvent(new CustomEvent("sound-pref", { detail: { on: sound } }));
  }, [sound]);
  const toggleSound = useCallback(() => setSound((v) => !v), []);

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
    setManualTheme(next);
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
    // the window scene's canvas (folio page, before the landing): a view transition
    // freezes it into a snapshot for the reveal and then jumps to the live, re-themed
    // render, a visible glitch (Agam, 2026-09-27); there the theme flips in place
    const sceneLive = document.documentElement.dataset.wsceneLanded === "false";
    if (typeof document.startViewTransition !== "function" || reduce || sceneLive) {
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

  // PRD / native-doc pages (cs.doc set) have their own Read/Listen controls, so the
  // top-level Present ("play") button does not apply — hide it there.
  const isNativeDoc = !!(slug && caseStudies[slug]?.doc);
  const variant = isCrossSellTree || isLab || isMockups || isZeptoIcons || isBrickLab || isShaders || isSky || isThreeLines || isMotionCheck || isMascot || isStella || isDj || isWindow || isSdAvail || isHello || isHello0 || isHello3 || isSocials || isCarnegie || isPepoHouse || isClaudeFiles || isWriting || isNativeDoc || slug === "resume" ? "none" : slug ? "play" : "toggle";
  const accent = slug ? (caseStudies[slug] || caseStudies.sample).accent : undefined;

  // THE NAV LIFTS OUT ON SCROLL, one item after another (20 Sep 2026: "we built
  // an animation for when I scroll the nav elements disappears staggered").
  //
  // This behaviour is older than this hook - it was mtr7vwf7 and it lived
  // inside HeroChips, so when the chips stopped being the nav it went with
  // them. It belongs to the NAV, not to one page's version of it, so it moves
  // here and now runs on every route.
  //
  // mtr89zat: DIRECTION, not position. Scrolling down past 48px lifts them out;
  // any scroll back up brings them in again, wherever on the page you are. The
  // 48 is past the first nudge of a wheel so a resting page never flickers, and
  // the 4px dead band stops trackpad jitter doing the same.
  const [navHidden, setNavHidden] = useState(false);
  useEffect(() => {
    let last = window.scrollY;
    const read = () => {
      const y = window.scrollY;
      if (y <= 48) setNavHidden(false);
      else if (y > last + 4) setNavHidden(true);
      else if (y < last - 4) setNavHidden(false);
      last = y;
    };
    read();
    window.addEventListener("scroll", read, { passive: true });
    return () => window.removeEventListener("scroll", read);
  }, []);

  // Video-export surface: the bare reel at its 960x600 design size, top-left, with
  // no site chrome, no background canvas and no theme controls in the frame.
  // tools/export-reel.mjs points headless Chrome here and steps window.__reel.seek
  // one frame at a time. Placed after every hook so the early return is legal.
  if (isReelExport) {
    const name = new URLSearchParams(window.location.search).get("reel") || "brandPage";
    const Reel = reels[name] || reels.brandPage;
    return <Reel surface="export" />;
  }

  return (
    <NavContext.Provider value={navigate}>
      {/* tactile WebGL grain behind all content; ripples from the toggle on theme
          change. Skipped on case studies so the cloud-shader hero (also WebGL)
          isn't starved of a GPU context by a third simultaneous canvas. */}
      {!slug && !isBrickLab && !isDj && !isWindow && <TexturedBackground theme={theme} />}
      {/* one fixed, right-anchored row so the theme toggle always sits a fixed
          gap to the left of the page control and follows it as it morphs */}
      {/* data-feedback-toolbar marks this persistent control cluster (theme +
          view-mode + present) non-annotatable to Agentation — its picker returns
          null inside such a subtree — so this floating chrome stops grabbing the
          element picker. */}
      {/* Hidden on /work/resume: that page has its own top bar (Back + Download),
          and the fixed floating controls otherwise overlap it. */}
      {/* isStella is in this list because /stella is a full-screen application with
          its own theme control in its header; without it the site chrome puts two
          theme toggles side by side driving two different token systems. */}
      {/* One delegated tooltip for every [data-tip] on the page. Mounted here,
          at the app root, so it is outside every clipping context. */}
      <Tooltips />

      <div
        className={
          "top-controls"
        }
        data-scrolled={navHidden ? "true" : undefined}
        /* --n is the LAST index, so the stagger can be read backwards on the way
           back in without the CSS having to know how many buttons there are */
        data-feedback-toolbar={isPortfolio ? undefined : "true"} /* mtr7e0z9: on /portfolio the row holds the four chips, which need to be annotatable */
        style={{
          "--n": variant === "play" ? 3 : 1,
          ...(slug === "resume" || isBrickLab || isDj || isWindow || isStella ? { display: "none" } : null),
        }}
      >
        {/* "bring this in the same line as the other icons, make a unified
            states bar": Back used to live in the case study's own sidebar, so
            the page had two separate clusters of chrome. It is the first item
            of this row now. `variant === "play"` is exactly the case-study
            state, which is the only place the arrow means anything. */}
        <GlassLens />
        {variant === "play" && (
          <Link to="/" className="top-controls__back" aria-label="Back" style={{ "--i": 0 }}>
            <BackIcon />
          </Link>
        )}
        {/* ONE NAV, EVERYWHERE (20 Sep 2026: "make the nav a consistent
            component across the site only the state changes").

            This used to fork: /portfolio rendered <HeroChips> (mtr6f8xm) and
            every other route rendered these two toggles. Same job, same place,
            two components - so crossing between them unmounted one set and
            mounted the other, and no amount of matching the styles could make
            that transition rather than pop. The fork is gone; these two are the
            nav now, on every route, and because they live outside the route
            switch React keeps the very same elements mounted as you navigate.

            What changes between pages is STATE, not the component: Back appears
            when there is somewhere to go back to, Present when a case study can
            be presented. HeroChips is left in the tree unused - it still owns
            the hero placement's markup - but nothing renders it here any more.

            The cost, named: the chips revealed their label on hover ("Dark
            mode", "Sound off") and these carry the same words as a tooltip
            instead. */}
        <SoundToggle on={sound} onToggle={toggleSound} i={variant === "play" ? 1 : 0} />
        <ThemeToggle theme={theme} onToggle={toggleTheme} i={variant === "play" ? 2 : 1} />
        {(isWindow || ((path === "/" || path === "/portfolio") && typeof window !== "undefined" && windowSceneOn())) && (
          <Suspense fallback={null}>
            <SceneControls i={variant === "play" ? 3 : 2} feedback={feedback} />
          </Suspense>
        )}
        {/* mtqrqf4l: no Scan / Read toggle on /portfolio */}
        {!isPortfolio && <PageControl
          i={variant === "play" ? 3 : 2}
          variant={variant}
          mode={mode}
          onScan={() => setMode("scan")}
          onRead={() => setMode("read")}
          onPresent={() => setPresenting(true)}
        />}
      </div>
      {isCrossSellTree ? (
        <CrossSellTree standalone />
      ) : isHello0 ? (
        <Hello onNavigate={navigate} />
      ) : isHello ? (
        <Hello onNavigate={navigate} detail="card" />
      ) : isHello3 ? (
        <Hello3 onNavigate={navigate} theme={theme} onToggleTheme={toggleTheme} sound={sound} onToggleSound={toggleSound} />
      ) : isLab ? (
        <>
          <MotionLab />
          {/* the audible half of the design system, beside the visual one
              (annotation msmqar1v) */}
          <FeedbackBench />
          {/* ALONGPATH v1, FROZEN (annotation msnzjru1). Parked here so the v2
              redesign has the shipped version to be compared against - see the
              header in AlongPathV1.jsx for exactly what this snapshot does and
              does not preserve. */}
          <section className="lab-snapshot" aria-label="AlongPath v1 (frozen)">
            <h2 className="lab-snapshot__title">AlongPath v1 &mdash; frozen 2026-08-11</h2>
            <p className="lab-snapshot__note">
              The shipped version at the moment v2 work began. Logic is frozen in
              its own file; the <code>.ap*</code> CSS is still shared, so v2 should
              add new class names rather than edit the existing rules.
            </p>
            <AlongPathV1 />
          </section>
          {/* VERTICAL TIMELINE v1, FROZEN (2026-08-13). The top-to-bottom touch
              timeline parked before the horizontal redesign. Frozen by contract,
              not by copy: RailColumn.jsx and every .tlv* rule stay untouched, so
              v2 must be a new component with new class names. See the header in
              TimelineVerticalV1.jsx. */}
          <section className="lab-snapshot" aria-label="Vertical timeline v1 (frozen)">
            <h2 className="lab-snapshot__title">Vertical timeline v1 &mdash; frozen 2026-08-13</h2>
            <p className="lab-snapshot__note">
              The vertical touch timeline (years &middot; glass spine &middot;
              cards) at the moment the horizontal redesign began. Frozen by
              contract: <code>RailColumn.jsx</code> and the <code>.tlv*</code> CSS
              are untouched, so the horizontal v2 must add new class names rather
              than edit them. Scroll it into the reading line to see the spine
              magnify.
            </p>
            <TimelineVerticalV1 />
          </section>
        </>
      ) : isMockups ? (
        <MockupLab />
      ) : isZeptoIcons ? (
        <IconShowcase />
      ) : isBrickLab ? (
        <BrickLab onBack={() => navigate("/")} />
      ) : isShaders ? (
        <ShaderGallery onBack={() => navigate("/")} />
      ) : isSky ? (
        <SkyLab onBack={() => navigate("/")} />
      ) : isThreeLines ? (
        <ThreeLinesLab onBack={() => navigate("/")} />
      ) : isMotionCheck ? (
        <Suspense fallback={null}>
          <MotionCheck onBack={() => navigate("/")} />
        </Suspense>
      ) : isMascot ? (
        <PixelMascotLab onBack={() => navigate("/")} />
      ) : isStella ? (
        <StellaLab onBack={() => navigate("/")} />
      ) : isWindow ? (
        <Suspense fallback={null}>
          <WindowScenePage onBack={() => navigate("/")} />
        </Suspense>
      ) : isDj ? (
        <Suspense fallback={null}>
          <DjConsole onBack={() => navigate("/")} />
        </Suspense>
      ) : isSdAvail ? (
        <Suspense fallback={null}>
          <SdAvailability onBack={() => navigate("/")} />
        </Suspense>
      ) : isSocials ? (
        <SocialsPage onBack={() => navigate("/")} />
      ) : isCarnegie ? (
        <CarnegiePage onBack={() => navigate("/")} />
      ) : isPepoHouse ? (
        <PepoHousePage onBack={() => navigate("/")} />
      ) : isClaudeFiles ? (
        <ClaudeFilesPage onBack={() => navigate("/")} />
      ) : isWriting ? (
        <WritingPage onBack={() => navigate("/")} />
      ) : slug === "resume" ? (
        <ResumeViewer />
      ) : slug ? (
        caseStudies[slug] && caseStudies[slug].locked ? (
          <LockedCaseStudy cs={caseStudies[slug]} slug={slug} />
        ) : (
          <CaseStudy slug={slug} presenting={presenting} onExitPresent={() => setPresenting(false)} theme={theme} toggleTheme={toggleTheme} />
        )
      ) : isPortfolio ? (
        <Hello3 onNavigate={navigate} theme={theme} onToggleTheme={toggleTheme} sound={sound} onToggleSound={toggleSound} />
      ) : isList ? (
        <Home mode="read" />
      ) : mode === "scan" ? (
        /* SCAN MODE IS NOW THE /hello PAGE.
           Not a variant of Home — the same mount /hello itself gets, so the two
           can never drift. That also settles the header question by structure
           rather than by CSS: Home is not rendered at all, so there is no index
           header or footer to suppress, and /hello's own hero and DJ footer are
           the only ones on screen.

           THE INTRO PLAYS HERE TOO, per Agam. This reverses the earlier
           `intro={false}`, whose argument was that a toggle is not an arrival
           and so has not earned a held viewport. The call now is that scan mode
           IS the page, not a preview of it — it is the same mount /hello gets,
           and greeting someone on one and not the other made the greeting feel
           like a property of the URL rather than of the page. One page, one
           arrival. The escape hatches are unchanged and do the work the old
           argument was worried about: reduced-motion starts at rest, and any
           wheel, touch, pointer or key press skips straight to `reveal`, so
           nobody who already knows the page is held by it.

           Home still carries its old scan branch — the departure board, the
           split-flap chips, scanProjects — UNRENDERED and reachable only by
           putting this back. Kept deliberately, not stranded: the split-flap is
           craft that exists nowhere else on the site. */
        /* detail="drawer": scan mode gets the v2 bottom-drawer detail — same
           phone-hero morph out of the grid, but the evidence rises as a
           draggable sheet instead of the v1 full page (which /hello keeps,
           and which is archived live at /lab). */
        /* 07 Sep 2026, Agam: the phone-frames view (Hello3, the /hello3 mount) is
           the default at the root; the drawer Hello stays reachable at /hello. */
        <Hello3 onNavigate={navigate} theme={theme} onToggleTheme={toggleTheme} sound={sound} onToggleSound={toggleSound} />
      ) : (
        <Home mode={mode} />
      )}
      {/* Agentation floater is mounted once in main.jsx (outside StrictMode) — do
          not also render it here, or two overlapping floaters appear. */}
    </NavContext.Provider>
  );
}
