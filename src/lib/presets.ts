export type Preset = { name: string; labels: string[] };

function labelRange(die: number): string[] {
	return Array.from({ length: die }, (_, i) => String(i + 1));
}

export const PRESETS: Preset[] = [
	{ name: 'Coin Toss', labels: ['Heads', 'Tails'] },
	{ name: 'd6', labels: labelRange(6) },
	{ name: 'd20', labels: labelRange(20) },
	{ name: 'Rock Paper Scissors', labels: ['Rock', 'Paper', 'Scissors'] },
	{ name: 'Yes / No', labels: ['Yes', 'No'] }
];
