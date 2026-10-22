// Figures for the Tern chapters of /work/away-agent. Every screen goes through the shared PhoneFrame
// with an honesty tag from the capture manifest (Real / Fixture / Simulated). The agent is shown as
// "Atlas" in the captures, so captions say "Atlas (prototype name, becoming Goose)".
import PhoneFrame from "../ds/IphoneFrame";
import "./ternFigures.css";

const B = "/figures/away-agent/tern/";
const ATLAS = "Atlas (prototype name, becoming Goose)";

function Shot({ n, size = "md", tag, caption, alt }) {
  return <PhoneFrame screen={`${B}${n}.webp`} alt={alt || caption || ""} size={size} tag={tag} caption={caption} interactive={false} />;
}

// light and dark side by side
function Pair({ n, tag, light, dark, alt }) {
  return (
    <div className="tern-fig">
      <Shot n={`${n}-light`} tag={tag} caption={light || "Light"} alt={alt && `${alt} (light)`} />
      <Shot n={`${n}-dark`} tag={tag} caption={dark || "Dark"} alt={alt && `${alt} (dark)`} />
    </div>
  );
}

function Clip({ n, tag, caption, alt, size = "md" }) {
  return (
    <PhoneFrame size={size} tag={tag} caption={caption} alt={alt}>
      <video src={`${B}${n}.mp4`} poster={`${B}${n}-poster.webp`} autoPlay loop muted playsInline preload="metadata" aria-label={alt} />
    </PhoneFrame>
  );
}

export const ternFigures = {
  ternWhichFlight: () => <Pair n="which-flight-are-you-on" tag="Real" alt="Which flight are you on?" />,
  ternConnecting: () => (
    <div className="tern-fig">
      <Shot n="connecting-searching-light" size="sm" tag="Simulated" caption="Searching" />
      <Shot n="connecting-one-phone-far-light" size="sm" tag="Simulated" caption="One phone, far" />
      <Shot n="connecting-one-phone-near-light" size="sm" tag="Simulated" caption="One phone, near" />
      <Shot n="connecting-two-phones-light" size="sm" tag="Simulated" caption="Two phones" />
    </div>
  ),
  ternSweep: () => (
    <div className="tern-fig">
      <Clip n="connecting-sim" tag="Simulated" alt="A phone appears far away, moves closer, then the green connected sweep" caption="Timer-driven, no radios" />
      <Shot n="connected-sweep-finished-dark" tag="Simulated" caption="The connected sweep, finished" />
    </div>
  ),
  ternGroupEmpty: () => <Pair n="group-tab-empty" tag="Real" alt="The group tab before any chat" />,
  ternChat: () => <Pair n="chat-atlas-offer-card-thinking" tag="Fixture" light={ATLAS} dark={ATLAS} alt="Atlas in the group chat" />,
  ternJourney: () => <Pair n="journey-timeline-dummy-flight" tag="Fixture" alt="The journey timeline for a dummy flight" />,
  ternAddFlight: () => (
    <div className="tern-fig">
      <Clip n="add-flight" tag="Fixture" alt="Pasting a boarding pass, the flight card, then the journey timeline" caption="Paste path, canned lookup" size="lg" />
    </div>
  ),
  ternGroupView: () => <Pair n="group-view-connection-risk" tag="Fixture" alt="The group view with a very tight connection" />,
  ternBoarding: () => <Pair n="boarding-pass-parsed-dummy" tag="Fixture" alt="A parsed dummy boarding pass" light="Dummy pass, code blurred here" dark="Dummy pass, code blurred here" />,
  ternLive: () => <Pair n="journey-live-demo-flight-card" tag="Real" alt="The live demo flight card with no route or schedule" />,
  ternBrand: () => (
    <div className="tern-fig">
      <Shot n="splash-dot-matrix-loader-dark" tag="Real" caption="The splash" />
      <Shot n="typing-welcome-finished-dark" tag="Real" caption="The typing welcome" />
      <Clip n="welcome" tag="Real" alt="The typing welcome crossfading into Which flight are you on?" caption="Into the first question" />
    </div>
  ),
};
