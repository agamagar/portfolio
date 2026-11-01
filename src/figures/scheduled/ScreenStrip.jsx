import "./scheduled.css";

// Shared horizontal strip of real screens: one height for every screen, each
// width follows its image's ratio, the reader scrolls and it snaps one at a time.
// Lifted out of SchedPageStates (mukxrqfz) so the finals strip uses the same one.
// Tile: { src, cap, id?, tall? }. `tall` screens (a scrolled page) keep the phone
// height and scroll inside the tile; `size="board"` is the lower row for wide boards.
export default function ScreenStrip({ tiles, label, size }) {
  return (
    <div className="sdh" data-size={size} role="region" aria-label={label} tabIndex={0}>
      {tiles.map((t) => (
        <figure className="sdh__tile" key={t.src} data-gate-id={t.id} data-tall={t.tall || undefined}>
          {t.tall ? (
            <div className="sdh__scroll" tabIndex={0} aria-label={`${t.cap}, scroll down`}>
              <img src={t.src} alt={t.cap} draggable={false} loading="lazy" />
            </div>
          ) : (
            <img src={t.src} alt={t.cap} draggable={false} loading="lazy" />
          )}
          <figcaption className="sdh__cap">{t.cap}</figcaption>
        </figure>
      ))}
    </div>
  );
}
