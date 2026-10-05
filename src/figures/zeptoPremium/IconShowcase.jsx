// Review grid for the Zepto Premium icon set (see ./icons.jsx). Routes at /zepto-premium-icons.
// Temporary showcase so the set can be eyeballed and picked from before dropping into the deck.
import * as Icons from "./icons";

const GROUPS = [
  { label: "Growth", items: ["IGrowth", "IOrdersUp", "IBasketDiverse"] },
  { label: "User / brand", items: ["IUser", "IBrand"] },
  { label: "Personas", items: ["IPersonaEvolvingElite", "IPersonaHealthMaximizer", "IPersonaGourmetExplorer", "IPersonaHolisticElite"] },
  { label: "Curation / discovery / space", items: ["ICuration", "IDiscovery", "IDedicatedSurface"] },
  { label: "Quantity vs quality (pair)", items: ["IQuantity", "IQuality"] },
  { label: "Invite / catalog / vetting", items: ["IInviteOnly", "ICatalog", "IDeepChecks"] },
];

function Tile({ name }) {
  const Icon = Icons[name];
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: 16, border: "1px solid var(--border, #333)", borderRadius: 12 }}>
      <div style={{ width: 40, height: 40 }}>
        <Icon />
      </div>
      <span style={{ fontSize: 11, opacity: 0.65, textAlign: "center" }}>{name.replace(/^I(Persona)?/, "")}</span>
    </div>
  );
}

export default function IconShowcase() {
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px", color: "currentColor" }}>
      <h1 style={{ fontSize: 20, marginBottom: 24 }}>Zepto Premium — icon set</h1>
      {GROUPS.map((g) => (
        <div key={g.label} style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em", opacity: 0.6, marginBottom: 12 }}>{g.label}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))", gap: 12 }}>
            {g.items.map((name) => (
              <Tile key={name} name={name} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
