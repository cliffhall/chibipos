import { DataTypes } from 'sequelize';
import db from '$lib/db/config'

export const Ticket = db.define('ticket', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
    unique: true,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  cash: {
    type: DataTypes.DECIMAL(10, 2),
  },
  card: {
    type: DataTypes.DECIMAL(10, 2),
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2)
  },
  discount_rate: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
  discount_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2)
  },
  canceled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  cash_received: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
  change: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
  // order_number: {
  //   type: DataTypes.INTEGER,
  //   defaultValue: 0
  // }
}, {
  tableName: 'ticket'
})