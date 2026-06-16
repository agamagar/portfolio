# Away — Fremium / post-login landing (exact Figma spec)

Source: Figma `6ZcIVLfPqaQU9RSPJ4QzPy`, node `5933:76844` ("Fremium start").
Exact assets in this folder; layout code in `fremiumStart.figma.jsx`.
**Nothing in the app has been changed to match this yet** — this is reference.

## Exact assets (downloaded from Figma)

| File | What it is | Format |
|---|---|---|
| `fullframe.svg` | whole frame export (3.4MB, raster-embedded, text outlined — not usable as a live figure) | svg |
| `arrowRight02.svg` | search send arrow (rotated -90 in layout) | svg vector |
| `lockPassword.svg` | footer lock icon | svg vector |
| `routeBlock.svg`, `ticketStar.svg`, `group145/146.svg`, `multiplicationSign.svg` | footer chip icons + hidden clear (×) | svg vector |
| `vector5803/5805/5806.svg`, `rectangle871–874.svg` | tiny vectors inside the in-phone fare card | svg vector |
| `image160.png` | phone screen content (behind the bezel) | png raster |
| `image353285.png` | the floating white fare card + crop | png raster |
| `iphone15ProBezel.png` | iPhone 15 Pro bezel | png raster |

The phone mockup is genuine raster photography (iPhone bezel + screenshots), so a pixel-faithful card uses `image160` / `image353285` / `iphone15ProBezel`, not vector.

## Colors (exact tokens)

- `primary/950` **#0B0B14** — screen bg
- `primary/900` **#13131F** — search field fill
- `primary/100` **#E2E8F0** — light text, arrow circle (`neutral/100`)
- `primary/400` **#64748B** — muted text (placeholder, footer line 1)
- `neutral/800` **#1C222F** — upload pill, hidden × button, card border
- `Border/Default` **#2A2436** — arrow glyph stroke
- Greeting gradient: `linear-gradient(93deg, #705ADE 11.658%, #B2A2FF 89.149%)` — applies to the WHOLE "Hey Sukesh" (both words), clipped to text
- Search border: radial gradient #4F44B8 → #3A367C → #2F2C5D → #23223E (subtle, top-left lit), 2px

## Type (exact)

- Greeting + heading: **Stack Sans Headline · Light**, 24px, tracking 0.408px, centered, 6px gap, block width 268
- Body ("Search for a city…", "Have a flight in mind? / We'll find a better price", footer line 1): **Google Sans Flex · Light**, 14px (search line-height 18, card line-height 20)
- "Upload screenshot", "Got an invite code?": **Google Sans Flex · Regular**, 12–14px

Both families are proprietary (not webfont-loadable). The portfolio substitutes **Inter** (see memory `no-tilde-emdash` / portfolio setup), so the rebuilt figure keeps Inter — which is why the fidelity check will always show some text anti-aliasing diff vs the real frame.

## Layout (exact)

- Root: flex column, centered, rounded 56px, bg #0B0B14, with a **"Halftone Dots Effect"** texture image at left -23 / top -35 / 406×879 (subtle dotted background — currently missing from the rebuild).
- Greeting block vertically centered in the top flex region (py 64).
- Search + card group: gap 16, padding 16, full width.
  - Search: outer rounded 16 (gradient border) → inner #13131F rounded 14, p12, with a 36px gap between the placeholder row and the arrow row. Arrow button h36 w48 rounded 1000.
  - Card: rounded 20, h124, border #1C222F. Left phone mockup region w122 (blurred bg). Floating white fare card centered (~78.5×33.9, rounded 3.76). Right column: two text lines + the pill.
- Footer region (flex-1, justify-end, py32, gap16): overlapping 28px chips — route-block (orange glow rgba(145,80,31,.3)), a purple chip (rgba(80,31,145,.2)), ticket-star (green glow rgba(31,145,101,.3) + inset ring), and a 12px lock — then "Away is invite only, you have limited access" and "Got an invite code?".
