import { useEffect, useState } from 'react'
import { ArrowLeft, Plus, UserRound } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { getPerson, type Person } from '../services/people'
import {
  getPrayerRequestsByPerson,
  type PrayerRequest,
} from '../services/prayerRequests'
import CreatePrayerRequestModal from '../Components/CreatePrayerRequestModal'


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

export default function PersonDetailPage() {
  const { id } = useParams()

  const [person, setPerson] = useState<Person | null>(null)
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    let active = true

    async function loadPerson() {
      if (!id) {
        setError('No se encontró la persona.')
        setLoading(false)
        return
      }

      try {
        const [personResult, prayerRequestsResult] = await Promise.all([
          getPerson(id),
          getPrayerRequestsByPerson(id),
        ])

        if (active) {
          setPerson(personResult)
          setPrayerRequests(prayerRequestsResult)
        }
      } catch {
        if (active) {
          setError('No se pudo cargar la persona.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadPerson()

    return () => {
      active = false
    }
  }, [id])

  if (loading) {
    return (
      <p className="text-slate-500">
        Cargando persona...
      </p>
    )
  }

  if (error || !person) {
    return (
      <div className="space-y-4">
        <p className="text-red-600">
          {error || 'No se encontró la persona.'}
        </p>

        <Link
          to="/personas"
          className="font-semibold text-emerald-700"
        >
          ← Volver a personas
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* VOLVER */}
      <Link
        to="/personas"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-emerald-700"
      >
        <ArrowLeft size={18} />
        Volver a personas
      </Link>

      {/* INFORMACIÓN DE LA PERSONA */}
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-700">
            <UserRound size={36} />
          </div>

          <div>
            <p className="text-sm font-semibold text-emerald-700">
              {person.relationship
                ? relationshipLabels[Number(person.relationship)] ?? 'Otro'
                : 'Sin relación especificada'}
            </p>

            <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              {person.firstName} {person.lastName ?? ''}
            </h2>

            <p className="mt-3 max-w-2xl leading-7 text-slate-600">
              {person.notes || 'No hay notas registradas para esta persona.'}
            </p>
          </div>
          {showCreateModal && (
            <CreatePrayerRequestModal
                personId={person.id}
                personName={`${person.firstName} ${person.lastName ?? ''}`.trim()}
                onClose={() => setShowCreateModal(false)}
                onCreated={(request) => {
                setPrayerRequests((currentRequests) => [
                    request,
                    ...currentRequests,
                ])
                }}
            />
            )}
        </div>
      </section>

      {/* PETICIONES DE ORACIÓN */}
      <section className="space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-emerald-700">
              ORACIONES
            </p>

            <h3 className="mt-1 text-2xl font-bold text-slate-900">
              Peticiones de oración
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {prayerRequests.length === 1
                ? '1 petición registrada'
                : `${prayerRequests.length} peticiones registradas`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
            <Plus size={18} />
            Nueva petición
            </button>
        </div>

        {/* SIN PETICIONES */}
        {prayerRequests.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="font-semibold text-slate-900">
              No hay peticiones todavía
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Las peticiones de esta persona aparecerán aquí.
            </p>
          </div>
        ) : (
          /* LISTA DE PETICIONES */
          <div className="grid gap-4">
            {prayerRequests.map((request) => (
              <article
                key={request.id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">
                      {request.title}
                    </h4>

                    {request.description && (
                      <p className="mt-2 leading-6 text-slate-600">
                        {request.description}
                      </p>
                    )}
                  </div>

                  <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {priorityLabels[request.priority] ?? 'Sin prioridad'}
                  </span>
                </div>

                <div className="mt-5 flex flex-wrap gap-4 border-t border-slate-100 pt-4 text-sm text-slate-500">
                  <span>
                    Estado: {statusLabels[request.status] ?? 'Desconocido'}
                  </span>

                  <span>
                    Categoría: {categoryLabels[request.category] ?? 'Otro'}
                  </span>

                  {request.lastPrayedAt && (
                    <span>
                      Última oración:{' '}
                      {new Date(request.lastPrayedAt).toLocaleDateString(
                        'es-CR',
                      )}
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}