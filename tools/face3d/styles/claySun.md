# claySun: claymation in warm sunlight on a yellow ground

Shares its base research with `clay.md` (on twos, thumbprint boil, volume-keeping squash). This file covers only the differences. Page fetches were blocked by the sandbox proxy, so the sources below come from search-result excerpts. "(synthesis)" marks my own inference.

## How it moves on screen

- **Frame rate and stepping:** the same base as clay: 24 fps on twos.
- **What changes in the sun:** plasticine softens and droops under heat. Aardman's 1998 crew cut the lights to 12 W because the clay "would soon soften and droop" under normal studio lamps. A sun-baked skin should feel lazier and heavier: slower settles and a slight sag after each move. It should also be rougher. The surface is handled more and worked less, so the boil is a bit stronger and less even. The face behaves like warm, slightly tired clay. (The sag and roughness are synthesis from the heat point.)
- **Easing:** heavier and slower out of holds than studio clay. Holds feel long and drowsy, like a hot afternoon. Use only a small overshoot, because softened clay damps it.
- **Squash and stretch:** a touch more give than studio clay, since warm clay is softer, but it stays volume-preserving.
- **Secondary effects:** stronger and less regular boil (a rougher fingerprinted surface). The hard sun throws crisp, moving shadows, so jitter of head position is very visible against the yellow ground. Keep the head-position boil modest and put the roughness into tilt.
- **Idle:** a slower, wider sway with a lazy summer feel.
- **Never:** crisp snaps, high-energy bounces, or a smooth 60 fps glide.

## Sources

- https://m.csmonitor.com/1998/0512/051298.home.home.1.html : under normal studio lights the clay "would soon soften and droop", so low-wattage lamps were used.
- https://thekidshouldseethis.com/post/the-clay-that-makes-aardman-animations-come-to-life : Newplast was chosen because it holds its shape under hot lights, which implies lesser clays don't.
- https://www.awn.com/animationworld/aardman-50-inside-clay-felt-and-fingerprints : fingerprints are kept visible on purpose ("thumbiness").
- https://en.wikipedia.org/wiki/Claymation : 24 fps on twos.
- https://www.udit.es/en/timing-y-spacing-en-animacion-que-es-y-como-mejora-la-sensacion-de-peso/ : longer timing and slow starts read as heavier.

## Motion profile

| field | value | why |
|---|---|---|
| stepMs | 83 | on twos, as for clay |
| durationScale | 1.25 | softened clay, drowsy heat |
| amplitude | 0.95 | |
| ease | "heavy" | sluggish start, sagging settle |
| overshoot | 0.03 | warm clay damps overshoot |
| squash | 0.95 | softer than studio clay |
| boil | 0.008 | rougher and less even surface |
| idleAmp | 0.9 | |
| idleRate | 0.65 | slow, lazy sway |
| pixelSnap | false | |
| turnBudget | 0.3 | |

notes: Bias boil toward tilt rather than translation, because crisp sun shadows exaggerate positional jitter. An optional tiny downward drift (sag) during long holds that recovers on the next emote would sell the softened clay.
