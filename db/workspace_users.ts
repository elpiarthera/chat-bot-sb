import { customSupabase as supabase } from "@/lib/supabase/custom-client"
import { WorkspaceUser } from "./custom-types"

// Get all users who have access to a workspace
export const getWorkspaceUsers = async (workspaceId: string) => {
  const { data: workspaceUsers, error } = await supabase
    .from("workspace_users")
    .select("*")
    .eq("workspace_id", workspaceId)

  if (error) {
    throw new Error(error.message)
  }

  return workspaceUsers || []
}

// Get all workspaces shared with a user
export const getSharedWorkspacesByUserId = async (userId: string) => {
  const { data: sharedWorkspaces, error } = await supabase
    .from("workspace_users")
    .select("workspace_id, workspaces(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return sharedWorkspaces?.map(item => item.workspaces) || []
}

// Share a workspace with a user
export const shareWorkspaceWithUser = async (workspaceShare: {
  workspace_id: string
  user_id: string
  role: string
}) => {
  const { data: workspaceUser, error } = await supabase
    .from("workspace_users")
    .insert(workspaceShare)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return workspaceUser
}

// Update a user's role in a workspace
export const updateWorkspaceUserRole = async (
  workspaceId: string,
  userId: string,
  role: string
) => {
  const { data: updatedWorkspaceUser, error } = await supabase
    .from("workspace_users")
    .update({ role })
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return updatedWorkspaceUser
}

// Remove a user from a workspace
export const removeUserFromWorkspace = async (
  workspaceId: string,
  userId: string
) => {
  const { error } = await supabase
    .from("workspace_users")
    .delete()
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId)

  if (error) {
    throw new Error(error.message)
  }

  return true
}
