import PhoneFrame from "../ds/IphoneFrame";
import "./schedExplored.css";

// 25 Oct (Agam, "show more of what was explored and the decisions that were made"): one comparison per decision,
// placed where that decision happens in the story. A row of the shared PhoneFrame with a status chip and one line
// each, then the verdict with a bold lead. Stills are 1x exports of the Flow frames in Claude: Schedule
// (R04cmbzFPQk2Q4IockGwqZ, `node` below), the playground rebuilds of the Zepto boards. Every claim is sourced in
// docs/sd-smart-toggle-facts.md (part 2); the lines marked [Q n] wait on Agam's answer to question n there.
//   <SchedExplored k="toggle" />
const S = (n) => `/figures/scheduled/explored/${n}.webp`;
const TONE = { Picked: "shipped", Shipped: "shipped", Dropped: "rejected" }; // anything else uses the chip's neutral ink

export const EXPLORED = {
  toggle: {
    title: "Three toggles, one kept",
    lead: "Two cards per shipment won.",
    note: "UT 01, 02 and 03 went in front of three people on Oct 29. The final page kept UT 01's pair of cards, and UT 03's best idea moved onto the collapsed card.", // [Q 8] the reason
    items: [
      { src: S("ut01"), node: "125:11802", tag: "Picked", cap: "UT 01: Instant and Schedule as two cards in each shipment", alt: "UT 01: shipment 1 of 3 open with Instant and Schedule Delivery cards, day tabs and slots; shipments 2 and 3 collapsed as Scheduled and Unserviceable" },
      { src: S("ut02"), node: "125:12967", tag: "Dropped", cap: "UT 02: Remove Items as a third option. Remove moved to the shipment header", alt: "UT 02: Instant Delivery, Schedule Delivery and Remove Items as three radio options in one shipment" }, // [Q 8] why
      { src: S("ut03"), node: "125:13448", tag: "Dropped", cap: "UT 03: one pill per shipment carrying its state, here the slot", alt: "UT 03: four collapsed shipments, each a pill: 9 mins, Aug 18 5-6 AM, Unserviceable, Removed" }, // [Q 8] why
    ],
  },
  instantOff: {
    title: "Saying Instant is off",
    lead: "Grey the card, say why, offer later.",
    note: "M4 greys Instant, marks it Unavailable and adds a callout you can dismiss.", // [Q 10, 11] the wording that ships, and why it won
    items: [
      { src: S("off-m4"), node: "84:169", tag: "Picked", cap: "M4: a greyed Instant card and a callout you can dismiss", alt: "M4 schedule page: callout 'Unavailable due to demand, schedule for later' above a greyed Instant card marked Unavailable" },
      { src: S("off-backsoon"), node: "113:5468", tag: "Explored", cap: "A 'Back soon' chip on Instant", alt: "Instant Delivery card captioned Back soon beside Schedule Delivery" },
      { src: S("off-tag"), node: "113:5731", tag: "Explored", cap: "A 'Temporarily UNAVAILABLE' tag above the choice", alt: "A Temporarily UNAVAILABLE strip above the Instant and Schedule cards" },
      { src: S("off-gotyou"), node: "113:5997", tag: "Superseded", cap: "The 'We got you!' callout, replaced by the Nov 21 line", alt: "Callout: We got you! Instant delivery is temporarily unavailable. Schedule for later." },
      { src: S("off-updown"), node: "113:6488", tag: "Explored", cap: "An up and down toggle, the slot list open below", alt: "Instant row on top marked Back soon, Schedule Delivery row below with its slot list open" },
      { src: S("off-nowlater"), node: "113:7012", tag: "Explored", cap: "New words: 'Get it now' and 'Get it later'", alt: "Cards labelled Get it now and Get it later" },
    ],
  },
  collapsedSlot: {
    title: "The slot you picked",
    lead: "The collapsed card says it's scheduled.",
    note: "A tester said it plainly: \"I might forget the time slot selected for shipment 1.\" Five wordings put the slot on the closed card. In the design, every closed shipment says it's scheduled.", // [Q 12] slot in the pill, and which wording (88.2: v4 Figma and RN show only "Scheduled")
    items: [
      { src: S("slot-a"), node: "91:3321", tag: "Explored", cap: "\"This shipment will be delivered Today, 5 - 6 AM\"", alt: "Collapsed shipment 1 of 3 with the line: This shipment will be delivered Today, 5 - 6 AM" },
      { src: S("slot-b"), node: "91:4384", tag: "Explored", cap: "\"Delivering Today morning, 5 - 6 AM\"", alt: "Collapsed shipment with the line: Delivering Today morning, 5 - 6 AM" },
      { src: S("slot-c"), node: "91:5068", tag: "Explored", cap: "\"Delivering Today, 5 - 6 AM\", with \"Select a slot\"", alt: "Collapsed shipments: Delivering Today, 5 - 6 AM, and Select a slot" },
      { src: S("slot-d"), node: "91:5950", tag: "Explored", cap: "The slot in place of the pill", alt: "Collapsed shipment whose pill reads Delivering Today, 5 - 6 AM" },
      { src: S("slot-e"), node: "91:6645", tag: "Explored", cap: "The slot divide: \"Delivering Tomorrow Morning, 5 - 6 AM\"", alt: "A Delivering Tomorrow Morning, 5 - 6 AM divider above the shipment" },
    ],
  },
  gtm: {
    title: "Introducing it, quietly",
    lead: "Two touches shipped. The rest stayed in the file.",
    note: "The banner on the schedule page and a tooltip on the Schedule button made it out. A cart banner, an intro animation and a first-run coach-mark were designed and did not ship.", // [Q 14] why
    items: [
      { src: S("gtm-coach62"), node: "118:9438", tag: "Not shipped", cap: "A coach-mark in the cart: \"Orders can now be scheduled\"", alt: "Cart with a dark coach-mark on the Schedule button: Orders can now be scheduled" },
      { src: S("gtm-coach66"), node: "118:9629", tag: "Not shipped", cap: "\"Plan your deliveries for later\"", alt: "Cart coach-mark: Orders can also be scheduled, Plan your deliveries for later" },
      { src: S("gtm-coach61"), node: "118:9270", tag: "Not shipped", cap: "\"Schedule for later, earliest delivery in 45 mins\"", alt: "Cart header: Schedule for later, Earliest delivery in 45 mins, with a Schedule button" },
      { src: S("gtm-banner-later"), node: "115:7028", tag: "Explored", cap: "Banner copy: \"Introducing Schedule for Later\"", alt: "Schedule page with a large Introducing Schedule for Later banner" },
      { src: S("gtm-trust"), node: "115:7727", tag: "Explored", cap: "A trust line: \"No extra charges on schedule orders\"", alt: "Schedule page with a thin No extra charges on schedule orders strip" },
    ],
  },
};

export default function SchedExplored({ k }) {
  const d = EXPLORED[k];
  if (!d) return null;
  return (
    <figure className="sxp">
      <div className="sxp__plate">
        <p className="sxp__title">{d.title}</p>
        <ul className="sxp__row" data-n={d.items.length} tabIndex={0} aria-label={`${d.title}: what was explored`}>
          {d.items.map((it) => (
            <li key={it.src} className="sxp__item">
              <PhoneFrame screen={it.src} alt={it.alt} size="md" tag={it.tag} tagTone={TONE[it.tag]} caption={it.cap} interactive={false} enter={false} shadow="sm" />
            </li>
          ))}
        </ul>
      </div>
      <figcaption className="sxp__verdict"><b>{d.lead}</b> {d.note}</figcaption>
    </figure>
  );
}
