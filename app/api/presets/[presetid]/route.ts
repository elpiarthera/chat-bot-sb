import { getPresetById } from "@/db/presets"
import { NextResponse } from "next/server"
import { getServerProfile } from "@/lib/server/server-chat-helpers"

export async function GET(
  request: Request,
  { params }: { params: { presetid: string } }
) {
  try {
    const profile = await getServerProfile()
    if (!profile) {
      return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
        status: 401
      })
    }

    const preset = await getPresetById(params.presetid)
    if (!preset) {
      return new NextResponse(JSON.stringify({ message: "Preset not found" }), {
        status: 404
      })
    }

    // Verify preset belongs to user
    if (preset.user_id !== profile.user_id) {
      return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
        status: 401
      })
    }

    return new NextResponse(JSON.stringify(preset), { status: 200 })
  } catch (error: any) {
    console.error("Error fetching preset:", error)
    return new NextResponse(
      JSON.stringify({ message: error.message || "Internal Server Error" }),
      { status: 500 }
    )
  }
}
