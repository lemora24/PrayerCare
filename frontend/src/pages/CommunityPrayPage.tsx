
import { useCallback, useEffect, useState } from 'react'
import {
  ArrowLeft,
  BookHeart,
  Heart,
  HeartHandshake,
  LoaderCircle,
  RefreshCw,
  Sparkles,
  Users,
} from 'lucide-react'
import axios from 'axios'
import { Link, useParams } from 'react-router-dom'

import CommunityPrayerMoment from '../Components/CommunityPrayerMoment'

import {
  getCommunity,
  getCommunityPrayerRequests,
  getCommunityPrayerStats,
  type Community,
  type CommunityPrayerRequest,
  type PrayerStats,
  type RecordCommunityPrayerResponse,
} from '../services/communities'

type PrayerCardProps = {
  communityId: string
  request: CommunityPrayerRequest
}

function PrayerCard({ communityId, request }: PrayerCardProps) {
  const [stats, setStats] = useState<PrayerStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [statsError, setStatsError] = useState<string | null>(null)
  const [momentOpen, setMomentOpen] = useState(false)

  const loadStats = useCallback(async () => {
    setStatsLoading(true)
    setStatsError(null)

    try {
      const data = await getCommunityPrayerStats(
        communityId,
        request.id,
      )

      setStats(data)
    } catch {
      setStatsError('No pudimos actualizar las estadísticas.')
    } finally {
      setStatsLoading(false)
    }
  }, [communityId, request.id])

  useEffect(() => {
    void loadStats()
  }, [loadStats])

  async function handlePrayerRecorded(
    result: RecordCommunityPrayerResponse,
  ) {
    // Actualización inmediata con los valores devueltos
    // por el backend tras guardar la oración.
    setStats((previous) => ({
      communityId,
      requestId: request.id,
      totalPrayers: result.totalPrayers,
      myPrayers: result.myPrayers,
      peopleWhoPrayed: previous?.peopleWhoPrayed ?? 0,
      lastPrayedAt: result.prayedAt,
    }))

    // Volvemos a consultar la API para obtener también
    // el número exacto de personas distintas que oraron.
    await loadStats()
  }

  return (
    <>
      <article className="flex flex-col rounded-[28px] border border-[#526e82]/10 bg-white/80 p-6 shadow-[0_12px_40px_rgba(47,67,84,0.04)] sm:p-8">
        <div className="mb-5 flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#edf2f0] px-3 py-1.5 text-[11px] font-semibold text-[#789386]">
            <Heart size={13} />
            Petición de oración
          </span>

          <span className="text-xs text-[#9ba8b2]">
            {new Date(request.createdAt).toLocaleDateString(
              'es-CR',
              {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              },
            )}
          </span>
        </div>

        <h3 className="font-serif text-2xl leading-snug text-[#425e72]">
          {request.title}
        </h3>

        <p className="mt-4 line-clamp-5 flex-1 whitespace-pre-wrap break-words text-sm leading-8 text-[#7c8d9b]">
          {request.description}
        </p>

        <div className="mt-7 flex flex-wrap items-center gap-4 border-t border-[#526e82]/10 pt-5 text-xs text-[#8798a5]">
          <span className="flex items-center gap-2">
            <HeartHandshake size={15} />
            {stats?.totalPrayers ?? '—'} oraciones
          </span>

          <span className="flex items-center gap-2">
            <Users size={15} />
            {stats?.peopleWhoPrayed ?? '—'} personas
          </span>

          <span className="flex items-center gap-2">
            <BookHeart size={15} />
            {stats?.myPrayers ?? '—'} mías
          </span>
        </div>

        {statsLoading && (
          <p className="mt-3 flex items-center gap-2 text-xs text-[#9aa8b2]">
            <LoaderCircle size={13} className="animate-spin" />
            Actualizando estadísticas...
          </p>
        )}

        {statsError && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <p role="alert" className="text-xs text-[#aa7777]">
              {statsError}
            </p>

            <button
              type="button"
              onClick={() => void loadStats()}
              className="text-xs font-semibold text-[#526e82] underline underline-offset-2"
            >
              Reintentar
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => setMomentOpen(true)}
          className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#526e82] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#405c70]"
        >
          <Heart size={18} />
          Dedicar un momento de oración
        </button>
      </article>

      <CommunityPrayerMoment
        open={momentOpen}
        communityId={communityId}
        request={request}
        onClose={() => setMomentOpen(false)}
        onPrayerRecorded={(result) => {
          void handlePrayerRecorded(result)
        }}
      />
    </>
  )
}

