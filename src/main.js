// /Users/cliffhall/Projects/chibipos/src/main.js

// Add this line at the top to inform ESLint/linters about globals injected by the Vite plugin
/* global MAIN_WINDOW_VITE_DEV_SERVER_URL, MAIN_WINDOW_VITE_NAME */

// ****************************************
// IMPORTS
// ****************************************
import { app, BrowserWindow, dialog, ipcMain, Menu } from 'electron';
import started from 'electron-squirrel-startup';
import { Sequelize, Op } from 'sequelize';
import { readFile } from 'fs/promises';
import CryptoJS from 'crypto-js';
import path from 'node:path';
import fs from 'node:fs';

import { defineCatProduct } from './renderer/app/lib/db/models/catProduct.js';
import { defineProduct } from './renderer/app/lib/db/models/product.js';
import { defineDailySales } from './renderer/app/lib/db/models/daily_sales.js';
import { defineDailySalesDetails } from './renderer/app/lib/db/models/daily_salesDetails.js';
import { defineTicket } from './renderer/app/lib/db/models/ticket.js';
import { defineTicketDetails } from './renderer/app/lib/db/models/ticketDetails.js';
import { setupAssociations } from './renderer/app/lib/db/associations.js'; // Import the new function

// print functions
import printTicket from './printing/printTicket.js';
import printKitchen from './printing/printKitchen.js';
import printSale from './printing/printSale.js';


// IMPORTANT: Manage your CRYPTO_KEY securely.
// This is a placeholder. In production, use environment variables
// or a more secure configuration method.
const CRYPTO_KEY = process.env.CHIBIPOS_CRYPTO_KEY || 'your-default-super-secret-key-for-dev';
if (CRYPTO_KEY === 'your-default-super-secret-key-for-dev' && !isDev) {
  console.warn('[Main Process] WARNING: Using default CRYPTO_KEY in production. This is insecure!');
}

function encryptDataForMain(data) {
  const jsonString = JSON.stringify(data);
  return CryptoJS.AES.encrypt(jsonString, CRYPTO_KEY).toString();
}

// Add this decryption helper function in your src/main.js,
// perhaps near your encryptDataForMain function.

function decryptImportedMenu(encryptedBase64Menu) {
  try {
    // The SvelteKit code did:
    // 1. const { encryptedMenu } = await request.json()
    // 2. const decodedMenu = atob(encryptedMenu) // Base64 decode
    // 3. const decryptedMenu = decryptMenu(decodedMenu) // AES decrypt using CRYPTO_KEY

    // Replicating in Node.js:
    // encryptedBase64Menu is the Base64 encoded string.
    const ciphertext = Buffer.from(encryptedBase64Menu, 'base64').toString('latin1'); // Replicates atob's output for binary strings

    const bytes = CryptoJS.AES.decrypt(ciphertext, CRYPTO_KEY);
    const decryptedJson = bytes.toString(CryptoJS.enc.Utf8);

    if (!decryptedJson) {
      // This can happen if decryption fails (e.g., wrong key, corrupted data)
      console.error('[Main Process] Decryption resulted in empty data.');
      throw new Error('Menu decryption failed: output is empty. Check key or data format.');
    }
    return JSON.parse(decryptedJson);
  } catch (error) {
    console.error('[Main Process] Error during menu decryption process:', error);
    // Re-throw or handle as appropriate for the IPC handler
    throw new Error(`Menu decryption failed: ${error.message}`);
  }
}
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

// Determine if in development mode
const isDev = !app.isPackaged; // Simplified: app.isPackaged is the most reliable

let mainWindow;
let sequelizeInstance; // To store the initialized Sequelize instance
let dbModels = {}; // To store references to your models, e.g., dbModels.Product

