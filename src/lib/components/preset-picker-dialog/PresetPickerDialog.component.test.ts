import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PRESETS, type Preset } from '../../presets';
import PresetPickerDialog from './PresetPickerDialog.svelte';

describe('PresetPickerDialog', () => {
	const baseProps = {
		open: false,
		onSelect: vi.fn(),
		onClose: vi.fn()
	};

	it('renders a button for every preset name when open', async () => {
		render(PresetPickerDialog, {
			props: { ...baseProps, open: true }
		});

		for (const preset of PRESETS) {
			expect(screen.getByRole('button', { name: preset.name })).toBeInTheDocument();
		}
	});

	it('fires the select callback with the chosen preset', async () => {
		const user = userEvent.setup();
		const onSelect = vi.fn();
		const chosen: Preset = PRESETS[0];
		render(PresetPickerDialog, {
			props: { ...baseProps, open: true, onSelect }
		});

		await user.click(screen.getByRole('button', { name: chosen.name }));

		expect(onSelect).toHaveBeenCalledOnce();
		expect(onSelect).toHaveBeenCalledWith(chosen);
	});

	it('fires onClose on Dismiss without selecting', async () => {
		const user = userEvent.setup();
		const onClose = vi.fn();
		const onSelect = vi.fn();
		render(PresetPickerDialog, {
			props: { ...baseProps, open: true, onClose, onSelect }
		});

		await user.click(screen.getByRole('button', { name: /dismiss/i }));

		expect(onClose).toHaveBeenCalledOnce();
		expect(onSelect).not.toHaveBeenCalled();
	});
});
