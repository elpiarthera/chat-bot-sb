import { ChatbotUIContext } from "@/context/context"
import { getAssistantCollectionsByAssistantId } from "@/db/assistant-collections"
import { getAssistantFilesByAssistantId } from "@/db/assistant-files"
import { getAssistantToolsByAssistantId } from "@/db/assistant-tools"
import { updateChat } from "@/db/chats"
import { getCollectionFilesByCollectionId } from "@/db/collection-files"
import { deleteMessagesIncludingAndAfter } from "@/db/messages"
import { buildFinalMessages } from "@/lib/build-prompt"
import { Tables } from "@/supabase/types"
import {
  ChatMessage,
  ChatPayload,
  LLMID,
  ModelProvider,
  ChatFile,
  ChatState
} from "@/types"
import { useRouter } from "next/navigation"
import { useContext, useEffect, useRef } from "react"
import { LLM_LIST } from "../../../lib/models/llm/llm-list"
import {
  createTempMessages,
  handleRetrieval,
  validateChatSettings
} from "../chat-helpers"

// Define a type for the model object
interface ModelObject {
  model_id: string
  name: string
  id: string
}

// Define a type for the LLM model data
interface LLMData {
  modelId: LLMID
  modelName: string
  provider: ModelProvider
  hostedId: string
  platformLink: string
  imageInput: boolean
}

