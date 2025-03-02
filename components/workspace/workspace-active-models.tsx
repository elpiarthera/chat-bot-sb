import { ChatbotUIContext } from "@/context/context"
import {
  FC,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
  useMemo
} from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ModelIcon } from "../models/model-icon"
import { WithTooltip } from "../ui/with-tooltip"
import { IconInfoCircle } from "@tabler/icons-react"

// Define ModelProvider type if it's not available from imports
type ModelProvider =
  | "openai"
  | "anthropic"
  | "google"
  | "local"
  | "hosted"
  | "openrouter"
  | "custom"
  | string

interface WorkspaceActiveModelsProps {
  workspaceId: string
  onActiveModelsChange: (
    activeModels: { modelId: string; provider: string }[]
  ) => void
}

export const WorkspaceActiveModels: FC<WorkspaceActiveModelsProps> = ({
  workspaceId,
  onActiveModelsChange
}) => {
  const context = useContext(ChatbotUIContext) as any
  const { modelProviders, hostedModels, localModels, openRouterModels } =
    context

  const [activeModelIds, setActiveModelIds] = useState<string[]>([])
  const [isLoadingModels, setIsLoadingModels] = useState(true)
  const prevActiveModelIdsRef = useRef<any[]>([])

  // Wrap model variables in useMemo to avoid dependency changes on every render
  const modelVariables = useMemo(() => {
    const models = modelProviders?.flatMap((provider: any) => {
      if (provider.provider === "local") return localModels || []
      if (provider.provider === "hosted") return hostedModels || []
      if (provider.provider === "openrouter") return openRouterModels || []
      return []
    })
    const availableHostedModels = hostedModels || []
    const availableLocalModels = localModels || []
    const availableOpenRouterModels = openRouterModels || []
    return {
      models,
      availableHostedModels,
      availableLocalModels,
      availableOpenRouterModels
    }
  }, [modelProviders, localModels, hostedModels, openRouterModels])

  const {
    models,
    availableHostedModels,
    availableLocalModels,
    availableOpenRouterModels
  } = modelVariables

  // Calculate all unique models and group them by provider
  const allUniqueModels = useMemo(() => {
    const allModels = [
      ...(availableHostedModels || []),
      ...(availableLocalModels || []),
      ...(availableOpenRouterModels || []),
      ...(models || []).map((model: any) => ({
        modelId: model.model_id as string,
        modelName: model.name,
        provider: "custom" as ModelProvider
      }))
    ]

    // Filter out duplicate models by modelId and also filter out undefined/null values
    return allModels.filter(
      (model: any, index: number, self: any[]) =>
        model &&
        model.modelId &&
        index === self.findIndex((m: any) => m && m.modelId === model.modelId)
    )
  }, [
    availableHostedModels,
    availableLocalModels,
    availableOpenRouterModels,
    models
  ])

  // Group models by provider
  const groupedModels = useMemo(() => {
    const grouped: Record<string, any[]> = {}

    allUniqueModels.forEach((model: any) => {
      const provider = model.provider || "unknown"
      if (!grouped[provider]) {
        grouped[provider] = []
      }
      grouped[provider].push(model)
    })

    return grouped
  }, [allUniqueModels])

  useEffect(() => {
    // Wait for models to be loaded before initializing
    if (
      !availableHostedModels ||
      !availableLocalModels ||
      !availableOpenRouterModels
    ) {
      console.log("Some model arrays are not yet loaded, waiting...")
      return
    }

    // First, calculate all unique models inside the effect to avoid dependency issues
    const allModelsInEffect = [
      ...(availableHostedModels || []),
      ...(availableLocalModels || []),
      ...(availableOpenRouterModels || []),
      ...(models || []).map((model: any) => ({
        modelId: model.model_id as string,
        modelName: model.name,
        provider: "custom" as ModelProvider
      }))
    ]

    // Filter out duplicate models by modelId and also filter out undefined/null values
    const uniqueModelsInEffect = allModelsInEffect.filter(
      (model: any, index: number, self: any[]) =>
        model &&
        model.modelId &&
        index === self.findIndex((m: any) => m && m.modelId === model.modelId)
    )

    // Helper function to find provider for a model
    const findProviderForModel = (modelId: string) => {
      const model = uniqueModelsInEffect.find((m: any) => m.modelId === modelId)
      return model?.provider || "unknown"
    }

    // Fetch the active models from the database
    const fetchActiveModels = async () => {
      try {
        console.log("Fetching active models for workspace:", workspaceId)

        // Get active models from the database - simple fetch
        const response = await fetch(
          `/api/workspaces/${workspaceId}/active-models`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              // Explicitly disable cache to avoid stale auth issues
              "Cache-Control": "no-cache",
              Pragma: "no-cache"
            }
          }
        )

        if (!response.ok) {
          const errorText = await response.text()
          console.error("Error fetching active models:", errorText)
          setIsLoadingModels(false)
          return
        }

        const data = await response.json()
        console.log("Active models data:", data)

        // Set the active model IDs
        setActiveModelIds(data.map((model: any) => model.model_id))
        setIsLoadingModels(false)
      } catch (error) {
        console.error("Error fetching active models:", error)
        setIsLoadingModels(false)
      }
    }

    // Call the fetch function
    fetchActiveModels()
  }, [
    workspaceId,
    availableHostedModels,
    availableLocalModels,
    availableOpenRouterModels,
    models,
    onActiveModelsChange
  ])

  // Fix the useEffect that notifies parent component to prevent infinite loops
  useEffect(() => {
    // Skip if no models or no change from previous state
    if (activeModelIds.length === 0) return

    // Check if the active model IDs have actually changed
    const prevIds = prevActiveModelIdsRef.current
    const hasChanged =
      prevIds.length !== activeModelIds.length ||
      activeModelIds.some(id => !prevIds.includes(id))

    if (!hasChanged) return

    // Update the ref with current values
    prevActiveModelIdsRef.current = [activeModelIds, onActiveModelsChange]

    // Helper function to find provider for a model
    const findProviderForModel = (modelId: string) => {
      const model = allUniqueModels.find((m: any) => m.modelId === modelId)
      return model?.provider || "unknown"
    }

    const activeModelsWithProvider = activeModelIds.map(modelId => ({
      modelId,
      provider: findProviderForModel(modelId)
    }))

    // Notify parent about the change
    onActiveModelsChange(activeModelsWithProvider)
  }, [activeModelIds, onActiveModelsChange, allUniqueModels])

  const handleToggleModel = (modelId: string) => {
    setActiveModelIds(prev => {
      const newActiveIds = prev.includes(modelId)
        ? prev.filter(id => id !== modelId)
        : [...prev, modelId]

      return newActiveIds
    })
  }

  const handleToggleProvider = (provider: string, isChecked: boolean) => {
    const providerModels = groupedModels[provider] || []
    const providerModelIds = providerModels.map(model => model.modelId)

    setActiveModelIds(prev => {
      let newActiveIds
      if (isChecked) {
        // Add all models from this provider that aren't already active
        const newModelIds = providerModelIds.filter(id => !prev.includes(id))
        newActiveIds = [...prev, ...newModelIds]
      } else {
        // Remove all models from this provider
        newActiveIds = prev.filter(id => !providerModelIds.includes(id as any))
      }

      return newActiveIds
    })
  }

  const isProviderActive = (provider: string) => {
    const providerModels = groupedModels[provider] || []
    return (
      providerModels.length > 0 &&
      providerModels.every(model => activeModelIds.includes(model.modelId))
    )
  }

  const isProviderPartiallyActive = (provider: string) => {
    const providerModels = groupedModels[provider] || []
    return (
      providerModels.length > 0 &&
      providerModels.some(model => activeModelIds.includes(model.modelId)) &&
      !providerModels.every(model => activeModelIds.includes(model.modelId))
    )
  }

  return (
    <>
      <div className="space-y-2">
        <div className="mb-2 text-sm">
          Select which models should be available in this workspace. Only
          selected models will be displayed in the model selector.
        </div>
        <ScrollArea className="h-[400px] pr-4">
          <Accordion type="multiple" className="w-full">
            {Object.entries(groupedModels).map(([provider, models]) => (
              <AccordionItem key={provider} value={provider}>
                <div className="flex items-center">
                  <div className="flex items-center space-x-2 py-2">
                    <Checkbox
                      id={`provider-${provider}`}
                      checked={isProviderActive(provider)}
                      data-state={
                        isProviderPartiallyActive(provider)
                          ? "indeterminate"
                          : undefined
                      }
                      onCheckedChange={(checked: boolean | "indeterminate") =>
                        handleToggleProvider(provider, checked === true)
                      }
                    />
                  </div>
                </div>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollArea>
      </div>
    </>
  )
}
