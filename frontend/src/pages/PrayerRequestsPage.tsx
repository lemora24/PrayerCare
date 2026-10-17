
import { useEffect, useMemo, useState } from 'react'
import {
  ArrowUpDown,
  BookHeart,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Heart,
  Search,
  SlidersHorizontal,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import {
  getAllPrayerRequests,
  type PrayerRequest,
} from '../services/prayerRequests'

const categoryLabels: Record<number, string> = {
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

const priorityLabels: Record<number, string> = {
  1: 'Baja',
  2: 'Normal',
  3: 'Alta',
  4: 'Urgente',
}

const statusLabels: Record<number, string> = {
  1: 'Activa',
  2: 'En seguimiento',
  3: 'Respondida',
  4: 'Cerrada',
}

type GlobalPrayerRequest = PrayerRequest & {
  personName?: string
}

type SortOption =
  | 'newest'
  | 'oldest'
  | 'priority'
  | 'recentPrayer'
  | 'name'

function formatDate(value: string | null): string {
  if (!value) return 'Sin registrar'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Fecha no disponible'
  }

  return date.toLocaleDateString('es-CR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function PrayerRequestsPage() {
  const [requests, setRequests] = useState<GlobalPrayerRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortBy, setSortBy] = useState<SortOption>('newest')

  useEffect(() => {
    let active = true

    async function loadRequests() {
      try {
        const result = await getAllPrayerRequests()

        if (active) {
          setRequests(result)
        }
      } catch {
        if (active) {
          setError('No se pudieron cargar las peticiones.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadRequests()

    return () => {
      active = false
    }
  }, [])

  const stats = useMemo(() => {
    return {
      total: requests.length,
      active: requests.filter((request) => request.status === 1).length,
      answered: requests.filter((request) => request.status === 3).length,
      followingUp: requests.filter((request) => request.status === 2).length,
      people: new Set(requests.map((request) => request.personId)).size,
    }
  }, [requests])

  const visibleRequests = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase('es')

    const filtered = requests.filter((request) => {
      const searchableText = [
        request.title,
        request.description ?? '',
        request.personName ?? '',
        categoryLabels[request.category] ?? '',
      ]
        .join(' ')
        .toLocaleLowerCase('es')

      const matchesSearch =
        !normalizedSearch || searchableText.includes(normalizedSearch)

      const matchesStatus =
        statusFilter === 'all' ||
        request.status === Number(statusFilter)

      const matchesPriority =
        priorityFilter === 'all' ||
        request.priority === Number(priorityFilter)

      const matchesCategory =
        categoryFilter === 'all' ||
        request.category === Number(categoryFilter)

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority &&
        matchesCategory
      )
    })

    return filtered.sort((a, b) => {
      if (sortBy === 'priority') {
        return (
          b.priority - a.priority ||
          new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        )
      }

      if (sortBy === 'oldest') {
        return (
          new Date(a.createdAt).getTime() -
          new Date(b.createdAt).getTime()
        )
      }

      if (sortBy === 'recentPrayer') {
        return (
          new Date(b.lastPrayedAt ?? 0).getTime() -
          new Date(a.lastPrayedAt ?? 0).getTime()
        )
      }

      if (sortBy === 'name') {
        return (a.personName ?? '').localeCompare(
          b.personName ?? '',
          'es',
        )
      }

      return (
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
      )
    })
  }, [
    requests,
    search,
    statusFilter,
    priorityFilter,
    categoryFilter,
    sortBy,
  ])

  function clearFilters() {
    setSearch('')
    setStatusFilter('all')
    setPriorityFilter('all')
    setCategoryFilter('all')
    setSortBy('newest')
  }

  const hasActiveFilters =
    search.trim() !== '' ||
    statusFilter !== 'all' ||
    priorityFilter !== 'all' ||
    categoryFilter !== 'all' ||
    sortBy !== 'newest'

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-9 w-64 animate-pulse rounded-xl bg-slate-200" />
        <div className="h-28 animate-pulse rounded-3xl bg-slate-100" />
        <div className="h-56 animate-pulse rounded-3xl bg-slate-100" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8">
        <p className="font-semibold text-red-700">{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-4 text-sm font-semibold text-red-700 underline"
        >
          Intentar nuevamente
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-7">
      {/* ENCABEZADO */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-700">
            <BookHeart size={18} />
            CENTRO DE ORACIÓN
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Todas las peticiones
          </h1>

          <p className="mt-2 text-slate-500">
            Acompaña cada necesidad y da seguimiento a tus oraciones.
          </p>
        </div>

        <Link
          to="/personas"
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          <Users size={18} />
          Ver personas
        </Link>
      </div>

      {/* ESTADÍSTICAS */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">
              Total de peticiones
            </span>
            <BookHeart size={20} className="text-slate-400" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            {stats.total}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">
              Activas
            </span>
            <Heart size={20} className="text-blue-600" />
          </div>
          <p className="mt-3 text-3xl font-bold text-blue-700">
            {stats.active}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">
              En seguimiento
            </span>
            <Clock3 size={20} className="text-amber-600" />
          </div>
          <p className="mt-3 text-3xl font-bold text-amber-700">
            {stats.followingUp}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">
              Respondidas
            </span>
            <CheckCircle2 size={20} className="text-emerald-600" />
          </div>
          <p className="mt-3 text-3xl font-bold text-emerald-700">
            {stats.answered}
          </p>
        </div>
      </div>

      {/* BUSCADOR Y FILTROS */}
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center gap-2">
          <SlidersHorizontal size={19} className="text-emerald-700" />
          <h2 className="font-bold text-slate-900">
            Buscar y filtrar
          </h2>
        </div>

        <div className="relative">
          <Search
            size={19}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por persona, petición o descripción..."
            aria-label="Buscar peticiones"
            className="w-full rounded-xl border border-slate-200 py-3 pl-12 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div>
            <label
              htmlFor="global-status"
              className="mb-2 block text-xs font-semibold text-slate-500"
            >
              Estado
            </label>

            <select
              id="global-status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-emerald-500"
            >
              <option value="all">Todos</option>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="global-priority"
              className="mb-2 block text-xs font-semibold text-slate-500"
            >
              Prioridad
            </label>

            <select
              id="global-priority"
              value={priorityFilter}
              onChange={(event) =>
                setPriorityFilter(event.target.value)
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-emerald-500"
            >
              <option value="all">Todas</option>
              {Object.entries(priorityLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="global-category"
              className="mb-2 block text-xs font-semibold text-slate-500"
            >
              Categoría
            </label>

            <select
              id="global-category"
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(event.target.value)
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-emerald-500"
            >
              <option value="all">Todas</option>
              {Object.entries(categoryLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="global-sort"
              className="mb-2 flex items-center gap-1 text-xs font-semibold text-slate-500"
            >
              <ArrowUpDown size={13} />
              Ordenar por
            </label>

            <select
              id="global-sort"
              value={sortBy}
              onChange={(event) =>
                setSortBy(event.target.value as SortOption)
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-emerald-500"
            >
              <option value="newest">Más recientes</option>
              <option value="oldest">Más antiguas</option>
              <option value="priority">Mayor prioridad</option>
              <option value="recentPrayer">Última oración</option>
              <option value="name">Nombre de persona</option>
            </select>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            Mostrando{' '}
            <strong className="text-slate-900">
              {visibleRequests.length}
            </strong>{' '}
            de {requests.length} peticiones
          </p>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm font-semibold text-emerald-700 hover:underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </section>

      {/* LISTA */}
      {visibleRequests.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <BookHeart
            size={36}
            className="mx-auto text-slate-300"
          />

          <h3 className="mt-4 text-lg font-bold text-slate-900">
            {requests.length === 0
              ? 'Todavía no hay peticiones'
              : 'No encontramos coincidencias'}
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            {requests.length === 0
              ? 'Crea tu primera petición desde el perfil de una persona.'
              : 'Prueba con otra búsqueda o cambia los filtros.'}
          </p>
        </div>
      ) : (
        <section className="grid gap-4">
          {visibleRequests.map((request) => (
            <article
              key={request.id}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-emerald-200 hover:shadow-md"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={
                        request.status === 3
                          ? 'rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700'
                          : request.status === 2
                            ? 'rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700'
                            : 'rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700'
                      }
                    >
                      {statusLabels[request.status] ?? 'Sin estado'}
                    </span>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {priorityLabels[request.priority] ?? 'Normal'}
                    </span>
                  </div>

                  <h3 className="mt-4 text-lg font-bold text-slate-900">
                    {request.title}
                  </h3>

                  <p className="mt-1 text-sm font-semibold text-emerald-700">
                    <Users size={14} className="mr-1 inline" />
                    {request.personName || 'Persona'}
                  </p>

                  {request.description && (
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                      {request.description}
                    </p>
                  )}
                </div>

                <span className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                  {categoryLabels[request.category] ?? 'Otro'}
                </span>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays size={15} />
                  Creada: {formatDate(request.createdAt)}
                </span>

                {request.lastPrayedAt && (
                  <span className="inline-flex items-center gap-1.5">
                    <Heart size={15} />
                    Última oración: {formatDate(request.lastPrayedAt)}
                  </span>
                )}

                {request.answeredAt && (
                  <span className="inline-flex items-center gap-1.5 text-emerald-700">
                    <CheckCircle2 size={15} />
                    Respondida: {formatDate(request.answeredAt)}
                  </span>
                )}
              </div>

              <Link
                to={`/personas/${request.personId}`}
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 transition hover:text-emerald-900"
              >
                Ver perfil y gestionar petición
                <ChevronRight size={17} />
              </Link>
            </article>
          ))}
        </section>
      )}
    </div>
  )
}
