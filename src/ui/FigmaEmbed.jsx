import { useEffect, useRef, useState } from "react";
import { OpenNewWindow, Refresh } from "iconoir-react";
import "./figmaEmbed.css";

// THE live Figma embed for the site: a frame or a prototype straight from the Figma file, so an edit
// in Figma shows up here with no re-export. Every Figma iframe goes through this; never hand-copy one.
//
//   <FigmaEmbed node="15:1131" title="..." fallback="/figures/x.png" />                    design frame
//   <FigmaEmbed mode="proto" node="9:154" start="9:154" title="..." fallback="..." />       prototype
//   <FigmaEmbed ... aspect="360 / 829" />                                                  own fixed box
//
// node      frame id ("9:154" or "9-154"); start = the prototype's starting point (defaults to node)
// aspect    a CSS aspect-ratio for the box; leave it out inside a box that already has a size
//           (PhoneFrame's screen), which fills it
// fallback  the static export of the same frame. It is painted first and stays as the floor: the
//           iframe is mounted only near the viewport, and the still fades out once Figma has loaded
//           and had time to fetch the file and paint (2.5 s). If Figma never loads (offline, blocked, 15 s), the still stays.
//           A sign-in wall also fires `load`, so the file must stay "anyone with the link can view".
// floor     "cover" (a full screen export) | "bottom" (a bottom-sheet export, anchored to the foot)
// children  a live floor instead of the still (the homepage's coded slot tour); fades out the same way
// restart   a round glass Restart, bottom right, that reloads the iframe to its first frame (default: on for prototypes)
// badge     the loading dots over the floor (off where the floor is itself moving)
// phoneStill  on a phone (PHONE_STILL) the iframe never mounts: the floor stays, with an "Open in Figma" link to the
//           same frame or prototype (critique 18.2, 25 Oct: the live embed is heavy, slow and pinch-zooms inside the
//           page). Desktop keeps it live. On by default; false keeps the embed live everywhere.
// openLink  the phone's "Open in Figma" link; false where the embed already sits inside a link (the homepage card)
//
// Embed URLs per Figma's Embed Kit 2.0: embed.figma.com/{design|proto}/<file>?node-id=…&embed-host=…
export const FIGMA_SCHEDULE_FILE = "R04cmbzFPQk2Q4IockGwqZ"; // Claude: Schedule (the organised source)
const CLIENT_ID = import.meta.env.VITE_FIGMA_EMBED_CLIENT_ID;

const dash = (id) => String(id).replace(":", "-");
export function figmaEmbedSrc({ file = FIGMA_SCHEDULE_FILE, node, start, mode = "design" }) {
  const q = new URLSearchParams({ "node-id": dash(node), "embed-host": "portfolio" });
  if (mode === "proto") {
    q.set("starting-point-node-id", String(start || node).replace("-", ":"));
    q.set("scaling", "scale-down-width"); // fills a phone screen edge to edge; "contain" leaves the frame tiny
    q.set("hide-ui", "1");
  } else {
    q.set("footer", "false");
    q.set("viewport-controls", "false");
    q.set("page-selector", "false");
  }
  if (CLIENT_ID) q.set("client-id", CLIENT_ID);
  return `https://embed.figma.com/${mode === "proto" ? "proto" : "design"}/${file}?${q}`;
}
export const figmaOpenUrl = ({ file = FIGMA_SCHEDULE_FILE, node, start, mode = "design" }) =>
  mode === "proto"
    ? `https://www.figma.com/proto/${file}?node-id=${dash(node)}&starting-point-node-id=${encodeURIComponent(String(start || node).replace("-", ":"))}`
    : `https://www.figma.com/design/${file}?node-id=${dash(node)}`;

export const PHONE_STILL = "(max-width: 720px)";
const phoneNow = () => typeof window !== "undefined" && !!window.matchMedia?.(PHONE_STILL).matches;
function usePhoneStill() {
  const [on, setOn] = useState(phoneNow);
  useEffect(() => {
    const mq = window.matchMedia?.(PHONE_STILL);
    if (!mq) return undefined;
    const ch = () => setOn(mq.matches);
    ch();
    mq.addEventListener("change", ch);
    return () => mq.removeEventListener("change", ch);
  }, []);
  return on;
}

export default function FigmaEmbed({ node, start, mode = "design", file, title, fallback, alt = "", floor = "cover", aspect, badge = true, restart = mode === "proto", phoneStill = true, openLink = true, className = "", children }) {
  const root = useRef(null);
  const still = usePhoneStill() && phoneStill;
  const [near0, setNear] = useState(false);
  const near = near0 && !still; // the iframe mounts only near the viewport, and never as a phone still
  const [st, setSt] = useState("idle"); // idle | loading | ready | failed
  const [run, setRun] = useState(0); // bumped by Restart: a fresh iframe starts the prototype at its first frame
  useEffect(() => {
    const el = root.current;
    if (!el || typeof IntersectionObserver === "undefined") { setNear(true); return undefined; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setNear(true); io.disconnect(); } }, { rootMargin: "600px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!near) return undefined;
    setSt("loading");
    const t = setTimeout(() => setSt((s) => (s === "loading" ? "failed" : s)), 15000);
    return () => clearTimeout(t);
  }, [near]);
  // Figma fetches the file after its load event (a white page with a blue bar); hold the still over that.
  // Without a client-id the embed sends no paint event, so this is a timed hold.
  const onLoad = () => setTimeout(() => setSt((s) => (s === "failed" ? s : "ready")), 2500);
  return (
    <div ref={root} className={"fembed " + className} data-st={still ? "still" : st} data-floor={floor} style={aspect ? { aspectRatio: aspect } : undefined}>
      {near && (
        <iframe key={run} className="fembed__frame" src={figmaEmbedSrc({ file, node, start, mode })} title={title} loading="lazy" allowFullScreen onLoad={onLoad} />
      )}
      {children ? <div className="fembed__floor" aria-hidden="true">{children}</div> : fallback
        ? <img className="fembed__floor" src={fallback} alt={alt} loading="lazy" draggable="false" />
        : <span className="fembed__floor fembed__floor--blank" aria-hidden="true" />}
      {restart && near && (
        <button type="button" className="theme-toggle dev-glass fembed__restart" aria-label="Restart the prototype" title="Restart" onClick={() => setRun((n) => n + 1)}>
          <Refresh width={15} height={15} strokeWidth={2} aria-hidden />
        </button>
      )}
      {badge && near && st === "loading" && <span className="fembed__badge" role="status" aria-label="Loading from Figma"><i /><i /><i /></span>}
      {still && openLink && (
        <a className="dev-glass fembed__open" href={figmaOpenUrl({ file, node, start, mode })} target="_blank" rel="noopener noreferrer"
          aria-label={`Open in Figma${title ? `: ${title}` : ""} (opens a new tab)`}>
          Open in Figma <OpenNewWindow width={13} height={13} strokeWidth={2} aria-hidden />
        </a>
      )}
    </div>
  );
}
