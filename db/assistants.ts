import { supabase } from "@/lib/supabase/browser-client"
import { TablesInsert, TablesUpdate, Tables } from "@/supabase/types"
import {
  AssistantWithRelations,
  StarterMessage
} from "@/lib/assistants/interfaces"

// Define types for the new tables that are missing from the generated types
interface AssistantStarterMessage {
  id?: string
  assistant_id: string
  name: string | null
  message: string
  display_order: number
  created_at?: string
  updated_at?: string | null
}

interface AssistantLabel {
  id: string
  name: string
  created_at?: string
  updated_at?: string | null
}

interface AssistantLabelAssignment {
  assistant_id: string
  label_id: string
  created_at?: string
}

// Helper function for type casting
function castAs<T>(data: any): T {
  return data as unknown as T
}

export const getAssistantById = async (assistantId: string) => {
  const { data: assistant, error } = await supabase
    .from("assistants")
    .select("*")
    .eq("id", assistantId)
    .single()

  if (!assistant) {
    throw new Error(error.message)
  }

  return assistant
}

export const getAssistantWorkspacesByWorkspaceId = async (
  workspaceId: string
) => {
  const { data: workspace, error } = await supabase
    .from("workspaces")
    .select(
      `
      id,
      name,
      assistants (*)
    `
    )
    .eq("id", workspaceId)
    .single()

  if (!workspace) {
    throw new Error(error.message)
  }

  return workspace
}

export const getAssistantWorkspacesByAssistantId = async (
  assistantId: string
) => {
  const { data: assistant, error } = await supabase
    .from("assistants")
    .select(
      `
      id, 
      name, 
      workspaces (*)
    `
    )
    .eq("id", assistantId)
    .single()

  if (!assistant) {
    throw new Error(error.message)
  }

  return assistant
}

export const getAssistantWithRelations = async (
  assistantId: string
): Promise<AssistantWithRelations> => {
  // First get the assistant
  const { data: assistant, error } = await supabase
    .from("assistants")
    .select("*")
    .eq("id", assistantId)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  // Get starter messages
  const starterMessagesResult = await supabase
    .from("assistant_starter_messages" as any)
    .select("*")
    .eq("assistant_id", assistantId)
    .order("display_order", { ascending: true })

  const starterMessages = castAs<AssistantStarterMessage[]>(
    starterMessagesResult.data || []
  )
  if (starterMessagesResult.error) {
    console.error(
      "Error fetching starter messages:",
      starterMessagesResult.error
    )
  }

  // Get label assignments
  const labelAssignmentsResult = await supabase
    .from("assistant_label_assignments" as any)
    .select("label_id")
    .eq("assistant_id", assistantId)

  const labelAssignments = castAs<AssistantLabelAssignment[]>(
    labelAssignmentsResult.data || []
  )
  if (labelAssignmentsResult.error) {
    console.error(
      "Error fetching label assignments:",
      labelAssignmentsResult.error
    )
  }

  // Get label details if there are assignments
  let labels: AssistantLabel[] = []
  if (labelAssignments && labelAssignments.length > 0) {
    const labelIds = labelAssignments.map(assignment => assignment.label_id)
    const labelsResult = await supabase
      .from("assistant_labels" as any)
      .select("*")
      .in("id", labelIds)

    if (labelsResult.error) {
      console.error("Error fetching labels:", labelsResult.error)
    } else {
      labels = castAs<AssistantLabel[]>(labelsResult.data || [])
    }
  }

  // Get assistant files
  const { data: assistantFiles, error: assistantFilesError } = await supabase
    .from("assistant_files")
    .select("file_id")
    .eq("assistant_id", assistantId)

  if (assistantFilesError) {
    console.error("Error fetching assistant files:", assistantFilesError)
  }

  // Get assistant collections
  const { data: assistantCollections, error: assistantCollectionsError } =
    await supabase
      .from("assistant_collections")
      .select("collection_id")
      .eq("assistant_id", assistantId)

  if (assistantCollectionsError) {
    console.error(
      "Error fetching assistant collections:",
      assistantCollectionsError
    )
  }

  // Get assistant tools
  const { data: assistantTools, error: assistantToolsError } = await supabase
    .from("assistant_tools")
    .select("tool_id")
    .eq("assistant_id", assistantId)

  if (assistantToolsError) {
    console.error("Error fetching assistant tools:", assistantToolsError)
  }

  // Convert starter messages to the expected format
  const formattedStarterMessages: StarterMessage[] = starterMessages.map(
    sm => ({
      message: sm.message,
      name: sm.name || undefined
    })
  )

  // Return the assistant with all its relations
  return {
    ...assistant,
    starter_messages: formattedStarterMessages,
    labels: labels,
    // These fields would need to be populated with actual data from other queries
    document_sets: [], // Would need to fetch document set details
    tools: [], // Would need to fetch tool details
    prompts: [] // Would need to fetch prompt details
  }
}

export const createAssistant = async (
  assistant: TablesInsert<"assistants">,
  workspace_id: string,
  starterMessages?: StarterMessage[]
) => {
  try {
    // Create the assistant
    const { data: createdAssistant, error } = await supabase
      .from("assistants")
      .insert([assistant])
      .select("*")
      .single()

    if (error) {
      throw new Error(error.message)
    }

    // Create assistant workspace association
    await createAssistantWorkspace({
      user_id: createdAssistant.user_id,
      assistant_id: createdAssistant.id,
      workspace_id
    })

    // Add starter messages if provided
    if (starterMessages && starterMessages.length > 0) {
      const formattedMessages = starterMessages
        .filter(msg => msg.message.trim() !== "")
        .map((msg, index) => ({
          assistant_id: createdAssistant.id,
          message: msg.message,
          name: msg.name || null,
          display_order: index
        }))

      if (formattedMessages.length > 0) {
        const starterMessagesResult = await supabase
          .from("assistant_starter_messages" as any)
          .insert(formattedMessages)

        if (starterMessagesResult.error) {
          throw new Error(starterMessagesResult.error.message)
        }
      }
    }

    return createdAssistant
  } catch (error) {
    throw error
  }
}

