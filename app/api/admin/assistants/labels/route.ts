import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createLabel, getAllLabels } from "@/db/assistants"
import { cookies } from "next/headers"

export async function GET() {
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

    // Fetch all labels
    try {
      const labels = await getAllLabels()
      return NextResponse.json(labels)
    } catch (error) {
      console.error("Error fetching labels:", error)
      return NextResponse.json(
        { error: "Failed to fetch labels" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Error in labels API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
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

    // Create the label
    try {
      const label = await createLabel(body.name.trim())
      return NextResponse.json(label)
    } catch (error) {
      console.error("Error creating label:", error)
      return NextResponse.json(
        { error: "Failed to create label" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Error in create label API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
