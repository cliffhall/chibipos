import { j as json } from './index-BIAFQWR9.js';
import { P as Product } from './product-DVzY65Xo.js';
import './catProduct-D_19IU5e.js';
import 'sequelize';
import 'path';

async function GET() {
  try {
    const products = await Product.findAll({
      order: [["name", "ASC"]]
    });
    return json(products);
  } catch (error) {
    console.error("get products error", error);
    return { status: 500 };
  }
}

export { GET };
//# sourceMappingURL=_server-DiGXox8r.js.map
