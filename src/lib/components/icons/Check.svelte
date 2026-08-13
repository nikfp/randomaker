<script lang="ts">
	let { className }: { className?: string } = $props();
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	viewBox="0 0 20 20"
	fill="currentColor"
	role="img"
	class={['h-4 w-4', className && className]}
>
	<path
		fill-rule="evenodd"
		d="M16.704 5.29a.75.75 0 0 1 0 1.06l-6.5 6.5a.75.75 0 0 1-1.06 0l-2.5-2.5a.75.75 0 0 1 1.06-1.06L9.55 11.07l5.969-5.98a.75.75 0 0 1 1.06 0Z"
		clip-rule="evenodd"
	/>
</svg>
