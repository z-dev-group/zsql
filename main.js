const { app, BrowserWindow, ipcMain } = require('electron/main')
const path = require('node:path')
const mysql2 = require('mysql2/promise');

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


var gConfig = {}

async function initConnection(config) {
  let result = null;
  try {
    result = await mysql2.createConnection(config);
    console.log(result, "initConnection success");
  } catch (error) {
    console.log(error, "initConnection error");
  }
  return result;
}
ipcMain.handle('connect-database', async (event, host, port, username, password, database) => {
  let config = {
    host: host,
    port: port,
    user: username,
    password: password,
    database: database
  }
  gConfig = config;
  console.log(gConfig, "OK");
  try {
    await initConnection(config);
    return { error: "", message: "connect_database_success" };
  } catch (error) {
    return { error: "connect_database_failed", message: "连接数据库失败:" + error.message };
  }
});

ipcMain.handle('query-database', async (event, sqlQuery, params) => {
  let connection = await initConnection(gConfig);
  if (!connection) {
    return { error: "query_failed", message: "连接数据库失败" };
  }
  try {
    const [rows] = await connection.execute(sqlQuery, params);
    console.log("query end", rows);
    return rows;
  } catch (error) {
    return { error: "query_failed", message: error.message };
  } finally {
    connection.end();
  }
});

ipcMain.handle('select-database', async (event, database) => {
  try {
    gConfig.database = database;
    await initConnection(gConfig);
    console.log(gConfig, "OK");
    return { error: "", message: "select_database_success" };
  } catch (error) {
    return { error: "select_database_failed", message: "选择数据库失败" };
  }
});