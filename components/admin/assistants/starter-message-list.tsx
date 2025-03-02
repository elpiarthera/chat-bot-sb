"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StarterMessage } from "@/lib/assistants/interfaces"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { Trash, RefreshCw, RotateCw } from "lucide-react"

interface StarterMessagesListProps {
  starterMessages: StarterMessage[]
  onChange: (messages: StarterMessage[]) => void
  onGenerateMessages?: () => void
  isGenerating?: boolean
  generationEnabled?: boolean
  maxMessages?: number
}

export function StarterMessagesList({
  starterMessages,
  onChange,
  onGenerateMessages,
  isGenerating = false,
  generationEnabled = true,
  maxMessages = 4
}: StarterMessagesListProps) {
  const [tooltipOpen, setTooltipOpen] = useState(false)

  // Ensure there's always an empty message at the end for adding new ones
  const messages = [...starterMessages]
  if (messages.length === 0 || messages[messages.length - 1].message !== "") {
    if (messages.length < maxMessages) {
      messages.push({ message: "" })
    }
  }

  const handleInputChange = (index: number, value: string) => {
    const updatedMessages = [...messages]
    updatedMessages[index] = { ...updatedMessages[index], message: value }

    // If last input and not empty, add a new empty input (if under max)
    if (
      value &&
      index === updatedMessages.length - 1 &&
      updatedMessages.length < maxMessages
    ) {
      updatedMessages.push({ message: "" })
    }

    // If second last input and empty, and last input is empty, remove last input
    if (
      !value &&
      index === updatedMessages.length - 2 &&
      !updatedMessages[updatedMessages.length - 1].message
    ) {
      updatedMessages.pop()
    }

    onChange(updatedMessages)
  }

  const handleRemoveMessage = (index: number) => {
    const updatedMessages = [...messages]
    updatedMessages.splice(index, 1)

    // Ensure there's at least one message field
    if (updatedMessages.length === 0) {
      updatedMessages.push({ message: "" })
    }

    onChange(updatedMessages)
  }

  const nonEmptyMessageCount = messages.filter(
    msg => msg.message.trim() !== ""
  ).length

  return (
    <div className="flex flex-col gap-2">
      {messages.map((starterMessage, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            value={starterMessage.message}
            onChange={e => handleInputChange(index, e.target.value)}
            placeholder={`Example message ${index + 1}`}
            className="grow"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => handleRemoveMessage(index)}
            disabled={
              (index === messages.length - 1 && !starterMessage.message) ||
              messages.length === 1
            }
            className={`text-muted-foreground hover:text-destructive ${
              (index === messages.length - 1 && !starterMessage.message) ||
              messages.length === 1
                ? "cursor-not-allowed opacity-50"
                : ""
            }`}
          >
            <Trash className="size-4" />
          </Button>
        </div>
      ))}

      {onGenerateMessages && (
        <div className="mt-2 flex items-center gap-2">
          <TooltipProvider delayDuration={50}>
            <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onMouseEnter={() => setTooltipOpen(true)}
                  onMouseLeave={() => setTooltipOpen(false)}
                  onClick={onGenerateMessages}
                  disabled={
                    nonEmptyMessageCount >= maxMessages ||
                    isGenerating ||
                    !generationEnabled
                  }
                  className={`
                    ${
                      nonEmptyMessageCount >= maxMessages ||
                      isGenerating ||
                      !generationEnabled
                        ? "cursor-not-allowed opacity-70"
                        : ""
                    }
                  `}
                >
                  <div className="flex items-center gap-x-2 text-xs">
                    {isGenerating ? (
                      <RefreshCw className="size-4 animate-spin" />
                    ) : (
                      <RotateCw className="size-4" />
                    )}
                    Generate Messages
                  </div>
                </Button>
              </TooltipTrigger>

              {!generationEnabled && (
                <TooltipContent side="top" align="center">
                  <p className="max-w-[200px] text-sm">
                    No AI provider configured. Message generation is not
                    available.
                  </p>
                </TooltipContent>
              )}

              {nonEmptyMessageCount >= maxMessages && (
                <TooltipContent side="top" align="center">
                  <p className="max-w-[200px] text-sm">
                    Maximum of {maxMessages} starter messages allowed
                  </p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </div>
  )
}
