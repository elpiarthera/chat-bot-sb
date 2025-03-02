"use client"

import { useChatHandler } from "@/components/chat/chat-hooks/use-chat-handler"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import { ChatbotUIContext } from "@/context/context"
import { createWorkspace } from "@/db/workspaces"
import useHotkey from "@/lib/hooks/use-hotkey"
import {
  IconBuilding,
  IconHome,
  IconPlus,
  IconShare
} from "@tabler/icons-react"
import { ChevronsUpDown } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { FC, useContext, useEffect, useState } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Workspace } from "@/types/workspace"
import { WorkspaceImage } from "@/types"

interface WorkspaceSwitcherProps {}

export const WorkspaceSwitcher: FC<WorkspaceSwitcherProps> = ({}) => {
  useHotkey(";", () => setOpen(prevState => !prevState))

  const context = useContext(ChatbotUIContext)
  // Use type assertion to access properties that TypeScript doesn't recognize
  const {
    workspaces,
    workspaceImages,
    selectedWorkspace,
    setSelectedWorkspace,
    setWorkspaces
  } = context as any

  // Using type assertion to ensure TypeScript recognizes the returned object
  const chatHandler = useChatHandler() as any
  // We'll only use handleNewChat if it exists on the chatHandler

  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (!selectedWorkspace) return

    setValue(selectedWorkspace.id)
  }, [selectedWorkspace])

  const handleCreateWorkspace = async () => {
    if (!selectedWorkspace) return

    const createdWorkspace = await createWorkspace({
      user_id: selectedWorkspace.user_id,
      default_context_length: selectedWorkspace.default_context_length,
      default_model: selectedWorkspace.default_model,
      default_prompt: selectedWorkspace.default_prompt,
      default_temperature: selectedWorkspace.default_temperature,
      description: "",
      embeddings_provider: "openai",
      include_profile_context: selectedWorkspace.include_profile_context,
      include_workspace_instructions:
        selectedWorkspace.include_workspace_instructions,
      instructions: selectedWorkspace.instructions,
      is_home: false,
      name: "New Workspace"
    })

    setWorkspaces([...workspaces, createdWorkspace])
    setSelectedWorkspace(createdWorkspace)
    setOpen(false)

    // Call handleNewChat if it exists on the chatHandler
    if (chatHandler && typeof chatHandler.handleNewChat === "function") {
      chatHandler.handleNewChat()
    }

    return router.push(`/${createdWorkspace.id}/chat`)
  }

  const getWorkspaceName = (workspaceId: string) => {
    const workspace = workspaces.find(
      (workspace: Workspace) => workspace.id === workspaceId
    )

    if (!workspace) return

    return workspace.name
  }

  const handleSelect = (workspaceId: string) => {
    const workspace = workspaces.find(
      (workspace: Workspace) => workspace.id === workspaceId
    )

    if (!workspace) return

    setSelectedWorkspace(workspace)
    setOpen(false)

    return router.push(`/${workspace.id}/chat`)
  }

  const workspaceImage = workspaceImages.find(
    (image: WorkspaceImage) => image.workspaceId === selectedWorkspace?.id
  )
  const imageSrc = workspaceImage
    ? workspaceImage.url
    : selectedWorkspace?.is_home
      ? ""
      : ""

  const IconComponent = selectedWorkspace?.is_home ? IconHome : IconBuilding
  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          className="border-input flex h-[36px]
          w-full cursor-pointer items-center justify-between rounded-md border px-2 py-1 hover:opacity-50"
        >
          <div className="flex items-center truncate">
            {selectedWorkspace && (
              <div className="flex items-center">
                {workspaceImage ? (
                  <Image
                    style={{ width: "22px", height: "22px" }}
                    className="mr-2 rounded"
                    src={imageSrc}
                    width={22}
                    height={22}
                    alt={selectedWorkspace.name}
                  />
                ) : (
                  <IconComponent className="mb-0.5 mr-2" size={22} />
                )}
              </div>
            )}

            {getWorkspaceName(value) || "Select workspace..."}

            {selectedWorkspace &&
              // @ts-ignore - is_shared may not be in the type definition but is added at runtime
              selectedWorkspace.is_shared && (
                <div className="ml-2 flex items-center">
                  <IconShare size={14} className="text-muted-foreground" />
                </div>
              )}
          </div>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </PopoverTrigger>

        <PopoverContent className="p-2">
          <div className="space-y-2">
            <Button
              className="flex w-full items-center space-x-2"
              size="sm"
              onClick={handleCreateWorkspace}
            >
              <IconPlus />
              <div className="ml-2">New Workspace</div>
            </Button>

            <Input
              placeholder="Search workspaces..."
              autoFocus
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearch(e.target.value)
              }
            />

            <div className="flex flex-col space-y-1">
              {workspaces
                .filter((workspace: Workspace) => workspace.is_home)
                .map((workspace: Workspace) => {
                  const image = workspaceImages.find(
                    (image: WorkspaceImage) =>
                      image.workspaceId === workspace.id
                  )

                  return (
                    <Button
                      key={workspace.id}
                      className="flex items-center justify-start"
                      variant="ghost"
                      onClick={() => handleSelect(workspace.id)}
                    >
                      {image ? (
                        <Image
                          style={{ width: "28px", height: "28px" }}
                          className="mr-3 rounded"
                          src={image.url || ""}
                          width={28}
                          height={28}
                          alt={workspace.name}
                        />
                      ) : (
                        <IconHome className="mr-3" size={28} />
                      )}

                      <div className="text-lg font-semibold">
                        {workspace.name}
                      </div>
                    </Button>
                  )
                })}

              {workspaces
                .filter(
                  (workspace: Workspace) =>
                    !workspace.is_home &&
                    !(workspace as any).is_shared &&
                    workspace.name.toLowerCase().includes(search.toLowerCase())
                )
                .sort((a: Workspace, b: Workspace) =>
                  a.name.localeCompare(b.name)
                )
                .map((workspace: Workspace) => {
                  const image = workspaceImages.find(
                    (image: WorkspaceImage) =>
                      image.workspaceId === workspace.id
                  )

                  return (
                    <Button
                      key={workspace.id}
                      className="flex items-center justify-start"
                      variant="ghost"
                      onClick={() => handleSelect(workspace.id)}
                    >
                      {image ? (
                        <Image
                          style={{ width: "28px", height: "28px" }}
                          className="mr-3 rounded"
                          src={image.url || ""}
                          width={28}
                          height={28}
                          alt={workspace.name}
                        />
                      ) : (
                        <IconBuilding className="mr-3" size={28} />
                      )}

                      <div className="text-lg font-semibold">
                        {workspace.name}
                      </div>
                    </Button>
                  )
                })}

              {/* Shared Workspaces Section */}
              {workspaces.some(
                (workspace: Workspace) =>
                  // @ts-ignore - is_shared may not be in the type definition but is added at runtime
                  (workspace as any).is_shared
              ) && (
                <div className="mt-2 border-t pt-2">
                  <div className="text-muted-foreground mb-1 px-2 text-sm">
                    Shared with me
                  </div>

                  {workspaces
                    .filter(
                      (workspace: Workspace) =>
                        // @ts-ignore - is_shared may not be in the type definition but is added at runtime
                        (workspace as any).is_shared &&
                        workspace.name
                          .toLowerCase()
                          .includes(search.toLowerCase())
                    )
                    .sort((a: Workspace, b: Workspace) =>
                      a.name.localeCompare(b.name)
                    )
                    .map((workspace: Workspace) => {
                      const image = workspaceImages.find(
                        (image: WorkspaceImage) =>
                          image.workspaceId === workspace.id
                      )

                      return (
                        <Button
                          key={workspace.id}
                          className="flex items-center justify-start"
                          variant="ghost"
                          onClick={() => handleSelect(workspace.id)}
                        >
                          <div className="flex items-center">
                            {image ? (
                              <Image
                                style={{ width: "28px", height: "28px" }}
                                className="mr-3 rounded"
                                src={image.url || ""}
                                width={28}
                                height={28}
                                alt={workspace.name}
                              />
                            ) : (
                              <IconBuilding className="mr-3" size={28} />
                            )}

                            <div className="text-lg font-semibold">
                              {workspace.name}
                            </div>
                            <IconShare
                              size={14}
                              className="text-muted-foreground ml-2"
                            />
                          </div>
                        </Button>
                      )
                    })}
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </>
  )
}
