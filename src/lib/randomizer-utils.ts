export interface RandomAPI {
	randomUUID(): string;
	getRandomValues<T extends Exclude<BufferSource, ArrayBuffer>>(array: T): T;
}

export function secureRandomIndex(length: number, randomizer: RandomAPI): number | undefined {
	if (length <= 0) return undefined;

	const maxUint32 = 0x1_0000_0000;
	const cutoff = maxUint32 - (maxUint32 % length);
	const buffer = new Uint32Array(1);

	do {
		randomizer.getRandomValues(buffer);
	} while (buffer[0] >= cutoff);

	return buffer[0] % length;
}

export function moveItem<T>(arr: T[], from: number, to: number): T[] {
	if (from === to) return arr;
	if (from < 0 || from >= arr.length) return arr;
	if (to < 0 || to >= arr.length) return arr;

	const copy = [...arr];
	const [item] = copy.splice(from, 1);
	copy.splice(to, 0, item);

	return copy;
}
