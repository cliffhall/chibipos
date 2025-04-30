import db from '$lib/db/config'
import { Product } from '$lib/db/models/product.js'
import { Ticket } from '$lib/db/models/ticket.js'
import { TicketDetails } from '$lib/db/models/ticketDetails.js'
import { CatProduct } from '$lib/db/models/catProduct.js'
import { DailySales } from '$lib/db/models/daily_sales.js'
import { DailySalesDetails } from '$lib/db/models/daily_salesDetails.js'

// PRODUCTO
CatProduct.hasMany(Product, { foreignKey: 'catproduct_id' })
Product.belongsTo(CatProduct, { foreignKey: 'catproduct_id' })

// // TICKET
Ticket.hasMany(TicketDetails, { foreignKey: 'ticket_id' });
TicketDetails.belongsTo(Ticket, { foreignKey: 'ticket_id' });

// // TICKET DETAILS
Product.hasMany(TicketDetails, { foreignKey: 'product_id' });
TicketDetails.belongsTo(Product, { foreignKey: 'product_id', });
// VENTA
DailySales.hasMany(DailySalesDetails, { foreignKey: 'daily_sales_id' })
DailySalesDetails.belongsTo(DailySales, { foreignKey: 'daily_sales_id' })
Product.hasMany(DailySalesDetails, { foreignKey: 'product_id' })
DailySalesDetails.belongsTo(Product, { foreignKey: 'product_id' })


