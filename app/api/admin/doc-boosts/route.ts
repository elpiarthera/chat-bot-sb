import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

/**
 * API route for updating document boost scores
 * POST /api/admin/doc-boosts
 */
export async function POST(req: NextRequest) {
  try {
    // Check authentication and admin status
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    const {
      data: { session }
    } = await supabase.auth.getSession()

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Check if user is an admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", session.user.id)
      .single()

    if (!profile || profile.role !== "admin") {
      return NextResponse.json(
        { message: "Forbidden: Admin access required" },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await req.json()
    const { document_id, boost } = body

    if (!document_id) {
      return NextResponse.json(
        { message: "Missing document_id" },
        { status: 400 }
      )
    }

    if (typeof boost !== "number") {
      return NextResponse.json(
        { message: "Boost must be a number" },
        { status: 400 }
      )
    }

    // Update the document boost in the database
    const { error } = await supabase
      .from("documents")
      .update({ boost })
      .eq("id", document_id)

    if (error) {
      console.error("Error updating document boost:", error)
      return NextResponse.json(
        { message: "Failed to update document boost", detail: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in doc-boosts API:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
