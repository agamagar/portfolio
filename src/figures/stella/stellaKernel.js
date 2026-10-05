// The Stella call kernel: a pure reduce over events. No React, no DOM, no audio.
//
// It lives apart from the component for one reason. This repo has no test runner and
// browser self-verification is discouraged, so the acceptance criteria for the whole
// build have to close somewhere runnable in plain node. Everything the call does to
// its own state happens here, which is what lets scripts/qaStella.mjs drive real
// conversations headlessly and assert on the result.
//
//   const s0 = initialState();
//   const s1 = reduce(s0, { type: "choose", index: 3 });
//   selectRecord(s1); selectPlan(s1); selectDisposition(s1);
//
// The component owns rendering, audio and focus. It owns no call logic.
//
// Imports carry explicit .js extensions: Vite resolves extensionless paths but plain
// node does not, and running headless in node is the entire reason this file exists.

import { stellaGraph as graph } from "./stellaGraph.js";
import { CAPTURES, FIELDS } from "./stellaFields.js";
import { PLAN_STEPS, planEffects } from "./stellaPlan.js";
import { DISPOSITIONS } from "./stellaDispositions.js";

export { graph };

// Walk Stella's turns forward until the call needs the candidate to say something, so
// a run of agent lines lands together the way it would on a real call.
//
// A node with an `ending` STOPS the walk even if it also has a `next`. That is what
// makes the thesis observable: the old path's system log ("COMPLETE. All required
// fields captured. No flags raised.") used to flow straight into its own correction,
// so both painted in the same frame and the failure was never seen standing alone.
export function advance(fromId) {
  const out = [];
  let id = fromId;
  let guard = 0;
  while (id && guard++ < 60) {
    const node = graph.nodes[id];
    if (!node) break;
    out.push({ id, node });
    if (node.ending) break;
    if (node.branches && node.branches.length) break;
    id = node.next;
  }
  return out;
}

export function initialState() {
  return {
    turns: advance(graph.start),
    inspected: null,
    // Where a fork was taken, so the other arm can be replayed without a restart.
    forks: [],
  };
}

// Every state change in the call goes through here.
export function reduce(state, event) {
  switch (event.type) {
    case "restart":
      return initialState();

    case "inspect":
      return { ...state, inspected: event.id };

    case "choose": {
      const current = state.turns[state.turns.length - 1];
      const branches = current?.node?.branches || [];
      const branch = branches[event.index];
      if (!branch) return state;

      const added = advance(branch.next);
      // Some branches land on a node the graph already voices as the candidate. Echoing
      // the branch text too would print the same sentence twice.
      const landsOnCandidate = added[0]?.node?.speaker === "candidate";
      let appended;
      if (landsOnCandidate) {
        const first = branch.failureCase && !added[0].node.failureCase
          ? { ...added[0], node: { ...added[0].node, failureCase: branch.failureCase } }
          : added[0];
        appended = [first, ...added.slice(1)];
      } else if (!branch.candidateSays && !branch.gloss) {
        // A meta-choice ("hear what the old system did") is the viewer steering the
        // demo, not the candidate speaking. Rendering it as a turn produced an empty
        // speech bubble attributed to a person who said nothing.
        appended = added;
      } else {
        appended = [
          {
            id: `said-${state.turns.length}`,
            node: {
              speaker: "candidate",
              guj: branch.candidateSays || undefined,
              // The third rung. 71 of 78 branch-synthesised candidate turns rendered with
              // two while every Stella line rendered with three, so the candidate was the
              // one speaker a reader could not sound out.
              translit: branch.candidateSaysLatin || undefined,
              gloss: branch.gloss,
              failureCase: branch.failureCase,
            },
          },
          ...added,
        ];
      }

      // Record the fork so the road not taken stays reachable.
      const forks =
        branches.length > 1
          ? [
              ...state.forks,
              {
                at: state.turns.length,
                nodeId: current.id,
                takenIndex: event.index,
                takenLabel: branch.label,
                options: branches.map((b, i) => ({ index: i, label: b.label })),
              },
            ]
          : state.forks;

      return { ...state, inspected: null, turns: [...state.turns, ...appended], forks };
    }

    // Rewind to a fork and take a different arm, without losing the run.
    case "replayFork": {
      const fork = state.forks.find((f) => f.nodeId === event.nodeId);
      if (!fork) return state;
      // fork.at was turns.length at the moment of choosing, so slice(0, at) keeps
      // everything up to and INCLUDING the fork node. The +1 here kept the first turn
      // of the arm already taken, so the rewind landed mid-arm and choose no-opped.
      const rewound = state.turns.slice(0, fork.at);
      const trimmedForks = state.forks.filter((f) => f.at < fork.at);
      return reduce(
        { ...state, turns: rewound, forks: trimmedForks, inspected: null },
        { type: "choose", index: event.index }
      );
    }

    default:
      return state;
  }
}

// ── selectors ───────────────────────────────────────────────────────────────

export const selectCurrent = (s) => s.turns[s.turns.length - 1]?.node || null;
export const selectBranches = (s) => selectCurrent(s)?.branches || [];
export const selectAtEnd = (s) => !!selectCurrent(s)?.ending;
export const selectCalled = (s) => s.turns.length > 1;

// What the call has written down, and what it caught that no field holds.
export function selectRecord(s) {
  const byKey = {};
  const offScript = [];
  for (const { id } of s.turns) {
    for (const c of CAPTURES[id] || []) {
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

// The remaining question set, and what the loop did to it. This is the closed loop
// made visible: a listener does not merely annotate, it edits the plan.
export function selectPlan(s) {
  const state = PLAN_STEPS.map((st) => ({ ...st, status: "todo", why: null }));
  const byKey = (k) => state.find((x) => x.key === k);
  for (const { id } of s.turns) {
    for (const e of planEffects(id)) {
      const step = byKey(e.key);
      if (!step) {
        if (e.status === "added") state.push({ key: e.key, label: e.label, status: "added", why: e.why });
        continue;
      }
      step.status = e.status;
      step.why = e.why || step.why;
    }
  }
  return state;
}

// Which listeners have fired, in order, with what they caught.
export function selectListeners(s) {
  const fired = [];
  for (const { id, node } of s.turns) {
    if (!node.subAgent) continue;
    const m = /^(intent|distress|comprehension|escalation)\s*:\s*(.*)$/is.exec(node.subAgent.trim());
    if (m) fired.push({ nodeId: id, which: m[1].toLowerCase(), note: m[2].trim() });
  }
  return fired;
}

// How the call closed, and whether the system's own label for it was truthful.
export function selectDisposition(s) {
  const cur = selectCurrent(s);
  if (!cur?.ending) return null;
  const last = s.turns[s.turns.length - 1];
  return DISPOSITIONS[last.id] || {
    key: "closed",
    label: "Call closed",
    tone: "neutral",
    truthful: true,
    detail: cur.ending,
  };
}

// The annotation on show: whatever was inspected, else the newest annotated line.
export function selectShown(s) {
  if (s.inspected && graph.nodes[s.inspected]?.annotation) {
    return { id: s.inspected, node: graph.nodes[s.inspected] };
  }
  for (let i = s.turns.length - 1; i >= 0; i--) {
    if (s.turns[i].node.annotation) return s.turns[i];
  }
  return null;
}

export { FIELDS };
