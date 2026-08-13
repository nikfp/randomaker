import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import Page from './+page.svelte';

async function addItems(user: ReturnType<typeof userEvent.setup>, ...labels: string[]) {
	const input = screen.getByRole('textbox', { name: /list-input/i });

	for (const label of labels) {
		await user.type(input, label);
		await user.keyboard('{Enter}');
	}
}

async function setNoRepeat(user: ReturnType<typeof userEvent.setup>, enabled: boolean) {
	await user.click(screen.getByRole('button', { name: /^options$/i }));
	const toggle = screen.getByRole('menuitemcheckbox', { name: /no repeats this session/i });

	if (toggle.getAttribute('aria-checked') !== String(enabled)) {
		await user.click(toggle);
	}
}

describe('+page.svelte', () => {
	it('renders the empty state on first load', () => {
		render(Page);

		expect(screen.getByRole('heading', { name: /randomaker/i })).toBeInTheDocument();

		const pickButton = screen.getByRole('button', { name: /pick button/i });

		expect(pickButton).toBeDisabled();
		expect(within(pickButton).queryByText(/enter some items!/i)).not.toBeNull();
	});

	it('lets the user add items and enables picking', async () => {
		const user = userEvent.setup();
		render(Page);

		const input = screen.getByRole('textbox', { name: /list-input/i });

		await user.type(input, 'Banana');
		await user.keyboard('{Enter}');

		expect(screen.getByText(/banana/i)).toBeInTheDocument();

		const pickButton = screen.getByRole('button', { name: /pick button/i });

		expect(pickButton).toBeEnabled();
		expect(within(pickButton).getByText(/pick a list item!/i)).not.toBeNull();
	});

	it('shows a selected item after clicking pick', async () => {
		const user = userEvent.setup();
		render(Page);

		const input = screen.getByRole('textbox', { name: /list-input/i });

		await user.type(input, 'Banana');
		await user.keyboard('{Enter}');
		await user.type(input, 'Apple');
		await user.keyboard('{Enter}');

		await user.click(screen.getByRole('button', { name: /pick button/i }));

		const selectionDisplay = screen.getByLabelText(/selection display/i);

		expect(await within(selectionDisplay).findByText(/banana|apple/i)).toBeInTheDocument();
	});

	it('never repeats the previous pick when no-repeat is on', async () => {
		const user = userEvent.setup();
		render(Page);

		await addItems(user, 'Banana', 'Apple');
		await setNoRepeat(user, true);

		const pickButton = screen.getByRole('button', { name: /pick button/i });
		const selectionDisplay = screen.getByLabelText(/selection display/i);

		await user.click(pickButton);

		const firstPick = (await within(selectionDisplay).findByText(/banana|apple/i)).textContent;
		const otherPick = firstPick === 'Banana' ? 'Apple' : 'Banana';

		await user.click(pickButton);

		const secondPick = (await within(selectionDisplay).findByText(otherPick)).textContent;

		expect(secondPick).toBe(otherPick);
	});

	it('still picks when the no-repeat pool is exhausted', async () => {
		const user = userEvent.setup();
		render(Page);

		await addItems(user, 'Only');
		await setNoRepeat(user, true);

		const pickButton = screen.getByRole('button', { name: /pick button/i });
		const selectionDisplay = screen.getByLabelText(/selection display/i);

		for (let i = 0; i < 3; i++) {
			await user.click(pickButton);
			expect(await within(selectionDisplay).findByText(/only/i)).toBeInTheDocument();
		}
	});

	it('reverts to standard picks when no-repeat is switched off', async () => {
		const user = userEvent.setup();
		render(Page);

		await addItems(user, 'Banana', 'Apple');
		await setNoRepeat(user, true);

		const pickButton = screen.getByRole('button', { name: /pick button/i });
		const selectionDisplay = screen.getByLabelText(/selection display/i);

		await user.click(pickButton);
		expect(await within(selectionDisplay).findByText(/banana|apple/i)).toBeInTheDocument();

		await setNoRepeat(user, false);

		await user.click(pickButton);
		expect(await within(selectionDisplay).findByText(/banana|apple/i)).toBeInTheDocument();
	});
});
