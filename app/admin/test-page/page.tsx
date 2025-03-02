"use client"

import { useState, useEffect } from "react"

export default function TestPage() {
  const [status, setStatus] = useState("Loading...")

  useEffect(() => {
    // Simple text to display on mount
    setStatus("Test page loaded")
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Test Page</h1>
      <p className="mt-4">{status}</p>

      <div className="mt-4">
        <a href="/admin" className="text-blue-500 hover:underline">
          Return to admin
        </a>
      </div>
    </div>
  )
}
