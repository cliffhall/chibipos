export async function load({ fetch }) {

  try {
    const ticketRequest = await fetch(`/api/ticket?date=${new Date()}`)
    const tickets = await ticketRequest.json()
    return { tickets }
  } catch (error) {
    console.error('No tickets', error)
  }
}