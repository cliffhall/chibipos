// /Users/cliffhall/Projects/chibipos/src/main/index.js
import { app, BrowserWindow, dialog, ipcMain, Menu, protocol } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

// Use unique names for your derived constants
const _currentFileUrl = import.meta.url;
const _currentFilename = fileURLToPath(_currentFileUrl);
const _currentDirname = path.dirname(_currentFilename);
const _nodeRequire = createRequire(_currentFileUrl);

// Local module imports
import { initializeSequelize } from '../renderer/app/lib/db/config.js';

// --- DB Model Definitions ---
import { defineCatProduct } from '../renderer/app/lib/db/models/catProduct.js';
import { defineProduct } from '../renderer/app/lib/db/models/product.js';
import { defineDailySales } from '../renderer/app/lib/db/models/daily_sales.js';
import { defineDailySalesDetails } from '../renderer/app/lib/db/models/daily_salesDetails.js';
import { defineTicket } from '../renderer/app/lib/db/models/ticket.js';
import { defineTicketDetails } from '../renderer/app/lib/db/models/ticketDetails.js';
import { setupAssociations } from '../renderer/app/lib/db/associations.js';
import { initializeApi } from './api.js';

// Robustly get Sequelize constructor and Op
import sequelizePackage from 'sequelize';
const { Sequelize: ResolvedSequelizeConstructor, Op: ResolvedOp } = sequelizePackage;

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

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (_nodeRequire('electron-squirrel-startup')) {
  app.quit();
}

// electron-vite exposes this environment variable
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
console.log('[Main Index DEBUG] Raw VITE_DEV_SERVER_URL from process.env:',VITE_DEV_SERVER_URL);

const isDev = !!VITE_DEV_SERVER_URL;
console.log(`[Main Index DEBUG] Parsed VITE_DEV_SERVER_URL: ${VITE_DEV_SERVER_URL}, isDev: ${isDev}`);

const CRYPTO_KEY = process.env.CHIBIPOS_CRYPTO_KEY || 'your-default-super-secret-key-for-dev';
if (CRYPTO_KEY === 'your-default-super-secret-key-for-dev' && !isDev) {
  console.warn('[Main Index] WARNING: Using default CRYPTO_KEY in production. This is insecure!');
}

let mainWindow;
let sequelizeInstance;
let dbModels = {};

