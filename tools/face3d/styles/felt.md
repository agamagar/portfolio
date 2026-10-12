# felt: needle-felt / felt puppet stop-motion

Page fetches were blocked by the sandbox proxy, so these sources come from search-result excerpts. "(synthesis)" marks my own inference.

## How it moves on screen

- **Frame rate and stepping:** stop motion at 24 fps, usually on twos, which is the stop-motion norm (see the clay sources). The felt shorts referenced (Robin Robin, Oh Willy..., Andrea Love) read as soft and slightly stuttery, as hand-posed work does.
- **Easing and timing:** gentle and toy-like. Felt puppets are built like "old plush toys" over wire or ball-and-socket armatures. The joints do the moving and the felt skin rides along, so moves read as a soft toy being nudged: small, careful, with soft settles. Felt let Aardman animators move puppets more quickly than clay, but facial expression was harder.
- **Squash and stretch:** low. Felt doesn't stretch. Robin Robin's director worked around this by sitting the head in the body "like an egg in an egg cup". So the head should tilt and bob as a rigid ball, not deform (synthesis from that quote).
- **Secondary effects:** fuzz shimmer. Loose fibres catch the light differently each time the puppet is touched, giving a soft halo boil that is gentler than clay's sharp fingerprint boil. Expression lives mostly in eyes and small brow or lid changes. Robin Robin's team worked hard to get emotion into flat, brow-less eyes.
- **Idle:** small, soft bob and tilt, stepped, like a toy that is held but not quite still.
- **Never:** large squash, rubbery stretch, crisp snaps, or sharp specular jitter. Never make large head turns, because the puppet is cuddly and compact.

## Sources

- https://www.cartoonbrew.com/stop-motion/styles-in-animation-felt-stop-motion-215313.html : the history of felt animation and its "loose, rougher quality". Emma de Swaef presses wool sheets like a hatmaker.
- https://broadcastnow.co.uk/5178825.article : Robin Robin's characters were designed "as old plush toys using needle felt".
- https://simplymaya.com/news/?p=1137 : felt lets animators move puppets faster than clay but makes facial expression harder.
- https://www.skwigly.co.uk/making-robin-robin/ : the challenge of getting emotion into flat, brow-less eyes.
- https://showcase.uwe.ac.uk/2024/animation-ma/nat-urwin-2207/ : felt over a ball-and-socket armature.
- https://itsnicethat.com/articles/andrea-love-stop-motion-animation-130220 : controlling fine fibres in wool animation.
- Search summary (Robin Robin coverage): "felt doesn't stretch", and the "egg in an egg cup" head solution (exact page not identified in the excerpt).

## Motion profile

| field | value | why |
|---|---|---|
| stepMs | 83 | on twos, stop motion |
| durationScale | 1.05 | soft but light puppets |
| amplitude | 0.85 | small, careful moves |
| ease | "smooth" | soft settles |
| overshoot | 0.04 | |
| squash | 0.4 | felt doesn't stretch |
| boil | 0.004 | soft fuzz boil, gentler than clay |
| idleAmp | 0.8 | |
| idleRate | 0.85 | |
| pixelSnap | false | |
| turnBudget | 0.25 | |

notes: Put expression in eyelids and brows rather than mouth stretch. If a fuzz or rim shader exists, re-seed its noise on each step to get fibre shimmer.
