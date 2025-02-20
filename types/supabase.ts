export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"]

interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          // ... verify other fields
        }
      }
      workspaces: {
        Row: {
          id: string
          user_id: string
          name: string
          // ... verify other fields
        }
      }
      chats: {
        Row: {
          id: string
          user_id: string
          workspace_id: string
          // ... verify other fields
        }
      }
      messages: {
        Row: {
          id: string
          chat_id: string
          content: string
          // ... verify other fields
        }
      }
      assistants: {
        Row: {
          id: string
          user_id: string
          name: string
          // ... verify other fields
        }
      }
      presets: {
        Row: {
          id: string
          user_id: string
          name: string
          // ... verify other fields
        }
      }
      files: {
        Row: {
          id: string
          user_id: string
          name: string
          // ... verify other fields
        }
      }
      file_items: {
        Row: {
          id: string
          file_id: string
          content: string
          // ... verify other fields
        }
      }
      tools: {
        Row: {
          id: string
          user_id: string
          name: string
          // ... verify other fields
        }
      }
      // Linking Tables
      assistant_workspaces: {
        Row: {
          assistant_id: string
          workspace_id: string
        }
      }
      chat_files: {
        Row: {
          chat_id: string
          file_id: string
        }
      }
    }
  }
}
