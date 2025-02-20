import { FC } from "react"
import { Tables } from "@/supabase/types"

interface AssistantDetailsProps {
  assistant: Tables<"assistants">
}

export const AssistantDetails: FC<AssistantDetailsProps> = ({ assistant }) => {
  return (
    <div className="space-y-2 p-2">
      <div className="font-bold">{assistant.name}</div>
      <div className="text-sm opacity-80">{assistant.description}</div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>Model: {assistant.model}</div>
        <div>Temperature: {assistant.temperature}</div>
        <div>Context: {assistant.context_length}</div>
      </div>
    </div>
  )
}
