import RPC from 'discord-rpc'

class RPCManager {
  constructor() {
    this.client = null
    this.connected = false
    this.currentClientId = null
    this.currentActivity = null
    this.heartbeat = null
  }

  async connect(clientId) {
    if (this.connected && this.currentClientId === clientId) return
    await this.disconnect()

    if (this.connected && this.currentClientId === clientId) return

    const attempts = 3
    for (let i = 0; i < attempts; i++) {
      try {
        const client = new RPC.Client({ transport: 'ipc' })
        await client.login({ clientId })
        this.client = client
        this.connected = true
        this.currentClientId = clientId
        return
      } catch (err) {
        if (i < attempts - 1) await new Promise(r => setTimeout(r, 2000))
        else throw err
      }
    }
  }

  async setActivity(activity) {
    if (!this.client || !this.connected) throw new Error('Not connected to Discord')
    this.currentActivity = activity
    await this.client.setActivity(activity)
    this._startHeartbeat()
  }

  _startHeartbeat() {
    this._stopHeartbeat()
    this.heartbeat = setInterval(async () => {
      if (this.client && this.connected && this.currentActivity) {
        try { await this.client.setActivity(this.currentActivity) } catch (_) {}
      }
    }, 5000)
  }

  _stopHeartbeat() {
    if (this.heartbeat) { clearInterval(this.heartbeat); this.heartbeat = null }
  }

  async clearActivity() {
    this._stopHeartbeat()
    this.currentActivity = null
    if (!this.client || !this.connected) return
    try { await this.client.clearActivity() } catch (_) {}
  }

  async disconnect() {
    this._stopHeartbeat()
    this.currentActivity = null
    if (!this.client) return
    try { await this.client.clearActivity() } catch (_) {}
    try { await this.client.destroy() } catch (_) {}
    this.client = null
    this.connected = false
    this.currentClientId = null
  }
}

export default new RPCManager()
