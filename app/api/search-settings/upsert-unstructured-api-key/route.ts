import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

// Simple implementation of getProfile function
async function getProfile(supabase: any) {
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  return data
}

export async function PUT(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    const profile = await getProfile(supabase)

    if (!profile) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      )
    }

    // Get the API key from the URL parameters
    const url = new URL(request.url)
    const unstructuredApiKey = url.searchParams.get("unstructured_api_key")

    if (!unstructuredApiKey) {
      return NextResponse.json(
        { error: "API key is required" },
        { status: 400 }
      )
    }

    // Check if a settings record already exists for this user
    const { data: existingSettings } = await supabase
      .from("settings")
      .select("id")
      .eq("user_id", profile.id)
      .single()

    let result

    if (existingSettings) {
      // Update existing settings
      result = await supabase
        .from("settings")
        .update({ unstructured_api_key: unstructuredApiKey })
        .eq("user_id", profile.id)
    } else {
      // Insert new settings
      result = await supabase
        .from("settings")
        .insert([
          { user_id: profile.id, unstructured_api_key: unstructuredApiKey }
        ])
    }

    if (result.error) {
      console.error("Error saving Unstructured API key:", result.error)
      return NextResponse.json(
        { error: "Failed to save API key" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving Unstructured API key:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
