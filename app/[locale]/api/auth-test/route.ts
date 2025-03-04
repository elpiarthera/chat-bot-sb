import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const cookieStore = cookies()

    // Log all cookies for debugging
    const allCookies = cookieStore.getAll()
    console.log(
      "All cookies:",
      allCookies.map(c => `${c.name}=${c.value}`)
    )

    // Create Supabase client
    const supabase = createClient(cookieStore)

    // Check session
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      console.error("Error getting session:", error.message)
      return NextResponse.json(
        {
          error: error.message,
          cookies: allCookies.map(c => ({ name: c.name, value: c.value }))
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      authenticated: !!data.session,
      session: data.session
        ? {
            user: {
              id: data.session.user.id,
              email: data.session.user.email
            },
            expires_at: data.session.expires_at
          }
        : null,
      cookies: allCookies.map(c => ({ name: c.name }))
    })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
