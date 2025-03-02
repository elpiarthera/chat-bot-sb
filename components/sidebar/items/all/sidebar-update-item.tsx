import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet"
import { AssignWorkspaces } from "@/components/workspace/assign-workspaces"
import { ChatbotUIContext } from "@/context/context"
import {
  createAssistantCollection,
  deleteAssistantCollection,
  getAssistantCollectionsByAssistantId
} from "@/db/assistant-collections"
import {
  createAssistantFile,
  deleteAssistantFile,
  getAssistantFilesByAssistantId
} from "@/db/assistant-files"
import {
  createAssistantTool,
  deleteAssistantTool,
  getAssistantToolsByAssistantId
} from "@/db/assistant-tools"
import {
  createAssistantWorkspaces,
  deleteAssistantWorkspace,
  getAssistantWorkspacesByAssistantId,
  updateAssistant
} from "@/db/assistants"
import { updateChat } from "@/db/chats"
import {
  createCollectionFile,
  deleteCollectionFile,
  getCollectionFilesByCollectionId
} from "@/db/collection-files"
import {
  createCollectionWorkspaces,
  deleteCollectionWorkspace,
  getCollectionWorkspacesByCollectionId,
  updateCollection
} from "@/db/collections"
import {
  createFileWorkspaces,
  deleteFileWorkspace,
  getFileWorkspacesByFileId,
  updateFile
} from "@/db/files"
import {
  createModelWorkspaces,
  deleteModelWorkspace,
  getModelWorkspacesByModelId,
  updateModel
} from "@/db/models"
import {
  createPresetWorkspaces,
  deletePresetWorkspace,
  getPresetWorkspacesByPresetId,
  updatePreset
} from "@/db/presets"
import {
  createPromptWorkspaces,
  deletePromptWorkspace,
  getPromptWorkspacesByPromptId,
  updatePrompt
} from "@/db/prompts"
import {
  getAssistantImageFromStorage,
  uploadAssistantImage
} from "@/db/storage/assistant-images"
import {
  createToolWorkspaces,
  deleteToolWorkspace,
  getToolWorkspacesByToolId,
  updateTool
} from "@/db/tools"
import { convertBlobToBase64 } from "@/lib/blob-to-b64"
import { Tables, TablesInsert, TablesUpdate } from "@/supabase/types"
import { CollectionFile, ContentType, DataItemType } from "@/types"
import { FC, ReactNode, useContext, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { SidebarDeleteItem } from "./sidebar-delete-item"

// Define Workspace type to match the one expected by AssignWorkspaces
interface Workspace {
  id: string
  name: string
  [key: string]: any
}

interface SidebarUpdateItemProps {
  isTyping: boolean
  item: DataItemType
  contentType: ContentType
  children: React.ReactNode
  renderInputs: (renderState: any) => JSX.Element
  updateState: any
}

// Extend CollectionFile to include user_id
interface ExtendedCollectionFile extends CollectionFile {
  user_id: string
}

export const SidebarUpdateItem: FC<SidebarUpdateItemProps> = ({
  item,
  contentType,
  children,
  renderInputs,
  updateState,
  isTyping
}): ReactNode => {
  const context = useContext(ChatbotUIContext) as any
  const workspaces = context.workspaces
  const selectedWorkspace = context.selectedWorkspace
  const setChats = context.setChats
  const setPresets = context.setPresets
  const setPrompts = context.setPrompts
  const setFiles = context.setFiles
  const setCollections = context.setCollections
  const setAssistants = context.setAssistants
  const setTools = context.setTools
  const setModels = context.setModels
  const setAssistantImages = context.setAssistantImages
  const buttonRef = useRef<HTMLButtonElement>(null)

  const [isOpen, setIsOpen] = useState(false)
  const [selectedWorkspaces, setSelectedWorkspaces] = useState<
    Tables<"workspaces">[]
  >([])
  const [startingWorkspaces, setStartingWorkspaces] = useState<
    Tables<"workspaces">[]
  >([])

  // Collections Render State
  const [startingCollectionFiles, setStartingCollectionFiles] = useState<
    CollectionFile[]
  >([])
  const [selectedCollectionFiles, setSelectedCollectionFiles] = useState<
    CollectionFile[]
  >([])

  // Assistants Render State
  const [startingAssistantFiles, setStartingAssistantFiles] = useState<
    Tables<"files">[]
  >([])
  const [startingAssistantCollections, setStartingAssistantCollections] =
    useState<Tables<"collections">[]>([])
  const [startingAssistantTools, setStartingAssistantTools] = useState<
    Tables<"tools">[]
  >([])
  const [selectedAssistantFiles, setSelectedAssistantFiles] = useState<
    Tables<"files">[]
  >([])
  const [selectedAssistantCollections, setSelectedAssistantCollections] =
    useState<Tables<"collections">[]>([])
  const [selectedAssistantTools, setSelectedAssistantTools] = useState<
    Tables<"tools">[]
  >([])

  const fetchDataFunctions: Record<
    ContentType,
    ((id: string) => Promise<void>) | null
  > = {
    chats: null,
    presets: null,
    prompts: null,
    files: null,
    collections: async (collectionId: string) => {
      const collectionFiles =
        await getCollectionFilesByCollectionId(collectionId)
      setStartingCollectionFiles(collectionFiles.files)
      setSelectedCollectionFiles([])
    },
    assistants: async (assistantId: string) => {
      const assistantFiles = await getAssistantFilesByAssistantId(assistantId)
      setStartingAssistantFiles(assistantFiles.files)

      const assistantCollections =
        await getAssistantCollectionsByAssistantId(assistantId)
      setStartingAssistantCollections(assistantCollections.collections)

      const assistantTools = await getAssistantToolsByAssistantId(assistantId)
      setStartingAssistantTools(assistantTools.tools)

      setSelectedAssistantFiles([])
      setSelectedAssistantCollections([])
      setSelectedAssistantTools([])
    },
    tools: null,
    models: null
  }

  const fetchWorkpaceFunctions: Record<
    ContentType,
    ((id: string) => Promise<Tables<"workspaces">[]>) | null
  > = {
    chats: null,
    presets: async (presetId: string) => {
      const item = await getPresetWorkspacesByPresetId(presetId)
      return item.workspaces
    },
    prompts: async (promptId: string) => {
      const item = await getPromptWorkspacesByPromptId(promptId)
      return item.workspaces
    },
    files: async (fileId: string) => {
      const item = await getFileWorkspacesByFileId(fileId)
      return item.workspaces
    },
    collections: async (collectionId: string) => {
      const item = await getCollectionWorkspacesByCollectionId(collectionId)
      return item.workspaces
    },
    assistants: async (assistantId: string) => {
      const item = await getAssistantWorkspacesByAssistantId(assistantId)
      return item.workspaces
    },
    tools: async (toolId: string) => {
      const item = await getToolWorkspacesByToolId(toolId)
      return item.workspaces
    },
    models: async (modelId: string) => {
      const item = await getModelWorkspacesByModelId(modelId)
      return item.workspaces
    }
  }

  const fetchSelectedWorkspaces = async () => {
    const fetchFunction = fetchWorkpaceFunctions[contentType]
    if (!fetchFunction) return []

    return await fetchFunction(item.id)
  }

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        if (workspaces && workspaces.length > 1) {
          const fetchedWorkspaces = await fetchSelectedWorkspaces()
          setStartingWorkspaces(fetchedWorkspaces)
          setSelectedWorkspaces(fetchedWorkspaces)
        }

        const fetchDataFunction = fetchDataFunctions[contentType]
        if (!fetchDataFunction) return
        await fetchDataFunction(item.id)
      }

      fetchData()
    }
  }, [
    isOpen,
    contentType,
    item,
    workspaces,
    fetchDataFunctions,
    fetchSelectedWorkspaces
  ])

  const handleWorkspaceUpdates = async (
    startingWorkspaces: Tables<"workspaces">[],
    selectedWorkspaces: Tables<"workspaces">[],
    itemId: string,
    deleteWorkspaceFn: (
      itemId: string,
      workspaceId: string
    ) => Promise<boolean>,
    createWorkspaceFn: (workspaces: any[]) => Promise<any>,
    itemIdKey: string
  ) => {
    if (!selectedWorkspace) return

    const deleteList = startingWorkspaces.filter(
      startingWorkspace =>
        !selectedWorkspaces.some(
          selectedWorkspace => selectedWorkspace.id === startingWorkspace.id
        )
    )

    for (const workspace of deleteList) {
      await deleteWorkspaceFn(itemId, workspace.id)
    }

    if (deleteList.map(w => w.id).includes(selectedWorkspace.id)) {
      stateUpdateFunctions[contentType]((prevItems: any) =>
        prevItems.filter((prevItem: any) => prevItem.id !== item.id)
      )
    }

    const createList = selectedWorkspaces.filter(
      selectedWorkspace =>
        !startingWorkspaces.some(
          startingWorkspace => startingWorkspace.id === selectedWorkspace.id
        )
    )

    if (createList.length > 0) {
      const workspaces = createList.map(workspace => ({
        user_id: workspace.user_id,
        workspace_id: workspace.id,
        [itemIdKey]: itemId
      }))

      await createWorkspaceFn(workspaces)
    }
  }

  const renderState = {
    chats: null,
    presets: null,
    prompts: null,
    files: null,
    collections: {
      startingCollectionFiles,
      setStartingCollectionFiles,
      selectedCollectionFiles,
      setSelectedCollectionFiles
    },
    assistants: {
      startingAssistantFiles,
      setStartingAssistantFiles,
      startingAssistantCollections,
      setStartingAssistantCollections,
      startingAssistantTools,
      setStartingAssistantTools,
      selectedAssistantFiles,
      setSelectedAssistantFiles,
      selectedAssistantCollections,
      setSelectedAssistantCollections,
      selectedAssistantTools,
      setSelectedAssistantTools
    },
    tools: null,
    models: null
  }

  const updateFunctions: Record<
    ContentType,
    (id: string, updateData: any) => Promise<any>
  > = {
    chats: async (chatId: string, updateState: TablesUpdate<"chats">) => {
      const updatedChat = await updateChat(chatId, updateState)
      return updatedChat
    },
    presets: async (presetId: string, updateState: TablesUpdate<"presets">) => {
      const updatedPreset = await updatePreset(presetId, updateState)
      await handleWorkspaceUpdates(
        startingWorkspaces,
        selectedWorkspaces,
        presetId,
        deletePresetWorkspace,
        createPresetWorkspaces,
        "preset_id"
      )
      return updatedPreset
    },
    prompts: async (promptId: string, updateState: TablesUpdate<"prompts">) => {
      const updatedPrompt = await updatePrompt(promptId, updateState)
      await handleWorkspaceUpdates(
        startingWorkspaces,
        selectedWorkspaces,
        promptId,
        deletePromptWorkspace,
        createPromptWorkspaces,
        "prompt_id"
      )
      return updatedPrompt
    },
    files: async (fileId: string, updateState: TablesUpdate<"files">) => {
      const updatedFile = await updateFile(fileId, updateState)
      await handleWorkspaceUpdates(
        startingWorkspaces,
        selectedWorkspaces,
        fileId,
        deleteFileWorkspace,
        createFileWorkspaces,
        "file_id"
      )
      return updatedFile
    },
    collections: async (
      collectionId: string,
      updateState: TablesUpdate<"collections">
    ) => {
      const updatedCollection = await updateCollection(
        collectionId,
        updateState
      )

      const deleteList = startingCollectionFiles.filter(
        startingFile =>
          !selectedCollectionFiles.some(
            selectedFile => selectedFile.id === startingFile.id
          )
      )

      for (const file of deleteList) {
        await deleteCollectionFile(collectionId, file.id)
      }

      for (const selectedFile of selectedCollectionFiles) {
        if (
          !startingCollectionFiles.some(
            startingFile => startingFile.id === selectedFile.id
          )
        ) {
          await createCollectionFile({
            user_id: (selectedFile as ExtendedCollectionFile).user_id,
            collection_id: collectionId,
            file_id: selectedFile.id
          })
        }
      }

      await handleWorkspaceUpdates(
        startingWorkspaces,
        selectedWorkspaces,
        collectionId,
        deleteCollectionWorkspace,
        createCollectionWorkspaces,
        "collection_id"
      )

      return updatedCollection
    },
    assistants: async (
      assistantId: string,
      updateState: TablesUpdate<"assistants"> & { image: File | null }
    ) => {
      const { image, ...rest } = updateState

      let updatedAssistant = await updateAssistant(assistantId, rest)

      if (image) {
        const filePath = await uploadAssistantImage(updatedAssistant, image)
        updatedAssistant = await updateAssistant(assistantId, {
          image_path: filePath
        })

        const url = (await getAssistantImageFromStorage(filePath)) || ""

        if (url) {
          const response = await fetch(url)
          const blob = await response.blob()
          const base64 = await convertBlobToBase64(blob)
          setAssistantImages((prev: any) => [
            ...prev.filter(
              (img: any) => img.assistantId !== updatedAssistant.id
            ),
            {
              assistantId: updatedAssistant.id,
              path: filePath,
              base64,
              url
            }
          ])
        }
      }

      // Handle assistant files
      for (const startingFile of startingAssistantFiles) {
        if (
          !selectedAssistantFiles.some(
            selectedFile => selectedFile.id === startingFile.id
          )
        ) {
          await deleteAssistantFile(assistantId, startingFile.id)
        }
      }

      for (const selectedFile of selectedAssistantFiles) {
        if (
          !startingAssistantFiles.some(
            startingFile => startingFile.id === selectedFile.id
          )
        ) {
          await createAssistantFile({
            user_id: selectedFile.user_id,
            assistant_id: assistantId,
            file_id: selectedFile.id
          })
        }
      }

      // Handle assistant collections
      for (const startingCollection of startingAssistantCollections) {
        if (
          !selectedAssistantCollections.some(
            selectedCollection =>
              selectedCollection.id === startingCollection.id
          )
        ) {
          await deleteAssistantCollection(assistantId, startingCollection.id)
        }
      }

      for (const selectedCollection of selectedAssistantCollections) {
        if (
          !startingAssistantCollections.some(
            startingCollection =>
              startingCollection.id === selectedCollection.id
          )
        ) {
          await createAssistantCollection({
            user_id: selectedCollection.user_id,
            assistant_id: assistantId,
            collection_id: selectedCollection.id
          })
        }
      }

      // Handle assistant tools
      for (const startingTool of startingAssistantTools) {
        if (
          !selectedAssistantTools.some(
            selectedTool => selectedTool.id === startingTool.id
          )
        ) {
          await deleteAssistantTool(assistantId, startingTool.id)
        }
      }

      for (const selectedTool of selectedAssistantTools) {
        if (
          !startingAssistantTools.some(
            startingToolItem => startingToolItem.id === selectedTool.id
          )
        ) {
          await createAssistantTool({
            user_id: selectedTool.user_id,
            assistant_id: assistantId,
            tool_id: selectedTool.id
          })
        }
      }

      await handleWorkspaceUpdates(
        startingWorkspaces,
        selectedWorkspaces,
        assistantId,
        deleteAssistantWorkspace,
        createAssistantWorkspaces,
        "assistant_id"
      )

      return updatedAssistant
    },
    tools: async (toolId: string, updateState: TablesUpdate<"tools">) => {
      const updatedTool = await updateTool(toolId, updateState)
      await handleWorkspaceUpdates(
        startingWorkspaces,
        selectedWorkspaces,
        toolId,
        deleteToolWorkspace,
        createToolWorkspaces,
        "tool_id"
      )
      return updatedTool
    },
    models: async (modelId: string, updateState: TablesUpdate<"models">) => {
      const updatedModel = await updateModel(modelId, updateState)
      await handleWorkspaceUpdates(
        startingWorkspaces,
        selectedWorkspaces,
        modelId,
        deleteModelWorkspace,
        createModelWorkspaces,
        "model_id"
      )
      return updatedModel
    }
  }

  const stateUpdateFunctions: Record<ContentType, any> = {
    chats: setChats,
    presets: setPresets,
    prompts: setPrompts,
    files: setFiles,
    collections: setCollections,
    assistants: setAssistants,
    tools: setTools,
    models: setModels
  }

  const handleUpdate = async () => {
    try {
      if (!selectedWorkspace) return
      if (isTyping) return // Prevent update while typing

      const updateFunction = updateFunctions[contentType]
      const setStateFunction = stateUpdateFunctions[contentType]
      if (!updateFunction || !setStateFunction) return

      const updatedItem = await updateFunction(item.id, updateState)

      setStateFunction((prevItems: any) =>
        prevItems.map((prevItem: any) =>
          prevItem.id === updatedItem.id ? updatedItem : prevItem
        )
      )

      setIsOpen(false)
      toast.success(`${contentType.slice(0, -1)} updated!`)
    } catch (error) {
      toast.error(`Error updating ${contentType.slice(0, -1)}. ${error}.`)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isTyping && e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      buttonRef.current?.click()
    }
  }

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>{children}</SheetTrigger>

        <SheetContent
          className="flex min-w-[450px] flex-col justify-between overflow-auto"
          side="right"
          onKeyDown={handleKeyDown}
        >
          <div className="grow overflow-auto">
            <SheetHeader>
              <SheetTitle className="text-2xl font-bold">
                Update{" "}
                {contentType.charAt(0).toUpperCase() + contentType.slice(1, -1)}
              </SheetTitle>
            </SheetHeader>

            <div className="mt-4 space-y-3">
              {renderInputs(renderState[contentType])}

              {workspaces && workspaces.length > 1 && (
                <div className="space-y-1 pt-2">
                  <Label>Workspaces</Label>

                  <AssignWorkspaces
                    selectedWorkspaces={
                      selectedWorkspaces as unknown as Workspace[]
                    }
                    onSelectWorkspace={(workspace: Workspace) => {
                      if (
                        selectedWorkspaces.some(
                          selectedWorkspace =>
                            selectedWorkspace.id === workspace.id
                        )
                      ) {
                        setSelectedWorkspaces(
                          selectedWorkspaces.filter(
                            selectedWorkspace =>
                              selectedWorkspace.id !== workspace.id
                          )
                        )
                      } else {
                        setSelectedWorkspaces([
                          ...selectedWorkspaces,
                          workspace as Tables<"workspaces">
                        ])
                      }
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <SheetFooter className="mt-2 flex justify-between">
            <SidebarDeleteItem item={item} contentType={contentType} />

            <div className="flex grow justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>

              <Button ref={buttonRef} onClick={handleUpdate}>
                Update
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}
