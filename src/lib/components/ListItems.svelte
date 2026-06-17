<script lang="ts">
	import { fade } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { draggable, droppable, type DragDropState } from '@thisux/sveltednd';

	import ChevronDown from './icons/ChevronDown.svelte';
	import ChevronRight from './icons/ChevronRight.svelte';
	import Trash from './icons/Trash.svelte';

	type Props = {
		deleteItemHook: (key: string) => void;
		moveItemHook: (from: string, to: string, place: 'before' | 'after') => void;
		listItems: { key: string; label: string }[];
	};

	let { listItems, moveItemHook, deleteItemHook }: Props = $props();
	let listOpen = $state(true);

	let isRemoving = $state(false);
	let showEmpty = $state(listItems.length === 0);

	$effect(() => {
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

	function handleDrop(state: DragDropState<(typeof listItems)[0]>) {
		const { draggedItem, targetContainer, dropPosition } = state;

		if (!targetContainer) return;

		moveItemHook(draggedItem.key, targetContainer, dropPosition ?? 'before');
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
		<div class="flex w-full flex-col items-center px-4">
			{#if showEmpty && !isRemoving}
				<div in:fade={{ delay: 100 }} class="font-light text-zinc-500 italic">
					No list items to display
				</div>
			{/if}
			{#each listItems as item, index (item.key)}
				<div
					use:draggable={{ container: item.key, dragData: item, handle: '.drag-handle' }}
					use:droppable={{ container: item.key, callbacks: { onDrop: handleDrop } }}
					id={index.toString()}
					animate:flip={{ duration: 180 }}
					in:fade={{ duration: 150 }}
					out:fade={{ duration: 150 }}
					onoutroend={handleOutroEnd}
					class={['w-full pb-2', index > 0 && 'border-t border-t-zinc-300 ', 'pt-2']}
					role="listitem"
				>
					<p class="flex w-full items-center justify-between gap-2.5">
						<span class="drag-handle text-zinc-400">⋮⋮</span>
						<span class="grow">
							{item.label}
						</span>
						<button
							class="inline-flex items-center"
							type="button"
							onclick={() => handleDelete(item.key)}
						>
							<Trash className="text-zinc-400" />
						</button>
					</p>
				</div>
			{/each}
		</div>
	{/if}
</section>
