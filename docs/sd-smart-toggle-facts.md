# Smart toggle and explorations: fact base

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

## Part 1 questions (now merged into the one list at the end)

1. **What changes.** When you say the toggle's "subject" changes, which part do you mean: the title (Instant Delivery / Schedule Delivery), the subtext, which option is already selected, or which shipment the toggle controls?
2. **The entry points.** Which taps should the section name? The sourced ones are (a) Schedule on the cart's "Schedule for later" header, (b) Edit on a scheduled shipment, (c) the homepage prompt when demand is high, and (d) Schedule on a shipment's View items. Are there others, for example tapping a particular shipment's header?
3. **What the toggle says for each.** For each entry in Q2, what does the toggle say or select when the page opens? My guess, not written down anywhere: (a) that shipment opens with Schedule selected, (b) Schedule is selected and its subtext shows the booked slot ("Arriving today, 4-5 PM"), (c) Schedule is selected and Instant carries the high-demand line.
4. **Why.** What was the reason, in your words? My guess: a person who just tapped "Schedule" shouldn't have to say it again on the next screen.
5. **The worst case.** What went wrong before this, or in testing? For example, did the page once open on Instant, or on shipment 1, after someone tapped Schedule on a different shipment?
6. **Shipped or designed.** Did this behaviour ship in the app, or is it in the final design only? (The M4 page is marked WIP in the file.)
7. **Placement and figure.** Should this be its own short section right after "Instant to Scheduled: the toggle", with a new figure that has one chip per entry point? Or should it fold into that section, so the existing scenario figure gets a second row of entry-point chips?

---

# Part 2: what was explored, and why we chose

Agam, 25 Oct 2026, via CoS: Figma: "in the design case study I want to show more of what was explored and the decisions that were made".

Sources, in the order used:
- **App.jsx**: the live SD prose, plus the parked explorations list and the parked "What users told us" prose.
- **Explorations index**: `design-playground/docs/explorations-page/EXPLORATIONS-INDEX.md`, with 33 cards and verdicts drawn from the Figma boards (Claude: Schedule, Modules page 129:869). The same content is in `docs/figma-specs/explorations/*.md`.
- **Flow maps**: `docs/flow-map-schedule.md` (cases, variants, open questions) and `docs/flow-map-cart.md`.
- **Playground code**: `src/playground/schedule/data.ts`, `build/schedule-a/TimeOfDay.tsx`, `build/schedule-c/Oct29Research.tsx`.
- **Figma**: Claude: Schedule, Flow page 141:2, read through the MCP, read-only. The frame ids below are the 360 x 829 phone frames there.

Where App.jsx and the index disagree, App.jsx wins. The index leaves "why the sheet lost" open, but App.jsx answers it.

## Already on the page (no new figure)

**Where scheduling lives**
- Tried: the product page, a home prompt, the cart per shipment.
- Won: the cart, plus a home prompt only when demand is high and the cart can't be served.
- Why the product page lost: "it fought the booking model and read as a negative listing".
- Source: App.jsx parked list and "The real work", index card 01, Detour figure.

**How the order is laid out**
- Tried: a tab per shipment, a bottom sheet, one combined cart, a single page.
- Won: the single page.
- Why:
  - Tabs hid shipment one's slot, as the test quote shows.
  - A sheet couldn't fit three shipments with their slots and reasons, and people dismissed it by accident and lost their slot.
  - The combined cart blurred the per-shipment reality.
- Source: App.jsx "Different ways we explored..." and the parked list. Index cards 04 to 06 say the same.

**The slot picker shape**
- Tried: a calendar, a bottom-sheet picker, an inline slot list.
- Won: the inline slot list.
- Why: a calendar was "overkill for a Today-and-Tomorrow window".
- Source: App.jsx parked list.

**The slot grid across days**
- Shipped: Today / Tomorrow tabs at launch.
- Later: one scroll across midnight, because "at 11pm you are planning tonight, not tomorrow".
- The grid: one-hour slots in time-of-day groups, with a dynamic Earliest group.
- Source: App.jsx "One scroll across midnight".
- After launch: an explicit "Arriving today" on the cart, and morning and evening sections instead of a raw clock, after 454 pre-slot "where is my order" tickets. Source: App.jsx, the parked "What users told us" prose (not live on the page).

**Removal wording**
- User 03 asked whether the products would be removed on save or were already gone.
- UT 01 added "Items will be removed on save" (S-101), and the live "Stuck cart" section says the items "will be removed on save".
- Source: Oct29Research.tsx S-109 and App.jsx.

