const path = require('node:path');
const fs = require('node:fs');
const http = require('node:http');
const { spawn } = require('node:child_process');
const { pathToFileURL } = require('node:url');
const { app, BrowserWindow, ipcMain, nativeImage, session, shell } = require('electron');

const isDev = typeof process.env.ELECTRON_RENDERER_URL === 'string' && process.env.ELECTRON_RENDERER_URL.length > 0;
const localStreamingServerSettingsUrl = 'http://127.0.0.1:11470/settings';
let localStreamingServerProcess = null;

function getRendererUrl() {
    if (isDev) {
        return process.env.ELECTRON_RENDERER_URL;
    }

    return pathToFileURL(path.join(__dirname, '..', 'build', 'index.html')).toString();
}

function getAppIconPath() {
    if (process.platform === 'darwin') {
        return path.join(__dirname, '..', 'public', 'assets', 'icons', 'mac', 'icon.icns');
    }

    return path.join(__dirname, '..', 'public', 'assets', 'images', 'icon_512x512.png');
}

function getDockIconPath() {
    if (process.platform === 'darwin') {
        return path.join(__dirname, '..', 'public', 'assets', 'icons', 'mac', 'icon.png');
    }

    return getAppIconPath();
}

function isLocalStreamingServerUrl(url) {
    try {
        const { hostname, port } = new URL(url);

        return ['127.0.0.1', 'localhost', '::1'].includes(hostname) && ['11470', '12470'].includes(port);
    } catch (_error) {
        return false;
    }
}

function addHeader(responseHeaders, name, value) {
    const existingName = Object.keys(responseHeaders).find((headerName) => headerName.toLowerCase() === name.toLowerCase());

    responseHeaders[existingName || name] = [value];
}

function allowLocalStreamingServerCors() {
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        if (!isLocalStreamingServerUrl(details.url)) {
            callback({ responseHeaders: details.responseHeaders });
            return;
        }

        const responseHeaders = {
            ...details.responseHeaders,
        };

        addHeader(responseHeaders, 'Access-Control-Allow-Origin', '*');
        addHeader(responseHeaders, 'Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        addHeader(responseHeaders, 'Access-Control-Allow-Headers', 'Range, Content-Type, Accept, Origin');
        addHeader(responseHeaders, 'Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges');

        callback({ responseHeaders });
    });
}

function checkUrl(url, timeout = 500) {
    return new Promise((resolve) => {
        const request = http.get(url, (response) => {
            response.resume();
            resolve(true);
        });

        request.on('error', () => resolve(false));
        request.setTimeout(timeout, () => {
            request.destroy();
            resolve(false);
        });
    });
}

function getLocalStreamingServerCommand() {
    const serverDir = process.env.WASSER_STREMIO_SERVER_DIR ||
        (process.platform === 'darwin' ? '/Applications/Stremio.app/Contents/MacOS' : null);

    if (typeof serverDir !== 'string') {
        return null;
    }

    const nodePath = path.join(serverDir, process.platform === 'win32' ? 'node.exe' : 'node');
    const serverPath = path.join(serverDir, 'server.js');

    return fs.existsSync(nodePath) && fs.existsSync(serverPath) ?
        { cwd: serverDir, command: nodePath, args: [serverPath] }
        :
        null;
}

async function startLocalStreamingServerIfAvailable() {
    if (process.env.WASSER_DISABLE_STREMIO_SERVER === '1') {
        return;
    }

    if (await checkUrl(localStreamingServerSettingsUrl)) {
        return;
    }

    const serverCommand = getLocalStreamingServerCommand();

    if (serverCommand === null) {
        return;
    }

    localStreamingServerProcess = spawn(serverCommand.command, serverCommand.args, {
        cwd: serverCommand.cwd,
        stdio: isDev ? 'inherit' : 'ignore',
    });

    localStreamingServerProcess.on('exit', () => {
        localStreamingServerProcess = null;
    });
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
        ...(process.platform !== 'darwin' ? {
            icon: getAppIconPath(),
        } : {}),
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

app.whenReady().then(async () => {
    allowLocalStreamingServerCors();
    await startLocalStreamingServerIfAvailable();

    if (process.platform === 'darwin') {
        const dockIcon = nativeImage.createFromPath(getDockIconPath());

        if (!dockIcon.isEmpty()) {
            app.dock.setIcon(dockIcon);
        }
    }

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

app.on('before-quit', () => {
    if (localStreamingServerProcess !== null) {
        localStreamingServerProcess.kill();
        localStreamingServerProcess = null;
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
