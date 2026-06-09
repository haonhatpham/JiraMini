import api from '@/api/api'
import { routes } from '@/constants/route'

export type UserResponse = {
  id: string
  email: string
  name: string
  avatarUrl: string | null
}

type ListUsersResponse = {
  data: UserResponse[]
}

type RequestOptions = {
  signal?: AbortSignal
}

async function listUsers(options?: RequestOptions): Promise<UserResponse[]> {
  const response = await api.get<ListUsersResponse>(routes.users.list, {
    signal: options?.signal
  })

  return response.data
}

export const userService = {
  listUsers
}