async function initializeDatabase() {
  // ... (sequelize initialization and model definitions as before) ...
  // dbModels.CatProduct = defineCatProduct(sequelizeInstance);
  // dbModels.Product = defineProduct(sequelizeInstance);
  // dbModels.Ticket = defineTicket(sequelizeInstance);
  // dbModels.DailySales = defineDailySales(sequelizeInstance);
  // dbModels.TicketDetails = defineTicketDetails(sequelizeInstance);
  // dbModels.DailySalesDetails = defineDailySalesDetails(sequelizeInstance);

  try {
    await testConnection();

    // Define models (as you have them)
    dbModels.CatProduct = defineCatProduct(sequelizeInstance);
    dbModels.Product = defineProduct(sequelizeInstance);
    dbModels.Ticket = defineTicket(sequelizeInstance);
    dbModels.DailySales = defineDailySales(sequelizeInstance);
    dbModels.TicketDetails = defineTicketDetails(sequelizeInstance);
    dbModels.DailySalesDetails = defineDailySalesDetails(sequelizeInstance);

    // At this point, all models are defined on sequelizeInstance.models

    // Setup associations
    setupAssociations(sequelizeInstance); // Call the associations setup

    await sequelizeInstance.sync({ alter: false });
    console.log('[Main Process] Database schema synchronized.');

    // ... (rest of your initializeDatabase function) ...
    return true;
  } catch (error) {
    console.error('[Main Process] Error during database initialization, model setup, associations, or sync:', error);
    dialog.showErrorBox("Database Error", "Could not initialize or synchronize the application database. Please contact support.");
    app.quit();
    return false;
  }
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1180,
    height: 713,
    resizable: isDev,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
      console.log(`[Main Process] Attempting to load DEV URL: ${MAIN_WINDOW_VITE_DEV_SERVER_URL}`);
      await mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL)
          .then(() => {
            console.log(`[Main Process] Successfully initiated DEV load for: ${MAIN_WINDOW_VITE_DEV_SERVER_URL}`);
          })
          .catch(err => {
            console.error(`[Main Process] FAILED to load DEV URL: ${MAIN_WINDOW_VITE_DEV_SERVER_URL}`, err);
            dialog.showErrorBox("Dev Server Error", `Could not connect to Vite dev server at ${MAIN_WINDOW_VITE_DEV_SERVER_URL}. Ensure it's running.`);
          });
    } else {
      console.error("[Main Process] MAIN_WINDOW_VITE_DEV_SERVER_URL is not defined in development. Cannot load renderer.");
      dialog.showErrorBox("Configuration Error", "Vite development server URL is missing.");
    }
  } else {
    const indexPath = path.join(
        process.resourcesPath,
        'app',
        '.vite',
        'renderer-static',
        'pages',
        'index.html'
    );
    console.log(`[Main Process] Attempting to load PROD URL: file://${indexPath}`);
    await mainWindow.loadFile(indexPath)
        .then(() => console.log(`[Main Process] Successfully loaded PROD file: ${indexPath}`))
        .catch(err => {
          console.error(`[Main Process] FAILED to load PROD file: ${indexPath}`, err);
          dialog.showErrorBox("Application Error", `Could not load the application. File not found: ${indexPath}`);
        });
  }

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL, isMainFrame) => {
    if (isMainFrame) {
      console.error(`[Main Process WebContents] Main frame did-fail-load:
        URL: ${validatedURL}
        Error Code: ${errorCode}
        Description: ${errorDescription}`);
    }
  });

  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  return mainWindow;
}

