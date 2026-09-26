import { useState, type FormEvent } from 'react'
import { HeartHandshake, X } from 'lucide-react'
import {
  createPrayerRequest,
  type PrayerRequest,
} from '../services/prayerRequests'

type CreatePrayerRequestModalProps = {
  personId: string
  personName: string
  onClose: () => void
  onCreated: (request: PrayerRequest) => void
}

export default function CreatePrayerRequestModal({
  personId,
  personName,
  onClose,
  onCreated,
}: CreatePrayerRequestModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState(10)
  const [priority, setPriority] = useState(2)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!title.trim()) {
      setError('El título es obligatorio.')
      return
    }

    setSaving(true)
    setError('')

    try {
      const request = await createPrayerRequest(personId, {
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        priority,
      })

      onCreated(request)
      onClose()
    } catch {
      setError('No se pudo crear la petición. Inténtalo nuevamente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <HeartHandshake size={22} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Nueva petición
              </h2>

              <p className="text-sm text-slate-500">
                Para {personName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={21} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Título *
            </label>

            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ej. Nueva oportunidad laboral"
              autoFocus
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Descripción
            </label>

            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              placeholder="Describe brevemente por qué quieres orar..."
              className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Categoría
              </label>

              <select
                value={category}
                onChange={(event) => setCategory(Number(event.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-emerald-500"
              >
                <option value={1}>Salud</option>
                <option value={2}>Familia</option>
                <option value={3}>Trabajo</option>
                <option value={4}>Estudios</option>
                <option value={5}>Finanzas</option>
                <option value={6}>Relaciones</option>
                <option value={7}>Fe</option>
                <option value={8}>Decisiones</option>
                <option value={9}>Ministerio</option>
                <option value={10}>Otro</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Prioridad
              </label>

              <select
                value={priority}
                onChange={(event) => setPriority(Number(event.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-emerald-500"
              >
                <option value={1}>Baja</option>
                <option value={2}>Normal</option>
                <option value={3}>Alta</option>
                <option value={4}>Urgente</option>
              </select>
            </div>
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl px-5 py-3 font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Guardando...' : 'Guardar petición'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}