export const createAssistants = async (
  assistants: TablesInsert<"assistants">[],
  workspace_id: string
) => {
  const { data: createdAssistants, error } = await supabase
    .from("assistants")
    .insert(assistants)
    .select("*")

  if (error) {
    throw new Error(error.message)
  }

  await createAssistantWorkspaces(
    createdAssistants.map(assistant => ({
      user_id: assistant.user_id,
      assistant_id: assistant.id,
      workspace_id
    }))
  )

  return createdAssistants
}

export const createAssistantWorkspace = async (item: {
  user_id: string
  assistant_id: string
  workspace_id: string
}) => {
  const { data: createdAssistantWorkspace, error } = await supabase
    .from("assistant_workspaces")
    .insert([item])
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return createdAssistantWorkspace
}

export const createAssistantWorkspaces = async (
  items: { user_id: string; assistant_id: string; workspace_id: string }[]
) => {
  const { data: createdAssistantWorkspaces, error } = await supabase
    .from("assistant_workspaces")
    .insert(items)
    .select("*")

  if (error) throw new Error(error.message)

  return createdAssistantWorkspaces
}

export const updateAssistant = async (
  assistantId: string,
  assistant: TablesUpdate<"assistants">,
  starterMessages?: StarterMessage[]
) => {
  try {
    // Update the assistant
    const { data: updatedAssistant, error } = await supabase
      .from("assistants")
      .update(assistant)
      .eq("id", assistantId)
      .select("*")
      .single()

    if (error) {
      throw new Error(error.message)
    }

    // Update starter messages if provided
    if (starterMessages !== undefined) {
      // First delete existing starter messages
      const deleteResult = await supabase
        .from("assistant_starter_messages" as any)
        .delete()
        .eq("assistant_id", assistantId)

      if (deleteResult.error) {
        throw new Error(deleteResult.error.message)
      }

      // Add new starter messages
      const formattedMessages = starterMessages
        .filter(msg => msg.message.trim() !== "")
        .map((msg, index) => ({
          assistant_id: assistantId,
          message: msg.message,
          name: msg.name || null,
          display_order: index
        }))

      if (formattedMessages.length > 0) {
        const starterMessagesResult = await supabase
          .from("assistant_starter_messages" as any)
          .insert(formattedMessages)

        if (starterMessagesResult.error) {
          throw new Error(starterMessagesResult.error.message)
        }
      }
    }

    return updatedAssistant
  } catch (error) {
    throw error
  }
}

export const deleteAssistant = async (assistantId: string) => {
  const { error } = await supabase
    .from("assistants")
    .delete()
    .eq("id", assistantId)

  if (error) {
    throw new Error(error.message)
  }

  return true
}

export const deleteAssistantWorkspace = async (
  assistantId: string,
  workspaceId: string
) => {
  const { error } = await supabase
    .from("assistant_workspaces")
    .delete()
    .eq("assistant_id", assistantId)
    .eq("workspace_id", workspaceId)

  if (error) throw new Error(error.message)

  return true
}

export const updateAssistantLabels = async (
  assistantId: string,
  labelIds: string[]
) => {
  try {
    // First delete existing label assignments
    const deleteResult = await supabase
      .from("assistant_label_assignments" as any)
      .delete()
      .eq("assistant_id", assistantId)

    if (deleteResult.error) {
      throw new Error(deleteResult.error.message)
    }

    // Add new label assignments
    if (labelIds.length > 0) {
      const labelAssignments = labelIds.map(labelId => ({
        assistant_id: assistantId,
        label_id: labelId
      }))

      const insertResult = await supabase
        .from("assistant_label_assignments" as any)
        .insert(labelAssignments)

      if (insertResult.error) {
        throw new Error(insertResult.error.message)
      }
    }

    return true
  } catch (error) {
    throw error
  }
}

export const getAllLabels = async () => {
  const labelsResult = await supabase
    .from("assistant_labels" as any)
    .select("*")
    .order("name")

  if (labelsResult.error) {
    throw new Error(labelsResult.error.message)
  }

  return castAs<AssistantLabel[]>(labelsResult.data || [])
}

export const createLabel = async (name: string) => {
  const labelResult = await supabase
    .from("assistant_labels" as any)
    .insert([{ name }])
    .select("*")
    .single()

  if (labelResult.error) {
    throw new Error(labelResult.error.message)
  }

  return castAs<AssistantLabel>(labelResult.data)
}

export const deleteLabel = async (labelId: string) => {
  const deleteResult = await supabase
    .from("assistant_labels" as any)
    .delete()
    .eq("id", labelId)

  if (deleteResult.error) {
    throw new Error(deleteResult.error.message)
  }

  return true
}

export const getAssistantStarterMessages = async (assistantId: string) => {
  const starterMessagesResult = await supabase
    .from("assistant_starter_messages" as any)
    .select("*")
    .eq("assistant_id", assistantId)
    .order("display_order", { ascending: true })

  if (starterMessagesResult.error) {
    throw new Error(starterMessagesResult.error.message)
  }

  return castAs<AssistantStarterMessage[]>(starterMessagesResult.data || [])
}
