// Define a local Tables type to avoid import issues
type Tables<T extends string> = any

import { ChatMessage } from "./chat-message"
import { LLMID } from "./llms"

export interface ChatSettings {
  model: LLMID
  prompt: string
  temperature: number
  contextLength: number
  includeProfileContext: boolean
  includeWorkspaceInstructions: boolean
  embeddingsProvider: "openai" | "local"
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

export interface ChatState {
  userInput: string
  chatMessages: ChatMessage[]
  selectedChat: Tables<"chats"> | null
  isGenerating: boolean
  firstTokenReceived: boolean
  chatFiles: any[]
  chatImages: any[]
  newMessageFiles: any[]
  newMessageImages: any[]
  showFilesDisplay: boolean
  abortController: AbortController | null
  chatSettings: ChatSettings | null
  chatFileItems: Tables<"file_items">[]
  toolInUse: string
  isPromptPickerOpen: boolean
  isFilePickerOpen: boolean
  isToolPickerOpen: boolean
  newChat?: boolean
  createdMessages?: any[]
  updatedChatMessages?: any[]
  chatPayload?: any
  updatedMessages?: any[]
}
