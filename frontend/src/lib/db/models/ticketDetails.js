import { DataTypes } from 'sequelize';
import db from '$lib/db/config'
import { Ticket } from '$lib/db/models/ticket.js'
import { Product } from '$lib/db/models/product.js'


export const TicketDetails = db.define('ticket_details', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
    unique: true,
  },
  ticket_id: {
    type: DataTypes.UUID,
    references: {
      model: Ticket,
      key: 'id',
    }
  },
  product_id: {
    type: DataTypes.UUID,
    references: {
      model: Product,
      key: 'id',
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  extended_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  discount_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    allowNull: false,
  },

}, {
  tableName: 'ticket_details'
})