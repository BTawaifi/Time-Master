const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  saveLog: (data, customPath) => ipcRenderer.send('save-log', data, customPath),
  getLogs: (customPath) => ipcRenderer.invoke('get-logs', customPath),
  updateLogs: (data, customPath) => ipcRenderer.invoke('update-logs', data, customPath),
  selectLogFile: () => ipcRenderer.invoke('select-log-file'),
  triggerEnforce: () => ipcRenderer.send('trigger-enforce'),
  minimizeApp: () => ipcRenderer.send('minimize-app'),
  maximizeApp: () => ipcRenderer.send('maximize-app'),
  closeApp: () => ipcRenderer.send('close-app'),
  openLogsFolder: (customPath) => ipcRenderer.send('open-logs-folder', customPath),
  onMaximized: (callback) => ipcRenderer.on('window-maximized', (event, state) => callback(state)),
  onEnforce: (callback) => ipcRenderer.on('enforce-mode', (event, ...args) => callback(...args))
})
