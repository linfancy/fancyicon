'use strict';

import { app, BrowserWindow, ipcMain, dialog, Menu } from 'electron';
import * as path from 'path';
import { format as formatUrl } from 'url';
import { autoUpdater } from 'electron-updater';
const isDevelopment = process.env.NODE_ENV !== 'production';

let mainWindow;

function createMainWindow () {
    let width = 450;
    const height = 600;
    if (isDevelopment) {
        width = 450;
    }
    const window = new BrowserWindow({ width: width, height: height, frame: false });

    if (isDevelopment) {
        window.webContents.openDevTools();
    }

    if (!isDevelopment) {
        updateHandle();
    }

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

    // 创建菜单来响应快捷键
    const template = [
        {
            label: '编辑',
            submenu: [
                { label: '撤销', role: 'undo' },
                { label: '重做', role: 'redo' },
                { type: 'separator' },
                { label: '剪切', role: 'cut' },
                { label: '复制', role: 'copy' },
                { label: '粘贴', role: 'paste' },
                { label: '全选', role: 'selectall' }
            ]
        },
        {
            label: '视图',
            submenu: [
                { label: '插件面板', accelerator: 'CmdOrCtrl+,' },
                { label: '重置视图', role: 'resetzoom' },
                { label: '放大', role: 'zoomin' },
                { label: '缩小', role: 'zoomout' },
                { type: 'separator' },
                { label: '全屏切换', role: 'togglefullscreen' }
            ]
        },
        {
            label: '窗口',
            submenu: [
                { label: '最小化', role: 'minimize' }
            ]
        },
        {
            label: '开发',
            submenu: [
                { label: '控制台', accelerator: 'Shift+CmdOrCtrl+I', role: 'toggledevtools' }
            ]
        },
        {
            label: '帮助',
            submenu: [
                {
                    label: '文档',
                    click () {
                        const documentUrl = global.isReleaseVersion ? 'https://github.com/MossTeam/HelloWeb' : 'http://git.code.oa.com/tid/tid-workflow/tree/develop';
                        require('electron').shell.openExternal(documentUrl);
                    }
                },
                {
                    label: '反馈',
                    click () {
                        const feedbackUrl = global.isReleaseVersion ? 'https://github.com/MossTeam/HelloWeb/issues' : 'http://git.code.oa.com/tid/tid-workflow/issues';
                        require('electron').shell.openExternal(feedbackUrl);
                    }
                }
            ]
        }
    ];

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));

    return window;
}
// Flag: 区分用户自己点击更新和程序自身触发更新
let isUserUpdate = true;

function updateHandle () {
    // setup update
    updateConfig();
    console.log('更新1');
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
ipcMain.on('updateSystem', (event, arg) => {
    updateHandle();
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
