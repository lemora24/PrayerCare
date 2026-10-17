
import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  ArrowUpRight,
  Heart,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { getPeople, type Person } from '../services/people'
import CreatePersonModal from '../Components/CreatePersonModal'

const relationshipLabels: Record<number, string> = {
  1: 'Familia',
  2: 'Amigo/a',
  3: 'Iglesia',
  4: 'Trabajo',
  5: 'Universidad',
  6: 'Pareja',
  7: 'Conocido/a',
  8: 'Otro',
}

const relationshipOptions = [
  { value: 'all', label: 'Todas las relaciones' },
  ...Object.entries(relationshipLabels).map(([value, label]) => ({
    value,
    label,
  })),
]

const avatarGradients = [
  'from-[#dce9e9] via-[#e6ebed] to-[#c6d7df]',
  'from-[#e8e0ed] via-[#f1e7e9] to-[#e9d8d2]',
  'from-[#f3e4d5] via-[#f1e8df] to-[#dce9e9]',
  'from-[#d9e3ed] via-[#e7e6f0] to-[#d8d4e8]',
  'from-[#e3e8dc] via-[#e8eee9] to-[#cbdedb]',
]

function getFullName(person: Person) {
  return `${person.firstName} ${person.lastName ?? ''}`.trim()
}

function getInitials(person: Person) {
  const first = person.firstName.trim().charAt(0)
  const last = (person.lastName ?? '').trim().charAt(0)

  return `${first}${last}`.toUpperCase() || '?'
}

function getAvatarGradient(id: string) {
  let hash = 0

  for (let index = 0; index < id.length; index++) {
    hash = (hash * 31 + id.charCodeAt(index)) | 0
  }

  return avatarGradients[Math.abs(hash) % avatarGradients.length]
}

