import { useChatHandler } from "@/components/chat/chat-hooks/use-chat-handler"
import { ChatbotUIContext } from "@/context/context"
import { LLM_LIST } from "@/lib/models/llm/llm-list"
import { cn } from "@/lib/utils"
import { Tables } from "@/supabase/types"
import { LLM, LLMID, MessageImage, ModelProvider, ChatFile } from "@/types"
import {
  IconBolt,
  IconCaretDownFilled,
  IconCaretRightFilled,
  IconCircleFilled,
  IconFileText,
  IconMoodSmile,
  IconPencil
} from "@tabler/icons-react"
import Image from "next/image"
import { FC, useContext, useEffect, useRef, useState } from "react"
import { ModelIcon } from "../models/model-icon"
import { Button } from "../ui/button"
import { FileIcon } from "../ui/file-icon"
import { FilePreview } from "../ui/file-preview"
import { TextareaAutosize } from "../ui/textarea-autosize"
import { WithTooltip } from "../ui/with-tooltip"
import { MessageActions } from "./message-actions"
import { MessageMarkdown } from "./message-markdown"

const ICON_SIZE = 32

interface MessageProps {
  message: Tables<"messages">
  fileItems: Tables<"file_items">[]
  isEditing: boolean
  isLast: boolean
  onStartEdit: (message: Tables<"messages">) => void
  onCancelEdit: () => void
  onSubmitEdit: (value: string, sequenceNumber: number) => void
}

