<script>
	// import { fade, fly } from 'svelte/transition';
	import Product from '$lib/components/Product.svelte';

	let { filteredProducts } = $props();
</script>

<ul class="display">
	{#each filteredProducts as product}
		<Product {product} />
	{/each}
</ul>

<style lang="scss">
	.display {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		grid-template-rows: min-content;
		grid-auto-flow: dense;
		column-gap: 1.5em;
		row-gap: 1.5em;
		overflow-y: auto;
		padding: 1em var(--panel-padding);
	}
</style>
