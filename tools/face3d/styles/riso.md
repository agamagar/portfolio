# riso: risograph print / photocopy collage (zine look)

Page fetches were blocked by the sandbox proxy, so these sources come from search-result excerpts. "(synthesis)" marks my own inference.

## How it moves on screen

- **Frame rate and stepping:** riso animation is literally printed frame by frame. Artists translate the digital animation into contact sheets, separate the colours per ink, print, and then re-shoot or re-scan the prints to sequence them. That makes it inherently low-rate and choppy. Cut-out collage animation (Terry Gilliam's Monty Python work) is similarly "very, VERY roughly animated" by sliding paper pieces under a camera. A choppy 8 fps feel is right (synthesis from the process).
- **Easing and timing:** cut-out logic. Pieces slide and rotate rigidly with little in-betweening, so motion is abrupt: a piece jumps to a new place and holds. Gilliam called the method "the quickest, easiest form of animation" and his own style "cheap and nasty". Little easing, a slightly mechanical feel.
- **Squash and stretch:** low. Paper cut-outs don't deform. They rotate and translate as rigid pieces.
- **Secondary effects:** misregistration wobble is the signature. Each ink layer lands slightly offset, and that offset changes every printed frame, so colour layers jitter against each other independently. Bottini: "all of the errors and hiccups along the way produce the final riso effect". Alignment between frames is hard to keep consistent, which is the source of the wobble. Add grain or toner speckle that changes per frame, and a whole-frame paper jitter.
- **Idle:** a held pose with continuous per-frame registration jitter. The image is never quite still, even when the face is.
- **Never:** smooth tweening, soft gradients in motion, or perfect registration. Never make elastic, bouncy cartoon motion.

## Sources

- https://williambottini.myportfolio.com/spinning-heart-risograph-animation : the riso animation workflow (contact sheet, per-ink separation, dozens of prints to align), with errors as the aesthetic.
- https://chaski.notion.site/risograph-animation-726dfe38cf4d49d9b8a6c7d4278fcc8d : frame alignment was inconsistent, so frames were separated manually before sequencing.
- https://desirabilitylab.com/backfill/backfill-2023-234-risograph-print-zines : slight misregistration between passes creates the overlap effect.
- https://zinehug.substack.com/p/wind-y-weather : riso animation as an active zine and workshop practice.
- https://laughingsquid.com/terry-gilliam-explains-monty-python-cutout-animation/ and https://makezine.com/article/craft/how-to_cut-out_animation_with/ : Gilliam's cut-out method, "quickest, easiest".
- https://michaelgerharz.com/2022/08/05 : the paper cut-outs were "very, VERY roughly animated".
- https://variety.com/2024/film/news/terry-gilliam-annecy-animation-festival-lifetime-achievement-award-masterclass-1236030328 : Gilliam on his "cheap and nasty" style.

## Motion profile

| field | value | why |
|---|---|---|
| stepMs | 125 | about 8 fps, printed and re-shot frames |
| durationScale | 0.95 | |
| amplitude | 0.9 | |
| ease | "snap" | cut-out pieces jump and hold |
| overshoot | 0.05 | |
| squash | 0.4 | paper doesn't stretch |
| boil | 0.009 | stands in for per-frame paper and registration jitter |
| idleAmp | 0.5 | |
| idleRate | 0.7 | |
| pixelSnap | false | |
| turnBudget | 0.25 | |

notes: The real signature is per-ink misregistration. If the shader has separate colour layers, offset each by an independent random 1 to 3 px on every step. That matters more than head boil.
