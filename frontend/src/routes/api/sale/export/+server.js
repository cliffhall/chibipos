// **********************
// API / SALE / EXPORT
// **********************
import CryptoJS from 'crypto-js';
import { CRYPTO_KEY } from '$env/static/private';
import { json } from '@sveltejs/kit'
import { DailySales } from '$lib/db/models/daily_sales.js'
import { DailySalesDetails } from '$lib/db/models/daily_salesDetails.js'


function encryptStuff(data) {
  const jsonString = JSON.stringify(data)
  const encrypted = CryptoJS.AES.encrypt(jsonString, CRYPTO_KEY).toString()
  return encrypted
}


// Export DailySale by Date
export async function GET({ url }) {
  const id = url.searchParams.get('id')

  try {
    const sale = await DailySales.findByPk(id, {
      include: [{
        model: DailySalesDetails
      }]
    })

    if (sale) {
      const encryptedSale = encryptStuff(sale)
      return json({ status: 200, encryptedSale })
    } else {
      return json({ status: 204, message: `${dateParam}: no sale` })
    }

  } catch (error) {
    console.error('error getting reports: ', error)
    return json({ status: 500 })
  }
}