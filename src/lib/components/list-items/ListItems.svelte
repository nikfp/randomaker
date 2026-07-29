<script lang="ts">
	import { fade } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { dndzone, type DndEvent } from 'svelte-dnd-action';

	import ChevronDown from '$lib/components/icons/ChevronDown.svelte';
	import ChevronRight from '$lib/components/icons/ChevronRight.svelte';
	import Trash from '$lib/components/icons/Trash.svelte';
	import type { ListItem } from '$lib/randomizer-store.svelte';
	import type { ListItemsProps } from './list-items.types';
	import DeleteItemDialog from '$lib/components/delete-item-dialog/DeleteItemDialog.svelte';
import ClearListDialog from '$lib/components/clear-list-dialog/ClearListDialog.svelte';

	let { sectionClass = '', listStore }: ListItemsProps = $props();

	let listOpen = $state(true);
	let deleteItem: ListItem | undefined = $state(undefined);
	let clearDialogOpen = $state(false);

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

	function handleDeleteClicked(key: string) {
		deleteItem = listStore.getByKey(key);
	}

	function handleClear() {
		clearDialogOpen = true;
	}

	function confirmClearHook() {
		listStore.clear();
		clearDialogOpen = false;
	}

	function cancelClearHook() {
		clearDialogOpen = false;
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

	function confirmDeleteHook() {
		if (deleteItem) {
			listStore.removeByKey(deleteItem.id);
		}
		deleteItem = undefined;
	}

	function cancelDeleteHook() {
		deleteItem = undefined;
	}
</script>

<section
	class={[
		'max-w-md lg:max-w-lg',
		'w-full rounded-md border lg:rounded-lg',
		'border-zinc-300 bg-zinc-200',
		'dark:border-zinc-600 dark:bg-zinc-700',
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
					'text-xs lg:text-sm',
					'rounded-sm border px-1',
					listEmpty && 'border-zinc-300 text-zinc-300 dark:border-zinc-600 dark:text-zinc-500',
					!listEmpty && 'border-zinc-500 text-zinc-600 dark:border-zinc-400 dark:text-zinc-400'
				]}
				>Clear
			</button>
			<span class="text-base lg:text-lg">Manage list items</span>
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
				<div in:fade={{ delay: 100 }} class="lg:text-md text-sm font-light text-zinc-500 italic">
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
							'w-full py-2 lg:py-3',
							index > 0 && 'border-t border-t-zinc-300 dark:border-t-zinc-600 '
						]}
						role="listitem"
					>
						<p class={['flex w-full items-center justify-between gap-2.5', 'text-base lg:text-lg']}>
							<span class="grow pl-1">
								{item.label}
							</span>
							<button
								class="inline-flex items-center"
								type="button"
								aria-label={`Delete ${item.label}`}
								onclick={() => handleDeleteClicked(item.id)}
							>
								<Trash className="text-zinc-400" />
							</button>
						</p>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<DeleteItemDialog
		open={!!deleteItem}
		{confirmDeleteHook}
		{cancelDeleteHook}
		item={deleteItem ?? { id: '', label: '' }}
	/>

	<ClearListDialog
		open={clearDialogOpen}
		{confirmClearHook}
		{cancelClearHook}
	/>
</section>
