import { createClient } from "@/lib/supabase/server"
import { getServerProfile } from "@/lib/server/server-chat-helpers"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function DELETE() {
  try {
    const profile = await getServerProfile()
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Update the settings to remove the API key
    const { error } = await supabase
      .from("settings")
      .update({ unstructured_api_key: null })
      .eq("user_id", profile.user_id)

    if (error) {
      console.error("Error deleting unstructured API key:", error)
      return NextResponse.json(
        { error: "Failed to delete API key" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in delete-unstructured-api-key route:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
