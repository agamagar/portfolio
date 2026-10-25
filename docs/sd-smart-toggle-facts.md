# Smart toggle: fact base

For the Scheduled Delivery case study section Agam asked for on 25 Oct 2026: "add the section about smart toggle whose subject changes based on where the user has clicked". Register: Sauer (live case-study prose). Draft: `docs/sd-smart-toggle-draft.md`.

Status: **blocked on Agam.** The main claim of the section (the toggle changes with the tap that opened it) is not written down in any source I could read. Everything around it is sourced. The questions are at the end.

## What is sourced

### The toggle itself
- Every shipment card has an Instant Delivery / Schedule Delivery choice, then a slot picker for that shipment. Source: App.jsx, SD "The real work" list ("Per shipment, a clear instant-versus-scheduled toggle, then its slot picker").
- Instant says "9 min". Schedule says "Order now, get it later". Source: playground `schedule-b/DeliveryOptionsSheet.tsx` (Option), and `SchedToggleDemo.jsx` SCENARIOS.
- In Figma the toggle is the `DeliveryModeCard` set, Type (Instant, Schedule) x State (Default, Selected, Filled, Unselected, Unavailable, Placeholder), with v3 · M4 WIP and v4 · Claude versions. The set has no variant for the entry point. Source: Claude: Schedule (R04cmbzFPQk2Q4IockGwqZ), node 59:138, read through the Figma MCP, read-only.

### The subtext follows the situation (already on the page)
- Section "Instant to Scheduled: the toggle" (App.jsx): "The toggle carries the reason. Its subtext changes with the situation, so people never have to guess why Instant is off or what Schedule offers."
- `ToggleScenarios` in `SchedToggleDemo.jsx` (22 Oct, Agam's ask "the smart toggle: its whole subtext changes based on scenarios") shows six situations, all strings from the playground:
  - Instant available: Instant "9 min", Schedule "Order now, get it later", Instant selected.
  - Instant unavailable: Instant "Instant delivery is unavailable", Schedule selected.
  - High demand: "High Demand! Instant delivery is temporarily unavailable. Schedule for later."
  - Store closed: "Store re-opens at 6AM" / "Add to cart now and place order later".
  - Rain: "Deliveries paused due to rain".
  - Everything scheduled: Schedule "Arriving today, 4-5 PM", Schedule selected.

### Where people tap into scheduling
- The cart is the primary entry, per shipment. A homepage prompt appears only when demand is high and the cart cannot be served. Source: App.jsx, "The real work" ("a homepage prompt when demand is high and the cart is not serviceable; the primary entry on the cart").
- Scheduling on the product page was killed ("it fought the booking model and read as a negative listing"). Source: App.jsx, the parked "Explorations" list.
- The cart header states (M3, status final) give two ways in. "Schedule" on the "Schedule for later" header opens the schedule page. "Edit" on a scheduled shipment ("Arriving today, 4-5 PM / Shipment scheduled") reopens the slot picker. Source: `docs/flow-map-schedule.md` (S-061 to S-070, exits) and `schedule-b/CartHeaderStates.tsx`.
- The FTB dev handover: "Tap Schedule / Schedule Now on the cart" opens the picker, and "View items -> Schedule" opens it too. Source: `docs/flow-map-cart.md` (C-013 to C-029), `docs/build-cart-ftb.md`.
- First visit: a pop-up introduces Schedule Delivery (C-001). Returning users get a bottom tray highlight instead (C-002). Source: `docs/flow-map-cart.md`.

### The page follows the tap (shipment level)
- "The shipment you arrived from expands by default; the rest stay collapsed but visible, status readable at a glance, so context is never lost." Source: App.jsx, "The real work".
- "Which shipment should be open on arrival" was one of the open questions that took numbered iterations. Source: same section.

### Hints, not proof
- The FTB prototype's screen table has a `focus: "instant" | "schedule"` field on the picker, set only on C-015 ("Picker: schedule selected", shipment 2 of 2, Instant unavailable). Nothing reads it. Source: `design-playground/src/playground/build/cart-ftb/data.ts`.
- C-018 "Don't schedule: instant selected": shipment 1 of 2 keeps Instant Delivery 9 min selected. C-025: shipment 2 of 2 is marked Scheduled. Source: `docs/flow-map-cart.md`.

## What is not sourced

None of these say that the toggle's **subject** (its label, its subtext, its default, or the shipment it acts on) changes with the tap that opened the page. The only sourced "follows the tap" behaviour is the shipment that opens expanded.

Where I looked and found nothing more:
- App.jsx SD entry: the toggle sections, "The real work", the parked explorations.
- `docs/flow-map-schedule.md`, `docs/flow-map-cart.md`, `docs/build-schedule-a|b|c.md`, `docs/build-cart-ftb.md`.
- The playground code: `schedule-a`, `schedule-b`, `schedule-c`, `cart-ftb`.
- `flow/figma-sync/flow-text.json`, the 32 Figma flow captions.
- Claude: Schedule in Figma, read-only: the Flow page (141:2), the DeliveryModeCard set (59:138), section 09 (M1 Dev Ready, 207:144209) and section 10 (M4 WIP, 208:503094). I searched the text layers in all of them.
- Drive `Claude/` notes: `2026-10-23_schedule-figma-consolidation.md`, `scheduled-delivery-handoff.md`, `portfolio-writing-voice.md`.
- Session transcripts: "smart toggle" turns up only Agam's two asks (22 Oct "subtext changes based on scenarios", 25 Oct "subject changes based on where the user has clicked").

## Questions for Agam (the [CONFIRM]s in the draft)

1. **What changes.** When you say the toggle's "subject" changes, which part do you mean: the title (Instant Delivery / Schedule Delivery), the subtext, which option is already selected, or which shipment the toggle controls?
2. **The entry points.** Which taps should the section name? The sourced ones are (a) Schedule on the cart's "Schedule for later" header, (b) Edit on a scheduled shipment, (c) the homepage prompt when demand is high, and (d) Schedule on a shipment's View items. Are there others, for example tapping a particular shipment's header?
3. **What the toggle says for each.** For each entry in Q2, what does the toggle say or select when the page opens? My guess, not written down anywhere: (a) that shipment opens with Schedule selected, (b) Schedule is selected and its subtext shows the booked slot ("Arriving today, 4-5 PM"), (c) Schedule is selected and Instant carries the high-demand line.
4. **Why.** What was the reason, in your words? My guess: a person who just tapped "Schedule" shouldn't have to say it again on the next screen.
5. **The worst case.** What went wrong before this, or in testing? For example, did the page once open on Instant, or on shipment 1, after someone tapped Schedule on a different shipment?
6. **Shipped or designed.** Did this behaviour ship in the app, or is it in the final design only? (The M4 page is marked WIP in the file.)
7. **Placement and figure.** Should this be its own short section right after "Instant to Scheduled: the toggle", with a new figure that has one chip per entry point? Or should it fold into that section, so the existing scenario figure gets a second row of entry-point chips?