**Returns reuse the slot picker for pickup**
- Source: App.jsx "The returns family" and index card 31.

## The five shown as comparisons

### 1. The toggle: three prototypes, one kept
Placed in "Instant to Scheduled: the toggle".
- **Tried** (all three on the Oct 29 test page):
  - UT 01, dual toggle with bottom sheet: S-098, frame 125:11802.
  - UT 02, toggle with three options (Instant / Schedule / Remove Items): S-102, frame 125:12967.
  - UT 03, mini toggle with the slot in the pill: S-104, frame 125:13448.
- **Won:** UT 01's two Instant / Schedule cards per shipment. The final M4 page draws two DeliveryModeCards side by side in every shipment card. Source: index card 09, Figma Flow 141:2 metadata.
- **Dropped:**
  - UT 02's third option. Remove moved to the shipment header (index card 10, sd-story-notes CONFIRM 4). Reason: **[CONFIRM]**.
  - UT 03's pill as the main control (index card 11). Reason: **[CONFIRM]**. Its idea stayed: the collapsed card shows the slot (see 3).
- **Tested:** Oct 29, three people, five quotes (Oct29Research.tsx). Which person saw which prototype isn't in the file. **[CONFIRM]**.
- **Conflict to settle:** the live "Different ways we explored..." section says the session pitted a tabbed flow against a single page. The Figma research page says UT 01, 02 and 03, which are all one-page stacks, and its dimmed Approaches block says "two approaches". **[CONFIRM]** whether the tabbed sheet was in the same session.

### 2. Saying Instant is off
Placed in "Slot-page states".
- **Tried** (the Nov 20 and 21 updates):
  - Instant "Back soon" chip: S-033, 113:5468.
  - "Temporarily UNAVAILABLE" tag above the toggle: S-034, 113:5731.
  - "We got you!" callout: S-035, 113:5997, marked superseded in the map.
  - Up / down toggle: S-037, 113:6488.
  - "Get it now / Get it later" wording: S-039, 113:7012.
  - Radio versus toggle: S-036, 113:6269, not shown.
- **Latest:** the Nov 21 set, a dismissible "High Demand! Instant delivery is temporarily unavailable. Schedule for later." banner (S-041 to S-043, TimeOfDay.tsx).
- **What M4 shows:** a greyed Instant card marked Unavailable, with a callout you can dismiss (index card 07). M4's demand line is "Unavailable due to demand, schedule for later" (S-003, frame 84:169, playground `schedule/data.ts`).
- **Open:**
  - The chip copy has six variants across boards (flow map, inconsistencies). Which wording ships: **[CONFIRM]**.
  - Why the greyed card and callout beat the chip, tag, up / down toggle and "Get it now / later": **[CONFIRM]**.

### 3. The slot on the collapsed card
Placed in "Different ways we explored...", after the test quote.
- **Tried:**
  - "This shipment will be delivered Today, 5 - 6 AM": S-044, 91:3321.
  - "Delivering Today morning, 5 - 6 AM": S-045, 91:4384.
  - "Delivering Today, 5 - 6 AM" plus "Select a slot": S-046, 91:5068.
  - "Delivering Today, 5 - 6 AM" replacing the pill: S-047, 91:5950.
  - The slot divide, "Delivering Tomorrow Morning, 5 - 6 AM": S-048, 91:6645.
- **Won:** the idea. The collapsed card shows the slot (index card 15). The live "Slot-page states" says "A slot picked: the chosen one-hour window held in the running summary".
- **Why:** User 02 said "I might forget the time slot selected for shipment 1, as I select a slot for shipment 2". The research note says "instead of saying schedule we can show the time slot in the pill in the collapsed state" (Oct29Research.tsx S-108).
- **Open:** which of the five wordings shipped. **[CONFIRM]**.

### 4. When nothing in the cart can come now
Placed in "Cart-page states".
- **Tried:** with neither the dark store nor the super store able to serve:
  - Experiment 1 keeps Pay, disabled, and asks you to schedule: C-057, 137:7581.
  - Experiment 2 replaces Pay with a schedule button: C-060, 137:8842.
- Source: flow-map-cart.md, "Cart composition", dev-ready.
- **Open:** which experiment won, and why. The flow map lists it as an open question. **[CONFIRM]**.
- **Stills problem:** in Claude: Schedule's rebuild, C-057 and C-060 render the same (both show an enabled "Click to Pay ₹212"), so the rebuild doesn't show the difference. If this comparison stays, it needs the original frames from the Zepto handoff file (C-057 at 42:45530 and C-060 at 42:47849 in 71cZSn6pTNf4zFzO07O2uv). Until then it isn't in `SchedExplored`. If neither is known, this comparison drops and a slot opens for "Slots full" (in the parked list below).