app.whenReady().then(async () => {
  const dbInitialized = await initializeDatabase();
  if (!dbInitialized) {
    // Database initialization failed, app.quit() was likely called.
    // If not, ensure it quits here.
    if (!app.isQuitting()) {
      app.quit();
    }
    return;
  }

  await createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// *****************
// IPC Handlers for Database
// *****************
ipcMain.handle('get-products', async () => {
  if (!dbModels.Product) {
    console.error('[IPC get-products] Product model is not available.');
    return { error: 'Product model not initialized on server.' };
  }
  try {
    const products = await dbModels.Product.findAll();
    return JSON.parse(JSON.stringify(products)); // Ensure plain objects are returned
  } catch (error) {
    console.error('[IPC get-products] Error fetching products:', error);
    return { error: error.message };
  }
});

ipcMain.handle('get-categories', async () => {
  // Corrected to use dbModels.CatProduct as per your model definition
  if (!dbModels.CatProduct) {
    console.error('[IPC get-categories] CatProduct model is not available.');
    return { error: 'Category model not initialized on server.' };
  }
  try {
    const categories = await dbModels.CatProduct.findAll();
    return JSON.parse(JSON.stringify(categories)); // Ensure plain objects are returned
  } catch (error) {
    console.error('[IPC get-categories] Error fetching categories:', error);
    return { error: error.message };
  }
});

ipcMain.handle('get-daily-sale-by-date', async (event, dateParam) => {
  if (!dbModels.DailySales) {
    console.error('[IPC get-daily-sale-by-date] DailySales model is not available.');
    return { status: 500, error: 'DailySales model not initialized on server.' };
  }
  try {
    // Ensure dateParam is treated as local date and formatted correctly for SQLite (YYYY-MM-DD)
    const date = new Date(dateParam + 'T00:00:00').toISOString().split('T')[0]; // Ensure local interpretation
    console.log(`[IPC get-daily-sale-by-date] Searching for sale on date: ${date}`);

    const sale = await dbModels.DailySales.findOne({
      where: { date },
    });

    if (sale) {
      return { status: 200, sale: JSON.parse(JSON.stringify(sale)) };
    } else {
      console.log(`[IPC get-daily-sale-by-date] No sale found for date: ${dateParam}`);
      return { status: 204, message: `No sale found for date: ${dateParam}` };
    }
  } catch (error) {
    console.error('[IPC get-daily-sale-by-date] Error fetching daily sale by date:', error);
    return { status: 500, error: error.message };
  }
});

ipcMain.handle('get-daily-sales-by-month', async (event, dateParam) => {
  if (!dbModels.DailySales) {
    console.error('[IPC get-daily-sales-by-month] DailySales model is not available.');
    return { status: 500, error: 'DailySales model not initialized on server.' };
  }
  try {
    const date = new Date(dateParam + 'T00:00:00'); // Ensure local interpretation for month/year
    const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0); // Last day of the month

    console.log(`[IPC get-daily-sales-by-month] Searching for sales between ${startDate.toISOString().split('T')[0]} and ${endDate.toISOString().split('T')[0]}`);

    const sales = await dbModels.DailySales.findAll({
      where: {
        date: { [Op.between]: [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]] }
      },
      order: [['date', 'DESC']]
    });

    return { sales: JSON.parse(JSON.stringify(sales)) };
  } catch (error) {
    console.error('[IPC get-daily-sales-by-month] Error fetching sales by month:', error);
    return { status: 500, error: error.message };
  }
});

ipcMain.handle('export-daily-sale-by-id', async (event, id) => {
  if (!dbModels.DailySales || !dbModels.DailySalesDetails) {
    console.error('[IPC export-daily-sale-by-id] DailySales or DailySalesDetails model is not available.');
    return { status: 500, error: 'Required models not initialized on server.' };
  }
  try {
    console.log(`[IPC export-daily-sale-by-id] Exporting sale with ID: ${id}`);
    const sale = await dbModels.DailySales.findByPk(id, {
      include: [{
        model: dbModels.DailySalesDetails,
        as: 'details' // Ensure this 'as' alias matches your association definition
      }]
    });

    if (sale) {
      const encryptedSale = encryptDataForMain(sale);
      return { status: 200, encryptedSale };
    } else {
      console.log(`[IPC export-daily-sale-by-id] No sale found for ID: ${id}`);
      return { status: 204, message: `No sale found for ID: ${id}` };
    }
  } catch (error) {
    console.error('[IPC export-daily-sale-by-id] Error exporting daily sale:', error);
    return { status: 500, error: error.message };
  }
});

