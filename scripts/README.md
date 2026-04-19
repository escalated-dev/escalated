# Demo recording pipeline

This directory holds the pipeline that generates `.github/profile/demo.gif` —
the animated screencast embedded in the project README. It runs on every push
to `main` (and on PRs that touch the recording code) via
`.github/workflows/demo.yml`.

## What runs

1. **`demo-server.js`** — a tiny standalone Node HTTP server (no external
   deps) that serves a self-contained Escalated UI mock on
   `http://localhost:3000`. It's intentionally simple so the recording job
   doesn't need a database, framework backend, or Docker. Editing the look of
   the demo means editing the inline HTML/CSS/JS in this file.

2. **`generate-demo.js`** — drives the mock with Playwright (Chromium,
   headless) at 1280×800, records a `.webm`, then converts it to a
   palette-optimised GIF via ffmpeg. Output goes to `.github/profile/demo.gif`.
   The recording flow opens the dashboard, files a new ticket, types a
   reply, and sends it.

3. **`.github/workflows/demo.yml`** — installs ffmpeg + Playwright Chromium,
   boots the server, runs the recorder, validates the output is non-trivial,
   uploads the GIF as a workflow artifact, and (on push to `main` only)
   commits it back with `[skip ci]` so the new GIF appears in the README
   without re-triggering the workflow.

## Regenerating locally

You need Node 22+, ffmpeg, and Playwright's Chromium download.

```bash
# one-time setup
brew install ffmpeg                         # macOS
sudo apt-get install -y ffmpeg              # Ubuntu/Debian
# ffmpeg.org/download.html for Windows
npx playwright install chromium

# from repo root:
npm run demo
```

`npm run demo` boots the server, waits for it on :3000, records, and writes
the GIF. The intermediate `.webm` is cleaned up unless you set `KEEP_WEBM=1`.

## Customising the recording

- **Demo flow**: edit `runDemoFlow()` in `generate-demo.js`. Selectors use
  Playwright's role/label/placeholder fallback chain so they survive minor
  markup changes in `demo-server.js`.
- **GIF size/quality**: tune `fps`, `scale`, and `paletteuse` flags in
  `convertToGif()`. Current settings target ≤5 MB at 800px wide / 10 fps.
- **Viewport**: change `VIEWPORT` in `generate-demo.js`. Wider captures
  produce larger GIFs.
- **Output location**: change `OUTPUT_GIF` in `generate-demo.js` and the
  matching `file_pattern`/path in `.github/workflows/demo.yml`.

## Troubleshooting

- **`ffmpeg not found`**: install ffmpeg before running. The script exits
  early with platform-specific install hints.
- **GIF is implausibly small (CI fails the size check)**: the demo flow
  probably aborted before the screen got interesting. Run locally to watch
  Playwright's tracing and see which selector failed.
- **GIF is too large (>5 MB)**: drop `fps` from 10 → 8 or `scale` from 800
  → 720, or trim the flow.
- **Workflow tries to commit on a PR**: it shouldn't — the commit step is
  gated on `github.event_name == 'push' && github.ref == 'refs/heads/main'`.
  PR runs upload the GIF as an artifact instead.
