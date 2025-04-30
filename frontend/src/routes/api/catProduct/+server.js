import { json } from '@sveltejs/kit'
import { CatProduct } from '$lib/db/models/catProduct.js'


export async function GET() {
  try {
    const cats = await CatProduct.findAll({
      order: [['name', 'ASC']],
      attributes: { exclude: ['createdAt', 'updatedAt'] }
    })
    return json(cats)
  } catch (error) {
    console.error('get cats error', error)
    return ({ status: 500 })
  }
}