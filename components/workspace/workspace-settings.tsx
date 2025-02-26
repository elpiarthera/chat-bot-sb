import { ChatbotUIContext } from "@/context/context"
import { WORKSPACE_INSTRUCTIONS_MAX } from "@/db/limits"
import {
  getWorkspaceImageFromStorage,
  uploadWorkspaceImage
} from "@/db/storage/workspace-images"
import { updateWorkspace } from "@/db/workspaces"
import { convertBlobToBase64 } from "@/lib/blob-to-b64"
import { LLMID } from "@/types"
import { IconHome, IconSettings } from "@tabler/icons-react"
import { FC, useContext, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { Button } from "../ui/button"
import { ChatSettingsForm } from "../ui/chat-settings-form"
import ImagePicker from "../ui/image-picker"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { LimitDisplay } from "../ui/limit-display"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "../ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { TextareaAutosize } from "../ui/textarea-autosize"
import { WithTooltip } from "../ui/with-tooltip"
import { DeleteWorkspace } from "./delete-workspace"
import { updateWorkspaceActiveModels } from "@/db/workspace-active-models"
import { WorkspaceActiveModels } from "./workspace-active-models"

interface WorkspaceSettingsProps {}

export const WorkspaceSettings: FC<WorkspaceSettingsProps> = ({}) => {
  const {
    profile,
    selectedWorkspace,
    setSelectedWorkspace,
    setWorkspaces,
    setChatSettings,
    workspaceImages,
    setWorkspaceImages
  } = useContext(ChatbotUIContext)

  const buttonRef = useRef<HTMLButtonElement>(null)

  const [isOpen, setIsOpen] = useState(false)

  const [name, setName] = useState(selectedWorkspace?.name || "")
  const [imageLink, setImageLink] = useState("")
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [description, setDescription] = useState(
    selectedWorkspace?.description || ""
  )
  const [instructions, setInstructions] = useState(
    selectedWorkspace?.instructions || ""
  )

  const [defaultChatSettings, setDefaultChatSettings] = useState({
    model: selectedWorkspace?.default_model,
    prompt: selectedWorkspace?.default_prompt,
    temperature: selectedWorkspace?.default_temperature,
    contextLength: selectedWorkspace?.default_context_length,
    includeProfileContext: selectedWorkspace?.include_profile_context,
    includeWorkspaceInstructions:
      selectedWorkspace?.include_workspace_instructions,
    embeddingsProvider: selectedWorkspace?.embeddings_provider
  })

  // Add state for active models
  const [activeModels, setActiveModels] = useState<
    { modelId: string; provider: string }[]
  >([])

  useEffect(() => {
    const workspaceImage =
      workspaceImages.find(
        image => image.path === selectedWorkspace?.image_path
      )?.base64 || ""

    setImageLink(workspaceImage)
  }, [workspaceImages])

  const handleSave = async () => {
    if (!selectedWorkspace) return

    let imagePath = ""

    if (selectedImage) {
      imagePath = await uploadWorkspaceImage(selectedWorkspace, selectedImage)

      const url = (await getWorkspaceImageFromStorage(imagePath)) || ""

      if (url) {
        const response = await fetch(url)
        const blob = await response.blob()
        const base64 = await convertBlobToBase64(blob)

        setWorkspaceImages(prev => [
          ...prev,
          {
            workspaceId: selectedWorkspace.id,
            path: imagePath,
            base64,
            url
          }
        ])
      }
    }

    const updatedWorkspace = await updateWorkspace(selectedWorkspace.id, {
      ...selectedWorkspace,
      name,
      description,
      image_path: imagePath,
      instructions,
      default_model: defaultChatSettings.model,
      default_prompt: defaultChatSettings.prompt,
      default_temperature: defaultChatSettings.temperature,
      default_context_length: defaultChatSettings.contextLength,
      embeddings_provider: defaultChatSettings.embeddingsProvider,
      include_profile_context: defaultChatSettings.includeProfileContext,
      include_workspace_instructions:
        defaultChatSettings.includeWorkspaceInstructions
    })

    // Save active models
    if (profile) {
      console.log("Debug - Saving active models:", {
        workspaceId: selectedWorkspace.id,
        userId: profile.id,
        activeModels: activeModels
      })

      try {
        // Use the API route instead of direct database access
        const response = await fetch(
          `/api/workspaces/${selectedWorkspace.id}/active-models`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({ activeModels })
          }
        )

        console.log("Save active models response status:", response.status)

        if (!response.ok) {
          const errorText = await response.text()
          let errorMessage = "Failed to save active models"

          try {
            const errorData = JSON.parse(errorText)
            errorMessage = errorData.error || errorMessage
          } catch (parseError) {
            console.error("Error parsing error response:", parseError)
            // Use the raw text if we can't parse JSON
            errorMessage = `Failed to save active models: ${errorText}`
          }

          console.error("Error saving active models:", errorMessage)
          toast.error(errorMessage)
        } else {
          console.log("Active models saved successfully")
        }
      } catch (error) {
        console.error("Exception saving active models:", error)
        toast.error("Failed to save active models. Please try again.")
      }
    }

    if (
      defaultChatSettings.model &&
      defaultChatSettings.prompt &&
      defaultChatSettings.temperature &&
      defaultChatSettings.contextLength &&
      defaultChatSettings.includeProfileContext &&
      defaultChatSettings.includeWorkspaceInstructions &&
      defaultChatSettings.embeddingsProvider
    ) {
      setChatSettings({
        model: defaultChatSettings.model as LLMID,
        prompt: defaultChatSettings.prompt,
        temperature: defaultChatSettings.temperature,
        contextLength: defaultChatSettings.contextLength,
        includeProfileContext: defaultChatSettings.includeProfileContext,
        includeWorkspaceInstructions:
          defaultChatSettings.includeWorkspaceInstructions,
        embeddingsProvider: defaultChatSettings.embeddingsProvider as
          | "openai"
          | "local"
      })
    }

    setIsOpen(false)
    setSelectedWorkspace(updatedWorkspace)
    setWorkspaces(workspaces => {
      return workspaces.map(workspace => {
        if (workspace.id === selectedWorkspace.id) {
          return updatedWorkspace
        }

        return workspace
      })
    })

    toast.success("Workspace updated!")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      buttonRef.current?.click()
    }
  }

  if (!selectedWorkspace || !profile) return null

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <WithTooltip
          display={<div>Workspace Settings</div>}
          trigger={
            <IconSettings
              className="ml-3 cursor-pointer pr-[5px] hover:opacity-50"
              size={32}
              onClick={() => setIsOpen(true)}
            />
          }
        />
      </SheetTrigger>

      <SheetContent
        className="flex flex-col justify-between"
        side="left"
        onKeyDown={handleKeyDown}
      >
        <div className="grow overflow-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center justify-between">
              Workspace Settings
              {selectedWorkspace?.is_home && <IconHome />}
            </SheetTitle>

            {selectedWorkspace?.is_home && (
              <div className="text-sm font-light">
                This is your home workspace for personal use.
              </div>
            )}
          </SheetHeader>

          <Tabs defaultValue="main">
            <TabsList className="mt-4 grid w-full grid-cols-3">
              <TabsTrigger value="main">Main</TabsTrigger>
              <TabsTrigger value="defaults">Defaults</TabsTrigger>
              <TabsTrigger value="models">Models</TabsTrigger>
            </TabsList>

            <TabsContent className="mt-4 space-y-4" value="main">
              <>
                <div className="space-y-1">
                  <Label>Workspace Name</Label>

                  <Input
                    placeholder="Name..."
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>

                {/* <div className="space-y-1">
                  <Label>Description</Label>

                  <Input
                    placeholder="Description... (optional)"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                </div> */}

                <div className="space-y-1">
                  <Label>Workspace Image</Label>

                  <ImagePicker
                    src={imageLink}
                    image={selectedImage}
                    onSrcChange={setImageLink}
                    onImageChange={setSelectedImage}
                    width={50}
                    height={50}
                  />
                </div>
              </>

              <div className="space-y-1">
                <Label>
                  How would you like the AI to respond in this workspace?
                </Label>

                <TextareaAutosize
                  placeholder="Instructions... (optional)"
                  value={instructions}
                  onValueChange={setInstructions}
                  minRows={5}
                  maxRows={10}
                  maxLength={1500}
                />

                <LimitDisplay
                  used={instructions.length}
                  limit={WORKSPACE_INSTRUCTIONS_MAX}
                />
              </div>
            </TabsContent>

            <TabsContent className="mt-5" value="defaults">
              <div className="mb-4 text-sm">
                These are the settings your workspace begins with when selected.
              </div>

              <ChatSettingsForm
                chatSettings={defaultChatSettings as any}
                onChangeChatSettings={setDefaultChatSettings}
              />
            </TabsContent>

            <TabsContent className="mt-5" value="models">
              <div className="mb-4 text-sm">
                Select which models should be available in this workspace.
              </div>

              {selectedWorkspace && (
                <WorkspaceActiveModels
                  workspaceId={selectedWorkspace.id}
                  onActiveModelsChange={setActiveModels}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div className="mt-6 flex justify-between">
          <div>
            {!selectedWorkspace.is_home && (
              <DeleteWorkspace
                workspace={selectedWorkspace}
                onDelete={() => setIsOpen(false)}
              />
            )}
          </div>

          <div className="space-x-2">
            <Button variant="ghost" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>

            <Button ref={buttonRef} onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
