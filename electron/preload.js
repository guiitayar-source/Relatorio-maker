const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  saveFile: (buffer, fileName) => ipcRenderer.invoke('save-file', buffer, fileName),
  googleLogin: () => ipcRenderer.invoke('google-login')
});
