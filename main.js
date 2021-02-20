// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, Menu, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const Store = require("./Store.js");
const moment = require("moment");
const { markTimeline } = require("console");

// Set environment
process.env.NODE_ENV = "development";
const isDev = process.env.NODE_ENV == "development" ? true : false;

const isMac = process.platform === "darwin" ? true : false;
const isWin = process.platform === "win32" ? true : false;

let mainWindow; // Check how to prevent the object from being destroyed
let settingsWindow; // This should be globally defined to prevent garbage collection

// init store and defaults

const store = new Store({
  configName: "user-settings",
  defaults: {
    settings: {
      quadName: {
        tl: "Important and Urgent",
        tr: "Unimportant and Urgent",
        bl: "Important and Not Urgent",
        br: "Unimportant and Not Urgent",
      },
      interval: 1,
      reload: false,
    },
  },
});

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    title: "Quadra",
    width: 1000,
    height: 700,
    backgroundColor: "#48426d",
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

  const settings = store.get("settings");
  mainWindow.webContents.on("dom-ready", () => {
    mainWindow.webContents.send("settings-get", settings); //mainWindow since its the one that will use the settings
  });

  //this is where the changing menu should take place!!!
  changeMenu(settings);

  // app.on("ready", (e) => {
  //   changeMenu(settings);
  // });

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
    title: "Quadra",
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

function createSettingsWindow() {
  if (!settingsWindow || settingsWindow == null) {
    // this came from stackoverflow, go to js.info to re-understand that ! thingy on !settingsWindow
    settingsWindow = new BrowserWindow({
      title: "Quadra",
      width: 500,
      height: 450,
      backgroundColor: "#48426d",
      modal: true,
      parent: mainWindow,
      webPreferences: {
        //preload: path.join(__dirname, "preload.js"),
        nodeIntegration: true,
      },
    });

    // and load the index.html of the app.
    settingsWindow.loadFile("app/settings.html");

    // Open the DevTools.
    if (isDev) {
      settingsWindow.webContents.openDevTools();
    }

    settingsWindow.setMenuBarVisibility(false);
    settingsWindow.setAutoHideMenuBar(false);
  } else {
    settingsWindow.focus();
  }
  settingsWindow.on("close", () => {
    // to specify how its going to be destroyed
    settingsWindow = null;
  });
  settingsWindow.webContents.on("dom-ready", () => {
    settingsWindow.webContents.send("settings-get", store.get("settings"));
  });
}

ipcMain.on("ol-clicked", (e, ol) => {
  console.log("I'm here in the main process", ol);
  createInfoWindow();
  infoWindow.webContents.once("dom-ready", () => {
    // Why you need to add webcontents idk, but the window has to load before it can recieve ipcMessages "win.on('ready-to-show')"" apparently works too.
    infoWindow.webContents.send("ol-delivery", ol);
  });
});

// Settings area
ipcMain.on("settings-quadName", (e, quadNames) => {
  const settings = store.get("settings");
  settings.quadName = quadNames;
  store.set("settings", settings);
  mainWindow.webContents.send("settings-get", store.get("settings"));
  changeMenu(settings);
});
ipcMain.on("settings-interval", (e, intervalObj) => {
  if (intervalObj.dayWk == week) {
    intervalObj.interval = intervalObj.interval * 7; // to convert it to days
  }
  const settings = store.get("settings");
  settings.interval = intervalObj.interval;
  store.set("settings", settings);
  mainWindow.webContents.send("settings-get", store.get("settings"));
});

ipcMain.on("settings-send-tl", (e) => {
  e.sender.send("settings-get-change-tl", store.get("settings"));
});
ipcMain.on("settings-send-tr", (e) => {
  e.sender.send("settings-get-change-tr", store.get("settings"));
});
ipcMain.on("settings-send-bl", (e) => {
  e.sender.send("settings-get-change-bl", store.get("settings"));
});
ipcMain.on("settings-send-br", (e) => {
  e.sender.send("settings-get-change-br", store.get("settings"));
});
ipcMain.on("settings-send-int", (e) => {
  e.sender.send("settings-get-change-int", store.get("settings"));
});
ipcMain.on("settings-get-save", (e) => {
  e.sender.send("settings-set-save", store.get("settings"));
});

ipcMain.on("check-interval", (e, taskArr) => {
  const settings = store.get("settings");
  const exitArr = [];
  // const exitObj={}

  if (taskArr) {
    for (let i = 0; i < taskArr.length; i++) {
      let datePick = moment().format("DD-MMM-YYYY HH:mm:SS") + "";
      let dateNow = moment(datePick);
      let time = settings.interval;
      let dateThen = moment(taskArr[i].time);
      // console.log(dateNow.diff(dateThen, "days"));
      if (dateNow.diff(dateThen, "days") > time) {
        taskArr[i].index = i;
        exitArr.push(taskArr[i]);
      }
    }
  }

  // console.log(exitArr);
  mainWindow.webContents.send("already-complete", exitArr);
});

