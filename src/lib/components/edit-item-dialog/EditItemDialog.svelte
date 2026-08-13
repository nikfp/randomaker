<script lang="ts">
	import { inputSchema } from '$lib/input-normalizer';
	import { tick } from 'svelte';
	import DialogBox from '../dialog-box/DialogBox.svelte';
	import type { EditDialogProps } from './EditItemDialog.types';

	let { open, item, confirmEditHook, cancelEditHook }: EditDialogProps = $props();

	let draft = $state('');
	let inputEl: HTMLInputElement | undefined;
	let errorMessages: { message: string; key: string }[] | null = $state(null);

	$effect(() => {
		if (open) {
			draft = item.label;
			errorMessages = null;
			tick().then(() => {
				inputEl?.focus();
				inputEl?.select();
			});
		}
	});

	function handleClose() {
		cancelEditHook();
	}

	function handleSave() {
		const parseResult = inputSchema.safeParse({ input: draft });

		if (parseResult.success) {
			confirmEditHook(parseResult.data.input);
			errorMessages = null;
		} else {
			errorMessages = parseResult.error.issues.map((issue) => ({
				message: issue.message,
				key: crypto.randomUUID()
			}));
		}
	}
</script>

<DialogBox {open} onClose={handleClose}>
	{#snippet title()}
		Edit item
	{/snippet}
	<div>
		<label for="edit-item-input" class="sr-only">Edit item</label>
		<input
			id="edit-item-input"
			name="edit-item-input"
			type="text"
			aria-label="Edit item"
			class={[
				'w-full rounded-md border bg-white px-4 py-2.5 text-sm',
				'text-zinc-800 placeholder:text-zinc-400 focus:border-blue-500',
				'dark:bg-zinc-700 dark:text-zinc-200 dark:placeholder:text-zinc-500',
				'focus:ring-2 focus:ring-blue-500 focus:outline-none',
				'dark:border-zinc-600 dark:focus:ring-blue-600',
				!errorMessages && 'border-zinc-400',
				!!errorMessages && 'border-red-500 dark:border-red-700'
			]}
			bind:value={draft}
			bind:this={inputEl}
			onkeydown={(event) => {
				if (event.key === 'Enter') {
					event.preventDefault();
					handleSave();
				}
			}}
		/>
		{#if errorMessages}
			{#each errorMessages as error, i (error.key)}
				<p id={`edit-error-${i}`} class="mt-2 text-red-500 dark:text-red-600">
					{error.message}
				</p>
			{/each}
		{/if}
	</div>
	{#snippet actions()}
		<button
			type="button"
			class="rounded-md border border-zinc-400 px-3 py-1.5 text-sm text-zinc-600 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-zinc-500 dark:text-zinc-400 dark:focus:ring-blue-600"
			onclick={cancelEditHook}
		>
			Cancel
		</button>
		<button
			type="button"
			disabled={draft.trim() === ''}
			class={[
				'rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700',
				'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none',
				'dark:bg-blue-800 dark:text-zinc-300 dark:hover:bg-blue-600 dark:focus:ring-blue-600',
				'disabled:cursor-not-allowed disabled:opacity-50'
			]}
			onclick={handleSave}
		>
			Save
		</button>
	{/snippet}
</DialogBox>
