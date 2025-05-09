<script>
	import CatMenu from '$lib/components/CatMenu.svelte';
	import Display from '$lib/components/Display.svelte';
	import Order from '$lib/components/Order.svelte';
	import { selectedCat } from '../lib/stores/shared.svelte.js';
	import { onMount } from 'svelte';

	// data prop will be populated by the load function in +layout.server.js (or +page.server.js)
	let { data } = $props(); // Use $props() for Svelte 5 runes

	// Initialize state with data from the load function for SSR,
	// or fallback to empty arrays if data is not structured as expected.
	let cats = $state(data.initialCats || []);
	let products = $state(data.initialProducts || []); // This ensures 'products' is an array during SSR
	let isLoading = $state(true);

	// src/renderer/app/routes/+page.svelte
	onMount(async () => {
		isLoading = true;
		try {
			if (window.api) {
				console.log('[+page.svelte] window.api is available. Fetching data...'); // Add this
				const [categoriesResult, productsResult] = await Promise.all([
					window.api.getCategories(),
					window.api.getProducts()
				]);

				console.log('[+page.svelte] Categories Result from IPC:', categoriesResult); // Add this
				console.log('[+page.svelte] Products Result from IPC:', productsResult);   // Add this

				if (categoriesResult && !categoriesResult.error) {
					cats = categoriesResult;
				} else {
					console.error("[+page.svelte] Error in categoriesResult:", categoriesResult?.error);
				}

				if (productsResult && !productsResult.error) {
					products = productsResult;
				} else {
					console.error("[+page.svelte] Error in productsResult:", productsResult?.error);
				}

				console.log('[+page.svelte] Updated cats state:', cats);         // Add this
				console.log('[+page.svelte] Updated products state:', products); // Add this

			} else {
				console.warn('[+page.svelte] window.api is not available for fetching data.');
			}
		} catch (err) {
			console.error("[+page.svelte] Failed to load page data via IPC:", err);
		} finally {
			isLoading = false;
			console.log('[+page.svelte] isLoading set to false. Cats length:', cats.length, 'Products length:', products.length); // Add this
		}
	});


	// This should now work safely during SSR because 'products' will be an empty array.
	let filteredProducts = $derived(
			products.filter((product) => product.catproduct_id === selectedCat.cat)
	);
</script>

{#if isLoading && !cats.length && !products.length}
	<p>Loading menu...</p>
{:else}
	<div class="grid">
		<CatMenu {cats} />
		<Display {filteredProducts} />
		<Order />
	</div>
{/if}

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
