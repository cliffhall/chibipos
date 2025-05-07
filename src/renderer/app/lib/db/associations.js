// /Users/cliffhall/Projects/chibipos/src/renderer/app/lib/db/associations.js

// This function will be called from main.js after all models have been defined.
export function setupAssociations(sequelize) {
    // Destructure models from the sequelize instance for easier access.
    // The keys here (e.g., 'product', 'cat_product') must match the
    // first argument given to sequelize.define() in your model definition files.
    const {
        product,
        cat_product,
        ticket,
        ticket_details,
        daily_sales,
        daily_sales_details
    } = sequelize.models;

    // --- Product and CatProduct ---
    // A Product belongs to a CatProduct (Category)
    // A CatProduct (Category) can have many Products
    if (product && cat_product) {
        cat_product.hasMany(product, {
            foreignKey: 'catproduct_id', // This must match the FK column in the 'product' table
            as: 'products' // Optional alias for when you query CatProduct and include Products
        });
        product.belongsTo(cat_product, {
            foreignKey: 'catproduct_id',
            as: 'category' // Optional alias for when you query Product and include its Category
        });
        console.log('[Associations] Product <-> CatProduct associations set up.');
    } else {
        console.warn('[Associations] Could not set up Product <-> CatProduct associations. One or both models undefined.');
    }

    // --- Ticket and TicketDetails ---
    // A Ticket can have many TicketDetails
    // A TicketDetail belongs to one Ticket
    if (ticket && ticket_details) {
        ticket.hasMany(ticket_details, {
            foreignKey: 'ticket_id',
            as: 'details'
        });
        ticket_details.belongsTo(ticket, {
            foreignKey: 'ticket_id',
            as: 'ticketHeader' // Renamed from 'ticket' to avoid conflict if TicketDetails model was named 'ticket'
        });
        console.log('[Associations] Ticket <-> TicketDetails associations set up.');
    } else {
        console.warn('[Associations] Could not set up Ticket <-> TicketDetails associations. One or both models undefined.');
    }


    // --- TicketDetails and Product ---
    // A TicketDetail belongs to one Product (representing the item sold)
    // A Product can appear in many TicketDetails
    if (ticket_details && product) {
        // Note: A Product can have many TicketDetails, but a TicketDetail belongs to one Product.
        // The foreign key 'product_id' is in ticket_details.
        product.hasMany(ticket_details, {
            foreignKey: 'product_id',
            as: 'ticketEntries' // Alias for Product to get all ticket line items it's part of
        });
        ticket_details.belongsTo(product, {
            foreignKey: 'product_id',
            as: 'productInfo' // Alias for TicketDetails to get the Product information
        });
        console.log('[Associations] TicketDetails <-> Product associations set up.');
    } else {
        console.warn('[Associations] Could not set up TicketDetails <-> Product associations. One or both models undefined.');
    }

    // --- DailySales and DailySalesDetails ---
    // A DailySales record can have many DailySalesDetails
    // A DailySalesDetail belongs to one DailySales record
    if (daily_sales && daily_sales_details) {
        daily_sales.hasMany(daily_sales_details, {
            foreignKey: 'daily_sales_id',
            as: 'details'
        });
        daily_sales_details.belongsTo(daily_sales, {
            foreignKey: 'daily_sales_id',
            as: 'summary'
        });
        console.log('[Associations] DailySales <-> DailySalesDetails associations set up.');
    } else {
        console.warn('[Associations] Could not set up DailySales <-> DailySalesDetails associations. One or both models undefined.');
    }

    // --- DailySalesDetails and Product ---
    // A DailySalesDetail belongs to one Product
    // A Product can appear in many DailySalesDetails
    if (daily_sales_details && product) {
        product.hasMany(daily_sales_details, {
            foreignKey: 'product_id',
            as: 'dailySaleEntries'
        });
        daily_sales_details.belongsTo(product, {
            foreignKey: 'product_id',
            as: 'productInfo'
        });
        console.log('[Associations] DailySalesDetails <-> Product associations set up.');
    } else {
        console.warn('[Associations] Could not set up DailySalesDetails <-> Product associations. One or both models undefined.');
    }

    console.log('[Associations] All associations processed.');
}
