// The ten invariants. Each was learned by breaking it; the generators assert most of
// them. Text follows the handoff doc, split into the rule and the reason.
export const INVARIANTS = [
  {
    rule: "Contrast is verified, never eyeballed.",
    why: "Every text/background pairing is computed. Display type at least 3:1, body and UI text at least 4.5:1, graphical objects at least 3:1. A '9.4:1' claim once shipped that was actually 6.85:1. Contrast is symmetric, and guessing it is how that happens.",
  },
  {
    rule: "Ramps must be strictly monotonic in luminance.",
    why: "gen_status.py asserts this. A ramp that reverses is worse than one that fails a threshold, and auto-darkening a mid-tone will silently cause a reversal if unguarded.",
  },
  {
    rule: "Gradients are checked against every stop, not the average.",
    why: "A gradient is text-safe only if one colour clears threshold against its lightest and its darkest stop.",
  },
  {
    rule: "Gradients must be luminance-coherent.",
    why: "Do not span light and dark stops in one field and expect text to work. gradient_stops() proposes candidate stop pairs and returns the first a label can actually clear; it does not branch on a luminance threshold. An earlier version did, and lavender's primary landed at 0.198, two thousandths off the cutoff.",
  },
  {
    rule: "Mid-tone 500s hold neither white nor ink.",
    why: "Orange #F2600C (3.5:1 on white) and lavender #8B5CF6 (4.2:1 on white, 3.9:1 on ink) are the known cases. Button fills step deeper along their own semantic chain, so a hot CTA stays hot rather than collapsing to black. See solve_button().",
  },
  {
    rule: "Icon colour is surface-dependent.",
    why: "Status 500 works on white; three of the five cannot hold 3:1 on the lavender card. Tinted surfaces use 700.",
  },
  {
    rule: "Knockout shapes take the surface colour, not hard-coded white.",
    why: "The exclamation mark inside the Disruptions hexagon vanishes on a solid badge otherwise.",
  },
  {
    rule: "Status hues must survive dichromatic vision.",
    why: "cvd.py runs Viénot LMS projection for protanopia, deuteranopia and tritanopia with CIE76 dE. Current worst-case pair is dE 32.1; anything under about 15 is confusable. The first hand-picked set scored 5.4. If a status colour is added or changed, re-run optimise2.py.",
  },
  {
    rule: "Five hue-coded categories is the ceiling of dichromatic vision.",
    why: "The current set only clears because each state was constrained to a semantically valid hue band and optimised inside that band. Unconstrained optimisation returns nonsense: green for an unavailable state, no red for the alert. Do not add a sixth status hue; extend by severity tier instead.",
  },
  {
    rule: "Colour is the third signal, never the first.",
    why: "Every status has a distinct icon and an explicit label; that is what satisfies WCAG 1.4.1. If any surface renders these as colour-only dots or bare pills, the separation above stops being sufficient and the icon must come back.",
  },
];
