import { useNavigate } from 'react-router-dom'

const services = [
  {
    to: '/fakerpc',
    icon: '🎭',
    name: 'FakeRPC',
    description: 'Set a custom Discord Rich Presence for any app',
    status: 'ready'
  },
]

export default function Dashboard() {
  const navigate = useNavigate()

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-white/40 text-sm mt-1">Liem microservices running on your machine</p>
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-2xl">
        {services.map((s) => (
          <button
            key={s.to}
            onClick={() => navigate(s.to)}
            className="text-left bg-white/5 hover:bg-white/8 border border-white/5 hover:border-white/10 rounded-xl p-5 transition-all group"
          >
            <div className="text-2xl mb-3">{s.icon}</div>
            <div className="font-semibold text-white text-sm mb-1 group-hover:text-white">
              {s.name}
            </div>
            <div className="text-xs text-white/35 leading-relaxed">{s.description}</div>
            <div className="mt-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <span className="text-[10px] text-white/30 uppercase tracking-wider">Ready</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
