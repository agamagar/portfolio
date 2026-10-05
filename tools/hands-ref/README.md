# Hands reference drop

Save the 25-pose hands reference sheet here as **`sheet.png`** (this exact name).

Path (easy to reach in Finder): My Drive → Active - Portfolio → Portfolio → tools → hands-ref → `sheet.png`

Why: pasted-in-chat images are not saved to disk and cannot be pulled into a file,
so a real pixel overlay needs the sheet dropped here as an actual file. Once it is,
`scratchpad/overlay-hands.mjs` slices it into 25 cells, fits each SVG hand to the
same ink bounding box, composites them (reference in black, SVG in magenta), and
scores per-cell pixel divergence. Not shipped (lives under tools/).
