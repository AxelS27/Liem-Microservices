import { useState, useEffect } from 'react'

export default function Settings() {
  const [autostartEnabled, setAutostartEnabled] = useState(null)
  const [autostartBusy, setAutostartBusy] = useState(false)

  useEffect(() => {
    window.liem.autostart.get().then((enabled) => setAutostartEnabled(enabled))
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

  return (
    <div className="p-7 max-w-xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-white/35 text-sm mt-1">Global configuration for Liem services</p>
      </div>

      <div className="space-y-6">
        {/* Startup settings section */}
        <div>
          <h2 className="text-sm font-semibold text-white mb-1">System</h2>
          <p className="text-xs text-white/35 mb-3 leading-relaxed">
            Configure how the application behaves on system boot.
          </p>
          <div className="flex items-center justify-between bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3.5">
            <div>
              <div className="text-sm font-medium text-white/70">Run on startup</div>
              <p className="text-[11px] text-white/25 mt-0.5">Start Liem Control Panel automatically when you log into Windows.</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={autostartEnabled === true}
              onClick={toggleAutostart}
              disabled={autostartEnabled === null || autostartBusy}
              className={`relative w-10 h-6 rounded-full border transition-colors shrink-0 disabled:opacity-50 ${
                autostartEnabled
                  ? 'bg-violet-600 border-violet-600'
                  : 'bg-white/[0.10] border-white/[0.18]'
              }`}
              title={autostartEnabled ? 'Disable' : 'Enable'}
            >
              <span
                className={`absolute top-[3px] w-4 h-4 rounded-full transition-all ${
                  autostartEnabled
                    ? 'left-[21px] bg-white'
                    : 'left-[3px] bg-white/80'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
