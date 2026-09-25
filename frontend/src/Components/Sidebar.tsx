import {
  CalendarDays,
  HeartHandshake,
  LayoutDashboard,
  UsersRound,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

const navigation = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { label: 'Personas', icon: UsersRound, path: '/personas' },
  { label: 'Peticiones', icon: HeartHandshake, path: '/peticiones' },
  { label: 'Agenda', icon: CalendarDays, path: '/agenda' },
]

export default function Sidebar() {
  return (
    <aside className="hidden min-h-screen w-64 shrink-0 border-r border-slate-200 bg-white px-5 py-8 lg:block">
      <div className="mb-12 flex items-center gap-3 px-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white">
          <HeartHandshake size={24} />
        </div>

        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            PrayerCare
          </h1>
          <p className="text-xs text-slate-500">
            Tu espacio de oración
          </p>
        </div>
      </div>

      <nav className="space-y-2">
        {navigation.map(({ label, icon: Icon, path }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}