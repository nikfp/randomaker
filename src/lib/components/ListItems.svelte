<script lang="ts">
	import { fade } from 'svelte/transition';

	import ChevronDown from './icons/ChevronDown.svelte';
	import ChevronRight from './icons/ChevronRight.svelte';

	type Props = {
		deleteItemHook: (key: string) => void;
		listItems: { key: string; label: string }[];
	};

	let props: Props = $props();
	let listOpen = $state(true);

	let isRemoving = $state(false);
	let showEmpty = $state(props.listItems.length === 0);

	$effect(() => {
		if (props.listItems.length > 0) {
			showEmpty = false;
		}
	});

	function handleDelete(key: string) {
		isRemoving = true;
		showEmpty = false;
		props.deleteItemHook(key);
	}

	function handleOutroEnd() {
		isRemoving = false;

		if (props.listItems.length === 0) {
			showEmpty = true;
		}
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
		<div class="flex w-full flex-col items-center p-4">
			{#if showEmpty && !isRemoving}
				<div in:fade={{ delay: 100 }} class="text-zinc-500 italic font-light">No list items to display</div>
			{/if}
			{#each props.listItems as item, index (item.key)}
				<div
					id={index.toString()}
					in:fade={{ duration: 250 }}
					out:fade={{ duration: 250 }}
					onoutroend={handleOutroEnd}
				>
					<p>
						<span>
							{item.label}
						</span>
						<span>
							<button type="button" onclick={() => handleDelete(item.key)}> X </button>
						</span>
					</p>
				</div>
			{/each}
		</div>
	{/if}
</section>
