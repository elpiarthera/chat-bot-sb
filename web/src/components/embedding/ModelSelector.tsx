import React from "react";
import { CloudEmbeddingModel, HostedEmbeddingModel, EmbeddingModel } from "./interfaces";

interface ModelPreviewProps {
  model: EmbeddingModel;
  display?: boolean;
  onClick?: () => void;
}

export const ModelPreview: React.FC<ModelPreviewProps> = ({ 
  model, 
  display = false,
  onClick
}) => {
  const isCloudModel = model.type === "cloud";
  
  return (
    <div 
      className={`p-4 border rounded-lg ${display ? '' : 'cursor-pointer hover:border-blue-500 transition-colors'} max-w-md`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-lg">{model.model_name}</h3>
          <div className="text-sm text-muted-foreground mt-1">
            <div className="flex items-center gap-2">
              <span>{model.dimensions} dimensions</span>
              <span>•</span>
              <span>{isCloudModel ? "Cloud" : "Hosted"}</span>
            </div>
          </div>
        </div>
        {isCloudModel && (
          <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
            {model.model_provider}
          </div>
        )}
      </div>
    </div>
  );
};

interface ModelSelectorProps {
  models: EmbeddingModel[];
  selectedModel?: EmbeddingModel | null;
  onSelectModel: (model: EmbeddingModel) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  models,
  selectedModel,
  onSelectModel
}) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Select Embedding Model</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {models.map((model) => (
          <ModelPreview 
            key={model.model_name} 
            model={model} 
            onClick={() => onSelectModel(model)}
          />
        ))}
      </div>
    </div>
  );
}; 