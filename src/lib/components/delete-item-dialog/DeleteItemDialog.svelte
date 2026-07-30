<script lang="ts">
	import type { ListItem } from '$lib/randomizer-store.svelte';
	import DialogBox from '../dialog-box/DialogBox.svelte';

	type DeleteDialogProps = {
		open: boolean;
		item: ListItem;
		confirmDeleteHook: () => void;
		cancelDeleteHook: () => void;
	};

	let { open, item, confirmDeleteHook, cancelDeleteHook }: DeleteDialogProps = $props();

	let dismissButton: HTMLButtonElement | undefined = $state();

	$effect(() => {
		if (open && dismissButton) {
			dismissButton.focus();
		}
	});

	function handleClose() {
		cancelDeleteHook();
	}
</script>

<DialogBox {open} onClose={handleClose}>
	{#snippet title()}
		Are you sure you want to delete this item?
	{/snippet}
	<div>
		<h4>Current item value:</h4>
		<p>{item.label}</p>
	</div>
	{#snippet actions()}
		<button
			type="button"
			class="rounded-md border border-zinc-400 px-3 py-1.5 text-sm text-zinc-600 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-zinc-500 dark:text-zinc-400 dark:focus:ring-blue-600"
			onclick={confirmDeleteHook}
		>
			Delete it!
		</button>
		<button
			type="button"
			bind:this={dismissButton}
			class="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:bg-blue-800 dark:text-zinc-300 dark:hover:bg-blue-600 dark:focus:ring-blue-600"
			onclick={handleClose}
		>
			Dismiss
		</button>
	{/snippet}
</DialogBox>
