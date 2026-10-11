// Whiteboards for the Scheduled Delivery case study (src/App.jsx, caseStudies["scheduled-delivery"]).
// Every line is the case study's own wording (or a close paraphrase of a sentence on the page), nothing new is
// claimed: if a section's copy changes, change its board to match. Plain data on purpose, because the trim and
// present cuts are JSON clones of the base case study. Placed with `whiteboardNext: SD_BOARDS.<key>` on the section.

export const SD_BOARDS = {
  // "The go-to-market": the three options the section weighs
  goToMarket: {
    alt: "A whiteboard weighing three ways to introduce scheduled delivery: pushing it everywhere, hiding it, or surfacing it only where it earns its place.",
    board: {
      layout: "columns",
      seed: "sd-gtm",
      title: "Introducing it: three options",
      columns: [
        { title: "Push it everywhere", mark: "cross", color: "red", items: ["Reads as clutter", "Quietly dilutes the instant promise"] },
        { title: "Hide it", mark: "cross", color: "red", items: ["No one finds it"] },
        {
          title: "Surface it where it earns its place",
          mark: "check",
          color: "green",
          items: [
            "A small animated banner at the top of the schedule page",
            "A prompt only when demand is high and the cart can't be served instant",
            "Motion introduces it, not a hard sell",
          ],
        },
      ],
      items: [{ type: "highlight", of: "h2", color: "orange" }],
    },
  },

  // "Different ways we explored how schedule could exist on the app": tabbed against single page, and what decided it
  directions: {
    alt: "A whiteboard comparing the tabbed flow with the single-page listing, and the sentence in testing that decided it.",
    board: {
      layout: "columns",
      seed: "sd-directions",
      title: "Tabbed or single page?",
      columns: [
        {
          title: "Tabbed",
          mark: "cross",
          color: "red",
          items: [
            "A tab per shipment",
            "Each tab holds its own instant or schedule choice and slot grid",
            "Simpler build, tidier on paper",
            "Shipment one's slot is out of view by shipment two",
          ],
        },
        {
          title: "Single page",
          mark: "check",
          color: "green",
          items: ["Every shipment on one page, switchable in place", "Every shipment and its chosen slot stay visible"],
        },
        {
          title: "What decided it",
          mark: "dot",
          color: "purple",
          items: [
            "One sentence in testing:",
            "\"I might forget the slots I picked for shipment one by the time I'm choosing the slot for shipment two.\"",
            "A summary you can see is itself a trust mechanism",
          ],
        },
      ],
    },
  },

  // "Reflection": what held, what I would revisit, and the question about 10-minute delivery
  reflection: {
    alt: "A whiteboard looking back: what held, what I would revisit, and whether the platform should drop 10-minute delivery.",
    board: {
      layout: "columns",
      seed: "sd-reflection",
      title: "Looking back",
      columns: [
        {
          title: "What held",
          mark: "check",
          color: "green",
          items: ["Restraint: show it only when it genuinely serves the user", "Never dilute the 10-minute promise"],
        },
        {
          title: "What I would revisit",
          mark: "dot",
          color: "orange",
          items: [
            "Shipped with one-hour slots. Finer-grained slots never came",
            "Only in-flow slot edits, no full post-order editing. Fuller editing came later",
            "Deliberate trade-offs to launch, not ideals",
          ],
        },
        {
          title: "Drop 10-minute delivery?",
          mark: "dot",
          color: "purple",
          items: [
            "I do not think so",
            "Instant is the moat. Without it, Zepto is just another scheduled marketplace",
            "But a real, high-value segment needs the opposite of instant",
          ],
        },
      ],
    },
  },
};
