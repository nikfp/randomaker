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

	let inputValue: string = $state('');
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

<form onsubmit={addToList} class={['flex w-full max-w-md lg:max-w-lg', formClass]}>
	<label for="list-input" class="sr-only">List Input</label>
	<input
		id="list-input"
		name="list-input"
		type="text"
		aria-label="list-input"
		placeholder="input a list item here"
		class={[
			'min-w-0 flex-1 rounded-l-md border bg-white lg:rounded-l-lg',
			'px-4 py-2.5 text-sm lg:px-6 lg:py-3.5 lg:text-base',
			'text-zinc-800 placeholder:text-zinc-400 focus:z-10 focus:border-blue-500',
			'dark:bg-zinc-700 dark:text-zinc-200',
			'dark:placeholder:text-zinc-500',
			'focus:ring-2 focus:ring-blue-500 focus:outline-none',
			'dark:border-zinc-600 dark:focus:ring-blue-600',
			!errorMessages && 'border-zinc-400',
			!!errorMessages && 'border-red-500 dark:border-red-700'
		]}
		bind:value={inputValue}
		bind:this={inputEl}
	/>
	<button
		type="submit"
		class={[
			'rounded-r-md lg:rounded-r-lg',
			'px-3 py-2.5 lg:px-5 lg:py-3.5',
			'shrink-0 whitespace-nowrap',
			'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
			'dark:bg-blue-800 dark:hover:bg-blue-600',
			'dark:focus:ring-blue-600',
			'text-xs font-medium sm:text-sm lg:text-base',
			'text-white dark:text-zinc-300',
			'focus:ring-2 focus:outline-none',
			'focus:ring-offset-2'
		]}
	>
		Add to List
	</button>
</form>

{#if errorMessages}
	{#each errorMessages as error, i (error.key)}
		<p id={`error-message-${i}`} class="text-red-500 dark:text-red-600">{error.message}</p>
	{/each}
{/if}
