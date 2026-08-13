import { describe, expect, it } from 'vitest';
import { PRESETS, type Preset } from './presets.ts';

function findPreset(name: string): Preset | undefined {
	return PRESETS.find((preset) => preset.name === name);
}

describe('PRESETS', () => {
	it('is a non-empty, ordered array', () => {
		expect(PRESETS.length).toBeGreaterThan(0);
	});

	it('has a unique non-empty name for every entry', () => {
		const names = PRESETS.map((preset) => preset.name);
		const uniqueNames = new Set(names);

		expect(names.length).toBe(uniqueNames.size);
		expect(names.every((name) => name.trim().length > 0)).toBe(true);
	});

	it('has only non-empty, duplicate-free labels in every entry', () => {
		for (const preset of PRESETS) {
			expect(preset.labels.length).toBeGreaterThan(0);
			expect(new Set(preset.labels).size).toBe(preset.labels.length);
			expect(preset.labels.every((label) => label.trim().length > 0)).toBe(true);
		}
	});

	it('ships Coin Toss with Heads/Tails labels', () => {
		expect(findPreset('Coin Toss')?.labels).toEqual(['Heads', 'Tails']);
	});

	it('ships a d6 preset yielding 1..6 when present', () => {
		const d6 = findPreset('d6');

		if (d6) {
			expect(d6.labels.length).toBe(6);
			expect(new Set(d6.labels).size).toBe(6);
			expect(d6.labels).toEqual(Array.from({ length: 6 }, (_, i) => String(i + 1)));
		}
	});

	it('ships Rock Paper Scissors labels when present', () => {
		const rps = findPreset('Rock Paper Scissors');

		if (rps) {
			expect(['rock', 'paper', 'scissors']).toContain(rps.labels[0]?.toLowerCase());
			expect(rps.labels.length).toBeGreaterThanOrEqual(3);
		}
	});

	it('ships a d20 preset yielding 1..20 when present', () => {
		const d20 = findPreset('d20');

		if (d20) {
			expect(d20.labels.length).toBe(20);
			expect(new Set(d20.labels).size).toBe(20);
			expect(d20.labels).toEqual(Array.from({ length: 20 }, (_, i) => String(i + 1)));
		}
	});
});
