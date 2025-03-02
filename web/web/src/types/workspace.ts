// Define types for workspaces and workspace users

// Define CustomWorkspaceUser type directly
export type CustomWorkspaceUser = {
  id?: string;
  created_at?: string;
  user_id: string;
  workspace_id: string;
  role: string;
  updated_at?: string | null;
}

// Enhanced type for workspaces
export type Workspace = {
  id: string;
  created_at: string;
  name: string;
  description: string;
  user_id: string;
  updated_at: string | null;
  instructions: string;
  default_model: string;
  default_prompt: string;
  default_temperature: number;
  default_context_length: number;
  embeddings_provider: string;
  include_profile_context: boolean;
  include_workspace_instructions: boolean;
  is_home: boolean;
  sharing: string;
  image_path: string;
  is_shared?: boolean;
}

// Type for the workspace user relationship
export type WorkspaceUser = CustomWorkspaceUser & {
  workspaces?: Workspace;
}