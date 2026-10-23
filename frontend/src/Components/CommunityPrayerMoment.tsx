
import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BookHeart,
  Check,
  Heart,
  HeartHandshake,
  LoaderCircle,
  Sparkles,
  X,
} from 'lucide-react'
import axios from 'axios'

import {
  recordCommunityPrayer,
  type CommunityPrayerRequest,
  type RecordCommunityPrayerResponse,
} from '../services/communities'

type CommunityPrayerMomentProps = {
  open: boolean
  communityId: string
  request: CommunityPrayerRequest
  onClose: () => void
  onPrayerRecorded: (
    result: RecordCommunityPrayerResponse,
  ) => void
}

type PrayerStep = 'read' | 'pray' | 'completed'

export default function CommunityPrayerMoment({
  open,
  communityId,
  request,
  onClose,
  onPrayerRecorded,
}: CommunityPrayerMomentProps) {
  const [step, setStep] = useState<PrayerStep>('read')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return

    setStep('read')
    setError(null)
    setSubmitting(false)
  }, [open, request.id])

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  useEffect(() => {
    if (!open || submitting) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, submitting, onClose])

  async function handleConfirmPrayer() {
    if (submitting || step !== 'pray') return

    setSubmitting(true)
    setError(null)

    try {
      const result = await recordCommunityPrayer(
        communityId,
        request.id,
      )

      onPrayerRecorded(result)
      setStep('completed')
    } catch (err) {
      if (
        axios.isAxiosError(err) &&
        err.response?.status === 404
      ) {
        setError(
          'Esta petición ya no está disponible para recibir oraciones.',
        )
      } else if (
        axios.isAxiosError(err) &&
        err.response?.status === 401
      ) {
        setError(
          'Tu sesión ha expirado. Iniciá sesión nuevamente.',
        )
      } else {
        setError(
          'No pudimos registrar tu oración. Intentá nuevamente.',
        )
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#263d50]/60 p-4 backdrop-blur-md sm:p-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) {
          onClose()
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="prayer-moment-title"
        className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[32px] border border-white/70 bg-[#fcfaf6] shadow-[0_30px_100px_rgba(20,37,50,0.25)]"
      >
        {/* DECORACIÓN */}
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#d8c5b1]/20 blur-3xl" />

        {/* ENCABEZADO */}
        <div className="relative z-10 flex items-center justify-between border-b border-[#526e82]/10 px-6 py-5 sm:px-9">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9a8a7d]">
            <Sparkles size={15} />
            Un momento con Dios
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Cerrar momento de oración"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-[#708597] transition hover:bg-[#edf1f3] disabled:opacity-40"
          >
            <X size={19} />
          </button>
        </div>

        {/* CONTENIDO */}
        <div className="relative z-10 min-h-0 flex-1 overflow-y-auto px-7 py-9 sm:px-12 sm:py-11">
          {step === 'read' && (
            <div>
              <div className="mb-7 flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#e9eff1] text-[#7895a6]">
                <BookHeart size={29} strokeWidth={1.6} />
              </div>

              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b29377]">
                Primero, escuchá su historia
              </p>

              <h2
                id="prayer-moment-title"
                className="font-serif text-3xl leading-tight text-[#435e71] sm:text-4xl"
              >
                {request.title}
              </h2>

              <p className="mt-6 whitespace-pre-wrap break-words text-sm leading-8 text-[#7c8f9d]">
                {request.description}
              </p>

              <div className="mt-8 rounded-2xl bg-[#edf2ef] px-5 py-4 text-xs leading-6 text-[#7c9488]">
                Detrás de esta petición hay una persona real.
                Leé con calma y dedicá un momento a acompañarla.
              </div>
            </div>
          )}

          {step === 'pray' && (
            <div className="text-center">
              <div className="mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-[28px] bg-[#edf2ef] text-[#819b8e]">
                <HeartHandshake size={36} strokeWidth={1.5} />
              </div>

              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b29377]">
                Ahora, dedicá este momento
              </p>

              <h2
                id="prayer-moment-title"
                className="font-serif text-3xl text-[#435e71] sm:text-4xl"
              >
                Oremos por esta petición
              </h2>

              <p className="mx-auto mt-6 max-w-lg text-sm leading-8 text-[#7c8f9d]">
                Poné delante de Dios la situación que acabás
                de leer. Podés orar en silencio, con tus
                propias palabras o simplemente permanecer
                un momento en Su presencia.
              </p>

              <div className="mx-auto mt-8 max-w-lg rounded-[24px] border border-[#526e82]/10 bg-white/75 px-6 py-7">
                <Heart
                  size={20}
                  className="mx-auto mb-4 text-[#b99da7]"
                />

                <p className="font-serif text-xl italic leading-8 text-[#688092]">
                  “Señor, hoy pongo delante de Ti esta
                  necesidad. Traé paz, fortaleza y esperanza.
                  Que esta persona pueda sentir Tu amor y
                  Tu compañía. Amén.”
                </p>
              </div>

              <p className="mt-7 text-xs leading-6 text-[#98a5af]">
                No hay un tiempo mínimo. Confirmá únicamente
                cuando hayas terminado de orar.
              </p>
            </div>
          )}

          {step === 'completed' && (
            <div className="py-8 text-center">
              <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-[#e5f0e9] text-[#769783]">
                <Check size={44} strokeWidth={1.7} />
              </div>

              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#91a395]">
                Un acto de amor
              </p>

              <h2
                id="prayer-moment-title"
                className="font-serif text-4xl text-[#435e71]"
              >
                Oración registrada
              </h2>

              <p className="mx-auto mt-6 max-w-md text-sm leading-8 text-[#7c8f9d]">
                Gracias por dedicar este momento a alguien
                de tu comunidad. Tu oración quedó guardada
                en SURRENDER.
              </p>

              <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#edf2ef] px-5 py-3 text-xs font-semibold text-[#779182]">
                <Heart size={15} />
                Oré por ti
              </div>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mt-6 rounded-2xl border border-[#bb8585]/20 bg-[#fcf0f0] px-5 py-4 text-sm text-[#a86f73]"
            >
              {error}
            </div>
          )}
        </div>

        {/* ACCIONES */}
        <div className="relative z-10 border-t border-[#526e82]/10 bg-white/60 px-6 py-5 sm:px-9">
          {step === 'read' && (
            <button
              type="button"
              onClick={() => setStep('pray')}
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#526e82] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#405c70]"
            >
              Dedicar un momento de oración
              <ArrowRight size={18} />
            </button>
          )}

          {step === 'pray' && (
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setStep('read')}
                disabled={submitting}
                className="inline-flex min-h-12 items-center gap-2 rounded-2xl px-4 text-sm font-semibold text-[#7f92a0] transition hover:bg-[#edf1f3] disabled:opacity-40"
              >
                <ArrowLeft size={17} />
                Volver
              </button>

              <button
                type="button"
                onClick={() => void handleConfirmPrayer()}
                disabled={submitting}
                className="inline-flex min-h-12 flex-1 items-center justify-center gap-3 rounded-2xl bg-[#526e82] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#405c70] disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <LoaderCircle
                      size={18}
                      className="animate-spin"
                    />
                    Registrando...
                  </>
                ) : (
                  <>
                    <Heart size={18} />
                    Ya oré por esta persona
                  </>
                )}
              </button>
            </div>
          )}

          {step === 'completed' && (
            <button
              type="button"
              onClick={onClose}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#526e82] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#405c70]"
            >
              <Check size={18} />
              Finalizar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
