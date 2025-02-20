import { LLM } from "@/types"

export const GROQ_LLM_LIST: LLM[] = [
  {
    modelId: "llama3-8b-8192",
    modelName: "Llama 3 8B",
    provider: "groq",
    hostedId: "llama3-8b-8192",
    platformLink: "https://console.groq.com/docs/models/llama3-8b",
    imageInput: false,
    pricing: {
      currency: "USD",
      unit: "1M tokens",
      inputCost: 0.2,
      outputCost: 0.4
    }
  },
  {
    modelId: "llama3-70b-8192",
    modelName: "Llama 3 70B",
    provider: "groq",
    hostedId: "llama3-70b-8192",
    platformLink: "https://console.groq.com/docs/models/llama3-70b",
    imageInput: false,
    pricing: {
      currency: "USD",
      unit: "1M tokens",
      inputCost: 0.7,
      outputCost: 0.9
    }
  },
  {
    modelId: "mixtral-8x7b-32768",
    modelName: "Mixtral 8x7B",
    provider: "groq",
    hostedId: "mixtral-8x7b-32768",
    platformLink: "https://console.groq.com/docs/models/mixtral-8x7b",
    imageInput: false,
    pricing: {
      currency: "USD",
      unit: "1M tokens",
      inputCost: 0.27,
      outputCost: 0.27
    }
  },
  {
    modelId: "gemma-7b-it",
    modelName: "Gemma 7B",
    provider: "groq",
    hostedId: "gemma-7b-it",
    platformLink: "https://console.groq.com/docs/models/gemma-7b",
    imageInput: false,
    pricing: {
      currency: "USD",
      unit: "1M tokens",
      inputCost: 0.1,
      outputCost: 0.1
    }
  }
]