ipcMain.handle('get-daily-sale-report-by-id', async (event, id) => {
  if (!dbModels.DailySales || !dbModels.DailySalesDetails || !dbModels.Product) {
    console.error('[IPC get-daily-sale-report-by-id] One or more required models are not available.');
    return { status: 500, error: 'Required models not initialized on server.' };
  }
  try {
    console.log(`[IPC get-daily-sale-report-by-id] Fetching sale report for ID: ${id}`);
    const saleReport = await dbModels.DailySales.findByPk(id, {
      attributes: { exclude: ['createdAt', 'updatedAt'] },
      include: [{
        model: dbModels.DailySalesDetails,
        as: 'details', // Must match your association alias
        attributes: ['quantity', 'net_sales', 'av_price', 'discount_amount'],
        include: [{
          model: dbModels.Product,
          as: 'productInfo', // Must match your association alias
          attributes: ['name'],
        }],
        // Order the DailySalesDetails themselves by the name of their associated Product
        order: [[ { model: dbModels.Product, as: 'productInfo' }, 'name', 'ASC' ]] // Corrected order placement
      }],
      // If you wanted to order the top-level DailySales records (if there were multiple)
      // by some aggregated or primary detail's product name, that would be more complex.
      // For a findByPk, this top-level order is less relevant.
    });

    if (saleReport) {
      return { status: 200, report: JSON.parse(JSON.stringify(saleReport)) };
    } else {
      console.log(`[IPC get-daily-sale-report-by-id] No sale report found for ID: ${id}`);
      return { status: 204, message: `No sale report found for ID: ${id}` };
    }
  } catch (error) {
    console.error('[IPC get-daily-sale-report-by-id] Error fetching daily sale report:', error);
    return { status: 500, error: error.message };
  }
});

ipcMain.handle('get-ticket-by-id', async (event, ticketId) => {
  if (!dbModels.Ticket || !dbModels.TicketDetails || !dbModels.Product) {
    console.error('[IPC get-ticket-by-id] One or more required models are not available.');
    return { status: 500, error: 'Required models not initialized on server.' };
  }
  try {
    console.log(`[IPC get-ticket-by-id] Fetching ticket with ID: ${ticketId}`);
    const ticket = await dbModels.Ticket.findByPk(ticketId, {
      attributes: { exclude: ['createdAt', 'updatedAt'] },
      include: [{
        model: dbModels.TicketDetails,
        as: 'details', // Ensure this 'as' alias matches your association definition
        attributes: ['quantity', 'price'], // Add 'id' or other fields if needed by frontend
        include: [{
          model: dbModels.Product,
          as: 'productInfo', // Ensure this 'as' alias matches your association definition
          attributes: ['name']
        }]
      }]
    });

    if (ticket) {
      return { status: 200, ticket: JSON.parse(JSON.stringify(ticket)) };
    } else {
      console.log(`[IPC get-ticket-by-id] No ticket found for ID: ${ticketId}`);
      return { status: 404, message: `No ticket found for ID: ${ticketId}` }; // 404 for not found
    }
  } catch (error) {
    console.error('[IPC get-ticket-by-id] Error fetching ticket by ID:', error);
    return { status: 500, error: error.message };
  }
});

ipcMain.handle('cancel-ticket-by-id', async (event, ticketId) => {
  if (!dbModels.Ticket) {
    console.error('[IPC cancel-ticket-by-id] Ticket model is not available.');
    return { status: 500, error: 'Ticket model not initialized on server.' };
  }
  try {
    console.log(`[IPC cancel-ticket-by-id] Attempting to cancel ticket with ID: ${ticketId}`);
    const ticket = await dbModels.Ticket.findByPk(ticketId);

    if (!ticket) {
      console.log(`[IPC cancel-ticket-by-id] No ticket found for ID: ${ticketId} to cancel.`);
      return { status: 404, error: `Ticket with ID ${ticketId} not found.` };
    }

    if (ticket.canceled) {
      console.log(`[IPC cancel-ticket-by-id] Ticket with ID: ${ticketId} is already canceled.`);
      // Decide if you want to return success or a specific message for already canceled
      return { status: 200, success: true, message: 'Ticket already canceled.' };
    }

    ticket.canceled = true;
    await ticket.save();
    console.log(`[IPC cancel-ticket-by-id] Ticket with ID: ${ticketId} has been canceled.`);
    return { status: 200, success: true, ticket: JSON.parse(JSON.stringify(ticket)) };
  } catch (error) {
    console.error(`[IPC cancel-ticket-by-id] Error canceling ticket with ID ${ticketId}:`, error);
    return { status: 500, error: error.message };
  }
});