export const useChatHandler = () => {
  const router = useRouter()
  // Use type assertion to access properties that exist in the context
  const context = useContext(ChatbotUIContext) as any
  const profile = context.profile
  const selectedWorkspace = context.selectedWorkspace
  const setSelectedChat = context.setSelectedChat
  const setChats = context.setChats
  const availableLocalModels = context.availableLocalModels || []
  const availableOpenRouterModels = context.availableOpenRouterModels || []
  const selectedAssistant = context.selectedAssistant
  const models = context.models || []
  const chat = context.chat || {}
  const setChat = context.setChat
  const setChatMessages = context.setChatMessages
  const setChatFiles = context.setChatFiles
  const setChatFileItems = context.setChatFileItems
  const setChatImages = context.setChatImages
  const setToolInUse = context.setToolInUse
  const setFirstTokenReceived = context.setFirstTokenReceived
  const selectedTools = context.selectedTools || []
  const selectedPreset = context.selectedPreset
  const useRetrieval = context.useRetrieval || false
  const sourceCount = context.sourceCount || 4
  // Access chat properties from the chat object
  const {
    userInput,
    chatFiles,
    chatMessages,
    chatSettings,
    newMessageImages,
    newMessageFiles,
    chatImages,
    chatFileItems,
    isPromptPickerOpen,
    isFilePickerOpen,
    isToolPickerOpen,
    selectedChat,
    isGenerating,
    firstTokenReceived,
    abortController
  } = chat

  const chatInputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!isPromptPickerOpen || !isFilePickerOpen || !isToolPickerOpen) {
      chatInputRef.current?.focus()
    }
  }, [isPromptPickerOpen, isFilePickerOpen, isToolPickerOpen])

  const handleNewChat = async () => {
    if (!selectedWorkspace) return

    // Update chat state using setChat
    setChat((prevChat: ChatState) => ({
      ...prevChat,
      userInput: "",
      chatMessages: [],
      selectedChat: null,
      isGenerating: false,
      firstTokenReceived: false,
      chatFiles: [],
      chatImages: [],
      newMessageFiles: [],
      newMessageImages: [],
      showFilesDisplay: false
    }))

    router.push(
      `/chat/${selectedWorkspace?.id}/${
        selectedAssistant ? `assistant/${selectedAssistant.id}` : ""
      }`
    )
  }

  const handleFocusChatInput = () => {
    chatInputRef.current?.focus()
  }

  const handleStopMessage = () => {
    if (abortController) {
      abortController.abort()
      setChat((prevChat: ChatState) => ({
        ...prevChat,
        isGenerating: false,
        abortController: null
      }))
    }
  }

  const handleSendMessage = async (
    messageContent: string,
    chatMessages: ChatMessage[],
    isRegeneration: boolean
  ) => {
    if (isGenerating) {
      return
    }

    if (
      (!messageContent || messageContent === "") &&
      newMessageImages.length === 0 &&
      newMessageFiles.length === 0
    ) {
      return
    }

    try {
      setChat((prevChat: ChatState) => ({
        ...prevChat,
        isGenerating: true,
        firstTokenReceived: false
      }))

      const newAbortController = new AbortController()
      setChat((prevChat: ChatState) => ({
        ...prevChat,
        abortController: newAbortController
      }))

      const modelData = [
        ...models.map((model: ModelObject) => ({
          modelId: model.model_id as LLMID,
          modelName: model.name,
          provider: "custom" as ModelProvider,
          hostedId: model.id,
          platformLink: "",
          imageInput: false
        })),
        ...LLM_LIST
      ]

      let currentChat = selectedChat ? { ...selectedChat } : null

      const b64Images = newMessageImages.map((image: any) => image.base64)

      let retrievedFileItems: Tables<"file_items">[] = []

      if (
        (newMessageFiles.length > 0 || chatFiles.length > 0) &&
        useRetrieval
      ) {
        setChat((prevChat: ChatState) => ({
          ...prevChat,
          toolInUse: "retrieval"
        }))

        retrievedFileItems = await handleRetrieval(
          messageContent,
          [...chatFiles, ...newMessageFiles],
          [],
          chatSettings?.embeddingsProvider || "openai",
          sourceCount || 4
        )

        setChat((prevChat: ChatState) => ({
          ...prevChat,
          chatFileItems: [...chatFileItems, ...retrievedFileItems],
          toolInUse: "none"
        }))
      }

      // Create a new chat if needed
      if (!currentChat) {
        // Directly implement the handleCreateChat functionality
        const response = await fetch("/api/chats", {
          method: "POST",
          body: JSON.stringify({
            chatSettings: chatSettings!,
            profile: profile!,
            workspace: selectedWorkspace!,
            messageContent,
            assistant: selectedAssistant!,
            files: newMessageFiles
          })
        })

        if (!response.ok) {
          throw new Error("Failed to create chat")
        }

        const newChat = await response.json()

        setSelectedChat(newChat)
        setChats((chats: Tables<"chats">[]) => [newChat, ...chats])
        setChatFiles((prev: ChatFile[]) => [...prev, ...newMessageFiles])

        currentChat = newChat

        setChat((prevChat: ChatState) => ({
          ...prevChat,
          selectedChat: newChat,
          newChat: newChat,
          createdMessages: []
        }))

        setChats((prevChats: Tables<"chats">[]) => [...prevChats, newChat])

        router.push(`/chat/${selectedWorkspace!.id}/${newChat.id}`)

        // Create temporary messages with the correct parameters
        const tempUserChatMessage: ChatMessage = {
          message: {
            chat_id: "",
            assistant_id: null,
            content: messageContent,
            created_at: "",
            id: crypto.randomUUID(),
            image_paths: b64Images,
            model: chatSettings!.model,
            role: "user",
            sequence_number: 0,
            updated_at: "",
            user_id: ""
          },
          fileItems: []
        }

        const tempAssistantChatMessage: ChatMessage = {
          message: {
            chat_id: "",
            assistant_id: selectedAssistant?.id || null,
            content: "",
            created_at: "",
            id: crypto.randomUUID(),
            image_paths: [],
            model: chatSettings!.model,
            role: "assistant",
            sequence_number: 1,
            updated_at: "",
            user_id: ""
          },
          fileItems: []
        }

        const tempMessages = [tempUserChatMessage, tempAssistantChatMessage]
        setChatMessages(tempMessages)

        setChat((prevChat: ChatState) => ({
          ...prevChat,
          chatMessages: tempMessages
        }))

        // Create the chat payload for the API
        const chatPayload: ChatPayload = {
          chatSettings: chatSettings!,
          workspaceInstructions: selectedWorkspace?.instructions || "",
          chatMessages: tempMessages,
          assistant: selectedAssistant,
          messageFileItems: [],
          chatFileItems: retrievedFileItems
        }

        // Get the final messages for the API
        const finalMessages = await buildFinalMessages(
          chatPayload,
          profile!,
          chatImages
        )

        setChat((prevChat: ChatState) => ({
          ...prevChat,
          chatMessages: tempMessages
        }))

        const chatResponse = await fetch("/api/chat", {
          method: "POST",
          body: JSON.stringify({
            chatSettings,
            messages: finalMessages,
            model: modelData.find(
              (model: LLMData) => model.modelId === chatSettings?.model
            )
          })
        })

        // Process the response
        let responseText = ""
        if (chatResponse.body) {
          const reader = chatResponse.body.getReader()
          const decoder = new TextDecoder()

          setFirstTokenReceived(true)
          setToolInUse("none")

          try {
            while (true) {
              const { done, value } = await reader.read()
              if (done) break

              const chunk = decoder.decode(value, { stream: true })
              responseText += chunk

              // Update the assistant message with the current response text
              setChatMessages((prev: ChatMessage[]) =>
                prev.map((chatMessage: ChatMessage) => {
                  if (
                    chatMessage.message.id ===
                    tempAssistantChatMessage.message.id
                  ) {
                    return {
                      ...chatMessage,
                      message: {
                        ...chatMessage.message,
                        content: responseText
                      }
                    }
                  }
                  return chatMessage
                })
              )
            }
          } catch (error) {
            console.error("Error reading stream:", error)
          } finally {
            reader.releaseLock()
          }
        }

        // Update the chat messages with the response
        const updatedChatMessages = tempMessages.map(msg => {
          if (msg.message.role === "assistant") {
            return {
              ...msg,
              message: {
                ...msg.message,
                content: responseText
              }
            }
          }
          return msg
        })

        setChat((prevChat: ChatState) => ({
          ...prevChat,
          chatMessages: updatedChatMessages,
          updatedChatMessages: updatedChatMessages,
          isGenerating: false,
          abortController: null,
          newMessageImages: [],
          newMessageFiles: []
        }))

        const updatedChat = {
          ...newChat,
          updated_at: new Date().toISOString()
        }

        setChats((prevChats: Tables<"chats">[]) => {
          const updatedChats = prevChats.map((prevChat: Tables<"chats">) =>
            prevChat.id === updatedChat.id ? updatedChat : prevChat
          )

          return updatedChats
        })
      } else {
        // Handle existing chat
        // Directly implement the handleCreateMessages functionality
        const response = await fetch(`/api/messages/${currentChat.id}`, {
          method: "POST",
          body: JSON.stringify({
            chatMessages,
            chat: currentChat,
            profile: profile!,
            model: modelData.find(
              (model: LLMData) => model.modelId === chatSettings?.model
            )!,
            messageContent,
            generatedText: "",
            newMessageImages,
            isRegeneration,
            retrievedFileItems
          })
        })

        if (!response.ok) {
          throw new Error("Failed to create messages")
        }

        // Create temporary messages for existing chat
        const tempUserChatMessage: ChatMessage = {
          message: {
            chat_id: "",
            assistant_id: null,
            content: messageContent,
            created_at: "",
            id: crypto.randomUUID(),
            image_paths: b64Images,
            model: chatSettings!.model,
            role: "user",
            sequence_number: chatMessages.length,
            updated_at: "",
            user_id: ""
          },
          fileItems: []
        }

        const tempAssistantChatMessage: ChatMessage = {
          message: {
            chat_id: "",
            assistant_id: selectedAssistant?.id || null,
            content: "",
            created_at: "",
            id: crypto.randomUUID(),
            image_paths: [],
            model: chatSettings!.model,
            role: "assistant",
            sequence_number: chatMessages.length + 1,
            updated_at: "",
            user_id: ""
          },
          fileItems: []
        }

        const newTempMessages = [tempUserChatMessage, tempAssistantChatMessage]
        const tempMessages = isRegeneration
          ? chatMessages
          : [...chatMessages, ...newTempMessages]

        setChatMessages(tempMessages)

        setChat((prevChat: ChatState) => ({
          ...prevChat,
          chatMessages: tempMessages
        }))

        // Create the chat payload for the API
        const chatPayload: ChatPayload = {
          chatSettings: chatSettings!,
          workspaceInstructions: selectedWorkspace?.instructions || "",
          chatMessages: tempMessages,
          assistant: selectedAssistant,
          messageFileItems: [],
          chatFileItems: retrievedFileItems
        }

        // Get the final messages for the API
        const finalMessages = await buildFinalMessages(
          chatPayload,
          profile!,
          chatImages
        )

        setChat((prevChat: ChatState) => ({
          ...prevChat,
          chatMessages: tempMessages
        }))

        const chatResponse = await fetch("/api/chat", {
          method: "POST",
          body: JSON.stringify({
            chatSettings,
            messages: finalMessages,
            model: modelData.find(
              (model: LLMData) => model.modelId === chatSettings?.model
            )
          })
        })

        // Process the response
        let responseText = ""
        if (chatResponse.body) {
          const reader = chatResponse.body.getReader()
          const decoder = new TextDecoder()

          setFirstTokenReceived(true)
          setToolInUse("none")

          try {
            while (true) {
              const { done, value } = await reader.read()
              if (done) break

              const chunk = decoder.decode(value, { stream: true })
              responseText += chunk

              // Update the assistant message with the current response text
              setChatMessages((prev: ChatMessage[]) =>
                prev.map((chatMessage: ChatMessage) => {
                  if (
                    chatMessage.message.id ===
                    tempAssistantChatMessage.message.id
                  ) {
                    return {
                      ...chatMessage,
                      message: {
                        ...chatMessage.message,
                        content: responseText
                      }
                    }
                  }
                  return chatMessage
                })
              )
            }
          } catch (error) {
            console.error("Error reading stream:", error)
          } finally {
            reader.releaseLock()
          }
        }

        // Update the chat messages with the response
        const updatedChatMessages = tempMessages.map(msg => {
          if (
            msg.message.role === "assistant" &&
            msg.message.id === tempAssistantChatMessage.message.id
          ) {
            return {
              ...msg,
              message: {
                ...msg.message,
                content: responseText
              }
            }
          }
          return msg
        })

        setChat((prevChat: ChatState) => ({
          ...prevChat,
          chatMessages: updatedChatMessages,
          updatedChatMessages: updatedChatMessages,
          isGenerating: false,
          abortController: null,
          userInput: "",
          newMessageImages: [],
          newMessageFiles: []
        }))

        const updatedChat = {
          ...currentChat,
          updated_at: new Date().toISOString()
        }

        // Fix the updateChat call by providing the correct arguments
        await updateChat(updatedChat.id, updatedChat)

        setChats((prevChats: Tables<"chats">[]) => {
          const updatedChats = prevChats.map((prevChat: Tables<"chats">) =>
            prevChat.id === updatedChat.id ? updatedChat : prevChat
          )

          return updatedChats
        })
      }

      setChat((prevChat: ChatState) => ({
        ...prevChat,
        isPromptPickerOpen: false,
        isFilePickerOpen: false
      }))
    } catch (error) {
      console.error(error)
      setChat((prevChat: ChatState) => ({
        ...prevChat,
        isGenerating: false,
        abortController: null
      }))
    }
  }

  const handleSendEdit = async (
    editedContent: string,
    sequenceNumber: number
  ) => {
    await deleteMessagesIncludingAndAfter(
      selectedChat!.id,
      sequenceNumber.toString(), // Convert number to string
      0
    )

    const filteredMessages = chatMessages.filter(
      (chatMessage: ChatMessage) =>
        chatMessage.message.sequence_number < sequenceNumber
    )

    setChat((prevChat: ChatState) => ({
      ...prevChat,
      chatMessages: filteredMessages
    }))

    handleSendMessage(editedContent, filteredMessages, false)
  }

  return {
    handleNewChat,
    handleSendMessage,
    handleSendEdit,
    handleStopMessage,
    handleFocusChatInput,
    chatInputRef
  }
}
