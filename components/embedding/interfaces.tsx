export interface CloudEmbeddingModel {
  model_name: string
  model_id: string
  dimensions: number
  provider: string
  type: "cloud"
  api_key?: string
  custom_config?: any
}

export interface HostedEmbeddingModel {
  model_name: string
  model_id: string
  dimensions: number
  provider: string
  type: "hosted"
  custom_config?: any
}
