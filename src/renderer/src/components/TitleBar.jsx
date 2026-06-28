import { useState, useEffect } from 'react'
import logo from '../assets/icon.png'

export default function TitleBar() {
  const [maximized, setMaximized] = useState(false)

  useEffect(() => {
    // Check initial maximized state
    window.liem.window.isMaximized().then(setMaximized)
    
    // Sync window maximized state occasionally
    const interval = setInterval(() => {
      window.liem.window.isMaximized().then(setMaximized)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleMinimize = () => {
    window.liem.window.minimize()
  }

  const handleMaximize = async () => {
    window.liem.window.maximize()
    const max = await window.liem.window.isMaximized()
    setMaximized(max)
  }

  const handleClose = () => {
    window.liem.window.close()
  }

  return (
    <div className="titlebar">
      <div className="titlebar-left">
        <div className="flex items-center gap-2 select-none">
          <img src={logo} alt="Liem Logo" className="w-[16px] h-[16px] shrink-0 object-contain" />
          <span className="text-[11px] font-semibold text-white/55 tracking-wide">
            Liem Microservices
          </span>
        </div>
      </div>

      <div className="titlebar-controls">
        <button className="titlebar-btn" onClick={handleMinimize} title="Minimize">
          <svg width="10" height="1" viewBox="0 0 10 1">
            <rect width="10" height="1.5" fill="currentColor" />
          </svg>
        </button>
        <button className="titlebar-btn" onClick={handleMaximize} title={maximized ? 'Restore' : 'Maximize'}>
          {maximized ? (
            <svg width="10" height="10" viewBox="0 0 10 10">
              <rect x="2" y="0" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <rect x="0" y="2" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 10 10">
              <rect x="0.6" y="0.6" width="8.8" height="8.8" fill="none" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          )}
        </button>
        <button className="titlebar-btn titlebar-close" onClick={handleClose} title="Close">
          <svg width="10" height="10" viewBox="0 0 10 10">
            <line x1="0.5" y1="0.5" x2="9.5" y2="9.5" stroke="currentColor" strokeWidth="1.4" />
            <line x1="9.5" y1="0.5" x2="0.5" y2="9.5" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </button>
      </div>
    </div>
  )
}
