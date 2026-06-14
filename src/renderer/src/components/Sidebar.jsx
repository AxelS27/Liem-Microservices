import { NavLink } from 'react-router-dom'

export default function Sidebar() {
  return (
    <aside className="w-52 bg-[#111118] border-r border-white/5 flex flex-col shrink-0">
      <div className="px-5 pt-6 pb-5 border-b border-white/5">
        <div className="text-base font-bold tracking-[0.2em] text-white">LIEM</div>
        <div className="text-[11px] text-white/25 mt-0.5 tracking-wide">Control Panel</div>
      </div>

      <nav className="flex-1 px-3 pt-4">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm mb-1 transition-colors ${
              isActive ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/60 hover:bg-white/5'
            }`
          }
        >
          <span className="text-base leading-none">⊹</span>
          <span className="font-medium">Dashboard</span>
        </NavLink>

        <p className="px-3 mt-4 mb-2 text-[10px] font-semibold text-white/25 uppercase tracking-widest">
          Services
        </p>

        <NavLink
          to="/fakerpc"
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm mb-0.5 transition-colors ${
              isActive ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70 hover:bg-white/5'
            }`
          }
        >
          <span className="text-base leading-none">🎭</span>
          <span className="font-medium">FakeRPC</span>
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm mb-0.5 transition-colors ${
              isActive ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70 hover:bg-white/5'
            }`
          }
        >
          <span className="text-base leading-none">⚙️</span>
          <span className="font-medium">Settings</span>
        </NavLink>
      </nav>

      <div className="px-5 py-3 border-t border-white/5 text-[10px] text-white/15">v0.1.0</div>
    </aside>
  )
}
