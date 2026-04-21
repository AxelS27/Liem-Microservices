import { useState, useEffect } from 'react'

const MANUAL_PRESETS = [
  { id: 'spotify', name: 'Spotify', emoji: '🎵' },
  { id: 'custom', name: 'Custom', emoji: '✏️' }
]

export default function Settings() {
  const [clientIds, setClientIds] = useState({})
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    window.liem.config.get().then((cfg) => setClientIds(cfg.clientIds ?? {}))
  }, [])

  function setId(presetId, value) {
    setClientIds((prev) => ({ ...prev, [presetId]: value }))
    setSaved(false)
  }

  async function handleSave() {
    const cfg = await window.liem.config.get()
    await window.liem.config.set({ ...cfg, clientIds })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="p-7 max-w-xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-white/35 text-sm mt-1">Global configuration for Liem services</p>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-sm font-semibold text-white mb-1">Discord Client IDs</h2>
          <p className="text-xs text-white/35 mb-1 leading-relaxed">
            Netflix and YouTube are built-in. For other presets, create a Discord app at{' '}
            <span className="text-violet-400/80">discord.com/developers</span> and paste its Application ID here.
          </p>

          <div className="mb-3 flex items-center gap-2 text-[11px] text-white/20">
            <span>🎬 Netflix</span>
            <span>·</span>
            <span>▶️ YouTube</span>
            <span className="ml-1 text-green-400/50">built-in</span>
          </div>

          <div className="space-y-2.5">
            {MANUAL_PRESETS.map((preset) => (
              <div
                key={preset.id}
                className="flex items-center gap-4 bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3"
              >
                <div className="flex items-center gap-2.5 w-28 shrink-0">
                  <span className="text-lg leading-none">{preset.emoji}</span>
                  <span className="text-sm font-medium text-white/70">{preset.name}</span>
                </div>
                <input
                  type="text"
                  value={clientIds[preset.id] ?? ''}
                  onChange={(e) => setId(preset.id, e.target.value)}
                  placeholder="Application ID"
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/15 focus:outline-none focus:border-white/25 font-mono"
                />
                {clientIds[preset.id] && (
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            saved
              ? 'bg-green-600/20 text-green-400 border border-green-500/20'
              : 'bg-violet-600 hover:bg-violet-500 text-white'
          }`}
        >
          {saved ? 'Saved!' : 'Save'}
        </button>
      </div>
    </div>
  )
}
