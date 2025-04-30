import { j as json } from './index-BIAFQWR9.js';
import { P as Product } from './product-DVzY65Xo.js';
import { D as DailySales, a as DailySalesDetails } from './daily_salesDetails-X9f1ScFY.js';
import './catProduct-D_19IU5e.js';
import 'sequelize';
import 'path';

async function GET({ request, params }) {
  try {
    const reporte = await DailySales.findByPk(params.id, {
      attributes: { exclude: ["createdAt", "updatedAt"] },
      include: [{
        model: DailySalesDetails,
        attributes: ["quantity", "net_sales", "av_price", "discount_amount"],
        include: [{
          model: Product,
          attributes: ["name"]
        }]
      }],
      order: [
        [DailySalesDetails, Product, "name", "ASC"]
      ]
    });
    return json(reporte);
  } catch (error) {
    console.error("no report by id: ", error);
    return { status: 500 };
  }
}

export { GET };
//# sourceMappingURL=_server-BMxMaCji.js.map
