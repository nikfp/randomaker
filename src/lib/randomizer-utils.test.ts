import { describe, expect, it, vi } from 'vitest';
import { moveItem, secureRandomIndex, type RandomAPI } from './randomizer-utils.ts';

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

describe('secureRandomIndex', () => {
	it('returns undefined for length 0', () => {
		const { randomizer } = createRandomAPI();

		expect(secureRandomIndex(0, randomizer)).toBeUndefined();
	});

	it('returns undefined for negative length', () => {
		const { randomizer } = createRandomAPI();

		expect(secureRandomIndex(-1, randomizer)).toBeUndefined();
	});

	it('returns 0 when length is 1', () => {
		const { randomizer } = createRandomAPI([123456]);

		expect(secureRandomIndex(1, randomizer)).toBe(0);
	});

	it('returns an index within [0, length]', () => {
		const { randomizer } = createRandomAPI([1]);

		const index = secureRandomIndex(3, randomizer);
		expect(index).toBeGreaterThanOrEqual(0);
		expect(index).toBeLessThan(3);
	});
});

describe('moveItem', () => {
	it('returns the same array when from and to are equal', () => {
		const arr = ['a', 'b', 'c'];

		const result = moveItem(arr, 1, 1);

		expect(result).toBe(arr); // same reference by contract in your impl
	});

	it('returns the original array when "from" is out of bounds (negative)', () => {
		const arr = ['a', 'b', 'c'];

		const result = moveItem(arr, -1, 1);

		expect(result).toBe(arr);
	});

	it('returns the original array when "from" is out of bounds (>= length)', () => {
		const arr = ['a', 'b', 'c'];

		const result = moveItem(arr, 3, 1);

		expect(result).toBe(arr);
	});

	it('returns the original array when "to" is out of bounds (negative)', () => {
		const arr = ['a', 'b', 'c'];

		const result = moveItem(arr, 1, -1);

		expect(result).toBe(arr);
	});

	it('returns the original array when "to" is out of bounds (>= length)', () => {
		const arr = ['a', 'b', 'c'];

		const result = moveItem(arr, 1, 3);

		expect(result).toBe(arr);
	});

	it('moves an item forward in the array', () => {
		const arr = ['a', 'b', 'c', 'd'];

		const result = moveItem(arr, 1, 3); // move 'b' to index 3

		expect(result).toEqual(['a', 'c', 'd', 'b']);
		expect(arr).toEqual(['a', 'b', 'c', 'd']); // original not mutated
	});

	it('moves an item backward in the array', () => {
		const arr = ['a', 'b', 'c', 'd'];

		const result = moveItem(arr, 3, 1); // move 'd' to index 1

		expect(result).toEqual(['a', 'd', 'b', 'c']);
		expect(arr).toEqual(['a', 'b', 'c', 'd']); // original not mutated
	});

	it('can move the first item to the last position', () => {
		const arr = ['a', 'b', 'c'];

		const result = moveItem(arr, 0, 2);

		expect(result).toEqual(['b', 'c', 'a']);
	});

	it('can move the last item to the first position', () => {
		const arr = ['a', 'b', 'c'];

		const result = moveItem(arr, 2, 0);

		expect(result).toEqual(['c', 'a', 'b']);
	});
});