export default function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [relationshipFilter, setRelationshipFilter] = useState('all')
  const [sortOrder, setSortOrder] = useState('az')
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    let active = true

    async function loadPeople() {
      try {
        const result = await getPeople()

        if (active) {
          setPeople(result)
        }
      } catch {
        if (active) {
          setError('No se pudieron cargar las personas.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadPeople()

    return () => {
      active = false
    }
  }, [])

  const filteredPeople = useMemo(() => {
    const search = searchTerm.trim().toLocaleLowerCase('es')

    return people
      .filter((person) => {
        const fullName = getFullName(person).toLocaleLowerCase('es')
        const relationship = Number(person.relationship)

        const matchesSearch =
          fullName.includes(search) ||
          (person.notes ?? '').toLocaleLowerCase('es').includes(search)

        const matchesRelationship =
          relationshipFilter === 'all' ||
          relationship === Number(relationshipFilter)

        return matchesSearch && matchesRelationship
      })
      .sort((a, b) => {
        const comparison = getFullName(a).localeCompare(
          getFullName(b),
          'es',
          { sensitivity: 'base' },
        )

        return sortOrder === 'za' ? -comparison : comparison
      })
  }, [people, searchTerm, relationshipFilter, sortOrder])

  const hasActiveFilters =
    searchTerm.trim() !== '' || relationshipFilter !== 'all'

  function resetFilters() {
    setSearchTerm('')
    setRelationshipFilter('all')
    setSortOrder('az')
  }

  return (
    <div className="space-y-8 pb-8">

      {/* =====================================
          ENCABEZADO EDITORIAL
      ===================================== */}

      <section className="pc-animate-enter relative overflow-hidden rounded-[30px] border border-[#526e82]/10 bg-gradient-to-br from-[#e6edef] via-[#eeeaf0] to-[#f6e8dc] p-7 sm:p-10 lg:p-12">
        <div className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full bg-white/45 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-[18%] h-44 w-44 rounded-full bg-[#f8ddc8]/45 blur-[65px]" />

        <div className="relative z-10 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/70 bg-white/50 text-[#526e82]">
                <Heart size={17} strokeWidth={1.7} />
              </div>

              <span className="pc-eyebrow">
                PERSONAS EN MI CORAZÓN
              </span>
            </div>

            <h1 className="font-display text-[clamp(3.2rem,5.5vw,5.7rem)] font-medium leading-[0.95] tracking-[-0.04em] text-[#263d50]">
              Cada persona
              <br />
              <span className="italic text-[#526e82]">
                tiene una historia.
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-sm leading-7 text-[#718394] sm:text-base">
              Un espacio para recordar sus necesidades,
              acompañar sus caminos y mantenerlos presentes
              en tus momentos de oración.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="pc-button-primary shrink-0 self-start shadow-[0_12px_28px_rgba(82,110,130,0.16)] md:self-end"
          >
            <Plus size={18} />
            Agregar persona
          </button>
        </div>

        <div className="relative z-10 mt-10 flex flex-wrap items-center gap-3 border-t border-[#526e82]/10 pt-6">
          <div className="flex items-center gap-2 text-[#526e82]">
            <UsersRound size={18} strokeWidth={1.7} />
            <span className="text-sm font-semibold">
              {people.length}
            </span>
            <span className="text-xs text-[#718394]">
              {people.length === 1
                ? 'persona registrada'
                : 'personas registradas'}
            </span>
          </div>

          <span className="hidden h-1 w-1 rounded-full bg-[#a8b9d0] sm:block" />

          <span className="text-xs text-[#8394a3]">
            Cada historia merece ser acompañada.
          </span>
        </div>
      </section>

      {/* =====================================
          BÚSQUEDA Y FILTROS
      ===================================== */}

      <section className="pc-card p-4 sm:p-5" aria-label="Buscar y filtrar personas">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <Search
              size={19}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8394a3]"
            />

            <input
              type="search"
              aria-label="Buscar personas por nombre o notas"
              placeholder="Busca a alguien por su nombre o historia..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="pc-input pl-12"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <SlidersHorizontal
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8394a3]"
              />

              <select
                aria-label="Filtrar por relación"
                value={relationshipFilter}
                onChange={(event) => setRelationshipFilter(event.target.value)}
                className="pc-input min-w-[190px] appearance-none pl-11 pr-5"
              >
                {relationshipOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <select
              aria-label="Ordenar personas"
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
              className="pc-input min-w-[150px]"
            >
              <option value="az">Nombre: A–Z</option>
              <option value="za">Nombre: Z–A</option>
            </select>
          </div>
        </div>

        {!loading && !error && people.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#526e82]/10 pt-4">
            <p className="text-xs text-[#8394a3]">
              Mostrando{' '}
              <span className="font-semibold text-[#526e82]">
                {filteredPeople.length}
              </span>{' '}
              de {people.length}
            </p>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#526e82] hover:underline"
              >
                <X size={14} />
                Limpiar filtros
              </button>
            )}
          </div>
        )}
      </section>

      {/* =====================================
          ESTADOS DE CARGA Y ERROR
      ===================================== */}

      {loading && (
        <div role="status" className="pc-card flex items-center gap-4 p-7">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#dce9e9] text-[#526e82] pc-animate-breathe">
            <UsersRound size={21} />
          </div>

          <p className="text-sm text-[#718394]">
            Preparando las historias de las personas...
          </p>
        </div>
      )}

      {error && (
        <div role="alert" className="pc-card p-7">
          <p className="text-sm font-semibold text-rose-700">
            {error}
          </p>
        </div>
      )}

      {/* =====================================
          ESTADO VACÍO
      ===================================== */}

      {!loading && !error && people.length === 0 && (
        <div className="pc-card px-6 py-16 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[28px] bg-gradient-to-br from-[#dce9e9] to-[#e8e0ed] text-[#526e82]">
            <UserRound size={35} strokeWidth={1.4} />
          </div>

          <p className="pc-eyebrow">UNA HISTORIA POR COMENZAR</p>

          <h2 className="pc-heading mt-4 text-4xl text-[#263d50]">
            ¿A quién llevas en tu corazón?
          </h2>

          <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[#8394a3]">
            Agrega a tu primera persona y comienza a guardar
            sus peticiones y tus momentos de oración.
          </p>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="pc-button-primary mt-7"
          >
            <Plus size={17} />
            Agregar mi primera persona
          </button>
        </div>
      )}

      {/* =====================================
          SIN RESULTADOS
      ===================================== */}

      {!loading &&
        !error &&
        people.length > 0 &&
        filteredPeople.length === 0 && (
          <div className="pc-card px-6 py-14 text-center">
            <Search
              size={32}
              className="mx-auto mb-5 text-[#a8b9d0]"
            />

            <h2 className="pc-heading text-4xl text-[#263d50]">
              No encontramos coincidencias.
            </h2>

            <p className="mt-3 text-sm text-[#8394a3]">
              Prueba con otro nombre o cambia los filtros.
            </p>

            <button
              type="button"
              onClick={resetFilters}
              className="pc-button-secondary mt-6"
            >
              Limpiar búsqueda
            </button>
          </div>
        )}

      {/* =====================================
          GALERÍA DE PERSONAS
      ===================================== */}

      {!loading && !error && filteredPeople.length > 0 && (
        <section aria-label="Personas registradas">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="pc-eyebrow">
                HISTORIAS QUE ACOMPAÑO
              </p>

              <h2 className="pc-heading mt-2 text-3xl text-[#263d50]">
                Mi comunidad
              </h2>
            </div>

            <Sparkles
              size={20}
              className="text-[#c99c73]"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredPeople.map((person) => {
              const fullName = getFullName(person)
              const relationship = Number(person.relationship)

              return (
                <article
                  key={person.id}
                  className="pc-card pc-card-interactive group flex min-h-[300px] flex-col overflow-hidden"
                >
                  {/* BANDA DECORATIVA */}
                  <div className={`relative h-[85px] overflow-hidden bg-gradient-to-r ${getAvatarGradient(person.id)}`}>
                    <div className="absolute -right-8 -top-12 h-36 w-36 rounded-full border border-white/45" />
                    <div className="absolute right-6 top-4 h-20 w-20 rounded-full border border-white/35" />
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-white/50" />
                  </div>

                  <div className="relative flex flex-1 flex-col px-6 pb-6">
                    {/* AVATAR */}
                    <div className="-mt-9 mb-4 flex h-[72px] w-[72px] items-center justify-center rounded-[24px] border-[5px] border-white bg-gradient-to-br from-[#e6edef] to-[#d8d4e8] font-display text-[29px] font-semibold text-[#526e82] shadow-[0_8px_20px_rgba(38,61,80,0.08)]">
                      {getInitials(person)}
                    </div>

                    <div className="mb-2">
                      <span className="pc-badge">
                        <Heart size={12} strokeWidth={1.7} />
                        {relationshipLabels[relationship] ??
                          'Sin relación especificada'}
                      </span>
                    </div>

                    <h3 className="mt-2 font-display text-[30px] font-semibold leading-[1.05] text-[#263d50]">
                      {fullName}
                    </h3>

                    <p className="mt-2 text-xs font-medium text-[#97a4af]">
                      Una historia que merece ser acompañada.
                    </p>

                    {person.notes ? (
                      <p className="mt-4 line-clamp-3 text-sm leading-6 text-[#718394]">
                        {person.notes}
                      </p>
                    ) : (
                      <p className="mt-4 text-sm italic leading-6 text-[#a0acb6]">
                        Todavía no has agregado notas sobre esta persona.
                      </p>
                    )}

                    <div className="mt-auto pt-6">
                      <div className="border-t border-[#526e82]/10 pt-4">
                        <Link
                          to={`/personas/${person.id}`}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-[#526e82] transition-all group-hover:gap-3"
                        >
                          Ver su historia
                          <ArrowUpRight size={17} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      )}

      {/* =====================================
          NOTA FINAL
      ===================================== */}

      {!loading && !error && people.length > 0 && (
        <div className="flex items-center justify-center gap-2 pt-3 text-center text-xs text-[#97a4af]">
          <Heart size={13} strokeWidth={1.6} />
          Acompañar también es una forma de amar.
          <ArrowRight size={13} />
        </div>
      )}

      {/* =====================================
          MODAL DE CREACIÓN
      ===================================== */}

      {showCreateModal && (
        <CreatePersonModal
          onClose={() => setShowCreateModal(false)}
          onCreated={(person) => {
            setPeople((currentPeople) => [...currentPeople, person])
            setShowCreateModal(false)
          }}
        />
      )}
    </div>
  )
}
