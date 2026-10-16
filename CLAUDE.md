# Portfolio (agamagarwal.com)

Vite + React. Live from `main` via AWS Amplify (push to main = deploy; only on Agam's say-so). Day-to-day work lands on `claude/stoic-dirac-kzji5o`.

## Save tokens: find, don't read
The big files are huge: `src/App.jsx` (~11.7k lines), `src/index.css` (~8.8k), `src/hello3/hello3.css` (~2.6k), `src/hello3/Hello.jsx` (~1.7k). Never read them whole. `grep -n` for the class, string or component, then read ~40 lines around the hit. Read only the files the task names. One screenshot to verify a visual change; no width sweeps unless layout is the task.

## Where things live
- **Homepage** `src/hello3/`
  - `Hello.jsx`: page shell, load sequence (data-seq / data-in / data-glow, timed to the morph clock), room pill ("Setting up workspace" / "Workspace is ready")
  - `HeroMorph.jsx`, `heroMorph.css`, `heroMorphGate.js`: 2D→3D face morph hero. Face rig, skins, emotes: `src/figures/faces/` (`morph/faceRig3D.js`, `morph/morphRenderer.js`, `morph/emoteEngine.js`)
  - `HelloFlip.jsx`, `helloFlip.css`: "Hello! I'm Agam" + draggable "!"
  - `WorkGrid.jsx`, `workMeta.js` (project rows, LOCKED, NEW), `NewTag.jsx`, `LockedLink.jsx`: project cards and list
  - `SideQuests.jsx`, `AlongPath.jsx`, `PathMarquee.jsx`, `pathPresets.js`: side quests marquee
  - `SiteCursor.jsx`: blue Agam guide cursor. `InspectMode.jsx`: dev-only inspect overlay
  - `scrollAssemble.js/.css`: scroll reveal. `usePhone.js`: phone breakpoint (≤720px)
  - Styles: `hello3.css` (page; later rules override earlier ones), `src/index.css` (global, glass pills)
- **Shared UI** `src/ui/`: `loadReveal.js`, `projectTransition.js`, `scrollHover.js` (+ `tools/postcss-scroll-hover.mjs`), `FontSwitch.jsx`, `viewMenu.css` (eye menu), `ExpandableFigure.jsx`, `PhoneLightbox.jsx`, `Guard.jsx`
- **3D room** `src/scene/window/`: `WindowSceneFolio.jsx` (entry), `engine.js`, `camera.js`, `sceneWarm.js` (warm-up + heartbeat), `livePoster.js`/`capture.js` (monitor page preview), `params.room.js`, `room/*.js` (bike, car, pets, lamp…), `vr/` (VR viewer)
- **Case studies**: data + routes in `src/App.jsx` (`/work/<slug>`, grep the slug). Figures in `src/figures/<case>/` (e.g. `scheduled/`, `awayAgent/`, `sdAvailability/`)
- **Favicon**: `src/lib/favicon3d.js`. Theme: `src/lib/autoTheme.js`

## Rules
- After edits: `node tools/qa-smoke.mjs` (needs vite on :5173, or `QA_URL=...`). Must print "QA smoke OK".
- Never lower visual quality for performance (textures, polycount, DPR, LOD, shaders) without Agam's OK.
- Never push to `main` without Agam's explicit say-so. No force-push.
- The shared checkout `~/portfolio` is used by several chats. Writing chats work in their own worktree (`git worktree add ~/portfolio-<task> -b local/<task> origin/claude/stoic-dirac-kzji5o`) and their own vite port.
- Headless/background browsers only; don't open Chrome unless asked. Keep Playwright runs small (the machine overloads).
- Small, reversible calls: decide and say what you chose.
- Annotations (Agentation on :4747) are checked on request ("check annotations"), not polled.
