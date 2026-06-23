import { describe, expect, it } from 'vitest';
import { createRandomAPI } from './randomizer-utils.test';
import { listState } from './randomizer-store.svelte';

describe('createListState', () => {
	it('starts with the initial items', () => {
		const initial = [
			{ id: 'a', label: 'One' },
			{ id: 'b', label: 'Two' }
		];

		const store = listState(initial);

		expect(store.value).toEqual(initial);
	});

	it('adds an item with a generated id', () => {
		const { randomizer } = createRandomAPI([], ['id-1']);
		const store = listState([], randomizer);

		store.add('Alpha');

		expect(store.value).toEqual([{ id: 'id-1', label: 'Alpha' }]);
	});

	it('removes an item by index', () => {
		const store = listState([
			{ id: 'a', label: 'One' },
			{ id: 'b', label: 'Two' },
			{ id: 'c', label: 'Three' }
		]);

		store.removeAt(1);

		expect(store.value).toEqual([
			{ id: 'a', label: 'One' },
			{ id: 'c', label: 'Three' }
		]);
	});

	it('does nothing when removeAt index is out of bounds', () => {
		const initial = [
			{ id: 'a', label: 'One' },
			{ id: 'b', label: 'Two' }
		];
		const store = listState(initial);

		store.removeAt(-1);
		expect(store.value).toEqual(initial);

		store.removeAt(2);
		expect(store.value).toEqual(initial);
	});

	it('returns undefined from random when empty', () => {
		const store = listState([]);

		expect(store.random()).toBeUndefined();
	});

	it('returns a random item from the list', () => {
		const { randomizer } = createRandomAPI([1]);
		const store = listState(
			[
				{ id: 'a', label: 'One' },
				{ id: 'b', label: 'Two' },
				{ id: 'c', label: 'Three' }
			],
			randomizer
		);

		expect(store.random()).toEqual({ id: 'b', label: 'Two' });
	});

	it('removes items by key', () => {
		const store = listState([
			{ id: 'a', label: 'One' },
			{ id: 'b', label: 'Two' },
			{ id: 'c', label: 'Three' }
		]);

		store.removeByKey('b');

		expect(store.value).toEqual([
			{ id: 'a', label: 'One' },
			{ id: 'c', label: 'Three' }
		]);
	});

	it('does nothing when removeByKey does not match', () => {
		const initial = [
			{ id: 'a', label: 'One' },
			{ id: 'b', label: 'Two' }
		];
		const store = listState(initial);

		store.removeByKey('missing');

		expect(store.value).toEqual(initial);
	});

	it('returns the index for a matching key', () => {
		const store = listState([
			{ id: 'a', label: 'One' },
			{ id: 'b', label: 'Two' }
		]);

		expect(store.indexByKey('b')).toBe(1);
	});

	it('returns -1 for a missing key', () => {
		const store = listState([{ id: 'a', label: 'One' }]);

		expect(store.indexByKey('missing')).toBe(-1);
	});

	it('moves an item before another item by default', () => {
		const store = listState([
			{ id: 'a', label: 'One' },
			{ id: 'b', label: 'Two' },
			{ id: 'c', label: 'Three' }
		]);

		store.moveByKey('c', 'a');

		expect(store.value).toEqual([
			{ id: 'c', label: 'Three' },
			{ id: 'a', label: 'One' },
			{ id: 'b', label: 'Two' }
		]);
	});

	it('moves an item after another item', () => {
		const store = listState([
			{ id: 'a', label: 'One' },
			{ id: 'b', label: 'Two' },
			{ id: 'c', label: 'Three' }
		]);

		store.moveByKey('a', 'c', 'after');

		expect(store.value).toEqual([
			{ id: 'b', label: 'Two' },
			{ id: 'c', label: 'Three' },
			{ id: 'a', label: 'One' }
		]);
	});

	it('does nothing when moveByKey cannot find fromKey', () => {
		const initial = [
			{ id: 'a', label: 'One' },
			{ id: 'b', label: 'Two' }
		];
		const store = listState(initial);

		store.moveByKey('missing', 'a');

		expect(store.value).toEqual(initial);
	});

	it('does nothing when moveByKey cannot find toKey', () => {
		const initial = [
			{ id: 'a', label: 'One' },
			{ id: 'b', label: 'Two' }
		];
		const store = listState(initial);

		store.moveByKey('a', 'missing');

		expect(store.value).toEqual(initial);
	});

	it('does nothing when moveByKey is asked to move onto itself', () => {
		const initial = [
			{ id: 'a', label: 'One' },
			{ id: 'b', label: 'Two' }
		];
		const store = listState(initial);

		store.moveByKey('a', 'a');

		expect(store.value).toEqual(initial);
	});

	it('replaces all items', () => {
		const store = listState([{ id: 'a', label: 'One' }]);

		store.replaceAll([
			{ id: 'x', label: 'Ex' },
			{ id: 'y', label: 'Why' }
		]);

		expect(store.value).toEqual([
			{ id: 'x', label: 'Ex' },
			{ id: 'y', label: 'Why' }
		]);
	});

	it('clears all items', () => {
		const store = listState([
			{ id: 'a', label: 'One' },
			{ id: 'b', label: 'Two' }
		]);

		store.clear();

		expect(store.value).toEqual([]);
	});
});
