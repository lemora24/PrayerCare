
import { useCallback, useEffect, useState } from 'react'
import {
  Bell,
  BellOff,
  CalendarDays,
  Check,
  Clock3,
  LoaderCircle,
  Pencil,
  Plus,
  Trash2,
  X,
} from 'lucide-react'

import {
  createPrayerReminder,
  deletePrayerReminder,
  formatReminderTime,
  getBrowserTimeZone,
  getDefaultReminderDays,
  getPrayerRemindersByPerson,
  getReminderDayLabels,
  PRAYER_WEEK_DAYS,
  updatePrayerReminder,
  type CreatePrayerReminderRequest,
  type PrayerReminder,
  type PrayerReminderDays,
} from '../services/prayerReminders'

type Props = {
  personId: string
  personName: string
}

type FormMode =
  | { kind: 'create' }
  | { kind: 'edit'; reminder: PrayerReminder }

const dayKeys: (keyof PrayerReminderDays)[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]

function emptyForm(): CreatePrayerReminderRequest {
  return {
    reminderTime: '19:00',
    timeZoneId: getBrowserTimeZone(),
    isEnabled: true,
    ...getDefaultReminderDays(),
  }
}

function errorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null) {
    const response = error as {
      response?: { data?: unknown }
    }

    const data = response.response?.data

    if (typeof data === 'string' && data.trim()) {
      return data
    }

    if (
      typeof data === 'object' &&
      data !== null &&
      'title' in data &&
      typeof data.title === 'string'
    ) {
      return data.title
    }
  }

  return 'Ocurrió un error. Intentá nuevamente.'
}

