
import { useState } from 'react'
import {
  Bell,
  ChevronRight,
  Heart,
  Search,
  Sparkles,
} from 'lucide-react'
import {
  Link,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom'

import Sidebar from './Components/Sidebar'
import ProtectedRoute from './Components/ProtectedRoute'

import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import PeoplePage from './pages/PeoplePage'
import PersonDetailPage from './pages/PersonDetailPage'
import PrayerRequestsPage from './pages/PrayerRequestsPage'

const pageDetails = [
  {
    match: (path: string) => path === '/',
    title: 'Mi espacio',
    subtitle: 'Un lugar para descansar y confiar.',
  },
  {
    match: (path: string) => path === '/personas',
    title: 'Personas',
    subtitle: 'Aquellos que llevas en oración.',
  },
  {
    match: (path: string) => path.startsWith('/personas/'),
    title: 'Una historia especial',
    subtitle: 'Acompañar también es una forma de amar.',
  },
  {
    match: (path: string) => path === '/peticiones',
    title: 'Mis peticiones',
    subtitle: 'Lo que pongo en Sus manos.',
  },
  {
    match: (path: string) => path === '/agenda',
    title: 'Mi agenda',
    subtitle: 'Un momento para estar presente.',
  },
]

function AppLayout() {
  const location = useLocation()
  const [showSearch, setShowSearch] = useState(false)

  const currentPage =
    pageDetails.find((page) => page.match(location.pathname)) ??
    pageDetails[0]

  return (
    <div className="pc-atmosphere flex min-h-screen">
      <Sidebar />

      <div className="relative flex min-w-0 flex-1 flex-col">
        {/* HEADER */}
        <header className="sticky top-0 z-30 border-b border-[#526e82]/10 bg-[#f8f5f0]/80 backdrop-blur-xl">
          <div className="mx-auto flex h-[86px] max-w-[1600px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-12">
            {/* IDENTIDAD DE PÁGINA */}
            <div className="min-w-0">
              <div className="mb-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.17em] text-[#8394a3]">
                <Link
                  to="/"
                  className="transition hover:text-[#526e82]"
                >
                  PrayerCare
                </Link>

                <ChevronRight size={12} />

                <span className="truncate text-[#526e82]">
                  {currentPage.title}
                </span>
              </div>

              <p className="truncate text-sm font-medium text-[#526e82]">
                {currentPage.subtitle}
              </p>
            </div>

            {/* ACCIONES */}
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <div className="hidden items-center gap-2 rounded-full border border-[#526e82]/10 bg-white/60 px-4 py-2 text-xs font-medium text-[#718394] xl:flex">
                <Sparkles size={14} className="text-[#c99c73]" />
                Un espacio para confiar
              </div>

              <button
                type="button"
                aria-label="Mostrar búsqueda"
                aria-expanded={showSearch}
                onClick={() => setShowSearch((value) => !value)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#526e82]/10 bg-white/70 text-[#526e82] transition hover:bg-white"
              >
                <Search size={18} />
              </button>

              <div className="relative">
                <button
                  type="button"
                  aria-label="Notificaciones (próximamente)"
                  disabled
                  title="Notificaciones próximamente"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#526e82]/10 bg-white/70 text-[#526e82] opacity-50"
                >
                  <Bell size={18} />
                </button>
              </div>

              <div className="ml-1 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#526e82] to-[#a8b9d0] text-white shadow-[0_8px_22px_rgba(82,110,130,0.18)]">
                <Heart size={17} fill="currentColor" />
              </div>
            </div>
          </div>

          {/* BÚSQUEDA EN DESARROLLO */}
          {showSearch && (
            <div className="border-t border-[#526e82]/10 px-5 py-3 sm:px-8 lg:px-12">
              <div className="mx-auto max-w-[1600px]">
                <div className="flex items-center gap-3 rounded-2xl border border-[#526e82]/10 bg-white/80 px-4 py-3">
                  <Search size={18} className="text-[#8394a3]" />

                  <p className="text-sm text-[#8394a3]">
                    La búsqueda global estará disponible próximamente.
                  </p>
                </div>
              </div>
            </div>
          )}
        </header>

        {/* CONTENIDO */}
        <main className="relative z-10 w-full flex-1">
          <div className="mx-auto max-w-[1600px] px-5 pb-24 pt-8 sm:px-8 lg:px-12 lg:pb-12 lg:pt-10">
            <Routes>
              <Route path="/" element={<DashboardPage />} />

              <Route path="/personas" element={<PeoplePage />} />

              <Route
                path="/personas/:personId"
                element={<PersonDetailPage />}
              />

              <Route
                path="/peticiones"
                element={<PrayerRequestsPage />}
              />

              <Route
                path="/agenda"
                element={
                  <div className="pc-card p-10">
                    <span className="pc-eyebrow">
                      PRÓXIMAMENTE
                    </span>

                    <h1 className="pc-heading mt-4 text-5xl text-[#263d50]">
                      Tu tiempo con Dios
                    </h1>

                    <p className="pc-body mt-4 max-w-xl">
                      Muy pronto tendrás aquí un espacio
                      dedicado a tus recordatorios y
                      momentos de oración.
                    </p>
                  </div>
                }
              />
            </Routes>
          </div>
        </main>

        {/* FOOTER */}
        <footer className="border-t border-[#526e82]/10 px-5 py-5 sm:px-8 lg:px-12">
          <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-[#97a4af]">
              PrayerCare · Surrender
            </p>

            <p className="text-xs text-[#97a4af]">
              Inspirado en 1 Pedro 5:7
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default function App() {
  const location = useLocation()

  if (location.pathname === '/login') {
    return <LoginPage />
  }

  return (
    <ProtectedRoute>
      <AppLayout />
    </ProtectedRoute>
  )
}
