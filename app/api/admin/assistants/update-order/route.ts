import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function PATCH(req: NextRequest) {
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
    // Validate body
    if (!body.assistants || !Array.isArray(body.assistants)) {
      return NextResponse.json(
        {
          error:
            "Invalid request body. Expected an array of assistants with id and display_order"
        },
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
      // Update each assistant's display order
      for (const item of body.assistants) {
        const { id, display_order } = item

        if (!id) {
          throw new Error("Missing assistant id")
        }

        const { error } = await supabase
          .from("assistants")
          .update({ display_order })
          .eq("id", id)

        if (error) {
          throw error
        }
      }

      // Commit the transaction
      const { error: commitError } = await supabase.rpc("commit_transaction")

      if (commitError) {
        throw commitError
      }

      return NextResponse.json({ success: true })
    } catch (error) {
      // Rollback the transaction on error
      await supabase.rpc("rollback_transaction")

      console.error("Error updating assistant order:", error)
      return NextResponse.json(
        { error: "Failed to update assistant order" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Error in update assistant order API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
