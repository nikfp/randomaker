<script lang="ts">
	import DialogBox from '../dialog-box/DialogBox.svelte';

	type ClearDialogProps = {
		open: boolean;
		confirmClearHook: () => void;
		cancelClearHook: () => void;
	};

	let { open, confirmClearHook, cancelClearHook }: ClearDialogProps = $props();

	function handleClose() {
		cancelClearHook();
	}
</script>

<DialogBox {open} onClose={handleClose}>
	{#snippet title()}
		Are you sure you want to clear all items?
	{/snippet}
	<div>
		<p>This will remove all items from your list.</p>
	</div>
	{#snippet actions()}
		<button type="button" onclick={handleClose}>Dismiss</button>
		<button type="button" onclick={confirmClearHook}>Clear All</button>
	{/snippet}
</DialogBox>