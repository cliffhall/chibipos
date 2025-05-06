// /Users/cliffhall/Projects/chibipos/src/main.js

// Add this line at the top to inform ESLint/linters about globals injected by the Vite plugin
/* global MAIN_WINDOW_VITE_DEV_SERVER_URL, MAIN_WINDOW_VITE_NAME */

// ****************************************
// IMPORTS
// ****************************************
import { app, BrowserWindow, dialog, ipcMain, Menu } from 'electron';
import { readFile } from 'fs/promises';
import path from 'node:path'; // Use 'node:path' for clarity
import started from 'electron-squirrel-startup';
// extra
import { spawn } from 'child_process';
import waitOn from 'wait-on';
// import http from 'http'; // http module was imported but not used directly
import fs from 'fs';
// print functions
import printTicket from './printing/printTicket.js';
import printKitchen from './printing/printKitchen.js';
import printSale from './printing/printSale.js';
// ****************************************


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

// Server config
let serverProcess;
const PORT = 3030; // This is for your SvelteKit Node adapter in production

// Determine if in development mode
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// Svelte-kit server (for production with adapter-node)
function startServer() {
  if (isDev || MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    console.log('[Main Process] Development mode or Vite dev server active, not starting separate SvelteKit server.');
    return;
  }

  // Adjust this path if your SvelteKit adapter-node output is different
  // or if your forge.config.js copies it to a different location within resources.
  // Common locations might be 'app/frontend-build/index.js' or 'app/build/index.js'
  // depending on your SvelteKit's svelte.config.js `out` dir for adapter-node
  // and how Electron Forge packages `extraResources`.
  // Assuming your `frontend/package.json` `build` script outputs to `frontend/build`
  // and your `forge.config.js` has `extraResources: ['frontend/build']`
  const serverBuildDir = 'frontend-build'; // Or 'build', or whatever your SvelteKit adapter-node output dir is named
  const serverPath = path.join(process.resourcesPath, 'app', serverBuildDir, 'index.js');

  console.log(`[Main Process] Production SvelteKit server path: ${serverPath}`);

  if (!fs.existsSync(serverPath)) {
    console.error(`[Main Process] SvelteKit server entry point not found at: ${serverPath}. Ensure your SvelteKit build (adapter-node) output is correctly packaged and the path is correct.`);
    dialog.showErrorBox("Application Error", `Failed to start the application server. Please contact support. Missing server entry: ${serverPath}`);
    app.quit();
    return;
  }

  serverProcess = spawn('node', [serverPath], {
    stdio: 'inherit',
    env: { ...process.env, PORT: PORT.toString(), NODE_ENV: 'production' }
  });

  serverProcess.on('error', (err) => {
    console.error('[Main Process] Failed to start SvelteKit server process:', err);
    dialog.showErrorBox("Application Error", "Failed to start the application server. Please check logs.");
    app.quit();
  });
}

async function waitOnServer(port, timeout = 20000) { // Increased timeout slightly
  console.log(`[Main Process] Waiting for server on port ${port} for up to ${timeout / 1000}s...`);
  try {
    await waitOn({
      resources: [`http-get://localhost:${port}`],
      timeout: timeout,
      headers: {
        accept: 'text/html', // More specific header
      },
    });
    console.log(`[Main Process] Server on port ${port} is ready.`);
  } catch (err) {
    console.error(`[Main Process] Error waiting for server on port ${port}:`, err);
    throw err; // Re-throw to be caught by the caller
  }
}


