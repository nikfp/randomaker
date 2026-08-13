<script lang="ts">
	import { fade } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { dndzone, type DndEvent } from 'svelte-dnd-action';

	import ChevronDown from '$lib/components/icons/ChevronDown.svelte';
	import ChevronRight from '$lib/components/icons/ChevronRight.svelte';
	import Pencil from '$lib/components/icons/Pencil.svelte';
	import Trash from '$lib/components/icons/Trash.svelte';
	import type { ListItem } from '$lib/randomizer-store.svelte';
	import type { ListItemsProps } from './list-items.types';
	import DeleteItemDialog from '$lib/components/delete-item-dialog/DeleteItemDialog.svelte';
	import EditItemDialog from '$lib/components/edit-item-dialog/EditItemDialog.svelte';
	import ClearListDialog from '$lib/components/clear-list-dialog/ClearListDialog.svelte';
	import ListOptionsMenu from '$lib/components/list-options-menu/ListOptionsMenu.svelte';
	import PresetPickerDialog from '$lib/components/preset-picker-dialog/PresetPickerDialog.svelte';
	import DialogBox from '$lib/components/dialog-box/DialogBox.svelte';
	import type { Preset } from '$lib/presets';

	let {
		sectionClass = '',
		listStore,
		noRepeat = false,
		onToggleNoRepeat = () => {}
	}: ListItemsProps = $props();

	let listOpen = $state(true);
	let deleteItem: ListItem | undefined = $state(undefined);
	let editItem: ListItem | undefined = $state(undefined);
	let editTrigger: HTMLButtonElement | undefined = $state(undefined);
	let clearDialogOpen = $state(false);
	let presetPickerOpen = $state(false);
	let pendingPreset: Preset | undefined = $state(undefined);

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

	function handleEditClicked(key: string, trigger: HTMLButtonElement) {
		editItem = listStore.getByKey(key);
		editTrigger = trigger;
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

	function openPresetPicker() {
		presetPickerOpen = true;
	}

	function closePresetPicker() {
		presetPickerOpen = false;
	}

	function applyPreset(preset: Preset) {
		listStore.loadPreset(preset.labels);
	}

	function handlePresetSelected(preset: Preset) {
		presetPickerOpen = false;
		if (listEmpty) {
			applyPreset(preset);
		} else {
			pendingPreset = preset;
		}
	}

	function confirmReplaceHook() {
		if (pendingPreset) {
			applyPreset(pendingPreset);
		}
		pendingPreset = undefined;
	}

	function cancelReplaceHook() {
		pendingPreset = undefined;
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

	function confirmEditHook(newLabel: string) {
		if (editItem) {
			listStore.updateByKey(editItem.id, newLabel);
		}
		editItem = undefined;
		editTrigger?.focus();
	}

	function cancelEditHook() {
		editItem = undefined;
		editTrigger?.focus();
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
			<div class="flex items-center gap-2">
				<ListOptionsMenu
					{noRepeat}
					{onToggleNoRepeat}
					onClear={handleClear}
					onOpenPresets={openPresetPicker}
				/>
			</div>
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
								aria-label={`Edit ${item.label}`}
								onclick={(event) => handleEditClicked(item.id, event.currentTarget)}
							>
								<Pencil className="text-zinc-400" />
							</button>
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

	<EditItemDialog
		open={!!editItem}
		{confirmEditHook}
		{cancelEditHook}
		item={editItem ?? { id: '', label: '' }}
	/>

	<ClearListDialog open={clearDialogOpen} {confirmClearHook} {cancelClearHook} />

	<PresetPickerDialog
		open={presetPickerOpen}
		onSelect={handlePresetSelected}
		onClose={closePresetPicker}
	/>

	<DialogBox open={!!pendingPreset} onClose={cancelReplaceHook}>
		{#snippet title()}
			Replace your list with the {pendingPreset?.name} preset?
		{/snippet}
		<div>
			<p>This will replace all current items with the preset.</p>
		</div>
		{#snippet actions()}
			<button
				type="button"
				class="rounded-md border border-zinc-400 px-3 py-1.5 text-sm text-zinc-600 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-zinc-500 dark:text-zinc-400 dark:focus:ring-blue-600"
				onclick={confirmReplaceHook}
			>
				Replace
			</button>
			<button
				type="button"
				class="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:bg-blue-800 dark:text-zinc-300 dark:hover:bg-blue-600 dark:focus:ring-blue-600"
				onclick={cancelReplaceHook}
			>
				Dismiss
			</button>
		{/snippet}
	</DialogBox>
</section>
