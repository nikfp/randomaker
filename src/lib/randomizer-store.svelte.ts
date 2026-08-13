import { moveItem, secureRandomIndex, type RandomAPI } from './randomizer-utils';

export type ListItem = { label: string; id: string };

function createListState(initial: ListItem[] = [], randomApi: RandomAPI = crypto) {
	let items = $state([...initial]);
	let noRepeat = $state(false);
	let pickedIds: string[] = $state([]);

	return {
		get value() {
			return items;
		},

		get noRepeat() {
			return noRepeat;
		},

		get canPick() {
			return items.length > 0;
		},

		setNoRepeat(enabled: boolean) {
			noRepeat = enabled;
			pickedIds = [];
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

		randomExcluding(excludedIds: string[]): ListItem | undefined {
			const candidates = items.filter((item) => !excludedIds.includes(item.id));
			const index = secureRandomIndex(candidates.length, randomApi);
			return index === undefined ? undefined : candidates[index];
		},

		pick(): ListItem | undefined {
			if (!noRepeat) return this.random();

			const picked = this.randomExcluding(pickedIds);

			if (picked) {
				pickedIds = [...pickedIds, picked.id];
				return picked;
			}

			pickedIds = [];
			const fresh = this.random();

			if (fresh) {
				pickedIds = [fresh.id];
			}

			return fresh;
		},

		removeByKey(key: string) {
			items = items.filter((item) => item.id !== key);
		},

		updateByKey(key: string, label: string) {
			items = items.map((item) => (item.id === key ? { ...item, label } : item));
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
			pickedIds = [];
		},

		loadPreset(labels: string[]) {
			items = labels.map((label) => ({ label, id: randomApi.randomUUID() }));
			pickedIds = [];
			noRepeat = false;
		},

		clear() {
			items = [];
			pickedIds = [];
		}
	};
}

export const listState = createListState;

export type ListStore = ReturnType<typeof createListState>;
