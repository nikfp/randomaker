# Planning — Issue #6: Get some presets going

Milestone: v0.2 (QOL). Core need: let users load ready-made lists like coin toss,
dice, d20 instead of typing them out.

## Goal

A "Presets" affordance that swaps the current list for a curated preset
(coin toss, d6, d20, RPS, yes/no, deck of cards, etc.). Selecting a preset
replaces all items in the list and resets any no-repeat/picked state.

## Current architecture (relevant pieces)

- Store `createListState` (src/lib/randomizer-store.svelte.ts) already has
  `replaceAll(nextItems: ListItem[])` which resets `pickedIds`. Presets should
  go through an equivalent store entry point so id generation stays in the
  store via `randomApi.randomUUID()`.
- `randomizer-store.svelte.ts:100` — `replaceAll` exists but takes full
  `ListItem[]` (labels + ids); preset data is naturally just labels, so a new
  label-based method is cleaner.
- UI pattern to reuse: `ListOptionsMenu` (src/lib/components/list-options-menu)
  is a dropdown menu toggled by a header button; `ClearListDialog` +
  `DialogBox` provide a confirm-dialog pattern.
- Items header lives in `ListItems.svelte:111-153` ("Manage list items" row
  with Options / Clear buttons). All options consolidate into the dropdown:
  no-repeat toggle (already in `ListOptionsMenu`), Clear (currently a header
  button: `ListItems.svelte:123-136`), and Presets (new).

## Plan

Tests are written and verified failing **before** each step's production code
(test-first). Run at each step: `pnpm test:run` (added test fails, then passes
with implementation), plus `pnpm check` and `pnpm lint` before moving on.

### 1. Preset data module — `src/lib/presets.ts`

- Type: `type Preset = { name: string; labels: string[] }` (+ maybe a
  `label(): string[]` function for generated ranges like d20).
- Export an ordered `PRESETS: Preset[]`.
- Start minimal: Coin Toss (`Heads`/`Tails`), d6 (`1..6`), d20 (`1..20`),
  Rock Paper Scissors, Yes / No. (Decision 2 — open; swap set as agreed.)
- Replace semantic confirmed: a preset replaces the whole list (decision 1).
- **Tests first** — `src/lib/presets.test.ts` (node):
  - `PRESETS` is a non-empty ordered array; every entry has a non-empty
    `name` unique across the set.
  - Every entry's `labels` are non-empty strings with no duplicates.
  - Coin Toss labels are `['Heads', 'Tails']`.
  - d20 (when present) yields exactly 20 distinct labels `1..20`.

### 2. Store method — `src/lib/randomizer-store.svelte.ts`

- Add `loadPreset(labels: string[])` (or `replaceWithLabels`) that maps labels
  to fresh `ListItem`s via `randomApi.randomUUID()` and resets `pickedIds`
  (mirror `replaceAll` but accept raw labels). Sets `noRepeat` to `false` —
  current presets are all replaceable/repeatable; a future preset may opt in
  to no-repeat. (**decided**, added during step 2).
- **Tests first** — extend `randomizer-store.svelte.test.ts` (node):
  - loading into an empty store sets `value.length === labels.length`.
  - loading with existing items replaces them entirely (no merge/append).
  - `pickedIds` are reset after loading (verify via `setNoRepeat(true)` +
    `pick()` exhausting the pool, then `loadPreset` restores full pool).
  - each loaded item gets a fresh unique `id` (inject staging `RandomAPI`).

### 3. Consolidate dropdown — `ListOptionsMenu` + new `PresetPickerDialog`

- **Extend `ListOptionsMenu`** (src/lib/components/list-options-menu/ListOptionsMenu.svelte)
  from a single no-repeat toggle into the full options menu containing:
  - "No repeats this session" (existing `menuitemcheckbox` toggle)
  - "Clear list" (new `menuitem`)
  - "Presets" (new `menuitem`)
- Existing menu mechanics stay: aria-haspopup/expanded, backdrop-close button,
  Escape handler, focus first item on open (`ListOptionsMenu.svelte:40-58`).
- Menu needs new props: `onClear` and `onOpenPresets` callbacks (keeps the menu
  presentational; dialogs stay in parent `ListItems`).
- **Remove** the standalone Clear header button from `ListItems.svelte:123-136`;
  Clear moves into the dropdown.
- **New `PresetPickerDialog`** (src/lib/components/preset-menu/... or
  `preset-picker-dialog/`): a `DialogBox` wrapper opened from the "Presets"
  item that lists all `PRESETS` by name and asks the user to pick one. Picking
  calls back to the parent; a Cancel/dismiss action closes it. Reuse focus
  management from `ClearListDialog` (`ClearListDialog.svelte:12-23`).
- Replace-confirm flow (decision 4 = option A): picking a preset with a
  non-empty list opens a `ClearListDialog`-style confirm ("Replace your list
  with the {name} preset?"); empty list applies immediately.
- **Tests first** (jsdom, `@testing-library/svelte` + `user-event`):
  - `ListOptionsMenu.component.test.ts`:
    - menu opens and lists No repeats / Clear list / Presets items.
    - backdrop click and Escape close the menu.
    - clicking "Clear list" fires `onClear`.
    - clicking "Presets" fires `onOpenPresets`.
    - no-repeat toggle still works and `aria-checked` reflects prop.
  - `PresetPickerDialog.component.test.ts`:
    - renders a button/option for every preset name.
    - picking one fires the select callback with the chosen preset.
    - Cancel/dismiss fires close callback without selecting.

### 4. Wire into page/ListItems

- `ListItems.svelte`: keep clear/preset dialog state; move `handleClear` +
  clear-confirm through `ListOptionsMenu.onClear`; add preset-picker state and
  call `listStore.loadPreset(preset.labels)` on confirm.
- Replace-confirm dialog copy: "Replace your list with the {name} preset?"
- **Tests first** — extend `ListItems.component.test.ts` (jsdom):
  - "Presets" in Options opens the picker dialog.
  - picking a preset with an empty list calls `loadPreset` immediately.
  - picking a preset with a non-empty list shows the replace-confirm dialog;
    confirming applies it, dismissing does not.
  - header no longer contains a standalone Clear button (Clear only in menu).

## Open decisions

1. **Replace vs append**: replace assumed (used throughout plan) — still needs
   confirmation before finalizing.
2. **Which presets to ship first**: propose Coin Toss, d6, d20, RPS, Yes/No.
   Dice with many faces (d20) need the label-generator helper.
3. **Preset placement**: **decided** — consolidated "Options" dropdown with
   `PresetPickerDialog` for selection.
4. **Replace confirmation**: **decided** (option A) — Options → Presets →
   picker → pick one → a `ClearListDialog`-style confirm warns about the
   overwrite (only when the list is non-empty). Empty list applies immediately.

## Implementation order (test-first at each step)

1. `presets.test.ts` → `presets.ts`
2. store `loadPreset` tests → store method
3. `ListOptionsMenu` consolidate tests → implementation
4. `PresetPickerDialog` tests → implementation
5. Replace-confirmation + `ListItems` integration tests → wiring
6. `pnpm test:run && pnpm check && pnpm lint`

## Out of scope

- URL sharing of arbitrary lists (#28) — v0.3
- local save/reload (#27) — v0.3
