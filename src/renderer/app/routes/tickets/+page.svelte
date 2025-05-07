<script>
	import Calendar from '$lib/components/Calendar.svelte';
	import TicketItem from '$lib/components/TicketItem.svelte';
	import ActionButton from '$lib/components/ActionButton.svelte';
	import cardIcon from '$lib/img/icons/card-yellow.svg';
	import cashIcon from '$lib/img/icons/cash-yellow.svg';
	import { fly, fade, slide } from 'svelte/transition';
	import { printerConfig } from '$lib/stores/shared.svelte'


	let { data } = $props();
	let tickets = $state(data.tickets);
	let currentTicket = $state({});
	let ticketItems = $derived(currentTicket.ticket_details);
	let dateObject = $derived(new Date(currentTicket.date));
	let cancelReady = $state(false)
	let printReady = $state(false)

	let date = $derived(
		dateObject.toLocaleString(undefined, {
			timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
			year: 'numeric',
			month: 'long',
			day: '2-digit'
		})
	);


	async function showTicket(id) {
		try {
			const response = await fetch(`/api/ticket/${id}`);
			const data = await response.json();
			currentTicket = data;
		} catch (error) {
			console.error('Problem with fetch:', error);
		}
	}


	async function cancelTicket() {
		if(printReady) {
			printReady = false
			cancelReady = false
			return
		}

		if(cancelReady) {
			try {
				const response = await fetch(`/api/ticket/${currentTicket.id}`, {
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' }
				});
				const canceled = await response.json();
				if (canceled) {
					const selectedYear = dateObject.getFullYear()
					const formattedDay = dateObject.toLocaleDateString('en-US', { day: '2-digit'})
					const formattedMonth = dateObject.toLocaleDateString('en-US', { month: '2-digit'})
					const ticketRequest = await fetch(`/api/ticket?date=${selectedYear}-${formattedMonth}-${formattedDay}`)
					tickets = await ticketRequest.json()
					cancelReady = false
				}
			} catch (error) {
				console.error('Could not cancel ticket: ', error);
			}
		} else {
			cancelReady = true
		}
	}

	
	let printPromise = $state(null)
	let printTimeout = null
	const successResetTime = 1000
	let resetTime


	async function handlePrint(ticket) {
		if (printTimeout) clearTimeout(printTimeout)

		if(printReady) {
			printPromise = printTicket(ticket)

			printPromise.finally(() => {
			printTimeout = setTimeout(() => {
				printPromise = null;
			}, resetTime);
		});
		} else {
			printPromise = null
			printTicket(ticket)
		}
	}


	async function printTicket(ticket) {
		if(cancelReady) {
			printReady = false
			cancelReady = false
			return 
		}
		if(printReady) {
			const printData = {ticket: currentTicket, details: ticketItems, printerIP: printerConfig.ip}
			const response = await window.api.printTicket(JSON.parse(JSON.stringify(printData)))
			printReady = false
			if(response.success) {
				resetTime = 300
			} else {
				resetTime = 5000
			}
			return response
		} else {
			printReady = true
			return Promise.resolve()
		}
	}
</script>

<main class="ticketpage">
	<div class="calendar">
		<Calendar bind:tickets />
	</div>

	<div class="table-wrapper">
		<div class="table">
			<div class="table--header">
				<p>fecha</p>
				<p>total</p>
			</div>
			<ul class="table--body">
				{#each tickets as ticket}
					<li class="table--item {currentTicket.id === ticket.id ? 'selected' : ''}">
						<button onclick={() => showTicket(ticket.id)}>
							<p class="date">
								{new Date(ticket.date).toLocaleTimeString(undefined, {
									timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
								})}
							</p>
							<p class="number">{ticket.total_amount}</p>
							<div class="payment">
								{#if ticket.card > 0}
									<div class="icon card">
										<img src={cardIcon} alt="tarjeta" />
									</div>
								{/if}
								{#if ticket.cash > 0}
									<div class="icon cash">
										<img src={cashIcon} alt="efectivo" />
									</div>
								{/if}
							</div>
							<div class="cancel {ticket.canceled ? 'cancelado' : ''}"></div>
						</button>
					</li>
				{/each}
			</ul>
		</div>
	</div>

	<div class="panel-wrapper">
		{#if currentTicket.id}
			<div class="panel" in:fly={{y: 30, duration: 500}}>
				{#key currentTicket.id}
					<div class="panel--header">
						<div class="biginfo">
							<p class="title">{currentTicket.id.slice(0, 8)}</p>
							<p class="title">{date}</p>
						</div>
						<div class="labels">
							<p>cantidad</p>
							<p>producto</p>
							<p>precio</p>
							<p>importe</p>
						</div>
					</div>
					<ul class="panel--body">
						{#each currentTicket.ticket_details as ticketItem}
							<TicketItem {ticketItem} />
						{/each}
					</ul>
					<footer>
						<p>{currentTicket.cash}</p>
						<p>{currentTicket.card}</p>
						<div class="summary">
							<p class="summary--label">Total</p>
							<p class="summary--amount">{currentTicket.total_amount}</p>
						</div>
						<div class="buttonRow">
							<ActionButton 
							action={cancelTicket} 
							text='cancelar'
							flexBasis='50%'
							ready={cancelReady}
							disabled={currentTicket.canceled}
							/>
							<ActionButton 
							action={handlePrint} 
							text='imprimir'
							flexBasis='50%'
							ready={printReady}
							promise={printPromise}
							/>
						</div>
					</footer>
				{/key}
			</div>
		{/if}
	</div>
</main>

<style lang="scss">
	.ticketpage {
		height: 100%;
		display: grid;
		grid-template-columns: 1fr 38% var(--ticketCol-width);
	}

	.calendar {
		padding: 2em var(--panel-padding);
	}

	.table-wrapper {
		padding: 2em var(--panel-padding);
		height: 100%;
		overflow: hidden;
	}

	.panel-wrapper {
		padding: 2em var(--panel-padding);
		height: 100%;
	}

	.panel {
		background: linear-gradient(var(--color-panel1), var(--color-panel2));
		border-radius: var(--panel-border);
		padding: 1em;
		display: grid;
		grid-template-rows: auto 1fr auto;
		height: 100%;

		&--header {
			.biginfo {
				display: flex;
				justify-content: space-between;
			}

			.labels {
				display: flex;
				justify-content: space-between;
				gap: 2em;
				color: var(--color-text-secondary);
				font-weight: 300;
				font-size: 0.8em;

				p {
					flex-basis: 20%;
					text-align: right;

					&:first-of-type {
						flex-basis: 10%;
					}

					&:nth-of-type(2) {
						text-align: center;
						flex-basis: 70%;
						margin-left: 1em;
					}
				}
			}
		}

		&--body {
			max-height: 380px;
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

		footer {
			.summary {
				display: flex;
				justify-content: space-between;
				font-size: 2em;
				padding: 1rem 0;

				&--label {
					color: var(--color-text-secondary);
				}

				&--amount {
					font-weight: 700;
					font-family: var(--font-numbers);
				}
			}

			.buttonRow {
				display: flex;
				justify-content: space-between;
				gap: 1em;
			}
		}
	}
</style>
