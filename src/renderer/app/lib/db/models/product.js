// /Users/cliffhall/Projects/chibipos/src/renderer/app/lib/db/models/product.js
import { DataTypes } from 'sequelize';

// This function will be called by main.js, passing the initialized sequelize instance.
// It's a good practice to also pass DataTypes if you want to centralize its import,
// but importing it here is also fine as Sequelize will be a main project dependency.
export function defineProduct(sequelize) {
  const Product = sequelize.define('product', { // Use the passed sequelize instance
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
      unique: true, // Ensure this uniqueness constraint is what you intend
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true, // Explicitly set if images are optional
    },
    price: {
      type: DataTypes.FLOAT, // For currency, DataTypes.DECIMAL(10, 2) is often preferred for precision
      allowNull: false,    // Assuming price is mandatory
    },
    catproduct_id: { // Consider renaming to 'category_id' for convention
      type: DataTypes.UUID,
      allowNull: true, // Or false if a product must always have a category
      references: {
        // This refers to the model named 'cat_product'.
        // This model must be defined on the same sequelize instance
        // (e.g., by calling defineCatProduct(sequelize) in main.js)
        // *before* this Product model is defined.
        model: 'cat_product', // Use the model name as defined in catProduct.js's sequelize.define call
        key: 'id',
      }
    },
    status_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true, // Good practice to set a default
      allowNull: false,
    }
  }, {
    tableName: 'product',
    // timestamps: true, // Set to true if you want createdAt and updatedAt columns
    // underscored: true, // If you prefer snake_case for automatic fields (e.g., foreign keys, timestamps)
  });

  // Associations like Product.belongsTo(sequelize.models.cat_product, ...)
  // will typically be defined in a separate associations.js file or
  // directly in main.js after all models have been initialized.

  return Product; // Return the defined model class
}
