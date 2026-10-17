
import api from './api'

// ============================================================
// TIPOS
// ============================================================

export type PrayerReminderDays = {
  sunday: boolean
  monday: boolean
  tuesday: boolean
  wednesday: boolean
  thursday: boolean
  friday: boolean
  saturday: boolean
}

export type PrayerReminder = PrayerReminderDays & {
  id: string
  personId: string
  reminderTime: string
  timeZoneId: string
  isEnabled: boolean

  // Disponible en GET /api/reminders
  personName?: string
}

export type CreatePrayerReminderRequest = PrayerReminderDays & {
  reminderTime: string
  timeZoneId: string
  isEnabled: boolean
}

export type UpdatePrayerReminderRequest =
  CreatePrayerReminderRequest

export type PrayerAgendaItem = {
  reminderId: string
  personId: string
  personName: string
  reminderTime: string
  timeZoneId: string
}

// ============================================================
// RECORDATORIOS POR PERSONA
// ============================================================

export async function getPrayerRemindersByPerson(
  personId: string,
): Promise<PrayerReminder[]> {
  const response = await api.get<PrayerReminder[]>(
    `/people/${personId}/reminders`,
  )

  return response.data
}

export async function createPrayerReminder(
  personId: string,
  request: CreatePrayerReminderRequest,
): Promise<PrayerReminder> {
  const response = await api.post<PrayerReminder>(
    `/people/${personId}/reminders`,
    request,
  )

  return response.data
}

export async function updatePrayerReminder(
  personId: string,
  reminderId: string,
  request: UpdatePrayerReminderRequest,
): Promise<PrayerReminder> {
  const response = await api.put<PrayerReminder>(
    `/people/${personId}/reminders/${reminderId}`,
    request,
  )

  return response.data
}

export async function deletePrayerReminder(
  personId: string,
  reminderId: string,
): Promise<void> {
  await api.delete(
    `/people/${personId}/reminders/${reminderId}`,
  )
}

// ============================================================
// TODOS LOS RECORDATORIOS DEL USUARIO
// ============================================================

export async function getAllPrayerReminders(): Promise<
  PrayerReminder[]
> {
  const response = await api.get<PrayerReminder[]>(
    '/reminders',
  )

  return response.data
}

// ============================================================
// AGENDA POR FECHA
// ============================================================

export async function getPrayerAgenda(
  date: string,
): Promise<PrayerAgendaItem[]> {
  // date debe utilizar el formato YYYY-MM-DD.
  // Ejemplo: 2026-10-17

  const response = await api.get<PrayerAgendaItem[]>(
    '/reminders/agenda',
    {
      params: { date },
    },
  )

  return response.data
}

// ============================================================
// UTILIDADES PARA LA INTERFAZ
// ============================================================

export const PRAYER_WEEK_DAYS = [
  { key: 'monday', short: 'L', label: 'Lunes' },
  { key: 'tuesday', short: 'M', label: 'Martes' },
  { key: 'wednesday', short: 'X', label: 'Miércoles' },
  { key: 'thursday', short: 'J', label: 'Jueves' },
  { key: 'friday', short: 'V', label: 'Viernes' },
  { key: 'saturday', short: 'S', label: 'Sábado' },
  { key: 'sunday', short: 'D', label: 'Domingo' },
] as const satisfies ReadonlyArray<{
  key: keyof PrayerReminderDays
  short: string
  label: string
}>

export function getReminderDayLabels(
  reminder: PrayerReminderDays,
): string[] {
  return PRAYER_WEEK_DAYS
    .filter((day) => reminder[day.key])
    .map((day) => day.label)
}

export function formatReminderTime(
  time: string,
): string {
  // Acepta HH:mm y HH:mm:ss.
  const [hoursText, minutesText] = time.split(':')

  const hours = Number(hoursText)
  const minutes = Number(minutesText)

  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return time
  }

  const period = hours >= 12 ? 'p. m.' : 'a. m.'
  const hour12 = hours % 12 || 12

  return `${hour12}:${String(minutes).padStart(2, '0')} ${period}`
}

export function toLocalDateString(
  date: Date,
): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function getDefaultReminderDays(): PrayerReminderDays {
  return {
    sunday: false,
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
  }
}

export function getBrowserTimeZone(): string {
  return (
    Intl.DateTimeFormat().resolvedOptions().timeZone ||
    'UTC'
  )
}
