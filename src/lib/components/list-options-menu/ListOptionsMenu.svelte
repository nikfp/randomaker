<script lang="ts">
	import { scale } from 'svelte/transition';
	import Check from '$lib/components/icons/Check.svelte';
	import type { ListOptionsMenuProps } from './ListOptionsMenu.types';

	let {
		noRepeat,
		onToggleNoRepeat,
		onClear = () => {},
		onOpenPresets = () => {}
	}: ListOptionsMenuProps = $props();

	const TOGGLE_CLOSE_DELAY_MS = 600;

	let open = $state(false);
	let trigger: HTMLButtonElement | undefined = $state();
	let firstItem: HTMLButtonElement | undefined = $state();
	let closeTimer: ReturnType<typeof setTimeout> | undefined;

	function openMenu() {
		if (closeTimer) {
			clearTimeout(closeTimer);
			closeTimer = undefined;
		}
		open = true;
	}

	function closeMenu() {
		if (closeTimer) {
			clearTimeout(closeTimer);
			closeTimer = undefined;
		}
		open = false;
		trigger?.focus();
	}

	function handleToggle() {
		onToggleNoRepeat(!noRepeat);
		if (closeTimer) {
			clearTimeout(closeTimer);
		}
		closeTimer = setTimeout(closeMenu, TOGGLE_CLOSE_DELAY_MS);
	}

	function handleClear() {
		onClear();
		closeMenu();
	}

	function handleOpenPresets() {
		onOpenPresets();
		closeMenu();
	}

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && open) {
			closeMenu();
		}
	}

	$effect(() => {
		if (open) {
			firstItem?.focus();
		}
	});

	$effect(() => {
		return () => {
			if (closeTimer) {
				clearTimeout(closeTimer);
			}
		};
	});
</script>

<svelte:window onkeydown={onKeydown} />

<div class="relative">
	<button
		type="button"
		aria-label="Options"
		aria-haspopup="menu"
		aria-expanded={open}
		bind:this={trigger}
		onclick={openMenu}
		class={[
			'text-xs lg:text-sm',
			'rounded-sm border px-1',
			'border-zinc-500 text-zinc-600 dark:border-zinc-400 dark:text-zinc-400'
		]}
	>
		Options
	</button>

	{#if open}
		<button
			type="button"
			aria-label="Close options menu"
			tabindex="-1"
			onclick={closeMenu}
			class="fixed inset-0 z-40 cursor-default"
		></button>

		<div
			role="menu"
			class={[
				'absolute right-0 z-50 mt-1 w-max min-w-40',
				'rounded-md border border-zinc-300 bg-white shadow-lg',
				'dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-300',
				'focus:outline-none'
			]}
		>
			<button
				type="button"
				role="menuitemcheckbox"
				aria-checked={noRepeat}
				bind:this={firstItem}
				onclick={handleToggle}
				class={[
					'flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm',
					'focus:bg-zinc-100 focus:outline-none dark:focus:bg-zinc-600',
					noRepeat && 'text-zinc-900 dark:text-zinc-100'
				]}
			>
				<span
					aria-hidden="true"
					class={[
						'inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors duration-150',
						noRepeat
							? 'border-blue-600 bg-blue-600 dark:border-blue-500 dark:bg-blue-500'
							: 'border-zinc-400 dark:border-zinc-500'
					]}
				>
					{#if noRepeat}
						<span transition:scale={{ duration: 150 }}>
							<Check className="h-3 w-3 text-white" />
						</span>
					{/if}
				</span>
				No repeats this session
			</button>

			<button
				type="button"
				role="menuitem"
				onclick={handleClear}
				class={[
					'flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm',
					'border-t border-t-zinc-200 focus:bg-zinc-100 focus:outline-none',
					'dark:border-t-zinc-600 dark:focus:bg-zinc-600'
				]}
			>
				Clear list
			</button>

			<button
				type="button"
				role="menuitem"
				onclick={handleOpenPresets}
				class={[
					'flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm',
					'focus:bg-zinc-100 focus:outline-none dark:focus:bg-zinc-600'
				]}
			>
				Presets
			</button>
		</div>
	{/if}
</div>
