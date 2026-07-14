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
	<h1 class="mt-4 mb-0 text-2xl lg:mt-6 lg:text-3xl dark:text-zinc-200">Randomaker</h1>
	<p class="lg:text-md text-sm font-light text-zinc-500 dark:text-zinc-400">
		a simple random items picker
	</p>

	<ListInput formClass="mt-4 lg:mt-6" {listStore} />

	<ListItems {listStore} sectionClass="mt-4 lg:mt-6" />

	<button
		class={[
			'mt-4 rounded-md border px-2 lg:mt-6 lg:rounded-lg',
			'text-base sm:text-lg lg:text-2xl',
			'border-gray-400 bg-zinc-200',
			'dark:border-zinc-500 dark:bg-zinc-700 dark:text-zinc-300',
			'hover:cursor-pointer hover:border-blue-500 active:border-blue-500 ',
			'hover:ring-blue-500 active:ring-blue-500',
			'disabled:border-gray-300 disabled:text-zinc-400',
			'dark:disabled:border-zinc-600 dark:disabled:text-zinc-500'
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
