import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import {
  deleteAssistant,
  getAssistantById,
  updateAssistant,
  updateAssistantLabels
} from "@/db/assistants"
import { cookies } from "next/headers"

export async function GET(
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

    // Get the assistant
    try {
      const assistant = await getAssistantById(params.id)
      // Get starter messages
      const { data: starterMessages } = await supabase
        .from("assistant_starter_messages")
        .select("*")
        .eq("assistant_id", params.id)
        .order("display_order", { ascending: true })

      // Get label assignments
      const { data: labelAssignments } = await supabase
        .from("assistant_label_assignments")
        .select("label_id")
        .eq("assistant_id", params.id)

      // Get label details if there are assignments
      let labels = []
      if (labelAssignments && labelAssignments.length > 0) {
        const labelIds = labelAssignments.map(
          (assignment: { label_id: string }) => assignment.label_id
        )

        const { data: labelsData } = await supabase
          .from("assistant_labels")
          .select("*")
          .in("id", labelIds)

        if (labelsData) {
          labels = labelsData
        }
      }

      // Add related data to the response
      const fullAssistant = {
        ...assistant,
        starter_messages: starterMessages || [],
        labels: labels
      }

      return NextResponse.json(fullAssistant)
    } catch (error) {
      console.error("Error getting assistant:", error)
      return NextResponse.json(
        { error: "Failed to get assistant" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Error in get assistant API:", error)
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
    const requiredFields = [
      "name",
      "description",
      "model",
      "prompt",
      "temperature",
      "context_length"
    ]
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Prepare assistant data
    const assistantData = {
      name: body.name,
      description: body.description,
      model: body.model,
      prompt: body.prompt,
      temperature: body.temperature,
      context_length: body.context_length,
      include_profile_context:
        body.include_profile_context !== undefined
          ? body.include_profile_context
          : false,
      include_workspace_instructions:
        body.include_workspace_instructions !== undefined
          ? body.include_workspace_instructions
          : false,
      is_visible: body.is_visible !== undefined ? body.is_visible : true,
      is_default: body.is_default !== undefined ? body.is_default : false,
      sharing: body.sharing || "private",
      embeddings_provider: body.embeddings_provider || "openai",
      image_path: body.image_path || ""
    }

    // Extract starter messages if provided
    const starterMessages = body.starter_messages || []
    // Update the assistant
    let updatedAssistant
    try {
      updatedAssistant = await updateAssistant(
        params.id,
        assistantData,
        starterMessages
      )
    } catch (error) {
      console.error("Error updating assistant:", error)
      return NextResponse.json(
        { error: "Failed to update assistant" },
        { status: 500 }
      )
    }

    // Handle label assignments if provided
    if (body.labels && Array.isArray(body.labels)) {
      try {
        await updateAssistantLabels(params.id, body.labels)
      } catch (labelError) {
        console.error("Error updating labels:", labelError)
        // Continue without failing - the assistant is still updated
      }
    }

    // Handle document sets if provided
    if (body.document_sets && Array.isArray(body.document_sets)) {
      try {
        // First delete existing associations
        await supabase
          .from("assistant_files")
          .delete()
          .eq("assistant_id", params.id)
        await supabase
          .from("assistant_collections")
          .delete()
          .eq("assistant_id", params.id)

        // Determine if each ID is a file or collection
        const fileIds = []
        const collectionIds = []
        for (const id of body.document_sets) {
          // Check if it's a file
          const { data: file } = await supabase
            .from("files")
            .select("id")
            .eq("id", id)
            .limit(1)
            .single()

          if (file) {
            fileIds.push(id)
            continue
          }

          // Check if it's a collection
          const { data: collection } = await supabase
            .from("collections")
            .select("id")
            .eq("id", id)
            .limit(1)
            .single()

          if (collection) {
            collectionIds.push(id)
          }
        }

        // Add files to assistant
        if (fileIds.length > 0) {
          const fileAssignments = fileIds.map(fileId => ({
            user_id: user.id,
            assistant_id: params.id,
            file_id: fileId
          }))

          await supabase.from("assistant_files").insert(fileAssignments)
        }

        // Add collections to assistant
        if (collectionIds.length > 0) {
          const collectionAssignments = collectionIds.map(collectionId => ({
            user_id: user.id,
            assistant_id: params.id,
            collection_id: collectionId
          }))

          await supabase
            .from("assistant_collections")
            .insert(collectionAssignments)
        }
      } catch (documentError) {
        console.error("Error updating documents:", documentError)
        // Continue without failing - the assistant is still updated
      }
    }

    // Handle tools if provided
    if (body.tools && Array.isArray(body.tools)) {
      try {
        // First delete existing associations
        await supabase
          .from("assistant_tools")
          .delete()
          .eq("assistant_id", params.id)

        // Add new associations
        if (body.tools.length > 0) {
          const toolAssignments = body.tools.map((toolId: string) => ({
            user_id: user.id,
            assistant_id: params.id,
            tool_id: toolId
          }))

          await supabase.from("assistant_tools").insert(toolAssignments)
        }
      } catch (toolError) {
        console.error("Error updating tools:", toolError)
        // Continue without failing - the assistant is still updated
      }
    }

    return NextResponse.json(updatedAssistant)
  } catch (error) {
    console.error("Error in update assistant API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

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

    // Delete the assistant
    try {
      await deleteAssistant(params.id)
      return NextResponse.json({ success: true })
    } catch (error) {
      console.error("Error deleting assistant:", error)
      return NextResponse.json(
        { error: "Failed to delete assistant" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Error in delete assistant API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
