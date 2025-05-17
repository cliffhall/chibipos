<script>
	// Global style imports
	import '$lib/styles/variables.scss';
	import '$lib/styles/reset.scss';
	import '$lib/styles/base.scss';

	// Component and store imports
	import Nav from '$lib/components/Nav.svelte';
	import PrinterConfig from '$lib/components/PrinterConfig.svelte';
	import { printerConfig } from '../lib/stores/shared.svelte.js';
	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/stores'; // Import the $page store

	export const csr = true;
	export const prerender = false;
	export const ssr = false;

	let { children } = $props();

	function animateMenuChange() {
		console.log('animateMenuChange: Menu has been updated.');
		invalidateAll();
	}

	onMount(() => {
		console.log('[+layout.svelte DIAGNOSTIC] Component Mounted.');
		console.log(`[+layout.svelte DIAGNOSTIC] Initial window.location.href: ${window.location.href}`);
		console.log(`[+layout.svelte DIAGNOSTIC] Initial window.location.pathname: ${window.location.pathname}`);
		console.log(`[+layout.svelte DIAGNOSTIC] Initial window.location.hash: ${window.location.hash}`);

		// --- DIAGNOSTIC: Find and log SvelteKit's base path ---
		let svelteKitBaseFound = 'NOT FOUND in window object';
		let svelteKitBaseValue = 'N/A';
		for (const key in window) {
			if (key.startsWith('__sveltekit_') && typeof window[key] === 'object' && window[key] !== null && 'base' in window[key]) {
				svelteKitBaseFound = key;
				svelteKitBaseValue = window[key].base;
				break;
			}
		}
		console.log(`[+layout.svelte DIAGNOSTIC] SvelteKit base object key: ${svelteKitBaseFound}`);
		console.log(`[+layout.svelte DIAGNOSTIC] SvelteKit base value:`, svelteKitBaseValue);
		// --- END DIAGNOSTIC ---

		// --- DIAGNOSTIC: Log the $page store from SvelteKit (Enhanced) ---
		const unsubscribePageStore = page.subscribe(currentPage => {
			if (currentPage) {
				const pageDetails = {
					url: currentPage.url?.href,
					routeId: currentPage.route?.id,
					status: currentPage.status,
					error: currentPage.error ? { message: currentPage.error.message, status: currentPage.error.status, name: currentPage.error.name } : null,
					params: currentPage.params,
					// data: currentPage.data // Be careful logging data if it's large or sensitive
				};
				// Log a stringified version to avoid issues with console display of complex objects
				try {
					console.log('[+layout.svelte DIAGNOSTIC] $page store update:', JSON.parse(JSON.stringify(pageDetails)));
				} catch (e) {
					console.error('[+layout.svelte DIAGNOSTIC] Error stringifying $page store for logging:', e);
					console.log('[+layout.svelte DIAGNOSTIC] $page store update (raw):', pageDetails); // Fallback to raw object
				}
			} else {
				console.log('[+layout.svelte DIAGNOSTIC] $page store update: currentPage is null/undefined');
			}
		});
		// --- END DIAGNOSTIC ---

		let removeMenuFileListener = () => {}; // Default to no-op

		if (window.api && typeof window.api.onMenuFileOpened === 'function') {
			console.log('[+layout.svelte onMount] Setting up onMenuFileOpened listener.');
			removeMenuFileListener = window.api.onMenuFileOpened(async (content) => {
				try {
					console.log('[+layout.svelte] Received menu-file-opened with content.');
					const stringContent = typeof content === 'string' ? content : JSON.stringify(content);
					const base64Content = btoa(unescape(encodeURIComponent(stringContent)));

					if (window.api && typeof window.api.importUpdateMenu === 'function') {
						const response = await window.api.importUpdateMenu(base64Content);
						if (response && response.status === 200 && response.success) {
							console.log('Menu update via IPC successful:', response.message);
							animateMenuChange();
						} else {
							console.error('Menu update via IPC failed:', response?.error || response?.message || 'Unknown error');
						}
					} else {
						console.warn('[+layout.svelte] window.api.importUpdateMenu is not available.');
					}
				} catch (error) {
					console.error('[+layout.svelte] Error processing menu update in onMenuFileOpened:', error);
				}
			});
		} else {
			console.warn('[+layout.svelte onMount] window.api.onMenuFileOpened is NOT available.');
		}

		// Cleanup function for onMount
		return () => {
			console.log('[+layout.svelte onUnmount] Cleaning up listeners.');
			unsubscribePageStore(); // Unsubscribe from $page store
			if (typeof removeMenuFileListener === 'function') {
				removeMenuFileListener(); // Remove the menu file listener
			}
		};
	});
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
	<link
			href="https://fonts.googleapis.com/css2?family=Bakbak+One&family=Roboto+Mono:ital,wght@0,100..700;1,100..700&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap"
			rel="stylesheet"
	/>
</svelte:head>

<main>
	{@render children()}
</main>

{#if printerConfig.visible}
	<PrinterConfig />
{/if}

<Nav />

<style lang="scss">
	main {
		height: calc(100vh - var(--nav-height));
	}
</style>
