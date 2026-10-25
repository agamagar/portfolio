# QA notes

Run `node tools/qa-smoke.mjs` after edits; it should print "QA smoke OK". On this machine, every headless or QA run takes the shared heavy-run lock first:

```
until mkdir /tmp/schedule-heavy.lock 2>/dev/null; do sleep 10; done; <run>; rc=$?; rmdir /tmp/schedule-heavy.lock; exit $rc
```

## Known flakes

### Homepage room pill (25 Oct 2026, branch claude/sd-smart-toggle-a80586)

`qa-smoke` sometimes fails on `/` with "room pill not clickable" and "room pill did not respond to click (state stayed warming)". Every other check passes.

- **What happens:** while the room is warming up, the pill's button sits at 0 width (it measured 719, 20, 0 × 44 at 8 s). It only appears and widens as the 3D room's warm-up moves on, so the smoke test can click it in the middle of the reveal.
- **Load-dependent:** it passed at 09:43 (load average 45) and failed later at load 19 to 83. There's no clean threshold, but the failures cluster when other sessions are running heavy jobs.
- **Not the Schedule work.** A 4-run bisect (two runs on the branch head, two with the 28.4 touch-target CSS removed) gave the same result each time: the pill wasn't visible within 10 s. The App.jsx from before the hidden-heading change failed the same way. Nothing the branch changed runs on `/`, apart from WorkGrid's FigmaEmbed taking `openLink={false}`, which only matters at 720 px and under.
- **What to do:** treat it as a flake, not a blocker for Schedule commits. For a clean pass, run when the machine is quiet. A real fix belongs to whoever owns the room warm-up (`src/scene/window/sceneWarm.js` and the pill in `src/hello3/Hello.jsx`): the pill shouldn't be clickable-looking at 0 width, or the smoke test should wait for a non-zero size.
