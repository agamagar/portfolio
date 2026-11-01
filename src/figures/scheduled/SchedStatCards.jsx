import { useRef } from "react";
import { Storefront, Scales, Clock } from "@phosphor-icons/react";
import StatCard from "../../ui/StatCard";
import { useRise } from "../../ui/useSectionPlay";
import "./scheduled.css";

// Impact, "At a glance" (Agam, 27 Oct): the heading and two short columns on the left and right, then three stat cards, after
// the impact reference. Every number, title and caption is the Impact section's own (its bullets and its glance heading);
// nothing is added. c: { head, cols: [two lines], cards: [{ tone, icon, title, value, unit, caption }] }.
const ICONS = { stores: Storefront, value: Scales, time: Clock };
export default function SchedStatCards({ c }) {
  const ref = useRef(null);
  useRise(ref, { lead: 100, step: 120 }); // the shared scroll reveal: each part fades up in turn
  return (
    <section className="stv" ref={ref} aria-label="Impact at a glance">
      <div className="stv__top">
        <h3 className="stv__head" data-rise>{c.head}</h3>
        {c.cols.map((t) => <p className="stv__col" key={t} data-rise>{t}</p>)}
      </div>
      <div className="stv__cards">
        {c.cards.map((k) => { const I = ICONS[k.icon]; return <StatCard key={k.title} data-rise tone={k.tone} icon={<I weight="regular" />} title={k.title} value={k.value} unit={k.unit} caption={k.caption} />; })}
      </div>
    </section>
  );
}
