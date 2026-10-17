
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  Bell,
  BellOff,
  BookHeart,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Heart,
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import {
  createPrayerReminder,
  deletePrayerReminder,
  formatReminderTime,
  getAllPrayerReminders,
  getBrowserTimeZone,
  getDefaultReminderDays,
  getPrayerAgenda,
  getReminderDayLabels,
  PRAYER_WEEK_DAYS,
  toLocalDateString,
  updatePrayerReminder,
  type CreatePrayerReminderRequest,
  type PrayerAgendaItem,
  type PrayerReminder,
  type PrayerReminderDays,
} from '../services/prayerReminders'

import {
  getPeople,
  type Person,
} from '../services/people'

type ReminderForm = CreatePrayerReminderRequest & {
  personId: string
}

type FormMode =
  | { kind: 'create' }
  | { kind: 'edit'; reminder: PrayerReminder }

type ViewFilter = 'all' | 'enabled' | 'disabled'

const weekDayKeys: (keyof PrayerReminderDays)[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
]

function getFullName(person: Person) {
  return [person.firstName, person.lastName]
    .filter(Boolean)
    .join(' ')
    .trim()
}

function addDays(date: Date, amount: number) {
  const result = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  )

  result.setDate(result.getDate() + amount)
  return result
}

function parseLocalDate(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function formatLongDate(value: string) {
  return parseLocalDate(value).toLocaleDateString('es-CR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatWeekday(date: Date) {
  return date.toLocaleDateString('es-CR', {
    weekday: 'short',
  })
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}

function normalizeTime(value: string) {
  return value.slice(0, 5)
}

function createEmptyForm(personId = ''): ReminderForm {
  return {
    personId,
    reminderTime: '19:00',
    timeZoneId: getBrowserTimeZone(),
    isEnabled: true,
    ...getDefaultReminderDays(),
  }
}

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === 'object' && error !== null) {
    const possibleError = error as {
      response?: {
        data?: unknown
      }
    }

    const data = possibleError.response?.data

    if (typeof data === 'string' && data.trim()) {
      return data
    }

    if (
      typeof data === 'object' &&
      data !== null &&
      'title' in data &&
      typeof data.title === 'string'
    ) {
      return data.title
    }
  }

  return fallback
}

