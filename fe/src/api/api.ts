import axios, {
  AxiosHeaders,
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig
} from 'axios'
import { ErrorCode } from '@/constants/error'
import { routes } from '@/constants/route'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001/v1/api'
const API_TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT_MS) || 10_000
const ACCESS_TOKEN_STORAGE_KEY = 'jiramini_access_token'

export const REQUEST_CANCELED_CODE = ErrorCode.RequestCanceled

export type ApiErrorDetail = {
  field: string
  message: string
}

export type ApiErrorResponse = {
  error?: {
    code?: string
    message?: string
    details?: ApiErrorDetail[]
  }
}

export type ApiError = {
  status: number
  code: string
  message: string
  details?: ApiErrorDetail[]
}

function getStoredAccessToken(): string | null {
  return window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)
}

function setStoredAccessToken(token: string): void {
  window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token)
}

function clearStoredAccessToken(): void {
  window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
}

function ensureAxiosHeaders(config: InternalAxiosRequestConfig): AxiosHeaders {
  const headers = AxiosHeaders.from(config.headers)
  config.headers = headers

  return headers
}

function isAuthRequest(url?: string): boolean {
  return Boolean(url?.includes(routes.auth.login) || url?.includes(routes.auth.register))
}

function normalizeApiError(error: AxiosError<ApiErrorResponse>): ApiError {
  if (axios.isCancel(error)) {
    return {
      status: 499,
      code: REQUEST_CANCELED_CODE,
      message: error.message || 'Request canceled'
    }
  }

  const status = error.response?.status ?? 0
  const apiError = error.response?.data?.error

  return {
    status,
    code: apiError?.code ?? ErrorCode.Unknown,
    message: apiError?.message ?? error.message ?? 'Something went wrong',
    details: apiError?.details
  }
}

class ApiClient {
  private readonly instance: AxiosInstance

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT_MS,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    })

    this.initializeRequestInterceptor()
    this.initializeResponseInterceptor()
  }

  public setAccessToken(token: string): void {
    setStoredAccessToken(token)
  }

  public clearAccessToken(): void {
    clearStoredAccessToken()
  }

  public hasAccessToken(): boolean {
    return getStoredAccessToken() !== null
  }

  public getAccessToken(): string | null {
    return getStoredAccessToken()
  }

  public async get<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.get<T>(path, config)
    return response.data
  }

  public async post<T>(path: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.post<T>(path, data, config)
    return response.data
  }

  public async put<T>(path: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.put<T>(path, data, config)
    return response.data
  }

  public async patch<T>(path: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.patch<T>(path, data, config)
    return response.data
  }

  public async delete<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.delete<T>(path, config)
    return response.data
  }

  private initializeRequestInterceptor(): void {
    this.instance.interceptors.request.use(
      (config) => {
        const headers = ensureAxiosHeaders(config)
        const token = getStoredAccessToken()

        if (token) {
          headers.set('Authorization', `Bearer ${token}`)
        }

        return config
      },
      (error) => Promise.reject(error)
    )
  }

  private initializeResponseInterceptor(): void {
    this.instance.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiErrorResponse>) => {
        const normalizedError = normalizeApiError(error)

        if (
          error.response?.status === 401 &&
          !isAuthRequest(error.config?.url) &&
          (normalizedError.code === ErrorCode.TokenExpired || normalizedError.code === ErrorCode.InvalidToken)
        ) {
          clearStoredAccessToken()
        }

        return Promise.reject(normalizedError)
      }
    )
  }
}

export const api = new ApiClient()
export default api
