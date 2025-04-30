// ************
// API / SALE
// ************
import { json } from '@sveltejs/kit'
import { DailySales } from '$lib/db/models/daily_sales.js'
import { DailySalesDetails } from '$lib/db/models/daily_salesDetails.js'

// Get DailySale by Date
export async function GET({ url }) {
  const dateParam = url.searchParams.get('date')
  const date = new Date(dateParam).toISOString().split('T')[0]

  try {
    const sale = await DailySales.findOne({
      where: { date },
    })

    if (sale) {
      return json({ status: 200, sale })
    } else {
      return json({ status: 204, message: `${dateParam}: no sale` })
    }

  } catch (error) {
    console.error('error getting reports: ', error)
    return json({ status: 500 })
  }
}