export default function AgendaPage() {
  const [today] = useState(() => toLocalDateString(new Date()))
  const [selectedDate, setSelectedDate] = useState(today)

  const [reminders, setReminders] = useState<PrayerReminder[]>([])
  const [agenda, setAgenda] = useState<PrayerAgendaItem[]>([])
  const [people, setPeople] = useState<Person[]>([])

  const [loading, setLoading] = useState(true)
  const [agendaLoading, setAgendaLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [agendaError, setAgendaError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<ViewFilter>('all')

  const [formMode, setFormMode] = useState<FormMode | null>(null)
  const [form, setForm] = useState<ReminderForm>(
    createEmptyForm,
  )
  const [saving, setSaving] = useState(false)
  const [processingId, setProcessingId] = useState<string | null>(
    null,
  )
  const [deleteTarget, setDeleteTarget] =
    useState<PrayerReminder | null>(null)

  const loadAgenda = useCallback(async (date: string) => {
    setAgendaLoading(true)
    setAgendaError(null)

    try {
      const data = await getPrayerAgenda(date)
      setAgenda(data)
    } catch {
      setAgenda([])
      setAgendaError(
        'No pudimos consultar las oraciones de este día.',
      )
    } finally {
      setAgendaLoading(false)
    }
  }, [])

  const loadEverything = useCallback(async () => {
    setError(null)

    try {
      const [reminderData, peopleData] = await Promise.all([
        getAllPrayerReminders(),
        getPeople(),
      ])

      setReminders(reminderData)
      setPeople(peopleData)
    } catch {
      setError(
        'No pudimos cargar tus recordatorios. Verificá la conexión con el servidor.',
      )
    }
  }, [])

  useEffect(() => {
    let active = true

    async function initialize() {
      setLoading(true)

      try {
        const [reminderData, peopleData] = await Promise.all([
          getAllPrayerReminders(),
          getPeople(),
        ])

        if (!active) return

        setReminders(reminderData)
        setPeople(peopleData)
        setError(null)
      } catch {
        if (active) {
          setError(
            'No pudimos cargar tus recordatorios. Verificá la conexión con el servidor.',
          )
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void initialize()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    void loadAgenda(selectedDate)
  }, [selectedDate, loadAgenda])

  const peopleById = useMemo(
    () => new Map(people.map((person) => [person.id, person])),
    [people],
  )

  const stats = useMemo(() => {
    const enabled = reminders.filter(
      (reminder) => reminder.isEnabled,
    ).length

    return {
      total: reminders.length,
      enabled,
      disabled: reminders.length - enabled,
      today: reminders.filter((reminder) => {
        if (!reminder.isEnabled) return false

        const day = parseLocalDate(today).getDay()
        return reminder[weekDayKeys[day]]
      }).length,
    }
  }, [reminders, today])

  const visibleReminders = useMemo(() => {
    const normalized = search.trim().toLocaleLowerCase('es')

    return reminders
      .filter((reminder) => {
        const person = peopleById.get(reminder.personId)
        const name =
          reminder.personName ||
          (person ? getFullName(person) : '')

        const matchesSearch =
          normalized === '' ||
          name.toLocaleLowerCase('es').includes(normalized)

        const matchesFilter =
          filter === 'all' ||
          (filter === 'enabled' && reminder.isEnabled) ||
          (filter === 'disabled' && !reminder.isEnabled)

        return matchesSearch && matchesFilter
      })
      .sort((a, b) =>
        a.reminderTime.localeCompare(b.reminderTime),
      )
  }, [reminders, peopleById, search, filter])

  const weekDates = useMemo(() => {
    const start = parseLocalDate(selectedDate)

    return Array.from({ length: 7 }, (_, index) => {
      const date = addDays(start, index)
      return {
        date,
        value: toLocalDateString(date),
      }
    })
  }, [selectedDate])

  const selectedIsToday = selectedDate === today

  function changeDate(amount: number) {
    setSelectedDate((current) =>
      toLocalDateString(addDays(parseLocalDate(current), amount)),
    )
  }

  function openCreate(personId = '') {
    setForm(createEmptyForm(personId))
    setFormMode({ kind: 'create' })
    setActionError(null)
  }

  function openEdit(reminder: PrayerReminder) {
    setForm({
      personId: reminder.personId,
      reminderTime: normalizeTime(reminder.reminderTime),
      timeZoneId: reminder.timeZoneId,
      isEnabled: reminder.isEnabled,
      sunday: reminder.sunday,
      monday: reminder.monday,
      tuesday: reminder.tuesday,
      wednesday: reminder.wednesday,
      thursday: reminder.thursday,
      friday: reminder.friday,
      saturday: reminder.saturday,
    })

    setFormMode({ kind: 'edit', reminder })
    setActionError(null)
  }

  function closeForm() {
    if (saving) return
    setFormMode(null)
    setActionError(null)
  }

  function toggleDay(day: keyof PrayerReminderDays) {
    setForm((current) => ({
      ...current,
      [day]: !current[day],
    }))
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!formMode || saving) return

    setActionError(null)

    if (!form.personId) {
      setActionError('Seleccioná una persona.')
      return
    }

    if (!weekDayKeys.some((day) => form[day])) {
      setActionError('Seleccioná al menos un día de la semana.')
      return
    }

    if (!form.reminderTime || !form.timeZoneId.trim()) {
      setActionError('Indicá la hora y la zona horaria.')
      return
    }

    setSaving(true)

    const payload: CreatePrayerReminderRequest = {
      reminderTime: `${normalizeTime(form.reminderTime)}:00`,
      timeZoneId: form.timeZoneId.trim(),
      isEnabled: form.isEnabled,
      sunday: form.sunday,
      monday: form.monday,
      tuesday: form.tuesday,
      wednesday: form.wednesday,
      thursday: form.thursday,
      friday: form.friday,
      saturday: form.saturday,
    }

    try {
      if (formMode.kind === 'create') {
        await createPrayerReminder(form.personId, payload)
      } else {
        await updatePrayerReminder(
          formMode.reminder.personId,
          formMode.reminder.id,
          payload,
        )
      }

      setFormMode(null)
      await Promise.all([
        loadEverything(),
        loadAgenda(selectedDate),
      ])
    } catch (error) {
      setActionError(
        getErrorMessage(
          error,
          'No pudimos guardar el recordatorio. Intentá nuevamente.',
        ),
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleToggle(reminder: PrayerReminder) {
    if (processingId) return

    setProcessingId(reminder.id)
    setActionError(null)

    try {
      await updatePrayerReminder(
        reminder.personId,
        reminder.id,
        {
          reminderTime: reminder.reminderTime,
          timeZoneId: reminder.timeZoneId,
          isEnabled: !reminder.isEnabled,
          sunday: reminder.sunday,
          monday: reminder.monday,
          tuesday: reminder.tuesday,
          wednesday: reminder.wednesday,
          thursday: reminder.thursday,
          friday: reminder.friday,
          saturday: reminder.saturday,
        },
      )

      await Promise.all([
        loadEverything(),
        loadAgenda(selectedDate),
      ])
    } catch (error) {
      setActionError(
        getErrorMessage(
          error,
          'No pudimos actualizar el recordatorio.',
        ),
      )
    } finally {
      setProcessingId(null)
    }
  }

  async function handleDelete() {
    if (!deleteTarget || processingId) return

    setProcessingId(deleteTarget.id)
    setActionError(null)

    try {
      await deletePrayerReminder(
        deleteTarget.personId,
        deleteTarget.id,
      )

      setDeleteTarget(null)

      await Promise.all([
        loadEverything(),
        loadAgenda(selectedDate),
      ])
    } catch (error) {
      setActionError(
        getErrorMessage(
          error,
          'No pudimos eliminar el recordatorio.',
        ),
      )
    } finally {
      setProcessingId(null)
    }
  }

  async function handleRefresh() {
    setRefreshing(true)

    await Promise.all([
      loadEverything(),
      loadAgenda(selectedDate),
    ])

    setRefreshing(false)
  }

  return (
    <div className="mx-auto max-w-[1380px] space-y-8 pb-16">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-[30px] border border-[#dfe7e9] bg-gradient-to-br from-[#e9f0f3] via-[#f1f0f5] to-[#f7eee7] px-7 py-10 sm:px-11 sm:py-12">
        <div className="pointer-events-none absolute -right-14 -top-24 h-80 w-80 rounded-full border border-white/65" />
        <div className="pointer-events-none absolute -right-2 -top-14 h-60 w-60 rounded-full border border-white/55" />

        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2">
              <CalendarDays
                size={16}
                className="text-[#7b90a0]"
              />
              <p className="pc-eyebrow">TU TIEMPO CON DIOS</p>
            </div>

            <h1 className="mt-5 font-display text-[clamp(3rem,6vw,5.3rem)] font-medium leading-[0.95] tracking-tight text-[#40596d]">
              Un momento
              <span className="block italic text-[#8c86a7]">
                para cada persona.
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-sm leading-8 text-[#748593] sm:text-base">
              Organizá tus momentos de oración, recordá a las
              personas que llevás en el corazón y cultivá una
              rutina con propósito.
            </p>
          </div>

          <button
            type="button"
            onClick={() => openCreate()}
            className="pc-button-primary relative inline-flex items-center gap-2"
          >
            <Plus size={17} />
            Nuevo recordatorio
          </button>
        </div>
      </section>

      {/* RESUMEN */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          {
            label: 'Recordatorios',
            value: stats.total,
            icon: CalendarDays,
            color: '#607f92',
            background: '#eaf1f5',
          },
          {
            label: 'Activos',
            value: stats.enabled,
            icon: Bell,
            color: '#8276a0',
            background: '#f0edf6',
          },
          {
            label: 'Programados hoy',
            value: stats.today,
            icon: Heart,
            color: '#73947b',
            background: '#edf4ed',
          },
          {
            label: 'En pausa',
            value: stats.disabled,
            icon: BellOff,
            color: '#b08c78',
            background: '#f8eee8',
          },
        ].map((stat) => {
          const Icon = stat.icon

          return (
            <article
              key={stat.label}
              className="rounded-[23px] border border-[#e6e8e7] bg-white/75 p-5 shadow-[0_6px_24px_rgba(56,72,82,0.035)] sm:p-6"
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-2xl"
                style={{ backgroundColor: stat.background }}
              >
                <Icon
                  size={19}
                  strokeWidth={1.7}
                  style={{ color: stat.color }}
                />
              </div>

              <p className="mt-5 font-display text-4xl font-medium leading-none text-[#40596d]">
                {stat.value}
              </p>

              <p className="mt-2 text-xs font-medium text-[#88939a]">
                {stat.label}
              </p>
            </article>
          )
        })}
      </section>

      {error && (
        <div
          role="alert"
          className="rounded-2xl border border-[#edcec8] bg-[#fff5f2] px-5 py-4 text-sm text-[#a36d64]"
        >
          {error}
        </div>
      )}

      {actionError && !formMode && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-2xl border border-[#edcec8] bg-[#fff5f2] px-5 py-4 text-sm text-[#a36d64]"
        >
          <span>{actionError}</span>
          <button
            type="button"
            onClick={() => setActionError(null)}
            aria-label="Cerrar error"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* AGENDA DIARIA */}
      <section className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="pc-eyebrow">AGENDA DE ORACIÓN</p>
            <h2 className="mt-2 font-display text-4xl text-[#40596d]">
              {selectedIsToday
                ? 'Tus oraciones de hoy'
                : 'Un día para orar'}
            </h2>
          </div>

          <button
            type="button"
            onClick={() => void handleRefresh()}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-full border border-[#dfe7e9] bg-white/70 px-4 py-2.5 text-xs font-semibold text-[#60798a] transition hover:bg-white disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={refreshing ? 'animate-spin' : ''}
            />
            Actualizar
          </button>
        </div>

        <div className="rounded-[28px] border border-[#e4e9e9] bg-white/75 p-5 shadow-[0_8px_35px_rgba(56,72,82,0.035)] sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#97a4ab]">
                FECHA SELECCIONADA
              </p>

              <h3 className="mt-2 font-display text-3xl capitalize text-[#40596d]">
                {formatLongDate(selectedDate)}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => changeDate(-1)}
                aria-label="Día anterior"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e2e8e9] text-[#60798a] transition hover:bg-[#edf3f5]"
              >
                <ChevronLeft size={18} />
              </button>

              <button
                type="button"
                onClick={() => setSelectedDate(today)}
                className="rounded-full bg-[#edf3f5] px-4 py-2.5 text-xs font-semibold text-[#60798a] transition hover:bg-[#e1ebef]"
              >
                Hoy
              </button>

              <button
                type="button"
                onClick={() => changeDate(1)}
                aria-label="Día siguiente"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e2e8e9] text-[#60798a] transition hover:bg-[#edf3f5]"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* PRÓXIMOS SIETE DÍAS */}
          <div className="mt-7 grid grid-cols-7 gap-2">
            {weekDates.map(({ date, value }) => {
              const active = selectedDate === value
              const isToday = today === value

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSelectedDate(value)}
                  className={`flex min-w-0 flex-col items-center gap-2 rounded-2xl px-1 py-4 transition ${
                    active
                      ? 'bg-[#526e82] text-white shadow-[0_8px_20px_rgba(82,110,130,0.18)]'
                      : 'bg-[#f4f6f5] text-[#718694] hover:bg-[#e8eff1]'
                  }`}
                >
                  <span className="text-[10px] font-semibold uppercase">
                    {formatWeekday(date)}
                  </span>

                  <span className="font-display text-2xl font-semibold">
                    {date.getDate()}
                  </span>

                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isToday
                        ? active
                          ? 'bg-white'
                          : 'bg-[#8b86a6]'
                        : 'bg-transparent'
                    }`}
                  />
                </button>
              )
            })}
          </div>

          <div className="mt-7 border-t border-[#edf0ee] pt-6">
            {agendaLoading ? (
              <div className="flex items-center justify-center gap-3 py-12 text-sm text-[#84939b]">
                <LoaderCircle
                  size={19}
                  className="animate-spin"
                />
                Consultando tus momentos de oración...
              </div>
            ) : agendaError ? (
              <div className="rounded-2xl bg-[#fff5f2] px-5 py-5 text-sm text-[#a36d64]">
                {agendaError}
              </div>
            ) : agenda.length === 0 ? (
              <div className="py-12 text-center">
                <Heart
                  size={34}
                  strokeWidth={1.4}
                  className="mx-auto text-[#aaa2ba]"
                />

                <h4 className="mt-4 font-display text-3xl text-[#526e82]">
                  Un espacio para la quietud
                </h4>

                <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#84939b]">
                  No hay recordatorios activos para esta fecha.
                  Podés crear uno y dedicarle un momento especial
                  a alguien.
                </p>

                <button
                  type="button"
                  onClick={() => openCreate()}
                  className="pc-button-secondary mt-6"
                >
                  <Plus size={16} />
                  Crear recordatorio
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3 pb-2">
                  <p className="text-xs font-semibold text-[#82939c]">
                    {agenda.length}{' '}
                    {agenda.length === 1
                      ? 'momento programado'
                      : 'momentos programados'}
                  </p>

                  <span className="text-[11px] text-[#a0a9ad]">
                    Horas según cada zona horaria
                  </span>
                </div>

                {agenda.map((item) => (
                  <article
                    key={item.reminderId}
                    className="group flex flex-wrap items-center gap-4 rounded-[20px] border border-[#e7ebea] bg-[#fafbfa] px-5 py-4 transition hover:border-[#d6e1e4] hover:bg-white"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#eaf0f3] font-display text-lg text-[#607b8e]">
                      {getInitials(item.personName)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="truncate text-sm font-semibold text-[#526e82]">
                        {item.personName}
                      </h4>

                      <p className="mt-1 text-[11px] text-[#97a3a9]">
                        {item.timeZoneId}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 rounded-full bg-[#edf1f4] px-3 py-2 text-xs font-semibold text-[#607b8e]">
                      <Clock3 size={14} />
                      {formatReminderTime(item.reminderTime)}
                    </div>

                    <Link
                      to={`/personas/${item.personId}`}
                      className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold text-[#607b8e] transition hover:bg-[#eaf0f3]"
                    >
                      <BookHeart size={15} />
                      <span className="hidden sm:inline">
                        Abrir diario
                      </span>
                      <ArrowRight size={14} />
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ADMINISTRAR RECORDATORIOS */}
      <section className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="pc-eyebrow">MIS HORARIOS</p>
            <h2 className="mt-2 font-display text-4xl text-[#40596d]">
              Recordatorios de oración
            </h2>
          </div>

          <p className="text-xs text-[#8a979e]">
            {visibleReminders.length}{' '}
            {visibleReminders.length === 1
              ? 'recordatorio'
              : 'recordatorios'}
          </p>
        </div>

        <div className="rounded-[24px] border border-[#e5e9e8] bg-white/70 p-4 sm:p-5">
          <div className="flex flex-wrap gap-3">
            <div className="relative min-w-[220px] flex-1">
              <Search
                size={17}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9aa5aa]"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por persona..."
                aria-label="Buscar recordatorios"
                className="w-full rounded-2xl border border-[#e4e8e9] bg-[#fafbfa] py-3.5 pl-11 pr-4 text-sm text-[#526e82] outline-none focus:border-[#9aafbc]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(
                [
                  ['all', 'Todos'],
                  ['enabled', 'Activos'],
                  ['disabled', 'En pausa'],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  aria-pressed={filter === value}
                  className={`rounded-full px-4 py-2.5 text-xs font-semibold transition ${
                    filter === value
                      ? 'bg-[#526e82] text-white'
                      : 'bg-[#f2f5f5] text-[#81909a] hover:bg-[#e8eef0]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center gap-3 py-16 text-sm text-[#83919b]">
            <LoaderCircle
              size={20}
              className="animate-spin"
            />
            Cargando recordatorios...
          </div>
        ) : visibleReminders.length === 0 ? (
          <div className="rounded-[26px] border border-[#e5e9e8] bg-white/75 px-6 py-14 text-center">
            <Bell
              size={35}
              strokeWidth={1.4}
              className="mx-auto text-[#a1aeb8]"
            />

            <h3 className="mt-5 font-display text-3xl text-[#526e82]">
              {reminders.length === 0
                ? 'Comenzá una nueva rutina'
                : 'No encontramos recordatorios'}
            </h3>

            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#84929c]">
              {reminders.length === 0
                ? 'Creá un horario para recordar a las personas por quienes querés orar.'
                : 'Probá con otro nombre o cambiá el filtro.'}
            </p>

            {reminders.length === 0 && (
              <button
                type="button"
                onClick={() => openCreate()}
                className="pc-button-primary mt-6"
              >
                <Plus size={16} />
                Crear recordatorio
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {visibleReminders.map((reminder) => {
              const person = peopleById.get(reminder.personId)
              const personName =
                reminder.personName ||
                (person
                  ? getFullName(person)
                  : 'Persona no disponible')

              return (
                <article
                  key={reminder.id}
                  className="rounded-[24px] border border-[#e6e9e8] bg-white/80 p-6 shadow-[0_6px_25px_rgba(56,72,82,0.035)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#edf2f5] font-display text-lg text-[#607b8e]">
                        {getInitials(personName)}
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-[#526e82]">
                          {personName}
                        </h3>

                        <p className="mt-1 text-xs text-[#97a3a9]">
                          {reminder.timeZoneId}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold ${
                        reminder.isEnabled
                          ? 'bg-[#edf4ed] text-[#73947b]'
                          : 'bg-[#f3f0ed] text-[#9c9188]'
                      }`}
                    >
                      {reminder.isEnabled ? 'Activo' : 'En pausa'}
                    </span>
                  </div>

                  <div className="mt-6 flex items-center gap-3">
                    <Clock3
                      size={20}
                      strokeWidth={1.5}
                      className="text-[#8b86a7]"
                    />

                    <span className="font-display text-3xl text-[#526e82]">
                      {formatReminderTime(reminder.reminderTime)}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {PRAYER_WEEK_DAYS.map((day) => (
                      <span
                        key={day.key}
                        title={day.label}
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-semibold ${
                          reminder[day.key]
                            ? 'bg-[#e9e8f1] text-[#81769f]'
                            : 'bg-[#f4f5f3] text-[#b5bdc0]'
                        }`}
                      >
                        {day.short}
                      </span>
                    ))}
                  </div>

                  <p className="mt-3 text-xs leading-6 text-[#97a3a9]">
                    {getReminderDayLabels(reminder).join(', ')}
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-[#edf0ee] pt-5">
                    <button
                      type="button"
                      onClick={() => openEdit(reminder)}
                      disabled={processingId !== null}
                      className="inline-flex items-center gap-2 rounded-full bg-[#edf2f5] px-4 py-2.5 text-xs font-semibold text-[#607b8e] transition hover:bg-[#e0eaf0] disabled:opacity-50"
                    >
                      <Pencil size={14} />
                      Editar
                    </button>

                    <button
                      type="button"
                      onClick={() => void handleToggle(reminder)}
                      disabled={processingId !== null}
                      className="inline-flex items-center gap-2 rounded-full bg-[#f3f3f1] px-4 py-2.5 text-xs font-semibold text-[#8b8d89] transition hover:bg-[#e9ebe8] disabled:opacity-50"
                    >
                      {processingId === reminder.id ? (
                        <LoaderCircle
                          size={14}
                          className="animate-spin"
                        />
                      ) : reminder.isEnabled ? (
                        <BellOff size={14} />
                      ) : (
                        <Bell size={14} />
                      )}

                      {reminder.isEnabled ? 'Pausar' : 'Activar'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteTarget(reminder)}
                      disabled={processingId !== null}
                      aria-label={`Eliminar recordatorio de ${personName}`}
                      title="Eliminar recordatorio"
                      className="ml-auto flex h-9 w-9 items-center justify-center rounded-full text-[#b38a83] transition hover:bg-[#fbefed] disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      {/* CIERRE */}
      <footer className="flex flex-col items-center gap-3 py-8 text-center">
        <Sparkles
          size={19}
          strokeWidth={1.4}
          className="text-[#aaa2ba]"
        />

        <p className="font-display text-2xl italic text-[#8994a2]">
          La constancia también puede ser una forma de amor.
        </p>
      </footer>

      {/* MODAL CREAR / EDITAR */}
      {formMode && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#263d50]/45 p-4 backdrop-blur-sm"
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="reminder-form-title"
            className="max-h-[90vh] w-full max-w-[560px] overflow-y-auto rounded-[28px] border border-white/70 bg-[#faf9f6] p-6 shadow-[0_30px_90px_rgba(26,43,55,0.22)] sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="pc-eyebrow">UN MOMENTO CON PROPÓSITO</p>

                <h2
                  id="reminder-form-title"
                  className="mt-2 font-display text-4xl text-[#40596d]"
                >
                  {formMode.kind === 'create'
                    ? 'Nuevo recordatorio'
                    : 'Editar recordatorio'}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                aria-label="Cerrar"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#edf0ef] text-[#728491] disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={(event) => void handleSave(event)}>
              <div className="mt-7 space-y-5">
                <div>
                  <label
                    htmlFor="reminder-person"
                    className="mb-2 block text-xs font-semibold text-[#647b8a]"
                  >
                    Persona
                  </label>

                  <select
                    id="reminder-person"
                    required
                    disabled={formMode.kind === 'edit'}
                    value={form.personId}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        personId: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-[#dfe6e7] bg-white px-4 py-3.5 text-sm text-[#526e82] outline-none focus:border-[#9aafbc] disabled:opacity-65"
                  >
                    <option value="">Seleccionar persona</option>

                    {people.map((person) => (
                      <option key={person.id} value={person.id}>
                        {getFullName(person)}
                      </option>
                    ))}
                  </select>

                  {people.length === 0 && (
                    <p className="mt-2 text-xs text-[#9b8c85]">
                      Primero necesitás registrar una persona.
                      <Link
                        to="/personas"
                        className="ml-1 underline"
                      >
                        Ir a personas
                      </Link>
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="reminder-time"
                    className="mb-2 block text-xs font-semibold text-[#647b8a]"
                  >
                    Hora de oración
                  </label>

                  <input
                    id="reminder-time"
                    type="time"
                    required
                    value={form.reminderTime}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        reminderTime: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-[#dfe6e7] bg-white px-4 py-3.5 text-sm text-[#526e82] outline-none focus:border-[#9aafbc]"
                  />
                </div>

                <div>
                  <p className="mb-3 text-xs font-semibold text-[#647b8a]">
                    Días de la semana
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {PRAYER_WEEK_DAYS.map((day) => (
                      <button
                        key={day.key}
                        type="button"
                        onClick={() => toggleDay(day.key)}
                        aria-pressed={form[day.key]}
                        title={day.label}
                        className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold transition ${
                          form[day.key]
                            ? 'bg-[#526e82] text-white shadow-sm'
                            : 'border border-[#e0e5e5] bg-white text-[#81909a] hover:bg-[#edf2f4]'
                        }`}
                      >
                        {day.short}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="reminder-timezone"
                    className="mb-2 block text-xs font-semibold text-[#647b8a]"
                  >
                    Zona horaria
                  </label>

                  <input
                    id="reminder-timezone"
                    type="text"
                    required
                    value={form.timeZoneId}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        timeZoneId: event.target.value,
                      }))
                    }
                    placeholder="America/Costa_Rica"
                    className="w-full rounded-2xl border border-[#dfe6e7] bg-white px-4 py-3.5 text-sm text-[#526e82] outline-none focus:border-[#9aafbc]"
                  />

                  <p className="mt-2 text-[11px] leading-5 text-[#9aa5aa]">
                    Utilizá un identificador de zona horaria
                    reconocido por el servidor.
                  </p>
                </div>

                <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-[#e2e8e7] bg-white px-4 py-4">
                  <span>
                    <span className="block text-sm font-semibold text-[#526e82]">
                      Recordatorio activo
                    </span>

                    <span className="mt-1 block text-xs text-[#96a2a8]">
                      Incluir este horario en tu agenda.
                    </span>
                  </span>

                  <input
                    type="checkbox"
                    checked={form.isEnabled}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        isEnabled: event.target.checked,
                      }))
                    }
                    className="h-5 w-5 accent-[#526e82]"
                  />
                </label>
              </div>

              {actionError && (
                <p
                  role="alert"
                  className="mt-5 rounded-xl bg-[#fff0ed] px-4 py-3 text-xs leading-6 text-[#a36d64]"
                >
                  {actionError}
                </p>
              )}

              <div className="mt-7 flex flex-wrap justify-end gap-3 border-t border-[#e7e9e6] pt-6">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="pc-button-secondary"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={saving || people.length === 0}
                  className="pc-button-primary"
                >
                  {saving ? (
                    <LoaderCircle
                      size={16}
                      className="animate-spin"
                    />
                  ) : (
                    <Check size={16} />
                  )}

                  {saving ? 'Guardando...' : 'Guardar horario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMACIÓN DE ELIMINACIÓN */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#263d50]/45 p-4 backdrop-blur-sm">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-reminder-title"
            className="w-full max-w-[440px] rounded-[26px] bg-[#faf9f6] p-7 shadow-[0_30px_90px_rgba(26,43,55,0.22)]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f9ece8] text-[#b38a83]">
              <Trash2 size={21} />
            </div>

            <h2
              id="delete-reminder-title"
              className="mt-5 font-display text-3xl text-[#40596d]"
            >
              ¿Eliminar recordatorio?
            </h2>

            <p className="mt-3 text-sm leading-7 text-[#84929c]">
              Este horario desaparecerá de tu agenda.
              Las peticiones y oraciones de la persona no
              se eliminarán.
            </p>

            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={processingId !== null}
                className="pc-button-secondary"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={() => void handleDelete()}
                disabled={processingId !== null}
                className="inline-flex items-center gap-2 rounded-full bg-[#b97970] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#a7665e] disabled:opacity-50"
              >
                {processingId ? (
                  <LoaderCircle
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  <Trash2 size={16} />
                )}
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
