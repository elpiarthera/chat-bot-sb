"use client"

import { ChatbotUIContext } from "@/context/context"
import { LLM, LLMID, ModelProvider } from "@/types"
import { IconCheck, IconChevronDown } from "@tabler/icons-react"
import { FC, useContext, useEffect, useRef, useState, useMemo } from "react"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "../ui/dropdown-menu"
import { Input } from "../ui/input"
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs"
import { ModelIcon } from "./model-icon"
import { ModelOption } from "./model-option"

interface ModelSelectProps {
  selectedModelId: string
  onSelectModel: (modelId: LLMID) => void
  showAllModels?: boolean // Optional prop to show all models instead of just active ones
}

export const ModelSelect: FC<ModelSelectProps> = ({
  selectedModelId,
  onSelectModel,
  showAllModels = false // Default to showing only active workspace models
}) => {
  const {
    profile,
    models,
    availableHostedModels,
    availableLocalModels,
    availableOpenRouterModels,
    selectedWorkspace
  } = useContext(ChatbotUIContext)

  const inputRef = useRef<HTMLInputElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [tab, setTab] = useState<"hosted" | "local">("hosted")
  const [error, setError] = useState<string | null>(null)
  const [activeWorkspaceModels, setActiveWorkspaceModels] = useState<string[]>(
    []
  )
  const [isLoadingModels, setIsLoadingModels] = useState(false)

  // Fetch active models for the current workspace
  useEffect(() => {
    const fetchActiveWorkspaceModels = async () => {
      if (!selectedWorkspace || showAllModels) {
        // If no workspace is selected or we want to show all models, don't fetch anything
        setActiveWorkspaceModels([])
        return
      }

      try {
        setIsLoadingModels(true)
        const response = await fetch(
          `/api/workspaces/${selectedWorkspace.id}/active-models`,
          {
            method: "GET"
          }
        )

        if (response.ok) {
          const data = await response.json()
          if (data && data.length > 0) {
            // Extract model IDs from the response
            const modelIds = data.map(
              (model: { model_id: string }) => model.model_id
            )
            setActiveWorkspaceModels(modelIds)
          } else {
            // No models found - leave empty
            setActiveWorkspaceModels([])
          }
        } else {
          console.error(
            "Error fetching active workspace models:",
            await response.text()
          )
          setActiveWorkspaceModels([])
        }
      } catch (err) {
        console.error("Exception fetching active workspace models:", err)
        setActiveWorkspaceModels([])
      } finally {
        setIsLoadingModels(false)
      }
    }

    fetchActiveWorkspaceModels()
  }, [selectedWorkspace, showAllModels])

  // Create a memoized version of models to prevent unnecessary recalculations
  const allModelsData = useMemo(() => {
    try {
      // Safely handle potential undefined arrays
      const customModels = Array.isArray(models)
        ? models.map(model => ({
            modelId: model.model_id as LLMID,
            modelName: model.name,
            provider: "custom" as ModelProvider,
            hostedId: model.id,
            platformLink: "",
            imageInput: false
          }))
        : []

      const hostedModels = Array.isArray(availableHostedModels)
        ? availableHostedModels
        : []
      const localModels = Array.isArray(availableLocalModels)
        ? availableLocalModels
        : []
      const openRouterModels = Array.isArray(availableOpenRouterModels)
        ? availableOpenRouterModels
        : []

      // Combine all models with defensive checks
      const allModels = [
        ...customModels,
        ...hostedModels,
        ...localModels,
        ...openRouterModels
      ]

      // Filter models by active workspace models if needed
      const filteredModels =
        showAllModels || activeWorkspaceModels.length === 0
          ? allModels // Show all models if explicitly requested or if no active models found
          : allModels.filter(
              model =>
                model &&
                model.modelId &&
                activeWorkspaceModels.includes(model.modelId)
            )

      // Filter out duplicate models by modelId and handle potential undefined values
      const uniqueModels = filteredModels.filter(
        (model, index, self) =>
          model &&
          model.modelId &&
          index === self.findIndex(m => m && m.modelId === model.modelId)
      )

      // Group models by provider with additional error checking
      const groupedModels = uniqueModels.reduce<Record<string, LLM[]>>(
        (groups, model) => {
          if (!model || !model.provider) return groups

          const key = model.provider
          if (!groups[key]) {
            groups[key] = []
          }
          groups[key].push(model as LLM)
          return groups
        },
        {}
      )

      return {
        uniqueModels,
        groupedModels,
        hasModels: uniqueModels.length > 0,
        hasLocalModels:
          Array.isArray(availableLocalModels) &&
          availableLocalModels.length > 0,
        selectedModel:
          uniqueModels.find(
            model => model && model.modelId === selectedModelId
          ) ||
          // If selected model is not in filtered list, try to find it in all models
          (showAllModels
            ? undefined
            : allModels.find(
                model => model && model.modelId === selectedModelId
              ))
      }
    } catch (err) {
      console.error("Error processing models data:", err)
      setError("Error processing models")
      return {
        uniqueModels: [],
        groupedModels: {},
        hasModels: false,
        hasLocalModels: false,
        selectedModel: undefined
      }
    }
  }, [
    models,
    availableHostedModels,
    availableLocalModels,
    availableOpenRouterModels,
    selectedModelId,
    activeWorkspaceModels,
    showAllModels
  ])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100) // FIX: hacky
    }
  }, [isOpen])

  const handleSelectModel = (modelId: LLMID) => {
    onSelectModel(modelId)
    setIsOpen(false)
  }

  // Early return if no profile is found
  if (!profile) {
    return (
      <div className="text-muted-foreground text-sm">
        Please complete your profile setup to use models.
      </div>
    )
  }

  // Show error state if we encountered an error
  if (error) {
    return (
      <div className="bg-background w-full justify-start rounded border-2 px-3 py-5 text-sm text-red-500">
        {error}. Please refresh the page.
      </div>
    )
  }

  return (
    <DropdownMenu
      open={isOpen}
      onOpenChange={isOpen => {
        setIsOpen(isOpen)
        setSearch("")
      }}
    >
      <DropdownMenuTrigger
        className="bg-background w-full justify-start border-2 px-3 py-5"
        asChild
        disabled={!allModelsData.hasModels}
      >
        {!allModelsData.hasModels ? (
          <div className="rounded text-sm font-bold">
            Unlock models by entering API keys in your profile settings.
          </div>
        ) : (
          <Button
            ref={triggerRef}
            className="flex items-center justify-between"
            variant="ghost"
          >
            <div className="flex items-center">
              {allModelsData.selectedModel ? (
                <>
                  <ModelIcon
                    provider={allModelsData.selectedModel?.provider}
                    width={26}
                    height={26}
                  />
                  <div className="ml-2 flex items-center">
                    {allModelsData.selectedModel?.modelName}
                  </div>
                </>
              ) : (
                <div className="flex items-center">Select a model</div>
              )}
            </div>

            <IconChevronDown />
          </Button>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="space-y-2 overflow-auto p-2"
        style={{ width: triggerRef.current?.offsetWidth }}
        align="start"
      >
        {allModelsData.hasLocalModels && (
          <Tabs value={tab} onValueChange={(value: any) => setTab(value)}>
            <TabsList defaultValue="hosted" className="grid grid-cols-2">
              <TabsTrigger value="hosted">Hosted</TabsTrigger>
              <TabsTrigger value="local">Local</TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        <Input
          ref={inputRef}
          className="w-full"
          placeholder="Search models..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <div className="max-h-[300px] overflow-auto">
          {Object.entries(allModelsData.groupedModels).map(
            ([provider, providerModels]) => {
              // Safe filtering with additional checks
              const filteredModels = providerModels
                .filter(model => {
                  if (!model) return false
                  if (tab === "hosted") return model.provider !== "ollama"
                  if (tab === "local") return model.provider === "ollama"
                  return true
                })
                .filter(model => {
                  if (!model || !model.modelName) return false
                  return model.modelName
                    .toLowerCase()
                    .includes(search.toLowerCase())
                })
                .sort((a, b) => {
                  if (!a.modelName || !b.modelName) return 0
                  return a.modelName.localeCompare(b.modelName)
                })

              if (filteredModels.length === 0) return null

              return (
                <div key={provider}>
                  <div className="mb-1 ml-2 text-xs font-bold tracking-wide opacity-50">
                    {provider === "openai" && profile.use_azure_openai
                      ? "AZURE OPENAI"
                      : provider.toLocaleUpperCase()}
                  </div>

                  <div className="mb-4">
                    {filteredModels.map(model => {
                      if (!model || !model.modelId) return null

                      return (
                        <div
                          key={model.modelId}
                          className="flex items-center space-x-1"
                        >
                          {selectedModelId === model.modelId && (
                            <IconCheck className="ml-2" size={32} />
                          )}

                          <ModelOption
                            model={model}
                            onSelect={() => handleSelectModel(model.modelId)}
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            }
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
