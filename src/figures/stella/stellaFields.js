// What the call actually writes down, and what it cannot.
//
// The screening script exists to fill a fixed record: experience, duties, location,
// shift, notice, pay. This file maps each Stella node in stellaGraph.js to the field
// it captures and the state that capture reaches:
//
//   asked      the question was put and no answer is recorded yet. Kept distinct from
//              `heard` on purpose: a record that fills in when a question is merely
//              ASKED is dishonest instrumentation, and this case study is partly an
//              argument against exactly that.
//   heard      captured on one pass, not yet read back
//   confirmed  read back contrastively and agreed, so it is safe to write down
//   na         asked, and genuinely does not apply to this person
//   offscript  heard by a parallel listener, with NO field on the form to hold it
//
// The last state is the point of the whole case. A record can be complete and still
// have lost the person, which is exactly what the old path demonstrates: every field
// green, nothing in "not on the form", and a man who said he needed work walked out
// of the call unrecorded.

export const FIELDS = [
  { key: "identity", label: "Candidate" },
  { key: "experience", label: "Experience" },
  { key: "employer", label: "Last employer" },
  { key: "duties", label: "Daily work" },
  { key: "location", label: "Area" },
  { key: "shift", label: "Shift fit" },
  { key: "notice", label: "Notice period" },
  { key: "pay", label: "Current pay" },
];

// nodeId -> the captures that land when that node is reached.
export const CAPTURES = {
  "open-greet": [{ key: "identity", value: "Maheshbhai", state: "confirmed" }],

  "screen-q-experience": [
    { key: "experience", state: "asked" },
    { key: "employer", state: "asked" },
  ],
  "screen-readback-experience": [
    { key: "experience", value: "9 years", state: "confirmed", note: "read back as nine, not nineteen" },
  ],
  "screen-mirror-english": [
    { key: "experience", value: "9 years", state: "confirmed", note: "read back as nine, not nineteen" },
    { key: "employer", value: "named on the second pass", state: "heard" },
  ],

  "screen-q-work": [{ key: "duties", state: "asked" }],
  "screen-q-location": [{ key: "location", state: "asked" }],
  "screen-q-shift": [{ key: "shift", state: "asked", note: "twelve hours, six days, put to them" }],

  "screen-q-notice": [{ key: "notice", state: "asked" }],
  "screen-readback-notice": [
    { key: "notice", value: "29 days", state: "confirmed", note: "read back as twenty nine, not thirty" },
  ],
  "screen-notice-not-applicable": [
    { key: "notice", value: "none, can join immediately", state: "na", note: "no current employer, so the field does not apply" },
  ],

  "screen-q-pay": [{ key: "pay", state: "asked" }],
  "screen-pay-unit": [
    { key: "pay", value: "15,000 per month, in hand", state: "confirmed", note: "read back as fifteen, not sixteen" },
  ],
  "screen-readback-pay": [
    { key: "pay", value: "19,000 per month", state: "confirmed", note: "read back as nineteen, not twenty" },
  ],
  "screen-correction-accepted": [
    { key: "pay", value: "20,000 per month", state: "confirmed", note: "candidate corrected the agent, and the correction won" },
  ],

  // The hero moment. The intent listener catches something the form has no slot for.
  "listen-fix-acknowledge": [
    {
      key: "intent",
      label: "Actively looking",
      value: "Out of work three months, needs a job now",
      state: "offscript",
      note: "caught by the intent listener, no field on the form holds this",
      offScript: true,
    },
  ],
  "listen-fix-readback": [
    {
      key: "intent",
      label: "Actively looking",
      value: "Out of work three months, needs a job now",
      state: "offscript",
      note: "read back as three, not thirteen, then written to the record",
      offScript: true,
    },
  ],
  // The old path writes the notice-period field and nothing else. Deliberately no
  // off-script capture here: that absence IS the failure.
  "listen-old-carryon": [{ key: "notice", state: "asked", note: "asked of a man with no employer, which is the failure" }],
};

// Fold the turns reached so far into the current record.
export function computeRecord(turns) {
  const byKey = {};
  const offScript = [];
  for (const { id } of turns) {
    const caps = CAPTURES[id];
    if (!caps) continue;
    for (const c of caps) {
      if (c.offScript) {
        const i = offScript.findIndex((o) => o.key === c.key);
        if (i >= 0) offScript[i] = c;
        else offScript.push(c);
      } else {
        byKey[c.key] = c;
      }
    }
  }
  return { byKey, offScript };
}
