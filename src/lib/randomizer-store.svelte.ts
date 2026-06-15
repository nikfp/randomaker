export type ListItem = { label: string; key: string };

function secureRandomIndex(length: number): number | undefined {
	if (length <= 0) return undefined;

	const maxUint32 = 0x1_0000_0000;
	const cutoff = maxUint32 - (maxUint32 % length);
	const buffer = new Uint32Array(1);

	do {
		crypto.getRandomValues(buffer);
	} while (buffer[0] >= cutoff);

	return buffer[0] % length;
}

function createListState(initial: ListItem[] = []) {
	let items = $state([...initial]);

	return {
		get value() {
			return items;
		},

		add(itemLabel: string) {
			items = [...items, { label: itemLabel, key: crypto.randomUUID() } ];
		},

		removeAt(index: number) {
			if (index < 0 || index >= items.length) return;

			items.splice(index, 1);
		},

		random(): ListItem | undefined {
			const index = secureRandomIndex(items.length);
			return index === undefined ? undefined : items[index];
		},

		removeByKey(key: string) {
			items = items.filter((item) => item.key !== key);
		},

		clear() {
			items = [];
		}
	};
}

export const listState = createListState;
