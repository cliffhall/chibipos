import { j as json } from './index-BIAFQWR9.js';
import { C as CatProduct } from './catProduct-D_19IU5e.js';
import 'sequelize';
import 'path';

async function GET() {
  try {
    const cats = await CatProduct.findAll({
      order: [["name", "ASC"]],
      attributes: { exclude: ["createdAt", "updatedAt"] }
    });
    return json(cats);
  } catch (error) {
    console.error("get cats error", error);
    return { status: 500 };
  }
}

export { GET };
//# sourceMappingURL=_server-C_FPhPup.js.map
