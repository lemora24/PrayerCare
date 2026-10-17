
import { useState, type FormEvent } from 'react'
import { Pencil, Save, X } from 'lucide-react'

import {
  updatePrayerRequest,
  type PrayerRequest,
} from '../services/prayerRequests'

type EditPrayerRequestModalProps = {
  prayerRequest: PrayerRequest
  onClose: () => void
  onUpdated: (updatedRequest: PrayerRequest) => void
}

const categories = [
  { value: 1, label: 'Salud' },
  { value: 2, label: 'Familia' },
  { value: 3, label: 'Trabajo' },
  { value: 4, label: 'Estudios' },
  { value: 5, label: 'Finanzas' },
  { value: 6, label: 'Relaciones' },
  { value: 7, label: 'Fe' },
  { value: 8, label: 'Decisiones' },
  { value: 9, label: 'Ministerio' },
  { value: 10, label: 'Otro' },
]

const priorities = [
  { value: 1, label: 'Baja' },
  { value: 2, label: 'Normal' },
  { value: 3, label: 'Alta' },
  { value: 4, label: 'Urgente' },
]

const statuses = [
  { value: 1, label: 'Activa' },
  { value: 2, label: 'En seguimiento' },
  { value: 3, label: 'Respondida' },
  { value: 4, label: 'Cerrada' },
]

export default function EditPrayerRequestModal({
  prayerRequest,
  onClose,
  onUpdated,
}: EditPrayerRequestModalProps) {
  const [title, setTitle] = useState(prayerRequest.title)
  const [description, setDescription] = useState(
    prayerRequest.description ?? '',
  )
  const [category, setCategory] = useState(prayerRequest.category)
  const [priority, setPriority] = useState(prayerRequest.priority)
  const [status, setStatus] = useState(prayerRequest.status)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (saving) return

    if (!title.trim()) {
      setError('El título de la petición es obligatorio.')
      return
    }

    setSaving(true)
    setError('')

    try {
      const updatedRequest = await updatePrayerRequest(
        prayerRequest.id,
        {
          title: title.trim(),
          description: description.trim(),
          category,
          priority,
          status,
        },
      )

      onUpdated(updatedRequest)
      onClose()
    } catch {
      setError(
        'No se pudo actualizar la petición. Inténtalo nuevamente.',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-prayer-title"
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
      >
        {/* ENCABEZADO */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
              <Pencil size={23} />
            </div>

            <div>
              <h2
                id="edit-prayer-title"
                className="text-xl font-bold text-slate-900"
              >
                Editar petición
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Actualiza la información y el estado.
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

        {/* FORMULARIO */}
        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="space-y-5 overflow-y-auto p-6">
            {/* TÍTULO */}
            <div>
              <label
                htmlFor="edit-prayer-name"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Título de la petición
              </label>

              <input
                id="edit-prayer-name"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
                maxLength={200}
                placeholder="Ej. Salud de mi familia"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            {/* DESCRIPCIÓN */}
            <div>
              <label
                htmlFor="edit-prayer-description"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Descripción
              </label>

              <textarea
                id="edit-prayer-description"
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                rows={4}
                placeholder="Agrega detalles sobre esta petición..."
                className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            {/* CATEGORÍA Y PRIORIDAD */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="edit-prayer-category"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Categoría
                </label>

                <select
                  id="edit-prayer-category"
                  value={category}
                  onChange={(event) =>
                    setCategory(Number(event.target.value))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                >
                  {categories.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="edit-prayer-priority"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Prioridad
                </label>

                <select
                  id="edit-prayer-priority"
                  value={priority}
                  onChange={(event) =>
                    setPriority(Number(event.target.value))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                >
                  {priorities.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* ESTADO */}
            <div>
              <label
                htmlFor="edit-prayer-status"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Estado de la petición
              </label>

              <select
                id="edit-prayer-status"
                value={status}
                onChange={(event) =>
                  setStatus(Number(event.target.value))
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                {statuses.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>

              {status === 3 && (
                <p className="mt-2 text-xs leading-5 text-emerald-700">
                  Al guardar, la petición se marcará como
                  respondida y se registrará su fecha de respuesta.
                </p>
              )}
            </div>

            {/* ERROR */}
            {error && (
              <p
                role="alert"
                className="rounded-xl bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </p>
            )}
          </div>

          {/* ACCIONES */}
          <div className="flex gap-3 border-t border-slate-100 p-6">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-3 font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={18} />
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
