<script lang="ts">
	import { fade } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { dndzone, type DndEvent } from 'svelte-dnd-action';

	import ChevronDown from '$lib/components/icons/ChevronDown.svelte';
	import ChevronRight from '$lib/components/icons/ChevronRight.svelte';
	import Trash from '$lib/components/icons/Trash.svelte';
	import type { ListItem } from '$lib/randomizer-store.svelte';
	import type { ListItemsProps } from './list-items.types';

	let { sectionClass = '', listStore }: ListItemsProps = $props();

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

<section
	class={[
		'rounted-lg w-full rounded-md border',
		'border-zinc-300 bg-zinc-200',
		'bg-zinc-700 dark:border-zinc-600',
		'dark:text-zinc-300',
		sectionClass
	]}
>
	<h2 class="m-0">
		<div
			class={[
				' flex w-full items-center justify-around ',
				'gap-2 px-4',
				'text-md',
				listOpen && 'border-b border-b-zinc-300 dark:border-b-zinc-600'
			]}
		>
			<button
				type="button"
				onclick={handleClear}
				aria-label="Clear Items"
				disabled={listEmpty}
				class={[
					'text-xs',
					'rounded-sm border px-1',
					listEmpty && 'border-zinc-300 text-zinc-300 dark:border-zinc-600 dark:text-zinc-500',
					!listEmpty && 'border-zinc-500 text-zinc-600 dark:border-zinc-400 dark:text-zinc-400'
				]}
				>Clear
			</button>
			<span>Manage list items</span>
			<button
				aria-label={listOpen ? 'Collapse List' : 'Expand List'}
				aria-expanded={listOpen}
				type="button"
				onclick={() => (listOpen = !listOpen)}
				class="text-inherit dark:text-zinc-300"
			>
				{#if listOpen}
					<ChevronDown aria-hidden="true" />
				{:else}
					<ChevronRight aria-hidden="true" />
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
					dropTargetClasses: [
						'ring-2',
						'ring-blue-500',
						'dark:ring-blue-700',
						'ring-inset',
						'rounded-md'
					]
				}}
				onconsider={handleDndConsider}
				onfinalize={handleDndFinalize}
			>
				{#each dndItems as item, index (item.id)}
					<div
						id={item.id}
						animate:flip={{ duration: 180 }}
						class={[
							'w-full pb-2',
							index > 0 && 'border-t border-t-zinc-300 dark:border-t-zinc-600 ',
							'pt-2'
						]}
						role="listitem"
					>
						<p class="flex w-full items-center justify-between gap-2.5">
							<span class="grow">
								{item.label}
							</span>
							<button
								class="inline-flex items-center"
								type="button"
								aria-label={`Delete ${item.label}`}
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
