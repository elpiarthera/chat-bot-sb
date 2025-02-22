import Loading from "@/app/[locale]/loading"
import { useChatHandler } from "@/components/chat/chat-hooks/use-chat-handler"
import { ChatbotUIContext } from "@/context/context"
import { getAssistantToolsByAssistantId } from "@/db/assistant-tools"
import { getAssistantById } from "@/db/assistants"
import { getChatFilesByChatId } from "@/db/chat-files"
import { getChatById } from "@/db/chats"
import { getMessageFileItemsByMessageId } from "@/db/message-file-items"
import { getMessagesByChatId } from "@/db/messages"
import { getMessageImageFromStorage } from "@/db/storage/message-images"
import { convertBlobToBase64 } from "@/lib/blob-to-b64"
import useHotkey from "@/lib/hooks/use-hotkey"
import { LLMID, MessageImage, ChatFile, ChatMessage } from "@/types"
import { Tables } from "@/supabase/types"
import { useParams } from "next/navigation"
import { FC, useContext, useEffect, useState, useCallback } from "react"
import { ChatHelp } from "./chat-help"
import { useScroll } from "./chat-hooks/use-scroll"
import { ChatInput } from "./chat-input"
import { ChatMessages } from "./chat-messages"
import { ChatScrollButtons } from "./chat-scroll-buttons"
import { ChatSecondaryButtons } from "./chat-secondary-buttons"

interface ChatUIProps {}

