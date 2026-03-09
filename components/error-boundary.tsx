'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
          <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
            <AlertTriangle className="w-12 h-12 text-red-600 dark:text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Algo salió mal
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md">
            Lo sentimos, ha ocurrido un error inesperado. Por favor, intenta recargar la página.
          </p>
          <Button 
            onClick={() => window.location.reload()}
            className="flex items-center gap-2"
          >
            <RefreshCcw className="w-4 h-4" />
            Recargar aplicación
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
