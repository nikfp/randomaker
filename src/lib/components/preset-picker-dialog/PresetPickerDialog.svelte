<script lang="ts">
	import DialogBox from '../dialog-box/DialogBox.svelte';
	import { PRESETS, type Preset } from '$lib/presets';

	type PresetPickerDialogProps = {
		open: boolean;
		onSelect: (preset: Preset) => void;
		onClose: () => void;
	};

	let { open, onSelect, onClose }: PresetPickerDialogProps = $props();

	let dismissButton: HTMLButtonElement | undefined = $state();

	$effect(() => {
		if (open && dismissButton) {
			dismissButton.focus();
		}
	});

	function handleClose() {
		onClose();
	}
</script>

<DialogBox {open} onClose={handleClose}>
	{#snippet title()}
		Choose a preset
	{/snippet}
	<div class="flex flex-col gap-1">
		{#each PRESETS as preset (preset.name)}
			<button
				type="button"
				class="rounded-md border border-zinc-300 px-3 py-1.5 text-left text-sm text-zinc-700 hover:bg-zinc-100 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700 dark:focus:ring-blue-600"
				onclick={() => onSelect(preset)}
			>
				{preset.name}
			</button>
		{/each}
	</div>
	{#snippet actions()}
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