export const Message: FC<MessageProps> = ({
  message,
  fileItems,
  isEditing,
  isLast,
  onStartEdit,
  onCancelEdit,
  onSubmitEdit
}) => {
  const context = useContext(ChatbotUIContext) as any
  const {
    assistants,
    profile,
    isGenerating,
    setIsGenerating,
    setChat,
    firstTokenReceived,
    availableLocalModels,
    availableOpenRouterModels,
    chatMessages,
    selectedAssistant,
    chatImages,
    assistantImages,
    toolInUse,
    files,
    models
  } = context

  const handleSendMessage = async (
    message: string,
    chatMessages: any[],
    isRegeneration: boolean
  ) => {
    // This is a placeholder implementation
    // The actual implementation would come from useChatHandler
    console.log("Sending message:", message, isRegeneration)
    return Promise.resolve()
  }

  const editInputRef = useRef<HTMLTextAreaElement>(null)
  const [isHovering, setIsHovering] = useState(false)
  const [editedMessage, setEditedMessage] = useState(message.content)

  const [showImagePreview, setShowImagePreview] = useState(false)
  const [selectedImage, setSelectedImage] = useState<MessageImage | null>(null)

  const [showFileItemPreview, setShowFileItemPreview] = useState(false)
  const [selectedFileItem, setSelectedFileItem] =
    useState<Tables<"file_items"> | null>(null)
  const [viewSources, setViewSources] = useState(false)

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(message.content)
    } else {
      const textArea = document.createElement("textarea")
      textArea.value = message.content
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
    }
  }

  const handleSendEdit = () => {
    onSubmitEdit(editedMessage, message.sequence_number)
    onCancelEdit()
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (isEditing && event.key === "Enter" && event.metaKey) {
      handleSendEdit()
    }
  }

  const handleRegenerate = async () => {
    setIsGenerating(true)
    await handleSendMessage(
      editedMessage || chatMessages[chatMessages.length - 2].message.content,
      chatMessages,
      true
    )
  }

  const handleStartEdit = () => {
    onStartEdit(message)
  }

  useEffect(() => {
    setEditedMessage(message.content)

    if (isEditing && editInputRef.current) {
      const input = editInputRef.current
      input.focus()
      input.setSelectionRange(input.value.length, input.value.length)
    }
  }, [isEditing, message.content])

  const MODEL_DATA = [
    ...models.map((model: any) => ({
      modelId: model.model_id as LLMID,
      modelName: model.name,
      provider: "custom" as ModelProvider,
      hostedId: model.id,
      platformLink: "",
      imageInput: false
    })),
    ...LLM_LIST,
    ...availableLocalModels,
    ...availableOpenRouterModels
  ].find((llm: any) => llm.modelId === message.model) as LLM

  const messageAssistantImage = assistantImages.find(
    (image: any) => image.assistantId === message.assistant_id
  )?.base64

  const selectedAssistantImage = assistantImages.find(
    (image: any) => image.path === selectedAssistant?.image_path
  )?.base64

  const modelDetails = LLM_LIST.find(
    (model: any) => model.modelId === message.model
  )

  const fileAccumulator: Record<
    string,
    {
      id: string
      name: string
      count: number
      type: string
      description: string
    }
  > = {}

  const fileSummary = fileItems.reduce((acc: any, fileItem: any) => {
    const parentFile = files.find((file: any) => file.id === fileItem.file_id)
    if (parentFile) {
      if (!acc[parentFile.id]) {
        acc[parentFile.id] = {
          id: parentFile.id,
          name: parentFile.name,
          count: 1,
          type: parentFile.type,
          description: parentFile.description
        }
      } else {
        acc[parentFile.id].count += 1
      }
    }
    return acc
  }, fileAccumulator)

  return (
    <div
      className={cn(
        "flex w-full justify-center",
        message.role === "user" ? "" : "bg-secondary"
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onKeyDown={handleKeyDown}
    >
      <div className="relative flex w-full flex-col p-6 sm:w-[550px] sm:px-0 md:w-[650px] lg:w-[650px] xl:w-[700px]">
        <div className="absolute right-5 top-7 sm:right-0">
          <MessageActions
            onCopy={handleCopy}
            onEdit={handleStartEdit}
            isAssistant={message.role === "assistant"}
            isLast={isLast}
            isEditing={isEditing}
            isHovering={isHovering}
            onRegenerate={handleRegenerate}
          />
        </div>
        <div className="space-y-3">
          {message.role === "system" ? (
            <div className="flex items-center space-x-4">
              <IconPencil
                className="border-primary bg-primary text-secondary rounded border-DEFAULT p-1"
                size={ICON_SIZE}
              />

              <div className="text-lg font-semibold">Prompt</div>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              {message.role === "assistant" ? (
                messageAssistantImage ? (
                  <Image
                    style={{
                      width: `${ICON_SIZE}px`,
                      height: `${ICON_SIZE}px`
                    }}
                    className="rounded"
                    src={messageAssistantImage}
                    alt="assistant image"
                    height={ICON_SIZE}
                    width={ICON_SIZE}
                  />
                ) : (
                  <WithTooltip
                    display={<div>{MODEL_DATA?.modelName}</div>}
                    trigger={
                      <ModelIcon
                        provider={modelDetails?.provider || "custom"}
                        height={ICON_SIZE}
                        width={ICON_SIZE}
                      />
                    }
                  />
                )
              ) : profile?.image_url ? (
                <Image
                  className={`size-[32px] rounded`}
                  src={profile?.image_url}
                  height={32}
                  width={32}
                  alt="user image"
                />
              ) : (
                <div className="flex size-8 items-center justify-center rounded bg-primary">
                  <IconMoodSmile className="text-secondary" size={20} />
                </div>
              )}

              <div className="text-lg font-semibold">
                {message.role === "user"
                  ? profile?.display_name || "You"
                  : message.assistant_id
                    ? assistants.find(
                        (assistant: any) =>
                          assistant.id === message.assistant_id
                      )?.name || "Assistant"
                    : MODEL_DATA?.modelName || "Assistant"}
              </div>
            </div>
          )}

          {isEditing ? (
            <div className="flex flex-col space-y-3">
              <TextareaAutosize
                textareaRef={editInputRef}
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring text-base focus-visible:ring-offset-0 min-h-[60px] w-full resize-none rounded-md border px-3 py-2 focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Edit message..."
                value={editedMessage}
                onValueChange={setEditedMessage}
                minRows={3}
                maxRows={20}
              />

              <div className="flex justify-end space-x-2">
                <Button size="sm" variant="outline" onClick={onCancelEdit}>
                  Cancel
                </Button>

                <Button size="sm" onClick={handleSendEdit}>
                  Save & Send
                </Button>
              </div>
            </div>
          ) : (
            <>
              <MessageMarkdown content={message.content} />

              {message.image_paths && message.image_paths.length > 0 && (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                  {chatImages
                    .filter((image: any) =>
                      message.image_paths?.includes(image.path)
                    )
                    .map((image: any, index: number) => (
                      <div
                        key={index}
                        className="border-input hover:border-ring flex cursor-pointer items-center justify-center rounded-lg border p-2 transition-colors"
                        onClick={() => {
                          setSelectedImage(image)
                          setShowImagePreview(true)
                        }}
                      >
                        <Image
                          className="rounded-lg"
                          src={image.base64}
                          alt="image"
                          width={300}
                          height={300}
                          style={{
                            width: "auto",
                            height: "auto",
                            maxHeight: "150px"
                          }}
                        />
                      </div>
                    ))}
                </div>
              )}

              {fileItems.length > 0 && (
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center space-x-1">
                    <IconFileText size={18} />
                    <div className="text-xs font-medium">
                      {fileItems.length} source
                      {fileItems.length === 1 ? "" : "s"}
                    </div>

                    <div
                      className="cursor-pointer"
                      onClick={() => setViewSources(!viewSources)}
                    >
                      {viewSources ? (
                        <IconCaretDownFilled size={14} />
                      ) : (
                        <IconCaretRightFilled size={14} />
                      )}
                    </div>
                  </div>

                  {viewSources && (
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {Object.values(fileSummary).map((file: any) => (
                        <div
                          key={file.id}
                          className="border-input hover:border-ring flex cursor-pointer items-center space-x-1 rounded-lg border p-2 transition-colors"
                          onClick={() => {
                            const fileItem = fileItems.find(
                              (fileItem: any) => fileItem.file_id === file.id
                            )
                            if (fileItem) {
                              setSelectedFileItem(fileItem)
                              setShowFileItemPreview(true)
                            }
                          }}
                        >
                          <FileIcon type={file.type} size={28} />

                          <div className="flex flex-col">
                            <div className="text-sm font-medium">
                              {file.name}
                            </div>
                            <div className="text-xs opacity-80">
                              {file.count} chunk{file.count === 1 ? "" : "s"}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {toolInUse !== "none" && isLast && isGenerating && (
                <div className="flex items-center space-x-2">
                  <IconBolt className="animate-pulse" />
                  <div className="animate-pulse">
                    {toolInUse === "retrieval"
                      ? "Retrieving information..."
                      : toolInUse === "web-search"
                        ? "Searching the web..."
                        : toolInUse === "code-executor"
                          ? "Executing code..."
                          : "Processing..."}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showImagePreview && selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowImagePreview(false)}
        >
          <div className="max-h-[80vh] max-w-[80vw]">
            <Image
              className="rounded-lg object-contain"
              src={selectedImage.base64}
              alt="Preview"
              width={1000}
              height={1000}
            />
          </div>
        </div>
      )}

      {showFileItemPreview && selectedFileItem && (
        <FilePreview
          type="file_item"
          item={selectedFileItem}
          isOpen={showFileItemPreview}
          onOpenChange={(isOpen: boolean) => {
            setShowFileItemPreview(isOpen)
            if (!isOpen) setSelectedFileItem(null)
          }}
        />
      )}
    </div>
  )
}
