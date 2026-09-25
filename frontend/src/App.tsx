import { Bell, Search } from 'lucide-react'
import { Route, Routes } from 'react-router-dom'
import Sidebar from './Components/Sidebar'
import { useLocation } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import ProtectedRoute from './Components/ProtectedRoute'
import DashboardPage from './pages/DashboardPage'

function PagePlaceholder({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-emerald-700">
        PrayerCare
      </p>
      <h3 className="text-3xl font-bold tracking-tight text-slate-900">
        {title}
      </h3>
      <p className="mt-3 max-w-xl text-slate-600">{description}</p>
    </div>
  )
}

function App() {
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

function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <Sidebar />

      <div className="min-w-0 flex-1">
        <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-6 lg:px-10">
          <div>
            <p className="text-sm text-slate-500">Bienvenido a PrayerCare</p>
            <h2 className="text-xl font-bold text-slate-900">
              Mi espacio de oración
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Buscar"
              className="rounded-xl p-3 text-slate-500 transition hover:bg-slate-100"
            >
              <Search size={20} />
            </button>

            <button
              type="button"
              aria-label="Notificaciones"
              className="rounded-xl p-3 text-slate-500 transition hover:bg-slate-100"
            >
              <Bell size={20} />
            </button>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-700">
              PC
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
          <Routes>
            <Route
              path="/"
              element={<DashboardPage />}
            />

            <Route
              path="/personas"
              element={
                <PagePlaceholder
                  title="Personas"
                  description="Aquí podrás gestionar a las personas por quienes deseas orar."
                />
              }
            />

            <Route
              path="/peticiones"
              element={
                <PagePlaceholder
                  title="Peticiones de oración"
                  description="Aquí podrás registrar tus peticiones y dar seguimiento a cada una."
                />
              }
            />

            <Route
              path="/agenda"
              element={
                <PagePlaceholder
                  title="Mi agenda de oración"
                  description="Aquí podrás consultar tus recordatorios y organizar tus tiempos de oración."
                />
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App