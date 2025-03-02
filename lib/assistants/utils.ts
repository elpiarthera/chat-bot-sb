import { Tables } from "@/supabase/types"

// Sort assistants by priority: default first, then visible assistants, then by creation date
export function sortAssistants(
  assistants: Tables<"assistants">[]
): Tables<"assistants">[] {
  return [...assistants].sort((a, b) => {
    // Default assistant comes first
    if (a.is_default && !b.is_default) return -1
    if (!a.is_default && b.is_default) return 1

    // Visible assistants come before hidden ones
    if (a.is_visible && !b.is_visible) return -1
    if (!a.is_visible && b.is_visible) return 1

    // Sort by creation date (newest first)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })
}

// Get assistant display name with status indicators
export function getAssistantDisplayName(
  assistant: Tables<"assistants">
): string {
  let name = assistant.name

  if (assistant.is_default) {
    name += " (Default)"
  }

  if (!assistant.is_visible) {
    name += " (Hidden)"
  }

  return name
}

// Check if an assistant has valid configuration
export function validateAssistant(
  assistant: Partial<Tables<"assistants">>
): string | null {
  if (!assistant.name || assistant.name.trim() === "") {
    return "Assistant name is required"
  }

  if (!assistant.description || assistant.description.trim() === "") {
    return "Assistant description is required"
  }

  if (!assistant.model || assistant.model.trim() === "") {
    return "Model selection is required"
  }

  if (!assistant.prompt || assistant.prompt.trim() === "") {
    return "System prompt is required"
  }

  return null // No errors
}

// Create a model options list based on provider
export function getModelOptions(
  provider: string
): { value: string; label: string }[] {
  switch (provider.toLowerCase()) {
    case "openai":
      return [
        { value: "gpt-4o", label: "GPT-4o" },
        { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
        { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" }
      ]
    case "anthropic":
      return [
        { value: "claude-3-opus-20240229", label: "Claude 3 Opus" },
        { value: "claude-3-sonnet-20240229", label: "Claude 3 Sonnet" },
        { value: "claude-3-haiku-20240307", label: "Claude 3 Haiku" }
      ]
    case "google":
      return [
        { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
        { value: "gemini-1.0-pro", label: "Gemini 1.0 Pro" }
      ]
    default:
      return []
  }
}

// Get a list of available model providers
export function getModelProviders(): { value: string; label: string }[] {
  return [
    { value: "openai", label: "OpenAI" },
    { value: "anthropic", label: "Anthropic" },
    { value: "google", label: "Google" },
    { value: "mistral", label: "Mistral AI" },
    { value: "ollama", label: "Ollama (Local)" }
  ]
}

// Template system prompts for different assistant types
export const ASSISTANT_TEMPLATES = {
  general: `You are a helpful AI assistant that answers user questions accurately and concisely.
When provided with documents as context, use that information to give accurate answers.
If you don't know the answer to a question, don't make up information - just say you don't know.`,

  customer_support: `You are a customer support specialist who helps users with their questions and issues.
Be friendly, patient, and thorough in your responses.
Always try to resolve the user's problem completely.
If you don't have enough information, ask clarifying questions.`,

  technical: `You are a technical assistant who helps users with programming, technical concepts, and troubleshooting.
Provide code examples where appropriate and explain concepts clearly.
When analyzing problems, walk through your reasoning step by step.`
}
