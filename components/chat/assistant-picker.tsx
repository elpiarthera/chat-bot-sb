import { ChatbotUIContext } from "@/context/context"
import { Tables } from "@/supabase/types"
import { FC, useContext, useEffect, useRef, useState } from "react"
import { Input } from "../ui/input"
import { AssistantItem } from "./items/assistant-item"

interface AssistantPickerProps {}

export const AssistantPicker: FC<AssistantPickerProps> = ({}) => {
  const {
    assistants,
    userInput,
    atCommand,
    focusAssistant,
    setUserInput,
    setAtCommand,
    setFocusAssistant
  } = useContext(ChatbotUIContext)

  const [filteredAssistants, setFilteredAssistants] = useState<
    Tables<"assistants">[]
  >([])

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (focusAssistant) {
      inputRef.current?.focus()
    }
  }, [focusAssistant])

  useEffect(() => {
    if (atCommand) {
      const filtered = assistants.filter(assistant =>
        assistant.name.toLowerCase().includes(atCommand.toLowerCase())
      )

      setFilteredAssistants(filtered)
    } else {
      setFilteredAssistants([])
    }
  }, [atCommand, assistants])

  const handleSelectAssistant = (assistant: Tables<"assistants">) => {
    const atIndex = userInput.lastIndexOf("@")
    if (atIndex !== -1) {
      const newUserInput =
        userInput.slice(0, atIndex) + "@" + assistant.name + " "
      setUserInput(newUserInput)
    }

    setAtCommand("")
    setFocusAssistant(false)
  }

  return (
    <>
      {focusAssistant && (
        <div className="absolute bottom-[60px] z-50 ml-2 max-h-[300px] w-[300px] overflow-auto rounded-xl border-2 bg-background p-2 shadow-xl">
          <div className="p-2">
            <Input
              ref={inputRef}
              className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder="Search assistants..."
              value={atCommand}
              onChange={e => setAtCommand(e.target.value)}
            />
          </div>

          <div className="space-y-1 p-2">
            {filteredAssistants.length > 0 ? (
              filteredAssistants.map(assistant => (
                <div
                  key={assistant.id}
                  className="cursor-pointer"
                  onClick={() => handleSelectAssistant(assistant)}
                >
                  <AssistantItem assistant={assistant} />
                </div>
              ))
            ) : (
              <div className="text-muted-foreground p-1 text-sm">
                No assistants found.
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
