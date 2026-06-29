import { vi } from 'vitest';
import type { RandomAPI } from './randomizer-utils';

export function createRandomAPI(sequence: number[] = [], uuids: string[] = []) {
	let randomIndex = 0;
	let uuidIndex = 0;

	const randomizer: RandomAPI = {
		randomUUID: vi.fn(() => uuids[uuidIndex++] ?? `uuid-${uuidIndex - 1}`),

		getRandomValues<T extends Exclude<BufferSource, ArrayBuffer>>(array: T): T {
			if (!(array instanceof Uint32Array)) {
				throw new Error('Test helper only supports Uint32Array');
			}

			const typed = array as unknown as Uint32Array;
			typed[0] = sequence[randomIndex++] ?? 0;

			return array;
		}
	};

	return { randomizer };
}
