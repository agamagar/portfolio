# 12 · The folio page and the scroll map (window-light)

Understanding phase only. Nothing here is built. Written 2026-09-26 by the folio-page and scroll
mapper. Every claim is marked **VERIFIED** (read in code, measured in headless Chrome against
the running dev server on :5173, or read in the three r186 package) or **INFERRED** (my reading,
not proven). Line numbers are as read on 2026-09-26 at about 18:50; `src/App.jsx` was being
edited by another session during this pass (it grew by about 80 lines while I read it), so every
App.jsx line below is also given with a grep anchor.

Evidence (scratch, not project files):
`/private/tmp/claude-501/-Users-agamagarwal-My-Drive-Active---Portfolio/f6eb71b2-3a66-4ec7-b85d-ffd026e2b335/scratchpad/folio12/`
(`measure.mjs`, `measure_phone.mjs`, `zorder.mjs`, `overlay.mjs`, `probe_hic.mjs`, their JSON
output, and captures `desk_0.png`, `desk_700.png`, `desk_1500.png`, `phone_0.png`, `phone_900.png`).

---

## 0. The short answer

- **The "folio page" is `/portfolio`, which is the same mount as the site root `/`.** Both render
  `Hello3` (`src/hello3/Hello.jsx`), and that page's Living Sky is the fixed `.hello-sky` band.
  The window scene replaces that band and nothing else. **VERIFIED.**
- **Recommended pattern: (1) dolly, then hand off, with a "ground-matched" seam.** The camera
  scrubs with scroll from the window down to the monitor and into its screen; at the end the
  screen's own light has become exactly the page ground (`--bg`: `#ffffff` light, `#0e0e11`
  dark), the canvas stops and hides, and the real DOM carries on. No content ever has to match
  across the seam, so nothing goes stale, the viewport aspect does not matter (a phone's
  portrait viewport against a landscape monitor), and the page reads at full native sharpness
  and full accessibility for its whole reading life. The GPU cost is paid only during the
  runway and is **zero** afterwards, which today's sky is not (section 5).
- The monitor, while it is seen from across the room, shows a **pre-captured poster** of the
  page, out of focus, exactly as the reference photo shows it. three r184+ `HTMLTexture` would
  make that live, but it renders **blank** in every browser a visitor actually has
  (section 7), so it can only ever be an off-by-default enhancement.
- Seven questions for Agam are in section 10. The biggest two: what happens to the room after
  the camera enters the screen, and how much scroll the camera move is allowed to hold the page
  still for.

---

## 1. Which page, and where the Living Sky renders today

### The route (VERIFIED)
| URL | What mounts | Source |
|---|---|---|
| `/` | `Hello3` (the default `mode` is `"scan"`, and scan mode is Hello3) | `src/App.jsx:10355` (`useState("scan")`), `:10700-10729` (`mode === "scan" ? (` ... `<Hello3`) |
| `/portfolio` | `Hello3`, identical props | `src/App.jsx:10332` (`const isPortfolio`), `:10696-10697` |
| `/hello3` | `Hello3` | `src/App.jsx:10612` |

The only differences between `/` and `/portfolio`: on `/portfolio` the `.top-controls` row is
annotatable (`data-feedback-toolbar` is unset) and the `PageControl` is not rendered
(`{!isPortfolio && <PageControl`). Everything below applies to both.

### Every place the Living Sky renders (VERIFIED)
| Surface | Mount | Keep or replace |
|---|---|---|
| `/`, `/portfolio`, `/hello3` | `src/hello3/Hello.jsx:286-300`, `ShaderCanvas preset="livingSky"` inside `.hello-sky > .hello-sky__lens`, fed `fetchSky()` + `sunUniforms(place)` (`Hello.jsx:187-224`), `?tod=` and `?u_*=` pins | **Replace with the window scene** |
| `/hello`, `/hello0`, `/hello2` | `src/hello/Hello.jsx:146-149` | Keep (not the folio page) |
| `/list` (old list home) | `Home` renders `<WeatherSky />` (`src/App.jsx:8018`, anchor `<WeatherSky />`) | Keep |
| `/sky`, `/shaders`, art mode | `SkyLab.jsx:174,191`, `ShaderGallery`, `ArtMode.jsx:89-92` | Keep; `/sky` is the natural place to preview every scene state later (INFERRED) |

