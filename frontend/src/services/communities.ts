
import api from './api'

export type CommunityRole = 0 | 1 | 2
export type CommunityMemberStatus = 0 | 1 | 2 | 3

export interface Community {
  id: string
  name: string
  description?: string | null
  imageUrl?: string | null
  createdByUserId?: string
  isActive?: boolean
  role?: CommunityRole
  status?: CommunityMemberStatus
}

export interface CommunityMember {
  userId: string
  communityId: string
  role: CommunityRole
  status: CommunityMemberStatus
  joinedAt?: string
  firstName?: string
  lastName?: string
  email?: string
}

export interface CommunityPrayerRequest {
  id: string
  communityId: string
  authorUserId: string
  title: string
  description: string
  category: number
  status: number
  answeredAt: string | null
  isHidden: boolean
  createdAt: string
  updatedAt: string
  lastEditedAt?: string | null
}

export interface CreateCommunityPrayerRequest {
  title: string
  description: string
  category: number
}

export interface PrayerStats {
  communityId: string
  requestId: string
  totalPrayers: number
  peopleWhoPrayed: number
  myPrayers: number
  lastPrayedAt: string | null
}

export interface CommunityPrayerRecord {
  id: string
  prayedAt: string
  createdAt: string
}

export interface RecordCommunityPrayerResponse {
  message: string
  prayerId: string
  prayedAt: string
  totalPrayers: number
  myPrayers: number
}

export async function getMyCommunities(): Promise<Community[]> {
  const response = await api.get<Community[]>('/communities')
  return response.data
}

export async function getCommunity(
  communityId: string,
): Promise<Community> {
  const response = await api.get<Community>(
    `/communities/${communityId}`,
  )

  return response.data
}

export async function getCommunityMembers(
  communityId: string,
): Promise<CommunityMember[]> {
  const response = await api.get<CommunityMember[]>(
    `/communities/${communityId}/members`,
  )

  return response.data
}

export async function getCommunityPrayerRequests(
  communityId: string,
): Promise<CommunityPrayerRequest[]> {
  const response = await api.get<CommunityPrayerRequest[]>(
    `/communities/${communityId}/prayer-requests`,
  )

  return response.data
}

export async function getCommunityPrayerRequest(
  communityId: string,
  requestId: string,
): Promise<CommunityPrayerRequest> {
  const response = await api.get<CommunityPrayerRequest>(
    `/communities/${communityId}/prayer-requests/${requestId}`,
  )

  return response.data
}

export async function createCommunityPrayerRequest(
  communityId: string,
  data: CreateCommunityPrayerRequest,
): Promise<CommunityPrayerRequest> {
  const response = await api.post<CommunityPrayerRequest>(
    `/communities/${communityId}/prayer-requests`,
    data,
  )

  return response.data
}

export async function getCommunityPrayerStats(
  communityId: string,
  requestId: string,
): Promise<PrayerStats> {
  const response = await api.get<PrayerStats>(
    `/communities/${communityId}/prayer-requests/${requestId}/prayers/stats`,
  )

  return response.data
}

export async function recordCommunityPrayer(
  communityId: string,
  requestId: string,
): Promise<RecordCommunityPrayerResponse> {
  const response = await api.post<RecordCommunityPrayerResponse>(
    `/communities/${communityId}/prayer-requests/${requestId}/prayers`,
  )

  return response.data
}

export async function getMyCommunityPrayerHistory(
  communityId: string,
  requestId: string,
): Promise<CommunityPrayerRecord[]> {
  const response = await api.get<CommunityPrayerRecord[]>(
    `/communities/${communityId}/prayer-requests/${requestId}/prayers/mine`,
  )

  return response.data
}
