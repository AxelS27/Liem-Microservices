import { useState, useEffect, useRef } from 'react'

export default function DiscordPreview({ preset, fields, showTimestamp, isActive }) {
  const [elapsed, setElapsed] = useState('0:00')
  const startRef = useRef(null)

  useEffect(() => {
    if (!isActive || !showTimestamp) {
      setElapsed('0:00')
      startRef.current = null
      return
    }
    startRef.current = Date.now()
    const interval = setInterval(() => {
      const diff = Math.floor((Date.now() - startRef.current) / 1000)
      const h = Math.floor(diff / 3600)
      const m = Math.floor((diff % 3600) / 60)
      const s = diff % 60
      setElapsed(
        h > 0
          ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
          : `${m}:${String(s).padStart(2, '0')}`
      )
    }, 1000)
    return () => clearInterval(interval)
  }, [isActive, showTimestamp])

  const activity = preset?.buildActivity(fields, false) ?? {}
  const details = activity.details || ''
  const state = activity.state || ''

  return (
    <div className="bg-[#1e1f22] rounded-xl overflow-hidden border border-white/5">
      <div className="px-4 pt-4 pb-1">
        <p className="text-[10px] font-bold text-[#b5bac1] uppercase tracking-widest mb-3">
          Playing a Game
        </p>
        <div className="flex gap-3 items-start">
          <div className="shrink-0 w-[72px] h-[72px] bg-[#313338] rounded-lg flex items-center justify-center text-3xl overflow-hidden">
            {preset?.logo
              ? <img src={preset.logo} alt={preset.name} className="w-full h-full object-contain p-2" />
              : (preset?.emoji ?? '🎮')}
          </div>
          <div className="flex flex-col gap-0.5 min-w-0 pt-0.5">
            <p className="text-[14px] font-semibold text-white leading-snug truncate">
              {preset?.name ?? 'App Name'}
            </p>
            {details ? (
              <p className="text-[12px] text-[#b5bac1] truncate">{details}</p>
            ) : (
              <p className="text-[12px] text-white/15 truncate italic">Details will show here</p>
            )}
            {state ? (
              <p className="text-[12px] text-[#b5bac1] truncate">{state}</p>
            ) : null}
            {showTimestamp && (
              <p className="text-[12px] text-[#b5bac1] mt-0.5">
                {isActive ? `${elapsed} elapsed` : <span className="text-white/20">0:00 elapsed</span>}
              </p>
            )}
          </div>
        </div>
      </div>

      {isActive && (
        <div className="mx-4 mt-3 mb-4">
          <div className="h-px bg-white/5 mb-3" />
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
            <span className="text-[11px] text-white/40">Live on Discord</span>
          </div>
        </div>
      )}

      {!isActive && <div className="h-4" />}
    </div>
  )
}
