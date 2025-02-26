import { Tables } from "@/supabase/types"
import { LLM, LLMID, OpenRouterLLM } from "@/types"
import { toast } from "sonner"
import { LLM_LIST_MAP } from "./llm/llm-list"
import { OPENAI_LLM_LIST, OPENAI_PLATORM_LINK } from "./llm/openai-llm-list"

export const fetchHostedModels = async (profile: Tables<"profiles">) => {
  try {
    const providers = ["google", "anthropic", "mistral", "groq", "perplexity"]

    if (profile.use_azure_openai) {
      providers.push("azure")
    } else {
      providers.push("openai")
    }

    const response = await fetch("/api/keys")

    if (!response.ok) {
      throw new Error(`Server is not responding.`)
    }

    const data = await response.json()

    let modelsToAdd: LLM[] = []

    if (
      !profile.use_azure_openai &&
      (profile?.openai_api_key || data.isUsingEnvKeyMap["openai"])
    ) {
      try {
        const openaiModels = await fetchOpenAIModels()
        if (openaiModels) {
          modelsToAdd.push(...openaiModels)
        }
      } catch (e) {
        modelsToAdd.push(...LLM_LIST_MAP["openai"])
      }
    } else if (profile.use_azure_openai) {
      if (profile?.azure_openai_api_key || data.isUsingEnvKeyMap["azure"]) {
        modelsToAdd.push(...LLM_LIST_MAP["azure"])
      }
    }

    for (const provider of providers) {
      let providerKey: keyof typeof profile

      if (provider === "google") {
        providerKey = "google_gemini_api_key"
      } else if (provider === "azure") {
        providerKey = "azure_openai_api_key"
      } else {
        providerKey = `${provider}_api_key` as keyof typeof profile
      }

      if (profile?.[providerKey] || data.isUsingEnvKeyMap[provider]) {
        const models = LLM_LIST_MAP[provider]

        if (Array.isArray(models)) {
          modelsToAdd.push(...models)
        }
      }
    }

    return {
      envKeyMap: data.isUsingEnvKeyMap,
      hostedModels: modelsToAdd
    }
  } catch (error) {
    console.warn("Error fetching hosted models: " + error)
  }
}

export const fetchOllamaModels = async () => {
  try {
    const response = await fetch(
      process.env.NEXT_PUBLIC_OLLAMA_URL + "/api/tags"
    )

    if (!response.ok) {
      throw new Error(`Ollama server is not responding.`)
    }

    const data = await response.json()

    const localModels: LLM[] = data.models.map((model: any) => ({
      modelId: model.name as LLMID,
      modelName: model.name,
      provider: "ollama",
      hostedId: model.name,
      platformLink: "https://ollama.ai/library",
      imageInput: false
    }))

    return localModels
  } catch (error) {
    console.warn("Error fetching Ollama models: " + error)
  }
}

export const fetchOpenRouterModels = async () => {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/models")

    if (!response.ok) {
      throw new Error(`OpenRouter server is not responding.`)
    }

    const { data } = await response.json()

    const openRouterModels = data.map(
      (model: {
        id: string
        name: string
        context_length: number
      }): OpenRouterLLM => ({
        modelId: model.id as LLMID,
        modelName: model.id,
        provider: "openrouter",
        hostedId: model.name,
        platformLink: "https://openrouter.dev",
        imageInput: false,
        maxContext: model.context_length
      })
    )

    return openRouterModels
  } catch (error) {
    console.error("Error fetching Open Router models: " + error)
    toast.error("Error fetching Open Router models: " + error)
  }
}

export const fetchOpenAIModels = async () => {
  try {
    const response = await fetch("/api/models/openai")

    if (!response.ok) {
      throw new Error(`OpenAI models API is not responding.`)
    }

    const { models } = await response.json()

    const openaiModels: LLM[] = models.map((model: any) => {
      const staticModel = OPENAI_LLM_LIST.find(m => m.modelId === model.id)

      return {
        modelId: model.id as LLMID,
        modelName: formatModelName(model.id),
        provider: "openai",
        hostedId: model.id,
        platformLink: OPENAI_PLATORM_LINK,
        imageInput: model.id.includes("vision"),
        pricing: staticModel?.pricing || undefined
      }
    })

    return openaiModels
  } catch (error) {
    console.warn("Error fetching OpenAI models: " + error)
    return OPENAI_LLM_LIST
  }
}

function formatModelName(modelId: string): string {
  return modelId
    .split("-")
    .map((part, index) =>
      index === 0
        ? part.toUpperCase()
        : part.charAt(0).toUpperCase() + part.slice(1)
    )
    .join(" ")
    .replace("Preview", "")
    .trim()
}
