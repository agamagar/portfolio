# 30 · Locked brief: the window scene

Locked 2026-09-26 from Agam's answers to three rounds of questions. This file wins over every
other file in this folder where they disagree. `20-question-bank.md` "Just build" stays the
default for everything this file does not override.

## Agam's answers

| Topic | Answer | What it means for the build |
|---|---|---|
| Reading mode (Q06) | Hand-off plus bookend | The camera scrubs from the window to the monitor; the screen's light rises to exactly the page background (`#ffffff` light, `#0e0e11` dark); the canvas stops and hides; the real DOM carries on. At the footer a second runway pulls the camera back OUT of the monitor into the room at that hour (the closing shot). |
| Whose sky (Q05) | Yours, with a toggle | Default: Agam's sky, Bangalore city centre (12.97, 77.59, never the photos' GPS) on IST for every visitor. A toggle switches the window to the visitor's own city and clock (today's Living Sky IP chain). Separate cache keys per mode. |
| Surreal (Q04) | Build all the modes, with a dropdown | Three looks, one scene: **Dreamlike**, **Heightened realism**, **Photo-true**. A visitor-facing dropdown switches between them live. |
| Look menu | Visitors see it, Dreamlike loads first | Default look = Dreamlike. |
| Tree (Q01) | Bamboo | Speech-to-text heard "ballot tree" and "biometry's leaves" for "bamboo tree" and "bamboo tree's leaves". |
| Bamboo in view | Canes and leaves | Green canes cross the right-hand panes with leafy tops above; whole canes bend in gusts and leaves flutter. Plain green canes (not golden striped) unless a photo says otherwise. |
| Right leaves (Q11) | Angled, handle leaf ajar | The right section is built at about 31 degrees as photographed; the handle leaf stands slightly open and rocks a degree or two in real gusts, so the bead chain stirs and rain can reach the sill. |
| 37 degrees (Q03) | Tilt of the shade | The shade axis is tipped about 37 degrees off the chair's line of sight; the cone (about 40 degree half-angle, 0.70 rad, penumbra soft) is fitted to the glow in the 18:40 photos; 3000 K, duv +0.003, `#ffbe6c`. |
| Dreamlike touches | Moon in the window, glowing motes, blocked panes opened | See "The three looks". No Milky Way. |
| Controls | Beside the theme toggle | The sky toggle (mine or yours) and the look dropdown sit in the header next to the existing `ThemeToggle` (`src/App.jsx` around line 9996). |
| "The ones" (Q02) | Winds | Real wind speed, direction and gusts drive the bamboo, the far trees, the clouds, the rain slant, the ajar leaf and the bead chain. No sound in v1. |
| Real size (Q18) | Agam will send three numbers | Pane clear-glass width, monitor screen to glass, sill depth. Until they land, build from the photo estimates. Every dimension is derived from ONE pane-width constant `W` plus the gap and the sill depth in `params.js`, so the numbers change three values and nothing else. When they arrive they go in `31-measurements.md`. |

## The three looks

One scene, one geometry, three parameter presets in `looks.js`. Switching is live (no reload).

1. **Dreamlike (default).** Heightened realism as the base, plus:
   - **The moon in the window.** The real moon with its true phase and illuminated-limb angle from the data, moved into the view (a north-facing window could never see it). Placed in the upper left pair of panes, visible whenever it is above the horizon in reality, and at night shown even when it is not (it is a dream). It lights the clouds and the bamboo edges softly.
   - **Glowing motes.** Pollen or firefly-like specks drifting in the lamp beam and around the bamboo, pushed by the real wind, brighter at night, sparse at noon.
   - **Blocked panes opened.** The grey far-right column clears to show bamboo and sky, so the whole window becomes a view.
2. **Heightened realism.** Geometry and materials true to the photos; light and air pushed: dust motes in the lamp beam, a richer golden hour, crisper clouds, slightly cleaner glass. Believable as a photograph, not a pixel match.
3. **Photo-true.** Indistinguishable from the photos, heavy glass dust and true exposure included, judged side by side against the reference renders by the loop.

## Build order (sandbox first)

1. **Sandbox route `/window`** (unlisted, like `/dj`): the full scene edge to edge, with a scroll runway and a stand-in page after the hand-off, plus a dev tuning panel behind `?gui=1`. The home page is not touched while the scene is being built and tuned.
2. **Integration into the folio page** (`/` and `/portfolio`, Hello3, the `.hello-sky` slot at `src/hello3/Hello.jsx:286`) behind a `?scene=window` flag until Agam approves it, then the flag's default flips.

## The capture contract (every builder implements it, every tool relies on it)

URL parameters on `/window` (and later on the folio page when the flag is on):

| Param | Values | Meaning |
|---|---|---|
| `look` | `dreamlike`, `heightened`, `photo` | the look preset (default `dreamlike`) |
| `tod` | decimal hours in IST, for example `17.68` | freeze the clock at that time of day (default: live) |
| `wx` | `live`, `clear`, `partly`, `overcast`, `rain`, `storm` | weather override (default `live`) |
| `sky` | `mine`, `yours` | whose sky (default `mine`) |
| `p` | `0` to `1` | camera progress along the main runway (window to monitor); pins the camera and disables scroll control |
| `p2` | `0` to `1` | camera progress along the bookend runway (monitor back out to the room) |
| `shot` | `ref1741` | pin the camera to the solved 17:41 reference framing (vertical FOV 56.8 degrees, 4:3) |
| `t` | seconds | freeze ambient time (wind, motes, clouds) at this value for deterministic frames |
| `capture` | `1` | hide all DOM chrome, fixed random seeds, deterministic time, accumulate TRAA at a static camera |
| `gui` | `1` | show the dev tuning panel |
| `set` | `a.b.c:value,d.e:value` | override any param path in `params.js` |
| `backend` | `webgpu`, `webgl2` | force a backend (`webgl2` passes `forceWebGL: true`); default lets WebGPURenderer choose |
| `theme` | `light`, `dark` | the page theme for the hand-off colour and posters (default: the site's current theme) |

World frame (every module uses it): metres; x to the right, y up, +z from the window toward the room and the chair. Origin = the point on the glass plane of the LEFT French pair, at the top surface of the sill, horizontally centred on the pair's meeting stiles. The outside is at negative z.

Global hook for tools:

```js
window.__windowScene = {
  ready,            // Promise that resolves after renderer.init(), compileAsync and the first settled frame
  version,          // string, bump when the contract changes
  params,           // the live params object (read only for tools)
  setParams(patch), // deep-merge a patch, re-render; resolves when the frame has settled
  renderFrames(n),  // render n frames (for TRAA convergence); resolves after the last one
  seek(t),          // set ambient time in seconds
  stats(),          // { backend: 'webgpu' | 'webgl2', drawCalls, triangles, frameMs, gpuMs? }
}
```

## Non-negotiables

- three `^0.186.1`, `WebGPURenderer` from `three/webgpu` with its automatic WebGL2 fallback.
- The Living Sky source of truth stays `public/shader-viewer/presets/living-sky.frag`; any new uniform defaults keep every existing page pixel-identical.
- Location privacy: never ship or log the photos' GPS.
- No purchases, no paid generations, no paid APIs.
- House rules: no tilde character and no em-dash in any file or copy; colours chosen by measured contrast, never by eye; the global `corner-shape: squircle` breaks circles, so round things need `corner-shape: round`.
