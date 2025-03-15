import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

interface CreateClientOptions {
  admin?: boolean
}

export const createClient = (
  cookieStore: ReturnType<typeof cookies>,
  options?: CreateClientOptions
) => {
  // Use service role key for admin operations if requested
  const supabaseKey = options?.admin
    ? process.env.SUPABASE_SERVICE_ROLE_KEY!
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey,
    {
      cookies: {
        getAll: () => {
          return cookieStore.getAll().map(cookie => ({
            name: cookie.name,
            value: cookie.value
          }))
        },
        setAll: cookies => {
          // This is handled by middleware in Next.js
          // This function still needs to be implemented based on Supabase's recommendation
          // but will be no-op in server components
          return
        }
      }
    }
  )
}
