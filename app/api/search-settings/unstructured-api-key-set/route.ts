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

export async function GET() {
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

    const { data, error } = await supabase
      .from("settings")
      .select("unstructured_api_key")
      .eq("user_id", profile.id)
      .single()

    if (error) {
      console.error("Error fetching Unstructured API key:", error)
      return NextResponse.json(
        { error: "Failed to fetch API key status" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      unstructured_api_key: data?.unstructured_api_key ? true : false
    })
  } catch (error) {
    console.error("Error checking Unstructured API key:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
