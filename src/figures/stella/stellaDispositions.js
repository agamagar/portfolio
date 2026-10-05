// How a call closed, and whether the system's own label for it was truthful.
//
// `truthful: false` is the important field and it exists for exactly one node. The old
// path ends with the system writing "COMPLETE. All required fields captured. No flags
// raised." That is not a bug in the logging. It is the logging working perfectly
// against the wrong definition of done: the script reached its end, so the script
// called it a success, while the man on the line had said he was out of work and
// needed a job and nothing in the record could hold it.
//
// Marking it untruthful in DATA, rather than editing the log line to read better,
// keeps the failure legible. The interface can then show the label the system actually
// wrote beside the evidence that it was wrong, which argues harder than either alone.
//
// Every key here MUST be a node that actually carries an `ending`, and every ending
// MUST have an entry. qaStella asserts both directions, because an earlier version of
// this file was keyed on five node ids that did not exist and silently fell through to
// the generic fallback.

export const DISPOSITIONS = {
  "open-callback-set": {
    key: "scheduled-by-candidate",
    label: "Scheduled by the candidate",
    tone: "trust",
    truthful: true,
    detail:
      "Held against the dedup lock so it cannot become a second unplanned call, and recorded as scheduled by candidate, never as declined.",
  },
  "open-badtime-hardno": {
    key: "opted-out",
    label: "Opt-out honoured",
    tone: "neutral",
    truthful: true,
    detail:
      "The number is suppressed for the campaign. An opt-out that is logged but not obeyed is worse than never offering one.",
  },
  "open-human-now": {
    key: "handed-to-a-human",
    label: "Handed to a human, immediately",
    tone: "trust",
    truthful: true,
    detail:
      "The escape hatch was real, which is the only thing that made offering it honest.",
  },
  "repair-human-now": {
    key: "handed-to-a-human-after-repair",
    label: "Handed over, with the repair history",
    tone: "trust",
    truthful: true,
    detail:
      "The person picking this up can see it broke on our side, so the candidate does not have to explain it again.",
  },
  "repair-exit-grace": {
    key: "system-failure-requeue",
    label: "System failure, requeued",
    tone: "repair",
    truthful: true,
    detail:
      "Logged against us, not against him. His position in the pipeline is unchanged, because he is not scored on a call our own line broke.",
  },
  "listen-old-logged": {
    key: "complete-no-flags",
    label: "COMPLETE, no flags raised",
    tone: "repair",
    truthful: false,
    detail:
      "The script finished, so the system called it done. Nothing in the record holds what he actually said.",
    contradiction:
      "Look at the record beside this. Every field it needed is unanswered, and the one thing he volunteered has nowhere to live.",
  },
  "close-final-promise": {
    key: "answered-either-way",
    label: "Answer promised either way",
    tone: "trust",
    truthful: true,
    detail:
      "A stated next step, a stated timeframe, and a human number. The same close on every path, fit or not.",
  },
};
