import { ChatbotUIContext } from "@/context/context"
import { FC, useContext, useEffect, useRef, useMemo } from "react"
import { ChatInput } from "./chat-input"

interface ChatUIProps {}

export const ChatUI: FC<ChatUIProps> = () => {
  const context = useContext(ChatbotUIContext) as any

  // Access properties from context
  const profile = context.profile
  const selectedWorkspace = context.selectedWorkspace
  const chatMessages = useMemo(
    () => context.chatMessages || [],
    [context.chatMessages]
  )
  const selectedChat = context.selectedChat

  // Create refs for scrolling
  const messagesStartRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages])

  if (!profile || !selectedWorkspace) return null

  return (
    <div className="relative flex h-full flex-col">
      <div className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div ref={messagesStartRef} />

          {/* Chat messages would go here */}
          <div className="space-y-4">
            {chatMessages.map((message: any, index: number) => (
              <div key={index} className="p-4 rounded-lg border">
                <div className="font-medium">
                  {message.message?.role === "user" ? "You" : "Assistant"}
                </div>
                <div className="mt-1">{message.message?.content}</div>
              </div>
            ))}
          </div>

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t">
        <div className="max-w-3xl mx-auto px-4 py-2">
          <ChatInput />
        </div>
      </div>
    </div>
  )
}
