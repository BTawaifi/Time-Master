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
  setStayOnTop: (bool) => ipcRenderer.send('set-stay-on-top', bool),
  setKiosk: (bool) => ipcRenderer.send('set-kiosk', bool),
  setEnforcement: (config) => ipcRenderer.send('set-enforcement', config),
  setEclipseLevel: (level) => ipcRenderer.send('set-eclipse-level', level),
  forceRestore: () => ipcRenderer.send('force-restore'),
  flashFrame: (bool) => ipcRenderer.send('flash-frame', bool),
  cancelEnforce: () => ipcRenderer.send('cancel-enforce'),
  openLogsFolder: (customPath) => ipcRenderer.send('open-logs-folder', customPath),
  onMaximized: (callback) => ipcRenderer.on('window-maximized', (event, state) => callback(state)),
  onEnforce: (callback) => ipcRenderer.on('enforce-mode', (event, ...args) => callback(...args))
})
