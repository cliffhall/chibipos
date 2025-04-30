// **************
// IMPORTAR MENU
// **************
import CryptoJS from 'crypto-js';
import { CRYPTO_KEY } from '$env/static/private';
import { json } from '@sveltejs/kit'
import { Product } from '$lib/db/models/product.js'
import { CatProduct } from '$lib/db/models/catProduct.js'


function decryptMenu(encryptedData) {
  const bytes = CryptoJS.AES.decrypt(encryptedData, CRYPTO_KEY)
  const decrypted = bytes.toString(CryptoJS.enc.Utf8)
  return JSON.parse(decrypted)
}

export async function POST({ request }) {
  let updateApproved = false
  const { encryptedMenu } = await request.json()

  try {
    const decodedMenu = atob(encryptedMenu)
    const decryptedMenu = decryptMenu(decodedMenu)
    const { cats, products } = decryptedMenu

    if ((cats && cats.length > 0) && (products && products.length > 0)) updateApproved = true

    if (updateApproved) {
      // create records
      await CatProduct.bulkCreate(
        cats.map(cat => ({
          id: cat.id,
          name: cat.nombre
        })),
        {
          updateOnDuplicate: ['name']
        }
      )
      await Product.bulkCreate(
        products.map(product => ({
          id: product.id,
          name: product.nombre,
          image: product.image,
          price: product.precio,
          catproduct_id: product.catproducto_id
        })),
        {
          updateOnDuplicate: ['name', 'image', 'price', 'catproduct_id']
        }
      )
    }

    return json({ status: 200 })

  } catch (error) {
    console.error('Error during decryption:', error);
    return json({ error: 'Invalid encrypted data' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await Product.destroy({
      where: {},
      truncate: true
    })
    await CatProduct.destroy({
      where: {},
      truncate: true
    })

    return json("Cats destroyed")

  } catch (error) {
    console.error('Error deleting: ', error)
    return json({ error: 'Error deleting menu.' }, { status: 500 })
  }
}