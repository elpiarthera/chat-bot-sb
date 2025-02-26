// Custom type definitions for tables not in the generated Supabase types

export type WorkspaceUser = {
  id?: string
  created_at?: string
  user_id: string
  workspace_id: string
  role: string
  updated_at?: string | null
}

export type WorkspaceUserInsert = WorkspaceUser
export type WorkspaceUserUpdate = Partial<WorkspaceUser>
