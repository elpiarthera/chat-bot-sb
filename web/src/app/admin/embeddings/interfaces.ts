export interface SavedSearchSettings {
  rerank_model_name: string | null;
  num_rerank: number;
  multilingual_expansion: string[];
  multipass_indexing: boolean;
  disable_rerank_for_streaming: boolean;
} 