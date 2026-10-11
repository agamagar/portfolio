// Example boards: used by the lab, and handy as copy-paste starting points for a spec.

export const PRESETS = {
  mindmap: {
    label: "Mind map",
    input: `Scheduled delivery
  Why people want it
    ! Plan the week once
    Slots sell out at peak
    Gifts need to land on a day
  Who it is for
    Busy parents
    Office pantry teams
    * Anyone hosting on Sunday
  How it could work
    Pick a slot at checkout
    Reserve stock early
    Remind me the night before
  What could go wrong
    x Not enough riders
    Late slot, cold items
    ? Will people trust it`,
    spec: (text) => ({ layout: "mindmap", outline: text, seed: "mind" }),
  },
  flow: {
    label: "Flow",
    input: JSON.stringify({
      title: "From cart to doorstep",
      steps: [
        { text: "Pick a delivery slot", note: "7 AM to 11 PM" },
        { text: "Reserve the items" },
        { text: "Pack and tag the order" },
        { text: "Rider is assigned", note: "30 min before" },
        { text: "Delivered on time", mark: "star" },
      ],
    }, null, 2),
    spec: (text) => ({ layout: "flow", ...JSON.parse(text), seed: "flow" }),
  },
  columns: {
    label: "Pros and cons",
    input: JSON.stringify({
      title: "Should we ship slots first?",
      columns: [
        { title: "Pros", items: ["Clear promise to the customer", "Smooths rider demand", "Easy to explain in one line", "Gives us a premium tier"] },
        { title: "Cons", items: ["More ops complexity", "Needs a capacity forecast", "Late slots can feel risky"] },
        { title: "Next steps", mark: "num", items: ["Prototype the slot picker", "Test with 20 shoppers", "Model rider capacity"] },
      ],
    }, null, 2),
    spec: (text) => ({ layout: "columns", ...JSON.parse(text), seed: "cols" }),
  },
  matrix: {
    label: "Impact and effort",
    input: JSON.stringify({
      title: "Where do we start?",
      x: { low: "easy", high: "hard" },
      y: { low: "small win", high: "big win" },
      quadrants: ["Do first", "Plan it", "Maybe", "Skip"],
      items: [
        { text: "Show slot on cart", x: 0.2, y: 0.78 },
        { text: "Reminders", x: 0.3, y: 0.42 },
        { text: "Rider capacity model", x: 0.82, y: 0.82 },
        { text: "Gift notes", x: 0.74, y: 0.22 },
        { text: "Recurring orders", x: 0.55, y: 0.6 },
      ],
    }, null, 2),
    spec: (text) => ({ layout: "matrix", ...JSON.parse(text), seed: "matrix" }),
  },
  timeline: {
    label: "Timeline",
    input: JSON.stringify({
      title: "The project so far",
      events: [
        { when: "June", text: "Research and interviews" },
        { when: "July", text: "First slot picker" },
        { when: "Aug", text: "Pilot in two cities" },
        { when: "Sept", text: "Rollout" },
        { when: "Oct", text: "Case study" },
      ],
    }, null, 2),
    spec: (text) => ({ layout: "timeline", ...JSON.parse(text), seed: "time" }),
  },
  stickies: {
    label: "Sticky clusters",
    input: JSON.stringify({
      title: "What we heard",
      groups: [
        { title: "Planning", notes: ["I want groceries on Sunday morning", "Order once for the week", "Plan around dinner guests"] },
        { title: "Trust", notes: ["Will it really come on time?", "What if I need to cancel?", "Tell me the night before"] },
        { title: "Gifting", notes: ["Birthday cake at 9 AM", "Surprise for mum"] },
        { title: "Speed", notes: ["Instant is great but not always needed", "Cheaper if I wait"] },
      ],
    }, null, 2),
    spec: (text) => ({ layout: "stickies", ...JSON.parse(text), seed: "sticky" }),
  },
  annotate: {
    label: "Annotate a screenshot",
    input: JSON.stringify({
      title: "Notes on the slot picker",
      image: { href: "/mockups/figma/schedule-delivery-screen.png", w: 1080, h: 2340 },
      notes: [
        { rect: [0.03, 0.148, 0.93, 0.136], text: "Teach the feature before asking for a choice", kind: "box", color: "purple", side: "left" },
        { rect: [0.5, 0.395, 0.43, 0.06], text: "Pre-selected: schedule is the default, instant is one tap away", kind: "box", color: "orange", side: "right" },
        { rect: [0.078, 0.57, 0.84, 0.105], text: "Slots grouped by time of day, never a long list", kind: "highlight", color: "blue", side: "left" },
        { rect: [0.03, 0.862, 0.93, 0.046], text: "Cancel policy sits right at the moment of commitment", kind: "underline", color: "green", side: "left" },
        { rect: [0.03, 0.923, 0.93, 0.06], text: "One loud action. Thumb reach.", kind: "box", color: "red", side: "right" },
        { at: [0.2, 0.11], text: "5 shipments, one order", kind: "circle", color: "teal", side: "right" },
      ],
    }, null, 2),
    spec: (text) => ({ layout: "annotate", ...JSON.parse(text), seed: "annot" }),
  },
  raw: {
    label: "Raw primitives",
    input: JSON.stringify({
      items: [
        { type: "text", text: "Brainstorm", at: [90, 70], size: "xl", color: "black", id: "t" },
        { type: "underline", of: "t", color: "teal", style: "double" },
        { type: "bulb", at: [860, 120], s: 96, color: "orange" },
        { type: "text", text: "What if the board wrote itself?", at: [110, 250], size: "l", color: "blue", maxW: 560, id: "q" },
        { type: "highlight", of: "q", color: "orange" },
        { type: "arrow", from: [700, 420], to: [980, 520], color: "red" },
        { type: "box", rect: { x: 1000, y: 470, w: 380, h: 150 }, color: "teal", id: "b" },
        { type: "text", text: "just add ideas", at: [1190, 545], size: "m", align: "center", anchor: "middle", color: "black" },
        { type: "star", at: [1420, 460], r: 30, color: "orange" },
        { type: "sticky", rect: { x: 120, y: 560, w: 260, h: 200 }, color: "yellow" },
        { type: "text", text: "ship it!", at: [250, 660], size: "m", align: "center", anchor: "middle", color: "#3a3320" },
        { type: "check", at: [470, 700], s: 70, color: "green" },
        { type: "cross", at: [600, 700], s: 56, color: "red" },
        { type: "bracket", x: 700, y0: 650, y1: 800, curly: true, side: "left", color: "purple" },
        { type: "text", text: "123 + 456 = 579", at: [760, 690], size: "m", color: "black" },
        { type: "squiggle", from: [120, 880], to: [880, 886], color: "teal" },
      ],
    }, null, 2),
    spec: (text) => ({ ...JSON.parse(text), seed: "raw" }),
  },
};
