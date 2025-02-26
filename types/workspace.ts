import { Tables } from "@/supabase/types"
import { WorkspaceUser as CustomWorkspaceUser } from "@/db/custom-types"

// Enhanced type that extends the base Supabase workspace type
export type Workspace = Tables<"workspaces"> & {
  is_shared?: boolean
}

// Type for the workspace user relationship
export type WorkspaceUser = CustomWorkspaceUser & {
  workspaces?: Workspace
}
