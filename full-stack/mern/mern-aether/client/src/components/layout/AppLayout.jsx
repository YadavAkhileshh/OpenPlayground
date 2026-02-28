import { Outlet, NavLink } from 'react-router-dom'
import { Share2, CircuitBoard, ScrollText } from 'lucide-react'

const links = [
  { to: '/', label: 'Studio', icon: Share2, exact: true },
  { to: '/playbooks', label: 'Playbooks', icon: ScrollText },
  { to: '/blueprints', label: 'Blueprints', icon: CircuitBoard },
]

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-midnight text-white">
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-10 lg:px-16">
        <nav className="flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.5em] text-white/50">Aether command surface</p>
            <h1 className="text-2xl font-semibold text-white">Collaborative System Architect</h1>
          </div>
          <div className="flex flex-wrap gap-2 text-sm font-semibold">
            {links.map((link) => {
              const Icon = link.icon
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.exact}
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-full border px-4 py-2 transition ${
                      isActive ? 'border-cyan-400/80 text-cyan-200 bg-cyan-500/10' : 'border-white/10 text-white/60'
                    }`
                  }
                >
                  <Icon size={16} />
                  {link.label}
                </NavLink>
              )
            })}
          </div>
        </nav>

        <div className="py-8">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default AppLayout
