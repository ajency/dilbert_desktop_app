const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const ipcMain = electron.ipcMain

let $ = require('jquery') 

const path = require('path')
const url = require('url')



// Code for autolauch on start up for linux
// var AutoLaunch = require('auto-launch');

// var dilbertAutoLauncher = new AutoLaunch({
//   name: 'DilbertApp',
//   isHidden: true
//   // path: '/Applications/Dilbert-app'
// });

// dilbertAutoLauncher.enable();

// //minecraftAutoLauncher.disable();


// dilbertAutoLauncher.isEnabled()
// .then(function(isEnabled){
//   if(isEnabled){
//       return;
//   }
//   dilbertAutoLauncher.enable();
// })
// .catch(function(err){
//     // handle error
//     console.log("auto lauch failed");
// });


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow = null;

function createWindow () {
  console.log("inside createWindow");
  // Create the browser window.

     console.log("Opening new browser window");
     mainWindow = new BrowserWindow({width: 400, height: 600, 
                                  resizable: false,
                                  fullscreen: false,
      icon : path.join(__dirname, 'assets/icons/mac/128x128.icns')})
  
 

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true

  }))
  // mainWindow.webContents.openDevTools();
  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
   
    // mainWindow.webContents.send('ping', 5);
    console.log("main window closed");
    mainWindow = null
  })



}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)


// Check for multiple instances of the app
var shouldQuit = app.makeSingleInstance(function(commandLine, workingDirectory) {
    // Someone tried to run a second instance, we should focus our window.
    console.log("Check for multiple instances");
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  if (shouldQuit) {
    console.log("shouldQuit");
    app.quit();
    return;
  }

// Auto lauch for macOS and Windows 
app.setLoginItemSettings({
  openAtLogin: true,
  openAsHidden : true
})


// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  console.log("all windows closed")
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
  console.log("activate");
  

  
})


// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
