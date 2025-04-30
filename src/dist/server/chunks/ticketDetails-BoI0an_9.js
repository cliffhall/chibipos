import { DataTypes } from 'sequelize';
import { s as sequelize } from './catProduct-D_19IU5e.js';
import { P as Product } from './product-DVzY65Xo.js';

const Ticket = sequelize.define("ticket", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
    unique: true
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  cash: {
    type: DataTypes.DECIMAL(10, 2)
  },
  card: {
    type: DataTypes.DECIMAL(10, 2)
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2)
  },
  discount_rate: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  discount_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
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
    defaultValue: 0
  },
  change: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  }
  // order_number: {
  //   type: DataTypes.INTEGER,
  //   defaultValue: 0
  // }
}, {
  tableName: "ticket"
});
const TicketDetails = sequelize.define("ticket_details", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
    unique: true
  },
  ticket_id: {
    type: DataTypes.UUID,
    references: {
      model: Ticket,
      key: "id"
    }
  },
  product_id: {
    type: DataTypes.UUID,
    references: {
      model: Product,
      key: "id"
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  extended_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  discount_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    allowNull: false
  }
}, {
  tableName: "ticket_details"
});

export { TicketDetails as T, Ticket as a };
//# sourceMappingURL=ticketDetails-BoI0an_9.js.map
