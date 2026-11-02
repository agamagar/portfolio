import { useContext, useEffect, useRef, useState } from "react";
import { OpenNewWindow, Refresh } from "iconoir-react";
import { PhoneLinkSlot } from "../figures/ds/phoneLinkSlot";
import { embedUrl, getEmbed, loadSynced, useSiteTheme } from "../figures/sdStory/playgroundBase";
import { imgSrc } from "./Img"; // the floor still's WebP copy, where one exists
import "../figures/ds/phoneFrame.css"; // .fshot-pill, for a bare embed's own Open in Figma
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
// restart   a round glass Restart that reloads the iframe to its first frame (default: on for prototypes). Inside a
//           PhoneFrame it sits right-aligned in the link row under the phone (PhoneLinkSlot; Agam, 25 Oct: "the glass
//           reload button should not be inside the phone frame"); a bare embed keeps it at its own bottom right
// badge     the loading dots over the floor (off where the floor is itself moving)
// phoneStill  on a phone (PHONE_STILL) the iframe never mounts: the floor stays, with an "Open in Figma" link to the
//           same frame or prototype (critique 18.2, 25 Oct: the live embed is heavy, slow and pinch-zooms inside the
//           page). Desktop keeps it live. On by default; false keeps the embed live everywhere. Inside a PhoneFrame the
//           link goes in the frame's link row under the phone (PhoneLinkSlot), so it covers none of the screen; a bare
//           embed draws a compact pill in its own top-right corner instead.
// openLink  the phone's "Open in Figma" link; false where the embed already sits inside a link (the homepage card)
// playground  a built flow from the design playground (its embedCatalog id, e.g. "flow-returns-cs-chat-return"), in place
//           of the Figma file (Agam, 26 Oct: "use all the developed flows instead of figma prototype"); caseId opens it on
//           a case. Everything else is the same: the floor, the phone-still rule, Restart and the link row, whose link
//           reads "Open full size". The playground pads its 360px screen by 16px; that is cropped and the screen scaled
//           to the box. When the bundle isn't deployed (Q21), the iframe never mounts and there is no link: the still stays.
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

export default function FigmaEmbed({ node, start, mode = "design", file, title, fallback, alt = "", floor = "cover", aspect, badge = true, restart = mode === "proto", phoneStill = true, openLink = true, className = "", children , playground, caseId}) {
  const root = useRef(null);
  const pg = playground ? getEmbed(playground) : null;
  const still = usePhoneStill() && phoneStill && !pg; // a coded screen runs live at every width
  const [near0, setNear] = useState(false);
  const [bundle, setBundle] = useState(pg ? undefined : true); // a playground flow waits for the deployed bundle
  useEffect(() => { if (!pg) return undefined; let live = true; loadSynced().then((j) => live && setBundle(j)); return () => { live = false; }; }, [pg]);
  const near = near0 && !still && !!bundle; // the iframe mounts only near the viewport, never as a phone still
  const slot = useContext(PhoneLinkSlot);
  const dark = useSiteTheme() === "dark";
  const href = !still || !openLink ? null : pg ? (bundle ? embedUrl(pg, { case: caseId, theme: dark ? "dark" : "light" }) : null) : figmaOpenUrl({ file, node, start, mode });
  const label = pg ? "Open full size" : "Open in Figma";
  const canRestart = (restart || !!pg) && near;
  useEffect(() => {
    if (!slot) return undefined;
    slot(href || canRestart ? { figma: href, label, restart: canRestart ? () => setRun((n) => n + 1) : undefined } : null);
    return () => slot(null);
  }, [slot, href, label, canRestart]);
  // a playground screen is 360px wide inside 16px of padding: scale it to the box and crop the padding
  const [k, setK] = useState(0);
  const [vh, setVh] = useState(0); // the box's height in playground px: the iframe is exactly the visible screen, so its bottom bar lands inside the bezel
  useEffect(() => {
    const el = root.current;
    if (!pg || !el || typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(([en]) => { const s = en.contentRect.width / 360; setK(s); setVh(s ? en.contentRect.height / s : 0); });
    ro.observe(el);
    return () => ro.disconnect();
  }, [pg]);
  const [st, setSt] = useState("idle"); // idle | loading | ready | failed
  const [run, setRun] = useState(0); // bumped by Restart: a fresh iframe starts the prototype at its first frame
  useEffect(() => {
    const el = root.current;
    if (!el || typeof IntersectionObserver === "undefined") { setNear(true); return undefined; }
    // mount within 600px, unmount past one and a half screens (2 Nov: kept-alive iframes piled up to 48 live
    // playground apps on the page's own thread after one scroll-through, and the page froze at the bottom)
    const on = new IntersectionObserver(([e]) => { if (e.isIntersecting) setNear(true); }, { rootMargin: "600px 0px" });
    const off = new IntersectionObserver(([e]) => { if (!e.isIntersecting) setNear(false); }, { rootMargin: "150% 0px" });
    on.observe(el); off.observe(el);
    return () => { on.disconnect(); off.disconnect(); };
  }, []);
  useEffect(() => {
    if (!near) { setSt("idle"); return undefined; } // the still shows again while the iframe is away
    setSt("loading");
    const t = setTimeout(() => setSt((s) => (s === "loading" ? "failed" : s)), 15000);
    return () => clearTimeout(t);
  }, [near]);
  // Figma fetches the file after its load event (a white page with a blue bar); hold the still over that.
  // Without a client-id the embed sends no paint event, so this is a timed hold.
  const onLoad = () => setTimeout(() => setSt((s) => (s === "failed" ? s : "ready")), pg ? 300 : 2500); // the playground paints at load
  return (
    <div ref={root} className={"fembed " + className} data-st={still ? "still" : st} data-floor={floor} style={aspect ? { aspectRatio: aspect } : undefined}>
      {near && (
        pg ? (
          <iframe key={run} className="fembed__frame fembed__frame--pg" title={title || pg.title} loading="lazy" onLoad={onLoad}
            src={embedUrl(pg, { case: caseId, theme: dark ? "dark" : "light", bg: "transparent", motion: typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "reduce" : undefined })}
            style={{ width: pg.size.w, height: vh ? vh + 16 : pg.size.h, transform: `scale(${k}) translate(-16px, -16px)`, visibility: k ? "visible" : "hidden" }} />
        ) : (
          <iframe key={run} className="fembed__frame" src={figmaEmbedSrc({ file, node, start, mode })} title={title} loading="lazy" allowFullScreen onLoad={onLoad} />
        )
      )}
      {children ? <div className="fembed__floor" aria-hidden="true">{children}</div> : fallback
        ? <img className="fembed__floor" src={imgSrc(fallback)} alt={alt} loading="lazy" draggable="false" />
        : <span className="fembed__floor fembed__floor--blank" aria-hidden="true" />}
      {canRestart && !slot && (
        <button type="button" className="theme-toggle dev-glass fembed__restart" aria-label="Restart the prototype" title="Restart" onClick={() => setRun((n) => n + 1)}>
          <Refresh width={15} height={15} strokeWidth={2} aria-hidden />
        </button>
      )}
      {badge && near && st === "loading" && <span className="fembed__badge" role="status" aria-label={pg ? "Loading the prototype" : "Loading from Figma"}><i /><i /><i /></span>}
      {href && !slot && (
        <a className="fshot-pill fshot-pill--link fembed__open" href={href} target="_blank" rel="noopener noreferrer"
          aria-label={`${label}${title ? `: ${title}` : ""} (opens a new tab)`}>
          {label} <OpenNewWindow width={12} height={12} strokeWidth={2} aria-hidden />
        </a>
      )}
    </div>
  );
}
