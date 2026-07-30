<script lang="ts">
	import DialogBox from '../dialog-box/DialogBox.svelte';

	type ClearDialogProps = {
		open: boolean;
		confirmClearHook: () => void;
		cancelClearHook: () => void;
	};

	let { open, confirmClearHook, cancelClearHook }: ClearDialogProps = $props();

	let dismissButton: HTMLButtonElement | undefined = $state();

	$effect(() => {
		if (open && dismissButton) {
			dismissButton.focus();
		}
	});

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
		<button
			type="button"
			class="rounded-md border border-zinc-400 px-3 py-1.5 text-sm text-zinc-600 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-zinc-500 dark:text-zinc-400 dark:focus:ring-blue-600"
			onclick={confirmClearHook}
		>
			Clear All
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
