import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import Page from './+page.svelte';

describe('+page.svelte', () => {
	it('renders the empty state on first load', () => {
		render(Page);

		expect(screen.getByRole('heading', { name: /randomaker/i })).toBeInTheDocument();

		expect(screen.getByRole('button', { name: /pick button/i })).toBeDisabled();

		//TODO get the picker button and check the text
		//TODO get the picker button and check it's disabled
	});

	it('lest the user add items and enables picking', async () => {
		const user = userEvent.setup();
		render(Page);

		const input = screen.getByRole('textbox', { name: /list-input/i });

		await user.type(input, 'Banana');
		await user.keyboard('{Enter}');

		expect(screen.getByText(/banana/i)).toBeInTheDocument();

		//TODO check pick button is enabled
	});

	it('shows a selected item after clicking pick', async () => {
		const user = userEvent.setup();
		render(Page);

		const input = screen.getByRole('textbox', { name: /list-input/i });

		await user.type(input, 'Banana');
		await user.keyboard('{Enter}');
		await user.type(input, 'Apple');
		await user.keyboard('{Enter}');

		await user.click(screen.getByRole('button', { name: /pick a list item!/i }));

		const selectionDisplay = screen.getByLabelText(/selection display/i);

		expect(await within(selectionDisplay).findByText(/banana|apple/i)).toBeInTheDocument();
	});
});
