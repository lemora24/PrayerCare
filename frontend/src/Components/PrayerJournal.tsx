import { useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BookHeart,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Heart,
  List,
  Pencil,
  Plus,
  Trash2,
  X,
} from 'lucide-react'
import type {
  PrayerLog,
  PrayerRequest,
} from '../services/prayerRequests'

type PrayerJournalProps = {
  personName: string
  requests: PrayerRequest[]
  logsByRequest?: Record<string, PrayerLog[]>
  onCreate: () => void
  onPray: (request: PrayerRequest) => void
  onHistory: (request: PrayerRequest) => void
  onEdit: (request: PrayerRequest) => void
  onDelete: (request: PrayerRequest) => void
  onAnswered: (request: PrayerRequest) => void
  processingId?: string | null
}

const categories: Record<number, string> = {
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

const priorities: Record<number, string> = {
  1: 'Baja',
  2: 'Normal',
  3: 'Alta',
  4: 'Urgente',
}

const statuses: Record<number, string> = {
  1: 'En oración',
  2: 'En seguimiento',
  3: 'Respondida',
  4: 'Cerrada',
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('es-CR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function PrayerJournal({
  personName,
  requests,
  logsByRequest = {},
  onCreate,
  onPray,
  onHistory,
  onEdit,
  onDelete,
  onAnswered,
  processingId = null,
}: PrayerJournalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [pageIndex, setPageIndex] = useState(0)
  const [direction, setDirection] = useState<'next' | 'previous'>('next')
  const [showIndex, setShowIndex] = useState(false)
  const [animationKey, setAnimationKey] = useState(0)

  useEffect(() => {
    setPageIndex((current) =>
      Math.min(current, Math.max(0, requests.length - 1)),
    )
  }, [requests.length])

  const currentRequest = requests[pageIndex]
  const currentLogs = currentRequest
    ? logsByRequest[currentRequest.id]
    : undefined

  const canGoBack = pageIndex > 0
  const canGoForward = pageIndex < requests.length - 1

  function goToPage(index: number) {
    if (index < 0 || index >= requests.length || index === pageIndex) {
      return
    }

    setDirection(index > pageIndex ? 'next' : 'previous')
    setPageIndex(index)
    setAnimationKey((value) => value + 1)
    setShowIndex(false)
  }

  function openJournal() {
    setIsOpen(true)
    setAnimationKey((value) => value + 1)
  }

  const pagePaper =
    'relative min-w-0 bg-[#faf6ed] text-[#453d36]'

  const smallLabel =
    'text-[10px] font-semibold uppercase tracking-[0.2em] text-[#998c7d]'

  const iconButton =
    'inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#e4dacb] text-[#817567] transition hover:bg-[#efe8dd] hover:text-[#453d36] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#526e82]'

  return (
    <section
      aria-label={`Diario de oración de ${personName}`}
      className="w-full"
    >
      <style>{`
        @keyframes pcJournalOpen {
          from {
            opacity: 0;
            transform: perspective(1300px) rotateY(-7deg) scale(.985);
          }
          to {
            opacity: 1;
            transform: perspective(1300px) rotateY(0) scale(1);
          }
        }

        @keyframes pcJournalNext {
          from {
            opacity: .35;
            transform: perspective(1400px) rotateY(-9deg);
          }
          to {
            opacity: 1;
            transform: perspective(1400px) rotateY(0);
          }
        }

        @keyframes pcJournalPrevious {
          from {
            opacity: .35;
            transform: perspective(1400px) rotateY(9deg);
          }
          to {
            opacity: 1;
            transform: perspective(1400px) rotateY(0);
          }
        }

        .pc-journal-open {
          animation: pcJournalOpen 480ms ease-out both;
        }

        .pc-journal-next {
          animation: pcJournalNext 440ms ease-out both;
        }

        .pc-journal-previous {
          animation: pcJournalPrevious 440ms ease-out both;
        }

        @media (prefers-reduced-motion: reduce) {
          .pc-journal-open,
          .pc-journal-next,
          .pc-journal-previous {
            animation: none !important;
          }
        }
      `}</style>

      {!isOpen ? (
        /* PORTADA */
        <div className="mx-auto max-w-[720px] py-5 sm:py-10">
          <div className="relative mx-auto max-w-[530px]">
            <div className="absolute -bottom-3 left-5 right-1 top-4 rounded-r-[26px] bg-[#d8cbb9] shadow-[12px_18px_35px_rgba(47,55,62,0.12)]" />

            <div className="relative overflow-hidden rounded-l-[13px] rounded-r-[25px] border border-[#526e82]/20 bg-gradient-to-br from-[#70899a] via-[#526e82] to-[#344f63] px-7 py-12 text-[#f8f5ed] shadow-[0_24px_65px_rgba(38,61,80,0.2)] sm:px-12 sm:py-16">
              <div className="pointer-events-none absolute bottom-0 left-3 top-0 w-px bg-white/20" />
              <div className="pointer-events-none absolute bottom-0 left-5 top-0 w-px bg-black/10" />
              <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full border border-white/10" />
              <div className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rounded-full border border-white/10" />

              <div className="relative flex min-h-[330px] flex-col items-center justify-between text-center">
                <div>
                  <BookHeart
                    size={35}
                    strokeWidth={1.2}
                    className="mx-auto text-[#e9d9bf]"
                  />

                  <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/65">
                    PrayerCare · Surrender
                  </p>
                </div>

                <div className="py-9">
                  <p className="font-display text-3xl italic text-[#e9d9bf]">
                    Mi diario de oración
                  </p>

                  <h2 className="mt-4 break-words font-display text-[clamp(2.8rem,6vw,4.5rem)] font-medium leading-none">
                    {personName}
                  </h2>

                  <div className="mx-auto mt-7 h-px w-20 bg-[#e9d9bf]/60" />

                  <p className="mx-auto mt-6 max-w-[260px] text-sm leading-7 text-white/75">
                    Cada petición, una historia.
                    Cada oración, un momento de fe.
                  </p>
                </div>

                <div className="w-full">
                  <p className="mb-5 text-xs text-white/65">
                    {requests.length}{' '}
                    {requests.length === 1
                      ? 'petición guardada'
                      : 'peticiones guardadas'}
                  </p>

                  <button
                    type="button"
                    onClick={openJournal}
                    className="inline-flex items-center justify-center gap-3 rounded-full bg-[#f8f5ed] px-7 py-3.5 text-sm font-semibold text-[#344f63] transition hover:-translate-y-0.5 hover:bg-white"
                  >
                    <BookOpen size={18} />
                    Abrir mi diario
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* LIBRO ABIERTO */
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#526e82] transition hover:text-[#263d50]"
            >
              <ArrowLeft size={17} />
              Cerrar diario
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowIndex((value) => !value)}
                aria-expanded={showIndex}
                className="pc-button-secondary"
              >
                {showIndex ? <X size={16} /> : <List size={16} />}
                Índice
              </button>

              <button
                type="button"
                onClick={onCreate}
                className="pc-button-primary"
              >
                <Plus size={16} />
                Nueva petición
              </button>
            </div>
          </div>

          {showIndex && (
            <div className="rounded-[24px] border border-[#dcd4c8] bg-[#faf6ed] p-5 shadow-sm">
              <p className={smallLabel}>ÍNDICE DEL DIARIO</p>

              {requests.length === 0 ? (
                <p className="mt-4 text-sm text-[#817567]">
                  Todavía no hay peticiones.
                </p>
              ) : (
                <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {requests.map((request, index) => (
                    <button
                      key={request.id}
                      type="button"
                      onClick={() => goToPage(index)}
                      className={`rounded-xl px-4 py-3 text-left text-sm transition ${
                        index === pageIndex
                          ? 'bg-[#dce9e9] text-[#344f63]'
                          : 'bg-white/70 text-[#675b4e] hover:bg-[#efe8dd]'
                      }`}
                    >
                      <span className="mr-2 text-xs opacity-60">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      {request.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="relative mx-auto max-w-[1150px] rounded-[17px] bg-[#cbbba5] p-[5px] shadow-[0_22px_65px_rgba(38,61,80,0.16)] sm:p-[9px]">
            <div className="pointer-events-none absolute -bottom-[5px] left-4 right-4 h-3 rounded-b-xl bg-[#e4d9c8]" />

            <div
              key={animationKey}
              className={`relative grid min-h-[480px] overflow-hidden rounded-[11px] bg-[#faf6ed] md:grid-cols-2 ${
                animationKey === 1
                  ? 'pc-journal-open'
                  : direction === 'next'
                    ? 'pc-journal-next'
                    : 'pc-journal-previous'
              }`}
            >
              {/* PÁGINA IZQUIERDA */}
              <div
                className={`${pagePaper} flex flex-col border-b border-[#e4dacb] px-6 py-8 sm:px-9 sm:py-10 md:border-b-0 md:border-r md:border-[#d5c8b6]`}
                style={{
                  boxShadow: 'inset -13px 0 20px -17px rgba(56,44,29,.35)',
                }}
              >
                {currentRequest ? (
                  <>
                    <div className="flex items-center justify-between gap-3">
                      <p className={smallLabel}>
                        PETICIÓN {String(pageIndex + 1).padStart(2, '0')}
                      </p>

                      {currentRequest.status === 3 && (
                        <span className="rounded-full border border-[#a6bca9] px-3 py-1 text-[10px] font-semibold text-[#5a8061]">
                          Respondida
                        </span>
                      )}
                    </div>

                    <div className="mt-7 flex flex-wrap gap-2">
                      <span className="rounded-full bg-[#e9e5da] px-3 py-1 text-[11px] text-[#817567]">
                        {categories[currentRequest.category] ?? 'Otro'}
                      </span>

                      <span className="rounded-full bg-[#e9e5da] px-3 py-1 text-[11px] text-[#817567]">
                        {statuses[currentRequest.status] ?? 'Sin estado'}
                      </span>
                    </div>

                    <h3 className="mt-6 break-words font-display text-[clamp(2.3rem,4vw,3.8rem)] font-medium leading-[1.05]">
                      {currentRequest.title}
                    </h3>

                    <div className="my-6 h-px w-14 bg-[#c9bba6]" />

                    <div className="max-h-[220px] overflow-y-auto pr-2">
                      <p className="whitespace-pre-wrap text-sm leading-8 text-[#716457]">
                        {currentRequest.description ||
                          'Esta petición todavía no tiene una descripción.'}
                      </p>
                    </div>

                    <div className="mt-auto pt-8">
                      <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#998c7d]">
                        <span>{formatDate(currentRequest.createdAt)}</span>
                        <span>
                          Prioridad:{' '}
                          {priorities[currentRequest.priority] ?? 'Normal'}
                        </span>
                      </div>

                      {currentRequest.answeredAt && (
                        <p className="mt-3 text-xs italic text-[#5a8061]">
                          Respondida el {formatDate(currentRequest.answeredAt)}
                        </p>
                      )}

                      <div className="mt-6 flex flex-wrap gap-2 border-t border-[#e4dacb] pt-5">
                        <button
                          type="button"
                          onClick={() => onEdit(currentRequest)}
                          aria-label="Editar petición"
                          title="Editar petición"
                          className={iconButton}
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          type="button"
                          onClick={() => onDelete(currentRequest)}
                          aria-label="Eliminar petición"
                          title="Eliminar petición"
                          className={iconButton}
                        >
                          <Trash2 size={15} />
                        </button>

                        {currentRequest.status !== 3 && (
                          <button
                            type="button"
                            onClick={() => onAnswered(currentRequest)}
                            disabled={processingId !== null}
                            className="inline-flex items-center gap-2 rounded-full border border-[#d1dfd1] px-3 py-2 text-xs font-semibold text-[#5a8061] transition hover:bg-[#e7efe5] disabled:opacity-50"
                          >
                            <CheckCircle2 size={15} />
                            {processingId === currentRequest.id
                              ? 'Guardando...'
                              : 'Marcar respondida'}
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-1 flex-col items-center justify-center text-center">
                    <BookHeart
                      size={40}
                      strokeWidth={1.3}
                      className="text-[#b4a28b]"
                    />

                    <h3 className="mt-5 font-display text-4xl">
                      Un nuevo comienzo
                    </h3>

                    <p className="mt-4 max-w-xs text-sm leading-7 text-[#817567]">
                      Tu diario está esperando su primera petición.
                    </p>

                    <button
                      type="button"
                      onClick={onCreate}
                      className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#526e82] px-5 py-3 text-sm font-semibold text-white"
                    >
                      <Plus size={16} />
                      Crear petición
                    </button>
                  </div>
                )}

                <p className="mt-6 text-center text-[10px] text-[#aa9c8a]">
                  {pageIndex * 2 + 1}
                </p>
              </div>

              {/* PÁGINA DERECHA */}
              <div
                className={`${pagePaper} flex flex-col px-6 py-8 sm:px-9 sm:py-10`}
                style={{
                  boxShadow: 'inset 13px 0 20px -17px rgba(56,44,29,.35)',
                }}
              >
                <div className="flex items-center justify-between">
                  <p className={smallLabel}>MOMENTOS CON DIOS</p>
                  <Heart
                    size={17}
                    strokeWidth={1.4}
                    className="text-[#ad9c88]"
                  />
                </div>

                <h3 className="mt-7 font-display text-3xl italic leading-tight sm:text-4xl">
                  Mis oraciones
                </h3>

                <p className="mt-3 text-xs leading-6 text-[#998c7d]">
                  Cada momento de oración forma parte de esta historia.
                </p>

                <div className="mt-7 max-h-[260px] flex-1 space-y-5 overflow-y-auto pr-2">
                  {!currentRequest ? (
                    <p className="text-sm italic text-[#998c7d]">
                      Las oraciones aparecerán aquí.
                    </p>
                  ) : currentLogs === undefined ? (
                    <div className="space-y-4">
                      <p className="text-sm leading-7 text-[#817567]">
                        El historial de esta petición se puede consultar
                        desde el botón inferior.
                      </p>

                      {currentRequest.lastPrayedAt && (
                        <p className="text-xs text-[#998c7d]">
                          Última oración:{' '}
                          {formatDate(currentRequest.lastPrayedAt)}
                        </p>
                      )}
                    </div>
                  ) : currentLogs.length === 0 ? (
                    <p className="text-sm italic leading-7 text-[#998c7d]">
                      Todavía no hay oraciones registradas.
                      Esta página espera su primera historia.
                    </p>
                  ) : (
                    currentLogs.map((log) => (
                      <div
                        key={log.id}
                        className="border-l-2 border-[#d9c9b4] pl-4"
                      >
                        <p className="text-[11px] font-semibold text-[#998c7d]">
                          {formatDate(log.prayedAt)}
                        </p>

                        <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[#716457]">
                          {log.note?.trim() ||
                            'Un momento de oración registrado.'}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {currentRequest && (
                  <div className="mt-auto space-y-3 pt-7">
                    <button
                      type="button"
                      onClick={() => onPray(currentRequest)}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-[#526e82] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#405c70]"
                    >
                      <Heart size={17} />
                      Registrar una oración
                    </button>

                    <button
                      type="button"
                      onClick={() => onHistory(currentRequest)}
                      className="flex w-full items-center justify-center gap-2 rounded-full border border-[#ded3c3] px-5 py-3 text-xs font-semibold text-[#817567] transition hover:bg-[#efe8dd]"
                    >
                      <BookOpen size={15} />
                      Ver historial completo
                    </button>
                  </div>
                )}

                <p className="mt-6 text-center text-[10px] text-[#aa9c8a]">
                  {pageIndex * 2 + 2}
                </p>
              </div>
            </div>
          </div>

          {/* NAVEGACIÓN */}
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => goToPage(pageIndex - 1)}
              disabled={!canGoBack}
              className="inline-flex items-center gap-2 rounded-full border border-[#526e82]/15 px-4 py-2.5 text-sm font-semibold text-[#526e82] transition hover:bg-white/70 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft size={17} />
              <span className="hidden sm:inline">Anterior</span>
            </button>

            <div className="text-center">
              <p className="text-xs font-semibold text-[#526e82]">
                {requests.length === 0 ? 0 : pageIndex + 1}
                {' / '}
                {requests.length}
              </p>
              <p className="mt-1 text-[10px] text-[#8394a3]">
                Peticiones del diario
              </p>
            </div>

            <button
              type="button"
              onClick={() => goToPage(pageIndex + 1)}
              disabled={!canGoForward}
              className="inline-flex items-center gap-2 rounded-full border border-[#526e82]/15 px-4 py-2.5 text-sm font-semibold text-[#526e82] transition hover:bg-white/70 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <span className="hidden sm:inline">Siguiente</span>
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
