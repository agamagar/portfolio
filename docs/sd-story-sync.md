# Scheduled Delivery story: the synced playground embeds

The Scheduled Delivery case study tells the full story of 32 flows / 326 cases. The
prototypes in that story are not copies: they are **live embeds** of the design playground
(`~/design-playground`), so when a playground component is cleaned up, one command updates
every embed in the deck and on the case page.

```
playground (React components) --build:embed--> dist-embed --sync--> public/sd-playground/   (served, git-ignored)
                                                       \-----------> src/figures/sdStory/embedCatalog.json (tracked)
case study: <PlaygroundEmbed id="..."/>  -- iframe -->  /sd-playground/index.html#embed/...
```

## What syncs

| Artifact | Where | Tracked in git? |
| --- | --- | --- |
| Embed bundle (the playground build, relative base) | `public/sd-playground/` | No, `.gitignore` (10 MB of JS, 10 MB of thumbnails) |
| `SYNCED.json` (`{ from, commit, syncedAt }`) | `public/sd-playground/SYNCED.json` | No (inside the bundle) |
| Embed catalog (ids, hashes, sizes, every case id) | `src/figures/sdStory/embedCatalog.json` | **Yes**, diff it after a sync |
| Poster thumbnails for the offline fallback | `public/sd-story-posters/<embedId>.png` | **Yes**, a few small PNGs |

The deck and case page never hold an embed URL. They name a **catalog id**; `src/figures/sdStory/playgroundBase.js`
turns it into `…/sd-playground/index.html#embed/…` using the catalog. The base URL is
`${import.meta.env.BASE_URL}sd-playground/`; set `VITE_SD_PLAYGROUND_URL` (for example
`http://127.0.0.1:5199/sd-playground/` while running the playground's own server) to point at another copy.

## Re-sync after the playground's components are cleaned up

1. Clean up components in `~/design-playground` (commit there if you want the pin to be exact).
2. In the portfolio worktree:
   ```
   npm run sync:sd-playground        # or PLAYGROUND_DIR=/path/to/design-playground npm run sync:sd-playground
   ```
   This runs `design-playground/scripts/sync-embed.mjs <worktree> --thumbs` (builds `dist-embed`,
   copies it, rewrites the catalog), refreshes the posters, then prints `SYNCED.json commit … ; playground HEAD …`.
3. Check the pin: `cat public/sd-playground/SYNCED.json` and
   `git -C ~/design-playground rev-parse --short HEAD`. They must match; the sync tool warns when they don't,
   and when the playground working tree is dirty (an uncommitted clean-up ships, but the commit hash then
   describes the previous state).
4. `git diff src/figures/sdStory/embedCatalog.json`. New flows or cases appear here. Then run
   `node tools/qa-smoke.mjs` and open the deck (`/work/scheduled-delivery`, Present).
5. In dev, each embed's caption shows `playground <commit>` (not rendered in production builds).

## Versioning and pinning

`SYNCED.json.commit` is the playground commit the embeds were built from. To pin the story to a known
playground state, check that commit out (or tag it) in `~/design-playground` before syncing. Re-syncing
later is always one command; there is no other copy of the components to keep in step.

## What breaks if the catalog ids change

Slides and case-page sections reference embeds by catalog id (`flow-returns-cs-chat-exchange`, `states`,
`canvas`, `map`, `prototype-tonight`, …) and optionally a case id (`EX-003`). If the playground renames a flow,
a case id or an embed:

- An unknown **embed id** renders a small "not in the synced playground catalog" note, and in dev logs
  `[sdStory] unknown embed id`.
- A removed **case id** opens the embed on its first case (the playground ignores an unknown `?case=`).
- Fix: update `embed:` / `caseId:` in `src/decks/scheduledDelivery.story.js` (and `sd:` figures in `App.jsx`).
  `node -e` check: every `embed:` in that file must appear in `embedCatalog.json`.

## Authoring

Deck slide (new archetype `playground`):

```js
{ type: "playground", embed: "flow-returns-cs-chat-exchange", caseId: "EX-003",
  kicker: "Develop · In chat", h: "Or ask in chat", p: ["…"], ul: ["…"],
  figure: "caption", layout: "wide" /* text on top, embed below */, fit: "scale|fill" }
```

Case page (non-present view): a section sets `fig: "sd:flow-returns-cs-chat-exchange?case=EX-003"` (or
`sd:states`); the figure height follows the embed's own size messages.

`<PlaygroundEmbed id caseId state theme fit frame caption maxHeight />` (`src/figures/sdStory/PlaygroundEmbed.jsx`):

- lazy iframe, mounts within one viewport of the screen and unmounts when it leaves (frees memory); deck
  slides render one at a time, so at most one iframe is live in Present mode
- skeleton until loaded; `title`/`aria-label` from the catalog; "Open full size" link
- **click to activate**: a transparent button covers the frame, so the deck's arrow keys and Esc keep working
  until the reader clicks in. Esc (same-origin bundle), the **Done (Esc)** button, or a click outside returns control.
  An embed that grabs focus by itself is handed back to the page
- `?motion=reduce` is passed when the visitor prefers reduced motion; `?theme=` follows the site's light/dark
- offline fallback: if `SYNCED.json` isn't reachable the frame is replaced by the poster thumbnail and a line of text

## Deploy

`amplify.yml` runs `npm ci` and `VITE_PUBLIC_SITE=1 npm run build` in an Amplify container that has no access to
`~/design-playground`, so **the build cannot run the sync**. The bundle must therefore be committed on the branch
that deploys the private site, or the embeds fall back to posters.

Smallest safe option (recommended, nothing changed in `amplify.yml`):

1. `npm run sync:sd-playground`
2. On the **private** deploy branch only: `git add -f public/sd-playground && git commit` (about 20 MB; each re-sync
   adds a new copy of the changed hashed files, so sync only when the playground has meaningfully changed).
3. `tools/prune-public.mjs` now removes `sd-playground` and `sd-story-posters` from the public build, so even if the
   bundle is committed, the public site never serves Zepto screens; the case study is locked there anyway.

Alternatives if the repo size matters: host the bundle on its own static site and set `VITE_SD_PLAYGROUND_URL`
in the Amplify env for the private branch (no bundle in git, one more thing to deploy).