ipcMain.handle('update-daily-sales-report', async (event, dateString) => {
  if (!dbModels.Ticket || !dbModels.TicketDetails || !dbModels.Product || !dbModels.DailySales || !dbModels.DailySalesDetails) {
    console.error('[IPC update-daily-sales-report] One or more required models are not available.');
    return { status: 500, error: 'Required models not initialized on server.' };
  }

  const transaction = await sequelizeInstance.transaction(); // Use sequelizeInstance for transaction

  try {
    console.log(`[IPC update-daily-sales-report] Updating sales report for date: ${dateString}`);
    // Date range logic from original: 6 AM UTC on the given date to 5:59:59 AM UTC the next day.
    // The input dateString (e.g., "2023-10-27") is the target date for the DailySales record.
    const targetDate = new Date(dateString + 'T00:00:00.000Z'); // Interpret dateString as UTC for consistency in report date

    const start = new Date(targetDate); // Use targetDate as base for time window
    start.setUTCHours(6, 0, 0, 0);

    const end = new Date(targetDate);
    end.setUTCDate(end.getUTCDate() + 1);
    end.setUTCHours(5, 59, 59, 999);

    const startISO = start.toISOString();
    const endISO = end.toISOString();

    console.log(`[IPC update-daily-sales-report] Ticket data window: ${startISO} to ${endISO}`);

    // TICKET DATA
    const canceledTicketsData = await dbModels.Ticket.findOne({ // findOne as it's an aggregation
      attributes: [
        [sequelizeInstance.Sequelize.fn('COUNT', sequelizeInstance.Sequelize.col('id')), 'canceled_count'],
      ],
      where: {
        date: { [Op.between]: [startISO, endISO] },
        canceled: true,
      },
      raw: true,
      transaction
    });

    const validTicketsData = await dbModels.Ticket.findOne({ // findOne for aggregation
      attributes: [
        [sequelizeInstance.Sequelize.fn('COUNT', sequelizeInstance.Sequelize.col('id')), 'ticket_count'],
        [sequelizeInstance.Sequelize.fn('SUM', sequelizeInstance.Sequelize.col('cash')), 'sum_cash'],
        [sequelizeInstance.Sequelize.fn('SUM', sequelizeInstance.Sequelize.col('card')), 'sum_card'],
      ],
      where: {
        date: { [Op.between]: [startISO, endISO] },
        canceled: false,
      },
      raw: true,
      transaction
    });

    // TICKET DETAILS DATA
    const lineItems = await dbModels.TicketDetails.findAll({
      attributes: [
        'product_id',
        [sequelizeInstance.Sequelize.fn('SUM', sequelizeInstance.Sequelize.col('quantity')), 'sum_quantity'],
        [sequelizeInstance.Sequelize.fn('SUM', sequelizeInstance.Sequelize.col('extended_price')), 'sum_extended_price'],
        [sequelizeInstance.Sequelize.fn('SUM', sequelizeInstance.Sequelize.col('discount_amount')), 'sum_discount_amount'],
        // Ensure 'price' column exists on ticket_details for this literal
        [sequelizeInstance.Sequelize.literal('SUM(ticket_details.price * ticket_details.quantity)'), 'sum_total_sale'],
      ],
      include: [
        {
          model: dbModels.Ticket,
          as: 'ticketHeader', // Use the alias defined in your associations
          attributes: [],
          where: {
            date: { [Op.between]: [startISO, endISO] },
            canceled: false,
          }
        },
        {
          model: dbModels.Product,
          as: 'productInfo', // Use the alias defined in your associations
          attributes: ['id', 'name'] // 'id' is already product_id, 'name' is good
        }
      ],
      group: ['ticket_details.product_id', 'productInfo.id', 'productInfo.name'], // Group by product attributes from the include
      raw: true, // Be cautious with raw: true and includes, ensure aliases are correct
      transaction
    });

    // Summarize data
    const netSales = lineItems.reduce((sum, item) => sum + parseFloat(item.sum_extended_price || 0), 0);
    const totalSales = lineItems.reduce((sum, item) => sum + parseFloat(item.sum_total_sale || 0), 0);
    const discountAmount = lineItems.reduce((sum, item) => sum + parseFloat(item.sum_discount_amount || 0), 0);

    const totalCash = parseFloat(validTicketsData?.sum_cash || 0);
    const totalCard = parseFloat(validTicketsData?.sum_card || 0);
    const ticketCount = parseInt(validTicketsData?.ticket_count || 0, 10);
    const canceledCount = parseInt(canceledTicketsData?.canceled_count || 0, 10);

    if (ticketCount === 0 && lineItems.length > 0) {
      // This case might indicate an issue if lineItems exist but no valid tickets were found.
      console.warn("[IPC update-daily-sales-report] Line items found but ticket_count is zero. Check ticket query.");
    }


    // CREATE RECORDS
    // Use the original dateString for the DailySales record's date field, formatted as YYYY-MM-DD
    const reportDateForDB = new Date(dateString + 'T00:00:00').toISOString().split('T')[0];

    const dailySale = await dbModels.DailySales.create({
      date: reportDateForDB,
      net_sales: netSales,
      total_sales: totalSales,
      cash: totalCash,
      card: totalCard,
      ticket_count: ticketCount,
      canceled_count: canceledCount,
      average_ticket: ticketCount > 0 ? Math.round(netSales / ticketCount) : 0,
      discount_amount: discountAmount,
    }, { transaction });

    const saleDetails = lineItems.map(item => ({
      date: reportDateForDB,
      daily_sales_id: dailySale.id,
      product_id: item.product_id, // This should come directly from ticket_details.product_id
      quantity: parseInt(item.sum_quantity, 10),
      net_sales: parseFloat(item.sum_extended_price),
      av_price: parseInt(item.sum_quantity, 10) > 0 ? Math.round(parseFloat(item.sum_extended_price) / parseInt(item.sum_quantity, 10)) : 0,
      discount_amount: parseFloat(item.sum_discount_amount)
    }));

    if (saleDetails.length > 0) {
      await dbModels.DailySalesDetails.bulkCreate(saleDetails, { transaction });
    }

    await transaction.commit();
    console.log(`[IPC update-daily-sales-report] Successfully updated sales report for ${reportDateForDB}`);
    return { status: 200, dailySale: JSON.parse(JSON.stringify(dailySale)) };

  } catch (error) {
    console.error('[IPC update-daily-sales-report] Error processing sales report:', error);
    if (transaction.finished !== 'commit' && transaction.finished !== 'rollback') { // Check if transaction is still active
      await transaction.rollback();
    }
    return { status: 500, error: error.message };
  }
});

