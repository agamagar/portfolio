# Phone-mock reference photos

Drop the 5 angle reference images here. Each preset in
`src/figures/mockup/mockPresets.js` points at one of these by filename, and the
`/mockups` showcase shows it beside the coded mock so the pose can be tuned
against its north-star. Until a file exists, the showcase shows a dashed "drop
reference here" placeholder (never a broken image).

| Preset id   | Filename           | The reference                        |
| ----------- | ------------------ | ------------------------------------ |
| `reach`     | `reach.jpg`        | Editorial 3/4, WIDE ANGLE, thrust out |
| `two-hand`  | `two-hand.jpg`     | Two hands, over the shoulder, upright |
| `hero`      | `hero.jpg`         | One hand, skyward hero float          |
| `front`     | `front.jpg`        | Straight-on, in-hand product shot     |
| `low-angle` | `low-angle.jpg`    | Looking up from below, cinematic      |

`.jpg` or `.png` both work · if you use `.png`, update the `ref:` path in
`mockPresets.js` to match. Keep them reasonably sized (long edge around 1600px is
plenty for a side-by-side).
