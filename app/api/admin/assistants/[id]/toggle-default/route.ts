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
    const body = await req.json()
    // Validate is_default is a boolean
    if (typeof body.is_default !== "boolean") {
      return NextResponse.json(
        { error: "is_default must be a boolean" },
        { status: 400 }
      )
    }

    // Begin a transaction
    const { error: beginError } = await supabase.rpc("begin_transaction")

    if (beginError) {
      console.error("Error beginning transaction:", beginError)
      return NextResponse.json(
        { error: "Failed to begin transaction" },
        { status: 500 }
      )
    }

    try {
      // If setting as default, clear other defaults
      if (body.is_default) {
        const { error: updateAllError } = await supabase
          .from("assistants")
          .update({ is_default: false })
          .neq("id", params.id)

        if (updateAllError) {
          throw updateAllError
        }
      }

      // Update the specific assistant
      const { data, error } = await supabase
        .from("assistants")
        .update({ is_default: body.is_default })
        .eq("id", params.id)
        .select("*")
        .single()

      if (error) {
        throw error
      }

      // Commit the transaction
      const { error: commitError } = await supabase.rpc("commit_transaction")

      if (commitError) {
        throw commitError
      }

      return NextResponse.json(data)
    } catch (error) {
      // Rollback the transaction on error
      await supabase.rpc("rollback_transaction")

      console.error("Error updating assistant default status:", error)
      return NextResponse.json(
        { error: "Failed to update assistant default status" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Error in toggle default API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
