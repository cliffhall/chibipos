"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("api", {
  openMenuDialog: () => electron.ipcRenderer.send("open-menu-dialog"),
  onMenuOpened: (callback) => {
    electron.ipcRenderer.removeAllListeners("menu-file-opened");
    electron.ipcRenderer.on(
      "menu-file-opened",
      (event, content) => callback(content)
    );
  },
  // onUserDataPath: (callback) => ipcRenderer.on('user-data-path', (_, path) => callback(path)),
  printTicket: async (data) => await electron.ipcRenderer.invoke("print-ticket", data),
  printKitchen: async (data) => await electron.ipcRenderer.invoke("print-kitchen", data),
  printSale: async (data) => await electron.ipcRenderer.invoke("print-sale", data)
});