ipcMain.handle('update-menu-from-import', async (event, menuData) => {
  // menuData might look like:
  // {
  //   categories: [
  //     { name: 'Drinks', products: [{ name: 'Coke', price: 2.50, image: '...' }, ...] },
  //     { name: 'Food', products: [{ name: 'Burger', price: 8.00, image: '...' }, ...] }
  //   ]
  // }

  if (!dbModels.CatProduct || !dbModels.Product) {
    console.error('[IPC update-menu-from-import] CatProduct or Product model is not available.');
    return { status: 500, error: 'Required models not initialized on server.' };
  }
  if (!menuData || !Array.isArray(menuData.categories)) {
    return { status: 400, error: 'Invalid menu data provided.' };
  }

  const transaction = await sequelizeInstance.transaction();
  try {
    console.log('[IPC update-menu-from-import] Starting menu update...');

    // Option 1: Delete all existing products and categories
    // Be very careful with this in production!
    await dbModels.Product.destroy({ where: {}, transaction, truncate: true /* if you want to reset IDs for some DBs */ });
    await dbModels.CatProduct.destroy({ where: {}, transaction, truncate: true });
    console.log('[IPC update-menu-from-import] Cleared existing products and categories.');

    // Option 2: More selective deletion/update (more complex, based on your needs)

    for (const categoryData of menuData.categories) {
      if (!categoryData.name) continue; // Skip if category name is missing

      const newCategory = await dbModels.CatProduct.create({
        name: categoryData.name
      }, { transaction });
      console.log(`[IPC update-menu-from-import] Created category: ${newCategory.name}`);

      if (Array.isArray(categoryData.products) && categoryData.products.length > 0) {
        const productsToCreate = categoryData.products.map(productData => ({
          name: productData.name,
          price: parseFloat(productData.price || 0),
          image: productData.image || null, // Handle optional image
          catproduct_id: newCategory.id, // Link to the newly created category
          status_active: productData.status_active !== undefined ? productData.status_active : true,
        })).filter(p => p.name && p.price > 0); // Basic validation

        if (productsToCreate.length > 0) {
          await dbModels.Product.bulkCreate(productsToCreate, { transaction });
          console.log(`[IPC update-menu-from-import] Created ${productsToCreate.length} products for category: ${newCategory.name}`);
        }
      }
    }

    await transaction.commit();
    console.log('[IPC update-menu-from-import] Menu update successful.');
    return { status: 200, success: true, message: 'Menu updated successfully.' };

  } catch (error) {
    console.error('[IPC update-menu-from-import] Error updating menu:', error);
    if (transaction.finished !== 'commit' && transaction.finished !== 'rollback') {
      await transaction.rollback();
    }
    return { status: 500, error: error.message };
  }
});

