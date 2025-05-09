// src/preload.js
console.log('[Preload Script] Attempting to execute preload.js...'); // First line

import { ipcRenderer, contextBridge } from 'electron';

console.log('[Preload Script] Imports successful. Attempting to expose API.');

try {
  contextBridge.exposeInMainWorld('api', {
    // Menu handling
    openMenuDialog: () => ipcRenderer.send('open-menu-dialog'),
    onMenuOpened: (callback) => {
      const handler = (event, content) => callback(content);
      ipcRenderer.on('menu-file-opened', handler);
      return () => {
        ipcRenderer.removeListener('menu-file-opened', handler);
      };
    },
    importUpdateMenu: async (encryptedBase64Menu) => await ipcRenderer.invoke('import-update-menu', encryptedBase64Menu),

    // Data fetching
    getCategories: async () => await ipcRenderer.invoke('get-categories'),
    getProducts: async () => await ipcRenderer.invoke('get-products'),

    // For tickets page
    getTicketsByDate: async (dateString) => await ipcRenderer.invoke('get-ticket-by-date', dateString),
    getTicketById: async (ticketId) => await ipcRenderer.invoke('get-ticket-by-id', ticketId),
    cancelTicketById: async (ticketId) => await ipcRenderer.invoke('cancel-ticket-by-id', ticketId),

    // For reportes page
    getDailySalesByMonth: async (dateString) => await ipcRenderer.invoke('get-daily-sales-by-month', dateString),
    getDailySaleReportById: async (saleId) => await ipcRenderer.invoke('get-daily-sale-report-by-id', saleId),
    exportDailySaleById: async (saleId) => await ipcRenderer.invoke('export-daily-sale-by-id', saleId),

    // For updateDailySales in Nav.svelte
    getSaleByDate: async (dateString) => await ipcRenderer.invoke('get-daily-sale-by-date', dateString),
    updateDailySalesReport: async (dateString) => await ipcRenderer.invoke('update-daily-sales-report', dateString),

    // Printing
    printTicket: async (data) => await ipcRenderer.invoke('print-ticket', data),
    printKitchen: async (data) => await ipcRenderer.invoke('print-kitchen', data),
    printSale: async (data) => await ipcRenderer.invoke('print-sale', data)
  });
  console.log('[Preload Script] contextBridge.exposeInMainWorld("api", ...) SUCCEEDED.'); // Success log
} catch (error) {
  console.error('[Preload Script] contextBridge.exposeInMainWorld FAILED:', error); // Error log
}

// Your existing log, which is good:
// console.log('[Preload Script] window.api has been exposed.'); // This will only be true if the above try block succeeded.
