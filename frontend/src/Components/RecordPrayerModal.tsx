
import { useState, type FormEvent } from 'react'
import { Heart, X } from 'lucide-react'

type RecordPrayerModalProps = {
  prayerRequestTitle: string
  onClose: () => void
  onConfirm: (note: string) => Promise<void>
}

export default function RecordPrayerModal({
  prayerRequestTitle,
  onClose,
  onConfirm,
}: RecordPrayerModalProps) {
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (saving) return

    setSaving(true)
    setError('')

    try {
      await onConfirm(note.trim())
    } catch {
      setError('No se pudo registrar la oración. Inténtalo nuevamente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="record-prayer-title"
        className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
              <Heart size={24} />
            </div>

            <div>
              <h2
                id="record-prayer-title"
                className="text-xl font-bold text-slate-900"
              >
                Registrar oración
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {prayerRequestTitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Cerrar"
            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label
              htmlFor="prayer-note"
              className="block text-sm font-semibold text-slate-700"
            >
              ¿Quieres agregar una nota?
            </label>

            <textarea
              id="prayer-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={4}
              maxLength={1000}
              placeholder="Hoy oré para que Dios le dé sabiduría, paz y dirección..."
              className="mt-2 w-full resize-none rounded-xl border border-slate-200 p-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />

            <div className="mt-2 flex justify-between text-xs text-slate-400">
              <span>Opcional</span>
              <span>{note.length}/1000</span>
            </div>
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Heart size={18} />
            {saving ? 'Registrando...' : 'Registrar oración'}
          </button>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="w-full rounded-xl px-5 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
          >
            Cancelar
          </button>
        </form>
      </div>
    </div>
  )
}
