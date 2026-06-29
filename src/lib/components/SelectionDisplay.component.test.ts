import { render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import SelectionDisplay from './SelectionDisplay.svelte';
import type { SelectionDisplayProps } from './selection-display.types';

describe('SelectionDisplay', () => {
	it('shows the empty state when no selection exists', () => {
		const props: SelectionDisplayProps = {
			selection: undefined
		};
		render(SelectionDisplay, { props });
		expect(screen.getByText(/nothing picked yet!/i)).toBeInTheDocument();
	});

	it('shows the selected item when provided', () => {
		const props: SelectionDisplayProps = {
			selection: {
				id: crypto.randomUUID(),
				label: 'Banana'
			}
		};

		render(SelectionDisplay, {
			props
		});

		expect(screen.getByText(/banana/i)).toBeInTheDocument();
	});

	it('updates component state when props update', async () => {
		const props: SelectionDisplayProps = {
			selection: {
				id: '1',
				label: 'Banana'
			}
		};

		const { rerender } = render(SelectionDisplay, {
			props
		});

		expect(screen.getByText(/banana/i)).toBeInTheDocument();

		const newProps: SelectionDisplayProps = {
			selection: {
				id: '2',
				label: 'Apple'
			}
		};

		await rerender(newProps);

		expect(await screen.findByText(/apple/i)).toBeInTheDocument();
	});
});
