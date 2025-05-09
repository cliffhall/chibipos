// /src/main/api.js

import { readFile } from 'fs/promises';
import CryptoJS from 'crypto-js';

// Printing function imports - adjust path if printing folder is not a sibling of 'main'
// Assuming src/printing/ structure
import printTicket from './printing/printTicket.js';
import printKitchen from './printing/printKitchen.js';
import printSale from './printing/printSale.js';


let ipcMainInstance;
let dbModelsInstance;
let sequelizeInstanceRef;
let resolvedOpRef;
let dialogInstance;
let cryptoKeyInstance;
let BrowserWindowInstance; // To get BrowserWindow.fromWebContents
let appInstance; // For app.getName() or other app properties if needed by API

// Helper function for encryption (specific to this API module)
function encryptDataForApi(data) {
  const jsonString = JSON.stringify(data);
  return CryptoJS.AES.encrypt(jsonString, cryptoKeyInstance).toString();
}

// Helper function for decryption (specific to this API module)
function decryptImportedMenuForApi(encryptedBase64Menu) {
  try {
    const ciphertext = Buffer.from(encryptedBase64Menu, 'base64').toString('latin1');
    const bytes = CryptoJS.AES.decrypt(ciphertext, cryptoKeyInstance);
    const decryptedJson = bytes.toString(CryptoJS.enc.Utf8);

    if (!decryptedJson) {
      console.error('[API Module] Decryption resulted in empty data.');
      throw new Error('Menu decryption failed: output is empty. Check key or data format.');
    }
    return JSON.parse(decryptedJson);
  } catch (error) {
    console.error('[API Module] Error during menu decryption process:', error);
    throw new Error(`Menu decryption failed: ${error.message}`);
  }
}


async function openMenuDialog(browserWindow) {
  if (!browserWindow || browserWindow.isDestroyed()) {
    console.warn('[API Module] openMenuDialog: Provided browserWindow is invalid or destroyed.');
    return;
  }
  const result = await dialogInstance.showOpenDialog(browserWindow, {
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
      console.warn('[API Module] openMenuDialog: Target window or webContents no longer valid for sending menu-file-opened.');
    }
  } catch (error) {
    console.error(`[API Module] Error reading menu file ${filePath}:`, error);
    dialogInstance.showErrorBox("File Error", `Could not read the menu file: ${error.message}`);
  }
}


