import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    // Get auth status
    const {
      data: { session }
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { status: "unauthenticated", message: "No session found" },
        { status: 401 }
      )
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single()

    if (profileError) {
      return NextResponse.json(
        {
          status: "error",
          message: "Failed to fetch profile",
          error: profileError.message
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      status: "authenticated",
      userId: session.user.id,
      role: profile?.role,
      isAdmin: profile?.role === "admin"
    })
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Server error during authentication check",
        error: String(error)
      },
      { status: 500 }
    )
  }
}
