const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { app, BrowserWindow, ipcMain, shell } = require('electron');

const isDev = typeof process.env.ELECTRON_RENDERER_URL === 'string' && process.env.ELECTRON_RENDERER_URL.length > 0;

function getRendererUrl() {
    if (isDev) {
        return process.env.ELECTRON_RENDERER_URL;
    }

    return pathToFileURL(path.join(__dirname, '..', 'build', 'index.html')).toString();
}

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1440,
        height: 900,
        minWidth: 1024,
        minHeight: 640,
        backgroundColor: '#0f1726',
        autoHideMenuBar: true,
        show: false,
        title: 'Wasser',
        ...(process.platform === 'darwin' ? {
            titleBarStyle: 'hiddenInset',
        } : {}),
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            preload: path.join(__dirname, 'preload.cjs'),
        },
    });

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    mainWindow.webContents.on('will-navigate', (event, url) => {
        const currentUrl = mainWindow.webContents.getURL();
        const currentOrigin = currentUrl ? new URL(currentUrl).origin : null;
        const targetOrigin = new URL(url).origin;

        if (currentOrigin && currentOrigin !== 'null' && targetOrigin !== currentOrigin) {
            event.preventDefault();
            shell.openExternal(url);
        }
    });

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    const emitFullscreenChange = () => {
        mainWindow.webContents.send('window:fullscreen-changed', mainWindow.isFullScreen());
    };

    mainWindow.on('enter-full-screen', emitFullscreenChange);
    mainWindow.on('leave-full-screen', emitFullscreenChange);

    mainWindow.webContents.on('before-input-event', (event, input) => {
        if (process.platform !== 'darwin') return;
        if (input.type !== 'keyDown' || input.key !== 'Escape') return;
        if (!mainWindow.isFullScreen()) return;

        event.preventDefault();
        mainWindow.setFullScreen(false);
    });

    mainWindow.loadURL(getRendererUrl());
}

app.whenReady().then(() => {
    ipcMain.handle('shell:openExternal', (_event, url) => {
        if (typeof url !== 'string' || url.length === 0) {
            return false;
        }

        return shell.openExternal(url);
    });

    ipcMain.handle('window:setFullscreen', (event, fullscreen) => {
        const window = BrowserWindow.fromWebContents(event.sender);

        if (!window || typeof fullscreen !== 'boolean') {
            return false;
        }

        window.setFullScreen(fullscreen);
        return true;
    });

    ipcMain.handle('window:isFullscreen', (event) => {
        const window = BrowserWindow.fromWebContents(event.sender);
        return window ? window.isFullScreen() : false;
    });

    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