---

## 2. The page, top to bottom (measured)

Measured in headless Chrome 153 against the live dev server, intro skipped the way a visitor
skips it (key press / pointer down). **VERIFIED.**

### Desktop 1440 x 900, DPR 1 (same geometry in light and dark)
| Layer / section | Box (page px) | Notes |
|---|---|---|
| `.tex-bg` (TexturedBackground) | fixed, full viewport, `z-index: -1` | WebGL grain, renders on demand only (one frame at rest, about 1s during a theme ripple). `src/TexturedBackground.jsx:1-9`, mounted `src/App.jsx:10534` (anchor `TexturedBackground theme`) |
| `.hello-sky` (the Living Sky) | **fixed**, top 0, 1440 x 558, `z-index: 0`, `pointer-events: none`, `aria-hidden` | Height `clamp(420px, 62vh, 760px)` (`src/hello/hello.css:86-97`); fixed on this page by pin mtr8hc5e (`src/hello3/hello3.css:759`); eased elliptical mask `hello.css:98-150`; canvas buffer 1440 x 558 but CSS height 646 (the 88px parallax overhang, `hello.css:209-233`) |
| `.top-controls` | fixed, top 28, right edge at 1380, 38px chips, `z-index: 50` | Sound + theme chips; GlassLens SVG displacement `backdrop-filter` on Chromium (`src/ui/GlassLens.jsx:1-12`); lifts out on scroll down past 48px, back on any scroll up (`src/App.jsx:10504-10515`, anchor `const [navHidden`) |
| `.hello-hero` | 0 to 712, `position: relative; z-index: 1` | Greeting lockup at x 56 to 296, y 256 to 378; Resume / LinkedIn links under it; five-row timeline at x 720 to 1440, y 240 to 484. Fades with `--hero-fade` (1 to 0 over the first half viewport, `Hello.jsx:233-247`, `hello3.css:1211-1223`) |
| `.wg` (work grid) | 712 to 1649 | Four live cards, 630 x 409, two columns, 60px gutters. First card top at 712, so **188px of the work index is above the fold today** |
| `.ap` (Side quests, AlongPath) | 1649 to 2459 | Path marquee (WAAPI `offset-path`, paused off screen), three video plates, a play/pause control; mode 2 is the Timeline |
| `.hello-foot` | 2459 to 2897 | Sign-off heading, FootIllus, two chat-bubble contact links, colophon |
| **Document** | **2897px** (3.2 viewports) | |

### Phone 390 x 844 and 375 x 812, DPR 3 (VERIFIED)
| Section | 390 x 844 | 375 x 812 |
|---|---|---|
| Sky band | fixed, 390 x 523; canvas box 858 wide (the 220% lens, `hello3.css:764-767`), buffer 943 x 575 (`superSample 0.55`, `Hello.jsx:156,296`) | 375 x 503, buffer 907 x 553 |
| Hero | 0 to 842 (greeting y 136, timeline rows y 324 to 783) | 0 to 842 |
| Work grid | 842 to 1850, cards 350 x 227 stacked | 842 to 1811, cards 335 x 217 |
| AlongPath | 1850 to 2404 | 1812 to 2348 |
| Footer | 2404 to 2910 | 2347 to 2848 |
| Document | 2910 | 2848 |

On a phone the first screen is the hero only; the work index starts right at the fold.

### Stacking (VERIFIED, `zorder.mjs` + `overlay.mjs`)
- `.hello` is `position: relative`, `z-index: auto`, no transform, no isolation. The root and
  body paint the ground (`#ffffff` / `rgb(14,14,17)`); `.hello` and every section paint nothing
  ("nothing on the page paints an opaque background, so every section sits on the sky",
  `hello3.css:755-758`).
- The fixed sky (`z 0`) sits under the hero (`z 1`), under the AlongPath section (positioned,
  later in the DOM), and under the work cards: a pixel diff with and without the sky at
  scrollY 712 in dark mode is **exactly 0 on both cards** and 34 mean (max 103) in the 60px
  gutter. So after the hero the sky only shows in the gutters and around sections.
