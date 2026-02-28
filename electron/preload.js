const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  saveLog: (data) => ipcRenderer.send('save-log', data),
  getLogs: () => ipcRenderer.invoke('get-logs'),
  updateLogs: (data) => ipcRenderer.invoke('update-logs', data),
  triggerEnforce: () => ipcRenderer.send('trigger-enforce'),
  minimizeApp: () => ipcRenderer.send('minimize-app'),
  maximizeApp: () => ipcRenderer.send('maximize-app'),
  closeApp: () => ipcRenderer.send('close-app'),
  openLogsFolder: () => ipcRenderer.send('open-logs-folder'),
  onMaximized: (callback) => ipcRenderer.on('window-maximized', (event, state) => callback(state)),
  onEnforce: (callback) => ipcRenderer.on('enforce-mode', (event, ...args) => callback(...args))
})
