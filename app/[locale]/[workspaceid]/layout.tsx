"use client"

import { Dashboard } from "@/components/ui/dashboard"
import { ChatbotUIContext } from "@/context/context"
import { getAssistantWorkspacesByWorkspaceId } from "@/db/assistants"
import { getChatsByWorkspaceId } from "@/db/chats"
import { getCollectionWorkspacesByWorkspaceId } from "@/db/collections"
import { getFileWorkspacesByWorkspaceId } from "@/db/files"
import { getFoldersByWorkspaceId } from "@/db/folders"
import { getModelWorkspacesByWorkspaceId } from "@/db/models"
import { getPresetWorkspacesByWorkspaceId } from "@/db/presets"
import { getPromptWorkspacesByWorkspaceId } from "@/db/prompts"
import { getAssistantImageFromStorage } from "@/db/storage/assistant-images"
import { getToolWorkspacesByWorkspaceId } from "@/db/tools"
import { getWorkspaceById } from "@/db/workspaces"
import { convertBlobToBase64 } from "@/lib/blob-to-b64"
import { supabase } from "@/lib/supabase/browser-client"
import { LLMID } from "@/types"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { ReactNode, useContext, useEffect, useState } from "react"
import Loading from "../loading"

interface WorkspaceLayoutProps {
  children: ReactNode
}

export default function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  const router = useRouter()
  const { workspaceid } = useParams()
  const workspaceId = workspaceid as string
  const {
    setChat,
    setAssistants,
    setAssistantImages,
    setChats,
    setCollections,
    setFolders,
    setFiles,
    setPresets,
    setPrompts,
    setTools,
    setModels,
    setSelectedWorkspace
  } = useContext(ChatbotUIContext)
  const [loading, setLoading] = useState(true)

  const fetchWorkspaceData = async (workspaceId: string) => {
    setLoading(true)

    const workspace = await getWorkspaceById(workspaceId)
    setSelectedWorkspace(workspace)

    const assistantData = await getAssistantWorkspacesByWorkspaceId(workspaceId)
    setAssistants(assistantData.assistants)

    for (const assistant of assistantData.assistants) {
      if (assistant.image_path) {
        const imageUrl = await getAssistantImageFromStorage(
          assistant.image_path
        )
        if (imageUrl) {
          setAssistantImages(prev => ({
            ...prev,
            [assistant.id]: imageUrl
          }))
        }
      }
    }

    const chats = await getChatsByWorkspaceId(workspaceId)
    setChats(chats)

    const collections = await getCollectionWorkspacesByWorkspaceId(workspaceId)
    setCollections(collections.collections)

    const folders = await getFoldersByWorkspaceId(workspaceId)
    setFolders(folders)

    const files = await getFileWorkspacesByWorkspaceId(workspaceId)
    setFiles(files.files)

    const presets = await getPresetWorkspacesByWorkspaceId(workspaceId)
    setPresets(presets.presets)

    const prompts = await getPromptWorkspacesByWorkspaceId(workspaceId)
    setPrompts(prompts.prompts)

    const tools = await getToolWorkspacesByWorkspaceId(workspaceId)
    setTools(tools.tools)

    const models = await getModelWorkspacesByWorkspaceId(workspaceId)
    setModels(models.models)

    setLoading(false)
  }

  useEffect(() => {
    ;(async () => {
      if (!workspaceId) {
        router.push("/")
      } else {
        await fetchWorkspaceData(workspaceId)
      }
    })()
  }, [workspaceId, router, fetchWorkspaceData])

  useEffect(() => {
    ;(async () => await fetchWorkspaceData(workspaceId))()

    setChat(prevChat => ({
      ...prevChat,
      userInput: "",
      messages: [],
      selectedChat: null,
      isGenerating: false,
      firstTokenReceived: false,
      chatFiles: [],
      chatImages: [],
      newMessageFiles: [],
      newMessageImages: [],
      showFilesDisplay: false
    }))
  }, [workspaceId, fetchWorkspaceData, setChat])

  if (loading) {
    return <Loading />
  }

  return <Dashboard>{children}</Dashboard>
}
