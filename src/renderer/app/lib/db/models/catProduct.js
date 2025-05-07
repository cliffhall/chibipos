// /Users/cliffhall/Projects/chibipos/src/renderer/app/lib/db/models/catProduct.js
const DataTypes = require( 'sequelize');

export function defineCatProduct(sequelize) { // Renamed from 'CatProduct' to 'defineCatProduct'
  const CatProduct = sequelize.define('cat_product', { // Model name is 'cat_product'
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  }, {
    tableName: 'cat_product',
    // timestamps: true, // Or false
  });
  return CatProduct;
}
