import { supabase } from "@/lib/supabase/browser-client"
import { customSupabase } from "@/lib/supabase/custom-client"
import { TablesInsert, TablesUpdate, Tables } from "@/supabase/types"
import { Workspace } from "@/types/workspace"

export const getHomeWorkspaceByUserId = async (userId: string) => {
  const { data: homeWorkspace, error } = await supabase
    .from("workspaces")
    .select("*")
    .eq("user_id", userId)
    .eq("is_home", true)
    .single()

  if (!homeWorkspace) {
    throw new Error(error.message)
  }

  return homeWorkspace.id
}

export const getWorkspaceById = async (workspaceId: string) => {
  const { data: workspace, error } = await supabase
    .from("workspaces")
    .select("*")
    .eq("id", workspaceId)
    .single()

  if (!workspace) {
    throw new Error(error.message)
  }

  return workspace
}

export const getWorkspacesByUserId = async (
  userId: string
): Promise<Workspace[]> => {
  // First, get all workspaces owned by the user
  const { data: ownedWorkspaces, error: ownedError } = await supabase
    .from("workspaces")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (ownedError) {
    throw new Error(ownedError.message)
  }

  // For shared workspaces, we need to use a different approach
  // as TypeScript doesn't recognize the workspace_users table in the DB schema
  let sharedWorkspaces: Workspace[] = []

  try {
    // First try: Use the API endpoint (which depends on the RPC function)
    console.log("Attempting to fetch shared workspaces from API...")
    const response = await fetch(`/api/workspace/shared?userId=${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    })

    if (response.ok) {
      const data = await response.json()
      console.log("Shared workspaces from API:", data)
      sharedWorkspaces = data.map((workspace: any) => ({
        ...workspace,
        is_shared: true
      }))
    } else {
      console.warn("API returned error:", await response.text())

      // Fallback: Try direct query
      console.log("Falling back to direct database query...")
      try {
        // Use customSupabase instead of supabase for workspace_users
        const { data: directWorkspaces, error: directError } =
          await customSupabase
            .from("workspace_users")
            .select("workspace_id")
            .eq("user_id", userId)

        if (directError) {
          console.error("Error in direct query fallback:", directError)
        } else if (directWorkspaces && directWorkspaces.length > 0) {
          const workspaceIds = directWorkspaces.map(
            (w: { workspace_id: string }) => w.workspace_id
          )

          // Use regular supabase for workspaces table which is properly typed
          const { data: workspaces, error: workspacesError } = await supabase
            .from("workspaces")
            .select("*")
            .in("id", workspaceIds)

          if (workspacesError) {
            console.error("Error fetching workspaces by IDs:", workspacesError)
          } else {
            return workspaces || []
          }
        }
      } catch (error) {
        console.error("Error in workspace_users fallback:", error)
      }
    }
  } catch (error) {
    console.error("Error fetching shared workspaces:", error)
    // Continue with empty shared workspaces if all methods fail
  }

  // Combine owned and shared workspaces
  const workspaces = [...ownedWorkspaces, ...sharedWorkspaces]

  return workspaces
}

export const createWorkspace = async (
  workspace: TablesInsert<"workspaces">
) => {
  const { data: createdWorkspace, error } = await supabase
    .from("workspaces")
    .insert([workspace])
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return createdWorkspace
}

export const updateWorkspace = async (
  workspaceId: string,
  workspace: TablesUpdate<"workspaces">
) => {
  const { data: updatedWorkspace, error } = await supabase
    .from("workspaces")
    .update(workspace)
    .eq("id", workspaceId)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return updatedWorkspace
}

export const deleteWorkspace = async (workspaceId: string) => {
  const { error } = await supabase
    .from("workspaces")
    .delete()
    .eq("id", workspaceId)

  if (error) {
    throw new Error(error.message)
  }

  return true
}
