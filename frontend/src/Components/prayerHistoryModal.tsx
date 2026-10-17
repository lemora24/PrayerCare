
import { useEffect, useState } from 'react'
import { BookOpen, CalendarDays, X } from 'lucide-react'
import {
  getPrayerLogs,
  type PrayerLog,
} from '../services/prayerRequests'

type PrayerHistoryModalProps = {
  prayerRequestId: string
  prayerRequestTitle: string
  onClose: () => void
}

export default function PrayerHistoryModal({
  prayerRequestId,
  prayerRequestTitle,
  onClose,
}: PrayerHistoryModalProps) {
  const [logs, setLogs] = useState<PrayerLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadHistory() {
      try {
        const result = await getPrayerLogs(prayerRequestId)

        if (active) {
          setLogs(result)
        }
      } catch {
        if (active) {
          setError('No se pudo cargar el historial.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadHistory()

    return () => {
      active = false
    }
  }, [prayerRequestId])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="prayer-history-title"
        className="flex max-h-[85vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
      >
        {/* ENCABEZADO */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-6">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
              <BookOpen size={23} />
            </div>

            <div>
              <h2
                id="prayer-history-title"
                className="text-xl font-bold text-slate-900"
              >
                Historial de oración
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {prayerRequestTitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar historial"
            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100"
          >
            <X size={21} />
          </button>
        </div>

        {/* CONTENIDO */}
        <div className="overflow-y-auto p-6">
          {loading && (
            <p className="text-center text-slate-500">
              Cargando historial...
            </p>
          )}

          {error && (
            <p role="alert" className="text-center text-red-600">
              {error}
            </p>
          )}

          {!loading && !error && (
            <>
              <div className="mb-6 rounded-2xl bg-emerald-50 p-5">
                <p className="text-sm font-medium text-emerald-700">
                  Oraciones registradas
                </p>

                <p className="mt-1 text-3xl font-bold text-emerald-900">
                  {logs.length}
                </p>
              </div>

              {logs.length === 0 ? (
                <p className="py-8 text-center text-slate-500">
                  Todavía no hay oraciones registradas.
                </p>
              ) : (
                <div className="space-y-4">
                  {logs.map((log) => (
                    <article
                      key={log.id}
                      className="rounded-2xl border border-slate-200 p-5"
                    >
                      <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                        <CalendarDays size={17} />

                        {new Date(log.prayedAt).toLocaleString(
                          'es-CR',
                          {
                            dateStyle: 'long',
                            timeStyle: 'short',
                          },
                        )}
                      </div>

                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        {log.note ||
                          'Oración registrada sin nota adicional.'}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* PIE */}
        <div className="border-t border-slate-100 p-5">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700"
          >
            Cerrar historial
          </button>
        </div>
      </div>
    </div>
  )
}
