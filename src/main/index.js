// /src/main/index.js

// Add this line at the top to inform ESLint/linters about globals injected by the Vite plugin
/* global MAIN_WINDOW_VITE_DEV_SERVER_URL, MAIN_WINDOW_VITE_NAME MAIN_WINDOW_PRELOAD_VITE_NAME */

// ****************************************
// IMPORTS
// ****************************************
import { app, BrowserWindow, dialog, ipcMain, Menu } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

// Local module imports
import { initializeSequelize } from '../renderer/app/lib/db/config.js';
import { defineCatProduct } from '../renderer/app/lib/db/models/catProduct.js';
import { defineProduct } from '../renderer/app/lib/db/models/product.js';
import { defineDailySales } from '../renderer/app/lib/db/models/daily_sales.js';
import { defineDailySalesDetails } from '../renderer/app/lib/db/models/daily_salesDetails.js';
import { defineTicket } from '../renderer/app/lib/db/models/ticket.js';
import { defineTicketDetails } from '../renderer/app/lib/db/models/ticketDetails.js';
import { setupAssociations } from '../renderer/app/lib/db/associations.js';
import { initializeApi } from './api.js'; // Import the API initializer

// Robustly get Sequelize constructor and Op
import sequelizePackage from 'sequelize';
const { Sequelize: ResolvedSequelizeConstructor, Op: ResolvedOp } = sequelizePackage;

// Setup __filename and __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Setup require for CJS modules if needed (like electron-squirrel-startup)
const require = createRequire(import.meta.url);

// Runtime check for ResolvedSequelize
if (typeof ResolvedSequelizeConstructor !== 'function') {
  const errorMsg = '[Main Index] Critical: ResolvedSequelizeConstructor is not a constructor function.';
  console.error(errorMsg, 'Type:', typeof ResolvedSequelizeConstructor, 'Package keys:', Object.keys(sequelizePackage).join(', '));
  if (dialog && typeof dialog.showErrorBox === 'function') {
    dialog.showErrorBox("Initialization Error", "Failed to load database library (Sequelize). The application cannot start.");
  }
  if (app && typeof app.quit === 'function' && (typeof app.isQuitting !== 'function' || !app.isQuitting())) {
    app.quit();
  }
  throw new Error(errorMsg);
}

const started = require('electron-squirrel-startup');
if (started) {
  app.quit();
}

const isDev = !app.isPackaged;
const CRYPTO_KEY = process.env.CHIBIPOS_CRYPTO_KEY || 'your-default-super-secret-key-for-dev';

if (CRYPTO_KEY === 'your-default-super-secret-key-for-dev' && app.isPackaged) {
  console.warn('[Main Index] WARNING: Using default CRYPTO_KEY in production. This is insecure!');
}

let mainWindow;
let sequelizeInstance;
let dbModels = {}; // Models will be stored here

