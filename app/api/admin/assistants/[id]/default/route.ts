import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient(cookies())
    // Verify admin access
    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (!profile || profile.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      )
    }

    // Get request body
    const { is_default } = await req.json()

    if (typeof is_default !== "boolean") {
      return NextResponse.json(
        { error: "is_default must be a boolean" },
        { status: 400 }
      )
    }

    // Begin transaction
    const { error: transactionError } = await supabase.rpc("begin_transaction")

    if (transactionError) {
      console.error("Error beginning transaction:", transactionError)
      return NextResponse.json(
        { error: "Failed to begin transaction" },
        { status: 500 }
      )
    }

    try {
      // If setting as default, clear default status from all other assistants
      if (is_default) {
        const { error: clearDefaultError } = await supabase
          .from("assistants")
          .update({ is_default: false })
          .neq("id", params.id)

        if (clearDefaultError) {
          throw clearDefaultError
        }
      }

      // Update the target assistant's default status
      const { error: updateError } = await supabase
        .from("assistants")
        .update({ is_default })
        .eq("id", params.id)

      if (updateError) {
        throw updateError
      }

      // Commit transaction
      const { error: commitError } = await supabase.rpc("commit_transaction")

      if (commitError) {
        throw commitError
      }

      return NextResponse.json({ success: true })
    } catch (error) {
      // Rollback transaction on error
      await supabase.rpc("rollback_transaction")

      console.error("Error updating assistant default status:", error)
      return NextResponse.json(
        { error: "Failed to update assistant default status" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Error in update assistant default API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