ipcMain.handle('import-update-menu', async (event, encryptedBase64Menu) => {
  if (!dbModels.CatProduct || !dbModels.Product) {
    console.error('[IPC import-update-menu] CatProduct or Product model is not available.');
    return { status: 500, error: 'Required models not initialized on server.' };
  }

  if (!encryptedBase64Menu) {
    return { status: 400, error: 'No encrypted menu data provided.' };
  }

  const transaction = await sequelizeInstance.transaction();
  try {
    console.log('[IPC import-update-menu] Attempting to decrypt and import menu...');
    const decryptedMenu = decryptImportedMenu(encryptedBase64Menu);

    // Validate decrypted structure (basic check)
    if (!decryptedMenu || !Array.isArray(decryptedMenu.cats) || !Array.isArray(decryptedMenu.products)) {
      await transaction.rollback(); // Rollback if structure is invalid after decryption
      return { status: 400, error: 'Decrypted menu data is not in the expected format.' };
    }

    const { cats, products } = decryptedMenu;

    if ((cats && cats.length > 0) || (products && products.length > 0)) { // Allow updating even if one part is empty
      console.log(`[IPC import-update-menu] Processing ${cats.length} categories and ${products.length} products.`);

      // Bulk create/update categories
      if (cats.length > 0) {
        await dbModels.CatProduct.bulkCreate(
            cats.map(cat => ({
              id: cat.id,       // Assuming 'id' comes from the import
              name: cat.nombre  // Matching 'nombre' from your SvelteKit code
            })),
            {
              updateOnDuplicate: ['name'], // Fields to update if 'id' conflicts
              transaction
            }
        );
        console.log('[IPC import-update-menu] Categories processed.');
      }

      // Bulk create/update products
      if (products.length > 0) {
        await dbModels.Product.bulkCreate(
            products.map(product => ({
              id: product.id,                     // Assuming 'id' comes from the import
              name: product.nombre,               // Matching 'nombre'
              image: product.image,
              price: parseFloat(product.precio) || 0, // Matching 'precio'
              catproduct_id: product.catproducto_id, // Matching 'catproducto_id'
              status_active: product.status_active !== undefined ? product.status_active : true
            })),
            {
              updateOnDuplicate: ['name', 'image', 'price', 'catproduct_id', 'status_active'], // Fields to update
              transaction
            }
        );
        console.log('[IPC import-update-menu] Products processed.');
      }
    } else {
      console.log('[IPC import-update-menu] No categories or products found in the decrypted menu data to process.');
    }

    await transaction.commit();
    console.log('[IPC import-update-menu] Menu import/update successful.');
    return { status: 200, success: true, message: 'Menu updated successfully.' };

  } catch (error) {
    console.error('[IPC import-update-menu] Error processing menu import:', error);
    if (transaction && transaction.finished !== 'commit' && transaction.finished !== 'rollback') {
      await transaction.rollback();
    }
    // Provide a more generic error to the client for security
    return { status: 500, error: `Failed to import menu. ${error.message.includes('decryption failed') ? 'Decryption error.' : 'Server error.'}` };
  }
});

