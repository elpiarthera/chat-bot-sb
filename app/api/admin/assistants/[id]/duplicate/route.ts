import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAssistant, getAssistantById } from "@/db/assistants"
import { cookies } from "next/headers"

export async function POST(
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

    // Get assistant to duplicate
    try {
      const sourceAssistant = await getAssistantById(params.id)
      // Get current workspace
      const { data: workspaceData } = await supabase
        .from("workspaces")
        .select("id")
        .eq("is_primary", true)
        .limit(1)
        .single()

      if (!workspaceData) {
        return NextResponse.json(
          { error: "No primary workspace found" },
          { status: 500 }
        )
      }

      // Create new assistant data
      const newAssistantData = {
        user_id: user.id,
        name: `${sourceAssistant.name} (Copy)`,
        description: sourceAssistant.description,
        prompt: sourceAssistant.prompt,
        model: sourceAssistant.model,
        temperature: sourceAssistant.temperature,
        context_length: sourceAssistant.context_length,
        include_profile_context: sourceAssistant.include_profile_context,
        include_workspace_instructions:
          sourceAssistant.include_workspace_instructions,
        is_visible: false, // Set to false by default for safety
        is_default: false, // Never set a copy as default
        sharing: sourceAssistant.sharing,
        embeddings_provider: sourceAssistant.embeddings_provider,
        image_path: sourceAssistant.image_path
      }

      // Create new assistant
      const newAssistant = await createAssistant(
        newAssistantData,
        workspaceData.id
      )
      // Copy assistant files, collections, and tools if they exist
      try {
        // Get assistant files
        const { data: assistantFiles } = await supabase
          .from("assistant_files")
          .select("file_id")
          .eq("assistant_id", params.id)

        if (assistantFiles && assistantFiles.length > 0) {
          const newAssistantFiles = assistantFiles.map(
            (item: { file_id: string }) => ({
              user_id: user.id,
              assistant_id: newAssistant.id,
              file_id: item.file_id
            })
          )

          await supabase.from("assistant_files").insert(newAssistantFiles)
        }

        // Get assistant collections
        const { data: assistantCollections } = await supabase
          .from("assistant_collections")
          .select("collection_id")
          .eq("assistant_id", params.id)

        if (assistantCollections && assistantCollections.length > 0) {
          const newAssistantCollections = assistantCollections.map(
            (item: { collection_id: string }) => ({
              user_id: user.id,
              assistant_id: newAssistant.id,
              collection_id: item.collection_id
            })
          )

          await supabase
            .from("assistant_collections")
            .insert(newAssistantCollections)
        }

        // Get assistant tools
        const { data: assistantTools } = await supabase
          .from("assistant_tools")
          .select("tool_id")
          .eq("assistant_id", params.id)

        if (assistantTools && assistantTools.length > 0) {
          const newAssistantTools = assistantTools.map(
            (item: { tool_id: string }) => ({
              user_id: user.id,
              assistant_id: newAssistant.id,
              tool_id: item.tool_id
            })
          )

          await supabase.from("assistant_tools").insert(newAssistantTools)
        }
      } catch (relationError) {
        console.error("Error copying assistant relations:", relationError)
        // Continue without failing - the assistant copy is still created
      }

      return NextResponse.json(newAssistant)
    } catch (error) {
      console.error("Error duplicating assistant:", error)
      return NextResponse.json(
        { error: "Failed to duplicate assistant" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Error in duplicate assistant API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
