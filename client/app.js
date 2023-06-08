const { app, BrowserWindow, ipcMain } = require('electron');
const { v4: uuidv4 } = require('uuid');
const screenshot = require('screenshot-desktop');

const socket = require('socket.io-client')();

function createWindow() {
    const win = new BrowserWindow({
        width: 500,
        height: 150,
        webPreferences: {
            nodeIntegration: true
        }
    });

    win.removeMenu();
    win.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

ipcMain.on('start-share', function (event, arg) {
    const uuid = uuidv4();
    socket.emit('join-message', uuid);
    event.reply('uuid', uuid);

    const interval = setInterval(function () {
        screenshot().then((img) => {
            const imgStr = Buffer.from(img).toString('base64');

            const obj = {
                room: uuid,
                image: imgStr
            };

            socket.emit('screen-data', JSON.stringify(obj));
        });
    }, 100);
});

ipcMain.on('stop-share', function (event, arg) {
    clearInterval(interval);
});
