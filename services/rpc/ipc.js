import { ipcMain } from 'electron'
import rpcManager from './manager.js'

export function registerRpcHandlers() {
  ipcMain.handle('rpc:activate', async (_, { clientId, activity }) => {
    try {
      await rpcManager.connect(clientId)
      await rpcManager.setActivity(activity)
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('rpc:deactivate', async () => {
    await rpcManager.clearActivity()
    return { success: true }
  })

  ipcMain.handle('rpc:status', () => ({ connected: rpcManager.connected }))
}
