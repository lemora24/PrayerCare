
import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  Bell,
  BellOff,
  CalendarDays,
  Check,
  CheckCheck,
  Clock3,
  Heart,
  LoaderCircle,
  RefreshCw,
  X,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import {
  formatReminderTime,
  getPrayerAgenda,
  toLocalDateString,
  type PrayerAgendaItem,
} from '../services/prayerReminders'

type NotificationCenterProps = {
  open: boolean
  onClose: () => void
  onUnreadCountChange?: (count: number) => void
}

type NotificationFilter = 'pending' | 'seen' | 'all'

function getStorageKey(date: string): string {
  return `prayercare:notifications:seen:${date}`
}

function readSeenIds(date: string): string[] {
  try {
    const saved = localStorage.getItem(getStorageKey(date))

    if (!saved) return []

    const parsed: unknown = JSON.parse(saved)

    if (!Array.isArray(parsed)) return []

    return parsed.filter(
      (value): value is string =>
        typeof value === 'string',
    )
  } catch {
    return []
  }
}

function saveSeenIds(date: string, ids: string[]): void {
  try {
    localStorage.setItem(
      getStorageKey(date),
      JSON.stringify(ids),
    )
  } catch {
    // La aplicación sigue funcionando si el navegador
    // bloquea el almacenamiento local.
  }
}

function sortAgenda(
  items: PrayerAgendaItem[],
): PrayerAgendaItem[] {
  return [...items].sort((a, b) =>
    a.reminderTime.localeCompare(b.reminderTime),
  )
}

function getFormattedToday(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString(
    'es-CR',
    {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    },
  )
}

