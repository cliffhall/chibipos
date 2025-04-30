import { ipcRenderer, contextBridge } from 'electron';


contextBridge.exposeInMainWorld('api', {
  openMenuDialog: () => ipcRenderer.send('open-menu-dialog'),
  onMenuOpened: (callback) => {
    ipcRenderer.removeAllListeners('menu-file-opened')
    ipcRenderer.on('menu-file-opened', (event, content) =>
      callback(content)
    )
  },
  // onUserDataPath: (callback) => ipcRenderer.on('user-data-path', (_, path) => callback(path)),
  printTicket: async (data) => await ipcRenderer.invoke('print-ticket', data),

  printKitchen: async (data) => await ipcRenderer.invoke('print-kitchen', data),

  printSale: async (data) => await ipcRenderer.invoke('print-sale', data)
})