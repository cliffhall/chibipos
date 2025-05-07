// /Users/cliffhall/Projects/chibipos/src/renderer/app/lib/db/models/ticketDetails.js
import { DataTypes } from 'sequelize';

export function defineTicketDetails(sequelize) {
  const TicketDetails = sequelize.define('ticket_details', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
    ticket_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'ticket', // Model name string for Ticket
        key: 'id',
      }
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'product', // Model name string for Product
        key: 'id',
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: { // This is likely the unit price at the time of sale
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    extended_price: { // This would be quantity * price
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    discount_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
      allowNull: false,
    },
  }, {
    tableName: 'ticket_details',
    // timestamps: true, // Usually not needed for detail/join tables unless specific tracking is required
  });
  return TicketDetails;
}
