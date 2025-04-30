import { Sequelize, DataTypes } from 'sequelize';
import path from 'path';

const dbPath = path.resolve(process.cwd(), "database.sqlite");
const sequelize = new Sequelize({
  host: "localhost",
  dialect: "sqlite",
  storage: dbPath,
  pool: {
    max: 5,
    min: 0,
    acquire: 3e4,
    idle: 1e4
  }
});
sequelize.authenticate().then(() => console.log("database connected")).then(() => console.log("dbPath: ", dbPath)).catch((error) => console.error("unable to connect to database: ", error));
const CatProduct = sequelize.define("cat_product", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
    unique: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
}, {
  tableName: "cat_product"
});

export { CatProduct as C, sequelize as s };
//# sourceMappingURL=catProduct-D_19IU5e.js.map
