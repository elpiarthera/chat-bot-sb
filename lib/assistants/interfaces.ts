import { Tables } from "@/supabase/types"

// Basic user snapshot for displaying user information
export interface MinimalUserSnapshot {
  id: string
  email: string
  name?: string
}

// Document Set interface
export interface DocumentSet {
  id: string
  name: string
  description?: string
}

// Tool Snapshot interface
export interface ToolSnapshot {
  id: string
  name: string
  description?: string
  type: string
}

// Starter message interfaces
export interface StarterMessageBase {
  message: string
}

export interface StarterMessage extends StarterMessageBase {
  name?: string
}

// Prompt interface
export interface Prompt {
  id: string
  name: string
  description?: string
  system_prompt: string
  task_prompt?: string
  include_citations?: boolean
  datetime_aware?: boolean
  default_prompt?: boolean
}

// Assistant Label interface
export interface AssistantLabel {
  id: string
  name: string
}

// Full Assistant interface that extends the Supabase Assistant type
export interface AssistantWithRelations extends Tables<"assistants"> {
  document_sets?: DocumentSet[]
  prompts?: Prompt[]
  tools?: ToolSnapshot[]
  starter_messages?: StarterMessage[]
  users?: MinimalUserSnapshot[]
  labels?: AssistantLabel[]
  owner?: MinimalUserSnapshot
}

// Form data for creating/updating assistants
export interface AssistantFormData {
  name: string
  description: string
  model: string
  prompt: string
  temperature?: number
  context_length?: number
  include_profile_context?: boolean
  include_workspace_instructions?: boolean
  is_visible?: boolean
  is_default?: boolean
  sharing?: string
  embeddings_provider?: string
  image_path?: string
  document_sets?: string[]
  tools?: string[]
  starter_messages?: StarterMessage[]
}

// Redirect types for assistant updates
export enum SuccessfulAssistantUpdateRedirectType {
  ADMIN = "ADMIN",
  CHAT = "CHAT"
}
