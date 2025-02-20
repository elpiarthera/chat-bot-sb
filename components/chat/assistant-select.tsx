import { FC, useState, useContext } from "react"
import { Tables } from "@/supabase/types"
import { Input } from "../ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "../ui/dropdown-menu"
import {
  IconCheck,
  IconChevronDown,
  IconX,
  IconLoader2
} from "@tabler/icons-react"
import { Button } from "../ui/button"
import { WithTooltip } from "../ui/with-tooltip"
import { AssistantDetails } from "./assistant-details"
import { ChatbotUIContext } from "@/context/context"

interface AssistantSelectProps {
  assistants: Tables<"assistants">[]
  selectedAssistant: Tables<"assistants"> | null
  onAssistantSelect: (assistant: Tables<"assistants"> | null) => void
  isLoading?: boolean
  error?: string | null
}

export const AssistantSelect: FC<AssistantSelectProps> = ({
  assistants,
  selectedAssistant,
  onAssistantSelect,
  isLoading = false,
  error = null
}) => {
  const { selectedChat } = useContext(ChatbotUIContext)
  const [search, setSearch] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const filteredAssistants = assistants.filter(assistant =>
    assistant.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelect = (assistant: Tables<"assistants">) => {
    if (selectedChat) {
      // Show confirmation for existing chat
      const confirmed = window.confirm(
        "Changing the assistant will affect future messages in this chat. Continue?"
      )
      if (!confirmed) return
    }

    onAssistantSelect(assistant)
    setIsOpen(false)
  }

  if (error) {
    return (
      <div className="text-destructive text-sm">
        Error loading assistants: {error}
      </div>
    )
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-[200px] justify-between"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <IconLoader2 className="animate-spin" size={16} />
              <span>Loading...</span>
            </div>
          ) : selectedAssistant ? (
            <div className="flex items-center gap-2">
              <span>{selectedAssistant.name}</span>
              <IconX
                size={16}
                className="cursor-pointer hover:opacity-50"
                onClick={e => {
                  e.stopPropagation()
                  onAssistantSelect(null)
                }}
              />
            </div>
          ) : (
            "Select Assistant"
          )}
          <IconChevronDown size={16} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-[200px] p-2">
        <Input
          placeholder="Search assistants..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="mb-2"
        />
        <div className="max-h-[300px] overflow-auto">
          {filteredAssistants.map(assistant => (
            <WithTooltip
              key={assistant.id}
              display={<AssistantDetails assistant={assistant} />}
              trigger={
                <div
                  className="flex cursor-pointer items-center justify-between rounded px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => {
                    handleSelect(assistant)
                  }}
                >
                  <span className="truncate">{assistant.name}</span>
                  {selectedAssistant?.id === assistant.id && (
                    <IconCheck size={16} />
                  )}
                </div>
              }
            />
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
