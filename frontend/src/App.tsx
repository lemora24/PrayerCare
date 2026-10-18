
import { useCallback, useState } from 'react'
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
import GlobalSearch from './Components/GlobalSearch'
import NotificationCenter from './Components/NotificationCenter'

import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import PeoplePage from './pages/PeoplePage'
import PersonDetailPage from './pages/PersonDetailPage'
import PrayerRequestsPage from './pages/PrayerRequestsPage'
import AgendaPage from './pages/AgendaPage'

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
  const [showNotifications, setShowNotifications] =
    useState(false)
  const [unreadNotifications, setUnreadNotifications] =
    useState(0)

  const closeSearch = useCallback(() => {
    setShowSearch(false)
  }, [])

  const closeNotifications = useCallback(() => {
    setShowNotifications(false)
  }, [])

  const handleUnreadCountChange = useCallback(
    (count: number) => {
      setUnreadNotifications(count)
    },
    [],
  )

  const currentPage =
    pageDetails.find((page) =>
      page.match(location.pathname),
    ) ?? pageDetails[0]

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
                <Sparkles
                  size={14}
                  className="text-[#c99c73]"
                />

                Un espacio para confiar
              </div>

              {/* BÚSQUEDA GLOBAL */}
              <button
                type="button"
                aria-label="Abrir búsqueda global"
                aria-haspopup="dialog"
                aria-expanded={showSearch}
                onClick={() => {
                  setShowNotifications(false)
                  setShowSearch(true)
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#526e82]/10 bg-white/70 text-[#526e82] transition hover:border-[#526e82]/25 hover:bg-white hover:shadow-[0_5px_18px_rgba(38,61,80,0.07)]"
              >
                <Search size={18} />
              </button>

              {/* CENTRO DE NOTIFICACIONES */}
              <button
                type="button"
                aria-label={
                  unreadNotifications > 0
                    ? `Abrir notificaciones, ${unreadNotifications} pendientes`
                    : 'Abrir notificaciones'
                }
                aria-haspopup="dialog"
                aria-expanded={showNotifications}
                onClick={() => {
                  setShowSearch(false)
                  setShowNotifications(true)
                }}
                className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#526e82]/10 bg-white/70 text-[#526e82] transition hover:border-[#526e82]/25 hover:bg-white hover:shadow-[0_5px_18px_rgba(38,61,80,0.07)]"
              >
                <Bell size={18} />

                {unreadNotifications > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-[#f8f5f0] bg-[#a58cae] px-1 text-[9px] font-bold text-white">
                    {unreadNotifications > 9
                      ? '9+'
                      : unreadNotifications}
                  </span>
                )}
              </button>

              {/* IDENTIDAD VISUAL */}
              <div className="ml-1 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#526e82] to-[#a8b9d0] text-white shadow-[0_8px_22px_rgba(82,110,130,0.18)]">
                <Heart size={17} fill="currentColor" />
              </div>
            </div>
          </div>
        </header>

        {/* CONTENIDO */}
        <main className="relative z-10 w-full flex-1">
          <div className="mx-auto max-w-[1600px] px-5 pb-24 pt-8 sm:px-8 lg:px-12 lg:pb-12 lg:pt-10">
            <Routes>
              <Route
                path="/"
                element={<DashboardPage />}
              />

              <Route
                path="/personas"
                element={<PeoplePage />}
              />

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
                element={<AgendaPage />}
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

      {/* BÚSQUEDA GLOBAL */}
      <GlobalSearch
        open={showSearch}
        onClose={closeSearch}
      />

      {/* CENTRO DE NOTIFICACIONES */}
      <NotificationCenter
        open={showNotifications}
        onClose={closeNotifications}
        onUnreadCountChange={handleUnreadCountChange}
      />
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
