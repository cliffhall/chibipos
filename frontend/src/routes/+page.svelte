<script>
	import CatMenu from '$lib/components/CatMenu.svelte';
	import Display from '$lib/components/Display.svelte';
	import Order from '$lib/components/Order.svelte';
	import { selectedCat } from '$lib/stores/shared.svelte.js';

	let { data } = $props();
	let { cats, products } = data;
	let filteredProducts = $derived(
		products.filter((product) => product.catproduct_id === selectedCat.cat)
	);
</script>

<div class="grid">
	<CatMenu {cats} />
	<Display {filteredProducts} />
	<Order />
</div>

<style lang="scss">
	.grid {
		display: grid;
		height: 100%;
		width: 100%;
		grid-template-columns: 160px 1fr var(--ticketCol-width);
		grid-template-rows: 1fr;
		overflow: hidden;
	}
</style>
