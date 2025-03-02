import { ChatbotUIContext } from "@/context/context"
import { WORKSPACE_INSTRUCTIONS_MAX } from "@/db/limits"
import {
  getWorkspaceImageFromStorage,
  uploadWorkspaceImage
} from "@/db/storage/workspace-images"
import { updateWorkspace } from "@/db/workspaces"
import { convertBlobToBase64 } from "@/lib/blob-to-b64"
import { LLMID } from "@/types"
import { IconHome, IconSettings, IconShare } from "@tabler/icons-react"
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
import { ShareWorkspaceModal } from "./share-workspace-modal"
import { Tables } from "@/supabase/types"
import { WorkspaceImage } from "@/types"

interface WorkspaceSettingsProps {}

export const WorkspaceSettings: FC<WorkspaceSettingsProps> = ({}) => {
  // Use type assertion to access properties that TypeScript doesn't recognize
  const context = useContext(ChatbotUIContext)
  const {
    profile,
    selectedWorkspace,
    setSelectedWorkspace,
    setWorkspaces,
    setChatSettings,
    workspaceImages,
    setWorkspaceImages
  } = context as any

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

  // Add state for share modal
  const [isShareOpen, setIsShareOpen] = useState(false)

  useEffect(() => {
    const workspaceImage =
      workspaceImages.find(
        (image: WorkspaceImage) => image.path === selectedWorkspace?.image_path
      )?.base64 || ""

    setImageLink(workspaceImage)
  }, [workspaceImages, selectedWorkspace])

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
        setWorkspaceImages((prev: WorkspaceImage[]) => [
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
    setWorkspaces((workspaces: Tables<"workspaces">[]) => {
      return workspaces.map((workspace: Tables<"workspaces">) => {
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
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <IconSettings size={20} />
          </Button>
        </SheetTrigger>

        <SheetContent className="flex w-full flex-col sm:max-w-md">
          <SheetHeader className="flex flex-row items-center justify-between">
            <SheetTitle className="flex">Workspace Settings</SheetTitle>

            {selectedWorkspace?.is_home ? (
              <div className="flex cursor-default items-center px-1">
                <IconHome size={20} className="text-blue-500" />
              </div>
            ) : (
              <DeleteWorkspace
                workspace={selectedWorkspace}
                onDelete={() => setIsOpen(false)}
              />
            )}
          </SheetHeader>

          <div className="mt-4 flex items-center justify-end gap-2">
            {selectedWorkspace && (
              <Button
                onClick={() => setIsShareOpen(true)}
                variant="outline"
                className="flex items-center gap-1"
              >
                <IconShare size={16} />
                Share
              </Button>
            )}
          </div>

          {selectedWorkspace && (
            <ShareWorkspaceModal
              workspace={selectedWorkspace}
              isOpen={isShareOpen}
              onOpenChange={setIsShareOpen}
            />
          )}

          <div className="grow overflow-auto">
            <Tabs defaultValue="general" className="mt-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="models">Models</TabsTrigger>
              </TabsList>

              <TabsContent
                value="general"
                className="flex flex-col gap-4 py-4"
                onKeyDown={handleKeyDown}
              >
                <div className="flex flex-col gap-2">
                  <Label>Name</Label>

                  <Input
                    placeholder="Workspace name..."
                    value={name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setName(e.target.value)
                    }
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label>Image</Label>

                  <ImagePicker
                    src={imageLink}
                    image={selectedImage}
                    onImageChange={setSelectedImage}
                    onSrcChange={setImageLink}
                    width={100}
                    height={100}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label>Description</Label>

                  <Input
                    placeholder="Workspace description..."
                    value={description}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setDescription(e.target.value)
                    }
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Label>Instructions</Label>

                    <LimitDisplay
                      used={instructions.length}
                      limit={WORKSPACE_INSTRUCTIONS_MAX}
                    />
                  </div>

                  <TextareaAutosize
                    placeholder="Workspace instructions..."
                    value={instructions}
                    onValueChange={setInstructions}
                    maxLength={WORKSPACE_INSTRUCTIONS_MAX}
                    className="nodrag flex max-h-[300px] min-h-[100px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label>Default Chat Settings</Label>

                  <ChatSettingsForm
                    chatSettings={defaultChatSettings as any}
                    onChangeChatSettings={setDefaultChatSettings}
                    useAdvancedDropdown={true}
                    showTooltip={true}
                  />
                </div>
              </TabsContent>

              <TabsContent
                value="models"
                className="flex flex-col gap-4 py-4"
                onKeyDown={handleKeyDown}
              >
                <div className="flex flex-col gap-2">
                  <Label>Active Models</Label>

                  <WorkspaceActiveModels
                    workspaceId={selectedWorkspace.id}
                    onActiveModelsChange={setActiveModels}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="mt-auto flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>

            <Button ref={buttonRef} onClick={handleSave}>
              Save
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
