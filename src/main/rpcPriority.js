import rpcManager from '../../services/rpc/manager.js'

const PRIORITY = { zoom: 1, fl: 2 }

let active = null

export async function requestActivity(app, clientId, activity) {
  if (active && PRIORITY[active.app] > PRIORITY[app]) return
  active = { app, clientId, activity }
  try {
    await rpcManager.connect(clientId)
    await rpcManager.setActivity(activity)
  } catch (_) {}
}

export async function releaseActivity(app) {
  if (active?.app !== app) return
  active = null
  try { await rpcManager.clearActivity() } catch (_) {}
}

export function getActive() {
  return active?.app ?? null
}
