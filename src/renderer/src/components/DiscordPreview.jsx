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
        <div className="flex items-center justify-between mb-3 select-none">
          <p className="text-[11.5px] font-bold text-[#949ba4] tracking-wide">
            Playing
          </p>
          <span className="text-[#949ba4] text-xs font-bold tracking-[1.5px] opacity-40 hover:opacity-100 transition-opacity duration-150 cursor-pointer">•••</span>
        </div>
        <div className="flex gap-3 items-start">
          <div className="shrink-0 w-[72px] h-[72px] bg-[#313338] rounded-xl flex items-center justify-center text-3xl overflow-hidden">
            {preset?.logo
              ? <img src={preset.logo} alt={preset.name} className="w-full h-full object-cover" />
              : (preset?.emoji ?? '🎮')}
          </div>
          <div className="flex flex-col gap-0.5 min-w-0 pt-0.5">
            <p className="text-[14px] font-semibold text-white leading-snug truncate">
              {preset?.id === 'custom' ? 'Liem RPC' : (preset?.name ?? 'App Name')}
            </p>
            {details ? (
              <p className="text-[12px] text-[#dbdee1] truncate">{details}</p>
            ) : (
              <p className="text-[12px] text-white/15 truncate italic">Details will show here</p>
            )}
            {state ? (
              <p className="text-[12px] text-[#dbdee1] truncate">{state}</p>
            ) : null}
            {showTimestamp && (
              <div className="flex items-center gap-1.5 text-[12px] text-[#23a55a] font-medium mt-0.5">
                <svg viewBox="0 0 24 24" className="w-[14px] h-[14px] shrink-0" fill="currentColor">
                  {/* Solid controller body */}
                  <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.106-.01.159v5.5C2.692 17.502 5.099 20 8.08 20c1.76 0 3.308-.888 4.21-2.235l.71-1.065.71 1.065C14.612 19.112 16.16 20 17.92 20c2.98 0 5.388-2.498 5.388-5.75v-5.5c0-.053-.004-.107-.01-.159A4 4 0 0 0 17.32 5z" />
                  {/* Cutout D-pad */}
                  <line x1="6" x2="10" y1="11" y2="11" stroke="#1e1f22" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="8" x2="8" y1="9" y2="13" stroke="#1e1f22" strokeWidth="1.5" strokeLinecap="round" />
                  {/* Cutout Buttons */}
                  <circle cx="15" cy="12" r="1.1" fill="#1e1f22" />
                  <circle cx="18" cy="9.5" r="1.1" fill="#1e1f22" />
                </svg>
                <span className="truncate">{isActive ? elapsed : '0:00'}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mx-4 mt-3 mb-4">
        <div className="h-px bg-white/5 mb-3" />
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full shrink-0 ${isActive ? 'bg-green-400' : 'bg-red-500'}`} />
          <span className="text-[11px] text-white/40">
            {isActive ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>
    </div>
  )
}
