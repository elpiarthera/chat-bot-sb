// Define a local Tables type to avoid import issues
type Tables<T extends string> = any

import { ChatFile } from "./chat-file"

export interface ChatMessage {
  message: Tables<"messages">
  fileItems: ChatFile[]
}
