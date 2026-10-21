# Scheduled Delivery story: sidecar notes

Sources and `[CONFIRM]` markers for the playground-driven slides in
`src/decks/scheduledDelivery.story.js`. Public copy carries no `[CONFIRM]`: a claim the
map can't back was left out or worded as only what the file shows. Resolve these with
Agam in one batch, then fold the answers into the slides.

Source of every claim: `~/design-playground/flow/map/{schedule,returns,cart}.json`
(flow and case ids in the `// src:` line above each slide), `docs/motion-map.md`,
`docs/qa-notes.md`, `docs/canvas.md`, `docs/build-*.md`, `tokens/ZEPTO-NOTES.md`.

## Slide to source

| Slide (deck order within its phase) | Source |
| --- | --- |
| Discover: Then the feedback said: slots run out | schedule `slots-unavailable-feedback` S-017, S-018, S-019 |
| Discover: Three people, one task | schedule `ut-oct29-research` S-106 to S-110 (the process text gives the task) |
| Define: Two questions decide every shipment card | schedule `cases-breakdown-shipment-card` S-025 to S-028 |
| Define: 1 of 3, 2 of 3, 3 of 3 | schedule `confirm-page-multi-shipment` S-029, S-030 |
| Define: The cart says why, in one line | schedule `cart-header-states` S-061 to S-070 (status final) |
| Define: Four rules the cases follow | synthesis of the three slides above and the existing deck (see CONFIRM 12) |
| Develop: Three ways to choose between now and later | schedule `ut-prototypes` S-098 to S-105, variants V-01 to V-03 |
| Develop: The pill that remembers | `ut-prototypes` S-104, research S-108 |
| Develop: What the page kept | `slot-picker-m4` S-001/S-002, `collapsed-card-slot-summary` S-044 to S-048, `cart-header-states` S-070, `cases-breakdown` S-028 |
| Develop: Eight states, one screen / Try it | `slot-picker-m4` S-001 to S-008 (prototyped a1 to c1), `docs/qa-notes.md` |
| Develop: Slots sell out, so the picker says so | `slots-unavailable-feedback` S-017 to S-024 |
| Develop: How people meet it in the cart | cart `ftb-cart-entry-states` C-001 to C-012 (dev-ready), `ftb-schedule-picker-flow` |
| Develop: Exchange some, return the rest | returns `scheduled-exchange-return` SE-001 to SE-015 |
| Develop: Pickup is the same idea | returns `pickup-slot-picker` PK-001 to PK-012 |
| Develop: Or ask in chat | returns `cs-chat-exchange` EX-001 to EX-026 |
| Develop: Tracking has two chains | returns `order-tracking-states` TR-001 to TR-015, `refund-handling` RF-001 to RF-004 |
| Develop: The rider needs the OTP | returns `otp-pickup-handover` OT-001 to OT-005 |
| Develop: Offers got complicated fast | cart `bxgy-offer-combined-cart` C-065 to C-078, `swap-save-and-add-on-constructs` C-079 to C-090 (on-hold) |
| Develop: When the cart can't ship | cart `unservisability-cases` C-098 to C-105, `oos-limit-and-edge-cases` (on-hold) |
| Develop: Motion is a small set of named moves | `docs/motion-map.md` (offsets 0.12 s footer, 0.2 s grid, 0.4 s emphasis) |
| Develop: The system underneath | `tokens/ZEPTO-NOTES.md`, `docs/qa-notes.md`, `docs/build-flows.md` |
| Deliver: What's ready, what's waiting | flow `status` per flow, summed: dev-ready 6 flows/79 cases + final 1/11 = 90; wip 10/125; on-hold 5/50; exploration 9/55 + research 1/6 = 61 |
| Deliver: All eight states, on one canvas | `docs/canvas.md` |
| Deliver: Five journeys | embed catalog `prototype-*`, `storyboard-*` |
| Deliver: 326 cases, 32 flows, all prototyped | totals 111 + 101 + 114; `docs/build-*.md` ("all N cases registered and reachable") |
| Deliver: What the full map caught | `inconsistencies` and `openQuestions` in all three files |

## [CONFIRM] list

