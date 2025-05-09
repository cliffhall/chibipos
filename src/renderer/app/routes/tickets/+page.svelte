<script>
	import Calendar from '$lib/components/Calendar.svelte'; // Use $lib alias
	import TicketItem from '$lib/components/TicketItem.svelte'; // Use $lib alias
	import ActionButton from '$lib/components/ActionButton.svelte'; // Use $lib alias
	import cardIcon from '../../lib/img/icons/card-yellow.svg'; // Relative path for now
	import cashIcon from '../../lib/img/icons/cash-yellow.svg'; // Relative path for now
	import { fly, fade, slide } from 'svelte/transition';
	import { printerConfig } from '../../lib/stores/shared.svelte.js'; // Relative path for now
	import { onMount } from 'svelte';

	let { data } = $props(); // SvelteKit data prop
	let tickets = $state(data.initialTickets || []); // Initialize with SSR data
	let currentTicket = $state({});
	let ticketItems = $derived(currentTicket.ticket_details || []); // Ensure ticket_details exists
	let dateObject = $derived(currentTicket.date ? new Date(currentTicket.date) : new Date()); // Handle undefined date
	let cancelReady = $state(false);
	let printReady = $state(false);

	let date = $derived(
			dateObject.toLocaleString(undefined, {
				timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
				year: 'numeric',
				month: 'long',
				day: '2-digit'
			})
	);

	// Function to fetch tickets for a given date using IPC
	async function fetchTicketsForDate(dateToFetch) {
		const dateString = `${dateToFetch.getFullYear()}-${('0' + (dateToFetch.getMonth() + 1)).slice(-2)}-${('0' + dateToFetch.getDate()).slice(-2)}`;
		if (window.api && typeof window.api.getTicketsByDate === 'function') {
			try {
				const fetchedTickets = await window.api.getTicketsByDate(dateString);
				if (fetchedTickets && !fetchedTickets.error) {
					tickets = fetchedTickets;
				} else {
					console.error("Error fetching tickets via IPC:", fetchedTickets?.error || "Unknown error");
					tickets = []; // Reset or handle error
				}
			} catch (ipcError) {
				console.error("IPC call to getTicketsByDate failed:", ipcError);
				tickets = [];
			}
		} else {
			console.warn('[tickets/+page.svelte] window.api.getTicketsByDate is not available.');
			tickets = [];
		}
	}

	onMount(async () => {
		// Fetch tickets for today's date on initial mount
		await fetchTicketsForDate(new Date());
	});

	async function showTicket(id) {
		if (window.api && typeof window.api.getTicketById === 'function') {
			try {
				const ticketData = await window.api.getTicketById(id);
				if (ticketData && ticketData.status === 200 && ticketData.ticket) {
					currentTicket = ticketData.ticket;
				} else {
					console.error("Error fetching ticket via IPC:", ticketData?.error || ticketData?.message || "Unknown error");
					currentTicket = {}; // Reset or handle error
				}
			} catch (ipcError) {
				console.error("IPC call to getTicketById failed:", ipcError);
				currentTicket = {};
			}
		} else {
			console.warn('[tickets/+page.svelte] window.api.getTicketById is not available.');
		}
	}

	async function cancelTicketAction() { // Renamed to avoid conflict with Svelte's cancel
		if (printReady) {
			printReady = false;
			cancelReady = false;
			return;
		}

		if (cancelReady) {
			if (window.api && typeof window.api.cancelTicketById === 'function') {
				try {
					const cancelResponse = await window.api.cancelTicketById(currentTicket.id);
					if (cancelResponse && cancelResponse.status === 200 && cancelResponse.success) {
						// Refresh tickets for the currentTicket's date
						if (currentTicket.date) {
							await fetchTicketsForDate(new Date(currentTicket.date));
						}
						currentTicket = cancelResponse.ticket; // Update current ticket with canceled status
						cancelReady = false;
					} else {
						console.error("Error canceling ticket via IPC:", cancelResponse?.error || cancelResponse?.message || "Unknown error");
					}
				} catch (ipcError) {
					console.error("IPC call to cancelTicketById failed:", ipcError);
				}
			} else {
				console.warn('[tickets/+page.svelte] window.api.cancelTicketById is not available.');
			}
		} else {
			cancelReady = true;
		}
	}

	let printPromise = $state(null);
	let printTimeout = null;
	const successResetTime = 1000;
	let resetTime;

	async function handlePrint() { // Removed ticket argument, uses currentTicket
		if (printTimeout) clearTimeout(printTimeout);

		if (cancelReady) { // If cancel is armed, de-arm print and cancel
			printReady = false;
			cancelReady = false;
			printPromise = null; // Reset promise if we are bailing
			return Promise.resolve({ success: false, message: "Print cancelled due to cancel action."}); // Return a resolved promise
		}

		if (printReady) {
			if (window.api && typeof window.api.printTicket === 'function') {
				const printData = { ticket: currentTicket, details: ticketItems, printerIP: printerConfig.ip };
				// Ensure printData is serializable and not deeply nested with reactive Svelte objects
				const serializablePrintData = JSON.parse(JSON.stringify(printData));

				printPromise = window.api.printTicket(serializablePrintData)
						.then(response => {
							resetTime = response.success ? 300 : 5000;
							return response; // Propagate the response
						})
						.catch(error => {
							console.error("Error during printTicket IPC call:", error);
							resetTime = 5000;
							return { success: false, message: error.message || "Print failed" }; // Return error structure
						})
						.finally(() => {
							printTimeout = setTimeout(() => {
								printPromise = null;
								printReady = false; // Reset printReady after timeout
							}, resetTime);
						});
			} else {
				console.warn('[tickets/+page.svelte] window.api.printTicket is not available.');
				printPromise = Promise.resolve({ success: false, message: "Print API not available." }); // Mock promise
				printReady = false;
			}
		} else {
			printReady = true;
			printPromise = null; // Clear any previous promise state
			// No actual printing is done here, just arming the button.
			// The actual print happens when printReady is true and the button is clicked again.
			// So, we resolve a "dummy" promise to allow the ActionButton to await something.
			return Promise.resolve({ success: true, message: "Printer armed."});
		}
		return printPromise; // Return the promise so ActionButton can await it
	}

	// This function is used by the Calendar component to update tickets
	function updateTicketsFromCalendar(newTickets) {
		tickets = newTickets;
	}

</script>

<main class="ticketpage">
	<div class="calendar">
		<!-- Pass a callback to Calendar to update tickets -->
		<Calendar bind:tickets={updateTicketsFromCalendar} />
	</div>

	<div class="table-wrapper">
		<div class="table">
			<div class="table--header">
				<p>fecha</p>
				<p>total</p>
			</div>
			<ul class="table--body">
				{#each tickets as ticket (ticket.id)}
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
						{#each ticketItems as ticketItem (ticketItem.id)}
							<TicketItem {ticketItem} />
						{/each}
					</ul>
					<footer>
						<!-- Display cash and card from currentTicket if needed -->
						<!-- <p>Cash: {currentTicket.cash}</p> -->
						<!-- <p>Card: {currentTicket.card}</p> -->
						<div class="summary">
							<p class="summary--label">Total</p>
							<p class="summary--amount">{currentTicket.total_amount}</p>
						</div>
						<div class="buttonRow">
							<ActionButton
									action={cancelTicketAction}
									text='cancelar'
									flexBasis='50%'
									bind:ready={cancelReady}
									disabled={currentTicket.canceled}
							/>
							<ActionButton
									action={handlePrint}
									text='imprimir'
									flexBasis='50%'
									bind:ready={printReady}
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
	/* Styles remain the same */
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
