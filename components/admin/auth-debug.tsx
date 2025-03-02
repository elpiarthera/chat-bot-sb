"use client"

import { useEffect, useState } from "react"

export function AuthDebugInfo() {
  const [authInfo, setAuthInfo] = useState<{
    isLoggedIn: boolean
    userId?: string
    role?: string
    error?: string
  }>({
    isLoggedIn: false
  })

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/admin/check-auth", {
          credentials: "include",
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache"
          }
        })

        if (!response.ok) {
          throw new Error(`Auth check failed: ${response.status}`)
        }

        const data = await response.json()
        setAuthInfo({
          isLoggedIn: true,
          userId: data.userId,
          role: data.role
        })
      } catch (err) {
        console.error("Auth debug error:", err)
        setAuthInfo({
          isLoggedIn: false,
          error: err instanceof Error ? err.message : "Unknown error"
        })
      }
    }

    checkAuth()
  }, [])

  if (!authInfo.error && authInfo.isLoggedIn) {
    return null // Don't show anything if auth is working
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg shadow-lg border border-red-200 dark:border-red-800 max-w-md">
      <h3 className="font-medium text-red-800 dark:text-red-400">
        Auth Debug Info
      </h3>
      <div className="mt-2 text-sm text-red-700 dark:text-red-300">
        <p>Status: {authInfo.isLoggedIn ? "Logged In" : "Not Logged In"}</p>
        {authInfo.userId && <p>User ID: {authInfo.userId}</p>}
        {authInfo.role && <p>Role: {authInfo.role}</p>}
        {authInfo.error && <p>Error: {authInfo.error}</p>}
      </div>
    </div>
  )
}
