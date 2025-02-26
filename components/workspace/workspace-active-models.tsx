"use client"

import { ChatbotUIContext } from "@/context/context"
import { LLM, ModelProvider } from "@/types"
import { FC, useContext, useState, useEffect } from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "../ui/accordion"
import { Checkbox } from "../ui/checkbox"
import { Label } from "../ui/label"
import { ScrollArea } from "../ui/scroll-area"
import { ModelIcon } from "../models/model-icon"
import { WithTooltip } from "../ui/with-tooltip"
import { IconInfoCircle } from "@tabler/icons-react"

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
  console.log("WorkspaceActiveModels rendering with workspaceId:", workspaceId)

  const {
    models,
    availableHostedModels,
    availableLocalModels,
    availableOpenRouterModels
  } = useContext(ChatbotUIContext)

  // Initialize with empty array first to prevent errors
  const [activeModelIds, setActiveModelIds] = useState<string[]>([])

  // Group models by provider - safely handle potential undefined arrays
  const allModels = [
    ...(availableHostedModels || []),
    ...(availableLocalModels || []),
    ...(availableOpenRouterModels || []),
    ...(models || []).map(model => ({
      modelId: model.model_id as string,
      modelName: model.name,
      provider: "custom" as ModelProvider
    }))
  ]

  // Filter out duplicate models by modelId and also filter out undefined/null values
  const allUniqueModels = allModels.filter(
    (model, index, self) =>
      model &&
      model.modelId &&
      index === self.findIndex(m => m && m.modelId === model.modelId)
  )

  const groupedModels = allUniqueModels.reduce<Record<string, LLM[]>>(
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

  // Use useEffect to initialize and update active models when context data changes
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
      ...(models || []).map(model => ({
        modelId: model.model_id as string,
        modelName: model.name,
        provider: "custom" as ModelProvider
      }))
    ]

    // Filter out duplicate models by modelId and also filter out undefined/null values
    const uniqueModelsInEffect = allModelsInEffect.filter(
      (model, index, self) =>
        model &&
        model.modelId &&
        index === self.findIndex(m => m && m.modelId === model.modelId)
    )

    // Helper function to find provider for a model
    const findProviderForModel = (modelId: string) => {
      const model = uniqueModelsInEffect.find(m => m.modelId === modelId)
      return model?.provider || "unknown"
    }

    // Fetch the active models from the database
    const fetchActiveModels = async () => {
      try {
        console.log("Fetching active models for workspace:", workspaceId)

        // Get active models from the database
        const response = await fetch(
          `/api/workspaces/${workspaceId}/active-models`,
          {
            method: "GET"
          }
        )

        if (response.ok) {
          const data = await response.json()
          console.log("Fetched active models:", data)

          if (data && data.length > 0) {
            // Extract model IDs from the response
            const savedModelIds = data.map(
              (model: { model_id: string }) => model.model_id
            )

            if (savedModelIds && savedModelIds.length > 0) {
              // Use the saved models from database
              console.log("Using saved model selection:", savedModelIds)
              setActiveModelIds(savedModelIds)

              // Also notify parent about active models with provider info
              const activeModelsWithProvider = savedModelIds.map(
                (modelId: string) => ({
                  modelId,
                  provider: findProviderForModel(modelId)
                })
              )

              onActiveModelsChange(activeModelsWithProvider)
              return // Exit early as we've set the models
            }
          }
        }

        // If no data returned, API error, or no saved models, fallback to all models
        console.log("No saved models found or error, selecting all models")
        const allModelIds = uniqueModelsInEffect
          .map(model => model.modelId)
          .filter(Boolean)
        setActiveModelIds(allModelIds)

        // Also notify parent
        const allModelsWithProvider = allModelIds.map(modelId => ({
          modelId,
          provider: findProviderForModel(modelId)
        }))

        onActiveModelsChange(allModelsWithProvider)
      } catch (err) {
        console.error("Error fetching active models:", err)
        // Initialize with all models in case of error
        const allModelIds = uniqueModelsInEffect
          .map(model => model.modelId)
          .filter(Boolean)
        setActiveModelIds(allModelIds)

        // Also notify parent
        const allModelsWithProvider = allModelIds.map(modelId => ({
          modelId,
          provider: findProviderForModel(modelId)
        }))

        onActiveModelsChange(allModelsWithProvider)
      }
    }

    // Call the function to fetch active models
    fetchActiveModels()
  }, [
    availableHostedModels,
    availableLocalModels,
    availableOpenRouterModels,
    models,
    workspaceId,
    onActiveModelsChange
  ])

  const handleToggleModel = (modelId: string) => {
    setActiveModelIds(prev => {
      const newActiveIds = prev.includes(modelId)
        ? prev.filter(id => id !== modelId)
        : [...prev, modelId]

      // Update parent component
      const activeModelsWithProvider = newActiveIds.map(id => {
        const model = allUniqueModels.find(m => m.modelId === id)
        return {
          modelId: id,
          provider: model?.provider || "unknown"
        }
      })

      onActiveModelsChange(activeModelsWithProvider)
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

      // Update parent component
      const activeModelsWithProvider = newActiveIds.map(id => {
        const model = allUniqueModels.find(m => m.modelId === id)
        return {
          modelId: id,
          provider: model?.provider || "unknown"
        }
      })

      onActiveModelsChange(activeModelsWithProvider)
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
    <div className="space-y-2">
      <div className="mb-2 text-sm">
        Select which models should be available in this workspace. Only selected
        models will be displayed in the model selector.
      </div>

      <ScrollArea className="h-[400px] pr-4">
        <Accordion type="multiple" className="w-full">
          {Object.entries(groupedModels).map(([provider, models]) => (
            <AccordionItem key={provider} value={provider}>
              <AccordionTrigger className="py-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`provider-${provider}`}
                    checked={isProviderActive(provider)}
                    data-state={
                      isProviderPartiallyActive(provider)
                        ? "indeterminate"
                        : undefined
                    }
                    onCheckedChange={checked =>
                      handleToggleProvider(provider, checked === true)
                    }
                    onClick={e => e.stopPropagation()}
                  />
                  <Label
                    htmlFor={`provider-${provider}`}
                    onClick={e => e.stopPropagation()}
                  >
                    {provider.charAt(0).toUpperCase() + provider.slice(1)}
                  </Label>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pl-6">
                  {models.map(model => (
                    <div
                      key={model.modelId}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`model-${model.modelId}`}
                        checked={activeModelIds.includes(model.modelId)}
                        onCheckedChange={() => handleToggleModel(model.modelId)}
                      />
                      <div className="flex items-center">
                        <ModelIcon
                          provider={model.provider}
                          width={16}
                          height={16}
                        />
                        <WithTooltip
                          display={
                            <div>
                              {model.provider !== "ollama" && model.pricing && (
                                <div className="space-y-1 text-sm">
                                  <div>
                                    <span className="font-semibold">
                                      Input Cost:
                                    </span>{" "}
                                    {model.pricing.inputCost}{" "}
                                    {model.pricing.currency} per{" "}
                                    {model.pricing.unit}
                                  </div>
                                  {model.pricing.outputCost && (
                                    <div>
                                      <span className="font-semibold">
                                        Output Cost:
                                      </span>{" "}
                                      {model.pricing.outputCost}{" "}
                                      {model.pricing.currency} per{" "}
                                      {model.pricing.unit}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          }
                          side="bottom"
                          trigger={
                            <Label
                              htmlFor={`model-${model.modelId}`}
                              className="ml-2 flex cursor-pointer items-center"
                            >
                              <span className="mr-1">{model.modelName}</span>
                              {model.pricing && (
                                <IconInfoCircle
                                  size={14}
                                  className="opacity-50"
                                />
                              )}
                            </Label>
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ScrollArea>
    </div>
  )
}
