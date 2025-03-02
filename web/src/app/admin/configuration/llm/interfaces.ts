export interface WellKnownLLMProviderDescriptor {
  name: string;
  display_name?: string;
  llm_names?: string[];
  default_model?: string;
  default_fast_model?: string;
}

export interface FullLLMProvider {
  id: string;
  name: string;
  provider: string;
  model_names: string[];
  is_default_provider: boolean;
  api_key?: string;
  api_base?: string;
  api_version?: string;
  default_model_name?: string | null;
  fast_default_model_name?: string | null;
  custom_config?: { [key: string]: string };
  is_public?: boolean;
  groups?: number[];
  deployment_name?: string | null;
} 