<script lang="ts">
	import { inputSchema } from '$lib/input-normalizer';
	import { listState, type ListItem } from '$lib/randomizer-store.svelte';

	let inputValue: string | undefined = $state();
	let selection: ListItem | undefined = $state();
	let errorMessages: { message: string; key: string }[] | null = $state(null);

	let listStore = listState();

	let inputEl: HTMLInputElement | undefined;

	async function addToList(event: SubmitEvent) {
		event.preventDefault();

		const parseResult = inputSchema.safeParse({ input: inputValue });

		if (parseResult.success) {
			listStore.add(parseResult.data.input);
			inputValue = '';

			inputEl?.focus();

			errorMessages = null;
		} else {
			errorMessages = parseResult.error.issues.map((el) => {
				return { message: el.message, key: crypto.randomUUID() };
			});
		}
	}
</script>

<div class="p-6">
	<h1 class="text-2xl">Randomaker</h1>

	<form onsubmit={addToList}>
		<input
			bind:value={inputValue}
			type="text"
			placeholder="input a list item here"
			class="border"
			class:border-gray-400={!errorMessages}
			class:border-red-500={!!errorMessages}
			bind:this={inputEl}
		/>
		{#if errorMessages}
			{#each errorMessages as error, i (error.key)}
				<p id={`error-message-${i}`} class="text-red-500">{errorMessages}</p>
			{/each}
		{/if}
		<button type="submit" class="mt-4 rounded-md border border-gray-400 bg-gray-200 px-2"
			>Add to List</button
		>
	</form>

	<div class="mt-4 w-fit border border-zinc-500 p-4">
		{#each listStore.value as item, index (item.key)}
			<div id={index.toString()}>
				<p>{item}</p>
			</div>
		{/each}
	</div>

	<button
		class="mt-4 rounded-md border border-gray-400 bg-gray-200 px-2"
		onclick={() => {
			selection = listStore.random();
			console.log(selection);
		}}
	>
		Pick a random entry
	</button>

	<div>
		<p>
			{selection}
		</p>
	</div>
</div>
