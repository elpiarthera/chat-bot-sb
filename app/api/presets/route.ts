import { getPresetWorkspacesByWorkspaceId } from "@/db/presets"
import { getServerProfile } from "@/lib/server/server-chat-helpers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const profile = await getServerProfile()
    if (!profile) {
      return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
        status: 401
      })
    }

    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get("workspaceId")

    if (!workspaceId) {
      return new NextResponse(
        JSON.stringify({ message: "Workspace ID required" }),
        { status: 400 }
      )
    }

    const workspace = await getPresetWorkspacesByWorkspaceId(workspaceId)

    return new NextResponse(JSON.stringify(workspace.presets), { status: 200 })
  } catch (error: any) {
    console.error("Error fetching presets:", error)
    return new NextResponse(
      JSON.stringify({ message: error.message || "Internal Server Error" }),
      { status: 500 }
    )
  }
}
