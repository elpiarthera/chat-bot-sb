"use client"

import { ChatbotUIContext } from "@/context/context"
import { getProfileByUserId } from "@/db/profile"
import { getWorkspaceImageFromStorage } from "@/db/storage/workspace-images"
import { getWorkspacesByUserId } from "@/db/workspaces"
import { convertBlobToBase64 } from "@/lib/blob-to-b64"
import {
  fetchHostedModels,
  fetchOllamaModels,
  fetchOpenRouterModels
} from "@/lib/models/fetch-models"
import { supabase } from "@/lib/supabase/browser-client"
import { Tables } from "@/supabase/types"
import {
  ChatFile,
  ChatMessage,
  ChatSettings,
  LLM,
  MessageImage,
  OpenRouterLLM,
  WorkspaceImage
} from "@/types"
import { AssistantImage } from "@/types/images/assistant-image"
import { VALID_ENV_KEYS } from "@/types/valid-keys"
import { useRouter } from "next/navigation"
import { FC, useEffect, useState } from "react"

interface GlobalStateProps {
  children: React.ReactNode
}

export const GlobalState: FC<GlobalStateProps> = ({ children }) => {
  const router = useRouter()

  // PROFILE STORE
  const [profile, setProfile] = useState<Tables<"profiles"> | null>(null)

  // ITEMS STORE
  const [assistants, setAssistants] = useState<Tables<"assistants">[]>([])
  const [collections, setCollections] = useState<Tables<"collections">[]>([])
  const [chats, setChats] = useState<Tables<"chats">[]>([])
  const [files, setFiles] = useState<Tables<"files">[]>([])
  const [folders, setFolders] = useState<Tables<"folders">[]>([])
  const [models, setModels] = useState<Tables<"models">[]>([])
  const [presets, setPresets] = useState<Tables<"presets">[]>([])
  const [prompts, setPrompts] = useState<Tables<"prompts">[]>([])
  const [tools, setTools] = useState<Tables<"tools">[]>([])
  const [workspaces, setWorkspaces] = useState<Tables<"workspaces">[]>([])

  // MODELS STORE
  const [envKeyMap, setEnvKeyMap] = useState<Record<string, VALID_ENV_KEYS>>({})
  const [availableHostedModels, setAvailableHostedModels] = useState<LLM[]>([])
  const [availableLocalModels, setAvailableLocalModels] = useState<LLM[]>([])
  const [availableOpenRouterModels, setAvailableOpenRouterModels] = useState<
    OpenRouterLLM[]
  >([])

  // WORKSPACE STORE
  const [selectedWorkspace, setSelectedWorkspace] =
    useState<Tables<"workspaces"> | null>(null)
  const [workspaceImages, setWorkspaceImages] = useState<WorkspaceImage[]>([])

  // PRESET STORE
  const [selectedPreset, setSelectedPreset] =
    useState<Tables<"presets"> | null>(null)

  // ASSISTANT STORE
  const [selectedAssistant, setSelectedAssistant] =
    useState<Tables<"assistants"> | null>(null)
  const [assistantImages, setAssistantImages] = useState<AssistantImage[]>([])
  const [openaiAssistants, setOpenaiAssistants] = useState<any[]>([])

  // PASSIVE CHAT STORE
  const [userInput, setUserInput] = useState<string>("")
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatSettings, setChatSettings] = useState<ChatSettings>({
    model: "gpt-4-turbo-preview",
    prompt: "You are a helpful AI assistant.",
    temperature: 0.5,
    contextLength: 4000,
    includeProfileContext: true,
    includeWorkspaceInstructions: true,
    embeddingsProvider: "openai"
  })
  const [selectedChat, setSelectedChat] = useState<Tables<"chats"> | null>(null)
  const [chatFileItems, setChatFileItems] = useState<Tables<"file_items">[]>([])

  // ACTIVE CHAT STORE
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [firstTokenReceived, setFirstTokenReceived] = useState<boolean>(false)
  const [abortController, setAbortController] =
    useState<AbortController | null>(null)

  // CHAT INPUT COMMAND STORE
  const [isPromptPickerOpen, setIsPromptPickerOpen] = useState(false)
  const [slashCommand, setSlashCommand] = useState("")
  const [isFilePickerOpen, setIsFilePickerOpen] = useState(false)
  const [hashtagCommand, setHashtagCommand] = useState("")
  const [isToolPickerOpen, setIsToolPickerOpen] = useState(false)
  const [toolCommand, setToolCommand] = useState("")
  const [focusPrompt, setFocusPrompt] = useState(false)
  const [focusFile, setFocusFile] = useState(false)
  const [focusTool, setFocusTool] = useState(false)
  const [focusAssistant, setFocusAssistant] = useState(false)
  const [atCommand, setAtCommand] = useState("")
  const [isAssistantPickerOpen, setIsAssistantPickerOpen] = useState(false)

  // ATTACHMENTS STORE
  const [chatFiles, setChatFiles] = useState<ChatFile[]>([])
  const [chatImages, setChatImages] = useState<MessageImage[]>([])
  const [newMessageFiles, setNewMessageFiles] = useState<ChatFile[]>([])
  const [newMessageImages, setNewMessageImages] = useState<MessageImage[]>([])
  const [showFilesDisplay, setShowFilesDisplay] = useState<boolean>(false)

  // RETRIEVAL STORE
  const [useRetrieval, setUseRetrieval] = useState<boolean>(true)
  const [sourceCount, setSourceCount] = useState<number>(4)

  // TOOL STORE
  const [selectedTools, setSelectedTools] = useState<Tables<"tools">[]>([])
  const [toolInUse, setToolInUse] = useState<string>("none")

  // Chat state (required by context)
  const [chat, setChat] = useState({
    isGenerating: false,
    newMessageFiles: [] as ChatFile[],
    chatFiles: [] as ChatFile[],
    slashCommand: "",
    isFilePickerOpen: false,
    hashtagCommand: "",
    focusPrompt: false,
    focusFile: false
  })

  useEffect(() => {
    console.log("🔍 GlobalState: Initializing component")

    let isMounted = true // Flag to prevent state updates after unmounting

    ;(async () => {
      try {
        console.log("🔍 GlobalState: Starting data initialization")

        // Fetch profile data first
        let profileData: Tables<"profiles"> | null = null
        try {
          profileData = await fetchStartingData()

          if (!profileData && isMounted) {
            console.error(
              "🚨 GlobalState: No profile found, initialization stopped"
            )
            // Ensure all model arrays are initialized with empty arrays
            setAvailableHostedModels([])
            setAvailableLocalModels([])
            setAvailableOpenRouterModels([])
            return
          }

          console.log("✅ GlobalState: Profile loaded successfully", {
            id: profileData?.id
          })
        } catch (profileError) {
          console.error("🚨 GlobalState: Error fetching profile:", profileError)
          if (isMounted) {
            // Initialize all model arrays with empty arrays on error
            setAvailableHostedModels([])
            setAvailableLocalModels([])
            setAvailableOpenRouterModels([])
            return
          }
        }

        if (!isMounted) return // Stop if component was unmounted

        // Now fetch models
        console.log("🔍 GlobalState: Fetching models")

        try {
          if (profileData) {
            const hostedModelRes = await fetchHostedModels(profileData)

            if (hostedModelRes && isMounted) {
              console.log(
                "✅ GlobalState: Hosted models loaded:",
                hostedModelRes.hostedModels.length
              )
              setEnvKeyMap(hostedModelRes.envKeyMap || {})
              setAvailableHostedModels(hostedModelRes.hostedModels || [])
            } else if (isMounted) {
              console.warn("⚠️ GlobalState: No hosted models returned")
              // Initialize with empty array to prevent null errors
              setAvailableHostedModels([])
            }

            // Only try to fetch OpenRouter models if the API key is available
            if (
              (profileData["openrouter_api_key"] ||
                (hostedModelRes?.envKeyMap &&
                  hostedModelRes.envKeyMap["openrouter"])) &&
              isMounted
            ) {
              try {
                const openRouterModels = await fetchOpenRouterModels()
                if (openRouterModels && isMounted) {
                  console.log(
                    "✅ GlobalState: OpenRouter models loaded:",
                    openRouterModels.length
                  )
                  setAvailableOpenRouterModels(openRouterModels)
                } else if (isMounted) {
                  console.warn("⚠️ GlobalState: No OpenRouter models returned")
                  setAvailableOpenRouterModels([])
                }
              } catch (orError) {
                console.error(
                  "🚨 GlobalState: Error fetching OpenRouter models:",
                  orError
                )
                if (isMounted) {
                  setAvailableOpenRouterModels([])
                }
              }
            } else {
              console.log(
                "ℹ️ GlobalState: No OpenRouter API key found, skipping"
              )
              if (isMounted) setAvailableOpenRouterModels([])
            }

            // Only try to fetch Ollama models if the URL is available
            if (process.env.NEXT_PUBLIC_OLLAMA_URL && isMounted) {
              try {
                const localModels = await fetchOllamaModels()
                if (localModels && isMounted) {
                  console.log(
                    "✅ GlobalState: Local models loaded:",
                    localModels.length
                  )
                  setAvailableLocalModels(localModels)
                } else if (isMounted) {
                  console.warn("⚠️ GlobalState: No local models returned")
                  setAvailableLocalModels([])
                }
              } catch (ollamaError) {
                console.error(
                  "🚨 GlobalState: Error fetching Ollama models:",
                  ollamaError
                )
                if (isMounted) {
                  setAvailableLocalModels([])
                }
              }
            } else {
              console.log("ℹ️ GlobalState: No Ollama URL found, skipping")
              if (isMounted) setAvailableLocalModels([])
            }
          }

          console.log("✅ GlobalState: Initialization complete")
        } catch (modelError) {
          console.error(
            "🚨 GlobalState: Error during model initialization:",
            modelError
          )
          // Make sure all model arrays are initialized on error
          if (isMounted) {
            setAvailableHostedModels([])
            setAvailableLocalModels([])
            setAvailableOpenRouterModels([])
          }
        }
      } catch (err) {
        console.error("🚨 GlobalState: Critical initialization error:", err)
        if (isMounted) {
          // Make sure all model arrays are initialized to prevent null errors
          setAvailableHostedModels([])
          setAvailableLocalModels([])
          setAvailableOpenRouterModels([])
        }
      }
    })()

    // Cleanup function to prevent state updates after unmounting
    return () => {
      isMounted = false
      console.log("🧹 GlobalState: Component unmounting, cleanup performed")
    }
  }, [router])

  const fetchStartingData = async () => {
    try {
      console.log("🔍 GlobalState: Fetching session")
      const sessionResponse = await supabase.auth.getSession()
      const session = sessionResponse.data.session

      if (!session) {
        console.warn("⚠️ GlobalState: No active session found")
        return null
      }

      const user = session.user
      console.log("✅ GlobalState: Session found for user:", user.id)

      try {
        console.log("🔍 GlobalState: Fetching profile for user:", user.id)
        const profile = await getProfileByUserId(user.id)

        if (!profile) {
          console.warn("⚠️ GlobalState: No profile found for user:", user.id)
          return null
        }

        console.log("✅ GlobalState: Profile loaded")
        setProfile(profile)

        if (!profile.has_onboarded) {
          console.log(
            "ℹ️ GlobalState: User not onboarded, redirecting to setup"
          )
          router.push("/setup")
          return null
        }

        try {
          console.log("🔍 GlobalState: Fetching workspaces")
          const workspaces = await getWorkspacesByUserId(user.id)

          if (!workspaces || workspaces.length === 0) {
            console.warn("⚠️ GlobalState: No workspaces found for user")
            setWorkspaces([])
          } else {
            console.log("✅ GlobalState: Workspaces loaded:", workspaces.length)
            setWorkspaces(workspaces)

            // Process workspace images
            for (const workspace of workspaces) {
              try {
                if (workspace.image_path) {
                  console.log(
                    "🔍 GlobalState: Fetching image for workspace:",
                    workspace.id
                  )
                  let workspaceImageUrl = await getWorkspaceImageFromStorage(
                    workspace.image_path
                  )

                  if (workspaceImageUrl) {
                    const response = await fetch(workspaceImageUrl)
                    const blob = await response.blob()
                    const base64 = await convertBlobToBase64(blob)

                    setWorkspaceImages(prev => [
                      ...prev,
                      {
                        workspaceId: workspace.id,
                        path: workspace.image_path,
                        base64: base64,
                        url: workspaceImageUrl
                      }
                    ])
                    console.log(
                      "✅ GlobalState: Image loaded for workspace:",
                      workspace.id
                    )
                  }
                }
              } catch (imageError) {
                console.error(
                  "🚨 GlobalState: Error loading workspace image:",
                  imageError
                )
                // Continue with next workspace
              }
            }
          }
        } catch (workspacesError) {
          console.error(
            "🚨 GlobalState: Error fetching workspaces:",
            workspacesError
          )
          setWorkspaces([])
        }

        return profile
      } catch (profileError) {
        console.error("🚨 GlobalState: Error fetching profile:", profileError)
        return null
      }
    } catch (sessionError) {
      console.error("🚨 GlobalState: Error fetching session:", sessionError)
      return null
    }
  }

  return (
    <ChatbotUIContext.Provider
      value={{
        // PROFILE STORE
        profile,
        setProfile,

        // ITEMS STORE
        assistants,
        setAssistants,
        collections,
        setCollections,
        chats,
        setChats,
        files,
        setFiles,
        folders,
        setFolders,
        models,
        setModels,
        presets,
        setPresets,
        prompts,
        setPrompts,
        tools,
        setTools,
        workspaces,
        setWorkspaces,

        // MODELS STORE
        envKeyMap,
        setEnvKeyMap,
        availableHostedModels,
        setAvailableHostedModels,
        availableLocalModels,
        setAvailableLocalModels,
        availableOpenRouterModels,
        setAvailableOpenRouterModels,

        // WORKSPACE STORE
        selectedWorkspace,
        setSelectedWorkspace,
        workspaceImages,
        setWorkspaceImages,

        // PRESET STORE
        selectedPreset,
        setSelectedPreset,

        // ASSISTANT STORE
        selectedAssistant,
        setSelectedAssistant,
        assistantImages,
        setAssistantImages,
        openaiAssistants,
        setOpenaiAssistants,

        // PASSIVE CHAT STORE
        userInput,
        setUserInput,
        chatMessages,
        setChatMessages,
        chatSettings,
        setChatSettings,
        selectedChat,
        setSelectedChat,
        chatFileItems,
        setChatFileItems,

        // ACTIVE CHAT STORE
        isGenerating,
        setIsGenerating,
        firstTokenReceived,
        setFirstTokenReceived,
        abortController,
        setAbortController,

        // CHAT INPUT COMMAND STORE
        isPromptPickerOpen,
        setIsPromptPickerOpen,
        slashCommand,
        setSlashCommand,
        isFilePickerOpen,
        setIsFilePickerOpen,
        hashtagCommand,
        setHashtagCommand,
        isToolPickerOpen,
        setIsToolPickerOpen,
        toolCommand,
        setToolCommand,
        focusPrompt,
        setFocusPrompt,
        focusFile,
        setFocusFile,
        focusTool,
        setFocusTool,
        focusAssistant,
        setFocusAssistant,
        atCommand,
        setAtCommand,
        isAssistantPickerOpen,
        setIsAssistantPickerOpen,

        // ATTACHMENTS STORE
        chatFiles,
        setChatFiles,
        chatImages,
        setChatImages,
        newMessageFiles,
        setNewMessageFiles,
        newMessageImages,
        setNewMessageImages,
        showFilesDisplay,
        setShowFilesDisplay,

        // RETRIEVAL STORE
        useRetrieval,
        setUseRetrieval,
        sourceCount,
        setSourceCount,

        // TOOL STORE
        selectedTools,
        setSelectedTools,
        toolInUse,
        setToolInUse,

        // Required by context
        chat,
        setChat
      }}
    >
      {children}
    </ChatbotUIContext.Provider>
  )
}
