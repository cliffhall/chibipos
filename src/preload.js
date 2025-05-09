// /src/preload.js
import { ipcRenderer, contextBridge } from 'electron';

console.log('[Preload Script] Attempting to execute preload.js...');

try {
  // All IPC invoke calls should be asynchronous, so they return Promises
  const api = {
    // Database related
    getCategories: async () => await ipcRenderer.invoke('get-categories'),
    getProducts: async () => await ipcRenderer.invoke('get-products'),
    getSaleByDate: async (dateString) => await ipcRenderer.invoke('get-daily-sale-by-date', dateString),
    getDailySalesByMonth: async (dateString) => await ipcRenderer.invoke('get-daily-sales-by-month', dateString),
    exportDailySaleById: async (saleId) => await ipcRenderer.invoke('export-daily-sale-by-id', saleId),
    getDailySaleReportById: async (saleId) => await ipcRenderer.invoke('get-daily-sale-report-by-id', saleId),
    getTicketById: async (ticketId) => await ipcRenderer.invoke('get-ticket-by-id', ticketId),
    cancelTicketById: async (ticketId) => await ipcRenderer.invoke('cancel-ticket-by-id', ticketId),
    updateDailySalesReport: async (dateString) => await ipcRenderer.invoke('update-daily-sales-report', dateString),
    getTicketsByDate: async (dateString) => await ipcRenderer.invoke('get-ticket-by-date', dateString),

    // Menu Import/Update related
    updateMenuFromImport: async (menuData) => await ipcRenderer.invoke('update-menu-from-import', menuData),
    importUpdateMenu: async (encryptedMenuData) => await ipcRenderer.invoke('import-update-menu', encryptedMenuData),
    deleteAllMenuData: async () => await ipcRenderer.invoke('delete-all-menu-data'),

    // Printing related
    printTicket: async (data) => await ipcRenderer.invoke('print-ticket', data),
    printKitchen: async (data) => await ipcRenderer.invoke('print-kitchen', data),
    printSale: async (data) => await ipcRenderer.invoke('print-sale', data),

    // UI Interaction (like opening dialogs triggered from renderer)
    // This allows the renderer to directly ask to open the menu dialog
    openMenuDialog: () => ipcRenderer.send('open-menu-dialog'),
  };

  console.log('[Preload Script] API object defined. Attempting to expose API.');
  contextBridge.exposeInMainWorld('api', api);
  console.log('[Preload Script] contextBridge.exposeInMainWorld("api", ...) SUCCEEDED.');

  // Listen for the trigger from the main process menu (src/main/index.js)
  // This is for when the *native Electron menu item* "Importar carta" is clicked.
  ipcRenderer.on('trigger-open-menu-dialog', () => {
    console.log('[Preload Script] Received "trigger-open-menu-dialog" from main process.');
    // Now invoke the actual IPC handler that api.js listens for.
    // This assumes 'open-menu-dialog' is the IPC channel that api.js's openMenuDialog function is tied to
    // via an ipcMain.on('open-menu-dialog', ...) listener in api.js.
    ipcRenderer.send('open-menu-dialog');
  });
  console.log('[Preload Script] "trigger-open-menu-dialog" listener set up.');

} catch (error) {
  console.error('[Preload Script] CRITICAL ERROR during preload execution:', error);
}
