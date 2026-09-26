import api from './api'

export type Person = {
  id: string
  firstName: string
  lastName: string | null
  relationship: string | null
  notes: string | null
  createdAt: string
  updatedAt: string | null
}
export type CreatePersonRequest = {
  firstName: string
  lastName?: string
  relationship: number
  notes?: string
}

export async function getPeople(): Promise<Person[]> {
  const response = await api.get('/people')
  return response.data
}

export async function getPerson(id: string): Promise<Person> {
  const response = await api.get(`/people/${id}`)
  return response.data
}

export async function createPerson(
  person: CreatePersonRequest,
): Promise<Person> {
  const response = await api.post('/people', person)
  return response.data
}