// /Users/cliffhall/Projects/chibipos/src/renderer/app/lib/db/models/ticket.js
import sequelizePackage from 'sequelize';
const { DataTypes } = sequelizePackage;


export function defineTicket(sequelize) {
  const Ticket = sequelize.define('ticket', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
    date: {
      type: DataTypes.DATE, // Using DATE for timestamp precision
      allowNull: false,
      defaultValue: DataTypes.NOW, // Often useful to default to current time
    },
    cash: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },
    card: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false, // Subtotal is usually required
    },
    discount_rate: {
      type: DataTypes.DECIMAL(10, 2), // Or DataTypes.FLOAT if rate is fine as float
      defaultValue: 0.00,
    },
    discount_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false, // Total is usually required
    },
    canceled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    cash_received: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },
    change: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },
    // order_number: { // If you re-enable this, ensure it's handled
    //   type: DataTypes.INTEGER,
    //   autoIncrement: true, // If you want it to be an auto-incrementing order number
    //   unique: true, // If each order number should be unique
    //   allowNull: false, // If it's a key part of the ticket
    // }
  }, {
    tableName: 'ticket',
    // timestamps: true, // createdAt and updatedAt
  });
  return Ticket;
}
