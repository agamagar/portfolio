# Public site and private site (agamagarwal.com / private.agamagarwal.com)

One codebase, two builds, picked by the `VITE_SITE` build variable.

| | `agamagarwal.com` | `private.agamagarwal.com` |
|---|---|---|
| Amplify branch | `main` | `private` |
| `VITE_SITE` | unset (or `public`) | `private` |
| Homepage cards and rows | all project links are locked (`LockedLink`, NDA tooltip) | as before (only the two NDA ones are locked) |
| `/work/<slug>` | lock screen with "Request access" | full case study |
| Case content in the JS bundle | none (checked, see below) | yes |
| Access | open | Amplify password (basic auth) |

`npm run dev` with no variable behaves as private, so local work is unchanged. `VITE_SITE=public npm run dev` previews the public site.

## What keeps the public site private

- `src/lib/site.js` exports `PRIVATE_SITE`; `vite.config.js` turns `VITE_SITE` into a literal at build time, so the bundler removes the case data (`buildCaseStudies()` in `src/App.jsx`), the case renderers and the lazy figure and PRD chunks.
- `tools/prune-public.mjs` (run by `amplify.yml` when `VITE_SITE` is not `private`) deletes case-only files copied from `public/` (`prd/`, `away-research/`, `narration/`, `xs/` and so on).
- Not removed: images, videos and posters under `public/figures/` and `public/cross-sell/` that the homepage cards and marquee show. Case-only media there can be fetched by exact URL if someone knows it. Move any that matter out of the public build if that is a concern.
- Check after a public build: `grep -rl "zepiris2026\|GobbleCube\|Adaptive Capture" dist` must print nothing.

## Amplify console steps (you do these)

1. **Create the branch.** Push a branch named `private` (same commit as the one you want live): `git push origin <commit>:refs/heads/private`. In the Amplify console: app, Hosting, Branches (or "Connect branch"), pick `private`, save.
2. **Set the variable for that branch.** App settings, Environment variables, Manage variables, Add variable: key `VITE_SITE`, value `private`, and in "Branch" choose `private` (use the branch override, not the "All branches" default). Leave `main` without it.
3. **Turn on the password.** App settings, Access control, Manage access: for the `private` branch pick "Restricted, password required", set a username and password, save. Share those with whoever should see it. Leave `main` on "Publicly viewable".
4. **Map the subdomain.** App settings, Domain management, `agamagarwal.com`, Manage domain (or Add domain if it is not there). Add a subdomain: `private` pointing to branch `private`. Keep `main` mapped to the root and `www`.
5. **DNS.** If the domain is on Route 53 in this AWS account, Amplify creates the records itself. If DNS is elsewhere, Amplify shows a CNAME for `private` (and an ACM validation CNAME) once you save: add both at your registrar and wait for the certificate to turn "Available" (minutes to an hour).
6. **Check the redirect rule.** The single-page-app rewrite you already added for `main` (see `amplify.yml`) is per app, not per branch, so it covers `private` too; no change needed.
7. **Build and verify.** The first build starts when the branch connects (or press Redeploy). Open `https://private.agamagarwal.com`, enter the password, open a project: the full case study shows. Open `https://agamagarwal.com/work/scheduled-delivery`: the lock screen shows.

Later releases: merge or cherry-pick into both `main` and `private`; each branch builds on its own with its own `VITE_SITE`.
