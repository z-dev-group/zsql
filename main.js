const { app, BrowserWindow, ipcMain } = require('electron/main')
const path = require('node:path')
import ipcInit from './ipc.js';

app.whenReady().then(() => {
  const win = new BrowserWindow({
    title: 'Main window',
    devTools: true, // 默认就是true
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // You can use `process.env.VITE_DEV_SERVER_URL` when the vite command is called `serve`
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    // Load your file
    win.loadFile('dist/index.html');
  }
})


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipcInit(ipcMain);