1. **Year and context of the Oct 29 session.** The research page says "Oct 29" only. The deck says "Oct 29 session" with no year. Which prototype each of the three users saw is not in the file (open question in `schedule.json`), so the slide says "one person", "another", "a third" and never ties a quote to UT 01, 02 or 03.
2. **"Product feedback: Dec 26" on the slots-unavailable page.** Not a clear date (the demo dates in the file are Aug, Oct, Nov). The slide says "product feedback flagged it" with no date. Who gave the feedback is also unknown.
3. **Which "slots unavailable" treatment won.** Greyed chip (S-017), SLOT FULL tag (S-018, frame dimmed in the file) or the all-booked panel (S-019). Open question in the map. The slides say "three answers are in the file".
4. **Why the final page dropped the three-way toggle (UT 02) and the mini toggle (UT 03) as the main control.** The map shows what the page kept (two cards, slot on the collapsed card, Remove in the header) but no reason for dropping UT 02. The "What the page kept" slide states what is on the page, not why. Add the reason if Agam wants one.
5. **The "metrics card" on the Oct 29 page** ("8% VWO, 50% AM/PM, 25% Wanted in now, 25% Batching Orders"): no legend, "VWO" not expanded, base unknown. NOT used anywhere in public copy.
6. **Status vs shipped.** The map marks the M4 slot picker `wip` and the cart headers `final`, while the existing deck says the one-page design shipped. The Deliver status slide uses the file's own statuses ("marked WIP in the file"). Confirm the shipped/WIP wording.
7. **Scheduled-order cancel button.** Cart `touchpoints-orders-home-pdp` (C-039 to C-042) designs "Cancel Order" on the Orders page, but the existing deck says cancellation ran through support chat in v1. Left OUT of the slides to avoid contradicting that. Confirm whether the Orders-page cancel shipped.
8. **What "FTB" stands for.** The slides say "the dev handover". Also "DH" and "SS" (dark store, super store) are inferred in the map; the cart-composition flow is not used in a slide.
9. **Return-pickup copy.** The Returns pickup page text reads "Pickup", and some thumbnails are low resolution (PK-005 to PK-012 have none). The pickup slide only claims "Instant Pickup in 9 minutes" (PK-001) and the booked-out grid (PK-003).
10. **Exchange vs return entry point.** Chat (Zap) and in-app are both drawn as current (open question). The deck shows both and names the question in Learnings.
11. **Tracking UI.** The tracking state labels exist as text on the canvas, most without frames (returns inconsistency list). The tracking slide describes the chain of states, not a finished UI. Confirm wording before claiming it shipped.
12. **"Four rules the cases follow" is synthesis**, not a quote from the file. Each rule maps to a source (header reasons, unserviceable header, collapsed slot, store-closed and high-demand headers) but the wording is mine. Confirm Agam is happy owning these as principles.
13. **Offers: "all of it is prototyped".** True for the playground (cart-offers group, 41 cases); in Figma the BxGY page is `*On Hold*`. Whether a combined-cart BxGY ships is an open question (what unblocks it). The slide says "on hold".
14. **Buy 2 vs Buy 3.** The BxGY sheet says "Buy 3, Get 10% off" while cart chips say "Buy 2". The slide uses "Buy 2" from the cart chips and nudge. Confirm the threshold.
15. **Design-system claims.** "Components are built only from the tokens", "reused across the flows" and the Zepto Norms to Figtree fallback come from `docs/build-flows.md` and `docs/qa-notes.md`. Confirm that naming the font and the dark-mode gap is fine to publish.
16. **"All prototyped".** `docs/flow-map.md` still says "20 cases prototyped, 19 partly" (older). The build docs for the nine build groups register all 326. Research findings, annotation frames and asset specs are small faithful viewers, not full screens; the map slide says so. Verify the coverage filter on the map embed reads 326 before presenting.

## Visibility (open decisions for Agam)

- The Oct 29 quotes, Zepto's token values, reason-code copy and the unreleased flows (returns, offers) are Zepto-internal. The public site locks the case study (`VITE_PUBLIC_SITE`), so this deck is only reachable on the private site. See `docs/sd-story-sync.md` for the deploy side.
