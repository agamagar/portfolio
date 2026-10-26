import ScreenStrip from "./ScreenStrip";

// When a scheduled promise breaks after Confirm (#40, #42, #43, accepted 26 Oct): the design, built in the RN prototype
// (design-playground rn/qa, commits f58c291, f348a82, 057ede9). Expo Go's floating tools button is removed from the shots
// (a dev overlay, not the design); the two shots where it covered copy (store closed, the late sheet) are left out.
const P = "/figures/scheduled/promise/";

export function SchedPromiseSlot() {
  return (
    <ScreenStrip label="When the slot can't happen, the prototype's screens, scroll sideways" tiles={[
      { src: P + "push-slot.png", cap: "The push: the slot, and why", alt: "A push: Your 7 - 8 PM slot isn't possible tonight. Heavy rain has paused deliveries near you." },
      { src: P + "recovery-sheet.png", cap: "The sheet: the next slots, one tap books", alt: "The recovery sheet: a Heavy rain chip, the title, slots for tonight and tomorrow, and Refund instead." },
      { src: P + "recovery-waiver.png", cap: "No riders nearby: free delivery stays", alt: "The recovery sheet for no riders nearby, with Free delivery stays on your new slot." },
      { src: P + "late-push.png", cap: "Running late: told before the window ends", alt: "A push: Running about 15 min late. Your 7 - 8 PM order should arrive by 8:15 PM. Tap to wait or cancel for free." },
    ]} />
  );
}

export function SchedPromisePrice() {
  return (
    <ScreenStrip label="The price lock, the prototype's screens, scroll sideways" tiles={[
      { src: P + "push-price.png", cap: "The push at packing, only when something moved", alt: "A push: Your order is packed. Prices changed on 3 items. You pay no more than you confirmed, and ₹407 comes back to you." },
      { src: P + "price-sheet-replaced.png", cap: "The sheet, with Replace chosen at Confirm", alt: "The packing sheet: tomato Price locked, onion Cheaper now, the chips Replaced at ₹399, and You pay ₹517." },
    ]} />
  );
}
