import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('liem', {
  rpc: {
    activate: (config) => ipcRenderer.invoke('rpc:activate', config),
    deactivate: () => ipcRenderer.invoke('rpc:deactivate'),
    status: () => ipcRenderer.invoke('rpc:status')
  },
  config: {
    get: () => ipcRenderer.invoke('config:get'),
    set: (data) => ipcRenderer.invoke('config:set', data)
  },
  autostart: {
    get: () => ipcRenderer.invoke('autostart:get'),
    set: (enabled) => ipcRenderer.invoke('autostart:set', enabled)
  },
  window: {
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close: () => ipcRenderer.send('window:close'),
    isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
    toggleDevTools: () => ipcRenderer.send('window:toggleDevTools'),
    quit: () => ipcRenderer.send('app:quit')
  }
})