ipcMain.handle('delete-all-menu-data', async () => {
  if (!dbModels.CatProduct || !dbModels.Product) {
    console.error('[IPC delete-all-menu-data] CatProduct or Product model is not available.');
    return { status: 500, error: 'Required models not initialized on server.' };
  }

  const transaction = await sequelizeInstance.transaction();
  try {
    console.log('[IPC delete-all-menu-data] Attempting to delete all products and categories...');

    // Order matters if there are foreign key constraints without ON DELETE CASCADE
    // Delete products first, then categories.
    await dbModels.Product.destroy({
      where: {},
      transaction
      // truncate: true // For SQLite, `destroy({ where: {} })` is a DELETE FROM.
      // `truncate: true` is more of a hint for other DBs.
      // If you need to reset auto-increment IDs (not applicable for UUIDs),
      // specific SQLite pragmas might be needed, but usually not for this.
    });
    console.log('[IPC delete-all-menu-data] All products deleted.');

    await dbModels.CatProduct.destroy({
      where: {},
      transaction
      // truncate: true
    });
    console.log('[IPC delete-all-menu-data] All categories deleted.');

    await transaction.commit();
    console.log('[IPC delete-all-menu-data] All menu data successfully deleted.');
    return { status: 200, success: true, message: 'All menu data has been deleted.' };

  } catch (error) {
    console.error('[IPC delete-all-menu-data] Error deleting menu data:', error);
    if (transaction && transaction.finished !== 'commit' && transaction.finished !== 'rollback') {
      await transaction.rollback();
    }
    return { status: 500, error: 'Failed to delete menu data.' };
  }
});

// *****************
// Application code (Printing, Menus, etc. - unchanged from your version)
// *****************
// Main process functions
async function openMenuDialog(browserWindow) {
  // ... (your existing openMenuDialog code)
  const result = await dialog.showOpenDialog(browserWindow, {
    properties: ['openFile'],
    filters: [{ name: 'json file', extensions: ['json'] }]
  });

  if (result.canceled || result.filePaths.length === 0) return;

  const [filePath] = result.filePaths;
  try {
    const content = await readFile(filePath, { encoding: 'utf-8' });
    browserWindow.webContents.send('menu-file-opened', content);
  } catch (error) {
    console.error(`[Main Process] Error reading menu file ${filePath}:`, error);
    dialog.showErrorBox("File Error", `Could not read the menu file: ${error.message}`);
  }
}


// Main process listeners
ipcMain.on('open-menu-dialog', (event) => {
  const browserWindow = BrowserWindow.fromWebContents(event.sender);
  if (!browserWindow) {
    console.warn('[Main Process] open-menu-dialog: Could not find BrowserWindow from sender.');
    return;
  }
  openMenuDialog(browserWindow);
});


// *****************
// PRINTING
// *****************
ipcMain.handle('print-ticket', async (e, data) => {
  console.log('[Main Process] Handling print-ticket IPC call.');
  const result = await printTicket(e, data);
  return result;
});

ipcMain.handle('print-kitchen', async (e, data) => {
  console.log('[Main Process] Handling print-kitchen IPC call.');
  const result = await printKitchen(e, data);
  return result;
});

ipcMain.handle('print-sale', async (e, data) => {
  console.log('[Main Process] Handling print-sale IPC call.');
  const result = await printSale(e, data);
  return result;
});


// *****************
// MENUS
// *****************
const menuTemplate = [
  // ... (your existing menuTemplate code, ensure app.getName() is used for macOS app menu)
  {
    label: app.name, // Use app.name for dynamic app naming
    submenu: [
      {
        label: 'Importar carta',
        click: () => {
          let targetWindow = BrowserWindow.getFocusedWindow();
          if (!targetWindow && mainWindow && !mainWindow.isDestroyed()) {
            targetWindow = mainWindow;
          }
          if (targetWindow) {
            openMenuDialog(targetWindow);
          } else {
            console.warn('[Main Process] Importar carta: No suitable window to open dialog for.');
          }
        }
      },
      { type: 'separator' },
      { label: 'Recargar', role: 'reload' },
      { label: 'Forzar Recarga', role: 'forceReload' },
      { label: 'Alternar Herramientas de Desarrollo', role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'minimize' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  },
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { role: 'selectAll' }
    ]
  }
];

if (process.platform === 'darwin') {
  const appMenu = menuTemplate.find(m => m.label === app.name) || menuTemplate[0];
  // Ensure submenu exists before trying to prepend
  if (appMenu && appMenu.submenu) {
    appMenu.submenu.unshift(
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' }
    );
  } else if (appMenu) { // If submenu doesn't exist, create it
    appMenu.submenu = [
      { role: 'about' },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideOthers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' } // Add quit if it was the only item
    ];
  }
}

const menu = Menu.buildFromTemplate(menuTemplate);
Menu.setApplicationMenu(menu);
