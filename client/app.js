const { app, BrowserWindow, ipcMain, ipcRenderer } = require('electron');
const { v4: uuidv4 } = require('uuid');
const screenshot = require('screenshot-desktop');
const path = require('path');

let mainWindow; // Declare the mainWindow variable
let interval; // Declare the interval variable

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 500,
        height: 500,
        webPreferences: {
            nodeIntegration: true
        }
    });
    mainWindow.removeMenu();
    mainWindow.loadFile(path.join(__dirname, 'index.html'));

    mainWindow.on('closed', () => {
        mainWindow = null; // Reset the mainWindow variable on window close
    });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

ipcMain.on("start-share", function (event, arg) {
    var uuid = uuidv4();
    event.reply("uuid", uuid);

    interval = setInterval(function () {
        screenshot().then((img) => {
            var imgStr = Buffer.from(img).toString('base64');

            var obj = {};
            obj.room = uuid;
            obj.image = imgStr;

            mainWindow.webContents.send("screen-data", JSON.stringify(obj)); // Use mainWindow.webContents.send instead of ipcRenderer.send
        });
    }, 100);
});

ipcMain.on("stop-share", function (event, arg) {
    clearInterval(interval);
});
