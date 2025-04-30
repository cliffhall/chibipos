import { DataTypes } from 'sequelize';
import db from '$lib/db/config'

export const CatProduct = db.define('cat_product', {
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
}, {
  tableName: 'cat_product'
})