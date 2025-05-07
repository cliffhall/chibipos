// *********************
// REPORTES: LOAD 
// *********************
import { json } from '@sveltejs/kit'

export async function load({ fetch }) {
  try {
    const salesRequest = await fetch(`/api/sale/month?date=${new Date()}`)
    const dailySales = await salesRequest.json()
    const sales = dailySales.sales
    return { sales }
  } catch (error) {
    console.error('No sales')
  }
}