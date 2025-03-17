import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { 
      hasError: false,
      error: null
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }
      return (
        <div className="error-container" style={{ padding: 20, margin: 10, border: '1px solid #f44336', borderRadius: 4 }}>
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message || 'Unknown error'}</p>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
