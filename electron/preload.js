const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  platform: process.platform,

  // data management
  getDefaultData: () => ipcRenderer.invoke('get-default-data'),
  saveUploadedData: (data, filename) => ipcRenderer.invoke('save-uploaded-data', data, filename),
  getCurrentDataFile: () => ipcRenderer.invoke('get-current-data-file'),
  setCurrentDataFile: (filename) => ipcRenderer.invoke('set-current-data-file', filename),
  loadSavedData: (filename) => ipcRenderer.invoke('load-saved-data', filename),
  listSavedFiles: () => ipcRenderer.invoke('list-saved-files'),
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  deleteFile: (filename) => ipcRenderer.invoke('delete-file', filename),
  getFileTimestamp: (filename) => ipcRenderer.invoke('get-file-timestamp', filename),
  downloadFile: (filename, data) => ipcRenderer.invoke('download-file', filename, data),
});


