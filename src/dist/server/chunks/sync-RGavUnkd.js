import { C as CatProduct, s as sequelize } from './catProduct-D_19IU5e.js';
import { P as Product } from './product-DVzY65Xo.js';
import { a as Ticket, T as TicketDetails } from './ticketDetails-BoI0an_9.js';
import { D as DailySales, a as DailySalesDetails } from './daily_salesDetails-X9f1ScFY.js';
import 'sequelize';
import 'path';

CatProduct.hasMany(Product, { foreignKey: "catproduct_id" });
Product.belongsTo(CatProduct, { foreignKey: "catproduct_id" });
Ticket.hasMany(TicketDetails, { foreignKey: "ticket_id" });
TicketDetails.belongsTo(Ticket, { foreignKey: "ticket_id" });
Product.hasMany(TicketDetails, { foreignKey: "product_id" });
TicketDetails.belongsTo(Product, { foreignKey: "product_id" });
DailySales.hasMany(DailySalesDetails, { foreignKey: "daily_sales_id" });
DailySalesDetails.belongsTo(DailySales, { foreignKey: "daily_sales_id" });
Product.hasMany(DailySalesDetails, { foreignKey: "product_id" });
DailySalesDetails.belongsTo(Product, { foreignKey: "product_id" });
await sequelize.sync({ alter: false }).then(() => {
  console.log("Database synced");
}).catch((error) => {
  console.log("Database error", error);
});

export { sequelize as default };
//# sourceMappingURL=sync-RGavUnkd.js.map
