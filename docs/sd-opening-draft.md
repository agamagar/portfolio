# Scheduled Delivery: the opening (draft for Agam, #13.5)

Status: a draft for Agam to react to. Not on the page. Register: Sauer (the locked portfolio voice). Everything below
is sourced in the fact base at the end; anything that isn't is marked [CONFIRM].

## Title

Keep: "Bringing Schedule Delivery to a 10-min delivery platform".

Or: "Later, on an app built for now". [CONFIRM: retitle, or keep the current title]

## Dek

Adding "later" to an app whose whole promise is "now" is a trust problem before it is a design problem.

## Opening

The shape Agam accepted (#13.5, 26 Oct): the result first, the key finding as a pull quote, the toggle demo under it, then the story.

**1. The result**

Scheduled Delivery reached all 1,144 Zepto stores by 12 December. A scheduled order came to be worth 2.7 times an instant one (₹1,452 against ₹543). Cancellations stayed high, 26.4% to 31.3% of scheduled orders a month, and this case says so where it matters. [CONFIRM: name the cancellations here, or leave them to Impact]

**2. The key finding (pull quote)**

> "I might forget the time slot selected for shipment 1, as I select a slot for shipment 2."
> A participant in testing (User 02)

[CONFIRM: this quote as the key finding, or the lesson it led to: a summary you can see is itself a trust mechanism]

**3. Under it: the toggle demo**

The three tested versions of the toggle side by side (UT 01, UT 02, UT 03), the still at `figma/toggle-demo.png`, with the live prototype `flow-schedule-ut-prototypes` behind it on the private site. The draft's own entry-point figure (four chips, one per tap that opens the page) can replace it once it's built.

**4. The story**

Zepto means ten minutes. People open it because they never have to wait. But plenty of what they order isn't urgent: between meetings, on the way home, heading to bed, for dinner or an occasion. An app that only knew how to say "now" had nowhere to put those orders, so that demand walked out the door.

Offering a slot sounds simple. On Zepto it isn't. One cart can come from several stores at once, so it splits into shipments, and each shipment can need its own slot. Ask for "later" badly and you spend the trust that ten minutes earned. So one question sat under every decision: how do you make "later" trustworthy without spending the trust that makes "now" work?

I led the interaction design end to end with my manager, over two 2025 releases: a deliberately narrow first version in late October, then the full multi-shipment one in mid-November. The craft was making a dense, stateful page feel as dependable as the ten-minute promise it sat beside.

## Notes for the reaction

- The result leads, as accepted; the story's hook keeps the case's own claim ("Zepto means instant", here "ten minutes") and its own central question, parked since 26 Sep, so the opening argues the spine the voice guide names for this case (Systems: trust before UX).
- The moments in the first paragraph are the case's "Six moments" labels, not new personas.
- Numbers are the 23 Sep 2026 warehouse pull, the same ones the page uses. The peak month (1.81M scheduled orders) is left out on purpose: one load-bearing number in the opening, the order value, then the honest one.
- If the title changes, the cover headline (`headline` in the case data) and the page title (`pageTitle`) change with it.

## Fact base

| Claim | Source |
|---|---|
| "Zepto's whole promise is speed: groceries at your door in ten minutes"; "an app that only knew how to say now had nowhere to put them" | App.jsx, cover body and "Context & problem" |
| "So that demand walked out the door" | App.jsx, "Context & problem" TL;DR |
| The six moments: Between meetings, On the way home, Heading to bed, Ordering for dinner, Ordering for an occasion, Ordering during peak hours | SchedMoments.jsx, MOMENTS labels |
| A cart splits into shipments from different stores; scheduling lives at the shipment level | App.jsx ("One cart, many hubs"); voice guide appendix, from the case |
| "how do you make 'later' trustworthy without spending the trust that makes 'now' work?" | App.jsx, "The central question" (parked `_tldr`/`p`) |
| "I led the interaction design end to end with my manager ... over two 2025 releases" | App.jsx, My role TL;DR and statement (94.1) |
| "a deliberately narrow M1 in late October and the full multi-shipment M2 in mid-November" | App.jsx, My role `_ul` (sourced from the handoff timeline) |
| Rollout complete on 12 December at 1,144 stores | sdReport.js ROLLOUT; the case's rollout stat (#37) |
| Average order value ₹1,452 scheduled against ₹543 instant, 2.7 times | sdReport.js VS_INSTANT; SchedImpact AOV_X |
| Cancellations 26.4% to 31.3% a month (full months) | sdReport.js MONTHLY; SchedMetricStory `fullCxl` (#37) |
| "I might forget the time slot selected for shipment 1, as I select a slot for shipment 2" (User 02) | docs/sd-smart-toggle-facts.md, comparison 3 (the research note) |
| The toggle demo still and prototype | figmaScreens.js, `toggle-demo` (UT 01 to UT 03, proto `flow-schedule-ut-prototypes`) |
| The dek's claim | The voice guide's spine for this case ("a trust problem before it is a UX problem") |
