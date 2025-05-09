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
	// import { invalidateAll } from '$app/navigation';

	let { children } = $props();

	function animateMenuChange() {
		console.log('animateMenuChange: Menu has been updated.');
		// Consider actions like invalidateAll();
	}

	onMount(() => {
		if (window.api && typeof window.api.onMenuOpened === 'function') {

			const removeListener = window.api.onMenuOpened(async (content) => {
				try {
					const stringContent = typeof content === 'string' ? content : JSON.stringify(content);
					const base64Content = btoa(stringContent);

					if (window.api && typeof window.api.importUpdateMenu === 'function') {
						const response = await window.api.importUpdateMenu(base64Content);
						if (response && response.status === 200 && response.success) {
							console.log('Menu update via IPC successful:', response.message);
							animateMenuChange();
						} else {
							console.error('Menu update via IPC failed:', response?.error || response?.message || 'Unknown error');
						}
					} else {
						console.warn('window.api.importUpdateMenu is not available. Check preload script.');
					}
				} catch (error) {
					console.error('Error processing menu update in onMenuOpened:', error);
				}
			});

			// Cleanup the listener when the component is destroyed
			return () => {
				if (typeof removeListener === 'function') {
					removeListener(); // This should now always be true if preload.js is updated
				} else {
					// This else block becomes less likely to be hit if preload is correct,
					// but can be kept as an extreme fallback or removed if you're confident.
					console.warn('[+layout.svelte onMount cleanup] removeListener was not a function. This indicates an issue with preload.js.');
					if (window.ipcRenderer) {
						window.ipcRenderer.removeAllListeners('menu-file-opened');
					}
				}
			};
		} else {
			console.warn('[+layout.svelte onMount] window.api or window.api.onMenuOpened is not available. Check preload script.');
		}
		// No explicit return undefined needed here if the if-condition doesn't execute,
		// onMount implicitly returns undefined if no cleanup function is returned.
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
