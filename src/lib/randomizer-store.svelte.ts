import { moveItem, secureRandomIndex, type RandomAPI } from './randomizer-utils';

export type ListItem = { label: string; id: string };

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

		getByKey(key: string) {
			return items.find((el) => el.id == key);
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
