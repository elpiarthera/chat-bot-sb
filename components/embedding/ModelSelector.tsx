import React from "react"
import { CloudEmbeddingModel, HostedEmbeddingModel } from "./interfaces"
import { Card, CardContent } from "../ui/card"
import { Badge } from "../ui/badge"
import Text from "../ui/text"

interface ModelPreviewProps {
  model: CloudEmbeddingModel | HostedEmbeddingModel
  display?: boolean
  selected?: boolean
  onClick?: () => void
}

export const ModelPreview: React.FC<ModelPreviewProps> = ({
  model,
  display = false,
  selected = false,
  onClick
}) => {
  const isClickable = !!onClick

  return (
    <Card
      className={`
        border 
        ${selected ? "border-primary bg-primary/5" : "border-border"} 
        ${isClickable ? "cursor-pointer hover:border-primary transition-colors" : ""}
        overflow-hidden
      `}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Text className="font-semibold">{model.model_name}</Text>
              <Badge
                variant={model.type === "hosted" ? "outline" : "default"}
                className="text-xs"
              >
                {model.type === "hosted" ? "Self-hosted" : model.provider}
              </Badge>
            </div>

            <Text className="text-muted-foreground text-sm">
              {model.dimensions} dimensions
            </Text>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface ModelSelectorProps {
  models: (CloudEmbeddingModel | HostedEmbeddingModel)[]
  selectedModel?: CloudEmbeddingModel | HostedEmbeddingModel | null
  onSelectModel: (model: CloudEmbeddingModel | HostedEmbeddingModel) => void
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  models,
  selectedModel,
  onSelectModel
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {models.map(model => (
        <ModelPreview
          key={model.model_id}
          model={model}
          selected={selectedModel?.model_id === model.model_id}
          onClick={() => onSelectModel(model)}
        />
      ))}
    </div>
  )
}
