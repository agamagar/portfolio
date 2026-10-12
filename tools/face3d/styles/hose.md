# hose: 1920s-30s rubber hose (Fleischer, early Disney, Cuphead revival)

Page fetches were blocked by the sandbox proxy, so these sources come from search-result excerpts. "(synthesis)" marks my own inference.

## How it moves on screen

- **Frame rate and stepping:** 24 fps hand-drawn. Cuphead's team ran all their animation at 24 fps "to achieve that retro-looking style" while gameplay ran at 60. Lead artist Chad Moldenhauer also described the work as "basically 12 frames per second", which is effectively twos, "and it still looks fluid". Reports conflict on ones versus twos. Twos is the safer read for the era and for our renderer.
- **Easing and timing:** rhythmic, musical and bouncy. Characters "bounce around, usually to a jazzy soundtrack", with each movement shown as a squash-and-stretch sequence. Steamboat Willie's chimneys squash and stretch in time with the music, and "Mickey Mousing" syncs action to music. Big overshoots that settle, lots of anticipation, and motion that never fully stops.
- **Squash and stretch:** maximum. Rubber hose is the most elastic style here: jointless, tube-like limbs and a bendy body. Keep a rough sense of volume (Twelve Principles) but push it far.
- **Secondary effects:** repeated motion cycles (cheap loops bouncing on the beat), light line boil from hand inking, and a period film feel (grain or flicker optional). Pie-cut eyes and white gloves are design, not motion.
- **Idle:** a constant on-beat bounce. The rubber hose idle is a loop of bobbing in tempo (around 2 beats a second, synthesis), never a dead hold.
- **Never:** stillness, realistic restraint, stiff or heavy weight, or sharp anime-style holds.

## Sources

- https://www.engadget.com/2014-07-10-cuphead-interview.html : Cuphead's 1930s style in a 21st-century game.
- https://onmsft.com/?p=66309 and https://gamesradar.com/the-making-of-cuphead : the 24 fps animation split from 60 fps gameplay, and "basically 12 frames per second" (exact attribution between pages unclear from excerpts).
- https://www.inverse.com/article/36647-xbox-one-cuphead-animation : the hand-drawn process, the period techniques and the Fleischer and Disney influences.
- https://www.adobe.com/uk/creativecloud/animation/discover/rubber-hose-animation.html : bouncing to jazzy music, every move as squash and stretch, Steamboat Willie's chimneys on the beat.
- https://year1maca.myblog.arts.ac.uk/?p=6 : musical gags and repeated cycles that cut labour costs (student blog).
- https://garagefarm.net/blog/rubber-hose-animation-the-classic-technique-that-defined-an-era : jointless limbs, Fleischer's Out of the Inkwell, the Cuphead revival.
- https://en.wikipedia.org/wiki/Twelve_basic_principles_of_animation : squash and stretch with volume preservation.

## Motion profile

| field | value | why |
|---|---|---|
| stepMs | 83 | twos at 24 fps ("basically 12 fps") |
| durationScale | 0.8 | peppy, musical |
| amplitude | 1.3 | maximum exaggeration |
| ease | "bouncy" | overshoot and settle on the beat |
| overshoot | 0.25 | maximum |
| squash | 1.6 | maximum, the defining trait |
| boil | 0.004 | light hand-inked line boil |
| idleAmp | 1.5 | constant bounce |
| idleRate | 1.5 | tempo-like, never still |
| pixelSnap | false | |
| turnBudget | 0.3 | |

notes: Ideally quantise the idle to a fixed tempo (for example 120 bpm) so the head bobs on the beat, with squash on the down-beat. The amplitude headroom should go to vertical bounce and squash, not to yaw.
