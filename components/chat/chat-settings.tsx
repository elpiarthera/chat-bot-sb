import { ChatbotUIContext } from "@/context/context"
import { CHAT_SETTING_LIMITS } from "@/lib/chat-setting-limits"
import useHotkey from "@/lib/hooks/use-hotkey"
import { LLMID, ModelProvider, ChatSettings as ChatSettingsType } from "@/types"
import { IconAdjustmentsHorizontal } from "@tabler/icons-react"
import { FC, ReactNode, useContext, useEffect, useRef, useState } from "react"
import { ChatSettingsForm } from "../ui/chat-settings-form"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"

interface ChatSettingsProps {}

export const ChatSettings: FC<ChatSettingsProps> = (): ReactNode => {
  useHotkey("i", () => handleClick())

  // Use type assertion to access properties that exist in the context
  const context = useContext(ChatbotUIContext) as any
  const chatSettings = context.chatSettings
  const setChatSettings = context.setChatSettings
  const models = context.models || []
  const availableHostedModels = context.availableHostedModels || []
  const availableLocalModels = context.availableLocalModels || []
  const availableOpenRouterModels = context.availableOpenRouterModels || []
  const profile = context.profile
  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleClick = () => {
    if (buttonRef.current) {
      buttonRef.current.click()
    }
  }

  useEffect(() => {
    if (!chatSettings) {
      // Initialize with default settings if none exist
      setChatSettings({
        model: "gpt-4" as LLMID,
        prompt: "You are a helpful AI assistant.",
        temperature: 0.7,
        contextLength: 4096,
        includeProfileContext: true,
        includeWorkspaceInstructions: true,
        embeddingsProvider: "openai"
      })
      return
    }

    // Ensure settings are within model limits
    if (chatSettings.model) {
      const modelId = chatSettings.model as LLMID
      const modelLimits = CHAT_SETTING_LIMITS[modelId]

      if (modelLimits) {
        setChatSettings({
          ...chatSettings,
          temperature: Math.min(
            chatSettings.temperature,
            modelLimits.MAX_TEMPERATURE || 1
          ),
          contextLength: Math.min(
            chatSettings.contextLength,
            modelLimits.MAX_CONTEXT_LENGTH || 4096
          )
        })
      }
    }
  }, [chatSettings, chatSettings?.model, setChatSettings])

  const allModels = [
    ...models.map((model: any) => ({
      modelId: model.model_id as LLMID,
      modelName: model.name,
      provider: "custom" as ModelProvider,
      hostedId: model.id,
      platformLink: "",
      imageInput: false
    })),
    ...availableHostedModels,
    ...availableLocalModels,
    ...availableOpenRouterModels
  ]

  const fullModel = allModels.find(
    (llm: any) => llm.modelId === (chatSettings?.model || "gpt-4")
  )

  if (!profile) return null

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          ref={buttonRef}
          className="ring-offset-background focus-visible:ring-ring hover:bg-accent hover:text-accent-foreground flex h-10 items-center justify-center space-x-2 whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors hover:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        >
          <div className="max-w-[120px] truncate text-lg sm:max-w-[300px] lg:max-w-[500px]">
            {fullModel?.modelName || chatSettings?.model || "Select Model"}
          </div>
          <IconAdjustmentsHorizontal size={28} />
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="bg-background relative flex max-h-[calc(100vh-60px)] w-[300px] flex-col space-y-4 overflow-auto rounded-lg border p-4 shadow-lg sm:w-[350px] md:w-[400px] lg:w-[500px]"
        align="end"
        side="bottom"
        sideOffset={8}
      >
        <div className="flex flex-col space-y-4">
          <div className="text-lg font-semibold">Model Settings</div>
          {chatSettings && (
            <ChatSettingsForm
              chatSettings={chatSettings}
              onChangeChatSettings={setChatSettings}
              useAdvancedDropdown={true}
              showTooltip={true}
            />
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
