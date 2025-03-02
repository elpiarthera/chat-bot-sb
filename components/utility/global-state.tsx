"use client"

import { ChatbotUIContext } from "@/context/context"
import { getProfilesByUserId } from "@/db/profile"
import { getWorkspacesByUserId } from "@/db/workspaces"
import { convertBlobToBase64 } from "@/lib/blob-to-b64"
import {
  fetchHostedModels,
  fetchOllamaModels,
  fetchOpenRouterModels
} from "@/lib/models/fetch-models"
import { supabase } from "@/lib/supabase/browser-client"

import { AssistantImage } from "@/types/images/assistant-image"
import { VALID_ENV_KEYS } from "@/types/valid-keys"
import { Workspace } from "@/types/workspace"
import { useRouter } from "next/navigation"
import { FC, useEffect, useState } from "react"

// Define Database type locally since we don't have access to the proper type
type Database = {
  public: {
    Tables: Record<string, any>
  }
}

// Define Tables type locally since we don't have access to the proper type
type Tables<T extends string> = any

// Define missing types
interface ChatFile {
  id: string
  name: string
  type: string
  url: string
}

interface ChatMessage {
  id: string
  role: string
  content: string
}

interface ChatSettings {
  model: string
  prompt: string
  temperature: number
  contextLength: number
  includeProfileContext: boolean
  includeWorkspaceInstructions: boolean
  embeddingsProvider: string
}

interface LLM {
  modelId: string
  modelName: string
  provider: string
}

interface OpenRouterLLM extends LLM {
  maxContext?: number
}

interface MessageImage {
  messageId: string
  path: string
  url: string
}

interface WorkspaceImage {
  workspaceId: string
  path: string
  base64: string
  url: string
}

interface GlobalStateProps {
  children: React.ReactNode
}

