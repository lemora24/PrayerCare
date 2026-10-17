
import { useEffect, useState } from 'react'
import {
  ArrowRight,
  ArrowUpRight,
  BookHeart,
  CheckCircle2,
  Clock3,
  Heart,
  Plus,
  Sparkles,
  Sunrise,
  UsersRound,
  Waves,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { getDashboard } from '../services/dashboard'

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

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('es-CR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatDateTime(date: string) {
  return new Date(date).toLocaleString('es-CR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function getPriorityLabel(priority: number) {
  switch (priority) {
    case 1:
      return 'Baja'
    case 2:
      return 'Normal'
    case 3:
      return 'Alta'
    case 4:
      return 'Urgente'
    default:
      return 'Sin prioridad'
  }
}

function getPriorityStyles(priority: number) {
  switch (priority) {
    case 4:
      return 'bg-rose-50 text-rose-700'
    case 3:
      return 'bg-amber-50 text-amber-700'
    default:
      return 'bg-[#e8eff0] text-[#526e82]'
  }
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
          setError('No se pudo cargar tu espacio de oración.')
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
    return (
      <div
        role="status"
        className="flex min-h-[55vh] flex-col items-center justify-center gap-5"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#dce9e9] text-[#526e82] pc-animate-breathe">
          <Waves size={30} strokeWidth={1.5} />
        </div>

        <p className="font-display text-3xl text-[#526e82]">
          Preparando tu espacio...
        </p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div role="alert" className="pc-card p-8">
        <p className="pc-eyebrow">NO PUDIMOS CONECTAR</p>

        <h2 className="pc-heading mt-3 text-4xl">
          Algo interrumpió este momento.
        </h2>

        <p className="pc-body mt-3">
          {error || 'No hay información disponible.'}
        </p>
      </div>
    )
  }

  const stats = [
    {
      label: 'Personas acompañadas',
      value: data.totalPeople,
      icon: UsersRound,
      description: 'Historias que importan',
    },
    {
      label: 'Peticiones activas',
      value: data.activePrayerRequests,
      icon: Heart,
      description: 'Motivos de oración',
    },
    {
      label: 'En seguimiento',
      value: data.followingUpPrayerRequests,
      icon: Clock3,
      description: 'Caminos que continúan',
    },
    {
      label: 'Respondidas',
      value: data.answeredPrayerRequests,
      icon: CheckCircle2,
      description: 'Momentos de gratitud',
    },
  ]

  return (
    <div className="space-y-9 pb-6">

      {/* =====================================
          HERO — EL HORIZONTE
      ===================================== */}

      <section className="pc-animate-enter relative isolate min-h-[420px] overflow-hidden rounded-[32px] bg-[#dce9e9] shadow-[0_25px_75px_rgba(38,61,80,0.1)] sm:min-h-[480px] lg:min-h-[510px]">

        {/* CIELO */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#dce5f1_0%,#e8e3ec_32%,#f6e5d7_66%,#c5d7df_100%)]" />

        {/* RESPLANDOR DEL AMANECER */}
        <div className="absolute -right-16 top-[8%] h-[400px] w-[400px] rounded-full bg-[#ffe8c8]/55 blur-[90px] sm:right-[8%]" />

        {/* SOL */}
        <div className="absolute bottom-[30%] right-[16%] h-28 w-28 rounded-full bg-[#fff4df]/75 shadow-[0_0_90px_35px_rgba(255,237,202,0.5)] blur-[1px] sm:h-40 sm:w-40" />

        {/* MAR */}
        <div className="absolute inset-x-0 bottom-0 h-[30%] bg-[linear-gradient(180deg,rgba(168,194,207,0.48),rgba(94,136,157,0.48))]" />

        {/* HORIZONTE */}
        <div className="absolute inset-x-0 bottom-[30%] h-px bg-white/70 shadow-[0_0_35px_12px_rgba(255,255,255,0.22)]" />

        {/* ONDAS */}
        <div className="pointer-events-none absolute inset-x-0 bottom-[15%] h-px bg-white/30" />
        <div className="pointer-events-none absolute inset-x-0 bottom-[9%] h-px bg-white/20" />

        {/* CAPA DE LEGIBILIDAD */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#e6e8ed]/90 via-[#e9e7ed]/65 to-transparent" />

        {/* CONTENIDO */}
        <div className="relative z-10 flex min-h-[420px] flex-col justify-between p-7 sm:min-h-[480px] sm:p-11 lg:min-h-[510px] lg:p-14">

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 rounded-full border border-white/60 bg-white/40 px-4 py-2 backdrop-blur-md">
              <Sunrise size={15} className="text-[#526e82]" />

              <span className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#526e82]">
                Tu refugio de oración
              </span>
            </div>

            <span className="hidden text-xs font-medium text-[#526e82]/70 sm:block">
              Inspirado en 1 Pedro 5:7
            </span>
          </div>

          <div className="max-w-[700px] py-10">
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-9 bg-[#526e82]/55" />

              <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#526e82]">
                ENTREGA · CONFÍA · DESCANSA
              </span>
            </div>

            <h1 className="font-display max-w-[670px] text-[clamp(3.4rem,6.3vw,6.7rem)] font-medium leading-[0.88] tracking-[-0.045em] text-[#263d50]">
              No tienes que
              <br />
              cargarlo todo
              <br />
              <span className="italic text-[#526e82]">
                tú solo.
              </span>
            </h1>

            <p className="mt-7 max-w-[470px] text-sm leading-7 text-[#526e82] sm:text-base">
              Un lugar para entregar tus preocupaciones,
              acompañar a quienes amas y recordar que
              Dios tiene cuidado de ti.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/personas"
                className="pc-button-primary shadow-[0_12px_30px_rgba(82,110,130,0.2)]"
              >
                <Plus size={18} />
                Comenzar una petición
              </Link>

              <Link
                to="/peticiones"
                className="pc-button-secondary"
              >
                Mis oraciones
                <ArrowUpRight size={17} />
              </Link>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-[#526e82]/75">
              <Waves size={17} strokeWidth={1.6} />
              <span className="text-[11px] font-medium tracking-wide">
                PrayerCare · Surrender
              </span>
            </div>

            <span className="hidden font-display text-xl italic text-[#526e82]/75 sm:block">
              He cares for you.
            </span>
          </div>
        </div>
      </section>

      {/* =====================================
          RESUMEN
      ===================================== */}

      <section className="pc-animate-enter" aria-labelledby="summary-title">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="pc-eyebrow">TU CAMINO</p>

            <h2
              id="summary-title"
              className="pc-heading mt-2 text-3xl text-[#263d50] sm:text-4xl"
            >
              Lo que llevas en el corazón
            </h2>
          </div>

          <Sparkles
            size={22}
            className="hidden text-[#c99c73] sm:block"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
          {stats.map(({ label, value, icon: Icon, description }) => (
            <div
              key={label}
              className="pc-card pc-card-interactive group p-5 sm:p-6"
            >
              <div className="mb-6 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e8eff0] text-[#526e82] transition group-hover:bg-[#dce9e9]">
                  <Icon size={19} strokeWidth={1.8} />
                </div>

                <span className="h-1.5 w-1.5 rounded-full bg-[#c99c73]/75" />
              </div>

              <p className="font-display text-5xl font-medium leading-none text-[#263d50] sm:text-6xl">
                {value}
              </p>

              <p className="mt-3 text-xs font-semibold text-[#526e82] sm:text-sm">
                {label}
              </p>

              <p className="mt-1 text-[11px] leading-5 text-[#97a4af]">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* =====================================
          CONTENIDO PRINCIPAL
      ===================================== */}

      <div className="grid items-start gap-6 xl:grid-cols-[1.1fr_0.9fr]">

        {/* PETICIONES QUE NECESITAN ATENCIÓN */}
        <section className="pc-card overflow-hidden" aria-labelledby="attention-title">

          <div className="border-b border-[#526e82]/10 p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="pc-eyebrow">
                  PERSONAS EN MI CORAZÓN
                </p>

                <h2
                  id="attention-title"
                  className="pc-heading mt-3 text-3xl text-[#263d50] sm:text-4xl"
                >
                  A quienes quiero acompañar
                </h2>

                <p className="mt-3 max-w-md text-sm leading-6 text-[#8394a3]">
                  Algunas peticiones que puedes tener
                  presentes en tus próximos momentos de oración.
                </p>
              </div>

              <Link
                to="/peticiones"
                className="flex items-center gap-1 text-xs font-semibold text-[#526e82] transition hover:gap-2"
              >
                Ver todas
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {data.needsAttention.length === 0 ? (
              <div className="rounded-3xl bg-[#f2f5f5] px-6 py-12 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#526e82]">
                  <Heart size={25} strokeWidth={1.5} />
                </div>

                <h3 className="font-display text-3xl text-[#263d50]">
                  Un momento de calma.
                </h3>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#8394a3]">
                  No hay peticiones señaladas para atención por ahora.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.needsAttention.slice(0, 5).map((request) => (
                  <Link
                    key={request.id}
                    to={`/personas/${request.personId}`}
                    className="group flex items-start gap-4 rounded-[22px] border border-[#526e82]/10 bg-[#f9faf9] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#526e82]/25 hover:bg-white hover:shadow-[0_12px_30px_rgba(38,61,80,0.06)] sm:p-5"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#dce9e9] to-[#e8e3ed] font-display text-2xl font-semibold text-[#526e82]">
                      {request.personName.trim().charAt(0).toUpperCase() || '?'}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-[#526e82]">
                          {request.personName}
                        </p>

                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${getPriorityStyles(request.priority)}`}>
                          {getPriorityLabel(request.priority)}
                        </span>
                      </div>

                      <h3 className="mt-1.5 text-sm font-semibold leading-6 text-[#263d50]">
                        {request.title}
                      </h3>

                      <p className="mt-2 text-[11px] text-[#97a4af]">
                        {request.lastPrayedAt
                          ? `Última oración: ${formatDate(request.lastPrayedAt)}`
                          : `Registrada: ${formatDate(request.createdAt)}`}
                      </p>
                    </div>

                    <ArrowUpRight
                      size={18}
                      className="mt-1 shrink-0 text-[#a8b9d0] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#526e82]"
                    />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ACTIVIDAD RECIENTE */}
        <section className="pc-card overflow-hidden" aria-labelledby="activity-title">

          <div className="border-b border-[#526e82]/10 p-6 sm:p-8">
            <p className="pc-eyebrow">
              MOMENTOS QUE PERMANECEN
            </p>

            <h2
              id="activity-title"
              className="pc-heading mt-3 text-3xl text-[#263d50] sm:text-4xl"
            >
              Mi diario de oración
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#8394a3]">
              Un pequeño registro de tus últimos momentos de oración.
            </p>
          </div>

          <div className="p-5 sm:p-7">
            {data.recentActivity.length === 0 ? (
              <div className="rounded-3xl bg-[#f2f5f5] px-6 py-12 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#526e82]">
                  <BookHeart size={25} strokeWidth={1.5} />
                </div>

                <h3 className="font-display text-3xl text-[#263d50]">
                  Cada historia tiene un comienzo.
                </h3>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#8394a3]">
                  Cuando registres una oración, podrás recordarla aquí.
                </p>
              </div>
            ) : (
              <div className="relative space-y-7 before:absolute before:bottom-4 before:left-[17px] before:top-4 before:w-px before:bg-[#dce9e9]">
                {data.recentActivity.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="relative flex gap-4">
                    <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-4 border-white bg-[#dce9e9] text-[#526e82] shadow-sm">
                      <Heart size={13} fill="currentColor" />
                    </div>

                    <div className="min-w-0 flex-1 pb-1">
                      <p className="text-[11px] font-medium text-[#97a4af]">
                        {formatDateTime(activity.prayedAt)}
                      </p>

                      <Link
                        to={`/personas/${activity.personId}`}
                        className="mt-1 block text-sm font-semibold text-[#526e82] hover:underline"
                      >
                        {activity.personName}
                      </Link>

                      <h3 className="mt-1 text-sm font-medium leading-6 text-[#263d50]">
                        {activity.prayerRequestTitle}
                      </h3>

                      {activity.note && (
                        <p className="mt-2 rounded-2xl bg-[#f2f5f5] px-4 py-3 text-xs leading-6 text-[#718394]">
                          {activity.note}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* =====================================
          REFLEXIÓN FINAL
      ===================================== */}

      <section className="relative overflow-hidden rounded-[28px] border border-[#526e82]/10 bg-gradient-to-r from-[#e7eff0] via-[#edeaf0] to-[#f4e7dc] p-7 sm:p-10">
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/35 blur-3xl" />

        <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="max-w-2xl">
            <div className="mb-3 flex items-center gap-2 text-[#526e82]">
              <Sparkles size={15} />

              <span className="text-[10px] font-bold uppercase tracking-[0.18em]">
                UNA VERDAD PARA RECORDAR
              </span>
            </div>

            <p className="font-display text-3xl font-medium leading-tight text-[#263d50] sm:text-4xl">
              “Él tiene cuidado de vosotros.”
            </p>

            <p className="mt-2 text-xs font-medium text-[#718394]">
              1 Pedro 5:7 · RVR1960
            </p>
          </div>

          <Link
            to="/personas"
            className="flex shrink-0 items-center gap-2 rounded-full border border-white/80 bg-white/60 px-5 py-3 text-xs font-semibold text-[#526e82] transition hover:bg-white"
          >
            <UsersRound size={16} />
            Mis personas
            <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </div>
  )
}
