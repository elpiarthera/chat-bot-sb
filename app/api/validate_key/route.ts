import { createResponse } from "@/lib/server/server-utils"
import OpenAI from "openai"

export async function POST(request: Request) {
  const { provider, apiKey } = await request.json()

  if (!provider || !apiKey) {
    return createResponse({ message: "Provider and API key are required" }, 400)
  }

  try {
    let isValid = false

    switch (provider) {
      case "groq":
        const groq = new OpenAI({
          apiKey: apiKey,
          baseURL: "https://api.groq.com/openai/v1"
        })
        const models = await groq.models.list()
        isValid = models.data.length > 0
        break

      default:
        return createResponse({ message: "Invalid provider" }, 400)
    }

    return createResponse({ isValid }, 200)
  } catch (error: any) {
    console.error(`Error validating ${provider} API key:`, error)
    return createResponse({ message: `Invalid ${provider} API key` }, 401)
  }
}
