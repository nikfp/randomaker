<script lang="ts">
	import ListInput from '$lib/components/ListInput.svelte';
	import ListItems from '$lib/components/ListItems.svelte';
	import SelectionDisplay from '$lib/components/SelectionDisplay.svelte';
	import { listState, type ListItem } from '$lib/randomizer-store.svelte';

	let selection: ListItem | undefined = $state();

	import { setContext } from 'svelte';
	let listStore = listState();

	setContext('listStore', listStore);

	let disablePickButton = $derived(listStore.value.length === 0);

	function listItemAdded(input: string) {
		listStore.add(input);
	}

	function pickListItem() {
		selection = listStore.random();
	}
</script>

<div class="flex h-screen flex-col items-center bg-gray-100 p-6">
	<h1 class="mt-4 mb-0 text-2xl">Randomaker</h1>
	<p class="text-sm font-light text-zinc-500">a simple random items picker</p>

	<ListInput formClass="mt-4" inputAcceptedHook={listItemAdded} />

	<ListItems sectionClass="mt-4" />

	<button
		class={[
			'mt-4 rounded-md border border-gray-400 bg-gray-200 px-2',
			'hover:cursor-pointer hover:border-blue-500 active:border-blue-500 ',
			'hover:ring-blue-500 active:ring-blue-500',
			'disabled:border-gray-300 disabled:text-zinc-400'
		]}
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
