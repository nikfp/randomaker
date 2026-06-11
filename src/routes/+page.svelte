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

<div class="flex flex-col items-center p-6">
	<h1 class="my-4 text-2xl">Randomaker</h1>

	<form onsubmit={addToList} class="flex w-full max-w-md">
		<label for="list-item" class="sr-only">List Input</label>
		<input
			id="list-item"
			name="list-item"
			type="text"
			placeholder="input a list item here"
			class={[
				'flex-1 rounded-l-md border bg-white px-4 py-2.5',
				'text-sm text-zinc-800 placeholder:text-zinc-400 focus:z-10 focus:border-blue-500',
				'focus:ring-2 focus:ring-blue-500 focus:outline-none',
				!errorMessages && 'border-zinc-400',
				!!errorMessages && 'border-red-500'
			]}
			bind:value={inputValue}
			bind:this={inputEl}
		/>
		<button
			type="submit"
			class={[
				'rounded-r-md bg-blue-600 px-4 py-2.5',
				'text-sm font-medium text-white ',
				'hover:bg-blue-700 focus:ring-2 focus:outline-none',
				'focus:ring-blue-500 focus:ring-offset-2'
			]}>Add to List</button
		>
	</form>

	{#if errorMessages}
		{#each errorMessages as error, i (error.key)}
			<p id={`error-message-${i}`} class="text-red-500">{error.message}</p>
		{/each}
	{/if}

	<section class="rounted-lg border border-zinc-300 bg-white">
		<h2 class="flex">
			Existing list items:
			<button>+</button>
		</h2>
	</section>

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
