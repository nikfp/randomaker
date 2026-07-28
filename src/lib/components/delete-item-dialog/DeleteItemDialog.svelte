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

	function handleClose() {
		cancelDeleteHook();
	}
</script>

<DialogBox {open} onClose={handleClose}>
	{#snippet title()}
		<h2>Are you sure you want to delete this item?</h2>
	{/snippet}
	<div>
		<h4>Current item value:</h4>
		<p>{item.label}</p>
	</div>
	{#snippet actions()}
		<button type="button" onclick={handleClose}>Dismiss</button>
		<button type="button" onclick={confirmDeleteHook}>Delete it!</button>
	{/snippet}
</DialogBox>
