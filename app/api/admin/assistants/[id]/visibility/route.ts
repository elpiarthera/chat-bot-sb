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
    const { is_visible } = await req.json()

    if (typeof is_visible !== "boolean") {
      return NextResponse.json(
        { error: "is_visible must be a boolean" },
        { status: 400 }
      )
    }

    // Update assistant visibility
    const { error } = await supabase
      .from("assistants")
      .update({ is_visible })
      .eq("id", params.id)

    if (error) {
      console.error("Error updating assistant visibility:", error)
      return NextResponse.json(
        { error: "Failed to update assistant visibility" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in update assistant visibility API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
