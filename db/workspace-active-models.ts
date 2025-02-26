import { Tables, TablesInsert } from "@/supabase/types"
import { supabase } from "@/lib/supabase/browser-client"

export const getWorkspaceActiveModels = async (workspaceId: string) => {
  console.log(
    "DB: getWorkspaceActiveModels called for workspaceId:",
    workspaceId
  )

  // If workspaceId is undefined or empty, return empty array immediately
  if (!workspaceId) {
    console.log("DB: No workspaceId provided, returning empty array")
    return []
  }

  try {
    const { data, error } = await supabase
      .from("workspace_active_models")
      .select("*")
      .eq("workspace_id", workspaceId)

    if (error) {
      console.error("DB: Error in getWorkspaceActiveModels:", error)
      // Return empty array on error instead of throwing to prevent app from breaking
      return []
    }

    console.log(
      `DB: getWorkspaceActiveModels returned ${data?.length || 0} models`
    )
    return data || []
  } catch (err) {
    console.error("DB: Exception in getWorkspaceActiveModels:", err)
    // Return empty array on exception instead of throwing
    return []
  }
}

export const createWorkspaceActiveModel = async (
  workspaceActiveModel: TablesInsert<"workspace_active_models">
) => {
  const { data, error } = await supabase
    .from("workspace_active_models")
    .insert([workspaceActiveModel])
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export const createWorkspaceActiveModels = async (
  workspaceActiveModels: TablesInsert<"workspace_active_models">[]
) => {
  if (workspaceActiveModels.length === 0) return []

  const { data, error } = await supabase
    .from("workspace_active_models")
    .insert(workspaceActiveModels)
    .select("*")

  if (error) {
    throw new Error(error.message)
  }

  return data || []
}

export const deleteWorkspaceActiveModel = async (
  workspaceId: string,
  modelId: string
) => {
  const { error } = await supabase
    .from("workspace_active_models")
    .delete()
    .eq("workspace_id", workspaceId)
    .eq("model_id", modelId)

  if (error) {
    throw new Error(error.message)
  }

  return true
}

export const deleteAllWorkspaceActiveModels = async (workspaceId: string) => {
  const { error } = await supabase
    .from("workspace_active_models")
    .delete()
    .eq("workspace_id", workspaceId)

  if (error) {
    throw new Error(error.message)
  }

  return true
}

// This function will update the active models for a workspace
// It will first delete all existing active models for the workspace
// Then insert the new active models
export const updateWorkspaceActiveModels = async (
  workspaceId: string,
  userId: string,
  activeModels: { modelId: string; provider: string }[]
) => {
  // First, delete all existing active models for this workspace
  await deleteAllWorkspaceActiveModels(workspaceId)

  // Then, insert the new active models
  if (activeModels.length === 0) return []

  const modelsToInsert = activeModels.map(model => ({
    user_id: userId,
    workspace_id: workspaceId,
    model_id: model.modelId,
    provider: model.provider
  }))

  return await createWorkspaceActiveModels(modelsToInsert)
}