export default function PersonPrayerReminders({
  personId,
  personName,
}: Props) {
  const [reminders, setReminders] = useState<PrayerReminder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [formMode, setFormMode] = useState<FormMode | null>(null)
  const [form, setForm] =
    useState<CreatePrayerReminderRequest>(emptyForm)

  const [saving, setSaving] = useState(false)
  const [processingId, setProcessingId] = useState<string | null>(
    null,
  )
  const [deleteTarget, setDeleteTarget] =
    useState<PrayerReminder | null>(null)

  const loadReminders = useCallback(async () => {
    try {
      const data = await getPrayerRemindersByPerson(personId)
      setReminders(data)
      setError(null)
    } catch {
      setError('No pudimos cargar los recordatorios de esta persona.')
    } finally {
      setLoading(false)
    }
  }, [personId])

  useEffect(() => {
    void loadReminders()
  }, [loadReminders])

  function openCreate() {
    setForm(emptyForm())
    setFormMode({ kind: 'create' })
    setError(null)
  }

  function openEdit(reminder: PrayerReminder) {
    setForm({
      reminderTime: reminder.reminderTime.slice(0, 5),
      timeZoneId: reminder.timeZoneId,
      isEnabled: reminder.isEnabled,
      sunday: reminder.sunday,
      monday: reminder.monday,
      tuesday: reminder.tuesday,
      wednesday: reminder.wednesday,
      thursday: reminder.thursday,
      friday: reminder.friday,
      saturday: reminder.saturday,
    })

    setFormMode({ kind: 'edit', reminder })
    setError(null)
  }

  function toggleDay(day: keyof PrayerReminderDays) {
    setForm((current) => ({
      ...current,
      [day]: !current[day],
    }))
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!formMode || saving) return

    if (!dayKeys.some((day) => form[day])) {
      setError('Seleccioná al menos un día de la semana.')
      return
    }

    setSaving(true)
    setError(null)

    const payload: CreatePrayerReminderRequest = {
      ...form,
      reminderTime: `${form.reminderTime.slice(0, 5)}:00`,
      timeZoneId: form.timeZoneId.trim(),
    }

    try {
      if (formMode.kind === 'create') {
        await createPrayerReminder(personId, payload)
      } else {
        await updatePrayerReminder(
          personId,
          formMode.reminder.id,
          payload,
        )
      }

      setFormMode(null)
      await loadReminders()
    } catch (error) {
      setError(errorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  async function handleToggle(reminder: PrayerReminder) {
    if (processingId) return

    setProcessingId(reminder.id)
    setError(null)

    try {
      await updatePrayerReminder(personId, reminder.id, {
        reminderTime: reminder.reminderTime,
        timeZoneId: reminder.timeZoneId,
        isEnabled: !reminder.isEnabled,
        sunday: reminder.sunday,
        monday: reminder.monday,
        tuesday: reminder.tuesday,
        wednesday: reminder.wednesday,
        thursday: reminder.thursday,
        friday: reminder.friday,
        saturday: reminder.saturday,
      })

      await loadReminders()
    } catch (error) {
      setError(errorMessage(error))
    } finally {
      setProcessingId(null)
    }
  }

  async function handleDelete() {
    if (!deleteTarget || processingId) return

    setProcessingId(deleteTarget.id)
    setError(null)

    try {
      await deletePrayerReminder(personId, deleteTarget.id)
      setDeleteTarget(null)
      await loadReminders()
    } catch (error) {
      setError(errorMessage(error))
    } finally {
      setProcessingId(null)
    }
  }

  const activeCount = reminders.filter(
    (reminder) => reminder.isEnabled,
  ).length

  return (
    <section className="space-y-5">
      {/* ENCABEZADO */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="pc-eyebrow">ACOMPAÑAR CON CONSTANCIA</p>

          <h2 className="mt-2 font-display text-4xl text-[#40596d]">
            Nuestros momentos de oración
          </h2>

          <p className="mt-2 text-sm leading-7 text-[#83919a]">
            Pequeños momentos reservados para recordar a{' '}
            {personName} en oración.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="pc-button-secondary inline-flex items-center gap-2"
        >
          <Plus size={16} />
          Nuevo horario
        </button>
      </div>

      {/* CONTENEDOR */}
      <div className="overflow-hidden rounded-[27px] border border-[#e2e8e8] bg-gradient-to-br from-white via-[#fafbf9] to-[#f0f1f5] p-6 shadow-[0_8px_30px_rgba(56,72,82,0.035)] sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e8eceb] pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eaf0f3] text-[#607d90]">
              <CalendarDays size={20} strokeWidth={1.7} />
            </div>

            <div>
              <p className="text-sm font-semibold text-[#526e82]">
                Horarios personales
              </p>

              <p className="mt-1 text-xs text-[#97a3a9]">
                {activeCount}{' '}
                {activeCount === 1
                  ? 'recordatorio activo'
                  : 'recordatorios activos'}
              </p>
            </div>
          </div>

          <span className="rounded-full bg-[#edf1f4] px-3 py-2 text-[11px] font-semibold text-[#78909f]">
            {reminders.length}{' '}
            {reminders.length === 1 ? 'horario' : 'horarios'}
          </span>
        </div>

        {error && !formMode && (
          <div
            role="alert"
            className="mt-5 rounded-xl border border-[#f0d7d1] bg-[#fff5f2] px-4 py-3 text-xs leading-6 text-[#a36d64]"
          >
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center gap-3 py-14 text-sm text-[#83919b]">
            <LoaderCircle
              size={19}
              className="animate-spin"
            />
            Cargando horarios...
          </div>
        ) : reminders.length === 0 ? (
          <div className="py-12 text-center">
            <Bell
              size={33}
              strokeWidth={1.4}
              className="mx-auto text-[#a1aeb8]"
            />

            <h3 className="mt-4 font-display text-3xl text-[#526e82]">
              Un momento para recordar
            </h3>

            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#84929c]">
              Todavía no hay horarios para esta persona.
              Podés elegir un día y una hora para dedicarle
              un momento de oración.
            </p>

            <button
              type="button"
              onClick={openCreate}
              className="pc-button-primary mt-6"
            >
              <Plus size={16} />
              Crear primer horario
            </button>
          </div>
        ) : (
          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            {reminders.map((reminder) => (
              <article
                key={reminder.id}
                className="rounded-[20px] border border-[#e6e9e8] bg-white/85 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Clock3
                      size={18}
                      className="text-[#8b86a7]"
                    />

                    <span className="font-display text-3xl text-[#526e82]">
                      {formatReminderTime(reminder.reminderTime)}
                    </span>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${
                      reminder.isEnabled
                        ? 'bg-[#edf4ed] text-[#73947b]'
                        : 'bg-[#f3f0ed] text-[#9c9188]'
                    }`}
                  >
                    {reminder.isEnabled ? 'Activo' : 'En pausa'}
                  </span>
                </div>

                <p className="mt-2 text-[11px] text-[#a0a9ad]">
                  {reminder.timeZoneId}
                </p>

                <div className="mt-5 flex flex-wrap gap-1.5">
                  {PRAYER_WEEK_DAYS.map((day) => (
                    <span
                      key={day.key}
                      title={day.label}
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-semibold ${
                        reminder[day.key]
                          ? 'bg-[#e9e8f1] text-[#81769f]'
                          : 'bg-[#f4f5f3] text-[#b5bdc0]'
                      }`}
                    >
                      {day.short}
                    </span>
                  ))}
                </div>

                <p className="mt-3 text-xs leading-6 text-[#97a3a9]">
                  {getReminderDayLabels(reminder).join(', ')}
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-[#edf0ee] pt-4">
                  <button
                    type="button"
                    onClick={() => openEdit(reminder)}
                    disabled={processingId !== null}
                    className="inline-flex items-center gap-2 rounded-full bg-[#edf2f5] px-3.5 py-2 text-xs font-semibold text-[#607b8e] transition hover:bg-[#e0eaf0] disabled:opacity-50"
                  >
                    <Pencil size={14} />
                    Editar
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleToggle(reminder)}
                    disabled={processingId !== null}
                    className="inline-flex items-center gap-2 rounded-full bg-[#f3f3f1] px-3.5 py-2 text-xs font-semibold text-[#8b8d89] transition hover:bg-[#e9ebe8] disabled:opacity-50"
                  >
                    {processingId === reminder.id ? (
                      <LoaderCircle
                        size={14}
                        className="animate-spin"
                      />
                    ) : reminder.isEnabled ? (
                      <BellOff size={14} />
                    ) : (
                      <Bell size={14} />
                    )}

                    {reminder.isEnabled ? 'Pausar' : 'Activar'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteTarget(reminder)}
                    disabled={processingId !== null}
                    aria-label="Eliminar recordatorio"
                    className="ml-auto flex h-9 w-9 items-center justify-center rounded-full text-[#b38a83] transition hover:bg-[#fbefed] disabled:opacity-50"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* MODAL CREAR / EDITAR */}
      {formMode && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#263d50]/45 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="person-reminder-title"
            className="max-h-[90vh] w-full max-w-[510px] overflow-y-auto rounded-[28px] bg-[#faf9f6] p-6 shadow-[0_30px_90px_rgba(26,43,55,0.22)] sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="pc-eyebrow">UN MOMENTO CON PROPÓSITO</p>

                <h3
                  id="person-reminder-title"
                  className="mt-2 font-display text-4xl text-[#40596d]"
                >
                  {formMode.kind === 'create'
                    ? 'Nuevo horario'
                    : 'Editar horario'}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => !saving && setFormMode(null)}
                disabled={saving}
                aria-label="Cerrar"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#edf0ef] text-[#728491]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={(event) => void handleSave(event)}>
              <div className="mt-7 space-y-5">
                <div>
                  <label
                    htmlFor="person-reminder-time"
                    className="mb-2 block text-xs font-semibold text-[#647b8a]"
                  >
                    Hora de oración
                  </label>

                  <input
                    id="person-reminder-time"
                    type="time"
                    required
                    value={form.reminderTime}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        reminderTime: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-[#dfe6e7] bg-white px-4 py-3.5 text-sm text-[#526e82] outline-none focus:border-[#9aafbc]"
                  />
                </div>

                <div>
                  <p className="mb-3 text-xs font-semibold text-[#647b8a]">
                    Días de la semana
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {PRAYER_WEEK_DAYS.map((day) => (
                      <button
                        key={day.key}
                        type="button"
                        onClick={() => toggleDay(day.key)}
                        aria-pressed={form[day.key]}
                        className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold transition ${
                          form[day.key]
                            ? 'bg-[#526e82] text-white'
                            : 'border border-[#e0e5e5] bg-white text-[#81909a] hover:bg-[#edf2f4]'
                        }`}
                      >
                        {day.short}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="person-reminder-timezone"
                    className="mb-2 block text-xs font-semibold text-[#647b8a]"
                  >
                    Zona horaria
                  </label>

                  <input
                    id="person-reminder-timezone"
                    type="text"
                    required
                    value={form.timeZoneId}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        timeZoneId: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-[#dfe6e7] bg-white px-4 py-3.5 text-sm text-[#526e82] outline-none focus:border-[#9aafbc]"
                  />
                </div>

                <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-[#e2e8e7] bg-white px-4 py-4">
                  <span>
                    <span className="block text-sm font-semibold text-[#526e82]">
                      Recordatorio activo
                    </span>

                    <span className="mt-1 block text-xs text-[#96a2a8]">
                      Mostrar este horario en la agenda.
                    </span>
                  </span>

                  <input
                    type="checkbox"
                    checked={form.isEnabled}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        isEnabled: event.target.checked,
                      }))
                    }
                    className="h-5 w-5 accent-[#526e82]"
                  />
                </label>
              </div>

              {error && (
                <p
                  role="alert"
                  className="mt-5 rounded-xl bg-[#fff0ed] px-4 py-3 text-xs text-[#a36d64]"
                >
                  {error}
                </p>
              )}

              <div className="mt-7 flex justify-end gap-3 border-t border-[#e7e9e6] pt-6">
                <button
                  type="button"
                  onClick={() => setFormMode(null)}
                  disabled={saving}
                  className="pc-button-secondary"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="pc-button-primary"
                >
                  {saving ? (
                    <LoaderCircle
                      size={16}
                      className="animate-spin"
                    />
                  ) : (
                    <Check size={16} />
                  )}

                  {saving ? 'Guardando...' : 'Guardar horario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMACIÓN DE ELIMINACIÓN */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#263d50]/45 p-4 backdrop-blur-sm">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-person-reminder-title"
            className="w-full max-w-[430px] rounded-[26px] bg-[#faf9f6] p-7 shadow-[0_30px_90px_rgba(26,43,55,0.22)]"
          >
            <h3
              id="delete-person-reminder-title"
              className="font-display text-3xl text-[#40596d]"
            >
              ¿Eliminar este horario?
            </h3>

            <p className="mt-3 text-sm leading-7 text-[#84929c]">
              El recordatorio desaparecerá de la agenda.
              El diario de oración permanecerá intacto.
            </p>

            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={processingId !== null}
                className="pc-button-secondary"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={() => void handleDelete()}
                disabled={processingId !== null}
                className="inline-flex items-center gap-2 rounded-full bg-[#b97970] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#a7665e] disabled:opacity-50"
              >
                {processingId ? (
                  <LoaderCircle
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  <Trash2 size={16} />
                )}

                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
