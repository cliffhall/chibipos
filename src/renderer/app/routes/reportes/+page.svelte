<script>
	import { fly, fade } from 'svelte/transition';
	import ActionButton from '$lib/components/ActionButton.svelte';
	import downloadIcon from '$lib/img/icons/download.svg';
	import confirmIcon from '$lib/img/icons/confirm.svg';
	import printIcon from '$lib/img/icons/print.svg';
	// Assuming printerConfig is correctly defined in your stores
	// For this example, if it's not central, we can mock it or ensure it's imported
	// import { printerConfig } from '../../lib/stores/shared.svelte.js'; // Original path
	import { printerConfig } from '../../lib/stores/shared.svelte.js';

	import { onMount } from 'svelte'; // Import onMount

	let { data } = $props();
	// Initialize sales with an empty array if data.sales is undefined during SSR or initial load
	let sales = $state(data?.sales || []);
	let selectedSale = $state({});

	// current Dates
	// let selectedDate = $state(new Date()); // This variable doesn't seem to be used directly for display or logic
	const today = new Date();
	const currentMonth = today.getMonth();
	const currentYear = today.getFullYear();
	let selectedMonth = $state(today.getMonth());
	let selectedYear = $state(today.getFullYear());
	let monthName = $derived(
			new Date(selectedYear, selectedMonth).toLocaleString('es', { month: 'long' })
	);

	let printReady = $state(false);
	let exportReady = $state(false);
	let printPromise = $state(null); // For ActionButton
	let exportPromise = $state(null); // For ActionButton

	// Function to fetch initial sales data for the current month on mount
	async function fetchInitialSales() {
		if (window.api && typeof window.api.getDailySalesByMonth === 'function') {
			try {
				const dateForIPC = new Date(selectedYear, selectedMonth, 1).toISOString().split('T')[0];
				const response = await window.api.getDailySalesByMonth(dateForIPC);
				if (response && response.sales && !response.error) {
					sales = response.sales;
				} else {
					console.error('Error fetching initial sales via IPC:', response?.error || 'Unknown error');
					sales = [];
				}
			} catch (ipcError) {
				console.error('IPC call to getDailySalesByMonth failed on mount:', ipcError);
				sales = [];
			}
		} else {
			console.warn('[Reportes Page] window.api.getDailySalesByMonth is not available.');
			sales = [];
		}
	}

	onMount(() => {
		// If data.sales was not populated by a server load function (which it isn't in Electron context for this page)
		// or if you want to ensure fresh data, fetch it here.
		if (!data?.sales || data.sales.length === 0) {
			fetchInitialSales();
		}
	});


	async function changeMonths(offset) {
		const newDate = new Date(selectedYear, selectedMonth + offset, 1);
		// Prevent going into future months beyond the current actual month
		if (newDate.getFullYear() > currentYear || (newDate.getFullYear() === currentYear && newDate.getMonth() > currentMonth)) {
			return;
		}

		selectedMonth = newDate.getMonth();
		selectedYear = newDate.getFullYear();

		if (window.api && typeof window.api.getDailySalesByMonth === 'function') {
			try {
				// Pass date as YYYY-MM-DD string, which getDailySalesByMonth expects
				const dateForIPC = newDate.toISOString().split('T')[0];
				const response = await window.api.getDailySalesByMonth(dateForIPC);

				if (response && response.sales && !response.error) {
					sales = response.sales;
					console.log('[Reportes Page] Sales updated via IPC for month:', monthName, selectedYear, sales);
				} else {
					console.error('Error fetching sales for month via IPC:', response?.error || 'Unknown error');
					sales = []; // Clear sales on error or no data
				}
			} catch (ipcError) {
				console.error('IPC call to getDailySalesByMonth failed:', ipcError);
				sales = [];
			}
		} else {
			console.warn('[Reportes Page] window.api.getDailySalesByMonth is not available.');
		}
	}


	function saveFile(filename, data) {
		const blob = new Blob([data], { type: 'application/json' }); // Ensure data is a string for Blob
		const link = document.createElement('a');
		link.href = URL.createObjectURL(blob);
		link.download = filename;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(link.href); // Clean up
	}


	async function showReport(id) {
		if (window.api && typeof window.api.getDailySaleReportById === 'function') {
			try {
				const response = await window.api.getDailySaleReportById(id);
				if (response && response.status === 200 && response.report) {
					selectedSale = response.report;
					console.log('[Reportes Page] Show report:', selectedSale);
				} else {
					console.error('Error fetching sale report by ID via IPC:', response?.error || response?.message || 'Unknown error');
					selectedSale = {};
				}
			} catch (ipcError) {
				console.error('IPC call to getDailySaleReportById failed:', ipcError);
				selectedSale = {};
			}
		} else {
			console.warn('[Reportes Page] window.api.getDailySaleReportById is not available.');
		}
	}

	let exportTimeout = null;

	async function exportSaleAction(id) { // Renamed to avoid conflict, and made it an action for ActionButton
		if (exportTimeout) clearTimeout(exportTimeout);

		if (printReady) { // If print is armed, de-arm export and print
			exportReady = false;
			printReady = false;
			exportPromise = null;
			return Promise.resolve({ success: false, message: "Export cancelled due to print action."});
		}

		if (exportReady) {
			if (window.api && typeof window.api.exportDailySaleById === 'function') {
				exportPromise = window.api.exportDailySaleById(id)
						.then(response => {
							if (response && response.status === 200 && response.encryptedSale) {
								const fileName = `chibi-SUC-${selectedSale.date}.enc.json`;
								saveFile(fileName, response.encryptedSale); // encryptedSale should be a string
								return { success: true, message: 'Exportado!' };
							} else {
								console.error('Error exporting sale via IPC:', response?.error || response?.message || 'Unknown error');
								return { success: false, message: response?.error || 'Export Falló' };
							}
						})
						.catch(ipcError => {
							console.error('IPC call to exportDailySaleById failed:', ipcError);
							return { success: false, message: 'Export Falló' };
						})
						.finally(() => {
							exportTimeout = setTimeout(() => {
								exportPromise = null;
								exportReady = false;
							}, exportPromise.then(res => res.success ? 1000 : 5000).catch(() => 5000));
						});
			} else {
				console.warn('[Reportes Page] window.api.exportDailySaleById is not available.');
				exportPromise = Promise.resolve({ success: false, message: "Export API no disponible." });
				exportReady = false;
			}
		} else {
			exportReady = true;
			exportPromise = null;
			return Promise.resolve({ success: true, message: "Exportar Armado" });
		}
		return exportPromise;
	}

	let printSaleTimeout = null;

	async function printSaleAction() { // Renamed for ActionButton
		if (printSaleTimeout) clearTimeout(printSaleTimeout);

		if (exportReady) { // If export is armed, de-arm print and export
			printReady = false;
			exportReady = false;
			printPromise = null;
			return Promise.resolve({ success: false, message: "Print cancelled due to export action."});
		}

		if (printReady) {
			if (window.api && typeof window.api.printSale === 'function' && selectedSale.id) {
				// Ensure selectedSale is serializable (it should be if it came from IPC correctly)
				const printData = { sale: JSON.parse(JSON.stringify(selectedSale)), printerIP: printerConfig.ip };
				printPromise = window.api.printSale(printData)
						.then(response => {
							if (response && response.success) {
								return { success: true, message: 'Impreso!' };
							} else {
								console.error('Error printing sale via IPC:', response?.message || 'Unknown error');
								return { success: false, message: response?.message || 'Falló Impresión' };
							}
						})
						.catch(ipcError => {
							console.error('IPC call to printSale failed:', ipcError);
							return { success: false, message: 'Falló Impresión' };
						})
						.finally(() => {
							printSaleTimeout = setTimeout(() => {
								printPromise = null;
								printReady = false;
							}, printPromise.then(res => res.success ? 1000 : 5000).catch(() => 5000));
						});
			} else {
				console.warn('[Reportes Page] window.api.printSale is not available or no sale selected.');
				printPromise = Promise.resolve({ success: false, message: "Print API no disponible." });
				printReady = false;
			}
		} else {
			printReady = true;
			printPromise = null;
			return Promise.resolve({ success: true, message: "Impresora Armada" });
		}
		return printPromise;
	}
