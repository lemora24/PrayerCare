import { useEffect, useState } from 'react'
import { Heart, UsersRound, CheckCircle2, Clock3 } from 'lucide-react'
import { getDashboard } from '../services/dashboard'
import { Link } from 'react-router-dom'

type PrayerRequestAttention = {
  id: string
  personId: string
  personName: string
  title: string
  priority: number
  status: number
  lastPrayedAt: string | null
  createdAt: string
}
type PrayerActivity = {
  id: string
  prayerRequestId: string
  personId: string
  personName: string
  prayerRequestTitle: string
  prayedAt: string
  note: string | null
}
type DashboardData = {
  totalPeople: number
  activePrayerRequests: number
  followingUpPrayerRequests: number
  answeredPrayerRequests: number
  needsAttention: PrayerRequestAttention[]
  recentActivity: PrayerActivity[]
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function loadDashboard() {
      try {
        const result = await getDashboard()

        if (active) {
          setData(result)
        }
      } catch {
        if (active) {
          setError('No se pudieron cargar las estadísticas.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadDashboard()

    return () => {
      active = false
    }
  }, [])

  if (loading) {
    return <p className="text-slate-500">Cargando tu dashboard...</p>
  }

  if (error || !data) {
    return <p role="alert" className="text-red-600">{error}</p>
  }

  const stats = [
    {
      label: 'Personas',
      value: data.totalPeople,
      icon: UsersRound,
      color: 'bg-blue-50 text-blue-700',
    },
    {
      label: 'Peticiones activas',
      value: data.activePrayerRequests,
      icon: Heart,
      color: 'bg-amber-50 text-amber-700',
    },
    {
      label: 'Peticiones respondidas',
      value: data.answeredPrayerRequests,
      icon: CheckCircle2,
      color: 'bg-emerald-50 text-emerald-700',
    },
    {
        label: 'Peticiones en seguimiento',
        value: data.followingUpPrayerRequests,
        icon: Clock3,
        color: 'bg-violet-50 text-violet-700',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold text-emerald-700">
          TU ESPACIO PERSONAL
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          Cada oración cuenta.
        </h2>
        <p className="mt-2 text-slate-600">
          Un resumen de las personas y peticiones que acompañas.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div
              className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl ${color}`}
            >
              <Icon size={24} />
            </div>

            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-2 text-4xl font-bold text-slate-900">
              {value}
            </p>
          </div>
        ))}
      </div>
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
  <div className="mb-5 flex items-center justify-between gap-4">
    <div>
      <h3 className="text-xl font-bold text-slate-900">
        Necesitan atención
      </h3>
      <p className="mt-1 text-sm text-slate-500">
        Peticiones que puedes tener presentes en tus oraciones.
      </p>
    </div>

    <Link
      to="/peticiones"
      className="shrink-0 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
    >
      Ver peticiones →
    </Link>
  </div>

        {data.needsAttention.length === 0 ? (
            <p className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">
            No hay peticiones que necesiten atención por ahora.
            </p>
        ) : (
            <div className="space-y-3">
            {data.needsAttention.map((request) => (
                <div
                key={request.id}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-5"
                >
                <p className="text-sm font-medium text-emerald-700">
                    {request.personName}
                </p>
                <h4 className="mt-1 font-semibold text-slate-900">
                    {request.title}
                </h4>
                </div>
            ))}
            </div>
        )}
        </section>
    </div>
  )
}