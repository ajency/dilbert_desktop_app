const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const ipcMain = electron.ipcMain

let $ = require('jquery') 

const path = require('path')
const url = require('url')

const {
  START_NOTIFICATION_SERVICE,
  NOTIFICATION_SERVICE_STARTED,
  NOTIFICATION_SERVICE_ERROR,
  NOTIFICATION_RECEIVED,
  TOKEN_UPDATED,
} = require ('electron-push-receiver/src/constants')

const { setup: setupPushReceiver } = require('electron-push-receiver');

const notify = require('electron-main-notification')
var axios = require('axios')
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
                                  // resizable: false,
                                  // fullscreen: false,
      icon : path.join(__dirname, 'assets/icons/mac/128x128.icns')})
  
 

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true

  }))

  // Open the DevTools.
  mainWindow.webContents.openDevTools()

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
app.on('ready', function(){
  createWindow();
  // push notification code 
  const webContents = { send : (event, data) => handlePushNotification(event, data) }

  // Initialize electron-push-receiver component. Should be called before 'did-finish-load'
  setupPushReceiver(webContents);

})

function handlePushNotification(event, data){
  console.log("inside do doSomething", event,data);
  if(event == 'PUSH_RECEIVER:::NOTIFICATION_SERVICE_STARTED'){
    console.log('Notification service started');
     axios.get('https://us-central1-fir-test-1303b.cloudfunctions.net/helloWorld?token='+data)
     .then( function(response){
        console.log("response ===>");
      })
     .catch( function(error){
        console.log("error=====>", error);
     })
  }
  if(event == 'PUSH_RECEIVER:::NOTIFICATION_RECEIVED'){
    if (data.notification.body){
      // payload has a body, so show it to the user
      console.log('display notification')
      if(mainWindow){
        if(mainWindow.isMinimized()){
          mainWindow.restore();
        }
        else{
          mainWindow.focus();
        }
      }
      else{
        createWindow();
      }
      notify(data.notification.title, {
        body: data.notification.body
      }, ()=>{
        console.log("The notification got clicked on!")
      }) 
    } else {
      // payload has no body, so consider it silent (and just consider the data portion)
      console.log('do something with the key/value pairs in the data', serverNotificationPayload.data)
    }
  }
  
 
}

// Check for multiple instances of the app
var shouldQuit = app.makeSingleInstance(function(commandLine, workingDirectory) {
    // Someone tried to run a second instance, we should focus our window.
    console.log("commandLine ==> ", commandLine);
    console.log("workingDirectory ==>", workingDirectory);
    console.log("Check for multiple instances");
    console.log("BrowserWindow.getAllWindows() ===>", BrowserWindow.getAllWindows());
    console.log("app =====>", app);
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
    else{
      createWindow();
    }
  });

  if (shouldQuit) {
    console.log("shouldQuit");
    console.log("BrowserWindow.getAllWindows() ===>", BrowserWindow.getAllWindows());
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
