import { j as json } from './index-BIAFQWR9.js';
import { D as DailySales } from './daily_salesDetails-X9f1ScFY.js';
import 'sequelize';
import './catProduct-D_19IU5e.js';
import 'path';
import './product-DVzY65Xo.js';

async function GET({ url }) {
  const dateParam = url.searchParams.get("date");
  const date = new Date(dateParam).toISOString().split("T")[0];
  try {
    const sale = await DailySales.findOne({
      where: { date }
    });
    if (sale) {
      return json({ status: 200, sale });
    } else {
      return json({ status: 204, message: `${dateParam}: no sale` });
    }
  } catch (error) {
    console.error("error getting reports: ", error);
    return json({ status: 500 });
  }
}

export { GET };
//# sourceMappingURL=_server-BohU-q2G.js.map
