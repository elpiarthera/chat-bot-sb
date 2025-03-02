import { createClient } from "@supabase/supabase-js"
import { Database } from "../../supabase/types"
import { WorkspaceUser } from "../../db/custom-types"

// Extend the Database type to include our custom tables
type ExtendedDatabase = Database & {
  public: {
    Tables: {
      workspace_users: {
        Row: WorkspaceUser
        Insert: WorkspaceUser
        Update: Partial<WorkspaceUser>
        Relationships: [
          {
            foreignKeyName: "workspace_users_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
  }
}

// Create a custom Supabase client with our extended type definition
export const createCustomClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  return createClient<ExtendedDatabase>(supabaseUrl, supabaseKey)
}

// Export an instance of the custom client
export const customSupabase = createCustomClient()