### 5. Introducing it, quietly
Placed in "The go-to-market".
- **Shipped:** the banner on the schedule page and a tooltip on the Schedule button (App.jsx "The go-to-market").
- **Designed, did not ship:** a banner in the cart, an intro animation and a first-run coach-mark (App.jsx).
- **Frames:**
  - Cart coach-mark options 61, 62 and 66: S-057, 118:9270; S-058, 118:9438; S-059, 118:9629. "Schedule for later / Earliest delivery in 45 mins", "Orders can now be scheduled", "Plan your deliveries for later".
  - Top-banner copy: S-050 to S-052. "Introducing Schedule Delivery", "Schedule for Later / Skip the last minute rush", three rotating lines.
  - Trust marker: S-055, "No extra charges on schedule orders".
- **Why the rest stayed in the file:** the live principle is "Push a new option everywhere and it reads as clutter that quietly dilutes the instant promise". The specific reason the cart banner, intro animation and coach-mark were cut: **[CONFIRM]**.

## Explored, listed here only

**Slots full: three treatments** (index card 16, parked)
- The three: a greyed chip (S-017, 111:4128), a "SLOT FULL" tag (S-018, 111:4446, dimmed in the file) and a whole day booked (S-019, 111:4764).
- Product feedback flagged the case. No pick is recorded.
- The live prose says "Today booked out: tomorrow's slots lead". **[CONFIRM]** which treatment shipped.

**Save gating**
- User 01 asked for Save to stay off until a slot is picked (S-106, S-107).
- The M4 file draws Confirm enabled with "No slot selected".
- Decided in the design: Confirm waits for every shipment (critique decision 1.2 / 1.8, below). Whether Zepto shipped the gating in 2025 is still unknown, and the case study doesn't claim it.

**Other explorations with no verdict recorded:**
- Many shipments, 1 of 3 to 3 of 3 (S-029 to S-032). Shipment counts disagree across boards.
- Slots by time of day at 10 PM, 12:00 and 6:30 AM (S-041 to S-043).
- Meet Schedule: the banner, the SD 1 to 10 Lottie frames, the "Select a slot" tag, orange versus purple (S-050 to S-055). Purple is named "Main Theme" in M2.
- The cart coach-mark options 60 to 66 (S-057 to S-060).
- The schedule screen with item images as the hero (C-097, WIP).

**Cart headers** (M3, marked final)
- One header per reason code, with a Schedule button (S-061 to S-070).
- Open: the clickable set or the "Disabled Button" set.
- Earlier forms:
  - The M2 header "Instant Temporarily Unavailable / NEW / Tap to pick your preferred day & time" (S-056).
  - The M1 "Schedule Now" banners (C-003, C-004).

**Unserviceable items in a combined cart** (on hold)
- Approach 1 tags each item in place (C-094). Approach 2 groups them at the top with Replace (C-095).
- The live "Stuck cart" flags the unserviceable shipment in place on the schedule page.

**BxGy, Swap n Save and add-ons on a combined cart** (on hold)
- The whole page is *On Hold* in Figma (C-065 to C-090).
- The threshold reads "Buy 2" on cart chips and "Buy 3" on the sheet. What unblocks the page is an open question.
- Left off the case study page: on hold and internal.

**Returns pickup on the slot picker** (index 31)
- Picked. The returns flows are still WIP. Already on the page.

## How the comparisons will be built (after the answers)
- **One shared component**, `src/figures/scheduled/SchedExplored.jsx`, holds data for the five decisions under one key each.
- Each one renders a row of phone stills in the shared `PhoneFrame`, with a status tag (Picked, Dropped, Explored), one caption line per frame and a verdict line with a bold lead.
- **Stills:** 2x exports of the Claude: Schedule frames listed above, as webp in `public/figures/scheduled/explored/`. No live iframes: about 18 of them on one page would be too heavy, and the site's still-first rule already covers this.
- **No new tokens.** The plate reuses the toggle demo's lavender plate and the site's figure tags.
- The toggle section's current stand-in is the composite still of UT 01, 02 and 03. It would repeat comparison 1, so comparison 1 replaces it until the recording arrives.
## Critique decisions (Agam's own answers)

Source: `design-playground/docs/critique-decisions.md`, kept by the Design critiques session. Each entry is Agam's decision and reasoning on the Schedule prototype and the Figma file, which makes it a sourced fact. These are decisions on the current design (the RN prototype and Claude: Schedule). They say nothing about what Zepto shipped in 2025, so the case study writes them as the design, not as shipped.

