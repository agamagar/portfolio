import { useEffect, useRef, useState } from "react";
import "./dasshSlide.css";

// The Dropbox Dash slide, rebuilt as live HTML/SVG (public/figures/dassh/dassh-frame.webp is
// the reference). Authored on a 2000 x 1125 stage and scaled as one 16:9 unit to the width of
// its box, so text stays crisp at every size. Static; the cursor only nudges on hover.
const W = 2000, H = 1125;

const I = (p) => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{p}</svg>
);
const Chev = I(<path d="M6 9l6 6 6-6" />);

const SECTIONS = [
  { h: "Find", b: "AI-powered universal search", t: " helps teams find content quickly, saving time for more valuable work. New advanced search features now include ability to search for image, video, and audio files." },
  { h: "Secure", b: "Protect and Control", t: " content governance tools enable teams to manage access permissions and prevent unauthorized sharing across all platforms in seconds." },
  { h: "Create", b: "Suite of AI writing tools", t: " enables users to query content and generate actionable summaries. Dash writing tools draft emails, briefs, proposals, and reports using content from strategy docs, budgets, and more—eliminating hours of manual compiling." },
  { h: "Organize & Share", b: "Stacks are shareable content", t: " collections that can include files, apps, links, and more. They simplify organizing and sharing to improve team alignment, with detailed permissions for secure internal and external access." },
];

const RESULTS = [
  { icon: "doc", title: "Q3 Marketing Plan", meta: "Updated 3h ago", by: "Beth Russett", body: "This planning document outlines the full approved scope of initiatives. Please contact Beth Russett for access." },
  { icon: "sheet", title: "Marketing Expansion Planning", meta: "Updated 4h ago", by: "Diaz Martino", body: <>Strategically enter new geographic markets and enhance brand visibility through targeted <b>H2 marketing</b> campaigns and partnerships.</> },
  { icon: "play", title: "Marketing Demo", meta: "Updated 1d ago", by: "Carry Newman", body: <><b>Marketing</b> the innovative features, cutting-edge technology</> },
];

