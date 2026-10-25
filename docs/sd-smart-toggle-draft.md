# Smart toggle: section draft (Sauer)

Register: Sauer. Sits in the Scheduled Delivery case study, group "Process", straight after "Instant to Scheduled: the toggle" and before "One scroll across midnight". Facts and sources: `docs/sd-smart-toggle-facts.md`.

Standing rules carried in: no em dash, no tilde, every unsourced claim marked, and nothing goes into App.jsx while a marker is open. "The detail I am proudest of" is already used in the midnight section, so this one does not borrow it.

---

## Where you tapped

nav: Smart toggle

tldr: The toggle opens already knowing which tap brought you there. [CONFIRM: the toggle's subject changes with the entry point, and which part changes]

Nobody lands on the schedule page by accident. They tapped Schedule on a shipment in the cart, or Edit on a slot they had already booked, or the homepage prompt that only shows when demand is high and the cart cannot be served. Each of those taps is already an answer. The toggle should not ask the question twice.

The worst case is the busy cart. Zepto splits one order into shipments, and the page lists every one of them. Tap Schedule on shipment 2 of 3, land on shipment 1 with Instant selected, and you have to find your shipment and say "later" a second time. [CONFIRM: that a version or a test session opened this way] The page already opens the shipment you arrived from. The toggle had to follow the same tap.

So its subject moves with you. [CONFIRM: what moves, title, subtext, default or target shipment] From Schedule, your shipment opens with Schedule Delivery chosen. [CONFIRM] From Edit, Schedule's subtext is the slot you booked, "Arriving today, 4-5 PM", so you start from your own choice. [CONFIRM] From the homepage prompt, Instant carries the reason: "High Demand! Instant delivery is temporarily unavailable. Schedule for later." [CONFIRM] Same two options every time. Only what they are about changes.

figure: Pick the tap you came from. The same Instant and Schedule options open on a different subject each time, so the page picks up where your tap left off. [CONFIRM: the strings and defaults per entry point]

---

## Figure plan (build after the answers)

- `schedToggleEntry`, a sibling of `ToggleScenarios` inside `src/figures/scheduled/SchedToggleDemo.jsx`, reusing its plate, chips, `PhoneFrame` and `.std-opt` styles. No new tokens.
- Three chips, one per entry point (cart Schedule, Edit a booked slot, homepage prompt). Each chip sets the open shipment, the selected option and the two subtexts.
- If Agam prefers one section (Q7 in the fact base), the chips become a second row on the existing scenario figure instead.

---

# Part 2: Explored, and why we chose (comparison captions)

Five comparisons, each placed where its decision happens in the story. Each one has a two- or three-word title, a verdict line with a bold lead, and one line per frame. The readability layer applies when it renders: the verdict lead is bold, and the frame lines are the sub-points.

## 1. Three toggles, one kept
In "Instant to Scheduled: the toggle". Replaces the composite still while the recording is missing.

Verdict: **Two cards per shipment won.** Instant and Schedule sit side by side in every shipment, so the choice reads before you tap. [CONFIRM: the reason UT 01's cards beat UT 02 and UT 03]

- UT 01, dual toggle (Picked): two cards inside each shipment. The final page kept them.
- UT 02, three options (Dropped): Remove Items as a third choice. Remove moved to the shipment header instead. [CONFIRM: why]
- UT 03, mini toggle (Dropped as the control): one pill per shipment, carrying its state. Its best idea moved to the collapsed card. [CONFIRM: why the pill lost]

## 2. Saying Instant is off
In "Slot-page states".

Verdict: **Grey the card, say why, offer later.** M4 greys Instant, marks it Unavailable, and adds a callout you can dismiss. [CONFIRM: the reason this beat the others, and the wording that ships]

- "Back soon" chip (Explored): a promise the store couldn't time. [CONFIRM]
- "Temporarily UNAVAILABLE" tag (Explored): loud, and it sits above the choice. [CONFIRM]
- "We got you!" callout (Superseded): replaced by the plainer Nov 21 line.
- Up and down toggle (Explored): Instant above, the schedule list open below. [CONFIRM: why it lost]
- "Get it now / Get it later" (Explored): new words for a choice people already knew. [CONFIRM]

## 3. The slot you picked
In "Different ways we explored...", after the test quote.

Verdict: **The collapsed card carries the slot.** One tester said it plainly: "I might forget the time slot selected for shipment 1." So every closed shipment shows its window. Five wordings were tried. [CONFIRM: which one shipped]

- "This shipment will be delivered Today, 5 - 6 AM"
- "Delivering Today morning, 5 - 6 AM"
- "Delivering Today, 5 - 6 AM", with "Select a slot"
- "Delivering Today, 5 - 6 AM", in place of the pill
- "Delivering Tomorrow Morning, 5 - 6 AM", the slot divide

## 4. When Pay can't
In "Cart-page states". Drops if the outcome isn't known.

Verdict: **[CONFIRM: which experiment won, and why]** When neither store can deliver now, the cart tried two answers.

- Experiment 1: Pay stays, disabled, and the cart asks you to schedule.
- Experiment 2: Pay gives way to a Schedule button.

## 5. Introducing it, quietly
In "The go-to-market".

Verdict: **Two touches shipped. The rest stayed in the file.** The banner on the schedule page and a tooltip on the Schedule button made it out. A cart banner, an intro animation and a first-run coach-mark were designed and held back. [CONFIRM: why those three were held back]

- Coach-mark options (Explored): "Orders can now be scheduled", "Plan your deliveries for later", "Schedule for later / Earliest delivery in 45 mins".
- Top-banner lines (Explored): "Introducing Schedule Delivery", "Skip the last minute rush", three rotating lines.
- Trust marker (Explored): "No extra charges on schedule orders".

---

# Part 3: Agam's decisions from the variants page

## D1. Coming back to the cart
Under the cart-side Schedule entry. A rule, so it's one line and a verdict, with no comparison row.

Verdict: **Leave on the cart, and the schedule resets.** Close the app on the cart, open it again, and you land back on the cart with the Schedule Reset sheet, which resets the schedule there. In the M1 case the cart goes back to Store Unserviceable, with Schedule offered again. [CONFIRM: why it resets instead of keeping the slot] [CONFIRM: what resets, the slot or the Instant and Schedule choice too, and for which shipments]

## D2. One status on a closed card
Next to comparison 3, "The slot you picked": that one settles the words on a closed card, this one settles how much it shows. Figure to make: a single pill against the toggle mirrored, with three shipments stacked in each.

Verdict: **A closed card shows one status.** The obvious move was to mirror the toggle and show Instant and Schedule on every collapsed shipment, the chosen one lit. It lost. The toggle is an input, so it shows the choices. A closed card is an output, so it shows the outcome, the way a Settings row reads "Wi-Fi: Home". [CONFIRM: which reason leads; this draft leads with input against output]

- Three shipments read as one column, for example "10 mins", "Today, 7 - 8 PM", "22 mins". Two options each would be six labels, half of them off.
- A scheduled shipment's slot is the thing to read, and a second option crowds it out.
- Two options look like a switch, and tapping Schedule on a closed card can't finish the choice, because there's no slot yet.
- The cost, said plainly: the second and third shipments start closed, so the other option is out of sight. People come to this page by choosing to schedule, so they know it's there.

What the design does: every closed card carries a single pill, the mode or the slot. [CONFIRM: shipped in the app, or the design only]