**1.2 / 1.8: the Confirm button and its helper text** (logged 25 Oct)
- Decision: Confirm stays disabled until every shipment has a choice. There is no caption counting what's left, and the footer progress text ("2 of 3 scheduled") was declined.
- Reasoning: Agam, relayed by CoS: Figma: "pick a slot for 3 more shipments … not needed".
- Craft detail: the pending count survives only as a VoiceOver hint on the disabled button (`rn/src/schedule/shipments.ts`, `pendingHint`).
- The thread back to the research: User 01 asked on Oct 29, "Don't let me save if something is pending" (S-106). The M4 file still drew Confirm enabled with "No slot selected".
- In the case study: one line in the explorations layer, under "Slot-page states", reading "**Confirm waits for every shipment.**", with Agam's reason. It can also be the honest close of comparison 1, since the research ask was acted on in the design.
- Settles Q16, written as the design rather than as shipped.

## One list for Agam (both parts)

Answers can be short. Where I've written a guess, a yes or no is enough.

**Smart toggle (new section "Where you tapped")**
1. What changes with the tap: the title, the subtext, the option already selected, or the shipment the toggle acts on?
2. Which taps count? Sourced: (a) Schedule on the cart's "Schedule for later" header, (b) Edit on a scheduled shipment, (c) the homepage prompt when demand is high, (d) Schedule from View items. Any others?
3. What does the toggle show for each? Guess: (a) that shipment opens with Schedule chosen; (b) Schedule chosen, with the booked slot ("Arriving today, 4-5 PM") as its subtext; (c) Schedule chosen, with the high-demand line on Instant.
4. Why was it built this way? Guess: someone who just tapped Schedule shouldn't have to choose it again.
5. What was the worst case before this? For example, did the page once open on Instant, or on shipment 1, after a tap on a different shipment?
6. Did it ship in the app, or is it in the final design only?
7. Should it be its own section right after "Instant to Scheduled: the toggle", with its own figure? Or a second row of chips on the existing scenario figure?

**The three toggle prototypes**
8. Why did UT 01's two cards per shipment beat UT 02 (Remove as a third option) and UT 03 (the mini pill)? Guess for the verdict line: the choice reads before you tap.
9. The live section "Different ways we explored..." says the test pitted a tabbed flow against a single page. The Figma research page lists UT 01, 02 and 03, which are all single-page. Was the tabbed sheet tested in the same Oct 29 session, or a different one? And which person saw which prototype, if you remember?

**Saying Instant is off**
10. Which line ships: M4's "Unavailable due to demand, schedule for later", or the Nov 21 "High Demand! Instant delivery is temporarily unavailable. Schedule for later."?
11. Why did the greyed card with a dismissible callout win? Guesses, one each: the "Back soon" chip promised a time the store couldn't keep; the "Temporarily UNAVAILABLE" tag was loud and sat above the choice; "Get it now / Get it later" renamed a choice people already knew. No guess for the up/down toggle.

**The slot on the collapsed card**
12. Which wording shipped? (a) "This shipment will be delivered Today, 5 - 6 AM" (b) "Delivering Today morning, 5 - 6 AM" (c) "Delivering Today, 5 - 6 AM" plus "Select a slot" (d) "Delivering Today, 5 - 6 AM" in place of the pill (e) the slot divide, "Delivering Tomorrow Morning, 5 - 6 AM"

**The cart when nothing can come now**
13. Which won, and why: Experiment 1 (Pay disabled, the cart asks you to schedule) or Experiment 2 (Pay replaced by a Schedule button)? If you don't know, I'll swap in "Slots full" instead. Then the question is which of the greyed chip, the "SLOT FULL" tag or the whole-day-booked panel shipped.

**Go-to-market**
14. Why were the cart banner, the intro animation and the first-run coach-mark held back? One line is enough.

**Placement (a yes is fine)**
15. Five comparisons, each a row of 2x stills exported from Claude: Schedule, with a status tag and one line per frame:
    - The toggle: the UT 01, 02 and 03 strip. It replaces the composite still while the recording is missing.
    - Slot-page states: saying Instant is off.
    - Different ways we explored: the collapsed-card wordings.
    - Cart-page states: the Pay experiment.
    - The go-to-market: the coach-marks and banners.
    BxGy stays off the page, since it's on hold and internal.

**Optional, not blocking**
16. RESOLVED by critique decision 1.2 / 1.8 (Confirm waits for every shipment, no helper text), written as the design, not as shipped.
