<script lang="ts">
	import ListInput from '$lib/components/ListInput.svelte';
	import ListItems from '$lib/components/ListItems.svelte';
	import { listState, type ListItem } from '$lib/randomizer-store.svelte';

	let selection: ListItem | undefined = $state();

	let listStore = listState();

	let listOpen = $state(true);

	function listItemAdded(input: string) {
		listStore.add(input);
	}
</script>

<div class="flex flex-col items-center gap-4 p-6">
	<h1 class="my-4 text-2xl">Randomaker</h1>

	<ListInput inputAcceptedHook={listItemAdded} />

	<ListItems {listOpen} listItems={listStore.value} />
	<button
		class="mt-4 rounded-md border border-gray-400 bg-gray-200 px-2"
		onclick={() => {
			selection = listStore.random();
		}}
	>
		Pick a random entry
	</button>

	<div>
		<p>
			{selection?.label}
		</p>
	</div>
</div>
