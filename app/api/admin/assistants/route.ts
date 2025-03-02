import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAssistant } from "@/db/assistants"
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

    // Fetch all assistants
    const { data: assistants, error } = await supabase
      .from("assistants")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching assistants:", error)
      return NextResponse.json(
        { error: "Failed to fetch assistants" },
        { status: 500 }
      )
    }

    return NextResponse.json(assistants)
  } catch (error) {
    console.error("Error in assistants API:", error)
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

    // Prepare assistant data
    const assistantData = {
      user_id: user.id,
      name: body.name,
      description: body.description,
      model: body.model,
      prompt: body.prompt,
      temperature: body.temperature,
      context_length: body.context_length,
      include_profile_context: body.include_profile_context || false,
      include_workspace_instructions:
        body.include_workspace_instructions || false,
      is_visible: body.is_visible !== undefined ? body.is_visible : true,
      is_default: body.is_default !== undefined ? body.is_default : false,
      sharing: body.sharing || "private",
      embeddings_provider: body.embeddings_provider || "openai",
      image_path: body.image_path || ""
    }

    // Extract starter messages if provided
    const starterMessages = body.starter_messages || []
    // Create the assistant
    let newAssistant
    try {
      newAssistant = await createAssistant(
        assistantData,
        workspaceData.id,
        starterMessages
      )
    } catch (error) {
      console.error("Error creating assistant:", error)
      return NextResponse.json(
        { error: "Failed to create assistant" },
        { status: 500 }
      )
    }

    // Handle label assignments if provided
    if (body.labels && Array.isArray(body.labels) && body.labels.length > 0) {
      try {
        const labelAssignments = body.labels.map((labelId: string) => ({
          assistant_id: newAssistant.id,
          label_id: labelId
        }))

        await supabase
          .from("assistant_label_assignments")
          .insert(labelAssignments)
      } catch (labelError) {
        console.error("Error assigning labels:", labelError)
        // Continue without failing - the assistant is still created
      }
    }

    // Handle document sets if provided
    if (
      body.document_sets &&
      Array.isArray(body.document_sets) &&
      body.document_sets.length > 0
    ) {
      try {
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
            assistant_id: newAssistant.id,
            file_id: fileId
          }))

          await supabase.from("assistant_files").insert(fileAssignments)
        }

        // Add collections to assistant
        if (collectionIds.length > 0) {
          const collectionAssignments = collectionIds.map(collectionId => ({
            user_id: user.id,
            assistant_id: newAssistant.id,
            collection_id: collectionId
          }))

          await supabase
            .from("assistant_collections")
            .insert(collectionAssignments)
        }
      } catch (documentError) {
        console.error("Error assigning documents:", documentError)
        // Continue without failing - the assistant is still created
      }
    }

    // Handle tools if provided
    if (body.tools && Array.isArray(body.tools) && body.tools.length > 0) {
      try {
        const toolAssignments = body.tools.map((toolId: string) => ({
          user_id: user.id,
          assistant_id: newAssistant.id,
          tool_id: toolId
        }))

        await supabase.from("assistant_tools").insert(toolAssignments)
      } catch (toolError) {
        console.error("Error assigning tools:", toolError)
        // Continue without failing - the assistant is still created
      }
    }

    return NextResponse.json(newAssistant)
  } catch (error) {
    console.error("Error in create assistant API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
