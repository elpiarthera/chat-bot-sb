import { getAssistantById } from "@/db/assistants"
import { NextResponse } from "next/server"
import { getServerProfile } from "@/lib/server/server-chat-helpers"

export async function GET(
  request: Request,
  { params }: { params: { assistantid: string } }
) {
  try {
    const profile = await getServerProfile()
    if (!profile) {
      return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
        status: 401
      })
    }

    const assistant = await getAssistantById(params.assistantid)
    if (!assistant) {
      return new NextResponse(
        JSON.stringify({ message: "Assistant not found" }),
        { status: 404 }
      )
    }

    // Verify assistant belongs to user
    if (assistant.user_id !== profile.user_id) {
      return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
        status: 401
      })
    }

    return new NextResponse(JSON.stringify(assistant), { status: 200 })
  } catch (error: any) {
    console.error("Error fetching assistant:", error)
    return new NextResponse(
      JSON.stringify({ message: error.message || "Internal Server Error" }),
      { status: 500 }
    )
  }
}
