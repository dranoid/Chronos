// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

// Set environment
process.env.NODE_ENV = "development";
const isDev = process.env.NODE_ENV == "development" ? true : false;

const isMac = process.platform === "darwin" ? true : false;
const isWin = process.platform === "win32" ? true : false;

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    title: "Chronos",
    width: 800,
    height: 600,
    resizable: isDev ? true : false,
    backgroundColor: "white",
    webPreferences: {
      //preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile("app/index.html");

  // Open the DevTools.
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", function () {
  if (!isMac) {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

let infoWindow;
function createInfoWindow() {
  // Create the browser window.
  infoWindow = new BrowserWindow({
    title: "Chronos",
    width: 500,
    height: 300,
    resizable: isDev ? true : false,
    backgroundColor: "white",
    webPreferences: {
      //preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
    },
  });

  // and load the index.html of the app.
  infoWindow.loadFile("app/info.html");

  // Open the DevTools.
  if (isDev) {
    // infoWindow.webContents.openDevTools();
  }
}

ipcMain.on("ol-clicked", (e, ol) => {
  console.log("I'm here in the main process", ol);
  createInfoWindow();
  infoWindow.webContents.once("dom-ready", () => {
    // Why you need to add webcontents idk, but the window has to load before it can recieve ipcMessages "win.on('ready-to-show')"" apparently works too.
    infoWindow.webContents.send("ol-delivery", ol);
  });
});

ipcMain.on("add-tasks", (e, data) => {
  console.log(data);
});
