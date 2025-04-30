import { DataTypes } from 'sequelize';
import { s as sequelize } from './catProduct-D_19IU5e.js';
import { P as Product } from './product-DVzY65Xo.js';

const DailySales = sequelize.define("daily_sales", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
    unique: true
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  discount_amount: {
    type: DataTypes.DECIMAL(10, 2)
  },
  net_sales: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  total_sales: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  average_ticket: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  ticket_count: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  canceled_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  cash: {
    type: DataTypes.DECIMAL(10, 2)
  },
  card: {
    type: DataTypes.DECIMAL(10, 2)
  }
}, {
  tableName: "daily_sales"
});
const DailySalesDetails = sequelize.define("daily_sales_details", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
    unique: true
  },
  date: {
    type: DataTypes.DATEONLY
  },
  product_id: {
    type: DataTypes.UUID,
    references: {
      model: Product,
      key: "id"
    }
  },
  daily_sales_id: {
    type: DataTypes.UUID,
    references: {
      model: DailySales,
      key: "id"
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  av_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  net_sales: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  discount_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  tableName: "daily_sales_details"
});

export { DailySales as D, DailySalesDetails as a };
//# sourceMappingURL=daily_salesDetails-X9f1ScFY.js.map
