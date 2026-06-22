import { secureRandomIndex, type RandomAPI } from './randomizer-utils';

export type ListItem = { label: string; id: string };

function moveItem<T>(arr: T[], from: number, to: number): T[] {
	if (from === to) return arr;
	if (from < 0 || from >= arr.length) return arr;
	if (to < 0 || to >= arr.length) return arr;

	const copy = [...arr];
	const [item] = copy.splice(from, 1);
	copy.splice(to, 0, item);

	return copy;
}

function createListState(initial: ListItem[] = [], randomApi: RandomAPI = crypto) {
	let items = $state([...initial]);

	return {
		get value() {
			return items;
		},

		add(itemLabel: string) {
			items = [...items, { label: itemLabel, id: randomApi.randomUUID() }];
		},

		removeAt(index: number) {
			if (index < 0 || index >= items.length) return;

			items.splice(index, 1);
		},

		random(): ListItem | undefined {
			const index = secureRandomIndex(items.length, randomApi);
			return index === undefined ? undefined : items[index];
		},

		removeByKey(key: string) {
			items = items.filter((item) => item.id !== key);
		},

		indexByKey(key: string) {
			return items.findIndex((item) => item.id === key);
		},

		moveByKey(fromKey: string, toKey: string, place: 'before' | 'after' = 'before') {
			const from = items.findIndex((item) => item.id === fromKey);
			const to = items.findIndex((item) => item.id === toKey);

			if (from === -1 || to === -1 || from == to) return;

			let nextIndex = place === 'after' ? to + 1 : to;

			if (from < nextIndex) {
				nextIndex -= 1;
			}

			items = moveItem(items, from, nextIndex);
		},

		replaceAll(nextItems: ListItem[]) {
			items = [...nextItems];
		},

		clear() {
			items = [];
		}
	};
}

export const listState = createListState;

export type ListStore = ReturnType<typeof createListState>;
