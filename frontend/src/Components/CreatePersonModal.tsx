import { useState, type FormEvent } from 'react'
import { X, UserPlus } from 'lucide-react'
import {
  createPerson,
  type CreatePersonRequest,
  type Person,
} from '../services/people'

type CreatePersonModalProps = {
  onClose: () => void
  onCreated: (person: Person) => void
}

export default function CreatePersonModal({
  onClose,
  onCreated,
}: CreatePersonModalProps) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [relationship, setRelationship] = useState(2)
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!firstName.trim()) {
      setError('El nombre es obligatorio.')
      return
    }

    setError('')
    setSaving(true)

    const request: CreatePersonRequest = {
      firstName: firstName.trim(),
      lastName: lastName.trim() || undefined,
      relationship,
      notes: notes.trim() || undefined,
    }

    try {
      const person = await createPerson(request)
      onCreated(person)
      onClose()
    } catch {
      setError('No se pudo crear la persona. Inténtalo nuevamente.')
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
              <UserPlus size={22} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Nueva persona
              </h2>
              <p className="text-sm text-slate-500">
                Agrega a alguien a tu comunidad.
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
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Nombre *
              </label>

              <input
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500"
                placeholder="Daniel"
                autoFocus
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Apellido
              </label>

              <input
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500"
                placeholder="Rodriguez"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Relación
            </label>

            <select
              value={relationship}
              onChange={(event) => setRelationship(Number(event.target.value))}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-emerald-500"
            >
              <option value={1}>Familia</option>
              <option value={2}>Amigo/a</option>
              <option value={3}>Iglesia</option>
              <option value={4}>Trabajo</option>
              <option value={5}>Universidad</option>
              <option value={6}>Pareja</option>
              <option value={7}>Conocido/a</option>
              <option value={8}>Otro</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Notas
            </label>

            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={4}
              placeholder="Algo que quieras recordar sobre esta persona..."
              className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500"
            />
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
              className="rounded-xl px-5 py-3 font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Guardando...' : 'Guardar persona'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}