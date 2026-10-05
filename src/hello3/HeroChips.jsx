// The four pill chips under the greeting (Figma 664:107083, pin mtr4oc96,
// 07 Sep 2026). Each is a 40px round chip that shows only its icon at rest and
// slides its label open on hover or focus. Two are links (Resume, LinkedIn) and
// two are the site's own controls (theme, sound), so the page's chrome sits
// beside the greeting instead of only in the top-right corner. The label names
// the CURRENT state ("Light mode", "Sound off"), matching the frame.
//
// Icons are Iconoir, the house set; the frame's icons were redrawn with the
// nearest Iconoir glyphs (SubmitDocument, OpenNewWindow, SunLight/HalfMoon,
// SoundOff/SoundHigh).
import { useEffect, useState } from "react";
// ONE LIBRARY, ONE WEIGHT (pin mtrxil1s, "use a library which has all these
// icons", after mtrxdqwl asked for consistency across fill and stroke):
// Phosphor (weight "regular", the outline set, since mtrxm3o0 asked for stroke), which carries every glyph this row needs, the
// LinkedIn logo included. The inline page, sun, moon and LinkedIn marks that
// bridged the gap are gone; Iconoir stays the house set everywhere else.
import { FileText, LinkedinLogo, Moon, SpeakerHigh, SpeakerSlash, Sun } from "@phosphor-icons/react";
import { feedback } from "../ui/feedback";
import HelloLink from "./HelloLink";
import { LINKS } from "./helloData";

const ICON = { size: 16, weight: "regular", "aria-hidden": true }; // mtrxm3o0: stroke, not fill. mttivibg then mttix8zw: bold (24/256) was too much and regular (16/256) too little, and Phosphor has nothing between, so the regular glyphs carry a 4-unit CSS stroke in hello3.css: about 20/256, halfway, with round joins

function ChipBody({ icon, label }) {
  return (
    <span className="hello-chip__body">
      <span className="hello-chip__icon">{icon}</span>
      <span className="hello-chip__label">{label}</span>
    </span>
  );
}

// TWO PLACEMENTS (07 Sep 2026). "hero": under the greeting, Resume and
// LinkedIn only, both held open (mtr65dxo, mtr65jja; the controls hidden per
// mtr65nhq, mtr65qfi). "top": all four as circular hover buttons in App's
// fixed top-right controls row, replacing the bare sound and theme toggles
// there (mtr6f8xm "make all 4 circular hover button here"). The hero
// placement is unmounted since mtr6evtb ("hide these from here") but kept so
// the row can come back with one line.
export default function HeroChips({ placement = "hero", onNavigate, theme, onToggleTheme, sound, onToggleSound }) {
  const isDark = theme === "dark";
  const top = placement === "top";
  const [resume, linkedin] = LINKS;
  // mtr7vwf7: in the top placement the chips lift out of the way once the page
  // has scrolled, one after another (the stagger is CSS, keyed on --i), and
  // come back the same way at the top. 48px is past the first nudge of a
  // wheel, so a resting page never flickers them.
  // mtr89zat: DIRECTION, not position. Scrolling down past 48px lifts them
  // out; any scroll back up brings them in again, wherever on the page you
  // are. A 4px dead band so trackpad jitter cannot flicker them.
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    if (!top) return undefined;
    let last = window.scrollY;
    const read = () => {
      const y = window.scrollY;
      if (y <= 48) setScrolled(false);
      else if (y > last + 4) setScrolled(true);
      else if (y < last - 4) setScrolled(false);
      last = y;
    };
    read();
    window.addEventListener("scroll", read, { passive: true });
    return () => window.removeEventListener("scroll", read);
  }, [top]);
  const open = top ? "" : " hello-chip--open";
  // mtry6mjo: in the top row the name is a TOOLTIP under the button (the
  // site's delegated [data-tip] bubble, which reads the aria-label and sits
  // below anything this close to the top edge), not a label sliding open.
  // mttkm95v: resume and linkedin show their label again, so only the two
  // state chips carry a tooltip (set inline below).
  // eslint-disable-next-line no-unused-vars
  const tip = top ? { "data-tip": true } : {};
  return (
    <nav className={"hello-chips" + (top ? " hello-chips--top" : " hello-hero__links")} data-scrolled={top && scrolled ? "true" : undefined} aria-label="Elsewhere">
{/* mtu56b6g (09 Sep 2026): Resume and LinkedIn are OUT of the top row. They
          are blue text links under the greeting again (Hello.jsx), where they read
          as an invitation rather than as two more controls; the top row keeps only
          the two things that change the page's state. */}
      {!top && (
        <>
          <HelloLink to={resume.href} blank onNavigate={onNavigate} className={"hello-chip hello-chip--resume" + open} style={{ "--i": 0 }} aria-label={resume.label}>
        <ChipBody icon={<FileText {...ICON} />} label={resume.label} />
      </HelloLink>
      <HelloLink to={linkedin.href} blank onNavigate={onNavigate} className={"hello-chip hello-chip--linkedin" + open} style={{ "--i": 1 }} aria-label={linkedin.label}>
        <ChipBody icon={<LinkedinLogo {...ICON} />} label={linkedin.label} />
      </HelloLink>
        </>
      )}
      {top && onToggleTheme && (
        <button
          type="button"
          className="hello-chip hello-chip--theme"
          style={{ "--i": 2 }}
          aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
          data-tip={isDark ? "Dark mode" : "Light mode"}
          aria-pressed={isDark}
          onClick={(e) => {
            feedback("toggle");
            onToggleTheme(e);
          }}
        >
          <ChipBody icon={isDark ? <Moon {...ICON} /> : <Sun {...ICON} />} label={isDark ? "Dark mode" : "Light mode"} />
        </button>
      )}
      {top && onToggleSound && (
        <button
          type="button"
          className="hello-chip hello-chip--sound"
          style={{ "--i": 3 }}
          aria-label={sound ? "Mute sound" : "Unmute sound"}
          data-tip={sound ? "Sound on" : "Sound off"}
          aria-pressed={!!sound}
          onClick={() => {
            // flip first, then fire: see SoundToggle in App.jsx for why
            onToggleSound();
            feedback("toggle");
          }}
        >
          <ChipBody icon={sound ? <SpeakerHigh {...ICON} /> : <SpeakerSlash {...ICON} />} label={sound ? "Sound on" : "Sound off"} />
        </button>
      )}
    </nav>
  );
}
