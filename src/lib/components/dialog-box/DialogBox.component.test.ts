import { render, screen, within } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';

import DialogBox from './DialogBox.svelte';
import { createRawSnippet } from 'svelte';

describe('DialogBox', () => {
	it('does not appear on screen by default', () => {
		render(DialogBox);

		const dialog = screen.queryByRole('dialog');

		expect(dialog).not.toBeInTheDocument();
	});

	it('appears on screen when open prop changes from false to true', async () => {
		const { rerender } = render(DialogBox, { props: { open: false } });

		const absentDialog = screen.queryByRole('dialog');
		expect(absentDialog).not.toBeInTheDocument();

		await rerender({ open: true });

		const dialog = screen.getByRole('dialog');
		expect(dialog).toBeInTheDocument();
	});

	it('disappears from screen when open prop changed from true to false', async () => {
		const { rerender } = render(DialogBox, { props: { open: true } });

		const dialog = screen.getByRole('dialog');
		expect(dialog).toBeInTheDocument();

		await rerender({ open: false });

		const absentDialog = screen.queryByRole('dialog');
		expect(absentDialog).not.toBeInTheDocument();
	});

	it('closes when escape key used', async () => {
		const user = userEvent.setup();
		render(DialogBox, { props: { open: true } });

		const dialog = screen.getByRole('dialog');
		expect(dialog).toBeInTheDocument();
		dialog.focus();

		await user.keyboard('{Escape}');

		const absentDialog = screen.queryByRole('dialog');
		expect(absentDialog).not.toBeInTheDocument();
	});

	it('runs close hook when closed internally', async () => {
		const user = userEvent.setup();
		const fn = vi.fn();

		render(DialogBox, { props: { open: true, onClose: fn } });

		const dialog = screen.getByRole('dialog');
		expect(dialog).toBeInTheDocument();

		dialog.focus();

		await user.keyboard('{Escape}');

		expect(fn).toHaveBeenCalledOnce();
	});

	it('closes when user clicks outside dialog', async () => {
		const user = userEvent.setup();
		const children = createRawSnippet(() => ({
			render: () => 'Dialog children'
		}));

		render(DialogBox, {
			props: {
				open: true,
				children
			}
		});

		const mask = screen.getByRole('button', { name: /close dialog/i });

		expect(mask).not.toBeNull();
		expect(screen.queryByText(/dialog children/i)).toBeInTheDocument();

		await user.click(mask);

		expect(screen.queryByText(/dialog children/i)).not.toBeInTheDocument();
	});

	it('properly renders title', async () => {
		const title = createRawSnippet(() => ({
			render: () => 'Dialog title'
		}));

		render(DialogBox, {
			props: {
				open: true,
				title
			}
		});

		const dialog = screen.getByRole('dialog');

		expect(dialog).not.toBeNull();
		expect(await within(dialog).findByText(/dialog title/i)).toBeInTheDocument();
	});

	it('properly renders children', async () => {
		const children = createRawSnippet(() => ({
			render: () => 'Dialog children'
		}));

		render(DialogBox, {
			props: {
				open: true,
				children
			}
		});
		const dialog = screen.getByRole('dialog');

		expect(dialog).not.toBeNull();
		expect(await within(dialog).findByText(/dialog children/i)).toBeInTheDocument();
	});

	it('properly renders actions', async () => {
		const actions = createRawSnippet(() => ({
			render: () => 'Dialog actions'
		}));

		render(DialogBox, {
			props: {
				open: true,
				actions
			}
		});

		expect(await screen.findByText(/dialog actions/i)).toBeInTheDocument();
	});
});
