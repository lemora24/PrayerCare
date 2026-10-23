
import { useEffect, useState, type FormEvent } from 'react'
import {
  ArrowLeft,
  BookHeart,
  CheckCircle2,
  Heart,
  LoaderCircle,
  LockKeyhole,
  Send,
  Sparkles,
} from 'lucide-react'
import axios from 'axios'
import { Link, useNavigate, useParams } from 'react-router-dom'

import {
  createCommunityPrayerRequest,
  getCommunity,
  type Community,
} from '../services/communities'

const MAX_TITLE = 200
const MAX_DESCRIPTION = 5000

export default function CommunityCreatePrayerPage() {
  const { communityId } = useParams<{ communityId: string }>()
  const navigate = useNavigate()

  const [community, setCommunity] = useState<Community | null>(null)
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadCommunity() {
      setLoading(true)
      setPageError(null)

      if (!communityId) {
        setPageError('No encontramos esta comunidad.')
        setLoading(false)
        return
      }

      try {
        const data = await getCommunity(communityId)

        if (!cancelled) {
          setCommunity(data)
        }
      } catch (error) {
        if (!cancelled) {
          if (
            axios.isAxiosError(error) &&
            [403, 404].includes(error.response?.status ?? 0)
          ) {
            setPageError(
              'Esta comunidad no existe o no tenés acceso a ella.',
            )
          } else {
            setPageError(
              'No pudimos cargar la comunidad. Intentá nuevamente.',
            )
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadCommunity()

    return () => {
      cancelled = true
    }
  }, [communityId])

  const trimmedTitle = title.trim()
  const trimmedDescription = description.trim()

  const isValid =
    trimmedTitle.length > 0 &&
    trimmedTitle.length <= MAX_TITLE &&
    trimmedDescription.length > 0 &&
    trimmedDescription.length <= MAX_DESCRIPTION

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!communityId || !isValid || submitting) return

    setSubmitting(true)
    setSubmitError(null)

    try {
      await createCommunityPrayerRequest(communityId, {
        title: trimmedTitle,
        description: trimmedDescription,
        category: 10,
      })

      navigate(`/comunidades/${communityId}/orar`, {
        replace: true,
      })
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          setSubmitError(
            'Revisá los datos de tu petición e intentá nuevamente.',
          )
        } else if (
          [403, 404].includes(error.response?.status ?? 0)
        ) {
          setSubmitError(
            'No tenés permiso para publicar en esta comunidad.',
          )
        } else if (error.response?.status === 401) {
          setSubmitError(
            'Tu sesión ha expirado. Iniciá sesión nuevamente.',
          )
        } else {
          setSubmitError(
            'No pudimos publicar tu petición. Intentá nuevamente.',
          )
        }
      } else {
        setSubmitError(
          'Ocurrió un problema inesperado. Intentá nuevamente.',
        )
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <LoaderCircle
          size={32}
          className="animate-spin text-[#b18c82]"
        />
        <p className="text-sm text-[#8394a3]">
          Preparando un espacio para tu petición...
        </p>
      </div>
    )
  }

  if (pageError || !community || !communityId) {
    return (
      <div className="mx-auto max-w-2xl rounded-[30px] border border-[#526e82]/10 bg-white/80 p-10 text-center">
        <BookHeart
          size={36}
          className="mx-auto text-[#b18c82]"
        />

        <h1 className="mt-5 font-serif text-3xl text-[#526e82]">
          No pudimos abrir este espacio
        </h1>

        <p className="mt-4 text-sm leading-7 text-[#8493a0]">
          {pageError ?? 'Esta comunidad no está disponible.'}
        </p>

        <Link
          to="/comunidades"
          className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#526e82] px-6 py-3 text-sm font-semibold text-white"
        >
          <ArrowLeft size={16} />
          Volver a mis comunidades
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* VOLVER */}
      <Link
        to={`/comunidades/${communityId}`}
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#8f939b] transition hover:text-[#526e82]"
      >
        <ArrowLeft size={16} />
        {community.name}
      </Link>

      {/* ENCABEZADO */}
      <section className="relative overflow-hidden rounded-[32px] border border-[#b99b8a]/15 bg-gradient-to-br from-[#fffaf5] via-[#f9f0e9] to-[#edf0f1] px-7 py-10 sm:px-11 sm:py-12">
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[#d9b6a5]/20 blur-3xl" />

        <div className="relative z-10">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/75 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#b18c82]">
            <Sparkles size={14} />
            No tenés que cargar con todo
          </div>

          <h1 className="font-serif text-4xl text-[#765e5b] sm:text-5xl">
            Necesito oración
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-8 text-[#97847f]">
            Hay momentos en los que necesitamos que alguien
            camine a nuestro lado. Compartí lo que llevás
            en el corazón y permití que tu comunidad te
            acompañe en oración.
          </p>
        </div>
      </section>

      {/* FORMULARIO */}
      <section className="rounded-[30px] border border-[#526e82]/10 bg-white/85 p-7 shadow-[0_16px_50px_rgba(47,67,84,0.04)] sm:p-10">
        <div className="mb-8 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f4eae6] text-[#b18c82]">
            <BookHeart size={23} />
          </div>

          <div>
            <h2 className="font-serif text-2xl text-[#526e82]">
              Compartí tu petición
            </h2>

            <p className="mt-2 text-sm leading-7 text-[#8997a1]">
              Tus palabras serán compartidas con los
              miembros autorizados de esta comunidad.
            </p>
          </div>
        </div>

        <form onSubmit={(event) => void handleSubmit(event)}>
          {/* TÍTULO */}
          <div>
            <label
              htmlFor="community-prayer-title"
              className="mb-3 block text-sm font-semibold text-[#526e82]"
            >
              ¿Por qué necesitás oración?
            </label>

            <input
              id="community-prayer-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={MAX_TITLE}
              required
              disabled={submitting}
              placeholder="Ej. Por la salud y bienestar de mi familia"
              className="w-full rounded-2xl border border-[#526e82]/15 bg-[#fbfaf8] px-5 py-4 text-sm text-[#435e71] outline-none transition placeholder:text-[#adb6bd] focus:border-[#a8a0a0] focus:ring-4 focus:ring-[#b18c82]/10 disabled:opacity-60"
            />

            <div className="mt-2 flex justify-end">
              <span className="text-xs text-[#a1aab1]">
                {title.length}/{MAX_TITLE}
              </span>
            </div>
          </div>

          {/* DESCRIPCIÓN */}
          <div className="mt-7">
            <label
              htmlFor="community-prayer-description"
              className="mb-3 block text-sm font-semibold text-[#526e82]"
            >
              Contanos un poco más
            </label>

            <textarea
              id="community-prayer-description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              maxLength={MAX_DESCRIPTION}
              required
              disabled={submitting}
              rows={8}
              placeholder="Escribí tu petición con libertad. No necesitás encontrar las palabras perfectas..."
              className="w-full resize-y rounded-2xl border border-[#526e82]/15 bg-[#fbfaf8] px-5 py-4 text-sm leading-7 text-[#435e71] outline-none transition placeholder:text-[#adb6bd] focus:border-[#a8a0a0] focus:ring-4 focus:ring-[#b18c82]/10 disabled:opacity-60"
            />

            <div className="mt-2 flex justify-end">
              <span className="text-xs text-[#a1aab1]">
                {description.length}/{MAX_DESCRIPTION}
              </span>
            </div>
          </div>

          {/* PRIVACIDAD */}
          <div className="mt-8 flex items-start gap-3 rounded-2xl border border-[#819e91]/15 bg-[#f0f5f1] p-5">
            <LockKeyhole
              size={19}
              className="mt-0.5 shrink-0 text-[#779184]"
            />

            <div>
              <p className="text-sm font-semibold text-[#648073]">
                Un espacio privado
              </p>

              <p className="mt-1 text-xs leading-6 text-[#82978c]">
                Tu petición será visible para los miembros
                activos de {community.name}. No se publicará
                automáticamente en otras comunidades ni
                en tu espacio personal.
              </p>
            </div>
          </div>

          {/* ERROR */}
          {submitError && (
            <div
              role="alert"
              className="mt-6 rounded-2xl border border-[#bd8585]/20 bg-[#fcf1f1] px-5 py-4 text-sm text-[#a46e70]"
            >
              {submitError}
            </div>
          )}

          {/* ACCIONES */}
          <div className="mt-9 flex flex-wrap items-center justify-between gap-4 border-t border-[#526e82]/10 pt-7">
            <Link
              to={`/comunidades/${communityId}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#8394a3] transition hover:text-[#526e82]"
            >
              <ArrowLeft size={16} />
              Cancelar
            </Link>

            <button
              type="submit"
              disabled={!isValid || submitting}
              className="inline-flex min-h-12 items-center justify-center gap-3 rounded-2xl bg-[#526e82] px-7 py-3 text-sm font-semibold text-white shadow-[0_8px_25px_rgba(82,110,130,0.18)] transition hover:bg-[#40596b] disabled:cursor-not-allowed disabled:opacity-45"
            >
              {submitting ? (
                <>
                  <LoaderCircle
                    size={18}
                    className="animate-spin"
                  />
                  Publicando petición...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Compartir mi petición
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* MENSAJE FINAL */}
      <div className="flex items-center justify-center gap-3 pb-6 text-center text-xs text-[#9c9da1]">
        <Heart size={15} className="text-[#b99ba4]" />
        Dios escucha incluso las oraciones que no sabemos expresar.
        <CheckCircle2 size={15} className="text-[#819c90]" />
      </div>
    </div>
  )
}
