# noir: 1940s film noir, black and white, hard key light, rain, fedora and coat

Page fetches were blocked by the sandbox proxy, so these sources come from search-result excerpts. "(synthesis)" marks my own inference.

## How it moves on screen

- **Frame rate and stepping:** noir is live-action 35 mm at 24 fps, on ones, with no animation stepping. Every frame is a new photograph. So the motion is smooth, but it should sit on a 24 fps cadence (42 ms), not glide at 60 fps. That cadence is part of the film look (synthesis).
- **Easing and timing:** restrained and cool. Noir acting is underplayed: slow glances, a slight turn into the key light, long still holds while smoke or rain does the moving. Moves are smooth with slow-in/slow-out, and there is no bounce or cartoon overshoot. Faces are often half-hidden by hard shadow, so small head turns change a lot of the image, and big turns aren't needed (synthesis).
- **Squash and stretch:** essentially none. It is a photographed human.
- **Secondary effects:** film grain (re-randomised every frame), brightness flicker, and gate weave (the small mechanical shift of the film in the camera gate). Grain, halation and gate weave are three of Steve Yedlin's four core emulation operations. Gate weave was large in 1930s footage and subtler later, so 1940s sits in between. Rain streaks and the hard shadows of venetian blinds move independently of the face. Treat weave and flicker as a whole-frame effect, not as head boil.
- **Idle:** near stillness, with a slow breath and an occasional slow glance. Let the rain and grain carry the ambience.
- **Never:** squash, bouncy overshoot, cartoon smears, or colour. Never make a fast, cheerful head bob.

## Sources

- https://ltx.studio/glossary/film-noir : low-key lighting, chiaroscuro, venetian blind shadows, rain-soaked night streets.
- https://www.premiumbeat.com/blog/lighting-for-film-noir : hard shadows define the style, and chiaroscuro appears in nearly every noir.
- https://nofilmschool.com/2017/05/recreating-bold-look-classic-film-noir : practical hard key, rim light and a blinds gobo.
- https://nofilmschool.com/four-elements-film-emulation : Yedlin's emulation operations (colour response, grain, halation, gate weave), and that 1930s weave jumps more than 1970s weave.
- https://docs.kdenlive.org/de/effects_and_filters/video_effects/grain_and_noise/filmgrain.html : flicker defined as brightness variation between frames.
- https://aejuice.com/blog/creating-an-old-film-look-in-after-effects/ : flicker done as a random wiggle on exposure.

## Motion profile

| field | value | why |
|---|---|---|
| stepMs | 42 | 24 fps film cadence on ones (between smooth and twos) |
| durationScale | 1.3 | underplayed, slow acting |
| amplitude | 0.7 | restrained performance |
| ease | "smooth" | photographed motion, slow-in/slow-out |
| overshoot | 0 | |
| squash | 0.3 | minimum; a real face |
| boil | 0.002 | stands in for faint gate weave |
| idleAmp | 0.4 | |
| idleRate | 0.6 | |
| pixelSnap | false | |
| turnBudget | 0.25 | small turns into and out of the key light |

notes: If 42 is not allowed, use 0 (smooth) and rely on grain and flicker for texture. Gate weave should move the whole image, or the camera, by a sub-percent amount at 24 Hz. Rain and grain run every frame regardless of stepMs.
