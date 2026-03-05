const { app, BrowserWindow, ipcMain, screen, shell, dialog, Tray, Menu, powerSaveBlocker } = require('electron');
const path = require('path');
const fs = require('fs');
const fsPromises = fs.promises;

function exists(p) {
    return fsPromises.access(p).then(() => true).catch(() => false);
}

let mainWindow;
let tray;
let isQuitting = false;
let isEnforced = false;
let psbId;
let enforcementConfig = {};
let eclipseWindows = [];
let isStayOnTopGlobal = false;

function closeEclipseWindows() {
    eclipseWindows.forEach(win => {
        if (!win.isDestroyed()) win.close();
    });
    eclipseWindows = [];
}

app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('disable-background-timer-throttling');

function createTray() {
    const iconPath = path.join(__dirname, '../build/icon.png');
    tray = new Tray(iconPath);
    const contextMenu = Menu.buildFromTemplate([
        { label: 'Open Time Master', click: () => mainWindow.show() },
        { type: 'separator' },
        {
            label: 'Quit Laboratory', click: () => {
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
            sandbox: true,
            backgroundThrottling: false,
        },
        frame: false,
        transparent: true,
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

    mainWindow.on('maximize', () => mainWindow.webContents.send('window-maximized', true));
    mainWindow.on('unmaximize', () => mainWindow.webContents.send('window-maximized', false));

    mainWindow.on('close', (event) => {
        if (!isQuitting) {
            event.preventDefault();
            mainWindow.hide();
        }
        return false;
    });



    let dragDebounce = null;
    let isMoving = false;

    mainWindow.on('will-move', () => {
        isMoving = true;
        clearTimeout(dragDebounce);
        dragDebounce = setTimeout(() => { isMoving = false; }, 500);
    });


}

app.on('before-quit', () => {
    isQuitting = true;
});

const getLogPath = (customPath) => {
    const defaultPath = path.join(app.getPath('userData'), 'time_master_logs.json');
    if (customPath && typeof customPath === 'string' && customPath.trim() !== '') {
        if (allowedPaths.has(customPath)) {
            return customPath;
        }
        try {
            const normalizedPath = path.normalize(customPath.trim());
            // Ensure path is an absolute path and resolves inside userData folder to prevent arbitrary directory opening
            if (path.isAbsolute(normalizedPath) && normalizedPath.endsWith('.json')) {
                const targetDir = path.dirname(normalizedPath);
                const userDir = app.getPath('userData');
                // Ensure target directory is inside userDir or is exactly userDir
                if (targetDir === userDir || targetDir.startsWith(userDir + path.sep)) {
                    return normalizedPath;
                }
            }
        } catch (e) {
            console.error("Invalid custom path provided:", e);
        }
    }
    return defaultPath;
};

let allowedPaths = new Set();
let allowedPathsFile = '';

app.whenReady().then(async () => {
    allowedPathsFile = path.join(app.getPath('userData'), 'allowed_paths.json');
    try {
        if (await exists(allowedPathsFile)) {
            const data = await fsPromises.readFile(allowedPathsFile, 'utf8');
            const paths = JSON.parse(data);
            if (Array.isArray(paths)) {
                paths.forEach(p => allowedPaths.add(p));
            }
        }
    } catch (e) {
        console.error("Failed to load allowed paths:", e);
    }

    createWindow();
    createTray();
    psbId = powerSaveBlocker.start('prevent-app-suspension');
});

let logLock = Promise.resolve();
const getLocalDateKey = (date) => new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().split('T')[0];

ipcMain.on('save-log', (event, data, customPath) => {
    logLock = logLock.then(async () => {
        const timestamp = new Date();
        const dateKey = getLocalDateKey(timestamp);
        const filePath = getLogPath(customPath);

        let logs = {};
        try {
            if (await exists(filePath)) {
                const content = await fsPromises.readFile(filePath, 'utf8');
                if (content && content.trim()) logs = JSON.parse(content);
            }
        } catch (e) {
            if (e.code !== 'ENOENT') {
                console.error("Corrupted logs recovered:", e);
                try {
                    if (await exists(filePath)) {
                        await fsPromises.copyFile(filePath, `${filePath}.corrupt.bak`);
                    }
                } catch (backupErr) {
                    console.error("Failed to backup corrupted logs:", backupErr);
                }
            }
            logs = {};
        }

        if (!logs[dateKey]) logs[dateKey] = [];
        logs[dateKey].push({ ...data, timestamp: timestamp.toLocaleString(), id: Date.now() });

        // Prune older logs (maintain last 90 days max)
        const sortedKeys = Object.keys(logs).sort();
        if (sortedKeys.length > 90) {
            sortedKeys.slice(0, sortedKeys.length - 90).forEach(k => delete logs[k]);
        }

        try {
            const dir = path.dirname(filePath);
            await fsPromises.mkdir(dir, { recursive: true }).catch(() => { });

            const tmpPath = `${filePath}.${Date.now()}.tmp`;
            await fsPromises.writeFile(tmpPath, JSON.stringify(logs, null, 2));
            await fsPromises.rename(tmpPath, filePath);
        } catch (err) { console.error("Failed to write log:", err); }

        // After save, release enforcer state
        isEnforced = false;
        closeEclipseWindows();
        if (mainWindow) {
            mainWindow.setAlwaysOnTop(isStayOnTopGlobal, 'screen-saver', 1);
            mainWindow.setKiosk(false);
            mainWindow.setSkipTaskbar(false);
        }
    }).catch(err => {
        console.error("Main Process Log Queue Error:", err);
    });
});

ipcMain.handle('get-logs', async (event, customPath) => {
    const filePath = getLogPath(customPath);
    try {
        const content = await fsPromises.readFile(filePath, 'utf8');
        return JSON.parse(content);
    } catch (e) {
        if (e.code !== 'ENOENT') {
            console.error("Failed to get logs:", e);
        }
    }
    return {};
});

ipcMain.handle('update-logs', async (event, updatedLogs, customPath) => {
    return new Promise((resolve) => {
        logLock = logLock.then(async () => {
            const filePath = getLogPath(customPath);
            try {
                const dir = path.dirname(filePath);
                await fsPromises.mkdir(dir, { recursive: true }).catch(() => { });
                const tmpPath = `${filePath}.${Date.now()}.tmp`;
                await fsPromises.writeFile(tmpPath, JSON.stringify(updatedLogs, null, 2));
                await fsPromises.rename(tmpPath, filePath);
                resolve(true);
            } catch (e) { resolve(false); }
        }).catch(() => resolve(false));
    });
});

ipcMain.handle('select-log-file', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        title: 'Select or Create Log File',
        defaultPath: path.join(app.getPath('userData'), 'time_master_logs.json'),
        filters: [{ name: 'JSON Files', extensions: ['json'] }],
        properties: ['openFile', 'promptToCreate']
    });
    if (!result.canceled && result.filePaths.length > 0) {
        const selectedPath = result.filePaths[0];
        allowedPaths.add(selectedPath);
        try {
            await fsPromises.writeFile(allowedPathsFile, JSON.stringify([...allowedPaths], null, 2));
        } catch (e) {
            console.error("Failed to save allowed path:", e);
        }
        return selectedPath;
    }
    return null;
});

