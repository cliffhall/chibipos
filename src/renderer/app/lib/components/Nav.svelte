<script>
	import { printerConfig } from '../stores/shared.svelte.js';
	import { goto } from '$app/navigation';

	async function navigateTo(path) {
		console.log(`[Nav.svelte DIAGNOSTIC] Attempting to goto: ${path}`);
		console.log(`[Nav.svelte DIAGNOSTIC] Current window.location.href (before goto): ${window.location.href}`);
		try {
			await goto(path); // Use SvelteKit's goto
			console.log(`[Nav.svelte DIAGNOSTIC] goto('${path}') completed. New window.location.href (after goto): ${window.location.href}`);
		} catch (error) {
			console.error(`[Nav.svelte DIAGNOSTIC] Error during goto('${path}'):`, error);
		}
	}

	async function updateDailySales() {
		console.log('[Nav.svelte] Starting updateDailySales process...');
		let reportGeneratedOrFound = false;
		const targetDate = new Date();
		let dateString;
		let daysChecked = 0;
		const maxDaysToCheck = 365;

		while (!reportGeneratedOrFound && daysChecked < maxDaysToCheck) {
			targetDate.setDate(targetDate.getDate() - 1);
			dateString = targetDate.toISOString().split('T')[0];
			daysChecked++;
			console.log(`[Nav.svelte] Checking for sales report or tickets for: ${dateString}`);
			try {
				if (!window.api || typeof window.api.getSaleByDate !== 'function' || typeof window.api.getTicketsByDate !== 'function' || typeof window.api.updateDailySalesReport !== 'function') {
					console.error('[Nav.svelte] One or more required window.api functions are not available. Check preload script.');
					break;
				}
				const saleCheckResponse = await window.api.getSaleByDate(dateString);
				if (saleCheckResponse && saleCheckResponse.status === 200 && saleCheckResponse.sale) {
					console.log(`[Nav.svelte] Sales report for ${dateString} already exists.`);
					reportGeneratedOrFound = true;
					break;
				} else if (saleCheckResponse && saleCheckResponse.status === 204) {
					const ticketsResponse = await window.api.getTicketsByDate(dateString);
					if (ticketsResponse && !ticketsResponse.error && ticketsResponse.length > 0) {
						const updateResult = await window.api.updateDailySalesReport(dateString);
						if (updateResult && updateResult.status === 200 && updateResult.dailySale) {
							console.log(`[Nav.svelte] Successfully generated sales report for ${dateString}.`);
							reportGeneratedOrFound = true;
						} else {
							console.error(`[Nav.svelte] Failed to generate sales report for ${dateString}:`, updateResult?.error);
						}
						break;
					} else if (ticketsResponse && ticketsResponse.error) {
						console.error(`[Nav.svelte] Error fetching tickets for ${dateString}:`, ticketsResponse.error);
					} else {
						console.log(`[Nav.svelte] No tickets for ${dateString}.`);
					}
				} else if (saleCheckResponse && saleCheckResponse.error) {
					console.error(`[Nav.svelte] Error checking sales report for ${dateString}:`, saleCheckResponse.error);
				}
			} catch (error) {
				console.error(`[Nav.svelte] Error in updateDailySales for ${dateString}:`, error);
				break;
			}
		}
		if (!reportGeneratedOrFound) {
			console.log('[Nav.svelte] updateDailySales: No new reports generated or needed.');
		}
	}

	function togglePrinterConfig() {
		printerConfig.visible = !printerConfig.visible;
		console.log('[Nav.svelte] Toggled printerConfig.visible to:', printerConfig.visible);
	}
</script>

<nav>
	<ul class="links">
		<button class="nav-button-link" onclick={() => navigateTo('/')}>Venta</button>
		<button class="nav-button-link" onclick={() => navigateTo('/tickets')}>Tickets</button>
		<button class="nav-button-link" onclick={() => navigateTo('/reportes')}>Reportes</button>
	</ul>

	<ul class="buttons">
		<button onclick={updateDailySales}>actualizar reportes</button>
		<button onclick={togglePrinterConfig}>IP impresora</button>
	</ul>
</nav>

<style lang="scss">
	nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 2em;
		height: var(--nav-height);
		background-color: var(--color-darker);
	}

	ul {
		display: flex;
		gap: 2em;
	}

	/* Style for regular buttons in the "buttons" ul */
	.buttons button {
		color: var(--color-text-secondary);
		border: solid 1px var(--color-text-secondary);
		border-radius: 8px;
		padding: 0.5em 1em;
		cursor: pointer;
		transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
		background-color: transparent; /* Ensure it's distinct from nav-button-link if needed */
	}

	.buttons button:hover {
		border-color: var(--color-light);
		color: var(--color-light);
		background-color: var(--color-hover);
	}

	/* Style for buttons in "links" ul to make them look like the previous <a> tags */
	.links button.nav-button-link {
		padding: 0.5em 1em;
		cursor: pointer;
		border-radius: 8px;
		border: solid var(--color-text-secondary) 1px;
		color: var(--color-text-secondary);
		min-width: 8em;
		text-align: center;
		transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
		background-color: transparent; /* Important for link appearance */
		font-family: inherit; /* Match surrounding text */
		font-size: inherit; /* Match surrounding text */
		line-height: inherit; /* Match surrounding text */
	}

	.links button.nav-button-link:hover {
		border-color: var(--color-light);
		color: var(--color-light);
		background-color: var(--color-hover);
	}
</style>
