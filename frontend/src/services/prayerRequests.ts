import api from './api'

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
export type CreatePrayerRequestRequest = {
  title: string
  description?: string
  category: number
  priority: number
}

export async function getPrayerRequestsByPerson(
  personId: string,
): Promise<PrayerRequest[]> {
  const response = await api.get(`/people/${personId}/prayer-requests`)
  return response.data
}

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