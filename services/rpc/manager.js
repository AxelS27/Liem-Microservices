import RPC from 'discord-rpc'

class RPCManager {
  constructor() {
    this.client = null
    this.clientId = null
    this.currentActivity = null
    this.connected = false
    this.reconnectTimeout = null
    this.isReconnecting = false
  }

  async connect(clientId) {
    if (this.connected && this.clientId === clientId) return
    await this.disconnect()

    this.clientId = clientId
    try {
      await this._connectRaw(clientId)
    } catch (err) {
      this._scheduleReconnect()
      throw err
    }
  }

  async _connectRaw(clientId) {
    const attempts = 3
    for (let i = 0; i < attempts; i++) {
      try {
        const client = new RPC.Client({ transport: 'ipc' })

        client.on('disconnected', () => {
          console.log('Discord RPC client disconnected')
          this._handleDisconnect()
        })

        client.on('error', (err) => {
          console.error('Discord RPC client error:', err.message || err)
        })

        await client.login({ clientId })

        // Prevent race condition if disconnected/changed during login
        if (this.clientId !== clientId) {
          try { await client.destroy() } catch (_) {}
          return
        }

        this.client = client
        this.connected = true
        return
      } catch (err) {
        if (this.clientId !== clientId) return // Abort if clientId changed during retry delay
        if (i < attempts - 1) {
          await new Promise(r => setTimeout(r, 2000))
        } else {
          throw err
        }
      }
    }
  }

  _handleDisconnect() {
    this.connected = false
    this.client = null
    if (this.clientId && this.currentActivity) {
      this._scheduleReconnect()
    }
  }

  _scheduleReconnect() {
    this._stopReconnect()
    if (this.isReconnecting) return

    this.reconnectTimeout = setTimeout(async () => {
      this.reconnectTimeout = null
      if (!this.clientId || !this.currentActivity) return

      this.isReconnecting = true
      console.log(`Attempting to reconnect to Discord with clientId: ${this.clientId}...`)
      try {
        await this._connectRaw(this.clientId)
        // Check if we still want this activity after connection completes
        if (this.client && this.connected && this.currentActivity) {
          await this.client.setActivity(this.currentActivity)
          console.log('Successfully reconnected to Discord RPC and restored activity')
        }
      } catch (err) {
        console.error('Reconnection attempt failed:', err.message || err)
        this.isReconnecting = false
        this._scheduleReconnect()
      } finally {
        this.isReconnecting = false
      }
    }, 15000)
  }

  _stopReconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }
  }

  async setActivity(activity) {
    this.currentActivity = activity
    if (!this.client || !this.connected) return
    await this.client.setActivity(activity)
  }

  async clearActivity() {
    this._stopReconnect()
    this.currentActivity = null
    if (!this.client || !this.connected) return
    try { await this.client.clearActivity() } catch (_) {}
  }

  async disconnect() {
    this._stopReconnect()
    this.currentActivity = null
    const client = this.client
    this.client = null
    this.clientId = null
    this.connected = false
    
    if (client) {
      try { await client.clearActivity() } catch (_) {}
      try { await client.destroy() } catch (_) {}
    }
  }
}

export default new RPCManager()
