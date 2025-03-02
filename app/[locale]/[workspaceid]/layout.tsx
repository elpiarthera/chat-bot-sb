"use client"

import { Dashboard } from "@/components/ui/dashboard"
import { ChatbotUIContext } from "@/context/context"
import { getAssistantWorkspacesByWorkspaceId } from "@/db/assistants"
import { getChatsByWorkspaceId } from "@/db/chats"
import { getCollectionWorkspacesByWorkspaceId } from "@/db/collections"
import { getFileWorkspacesByWorkspaceId } from "@/db/files"
// Commenting out problematic imports
// import { getFoldersByWorkspaceId } from "@/db/folders";
import { getModelWorkspacesByWorkspaceId } from "@/db/models"
import { getPresetWorkspacesByWorkspaceId } from "@/db/presets"
import { getPromptWorkspacesByWorkspaceId } from "@/db/prompts"
// import { getAssistantImageFromStorage } from "@/db/storage/assistant-images";
import { getToolWorkspacesByWorkspaceId } from "@/db/tools"
import { getWorkspaceById } from "@/db/workspaces"
import { convertBlobToBase64 } from "@/lib/blob-to-b64"
import { supabase } from "@/lib/supabase/browser-client"
import { LLMID } from "@/types/llms"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { ReactNode, useContext, useEffect, useState, useCallback } from "react"
import Loading from "../loading"

interface WorkspaceLayoutProps {
  children: ReactNode
}

export default function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const workspaceId = params?.workspaceid as string
  // Use type assertion to tell TypeScript that the context is of the correct type
  const context = useContext(ChatbotUIContext) as any
  const {
    setChatSettings,
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
    setSelectedWorkspace,
    setUserInput,
    setChatMessages,
    setSelectedChat,
    setIsGenerating,
    setFirstTokenReceived,
    setChatFiles,
    setChatImages,
    setNewMessageFiles,
    setNewMessageImages,
    setShowFilesDisplay,
    selectedWorkspace
  } = context

  const [loading, setLoading] = useState(true)

  // Helper function to get folders by workspace ID
  const getFoldersByWorkspaceId = async (workspaceId: string) => {
    try {
      const { data: folders, error } = await supabase
        .from("folders")
        .select("*")
        .eq("workspace_id", workspaceId)

      if (error) throw new Error(error.message)
      return folders || []
    } catch (error) {
      console.error("Error fetching folders:", error)
      return []
    }
  }

  // Helper function to get assistant image from storage
  const getAssistantImageFromStorage = async (filePath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from("assistant_images")
        .createSignedUrl(filePath, 60 * 60 * 24) // 24hrs

      if (error) {
        console.error("Error downloading assistant image:", error)
        return null
      }

      return data.signedUrl
    } catch (error) {
      console.error("Error with assistant image:", error)
      return null
    }
  }

  const fetchWorkspaceData = useCallback(
    async (workspaceId: string) => {
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
              setAssistantImages((prev: any) => ({
                ...prev,
                [assistant.id]: imageUrl
              }))
            }
          }
        }

        // Add chat settings at the end
        setChatSettings({
          model: (searchParams?.get("model") ||
            workspace?.default_model ||
            "gpt-4-1106-preview") as LLMID,
          prompt:
            workspace?.default_prompt ||
            "You are a friendly, helpful AI assistant.",
          temperature: workspace?.default_temperature || 0.5,
          contextLength: workspace?.default_context_length || 4096,
          includeProfileContext: workspace?.include_profile_context || true,
          includeWorkspaceInstructions:
            workspace?.include_workspace_instructions || true,
          embeddingsProvider:
            (workspace?.embeddings_provider as "openai" | "local") || "openai"
        })
      } catch (error) {
        console.error("Error fetching workspace data:", error)
      } finally {
        setLoading(false)
      }
    },
    [
      searchParams,
      setAssistantImages,
      setAssistants,
      setChatSettings,
      setChats,
      setCollections,
      setFiles,
      setFolders,
      setModels,
      setPresets,
      setPrompts,
      setSelectedWorkspace,
      setTools
    ]
  )

  // Combine the two useEffects into one
  useEffect(() => {
    if (!workspaceId) {
      router.push("/")
      return
    }

    // Reset chat state
    setSelectedChat(null)
    setUserInput("")
    setIsGenerating(false)
    setFirstTokenReceived(false)
    setChatMessages([])
    setChatFiles([])
    setChatImages([])
    setNewMessageFiles([])
    setNewMessageImages([])
    setShowFilesDisplay(false)

    // Fetch workspace data
    fetchWorkspaceData(workspaceId)
  }, [
    workspaceId,
    router,
    fetchWorkspaceData,
    setSelectedChat,
    setUserInput,
    setIsGenerating,
    setFirstTokenReceived,
    setChatMessages,
    setChatFiles,
    setChatImages,
    setNewMessageFiles,
    setNewMessageImages,
    setShowFilesDisplay
  ])

  // Add session check effect
  useEffect(() => {
    ;(async () => {
      const { data } = await supabase.auth.getSession()

      if (!data.session) {
        return router.push("/login")
      } else {
        await fetchWorkspaceData(workspaceId)
      }
    })()
  }, [workspaceId, router, fetchWorkspaceData])

  if (loading) {
    return <Loading />
  }

  return <Dashboard>{children}</Dashboard>
}
