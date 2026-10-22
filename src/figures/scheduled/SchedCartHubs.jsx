import FigmaShot from "./FigmaShot";

// The cart with both hub types (dark store, 5 min / super store, 21 min), each with its own Schedule button.
// Figma Scheduled-Delivery-working 182:126352. A stand-in for the hub topology, not the topology itself.
export default function SchedCartHubs() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "8px 0" }}>
      <FigmaShot k="cart-hubs" width={260} alt="The cart split by fulfilling hub: Delivery in 5 mins from the dark store and Delivery in 21 mins from the super store, each with its own Schedule button." />
    </div>
  );
}
