// *********************
// API / SALE / MONTH
// *********************
import { json } from '@sveltejs/kit'
import { Op } from 'sequelize';
import { DailySales } from '$lib/db/models/daily_sales.js'
import { DailySalesDetails } from '$lib/db/models/daily_salesDetails.js'


// Get DailySale by Month
export async function GET({ url }) {
  const dateParam = url.searchParams.get('date')
  const date = new Date(dateParam)
  const startDate = new Date(date.getFullYear(), date.getMonth(), 1)
  const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0)

  try {
    const sales = await DailySales.findAll({
      where: {
        date: { [Op.between]: [startDate, endDate] }
      },
      order: [['date', 'DESC']]
    })

    return json({ message: 'sales by month', sales })

  } catch (error) {
    console.error('error getting sales by month: ', error)
    return json({ status: 500 })
  }

}