// *************************************
// LAYOUT
// *************************************

// /Users/cliffhall/Projects/chibipos/src/renderer/app/routes/+layout.server.js
// import { CatProduct, Product } from '$lib/db/models'; // Hypothetical model import

export async function load({ /* fetch might not be needed for these */ }) {
  console.log('load layout', new Date().toISOString());
  try {
    // const cats = await CatProduct.findAll(); // Example: Direct data access
    // const products = await Product.findAll(); // Example: Direct data access

    // Using dummy data for now if models are not set up for direct import yet
    const cats = [{ id: 1, name: 'Sample Category Product' }];
    const products = [{ id: 1, name: 'Sample Product' }];

    // updateDailySales({ fetch }); // Keep fetch if updateDailySales needs it for other APIs
    return { cats, products };
  } catch (error) {
    console.error('Error in layout load:', error);
    // You might want to return an error structure or throw an error
    // that SvelteKit can handle to show an error page.
    // For now, returning empty or placeholder data:
    return { cats: [], products: [], error: 'Failed to load layout data' };
  }
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
