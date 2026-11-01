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

## Resolved by Agam, 22 Oct 2026
The page's own [CONFIRM] notes (the "FILL IN TO FINISH" box on /work/scheduled-delivery) were answered and folded into the copy. Each is plain copy now, with no marker:
- **54% appliances (partial month):** the number is dropped; the copy describes the rising share without a figure (the chart still plots the partial September point).
- **Reach explorer:** radii, 11 PM closures and the three stores kept, with a small "Illustrative model" label on the figure.
- **Team and partners:** generic ("product, content, engineering, operations and QA"), no names anywhere in the section.
- **Go-to-market:** shipped = the banner on the schedule page and the tooltip on the Schedule button. The cart banner, intro animation and first-run coach-mark were designed, not shipped, and say so.
- **Pay-button debate:** no disagreement on the page; it reads as a decision.
- **Page vs sheet:** a sheet could not fit one of three shipments with their slots and reasons, and people dismissed sheets by accident and lost their slot.
- **Returns:** shipped. Agam's role: designer. The in-app flow comes first; chat is a fallback for edge cases (this resolves item 10 below for the page copy).
- **Wake-up and stuck-cart details:** accurate as written.
- **Copy section:** paraphrased review lines and the "first draft" framing removed.
- **Gift-bag and "ordering for someone" rows:** a gifting use case (schedule a gift to arrive at someone else's place at a set time).
- **Toggle caption and TL;DR:** kept as is.
- **QA design calls:** the "Nothing" swatch raised to 3:1 or better in light mode; the reach map no longer traps page scroll on touch (tap to arm, tap outside to release).
- **Figma prototype embed:** shows a poster and a short caption where it cannot load.

The 16 deck items below were settled as best guesses on 1 Nov ("best guess and move forward"). Each carries the call made; Agam can still overrule any of them. The visible [CONFIRM n] tags are gone from the deck.

## [CONFIRM] list

1. **Year and context of the Oct 29 session.** The research page says "Oct 29" only. The deck says "Oct 29 session" with no year. Which prototype each of the three users saw is not in the file (open question in `schedule.json`), so the slide says "one person", "another", "a third" and never ties a quote to UT 01, 02 or 03.
   - **Best guess 1 Nov, Agam to check:** No year. The slides say "an Oct 29 session with three users" and never tie a quote to a prototype.
2. **"Product feedback: Dec 26" on the slots-unavailable page.** Not a clear date (the demo dates in the file are Aug, Oct, Nov). The slide says "product feedback flagged it" with no date. Who gave the feedback is also unknown.
   - **Best guess 1 Nov, Agam to check:** "Dec 26" and the source are dropped. The slide says "product feedback flagged it".
3. **Which "slots unavailable" treatment won.** Greyed chip (S-017), SLOT FULL tag (S-018, frame dimmed in the file) or the all-booked panel (S-019). Open question in the map. The slides say "three answers are in the file".
   - **Best guess 1 Nov, Agam to check:** The greyed chip for one full slot, and the all-booked panel for a full day. The SLOT FULL tag (S-018, dimmed in the file) is dropped from the copy.
4. **Why the final page dropped the three-way toggle (UT 02) and the mini toggle (UT 03) as the main control.** The map shows what the page kept (two cards, slot on the collapsed card, Remove in the header) but no reason for dropping UT 02. The "What the page kept" slide states what is on the page, not why. Add the reason if Agam wants one.
   - **Best guess 1 Nov, Agam to check:** Given as design reasoning, not a quote: the three-way and mini toggles asked for a decision before people could see slots; two cards with the slot on the collapsed card kept each shipment's choice in view. Added as a fourth item on "What the page kept".
5. **The "metrics card" on the Oct 29 page** ("8% VWO, 50% AM/PM, 25% Wanted in now, 25% Batching Orders"): no legend, "VWO" not expanded, base unknown. NOT used anywhere in public copy.
   - **Best guess 1 Nov, Agam to check:** Kept out of the copy.
6. **Status vs shipped.** The map marks the M4 slot picker `wip` and the cart headers `final`, while the existing deck says the one-page design shipped. The Deliver status slide uses the file's own statuses ("marked WIP in the file"). Confirm the shipped/WIP wording.
   - **Best guess 1 Nov, Agam to check:** "Designed and handed over to dev". The finals headline, the Option 3 verdict, the cart-states line and the status slide say so; the status slide names the M4 slot picker as still in progress. The hook chapter is now "The work", not "What shipped". On the long page: the tabbed before-and-after caption says "chosen", the slot-picker caption drops "shipped", and the cart matrix says "handed it over to dev". The launch facts Agam confirmed on 22 Oct (banner and tooltip shipped, Today and Tomorrow shipped first, one-hour slots) are unchanged.
7. **Scheduled-order cancel button.** Cart `touchpoints-orders-home-pdp` (C-039 to C-042) designs "Cancel Order" on the Orders page, but the existing deck says cancellation ran through support chat in v1. Left OUT of the slides to avoid contradicting that. Confirm whether the Orders-page cancel shipped.
   - **Best guess 1 Nov, Agam to check:** Cancelling went through support chat in v1. Cancel on the Orders page is presented as designed for later.
8. **What "FTB" stands for.** The slides say "the dev handover". Also "DH" and "SS" (dark store, super store) are inferred in the map; the cart-composition flow is not used in a slide.
   - **Best guess 1 Nov, Agam to check:** Kept as "the dev handover". FTB, DH and SS are not expanded.
9. **Return-pickup copy.** The Returns pickup page text reads "Pickup", and some thumbnails are low resolution (PK-005 to PK-012 have none). The pickup slide only claims "Instant Pickup in 9 minutes" (PK-001) and the booked-out grid (PK-003).
   - **Best guess 1 Nov, Agam to check:** Kept: "Instant Pickup in 9 minutes" (PK-001) and the booked-out grid (PK-003).
10. **(Resolved 22 Oct: in-app first, chat is a fallback.) Exchange vs return entry point.** Chat (Zap) and in-app are both drawn as current (open question). The deck shows both and names the question in Learnings.
   - **Best guess 1 Nov, Agam to check:** (Resolved 22 Oct.) The Learnings item now gives the call: in-app first, chat as the fallback.
11. **Tracking UI.** The tracking state labels exist as text on the canvas, most without frames (returns inconsistency list). The tracking slide describes the chain of states, not a finished UI. Confirm wording before claiming it shipped.
   - **Best guess 1 Nov, Agam to check:** Described as the chain of states that was designed ("As designed, a replacement goes ..."). No shipped claim.
12. **"Four rules the cases follow" is synthesis**, not a quote from the file. Each rule maps to a source (header reasons, unserviceable header, collapsed slot, store-closed and high-demand headers) but the wording is mine. Confirm Agam is happy owning these as principles.
   - **Best guess 1 Nov, Agam to check:** Agam owns the four rules. Wording kept.
13. **Offers: "all of it is prototyped".** True for the playground (cart-offers group, 41 cases); in Figma the BxGY page is `*On Hold*`. Whether a combined-cart BxGY ships is an open question (what unblocks it). The slide says "on hold".
   - **Best guess 1 Nov, Agam to check:** "On hold". Kept.
14. **Buy 2 vs Buy 3.** The BxGY sheet says "Buy 3, Get 10% off" while cart chips say "Buy 2". The slide uses "Buy 2" from the cart chips and nudge. Confirm the threshold.
   - **Best guess 1 Nov, Agam to check:** Buy 2, matching the cart chips.
15. **Design-system claims.** "Components are built only from the tokens", "reused across the flows" and the Zepto Norms to Figtree fallback come from `docs/build-flows.md` and `docs/qa-notes.md`. Confirm that naming the font and the dark-mode gap is fine to publish.
   - **Best guess 1 Nov, Agam to check:** Naming the Figtree fallback and the dark-mode gap is fine. Kept.
16. **"All prototyped".** `docs/flow-map.md` still says "20 cases prototyped, 19 partly" (older). The build docs for the nine build groups register all 326. Research findings, annotation frames and asset specs are small faithful viewers, not full screens; the map slide says so. Verify the coverage filter on the map embed reads 326 before presenting.
   - **Best guess 1 Nov, Agam to check:** Kept: "326 cases, 32 flows, all prototyped". The build's own page says 326 of 326 mapped cases have a working prototype.

17. **(New, 1 Nov) Late slot auto-cancels with an apology and a 50-rupee credit.** In the old deck (stuck-cart and post-booking slides) but not on the live page and not in the map.
   - **Best guess 1 Nov, Agam to check:** most conservative reading: removed from the deck. The post-booking card is now "Control before and after" (edit before confirm, cancel through support chat in v1). Restore the line if the credit really shipped.

## Visibility (open decisions for Agam)

- The Oct 29 quotes, Zepto's token values, reason-code copy and the unreleased flows (returns, offers) are Zepto-internal. The public site locks the case study (`VITE_PUBLIC_SITE`), so this deck is only reachable on the private site. See `docs/sd-story-sync.md` for the deploy side.
