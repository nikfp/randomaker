import { render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import type { EditDialogProps } from './EditItemDialog.types';
import EditItemDialog from './EditItemDialog.svelte';

describe('EditItemDialog', () => {
	const baseItem = { id: '1', label: 'Apple' };

	const editInput = () => screen.getByRole('textbox', { name: /edit item/i });
	const saveButton = () => screen.getByRole('button', { name: /^save$/i });
	const cancelButton = () => screen.getByRole('button', { name: /^cancel$/i });

	function renderDialog(props: Partial<EditDialogProps> = {}) {
		return render(EditItemDialog, {
			props: {
				open: true,
				item: baseItem,
				confirmEditHook: vi.fn(),
				cancelEditHook: vi.fn(),
				...props
			}
		});
	}

	it('renders nothing when open is false', () => {
		renderDialog({ open: false });

		expect(screen.queryByRole('textbox', { name: /edit item/i })).not.toBeInTheDocument();
		expect(screen.queryByRole('button', { name: /^save$/i })).not.toBeInTheDocument();
	});

	it('renders the input pre-filled with the item label', async () => {
		renderDialog();

		expect(await screen.findByRole('dialog')).toBeInTheDocument();
		expect(editInput()).toHaveValue('Apple');
	});

	it('focuses the input and selects its text on open', async () => {
		renderDialog();

		const input = (await screen.findByRole('textbox', { name: /edit item/i })) as HTMLInputElement;

		await waitFor(() => {
			expect(input).toHaveFocus();
			expect(input.selectionStart).toBe(0);
			expect(input.selectionEnd).toBe(5);
		});
	});

	it('disables Save when the input is empty', async () => {
		const user = userEvent.setup();
		renderDialog();

		await user.clear(editInput());
		expect(saveButton()).toBeDisabled();
	});

	it('disables Save when the input is whitespace only', async () => {
		const user = userEvent.setup();
		renderDialog();

		await user.clear(editInput());
		await user.type(editInput(), '   ');
		expect(saveButton()).toBeDisabled();
	});

	it('shows the Input Too Long error and does not confirm when the label exceeds 255 chars', async () => {
		const user = userEvent.setup();
		const confirmEditHook = vi.fn();
		renderDialog({ confirmEditHook });

		await user.clear(editInput());
		await user.type(editInput(), 'a'.repeat(256));

		expect(saveButton()).toBeEnabled();

		await user.click(saveButton());

		expect(await screen.findByText(/input too long/i)).toBeInTheDocument();
		expect(confirmEditHook).not.toHaveBeenCalled();
	});

	it('enables Save for a valid label', async () => {
		const user = userEvent.setup();
		renderDialog();

		await user.clear(editInput());
		await user.type(editInput(), 'Banana');

		expect(saveButton()).toBeEnabled();
	});

	it('calls confirmEditHook with the trimmed label when Save is clicked', async () => {
		const user = userEvent.setup();
		const confirmEditHook = vi.fn();
		renderDialog({ confirmEditHook });

		await user.clear(editInput());
		await user.type(editInput(), '  New Label  ');
		await user.click(saveButton());

		expect(confirmEditHook).toHaveBeenCalledOnce();
		expect(confirmEditHook).toHaveBeenCalledWith('New Label');
	});

	it('calls confirmEditHook with the trimmed label when Enter is pressed in the input', async () => {
		const user = userEvent.setup();
		const confirmEditHook = vi.fn();
		renderDialog({ confirmEditHook });

		await user.clear(editInput());
		await user.type(editInput(), '  New Label  ');
		await user.keyboard('{Enter}');

		expect(confirmEditHook).toHaveBeenCalledOnce();
		expect(confirmEditHook).toHaveBeenCalledWith('New Label');
	});

	it('calls cancelEditHook when Cancel is clicked', async () => {
		const user = userEvent.setup();
		const cancelEditHook = vi.fn();
		renderDialog({ cancelEditHook });

		await user.click(cancelButton());

		expect(cancelEditHook).toHaveBeenCalledOnce();
	});

	it('calls cancelEditHook when the backdrop is clicked', async () => {
		const user = userEvent.setup();
		const cancelEditHook = vi.fn();
		renderDialog({ cancelEditHook });

		const backdrop = screen.getByRole('button', { name: /close dialog/i });
		await user.click(backdrop);

		expect(cancelEditHook).toHaveBeenCalledOnce();
	});

	it('calls cancelEditHook when Escape is pressed', async () => {
		const user = userEvent.setup();
		const cancelEditHook = vi.fn();
		renderDialog({ cancelEditHook });

		const dialog = await screen.findByRole('dialog');
		await user.type(dialog, '{Escape}');

		expect(cancelEditHook).toHaveBeenCalledOnce();
	});
});
