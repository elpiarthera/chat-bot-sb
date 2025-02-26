"use client"

import React, { Component, ErrorInfo, ReactNode } from "react"

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null
    }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error: error
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You can also log the error to an error reporting service
    console.error("ErrorBoundary caught an error:", error, errorInfo)
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        this.props.fallback || (
          <div className="rounded border border-red-500 bg-red-100 p-4 text-red-700">
            <h2 className="mb-2 text-lg font-bold">Something went wrong</h2>
            <p className="mb-2">The application encountered an error:</p>
            <pre className="overflow-auto rounded bg-red-50 p-2 text-sm">
              {this.state.error?.message || "Unknown error"}
            </pre>
            <button
              className="mt-4 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
              onClick={() => {
                // Clear any cached data
                try {
                  localStorage.clear()
                  sessionStorage.clear()
                  // Reload the page
                  window.location.reload()
                } catch (e) {
                  console.error("Failed to clear storage:", e)
                }
              }}
            >
              Clear Cache & Reload
            </button>
          </div>
        )
      )
    }

    return this.props.children
  }
}
