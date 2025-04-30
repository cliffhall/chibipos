import db from '$lib/db/config'
import { DataTypes } from 'sequelize';
import { CatProduct } from '$lib/db/models/catProduct.js'

export const Product = db.define('product', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
    unique: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  image: {
    type: DataTypes.STRING,
  },
  price: {
    type: DataTypes.FLOAT(2),
  },
  catproduct_id: {
    type: DataTypes.UUID,
    references: {
      model: CatProduct,
      key: 'id',
    }
  }
}, {
  tableName: 'product'
})