async function initializeDatabase() {
  try {
    const { sequelize, testConnection, dbPath } = initializeSequelize(app, ResolvedSequelizeConstructor);
    sequelizeInstance = sequelize;

    if (app.isPackaged) {
      const packagedDbPath = path.resolve(process.resourcesPath, 'app', 'database.sqlite');
      if (!fs.existsSync(dbPath) && fs.existsSync(packagedDbPath)) {
        console.log(`[Main Index] Database not found at ${dbPath}. Copying from ${packagedDbPath}...`);
        fs.copyFileSync(packagedDbPath, dbPath);
        console.log(`[Main Index] Database copied successfully to ${dbPath}.`);
      } else if (!fs.existsSync(packagedDbPath) && !fs.existsSync(dbPath)) {
        console.error(`[Main Index] Packaged database not found at ${packagedDbPath} and no existing DB at ${dbPath}. Cannot proceed.`);
        throw new Error("Application database is missing. Please reinstall or contact support.");
      } else if (fs.existsSync(dbPath)) {
        console.log(`[Main Index] Database found at ${dbPath}. No copy needed.`);
      } else if (!fs.existsSync(packagedDbPath)) {
        console.log(`[Main Index] Packaged database not found at ${packagedDbPath}. Assuming DB will be created or already exists at ${dbPath}.`);
      }
    }

    await testConnection();

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
    console.log('[Main Index] Database schema synchronized.');

    return true;
  } catch (error) {
    console.error('[Main Index] Error during database initialization process:', error);
    dialog.showErrorBox("Database Error", `Could not initialize the application database. ${error.message}`);
    try {
      if (app && typeof app.isQuitting === 'function' && !app.isQuitting()) {
        if (typeof app.quit === 'function') app.quit();
      } else if (app && typeof app.isQuitting !== 'function') {
        console.error("[Main Index] CRITICAL: Electron 'app.isQuitting' is not a function. Bundling issue suspected. Forcing quit.");
        if (typeof app.quit === 'function') app.quit(); else process.exit(1);
      }
    } catch (e) {
      console.error("[Main Index] Error trying to quit app after DB init failure:", e);
      process.exit(1);
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
      preload: path.join(__dirname, '..', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
      console.log(`[Main Index] Attempting to load DEV URL: ${MAIN_WINDOW_VITE_DEV_SERVER_URL}`);
      await mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL)
          .then(() => {
            console.log(`[Main Index] Successfully initiated DEV load for: ${MAIN_WINDOW_VITE_DEV_SERVER_URL}`);
          })
          .catch(err => {
            console.error(`[Main Index] FAILED to load DEV URL: ${MAIN_WINDOW_VITE_DEV_SERVER_URL}`, err);
            dialog.showErrorBox("Dev Server Error", `Could not connect to Vite dev server at ${MAIN_WINDOW_VITE_DEV_SERVER_URL}. Ensure it's running.`);
          });
    } else {
      console.error("[Main Index] MAIN_WINDOW_VITE_DEV_SERVER_URL is not defined in development. Cannot load renderer.");
      dialog.showErrorBox("Configuration Error", "Vite development server URL is missing.");
    }
  } else {
    // Path for production build (renderer is a sibling of the 'main' folder where index.js is)
    const indexPath = path.join(__dirname, '..', 'renderer', MAIN_WINDOW_VITE_NAME, 'index.html');
    console.log(`[Main Index] Attempting to load PROD URL: file://${indexPath}`);
    await mainWindow.loadFile(indexPath)
        .then(() => console.log(`[Main Index] Successfully loaded PROD file: ${indexPath}`))
        .catch(err => {
          console.error(`[Main Index] FAILED to load PROD file: ${indexPath}`, err);
          dialog.showErrorBox("Application Error", `Could not load the application. File not found: ${indexPath}`);
        });
  }

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL, isMainFrame) => {
    if (isMainFrame) {
      console.error(`[Main Index WebContents] Main frame did-fail-load:
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

// *****************
// MENUS
// *****************
// Moved openMenuDialog to api.js, but menu definition stays here
// as it uses app and mainWindow directly.
// The click handler will call a function that's now part of the API module if needed,
// or the API module's openMenuDialog can be imported and used.
// For simplicity, openMenuDialog is now part of api.js and called via IPC.
const menuTemplate = [
  {
    label: app.name,
    submenu: [
      {
        label: 'Importar carta',
        click: () => {
          // The 'open-menu-dialog' IPC event is handled in api.js
          // We need to send it from the focused window or main window
          let targetWindow = BrowserWindow.getFocusedWindow();
          if (!targetWindow && mainWindow && !mainWindow.isDestroyed()) {
            targetWindow = mainWindow;
          }
          if (targetWindow && !targetWindow.isDestroyed() && targetWindow.webContents && !targetWindow.webContents.isDestroyed()) {
            targetWindow.webContents.send('trigger-open-menu-dialog');
          } else {
            console.warn('[Main Index] Importar carta: No suitable window to trigger dialog for.');
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
  } else if (appMenu) { // Should not happen if menuTemplate is defined correctly
    appMenu.submenu = [
      { role: 'about' }, { type: 'separator' }, { role: 'services' },
      { type: 'separator' }, { role: 'hide' }, { role: 'hideOthers' },
      { role: 'unhide' }, { type: 'separator' }, { role: 'quit' }
    ];
  }
}


// App Lifecycle
app.whenReady().then(async () => {
  const dbInitialized = await initializeDatabase();
  if (!dbInitialized) {
    if (app && typeof app.quit === 'function' && (typeof app.isQuitting !== 'function' || !app.isQuitting())) {
      app.quit();
    } else if (app && typeof app.isQuitting !== 'function') {
      console.error("[Main Index] App ready but DB not initialized, and app.isQuitting is not a function. Forcing exit.");
      process.exit(1);
    }
    return;
  }

  await createWindow();

  // Initialize IPC handlers after database and window are ready
  initializeApi(ipcMain, dbModels, sequelizeInstance, ResolvedOp, dialog, CRYPTO_KEY, BrowserWindow, app);


  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);


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
