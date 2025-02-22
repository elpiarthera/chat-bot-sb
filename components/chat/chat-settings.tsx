import { ChatbotUIContext } from "@/context/context"
import { CHAT_SETTING_LIMITS } from "@/lib/chat-setting-limits"
import useHotkey from "@/lib/hooks/use-hotkey"
import { LLMID, ModelProvider } from "@/types"
import { IconAdjustmentsHorizontal } from "@tabler/icons-react"
import { FC, useContext, useEffect, useRef } from "react"
import { Button } from "../ui/button"
import { ChatSettingsForm } from "../ui/chat-settings-form"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"

interface ChatSettingsProps {}

export const ChatSettings: FC<ChatSettingsProps> = ({}) => {
  useHotkey("i", () => handleClick())

  const {
    chat,
    setChat,
    models,
    availableLocalModels,
    availableOpenRouterModels
  } = useContext(ChatbotUIContext)

  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleClick = () => {
    if (buttonRef.current) {
      buttonRef.current.click()
    }
  }

  useEffect(() => {
    if (chat.settings) {
      setChat(prevChat => ({
        ...prevChat,
        chatSettings: chat.settings
      }))
    }
  }, [chat.settings, setChat])

  useEffect(() => {
    if (!chat.settings) return

    setChat(prevChat => ({
      ...prevChat,
      settings: {
        ...chat.settings,
        temperature: Math.min(
          chat.settings.temperature,
          CHAT_SETTING_LIMITS[chat.settings.model]?.MAX_TEMPERATURE || 1
        ),
        contextLength: Math.min(
          chat.settings.contextLength,
          CHAT_SETTING_LIMITS[chat.settings.model]?.MAX_CONTEXT_LENGTH || 4096
        )
      }
    }))
  }, [chat.settings?.model])

  if (!chat.settings) return null

  const allModels = [
    ...models.map(model => ({
      modelId: model.model_id as LLMID,
      modelName: model.name,
      provider: "custom" as ModelProvider,
      hostedId: model.id,
      platformLink: "",
      imageInput: false
    })),
    ...availableLocalModels,
    ...availableOpenRouterModels
  ]

  const fullModel = allModels.find(llm => llm.modelId === chat.settings.model)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          ref={buttonRef}
          className="flex size-[32px] items-center justify-center rounded-full p-0"
          variant="ghost"
        >
          <IconAdjustmentsHorizontal size={20} />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[300px] md:w-[400px] lg:w-[500px]"
        side="bottom"
        align="end"
      >
        <ChatSettingsForm
          chatSettings={chat.settings}
          onChangeChatSettings={settings => {
            setChat(prevChat => ({
              ...prevChat,
              settings
            }))
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