// ipcMain.on("settings-reload", (e, reload) => { // apparently you can do it without reloading the app
//   // console.log(data);
// });

// template[1].submenu[0].label = "Tested"; // Try putting it in a function and then building the enire menu again from
// the new template
const template = [
  {
    label: "File",
    submenu: [
      {
        label: "Load Quadrant",
        accelerator: "CmdOrCtrl+Shift+O",
        click: () => {
          console.log("Open Dialog");
          dialog
            .showOpenDialog(mainWindow, openOptions)
            .then((result) => {
              console.log(result.filePaths[0] + "");
              if (result === undefined) {
                console.log("No file selected");
                return;
              }
              fs.readFile(result.filePaths[0], "utf8", (err, data) => {
                if (err) throw err;
                console.log("File popped");
                // console.log(data);
                const quadObj = JSON.parse(data);
                store.set("settings", quadObj.settings);
                mainWindow.webContents.send("load-set-quadObj", data);
              });
            })
            .catch((err) => {
              console.log(err);
            });
        },
      },
      {
        label: "Save Quadrant",
        accelerator: "CmdOrCtrl+Shift+S",
        click: () => {
          console.log("Save Dialog");

          mainWindow.webContents.send("save-get-quadObj");
          ipcMain.on("save-set-quadObj", (e, quadObj) => {
            quadObj["settings"] = store.get("settings");
            dialog
              .showSaveDialog(mainWindow, saveOptions)
              .then((result) => {
                if (result === undefined) {
                  console.log("It didnt save");
                  return;
                }
                console.log(result.filePath);

                fs.writeFile(
                  result.filePath + "",
                  JSON.stringify(quadObj),
                  (err) => {
                    if (err) throw err;
                    console.log("Quadrant successfully saved...");
                  }
                );
              })
              .catch((err) => {
                console.log(err);
              });
          });
        },
      },
      {
        type: "separator",
      },
      {
        label: "Exit",
        click: () => {
          app.quit();
        },
      },
    ],
  },
  { role: "editMenu" },
  {
    label: "Actions",
    submenu: [
      {
        label: `Top Left Q`, // Eventually this would reflect the quadrants name gotten from the html/settings
        click: () => {
          mainWindow.webContents.send("extend-tl");
        },
      },
      {
        label: `Top Right Q`, // Eventually this would reflect the quadrants name gotten from the html/settings
        click: () => {
          mainWindow.webContents.send("extend-tr");
        },
      },
      {
        label: `Bottom Left Q`, // Eventually this would reflect the quadrants name gotten from the html/settings
        click: () => {
          mainWindow.webContents.send("extend-bl");
        },
      },
      {
        label: `Bottom Right Q`, // Eventually this would reflect the quadrants name gotten from the html/settings
        click: () => {
          mainWindow.webContents.send("extend-br");
        },
      },
      { type: "separator" },
      {
        label: "Settings",
        submenu: [
          {
            label: "Settings",
            accelerator: "CmdOrCtrl+K",
            click: () => {
              createSettingsWindow();
            },
          },
          {
            label: "Restore defaults",
            click: () => {
              store.set("settings", {
                quadName: {
                  tl: "Important and Urgent",
                  tr: "Unimportant and Urgent",
                  bl: "Important and Not Urgent",
                  br: "Unmportant and Not Urgent",
                },
                interval: 1,
                reload: false,
              });
              mainWindow.webContents.send(
                "settings-get",
                store.get("settings")
              );
            },
          },
        ],
      },
    ],
  },
  {
    label: "About",
    submenu: [
      {
        label: "About Quadra",
        click: () => {
          //The About page goes here
        },
      },
      {
        label: "Contact Developer",
        click: () => {
          // My details page goes here
        },
      },
    ],
  },
  ...(isDev ? [{ role: "viewMenu" }] : []),
];
let menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

function changeMenu(settings) {
  try {
    template[2].submenu[0].label = settings.quadName.tl;
    template[2].submenu[1].label = settings.quadName.tr;
    template[2].submenu[2].label = settings.quadName.bl;
    template[2].submenu[3].label = settings.quadName.br;
    menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
    console.log("menu updated");
  } catch (err) {
    console.log(err);
  }
}

// console.log(template[1].submenu[0].label);

//  template[1].submenu[0].label = "Tested";
//  menu = Menu.buildFromTemplate(template);
//  Menu.setApplicationMenu(menu);
// Apparently this works but, isn't it tasking on the UI/Backend?

const saveOptions = {
  title: "Save quadrant",
  buttonLabel: "Save",
  filters: [{ name: "Quadrant", extensions: ["qdr"] }],
  properties: ["dontAddToRecent", "showHiddenFiles"],
};

const openOptions = {
  title: "Load quadrant",
  buttonLabel: "Load",
  filters: [{ name: "Quadrant", extensions: ["qdr"] }],
  properties: ["openFile", "showHiddenFiles"],
};
