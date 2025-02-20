"use client"

import { ChatUI } from "@/components/chat/chat-ui"
import { useParams } from "next/navigation"
import { useContext, useEffect, FC } from "react"
import { ChatbotUIContext } from "@/context/context"
import { Tables } from "@/supabase/types"

interface ChatPageProps {
  chatId?: string
}

const ChatPage: FC<ChatPageProps> = ({ chatId }) => {
  const { setSelectedAssistant, setSelectedPreset } =
    useContext(ChatbotUIContext)

  useEffect(() => {
    const loadChatSettings = async () => {
      if (!chatId) return

      try {
        const chat = await fetch(`/api/chats/${chatId}`).then(res => res.json())
        if (chat?.assistant_id) {
          const assistant = await fetch(
            `/api/assistants/${chat.assistant_id}`
          ).then(res => res.json())
          setSelectedAssistant(assistant)
        }
        if (chat?.preset_id) {
          const preset = await fetch(`/api/presets/${chat.preset_id}`).then(
            res => res.json()
          )
          setSelectedPreset(preset)
        }
      } catch (error) {
        console.error("Error loading chat settings:", error)
      }
    }
    loadChatSettings()
  }, [chatId, setSelectedAssistant, setSelectedPreset])

  return <ChatUI />
}

export default function ChatIDPage() {
  const params = useParams()
  const chatId = typeof params.chatId === "string" ? params.chatId : undefined
  return <ChatPage chatId={chatId} />
}
