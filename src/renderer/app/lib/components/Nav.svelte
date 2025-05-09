<script>
	import {printerConfig} from '../stores/shared.svelte.js'

	async function changeTicketDate() {
		const response = await fetch('/api/ticket', {
			method: 'PATCH',
			headers: {'Content-Type': 'application/json'}
		})
		const result = await response.json()
		console.log('change date result: ', result)
	}


	async function updateDailySales() {
  console.log('updating DailySales')
  let updatedSales = false
  // Date
  const targetDate = new Date()
  let dateString
  let count = 0

  while (updatedSales === false) {
    targetDate.setDate(targetDate.getDate() - 1)
    dateString = targetDate.toISOString().split('T')[0]
    count++
    const request = await fetch(`/api/sale?date=${dateString}`)
    const response = await request.json()

    if (response.sale) {
      updatedSales = true
      break
    }

    const formattedDay = targetDate.toLocaleDateString('en-US', { day: '2-digit' })
    const formattedMonth = targetDate.toLocaleDateString('en-US', { month: '2-digit' })
    const formattedYear = targetDate.getFullYear()

    const ticketRequest = await fetch(`/api/ticket?date=${formattedYear}-${formattedMonth}-${formattedDay}`)
    const tickets = await ticketRequest.json()

    if (tickets.length > 0) {
      const update = await fetch(`/api/update-sales?date=${targetDate}`)
      const updateResult = await update.json()
      console.log('updateResult: ', updateResult)
      updatedSales = true
      break
    }

    if (count == 365) {
      console.log('no sales for the past year')
      break
    }
  }
}

function togglePrinterConfig() {
	printerConfig.visible = !printerConfig.visible
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
		border: solid var(--color-light) 1px;
		color: var(--color-text-secondary);
		border: solid 1px;
		border-color: var(--color-text-secondary);
		border-radius: 8px;
		padding: 0.5em 1em;
		cursor: pointer;
	}

	a {
		padding: 0.5em 1em;
		cursor: pointer;
		border-radius: 8px;
		border: solid var(--color-light) 1px;
		color: var(--color-light);
		border: solid var(--color-text-secondary) 1px;
		color: var(--color-text-secondary);
		min-width: 8em;
		text-align: center;
	}
</style>
