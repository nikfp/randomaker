# Planning — Issue #40: Remove Storybook

Milestone: v0.2. Storybook was scaffolded but never adopted; it is dead weight
(8+ dev deps, scaffold components, config). Nothing in app code imports it.

## Goal

Remove Storybook and all supporting files/deps/config so the repo installs
faster and contains no unused tooling. Pure deletion + config cleanup; no
behavior change to the app or test suite.

## Scope inventory (what exists today)

- `.storybook/` — `main.ts`, `preview.ts`
- `src/stories/` — Button/Header/Page components + their `*.stories.svelte`.
  Verified unreferenced by any app code or tests.
- `package.json`:
  - scripts: `storybook` (package.json:19), `build-storybook` (:20)
  - devDeps: `@chromatic-com/storybook` (:23), `@storybook/addon-a11y` (:26),
    `@storybook/addon-docs` (:27), `@storybook/addon-svelte-csf` (:28),
    `@storybook/addon-vitest` (:29), `@storybook/sveltekit` (:30),
    `eslint-plugin-storybook` (:45), `storybook` (:53)
- Storybook-vitest integration leftovers (scaffolded by addon-vitest, only ever
  referenced from commented-out code):
  - `vite.config.ts` — commented import block (:5-11) and commented storybook
    browser-test project (:66-82); imports `@vitest/browser-playwright` and
    uses `playwright` provider
  - `@vitest/browser-playwright` (package.json:41) + `playwright` (:49)
  - `vitest.shims.d.ts` — single line referencing `@vitest/browser-playwright`
- `eslint.config.js:1-2` — comment-only reference to the storybook eslint
  plugin (the import itself is already commented out)
- `.gitignore:25-26` — `*storybook.log`, `storybook-static`
- `AGENTS.md:29` — lists a `pnpm storybook` command that will stop existing
- `README.md:18` — mentions `--add ... storybook` in the original `sv create`
  scaffold command
- CI (`.github/workflows/ci.yml`) has no storybook steps — no changes needed

## Plan

Deletion-first cleanup; each step ends runnable. No test-first needed since we
are removing code, not adding it — the existing suite is the safety net.

### 1. Delete files

- Remove `.storybook/` and `src/stories/`
- Remove `vitest.shims.d.ts` (exists solely for the playwright shim)

### 2. package.json + lockfile

- Drop the two scripts and the eight storybook devDeps listed above
- Also drop `playwright` and `@vitest/browser-playwright` (**decision 1**):
  their only consumer is the commented-out storybook browser-test project in
  vite.config.ts. Re-add later if real browser tests are wanted.
- Run `pnpm install` to sync `pnpm-lock.yaml`

### 3. Config/doc scrub

- `vite.config.ts`: delete the commented path/url/storybook/playwright imports
  and the entire commented storybook test project
- `eslint.config.js`: remove the two leading comment lines
- `.gitignore`: remove both storybook entries
- `AGENTS.md`: remove the `pnpm storybook` command line
- `README.md`: leave for #34 (**decision 2**) — README cleanup has its own
  issue; touching it here invites merge conflicts with that work

## Verification

1. `pnpm install` completes cleanly (lockfile in sync)
2. `pnpm test:run && pnpm check && pnpm lint` all pass
3. `grep -ri storybook .` (excluding node_modules/.git) returns nothing except
   README.md per decision 2
4. Spot-check `pnpm build` still succeeds (adapter untouched, but cheap)

## Risks / notes

- Large lockfile diff — expected, review that removed packages match scope
  exactly (no transitive removal surprises)
- `svelte-kit sync` regenerates types on next script run; unrelated to this
  change
- Nothing else references `src/stories` or `.storybook` (verified by grep)

## Open decisions

1. **Playwright deps**: **decided** — removed alongside storybook since they
   were only pulled in for its vitest addon. Re-add deliberately if browser
   tests are wanted later.
2. **README line**: **decided** — dropped `storybook` from the recreate
   command so it matches post-cleanup configuration.

## Out of scope

- README rewrite (#34)
- Real browser-mode component tests (would reintroduce playwright deliberately)
