import { Component, type ErrorInfo, type ReactNode } from 'react'
import { notify } from '@/utils/notify'
import ErrorFallback from './ErrorFallback'

type ErrorBoundaryProps = {
  children: ReactNode
  fallback?: (error: Error, resetError: () => void) => ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

type ErrorBoundaryState = {
  error: Error | null
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    error: null
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.props.onError?.(error, errorInfo)
    notify.error({
      title: 'Unexpected application error',
      description: error.message || 'Please try again.',
      duration: 6000
    })
  }

  private resetError = () => {
    this.setState({ error: null })
  }

  public render() {
    const { children, fallback } = this.props
    const { error } = this.state

    if (error) {
      return fallback ? fallback(error, this.resetError) : <ErrorFallback error={error} onReset={this.resetError} />
    }

    return children
  }
}
