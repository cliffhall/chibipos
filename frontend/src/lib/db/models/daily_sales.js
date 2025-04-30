import { DataTypes } from 'sequelize';
import db from '$lib/db/config'

export const DailySales = db.define('daily_sales', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
    unique: true,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  discount_amount: {
    type: DataTypes.DECIMAL(10, 2),
  },
  net_sales: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  total_sales: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  average_ticket: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  ticket_count: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  canceled_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  cash: {
    type: DataTypes.DECIMAL(10, 2),
  },
  card: {
    type: DataTypes.DECIMAL(10, 2),
  }
}, {
  tableName: 'daily_sales'
})