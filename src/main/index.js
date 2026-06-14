import { app, BrowserWindow, Tray, Menu, ipcMain } from 'electron'
import { join } from 'path'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { autoUpdater } from 'electron-updater'
import { registerRpcHandlers } from '../../services/rpc/ipc.js'
import { startWatcher } from './processWatcher.js'
import { startFlWatcher } from './flStudioWatcher.js'

const isDev = process.env.NODE_ENV === 'development'

function resourcePath(...parts) {
  return isDev
    ? join(__dirname, '../../resources', ...parts)
    : join(process.resourcesPath, 'resources', ...parts)
}

function getIconPath() {
  return resourcePath('icon.png')
}

function getTrayIconPath() {
  return resourcePath('icon.ico')
}

function configPath() {
  return join(app.getPath('userData'), 'config.json')
}

function readConfig() {
  try {
    if (!existsSync(configPath())) return {}
    return JSON.parse(readFileSync(configPath(), 'utf-8'))
  } catch { return {} }
}

function writeConfig(data) {
  writeFileSync(configPath(), JSON.stringify(data, null, 2))
}

let mainWindow
let tray

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1050,
    height: 680,
    minWidth: 860,
    minHeight: 580,
    backgroundColor: '#0a0a0f',
    show: false,
    icon: getIconPath(),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  const startHidden = app.getLoginItemSettings().wasOpenedAsHidden || process.argv.includes('--hidden')
  mainWindow.on('ready-to-show', () => { if (!startHidden) mainWindow.show() })

  mainWindow.on('close', (e) => {
    e.preventDefault()
    mainWindow.hide()
  })

  if (isDev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function createTray() {
  tray = new Tray(getTrayIconPath())
  tray.setToolTip('Liem Microservice')
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: 'Open Liem Microservice', click: () => mainWindow.show() },
      { type: 'separator' },
      { label: 'Quit', click: () => app.exit(0) }
    ])
  )
  tray.on('click', () => {
    mainWindow.isVisible() ? mainWindow.focus() : mainWindow.show()
  })
}

registerRpcHandlers()

ipcMain.handle('config:get', () => readConfig())
ipcMain.handle('config:set', (_, data) => { writeConfig(data); return { success: true } })

ipcMain.handle('autostart:get', () => {
  return app.getLoginItemSettings({
    path: process.execPath,
    args: ['--hidden']
  }).openAtLogin
})

ipcMain.handle('autostart:set', (_, enabled) => {
  app.setLoginItemSettings({
    openAtLogin: enabled,
    path: process.execPath,
    args: ['--hidden']
  })
  const markerPath = join(app.getPath('userData'), 'autostart-initialized')
  if (!existsSync(markerPath)) {
    try {
      writeFileSync(markerPath, '1')
    } catch (err) {
      console.error('Failed to write autostart marker:', err)
    }
  }
  return app.getLoginItemSettings({
    path: process.execPath,
    args: ['--hidden']
  }).openAtLogin
})

const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.show()
      mainWindow.focus()
    }
  })

  app.whenReady().then(() => {
    if (!isDev) {
      const markerPath = join(app.getPath('userData'), 'autostart-initialized')
      if (!existsSync(markerPath)) {
        app.setLoginItemSettings({
          openAtLogin: true,
          path: process.execPath,
          args: ['--hidden']
        })
        try {
          writeFileSync(markerPath, '1')
        } catch (err) {
          console.error('Failed to write autostart marker:', err)
        }
      } else {
        const settings = app.getLoginItemSettings({
          path: process.execPath,
          args: ['--hidden']
        })
        if (settings.openAtLogin) {
          app.setLoginItemSettings({
            openAtLogin: true,
            path: process.execPath,
            args: ['--hidden']
          })
        }
      }
    }
    createWindow()
    createTray()
    startWatcher()
    startFlWatcher(resourcePath('get-fl-title.ps1'))
    if (!isDev) autoUpdater.checkForUpdatesAndNotify()
  })
}

app.on('window-all-closed', (e) => e.preventDefault())