export default function CommunityPrayPage() {
  const { communityId } = useParams<{ communityId: string }>()

  const [community, setCommunity] = useState<Community | null>(null)
  const [requests, setRequests] = useState<CommunityPrayerRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const loadPage = useCallback(
    async (initialLoad: boolean) => {
      if (!communityId) {
        setError('No encontramos esta comunidad.')
        setLoading(false)
        return
      }

      if (initialLoad) {
        setLoading(true)
      } else {
        setRefreshing(true)
      }

      setError(null)

      try {
        const [communityData, requestData] = await Promise.all([
          getCommunity(communityId),
          getCommunityPrayerRequests(communityId),
        ])

        setCommunity(communityData)
        setRequests(requestData.filter((request) => !request.isHidden))
      } catch (err) {
        if (
          axios.isAxiosError(err) &&
          [403, 404].includes(err.response?.status ?? 0)
        ) {
          setError(
            'Esta comunidad no está disponible o no tenés acceso.',
          )
        } else {
          setError(
            'No pudimos cargar las peticiones. Intentá nuevamente.',
          )
        }
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [communityId],
  )

  useEffect(() => {
    void loadPage(true)
  }, [loadPage])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <LoaderCircle
          size={32}
          className="animate-spin text-[#7893a7]"
        />
        <p className="text-sm text-[#8394a3]">
          Preparando las peticiones de oración...
        </p>
      </div>
    )
  }

  if (error || !community || !communityId) {
    return (
      <div className="mx-auto max-w-2xl rounded-[28px] border border-[#526e82]/10 bg-white/80 p-10 text-center">
        <h1 className="font-serif text-3xl text-[#435d70]">
          No pudimos abrir las peticiones
        </h1>

        <p className="mt-4 text-sm text-[#81919f]">
          {error ?? 'La comunidad no está disponible.'}
        </p>

        <button
          type="button"
          onClick={() => void loadPage(true)}
          className="mt-6 rounded-full bg-[#526e82] px-6 py-3 text-sm font-semibold text-white"
        >
          Reintentar
        </button>

        <div className="mt-5">
          <Link
            to="/comunidades"
            className="inline-flex items-center gap-2 text-sm text-[#81919f]"
          >
            <ArrowLeft size={16} />
            Volver a mis comunidades
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <Link
        to={`/comunidades/${communityId}`}
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#7c91a2] transition hover:text-[#435d70]"
      >
        <ArrowLeft size={16} />
        {community.name}
      </Link>

      {/* PRESENTACIÓN */}
      <section className="rounded-[32px] border border-[#526e82]/10 bg-gradient-to-br from-[#f0f4f5] via-[#f8f8f6] to-[#fffdf9] px-7 py-10 sm:px-11">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/75 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#819baa]">
          <Sparkles size={14} />
          Un momento para acompañar
        </div>

        <h1 className="font-serif text-4xl text-[#405e72] sm:text-5xl">
          Quiero orar
        </h1>

        <p className="mt-5 max-w-2xl text-sm leading-8 text-[#7d91a0]">
          Cada petición representa una historia, una esperanza
          y una persona que necesita compañía. Tomate un
          momento para leer, orar y recordar que nadie
          camina solo.
        </p>
      </section>

      {/* PETICIONES */}
      <section>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.17em] text-[#b19073]">
              Peticiones compartidas
            </p>

            <h2 className="font-serif text-3xl text-[#435e71]">
              Nuestra comunidad
            </h2>
          </div>

          <button
            type="button"
            onClick={() => void loadPage(false)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-full border border-[#526e82]/15 bg-white/75 px-4 py-2.5 text-xs font-semibold text-[#526e82] transition hover:bg-white disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={refreshing ? 'animate-spin' : ''}
            />
            Actualizar
          </button>
        </div>

        {requests.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-[#526e82]/20 bg-white/60 px-8 py-16 text-center">
            <BookHeart
              size={32}
              className="mx-auto text-[#8ca3b3]"
            />

            <h3 className="mt-5 font-serif text-2xl text-[#526e82]">
              Un espacio lleno de posibilidades
            </h3>

            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#8595a1]">
              Todavía no hay peticiones compartidas en esta
              comunidad. Cuando alguien comparta una,
              aparecerá aquí.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {requests.map((request) => (
              <PrayerCard
                key={request.id}
                communityId={communityId}
                request={request}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
