import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

/**
 * API route for deleting a document set
 * DELETE /api/admin/document-set/[id]
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

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

    // First, mark the document set as not up to date (to indicate it's being deleted)
    const { error: updateError } = await supabase
      .from("document_sets")
      .update({ is_up_to_date: false })
      .eq("id", id)

    if (updateError) {
      console.error("Error marking document set for deletion:", updateError)
      return NextResponse.json(
        {
          message: "Failed to mark document set for deletion",
          detail: updateError.message
        },
        { status: 500 }
      )
    }

    // Remove connector pairs
    const { error: deleteConnectorError } = await supabase
      .from("connector_document_set")
      .delete()
      .eq("document_set_id", id)

    if (deleteConnectorError) {
      console.error("Error removing connector pairs:", deleteConnectorError)
      return NextResponse.json(
        {
          message: "Failed to remove connector pairs",
          detail: deleteConnectorError.message
        },
        { status: 500 }
      )
    }

    // Remove users
    const { error: deleteUserError } = await supabase
      .from("document_set_users")
      .delete()
      .eq("document_set_id", id)

    if (deleteUserError) {
      console.error("Error removing users:", deleteUserError)
      return NextResponse.json(
        { message: "Failed to remove users", detail: deleteUserError.message },
        { status: 500 }
      )
    }

    // Remove groups
    const { error: deleteGroupError } = await supabase
      .from("document_set_groups")
      .delete()
      .eq("document_set_id", id)

    if (deleteGroupError) {
      console.error("Error removing groups:", deleteGroupError)
      return NextResponse.json(
        {
          message: "Failed to remove groups",
          detail: deleteGroupError.message
        },
        { status: 500 }
      )
    }

    // Delete the document set
    const { error } = await supabase.from("document_sets").delete().eq("id", id)

    if (error) {
      console.error("Error deleting document set:", error)
      return NextResponse.json(
        { message: "Failed to delete document set", detail: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in document set deletion API:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
