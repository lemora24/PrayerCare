import { useEffect, useState } from 'react'
import { Plus, Search, UserRound } from 'lucide-react'
import { getPeople, type Person } from '../services/people'
import CreatePersonModal from '../Components/CreatePersonModal'
import { Link } from 'react-router-dom'

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

export default function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
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

  const filteredPeople = people.filter((person) => {
    const fullName =
      `${person.firstName} ${person.lastName ?? ''}`.toLowerCase()

    const search = searchTerm.trim().toLowerCase()

    return fullName.includes(search)
  })

  return (
    <div className="space-y-8">
      {/* ENCABEZADO */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-emerald-700">
            MI COMUNIDAD
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Personas
          </h2>

          <p className="mt-2 text-slate-600">
            Mantén cerca a las personas que forman parte de tus oraciones.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700"
        >
          <Plus size={19} />
          Nueva persona
        </button>
      </div>

      {/* BUSCADOR */}
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm">
        <Search size={19} className="text-slate-400" />

        <input
          type="search"
          placeholder="Buscar una persona..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="w-full py-4 outline-none"
        />
      </div>

      {/* CARGANDO */}
      {loading && (
        <p className="text-slate-500">
          Cargando personas...
        </p>
      )}

      {/* ERROR */}
      {error && (
        <p role="alert" className="text-red-600">
          {error}
        </p>
      )}

      {/* SIN PERSONAS REGISTRADAS */}
      {!loading && !error && people.length === 0 && (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <UserRound
            size={36}
            className="mx-auto mb-4 text-slate-400"
          />

          <h3 className="font-semibold text-slate-900">
            Aún no tienes personas registradas
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Agrega a alguien para comenzar a organizar tus oraciones.
          </p>
        </div>
      )}

      {/* BÚSQUEDA SIN RESULTADOS */}
      {!loading &&
        !error &&
        people.length > 0 &&
        filteredPeople.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <Search
              size={36}
              className="mx-auto mb-4 text-slate-400"
            />

            <h3 className="font-semibold text-slate-900">
              No encontramos a esa persona
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Intenta buscar utilizando otro nombre.
            </p>
          </div>
        )}

      {/* PERSONAS */}
      {!loading && !error && filteredPeople.length > 0 && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredPeople.map((person) => (
            <article
              key={person.id}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <UserRound size={23} />
              </div>

              <h3 className="text-lg font-bold text-slate-900">
                {person.firstName} {person.lastName ?? ''}
              </h3>

              <p className="mt-1 text-sm text-emerald-700">
                {person.relationship
                ? relationshipLabels[Number(person.relationship)] ?? 'Otro'
                : 'Sin relación especificada'}
              </p>

              {person.notes && (
                <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-500">
                  {person.notes}
                </p>
              )}

              <Link
                to={`/personas/${person.id}`}
                className="mt-6 inline-block text-sm font-semibold text-emerald-700 transition hover:text-emerald-800"
                >
                Ver perfil →
                </Link>
            </article>
          ))}
        </div>
      )}
      {showCreateModal && (
        <CreatePersonModal
            onClose={() => setShowCreateModal(false)}
            onCreated={(person) => {
            setPeople((currentPeople) => [...currentPeople, person])
            }}
        />
        )}
    </div>
  )
}