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
    try {
      setLoading(true)

      // Fetch workspace first
      const workspace = await getWorkspaceById(workspaceId)
      setSelectedWorkspace(workspace)

      // Group related fetches together with Promise.all to control concurrency
      const [assistantData, chats, collections, folders] = await Promise.all([
        getAssistantWorkspacesByWorkspaceId(workspaceId),
        getChatsByWorkspaceId(workspaceId),
        getCollectionWorkspacesByWorkspaceId(workspaceId),
        getFoldersByWorkspaceId(workspaceId)
      ])

      setAssistants(assistantData.assistants)
      setChats(chats)
      setCollections(collections.collections)
      setFolders(folders)

      // Second batch of fetches
      const [files, presets, prompts, tools, models] = await Promise.all([
        getFileWorkspacesByWorkspaceId(workspaceId),
        getPresetWorkspacesByWorkspaceId(workspaceId),
        getPromptWorkspacesByWorkspaceId(workspaceId),
        getToolWorkspacesByWorkspaceId(workspaceId),
        getModelWorkspacesByWorkspaceId(workspaceId)
      ])

      setFiles(files.files)
      setPresets(presets.presets)
      setPrompts(prompts.prompts)
      setTools(tools.tools)
      setModels(models.models)

      // Handle assistant images separately to avoid too many concurrent requests
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
    } catch (error) {
      console.error("Error fetching workspace data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Combine the two useEffects into one
  useEffect(() => {
    if (!workspaceId) {
      router.push("/")
      return
    }

    // Reset chat state
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

    // Fetch workspace data
    fetchWorkspaceData(workspaceId)
  }, [workspaceId])

  if (loading) {
    return <Loading />
  }

  return <Dashboard>{children}</Dashboard>
}
