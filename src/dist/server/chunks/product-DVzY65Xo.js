import { s as sequelize, C as CatProduct } from './catProduct-D_19IU5e.js';
import { DataTypes } from 'sequelize';

const Product = sequelize.define("product", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
    unique: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  image: {
    type: DataTypes.STRING
  },
  price: {
    type: DataTypes.FLOAT(2)
  },
  catproduct_id: {
    type: DataTypes.UUID,
    references: {
      model: CatProduct,
      key: "id"
    }
  }
}, {
  tableName: "product"
});

export { Product as P };
//# sourceMappingURL=product-DVzY65Xo.js.map
