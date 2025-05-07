// /Users/cliffhall/Projects/chibipos/src/renderer/app/lib/db/models/daily_sales.js
import { DataTypes } from 'sequelize';

export function defineDailySales(sequelize) {
  const DailySales = sequelize.define('daily_sales', {
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
      defaultValue: 0.00, // Good to have a default
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
      allowNull: false, // Ensure it's not null if it has a default
    },
    cash: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },
    card: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    }
  }, {
    tableName: 'daily_sales',
    // timestamps: true, // Consider adding timestamps if useful
  });
  return DailySales;
}