export const ChatUI: FC<ChatUIProps> = ({}) => {
  const params = useParams()
  const {
    setChat,
    chatMessages,
    setChatMessages,
    selectedChat,
    setSelectedChat,
    chatImages,
    setChatImages
  } = useContext(ChatbotUIContext)

  const [loading, setLoading] = useState(true)

  const {
    messagesStartRef,
    messagesEndRef,
    scrollRef,
    scrollToBottom,
    setIsAtBottom,
    isAtTop,
    isAtBottom,
    isOverflowing,
    scrollToTop
  } = useScroll()

  const fetchMessages = useCallback(async () => {
    const fetchedMessages = await getMessagesByChatId(params.chatid as string)

    const imagePromises: Promise<MessageImage>[] = fetchedMessages.flatMap(
      message =>
        message.image_paths
          ? message.image_paths.map(async imagePath => {
              const url = await getMessageImageFromStorage(imagePath)

              if (url) {
                const response = await fetch(url)
                const blob = await response.blob()
                const base64 = await convertBlobToBase64(blob)

                return {
                  messageId: message.id,
                  path: imagePath,
                  base64,
                  url,
                  file: null
                }
              }

              return {
                messageId: message.id,
                path: imagePath,
                base64: "",
                url,
                file: null
              }
            })
          : []
    )

    const images: MessageImage[] = await Promise.all(imagePromises.flat())
    setChat(prevChat => ({
      ...prevChat,
      chatImages: images
    }))

    const messageFileItemPromises = fetchedMessages.map(
      async message => await getMessageFileItemsByMessageId(message.id)
    )

    const messageFileItems = await Promise.all(messageFileItemPromises)
    const uniqueFileItems = messageFileItems.flatMap(item => item.file_items)

    // Transform messages to match ChatMessage type
    const transformedMessages: ChatMessage[] = fetchedMessages.map(message => ({
      message,
      fileItems: []
    }))
    setChatMessages(transformedMessages)

    const chatFilesResponse = await getChatFilesByChatId(
      params.chatid as string
    )
    const chatFiles = chatFilesResponse.files

    setChat(prevChat => ({
      ...prevChat,
      chatFiles: chatFiles.map((file: Tables<"files">) => ({
        content: file.name,
        created_at: file.created_at,
        file_id: file.id,
        id: file.id,
        local_embedding: null,
        openai_embedding: null,
        sharing: file.sharing,
        tokens: file.tokens,
        updated_at: file.updated_at,
        user_id: file.user_id
      })),
      useRetrieval: true,
      showFilesDisplay: true
    }))

    const fetchedChatMessages = fetchedMessages.map(message => {
      return {
        message,
        fileItems: messageFileItems
          .filter(messageFileItem => messageFileItem.id === message.id)
          .flatMap(messageFileItem =>
            messageFileItem.file_items.map(
              fileItem =>
                ({
                  id: fileItem.id,
                  name: fileItem.content,
                  type: "text",
                  file: null
                }) as ChatFile
            )
          )
      } as ChatMessage
    })

    setChat(prevChat => ({
      ...prevChat,
      chatMessages: fetchedChatMessages
    }))
  }, [params.chatid, setChat, setChatMessages])

  const fetchChat = useCallback(async () => {
    const chat = await getChatById(params.chatid as string)
    if (!chat) return

    setSelectedChat(chat)

    if (chat.assistant_id) {
      const assistantResult = await getAssistantById(chat.assistant_id)
      if (assistantResult && "assistant" in assistantResult) {
        const assistant = assistantResult.assistant as Tables<"assistants">

        setChat(prevChat => ({
          ...prevChat,
          selectedAssistant: assistant
        }))

        const assistantTools = (
          await getAssistantToolsByAssistantId(assistant.id)
        ).tools
        setChat(prevChat => ({
          ...prevChat,
          selectedTools: assistantTools
        }))
      }
    }

    setChat(prevChat => ({
      ...prevChat,
      chatSettings: {
        model: chat.model as LLMID,
        prompt: chat.prompt,
        temperature: chat.temperature,
        contextLength: chat.context_length,
        includeProfileContext: chat.include_profile_context,
        includeWorkspaceInstructions: chat.include_workspace_instructions,
        embeddingsProvider: chat.embeddings_provider as "openai" | "local"
      }
    }))
  }, [params.chatid, setSelectedChat, setChat])

  const handleFocusChatInput = useCallback(() => {
    const chatInput = document.getElementById("chat-input")
    if (chatInput) {
      chatInput.focus()
    }
  }, [])

  useEffect(() => {
    ;(async () => {
      if (!params.chatid) return
      await fetchChat()
      await fetchMessages()
      handleFocusChatInput()
      scrollToBottom()
      setIsAtBottom(true)
    })()
  }, [
    params.chatid,
    fetchChat,
    fetchMessages,
    handleFocusChatInput,
    scrollToBottom,
    setIsAtBottom
  ])

  if (loading) {
    return <Loading />
  }

  return (
    <div className="relative flex h-full flex-col items-center">
      <div className="absolute left-4 top-2.5 flex justify-center">
        <ChatScrollButtons
          isAtTop={isAtTop}
          isAtBottom={isAtBottom}
          isOverflowing={isOverflowing}
          scrollToTop={scrollToTop}
          scrollToBottom={scrollToBottom}
        />
      </div>

      <div className="absolute right-4 top-1 flex h-[40px] items-center space-x-2">
        <ChatSecondaryButtons />
      </div>

      <div className="bg-secondary flex max-h-[50px] min-h-[50px] w-full items-center justify-center border-b-2 font-bold">
        <div className="max-w-[200px] truncate sm:max-w-[400px] md:max-w-[500px] lg:max-w-[600px] xl:max-w-[700px]">
          {selectedChat?.name || "Chat"}
        </div>
      </div>

      <div
        className="flex size-full flex-col overflow-auto border-b"
        ref={scrollRef}
      >
        <div ref={messagesStartRef} />
        <ChatMessages />
        <div ref={messagesEndRef} />
      </div>

      <div className="relative w-full min-w-[300px] items-end px-2 pb-3 pt-0 sm:w-[600px] sm:pb-8 sm:pt-5 md:w-[700px] lg:w-[700px] xl:w-[800px]">
        <ChatInput />
      </div>

      <div className="absolute bottom-2 right-2 hidden md:block lg:bottom-4 lg:right-4">
        <ChatHelp />
      </div>
    </div>
  )
}
