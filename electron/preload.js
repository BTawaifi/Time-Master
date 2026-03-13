const { contextBridge, ipcRenderer } = require('electron')

function subscribe(channel, callback) {
  if (typeof callback !== 'function') {
    return () => {}
  }

  const listener = (_event, ...args) => callback(...args)
  ipcRenderer.on(channel, listener)

  return () => {
    ipcRenderer.removeListener(channel, listener)
  }
}

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
  onMaximized: (callback) => subscribe('window-maximized', callback),
  onEnforce: (callback) => subscribe('enforce-mode', callback)
})
