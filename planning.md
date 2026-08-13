# Issue #29: Ability to edit list items

## Strategy

TDD, one step at a time. For each step: write the tests first, pause for review before implementing, then implement only enough code to make the new tests pass. Verify after each step with `pnpm test:run`.

## Step 1 — `updateByKey(key, label)` on the store

**Tests first** in `src/lib/randomizer-store.svelte.test.ts` (following existing `removeByKey` pattern):
1. Updates only the matching item's label, preserving its `id` and position
2. Leaves the list unchanged when no item matches `key`
3. Preserves the order and contents of all other items
4. Store does not trim — trimming belongs to the dialog (`inputSchema`), mirroring how `add` works

**Then:** add `updateByKey(key, label)` in `randomizer-store.svelte.ts` (map over items, replace label where `id === key`).

## Step 2 — `EditItemDialog` component

New files: `src/lib/components/edit-item-dialog/EditItemDialog.svelte` + `EditItemDialog.component.test.ts`.

Props: `open: boolean`, `item: ListItem`, `confirmEditHook: (newLabel: string) => void`, `cancelEditHook: () => void`.

UI: `DialogBox` with title "Edit item"; input using `ListInput` base styles; local `draft = $state('')` reset to `item.label` in an `$effect` keyed on `open`, input focused + text `select()`-ed on open; Save = blue primary → `confirmEditHook(draft.trim())`; Cancel = zinc secondary → `cancelEditHook`. Validation: Save disabled when trimmed draft is empty **or** > 255 chars (no inline error state).

**Tests** (mock hooks with `vi.fn()`, drive with `user-event`, patterns from `DeleteItemDialog`/`ClearListDialog` tests):
1. Renders nothing when `open` is false
2. Renders input pre-filled with `item.label` when open
3. Focuses input and selects its text on open
4. Save disabled for empty/whitespace draft
5. Save disabled at 256 chars
6. Save enabled for a valid label
7. Clicking Save calls `confirmEditHook` with the trimmed label
8. Clicking Cancel calls `cancelEditHook`
9. Clicking the backdrop calls `cancelEditHook`
10. Pressing Escape calls `cancelEditHook`

## Step 3 — Wire edit into `ListItems`

Modify `src/lib/components/list-items/ListItems.svelte`:
- Add Pencil edit button per row, left of the trash button, `aria-label="Edit {label}"`, icon `text-zinc-400`
- Track `editItem` state (mirrors `deleteItem`); clicking Edit opens `EditItemDialog`
- `confirmEditHook`: `listStore.updateByKey(editItem.id, label)`, close dialog, return focus to the triggering Edit button (`currentTarget` reference)
- `cancelEditHook`: close dialog, return focus to the triggering Edit button

**Tests** added to `ListItems.component.test.ts` (integration with real `listState()`, mirroring the delete test):
1. Renders an Edit button named "Edit {label}" for each item, before the delete button
2. Clicking Edit opens a dialog pre-filled with the item's label
3. Confirming an edit updates the label in the list, preserving order and `id`
4. Cancelling leaves the label unchanged
5. Focus returns to the Edit button after the dialog closes

## Step 4 — Verify

`pnpm test:run && pnpm check && pnpm lint`