# Issue #11: Re-roll without previous selections

## Strategy

TDD, one step at a time. For each step: write the tests first, pause for review before implementing, then implement only enough code to make the new tests pass. Verify after each step with `pnpm test:run`.

## Behavior spec

- The no-repeat behavior is **toggleable**, defaulting to **off** (standard fully-random picks of the entire list, today's behavior).
- The toggle lives in an options menu on the list itself.
- **On:** each pick remembers the picked item's `id` in a session pool. Picks are drawn uniformly from the items **not yet picked** this session (draw without replacement). When every item has been picked, the pool resets and the next pick draws from all items again.
- **Off:** reverts to fully random picks of the entire list (no pool).
- Toggling the mode on/off resets the session pool.

**State location decision:** the mode flag and the session pool live in the **store** (each `listState()` instance is self-contained — mode, pool, and pick logic travel together). This keeps the page thin and preps the future multi-list coordinated pick trigger, where each list store answers a single `pick()` and coordinates are done by calling it on each store. The page does **not** own per-list pool/toggle state.

## Step 1 — `randomExcluding(excludedIds)` on the store

**Status:** done — `randomExcluding(excludedIds)` implemented at `randomizer-store.svelte.ts:43-47`; 5 new tests + 22 existing pass (`27/27`).

**Tests first** in `src/lib/randomizer-store.svelte.test.ts` (reusing `createRandomAPI` index injection):

1. Excludes a single listed id (deterministic: with 3 items and a forced index, never returns the excluded id)
2. Excludes multiple ids
3. Returns `undefined` when every item is excluded
4. Returns `undefined` when the list is empty
5. Never returns any excluded id across repeated calls

**Then:** add `randomExcluding(excludedIds: string[]): ListItem | undefined` in `randomizer-store.svelte.ts`. Filter `items` by id, call `secureRandomIndex(filtered.length, randomApi)`, return `filtered[index]`, else `undefined`. Keep `random()` unchanged (pure uniform).

## Step 2 — Mode + session pool in the store

**Status:** done — `noRepeat`/`pickedIds` state at `randomizer-store.svelte.ts:7-8`; `noRepeat` + `canPick` getters at `:15-21`; `setNoRepeat` at `:23-26`; `pick()` at `:49-67`; pool reset on `clear()`/`replaceAll()` further down; 12 new tests + 87 existing pass (`99/99`).

**Tests first** in `src/lib/randomizer-store.svelte.test.ts`:

1. `noRepeat` defaults to `false`
2. `setNoRepeat(true)` flips it on; `setNoRepeat(false)` flips it off
3. `setNoRepeat` resets the pool (pick A, toggle off→on, next pick may be A again)
4. `canPick` is `false` when the list is empty and `true` once it has items
5. `pick()` with mode off returns a uniform random item (same as `random()`)
6. `pick()` with mode on never returns the immediately-previous pick (2-item list: second pick is forced to the other item)
7. `pick()` with mode on and exhausted pool resets and returns an item (1-item list: every pick exhausts the pool; the reset path still returns the item)
8. `clear()` and `replaceAll()` reset the pool; remove/update leave stale ids harmlessly (they never match present items)
9. **Adding a new item in noRepeat mode does not reset the pool** — previously picked ids stay excluded, and the new item is immediately eligible (not in the pool, so the next pick may be it)

**Then:** in `randomizer-store.svelte.ts`:

- `let noRepeat = $state(false)` and `let pickedIds: string[] = $state([])`
- `get noRepeat()` accessor
- `get canPick(): boolean` — `items.length > 0` (reactive via `$state`, no `$derived` needed; read by the page for the pick button and later combined across lists for the coordinated trigger)
- `setNoRepeat(enabled: boolean)`: set flag, reset `pickedIds = []`
- `pick(): ListItem | undefined`:
  - mode **off**: `return random()`
  - mode **on**: `randomExcluding(pickedIds)`; if found, append its id to `pickedIds` and return it; if `undefined` (pool exhausted), reset `pickedIds = []`, pick fresh via `random()`, seed the pool with that pick's id, return it
- `clear()` / `replaceAll()` reset `pickedIds`; `add()` does **not** touch the pool (new items are immediately pickable in noRepeat mode, previously picked ids remain excluded)

## Step 3 — Options menu + toggle on the list (`ListItems`)

**Status:** done — `ListOptionsMenu.svelte` (internal `open`, explicit-hook props, `menuitemcheckbox` toggle, click-catcher + Escape close, focus management) + `ListOptionsMenu.types.ts`; wired into `ListItems.svelte` header (flex `gap` group with "Clear"); `ListItemsProps` gains optional `noRepeat`/`onToggleNoRepeat` passthrough. 7 component tests + 1 `ListItems` integration test; suite `107/107`.

**Follow-up fix (visible toggle state):** the `menuitemcheckbox` currently conveys only `aria-checked` — no visual on/off indication.

**Status:** done — added `icons/Check.svelte` (Heroicons solid check); toggle now renders as a flex row with a checkbox box (`h-4 w-4 rounded-sm border`, blue-filled + white checkmark when on, empty bordered box when off), stronger label when active. 2 new tests (checkmark present when on, absent when off); suite `112/112`. Plan:

- Add `src/lib/components/icons/Check.svelte` (Heroicons solid check, `role="img"`, follows the `Pencil`/`Trash` icon convention with a `className` prop).
- `ListOptionsMenu.svelte`: render the toggle as a `flex` row with a leading checkbox box (`h-4 w-4 rounded-sm border`, `aria-hidden` wrapper). When `noRepeat` is on: box `bg-blue-600 border-blue-600`, white `Check` icon inside, stronger label color. When off: empty `border-zinc-400` box, neutral label color.
- `ListOptionsMenu.component.test.ts`: add test — when `noRepeat=true` the toggle contains the checkmark (`getByRole('img', { hidden: true })` inside the toggle); when `false` it does not. Existing `aria-checked` tests stay.
- Verify: `pnpm test:run && pnpm check && pnpm lint`.

**Design:** a self-contained dropdown (`ListOptionsMenu`) anchored to an "Options" trigger button in the `ListItems` header row, left of "Clear". Lightweight popover — **not** a `DialogBox` modal.

**Files:**

- `src/lib/components/list-options-menu/ListOptionsMenu.svelte`
- `ListOptionsMenu.types.ts` — `{ noRepeat: boolean; onToggleNoRepeat: (enabled: boolean) => void }`
- `ListOptionsMenu.component.test.ts`

**Component behavior:**

- `open` is **internal** `$state` (not exposed to `ListItems`/page) — self-contained open/close.
- Props via explicit hooks (dialogs convention), not `$bindable`.
- Trigger: text button "Options", `aria-haspopup="menu"`, `aria-expanded={open}`, `aria-label="Options"`, styled like the existing "Clear" button.
- On open, focus the first menu item; on close (Escape / outside click / select), return focus to the trigger.
- Menu is anchored with a `relative` wrapper; menu is `absolute right-0 z-50`. Click-catcher is a full-screen `button` with `aria-label="Close options menu"` and `tabindex="-1"` (testable via `getByRole('button', { name: /close options menu/i })`, same pattern as `DialogBox`).
- Toggle renders as `role="menuitemcheckbox"` with `aria-checked={noRepeat}`; label "No repeats this session".
- Clicking the toggle calls `onToggleNoRepeat(!noRepeat)` **and closes the menu** + refocuses trigger.
- Escape via `<svelte:window onkeydown>` closes + refocuses trigger.

**Tests:**

1. Renders only the trigger button when closed (menu not in document)
2. Opens on click — `aria-expanded=true`, toggle visible
3. Reflects `noRepeat` via `aria-checked` (both states)
4. Clicking the toggle calls `onToggleNoRepeat(!noRepeat)` and closes the menu
5. Escape closes and refocuses the trigger
6. Clicking the click-catcher closes
7. Focus lands on the toggle when opened

**Then:** wire into `ListItems` — add `noRepeat` + `onToggleNoRepeat` passthrough to `ListItemsProps`, render the menu in the header row inside a flex `gap` group with "Clear".

## Step 4 — Page wiring (`+page.svelte`)

**Status:** done — `pickListItem` uses `listStore.pick()`; `disablePickButton` derives from `!listStore.canPick`; `ListItems` receives `noRepeat={listStore.noRepeat}` + `onToggleNoRepeat`. Page holds no pool/toggle state. Suite `107/107`.

- Replace `selection = listStore.random()` with `selection = listStore.pick()`.
- Replace `let disablePickButton = $derived(listStore.value.length === 0)` with `let disablePickButton = $derived(!listStore.canPick)` — the page no longer reaches into store internals; `canPick` is the seam a future multi-list coordinator combines (`every`/`some` across stores).
- Pass `listStore.noRepeat` and `(enabled) => listStore.setNoRepeat(enabled)` into `ListItems`.
- Page holds no pool/toggle state; `selection` stays in the page.

## Step 5 — Page tests in `src/routes/page.svelte.test.ts`

**Status:** done — 3 new tests (no-repeat "never repeats the previous pick" using the forced second-pick assertion, reset smoke test with a 1-item list, toggle-off revert) + 2 shared helpers (`addItems`, `setNoRepeat`). Suite `110/110`.

1. Default (toggle off): existing behavior tests still pass unchanged.
2. Toggle on, 2 items (Banana, Apple): two consecutive picks are never the same — deterministic regardless of `crypto` randomness (pick 2 is forced to the remaining item). Use `findByText` to handle the 150 ms fade in `SelectionDisplay`.
3. Reset smoke test: with the toggle on, pick repeatedly until the pool is exhausted; picking still works and shows an item (a 1-item list forces the reset path since every pick exhausts the pool).
4. Toggling off after on reverts to working standard picks.

## Step 6 — Verify

`pnpm test:run && pnpm check && pnpm lint`

No changes needed in `randomizer-utils.ts` (`secureRandomIndex` already accepts a length).

**Future note (out of scope):** with multi-list, `selection` could move into each store so `pick()` fully self-contains each list's outcome for the coordinated trigger.
