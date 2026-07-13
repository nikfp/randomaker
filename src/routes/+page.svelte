<script lang="ts">
	import ListInput from '$lib/components/list-input/ListInput.svelte';
	import ListItems from '$lib/components/list-items/ListItems.svelte';
	import SelectionDisplay from '$lib/components/selection-display/SelectionDisplay.svelte';
	import { listState, type ListItem } from '$lib/randomizer-store.svelte';

	let selection: ListItem | undefined = $state();

	let listStore = listState();

	let disablePickButton = $derived(listStore.value.length === 0);

	function pickListItem() {
		selection = listStore.random();
	}
</script>

<div class="flex h-screen flex-col items-center bg-gray-100 p-6 dark:bg-zinc-800">
	<h1 class="mt-4 mb-0 text-2xl dark:text-zinc-200">Randomaker</h1>
	<p class="text-sm font-light text-zinc-500 dark:text-zinc-400">a simple random items picker</p>

	<ListInput formClass="mt-4" {listStore} />

	<ListItems {listStore} sectionClass="mt-4" />

	<button
		class={[
			'mt-4 rounded-md border border-gray-400 bg-gray-200 px-2',
			'hover:cursor-pointer hover:border-blue-500 active:border-blue-500 ',
			'hover:ring-blue-500 active:ring-blue-500',
			'disabled:border-gray-300 disabled:text-zinc-400'
		]}
		aria-label="pick button"
		onclick={pickListItem}
		disabled={disablePickButton}
	>
		{#if disablePickButton}
			Enter some items!
		{:else}
			Pick a list item!
		{/if}
	</button>

	<SelectionDisplay {selection} />
</div>
