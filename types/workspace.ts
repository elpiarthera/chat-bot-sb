import { Tables } from "@/supabase/types"

// Enhanced type that extends the base Supabase workspace type
export type Workspace = Tables<"workspaces"> & {
  is_shared?: boolean
}

// Type for the workspace user relationship
export type WorkspaceUser = Tables<"workspace_users"> & {
  workspaces?: Workspace
}
