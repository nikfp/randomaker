import { describe, expect, it } from 'vitest';
import { createRandomAPI } from './randomizer-utils-test-helper';
import { listState, type ListItem } from './randomizer-store.svelte';

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

	it('returns undefined from randomExcluding when the list is empty', () => {
		const store = listState([]);

		expect(store.randomExcluding([])).toBeUndefined();
	});

	it('returns undefined from randomExcluding when every item is excluded', () => {
		const store = listState([
			{ id: 'a', label: 'One' },
			{ id: 'b', label: 'Two' }
		]);

		expect(store.randomExcluding(['a', 'b'])).toBeUndefined();
	});

	it('excludes a single listed id from randomExcluding', () => {
		const items = [
			{ id: 'a', label: 'One' },
			{ id: 'b', label: 'Two' },
			{ id: 'c', label: 'Three' }
		];

		const cases: Array<[string[], ListItem]> = [
			[['a'], { id: 'b', label: 'Two' }],
			[['b'], { id: 'a', label: 'One' }],
			[['c'], { id: 'a', label: 'One' }]
		];

		for (const [excluded, expected] of cases) {
			const { randomizer } = createRandomAPI([0]);
			const store = listState(items, randomizer);

			expect(store.randomExcluding(excluded)).toEqual(expected);
		}
	});

	it('excludes multiple listed ids from randomExcluding', () => {
		const { randomizer } = createRandomAPI([0]);
		const store = listState(
			[
				{ id: 'a', label: 'One' },
				{ id: 'b', label: 'Two' },
				{ id: 'c', label: 'Three' },
				{ id: 'd', label: 'Four' }
			],
			randomizer
		);

		const result = store.randomExcluding(['a', 'b']);

		expect(result).toEqual({ id: 'c', label: 'Three' });
	});

	it('never returns any excluded id from randomExcluding across repeated calls', () => {
		const items = [
			{ id: 'a', label: 'One' },
			{ id: 'b', label: 'Two' },
			{ id: 'c', label: 'Three' },
			{ id: 'd', label: 'Four' },
			{ id: 'e', label: 'Five' }
		];
		const excluded = ['a', 'b'];

		const { randomizer } = createRandomAPI([0, 1, 2]);
		const store = listState(items, randomizer);

		for (let i = 0; i < 3; i++) {
			const result = store.randomExcluding(excluded);

			expect(result).not.toBeUndefined();
			expect(excluded).not.toContain(result!.id);
		}
	});

	it('noRepeat defaults to false', () => {
		const store = listState();

		expect(store.noRepeat).toBe(false);
	});

	it('setNoRepeat flips the mode on and off', () => {
		const store = listState();

		store.setNoRepeat(true);
		expect(store.noRepeat).toBe(true);

		store.setNoRepeat(false);
		expect(store.noRepeat).toBe(false);
	});

	it('setNoRepeat resets the pool', () => {
		const { randomizer } = createRandomAPI([0, 0]);
		const store = listState(
			[
				{ id: 'a', label: 'One' },
				{ id: 'b', label: 'Two' }
			],
			randomizer
		);

		store.setNoRepeat(true);
		expect(store.pick()).toEqual({ id: 'a', label: 'One' });

		store.setNoRepeat(false);
		store.setNoRepeat(true);

		expect(store.pick()).toEqual({ id: 'a', label: 'One' });
	});

	it('canPick reflects whether the list has items', () => {
		const { randomizer } = createRandomAPI([], ['id-1']);
		const store = listState([], randomizer);

		expect(store.canPick).toBe(false);

		store.add('One');
		expect(store.canPick).toBe(true);

		store.clear();
		expect(store.canPick).toBe(false);
	});

	it('pick with mode off returns a uniform random item', () => {
		const { randomizer } = createRandomAPI([1]);
		const store = listState(
			[
				{ id: 'a', label: 'One' },
				{ id: 'b', label: 'Two' },
				{ id: 'c', label: 'Three' }
			],
			randomizer
		);

		expect(store.pick()).toEqual({ id: 'b', label: 'Two' });
	});

	it('pick with mode on never repeats the previous pick', () => {
		const { randomizer } = createRandomAPI([0, 0]);
		const store = listState(
			[
				{ id: 'a', label: 'One' },
				{ id: 'b', label: 'Two' }
			],
			randomizer
		);
		store.setNoRepeat(true);

		expect(store.pick()).toEqual({ id: 'a', label: 'One' });
		expect(store.pick()).toEqual({ id: 'b', label: 'Two' });
	});

	it('pick with mode on resets the exhausted pool and still returns an item', () => {
		const { randomizer } = createRandomAPI([0, 0]);
		const store = listState([{ id: 'a', label: 'One' }], randomizer);
		store.setNoRepeat(true);

		expect(store.pick()).toEqual({ id: 'a', label: 'One' });
		expect(store.pick()).toEqual({ id: 'a', label: 'One' });
	});

	it('replaceAll resets the pool', () => {
		const { randomizer } = createRandomAPI([0, 0]);
		const store = listState(
			[
				{ id: 'a', label: 'One' },
				{ id: 'b', label: 'Two' }
			],
			randomizer
		);
		store.setNoRepeat(true);

		expect(store.pick()).toEqual({ id: 'a', label: 'One' });

		store.replaceAll([
			{ id: 'a', label: 'One' },
			{ id: 'b', label: 'Two' }
		]);

		expect(store.pick()).toEqual({ id: 'a', label: 'One' });
	});

	it('clear resets the pool', () => {
		const { randomizer } = createRandomAPI([0, 0], ['a', 'b']);
		const store = listState(
			[
				{ id: 'a', label: 'One' },
				{ id: 'b', label: 'Two' }
			],
			randomizer
		);
		store.setNoRepeat(true);

		expect(store.pick()).toEqual({ id: 'a', label: 'One' });

		store.clear();
		store.add('One');
		store.add('Two');

		expect(store.pick()).toEqual({ id: 'a', label: 'One' });
	});

	it('removing a picked item leaves other exclusions intact', () => {
		const { randomizer } = createRandomAPI([0, 0]);
		const store = listState(
			[
				{ id: 'a', label: 'One' },
				{ id: 'b', label: 'Two' },
				{ id: 'c', label: 'Three' }
			],
			randomizer
		);
		store.setNoRepeat(true);

		expect(store.pick()).toEqual({ id: 'a', label: 'One' });
		expect(store.pick()).toEqual({ id: 'b', label: 'Two' });

		store.removeByKey('b');

		expect(store.pick()).toEqual({ id: 'c', label: 'Three' });
	});

	it('updating an item does not reset the pool', () => {
		const { randomizer } = createRandomAPI([0, 0]);
		const store = listState(
			[
				{ id: 'a', label: 'One' },
				{ id: 'b', label: 'Two' }
			],
			randomizer
		);
		store.setNoRepeat(true);

		expect(store.pick()).toEqual({ id: 'a', label: 'One' });

		store.updateByKey('b', 'Two renamed');

		expect(store.pick()).toEqual({ id: 'b', label: 'Two renamed' });
	});

	it('adding an item does not reset the pool and the new item is immediately eligible', () => {
		const { randomizer } = createRandomAPI([0, 0, 0], ['new']);
		const store = listState(
			[
				{ id: 'a', label: 'One' },
				{ id: 'b', label: 'Two' }
			],
			randomizer
		);
		store.setNoRepeat(true);

		expect(store.pick()).toEqual({ id: 'a', label: 'One' });
		expect(store.pick()).toEqual({ id: 'b', label: 'Two' });

		store.add('Three');

		expect(store.pick()).toEqual({ id: 'new', label: 'Three' });
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

	it('returns the item for a given key', () => {
		const initial = { id: 'a', label: 'One' };

		const store = listState([initial, { id: 'b', label: 'Two' }]);

		expect(store.getByKey('a')).toEqual(initial);
	});

	it('returns undefined for get with bad key', () => {
		const store = listState([
			{ id: 'a', label: 'One' },
			{ id: 'b', label: 'Two' }
		]);

		expect(store.getByKey('bad')).toBeUndefined();
	});

	it('updates the label for a matching key, preserving id and position', () => {
		const store = listState([
			{ id: 'a', label: 'One' },
			{ id: 'b', label: 'Two' },
			{ id: 'c', label: 'Three' }
		]);

		store.updateByKey('b', 'Twenty');

		expect(store.value).toEqual([
			{ id: 'a', label: 'One' },
			{ id: 'b', label: 'Twenty' },
			{ id: 'c', label: 'Three' }
		]);
	});

	it('does nothing when updateByKey does not match', () => {
		const initial = [
			{ id: 'a', label: 'One' },
			{ id: 'b', label: 'Two' }
		];
		const store = listState(initial);

		store.updateByKey('missing', 'Changed');

		expect(store.value).toEqual(initial);
	});

	it('does not trim the label passed to updateByKey', () => {
		const store = listState([{ id: 'a', label: 'One' }]);

		store.updateByKey('a', '  Spaced  ');

		expect(store.value).toEqual([{ id: 'a', label: '  Spaced  ' }]);
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
