# pixel: 16-bit era pixel-art sprite animation

Page fetches were blocked by the sandbox proxy, so these sources come from search-result excerpts. "(synthesis)" marks my own inference.

## How it moves on screen

- **Frame rate and stepping:** sprites run at the game's 60 Hz display, but each sprite frame is held for many ticks. Typical cycles are tiny: Celeste's run is 4 frames, Shovel Knight's walk 6, Hollow Knight's walk 8. One example gives per-frame durations of about 100 ms for a run, 150 ms for a walk, and 300 ms for idle frames. So the effective rate is roughly 6 to 10 drawings a second.
- **Easing and timing:** timing is done by varying hold length per frame, not by spacing. Hold the key or impact frame longer and the in-betweens shorter, so it is snappy. Equal durations on every frame "feel mechanical".
- **Squash and stretch:** expressed in whole pixels only. At sprite scale, a 1 px squash on a 16 to 32 px head is a big squash, so keep it moderate and quantised (synthesis).
- **Secondary effects:** pixel-grid snapping is the defining trait. Positions and rotations must land on the coarse grid. "Sub-pixel animation" in pixel-art usage does not mean moving by fractions of a pixel. It means repainting cluster colours on an in-between frame to suggest a half-pixel shift. Palette cycling (Mark Ferrari's technique of rotating a 256-colour palette) can animate ambient light, water or shimmer without redrawing.
- **Idle:** a 2 to 4 frame breathing bob of 1 px, with long holds (around 300 ms each). It is the classic idle.
- **Never:** move on sub-pixels or blend positions smoothly. Never rotate the sprite freely, because rotation smears pixels. Never anti-alias edges on motion or motion-blur.

## Sources

- https://tinywarriorgames.com/2019/01/04/game-development-pixel-art-sub-pixel-animation/ : what "sub-pixel animation" means in pixel art (repainting in-between pixels, not fractional positions).
- https://www.sprite-ai.art/guides/animation-principles : timing equals per-frame hold length; long impact frames add weight; equal durations feel mechanical (vendor page).
- https://www.sprite-ai.art/blog/pixel-art-animation : frame counts from Celeste, Shovel Knight and Hollow Knight (vendor page).
- https://skillselion.com/skills/omer-metin/skills-for-antigravity/pixel-art-sprites : example frame durations of 100, 150 and 300 ms (aggregator, illustrative only).
- https://divoom.com/blogs/app-guide/how-to-animate-pixel-art-divoom-display : fewer frames read as snappy.
- https://wikipedia.com/wiki/Color_cycling and https://80.lv/articles/color-cycling-from-the-90s-returns-with-html5 : Ferrari's palette cycling from a single 256-colour image.

## Motion profile

| field | value | why |
|---|---|---|
| stepMs | 125 | about 8 fps sprite cadence (between the 100 and 150 ms examples) |
| durationScale | 0.9 | snappy game feel |
| amplitude | 1.0 | sprites read big, clear poses |
| ease | "snap" | long holds on keys, quick in-betweens |
| overshoot | 0.1 | a one-frame anticipation or overshoot pose is common in sprites |
| squash | 0.8 | quantised to the grid anyway |
| boil | 0 | sprites are copied pixel-exact, so no boil |
| idleAmp | 0.6 | a 1 px bob |
| idleRate | 0.7 | |
| pixelSnap | true | mandatory |
| turnBudget | 0.2 | yaw smears texels; sprites show mostly front or 3/4 views |

notes: Snap the final screen-space head offset to the pixel grid after easing, and quantise tilt to a few discrete angles. If the shader supports it, palette-cycle highlights on idle instead of moving the head.
