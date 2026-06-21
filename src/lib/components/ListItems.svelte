<script lang="ts">
	import { fade } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { dndzone, type DndEvent } from 'svelte-dnd-action';

	import ChevronDown from './icons/ChevronDown.svelte';
	import ChevronRight from './icons/ChevronRight.svelte';
	import Trash from './icons/Trash.svelte';
	import type { ListItem, ListStore } from '$lib/randomizer-store.svelte';
	import { getContext } from 'svelte';

	const listStore = getContext<ListStore>('listStore');

	let listOpen = $state(true);

	let isRemoving = $state(false);
	let listEmpty = $derived(listStore.value.length === 0);

	const flipDurationMs = 180;
	let dndItems = $state<ListItem[]>([]);
	let isDragging = $state(false);

	$effect(() => {
		if (!isDragging) {
			dndItems = [...listStore.value];
		}
	});

	function handleDelete(key: string) {
		listStore.removeByKey(key);
	}

	function handleClear() {
		listStore.clear();
	}

	function handleDndConsider(event: CustomEvent<DndEvent<ListItem>>) {
		isDragging = true;
		dndItems = event.detail.items;
	}

	function handleDndFinalize(event: CustomEvent<DndEvent<ListItem>>) {
		dndItems = event.detail.items;
		listStore.replaceAll(event.detail.items);
		isDragging = false;
	}
</script>

<section class="rounted-lg w-full rounded-md border border-zinc-300 bg-zinc-200">
	<h2 class="m-0">
		<div
			class={[
				' flex w-full items-center justify-around ',
				'gap-2 px-4',
				'text-md',
				listOpen && 'border-b border-b-zinc-300'
			]}
		>
			<button
				type="button"
				onclick={handleClear}
				class={[
					'text-xs',
					'rounded-sm border px-1',
					listEmpty && 'border-zinc-300 text-zinc-300',
					!listEmpty && 'border-zinc-500 text-zinc-600'
				]}
				>Clear
			</button>
			<span>Existing List Items</span>
			<button aria-hidden="true" type="button" onclick={() => (listOpen = !listOpen)}>
				{#if listOpen}
					<ChevronDown />
				{:else}
					<ChevronRight />
				{/if}
			</button>
		</div>
	</h2>

	{#if listOpen}
		<div class="flex w-full flex-col items-center">
			{#if listEmpty && !isRemoving}
				<div in:fade={{ delay: 100 }} class="font-light text-zinc-500 italic">
					No list items to display
				</div>
			{/if}
			<div
				class="w-full px-4"
				use:dndzone={{
					items: dndItems,
					flipDurationMs,
					delayTouchStart: true,
					dropTargetStyle: { outline: 'none' },
					dropTargetClasses: ['ring-2', 'ring-blue-500', 'ring-inset', 'rounded-md']
				}}
				onconsider={handleDndConsider}
				onfinalize={handleDndFinalize}
			>
				{#each dndItems as item, index (item.id)}
					<div
						id={index.toString()}
						animate:flip={{ duration: 180 }}
						class={['w-full pb-2', index > 0 && 'border-t border-t-zinc-300 ', 'pt-2']}
						role="listitem"
					>
						<p class="flex w-full items-center justify-between gap-2.5">
							<span class="grow">
								{item.label}
							</span>
							<button
								class="inline-flex items-center"
								type="button"
								onclick={() => handleDelete(item.id)}
							>
								<Trash className="text-zinc-400" />
							</button>
						</p>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</section>
