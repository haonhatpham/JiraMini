import { create } from 'zustand'
import api from '@/api/api'
import type { AuthResponseDto, AuthUserDto } from '@jiramini/shared/auth'

const AUTH_USER_STORAGE_KEY = 'jiramini_auth_user'

type AuthTokenPayload = {
  sub?: string
  email?: string
}

function decodeBase64Url(value: string): string {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
  const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')

  return window.atob(paddedBase64)
}

function getUserFromAccessToken(token: string | null): AuthUserDto | null {
  if (!token) {
    return null
  }

  try {
    const [, payload] = token.split('.')
    const parsedPayload = JSON.parse(decodeBase64Url(payload)) as AuthTokenPayload

    if (!parsedPayload.sub || !parsedPayload.email) {
      return null
    }

    return {
      id: parsedPayload.sub,
      email: parsedPayload.email,
      name: parsedPayload.email,
      avatarUrl: null,
      createdAt: new Date(0).toISOString()
    }
  } catch {
    return null
  }
}

function getStoredUser(): AuthUserDto | null {
  const rawUser = window.localStorage.getItem(AUTH_USER_STORAGE_KEY)

  if (!rawUser) {
    return null
  }

  try {
    return JSON.parse(rawUser) as AuthUserDto
  } catch {
    window.localStorage.removeItem(AUTH_USER_STORAGE_KEY)
    return null
  }
}

function setStoredUser(user: AuthUserDto): void {
  window.localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user))
}

function clearStoredUser(): void {
  window.localStorage.removeItem(AUTH_USER_STORAGE_KEY)
}

type AuthState = {
  accessToken: string | null
  user: AuthUserDto | null
  isAuthenticated: boolean
  setAuth: (auth: AuthResponseDto) => void
  setAccessToken: (token: string) => void
  setUser: (user: AuthUserDto | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: api.getAccessToken(),
  user: getStoredUser() ?? getUserFromAccessToken(api.getAccessToken()),
  isAuthenticated: api.hasAccessToken(),

  setAuth: (auth) => {
    api.setAccessToken(auth.accessToken)
    setStoredUser(auth.user)

    set({
      accessToken: auth.accessToken,
      user: auth.user,
      isAuthenticated: true
    })
  },

  setAccessToken: (token) => {
    api.setAccessToken(token)

    set({
      accessToken: token,
      isAuthenticated: true
    })
  },

  setUser: (user) => {
    if (user) {
      setStoredUser(user)
    } else {
      clearStoredUser()
    }

    set({ user })
  },

  logout: () => {
    api.clearAccessToken()
    clearStoredUser()

    set({
      accessToken: null,
      user: null,
      isAuthenticated: false
    })
  }
}))
