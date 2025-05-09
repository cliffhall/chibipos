// /Users/cliffhall/Projects/chibipos/src/main.js

// Add this line at the top to inform ESLint/linters about globals injected by the Vite plugin
/* global MAIN_WINDOW_VITE_DEV_SERVER_URL, MAIN_WINDOW_VITE_NAME */

// ****************************************
// IMPORTS
// ****************************************
import { app, BrowserWindow, dialog, ipcMain, Menu } from 'electron';
import { readFile } from 'fs/promises';
import path from 'node:path';
import fs from 'node:fs';

import { fileURLToPath } from 'node:url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

import { initializeSequelize } from './renderer/app/lib/db/config.js';
import { defineCatProduct } from './renderer/app/lib/db/models/catProduct.js';
import { defineProduct } from './renderer/app/lib/db/models/product.js';
import { defineDailySales } from './renderer/app/lib/db/models/daily_sales.js';
import { defineDailySalesDetails } from './renderer/app/lib/db/models/daily_salesDetails.js';
import { defineTicket } from './renderer/app/lib/db/models/ticket.js';
import { defineTicketDetails } from './renderer/app/lib/db/models/ticketDetails.js';
import { setupAssociations } from './renderer/app/lib/db/associations.js';

// Robustly get Sequelize constructor and Op
import sequelizePackage from 'sequelize';
const { Sequelize: ResolvedSequelizeConstructor, Op: ResolvedOp, DataTypes: SequelizeDataTypes } = sequelizePackage;

// Runtime check for ResolvedSequelize
if (typeof ResolvedSequelizeConstructor !== 'function') {
  const errorMsg = '[Main Process] Critical: ResolvedSequelizeConstructor is not a constructor function.';
  console.error(errorMsg, 'Type:', typeof ResolvedSequelizeConstructor, 'Package keys:', Object.keys(sequelizePackage).join(', '));
  if (dialog && typeof dialog.showErrorBox === 'function') {
    dialog.showErrorBox("Initialization Error", "Failed to load database library (Sequelize). The application cannot start.");
  }
  if (app && typeof app.quit === 'function' && (typeof app.isQuitting !== 'function' || !app.isQuitting())) {
    app.quit();
  }
  throw new Error(errorMsg);
}

import CryptoJS from 'crypto-js';
const started = require('electron-squirrel-startup');


// print functions
import printTicket from './printing/printTicket.js';
import printKitchen from './printing/printKitchen.js';
import printSale from './printing/printSale.js';

const isDev = !app.isPackaged;

const CRYPTO_KEY = process.env.CHIBIPOS_CRYPTO_KEY || 'your-default-super-secret-key-for-dev';

if (CRYPTO_KEY === 'your-default-super-secret-key-for-dev' && app.isPackaged) { // Corrected: warn if default key is used AND it's packaged (production)
  console.warn('[Main Process] WARNING: Using default CRYPTO_KEY in production. This is insecure!');
}


function encryptDataForMain(data) {
  const jsonString = JSON.stringify(data);
  return CryptoJS.AES.encrypt(jsonString, CRYPTO_KEY).toString();
}

function decryptImportedMenu(encryptedBase64Menu) {
  try {
    const ciphertext = Buffer.from(encryptedBase64Menu, 'base64').toString('latin1');
    const bytes = CryptoJS.AES.decrypt(ciphertext, CRYPTO_KEY);
    const decryptedJson = bytes.toString(CryptoJS.enc.Utf8);

    if (!decryptedJson) {
      console.error('[Main Process] Decryption resulted in empty data.');
      throw new Error('Menu decryption failed: output is empty. Check key or data format.');
    }
    return JSON.parse(decryptedJson);
  } catch (error) {
    console.error('[Main Process] Error during menu decryption process:', error);
    throw new Error(`Menu decryption failed: ${error.message}`);
  }
}

if (started) {
  app.quit();
}

let mainWindow;
let sequelizeInstance;
let dbModels = {};

