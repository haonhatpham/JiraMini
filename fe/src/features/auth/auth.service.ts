import api from '@/api/api'
import { routes } from '@/constants/route'
import type { AuthDetailResponse, AuthResponseDto, LoginInput, RegisterInput } from '@jiramini/shared/auth'

async function login(input: LoginInput): Promise<AuthResponseDto> {
  const response = await api.post<AuthDetailResponse>(routes.auth.login, input)

  return response.data
}

async function register(input: RegisterInput): Promise<AuthResponseDto> {
  const response = await api.post<AuthDetailResponse>(routes.auth.register, input)

  return response.data
}

export const authService = {
  login,
  register
}
