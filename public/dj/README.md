# /dj console audio

The tracks the interactive DJ console (`/dj`) plays. Each deck streams one of
these mp3s through the Web Audio graph (EQ / crossfader / pitch / analyser), so
they must be real, reachable audio files.

## Files here are git-ignored on purpose

`public/dj/*.mp3` is in `.gitignore` (same convention as `public/sds-playground/`).
The ~60 MB of audio should not live in git history. **This folder and this README
stay tracked; only the `.mp3` files are ignored.**

They still ship to production: `npm run build` copies everything under `public/`
into `dist/`, so as long as the mp3s are present on disk at build time they land in
`dist/dj/` and deploy with the site. The local build is how this repo deploys
(there's no git-based CI, and `dist/` is git-ignored too).

## The track list

Tracks are registered in `src/figures/dj/djTracks.js` (name, genre, chip colour,
and `file`). To add one: drop the mp3 here and push a `RAW` entry with its
filename. To remove one: delete the entry (and optionally the file).

## Moving the audio to a CDN (optional)

If you'd rather not carry the audio in the build (e.g. a git-CI deploy, or to keep
the bundle small), the base URL is configurable — no code change:

```
# .env / build env
VITE_DJ_AUDIO_BASE=https://your-bucket.example.com/dj/
```

`djTracks.js` prefixes every `file` with `VITE_DJ_AUDIO_BASE` (default `/dj/`).
Upload the same filenames to that bucket, set the env var, and the console loads
them from the CDN instead of `public/dj/`. If the bucket is a different origin,
enable CORS on it (the console sets `crossOrigin="anonymous"` so the analyser /
EQ can read the stream).

## Licensing

These are the site owner's own supplied tracks. Whether they can be served on a
public site is a licensing question for the owner — commercial recordings need the
appropriate rights.
