import { Database } from "@/supabase/types"
import { createBrowserClient } from "@supabase/ssr"

// Create Supabase client with proper error handling
export const createSupabaseBrowserClient = () => {
  // Ensure environment variables are available
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      "Supabase URL or Anon Key is missing. Authentication will not work properly."
    )

    // For development purposes, provide more detailed logging
    if (!supabaseUrl) console.error("Missing NEXT_PUBLIC_SUPABASE_URL")
    if (!supabaseAnonKey) console.error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY")

    // Create a dummy client or one with fallback values depending on your needs
    // This will at least prevent crashes but authentication won't work
    return createBrowserClient<Database>(
      supabaseUrl || "https://placeholder-url.supabase.co",
      supabaseAnonKey || "placeholder-key",
      {
        auth: {
          persistSession: false // Don't persist invalid sessions
        },
        global: {
          // Add request handling to log issues
          fetch: (url, options) => {
            console.warn(
              "Making Supabase request with invalid configuration:",
              url
            )
            return fetch(url, options)
          }
        }
      }
    )
  }

  try {
    // Initialize with proper config and error handling
    return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      },
      global: {
        // Add request handler to debug API key issues
        fetch: (url, options = {}) => {
          // Add logging for debugging in development
          if (process.env.NODE_ENV === "development") {
            // Convert URL to string for safe checking
            const urlString = url.toString()

            const hasApiKey =
              (options.headers && (options.headers as any)["apikey"]) ||
              urlString.includes("apikey=")

            if (!hasApiKey && !urlString.includes("auth/v1")) {
              console.warn("Supabase request without API key:", urlString)
            }
          }
          return fetch(url, options)
        }
      }
    })
  } catch (error) {
    console.error("Failed to initialize Supabase client:", error)
    throw error
  }
}

// Create a singleton instance
export const supabase = createSupabaseBrowserClient()