</script>

<main class="page">
	<div class="table-wrapper list">
		<div class="table--month">
			<p class="title">Reportes</p>
			<div class="month">
				<button onclick={() => changeMonths(-1)} aria-label="Mes Anterior">-</button>
				<div class="text">
					<p class="title">{monthName}</p>
					<p class='year'>{selectedYear}</p>
				</div>
				<button
						onclick={() => changeMonths(1)}
						aria-label="Mes Siguiente"
						disabled={selectedYear === currentYear && selectedMonth === currentMonth}
				>+</button>
			</div>
		</div>

		<div class="table">
			<div class="table--header">
				<p class="date">fecha</p>
				<p class="number">importe</p>
				<p class="number">desc.</p>
				<p class="number short">tickets</p>
				<p class="number short">canc.</p>
				<p class="number">tarjeta</p>
				<p class="number">efectivo</p>
			</div>

			<ul class="table--body">
				{#if sales && sales.length > 0}
					{#each sales as sale (sale.id)}
						<li class="table--item {selectedSale.id === sale.id ? 'selected' : ''}">
							<button onclick={() => showReport(sale.id)}>
								<p class="date">
									{new Date(sale.date).toLocaleDateString('es-ES', { // Use 'es-ES' for Spanish format
										day: 'numeric',
										month: 'short',
										year: 'numeric',
										timeZone: 'UTC' // Important if dates are stored as UTC date only
									})}
								</p>
								<p class="number">{sale.net_sales}</p>
								<p class="number">{sale.discount_amount}</p>
								<p class="number short">{sale.ticket_count}</p>
								<p class="number short">{sale.canceled_count}</p>
								<p class="number">{sale.card}</p>
								<p class="number">{sale.cash}</p>
							</button>
						</li>
					{/each}
				{:else}
					<li class="table--item-empty" transition:fade>
						<p>No hay reportes para {monthName} {selectedYear}.</p>
					</li>
				{/if}
			</ul>
		</div>
	</div>

	<div class="table-wrapper details">
		{#if selectedSale.id}
			<p class="title" in:fly={{ y: 30, duration: 500 }}>
				{new Date(selectedSale.date).toLocaleDateString('es-ES', {
					day: 'numeric',
					month: 'short',
					year: 'numeric',
					timeZone: 'UTC'
				})}
			</p>
			<div class="table" in:fly={{ y: 30, duration: 500 }}>
				<div class="table--header">
					<p class="text">producto</p>
					<p>cantidad</p>
					<p>importe</p>
					<p>desc</p>
					<p>p. prom</p>
				</div>

				<ul class="table--body">
					{#if selectedSale.details && selectedSale.details.length > 0} {#each selectedSale.details as item (item.id)}
						<li class="table--item">
							<p class="text">{item.productInfo?.name || 'N/A'}</p>
							<p class="number short">{item.quantity}</p>
							<p class="number">{item.net_sales}</p>
							<p class="number">{item.discount_amount}</p>
							<p class="number">{item.av_price}</p>
						</li>
					{/each}
					{:else}
						<li class="table--item-empty" transition:fade>
							<p>No hay detalles para este reporte.</p>
						</li>
					{/if}
				</ul>
				<div class="buttonRow">
					<ActionButton
							action={printSaleAction}
							imgSrc={printIcon}
							imgAlt="imprimir"
							readyImg={confirmIcon}
							readyAlt="confirmar"
							flexBasis="50%"
							bind:ready={printReady}
							promise={printPromise}
					/>
					<ActionButton
							action={() => exportSaleAction(selectedSale.id)}
							imgSrc={downloadIcon}
							imgAlt="exportar"
							readyImg={confirmIcon}
							readyAlt="confirmar"
							bind:ready={exportReady}
							promise={exportPromise}
							flexBasis="50%"
					/>
				</div>
			</div>
		{/if}
	</div>
</main>

<style lang="scss">
	.page {
		height: 100%;
		display: flex;
	}

	.month {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1em;
		margin-bottom: 1em; // Added to space it from the table

		button {
			background-color: var(--color-accent);
			width: 3em; // Adjusted for better fit
			height: 2em; // Adjusted for better fit
			border-radius: 8px;
			color: var(--color-bg);
			font-size: 1em; // Ensure text fits

			&:disabled {
				background-color: var(--color-light);
				opacity: 0.5;
				cursor: not-allowed;
			}
		}

		.text {
			line-height: 1.2; // Adjusted
			text-align: center;

			.title {
				margin-bottom: 0.25em; // Adjusted
				font-size: 1.2em; // Adjusted
				color: var(--color-text); // Ensure title color is consistent
			}

			.year {
				font-family: var(--font-titles);
				text-align: center;
				color: var(--color-text-secondary); // Consistent year color
			}
		}
	}

	.table-wrapper {
		padding: 2em var(--panel-padding);
		height: 100%; // Allow wrapper to take full height
		display: flex; // Added for flex column layout
		flex-direction: column; // Added for flex column layout

		&.list {
			flex-basis: 60%; // Example basis, adjust as needed
			min-width: 400px; // Ensure it doesn't get too small
		}
		&.details {
			flex-basis: 40%; // Example basis
			min-width: 300px; // Ensure it doesn't get too small
		}
	}

	.table--month {
		display: flex;
		justify-content: space-between; // Align title and month controls
		align-items: center; // Vertically align items
		gap: 2em;
		margin-bottom: 1em; // Space below month selector and title

		.title { // Target the "Reportes" title specifically
			margin-bottom: 0; // Remove bottom margin if it's part of this flex row
		}
	}

	.table {
		// height: calc(100% - 4em); // Adjust if .table--month height changes, or use flex-grow
		flex-grow: 1; // Allow table to take remaining space
		display: flex; // Added
		flex-direction: column; // Added
		overflow: hidden; // Keep this
	}

	.list {
		.table--header {
			gap: 1rem;
			flex-shrink: 0; // Prevent header from shrinking

			p {
				text-align: right;
				flex-basis: 12%; // Adjust basis for even distribution
				&:first-child { flex-basis: 20%; text-align: left; } // Date
				&.short { flex-basis: 8%; } // tickets, canc.
			}
		}

		.table--body {
			overflow-y: auto; // Allow body to scroll independently
			flex-grow: 1; // Allow body to take remaining space
		}

		.table--item {
			button {
				gap: 1rem;
				p {
					flex-basis: 12%; // Match header
					text-align: right;
					&:first-child { flex-basis: 20%; text-align: left; }
					&.short { flex-basis: 8%; }
				}
			}
		}
	}

	.details {
		.table--header {
			display: flex;
			align-items: center;
			gap: 1rem;
			flex-shrink: 0;

			p {
				text-align: center;
				flex-basis: 18%; // Adjust for 5 columns
				&.text { // Product name
					flex-basis: 28%;
					text-align: left;
				}
			}
		}

		.table--body {
			// height: 470px; // Consider removing fixed height or making it more dynamic
			overflow-y: auto;
			flex-grow: 1;


			&::-webkit-scrollbar {
				width: 0.5em;
			}
			&::-webkit-scrollbar-track {
				background: linear-gradient(var(--color-panel1), var(--color-panel2));
				width: 1em;
				border-radius: 50px;
			}
			&::-webkit-scrollbar-thumb {
				background-color: var(--color-thead);
				width: 0.5em;
				border-radius: 50px;
			}
		}

		.table--item {
			display: flex;
			align-items: center;
			gap: 1rem;
			padding: 0.5em 1em;
			// align-content: center; // Not needed for flex items

			p {
				text-align: center;
				flex-basis: 18%; // Match header
				font-family: var(--font-numbers); // Ensure numbers font for all numeric data
				&.text { // Product name
					flex-basis: 28%;
					text-align: left;
					font-family: var(--font-text); // Ensure text font for product name
				}
			}
		}
		.table--item-empty {
			padding: 1em;
			text-align: center;
			color: var(--color-text-secondary);
		}

		.buttonRow {
			display: flex;
			gap: 1em; // Reduced gap
			padding: 1em; // Consistent padding
			margin-top: 1em; // Ensure space from table body
			flex-shrink: 0; // Prevent button row from shrinking
		}
	}
</style>
