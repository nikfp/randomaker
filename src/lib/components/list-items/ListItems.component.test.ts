import { render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
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

	it('clear button clears all items from the list', async () => {
		const user = userEvent.setup();

		const store = listState();
		const props: ListItemsProps = {
			listStore: store
		};

		render(ListItems, { props });

		const clearButton = screen.getByRole('button', { name: /clear/i });
		expect(clearButton).toBeDisabled();

		store.add('Apple');
		expect(await screen.findByText(/apple/i)).toBeInTheDocument();
		store.add('Banana');
		expect(await screen.findByText(/banana/i)).toBeInTheDocument();

		expect(clearButton).toBeEnabled();

		await user.click(clearButton);

		const confirmClearButton = screen.getByRole('button', { name: /clear all/i });
		await user.click(confirmClearButton);

		expect(clearButton).toBeDisabled();
		expect(screen.queryByText(/apple/i)).not.toBeInTheDocument();
		expect(screen.queryByText(/banana/i)).not.toBeInTheDocument();
	});
});
