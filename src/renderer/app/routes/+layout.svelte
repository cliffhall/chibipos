<script>
	import '$lib/styles/variables.scss';
	import '$lib/styles/reset.scss';
	import '$lib/styles/base.scss';
	import Nav from '$lib/components/Nav.svelte';
	let { children } = $props();
	import { goto } from '$app/navigation';
	import { printerConfig } from '$lib/stores/shared.svelte';
	import PrinterConfig from '$lib/components/PrinterConfig.svelte';

	function animateMenuChange() {
		console.log('animateMenuChange');
	}

	$effect(() => {
		window.api.onMenuOpened(async (content) => {
			const base64Content = btoa(content);
			const response = await fetch('/api/updateMenu', {
				method: 'POST',
				body: JSON.stringify({ encryptedMenu: base64Content }),
				headers: { 'Content-Type': 'application/json' }
			});
			const result = await response.json();
			if (result.status == 200) {
				console.log('result 200');
				animateMenuChange();
			}
		});
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
	<PrinterConfig/>
{/if}

<Nav />

<style lang="scss">
	main {
		height: calc(100vh - var(--nav-height));
	}
</style>