async function initializeDatabase() {
  try {
    const { sequelize, testConnection, dbPath } = initializeSequelize(app, ResolvedSequelizeConstructor);
    sequelizeInstance = sequelize;

    if (!isDev) {
      const userDataDbPath = path.join(app.getPath('userData'), 'chibipos', 'database.sqlite');
      const resourcesDbPath = path.join(process.resourcesPath, 'database.sqlite');

      console.log(`[Main Index DB] UserData DB path: ${userDataDbPath}`);
      console.log(`[Main Index DB] Resources DB path: ${resourcesDbPath}`);

      const userDataDbDir = path.dirname(userDataDbPath);
      if (!fs.existsSync(userDataDbDir)) {
        fs.mkdirSync(userDataDbDir, { recursive: true });
        console.log(`[Main Index DB] Created userData directory: ${userDataDbDir}`);
      }

      if (!fs.existsSync(userDataDbPath) && fs.existsSync(resourcesDbPath)) {
        console.log(`[Main Index DB] Database not found at ${userDataDbPath}. Copying from ${resourcesDbPath}...`);
        fs.copyFileSync(resourcesDbPath, userDataDbPath);
        console.log(`[Main Index DB] Database copied successfully to ${userDataDbPath}.`);
      } else if (!fs.existsSync(resourcesDbPath) && !fs.existsSync(userDataDbPath)) {
        console.error(`[Main Index DB] Packaged database not found at ${resourcesDbPath} and no existing DB at ${userDataDbPath}. Cannot proceed.`);
        throw new Error("Application database is missing. Please reinstall or contact support.");
      } else if (fs.existsSync(userDataDbPath)) {
        console.log(`[Main Index DB] Database found at ${userDataDbPath}. No copy needed from resources.`);
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
    backgroundColor: "#191d22",
    webPreferences: {
      preload: path.join(_currentDirname, '../preload/preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev && VITE_DEV_SERVER_URL) {
    console.log(`[Main Index] Attempting to load DEV URL: ${VITE_DEV_SERVER_URL}`);
    await mainWindow.loadURL(VITE_DEV_SERVER_URL)
        .then(() => console.log(`[Main Index] Successfully initiated DEV load for: ${VITE_DEV_SERVER_URL}`))
        .catch(err => {
          console.error(`[Main Index] FAILED to load DEV URL: ${VITE_DEV_SERVER_URL}`, err);
          dialog.showErrorBox("Dev Server Error", `Could not connect to Vite dev server at ${VITE_DEV_SERVER_URL}. Ensure it's running.`);
        });
  } else {
    const indexPath = path.join(_currentDirname, '../renderer/index.html');
    const prodUrl = `file://${indexPath}`;
    console.log(`[Main Index] Attempting to load PROD URL: ${prodUrl}`);
    await mainWindow.loadURL(prodUrl)
        .then(() => console.log(`[Main Index] Successfully loaded PROD URL: ${prodUrl}`))
        .catch(err => {
          console.error(`[Main Index] FAILED to load PROD URL: ${prodUrl}`, err);
          dialog.showErrorBox("Application Error", `Could not load the application. URL: ${prodUrl}`);
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

const menuTemplate = [
  {
    label: app.name,
    submenu: [
      {
        label: 'Importar carta',
        click: () => {
          let targetWindow = BrowserWindow.getFocusedWindow() || mainWindow;
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
  }
}

// Single App Lifecycle block
app.whenReady().then(async () => {
  console.log('[Main Index] App is ready and initializing...');

  // --- REGISTER CUSTOM PROTOCOL FOR IMAGES ---
  if (protocol && typeof protocol.registerFileProtocol === 'function') {
    console.log('[Main Index] Attempting to register "appimg" protocol...');
    protocol.registerFileProtocol('appimg', (request, callback) => {
      try {
        const urlPath = request.url.slice('appimg://'.length);
        let imageFilePath;

        if (app.isPackaged) {
          imageFilePath = path.join(process.resourcesPath, 'app.asar', 'renderer', 'img', urlPath);
        } else {
          // DEVELOPMENT MODE:
          // _currentDirname is .../dist/electron/main when running electron-vite dev
          // We need to go up three levels to reach the project root, then to dist_svelte
          imageFilePath = path.join(_currentDirname, '..', '..', '..', 'dist_svelte', 'build_output', 'img', urlPath);
        }
        imageFilePath = path.normalize(imageFilePath);
        console.log(`[appimg protocol] Request for '${request.url}', resolved to: '${imageFilePath}'`);

        // Check if file exists before calling back
        if (fs.existsSync(imageFilePath)) {
          callback({ path: imageFilePath });
        } else {
          console.error(`[appimg protocol] File NOT FOUND at resolved path: '${imageFilePath}' for request '${request.url}'`);
          callback({ error: -6 }); // net::ERR_FILE_NOT_FOUND
        }

      } catch (error) {
        console.error(`[appimg protocol] Error processing request ${request.url}:`, error);
        callback({ error: -6 }); // net::ERR_FILE_NOT_FOUND
      }
    });
    console.log('[Main Index] Custom protocol "appimg" registered.');
  } else {
    console.error('[Main Index] CRITICAL: Electron `protocol` module or `registerFileProtocol` is not available!');
    // This is a critical failure if your images rely on this protocol.
    dialog.showErrorBox("Application Error", "Failed to set up image loading protocols. The application cannot continue.");
    app.quit();
    return; // Prevent further execution
  }
  // --- END CUSTOM PROTOCOL ---

  const dbInitialized = await initializeDatabase();
  if (!dbInitialized) {
    console.error('[Main Index] Database initialization failed. Quitting app.');
    // Quit logic is already in initializeDatabase, but an explicit return is good.
    return;
  }
  console.log('[Main Index] Database initialized successfully.');

  console.log('[Main Index] Initializing API handlers...');
  initializeApi(ipcMain, dbModels, sequelizeInstance, ResolvedOp, dialog, CRYPTO_KEY, BrowserWindow, app);
  console.log('[Main Index] API handlers initialized.');

  console.log('[Main Index] Creating main window...');
  await createWindow();
  console.log('[Main Index] Main window created.');

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
  console.log('[Main Index] Application menu set.');

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      console.log('[Main Index] App activated and no windows open, creating window...');
      createWindow();
    }
  });
}).catch(initializationError => {
  // Catch any unhandled errors from the app.whenReady() promise chain
  console.error('[Main Index] Unhandled error during app initialization:', initializationError);
  dialog.showErrorBox("Critical Application Error", `A critical error occurred during startup: ${initializationError.message}. The application will now close.`);
  if (app && typeof app.quit === 'function') {
    app.quit();
  }
});

app.on('window-all-closed', () => {
  console.log('[Main Index] Event: window-all-closed. All windows are closed.');
  console.log('[Main Index] Calling app.quit() now.');
  app.quit();
});
