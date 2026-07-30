import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { createRawSnippet } from 'svelte';
import DialogBox from './DialogBox.svelte';

describe('DialogBox', () => {
	it('does not render when open is false', () => {
		render(DialogBox, { props: { open: false } });

		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
	});

	it('renders when open is true', async () => {
		render(DialogBox, { props: { open: true } });

		expect(await screen.findByRole('dialog')).toBeInTheDocument();
	});

	it('renders default Dismiss button when no actions snippet provided', async () => {
		render(DialogBox, { props: { open: true } });

		expect(await screen.findByText('Dismiss')).toBeInTheDocument();
	});

	it('closes when clicking the backdrop overlay', async () => {
		const user = userEvent.setup();

		const { component } = render(DialogBox, { props: { open: true } });

		expect(component).toBeDefined();

		const backdrop = screen.getByRole('button', { name: /close dialog/i });
		await user.click(backdrop);

		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
	});

	it('closes when pressing Escape', async () => {
		const user = userEvent.setup();

		render(DialogBox, { props: { open: true } });

		const dialog = await screen.findByRole('dialog');
		await user.type(dialog, '{Escape}');

		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
	});

	it('calls onClose when closing', async () => {
		const user = userEvent.setup();
		const onClose = vi.fn();

		render(DialogBox, { props: { open: true, onClose } });

		const backdrop = screen.getByRole('button', { name: /close dialog/i });
		await user.click(backdrop);

		expect(onClose).toHaveBeenCalledOnce();
	});

	it('renders the title snippet', async () => {
		const title = createRawSnippet(() => ({
			render: () => '<span>My Dialog Title</span>'
		}));

		render(DialogBox, {
			props: {
				open: true,
				title
			}
		});

		expect(await screen.findByText('My Dialog Title')).toBeInTheDocument();
	});

	it('renders children', async () => {
		const children = createRawSnippet(() => ({
			render: () => '<p>Dialog body content</p>'
		}));

		render(DialogBox, {
			props: {
				open: true,
				children
			}
		});

		expect(await screen.findByText('Dialog body content')).toBeInTheDocument();
	});

	it('renders custom actions instead of default Dismiss button', async () => {
		const actions = createRawSnippet(() => ({
			render: () => '<button type="button">Custom Action</button>'
		}));

		render(DialogBox, {
			props: {
				open: true,
				actions
			}
		});

		expect(await screen.findByText('Custom Action')).toBeInTheDocument();
		expect(screen.queryByText('Dismiss')).not.toBeInTheDocument();
	});
});
