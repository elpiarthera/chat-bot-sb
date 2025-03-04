import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    // Get all cookies for debugging
    const cookieStore = cookies()
    const allCookies = cookieStore.getAll()
    const cookieNames = allCookies.map(cookie => cookie.name)

    // Check for Supabase specific cookies
    const supabaseCookies = allCookies.filter(
      cookie => cookie.name.includes("supabase") || cookie.name.includes("sb-")
    )

    // Create Supabase client
    const supabase = createClient(cookieStore)

    // Get session
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      return NextResponse.json(
        {
          status: "error",
          error: error.message,
          cookies: {
            count: cookieNames.length,
            names: cookieNames,
            supabaseCookies: supabaseCookies.map(c => c.name)
          }
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      status: "success",
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
      cookies: {
        count: cookieNames.length,
        names: cookieNames,
        supabaseCookies: supabaseCookies.map(c => c.name)
      }
    })
  } catch (error) {
    console.error("Auth status check error:", error)
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
