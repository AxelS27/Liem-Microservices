import { useState, useEffect, useRef } from 'react'

const ACCENT_PRESETS = [
  '#d97706', '#f59e0b', '#f97316', '#ef4444',
  '#f43f5e', '#ec4899', '#a855f7', '#8b5cf6',
  '#6366f1', '#3b82f6', '#06b6d4', '#14b8a6',
  '#22c55e', '#84cc16', '#e2e8f0', '#94a3b8',
]

const ACCENT_COLORS = [
  { name: 'Orange', value: '#d97706' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#10b981' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Purple', value: '#8b5cf6' }
]

function ColorPicker({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const [hex, setHex]   = useState(value)
  const ref = useRef(null)

  useEffect(() => { setHex(value) }, [value])

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const commit = (color) => {
    const clean = color.startsWith('#') ? color : '#' + color
    if (/^#[0-9a-fA-F]{6}$/.test(clean)) {
      onChange(clean)
      setHex(clean)
    }
  }

  return (
    <div className="cp-wrap" ref={ref}>
      <button
        type="button"
        className="cp-swatch-btn"
        style={{ background: value }}
        onClick={() => setOpen((v) => !v)}
        title="Pick accent color"
      />

      {open && (
        <div className="cp-popover">
          <div className="cp-presets">
            {ACCENT_PRESETS.map((c) => (
              <button
                type="button"
                key={c}
                className={`cp-preset ${value === c ? 'cp-preset--active' : ''}`}
                style={{ background: c }}
                onClick={() => { commit(c); setOpen(false); }}
              />
            ))}
          </div>

          <div className="cp-custom-row">
            <label className="cp-native-wrap" title="Open color wheel">
              <input
                type="color"
                className="cp-native"
                value={value}
                onChange={(e) => { setHex(e.target.value); onChange(e.target.value); }}
              />
              <span className="cp-native-icon">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M8 2a6 6 0 010 12" stroke="#f97316" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M8 2a6 6 0 016 6" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M14 8a6 6 0 01-6 6" stroke="#22c55e" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </span>
            </label>

            <span className="cp-hash">#</span>
            <input
              className="cp-hex"
              value={hex.replace('#', '')}
              maxLength={6}
              spellCheck={false}
              onChange={(e) => setHex('#' + e.target.value)}
              onBlur={(e) => commit('#' + e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { commit('#' + e.currentTarget.value); setOpen(false); } }}
            />
            <div className="cp-preview" style={{ background: value }} />
          </div>
        </div>
      )}
    </div>
  )
}

export default function Settings() {
  const [autostartEnabled, setAutostartEnabled] = useState(null)
  const [autostartBusy, setAutostartBusy] = useState(false)
  const [accentColor, setAccentColor] = useState('#d97706')

  useEffect(() => {
    window.liem.autostart.get().then((enabled) => setAutostartEnabled(enabled))
    window.liem.config.get().then((config) => {
      if (config && config.accentColor) {
        setAccentColor(config.accentColor)
      }
    })
  }, [])

  async function toggleAutostart() {
    if (autostartBusy || autostartEnabled === null) return
    const next = !autostartEnabled
    setAutostartBusy(true)
    setAutostartEnabled(next)
    try {
      const applied = await window.liem.autostart.set(next)
      setAutostartEnabled(applied)
    } catch (err) {
      console.error('Failed to set autostart:', err)
      setAutostartEnabled(!next)
    } finally {
      setAutostartBusy(false)
    }
  }

  async function changeAccentColor(color) {
    setAccentColor(color)
    document.documentElement.style.setProperty('--accent', color)
    try {
      const current = await window.liem.config.get()
      await window.liem.config.set({ ...current, accentColor: color })
    } catch (err) {
      console.error('Failed to save accent color:', err)
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Settings</h1>
        <p className="text-liem-text-dim text-sm mt-1">Global configuration for Liem services</p>
      </div>

      <div className="mt-8 space-y-6">
        {/* Appearance settings section */}
        <div>
          <div className="text-[11px] font-semibold tracking-widest text-liem-accent uppercase mb-3">
            Appearance
          </div>
          
          <div className="flex items-center justify-between py-2">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm text-[#d4d4d4]">Accent color</span>
              <span className="text-xs text-liem-text-dim">
                Customize the primary accent color of the control panel interface.
              </span>
            </div>
            
            <ColorPicker value={accentColor} onChange={changeAccentColor} />
          </div>
        </div>

        <div className="h-px bg-white/[0.04]" />

        {/* Startup settings section */}
        <div>
          <div className="text-[11px] font-semibold tracking-widest text-liem-accent uppercase mb-3">
            System
          </div>
          
          <div className="flex items-center justify-between py-2">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm text-[#d4d4d4]">Run on startup</span>
              <span className="text-xs text-liem-text-dim">
                Start Liem Microservices automatically when you log into Windows.
              </span>
            </div>
            
            <button
              type="button"
              role="switch"
              aria-checked={autostartEnabled === true}
              onClick={toggleAutostart}
              disabled={autostartEnabled === null || autostartBusy}
              className={`relative w-[36px] h-[20px] rounded-full transition-colors shrink-0 disabled:opacity-50 ${
                autostartEnabled ? 'bg-liem-accent' : 'bg-[#2e2e2e]'
              }`}
              title={autostartEnabled ? 'Disable' : 'Enable'}
            >
              <span
                className={`absolute top-[3px] w-[14px] h-[14px] rounded-full bg-white transition-all ${
                  autostartEnabled ? 'left-[19px]' : 'left-[3px]'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
