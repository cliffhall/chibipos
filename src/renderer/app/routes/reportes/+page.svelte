<script>
	import { fly, fade } from 'svelte/transition';
	import ActionButton from '$lib/components/ActionButton.svelte';
	import downloadIcon from '$lib/img/icons/download.svg';
	import confirmIcon from '$lib/img/icons/confirm.svg';
	import printIcon from '$lib/img/icons/print.svg';
	import { printerConfig } from '../../lib/stores/shared.svelte.js'


	let { data } = $props();
	let { sales } = $state(data);
	let selectedSale = $state({});

	// current Dates
	let selectedDate = $state(new Date());
	const today = new Date();
	const currentMonth = today.getMonth()
	const currentYear = today.getFullYear()
	let selectedMonth = $state(today.getMonth());
	let selectedYear = $state(today.getFullYear());
	let monthName = $derived(
		new Date(selectedYear, selectedMonth).toLocaleString('es', { month: 'long' }))

	let printReady = $state(false);
	let exportReady = $state(false);


	async function changeMonths(offset) {
		const newMonth = selectedMonth + offset
		if(newMonth > currentMonth && selectedYear === currentYear) return

		selectedMonth += offset;
			if(selectedMonth < 0)  {
			selectedMonth = 11;
			selectedYear--;
		} else if (selectedMonth > 11) {
			selectedMonth = 0;
			selectedYear++;
		}

		try {
			const salesRequest = await fetch(`/api/sale/month?date=${new Date(selectedYear, selectedMonth, 1)}`)
			const dailySales = await salesRequest.json()
			sales = dailySales.sales
			console.log('sales: ', sales)
			return { sales }
		} catch (error) {
			console.error('No sales')
		}
	}


	function saveFile(filename, data) {
		const blob = new Blob([data], { type: 'application/json' });
		const link = document.createElement('a');
		link.href = URL.createObjectURL(blob);
		link.download = filename;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}


	async function showReport(id) {
		try {
			const request = await fetch(`/api/sale/${id}`);
			const sale = await request.json();
			console.log('show sale: ', sale);
			selectedSale = sale;
		} catch (error) {
			console.error('no sale by id', error);
		}
	}


	async function exportSale(id) {
		if(printReady) {
				exportReady = false;
				printReady = false
				return;
		}
		if(exportReady) {
			try {
				const request = await fetch(`/api/sale/export?id=${id}`);
				const response = await request.json();
				const sale = response.encryptedSale;
				const fileName = `chibi-SUC-${selectedSale.date}.enc.json`;
				saveFile(fileName, sale);
			} catch (error) {
				console.error('error exporting: ', error);
			}
		} else {
			exportReady = true
		}
	}


	async function printSale() {
		if(exportReady) {
				exportReady = false;
				printReady = false
				return;
		}
		if(printReady) {
			let printData = {sale: selectedSale, printerIP: printerConfig.ip}
			try {
				await window.api.printSale(JSON.parse(JSON.stringify(selectedSale)))
				printReady = false
			} catch (error) {
				console.error('error printing sale: ', error);
			}
		} else {
			printReady = true
		}

	}


</script>

<main class="page">
	<div class="table-wrapper list">

		<div class="table--month">
			<p class="title">Reportes</p>
			<div class="month">
				<button onclick={() => changeMonths(-1)}>-</button>
				<div class="text">
					<p class="title">{monthName}</p>
					<p class='year'>{selectedYear}</p>
				</div>
				<button onclick={() => changeMonths(1)}>+</button>
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
				{#each sales as sale}
					<li class="table--item">
						<button onclick={() => showReport(sale.id)}>
							<p class="date">
								{new Date(sale.date).toLocaleDateString('en-ES', {
									day: 'numeric',
									month: 'short',
									year: 'numeric',
									timeZone: 'UTC'
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
			</ul>
		</div>
	</div>

	<div class="table-wrapper details">
		{#if selectedSale.id}
			<p class="title" in:fly={{ y: 30, duration: 500 }}>
				{new Date(selectedSale.date).toLocaleDateString('en-ES', {
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
					{#if selectedSale.id}
						{#each selectedSale.daily_sales_details as item}
							<li class="table--item">
								<p class="text">{item.product.name}</p>
								<p class="number short">{item.quantity}</p>
								<p class="number">{item.net_sales}</p>
								<p class="number">{item.discount_amount}</p>
								<p class="number">{item.av_price}</p>
							</li>
						{/each}
					{/if}
				</ul>
				<div class="buttonRow">
					<ActionButton
						action={printSale}
						imgSrc={printIcon}
						imgAlt="imprimir"
						readyImg={confirmIcon}
						readyAlt="confirmar"
						flexBasis="50%"
						bind:ready={printReady}
					/>
					<ActionButton
						action={() => exportSale(selectedSale.id)}
						imgSrc={downloadIcon}
						imgAlt="exportar"
						readyImg={confirmIcon}
						readyAlt="confirmar"
						bind:ready={exportReady}
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

				button {
					background-color: var(--color-accent);
					width: 4em;
					height: 1.5em;
					border-radius: 8px;
					color: var(--color-bg);
				}

				.text {
					line-height: 1;

					.title {
						margin-bottom: 0;
					}

					.year {
						font-family: var(--font-titles);
						text-align: center;
					}
				}
			}

	.table-wrapper {
		padding: 2em var(--panel-padding);
		// border: solid yellow thin;
	}

	.table--month {
		display: flex;
		gap: 2em;
	}

	.table {
		height: calc(100% - 2em);
	}

	.list {

		.table--header {
			gap: 1rem;

			p {
				text-align: right;
				&.date {
					text-align: center;
					width: 8rem;
				}

				&.number {
					width: 3rem;
					display: inline-block;
				}
			}
		}

		.table--item {
			button {
				gap: 1rem;
			}

			p {
				&.date {
					width: 8rem;
				}

				&.number {
					width: 3rem;
				}
			}
		}
	}

	.details {
		.table--header {
			display: flex;
			align-items: center;
			gap: 1rem;

			p.text {
				width: 12rem;
				text-align: left;
			}

			p {
				text-align: center;
				width: 3rem;
				// border: solid yellow thin;
			}
		}

		.table--body {
			height: 470px;
			overflow-y: scroll;

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
			align-content: center;

			p {
				// border: solid white thin;
				width: 3rem;
			}

			p.text {
				width: 12rem;
				font-family: var(--font-text);
			}
		}

		.buttonRow {
			display: flex;
			gap: 2em;
			padding: 0 1em;
			margin: 1em 0;
		}
	}
</style>
