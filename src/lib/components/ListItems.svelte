<script lang="ts">
	import { fade } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { dndzone, type DndEvent } from 'svelte-dnd-action';

	import ChevronDown from './icons/ChevronDown.svelte';
	import ChevronRight from './icons/ChevronRight.svelte';
	import Trash from './icons/Trash.svelte';
	import type { ListItem } from '$lib/randomizer-store.svelte';

	type Props = {
		deleteItemHook: (key: string) => void;
		reorderItemsHook: (items: ListItem[]) => void;
		listItems: ListItem[];
	};

	let { listItems, reorderItemsHook, deleteItemHook }: Props = $props();
	let listOpen = $state(true);

	let isRemoving = $state(false);
	let showEmpty = $state(listItems.length === 0);

	const flipDurationMs = 180;
	let dndItems = $state<ListItem[]>([]);
	let isDragging = $state(false);

	$effect(() => {
		if (!isDragging) {
			dndItems = [...listItems];
		}
		if (listItems.length > 0) {
			showEmpty = false;
		}
	});

	function handleDelete(key: string) {
		isRemoving = true;
		showEmpty = false;
		deleteItemHook(key);
	}

	function handleOutroEnd() {
		isRemoving = false;

		if (listItems.length === 0) {
			showEmpty = true;
		}
	}

	function handleDndConsider(event: CustomEvent<DndEvent<ListItem>>) {
		isDragging = true;
		dndItems = event.detail.items;
	}

	function handleDndFinalize(event: CustomEvent<DndEvent<ListItem>>) {
		dndItems = event.detail.items;
		reorderItemsHook(event.detail.items);
		isDragging = false;
	}
</script>

<section class="rounted-lg w-full rounded-md border border-zinc-300 bg-zinc-200">
	<h2 class="m-0">
		<button
			class={[
				' flex w-full items-center justify-around ',
				'gap-2 px-4',
				'text-md',
				listOpen && 'border-b border-b-zinc-300'
			]}
			type="button"
			onclick={() => (listOpen = !listOpen)}
		>
			<span>Existing List Items</span>
			<span aria-hidden="true"
				>{#if listOpen}
					<ChevronDown />
				{:else}
					<ChevronRight />
				{/if}</span
			>
		</button>
	</h2>

	{#if listOpen}
		<div class="flex w-full flex-col items-center">
			{#if showEmpty && !isRemoving}
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
						onoutroend={handleOutroEnd}
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