- Fixed descendants live INSIDE `.hello`: `.hello-sky` (`hello3.css:759`), the cinema overlay
  `.ap__cinema` (`hello3.css:1284-1285`, `z-index: 90`), `.hello-sky__tip` (`hello.css:6227`),
  timeline tooltips (`src/hello/timeline.css:1017, 1355, 3117`), `.role__scrim`
  (`hello.css:933`), `.pd` (`hello.css:1803, 5772`).

### The intro (VERIFIED, `src/hello3/useStage.js`)
`center -> rise -> settle -> reveal`, about 2.6s. The body is `overflow: hidden` until
`reveal`; any wheel, touchmove, pointerdown, Escape, Space, Enter or Tab skips to `reveal`.
Plays once per visit (module-level `introPlayed`), starts at `reveal` under reduced motion. The
sky is hidden until `settle`, then fades in and settles up 32px (`hello.css:155-171`).

---

## 3. Scroll machinery in use (VERIFIED)

| Mechanism | Where | What it drives |
|---|---|---|
| **Lenis 1.3.26**, one instance, window only | `src/ui/smoothScroll.js:21-46`, started in `src/main.jsx:10` | Wheel smoothing (duration 1.1s, ease-out-expo). **Not started under reduced motion. Touch stays native** (`syncTouch: false`). `lockBackgroundScroll()` stops it for sheets |
| `html { scroll-behavior: smooth }` | `src/index.css:210-211` | Anchor jumps; Lenis switches it off while it runs (`index.css:199-202`) |
| Scroll listener, rAF-throttled | `Hello.jsx:233-247` | `--hero-fade` on `.hello` (1 at top, 0 by 0.5 viewport) |
| Scroll listener | `src/App.jsx:10504-10515` | Nav lift-out stagger (`data-scrolled`) |
| CSS scroll-driven animation | `hello.css:209-233` | Sky parallax, `animation-timeline: scroll(root block)`, 88px over 0 to 760px |
| IntersectionObservers | `ShaderCanvas.jsx:259-262`, `ClipVideo.jsx:107-123`, `AlongPath.jsx:354-369`, `PathMarquee.jsx:411-412`, `useInViewLoop` (`figures/ds/hooks.js:111`) | Pause GL, videos, marquee, loops off screen |

Not in use on this page: GSAP / ScrollTrigger, `position: sticky` runways, scroll snap (art
mode had snap and is gone). **So a pinned runway is new machinery.** It fits cleanly: Lenis
scrolls the real window, so `position: sticky` and `window.scrollY` stay truthful on every
input path.

Rule for the scene: **one rAF, read `window.scrollY` in it, no second easing.** Lenis already
smooths the wheel; smoothing the camera again would put the camera behind the finger on touch
and double-ease on desktop (INFERRED, standard).

---

## 4. Theme and mobile guardrails already in force

### Theme (VERIFIED)
- `html.dark` class; state in `src/App.jsx:10385` (anchor `const [theme, setTheme]`): `?theme=`
  override, then `localStorage.theme`, then `prefers-color-scheme`.
- Tokens computed: light `--bg #ffffff`, `--fg #111111`; dark `--bg #0e0e11`, `--fg #ededed`.
- Toggle = View Transition circular reveal, 560ms, masked on `::view-transition-new(root)`
  (`App.jsx:10447-10470`), then the WebGL ripple on `.tex-bg`.
- The sky ignores the theme for its content (it is clock-driven) and is damped instead:
  `--sky-op` 1 light / 0.42 dark (`hello.css:179-186`), and below the hero it falls to a floor
  0.18 light / 0.75 of 0.42 = 0.315 dark (`hello3.css:1735-1753`). Measured at rest at scrollY
  1800: **0.180 light, 0.315 dark**.
- `ShaderCanvas` watches the `.dark` class with a MutationObserver and redraws (`u_dark`).

### Mobile guardrails (VERIFIED, `Claude/2026-09-20_mobile-guardrails.md`)
1. `overflow-x: clip` on BOTH `html` and `body` (`index.css:219, 237`).
2. Decorative bleed is fine; widening the document is not.
3. Media declares its own ceiling.
4. Nothing sized in fixed pixels when it has to fit.
5. Test in a real small viewport: `public/mobile-check.html` loads every route in a 375 x 812
   iframe and reports document width, sideways scroll, unclipped overflow, text under 12px and
   tap targets under 44px.
