const { app, BrowserWindow, ipcMain, screen, shell } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
    frame: false,
    backgroundColor: '#121212',
    show: false,
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
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.on('save-log', (event, data) => {
    const timestamp = new Date();
    const dateKey = timestamp.toISOString().split('T')[0];
    // Use userData path for guaranteed write access across all environments
    const logDir = app.getPath('userData');
    const filePath = path.join(logDir, 'time_master_logs.json');
    
    console.log("Attempting to save log to:", filePath);

    let logs = {};
    try {
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            logs = content ? JSON.parse(content) : {};
        }
    } catch (e) { 
        console.error("Error reading existing logs, starting fresh:", e); 
        logs = {};
    }

    if (!logs[dateKey]) logs[dateKey] = [];
    logs[dateKey].push({
        ...data,
        timestamp: timestamp.toLocaleString(),
        id: Date.now()
    });

    try {
        fs.writeFileSync(filePath, JSON.stringify(logs, null, 2));
        console.log("Log saved successfully.");
    } catch (err) { 
        console.error("CRITICAL: Failed to write JSON log file:", err); 
    }

    if (mainWindow) {
        mainWindow.setAlwaysOnTop(false);
        mainWindow.minimize();
    }
});

ipcMain.handle('get-logs', async () => {
    const logDir = app.getPath('userData');
    const filePath = path.join(logDir, 'time_master_logs.json');
    console.log("Retrieving logs from:", filePath);
    try {
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(content);
        }
    } catch (e) { console.error("Error retrieving logs:", e); }
    return {};
});

ipcMain.handle('update-logs', async (event, updatedLogs) => {
    const logDir = app.getPath('userData');
    const filePath = path.join(logDir, 'time_master_logs.json');
    try {
        fs.writeFileSync(filePath, JSON.stringify(updatedLogs, null, 2));
        return true;
    } catch (e) {
        console.error("Failed to update logs:", e);
        return false;
    }
});

ipcMain.on('minimize-app', () => {
    if (mainWindow) {
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
    app.quit();
});

ipcMain.on('open-logs-folder', () => {
    const path = app.getPath('userData');
    console.log("IPC: Received open-logs-folder request for path:", path);
    if (fs.existsSync(path)) {
        shell.openExternal(`file://${path}`);
    } else {
        console.error("Path does not exist yet:", path);
    }
});

ipcMain.on('trigger-enforce', () => {
    if (mainWindow) {
        mainWindow.setAlwaysOnTop(true, 'screen-saver', 1);
        mainWindow.show();
        mainWindow.focus();
        mainWindow.setVisibleOnAllWorkspaces(true);
        mainWindow.setFullScreen(false); // Ensure it's not stuck in a weird state
        mainWindow.webContents.send('enforce-mode');
    }
});
