// ****************************************
// IMPORTS
// ****************************************
import { app, BrowserWindow, dialog, ipcMain, Menu } from 'electron';
import { readFile } from 'fs/promises'
import path from 'node:path';
import started from 'electron-squirrel-startup';
// extra
import { spawn } from 'child_process';
import waitOn from 'wait-on';
import http from 'http';
import fs from 'fs'
// print functions
import printTicket from './printing/printTicket.js'
import printKitchen from './printing/printKitchen.js'
import printSale from './printing/printSale.js'
// ****************************************


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

// Server config
let serverProcess
const PORT = 3030

// let isDev = true
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
process.env.NODE_ENV = isDev ? 'development' : 'production';
let MAIN_WINDOW_VITE_DEV_SERVER_URL = 'http://localhost:5173'




// Svelte-kit server
function startServer() {
  if (isDev) {
    // In dev mode, no need to spawn server, Vite already runs
    console.log('development mode')
    return;
  }

  const serverPath = path.join(process.resourcesPath, 'dist', 'index.js');
  console.log('Server path:', serverPath);
  console.log('Current directory:', __dirname);

  serverProcess = spawn('node', [serverPath], {
    stdio: 'inherit',
    env: { ...process.env, PORT: PORT.toString() }
  });

  serverProcess.on('error', (err) => {
    console.error('Failed to start server process:', err);
  });
}

function waitOnServer(port, timeout = 5000) {
  const start = Date.now();

  return new Promise((resolve, reject) => {
    const check = () => {
      http.get(`http://localhost:${port}`, () => resolve())
        .on('error', (err) => {
          if (Date.now() - start > timeout) {
            reject(new Error('Server did not start in time'));
          } else {
            setTimeout(check, 100); // retry every 100ms
          }
        });
    };
    check();
  });
}


let mainWindow
async function createWindow() {
  mainWindow = new BrowserWindow({
    // width: 1024,
    width: 1180,
    // height: 768,
    height: 713,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
    // nodeIntegration: true
  });

  if (isDev) {
    await mainWindow.loadURL('http://localhost:5173');
  } else {
    await waitOnServer(PORT); // wait until server is ready
    await mainWindow.loadURL(`http://localhost:${PORT}`);
  }



  // Open the DevTools.
  if (isDev) {
    mainWindow.webContents.openDevTools(
      { mode: 'detach' }
    );
  }

  return mainWindow
};

// original 
// app.whenReady().then(() => {
//   createWindow();
//   // showOpenDialog(mainWindow)
//   // On OS X it's common to re-create a window in the app when the
//   // dock icon is clicked and there are no other windows open.
//   app.on('activate', () => {
//     if (BrowserWindow.getAllWindows().length === 0) {
//       createWindow();
//     }
//   });
// });

app.whenReady().then(async () => {
  startServer();
  await createWindow();
});

// Close
app.on('window-all-closed', (e) => {
  e.preventDefault()

  if (serverProcess) {
    serverProcess.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});



// *****************
// Application code
// *****************
// Main process functions
async function openMenuDialog(browserWindow) {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'json file', extensions: ['json'] }]
  })

  if (result.canceled) return

  const [filePath] = result.filePaths
  const content = await readFile(filePath, { encoding: 'utf-8' })
  browserWindow.webContents.send('menu-file-opened', content)
}


// Main process listeners
ipcMain.on('open-menu-dialog', (event) => {
  const browserWindow = BrowserWindow.fromWebContents(event.sender)
  if (!browserWindow) return
  openMenuDialog(browserWindow)
})



// *****************
// PRINTING
// *****************
ipcMain.handle('print-ticket', async (e, data) => {
  const result = await printTicket(e, data)
  return result
});

ipcMain.handle('print-kitchen', async (e, data) => {
  const result = await printKitchen(e, data)
  return result
});

ipcMain.handle('print-sale', async (e, data) => {
  const result = await printSale(e, data)
  return result
});



// *****************
// MENUS
// *****************
const menuTemplate = [
  {
    label: 'Chibi POS',
    submenu: [
      {
        label: 'Importar carta',
        click: () => {
          let browserWindow = BrowserWindow.getFocusedWindow()
          openMenuDialog(browserWindow)
        }
      },
      { type: 'separator' },
      { label: 'Recargar', role: 'reload' },
      { label: 'Minimizar', role: 'minimize' },
      { type: 'separator' },
      { label: 'Salir', role: 'quit' }
    ]
  },
]

const menu = Menu.buildFromTemplate(menuTemplate)
Menu.setApplicationMenu(menu)