// Named runs through the call, as data.
//
// Two jobs. The QA harness replays every one of them headlessly and asserts each
// reaches a defined disposition, which is how a branching demo stays honest as the
// graph changes: a scenario that stops reaching its ending is a broken promise, and
// the build fails rather than the case study quietly losing an argument.
//
// And they are the demo's own table of contents. Each is a claim from the case study
// with a path that proves it.

export const SCENARIOS = [
  {
    key: "the-hero-failed",
    title: "The call that started all of this",
    claim:
      "A man says he needs work. The script confirms fields and logs a success. Nothing in the record holds what he said.",
    picks: [/name wrong/i, /slowly, twice/i, /need a job right now/i, /old system/i],
    expect: { disposition: "complete-no-flags", truthful: false, offScript: 0 },
  },
  {
    key: "the-hero-heard",
    title: "The same sentence, after the rebuild",
    claim:
      "The intent listener interrupts the script, reads the number back, and rewrites what is left to ask.",
    picks: [/name wrong/i, /slowly, twice/i, /need a job right now/i, /rebuilt system/i],
    expect: { offScriptAtLeast: 1, struckAtLeast: 1, addedAtLeast: 1 },
  },
  {
    key: "dead-air-three-deep",
    title: "Repair, three failures deep",
    claim:
      "The failure the pilot measured. Rung three names the count, owns it, and requeues the call against us rather than scoring him.",
    picks: [/^\(say nothing\)$/i, /Still nothing/i, /\(say nothing, wait\)/i, /cutting out again/i, /after seven/i],
    expect: { disposition: "system-failure-requeue", truthful: true },
  },
  {
    key: "is-this-a-robot",
    title: "Asked outright whether it is a machine",
    claim: "Affirm at once, in ordinary words, with the human path in the same breath.",
    picks: [/person or a machine/i],
    expect: { reaches: "open-robot" },
  },
  {
    key: "gatekeeper-names-the-time",
    title: "A shared phone, and someone else answers",
    claim:
      "Nearly half of women in Gujarat do not have a phone they personally use, so a household gatekeeper answering is the default case rather than an edge case. Nothing about the application is said to the wrong person, and the callback slot is theirs to name.",
    picks: [/wife/i, /evening/i, /seven in the evening/i],
    expect: { disposition: "scheduled-by-candidate", truthful: true },
  },
];
