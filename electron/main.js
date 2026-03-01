const { app, BrowserWindow, ipcMain, screen, shell, dialog, Tray, Menu, powerSaveBlocker } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let tray;
let isQuitting = false;
let psbId;

// Prevent suspension immediately
app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('disable-background-timer-throttling');

function createTray() {
  const iconPath = path.join(__dirname, '../build/icon.png');
  tray = new Tray(iconPath);
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Open Time Master', click: () => mainWindow.show() },
    { type: 'separator' },
    { label: 'Quit Laboratory', click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);
  tray.setToolTip('Time Master: The Enforcer Node');
  tray.setContextMenu(contextMenu);
  tray.on('click', () => mainWindow.show());
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 400,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      backgroundThrottling: false, // Critical for keeping timer alive
    },
    frame: false,
    backgroundColor: '#121212',
    icon: path.join(__dirname, '../build/icon.png'),
    show: false,
    skipTaskbar: false,
  });

  const isDev = !app.isPackaged;
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('window-maximized', true);
  });

  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('window-maximized', false);
  });

  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
    return false;
  });
}

app.whenReady().then(() => {
  createWindow();
  createTray();
  
  // High-priority lock
  psbId = powerSaveBlocker.start('prevent-app-suspension');

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
      // Keep alive for tray
  }
});

const getLogPath = (customPath) => {
    if (customPath && typeof customPath === 'string' && customPath.trim() !== '') {
        return customPath;
    }
    return path.join(app.getPath('userData'), 'time_master_logs.json');
};

ipcMain.on('save-log', (event, data, customPath) => {
    const timestamp = new Date();
    const dateKey = timestamp.toISOString().split('T')[0];
    const filePath = getLogPath(customPath);
    
    let logs = {};
    try {
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            logs = content ? JSON.parse(content) : {};
        }
    } catch (e) { logs = {}; }

    if (!logs[dateKey]) logs[dateKey] = [];
    logs[dateKey].push({
        ...data,
        timestamp: timestamp.toLocaleString(),
        id: Date.now()
    });

    try {
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(filePath, JSON.stringify(logs, null, 2));
    } catch (err) { console.error("Failed to write log:", err); }

    if (mainWindow) {
        mainWindow.setAlwaysOnTop(false);
    }
});

ipcMain.handle('get-logs', async (event, customPath) => {
    const filePath = getLogPath(customPath);
    try {
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(content);
        }
    } catch (e) { }
    return {};
});

ipcMain.handle('update-logs', async (event, updatedLogs, customPath) => {
    const filePath = getLogPath(customPath);
    try {
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(filePath, JSON.stringify(updatedLogs, null, 2));
        return true;
    } catch (e) { return false; }
});

ipcMain.handle('select-log-file', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        title: 'Select or Create Log File',
        defaultPath: path.join(app.getPath('userData'), 'time_master_logs.json'),
        filters: [{ name: 'JSON Files', extensions: ['json'] }],
        properties: ['openFile', 'promptToCreate']
    });
    
    if (!result.canceled && result.filePaths.length > 0) {
        return result.filePaths[0];
    }
    return null;
});

ipcMain.on('minimize-app', () => {
    if (mainWindow) {
        mainWindow.setAlwaysOnTop(false);
        mainWindow.minimize();
    }
});

ipcMain.on('maximize-app', () => {
    if (mainWindow) {
        if (mainWindow.isMaximized()) {
            mainWindow.unmaximize();
        } else {
            mainWindow.maximize();
        }
    }
});

ipcMain.on('close-app', () => {
    mainWindow.hide(); // Minimize to tray instead of quit
});

ipcMain.on('open-logs-folder', (event, customPath) => {
    const filePath = getLogPath(customPath);
    const dirPath = path.dirname(filePath);
    if (fs.existsSync(dirPath)) {
        shell.openPath(dirPath);
    }
});

ipcMain.on('trigger-enforce', () => {
    if (mainWindow) {
        mainWindow.show();
        mainWindow.focus();
        mainWindow.setAlwaysOnTop(true, 'screen-saver', 1);
        mainWindow.setVisibleOnAllWorkspaces(true);
        mainWindow.setFullScreen(false);
        mainWindow.webContents.send('enforce-mode');
    }
});
