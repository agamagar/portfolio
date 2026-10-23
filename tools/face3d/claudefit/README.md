# claudefit: a critic in the loop (three.js clay head)
`fit.mjs` renders the clay head at the turnaround views, builds a reference | ours sheet, asks a CRITIC for JSON parameter deltas (rubric in the file), clamps them to
hard limits, applies, re-renders and scores (IoU / SSIM / LPIPS). Every step is logged to `runs/<time>/log.jsonl` (git-ignored).
- `config.json`: `{"critic": "local"}` (default) or `"api"`: the swap is that one line (or `--critic api`).
- local: writes `itN/request.json` + `itN/compare.png` and waits for `itN/reply.json` (same JSON the API returns: `{scores, deltas, reasons}`).
- api: Claude API (`claude-opus-5-5`), key ONLY from `ANTHROPIC_API_KEY` (environment or a git-ignored `.env.local`), never printed or logged; 8-call cap.
`first-run/` holds the first local-critic run: compare sheets, replies and the log. Run: `node tools/face3d/claudefit/fit.mjs --iters 6 [--params start.json]`.
First finding: the loop works end to end, but four rounds did not improve the numbers (IoU 0.79 -> 0.77): the parameters I can move (ellipsoid sizes, groove, nose cone)
cannot express the target's swoosh and ear, so deltas trade one view against another. Next: richer hair/ear primitives, not more rounds.