export default function NotificationCenter({
  open,
  onClose,
  onUnreadCountChange,
}: NotificationCenterProps) {
  const [today, setToday] = useState(() =>
    toLocalDateString(new Date()),
  )

  const [agenda, setAgenda] = useState<PrayerAgendaItem[]>([])

  const [seenIds, setSeenIds] = useState<string[]>(() =>
    readSeenIds(toLocalDateString(new Date())),
  )

  const [filter, setFilter] =
    useState<NotificationFilter>('pending')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  // CONSULTAR RECORDATORIOS
  useEffect(() => {
    let active = true

    async function loadNotifications() {
      setLoading(true)
      setError('')

      try {
        const result = await getPrayerAgenda(today)

        if (!active) return

        setAgenda(sortAgenda(result))
      } catch {
        if (!active) return

        setAgenda([])
        setError(
          'No pudimos cargar los recordatorios de hoy.',
        )
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadNotifications()

    return () => {
      active = false
    }
  }, [today, refreshKey])

  // RESTAURAR AVISOS VISTOS
  useEffect(() => {
    setSeenIds(readSeenIds(today))
    setFilter('pending')
  }, [today])

  // CAMBIO DE DÍA
  useEffect(() => {
    function updateDate() {
      const currentDate = toLocalDateString(new Date())

      setToday((previous) =>
        previous === currentDate
          ? previous
          : currentDate,
      )
    }

    updateDate()

    const interval = window.setInterval(
      updateDate,
      60_000,
    )

    return () => {
      window.clearInterval(interval)
    }
  }, [])

  // CERRAR CON ESC
  useEffect(() => {
    if (!open) return

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener(
        'keydown',
        handleEscape,
      )
    }
  }, [open, onClose])

  const seenSet = useMemo(
    () => new Set(seenIds),
    [seenIds],
  )

  const pendingItems = useMemo(
    () =>
      agenda.filter(
        (item) => !seenSet.has(item.reminderId),
      ),
    [agenda, seenSet],
  )

  const seenItems = useMemo(
    () =>
      agenda.filter((item) =>
        seenSet.has(item.reminderId),
      ),
    [agenda, seenSet],
  )

  const unreadCount = pendingItems.length

  const filteredItems = useMemo(() => {
    switch (filter) {
      case 'pending':
        return pendingItems
      case 'seen':
        return seenItems
      default:
        return agenda
    }
  }, [filter, pendingItems, seenItems, agenda])

  // ACTUALIZAR CONTADOR DEL HEADER
  useEffect(() => {
    onUnreadCountChange?.(
      loading || error ? 0 : unreadCount,
    )
  }, [
    unreadCount,
    loading,
    error,
    onUnreadCountChange,
  ])

  function markAsSeen(reminderId: string) {
    setSeenIds((previous) => {
      if (previous.includes(reminderId)) {
        return previous
      }

      const updated = [...previous, reminderId]

      saveSeenIds(today, updated)

      return updated
    })
  }

  function markAllAsSeen() {
    const updated = Array.from(
      new Set([
        ...seenIds,
        ...agenda.map((item) => item.reminderId),
      ]),
    )

    saveSeenIds(today, updated)
    setSeenIds(updated)
  }

  function markAsPending(reminderId: string) {
    setSeenIds((previous) => {
      const updated = previous.filter(
        (id) => id !== reminderId,
      )

      saveSeenIds(today, updated)

      return updated
    })
  }

  function refreshNotifications() {
    setRefreshKey((previous) => previous + 1)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[110] flex items-start justify-center bg-[#263d50]/35 px-4 pb-6 pt-[8vh] backdrop-blur-sm">
      {/* FONDO */}
      <button
        type="button"
        aria-label="Cerrar notificaciones"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />

      {/* PANEL */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="notifications-title"
        className="pc-animate-enter relative z-10 flex max-h-[82vh] w-full max-w-[650px] flex-col overflow-hidden rounded-[30px] border border-white/80 bg-[#faf9f6] shadow-[0_30px_100px_rgba(25,43,56,0.22)]"
      >
        {/* ENCABEZADO */}
        <div className="border-b border-[#526e82]/10 px-6 pb-5 pt-6 sm:px-8 sm:pt-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="pc-eyebrow">
                UN MOMENTO PARA RECORDAR
              </p>

              <h2
                id="notifications-title"
                className="pc-heading mt-2 text-3xl text-[#263d50] sm:text-4xl"
              >
                Mis notificaciones
              </h2>

              <p className="mt-2 text-sm text-[#8394a3]">
                Personas que llevás en oración hoy.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar notificaciones"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#edf0f0] text-[#718394] transition hover:bg-[#e1e9ea]"
            >
              <X size={19} />
            </button>
          </div>

          {/* RESUMEN DEL DÍA */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-[#e8eff0] to-[#ede9f1] px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/70 text-[#526e82]">
                <Bell size={19} />
              </div>

              <div>
                <p className="text-sm font-semibold text-[#263d50]">
                  {loading
                    ? 'Consultando recordatorios'
                    : error
                      ? 'Recordatorios no disponibles'
                      : unreadCount === 0
                        ? 'Todo al día'
                        : `${unreadCount} ${
                            unreadCount === 1
                              ? 'recordatorio pendiente'
                              : 'recordatorios pendientes'
                          }`}
                </p>

                <p className="mt-0.5 text-xs text-[#8394a3]">
                  {getFormattedToday(today)}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={refreshNotifications}
              aria-label="Actualizar recordatorios"
              disabled={loading}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/70 text-[#526e82] transition hover:bg-white disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={loading ? 'animate-spin' : ''}
              />
            </button>
          </div>

          {/* FILTROS */}
          {!loading && !error && agenda.length > 0 && (
            <div className="mt-5 flex items-center gap-2">
              {(
                [
                  {
                    key: 'pending',
                    label: 'Pendientes',
                    count: pendingItems.length,
                  },
                  {
                    key: 'seen',
                    label: 'Vistos',
                    count: seenItems.length,
                  },
                  {
                    key: 'all',
                    label: 'Todos',
                    count: agenda.length,
                  },
                ] as const
              ).map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setFilter(item.key)}
                  aria-pressed={filter === item.key}
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                    filter === item.key
                      ? 'bg-[#526e82] text-white shadow-[0_5px_15px_rgba(82,110,130,0.15)]'
                      : 'bg-white/75 text-[#8394a3] hover:bg-white'
                  }`}
                >
                  {item.label}
                  <span className="ml-1.5 opacity-70">
                    {item.count}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* CONTENIDO */}
        <div className="min-h-[160px] flex-1 overflow-y-auto px-5 py-5 sm:px-7">
          {loading ? (
            <div
              role="status"
              className="flex flex-col items-center justify-center gap-4 py-14"
            >
              <LoaderCircle
                size={28}
                className="animate-spin text-[#7894a4]"
              />

              <p className="text-sm text-[#8394a3]">
                Preparando tus recordatorios...
              </p>
            </div>
          ) : error ? (
            <div
              role="alert"
              className="rounded-2xl bg-[#fff4ef] p-6 text-center"
            >
              <BellOff
                size={27}
                className="mx-auto text-[#aa8278]"
              />

              <p className="mt-3 text-sm text-[#946e67]">
                {error}
              </p>

              <button
                type="button"
                onClick={refreshNotifications}
                className="mt-4 text-xs font-semibold text-[#526e82] hover:underline"
              >
                Intentar nuevamente
              </button>
            </div>
          ) : agenda.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#e9edf3] text-[#7890a3]">
                <CalendarDays
                  size={29}
                  strokeWidth={1.5}
                />
              </div>

              <h3 className="mt-5 font-display text-3xl text-[#263d50]">
                Hoy hay espacio para la calma.
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-7 text-[#8394a3]">
                No tenés recordatorios programados para
                hoy. Podés crear uno desde tu agenda.
              </p>

              <Link
                to="/agenda"
                onClick={onClose}
                className="pc-button-secondary mt-6 inline-flex items-center gap-2"
              >
                Abrir mi agenda
                <ArrowRight size={16} />
              </Link>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#e9edf3] text-[#7890a3]">
                <CheckCheck
                  size={29}
                  strokeWidth={1.5}
                />
              </div>

              <h3 className="mt-5 font-display text-3xl text-[#263d50]">
                {filter === 'pending'
                  ? 'Todo está al día.'
                  : 'Todavía no hay avisos vistos.'}
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-7 text-[#8394a3]">
                {filter === 'pending'
                  ? 'Ya revisaste todos los recordatorios de hoy.'
                  : 'Cuando marques un aviso como visto, aparecerá aquí.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingItems.length > 0 && (
                <div className="mb-4 flex justify-end">
                  <button
                    type="button"
                    onClick={markAllAsSeen}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-[#526e82] transition hover:underline"
                  >
                    <CheckCheck size={16} />
                    Marcar todos como vistos
                  </button>
                </div>
              )}

              {filteredItems.map((item) => {
                const isSeen = seenSet.has(
                  item.reminderId,
                )

                return (
                  <div
                    key={item.reminderId}
                    className={`rounded-[22px] border p-4 transition sm:p-5 ${
                      isSeen
                        ? 'border-[#526e82]/10 bg-white/55'
                        : 'border-[#cddbe0] bg-white shadow-[0_8px_25px_rgba(38,61,80,0.05)]'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                          isSeen
                            ? 'bg-[#eef0ef] text-[#93a0a5]'
                            : 'bg-gradient-to-br from-[#e3eaf0] to-[#ede7f1] text-[#70869a]'
                        }`}
                      >
                        <Heart
                          size={21}
                          strokeWidth={1.6}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-[#263d50]">
                            {item.personName}
                          </p>

                          {!isSeen && (
                            <span className="h-2 w-2 rounded-full bg-[#8c9dc2]" />
                          )}
                        </div>

                        <div className="mt-2 flex items-center gap-2 text-xs text-[#8394a3]">
                          <Clock3 size={14} />
                          {formatReminderTime(
                            item.reminderTime,
                          )}
                        </div>

                        <p className="mt-2 text-xs leading-6 text-[#97a4af]">
                          Un momento para acompañar a esta
                          persona en oración.
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-3">
                          <Link
                            to={`/personas/${item.personId}`}
                            onClick={() => {
                              markAsSeen(item.reminderId)
                              onClose()
                            }}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#526e82] hover:underline"
                          >
                            Abrir diario
                            <ArrowRight size={14} />
                          </Link>

                          {isSeen ? (
                            <button
                              type="button"
                              onClick={() =>
                                markAsPending(
                                  item.reminderId,
                                )
                              }
                              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#91a0aa] hover:text-[#526e82]"
                            >
                              <RefreshCw size={13} />
                              Marcar pendiente
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                markAsSeen(item.reminderId)
                              }
                              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#91a0aa] hover:text-[#526e82]"
                            >
                              <Check size={14} />
                              Marcar como visto
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* PIE */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#526e82]/10 bg-white/55 px-6 py-4 sm:px-8">
          <span className="text-[11px] text-[#97a4af]">
            PrayerCare · Surrender
          </span>

          <Link
            to="/agenda"
            onClick={onClose}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#526e82] hover:underline"
          >
            Ver agenda completa
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  )
}
