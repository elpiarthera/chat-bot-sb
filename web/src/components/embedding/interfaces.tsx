import { ConnectorIndexingStatus } from "@/lib/types";

export interface CloudEmbeddingModel {
  model_name: string;
  model_provider: string;
  dimensions: number;
  max_input_length: number;
  is_default?: boolean;
  type: "cloud";
}

export interface HostedEmbeddingModel {
  model_name: string;
  model_provider: string;
  dimensions: number;
  max_input_length: number;
  is_default?: boolean;
  type: "hosted";
  endpoint_url: string;
}

export type EmbeddingModel = CloudEmbeddingModel | HostedEmbeddingModel;