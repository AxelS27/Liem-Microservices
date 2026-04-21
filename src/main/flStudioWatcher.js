import { exec } from 'child_process'
import { requestActivity, releaseActivity } from './rpcPriority.js'

const FL_CLIENT_ID = '1495741635458498720'

let interval = null
let running = false
let currentProject = null
let startTimestamp = null
let scriptPath = null

function parseProject(title) {
  // "ProjectName.flp - FL Studio 2024" → "ProjectName"
  const match = title.match(/^(.+?)\.flp\s+-\s+FL Studio/i)
  return match ? match[1].trim() : null
}

function poll() {
  exec(
    `powershell -NoProfile -ExecutionPolicy Bypass -File "${scriptPath}"`,
    async (err, stdout) => {
      const title = err ? '' : stdout.trim()
      const nowRunning = title.length > 0
      const project = nowRunning ? parseProject(title) : null

      if (nowRunning === running && project === currentProject) return
      running = nowRunning
      currentProject = project

      if (nowRunning) {
        if (!startTimestamp) startTimestamp = Date.now()
        await requestActivity('fl', FL_CLIENT_ID, {
          details: `Project: ${project ?? 'Untitled'}`,
          startTimestamp
        })
      } else {
        startTimestamp = null
        await releaseActivity('fl')
      }
    }
  )
}

export function startFlWatcher(path) {
  scriptPath = path
  poll()
  interval = setInterval(poll, 5000)
}

export function stopFlWatcher() {
  if (interval) { clearInterval(interval); interval = null }
}