function FileIcon({ kind }) {
  return (
    <span className="ds__file">
      {kind === "doc" && <svg viewBox="0 0 24 24" width="30" height="30"><rect x="4" y="2" width="16" height="20" rx="3" fill="#4a85e8" /><path d="M8 8h8M8 12h8M8 16h5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" /></svg>}
      {kind === "sheet" && <svg viewBox="0 0 24 24" width="30" height="30"><rect x="4" y="2" width="16" height="20" rx="3" fill="#1fa463" /><path d="M12 7v10M7 12h10" stroke="#fff" strokeWidth="2" strokeLinecap="round" /></svg>}
      {kind === "play" && <svg viewBox="0 0 24 24" width="30" height="30"><path d="M8 5l11 7-11 7z" fill="#3a3635" /></svg>}
      <i className="ds__badge" data-k={kind} />
    </span>
  );
}

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
    <div className="ds" ref={box} style={{ height: H * s }} role="img" aria-label="A Dropbox Dash product slide: Unlock the power of your data. Find, Secure, Create, Organize and Share, beside a search for Marketing Plan with an Answers panel.">
      <div className="ds__stage" style={{ transform: `scale(${s})` }} aria-hidden>
        <div className="ds__left">
          <div className="ds__top">
            <span className="ds__logo"><svg viewBox="0 0 24 24" width="38" height="38" fill="#fff"><path d="M7 3l5 3.3L7 9.6 2 6.3zM17 3l5 3.3-5 3.3-5-3.3zM2 12.9L7 9.6l5 3.3L7 16.2zM12 12.9l5-3.3 5 3.3-5 3.3zM7 17.4l5-3.3 5 3.3L12 20.7z" /></svg></span>
            <span className="ds__crumb"><i>Business Overview</i>Dropbox Tomorrow</span>
          </div>
          <div className="ds__lockup">
            <svg viewBox="0 0 24 24" width="40" height="40" aria-hidden><path d="M12 3l9 4-9 4-9-4z" fill="#1e1919" /><path d="M3 12l9 4 9-4" fill="none" stroke="#0061fe" strokeWidth="2.6" strokeLinecap="round" /></svg>
            <span><b>Dropbox</b> <em>Dash</em></span>
          </div>
          <h3 className="ds__h">Unlock the power of your data</h3>
          <p className="ds__intro">Centralize company data and enable teams to work smarter, faster, and more securely. Dash combines AI-powered search, organization, and content control to save time and boost efficiency.</p>
          <div className="ds__secs">
            {SECTIONS.map((x) => (
              <div key={x.h} className="ds__sec"><h4>{x.h}</h4><p><b>{x.b}</b>{x.t}</p></div>
            ))}
          </div>
        </div>
        <div className="ds__right">
          <div className="ds__card">
            <div className="ds__rail">
              <svg viewBox="0 0 24 24" width="30" height="30" fill="#0061fe"><path d="M7 3l5 3.3L7 9.6 2 6.3zM17 3l5 3.3-5 3.3-5-3.3zM2 12.9L7 9.6l5 3.3L7 16.2zM12 12.9l5-3.3 5 3.3-5 3.3zM7 17.4l5-3.3 5 3.3L12 20.7z" /></svg>
              {I(<path d="M3 11l9-8 9 8v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z" />)}
              {I(<><path d="M12 3l9 5-9 5-9-5z" /><path d="M3 13l9 5 9-5" /></>)}
              <span className="ds__plus">+</span>
              <hr />
              <i className="ds__app" style={{ background: "#f2b8a0" }} />
              <i className="ds__app" style={{ background: "#0e7c86" }} />
              <i className="ds__app" style={{ background: "#8a3b12" }}>M</i>
              <i className="ds__app" style={{ background: "#fde2e8", color: "#c2185b" }}>N</i>
              <span className="ds__grid">{I(<><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><path d="M17 14v6M14 17h6" /></>)}</span>
              <i className="ds__me" />
            </div>
            <div className="ds__main">
              <div className="ds__search">{I(<><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4 4" /></>)}<span>Marketing Plan</span>{I(<path d="M6 6l12 12M18 6L6 18" />)}</div>
              <div className="ds__chips">
                <span>{I(<><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /></>)}App{Chev}</span>
                <span>{I(<path d="M6 3h8l4 4v14H6z" />)}Type{Chev}</span>
                <span>{I(<><circle cx="12" cy="12" r="8" /><path d="M12 8v4l3 2" /></>)}Updated{Chev}</span>
                <span>{I(<><circle cx="9" cy="9" r="3" /><path d="M3 20c0-3.5 3-5.5 6-5.5s6 2 6 5.5M16 6a3 3 0 010 6M18 15c2 .6 3 2.4 3 5" /></>)}People{Chev}</span>
              </div>
              <div className="ds__results">
                {RESULTS.map((r) => (
                  <div key={r.title} className="ds__res">
                    <FileIcon kind={r.icon} />
                    <div>
                      <h5>{r.title}</h5>
                      <div className="ds__meta">{r.meta}<i /> <span className="ds__av" />Created by <u>{r.by}</u></div>
                      <p>{r.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="ds__ans">
            <div className="ds__ans-h">Answers <em>Beta</em></div>
            <div className="ds__q"><span>What are key milestones for our company’s marketing strategy?</span><em>Verified</em>{I(<path d="M6 15l6-6 6 6" />)}</div>
            <p className="ds__a">Our key milestones include launching a brand refresh by February, followed by a product awareness campaign in April. We’ll focus on customer engagement with personalized content by July, and in October, we’ll push for market expansion with localized campaigns and strategic partnerships.</p>
            <span className="ds__src"><svg viewBox="0 0 24 24" width="20" height="20" fill="#0061fe"><path d="M7 3l5 3.3L7 9.6 2 6.3zM17 3l5 3.3-5 3.3-5-3.3zM7 17.4l5-3.3 5 3.3L12 20.7z" /></svg><u>H2 Marketing Plan (2024)</u></span>
            <div className="ds__help"><span>Was this helpful?</span><div>{I(<path d="M7 11v9H4v-9zM7 11l4-8c1.5 0 2.5 1.2 2 2.8L12.5 9H19a2 2 0 011.9 2.6l-2 7A2 2 0 0117 20H7" />)}{I(<path d="M7 13V4H4v9zM7 13l4 8c1.5 0 2.5-1.2 2-2.8L12.5 15H19a2 2 0 001.9-2.6l-2-7A2 2 0 0017 4H7" />)}<b />{I(<><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V5a1 1 0 00-1-1H5a1 1 0 00-1 1v10a1 1 0 001 1h3" /></>)}{I(<><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8v.01" /></>)}</div></div>
            <div className="ds__q ds__q--c"><span>What are upcoming deliverables for digital marketing campaigns?</span>{Chev}</div>
            <div className="ds__q ds__q--c"><span>Who is leading marketing planning?</span>{Chev}</div>
            <svg className="ds__cursor" viewBox="0 0 24 34" width="52" height="74"><path d="M2 1v26l7-6.5 4.8 11 4-1.8-4.7-10.7H22z" fill="#111" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" /></svg>
          </div>
        </div>
        <span className="ds__num">24</span>
      </div>
    </div>
  );
}
