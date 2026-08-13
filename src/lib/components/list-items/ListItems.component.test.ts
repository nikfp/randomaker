import { render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ListItems from './ListItems.svelte';
import type { ListItemsProps } from './list-items.types.ts';
import { listState } from '$lib/randomizer-store.svelte';

describe('ListItems', () => {
	it('shows empty state when no list entries exist', async () => {
		const store = listState();
		const props: ListItemsProps = {
			listStore: store
		};

		render(ListItems, { props });

		expect(await screen.findByText(/no list items to display/i)).toBeInTheDocument();
	});

	it('shows an entry when an item is added', async () => {
		const store = listState();
		const props: ListItemsProps = {
			listStore: store
		};

		render(ListItems, { props });

		expect(screen.queryByText(/apple/i)).not.toBeInTheDocument();
		store.add('Apple');
		expect(await screen.findByText(/apple/i)).toBeInTheDocument();
	});

	it('hides entries when list is collapsed, and shows again when expanded', async () => {
		const user = userEvent.setup();

		const store = listState();
		const props: ListItemsProps = {
			listStore: store
		};

		render(ListItems, { props });

		store.add('Apple');
		expect(await screen.findByText(/apple/i)).toBeInTheDocument();

		const collapseButton = screen.getByRole('button', { name: /collapse list/i });
		expect(collapseButton).toBeInTheDocument();

		await user.click(collapseButton);

		const expandButton = screen.getByRole('button', { name: /expand list/i });
		expect(expandButton).toBeInTheDocument();
		expect(screen.queryByText(/apple/i)).not.toBeInTheDocument();

		await user.click(expandButton);

		const newCollapseButton = screen.getByRole('button', { name: /collapse list/i });
		expect(newCollapseButton).toBeInTheDocument();
		expect(await screen.findByText(/apple/i)).toBeInTheDocument();
	});

	it('delete button on a items deletes the item', async () => {
		const user = userEvent.setup();

		const store = listState();
		const props: ListItemsProps = {
			listStore: store
		};

		render(ListItems, { props });

		store.add('Apple');
		expect(await screen.findByText(/apple/i)).toBeInTheDocument();

		const deleteButton = screen.getByRole('button', { name: /delete apple/i });
		expect(deleteButton).not.toBeNull();

		await user.click(deleteButton);

		const confirmDeleteButton = screen.getByRole('button', { name: /delete it!/i });
		await user.click(confirmDeleteButton);

		expect(screen.queryByText(/apple/i)).not.toBeInTheDocument();
	});

	it('renders an Edit button for each item, before the delete button', async () => {
		const store = listState();
		const props: ListItemsProps = {
			listStore: store
		};

		render(ListItems, { props });

		store.add('Apple');
		store.add('Banana');

		const editApple = await screen.findByRole('button', { name: /edit apple/i });
		const deleteApple = screen.getByRole('button', { name: /delete apple/i });
		const editBanana = screen.getByRole('button', { name: /edit banana/i });
		const deleteBanana = screen.getByRole('button', { name: /delete banana/i });

		expect(
			editApple.compareDocumentPosition(deleteApple) & Node.DOCUMENT_POSITION_FOLLOWING
		).toBeTruthy();
		expect(
			editBanana.compareDocumentPosition(deleteBanana) & Node.DOCUMENT_POSITION_FOLLOWING
		).toBeTruthy();
	});

	it('opens the edit dialog pre-filled with the item label when Edit is clicked', async () => {
		const user = userEvent.setup();
		const store = listState();
		const props: ListItemsProps = {
			listStore: store
		};

		render(ListItems, { props });

		store.add('Apple');
		await screen.findByRole('button', { name: /edit apple/i });

		await user.click(screen.getByRole('button', { name: /edit apple/i }));

		expect(screen.getByRole('dialog')).toBeInTheDocument();
		expect(screen.getByRole('textbox', { name: 'Edit item' })).toHaveValue('Apple');
	});

	it('confirming an edit updates the label, preserving order and id', async () => {
		const user = userEvent.setup();
		const store = listState();
		const props: ListItemsProps = {
			listStore: store
		};

		render(ListItems, { props });

		store.add('Apple');
		store.add('Banana');
		await screen.findByRole('button', { name: /edit apple/i });

		const idsBefore = store.value.map((item) => item.id);

		await user.click(screen.getByRole('button', { name: /edit apple/i }));
		const input = screen.getByRole('textbox', { name: 'Edit item' });
		await user.clear(input);
		await user.type(input, 'Apricot');
		await user.click(screen.getByRole('button', { name: /save/i }));

		expect(screen.getByText(/apricot/i)).toBeInTheDocument();
		expect(screen.queryByText(/apple/i)).not.toBeInTheDocument();
		expect(store.value.map((item) => item.id)).toEqual(idsBefore);
		expect(store.value.map((item) => item.label)).toEqual(['Apricot', 'Banana']);
	});

	it('cancelling an edit leaves the label unchanged', async () => {
		const user = userEvent.setup();
		const store = listState();
		const props: ListItemsProps = {
			listStore: store
		};

		render(ListItems, { props });

		store.add('Apple');
		await screen.findByRole('button', { name: /edit apple/i });

		await user.click(screen.getByRole('button', { name: /edit apple/i }));
		const input = screen.getByRole('textbox', { name: 'Edit item' });
		await user.clear(input);
		await user.type(input, 'Apricot');
		await user.click(screen.getByRole('button', { name: /cancel/i }));

		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
		expect(store.value[0].label).toBe('Apple');
		expect(screen.getByText(/apple/i)).toBeInTheDocument();
	});

	it('returns focus to the Edit button after the dialog closes', async () => {
		const user = userEvent.setup();
		const store = listState();
		const props: ListItemsProps = {
			listStore: store
		};

		render(ListItems, { props });

		store.add('Apple');
		await screen.findByRole('button', { name: /edit apple/i });

		const editButton = screen.getByRole('button', { name: /edit apple/i });
		await user.click(editButton);
		const input = screen.getByRole('textbox', { name: 'Edit item' });
		await user.clear(input);
		await user.type(input, 'Apricot');
		await user.click(screen.getByRole('button', { name: /save/i }));

		await waitFor(() => {
			expect(editButton).toHaveFocus();
		});
	});

	it('clears all items from the list via the Options menu', async () => {
		const user = userEvent.setup();

		const store = listState();
		const props: ListItemsProps = {
			listStore: store
		};

		render(ListItems, { props });

		store.add('Apple');
		expect(await screen.findByText(/apple/i)).toBeInTheDocument();
		store.add('Banana');
		expect(await screen.findByText(/banana/i)).toBeInTheDocument();

		await user.click(screen.getByRole('button', { name: /^options$/i }));
		await user.click(screen.getByRole('menuitem', { name: /clear list/i }));

		const confirmClearButton = screen.getByRole('button', { name: /clear all/i });
		await user.click(confirmClearButton);

		expect(store.value).toEqual([]);
		expect(screen.queryByText(/apple/i)).not.toBeInTheDocument();
		expect(screen.queryByText(/banana/i)).not.toBeInTheDocument();
	});

	it('header no longer contains a standalone Clear button', async () => {
		const store = listState();
		const props: ListItemsProps = {
			listStore: store
		};

		render(ListItems, { props });

		expect(screen.queryByRole('button', { name: /clear items/i })).not.toBeInTheDocument();
	});

	it('opens the preset picker dialog from the Options menu', async () => {
		const user = userEvent.setup();
		const store = listState();
		const props: ListItemsProps = {
			listStore: store
		};

		render(ListItems, { props });

		await user.click(screen.getByRole('button', { name: /^options$/i }));
		await user.click(screen.getByRole('menuitem', { name: /presets/i }));

		expect(screen.getByRole('dialog')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /coin toss/i })).toBeInTheDocument();
	});

	it('applies a preset immediately when the list is empty', async () => {
		const user = userEvent.setup();
		const store = listState();
		const props: ListItemsProps = {
			listStore: store
		};

		render(ListItems, { props });

		await user.click(screen.getByRole('button', { name: /^options$/i }));
		await user.click(screen.getByRole('menuitem', { name: /presets/i }));
		await user.click(screen.getByRole('button', { name: /coin toss/i }));

		expect(screen.queryByText(/replace your list/i)).not.toBeInTheDocument();
		expect(store.value.map((item) => item.label)).toEqual(['Heads', 'Tails']);
	});

	it('asks for confirmation before replacing a non-empty list', async () => {
		const user = userEvent.setup();
		const store = listState();
		const props: ListItemsProps = {
			listStore: store
		};

		render(ListItems, { props });

		store.add('Apple');
		await screen.findByText(/apple/i);

		await user.click(screen.getByRole('button', { name: /^options$/i }));
		await user.click(screen.getByRole('menuitem', { name: /presets/i }));
		await user.click(screen.getByRole('button', { name: /coin toss/i }));

		const confirm = await screen.findByText(/replace your list with the coin toss preset/i);
		expect(confirm).toBeInTheDocument();
		expect(store.value.map((item) => item.label)).toEqual(['Apple']);
	});

	it('applies the preset only after confirming the replace', async () => {
		const user = userEvent.setup();
		const store = listState();
		const props: ListItemsProps = {
			listStore: store
		};

		render(ListItems, { props });

		store.add('Apple');
		await screen.findByText(/apple/i);

		await user.click(screen.getByRole('button', { name: /^options$/i }));
		await user.click(screen.getByRole('menuitem', { name: /presets/i }));
		await user.click(screen.getByRole('button', { name: /coin toss/i }));
		await user.click(await screen.findByRole('button', { name: /replace/i }));

		expect(store.value.map((item) => item.label)).toEqual(['Heads', 'Tails']);
	});

	it('leaves the list unchanged when the replace is dismissed', async () => {
		const user = userEvent.setup();
		const store = listState();
		const props: ListItemsProps = {
			listStore: store
		};

		render(ListItems, { props });

		store.add('Apple');
		await screen.findByText(/apple/i);

		await user.click(screen.getByRole('button', { name: /^options$/i }));
		await user.click(screen.getByRole('menuitem', { name: /presets/i }));
		await user.click(screen.getByRole('button', { name: /coin toss/i }));
		await user.click(await screen.findByRole('button', { name: /dismiss/i }));

		expect(store.value.map((item) => item.label)).toEqual(['Apple']);
	});

	it('wires the options menu no-repeat toggle to the passthrough hook', async () => {
		const user = userEvent.setup();
		const store = listState();
		const onToggleNoRepeat = vi.fn();
		const props: ListItemsProps = {
			listStore: store,
			noRepeat: false,
			onToggleNoRepeat
		};

		render(ListItems, { props });

		const optionsButton = screen.getByRole('button', { name: /^options$/i });
		expect(optionsButton).toBeInTheDocument();

		await user.click(optionsButton);

		const toggle = await screen.findByRole('menuitemcheckbox', {
			name: /no repeats this session/i
		});
		expect(toggle).toHaveAttribute('aria-checked', 'false');

		await user.click(toggle);

		expect(onToggleNoRepeat).toHaveBeenCalledOnce();
		expect(onToggleNoRepeat).toHaveBeenCalledWith(true);
		await waitFor(() => {
			expect(screen.queryByRole('menu')).not.toBeInTheDocument();
		});
	});
});
