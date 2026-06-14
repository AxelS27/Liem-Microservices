import { useState, useEffect } from 'react'
import DiscordPreview from '../components/DiscordPreview'
import netflixLogo from '../assets/netflix.jpg'
import youtubeLogo from '../assets/youtube.jpg'
import dimsumLogo from '../assets/dimsum_studio.png'

const PRESETS = [
  {
    id: 'netflix',
    name: 'Netflix',
    emoji: '🎬',
    logo: netflixLogo,
    clientId: '1495713625111793694',
    fields: [
      { key: 'title', label: 'Title', placeholder: 'Inception' },
      { key: 'episode', label: 'Episode', placeholder: '5 (optional)' },
      { key: 'season', label: 'Season', placeholder: '2 (optional)' }
    ],
    buildActivity(f, showTimestamp) {
      const epState = (() => {
        if (!f.episode) return undefined
        const ep = `Eps ${f.episode}`
        return f.season ? `${ep} · Season ${f.season}` : ep
      })()
      return {
        details: (f.title || 'something').padEnd(2, ' '),
        state: epState,
        largeImageKey: 'netflix',
        largeImageText: 'Netflix',
        ...(showTimestamp && { startTimestamp: Date.now() })
      }
    }
  },
  {
    id: 'youtube',
    name: 'YouTube',
    emoji: '▶️',
    logo: youtubeLogo,
    clientId: '1495713746642014309',
    fields: [
      { key: 'title', label: 'Video Title', placeholder: 'My Favorite Video' },
      { key: 'channel', label: 'Channel', placeholder: 'Channel Name (optional)' }
    ],
    buildActivity(f, showTimestamp) {
      return {
        details: f.title || 'Watching a video',
        state: f.channel ? `by ${f.channel}` : undefined,
        largeImageKey: 'youtube',
        largeImageText: 'YouTube',
        ...(showTimestamp && { startTimestamp: Date.now() })
      }
    }
  },
  {
    id: 'dimsum',
    name: 'Dimsum Studio',
    emoji: '🥟',
    logo: dimsumLogo,
    clientId: '1506975051776528584',
    fields: [
      { key: 'status', label: 'Status', placeholder: 'creating content' }
    ],
    buildActivity(f, showTimestamp) {
      return {
        details: (f.status || 'creating content').padEnd(2, ' '),
        largeImageKey: 'dimsum_studio',
        largeImageText: 'Dimsum Studio',
        ...(showTimestamp && { startTimestamp: Date.now() })
      }
    }
  }
]

const STATUS_BADGE = {
  idle: { label: 'Inactive', dot: 'bg-white/20', text: 'text-white/30' },
  connecting: { label: 'Connecting…', dot: 'bg-yellow-400 animate-pulse', text: 'text-yellow-400' },
  active: { label: 'Live', dot: 'bg-green-400', text: 'text-green-400' },
  error: { label: 'Error', dot: 'bg-red-400', text: 'text-red-400' }
}

function loadLocal() {
  try { return JSON.parse(localStorage.getItem('fakerpc') ?? '{}') } catch { return {} }
}

export default function FakeRPC() {
  const saved = loadLocal()

  const [presetId, setPresetId] = useState(saved.presetId ?? 'netflix')
  const [fields, setFields] = useState(saved.fields ?? {})
  const [showTimestamp, setShowTimestamp] = useState(saved.showTimestamp ?? true)
  const [activePresetId, setActivePresetId] = useState(null)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)

  const preset = PRESETS.find((p) => p.id === presetId)
  const isActive = activePresetId === presetId

  useEffect(() => {
    window.liem.rpc.status().then((s) => {
      if (s.connected) {
        const saved = loadLocal()
        setActivePresetId(saved.activePresetId ?? null)
        setStatus('active')
      }
    })
  }, [])

  useEffect(() => {
    localStorage.setItem('fakerpc', JSON.stringify({ presetId, fields, showTimestamp, activePresetId }))
  }, [presetId, fields, showTimestamp, activePresetId])

  function handlePresetChange(id) {
    setPresetId(id)
    setFields({})
    setError(null)
  }

  function setField(key, value) {
    setFields((f) => ({ ...f, [key]: value }))
  }

  async function handleActivate() {
    setStatus('connecting')
    setError(null)
    const activity = preset.buildActivity(fields, showTimestamp)
    const result = await window.liem.rpc.activate({ clientId: preset.clientId, activity })
    if (result.success) {
      setActivePresetId(presetId)
      setStatus('active')
    } else {
      setStatus('error')
      setError(result.error)
    }
  }

  async function handleDeactivate() {
    await window.liem.rpc.deactivate()
    setActivePresetId(null)
    setStatus('idle')
  }

  const badge = STATUS_BADGE[status]

  return (
    <div className="p-7 max-w-5xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">FakeRPC</h1>
          <p className="text-white/35 text-sm mt-1">Set a custom Discord Rich Presence for any app</p>
        </div>
        <div className="flex items-center gap-2 mt-1 bg-white/5 rounded-full px-3 py-1.5">
          <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
          <span className={`text-xs font-medium ${badge.text}`}>{badge.label}</span>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_320px] gap-7">
        <div className="space-y-6">
          {/* Presets */}
          <div>
            <label className="block text-[11px] font-semibold text-white/35 uppercase tracking-widest mb-3">
              Preset
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handlePresetChange(p.id)}
                  className={`flex items-center gap-2.5 py-3 px-4 rounded-xl text-sm font-medium transition-all border ${
                    presetId === p.id
                      ? 'bg-white/10 border-white/20 text-white'
                      : 'bg-white/[0.03] border-white/5 text-white/40 hover:bg-white/6 hover:text-white/60'
                  }`}
                >
                  <span className="text-xl leading-none">{p.emoji}</span>
                  <span>{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic fields */}
          <div>
            <label className="block text-[11px] font-semibold text-white/35 uppercase tracking-widest mb-3">
              Details
            </label>
            <div className="space-y-3">
              {preset?.fields.map((field) => (
                <div key={field.key}>
                  <label className="block text-xs text-white/35 mb-1.5">{field.label}</label>
                  <input
                    type="text"
                    value={fields[field.key] ?? ''}
                    onChange={(e) => setField(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/15 focus:outline-none focus:border-white/25"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Timestamp toggle */}
          <button
            onClick={() => setShowTimestamp((v) => !v)}
            className="flex items-center gap-3 group"
          >
            <div className={`relative w-9 h-5 rounded-full transition-colors ${showTimestamp ? 'bg-violet-600' : 'bg-white/10'}`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${showTimestamp ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-sm text-white/50 group-hover:text-white/70 transition-colors">Show elapsed time</span>
          </button>

          {error && (
            <div className="bg-red-500/8 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {isActive ? (
            <button
              onClick={handleDeactivate}
              className="w-full bg-white/6 hover:bg-white/10 text-white/70 hover:text-white font-semibold rounded-xl py-3 text-sm transition-colors border border-white/8"
            >
              Deactivate
            </button>
          ) : (
            <button
              onClick={handleActivate}
              disabled={status === 'connecting'}
              className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3 text-sm transition-colors"
            >
              {status === 'connecting' ? 'Connecting to Discord…' : 'Activate RPC'}
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-white/35 uppercase tracking-widest mb-3">
              Discord Preview
            </label>
            <DiscordPreview
              preset={preset}
              fields={fields}
              showTimestamp={showTimestamp}
              isActive={isActive}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
