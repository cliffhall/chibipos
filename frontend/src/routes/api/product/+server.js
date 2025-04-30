import { json } from '@sveltejs/kit'
import { Product } from '$lib/db/models/product.js'


export async function GET() {
  try {
    const products = await Product.findAll({
      order: [['name', 'ASC']]
    })
    return json(products)
  } catch (error) {
    console.error('get products error', error)
    return ({ status: 500 })
  }
}