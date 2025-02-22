import { Tables } from "@/supabase/types"
import { ChatMessage } from "./chat-message"
import { LLMID } from "."

export interface ChatSettings {
  model: LLMID
  prompt: string
  temperature: number
  contextLength: number
  includeProfileContext: boolean
  includeWorkspaceInstructions: boolean
  embeddingsProvider: "openai" | "local"
}

export interface ChatState {
  setChat: (update: (prevChat: ChatState) => ChatState) => void
  name?: string
  type?: string
  description?: string
  messages: ChatMessage[]
  settings: ChatSettings | null
  files: Tables<"file_items">[]
  collections: Tables<"collections">[]
  images: any[] // Adjust the type as necessary
  availableLocalModels: any[] // Define the correct type
  availableOpenRouterModels: any[] // Define the correct type
  chatMessages: ChatMessage[]
  selectedAssistant: Tables<"assistants"> | null
  chatImages: any[] // Define the correct type
  assistantImages: any[] // Define the correct type
  toolInUse: string
  models: any[] // Define the correct type
  isGenerating: boolean
  userInput: string
  selectedChat: Tables<"chats"> | null
  chatFileItems: Tables<"file_items">[]
  abortController: AbortController | null
  firstTokenReceived: boolean
  newMessageFiles: Tables<"file_items">[]
  chatFiles: Tables<"file_items">[]
  slashCommand: string
  isFilePickerOpen: boolean
  hashtagCommand: string
  focusPrompt: boolean
  focusFile: boolean
}

export const initialChatState: ChatState = {
  messages: [],
  settings: null,
  files: [],
  collections: [],
  images: [],
  isGenerating: false,
  userInput: "",
  selectedChat: null,
  chatFileItems: [],
  abortController: null,
  firstTokenReceived: false,
  newMessageFiles: [],
  chatFiles: [],
  slashCommand: "",
  isFilePickerOpen: false,
  hashtagCommand: "",
  focusPrompt: false,
  focusFile: false,
  availableLocalModels: [], // Initialize with an empty array or appropriate default
  availableOpenRouterModels: [], // Initialize with an empty array or appropriate default
  chatMessages: [], // Initialize with an empty array or appropriate default
  selectedAssistant: null, // Initialize with null or appropriate default
  chatImages: [], // Initialize with an empty array or appropriate default
  assistantImages: [], // Initialize with an empty array or appropriate default
  toolInUse: "", // Initialize with an empty string or appropriate default
  models: [], // Initialize with an empty array or appropriate default
  setChat: () => {} // Default implementation for setChat
}

export interface ChatPayload {
  chatSettings: ChatSettings
  workspaceInstructions: string
  chatMessages: ChatMessage[]
  assistant: Tables<"assistants"> | null
  messageFileItems: Tables<"file_items">[]
  chatFileItems: Tables<"file_items">[]
}

export interface ChatAPIPayload {
  chatSettings: ChatSettings
  messages: Tables<"messages">[]
}
