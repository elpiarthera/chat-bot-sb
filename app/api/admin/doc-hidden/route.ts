import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

/**
 * API route for updating document hidden status
 * POST /api/admin/doc-hidden
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
    const { document_id, hidden } = body

    if (!document_id) {
      return NextResponse.json(
        { message: "Missing document_id" },
        { status: 400 }
      )
    }

    if (typeof hidden !== "boolean") {
      return NextResponse.json(
        { message: "Hidden status must be a boolean" },
        { status: 400 }
      )
    }

    // Update the document hidden status in the database
    const { error } = await supabase
      .from("documents")
      .update({ hidden })
      .eq("id", document_id)

    if (error) {
      console.error("Error updating document hidden status:", error)
      return NextResponse.json(
        {
          message: "Failed to update document hidden status",
          detail: error.message
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in doc-hidden API:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
