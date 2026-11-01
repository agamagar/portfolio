import ScreenStrip from "./ScreenStrip";

// The 18 Schedule P1 finals Agam picked (31 Oct): the screens as built in code,
// each passing the 3% pixel gate against its Figma final. Images are the gate
// captures (design-playground #gate/<id>, 2x); `id` is the gate id, so the
// Schedule verifier can find each one here.
const DIR = "/figures/scheduled/finals";
const SCREENS = [
  ["home-m1", "Home, store offline: Schedule Now"],
  ["cart-m3", "Cart: instant plus schedule for later"],
  ["cart-m3-long", "Cart, the full scrolled page", true],
  ["cart-m1-dev-ready", "Cart: items unavailable, Click to Pay"],
  ["m2-intro-introducing", "Intro banner: Introducing"],
  ["m2-intro-named", "Intro banner: Schedule for Later"],
  ["m2-intro-benefits", "Intro banner: now or later"],
  ["m2-intro-states", "Intro banner states"],
  ["m2-schedule-page", "Schedule your order: slots listed"],
  ["m2-schedule-page-loose", "Schedule your order: looser card text"],
  ["m2-card-open", "Open card: ruled slot groups"],
  ["m2-current", "Slot picked, delivery note, second instant"],
  ["m2-collapsed", "Both shipments collapsed"],
  ["m2-chips", "Collapsed, with option chips"],
  ["m2-status", "Collapsed, on status rows"],
  ["m2-no-slot", "Collapsed, second has no slot"],
];
const BOARDS = [
  ["hdr-board", "Cart headers: every reason"],
  ["hdr-board-blocked", "Cart headers: blocked reasons keep a disabled Schedule"],
];
const tiles = (rows) => rows.map(([id, cap, tall]) => ({ id, cap, tall, src: `${DIR}/${id}.webp` }));

export default function SchedFinals() {
  return (
    <div className="sdfinals">
      <ScreenStrip tiles={tiles(SCREENS)} label="The shipped screens, scroll sideways" />
      <ScreenStrip tiles={tiles(BOARDS)} label="The cart header boards, scroll sideways" size="board" />
    </div>
  );
}
