'use strict';

import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import { format as formatUrl } from 'url';
import { autoUpdater } from 'electron-updater';
const isDevelopment = process.env.NODE_ENV !== 'production';

let mainWindow;

function createMainWindow () {
    let width = 800;
    const height = 600;
    if (isDevelopment) {
        width = 1500;
    }
    const window = new BrowserWindow({ width: width, height: height, frame: false });

    if (isDevelopment) {
        window.webContents.openDevTools();
    }

    // if (!isDevelopment) {
        // 启动自动更新
        updateHandle();
    // }

    if (isDevelopment) {
        window.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}/index.html`);
    } else {
        window.loadURL(formatUrl({
            pathname: path.join(__dirname, 'index.html'),
            protocol: 'file',
            slashes: true
        }));
    }

    window.on('closed', () => {
        mainWindow = null;
    });

    window.webContents.on('devtools-opened', () => {
        window.focus();
        setImmediate(() => {
            window.focus();
        });
    });

    return window;
}
// Flag: 区分用户自己点击更新和程序自身触发更新
let isUserUpdate = true;

function updateHandle () {
    // setup update
    updateConfig();

    // Fired by user
    ipcMain.on('check-for-update', function (event, arg) { // 注册更新事件供渲染进程调用
        isUserUpdate = true;
        autoUpdater.checkForUpdates();// 检查是否有更新
    });

    // update automatically
    isUserUpdate = false;
    autoUpdater.checkForUpdates();
}

function updateConfig () {
    const appName = 'fancyIcon';
    const appIcon = 'https://github.com/linfancy/fancyicon/tree/master/app/media/img/icon.ico';
    const message = {
        error: '检查更新出错',
        checking: '正在检查更新...',
        updateAva: '发现新版本，开始下载...',
        updateNotAva: '当前已是最新版本',
        downloaded: '新版本下载完成，将在重启工具后完成更新'
    };
    if (autoUpdater._eventsCount < 5) {
        autoUpdater.on('error', function (error) {
            // mainWindow.send('hideUpldateLoading', false);
            return dialog.showMessageBox(mainWindow, {
                type: 'info',
                buttons: ['关闭'],
                title: appName,
                message: message.error,
                detail: '/r' + error
            });
        })
            .on('checking-for-update', function (e) { // 当开始检查更新的时候触发。
                console.log('checking-for-update');
                // mainWindow.send('hideUpldateLoading', true);
            })
            .on('update-available', function (e) { // 当发现一个可用更新的时候触发，更新包下载会自动开始。
                console.log('update-available');
                const downloadConfirmation = dialog.showMessageBox(mainWindow, {
                    type: 'info',
                    buttons: ['OK'],
                    title: appName,
                    message: message.updateAva
                });
            })
            .on('update-not-available', function (e) { // 当没有可用更新的时候触发。
                // mainWindow.send('hideUpldateLoading', false);
                // 如果是程序自动更新，则不弹窗显示（扰民）
                if (!isUserUpdate) return;
                return dialog.showMessageBox(mainWindow, {
                    type: 'info',
                    buttons: ['关闭'],
                    title: appName,
                    message: message.updateNotAva
                });
            })
            .on('update-downloaded', function (event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate) {
                const index = dialog.showMessageBox(mainWindow, {
                    type: 'info',
                    buttons: ['现在重启工具', '稍后重启工具'],
                    title: appName,
                    message: message.downloaded
                });
                if (index === 1) return;
                force_quit = true;
                autoUpdater.quitAndInstall();
            });
    }
}

// quit application when all windows are closed
app.on('window-all-closed', () => {
    // on macOS it is common for applications to stay open until the user explicitly quits
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // on macOS it is common to re-create a window even after all windows have been closed
    if (mainWindow === null) {
        mainWindow = createMainWindow();
    }
});

// create main BrowserWindow when electron is ready
app.on('ready', () => {
    mainWindow = createMainWindow();
});

ipcMain.on('openDownloadPath', (event, arg) => {
    event.returnValue = dialog.showOpenDialog({
        'title': '保存',
        properties: ['openDirectory', 'createDirectory']
    }) || false;
});
ipcMain.on('chooseFile', (event, arg) => {
    event.returnValue = dialog.showOpenDialog({
        'title': '选择替换的svg文件',
        properties: ['openFile'],
        filters: [{
            name: 'image', extensions: ['svg']
        }]
    }) || false;
});
ipcMain.on('closeMainWindow', () => {
    app.quit();
});
ipcMain.on('hideWindow', () => {
    mainWindow.minimize();
});