export function initializeApi(ipcMain, models, sequelize, Op, dialog, cryptoKey, electronBrowserWindow, electronApp) {
  ipcMainInstance = ipcMain;
  dbModelsInstance = models;
  sequelizeInstanceRef = sequelize;
  resolvedOpRef = Op;
  dialogInstance = dialog;
  cryptoKeyInstance = cryptoKey;
  BrowserWindowInstance = electronBrowserWindow;
  appInstance = electronApp;

  // *****************
  // IPC Handlers for Database
  // *****************

  ipcMainInstance.handle('get-categories', async () => {
    if (!dbModelsInstance.CatProduct) {
      console.error('[API get-categories] CatProduct model is not available.');
      return { error: 'Category model not initialized on server.' };
    }
    try {
      // console.log('[API get-categories] Fetching categories...'); // Logging can be verbose
      const categoriesInstances = await dbModelsInstance.CatProduct.findAll({
        attributes: ['id', 'name'],
        order: [['name', 'ASC']]
      });
      const plainCategories = categoriesInstances.map((cat) =>
          cat.get({ plain: true })
      );
      return plainCategories;
    } catch (error) {
      console.error('[API Module] Error fetching categories:', error);
      return { error: error.message || 'Failed to fetch categories' };
    }
  });

  ipcMainInstance.handle('get-products', async () => {
    if (!dbModelsInstance.Product) {
      console.error('[API get-products] Product model is not available.');
      return { error: 'Product model not initialized on server.' };
    }
    try {
      // console.log('[API get-products] Fetching products...');
      const productInstances = await dbModelsInstance.Product.findAll({
        attributes: [
          'id',
          'name',
          'image',
          'price',
          'catproduct_id',
          'status_active'
        ],
        order: [['name', 'ASC']]
      });
      const plainProducts = productInstances.map((prod) =>
          prod.get({ plain: true })
      );
      return plainProducts;
    } catch (error) {
      console.error('[API Module] Error fetching products:', error);
      return { error: error.message || 'Failed to fetch products' };
    }
  });

  ipcMainInstance.handle('get-daily-sale-by-date', async (event, dateParam) => {
    if (!dbModelsInstance.DailySales) {
      console.error('[API get-daily-sale-by-date] DailySales model is not available.');
      return { status: 500, error: 'DailySales model not initialized on server.' };
    }
    try {
      const date = new Date(dateParam + 'T00:00:00').toISOString().split('T')[0];
      // console.log(`[API get-daily-sale-by-date] Searching for sale on date: ${date}`);
      const sale = await dbModelsInstance.DailySales.findOne({
        where: { date },
      });
      if (sale) {
        return { status: 200, sale: JSON.parse(JSON.stringify(sale)) };
      } else {
        return { status: 204, message: `No sale found for date: ${dateParam}` };
      }
    } catch (error) {
      console.error('[API Module] Error fetching daily sale by date:', error);
      return { status: 500, error: error.message };
    }
  });

  ipcMainInstance.handle('get-daily-sales-by-month', async (event, dateParam) => {
    if (!dbModelsInstance.DailySales) {
      console.error('[API get-daily-sales-by-month] DailySales model is not available.');
      return { status: 500, error: 'DailySales model not initialized on server.' };
    }
    try {
      const date = new Date(dateParam + 'T00:00:00');
      const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
      const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
      const startDateISO = startDate.toISOString().split('T')[0];
      const endDateISO = endDate.toISOString().split('T')[0];
      // console.log(`[API get-daily-sales-by-month] Searching sales: ${startDateISO} to ${endDateISO}`);
      const sales = await dbModelsInstance.DailySales.findAll({
        where: {
          date: { [resolvedOpRef.between]: [startDateISO, endDateISO] }
        },
        order: [['date', 'DESC']]
      });
      return { sales: JSON.parse(JSON.stringify(sales)) };
    } catch (error) {
      console.error('[API Module] Error fetching sales by month:', error);
      return { status: 500, error: error.message };
    }
  });

  ipcMainInstance.handle('export-daily-sale-by-id', async (event, id) => {
    if (!dbModelsInstance.DailySales || !dbModelsInstance.DailySalesDetails) {
      console.error('[API export-daily-sale-by-id] Models not available.');
      return { status: 500, error: 'Required models not initialized.' };
    }
    try {
      // console.log(`[API export-daily-sale-by-id] Exporting sale ID: ${id}`);
      const sale = await dbModelsInstance.DailySales.findByPk(id, {
        include: [{ model: dbModelsInstance.DailySalesDetails, as: 'details' }]
      });
      if (sale) {
        const encryptedSale = encryptDataForApi(sale); // Use API specific helper
        return { status: 200, encryptedSale };
      } else {
        return { status: 204, message: `No sale found for ID: ${id}` };
      }
    } catch (error) {
      console.error('[API Module] Error exporting daily sale:', error);
      return { status: 500, error: error.message };
    }
  });

  ipcMainInstance.handle('get-daily-sale-report-by-id', async (event, id) => {
    if (!dbModelsInstance.DailySales || !dbModelsInstance.DailySalesDetails || !dbModelsInstance.Product) {
      console.error('[API get-daily-sale-report-by-id] Models not available.');
      return { status: 500, error: 'Required models not initialized.' };
    }
    try {
      // console.log(`[API get-daily-sale-report-by-id] Fetching report ID: ${id}`);
      const saleReport = await dbModelsInstance.DailySales.findByPk(id, {
        attributes: { exclude: ['createdAt', 'updatedAt'] },
        include: [{
          model: dbModelsInstance.DailySalesDetails,
          as: 'details',
          attributes: ['quantity', 'net_sales', 'av_price', 'discount_amount'],
          include: [{ model: dbModelsInstance.Product, as: 'productInfo', attributes: ['name'] }],
        }],
        order: [[{ model: dbModelsInstance.DailySalesDetails, as: 'details' }, { model: dbModelsInstance.Product, as: 'productInfo' }, 'name', 'ASC']]
      });
      if (saleReport) {
        return { status: 200, report: JSON.parse(JSON.stringify(saleReport)) };
      } else {
        return { status: 204, message: `No sale report found for ID: ${id}` };
      }
    } catch (error) {
      console.error('[API Module] Error fetching daily sale report:', error);
      return { status: 500, error: error.message };
    }
  });

  ipcMainInstance.handle('get-ticket-by-id', async (event, ticketId) => {
    if (!dbModelsInstance.Ticket || !dbModelsInstance.TicketDetails || !dbModelsInstance.Product) {
      console.error('[API get-ticket-by-id] Models not available.');
      return { status: 500, error: 'Required models not initialized.' };
    }
    try {
      // console.log(`[API get-ticket-by-id] Fetching ticket ID: ${ticketId}`);
      const ticket = await dbModelsInstance.Ticket.findByPk(ticketId, {
        attributes: { exclude: ['createdAt', 'updatedAt'] },
        include: [{
          model: dbModelsInstance.TicketDetails,
          as: 'details',
          attributes: ['quantity', 'price'],
          include: [{ model: dbModelsInstance.Product, as: 'productInfo', attributes: ['name'] }]
        }]
      });
      if (ticket) {
        return { status: 200, ticket: JSON.parse(JSON.stringify(ticket)) };
      } else {
        return { status: 404, message: `No ticket found for ID: ${ticketId}` };
      }
    } catch (error) {
      console.error('[API Module] Error fetching ticket by ID:', error);
      return { status: 500, error: error.message };
    }
  });

  ipcMainInstance.handle('cancel-ticket-by-id', async (event, ticketId) => {
    if (!dbModelsInstance.Ticket) {
      console.error('[API cancel-ticket-by-id] Ticket model not available.');
      return { status: 500, error: 'Ticket model not initialized.' };
    }
    try {
      // console.log(`[API cancel-ticket-by-id] Canceling ticket ID: ${ticketId}`);
      const ticket = await dbModelsInstance.Ticket.findByPk(ticketId);
      if (!ticket) {
        return { status: 404, error: `Ticket with ID ${ticketId} not found.` };
      }
      if (ticket.canceled) {
        return { status: 200, success: true, message: 'Ticket already canceled.', ticket: JSON.parse(JSON.stringify(ticket)) };
      }
      ticket.canceled = true;
      await ticket.save();
      return { status: 200, success: true, ticket: JSON.parse(JSON.stringify(ticket)) };
    } catch (error) {
      console.error(`[API Module] Error canceling ticket ID ${ticketId}:`, error);
      return { status: 500, error: error.message };
    }
  });

  ipcMainInstance.handle('update-daily-sales-report', async (event, dateString) => {
    if (!dbModelsInstance.Ticket || !dbModelsInstance.TicketDetails || !dbModelsInstance.Product ||
        !dbModelsInstance.DailySales || !dbModelsInstance.DailySalesDetails || !sequelizeInstanceRef) {
      console.error('[API update-daily-sales-report] Models or Sequelize instance not available.');
      return { status: 500, error: 'Required resources not initialized.' };
    }
    const transaction = await sequelizeInstanceRef.transaction();
    try {
      // console.log(`[API update-daily-sales-report] Updating report for date: ${dateString}`);
      const targetDate = new Date(dateString + 'T00:00:00.000Z');
      const start = new Date(targetDate);
      start.setUTCHours(6, 0, 0, 0);
      const end = new Date(targetDate);
      end.setUTCDate(end.getUTCDate() + 1);
      end.setUTCHours(5, 59, 59, 999);
      const startISO = start.toISOString();
      const endISO = end.toISOString();

      const canceledTicketsData = await dbModelsInstance.Ticket.findOne({
        attributes: [[sequelizeInstanceRef.Sequelize.fn('COUNT', sequelizeInstanceRef.Sequelize.col('id')), 'canceled_count']],
        where: { date: { [resolvedOpRef.between]: [startISO, endISO] }, canceled: true },
        raw: true, transaction
      });
      const validTicketsData = await dbModelsInstance.Ticket.findOne({
        attributes: [
          [sequelizeInstanceRef.Sequelize.fn('COUNT', sequelizeInstanceRef.Sequelize.col('id')), 'ticket_count'],
          [sequelizeInstanceRef.Sequelize.fn('SUM', sequelizeInstanceRef.Sequelize.col('cash')), 'sum_cash'],
          [sequelizeInstanceRef.Sequelize.fn('SUM', sequelizeInstanceRef.Sequelize.col('card')), 'sum_card'],
        ],
        where: { date: { [resolvedOpRef.between]: [startISO, endISO] }, canceled: false },
        raw: true, transaction
      });
      const lineItems = await dbModelsInstance.TicketDetails.findAll({
        attributes: [
          'product_id',
          [sequelizeInstanceRef.Sequelize.fn('SUM', sequelizeInstanceRef.Sequelize.col('quantity')), 'sum_quantity'],
          [sequelizeInstanceRef.Sequelize.fn('SUM', sequelizeInstanceRef.Sequelize.col('extended_price')), 'sum_extended_price'],
          [sequelizeInstanceRef.Sequelize.fn('SUM', sequelizeInstanceRef.Sequelize.col('ticket_details.discount_amount')), 'sum_discount_amount'],
          [sequelizeInstanceRef.Sequelize.literal('SUM(ticket_details.price * ticket_details.quantity)'), 'sum_total_sale_gross'],
        ],
        include: [
          { model: dbModelsInstance.Ticket, as: 'ticketHeader', attributes: [], where: { date: { [resolvedOpRef.between]: [startISO, endISO] }, canceled: false }},
          { model: dbModelsInstance.Product, as: 'productInfo', attributes: ['id', 'name'] }
        ],
        group: ['ticket_details.product_id', 'productInfo.id', 'productInfo.name'], raw: true, transaction
      });

      const netSales = lineItems.reduce((sum, item) => sum + parseFloat(item.sum_extended_price || 0), 0);
      const totalSalesGross = lineItems.reduce((sum, item) => sum + parseFloat(item.sum_total_sale_gross || 0), 0);
      const discountAmountItems = lineItems.reduce((sum, item) => sum + parseFloat(item.sum_discount_amount || 0), 0);
      const totalCash = parseFloat(validTicketsData?.sum_cash || 0);
      const totalCard = parseFloat(validTicketsData?.sum_card || 0);
      const ticketCount = parseInt(validTicketsData?.ticket_count || 0, 10);
      const canceledCount = parseInt(canceledTicketsData?.canceled_count || 0, 10);

      const reportDateForDB = new Date(dateString + 'T00:00:00').toISOString().split('T')[0];
      await dbModelsInstance.DailySales.destroy({ where: { date: reportDateForDB }, transaction });

      const dailySale = await dbModelsInstance.DailySales.create({
        date: reportDateForDB, net_sales: netSales, total_sales: totalSalesGross, cash: totalCash, card: totalCard,
        ticket_count: ticketCount, canceled_count: canceledCount,
        average_ticket: ticketCount > 0 ? Math.round(netSales / ticketCount) : 0,
        discount_amount: discountAmountItems,
      }, { transaction });

      const saleDetails = lineItems.map(item => ({
        date: reportDateForDB, daily_sales_id: dailySale.id, product_id: item.product_id,
        quantity: parseInt(item.sum_quantity, 10), net_sales: parseFloat(item.sum_extended_price),
        av_price: parseInt(item.sum_quantity, 10) > 0 ? Math.round(parseFloat(item.sum_extended_price) / parseInt(item.sum_quantity, 10)) : 0,
        discount_amount: parseFloat(item.sum_discount_amount)
      }));
      if (saleDetails.length > 0) {
        await dbModelsInstance.DailySalesDetails.bulkCreate(saleDetails, { transaction });
      }
      await transaction.commit();
      return { status: 200, dailySale: JSON.parse(JSON.stringify(dailySale)) };
    } catch (error) {
      console.error('[API Module] Error processing sales report:', error);
      if (transaction && transaction.finished !== 'commit' && transaction.finished !== 'rollback') {
        await transaction.rollback();
      }
      return { status: 500, error: error.message };
    }
  });

  ipcMainInstance.handle('update-menu-from-import', async (event, menuData) => {
    if (!dbModelsInstance.CatProduct || !dbModelsInstance.Product || !sequelizeInstanceRef) {
      console.error('[API update-menu-from-import] Resources not available.');
      return { status: 500, error: 'Required resources not initialized.' };
    }
    if (!menuData || !Array.isArray(menuData.categories)) {
      return { status: 400, error: 'Invalid menu data provided.' };
    }
    const transaction = await sequelizeInstanceRef.transaction();
    try {
      await dbModelsInstance.Product.destroy({ where: {}, transaction });
      await dbModelsInstance.CatProduct.destroy({ where: {}, transaction });
      for (const categoryData of menuData.categories) {
        if (!categoryData.name) continue;
        const newCategory = await dbModelsInstance.CatProduct.create({ name: categoryData.name }, { transaction });
        if (Array.isArray(categoryData.products) && categoryData.products.length > 0) {
          const productsToCreate = categoryData.products.map(productData => ({
            name: productData.name, price: parseFloat(productData.price || 0), image: productData.image || null,
            catproduct_id: newCategory.id,
            status_active: productData.status_active !== undefined ? productData.status_active : true,
          })).filter(p => p.name && p.price >= 0);
          if (productsToCreate.length > 0) {
            await dbModelsInstance.Product.bulkCreate(productsToCreate, { transaction });
          }
        }
      }
      await transaction.commit();
      return { status: 200, success: true, message: 'Menu updated successfully.' };
    } catch (error) {
      console.error('[API Module] Error updating menu:', error);
      if (transaction && transaction.finished !== 'commit' && transaction.finished !== 'rollback') {
        await transaction.rollback();
      }
      return { status: 500, error: error.message };
    }
  });

  ipcMainInstance.handle('import-update-menu', async (event, encryptedBase64Menu) => {
    if (!dbModelsInstance.CatProduct || !dbModelsInstance.Product || !sequelizeInstanceRef) {
      console.error('[API import-update-menu] Resources not available.');
      return { status: 500, error: 'Required resources not initialized.' };
    }
    if (!encryptedBase64Menu) {
      return { status: 400, error: 'No encrypted menu data provided.' };
    }
    let transaction;
    try {
      transaction = await sequelizeInstanceRef.transaction();
      const decryptedMenu = decryptImportedMenuForApi(encryptedBase64Menu); // Use API specific helper
      if (!decryptedMenu || !Array.isArray(decryptedMenu.cats) || !Array.isArray(decryptedMenu.products)) {
        if (transaction) await transaction.rollback();
        return { status: 400, error: 'Decrypted menu data not in expected format.' };
      }
      const { cats, products } = decryptedMenu;
      if ((cats && cats.length > 0) || (products && products.length > 0)) {
        if (cats.length > 0) {
          await dbModelsInstance.CatProduct.bulkCreate(
              cats.map(cat => ({ id: cat.id, name: cat.nombre || cat.name })),
              { updateOnDuplicate: ['name'], transaction }
          );
        }
        if (products.length > 0) {
          await dbModelsInstance.Product.bulkCreate(
              products.map(product => ({
                id: product.id, name: product.nombre || product.name, image: product.image,
                price: parseFloat(product.precio || product.price || 0),
                catproduct_id: product.catproducto_id || product.catproduct_id,
                status_active: product.status_active !== undefined ? product.status_active : true
              })),
              { updateOnDuplicate: ['name', 'image', 'price', 'catproduct_id', 'status_active'], transaction }
          );
        }
      }
      await transaction.commit();
      return { status: 200, success: true, message: 'Menu updated successfully.' };
    } catch (error) {
      console.error('[API Module] Error processing menu import:', error);
      if (transaction && transaction.finished !== 'commit' && transaction.finished !== 'rollback') {
        await transaction.rollback();
      }
      return { status: 500, error: `Failed to import menu. ${error.message.includes('decryption failed') ? 'Decryption error.' : 'Server error.'}` };
    }
  });

  ipcMainInstance.handle('delete-all-menu-data', async () => {
    if (!dbModelsInstance.CatProduct || !dbModelsInstance.Product || !sequelizeInstanceRef) {
      console.error('[API delete-all-menu-data] Resources not available.');
      return { status: 500, error: 'Required resources not initialized.' };
    }
    let transaction;
    try {
      transaction = await sequelizeInstanceRef.transaction();
      await dbModelsInstance.Product.destroy({ where: {}, transaction });
      await dbModelsInstance.CatProduct.destroy({ where: {}, transaction });
      await transaction.commit();
      return { status: 200, success: true, message: 'All menu data has been deleted.' };
    } catch (error) {
      console.error('[API Module] Error deleting menu data:', error);
      if (transaction && transaction.finished !== 'commit' && transaction.finished !== 'rollback') {
        await transaction.rollback();
      }
      return { status: 500, error: 'Failed to delete menu data.' };
    }
  });

  ipcMainInstance.handle('get-ticket-by-date', async (event, dateParam) => {
    if (!dbModelsInstance.Ticket) {
      console.error('[API get-ticket-by-date] Ticket model not available.');
      return { status: 500, error: 'Ticket model not initialized.' };
    }
    try {
      const targetDate = new Date(dateParam + 'T00:00:00.000Z');
      const startOfDay = new Date(targetDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setUTCHours(23, 59, 59, 999);
      // console.log(`[API get-ticket-by-date] Searching: ${startOfDay.toISOString()} to ${endOfDay.toISOString()}`);
      const tickets = await dbModelsInstance.Ticket.findAll({
        where: { date: { [resolvedOpRef.gte]: startOfDay, [resolvedOpRef.lte]: endOfDay } },
        order: [['date', 'DESC']],
      });
      return JSON.parse(JSON.stringify(tickets));
    } catch (error) {
      console.error('[API Module] Error fetching tickets by date:', error);
      return { status: 500, error: error.message };
    }
  });

  // This handles the event sent from the menu item in index.js
  ipcMainInstance.on('trigger-open-menu-dialog-from-renderer', (event) => {
    const browserWindow = BrowserWindowInstance.fromWebContents(event.sender);
    if (!browserWindow) {
      console.warn('[API Module] open-menu-dialog: Could not find BrowserWindow from sender.');
      return;
    }
    openMenuDialog(browserWindow);
  });
  // This is the original one, can be kept if renderer directly calls 'open-menu-dialog'
  ipcMainInstance.on('open-menu-dialog', (event) => {
    const browserWindow = BrowserWindowInstance.fromWebContents(event.sender);
    if (!browserWindow) {
      console.warn('[API Module] open-menu-dialog: Could not find BrowserWindow from sender.');
      return;
    }
    openMenuDialog(browserWindow);
  });


  // *****************
  // PRINTING IPC Handlers
  // *****************
  ipcMainInstance.handle('print-ticket', async (e, data) => {
    // console.log('[API Module] Handling print-ticket IPC call.');
    return printTicket(e, data); // Assumes printTicket is self-contained or gets what it needs
  });

  ipcMainInstance.handle('print-kitchen', async (e, data) => {
    // console.log('[API Module] Handling print-kitchen IPC call.');
    return printKitchen(e, data);
  });

  ipcMainInstance.handle('print-sale', async (e, data) => {
    // console.log('[API Module] Handling print-sale IPC call.');
    return printSale(e, data);
  });
}
