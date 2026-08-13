# Issue #29: Ability to edit list items

## Planning

### Goal

Allow users to edit existing list items through a dialog interface, following the same pattern as the existing `DeleteItemDialog` component.

### Scope

- Edit individual list items via a dedicated dialog component
- Preserve list structure and ordering when editing
- Handle validation and error states within the dialog
- Support canceling changes and reverting to original value

### Design Pattern

**Dialog-based edit** following the `DeleteItemDialog` pattern because:

- Consistent with existing codebase patterns
- Clear separation of edit mode from view mode
- Easy to manage focus and accessibility
- Mobile and desktop compatible
- Reusable component structure

### Component Structure

Following the `DeleteItemDialog` pattern, the edit component will:

1. **EditItemDialog.svelte** - Discrete component at `src/lib/components/edit-item-dialog/EditItemDialog.svelte`
   - Accepts `open`, `item` (the item to edit), `confirmEditHook(newLabel)`, `cancelEditHook` props
   - Renders a `DialogBox` with the item's current label in an input
   - Confirm button saves the new label and closes the dialog
   - Cancel button/discard reverts to original label

2. **Integration in ListItems.svelte** - Trigger the dialog from each list item's edit button

### UI Decisions (resolved)

1. **Edit trigger**: Use the recently created `Pencil.svelte` component, which has the same class API as the trash icon component. Edit button per item row, placed left of the delete button, `aria-label="Edit {label}"`, icon tinted `text-zinc-400` to match the trash icon.
2. **Input handling**: `EditItemDialog` keeps a local `draft` (`$state('')`) reset to `item.label` in an `$effect` keyed on `open`. Confirm calls `confirmEditHook(draft)`; Cancel/Escape/backdrop never write to the store, so the original label is preserved automatically. The input mounts fresh per open thanks to `DialogBox`'s `{#if open}`.
3. **Validation rules**: Reuse `inputSchema` (trim, min 1, max 255) against the draft. Save button is `disabled` while the trimmed draft is empty; if the draft exceeds 255 chars, allow submit but show the inline `Input Too Long` error (ListInput style) without writing. `updateByKey(key, label)` receives the trimmed label.
4. **Cancel/discard behavior**: Free via `DialogBox` — Escape and backdrop click route through `onClose` → `cancelEditHook`, and a Cancel button does the same. No store write on any cancel path.
5. **Keyboard accessibility**: On open, `$effect` focuses the input and calls `select()` so the existing text is auto-selected and typing replaces it. Focus returns to the triggering edit button after close (an improvement over `DeleteItemDialog`, wired in `ListItems` from the click's `currentTarget`). No full focus trap — out of scope, matches existing dialogs.
6. **Visual states**: Dialog scaffold matches `DeleteItemDialog`; input uses `ListInput` base styles (zinc border, `focus:ring-2 focus:ring-blue-500`, dark variants). Button color swap vs delete: Save = blue-filled primary, Cancel = zinc-outlined secondary. Disabled Save: `disabled:opacity-50 disabled:cursor-not-allowed`.

### Revised Next Steps

- **Create EditItemDialog component** - `src/lib/components/edit-item-dialog/EditItemDialog.svelte` following DeleteItemDialog pattern
- **Update ListItems.svelte** - Add edit button (pencil icon) and integrate with new component, including focus return to trigger
- **Add `updateByKey` to randomizer store** - Method to update item by key in `src/lib/randomizer-store.svelte.ts`
- **Write tests** - TDD approach with user interaction patterns (69 tests passing)
- **Update documentation** - Reflect dialog-based design decisions (in planning.md)
