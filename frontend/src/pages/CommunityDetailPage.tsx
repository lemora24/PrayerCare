
import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BookHeart,
  Heart,
  HeartHandshake,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'

import {
  getCommunity,
  type Community,
} from '../services/communities'



export default function CommunityDetailPage() {
  const { communityId } = useParams<{ communityId: string }>()
  const navigate = useNavigate()

  const [community, setCommunity] = useState<Community | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadCommunity() {
      setLoading(true)
      setError(null)
      setCommunity(null)

      if (!communityId) {
        setError('No se encontró el identificador de la comunidad.')
        setLoading(false)
        return
      }

      try {
        const data = await getCommunity(communityId)

        if (!cancelled) {
          setCommunity(data)
        }
      } catch (err) {
        if (!cancelled) {
          if (
            axios.isAxiosError(err) &&
            (err.response?.status === 403 ||
              err.response?.status === 404)
          ) {
            setError(
              'No encontramos esta comunidad o no tenés acceso a ella.',
            )
          } else if (
            axios.isAxiosError(err) &&
            err.response?.status === 401
          ) {
            setError('Tu sesión ha expirado. Iniciá sesión nuevamente.')
          } else {
            setError('No pudimos cargar la comunidad. Intentá nuevamente.')
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

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <LoaderCircle
          size={32}
          className="animate-spin text-[#7893a7]"
        />
        <p className="text-sm text-[#8394a3]">
          Preparando tu espacio de comunidad...
        </p>
      </div>
    )
  }

  if (error || !community) {
    return (
      <div className="mx-auto max-w-2xl rounded-[30px] border border-[#526e82]/10 bg-white/80 p-10 text-center">
        <HeartHandshake
          size={38}
          className="mx-auto text-[#8da4b5]"
        />

        <h1 className="mt-5 font-serif text-3xl text-[#435d70]">
          No pudimos abrir este espacio
        </h1>

        <p className="mt-4 text-sm leading-7 text-[#81919f]">
          {error ?? 'Esta comunidad no está disponible.'}
        </p>

        <Link
          to="/comunidades"
          className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#526e82] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#40596b]"
        >
          <ArrowLeft size={16} />
          Volver a mis comunidades
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-9">
      {/* VOLVER */}
      <Link
        to="/comunidades"
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#7c91a2] transition hover:text-[#435d70]"
      >
        <ArrowLeft size={16} />
        Mis comunidades
      </Link>

      {/* PRESENTACIÓN */}
      <section className="relative overflow-hidden rounded-[34px] border border-[#526e82]/10 bg-gradient-to-br from-[#fffdf9] via-[#f8f3ec] to-[#e8edf1] px-7 py-12 shadow-[0_18px_55px_rgba(47,67,84,0.05)] sm:px-12 sm:py-14">
        <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-[#d8bca3]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 right-20 h-72 w-72 rounded-full bg-[#91aebd]/20 blur-3xl" />

        <div className="relative z-10 max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#c5a486]/20 bg-white/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#ad8d70]">
            <Sparkles size={14} />
            Un lugar para caminar juntos
          </div>

          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-[22px] bg-white/70 text-[#69869a] shadow-sm">
            <Users size={29} strokeWidth={1.6} />
          </div>

          <h1 className="font-serif text-4xl leading-tight tracking-tight text-[#3f5a6d] sm:text-5xl">
            {community.name}
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-8 text-[#788b9a] sm:text-base">
            {community.description ||
              'Un espacio donde podemos compartir nuestras cargas, acompañarnos en oración y crecer juntos en la fe.'}
          </p>

          <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#e8eee9]/80 px-4 py-2 text-xs font-semibold text-[#738e80]">
            <ShieldCheck size={15} />
            Comunidad privada
          </div>
        </div>
      </section>

      {/* DECISIÓN PRINCIPAL */}
      <section>
        <div className="mb-7 text-center">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#b19073]">
            Este momento es tuyo
          </p>

          <h2 className="font-serif text-3xl text-[#435e71] sm:text-4xl">
            ¿Qué hay en tu corazón hoy?
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#8595a1]">
            A veces necesitamos que alguien ore por nosotros.
            Otras veces, podemos ser quienes acompañen.
            Ambas formas de amar tienen un lugar aquí.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* QUIERO ORAR */}
          <button
            type="button"
            onClick={() =>
              navigate(`/comunidades/${communityId}/orar`)
            }
            className="group relative flex min-h-[340px] flex-col overflow-hidden rounded-[32px] border border-[#526e82]/10 bg-gradient-to-br from-[#edf2f4] via-[#f5f7f7] to-[#fffdf9] p-8 text-left shadow-[0_15px_45px_rgba(47,67,84,0.04)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_25px_55px_rgba(47,67,84,0.10)] sm:p-10"
          >
            <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-[#a8c3cf]/20 blur-3xl" />

            <div className="relative z-10 mb-8 flex h-16 w-16 items-center justify-center rounded-[22px] bg-white/85 text-[#6b91a5] shadow-sm">
              <HeartHandshake size={30} strokeWidth={1.6} />
            </div>

            <div className="relative z-10 flex-1">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#809eae]">
                Acompañar a otros
              </span>

              <h3 className="mt-3 font-serif text-3xl text-[#405e72]">
                Quiero orar
              </h3>

              <p className="mt-4 max-w-sm text-sm leading-7 text-[#7b91a0]">
                Descubrí las peticiones de tu comunidad.
                Dedicá un momento a orar por alguien y hacéle
                saber que no está solo.
              </p>
            </div>

            <div className="relative z-10 mt-8 flex items-center justify-between border-t border-[#526e82]/10 pt-6">
              <span className="text-sm font-semibold text-[#557b91]">
                Ver peticiones
              </span>

              <ArrowRight
                size={21}
                className="text-[#557b91] transition-transform group-hover:translate-x-1"
              />
            </div>
          </button>

          {/* NECESITO ORACIÓN */}
          <button
            type="button"
            onClick={() =>
              navigate(`/comunidades/${communityId}/pedir-oracion`)
            }
            className="group relative flex min-h-[340px] flex-col overflow-hidden rounded-[32px] border border-[#c4a38f]/15 bg-gradient-to-br from-[#f8eee8] via-[#fcf6f1] to-[#fffdf9] p-8 text-left shadow-[0_15px_45px_rgba(90,65,53,0.04)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_25px_55px_rgba(90,65,53,0.10)] sm:p-10"
          >
            <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-[#d9b9a6]/20 blur-3xl" />

            <div className="relative z-10 mb-8 flex h-16 w-16 items-center justify-center rounded-[22px] bg-white/85 text-[#b18c82] shadow-sm">
              <BookHeart size={30} strokeWidth={1.6} />
            </div>

            <div className="relative z-10 flex-1">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#b19488]">
                Compartir mi corazón
              </span>

              <h3 className="mt-3 font-serif text-3xl text-[#7b5f5b]">
                Necesito oración
              </h3>

              <p className="mt-4 max-w-sm text-sm leading-7 text-[#9c837e]">
                No tenés que cargar con todo en silencio.
                Compartí tu petición con tu comunidad
                y permití que otros oren por vos.
              </p>
            </div>

            <div className="relative z-10 mt-8 flex items-center justify-between border-t border-[#a98c81]/15 pt-6">
              <span className="text-sm font-semibold text-[#a17c73]">
                Compartir petición
              </span>

              <ArrowRight
                size={21}
                className="text-[#a17c73] transition-transform group-hover:translate-x-1"
              />
            </div>
          </button>
        </div>
      </section>

      {/* MENSAJE FINAL */}
      <section className="rounded-[28px] border border-[#526e82]/10 bg-white/65 px-7 py-8 text-center sm:px-12">
        <Heart
          size={22}
          className="mx-auto mb-4 text-[#b59ca7]"
        />

        <p className="font-serif text-xl italic leading-8 text-[#647d8e] sm:text-2xl">
          “Sobrellevad los unos las cargas de los otros.”
        </p>

        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#a1aeb6]">
          Gálatas 6:2
        </p>
      </section>
    </div>
  )
}
