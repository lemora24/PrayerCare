
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowUpRight,
  BookHeart,
  Heart,
  LoaderCircle,
  Search,
  SearchX,
  UsersRound,
  X,
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

import {
  getPeople,
  type Person,
} from '../services/people'

import {
  getAllPrayerRequests,
  type PrayerRequest,
} from '../services/prayerRequests'

type GlobalSearchProps = {
  open: boolean
  onClose: () => void
}


function normalizeText(
  value: string | number | null | undefined,
): string {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}


function getPersonName(person: Person): string {
  return [
    String(person.firstName ?? ''),
    String(person.lastName ?? ''),
  ]
    .filter(Boolean)
    .join(' ')
    .trim()
}

function getRequestStatus(status: number): string {
  switch (status) {
    case 1:
      return 'Activa'
    case 2:
      return 'En seguimiento'
    case 3:
      return 'Respondida'
    default:
      return 'Petición'
  }
}

export default function GlobalSearch({
  open,
  onClose,
}: GlobalSearchProps) {
  const location = useLocation()
  const inputRef = useRef<HTMLInputElement>(null)

  const [query, setQuery] = useState('')
  const [people, setPeople] = useState<Person[]>([])
  const [requests, setRequests] = useState<PrayerRequest[]>([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return

    let active = true

    async function loadSearchData() {
      setLoading(true)
      setError('')

      const results = await Promise.allSettled([
        getPeople(),
        getAllPrayerRequests(),
      ])

      if (!active) return

      const [peopleResult, requestsResult] = results

      if (peopleResult.status === 'fulfilled') {
        setPeople(peopleResult.value)
      } else {
        setPeople([])
      }

      if (requestsResult.status === 'fulfilled') {
        setRequests(requestsResult.value)
      } else {
        setRequests([])
      }

      if (
        peopleResult.status === 'rejected' &&
        requestsResult.status === 'rejected'
      ) {
        setError(
          'No pudimos consultar tus personas y peticiones. Intentá nuevamente.',
        )
      } else if (
        peopleResult.status === 'rejected' ||
        requestsResult.status === 'rejected'
      ) {
        setError(
          'Algunos resultados no están disponibles en este momento.',
        )
      }

      setLoading(false)
    }

    void loadSearchData()

    return () => {
      active = false
    }
  }, [open])

  useEffect(() => {
    if (!open) {
      setQuery('')
      return
    }

    inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (!open) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  useEffect(() => {
    if (open) {
      onClose()
    }
    // Cerrar al cambiar de ruta.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  const normalizedQuery = useMemo(
    () => normalizeText(query),
    [query],
  )

  const filteredPeople = useMemo(() => {
    if (!normalizedQuery) return []

    return people
      .filter((person) => {
        const name = normalizeText(getPersonName(person))
        const relationship = normalizeText(
          person.relationship ?? '',
        )

        return (
          name.includes(normalizedQuery) ||
          relationship.includes(normalizedQuery)
        )
      })
      .slice(0, 6)
  }, [people, normalizedQuery])

  const filteredRequests = useMemo(() => {
    if (!normalizedQuery) return []

    return requests
      .filter((request) => {
        const title = normalizeText(request.title)
        const description = normalizeText(
          request.description ?? '',
        )

        return (
          title.includes(normalizedQuery) ||
          description.includes(normalizedQuery)
        )
      })
      .slice(0, 8)
  }, [requests, normalizedQuery])

  const peopleNames = useMemo(() => {
    const names: Record<string, string> = {}

    people.forEach((person) => {
      names[person.id] = getPersonName(person)
    })

    return names
  }, [people])

  const totalResults =
    filteredPeople.length + filteredRequests.length

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-[#263d50]/40 px-4 pb-6 pt-[8vh] backdrop-blur-md">
      {/* FONDO PARA CERRAR */}
      <button
        type="button"
        aria-label="Cerrar búsqueda"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />

      {/* PANEL */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="global-search-title"
        className="pc-animate-enter relative z-10 flex max-h-[82vh] w-full max-w-[720px] flex-col overflow-hidden rounded-[30px] border border-white/80 bg-[#faf9f6] shadow-[0_30px_100px_rgba(25,43,56,0.24)]"
      >
        {/* ENCABEZADO */}
        <div className="border-b border-[#526e82]/10 px-6 pb-5 pt-6 sm:px-8 sm:pt-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="pc-eyebrow">
                ENCUENTRA LO QUE LLEVAS EN EL CORAZÓN
              </p>

              <h2
                id="global-search-title"
                className="pc-heading mt-2 text-3xl text-[#263d50] sm:text-4xl"
              >
                Buscar en PrayerCare
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar búsqueda"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#edf0f0] text-[#718394] transition hover:bg-[#e1e9ea]"
            >
              <X size={19} />
            </button>
          </div>

          {/* INPUT */}
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-[#dce4e6] bg-white px-4 py-4 shadow-[0_5px_20px_rgba(38,61,80,0.035)] focus-within:border-[#9fb3bf]">
            <Search
              size={21}
              className="shrink-0 text-[#7c92a0]"
            />

            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="Buscar personas o peticiones..."
              aria-label="Buscar personas o peticiones"
              className="min-w-0 flex-1 bg-transparent text-sm text-[#263d50] outline-none placeholder:text-[#a0acb4]"
            />

            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('')
                  inputRef.current?.focus()
                }}
                aria-label="Limpiar búsqueda"
                className="text-[#a0acb4] transition hover:text-[#526e82]"
              >
                <X size={17} />
              </button>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-[11px] text-[#97a4af]">
              Personas · Peticiones · Historias
            </p>

            <span className="rounded-md border border-[#e0e6e7] px-2 py-1 text-[10px] text-[#91a0aa]">
              ESC para cerrar
            </span>
          </div>
        </div>

        {/* RESULTADOS */}
        <div className="min-h-[170px] flex-1 overflow-y-auto px-5 py-5 sm:px-7">
          {loading ? (
            <div
              role="status"
              className="flex flex-col items-center justify-center gap-4 py-14"
            >
              <LoaderCircle
                size={27}
                className="animate-spin text-[#7894a4]"
              />

              <p className="text-sm text-[#8394a3]">
                Buscando entre tus historias...
              </p>
            </div>
          ) : (
            <>
              {error && (
                <p
                  role="alert"
                  className="mb-5 rounded-2xl border border-[#efdcd4] bg-[#fff5f0] px-4 py-3 text-xs leading-6 text-[#a17870]"
                >
                  {error}
                </p>
              )}

              {!normalizedQuery ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-[#e3ebed] to-[#ece7f1] text-[#70899b]">
                    <BookHeart
                      size={29}
                      strokeWidth={1.5}
                    />
                  </div>

                  <h3 className="mt-5 font-display text-3xl text-[#263d50]">
                    Cada persona tiene una historia.
                  </h3>

                  <p className="mt-2 max-w-sm text-sm leading-7 text-[#8394a3]">
                    Escribí un nombre, una petición o una
                    palabra que quieras recordar.
                  </p>
                </div>
              ) : totalResults === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <SearchX
                    size={33}
                    strokeWidth={1.5}
                    className="text-[#a0adb6]"
                  />

                  <h3 className="mt-5 font-display text-3xl text-[#263d50]">
                    No encontramos coincidencias.
                  </h3>

                  <p className="mt-2 max-w-sm text-sm leading-7 text-[#8394a3]">
                    Probá con otro nombre o una palabra
                    diferente.
                  </p>
                </div>
              ) : (
                <div className="space-y-7">
                  {/* PERSONAS */}
                  {filteredPeople.length > 0 && (
                    <section>
                      <div className="mb-3 flex items-center gap-2 px-2">
                        <UsersRound
                          size={15}
                          className="text-[#8198a7]"
                        />

                        <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#8394a3]">
                          Personas
                        </h3>

                        <span className="text-[11px] text-[#b0bbc1]">
                          {filteredPeople.length}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {filteredPeople.map((person) => (
                          <Link
                            key={person.id}
                            to={`/personas/${person.id}`}
                            onClick={onClose}
                            className="group flex items-center gap-4 rounded-[18px] border border-transparent bg-white/75 px-4 py-3.5 transition hover:border-[#dce5e9] hover:bg-white hover:shadow-[0_7px_20px_rgba(38,61,80,0.05)]"
                          >
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#e1ecee] to-[#e8e5f0] font-display text-2xl text-[#526e82]">
                              {person.firstName
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-[#526e82]">
                                {getPersonName(person)}
                              </p>

                              <p className="mt-1 truncate text-xs text-[#9aa7af]">
                                {person.relationship ||
                                  'Persona especial'}
                              </p>
                            </div>

                            <ArrowUpRight
                              size={17}
                              className="text-[#a7b5bf] transition group-hover:text-[#526e82]"
                            />
                          </Link>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* PETICIONES */}
                  {filteredRequests.length > 0 && (
                    <section>
                      <div className="mb-3 flex items-center gap-2 px-2">
                        <Heart
                          size={15}
                          className="text-[#a18fa9]"
                        />

                        <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#8394a3]">
                          Peticiones
                        </h3>

                        <span className="text-[11px] text-[#b0bbc1]">
                          {filteredRequests.length}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {filteredRequests.map((request) => (
                          <Link
                            key={request.id}
                            to={`/personas/${request.personId}`}
                            onClick={onClose}
                            className="group flex items-start gap-4 rounded-[18px] border border-transparent bg-white/75 px-4 py-4 transition hover:border-[#dce5e9] hover:bg-white hover:shadow-[0_7px_20px_rgba(38,61,80,0.05)]"
                          >
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#edeaf2] text-[#9585a4]">
                              <BookHeart size={19} />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold leading-6 text-[#526e82]">
                                {request.title}
                              </p>

                              <p className="mt-1 text-xs text-[#97a4af]">
                                {peopleNames[
                                  request.personId
                                ] || 'Persona especial'}
                                {' · '}
                                {getRequestStatus(
                                  request.status,
                                )}
                              </p>

                              {request.description && (
                                <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#a0aab1]">
                                  {request.description}
                                </p>
                              )}
                            </div>

                            <ArrowUpRight
                              size={17}
                              className="mt-1 shrink-0 text-[#a7b5bf] transition group-hover:text-[#526e82]"
                            />
                          </Link>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* PIE */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#526e82]/10 bg-white/55 px-6 py-4 sm:px-8">
          <span className="text-[11px] text-[#97a4af]">
            PrayerCare · Surrender
          </span>

          {normalizedQuery && !loading && (
            <span className="text-[11px] font-medium text-[#8394a3]">
              {totalResults}{' '}
              {totalResults === 1
                ? 'resultado visible'
                : 'resultados visibles'}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
