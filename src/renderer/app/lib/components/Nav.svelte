<script>
	// Assuming printerConfig store is correctly defined elsewhere
	// import { printerConfig } from '../stores/shared.svelte.js';
	// For the purpose of this example, let's mock it if it's not central to the issue
	let printerConfig = $state({ ip: '192.168.1.100', visible: false });


	// This function uses fetch and doesn't seem to be called by any UI element
	// in the provided code. If it's needed, it should also be converted to use
	// an IPC call, and you'd need a corresponding handler in main.js.
	// For now, I'll leave it commented or you can remove it if it's unused.
	/*
	async function changeTicketDate() {
		// This would need an IPC equivalent, e.g., window.api.updateTicketDate(...)
		const response = await fetch('/api/ticket', {
			method: 'PATCH',
			headers: {'Content-Type': 'application/json'}
		})
		const result = await response.json()
		console.log('change date result: ', result)
	}
	*/

	async function updateDailySales() {
		console.log('[Nav.svelte] Starting updateDailySales process...');
		let reportGeneratedOrFound = false;
		const targetDate = new Date(); // Starts from "today" to then go to "yesterday"
		let dateString;
		let daysChecked = 0;
		const maxDaysToCheck = 365; // Safety limit

		while (!reportGeneratedOrFound && daysChecked < maxDaysToCheck) {
			targetDate.setDate(targetDate.getDate() - 1); // Go to the previous day
			dateString = targetDate.toISOString().split('T')[0]; // YYYY-MM-DD format
			daysChecked++;

			console.log(`[Nav.svelte] Checking for sales report or tickets for: ${dateString}`);

			try {
				if (!window.api || typeof window.api.getSaleByDate !== 'function' || typeof window.api.getTicketsByDate !== 'function' || typeof window.api.updateDailySalesReport !== 'function') {
					console.error('[Nav.svelte] One or more required window.api functions are not available. Check preload script.');
					break;
				}

				// 1. Check if a sales report already exists for this date
				const saleCheckResponse = await window.api.getSaleByDate(dateString);

				if (saleCheckResponse && saleCheckResponse.status === 200 && saleCheckResponse.sale) {
					console.log(`[Nav.svelte] Sales report for ${dateString} already exists. No further updates needed for prior dates.`);
					reportGeneratedOrFound = true; // Found an existing report, stop.
					break;
				} else if (saleCheckResponse && saleCheckResponse.status === 204) {
					// No sales report exists for this date, check if there were tickets
					console.log(`[Nav.svelte] No sales report for ${dateString}. Checking for tickets...`);
					const ticketsResponse = await window.api.getTicketsByDate(dateString);

					if (ticketsResponse && !ticketsResponse.error && ticketsResponse.length > 0) {
						console.log(`[Nav.svelte] Found ${ticketsResponse.length} tickets for ${dateString}. Attempting to generate sales report...`);
						// Tickets exist, so generate the sales report for this day
						const updateResult = await window.api.updateDailySalesReport(dateString);

						if (updateResult && updateResult.status === 200 && updateResult.dailySale) {
							console.log(`[Nav.svelte] Successfully generated sales report for ${dateString}:`, updateResult.dailySale);
							reportGeneratedOrFound = true; // Report generated, stop.
						} else {
							console.error(`[Nav.svelte] Failed to generate sales report for ${dateString}:`, updateResult?.error || 'Unknown error during report generation.');
							// Optionally, you might want to break here or log and continue to the next day
						}
						break; // Stop after attempting to generate a report for the first day that needs it
					} else if (ticketsResponse && ticketsResponse.error) {
						console.error(`[Nav.svelte] Error fetching tickets for ${dateString}:`, ticketsResponse.error);
						// Decide if you want to stop or continue
					} else {
						console.log(`[Nav.svelte] No tickets found for ${dateString}. Continuing to check previous day.`);
					}
				} else if (saleCheckResponse && saleCheckResponse.error) {
					console.error(`[Nav.svelte] Error checking for existing sales report for ${dateString}:`, saleCheckResponse.error);
					// Decide if you want to stop or continue
				} else if (saleCheckResponse && saleCheckResponse.status !== 200 && saleCheckResponse.status !== 204) {
					console.warn(`[Nav.svelte] Unexpected status ${saleCheckResponse.status} when checking sales for ${dateString}.`);
				}

			} catch (error) {
				console.error(`[Nav.svelte] Error during updateDailySales loop for date ${dateString}:`, error);
				// Decide if you want to break the loop on a general error
				break;
			}
		}

		if (!reportGeneratedOrFound && daysChecked >= maxDaysToCheck) {
			console.log('[Nav.svelte] updateDailySales: Checked max days without finding a report to generate or an existing one.');
		} else if (!reportGeneratedOrFound) {
			console.log('[Nav.svelte] updateDailySales: Process completed. No new reports were generated (either up-to-date or no eligible days found).');
		}
	}

	function togglePrinterConfig() {
		printerConfig.visible = !printerConfig.visible;
	}
</script>

<nav>
	<ul class="links">
		<a href="/">Venta</a>
		<a href="/tickets">Tickets</a>
		<a href="/reportes">Reportes</a>
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

	button {
		color: var(--color-light);
		/* border: solid var(--color-light) 1px; */ /* This was duplicated */
		color: var(--color-text-secondary);
		border: solid 1px;
		border-color: var(--color-text-secondary);
		border-radius: 8px;
		padding: 0.5em 1em;
		cursor: pointer;
		transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;

		&:hover {
			border-color: var(--color-light);
			color: var(--color-light);
			background-color: var(--color-hover);
		}
	}

	a {
		padding: 0.5em 1em;
		cursor: pointer;
		border-radius: 8px;
		/* border: solid var(--color-light) 1px; */ /* This was duplicated */
		border: solid var(--color-text-secondary) 1px;
		color: var(--color-text-secondary);
		min-width: 8em;
		text-align: center;
		transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;

		&:hover {
			border-color: var(--color-light);
			color: var(--color-light);
			background-color: var(--color-hover);
		}
	}
</style>
