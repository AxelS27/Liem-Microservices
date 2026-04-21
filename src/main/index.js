import { app, BrowserWindow, Tray, Menu, ipcMain, nativeImage } from 'electron'
import { join } from 'path'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { is } from '@electron-toolkit/utils'
import { registerRpcHandlers } from '../../services/rpc/ipc.js'
import { startWatcher } from './processWatcher.js'
import { startFlWatcher } from './flStudioWatcher.js'

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
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => mainWindow.show())

  mainWindow.on('close', (e) => {
    e.preventDefault()
    mainWindow.hide()
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function createTray() {
  tray = new Tray(nativeImage.createEmpty())
  tray.setToolTip('Liem Control Panel')
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: 'Open Liem', click: () => mainWindow.show() },
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

app.whenReady().then(() => {
  createWindow()
  createTray()
  startWatcher()
  startFlWatcher(join(app.getAppPath(), 'resources', 'get-fl-title.ps1'))
})

app.on('window-all-closed', (e) => e.preventDefault())
