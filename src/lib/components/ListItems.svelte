<script lang="ts">
	import ChevronDown from './icons/ChevronDown.svelte';
	import ChevronRight from './icons/ChevronRight.svelte';

	let { listOpen, listItems }: { listOpen: boolean; listItems: { key: string; label: string }[] } =
		$props();
</script>

<section class="rounted-lg w-full border rounded-md border-zinc-300 bg-zinc-200">
	<h2 class="m-0">
		<button
			class={[
				' flex w-full items-center justify-around ',
				'gap-2 px-4',
				'text-md',
				'border-b-zinc-300 border-b'
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
		<div class="p-4 w-full flex flex-col items-center">
			{#if listItems.length === 0}
				<div class="italic text-zinc-500 text-sm">No list items to display</div>
			{:else}
				{#each listItems as item, index (item.key)}
					<div id={index.toString()}>
						<p>{item.label}</p>
					</div>
				{/each}
			{/if}
		</div>
	{/if}
</section>
