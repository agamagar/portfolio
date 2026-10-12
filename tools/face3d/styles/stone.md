# stone: carved stone statue coming to life

Page fetches were blocked by the sandbox proxy, so these sources come from search-result excerpts. "(synthesis)" marks my own inference.

## How it moves on screen

- **Frame rate and stepping:** the reference is Harryhausen-style stop motion: 24 fps, often on ones for the creature, though the result still reads as stepped because nothing is motion-blurred. For a statue, a slightly choppier step sells "grinding". Harryhausen spent years chasing smooth motion, yet made Talos deliberately "stiff and mechanical" because he is a bronze statue come to life.
- **Easing and timing:** heavy. A slow start that builds, then dry contact with almost no rebound. Weight-animation guidance: a stone falls like a rubber ball, but on impact there is "no bounce: dry contact and minimal follow-through". Longer timing reads as heavier. Lots of effort with little movement signals mass. Moves happen one axis at a time, with long holds between, like a statue fighting its own stiffness (synthesis).
- **Squash and stretch:** none. Stone is rigid. Any squash immediately breaks the material.
- **Secondary effects:** low, irregular micro-jitter at the start of a move (a grinding judder). There could also be dust or grit, but no surface boil, because carved stone is not touched between frames the way clay is. Specular should stay rock-steady.
- **Idle:** almost none. A statue is still, so an occasional tiny settle or creak is enough. The blank, still stare is the point: one review calls Talos's rigid motion and blank eyes among cinema's great bogeymen.
- **Never:** squash, bounce, or overshoot. Never move quickly or cheerfully. Never boil the surface.

## Sources

- https://www.tcm.com/articles/1008313/jason-and-ray-harryhausen : Harryhausen made Talos's movement intentionally stiff and mechanical, and the model was about 12 inches tall.
- https://mail.classics.domains.skidmore.edu/lit-campus-only/secondary/Film/Pettigrew%201999%20Jason.pdf : Talos's rigid motion and blank eyes made him menacing.
- https://bloody-disgusting.com/editorials/3960533/before-the-odyssey-there-was-jason-and-the-argonauts-and-ray-harryhausens-legendary-monsters/ : Harryhausen enjoyed animating the bronze man's stiff movements.
- https://www.udit.es/en/timing-y-spacing-en-animacion-que-es-y-como-mejora-la-sensacion-de-peso/ : heavy objects start slowly, and stone lands with dry contact, no bounce and minimal follow-through.
- https://80.lv/articles/a-quick-tip-on-adding-weight-to-your-3d-animations : timing and spacing for weight.
- https://en.wikipedia.org/wiki/Twelve_basic_principles_of_animation : the slow-in/slow-out baseline.

## Motion profile

| field | value | why |
|---|---|---|
| stepMs | 83 | stepped, grinding, unblurred |
| durationScale | 1.6 | maximum weight |
| amplitude | 0.6 | little movement, lots of effort |
| ease | "heavy" | slow start, dry stop |
| overshoot | 0 | no rebound |
| squash | 0.3 | minimum allowed; ideally 0 |
| boil | 0.002 | a hint of grinding judder only |
| idleAmp | 0.15 | statues are still |
| idleRate | 0.4 | |
| pixelSnap | false | |
| turnBudget | 0.2 | stiff neck |

notes: Prefer moving one axis at a time (tilt, then yaw) over blended diagonal moves. A tiny camera shake on the landing of a move would sell weight better than any head squash.
