
import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  BookHeart,
  BookOpen,
  Heart,
  Sparkles,
  Waves,
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { getPerson, type Person } from '../services/people'
import {
  deletePrayerRequest,
  getPrayerLogs,
  getPrayerRequestsByPerson,
  markPrayerRequestAnswered,
  prayForRequest,
  type PrayerLog,
  type PrayerRequest,
} from '../services/prayerRequests'

import PrayerJournal from '../Components/PrayerJournal'
import CreatePrayerRequestModal from '../Components/CreatePrayerRequestModal'
import EditPrayerRequestModal from '../Components/EditPrayerRequestModal'
import PrayerHistoryModal from '../Components/prayerHistoryModal'
import RecordPrayerModal from '../Components/RecordPrayerModal'

import {
  getRandomPrayerVerse,
  type PrayerVerse,
} from '../data/prayerVerses'

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

type SelectedRequest = {
  id: string
  title: string
}

function getFullName(person: Person) {
  return `${person.firstName} ${person.lastName ?? ''}`.trim()
}

function getInitials(person: Person) {
  const first = person.firstName.trim().charAt(0)
  const last = (person.lastName ?? '').trim().charAt(0)

  return `${first}${last}`.toUpperCase() || '?'
}

export default function PersonDetailPage() {
  const { personId } = useParams()

  const [person, setPerson] = useState<Person | null>(null)
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>([])
  const [logsByRequest, setLogsByRequest] =
    useState<Record<string, PrayerLog[]>>({})

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedEdit, setSelectedEdit] =
    useState<PrayerRequest | null>(null)
  const [selectedPrayer, setSelectedPrayer] =
    useState<SelectedRequest | null>(null)
  const [selectedHistory, setSelectedHistory] =
    useState<SelectedRequest | null>(null)
  const [selectedDelete, setSelectedDelete] =
    useState<SelectedRequest | null>(null)
  const [prayerVerse, setPrayerVerse] =
    useState<PrayerVerse | null>(null)

  const [processingId, setProcessingId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let active = true

    setLoading(true)
    setError('')
    setActionError('')
    setPerson(null)
    setPrayerRequests([])
    setLogsByRequest({})
    setShowCreateModal(false)
    setSelectedEdit(null)
    setSelectedPrayer(null)
    setSelectedHistory(null)
    setSelectedDelete(null)
    setPrayerVerse(null)

    async function loadPerson() {
      if (!personId) {
        if (active) {
          setError('No se encontró la persona.')
          setLoading(false)
        }
        return
      }

      try {
        const [personResult, requestsResult] = await Promise.all([
          getPerson(personId),
          getPrayerRequestsByPerson(personId),
        ])

        if (!active) return

        setPerson(personResult)
        setPrayerRequests(requestsResult)
        setLoading(false)

        // Cargar los historiales sin bloquear la apertura del perfil.
        const results = await Promise.allSettled(
          requestsResult.map((request) => getPrayerLogs(request.id)),
        )

        if (!active) return

        const loadedLogs: Record<string, PrayerLog[]> = {}

        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            loadedLogs[requestsResult[index].id] = result.value
          }
        })

        setLogsByRequest(loadedLogs)
      } catch {
        if (active) {
          setError('No se pudo cargar la información de esta persona.')
          setLoading(false)
        }
      }
    }

    void loadPerson()

    return () => {
      active = false
    }
  }, [personId])

  function replaceRequest(updatedRequest: PrayerRequest) {
    setPrayerRequests((current) =>
      current.map((request) =>
        request.id === updatedRequest.id ? updatedRequest : request,
      ),
    )
  }

  async function refreshPrayerLogs(requestId: string) {
    try {
      const logs = await getPrayerLogs(requestId)

      setLogsByRequest((current) => ({
        ...current,
        [requestId]: logs,
      }))
    } catch {
      // El historial sigue disponible desde el modal correspondiente.
    }
  }

  async function handlePray(
    requestId: string,
    note: string,
  ): Promise<void> {
    const updatedRequest = await prayForRequest(requestId, {
      note: note || undefined,
    })

    replaceRequest(updatedRequest)
    setSelectedPrayer(null)

    await refreshPrayerLogs(requestId)

    setPrayerVerse(getRandomPrayerVerse())
  }

  async function handleMarkAnswered(requestId: string) {
    if (processingId) return

    setProcessingId(requestId)
    setActionError('')

    try {
      const updatedRequest =
        await markPrayerRequestAnswered(requestId)

      replaceRequest(updatedRequest)
    } catch {
      setActionError(
        'No se pudo marcar la petición como respondida.',
      )
    } finally {
      setProcessingId(null)
    }
  }

  async function handleDelete() {
    if (!selectedDelete || deleting) return

    const requestId = selectedDelete.id

    setDeleting(true)
    setActionError('')

    try {
      await deletePrayerRequest(requestId)

      setPrayerRequests((current) =>
        current.filter((request) => request.id !== requestId),
      )

      setLogsByRequest((current) => {
        const updated = { ...current }
        delete updated[requestId]
        return updated
      })

      setSelectedDelete(null)
    } catch {
      setActionError(
        'No se pudo eliminar la petición. Verifica si tiene registros asociados.',
      )
      setSelectedDelete(null)
    } finally {
      setDeleting(false)
    }
  }

  const orderedRequests = useMemo(
    () =>
      [...prayerRequests].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() -
          new Date(b.createdAt).getTime(),
      ),
    [prayerRequests],
  )

  const activeCount = prayerRequests.filter(
    (request) => request.status === 1,
  ).length

  const answeredCount = prayerRequests.filter(
    (request) => request.status === 3,
  ).length

  if (loading) {
    return (
      <div
        role="status"
        className="flex min-h-[55vh] flex-col items-center justify-center gap-4"
      >
        <div className="pc-animate-breathe flex h-16 w-16 items-center justify-center rounded-full bg-[#dce9e9] text-[#526e82]">
          <Heart size={27} strokeWidth={1.5} />
        </div>

        <p className="font-display text-3xl text-[#526e82]">
          Preparando este diario...
        </p>
      </div>
    )
  }

  if (error || !person) {
    return (
      <div className="pc-card space-y-5 p-8">
        <p role="alert" className="text-sm text-rose-700">
          {error || 'No se encontró la persona.'}
        </p>

        <Link
          to="/personas"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#526e82]"
        >
          <ArrowLeft size={17} />
          Volver a personas
        </Link>
      </div>
    )
  }

  const fullName = getFullName(person)

  return (
    <div className="space-y-8 pb-8">
      {/* VOLVER */}
      <Link
        to="/personas"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#718394] transition hover:text-[#263d50]"
      >
        <ArrowLeft size={17} />
        Todas las personas
      </Link>

      {/* PRESENTACIÓN */}
      <section className="pc-animate-enter relative overflow-hidden rounded-[30px] border border-[#526e82]/10 bg-gradient-to-br from-[#e6edef] via-[#eeeaf0] to-[#f5e8dc] p-7 sm:p-10">
        <div className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full bg-white/35 blur-3xl" />

        <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[28px] border-4 border-white/75 bg-white/45 font-display text-4xl font-semibold text-[#526e82]">
            {getInitials(person)}
          </div>

          <div className="min-w-0 flex-1">
            <p className="pc-eyebrow">
              UNA PERSONA EN MI CORAZÓN
            </p>

            <h1 className="mt-3 break-words font-display text-[clamp(3rem,5vw,5rem)] font-medium leading-none text-[#263d50]">
              {fullName}
            </h1>

            <p className="mt-3 text-sm text-[#718394]">
              {person.relationship
                ? relationshipLabels[Number(person.relationship)] ?? 'Otro'
                : 'Sin relación especificada'}
            </p>
          </div>

          <Sparkles
            size={25}
            strokeWidth={1.3}
            className="hidden text-[#a88fba] lg:block"
          />
        </div>
      </section>

      {/* HISTORIA Y ESTADÍSTICAS */}
      <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
        <section className="pc-card p-6 sm:p-7">
          <div className="flex items-center gap-3">
            <BookOpen
              size={19}
              className="text-[#526e82]"
            />

            <h2 className="pc-heading text-3xl">
              Su historia
            </h2>
          </div>

          <p className="mt-5 whitespace-pre-wrap text-sm leading-8 text-[#718394]">
            {person.notes ||
              'Todavía no hay notas registradas sobre esta persona.'}
          </p>
        </section>

        <section className="pc-card p-6 sm:p-7">
          <p className="pc-eyebrow">EN ORACIÓN</p>

          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              {
                label: 'Peticiones',
                value: prayerRequests.length,
              },
              {
                label: 'Activas',
                value: activeCount,
              },
              {
                label: 'Respondidas',
                value: answeredCount,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl bg-[#f1f4f4] p-3 text-center"
              >
                <p className="font-display text-3xl font-semibold text-[#263d50]">
                  {item.value}
                </p>

                <p className="mt-1 text-[11px] text-[#718394]">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* DIARIO */}
      <section className="space-y-5">
        <div className="text-center">
          <p className="pc-eyebrow">
            CADA PETICIÓN, UNA PÁGINA
          </p>

          <h2 className="pc-heading mt-3 text-4xl text-[#263d50] sm:text-5xl">
            Su diario de oración
          </h2>

          <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-[#8394a3]">
            Un lugar para guardar cada petición y recordar
            cada momento que has dedicado a orar.
          </p>
        </div>

        {actionError && (
          <div
            role="alert"
            className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
          >
            {actionError}
          </div>
        )}

        <PrayerJournal
          personName={fullName}
          requests={orderedRequests}
          logsByRequest={logsByRequest}
          onCreate={() => setShowCreateModal(true)}
          onPray={(request) =>
            setSelectedPrayer({
              id: request.id,
              title: request.title,
            })
          }
          onHistory={(request) =>
            setSelectedHistory({
              id: request.id,
              title: request.title,
            })
          }
          onEdit={setSelectedEdit}
          onDelete={(request) =>
            setSelectedDelete({
              id: request.id,
              title: request.title,
            })
          }
          onAnswered={(request) =>
            void handleMarkAnswered(request.id)
          }
          processingId={processingId}
        />
      </section>

      {/* REFLEXIÓN */}
      <section className="rounded-[28px] border border-[#526e82]/10 bg-gradient-to-r from-[#e7eff0] via-[#eeeaf0] to-[#f4e7dc] p-7 sm:p-9">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div>
            <p className="pc-eyebrow">
              UNA VERDAD PARA RECORDAR
            </p>

            <p className="mt-3 font-display text-3xl font-medium text-[#263d50]">
              Él tiene cuidado de vosotros.
            </p>

            <p className="mt-2 text-xs text-[#718394]">
              1 Pedro 5:7 · RVR1960
            </p>
          </div>

          <Waves
            size={40}
            strokeWidth={1.2}
            className="text-[#8fa8ba]"
          />
        </div>
      </section>

      {/* CREAR */}
      {showCreateModal && (
        <CreatePrayerRequestModal
          personId={person.id}
          personName={fullName}
          onClose={() => setShowCreateModal(false)}
          onCreated={(request) => {
            setPrayerRequests((current) => [request, ...current])
          }}
        />
      )}

      {/* EDITAR */}
      {selectedEdit && (
        <EditPrayerRequestModal
          prayerRequest={selectedEdit}
          onClose={() => setSelectedEdit(null)}
          onUpdated={replaceRequest}
        />
      )}

      {/* REGISTRAR ORACIÓN */}
      {selectedPrayer && (
        <RecordPrayerModal
          prayerRequestTitle={selectedPrayer.title}
          onClose={() => setSelectedPrayer(null)}
          onConfirm={(note) =>
            handlePray(selectedPrayer.id, note)
          }
        />
      )}

      {/* HISTORIAL */}
      {selectedHistory && (
        <PrayerHistoryModal
          prayerRequestId={selectedHistory.id}
          prayerRequestTitle={selectedHistory.title}
          onClose={() => setSelectedHistory(null)}
        />
      )}

      {/* ELIMINAR */}
      {selectedDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#263d50]/55 p-4 backdrop-blur-sm">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-prayer-title"
            aria-describedby="delete-prayer-description"
            className="w-full max-w-md rounded-[28px] bg-[#f8f5f0] p-7 shadow-2xl"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <BookHeart size={25} />
            </div>

            <h3
              id="delete-prayer-title"
              className="pc-heading mt-5 text-4xl text-[#263d50]"
            >
              ¿Eliminar esta petición?
            </h3>

            <p
              id="delete-prayer-description"
              className="mt-4 text-sm leading-7 text-[#718394]"
            >
              Vas a eliminar la petición{' '}
              <strong>{selectedDelete.title}</strong>.
              Esta acción no se puede deshacer y podría
              eliminar también su historial de oraciones.
            </p>

            <div className="mt-7 flex gap-3">
              <button
                type="button"
                onClick={() => setSelectedDelete(null)}
                disabled={deleting}
                className="pc-button-secondary flex-1 disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={() => void handleDelete()}
                disabled={deleting}
                className="inline-flex flex-1 items-center justify-center rounded-full bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-50"
              >
                {deleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VERSÍCULO */}
      {prayerVerse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#263d50]/55 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="prayer-verse-title"
            className="w-full max-w-md rounded-[30px] bg-gradient-to-br from-[#e7eff0] via-[#f8f5f0] to-[#f2e6dd] p-8 text-center shadow-2xl"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/75 text-[#526e82]">
              <Heart size={24} strokeWidth={1.5} />
            </div>

            <p className="pc-eyebrow mt-6">
              ORACIÓN REGISTRADA
            </p>

            <h3
              id="prayer-verse-title"
              className="mt-5 font-display text-3xl font-medium leading-tight text-[#263d50]"
            >
              “{prayerVerse.text}”
            </h3>

            <p className="mt-4 text-sm font-semibold text-[#526e82]">
              {prayerVerse.reference}
            </p>

            <p className="mt-5 text-sm leading-7 text-[#718394]">
              Sigue perseverando en oración.
            </p>

            <button
              type="button"
              onClick={() => setPrayerVerse(null)}
              className="pc-button-primary mt-7 w-full"
            >
              Continuar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
