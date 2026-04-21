import RPC from 'discord-rpc'

class RPCManager {
  constructor() {
    this.client = null
    this.clientId = null
    this.currentActivity = null
    this.heartbeat = null
    this.connected = false
  }

  async connect(clientId) {
    if (this.connected && this.clientId === clientId) return
    await this.disconnect()

    const attempts = 3
    for (let i = 0; i < attempts; i++) {
      try {
        const client = new RPC.Client({ transport: 'ipc' })
        await client.login({ clientId })
        this.client = client
        this.clientId = clientId
        this.connected = true
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
    this.clientId = null
    this.connected = false
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
}

export default new RPCManager()
