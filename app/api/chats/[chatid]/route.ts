import { getChatById } from "@/db/chats"
import { NextResponse } from "next/server"
import { getServerProfile } from "@/lib/server/server-chat-helpers"

export async function GET(
  request: Request,
  { params }: { params: { chatid: string } }
) {
  try {
    const profile = await getServerProfile()
    if (!profile) {
      return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
        status: 401
      })
    }

    const chat = await getChatById(params.chatid)
    if (!chat) {
      return new NextResponse(JSON.stringify({ message: "Chat not found" }), {
        status: 404
      })
    }

    // Verify chat belongs to user
    if (chat.user_id !== profile.user_id) {
      return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
        status: 401
      })
    }

    return new NextResponse(JSON.stringify(chat), { status: 200 })
  } catch (error: any) {
    console.error("Error fetching chat:", error)
    return new NextResponse(
      JSON.stringify({ message: error.message || "Internal Server Error" }),
      { status: 500 }
    )
  }
}
