
import api from './api'

// ==========================================
// TIPOS
// ==========================================

export type PrayerRequest = {
  id: string
  personId: string
  title: string
  description: string | null
  category: number
  priority: number
  status: number
  createdAt: string
  updatedAt: string | null
  answeredAt: string | null
  lastPrayedAt: string | null
}

export type PrayerLog = {
  id: string
  prayerRequestId: string
  prayedAt: string
  note: string | null
  createdAt: string
}

export type CreatePrayerRequestRequest = {
  title: string
  description?: string
  category: number
  priority: number
}

export type UpdatePrayerRequestRequest = {
  title: string
  description?: string
  category: number
  priority: number
  status: number
}

export type PrayRequest = {
  note?: string
}

// ==========================================
// CONSULTAR PETICIONES
// ==========================================

export async function getPrayerRequestsByPerson(
  personId: string,
): Promise<PrayerRequest[]> {
  const response = await api.get(
    `/people/${personId}/prayer-requests`,
  )

  return response.data
}

// ==========================================
// CREAR PETICIÓN
// ==========================================

export async function createPrayerRequest(
  personId: string,
  request: CreatePrayerRequestRequest,
): Promise<PrayerRequest> {
  const response = await api.post(
    `/people/${personId}/prayer-requests`,
    request,
  )

  return response.data
}

// ==========================================
// EDITAR PETICIÓN Y CAMBIAR ESTADO
// ==========================================

export async function updatePrayerRequest(
  prayerRequestId: string,
  request: UpdatePrayerRequestRequest,
): Promise<PrayerRequest> {
  const response = await api.put(
    `/prayer-requests/${prayerRequestId}`,
    request,
  )

  return response.data
}

// ==========================================
// REGISTRAR ORACIÓN
// ==========================================

export async function prayForRequest(
  prayerRequestId: string,
  request: PrayRequest = {},
): Promise<PrayerRequest> {
  const response = await api.post(
    `/prayer-requests/${prayerRequestId}/pray`,
    request,
  )

  return response.data
}

// ==========================================
// CONSULTAR HISTORIAL DE ORACIONES
// ==========================================

export async function getPrayerLogs(
  prayerRequestId: string,
): Promise<PrayerLog[]> {
  const response = await api.get(
    `/prayer-requests/${prayerRequestId}/logs`,
  )

  return response.data
}

// ==========================================
// MARCAR PETICIÓN COMO RESPONDIDA
// ==========================================

export async function markPrayerRequestAnswered(
  prayerRequestId: string,
): Promise<PrayerRequest> {
  const response = await api.post(
    `/prayer-requests/${prayerRequestId}/answer`,
  )

  return response.data
}

// ==========================================
// ELIMINAR PETICIÓN
// ==========================================

export async function deletePrayerRequest(
  prayerRequestId: string,
): Promise<void> {
  await api.delete(
    `/prayer-requests/${prayerRequestId}`,
  )
}

/**
 * Obtiene todas las peticiones de oración
 * pertenecientes al usuario autenticado.
 */
export async function getAllPrayerRequests(): Promise<PrayerRequest[]> {
  const response = await api.get('/prayer-requests')
  return response.data
}
