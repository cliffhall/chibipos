// /Users/cliffhall/Projects/chibipos/src/renderer/app/lib/db/models/daily_salesDetails.js
import sequelizePackage from 'sequelize';
const { DataTypes } = sequelizePackage;

export function defineDailySalesDetails(sequelize) {
  const DailySalesDetails = sequelize.define('daily_sales_details', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
    date: {
      type: DataTypes.DATEONLY,
      // allowNull: false, // Typically date would be required here
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false, // Usually a detail record must link to a product
      references: {
        model: 'product', // Model name string for Product
        key: 'id'
      }
    },
    daily_sales_id: {
      type: DataTypes.UUID,
      allowNull: false, // Usually a detail record must link to a daily_sales record
      references: {
        model: 'daily_sales', // Model name string for DailySales
        key: 'id'
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    av_price: { // Consider renaming to average_price for clarity
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    net_sales: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    discount_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00, // Good to have a default
      allowNull: false,
    }
  }, {
    tableName: 'daily_sales_details',
    // timestamps: true,
  });
  return DailySalesDetails;
}
