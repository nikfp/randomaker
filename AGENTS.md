Always use `pnpm` instead of `npx` for running package scripts and commands.

## Tech stack

- SvelteKit v2 with Svelte 5 runes (mandatory — no `$:` or `export let`)
- TypeScript, Tailwind CSS v4, Cloudflare Pages adapter
- Vitest v4 + Testing Library for Svelte for tests

## Code conventions

- **Prettier:** tabs, single quotes, no trailing commas, print width 100
- **Components:** `src/lib/components/<name>/<Name>.svelte` with co-located `<Name>.component.test.ts` and optional `<Name>.types.ts`
- **State management:** factory functions using `$state`, `$derived`, `$effect`, `$props()` — never SvelteKit stores

## Testing

- **Unit tests:** `.test.ts` suffix (node environment)
- **Component tests:** `.component.test.ts` or `.svelte.test.ts` suffix (jsdom environment)
- Component tests use `@testing-library/svelte` (render, screen) and `@testing-library/user-event` (userEvent.setup())
- Run: `pnpm test` (watch) or `pnpm test:run`

## Commands

- `pnpm test` — vitest watch
- `pnpm test:run` — vitest single run
- `pnpm lint` — prettier --check && eslint
- `pnpm format` — prettier --write
- `pnpm check` — svelte-check
- `pnpm storybook` — storybook dev server
- Prebuild: `pnpm test:run && pnpm check && pnpm lint`
