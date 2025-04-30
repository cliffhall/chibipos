import { j as json } from './index-BIAFQWR9.js';
import { Op } from 'sequelize';
import { D as DailySales } from './daily_salesDetails-X9f1ScFY.js';
import './catProduct-D_19IU5e.js';
import 'path';
import './product-DVzY65Xo.js';

async function GET({ url }) {
  const dateParam = url.searchParams.get("date");
  const date = new Date(dateParam);
  const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
  const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
  try {
    const sales = await DailySales.findAll({
      where: {
        date: { [Op.between]: [startDate, endDate] }
      },
      order: [["date", "DESC"]]
    });
    return json({ message: "sales by month", sales });
  } catch (error) {
    console.error("error getting sales by month: ", error);
    return json({ status: 500 });
  }
}

export { GET };
//# sourceMappingURL=_server-BW9B4_IO.js.map