ipcMain.on('minimize-app', () => {
    if (mainWindow && !isEnforced) {
        mainWindow.setAlwaysOnTop(false);
        mainWindow.minimize();
    }
});

ipcMain.on('maximize-app', () => {
    if (mainWindow) {
        if (mainWindow.isMaximized()) mainWindow.unmaximize();
        else mainWindow.maximize();
    }
});

ipcMain.on('close-app', () => mainWindow.hide());

ipcMain.on('set-stay-on-top', (event, bool) => {
    isStayOnTopGlobal = bool;
    if (mainWindow) {
        mainWindow.setAlwaysOnTop(bool, 'screen-saver', 1);
    }
});

ipcMain.on('set-kiosk', (event, bool) => {
    if (mainWindow) {
        mainWindow.setKiosk(bool);
        mainWindow.setSkipTaskbar(bool);
    }
});

ipcMain.on('flash-frame', (event, bool) => {
    if (mainWindow) {
        mainWindow.flashFrame(bool);
    }
});

ipcMain.on('force-restore', () => {
    if (mainWindow) {
        mainWindow.restore();
        mainWindow.show();
        mainWindow.focus();
        mainWindow.setAlwaysOnTop(true, 'screen-saver', 1);
    }
});

ipcMain.on('open-logs-folder', async (event, customPath) => {
    const filePath = getLogPath(customPath);
    const dirPath = path.dirname(filePath);
    try {
        await fsPromises.access(dirPath);
        shell.openPath(dirPath);
    } catch (e) {
        // Directory does not exist or cannot be accessed
    }
});

ipcMain.on('set-enforcement', (event, config) => {
    enforcementConfig = config || {};
});

ipcMain.on('set-eclipse-level', (event, level) => {
    if (!isEnforced || !enforcementConfig.desktopEclipse || level === 0) {
        closeEclipseWindows();
        return;
    }

    if (eclipseWindows.length === 0) {
        const displays = screen.getAllDisplays();
        displays.forEach(display => {
            const win = new BrowserWindow({
                x: display.bounds.x,
                y: display.bounds.y,
                width: display.bounds.width,
                height: display.bounds.height,
                transparent: true,
                frame: false,
                alwaysOnTop: true,
                skipTaskbar: true,
                focusable: false,
                hasShadow: false,
                show: false,
                webPreferences: { nodeIntegration: false, contextIsolation: true, sandbox: true }
            });
            win.setIgnoreMouseEvents(true, { forward: true });
            win.setAlwaysOnTop(true, 'screen-saver', 0);
            const html = encodeURIComponent('<body style="background:black; margin:0; padding:0; overflow:hidden;"></body>');
            win.loadURL(`data:text/html;charset=utf-8,${html}`);
            win.setOpacity(0);
            win.once('ready-to-show', () => win.show());
            eclipseWindows.push(win);
        });
    }

    const targetOpacity = Math.min(0.95, level * 0.1);
    eclipseWindows.forEach(win => {
        if (!win.isDestroyed()) {
            win.setOpacity(targetOpacity);
        }
    });
});

ipcMain.on('trigger-enforce', () => {
    isEnforced = true;
    if (mainWindow) {
        mainWindow.show();
        mainWindow.focus();
        if (isStayOnTopGlobal) {
            mainWindow.setAlwaysOnTop(true, 'screen-saver', 1);
        } else {
            mainWindow.setAlwaysOnTop(false);
        }
        if (process.platform === 'darwin') {
            mainWindow.setVisibleOnAllWorkspaces(true);
        }
        mainWindow.setSkipTaskbar(true);
        mainWindow.webContents.send('enforce-mode');
    }
});

ipcMain.on('cancel-enforce', () => {
    isEnforced = false;
    closeEclipseWindows();
    if (mainWindow) {
        mainWindow.setAlwaysOnTop(isStayOnTopGlobal, 'screen-saver', 1);
        mainWindow.setSkipTaskbar(false);
        mainWindow.setKiosk(false);
    }
});
