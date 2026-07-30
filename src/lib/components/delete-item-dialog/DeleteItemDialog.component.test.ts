import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import DeleteItemDialog from './DeleteItemDialog.svelte';

describe('DeleteItemDialog', () => {
	const baseItem = { id: '1', label: 'Apple' };

	it('renders the item label', async () => {
		render(DeleteItemDialog, {
			props: {
				open: true,
				item: baseItem,
				confirmDeleteHook: vi.fn(),
				cancelDeleteHook: vi.fn()
			}
		});

		expect(await screen.findByText('Apple')).toBeInTheDocument();
	});

	it('calls confirmDeleteHook when "Delete it!" is clicked', async () => {
		const user = userEvent.setup();
		const confirmDeleteHook = vi.fn();

		render(DeleteItemDialog, {
			props: {
				open: true,
				item: baseItem,
				confirmDeleteHook,
				cancelDeleteHook: vi.fn()
			}
		});

		await user.click(screen.getByText('Delete it!'));

		expect(confirmDeleteHook).toHaveBeenCalledOnce();
	});

	it('calls cancelDeleteHook when Dismiss is clicked', async () => {
		const user = userEvent.setup();
		const cancelDeleteHook = vi.fn();

		render(DeleteItemDialog, {
			props: {
				open: true,
				item: baseItem,
				confirmDeleteHook: vi.fn(),
				cancelDeleteHook
			}
		});

		await user.click(screen.getByText('Dismiss'));

		expect(cancelDeleteHook).toHaveBeenCalledOnce();
	});

	it('calls cancelDeleteHook when backdrop is clicked', async () => {
		const user = userEvent.setup();
		const cancelDeleteHook = vi.fn();

		render(DeleteItemDialog, {
			props: {
				open: true,
				item: baseItem,
				confirmDeleteHook: vi.fn(),
				cancelDeleteHook
			}
		});

		const backdrop = screen.getByRole('button', { name: /close dialog/i });
		await user.click(backdrop);

		expect(cancelDeleteHook).toHaveBeenCalledOnce();
	});
});
