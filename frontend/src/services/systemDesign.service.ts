import type { User } from '@/features/SystemDesign/types'
import apiClient from './apiClient'

const EXAMPLE_API_BASE_URL = 'https://jsonplaceholder.typicode.com'

export const getUsers = async (): Promise<User[]> => {
  const { data } = await apiClient.get<User[]>('/users', {
    baseURL: EXAMPLE_API_BASE_URL,
  })
  return data
}
