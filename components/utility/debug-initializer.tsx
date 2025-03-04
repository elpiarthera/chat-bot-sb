"use client"

export default function DebugInitializer() {
  // This code will only run on the client
  console.log("🔍 DebugInitializer: Application starting up")

  // Add a global error handler
  if (typeof window !== "undefined") {
    window.onerror = function (message, source, lineno, colno, error) {
      console.error("🚨 Global error caught:", {
        message,
        source,
        lineno,
        colno
      })
      if (error) {
        console.error("Error details:", error)
      }
      return false
    }

    // Also handle unhandled promise rejections
    window.addEventListener("unhandledrejection", function (event) {
      console.error("🚨 Unhandled Promise Rejection:", event.reason)
    })

    console.log("🔍 Global error handlers installed")

    // This is a diagnostic step - force clear any localStorage that might be causing issues
    try {
      console.log("Checking localStorage...")
      const keys = Object.keys(localStorage)
      console.log(`Found ${keys.length} localStorage items:`, keys)
    } catch (e) {
      console.error("Error accessing localStorage:", e)
    }
  }

  return null
}
