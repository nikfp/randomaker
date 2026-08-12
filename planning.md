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
   - Accepts `open`, `item` (the item to edit), `confirmEditHook`, `cancelEditHook` props
   - Renders a `DialogBox` with the item's current label in an input
   - Confirm button saves the new label and closes the dialog
   - Cancel button/discard reverts to original label

2. **Integration in ListItems.svelte** - Trigger the dialog from each list item's edit button

### Open Questions & UI Considerations

1. **Edit trigger**: Edit button icon (✎) on each list item, consistent with delete button pattern
2. **Input handling**: Pre-filled input with current label; on confirm saves new label, on cancel reverts
3. **Validation rules**: Empty labels prevented; save button disabled when input is empty; minimum 1 character
4. **Cancel/discard behavior**: Escape key closes without saving; Cancel button reverts to original; click outside closes dialog
5. **Keyboard accessibility**: Focus management when opening dialog; Escape key to cancel; focus returns to edit button after closing
6. **Visual states**: Dialog appearance consistent with DeleteItemDialog; input styling with focus rings; disabled save button for invalid input

### Revised Next Steps

- **Create EditItemDialog component** - `src/lib/components/edit-item-dialog/EditItemDialog.svelte` following DeleteItemDialog pattern
- **Update ListItems.svelte** - Add edit button (✎) and integrate with new component
- **Add `updateByKey` to randomizer store** - Method to update item by key in `src/lib/randomizer-store.svelte.ts`
- **Write tests** - TDD approach with user interaction patterns (69 tests passing)
- **Update documentation** - Reflect dialog-based design decisions (in planning.md)
