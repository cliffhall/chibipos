// ******************
// API / SALE / ID
// ******************
import { json } from '@sveltejs/kit'
import { Product } from '$lib/db/models/product.js'
import { DailySales } from '$lib/db/models/daily_sales'
import { DailySalesDetails } from '$lib/db/models/daily_salesDetails'


export async function GET({ request, params }) {
  try {
    const reporte = await DailySales.findByPk(params.id, {
      attributes: { exclude: ['createdAt', 'updatedAt'] },
      include: [{
        model: DailySalesDetails,
        attributes: ['quantity', 'net_sales', 'av_price', 'discount_amount'],
        include: [{
          model: Product,
          attributes: ['name'],
        }]
      }],
      order: [
        [DailySalesDetails, Product, 'name', 'ASC']
      ]
    })

    return json(reporte)
  } catch (error) {
    console.error('no report by id: ', error)
    return ({ status: 500 })
  }
}