async function initializeDatabase() {
  try {
    // Pass the resolved Sequelize constructor from main.js to the initializer function
    const { sequelize, testConnection, dbPath } = initializeSequelize(app, ResolvedSequelizeConstructor);
    sequelizeInstance = sequelize;

    // Database copying logic for production
    if (app.isPackaged) {
      const packagedDbPath = path.resolve(process.resourcesPath, 'app', 'database.sqlite');
      if (!fs.existsSync(dbPath) && fs.existsSync(packagedDbPath)) {
        console.log(`[Main Process] Database not found at ${dbPath}. Copying from ${packagedDbPath}...`);
        fs.copyFileSync(packagedDbPath, dbPath);
        console.log(`[Main Process] Database copied successfully to ${dbPath}.`);
      } else if (!fs.existsSync(packagedDbPath) && !fs.existsSync(dbPath)) {
        console.error(`[Main Process] Packaged database not found at ${packagedDbPath} and no existing DB at ${dbPath}. Cannot proceed.`);
        throw new Error("Application database is missing. Please reinstall or contact support.");
      } else if (fs.existsSync(dbPath)) {
        console.log(`[Main Process] Database found at ${dbPath}. No copy needed.`);
      } else if (!fs.existsSync(packagedDbPath)) {
        console.log(`[Main Process] Packaged database not found at ${packagedDbPath}. Assuming DB will be created or already exists at ${dbPath}.`);
      }
    }

    await testConnection();

    // Define models (ensure sequelizeInstance is valid)
    if (!sequelizeInstance || typeof sequelizeInstance.sync !== 'function') {
      throw new Error("Sequelize instance is not valid after initialization.");
    }
    dbModels.CatProduct = defineCatProduct(sequelizeInstance);
    dbModels.Product = defineProduct(sequelizeInstance);
    dbModels.Ticket = defineTicket(sequelizeInstance);
    dbModels.DailySales = defineDailySales(sequelizeInstance);
    dbModels.TicketDetails = defineTicketDetails(sequelizeInstance);
    dbModels.DailySalesDetails = defineDailySalesDetails(sequelizeInstance);

    setupAssociations(sequelizeInstance);

    await sequelizeInstance.sync({ alter: false });
    console.log('[Main Process] Database schema synchronized.');

    return true;
  } catch (error) {
    console.error('[Main Process] Error during database initialization process:', error);
    dialog.showErrorBox("Database Error", `Could not initialize the application database. ${error.message}`);
    // The 'app.isQuitting()' issue originates here.
    // If 'app' is not the true Electron app object, this will fail.
    // This points to a bundler issue with the 'electron' module.
    try {
      if (app && typeof app.isQuitting === 'function' && !app.isQuitting()) {
        if (typeof app.quit === 'function') app.quit();
      } else if (app && typeof app.isQuitting !== 'function') {
        // If app.isQuitting is not a function, it's a strong sign 'app' is not the real Electron app.
        console.error("[Main Process] CRITICAL: Electron 'app.isQuitting' is not a function. Bundling issue suspected. Forcing quit.");
        if (typeof app.quit === 'function') app.quit(); else process.exit(1); // Fallback
      }
    } catch (e) {
      console.error("[Main Process] Error trying to quit app after DB init failure:", e);
      process.exit(1); // Force exit if quitting logic itself fails
    }
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
    const indexPath = path.join(__dirname, '..', 'renderer', MAIN_WINDOW_VITE_NAME, 'index.html');
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
    // Quitting logic is now more robustly handled within initializeDatabase's catch block
    // but ensure app exits if it reaches here and db isn't initialized.
    if (app && typeof app.quit === 'function' && (typeof app.isQuitting !== 'function' || !app.isQuitting())) {
      app.quit();
    } else if (app && typeof app.isQuitting !== 'function') {
      console.error("[Main Process] App ready but DB not initialized, and app.isQuitting is not a function. Forcing exit.");
      process.exit(1);
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
// IMPORTANT: Replace all instances of 'Op' with 'ResolvedOp'
// *****************
ipcMain.handle('get-products', async () => {
  if (!dbModels.Product) {
    console.error('[IPC get-products] Product model is not available.');
    return { error: 'Product model not initialized on server.' };
  }
  try {
    const products = await dbModels.Product.findAll();
    return JSON.parse(JSON.stringify(products));
  } catch (error) {
    console.error('[IPC get-products] Error fetching products:', error);
    return { error: error.message };
  }
});

ipcMain.handle('get-categories', async () => {
  if (!dbModels.CatProduct) {
    console.error('[IPC get-categories] CatProduct model is not available.');
    return { error: 'Category model not initialized on server.' };
  }
  try {
    const categories = await dbModels.CatProduct.findAll();
    return JSON.parse(JSON.stringify(categories));
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
    const date = new Date(dateParam + 'T00:00:00').toISOString().split('T')[0];
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
    const date = new Date(dateParam + 'T00:00:00');
    const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

    const startDateISO = startDate.toISOString().split('T')[0];
    const endDateISO = endDate.toISOString().split('T')[0];

    console.log(`[IPC get-daily-sales-by-month] Searching for sales between ${startDateISO} and ${endDateISO}`);

    const sales = await dbModels.DailySales.findAll({
      where: {
        date: { [ResolvedOp.between]: [startDateISO, endDateISO] } // Use ResolvedOp
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
        as: 'details'
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
        as: 'details',
        attributes: ['quantity', 'net_sales', 'av_price', 'discount_amount'],
        include: [{
          model: dbModels.Product,
          as: 'productInfo',
          attributes: ['name'],
        }],
        order: [[ { model: dbModels.Product, as: 'productInfo' }, 'name', 'ASC' ]]
      }],
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
        as: 'details',
        attributes: ['quantity', 'price'],
        include: [{
          model: dbModels.Product,
          as: 'productInfo',
          attributes: ['name']
        }]
      }]
    });

    if (ticket) {
      return { status: 200, ticket: JSON.parse(JSON.stringify(ticket)) };
    } else {
      console.log(`[IPC get-ticket-by-id] No ticket found for ID: ${ticketId}`);
      return { status: 404, message: `No ticket found for ID: ${ticketId}` };
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

  const transaction = await sequelizeInstance.transaction();

  try {
    console.log(`[IPC update-daily-sales-report] Updating sales report for date: ${dateString}`);
    const targetDate = new Date(dateString + 'T00:00:00.000Z');

    const start = new Date(targetDate);
    start.setUTCHours(6, 0, 0, 0);

    const end = new Date(targetDate);
    end.setUTCDate(end.getUTCDate() + 1);
    end.setUTCHours(5, 59, 59, 999);

    const startISO = start.toISOString();
    const endISO = end.toISOString();

    console.log(`[IPC update-daily-sales-report] Ticket data window: ${startISO} to ${endISO}`);

    const canceledTicketsData = await dbModels.Ticket.findOne({
      attributes: [
        [sequelizeInstance.Sequelize.fn('COUNT', sequelizeInstance.Sequelize.col('id')), 'canceled_count'],
      ],
      where: {
        date: { [ResolvedOp.between]: [startISO, endISO] }, // Use ResolvedOp
        canceled: true,
      },
      raw: true,
      transaction
    });

    const validTicketsData = await dbModels.Ticket.findOne({
      attributes: [
        [sequelizeInstance.Sequelize.fn('COUNT', sequelizeInstance.Sequelize.col('id')), 'ticket_count'],
        [sequelizeInstance.Sequelize.fn('SUM', sequelizeInstance.Sequelize.col('cash')), 'sum_cash'],
        [sequelizeInstance.Sequelize.fn('SUM', sequelizeInstance.Sequelize.col('card')), 'sum_card'],
      ],
      where: {
        date: { [ResolvedOp.between]: [startISO, endISO] }, // Use ResolvedOp
        canceled: false,
      },
      raw: true,
      transaction
    });

    const lineItems = await dbModels.TicketDetails.findAll({
      attributes: [
        'product_id',
        [sequelizeInstance.Sequelize.fn('SUM', sequelizeInstance.Sequelize.col('quantity')), 'sum_quantity'],
        [sequelizeInstance.Sequelize.fn('SUM', sequelizeInstance.Sequelize.col('extended_price')), 'sum_extended_price'],
        [sequelizeInstance.Sequelize.fn('SUM', sequelizeInstance.Sequelize.col('discount_amount')), 'sum_discount_amount'],
        [sequelizeInstance.Sequelize.literal('SUM(ticket_details.price * ticket_details.quantity)'), 'sum_total_sale'],
      ],
      include: [
        {
          model: dbModels.Ticket,
          as: 'ticketHeader',
          attributes: [],
          where: {
            date: { [ResolvedOp.between]: [startISO, endISO] }, // Use ResolvedOp
            canceled: false,
          }
        },
        {
          model: dbModels.Product,
          as: 'productInfo',
          attributes: ['id', 'name']
        }
      ],
      group: ['ticket_details.product_id', 'productInfo.id', 'productInfo.name'],
      raw: true,
      transaction
    });

    const netSales = lineItems.reduce((sum, item) => sum + parseFloat(item.sum_extended_price || 0), 0);
    const totalSales = lineItems.reduce((sum, item) => sum + parseFloat(item.sum_total_sale || 0), 0);
    const discountAmount = lineItems.reduce((sum, item) => sum + parseFloat(item.sum_discount_amount || 0), 0);

    const totalCash = parseFloat(validTicketsData?.sum_cash || 0);
    const totalCard = parseFloat(validTicketsData?.sum_card || 0);
    const ticketCount = parseInt(validTicketsData?.ticket_count || 0, 10);
    const canceledCount = parseInt(canceledTicketsData?.canceled_count || 0, 10);

    if (ticketCount === 0 && lineItems.length > 0) {
      console.warn("[IPC update-daily-sales-report] Line items found but ticket_count is zero. Check ticket query.");
    }

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
      product_id: item.product_id,
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
    if (transaction && transaction.finished !== 'commit' && transaction.finished !== 'rollback') { // Check transaction exists
      await transaction.rollback();
    }
    return { status: 500, error: error.message };
  }
});

ipcMain.handle('update-menu-from-import', async (event, menuData) => {
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
    await dbModels.Product.destroy({ where: {}, transaction, truncate: true });
    await dbModels.CatProduct.destroy({ where: {}, transaction, truncate: true });
    console.log('[IPC update-menu-from-import] Cleared existing products and categories.');

    for (const categoryData of menuData.categories) {
      if (!categoryData.name) continue;

      const newCategory = await dbModels.CatProduct.create({
        name: categoryData.name
      }, { transaction });
      console.log(`[IPC update-menu-from-import] Created category: ${newCategory.name}`);

      if (Array.isArray(categoryData.products) && categoryData.products.length > 0) {
        const productsToCreate = categoryData.products.map(productData => ({
          name: productData.name,
          price: parseFloat(productData.price || 0),
          image: productData.image || null,
          catproduct_id: newCategory.id,
          status_active: productData.status_active !== undefined ? productData.status_active : true,
        })).filter(p => p.name && p.price >= 0);

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
    if (transaction && transaction.finished !== 'commit' && transaction.finished !== 'rollback') { // Check transaction exists
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

  let transaction;
  try {
    transaction = await sequelizeInstance.transaction();
    console.log('[IPC import-update-menu] Attempting to decrypt and import menu...');
    const decryptedMenu = decryptImportedMenu(encryptedBase64Menu);

    if (!decryptedMenu || !Array.isArray(decryptedMenu.cats) || !Array.isArray(decryptedMenu.products)) {
      if (transaction) await transaction.rollback(); // Rollback if transaction was started
      return { status: 400, error: 'Decrypted menu data is not in the expected format.' };
    }

    const { cats, products } = decryptedMenu;

    if ((cats && cats.length > 0) || (products && products.length > 0)) {
      console.log(`[IPC import-update-menu] Processing ${cats.length} categories and ${products.length} products.`);

      if (cats.length > 0) {
        await dbModels.CatProduct.bulkCreate(
            cats.map(cat => ({
              id: cat.id,
              name: cat.nombre
            })),
            {
              updateOnDuplicate: ['name'],
              transaction
            }
        );
        console.log('[IPC import-update-menu] Categories processed.');
      }

      if (products.length > 0) {
        await dbModels.Product.bulkCreate(
            products.map(product => ({
              id: product.id,
              name: product.nombre,
              image: product.image,
              price: parseFloat(product.precio) || 0,
              catproduct_id: product.catproducto_id,
              status_active: product.status_active !== undefined ? product.status_active : true
            })),
            {
              updateOnDuplicate: ['name', 'image', 'price', 'catproduct_id', 'status_active'],
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
    return { status: 500, error: `Failed to import menu. ${error.message.includes('decryption failed') ? 'Decryption error.' : 'Server error.'}` };
  }
});

ipcMain.handle('delete-all-menu-data', async () => {
  if (!dbModels.CatProduct || !dbModels.Product) {
    console.error('[IPC delete-all-menu-data] CatProduct or Product model is not available.');
    return { status: 500, error: 'Required models not initialized on server.' };
  }

  let transaction;
  try {
    transaction = await sequelizeInstance.transaction();
    console.log('[IPC delete-all-menu-data] Attempting to delete all products and categories...');

    await dbModels.Product.destroy({ where: {}, transaction });
    console.log('[IPC delete-all-menu-data] All products deleted.');

    await dbModels.CatProduct.destroy({ where: {}, transaction });
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

// src/main.js
// ... other ipcMain.handle calls ...

ipcMain.handle('get-ticket-by-date', async (event, dateParam) => {
  if (!dbModels.Ticket) {
    console.error('[IPC get-ticket-by-date] Ticket model is not available.');
    return { status: 500, error: 'Ticket model not initialized on server.' };
  }
  try {
    // Assuming dateParam is in 'YYYY-MM-DD' format from the client
    const targetDate = new Date(dateParam + 'T00:00:00.000Z');

    const startOfDay = new Date(targetDate);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    console.log(`[IPC get-ticket-by-date] Searching for tickets between: ${startOfDay.toISOString()} and ${endOfDay.toISOString()}`);

    const tickets = await dbModels.Ticket.findAll({
      where: {
        date: {
          [ResolvedOp.gte]: startOfDay,
          [ResolvedOp.lte]: endOfDay,
        },
      },
      order: [['date', 'DESC']], // Optional: order by date
    });
    return JSON.parse(JSON.stringify(tickets)); // Return the array of tickets
  } catch (error) {
    console.error('[IPC get-ticket-by-date] Error fetching tickets by date:', error);
    return { status: 500, error: error.message }; // Or return an empty array or an error object
  }
});

// *****************
// Application code (Printing, Menus, etc.)
// *****************
async function openMenuDialog(browserWindow) {
  const result = await dialog.showOpenDialog(browserWindow, {
    properties: ['openFile'],
    filters: [{ name: 'json file', extensions: ['json'] }]
  });

  if (result.canceled || result.filePaths.length === 0) return;

  const [filePath] = result.filePaths;
  try {
    const content = await readFile(filePath, { encoding: 'utf-8' });
    if (browserWindow && !browserWindow.isDestroyed() && browserWindow.webContents && !browserWindow.webContents.isDestroyed()) {
      browserWindow.webContents.send('menu-file-opened', content);
    } else {
      console.warn('[Main Process] openMenuDialog: Target window or webContents no longer valid for sending menu-file-opened.');
    }
  } catch (error) {
    console.error(`[Main Process] Error reading menu file ${filePath}:`, error);
    dialog.showErrorBox("File Error", `Could not read the menu file: ${error.message}`);
  }
}

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
  {
    label: app.name,
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
  } else if (appMenu) {
    appMenu.submenu = [ // Fallback if submenu was somehow undefined
      { role: 'about' },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideOthers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ];
  }
}

const menu = Menu.buildFromTemplate(menuTemplate);
Menu.setApplicationMenu(menu);
