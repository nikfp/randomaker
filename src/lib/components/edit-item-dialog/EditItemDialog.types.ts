import type { ListItem } from '$lib/randomizer-store.svelte';

export type EditDialogProps = {
	open: boolean;
	item: ListItem;
	confirmEditHook: (newLabel: string) => void;
	cancelEditHook: () => void;
};
