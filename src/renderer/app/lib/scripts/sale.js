import { cart } from '$lib/stores/shared.svelte.js';
import { printerConfig } from '$lib/stores/shared.svelte'

export async function commitSale(cart, total, cash, card, discountRate, change, actualCash) {

  if (!Array.isArray(cart)) {
    throw new Error('Invalid cart: must be an array');
  }
  if (isNaN(total) || isNaN(cash) || isNaN(card) || isNaN(discountRate)) {
    throw new Error('All monetary values must be valid numbers');
  }

  const saleData = {
    cash: parseFloat(cash),
    card: parseFloat(card),
    cashReceived: parseFloat(actualCash),
    change: parseFloat(change),
    discountRate: parseFloat(discountRate),
    frontendTotal: parseFloat(total),
    products: cart.map((item) => ({
      product_id: item.id,
      quantity: item.quantity,
    }))
  }

  try {
    const response = await fetch('/api/ticket', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(saleData)
    })

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const result = await response.json()
    const ticket = result.ticket
    const details = result.ticketDetails
    const printData = { ticket, details: result.ticketDetails, printerIP: printerConfig.ip }
    await window.api.printTicket(printData)
    await window.api.printKitchen(printData)

    return result

  } catch (error) {
    console.error('Error: sale commit', error)
    throw error
  }
}


