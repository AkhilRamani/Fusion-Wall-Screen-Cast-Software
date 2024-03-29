const { app, BrowserWindow, nativeTheme } = require('electron')
const path = require('path')
const { autoUpdater } = require('electron-updater');
const { initServer } = require('./server')

const env = process.env.NODE_ENV || 'development';

//live reloading
if (env === 'dev') {
    require('electron-reload')(__dirname, {
        electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
        hardResetMethod: 'exit'
    });
}


let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1080,
        height: 700,
        show: false,
        title: `Fusion Cast`,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false
        }
    })

    mainWindow.loadFile('app/app.html')
    // mainWindow.once('ready-to-show', mainWindow.show)
    nativeTheme.themeSource = 'dark'
    // mainWindow.webContents.openDevTools()

    initServer(mainWindow.id);

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        autoUpdater.checkForUpdatesAndNotify();
    });
}

app.allowRendererProcessReuse = true

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) app.quit()
else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        // Someone tried to run a second instance, we should focus our window.
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore()
            mainWindow.focus()
        }
    })

    app.whenReady().then(createWindow)
}

app.on('window-all-closed', (e) => {
    // if (process.platform !== 'darwin') {
    //     app.quit()
    // }
    app.quit()
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
    // On certificate error we disable default behaviour (stop loading the page)
    // and we then say "it is all fine - true" to the callback
    event.preventDefault();
    callback(true);
});

autoUpdater.on('update-available', () => {
    mainWindow.webContents.send('update_available');
});
autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('update_downloaded');
});