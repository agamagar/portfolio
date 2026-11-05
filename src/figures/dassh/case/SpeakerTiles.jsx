// SpeakerTiles: the six speaker hues as tiles on their own ground, in one mode. Figma: Speaker tints / Light and / Dark on
// board 1878:80325 (Dassh gradient / Speaker tile). Each tile is one person's hue running into the ground at the glass mix,
// with its contrast measured where the tint is strongest. The plate follows the fourth rule: a 16 with 8 of padding holds 8s.
//   label   what the plate shows ("On the dark page, 24%")
//   mode    "light" | "dark"
//   hues    [{ name, hue, hex, cr: { light, dark } }]
import { DasshSky } from "../DasshSky";
import "./speakerTiles.css";

export function SpeakerTiles({ label, mode, hues }) {
  return (
    <div className="dspec-tiles" data-gradient-mode={mode}>
      <p className="dspec-tiles__k">{label}</p>
      <ul className="dspec-tiles__plate">
        {hues.map((h) => (
          <DasshSky as="li" hue={h.hue} className="dspec-tile" key={h.name}>
            <span className="dspec-tile__name">{h.name}</span>
            <span className="dspec-tile__val">{h.hex}<br />{h.cr[mode]}</span>
          </DasshSky>
        ))}
      </ul>
    </div>
  );
}
