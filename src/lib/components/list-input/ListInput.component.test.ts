import { render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import { listState } from '$lib/randomizer-store.svelte';
import userEvent from '@testing-library/user-event';
import ListInput from './ListInput.svelte';

describe('ListInput', () => {
	it('adds text to store as expected', async () => {
		const user = userEvent.setup();
		const store = listState();

		render(ListInput, {
			props: {
				listStore: store
			}
		});

		expect(screen.getByText(/add to list/i)).toBeInTheDocument();

		const input = screen.getByLabelText('list-input');
		const button = screen.getByRole('button', { name: /add to list/i });

		const inputValue = 'hello';

		await user.type(input, inputValue);
		expect(input).toHaveValue(inputValue);
		await user.click(button);

		expect(store.value).toHaveLength(1);
		expect(store.value[0].label).equals(inputValue);

		expect(input).toHaveValue("")
	});
});
