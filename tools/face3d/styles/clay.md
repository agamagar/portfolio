# clay: claymation / plasticine stop-motion (Aardman-style), soft studio light

Note on sourcing: the sandbox proxy blocked page fetches, so every source below was read from search-result excerpts, not from the opened page. Claims marked "(synthesis)" are my own inference.

## How it moves on screen

- **Frame rate and stepping:** shot for 24 fps projection, but each pose is usually held for two frames ("twos"), so about 12 physical changes a second. Fast actions may go to ones. A smooth 60 fps tween reads as CG, not clay.
- **Easing and timing:** pose to pose with clear slow-in/slow-out. Clay has weight, so moves settle rather than snap. Aardman's acting is broad but gentle: big eye and brow changes, small and deliberate head moves. Overshoot is small because a real puppet has to be physically pushed past the key and back (synthesis).
- **Squash and stretch:** clay can deform, but in practice heads are mostly rigid between replacement mouths and brows. Use moderate squash that keeps volume (Twelve Principles). Too much reads as rubber hose.
- **Secondary effects:** "boil". The surface shimmers slightly from frame to frame because the puppet is touched and re-posed between exposures. Aardman keeps this on purpose, and Nick Park calls it "thumbiness": fingerprints are left visible. Replacement mouths make the mouth shape pop between poses without in-betweening. A tiny positional jitter on holds sells "hand-touched".
- **Idle:** a slow breath or sway, stepped like everything else. A hold is never perfectly frozen, because boil keeps it alive.
- **Never:** perfectly smooth sub-frame interpolation, motion blur, or rubbery elastic overshoot. Never let the surface stay pixel-identical across a long hold (synthesis).

## Sources

- https://en.wikipedia.org/wiki/Claymation : stop motion at 24 fps, usually on "twos", so 12 changes per second.
- https://www.cartoonbrew.com/stop-motion/7-weeks-917-frames-glass-beads-hair-wax-vaseline-inside-early-mans-longest-shot-156986.html : Aardman deliberately kept the "boiling" shimmer on Early Man's Hognob.
- https://ugc.futurelearn.com/uploads/files/26/1e/261e85c8-3b25-41eb-895e-c76b4ddc4eba/GLOSSARY.pdf : definition of a boiling line, the wobble from re-making the image every frame.
- https://www.shortlist.com/entertainment/aardmans-sir-peter-lord-on-his-journey-from-a-kitchen-table-to-hollywood-rocket-packs-and-how-the-studio-favours-thumbiness-over-ai : the studio favours "thumbiness".
- https://www.awn.com/animationworld/aardman-50-inside-clay-felt-and-fingerprints : fingerprints are deliberately kept visible as a handmade element.
- https://m.csmonitor.com/1998/0512/051298.home.home.1.html : clay softens and droops under normal studio lights, so Aardman used low-wattage lights.
- https://en.wikipedia.org/wiki/Twelve_basic_principles_of_animation : squash and stretch preserves volume, and slow-in/slow-out.

## Motion profile

| field | value | why |
|---|---|---|
| stepMs | 83 | on twos at 24 fps |
| durationScale | 1.1 | puppet weight, deliberate acting |
| amplitude | 1.0 | Aardman faces are broad and expressive |
| ease | "smooth" | slow-in/slow-out between held poses |
| overshoot | 0.05 | a small push past the key |
| squash | 0.8 | soft but volume-keeping, less than 2D |
| boil | 0.006 | visible but gentle thumb-boil |
| idleAmp | 0.7 | |
| idleRate | 0.8 | slow breathing sway |
| pixelSnap | false | |
| turnBudget | 0.3 | |

notes: Apply boil only on step changes, never per 60 fps frame. If shape keys exist for the mouth, switch them abruptly (as replacement mouths) instead of tweening them through tiny intermediate values.
