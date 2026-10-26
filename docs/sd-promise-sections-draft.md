# When a scheduled promise breaks: two section drafts (Sauer)

For the Scheduled Delivery case study (#40, #42, #43, accepted by Agam on 26 Oct). Status: **the design (prototype)**, built in the RN prototype; nothing here shipped, and the figures carry "Prototype, 2026". Facts and sources: `side-session-notes/local_d5d260ee-…/promise-case-study-facts.md` (Coachmark spotlight, RN commits f58c291, f348a82, 057ede9). Not on the page while a [CONFIRM] is open.

---

## When the slot can't happen

nav: Slot recovery

tldr: When a booked slot can't happen, the design tells you first and fixes it in one tap.

A slot booked hours ahead can fail for reasons you can't see from home: the store closes early, heavy rain pauses deliveries, there are no riders nearby. You may not open the app before the slot, so the design starts with a push: "Your 7 - 8 PM slot isn't possible tonight", with the reason, "Heavy rain has paused deliveries near you."

The sheet on your next open does the fixing. A chip names the reason, the title repeats, and the next three slots sit right there, grouped by day: Tonight 9 - 10 PM, 10 - 11 PM, Tomorrow 7 - 8 AM. One tap books the new slot, with no second Confirm. If the order had free delivery, it stays: "Free delivery stays on your new slot". The only button is "Refund instead". [CONFIRM: when a refund lands, and where]

You didn't cause the break, so the fix shouldn't cost you a flow. The next slots are the likely answer, so they sit where the problem is stated.

Running late gets the same shape, earlier. The cart said "Arriving 7 - 8 PM", and until now nothing happened at 8:05 except waiting. In the design, the push comes before the window ends: "Running about 15 min late. Heavy traffic on the way to you. Your 7 - 8 PM order should arrive by 8:15 PM." The sheet offers "I'll wait" or "Cancel for free". Free, because the cancel rule only ran one way ("cancel up to 30 min prior") and needed its mirror: when Zepto is the one late, leaving costs you nothing.

Verdict: **A broken slot is the design's problem, not yours.** One structure carries both cases: a push, then a sheet with the reason, what happened, what next, and the choices.

Figures ("Prototype, 2026", from `rn/qa/` in the design playground):
- The push and the recovery sheet side by side: `promise-push-slot.png`, `promise-recovery-sheet.png`.
- The same sheet when the store closed, with tomorrow's slots, and with the fee waiver: `promise-recovery-store-closed.png`, `promise-recovery-waiver.png`.
- Running late: `promise-late-push.png`, `promise-late-sheet.png`.

---

## The price lock

nav: Price lock

tldr: The price you confirmed is the price you pay.

Vegetable prices move every day, and a scheduled order is packed hours after you confirm it. So which price applies? In the design, the one you confirmed. Confirm says it once, in the line above the button: "Prices are locked when you confirm."

At packing there are three outcomes. If a price went up, you pay what you confirmed. If it went down, you pay the lower price: the lock is a ceiling, not a floor. [CONFIRM: that drops are passed on in production] If an item is out of stock, it's refunded at the confirmed price. [CONFIRM: the out-of-stock default, refund, substitute, or ask at Confirm (#41)]

Telling you was a decision of its own. Three directions were weighed: a push at packing with a sheet on next open, the receipt alone, or a live order card. The push won, because it speaks at the one moment the promise is tested, and only when something moved: "Your order is packed. Prices changed on 3 items. You pay no more than you confirmed, and ₹114 comes back to you." The sheet lists only what moved, each item tagged "Price locked", "Cheaper now" or "Out of stock", and ends on the sum: confirmed ₹232, ₹114 back, you pay ₹118.

Verdict: **One voice for a broken promise.** The price uses the same push and sheet as the slot recovery, so a shopper learns the shape once.

Figures ("Prototype, 2026"):
- The Confirm line: `promise-confirm-price-lock.png`.
- The push and the sheet: `promise-push-price.png`, `promise-price-sheet.png`.

---

## Figure idea for both: the promise ledger (critique 31.5)

Every promise the scheduled flow makes, beside what happens when it breaks: the slot window (slot recovery), the delivery window (running late), the price (the price lock), the items (out of stock). These two sections fill three of its rows; the items row waits on the out-of-stock default.

## Sources

| Claim | Source |
|---|---|
| A booked slot can fail: store closes early, heavy rain, no riders nearby | promise-case-study-facts.md, section 1 (critique 31.3) |
| Push, then a sheet on next open (Agam, question 42, A) | same, section 1 |
| Push copy, the reason chip, three slots inline, one tap books, "Refund instead", the fee waiver line | same, section 1; RN commit f58c291 |
| Running late: before the window ends, "I'll wait" or "Cancel for free"; why free (the 30-minute cancel rule's mirror) | same, "Running late" (critique 31.1, question 40) |
| One shared push-then-sheet structure | same; RN commit f348a82 (one NoticeSheet) |
| "Prices are locked when you confirm"; up, down and out-of-stock outcomes | same, section 2 (critique 31.4, question 43) |
| Three directions weighed, A (push and sheet) recommended and built | same, section 2; docs/promise-break-options.md |
| The push and sheet copy, the sample sums (₹232, ₹114, ₹118) | same, section 2 |
| The promise ledger | critique 31.5 |