let mainWindow;
async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1180,
    height: 713,
    resizable: isDev, // Allow resizing in dev for easier debugging
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // Ensure this path is correct after build
      contextIsolation: true, // Recommended for security
      nodeIntegration: false, // Recommended for security
    },
  });

  // --- START: Integrated Logging ---
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    // Development: Load from Vite dev server
    console.log(`[Main Process] Attempting to load DEV URL: ${MAIN_WINDOW_VITE_DEV_SERVER_URL}`);
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL)
        .then(() => {
          console.log(`[Main Process] Successfully initiated DEV load for: ${MAIN_WINDOW_VITE_DEV_SERVER_URL}`);
        })
        .catch(err => {
          console.error(`[Main Process] FAILED to load DEV URL: ${MAIN_WINDOW_VITE_DEV_SERVER_URL}`, err);
        });
  } else {
    // Production: Load from SvelteKit Node server
    console.log('[Main Process] Starting SvelteKit Node server for production.');
    startServer();
    try {
      await waitOnServer(PORT);
      const prodUrl = `http://localhost:${PORT}`;
      console.log(`[Main Process] SvelteKit Node server ready. Attempting to load PROD URL: ${prodUrl}`);
      mainWindow.loadURL(prodUrl)
          .then(() => {
            console.log(`[Main Process] Successfully initiated PROD load for: ${prodUrl}`);
          })
          .catch(err => {
            console.error(`[Main Process] FAILED to load PROD URL: ${prodUrl}`, err);
            dialog.showErrorBox("Application Error", `Could not connect to the application server at ${prodUrl}. Please try restarting.`);
          });
    } catch (error) {
      console.error("[Main Process] Failed to start or connect to SvelteKit Node server:", error);
      dialog.showErrorBox("Application Error", "Could not connect to the application server. Please try restarting.");
      // Optionally, load a fallback error page or quit
      // mainWindow.loadFile(path.join(__dirname, 'error.html')); // You'd need to create error.html
      // app.quit();
    }
  }

  // Listen for webContents load failures
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL, isMainFrame) => {
    if (isMainFrame) { // Log only if it's the main frame that failed to load
      console.error(`[Main Process WebContents] Main frame did-fail-load:
        URL: ${validatedURL}
        Error Code: ${errorCode}
        Description: ${errorDescription}`);
    }
  });
  // --- END: Integrated Logging ---

  // Open DevTools automatically in development
  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  return mainWindow;
}

app.whenReady().then(async () => {
  await createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (serverProcess) {
    console.log('[Main Process] Killing SvelteKit server process on window-all-closed.');
    serverProcess.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (serverProcess) {
    console.log('[Main Process] Killing SvelteKit server process before quit.');
    serverProcess.kill();
  }
});


// *****************
// Application code
// *****************
// Main process functions
async function openMenuDialog(browserWindow) {
  const result = await dialog.showOpenDialog(browserWindow, { // Pass browserWindow as first arg for parent
    properties: ['openFile'],
    filters: [{ name: 'json file', extensions: ['json'] }]
  });

  if (result.canceled || result.filePaths.length === 0) return; // Check filePaths length

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
  {
    label: 'Chibi POS', // On macOS this will be the app name, on others it's a menu item
    submenu: [
      {
        label: 'Importar carta',
        click: () => {
          const focusedWindow = BrowserWindow.getFocusedWindow();
          if (focusedWindow) {
            openMenuDialog(focusedWindow);
          } else {
            console.warn('[Main Process] Importar carta: No focused window to open dialog for.');
            // Optionally, if no window is focused but one exists, use the main one
            if (mainWindow) openMenuDialog(mainWindow);
          }
        }
      },
      { type: 'separator' },
      { label: 'Recargar', role: 'reload' },
      { label: 'Forzar Recarga', role: 'forceReload' }, // Added for cache-busting reload
      { label: 'Alternar Herramientas de Desarrollo', role: 'toggleDevTools' }, // Added for easy DevTools access
      { type: 'separator' },
      { label: 'Minimizar', role: 'minimize' },
      { type: 'separator' },
      { label: 'Salir', role: 'quit' }
    ]
  },
  // You can add an "Edit" menu for copy/paste, especially useful on macOS
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

// If on macOS, make the first menu item the app name and add standard macOS items
if (process.platform === 'darwin') {
  menuTemplate.unshift({
    label: app.getName(),
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideOthers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  });
}


const menu = Menu.buildFromTemplate(menuTemplate);
Menu.setApplicationMenu(menu);
