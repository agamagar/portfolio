import "./scheduled.css";

// mukx7ffq (28 Sep): "just like the analytics combined, this section and the
// below into a story we can tell to the reviewers". What users told us and
// Returns & refunds, told as one plot in the SchedMetricStory layout: we asked,
// it was a fallback, the trust fear said out loud, the hour was still too wide,
// the tickets that came before the slot, what we changed, then the same slots
// run backwards for returns.
//
// HONESTY: every figure and quote below is lifted from the two sections'
// existing copy (App.jsx, the parked `p` / `ul` / `chart`), never new. The
// returns beats carry no outcome number because the case never had one; the
// section's own [Confirm] notes (bot framing, what it replaced, outcomes) are
// still open.

const Stat = ({ value, label, note }) => (
  <div className="rsty__stat">
    <p className="rsty__stat-v">{value}</p>
    <p className="rsty__stat-l">{label}</p>
    {note && <p className="rsty__stat-n">{note}</p>}
  </div>
);
const Quote = ({ children }) => <blockquote className="rsty__quote">"{children}"</blockquote>;
const Steps = ({ items }) => (
  <ol className="rsty__steps">
    {items.map(([t, d]) => (
      <li key={t}><p className="rsty__step-t">{t}</p><p className="rsty__step-d">{d}</p></li>
    ))}
  </ol>
);

const ACTS = [
  {
    act: "Act 1 · We went and asked",
    beats: [
      {
        claim: "After launch, we went looking for where it was thinnest.",
        body: "Behavioural frames from several thousand users, 45 moderated phone interviews across twelve cities, and a read of the support tickets the feature threw off. The point was not to confirm we were right.",
        visual: (
          <div className="rsty__stats">
            <Stat value="45" label="moderated interviews" />
            <Stat value="12" label="cities" />
            <Stat value="1000s" label="behavioural frames" />
          </div>
        ),
      },
    ],
  },
  {
    act: "Act 2 · It was a fallback, not a plan",
    beats: [
      {
        claim: "Eight in ten scheduled because instant wasn't there.",
        body: "The planning segment we designed for is real, but it is smaller than the fallback an unserviceable cart creates. So scheduling is as much a graceful answer to \"we cannot serve you now\" as it is a planning tool.",
        visual: <Stat value="8 in 10" label="scheduled as a fallback, not a plan" note="instant was unavailable at that moment" />,
      },
      {
        claim: "When the plan did happen, it landed.",
        body: "The commuter ordering in the morning for the evening turned up almost word for word.",
        visual: <Quote>I was in back-to-back meetings and didn't want to forget to order later, so I was glad I could just schedule it</Quote>,
      },
    ],
  },
  {
    act: "Act 3 · The trust fear, said out loud",
    beats: [
      {
        claim: "Our hypothesis came back as a quote.",
        body: "We had argued for two years that adding \"later\" to a \"now\" platform was a trust problem. Users said it back, unprompted. One person, seeing the slots, wondered whether instant had gone away entirely.",
        visual: <Quote>Why would I schedule an order if Zepto has already made a habit to get it at the earliest?</Quote>,
      },
    ],
  },
  {
    act: "Act 4 · The hour was still too wide",
    beats: [
      {
        claim: "The top ask was finer slots.",
        body: "The one-hour window we had ground so hard to get right was still the most-named friction. People wanted fifteen or thirty minutes.",
        visual: <Quote>The ambiguity in a one-hour slot is there, I don't know if I will get it at the beginning of 7 or end of 8</Quote>,
      },
    ],
  },
  {
    act: "Act 5 · The tickets before the slot",
    beats: [
      {
        claim: "454 \"where is my order\" tickets, all on orders that were on time.",
        body: "About 366 users, and every ticket raised before the slot had even started. Fallback users who never registered they had booked the future. The worst clustered at midnight, where a twelve-to-one slot reads as AM or PM.",
        visual: <Quote>I ordered at night but it didn't come, I saw later it was delivering in the morning</Quote>,
      },
      {
        claim: "So we said the true thing one more time.",
        body: "That one was on us, and it went straight into design.",
        visual: (
          <Steps items={[
            ["\"Arriving today\"", "said explicitly on the cart"],
            ["Morning and evening sections", "instead of a raw clock, so midnight can't be misread"],
            ["The exact window, repeated", "in a notification after you book"],
          ]} />
        ),
      },
    ],
  },
  {
    act: "Act 6 · The same slots, run backwards",
    beats: [
      {
        claim: "Returns became a trip you could book yourself.",
        body: "Returns are where trust is quietly won or lost, and usually where you end up talking to support. With scheduling built, the reverse trip could be self-served on the very same one-hour slots.",
        visual: (
          <Steps items={[
            ["Pick the items", "with the refund total shown live"],
            ["Choose how the money comes back", "Zepto Cash the moment you confirm, or the original account in 3 to 5 working days"],
            ["Book the pickup", "on the same slot picker as delivery, fallback included"],
          ]} />
        ),
      },
    ],
  },
];

export default function SchedResearchStory() {
  let n = 0;
  return (
    <div className="rwf-run msty rsty">
      {ACTS.map((a) => a.beats.map((b, k) => {
        n += 1;
        return (
          <section className="rwf msty__beat" key={b.claim} aria-label={`${a.act}: ${b.claim}`}>
            <p className="rwf__tag">{k === 0 ? a.act : ""}</p>
            <div className="rwf__main">
              <span className="rwf__n msty__n" aria-hidden>{String(n).padStart(2, "0")}</span>
              <h3 className="rwf__title">{b.claim}</h3>
              <p className="rwf__lead msty__body">{b.body}</p>
              <div className="msty__chart">{b.visual}</div>
            </div>
          </section>
        );
      }))}
    </div>
  );
}
