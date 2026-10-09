const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('appApi', {
  getVersion: () => process.versions.electron,
  openExternal: (url) => require('electron').shell.openExternal(url)
});
