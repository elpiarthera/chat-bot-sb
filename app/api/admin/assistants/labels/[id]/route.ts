import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { deleteLabel } from "@/db/assistants"
import { cookies } from "next/headers"

export async function DELETE(
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

    // Delete the label
    try {
      await deleteLabel(params.id)
      return NextResponse.json({ success: true })
    } catch (error) {
      console.error("Error deleting label:", error)
      return NextResponse.json(
        { error: "Failed to delete label" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Error in delete label API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

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
    // Validate required fields
    if (
      !body.name ||
      typeof body.name !== "string" ||
      body.name.trim() === ""
    ) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    // Update the label
    try {
      const { data, error } = await supabase
        .from("assistant_labels")
        .update({ name: body.name.trim() })
        .eq("id", params.id)
        .select("*")
        .single()

      if (error) {
        throw new Error(error.message)
      }

      return NextResponse.json(data)
    } catch (error) {
      console.error("Error updating label:", error)
      return NextResponse.json(
        { error: "Failed to update label" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Error in update label API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
