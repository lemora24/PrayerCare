
import { useEffect, useState } from 'react'
import {
  ArrowRight,
  BookHeart,
  Church,
  Heart,
  LoaderCircle,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

import {
  getMyCommunities,
  type Community,
} from '../services/communities'

export default function CommunitiesPage() {
  const navigate = useNavigate()

  const [communities, setCommunities] = useState<Community[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function loadCommunities() {
    setLoading(true)
    setError(null)

    try {
      const data = await getMyCommunities()
      setCommunities(data)
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setError('Tu sesión ha expirado. Iniciá sesión nuevamente.')
      } else {
        setError(
          'No pudimos cargar tus comunidades. Intentá nuevamente.',
        )
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadCommunities()
  }, [])

  function getRoleLabel(role?: number) {
    switch (role) {
      case 2:
        return 'Administrador'
      case 1:
        return 'Moderador'
      default:
        return 'Miembro'
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-9">
      {/* INTRODUCCIÓN */}
      <section className="relative overflow-hidden rounded-[32px] border border-[#526e82]/10 bg-gradient-to-br from-[#fffdf9] via-[#f8f4ed] to-[#e9edf1] px-7 py-10 shadow-[0_16px_55px_rgba(50,67,82,0.05)] sm:px-11 sm:py-12">
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#d6c2ab]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-32 h-60 w-60 rounded-full bg-[#9eb5c7]/20 blur-3xl" />

        <div className="relative z-10 max-w-2xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#c9a889]/20 bg-white/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#a7876a]">
            <Sparkles size={14} />
            La fe también se comparte
          </div>

          <h1 className="font-serif text-4xl leading-tight tracking-tight text-[#3e586b] sm:text-5xl">
            No caminamos solos.
          </h1>

          <p className="mt-5 max-w-xl text-sm leading-8 text-[#718394] sm:text-base">
            Hay personas con quienes compartir nuestras cargas,
            celebrar respuestas y recordar que Dios sigue obrando.
            Encontrá aquí tus espacios de oración y comunidad.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3 text-xs font-medium text-[#7d8d9b]">
            <span className="flex items-center gap-2">
              <Heart size={15} className="text-[#b78d9c]" />
              Orar juntos
            </span>
            <span className="h-1 w-1 rounded-full bg-[#b9c1c8]" />
            <span className="flex items-center gap-2">
              <ShieldCheck size={15} className="text-[#839c91]" />
              Comunidades privadas
            </span>
          </div>
        </div>
      </section>

      {/* LISTADO */}
      <section>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#b29175]">
              Tus espacios
            </p>

            <h2 className="font-serif text-3xl text-[#455f72]">
              Mis comunidades
            </h2>

            <p className="mt-2 text-sm text-[#8493a0]">
              Elegí el lugar donde querés compartir este momento.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadCommunities()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full border border-[#526e82]/15 bg-white/70 px-4 py-2.5 text-xs font-semibold text-[#526e82] transition hover:bg-white disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={loading ? 'animate-spin' : ''}
            />
            Actualizar
          </button>
        </div>

        {loading ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-4 rounded-[28px] border border-[#526e82]/10 bg-white/65">
            <LoaderCircle
              size={30}
              className="animate-spin text-[#8ba2b5]"
            />
            <p className="text-sm text-[#8193a1]">
              Preparando tus comunidades...
            </p>
          </div>
        ) : error ? (
          <div className="rounded-[28px] border border-[#bd8f8f]/20 bg-white/80 p-8 text-center">
            <p className="text-sm text-[#a16f72]">{error}</p>

            <button
              type="button"
              onClick={() => void loadCommunities()}
              className="mt-5 rounded-full bg-[#526e82] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#415b6e]"
            >
              Volver a intentar
            </button>
          </div>
        ) : communities.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center rounded-[28px] border border-dashed border-[#526e82]/20 bg-white/55 px-6 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#edf0ee] text-[#809c91]">
              <Church size={28} />
            </div>

            <h3 className="font-serif text-2xl text-[#526e82]">
              Tu comunidad te espera
            </h3>

            <p className="mt-3 max-w-sm text-sm leading-7 text-[#8493a0]">
              Todavía no pertenecés a ninguna comunidad.
              Pronto podrás crear una o unirte mediante una invitación.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {communities.map((community) => (
              <button
                key={community.id}
                type="button"
                onClick={() =>
                  navigate(`/comunidades/${community.id}`)
                }
                className="group flex min-h-72 flex-col rounded-[28px] border border-[#526e82]/10 bg-white/75 p-6 text-left shadow-[0_12px_38px_rgba(47,67,84,0.035)] transition duration-300 hover:-translate-y-1 hover:border-[#8ca4b6]/35 hover:bg-white hover:shadow-[0_22px_50px_rgba(47,67,84,0.09)]"
              >
                <div className="mb-6 flex items-start justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#e4eaf0] to-[#f3e8de] text-[#668198]">
                    <Users size={25} />
                  </div>

                  <span className="rounded-full bg-[#eef2ef] px-3 py-1.5 text-[10px] font-semibold text-[#789286]">
                    {getRoleLabel(community.role)}
                  </span>
                </div>

                <h3 className="font-serif text-2xl leading-snug text-[#435e71]">
                  {community.name}
                </h3>

                <p className="mt-3 line-clamp-3 flex-1 text-sm leading-7 text-[#8795a0]">
                  {community.description ||
                    'Un espacio para crecer en la fe, acompañarnos y orar unos por otros.'}
                </p>

                <div className="mt-7 flex items-center justify-between border-t border-[#526e82]/10 pt-5">
                  <span className="text-xs font-semibold text-[#71899c]">
                    Entrar a la comunidad
                  </span>

                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#edf1f4] text-[#526e82] transition group-hover:translate-x-1 group-hover:bg-[#526e82] group-hover:text-white">
                    <ArrowRight size={17} />
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* FUTURAS FUNCIONES */}
      <section className="grid gap-4 md:grid-cols-2">
        <div className="flex items-start gap-4 rounded-[26px] border border-[#526e82]/10 bg-[#f7f4ee]/80 p-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[#b39075]">
            <Plus size={22} />
          </div>

          <div>
            <h3 className="font-serif text-xl text-[#526e82]">
              Crear una comunidad
            </h3>

            <p className="mt-2 text-sm leading-7 text-[#8995a0]">
              Pronto podrás abrir un espacio para tu iglesia,
              grupo de jóvenes o círculo de oración.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4 rounded-[26px] border border-[#526e82]/10 bg-[#f0f3f4]/80 p-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[#7897a7]">
            <BookHeart size={22} />
          </div>

          <div>
            <h3 className="font-serif text-xl text-[#526e82]">
              Unirme con invitación
            </h3>

            <p className="mt-2 text-sm leading-7 text-[#8995a0]">
              Próximamente podrás ingresar a una comunidad
              privada mediante un código seguro.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
