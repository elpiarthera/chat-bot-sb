import { useChatHandler } from "@/components/chat/chat-hooks/use-chat-handler"
import { ChatbotUIContext } from "@/context/context"
import { Tables } from "@/supabase/types"
import { FC, useContext, useState } from "react"
import { Message } from "../messages/message"
import { ChatFile } from "@/types/chat-file"

interface ChatMessagesProps {}

export const ChatMessages: FC<ChatMessagesProps> = ({}) => {
  const { chatMessages, chatFileItems, chatFiles } =
    useContext(ChatbotUIContext)

  const { handleSendEdit } = useChatHandler()

  const [editingMessage, setEditingMessage] = useState<Tables<"messages">>()

  return chatMessages
    .sort((a, b) => a.message.sequence_number - b.message.sequence_number)
    .map((chatMessage, index, array) => {
      const mapChatFileToFileItem = (
        chatFile: ChatFile
      ): Tables<"file_items"> => ({
        file_id: chatFile.id,
        content: chatFile.description, // Assuming description is used as content
        created_at: "", // Placeholder, replace with actual value if available
        id: chatFile.id,
        local_embedding: null, // Placeholder, replace with actual value if available
        openai_embedding: null, // Placeholder, replace with actual value if available
        sharing: "", // Placeholder, replace with actual value if available
        tokens: 0, // Placeholder, replace with actual value if available
        updated_at: null, // Placeholder, replace with actual value if available
        user_id: "" // Placeholder, replace with actual value if available
      })

      const messageFileItems = chatMessage.fileItems
        .map((chatFile: ChatFile) => mapChatFileToFileItem(chatFile))
        .filter(
          (fileItem): fileItem is Tables<"file_items"> => fileItem !== undefined
        )

      return (
        <Message
          key={chatMessage.message.sequence_number}
          message={chatMessage.message}
          fileItems={messageFileItems}
          isEditing={editingMessage?.id === chatMessage.message.id}
          isLast={index === array.length - 1}
          onStartEdit={setEditingMessage}
          onCancelEdit={() => setEditingMessage(undefined)}
          onSubmitEdit={handleSendEdit}
        />
      )
    })
}