Plus: the sky lens is 220% wide on phones so the shader gets a landscape aspect
(`hello3.css:760-767`), and `superSample 0.55` pays for it. Touch has no hover, so no evidence
can be hover-only (direction doc section 5). Preview-pane facts from memory: `innerWidth` lies
under emulation (use `visualViewport`), WebGL does not appear in pane captures.

---

## 5. Performance budget: what already runs on this page

| Item | Cost | Status |
|---|---|---|
| Living Sky fragment shader | **0.77 to 0.86 ms per frame at 2.36 MP** (home band at 2x) on Agam's Mac; 2.06 ms at 7.46 MP worst case (`Claude/Shader Viewer/2026-08-11_living-sky-all-weather.md:586-597, 765-776`) | **Renders every frame for the whole visit.** Its IntersectionObserver watches `.hello-sky__lens`, which is inside a `position: fixed` box that never leaves the viewport (`ShaderCanvas.jsx:259-262` + `hello3.css:759`), so `visible` is never false on this page. VERIFIED from code |
| TexturedBackground | 0 at rest | One frame per state, about 1s per ripple |
| Videos | 6 decoders at most: `schedule-banner.mp4` 1080x340, `away-zero.mp4` 360x782, `caratlane-invite.mp4` 360x784, `away.mp4` 500x394, `odineye.mp4` 800x448, `follow-that-idea.mp4` 1202x676 | IO-gated (play in view, pause out) |
| WorkGrid cursor tags | 3 rAF loops (`WorkGrid.jsx:86-131`) | Gated by reduced motion only, **not** by visibility (INFERRED small CPU) |
| PathMarquee | WAAPI animations on `offset-path` | Paused off screen |
| GlassLens | SVG displacement inside `backdrop-filter`, two 38px chips | Chromium only; resamples the backdrop whenever it changes, so a moving canvas behind the chips makes it recompute every frame (INFERRED small) |
| Lenis | one rAF | Always on (desktop, motion allowed) |
| WebGL contexts | **2** today (`tex-bg` + sky) plus Agentation's 2D draw canvas in dev | App.jsx comment at the TexturedBackground mount: a third simultaneous GL canvas starved the case-study hero of a context |
| JS | Entry chunk `index-sdz8IBqp.js` **2.41 MB raw / 778 KB gzip** (dist built 2026-09-19); `three@0.169` exists only in the lazy `DjConsole` chunk (538 KB raw / **140 KB gzip**) | `Hello3` is a static import of `App.jsx`, so anything the scene imports statically lands in the entry chunk |

Project rules that bind GPU work (VERIFIED in notes and code):
- Direction doc (`Claude/portfolio-direction-2026.md` section 4): perf and QA are part of the
  craft bar, "LCP budget on a mid-tier phone, prefers-reduced-motion fallbacks, tested
  throttled"; a bug is "a counterexample to the headline claim".
- Direction doc section 5: interactive within about 2.5s regardless of animation; reduced
  motion gets a **designed static composition, which doubles as the OG image**.
- Direction doc section 4 (AGAM decision): **motion = calm precision everywhere, plus exactly
  one theatrical beat**, and the beat is the greeting (PROPOSED). The register boundary: the
  beat is the only motion the SITE starts unprompted. A scroll-scrubbed camera is
  reader-initiated, so it fits; ambient wind and clouds are site-initiated continuous motion,
  which the Living Sky already sets precedent for, and must stay calm.
- Every GL component on the site follows one lifecycle: born-lost retry, one visibility-gated
  rAF, context loss / restore, reduced-motion freeze with u_time pinned and draw-on-change only
  (`ShaderCanvas.jsx:1-9, 242-250`).
- Benchmarking rule (sky note): one GL context, swap programs, interleave A/B rounds, report
  minimum and P10, never medians across multiple live contexts.

