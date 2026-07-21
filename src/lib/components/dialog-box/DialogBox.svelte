<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		open?: boolean;
		title?: Snippet;
		children?: Snippet;
		actions?: Snippet;
		onClose?: () => void;
	};

	let { open = $bindable(false), title, children, actions, onClose }: Props = $props();

	function close() {
		open = false;
		onClose?.();
	}

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			close();
		}
	}
</script>

{#if open}
	<div class="fixed inset-0 z-50 grid place-items-center p-4 sm:p-6">
		<button
			type="button"
			class="absolute inset-0 bg-black/50"
			aria-label="Close dialog"
			onclick={close}
		></button>

		<div
			role="dialog"
			aria-modal="true"
			aria-labelledby="dialog-title"
			tabindex="-1"
			class="relative z-10 w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl ring-1 ring-black/10"
			onkeydown={onKeydown}
		>
			{#if title}
				<header class="mb-4">
					<h2 id="dialog-title" class="text-lg font-semibold text-zinc-900">
						{@render title()}
					</h2>
				</header>
			{/if}

			<div class="text-sm text-zinc-700">
				{@render children?.()}
			</div>

			<footer class="mt-6 flex justify-end gap-3">
				{#if actions}
					{@render actions()}
				{:else}
					<button type="button" onclick={close}>Dismiss</button>
				{/if}
			</footer>
		</div>
	</div>
{/if}
