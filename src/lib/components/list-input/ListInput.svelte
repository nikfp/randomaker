<script lang="ts">
	import { inputSchema } from '$lib/input-normalizer';
	import type { ListStore } from '$lib/randomizer-store.svelte';
	let {
		listStore,
		formClass = ''
	}: {
		listStore: ListStore;
		formClass?: string;
	} = $props();

	let inputValue: string | undefined = $state();
	let inputEl: HTMLInputElement | undefined;
	let errorMessages: { message: string; key: string }[] | null = $state(null);
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

<form onsubmit={addToList} class={['flex w-full max-w-md', formClass]}>
	<label for="list-input" class="sr-only">List Input</label>
	<input
		id="list-input"
		name="list-input"
		type="text"
		aria-label="list-input"
		placeholder="input a list item here"
		class={[
			'flex-1 rounded-l-md border bg-white px-4 py-2.5 text-sm',
			'text-zinc-800 placeholder:text-zinc-400 focus:z-10 focus:border-blue-500',
			'dark:bg-zinc-700 dark:text-zinc-200',
			'dark:placeholder:text-zinc-500',
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