**PROPOSED budget for the scene** (to be verified by the build loop, not measured here):
GPU at most 6 ms per frame at 1440 x 900 at DPR 2 on Agam's M3 during the runway, **0 ms after
the hand-off**; at most 8 ms on a mid-tier phone at a DPR cap of 1.5; the outside (Living Sky)
drawn into a half-resolution render target because it is behind glass and out of focus; the
scene REPLACES the sky's GL context so the page stays at 2 contexts; scene code and assets in a
lazy chunk, never in the entry chunk, with a p=0 poster image as the first paint (the same role
the sky's CSS gradient fallback plays today, `hello.css:152-154`).

---

## 6. Four ways to put the portfolio "on the monitor"

| | (1) Dolly, then hand off | (2) DOM on top, scene as a persistent background, screen as a cut-out | (3) DOM mapped onto the 3D screen (CSS3D / matrix3d) | (4) Page rendered into a texture |
|---|---|---|---|---|
| Accessibility | Full: the DOM never leaves, the canvas is `aria-hidden` | Full | DOM is real, but focus rings, caret, selection and screen-reader bounding boxes are projected through the perspective | None in the texture; the DOM must stay anyway for assistive tech |
| Text sharpness | Native at rest. During the dolly the screen shows a poster that is soft by design (depth of field, as in `ref_1600`) | Native | Chrome rasterises a transformed layer at one scale and resamples it: soft or shimmering while the matrix changes, crisp only when it is identity (INFERRED, standard Chromium behaviour) | Resampled; legible only at 1:1 |
| Scroll performance | GPU only during the runway; `position: sticky` stage is compositor-friendly; 0 after | Scene renders under the whole page unless frozen to a still floor frame | Whole 2.9k px page (6 videos, marquee, masks, backdrop filters) inside one `preserve-3d` subtree; big layers, re-raster on scale change; the page's own scroll must happen inside the plane or fight Lenis | Upload cost per update; the only live option (HTMLTexture) needs a flag |
| Mobile | Tunable tier. Aspect mismatch disappears with a flat-ground seam (section 8) | Contrast is the problem, not cost | Worst: iOS Safari `preserve-3d` with video and `backdrop-filter` (INFERRED from long-standing WebKit behaviour) | Cheap as a poster |
| Breaks existing code? | No | No, but the full-bleed layout (content 60 to 1380 on 1440) leaves no room for a bezel unless every section shrinks to a screen-sized column | **Yes**: any transform on the page wrapper becomes the containing block for its fixed descendants (the sky, `.ap__cinema`, tooltips, scrims, section 2). The codebase already documents this trap at `hello.css:5307-5310` | No |
| Occlusion by 3D objects | Not needed | Needs the canvas above the DOM with a hole | Needs a second GL canvas above the CSS3D layer with a hole | Native |
| Agentation | Content unchanged. The canvas is `pointer-events: none`, so scene objects need hotspots (section 8.6) | Same | Picking works (hit testing honours transforms), but pins are stored as `rect.y + scrollY` at pin time (`agentation@3.0.2`, `isEffectivelyFixed`), so markers drift as the transform changes with scroll | Contents cannot be annotated at all; every pin lands on the canvas |
| Existing header | Unchanged; it lifts out on scroll down, so the runway plays unobstructed | Unchanged | Must stay outside the transformed plane | Unchanged |
| Verdict | **Recommended** | Only as a post-hand-off tint, if Agam wants the room to stay (Q1 b) | Not recommended, not even as a transition device, because of the fixed-descendant break | Poster only, for the screen seen from across the room |

Why not a straight texture-to-DOM crossfade in (1): the cards are live (three videos, a scroll
tour, human-motion cursors, `WorkGrid.jsx`), the page is two layouts (1440 two-column, 390
stacked) in two themes, and fonts load late. A texture that must match the DOM pixel for pixel
at the seam would pop on every one of those. The ground-matched seam removes the requirement.

---

## 7. What three r186 changes for this (VERIFIED in `three@0.186.1`, npm, published 2026-09-24)

- **`HTMLTexture`** (`src/textures/HTMLTexture.js`, added in r184, PR #31233): live HTML as a
  texture through the HTML-in-Canvas API. The WebGL path (`src/renderers/webgl/WebGLTextures.js:1257-1318`)
  moves the element INTO the canvas, sets `layoutsubtree`, and uploads with
  `gl.texElementImage2D`. **If `texElementImage2D` is missing it uploads nothing: a blank
  screen, no error.**
- **Chrome 153 stable (installed here) exposes none of it by default**: `requestPaint`,
  `layoutSubtree`, `drawElementImage` and `texElementImage2D` are all absent; all four appear
  with `--enable-blink-features=CanvasDrawElement` (`probe_hic.mjs`). The origin trial ran
  Chrome 148 to 150; Safari and Firefox have not committed (Chrome developer blog, WICG repo).
  So for this site it is a Chromium-flag enhancement at best.
- **`InteractionManager`** (`examples/jsm/interaction/InteractionManager.js`): computes a CSS
  `matrix3d` per frame so an `HTMLTexture`'s element stays under its mesh for native hit
  testing. Useful pattern for the Agentation hotspots (section 8.6), in plain 2D form.
- **`HTMLMesh`** (`examples/jsm/interactive/HTMLMesh.js`, r186 PR #34172 improved form
  controls): draws a subset of CSS with canvas 2D; no video, no masks, so not faithful to this
  page.
- **`CSS3DRenderer`** still ships (`examples/jsm/renderers/CSS3DRenderer.js`, `preserve-3d` +
  `matrix3d`), which is pattern (3).
- **WebGLAnimation now schedules the next frame before the loop callback** (PR #34448). Stop the
  loop with `renderer.setAnimationLoop(null)`, not by returning early from the callback.
- **Render-target viewports are no longer scaled by the pixel ratio** (PR #34333): size the
  half-resolution sky target in physical pixels explicitly.
- Version: `package.json` pins `three ^0.169.0` (installed 0.169.0, used by `/dj`). Moving to
  0.186.1 moves `/dj` too (one version per package), so `/dj` needs a re-check in the same
  change (INFERRED).

---

## 8. The recommendation in detail: dolly, then a ground-matched hand-off

### 8.1 Layering
- One canvas, where `.hello-sky` is now: `position: fixed`, `z-index: 0`, `pointer-events: none`,
  `aria-hidden`. Hero stays `z-index: 1` above it; `.top-controls` stays `z-index: 50`.
- The scene draws the outside (the Living Sky shader as a material on the view plane beyond the
  glass) in the same GL context, so the page stays at two contexts.
- The runway is a new tall wrapper around the hero: `height: calc(100svh + R)` with a
  `position: sticky; top: 0; height: 100svh` stage. Progress
  `p = clamp((scrollY - runwayTop) / R, 0, 1)`. R is Q2 (proposed 1.0 viewport).

### 8.2 Keyframes (pure function of p, so scrolling back reverses exactly)
| p | Camera | DOM |
|---|---|---|
| 0.00 | On the window: panes, grille, sky, a hint of frame (Agam: "only the window and the sky") | Greeting and timeline over it, as over the sky today |
| 0.00 to 0.30 | Crane starts | Hero fades (re-key the existing `--hero-fade` rule to p) |
| 0.30 to 0.65 | Crane down and pull back: sill, Hot Wheels car, the lamp head rising behind the monitor's top-right corner, the monitor's top edge and menu bar entering frame | Nav already lifted out |
| 0.65 to 0.97 | Dolly into the screen until it covers the viewport; the screen's poster defocuses and its emission rises to exactly `--bg`; room exposure falls away ("the screen's light fills the room") | |
| 0.97 to 1.00 | Canvas opacity to 0 over an identical ground (invisible), then `setAnimationLoop(null)` and `visibility: hidden` | Work grid arrives as normal DOM |

The lamp is behind the monitor from the chair (its clamp and arm are hidden by the monitor's top
edge in `ref_5484`), so nothing occludes the screen on this path (VERIFIED from the photo).

### 8.3 The hand-off math
For a panel of height H facing the camera with vertical field of view v, the panel covers the
whole viewport once `d <= H / (2 tan(v/2))`, for every viewport aspect up to the panel's own
(height governs). Example (INFERRED 27 inch 16:9 panel, active 598 x 336 mm; v = 56.9 degrees,
the photo's 24mm-equivalent figure): d = 336 / (2 x 0.5418) = **310 mm**. At that distance the
panel is **1.11x** the viewport's width on 1440 x 900 and **3.85x** on 390 x 844. So a phone
would only ever see a quarter-width slice of the screen at the seam, which is why the seam must
be a flat ground and not content. An ultrawide viewport (aspect above 1.78) is width-governed.

### 8.4 What the monitor shows before the seam
A pre-captured poster of the page's first screen per theme (and per breakpoint), generated by a
headless script like the ones used in this pass, stored beside the scene assets, regenerated in
the same command that builds the scene. Depth of field keeps it soft, which the reference photo
already shows. Nice live detail: the in-scene macOS menu bar clock can show the real time
(`ref_5484` shows "Sat 26 Sep 6:40 PM"). `HTMLTexture` only behind a feature check and off by
default.

### 8.5 When the render loop runs
- Runs only while the runway intersects the viewport. **Observe the runway element, never the
  fixed canvas** (today's sky shows why: a fixed box always intersects).
- Stops at p >= 1, when the tab is hidden, while Agentation annotate mode is on (freeze so pins
  land on stable geometry: `useAgentationActive`, `src/figures/ds/agentationActive.js`), and
  while the `.ap__cinema` overlay or any sheet holds the page.
- While scrolling: display rate. At rest in the runway: ambient only (leaves, clouds), 30 fps is
  enough for slow sway (INFERRED, to be judged by eye).
- No camera motion at rest: no idle breathing, no pointer parallax. A camera drifting behind
  still text makes the text appear to slide.
- Reduced motion: no runway (R = 0), the p = 0 frame as a still (one draw, as `ShaderCanvas`
  does), a plain cut to the page. That still is the designed static composition and the OG image.
- Low tier (no WebGL, context lost, `saveData`): the poster stays and nothing else loads.

### 8.6 Agentation, the header, the weather tooltip, the theme toggle
- **Agentation**: the canvas stays `pointer-events: none`, so today it could only ever pin the
  hero section. Build scene hotspots on the existing `LayerMap` mechanism
  (`src/figures/ds/LayerMap.jsx`): invisible named boxes (window, sky, tree, lamp, monitor,
  sill, car) projected each frame from the objects' bounding boxes, rendered only while annotate
  mode is on, each carrying `data-scene-p` and the time-of-day bucket so a pin records WHICH
  frame it was about. Agentation 3.0.2 records fixed elements in viewport coordinates, so
  without that attribute a pin cannot say which camera position it meant.
- **Header**: unchanged. It lifts out as soon as the visitor scrolls down past 48px, so the
  runway plays clear of it. Over the p = 0 frame the chips' 1px stroke at 45% ink (3.05:1 on
  white per the 2026-09-09 note) will fail 3:1 over a dark room in light theme (INFERRED):
  re-run the colour gate over the scene.
- **SkyTip** (`src/hello/SkyTip.jsx:62-80`) decides "bare sky" from the `.hello-sky` rect and a
  class list; with the scene it should use the projected rect of the glass panes.
- **Theme toggle**: the View Transition snapshots the canvas as it last drew. Redraw the scene in
  the new theme synchronously inside the transition callback, or it will pop after the 560ms
  reveal (INFERRED, untested).

---

## 9. The contract that keeps the content from being overpowered

1. **Layer**: content is always real DOM above the canvas; the canvas never takes pointer
   events or focus and is `aria-hidden`.
2. **Contrast**: every text box that sits over the scene (greeting, links, timeline rows, the
   top chips) clears 4.5:1 for text and 3:1 for non-text against the worst scene luminance
   under it, measured by rendering the scene states offscreen and sampling under each box: at
   least 9 hours x {clear, overcast, rain} x 2 themes = 54 states. Fixes in this order: scene
   exposure, depth of field, a local paper-coloured scrim behind the text block. Ratio written
   into a code comment (the house colour gate).
3. **Motion**: the camera moves only when the reader scrolls; ambient motion is leaves and
   clouds at low amplitude; nothing in the scene moves while the reader is on the content.
4. **GPU**: zero after the hand-off; two GL contexts on the page at most; the budget in
   section 5.
5. **Time to content**: the greeting keeps its intro and its skip; the runway never blocks
   keyboard or anchor navigation (a focused card scrolls into view and the scene simply jumps
   to p = 1).
6. **Mobile check**: the scene route passes `public/mobile-check.html` with document width
   equal to the viewport and zero sideways scroll.

---

## 10. Questions for Agam (each one changes code or visuals)

1. **After the camera reaches the monitor, where does the room go?**
   a. Hand-off: the screen's light fills the view and becomes the page; the room is gone until
   you scroll back up. b. The room stays behind the content as a dim, soft tint for the whole
   page, the way the sky does today (your pin mtr8hc5e "on scroll the sky will be visible
   across"). c. Hand-off, plus a bookend: at the footer sign-off the camera pulls back out of
   the monitor into the room at that hour.
   Recommendation: **a**. b puts dark wood and a high-contrast grille behind 16 to 18px text and
   keeps the GPU busy for the whole visit; c is lovely but is a second runway and a second
   mounted scene, better as a later pass.
2. **How long may the page hold still while the camera moves?**
   a. About 1 viewport of extra scroll (900px on a 1440 x 900 screen). b. About 2 viewports,
   slower and more cinematic. c. No hold: squeeze the move into today's 712px hero and let the
   work cards slide up over the room mid-move.
   Recommendation: **a**. c hides the monitor behind the cards exactly when it should arrive;
   a and b both push the work index below the fold, which the direction doc's first-screen
   proposal (still unratified) wanted above it.
3. **Where does the greeting live?**
   a. Over the window at the top, fading as the camera moves, as over the sky today. b. On the
   monitor: the top frame is pure window and sky, and the greeting is the first thing on the
   screen after the hand-off. c. Face, name and Resume / LinkedIn over the window; the five
   timeline rows move below the hand-off.
   Recommendation: **a**, it keeps the Resume link on screen one and the intro untouched; the
   camera framing then has to keep a calm area behind the text.
4. **The room follows the real hour. What does the site theme do to it?**
   a. Scene ink: text over the scene turns light or dark with the room's real brightness; the
   theme only decides the page after the hand-off. b. Theme exposure: light theme renders every
   hour bright and airy, dark theme renders the true, moody exposure; text keeps the theme ink.
   c. The scene ignores the theme; a soft paper-coloured scrim appears behind the text block
   whenever contrast fails.
   Recommendation: **a**. The room stays honest at every hour and the text never sits dark on
   dark; b makes a light-theme night a grey murk.
5. **Whose sky is outside the window?**
   a. Yours: Bangalore's live weather and local time, because it is your window. b. The
   visitor's: their city's weather and their clock, as the Living Sky does today (IP lookup).
   c. Your place, the visitor's clock.
   Recommendation: **a**. It changes the weather fetch (a fixed location instead of the IP
   hop), the tooltip copy ("my sky" vs "your sky"), and whether a London visitor sees rain
   outside a Bangalore window.
6. **What does a phone get?**
   a. The same live scene on a lighter tier (DPR cap 1.5, baked light, no real-time shadows),
   dollying into the main landscape monitor (the flat-ground seam makes the crop invisible).
   b. The same, but the phone dollies into the portrait second monitor on the left of the desk
   (`ref_5480`), which matches the phone's shape. c. No WebGL on phones: a still of the window
   with the live sky in the panes, then a crossfade to the page.
   Recommendation: **a**. b means modelling the second monitor to hero quality and a separate
   camera path; c throws away the scene on the surface recruiters screen on.
7. **At the top of the page, how does the scene meet the page?**
   a. Full-bleed: the first screen is the window edge to edge, feathering into the page ground
   only at the bottom. b. A vignette floating in the page's paper, dissolved by the same eased
   elliptical mask the sky band uses today (`hello.css:98-150`). c. Full-bleed in dark theme,
   vignette in light theme.
   Recommendation: **a**. A dark wooden window dissolved into white paper reads as a smudge;
   full-bleed reads as a photograph.

---

## 11. Decided here, not asked (answers the code and notes already give)

- Page: `/portfolio` and `/` (Hello3). Other Living Sky mounts stay.
- Camera is scrubbed 1:1 by scroll, never a timed shot: the direction doc's register boundary
  allows only the greeting as site-started theatre.
- The intro is unchanged and plays over the p = 0 frame; the scene fades in at `settle`, like
  the sky now.
- Reduced motion: no runway, a still, a cut. Lenis already stays off.
- One rAF, reads `scrollY`, no extra easing on top of Lenis.
- The scene replaces the sky's GL context (two contexts on the page, not three) and ships as a
  lazy chunk behind a poster.
- CSS3D is out (fixed-descendant break); `HTMLTexture` is an off-by-default enhancement only.
