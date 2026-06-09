import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ErrorCode } from '@/constants/error'
import { REQUEST_CANCELED_CODE, type ApiError } from './api'

type UseFetchState<T> = {
  data: T | null
  loading: boolean
  error: ApiError | null
}

type QueryKey = readonly unknown[]

type Fetcher<T> = (signal: AbortSignal) => Promise<T>

type UseFetchOptions<T> = {
  onStart?: () => void
  onError?: (error: ApiError) => void
  onSuccess?: (data: T) => void
}

function toApiError(error: unknown): ApiError {
  const apiError = error as Partial<ApiError> | undefined

  return {
    status: typeof apiError?.status === 'number' ? apiError.status : 0,
    code: typeof apiError?.code === 'string' ? apiError.code : ErrorCode.Unknown,
    message: typeof apiError?.message === 'string' ? apiError.message : 'Something went wrong',
    details: apiError?.details
  }
}

function isCanceledRequest(error: ApiError, signal: AbortSignal): boolean {
  return error.code === REQUEST_CANCELED_CODE || signal.aborted
}

export function useFetch<T>(queryKey: QueryKey, fetcher: Fetcher<T>, options?: UseFetchOptions<T>) {
  const abortRef = useRef<AbortController | null>(null)
  const fetcherRef = useRef(fetcher)
  const optionsRef = useRef(options)
  const key = useMemo(() => JSON.stringify(queryKey), [queryKey])
  const [state, setState] = useState<UseFetchState<T>>({
    data: null,
    loading: true,
    error: null
  })

  useEffect(() => {
    fetcherRef.current = fetcher
  }, [fetcher])

  useEffect(() => {
    optionsRef.current = options
  }, [options])

  const abort = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  const execute = useCallback(async () => {
    abortRef.current?.abort()

    const controller = new AbortController()
    abortRef.current = controller

    try {
      setState((prev) => ({
        ...prev,
        loading: true,
        error: null
      }))
      optionsRef.current?.onStart?.()

      const data = await fetcherRef.current(controller.signal)

      if (controller.signal.aborted || abortRef.current !== controller) {
        return
      }

      setState({
        data,
        loading: false,
        error: null
      })

      optionsRef.current?.onSuccess?.(data)
      return data
    } catch (error) {
      const apiError = toApiError(error)

      if (isCanceledRequest(apiError, controller.signal) || abortRef.current !== controller) {
        return
      }

      setState({
        data: null,
        loading: false,
        error: apiError
      })
      optionsRef.current?.onError?.(apiError)
    }
  }, [])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void execute()
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
      abort()
    }
  }, [abort, execute, key])

  return {
    ...state,
    refetch: execute,
    abort
  }
}
