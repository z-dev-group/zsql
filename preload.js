window.addEventListener("DOMContentLoaded", () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const type of ["chrome", "node", "electron"]) {
    replaceText(`${type}-version`, process.versions[type]);
  }
});

const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('api', {
  connectDatabase: (host, port, username, password, database) => ipcRenderer.invoke('connect-database', host, port, username, password, database),
  queryDatabase: (sqlQuery, params) => ipcRenderer.invoke('query-database', sqlQuery, params),
  selectDatabase: (database) => ipcRenderer.invoke('select-database', database),
});
