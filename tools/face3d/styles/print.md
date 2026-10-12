# print: Spider-Verse style comic print

Page fetches were blocked by the sandbox proxy, so these sources come from search-result excerpts. "(synthesis)" marks my own inference.

## How it moves on screen

- **Frame rate and stepping:** a 24 fps CG film animated mostly on twos (12 poses a second). Shots were sometimes animated on ones and converted to twos with a custom tool. Ones were reserved for fast action and camera moves, and different characters used different stepping: Miles is jerkier, Peter smoother. The stepping replaces motion blur ("shifting") so that frames stay crisp. The film avoids motion blur entirely, and a VFX supervisor describes holding poses for one, two or three frames to create jittery motion.
- **Easing and timing:** snappy and graphic, closer to 2D than CG. Strong poses, short holds on twos, fast transitions, with ones for the fast bursts. Overshoot is punchy, and the motion keeps the feel of a comic panel coming to life.
- **Squash and stretch:** moderate to strong. The film borrows 2D smears and drawn effects, so stretch on fast moves is allowed.
- **Secondary effects:** halftone dots stand in for light and shading, with hatching for shadow. Misregistration and chromatic offset (colour channels split like misaligned print inks) mark depth and speed. Offset-print artifacts "blur" backgrounds and fast elements instead of motion blur. Drawn smear lines and impact frames sit on top. On holds the halftone and screen pattern stays locked to the screen while the face moves under it (synthesis).
- **Idle:** a subtle idle on twos. A held pose with a slight breath, crisp and stepped.
- **Never:** motion blur, or a floaty 60 fps CG glide. Never use a uniform frame rate everywhere: mixing twos with ones is the signature.

## Sources

- https://cgspectrum.com/blog/spider-man-into-the-spider-verse-how-they-got-that-mind-blowing-look : mostly on twos, a tool to convert ones to twos, no motion blur, stepping ("shifting") as crisp blur.
- https://www.creativebloq.com/features/how-into-the-spider-verse-got-its-mind-blowing-look : Miles on twos reads less confident and jerkier than Peter.
- https://marilajane.substack.com/p/into-the-spider-verse-animation-techniques : halftone as a light source and hatching for shadow.
- https://animationobsessive.substack.com/p/dont-call-it-limited-animation : a Spider-Verse VFX supervisor on holding poses for one, two or three frames for jittery motion.
- https://Kottke.org/19/03/how-animators-created-the-spider-verse : halftones and offset-print artifacts used to "blur" backgrounds and fast elements.
- https://www.sessions.edu/notes-on-design/illustration-art-styles-utilized-in-spider-man-across-the-spider-verse/ : colour-channel splits like misaligned inks, deliberately kept.
- https://blog.garagefarm.net/blog/recreating-the-spider-verse-look-in-the-blender-node-editor : chromatic aberration used to simulate printing errors (recreation tutorial).

## Motion profile

| field | value | why |
|---|---|---|
| stepMs | 83 | twos as the base |
| durationScale | 0.85 | punchy |
| amplitude | 1.15 | graphic, comic poses |
| ease | "snap" | crisp holds, fast transitions |
| overshoot | 0.15 | |
| squash | 1.1 | 2D-influenced stretch on fast moves |
| boil | 0.002 | almost clean; the jitter comes from stepping |
| idleAmp | 0.5 | |
| idleRate | 0.8 | |
| pixelSnap | false | |
| turnBudget | 0.3 | |

notes: Ideally drop to ones (stepMs 0 or 42) during the fastest segment of an emote and return to twos for the settle, since mixing the two is the signature. Spike the chromatic and misregistration offset on fast moves and decay it on holds. Keep the halftone screen-locked.
