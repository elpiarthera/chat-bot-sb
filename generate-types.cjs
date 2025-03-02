// A script to generate a minimal types.ts file for Supabase
const fs = require('fs');
const path = require('path');

const typesContent = `export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      workspace_active_models: {
        Row: {
          created_at: string
          model_id: string
          provider: string
          updated_at: string | null
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          model_id: string
          provider: string
          updated_at?: string | null
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          model_id?: string
          provider?: string
          updated_at?: string | null
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_active_models_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_active_models_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          }
        ]
      }
      // Simplified types for other tables to provide minimum working structure
      assistants: {
        Row: {
          id: string
          user_id: string
          // Other fields would go here in a full types file
        }
        Insert: {
          id?: string
          user_id: string
        }
        Update: {
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      workspaces: {
        Row: {
          id: string
          user_id: string
          // Other fields would go here in a full types file
        }
        Insert: {
          id?: string
          user_id: string
        }
        Update: {
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      models: {
        Row: {
          id: string
          user_id: string
          model_id: string
          // Other fields would go here in a full types file
        }
        Insert: {
          id?: string
          user_id: string
          model_id: string
        }
        Update: {
          id?: string
          user_id?: string
          model_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
`;

fs.writeFileSync(path.join(__dirname, 'supabase', 'types.ts'), typesContent);
console.log('Generated types.ts file successfully'); 