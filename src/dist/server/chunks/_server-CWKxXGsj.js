import CryptoJS from 'crypto-js';
import { C as CRYPTO_KEY } from './private-B7JdlQ3D.js';
import { j as json } from './index-BIAFQWR9.js';
import { D as DailySales, a as DailySalesDetails } from './daily_salesDetails-X9f1ScFY.js';
import 'sequelize';
import './catProduct-D_19IU5e.js';
import 'path';
import './product-DVzY65Xo.js';

function encryptStuff(data) {
  const jsonString = JSON.stringify(data);
  const encrypted = CryptoJS.AES.encrypt(jsonString, CRYPTO_KEY).toString();
  return encrypted;
}
async function GET({ url }) {
  const id = url.searchParams.get("id");
  try {
    const sale = await DailySales.findByPk(id, {
      include: [{
        model: DailySalesDetails
      }]
    });
    if (sale) {
      const encryptedSale = encryptStuff(sale);
      return json({ status: 200, encryptedSale });
    } else {
      return json({ status: 204, message: `${dateParam}: no sale` });
    }
  } catch (error) {
    console.error("error getting reports: ", error);
    return json({ status: 500 });
  }
}

export { GET };
//# sourceMappingURL=_server-CWKxXGsj.js.map
