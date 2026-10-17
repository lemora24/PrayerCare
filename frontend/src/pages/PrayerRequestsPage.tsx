
import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  BookHeart,
  CheckCircle2,
  CircleHelp,
  Clock3,
  Filter,
  Heart,
  LoaderCircle,
  Search,
  Sparkles,
  X,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  getAllPrayerRequests,
  type PrayerRequest,
} from '../services/prayerRequests'
import {
  getPeople,
  type Person,
} from '../services/people'

const categories: Record<number, string> = {
  1: 'Salud',
  2: 'Familia',
  3: 'Trabajo',
  4: 'Estudios',
  5: 'Finanzas',
  6: 'Relaciones',
  7: 'Fe',
  8: 'Decisiones',
  9: 'Ministerio',
  10: 'Otro',
}

const priorities: Record<number, string> = {
  1: 'Baja',
  2: 'Normal',
  3: 'Alta',
  4: 'Urgente',
}

const statuses: Record<number, string> = {
  1: 'En oración',
  2: 'En seguimiento',
  3: 'Respondida',
  4: 'Cerrada',
}

type StatusFilter = 'all' | 'active' | 'answered' | 'closed'
type SortMode = 'recent' | 'oldest' | 'priority'

function getPersonName(person: Person) {
  return [person.firstName, person.lastName]
    .filter(Boolean)
    .join(' ')
    .trim()
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('es-CR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function getStatusStyle(status: number) {
  if (status === 3) {
    return 'border-[#c9ddcd] bg-[#edf4ed] text-[#63816a]'
  }

  if (status === 2) {
    return 'border-[#d9d5e8] bg-[#f0eef7] text-[#82749a]'
  }

  if (status === 4) {
    return 'border-[#e0ddd7] bg-[#f2f0eb] text-[#8b8982]'
  }

  return 'border-[#d4e1e7] bg-[#edf4f6] text-[#627f8d]'
}

function getPriorityStyle(priority: number) {
  if (priority === 4) {
    return 'text-[#b46f67]'
  }

  if (priority === 3) {
    return 'text-[#aa8566]'
  }

  return 'text-[#918b83]'
}

export default function PrayerRequestsPage() {
  const [requests, setRequests] = useState<PrayerRequest[]>([])
  const [people, setPeople] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortMode, setSortMode] = useState<SortMode>('recent')

  useEffect(() => {
    let active = true

    async function loadData() {
      try {
        setLoading(true)
        setError(null)

        const [requestsData, peopleData] = await Promise.all([
          getAllPrayerRequests(),
          getPeople(),
        ])

        if (!active) return

        setRequests(requestsData)
        setPeople(peopleData)
      } catch {
        if (active) {
          setError(
            'No pudimos cargar tus peticiones. Intentalo nuevamente.',
          )
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadData()

    return () => {
      active = false
    }
  }, [])

  const peopleById = useMemo(() => {
    return new Map(people.map((person) => [person.id, person]))
  }, [people])

  const stats = useMemo(() => {
    return {
      total: requests.length,
      active: requests.filter(
        (request) => request.status === 1 || request.status === 2,
      ).length,
      answered: requests.filter(
        (request) => request.status === 3,
      ).length,
      urgent: requests.filter(
        (request) =>
          request.priority === 4 &&
          (request.status === 1 || request.status === 2),
      ).length,
    }
  }, [requests])

  const filteredRequests = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase('es')

    const filtered = requests.filter((request) => {
      const person = peopleById.get(request.personId)
      const personName = person ? getPersonName(person) : ''

      const searchableText = [
        request.title,
        request.description ?? '',
        personName,
        categories[request.category] ?? '',
      ]
        .join(' ')
        .toLocaleLowerCase('es')

      const matchesSearch =
        normalizedSearch.length === 0 ||
        searchableText.includes(normalizedSearch)

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' &&
          (request.status === 1 || request.status === 2)) ||
        (statusFilter === 'answered' && request.status === 3) ||
        (statusFilter === 'closed' && request.status === 4)

      const matchesCategory =
        categoryFilter === 'all' ||
        request.category === Number(categoryFilter)

      return matchesSearch && matchesStatus && matchesCategory
    })

    return filtered.sort((a, b) => {
      if (sortMode === 'priority') {
        return (
          b.priority - a.priority ||
          new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        )
      }

      if (sortMode === 'oldest') {
        return (
          new Date(a.createdAt).getTime() -
          new Date(b.createdAt).getTime()
        )
      }

      return (
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
      )
    })
  }, [
    requests,
    peopleById,
    search,
    statusFilter,
    categoryFilter,
    sortMode,
  ])

  const hasActiveFilters =
    search.trim() !== '' ||
    statusFilter !== 'all' ||
    categoryFilter !== 'all'

  function clearFilters() {
    setSearch('')
    setStatusFilter('all')
    setCategoryFilter('all')
    setSortMode('recent')
  }

  if (loading) {
    return (
      <div className="flex min-h-[55vh] flex-col items-center justify-center gap-4">
        <LoaderCircle
          size={30}
          className="animate-spin text-[#71899a]"
        />
        <p className="text-sm text-[#84919b]">
          Preparando tu biblioteca de oración...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-xl py-20 text-center">
        <CircleHelp
          size={36}
          className="mx-auto text-[#9d8f9d]"
        />
        <h2 className="mt-5 font-display text-4xl text-[#40596d]">
          No pudimos abrir tu biblioteca
        </h2>
        <p className="mt-3 text-sm leading-7 text-[#84919b]">
          {error}
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="pc-button-primary mt-6"
        >
          Intentar de nuevo
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1380px] space-y-8 pb-16">
      {/* ENCABEZADO */}
      <section className="relative overflow-hidden rounded-[30px] border border-[#dce5e9] bg-gradient-to-br from-[#eaf1f4] via-[#f3f2f5] to-[#f6eee7] px-7 py-10 sm:px-11 sm:py-12">
        <div className="pointer-events-none absolute -right-12 -top-28 h-80 w-80 rounded-full border border-white/70" />
        <div className="pointer-events-none absolute -right-4 -top-20 h-64 w-64 rounded-full border border-white/60" />

        <div className="relative max-w-2xl">
          <div className="flex items-center gap-2">
            <BookHeart
              size={16}
              className="text-[#7b90a0]"
            />
            <p className="pc-eyebrow">
              TU BIBLIOTECA ESPIRITUAL
            </p>
          </div>

          <h1 className="mt-5 font-display text-[clamp(3rem,6vw,5.4rem)] font-medium leading-[0.95] tracking-tight text-[#40596d]">
            Cada petición,
            <span className="block italic text-[#8c86a7]">
              una historia.
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-sm leading-8 text-[#748593] sm:text-base">
            Un lugar para recordar cada intención, acompañar
            cada proceso y reconocer las respuestas que llegan
            con el tiempo.
          </p>

          <div className="mt-7 inline-flex items-center gap-2 text-xs font-medium text-[#7f8f9c]">
            <Sparkles size={15} />
            Un espacio para orar con intención
          </div>
        </div>
      </section>

      {/* ESTADÍSTICAS */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          {
            label: 'Total de peticiones',
            value: stats.total,
            icon: BookHeart,
            color: '#637f93',
            background: '#eaf1f5',
          },
          {
            label: 'En oración',
            value: stats.active,
            icon: Heart,
            color: '#8b7fa8',
            background: '#f0edf6',
          },
          {
            label: 'Respondidas',
            value: stats.answered,
            icon: CheckCircle2,
            color: '#73947b',
            background: '#edf4ed',
          },
          {
            label: 'Prioridad urgente',
            value: stats.urgent,
            icon: Clock3,
            color: '#b88c75',
            background: '#f8eee8',
          },
        ].map((stat) => {
          const Icon = stat.icon

          return (
            <div
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
            </div>
          )
        })}
      </section>

      {/* BÚSQUEDA Y FILTROS */}
      <section className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="pc-eyebrow">EXPLORAR PETICIONES</p>
            <h2 className="mt-2 font-display text-4xl text-[#40596d]">
              Tu colección de oraciones
            </h2>
          </div>

          <p className="text-xs text-[#8a979e]">
            {filteredRequests.length}{' '}
            {filteredRequests.length === 1
              ? 'petición encontrada'
              : 'peticiones encontradas'}
          </p>
        </div>

        <div className="rounded-[24px] border border-[#e5e9e8] bg-white/70 p-4 shadow-[0_5px_25px_rgba(56,72,82,0.025)] sm:p-5">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_190px_180px]">
            <div className="relative">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#94a0a7]"
              />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Buscar petición, persona o tema..."
                aria-label="Buscar peticiones"
                className="w-full rounded-2xl border border-[#e4e8e9] bg-[#fafbfa] py-3.5 pl-11 pr-4 text-sm text-[#40596d] outline-none transition placeholder:text-[#a0a9ad] focus:border-[#9aafbc] focus:ring-2 focus:ring-[#dbe7ec]"
              />
            </div>

            <div className="relative">
              <Filter
                size={15}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#94a0a7]"
              />

              <select
                value={categoryFilter}
                onChange={(event) =>
                  setCategoryFilter(event.target.value)
                }
                aria-label="Filtrar por categoría"
                className="w-full appearance-none rounded-2xl border border-[#e4e8e9] bg-[#fafbfa] py-3.5 pl-10 pr-4 text-sm text-[#617584] outline-none focus:border-[#9aafbc]"
              >
                <option value="all">Todas las categorías</option>
                {Object.entries(categories).map(([id, label]) => (
                  <option key={id} value={id}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={sortMode}
              onChange={(event) =>
                setSortMode(event.target.value as SortMode)
              }
              aria-label="Ordenar peticiones"
              className="w-full rounded-2xl border border-[#e4e8e9] bg-[#fafbfa] px-4 py-3.5 text-sm text-[#617584] outline-none focus:border-[#9aafbc]"
            >
              <option value="recent">Más recientes</option>
              <option value="oldest">Más antiguas</option>
              <option value="priority">Mayor prioridad</option>
            </select>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {(
              [
                ['all', 'Todas'],
                ['active', 'En oración'],
                ['answered', 'Respondidas'],
                ['closed', 'Cerradas'],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setStatusFilter(value)}
                aria-pressed={statusFilter === value}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                  statusFilter === value
                    ? 'bg-[#526e82] text-white shadow-sm'
                    : 'bg-[#f3f5f4] text-[#81909a] hover:bg-[#e8eef0]'
                }`}
              >
                {label}
              </button>
            ))}

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium text-[#8b9298] transition hover:text-[#40596d]"
              >
                <X size={14} />
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      </section>

      {/* COLECCIÓN */}
      {filteredRequests.length === 0 ? (
        <section className="rounded-[28px] border border-[#e5e9e8] bg-white/70 px-6 py-16 text-center">
          <BookHeart
            size={39}
            strokeWidth={1.3}
            className="mx-auto text-[#a1aeb8]"
          />

          <h3 className="mt-5 font-display text-4xl text-[#40596d]">
            {requests.length === 0
              ? 'Una historia por comenzar'
              : 'No encontramos coincidencias'}
          </h3>

          <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#84929c]">
            {requests.length === 0
              ? 'Todavía no hay peticiones registradas. Comenzá desde el diario de alguna persona.'
              : 'Probá otra búsqueda o ajustá los filtros para encontrar lo que necesitás.'}
          </p>

          {requests.length === 0 ? (
            <Link
              to="/personas"
              className="pc-button-primary mt-6 inline-flex"
            >
              Ir a personas
              <ArrowRight size={16} />
            </Link>
          ) : (
            <button
              type="button"
              onClick={clearFilters}
              className="pc-button-secondary mt-6"
            >
              Ver todas las peticiones
            </button>
          )}
        </section>
      ) : (
        <section className="grid gap-4 xl:grid-cols-2">
          {filteredRequests.map((request) => {
            const person = peopleById.get(request.personId)
            const personName = person
              ? getPersonName(person)
              : 'Persona no disponible'

            const answered = request.status === 3

            return (
              <article
                key={request.id}
                className={`group relative flex min-w-0 flex-col overflow-hidden rounded-[25px] border bg-white/80 p-6 shadow-[0_6px_25px_rgba(56,72,82,0.035)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_15px_40px_rgba(56,72,82,0.075)] sm:p-7 ${
                  answered
                    ? 'border-[#d7e5d7]'
                    : 'border-[#e6e9e8]'
                }`}
              >
                {answered && (
                  <div className="absolute right-0 top-0 h-28 w-28 rounded-bl-full bg-[#edf4ed]/70" />
                )}

                <div className="relative flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold ${getStatusStyle(
                      request.status,
                    )}`}
                  >
                    {answered && <CheckCircle2 size={13} />}
                    {statuses[request.status] ?? 'Sin estado'}
                  </span>

                  <span className="rounded-full bg-[#f1f2f0] px-3 py-1.5 text-[11px] font-medium text-[#829097]">
                    {categories[request.category] ?? 'Otro'}
                  </span>

                  <span
                    className={`ml-auto text-[11px] font-semibold ${getPriorityStyle(
                      request.priority,
                    )}`}
                  >
                    {priorities[request.priority] ?? 'Normal'}
                  </span>
                </div>

                <h3 className="relative mt-6 break-words font-display text-[clamp(1.8rem,3vw,2.5rem)] font-medium leading-tight text-[#40596d]">
                  {request.title}
                </h3>

                <p className="relative mt-3 line-clamp-3 min-h-[54px] whitespace-pre-wrap text-sm leading-7 text-[#83919a]">
                  {request.description?.trim() ||
                    'Una intención guardada con fe y esperanza.'}
                </p>

                {answered && (
                  <div className="relative mt-5 flex items-center gap-2 rounded-xl bg-[#eef5ed] px-4 py-3 text-xs text-[#6e8b72]">
                    <CheckCircle2 size={16} />
                    <span>
                      Un motivo para agradecer
                      {request.answeredAt
                        ? ` · ${formatDate(request.answeredAt)}`
                        : ''}
                    </span>
                  </div>
                )}

                <div className="relative mt-auto flex flex-wrap items-center justify-between gap-4 border-t border-[#edf0ee] pt-5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#647a89]">
                      {personName}
                    </p>
                    <p className="mt-1 text-[11px] text-[#a0a8aa]">
                      {formatDate(request.createdAt)}
                    </p>
                  </div>

                  {person ? (
                    <Link
                      to={`/personas/${person.id}`}
                      className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#edf2f4] px-4 py-2.5 text-xs font-semibold text-[#526e82] transition hover:bg-[#dfe9ed]"
                    >
                      <BookHeart size={15} />
                      Abrir diario
                      <ArrowRight
                        size={14}
                        className="transition-transform group-hover:translate-x-0.5"
                      />
                    </Link>
                  ) : (
                    <span className="text-xs italic text-[#a1a8a9]">
                      Diario no disponible
                    </span>
                  )}
                </div>
              </article>
            )
          })}
        </section>
      )}

      {/* CIERRE EDITORIAL */}
      {requests.length > 0 && (
        <footer className="flex flex-col items-center gap-3 py-8 text-center">
          <Heart
            size={19}
            strokeWidth={1.4}
            className="text-[#a8a0b9]"
          />
          <p className="max-w-lg font-display text-2xl italic text-[#8994a2]">
            Hay historias que comienzan con una oración.
          </p>
        </footer>
      )}
    </div>
  )
}
