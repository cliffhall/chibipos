// *************************************
// LAYOUT
// *************************************

export async function load({ fetch }) {
  await import('$lib/db/sync.js');
  console.log('load layout', new Date().toISOString());
  const catRequest = await fetch('/api/catProduct')
  const productRequest = await fetch('/api/product')
  const cats = await catRequest.json()
  const products = await productRequest.json()
  // updateDailySales({ fetch })
  return { cats, products };
}

// Generar reportes de venta
// *************************************
async function updateDailySales({ fetch }) {
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