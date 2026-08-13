import type { ListStore } from '$lib/randomizer-store.svelte';

export type ListItemsProps = {
	sectionClass?: string;
	listStore: ListStore;
	noRepeat?: boolean;
	onToggleNoRepeat?: (enabled: boolean) => void;
};
