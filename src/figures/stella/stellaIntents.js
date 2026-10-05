// What the operator can ask for, and what happens to everything else.
//
// The router is TOTAL: route() returns a defined intent for every possible string,
// including empty, whitespace, two thousand characters, emoji, Gujarati script and
// pasted SQL. There is no undefined branch and nothing throws. An agent product that
// can be made to return nothing by typing the wrong thing is not finished, and the
// fallback is a designed answer rather than an error state.
//
// Two intents are explicit rather than fallbacks on purpose: the two chips on the
// product's own empty state. The most prominent control in the shipped UI returning
// "I did not understand" would be a credibility leak on the first click.

export const INTENTS = {
  "start-calls": {
    id: "start-calls",
    title: "Start screening calls",
    reply:
      "Fourteen people match that role. Two are blocked before I dial: one was called three times last week, and one asked not to be contacted again. Twelve to go.",
    action: "open-call",
    scope: "built",
  },
  "create-jd": {
    id: "create-jd",
    title: "Create a job description",
    reply:
      "That is a real part of the product and it is not built in this demonstration. What is built here is the screening call: the conversation design, the listeners underneath it, and what lands in the record afterwards.",
    scope: "not-built",
  },
  "show-record": {
    id: "show-record",
    title: "Show the candidate record",
    reply: "Here is what the call established, with how each fact was got.",
    action: "open-ats",
    scope: "built",
  },
  "show-candidate": {
    id: "show-candidate",
    title: "Show the candidate's side",
    reply: "This is what arrives on his phone. Four messages, no scoring, a human number.",
    action: "open-candidate",
    scope: "built",
  },
  "why-that-line": {
    id: "why-that-line",
    title: "Explain a line",
    reply:
      "Tap any line Stella says and the rail names the decision behind it, with the research it came from.",
    scope: "built",
  },
  "the-numbers": {
    id: "the-numbers",
    title: "The outcome",
    reply:
      "Of the calls that connect, 71% now complete the whole screen, up from 35 to 40%. Measured over calls that connected, not over everyone dialled. How often a call is answered at all is a separate number with a separate denominator, and blending the two would flatter the arc.",
    scope: "built",
  },
  ambiguous: {
    id: "ambiguous",
    title: "More than one reading",
    reply: "That could mean two things. Which did you want?",
    chips: ["Start screening calls", "Show the candidate record"],
    scope: "built",
  },
  fallback: {
    id: "fallback",
    title: "Outside this demonstration",
    reply:
      "I cannot do that here. This demonstration covers one thing properly: the first-round screening call, and what happens to what it hears. Ask me to start the calls, show the record, or explain any line Stella says.",
    chips: ["Start screening calls", "Show the candidate record", "Explain a line"],
    scope: "not-built",
  },
};

const RULES = [
  { id: "create-jd", re: /\b(jd|job description|write.*(job|role)|create.*(job|jd)|post.*(job|role))\b/i },
  { id: "start-calls", re: /\b(start|begin|run|make|place|kick).{0,20}\b(call|calls|screen|screening|dial)/i },
  { id: "start-calls", re: /\b(screening calls?|ai calls?|call the (shortlist|candidates?|list))\b/i },
  { id: "show-record", re: /\b(record|ats|what did (you|we) (get|capture)|shortlist|candidate record)\b/i },
  { id: "show-candidate", re: /\b(candidate('s)? (side|view|phone)|what does he (get|see)|sms|message)\b/i },
  { id: "why-that-line", re: /\b(why|explain|reason|rationale|decision)\b/i },
  { id: "the-numbers", re: /\b(outcome|result|number|metric|completion|71|how did it (do|go))\b/i },
];

// Deliberately ambiguous, so the demo has a real disambiguation rather than pretending
// every input is either understood or rejected.
const AMBIGUOUS = [/^\s*calls?\s*$/i, /^\s*show me\s*$/i, /^\s*next\s*$/i];

export function route(input) {
  const text = typeof input === "string" ? input : "";
  const trimmed = text.trim();
  if (!trimmed) return INTENTS.fallback;
  if (AMBIGUOUS.some((re) => re.test(trimmed))) return INTENTS.ambiguous;
  for (const r of RULES) {
    let hit = false;
    try {
      hit = r.re.test(trimmed);
    } catch {
      hit = false;
    }
    if (hit) return INTENTS[r.id];
  }
  return INTENTS.fallback;
}

// The chips on the product's own empty state, wired to explicit intents.
export const EMPTY_CHIPS = [
  { label: "Create JD & Start Hiring", intent: "create-jd" },
  { label: "Start AI Screening Calls", intent: "start-calls" },
];

// What the composer offers as ghost text. Every one of these MUST route to a real
// intent rather than the fallback: completing someone into a request the agent will
// refuse is worse than offering nothing. qaStella asserts it.
export const SUGGESTIONS = [
  "Start the screening calls",
  "Show me the record",
  "Show the candidate's side",
  "Explain that line",
  "What was the outcome",
];
