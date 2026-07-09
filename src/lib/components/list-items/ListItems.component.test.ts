import { render, screen } from '@testing-library/svelte';
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

		expect(screen.queryByText(/apple/i)).not.toBeInTheDocument();
	});

	it('clear button clears all items from the list', async () => {
		const user = userEvent.setup();

		const store = listState();
		const props: ListItemsProps = {
			listStore: store
		};

		render(ListItems, { props });

		const clearButton = screen.getByRole('button', { name: /clear/i });
    expect(clearButton).toBeDisabled()

		store.add('Apple');
		expect(await screen.findByText(/apple/i)).toBeInTheDocument();
		store.add('Banana');
		expect(await screen.findByText(/banana/i)).toBeInTheDocument();

    expect(clearButton).toBeEnabled()

    await user.click(clearButton)


    expect(clearButton).toBeDisabled()
    expect(screen.queryByText(/apple/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/banana/i)).not.toBeInTheDocument()
	});
});
