# Contributing

## Contributing

The development tools require Node **22.22.2+ on the 22.x line**, **24.15.0+
on the 24.x line**, or **26+**. Use `nvm use` to select the version in `.nvmrc`.
These requirements apply when working on this repository; the published Vue
and Inertia peer dependencies are listed above.

```bash
npm ci
npm test
npm run lint
npm run format:check
npm run pages:check
npm run build-storybook
npm audit
```

Commit `package-lock.json` with dependency updates. CI installs that exact graph
with `npm ci`, checks dependency engines and peer requirements, and runs the test
suite on Node 22.22.2, 24.15.0, and 26. Storybook's production build and the full
dependency audit also run before merging.

The browser contract packs the current source, installs that tarball in isolated
consumers with real Inertia 1, 2, and 3 adapters, audits each consumer, and tests
token and two-factor flows on desktop and mobile Chromium. It uses a local HTTP
server and synthetic credentials. The clipboard boundary is simulated so the
test does not change your clipboard.

```bash
npx --no-install playwright install chromium
npm run test:inertia
# Or select a single adapter major:
npm run test:inertia -- 3
```

Reports and screenshots are written to `test-results/inertia-flash/`. CI runs
each adapter separately and uploads that evidence on success or failure.
