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

	let { children } = $props();

	function animateMenuChange() {
		console.log('animateMenuChange: Menu has been updated.');
		invalidateAll();
	}


	onMount(() => {
		console.log('[+layout.svelte onMount] MOUNTED. Checking window object:', window);
		if (window.api) {
			console.log('[+layout.svelte onMount] window.api IS AVAILABLE. Keys:', Object.keys(window.api));
			if (typeof window.api.getCategories === 'function') {
				console.log('[+layout.svelte onMount] window.api.getCategories IS a function.');
			} else {
				console.warn('[+layout.svelte onMount] window.api.getCategories IS NOT a function.');
			}

			// Use the new handler for menu file opened
			if (typeof window.api.onMenuFileOpened === 'function') {
				console.log('[+layout.svelte onMount] Setting up onMenuFileOpened listener.');
				const removeListener = window.api.onMenuFileOpened(async (content) => {
					try {
						console.log('[+layout.svelte] Received menu-file-opened with content.');
						// Ensure content is a string before btoa
						const stringContent = typeof content === 'string' ? content : JSON.stringify(content);
						// Correctly encode UTF-8 to Base64
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

				return () => {
					if (typeof removeListener === 'function') {
						console.log('[+layout.svelte onUnmount] Removing onMenuFileOpened listener.');
						removeListener();
					}
				};
			} else {
				console.warn('[+layout.svelte onMount] window.api.onMenuFileOpened is NOT available.');
			}
		} else {
			console.warn('[+layout.svelte onMount] window.api IS NOT AVAILABLE.');
		}
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
