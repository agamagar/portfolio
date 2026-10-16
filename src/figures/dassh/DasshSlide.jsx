import { useEffect, useRef, useState } from "react";
import "./dasshSlide.css";

// The Dash slide, rebuilt in code: live text on the left, two image slots on the right (a larger
// one with a smaller one overlapping it). No branding. Swap the two images in SLOTS. Authored
// on a 2000 x 1125 stage and scaled as one 16:9 unit to the width of its box.
const W = 2000, H = 1125;

const SECTIONS = [
  { h: "Find", b: "AI-powered universal search", t: " helps teams find content quickly, saving time for more valuable work. New advanced search features now include ability to search for image, video, and audio files." },
  { h: "Secure", b: "Protect and Control", t: " content governance tools enable teams to manage access permissions and prevent unauthorized sharing across all platforms in seconds." },
  { h: "Create", b: "Suite of AI writing tools", t: " enables users to query content and generate actionable summaries. Dash writing tools draft emails, briefs, proposals, and reports using content from strategy docs, budgets, and more—eliminating hours of manual compiling." },
  { h: "Organize & Share", b: "Stacks are shareable content", t: " collections that can include files, apps, links, and more. They simplify organizing and sharing to improve team alignment, with detailed permissions for secure internal and external access." },
];

// The slots hold crops of the reference slide (neutral: no logos). Replace the srcs to swap.
const SLOTS = {
  large: { src: "/figures/dassh/slot-large.webp", alt: "Search results for “Marketing Plan”, with filters for app, type, date and people." },
  small: { src: "/figures/dassh/slot-small.webp", alt: "An answers panel responding to a question about marketing milestones." },
};

export default function DasshSlide() {
  const box = useRef(null);
  const [s, setS] = useState(0.5);
  useEffect(() => {
    const el = box.current; if (!el) return;
    const fit = () => setS(el.clientWidth / W);
    fit();
    const ro = new ResizeObserver(fit); ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div className="ds" ref={box} style={{ height: H * s }}>
      <div className="ds__stage" style={{ transform: `scale(${s})` }}>
        <div className="ds__left">
          <h3 className="ds__h">Unlock the power of your data</h3>
          <p className="ds__intro">Centralize company data and enable teams to work smarter, faster, and more securely. Dash combines AI-powered search, organization, and content control to save time and boost efficiency.</p>
          <div className="ds__secs">
            {SECTIONS.map((x) => (
              <div key={x.h} className="ds__sec"><h4>{x.h}</h4><p><b>{x.b}</b>{x.t}</p></div>
            ))}
          </div>
        </div>
        <div className="ds__right">
          <img className="ds__slot ds__slot--large" src={SLOTS.large.src} alt={SLOTS.large.alt} draggable="false" />
          <img className="ds__slot ds__slot--small" src={SLOTS.small.src} alt={SLOTS.small.alt} draggable="false" />
        </div>
      </div>
    </div>
  );
}
