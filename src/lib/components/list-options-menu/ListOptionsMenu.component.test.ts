import { render, screen, within, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, afterEach } from 'vitest';
import ListOptionsMenu from './ListOptionsMenu.svelte';

describe('ListOptionsMenu', () => {
	const optionsButton = () => screen.getByRole('button', { name: /^options$/i });
	const menu = () => screen.queryByRole('menu');
	const toggle = () => screen.getByRole('menuitemcheckbox', { name: /no repeats this session/i });

	function renderMenu(props: { noRepeat?: boolean; onToggleNoRepeat?: () => void } = {}) {
		return render(ListOptionsMenu, {
			props: {
				noRepeat: false,
				onToggleNoRepeat: vi.fn(),
				...props
			}
		});
	}

	it('renders only the trigger button when closed', () => {
		renderMenu();

		expect(optionsButton()).toBeInTheDocument();
		expect(menu()).not.toBeInTheDocument();
	});

	it('opens the menu on click and exposes the toggle', async () => {
		const user = userEvent.setup();
		renderMenu();

		await user.click(optionsButton());

		expect(optionsButton()).toHaveAttribute('aria-expanded', 'true');
		expect(menu()).toBeInTheDocument();
		expect(toggle()).toBeInTheDocument();
	});

	it('reflects the noRepeat prop via aria-checked', async () => {
		const user = userEvent.setup();
		const { rerender } = renderMenu();

		await user.click(optionsButton());
		expect(toggle()).toHaveAttribute('aria-checked', 'false');

		await rerender({ noRepeat: true });

		expect(toggle()).toHaveAttribute('aria-checked', 'true');
	});

	it('shows a checkmark indicator only when noRepeat is on', async () => {
		const user = userEvent.setup();
		renderMenu({ noRepeat: true });

		await user.click(optionsButton());

		expect(within(toggle()).getByRole('img', { hidden: true })).toBeInTheDocument();
	});

	it('does not show a checkmark indicator when noRepeat is off', async () => {
		const user = userEvent.setup();
		renderMenu({ noRepeat: false });

		await user.click(optionsButton());

		expect(within(toggle()).queryByRole('img', { hidden: true })).not.toBeInTheDocument();
	});

	it('calls onToggleNoRepeat with the inverted value, then closes the menu after a delay', async () => {
		vi.useFakeTimers();
		const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
		const onToggleNoRepeat = vi.fn();
		renderMenu({ onToggleNoRepeat });

		await user.click(optionsButton());
		await user.click(toggle());

		expect(onToggleNoRepeat).toHaveBeenCalledOnce();
		expect(onToggleNoRepeat).toHaveBeenCalledWith(true);
		expect(menu()).toBeInTheDocument();

		await vi.advanceTimersByTimeAsync(600);

		expect(menu()).not.toBeInTheDocument();
		expect(optionsButton()).toHaveFocus();
	});

	it('keeps the flipped state visible while the menu waits to close', async () => {
		vi.useFakeTimers();
		const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
		const { rerender } = renderMenu();

		await user.click(optionsButton());
		await user.click(toggle());

		expect(toggle()).toHaveAttribute('aria-checked', 'false');

		await rerender({ noRepeat: true });

		expect(menu()).toBeInTheDocument();
		expect(toggle()).toHaveAttribute('aria-checked', 'true');
		expect(within(toggle()).getByRole('img', { hidden: true })).toBeInTheDocument();
	});

	it('restarts the close delay on a rapid second toggle', async () => {
		vi.useFakeTimers();
		const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
		const onToggleNoRepeat = vi.fn();
		const { rerender } = renderMenu({ onToggleNoRepeat });

		await user.click(optionsButton());
		await user.click(toggle());
		await rerender({ noRepeat: true });
		await vi.advanceTimersByTimeAsync(300);

		expect(menu()).toBeInTheDocument();

		await user.click(toggle());
		await rerender({ noRepeat: false });
		await vi.advanceTimersByTimeAsync(300);

		expect(menu()).toBeInTheDocument();
		expect(onToggleNoRepeat).toHaveBeenLastCalledWith(false);

		await vi.advanceTimersByTimeAsync(300);

		expect(menu()).not.toBeInTheDocument();
	});

	it('lets Escape cancel a pending delayed close immediately', async () => {
		vi.useFakeTimers();
		const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
		renderMenu();

		await user.click(optionsButton());
		await user.click(toggle());
		await user.keyboard('{Escape}');

		expect(menu()).not.toBeInTheDocument();
		expect(optionsButton()).toHaveFocus();

		await vi.advanceTimersByTimeAsync(600);

		expect(menu()).not.toBeInTheDocument();
		expect(optionsButton()).toHaveFocus();
	});

	it('moves focus to the toggle when opened', async () => {
		const user = userEvent.setup();
		renderMenu();

		await user.click(optionsButton());

		await waitFor(() => {
			expect(toggle()).toHaveFocus();
		});
	});

	it('closes the menu and refocuses the trigger on Escape', async () => {
		const user = userEvent.setup();
		renderMenu();

		await user.click(optionsButton());
		await user.keyboard('{Escape}');

		expect(menu()).not.toBeInTheDocument();
		expect(optionsButton()).toHaveFocus();
	});

	it('closes the menu when the click-catcher is clicked', async () => {
		const user = userEvent.setup();
		renderMenu();

		await user.click(optionsButton());

		const clickCatcher = screen.getByRole('button', { name: /close options menu/i });
		await user.click(clickCatcher);

		expect(menu()).not.toBeInTheDocument();
	});

	afterEach(() => {
		vi.useRealTimers();
	});
});
