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
