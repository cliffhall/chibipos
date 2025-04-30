import { DataTypes } from 'sequelize';
import db from '$lib/db/config'
import { Product } from '$lib/db/models/product.js'
import { DailySales } from '$lib/db/models/daily_sales.js'

export const DailySalesDetails = db.define('daily_sales_details', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
    unique: true,
  },
  date: {
    type: DataTypes.DATEONLY,
  },
  product_id: {
    type: DataTypes.UUID,
    references: {
      model: Product,
      key: 'id'
    }
  },
  daily_sales_id: {
    type: DataTypes.UUID,
    references: {
      model: DailySales,
      key: 'id'
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  av_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  net_sales: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  discount_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  }
}, {
  tableName: 'daily_sales_details'
})