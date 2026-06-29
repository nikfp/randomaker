<script lang="ts">
	import { fade } from 'svelte/transition';
	import type { SelectionDisplayProps } from './selection-display.types';
	import type { ListItem } from '$lib/randomizer-store.svelte';

	let { selection }: SelectionDisplayProps = $props();

	let duration = 150;

	let displayedSelection: ListItem | undefined = $state(selection);
	let isTransitioning = $state(false);

	$effect(() => {
		syncSelection(selection);
	});

	async function syncSelection(next: ListItem | undefined) {
		if (isTransitioning) return;

		if ((displayedSelection?.id ?? null) === (next?.id ?? null)) return;

		isTransitioning = true;

		if (displayedSelection) {
			displayedSelection = undefined;
			await new Promise((r) => setTimeout(r, duration));
		}

		displayedSelection = next;
		isTransitioning = false;
	}
</script>

<div
	class={[
		'relative mt-6 w-full px-4 pt-6 pb-4',
		'rounded-md border border-blue-500',
		'bg-white',
		'flex flex-col items-center'
	]}
>
	<span
		class={[
			'absolute block bg-gray-100 px-4 ',
			'rounded-md border border-blue-500',
			'top-0 left-1/2',
			'-translate-x-1/2 -translate-y-1/2',
			'text-sm font-light text-zinc-500 '
		]}
	>
		{#if selection}You picked:{:else}Nothing picked yet!{/if}
	</span>
	<p class="min-h-[1.5em] text-center" aria-label="selection display">
		{#if displayedSelection}
			<span class="inline-block" in:fade={{ duration }} out:fade={{ duration }}>
				{displayedSelection.label}
			</span>
		{/if}
	</p>
</div>
