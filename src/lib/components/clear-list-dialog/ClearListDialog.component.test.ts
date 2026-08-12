import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ClearListDialog from './ClearListDialog.svelte';

describe('ClearListDialog', () => {
	it('renders the confirmation message', async () => {
		render(ClearListDialog, {
			props: {
				open: true,
				confirmClearHook: vi.fn(),
				cancelClearHook: vi.fn()
			}
		});

		expect(
			await screen.findByText('Are you sure you want to clear all items?')
		).toBeInTheDocument();
	});

	it('calls confirmClearHook when "Clear All" is clicked', async () => {
		const user = userEvent.setup();
		const confirmClearHook = vi.fn();

		render(ClearListDialog, {
			props: {
				open: true,
				confirmClearHook,
				cancelClearHook: vi.fn()
			}
		});

		await user.click(screen.getByText('Clear All'));

		expect(confirmClearHook).toHaveBeenCalledOnce();
	});

	it('calls cancelClearHook when Dismiss is clicked', async () => {
		const user = userEvent.setup();
		const cancelClearHook = vi.fn();

		render(ClearListDialog, {
			props: {
				open: true,
				confirmClearHook: vi.fn(),
				cancelClearHook
			}
		});

		await user.click(screen.getByText('Dismiss'));

		expect(cancelClearHook).toHaveBeenCalledOnce();
	});

	it('calls cancelClearHook when backdrop is clicked', async () => {
		const user = userEvent.setup();
		const cancelClearHook = vi.fn();

		render(ClearListDialog, {
			props: {
				open: true,
				confirmClearHook: vi.fn(),
				cancelClearHook
			}
		});

		const backdrop = screen.getByRole('button', { name: /close dialog/i });
		await user.click(backdrop);

		expect(cancelClearHook).toHaveBeenCalledOnce();
	});
});
