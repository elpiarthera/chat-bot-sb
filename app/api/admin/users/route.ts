import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

// Mock user data for testing
const mockUsers = [
  { id: "user1", email: "user1@example.com", name: "User One" },
  { id: "user2", email: "user2@example.com", name: "User Two" },
  { id: "user3", email: "user3@example.com", name: "User Three" },
  { id: "user4", email: "user4@example.com", name: "User Four" },
  { id: "user5", email: "user5@example.com", name: "User Five" }
]

export async function GET() {
  // In a real implementation, fetch from database
  return NextResponse.json(mockUsers)
}

export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json()
    const { email, name, role, status } = requestData

    // Validate required fields
    if (!email || !name || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Create an authenticated Supabase client
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    // Verify admin privileges (same as GET method)
    const {
      data: { session }
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", session.user.id)
      .single()

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // In a real implementation, you would:
    // 1. Create the user in auth.users
    // 2. Create the profile in public.profiles
    // For this example, we'll just return a success message

    return NextResponse.json({
      success: true,
      message: "User created successfully"
    })
  } catch (error) {
    console.error("Error in admin users API:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
