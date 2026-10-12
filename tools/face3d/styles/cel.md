# cel: modern cel / anime-style 2D (limited animation)

Page fetches were blocked by the sandbox proxy, so these sources come from search-result excerpts. "(synthesis)" marks my own inference.

## How it moves on screen

- **Frame rate and stepping:** a 24 fps base, but TV anime is mostly "shot on threes": each drawing is held for 3 frames, about 8 drawings a second. With modest motion, threes looks little different from full animation. Fast action may jump to twos or ones. Limited animation holds each drawing for 2 or 3 frames.
- **Easing and timing:** snappy pose to pose. Long holds on strong key poses, then very fast transitions with few in-betweens. Limited productions put holds where motion should feel slow, because they have no budget for slow-in/slow-out frames. "Nakanashi" omits in-betweens in fast motion to exaggerate speed. The result is hold, flash, hold.
- **Squash and stretch:** moderate. Anime faces keep model and don't go rubbery, but a quick move uses a smear frame.
- **Secondary effects:** smear frames, stretched shapes that bridge distant poses in place of motion blur. Impact frames are one or two flashed high-contrast drawings on a key hit. Holds are perfectly still. Clean digital cels don't boil, and a held cel is a static image. Mouth flaps use 2 or 3 shapes, stepped.
- **Idle:** mostly a held still with an occasional blink or hair sway on twos or threes. Anime idles are economical.
- **Never:** smooth 60 fps tweening of the whole head (it reads as 3D or "Flash"), constant jitter on holds, or a floaty, ease-everywhere motion.

## Sources

- https://AnimeNewsNetwork.com/encyclopedia/lexicon.php?id=61 : TV anime is shot on threes (about 8 fps), often barely noticeable versus full motion.
- https://en.wikipedia.org/wiki/Limited_animation : anime uses low frame rates, held drawings and limited mouth movement.
- https://www.cgg.cs.tsukuba.ac.jp/projects/2013/motion_frame_omission/data/IWAIT.pdf : drawings held 2 to 3 frames, and "nakanashi" omission of in-betweens for speed.
- https://celshaded.newgrounds.com/news/post/921580 : cheap productions on threes and fours used holds instead of slow-in/slow-out frames.
- https://blog.animschool.edu/?p=608 : smears connect widely spaced shapes in place of motion blur.
- https://knowyourmeme.com/memes/cultures/impact-frames : impact frames are split-second striking images for key hits (Yutaka Nakamura).
- https://animationobsessive.substack.com/p/dont-call-it-limited-animation : twos and threes as an expressive choice, not just economy.

## Motion profile

| field | value | why |
|---|---|---|
| stepMs | 125 | on threes at 24 fps |
| durationScale | 0.85 | snappy, with time spent in holds |
| amplitude | 1.1 | strong key poses |
| ease | "snap" | holds on keys, fast in-betweens |
| overshoot | 0.15 | a punchy pose past the key that settles |
| squash | 1.0 | |
| boil | 0 | digital cels don't boil |
| idleAmp | 0.35 | economical idles |
| idleRate | 0.6 | |
| pixelSnap | false | |
| turnBudget | 0.3 | |

notes: For the fastest transition in an emote, consider dropping to twos (83 ms) for that segment only, or inserting a single stretched smear step. An optional one-step flash on impact beats is welcome.
