"use client"

import { ChatbotUIContext } from "@/context/context"
import { IconCheck, IconChevronDown } from "@tabler/icons-react"
import {
  FC,
  useContext,
  useEffect,
  useRef,
  useState,
  useMemo,
  ReactNode
} from "react"
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
import { LLMID, LLM as ImportedLLM } from "@/types/llms"
import { ModelProvider } from "@/types/models"

// Alias the imported LLM type to use it in this component
export type { LLMID } from "@/types/llms"
export type { ModelProvider } from "@/types/models"

// Use the imported LLM interface
export type LLM = ImportedLLM

interface ModelSelectProps {
  selectedModelId: string
  onSelectModel: (modelId: LLMID) => void
  showAllModels?: boolean // Optional prop to show all models instead of just active ones
}

export const ModelSelect: FC<ModelSelectProps> = ({
  selectedModelId,
  onSelectModel,
  showAllModels = false // Default to showing only active workspace models
}): ReactNode => {
  // Use type assertion to access properties that exist in the context
  const context = useContext(ChatbotUIContext) as any
  const profile = context.profile

  // Wrap model variables in useMemo to avoid dependency changes on every render
  const modelVariables = useMemo(() => {
    return {
      models: context.models || [],
      availableHostedModels: context.availableHostedModels || [],
      availableLocalModels: context.availableLocalModels || [],
      availableOpenRouterModels: context.availableOpenRouterModels || []
    }
  }, [
    context.models,
    context.availableHostedModels,
    context.availableLocalModels,
    context.availableOpenRouterModels
  ])

  const {
    models,
    availableHostedModels,
    availableLocalModels,
    availableOpenRouterModels
  } = modelVariables
  const selectedWorkspace = context.selectedWorkspace
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
            method: "GET",
            credentials: "include"
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
      }, 100) // Small delay to ensure the input is rendered
    }
  }, [isOpen, inputRef])

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
      onOpenChange={(isOpen: boolean) => {
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
            No models available. Please check your API keys.
          </div>
        ) : (
          <Button
            ref={triggerRef}
            className="flex w-full items-center justify-between"
            variant="ghost"
          >
            <div className="flex items-center">
              {allModelsData.selectedModel && (
                <ModelIcon
                  provider={allModelsData.selectedModel.provider}
                  width={24}
                  height={24}
                />
              )}

              <div className="ml-2 flex items-center">
                {allModelsData.selectedModel ? (
                  <div className="text-base font-medium">
                    {allModelsData.selectedModel.modelName}
                  </div>
                ) : (
                  <div className="text-base font-medium">Select a model</div>
                )}
              </div>
            </div>

            <IconChevronDown />
          </Button>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="bg-background max-h-[calc(var(--radix-popover-content-available-height)-2rem)] w-[var(--radix-popover-trigger-width)] overflow-auto p-2"
        align="start"
      >
        <div className="mb-2 flex items-center gap-2">
          <Input
            ref={inputRef}
            className="h-8 flex-1"
            placeholder="Search models..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearch(e.target.value)
            }
          />

          <Tabs
            value={tab}
            onValueChange={(value: string) =>
              setTab(value as "hosted" | "local")
            }
          >
            <TabsList className="h-8 grid-cols-2">
              <TabsTrigger value="hosted">Hosted</TabsTrigger>
              <TabsTrigger value="local">Local</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="mt-4">
          {tab === "hosted" && (
            <div className="space-y-4">
              {/* Custom Models */}
              {allModelsData.groupedModels["custom"] &&
                allModelsData.groupedModels["custom"].length > 0 && (
                  <div>
                    <div className="mb-2 text-xs font-bold">CUSTOM MODELS</div>

                    <div className="space-y-1">
                      {allModelsData.groupedModels["custom"]
                        .filter(model =>
                          model.modelName
                            .toLowerCase()
                            .includes(search.toLowerCase())
                        )
                        .map(model => (
                          <ModelOption
                            key={model.modelId}
                            model={model}
                            onSelect={() => handleSelectModel(model.modelId)}
                          />
                        ))}
                    </div>
                  </div>
                )}

              {/* OpenAI Models */}
              {allModelsData.groupedModels["openai"] &&
                allModelsData.groupedModels["openai"].length > 0 && (
                  <div>
                    <div className="mb-2 text-xs font-bold">OPENAI MODELS</div>

                    <div className="space-y-1">
                      {allModelsData.groupedModels["openai"]
                        .filter(model =>
                          model.modelName
                            .toLowerCase()
                            .includes(search.toLowerCase())
                        )
                        .map(model => (
                          <ModelOption
                            key={model.modelId}
                            model={model}
                            onSelect={() => handleSelectModel(model.modelId)}
                          />
                        ))}
                    </div>
                  </div>
                )}

              {/* Anthropic Models */}
              {allModelsData.groupedModels["anthropic"] &&
                allModelsData.groupedModels["anthropic"].length > 0 && (
                  <div>
                    <div className="mb-2 text-xs font-bold">
                      ANTHROPIC MODELS
                    </div>

                    <div className="space-y-1">
                      {allModelsData.groupedModels["anthropic"]
                        .filter(model =>
                          model.modelName
                            .toLowerCase()
                            .includes(search.toLowerCase())
                        )
                        .map(model => (
                          <ModelOption
                            key={model.modelId}
                            model={model}
                            onSelect={() => handleSelectModel(model.modelId)}
                          />
                        ))}
                    </div>
                  </div>
                )}

              {/* Google Models */}
              {allModelsData.groupedModels["google"] &&
                allModelsData.groupedModels["google"].length > 0 && (
                  <div>
                    <div className="mb-2 text-xs font-bold">GOOGLE MODELS</div>
                    <div className="space-y-1">
                      {allModelsData.groupedModels["google"]
                        .filter(model =>
                          model.modelName
                            .toLowerCase()
                            .includes(search.toLowerCase())
                        )
                        .map(model => (
                          <ModelOption
                            key={model.modelId}
                            model={model}
                            onSelect={() => handleSelectModel(model.modelId)}
                          />
                        ))}
                    </div>
                  </div>
                )}

              {/* Mistral Models */}
              {allModelsData.groupedModels["mistral"] &&
                allModelsData.groupedModels["mistral"].length > 0 && (
                  <div>
                    <div className="mb-2 text-xs font-bold">MISTRAL MODELS</div>

                    <div className="space-y-1">
                      {allModelsData.groupedModels["mistral"]
                        .filter(model =>
                          model.modelName
                            .toLowerCase()
                            .includes(search.toLowerCase())
                        )
                        .map(model => (
                          <ModelOption
                            key={model.modelId}
                            model={model}
                            onSelect={() => handleSelectModel(model.modelId)}
                          />
                        ))}
                    </div>
                  </div>
                )}

              {/* OpenRouter Models */}
              {allModelsData.groupedModels["openrouter"] &&
                allModelsData.groupedModels["openrouter"].length > 0 && (
                  <div>
                    <div className="mb-2 text-xs font-bold">
                      OPENROUTER MODELS
                    </div>

                    <div className="space-y-1">
                      {allModelsData.groupedModels["openrouter"]
                        .filter(model =>
                          model.modelName
                            .toLowerCase()
                            .includes(search.toLowerCase())
                        )
                        .map(model => (
                          <ModelOption
                            key={model.modelId}
                            model={model}
                            onSelect={() => handleSelectModel(model.modelId)}
                          />
                        ))}
                    </div>
                  </div>
                )}
            </div>
          )}

          {tab === "local" && (
            <div className="space-y-4">
              {allModelsData.hasLocalModels ? (
                allModelsData.groupedModels["ollama"]
                  ?.filter(model =>
                    model.modelName.toLowerCase().includes(search.toLowerCase())
                  )
                  .map(model => (
                    <ModelOption
                      key={model.modelId}
                      model={model}
                      onSelect={() => handleSelectModel(model.modelId)}
                    />
                  ))
              ) : (
                <div className="text-muted-foreground text-center text-sm">
                  No local models available.
                </div>
              )}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