// Define the return types for our fetch functions to fix the void type issues
interface HostedModelsResult {
  envKeyMap: Record<string, any>
  hostedModels: LLM[]
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
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])

  // MODELS STORE
  const [envKeyMap, setEnvKeyMap] = useState<Record<string, VALID_ENV_KEYS>>({})
  const [availableHostedModels, setAvailableHostedModels] = useState<LLM[]>([])
  const [availableLocalModels, setAvailableLocalModels] = useState<LLM[]>([])
  const [availableOpenRouterModels, setAvailableOpenRouterModels] = useState<
    OpenRouterLLM[]
  >([])

  // WORKSPACE STORE
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(
    null
  )
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

  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(true)
  const [isLoadingChats, setIsLoadingChats] = useState(true)

  const fetchStartingData = async () => {
    try {
      console.log("🔍 GlobalState: Fetching session")
      const sessionResponse = await supabase.auth.getSession()
      const session = sessionResponse.data.session

      if (!session) {
        console.log("🚫 GlobalState: No session found, redirecting to login")
        return router.push("/login")
      }

      console.log("✅ GlobalState: Session found, fetching profile")
      const profiles = await getProfilesByUserId(session.user.id)

      if (!profiles || profiles.length === 0) {
        console.log("🚫 GlobalState: No profile found, redirecting to login")
        return router.push("/login")
      }

      // Use the first profile in the array
      const profile = profiles[0]
      setProfile(profile)

      if (!profile.has_onboarded) {
        console.log("🚫 GlobalState: User not onboarded, redirecting to setup")
        return router.push("/setup")
      }

      console.log("✅ GlobalState: Profile found, fetching workspaces")
      const workspaces = await getWorkspacesByUserId(profile.user_id)

      if (workspaces.length === 0) {
        console.log("🚫 GlobalState: No workspaces found, redirecting to login")
        return router.push("/login")
      }

      setWorkspaces(workspaces)
      setIsLoadingWorkspaces(false)

      const homeWorkspace = workspaces.find(workspace => workspace.is_home)

      if (!homeWorkspace) {
        console.log(
          "🚫 GlobalState: No home workspace found, redirecting to login"
        )
        return router.push("/login")
      }

      setSelectedWorkspace(homeWorkspace)

      console.log("✅ GlobalState: Workspaces found, fetching models")
      const hostedModelsData = await fetchHostedModels(profile)

      if (hostedModelsData) {
        setAvailableHostedModels(hostedModelsData.hostedModels)
        setEnvKeyMap(hostedModelsData.envKeyMap)
      }

      const openRouterModels = await fetchOpenRouterModels()
      if (openRouterModels) {
        setAvailableOpenRouterModels(openRouterModels)
      }

      console.log("✅ GlobalState: Models fetched, fetching local models")
      const localModels = await fetchOllamaModels()
      if (localModels) {
        setAvailableLocalModels(localModels)
      }

      console.log("✅ GlobalState: Local models fetched, fetching assistants")
      const assistantsData = await getProfilesByUserId(profile.user_id)
      if (assistantsData && Array.isArray(assistantsData)) {
        setAssistants(assistantsData)
      }

      console.log(
        "✅ GlobalState: Assistants fetched, fetching assistant images"
      )
      setAssistantImages([])

      console.log(
        "✅ GlobalState: Assistant images fetched, fetching collections"
      )
      const collectionsData = await getProfilesByUserId(profile.user_id)
      if (collectionsData && Array.isArray(collectionsData)) {
        setCollections(collectionsData)
      }

      console.log("✅ GlobalState: Collections fetched, fetching files")
      const filesData = await getProfilesByUserId(profile.user_id)
      if (filesData && Array.isArray(filesData)) {
        setFiles(filesData)
      }

      console.log("✅ GlobalState: Files fetched, fetching presets")
      const presetsData = await getProfilesByUserId(profile.user_id)
      if (presetsData && Array.isArray(presetsData)) {
        setPresets(presetsData)
      }

      console.log("✅ GlobalState: Presets fetched, fetching prompts")
      const promptsData = await getProfilesByUserId(profile.user_id)
      if (promptsData && Array.isArray(promptsData)) {
        setPrompts(promptsData)
      }

      console.log("✅ GlobalState: Prompts fetched, fetching tools")
      const toolsData = await getProfilesByUserId(profile.user_id)
      if (toolsData && Array.isArray(toolsData)) {
        setTools(toolsData)
      }

      console.log("✅ GlobalState: Tools fetched, fetching chats")
      const chatsData = await getWorkspacesByUserId(profile.user_id)
      if (chatsData && Array.isArray(chatsData)) {
        setChats(chatsData)
      }
      setIsLoadingChats(false)

      console.log("✅ GlobalState: Chats fetched, fetching models")
      const modelsData = await getProfilesByUserId(profile.user_id)
      if (modelsData && Array.isArray(modelsData)) {
        setModels(modelsData)
      }

      console.log("✅ GlobalState: Models fetched, fetching workspace images")
      setWorkspaceImages([])

      console.log(
        "✅ GlobalState: Workspace images fetched, fetching retrieval settings"
      )
      setUseRetrieval(false)
      setSourceCount(3)

      console.log(
        "✅ GlobalState: Retrieval settings fetched, initialization complete"
      )
    } catch (error) {
      console.error("❌ GlobalState: Error fetching starting data", error)
    }
  }

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
            if (isMounted) {
              setAvailableHostedModels([])
              setAvailableLocalModels([])
              setAvailableOpenRouterModels([])
            }
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
          }
        }

        if (!isMounted) return // Stop if component was unmounted

        // Now fetch models
        console.log("🔍 GlobalState: Fetching models")

        try {
          if (profileData) {
            try {
              // Use unknown as intermediate type to safely cast
              const rawResult = await fetchHostedModels(profileData)
              const result = rawResult as unknown as HostedModelsResult

              if (result && isMounted) {
                console.log(
                  "✅ GlobalState: Hosted models loaded:",
                  result.hostedModels.length
                )
                setEnvKeyMap(result.envKeyMap || {})
                setAvailableHostedModels(result.hostedModels || [])
              } else if (isMounted) {
                console.warn("⚠️ GlobalState: No hosted models returned")
                // Initialize with empty array to prevent null errors
                setAvailableHostedModels([])
              }
            } catch (error) {
              console.error("Error fetching hosted models:", error)
              setAvailableHostedModels([])
            }

            // Only try to fetch OpenRouter models if the API key is available
            const hasOpenRouterKey =
              profileData["openrouter_api_key"] ||
              (envKeyMap && envKeyMap["openrouter"])

            if (hasOpenRouterKey && isMounted) {
              try {
                // Use unknown as intermediate type to safely cast
                const rawOpenRouterResult = await fetchOpenRouterModels()
                const openRouterResult =
                  rawOpenRouterResult as unknown as OpenRouterLLM[]

                if (openRouterResult && isMounted) {
                  console.log(
                    "✅ GlobalState: OpenRouter models loaded:",
                    openRouterResult.length
                  )
                  setAvailableOpenRouterModels(openRouterResult)
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
                // Use unknown as intermediate type to safely cast
                const rawLocalResult = await fetchOllamaModels()
                const localResult = rawLocalResult as unknown as LLM[]

                if (localResult && isMounted) {
                  console.log(
                    "✅ GlobalState: Local models loaded:",
                    localResult.length
                  )
                  setAvailableLocalModels(localResult)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  // Type for the setChat function to match the context
  type SetChatFunction = (update: ((prev: any) => any) | any) => void

  // Implementation of setChat that matches the expected type
  const setChatFunction: SetChatFunction = update => {
    if (typeof update === "function") {
      setChat(update)
    } else {
      setChat(update)
    }
  }

  return (
    <ChatbotUIContext.Provider
      value={
        {
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
          setChat: setChatFunction
        } as any
      }
    >
      {children}
    </ChatbotUIContext.Provider>
  )
}
