const { app, BrowserWindow, ipcMain, screen, shell, dialog } = require('electron');
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
    icon: path.join(__dirname, '../build/icon.png'),
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
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
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

ipcMain.handle('get-logs', async (event, customPath) => {
    const filePath = getLogPath(customPath);
    console.log("Retrieving logs from:", filePath);
    try {
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(content);
        }
    } catch (e) { console.error("Error retrieving logs:", e); }
    return {};
});

ipcMain.handle('update-logs', async (event, updatedLogs, customPath) => {
    const filePath = getLogPath(customPath);
    try {
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(filePath, JSON.stringify(updatedLogs, null, 2));
        return true;
    } catch (e) {
        console.error("Failed to update logs:", e);
        return false;
    }
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

ipcMain.on('open-logs-folder', (event, customPath) => {
    const filePath = getLogPath(customPath);
    const dirPath = path.dirname(filePath);
    console.log("IPC: Received open-logs-folder request for path:", dirPath);
    if (fs.existsSync(dirPath)) {
        shell.openPath(dirPath);
    } else {
        console.error("Path does not exist yet:", dirPath);
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
