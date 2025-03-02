import { ChatbotUIContext } from "@/context/context"
import useHotkey from "@/lib/hooks/use-hotkey"
import { IconArrowRight, IconLoader2 } from "@tabler/icons-react"
import {
  FC,
  KeyboardEvent,
  useContext,
  useEffect,
  useRef,
  useState
} from "react"
import { Button } from "../ui/button"
import TextareaAutosize from "react-textarea-autosize"
import { useChatHandler } from "./chat-hooks/use-chat-handler"

interface ChatCommandInputProps {}

export const ChatCommandInput: FC<ChatCommandInputProps> = ({}) => {
  useHotkey("l", () => {
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  })

  const { userInput, setUserInput, isGenerating } = useContext(ChatbotUIContext)

  const { handleStopMessage } = useChatHandler()

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const [isTyping, setIsTyping] = useState<boolean>(false)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [])

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleSendMessage = () => {
    if (userInput.trim() === "") return
    // Instead of using handleSendCommand from context, we'll use a direct approach
    // This is a simplified version - you may need to adjust based on your actual requirements
    const command = userInput.trim()
    // Execute the command (you might need to implement this based on your app's logic)
    console.log(`Executing command: ${command}`)
    setUserInput("")
  }

  return (
    <div className="border-input relative flex w-full items-center justify-center rounded-xl border-2 bg-background px-4">
      <TextareaAutosize
        ref={textareaRef}
        className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring text-md flex w-full resize-none rounded-md border-none px-0 py-3 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        placeholder="Enter a command..."
        onKeyDown={handleKeyDown}
        value={userInput}
        onChange={e => {
          setUserInput(e.target.value)
          setIsTyping(true)
        }}
        onBlur={() => setIsTyping(false)}
        onFocus={() => setIsTyping(true)}
        rows={1}
        spellCheck={false}
        autoFocus
      />

      <div className="flex items-center">
        {isGenerating ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleStopMessage}
          >
            <IconLoader2 className="animate-spin" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleSendMessage}
          >
            <IconArrowRight />
          </Button>
        )}
      </div>
    </div>
  )
}
