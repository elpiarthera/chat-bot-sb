import { Tables } from "@/supabase/types"
import { IconRobotFace } from "@tabler/icons-react"
import Image from "next/image"
import { FC } from "react"

interface AssistantItemProps {
  assistant: Tables<"assistants">
}

export const AssistantItem: FC<AssistantItemProps> = ({ assistant }) => {
  return (
    <div className="hover:bg-accent flex items-center rounded p-2">
      <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10">
        {assistant.image_path ? (
          <Image
            src={assistant.image_path}
            alt={assistant.name}
            width={32}
            height={32}
            className="rounded"
          />
        ) : (
          <IconRobotFace size={20} />
        )}
      </div>

      <div className="ml-3 flex flex-col">
        <div className="font-bold">{assistant.name}</div>
        <div className="truncate text-sm opacity-80">
          {assistant.description || "No description."}
        </div>
      </div>
    </div>
  )
}
