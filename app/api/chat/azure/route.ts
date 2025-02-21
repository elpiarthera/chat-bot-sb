import { checkApiKey, getServerProfile } from "@/lib/server/server-chat-helpers"
import { ChatAPIPayload } from "@/types"
import OpenAI from "openai"
import { ChatCompletionMessageParam } from "openai/resources/chat/completions"
import { createStream } from "@/lib/server/streaming-helpers"

export const runtime = "edge"

export async function POST(request: Request) {
  const json = await request.json()
  const { chatSettings, messages } = json as ChatAPIPayload

  try {
    const profile = await getServerProfile()
    checkApiKey(profile.azure_openai_api_key, "Azure OpenAI")

    const ENDPOINT = profile.azure_openai_endpoint
    const KEY = profile.azure_openai_api_key

    let DEPLOYMENT_ID = ""
    switch (chatSettings.model) {
      case "gpt-3.5-turbo":
        DEPLOYMENT_ID = profile.azure_openai_35_turbo_id || ""
        break
      case "gpt-4-turbo-preview":
        DEPLOYMENT_ID = profile.azure_openai_45_turbo_id || ""
        break
      case "gpt-4-vision-preview":
        DEPLOYMENT_ID = profile.azure_openai_45_vision_id || ""
        break
      default:
        return new Response(JSON.stringify({ message: "Model not found" }), {
          status: 400
        })
    }

    if (!ENDPOINT || !KEY || !DEPLOYMENT_ID) {
      return new Response(
        JSON.stringify({ message: "Azure resources not found" }),
        { status: 400 }
      )
    }

    const openai = new OpenAI({
      apiKey: KEY,
      baseURL: `${ENDPOINT}/openai/deployments/${DEPLOYMENT_ID}`,
      defaultQuery: { "api-version": "2023-12-01-preview" }
    })

    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    })) as ChatCompletionMessageParam[]

    const response = await openai.chat.completions.create({
      model: DEPLOYMENT_ID,
      messages: formattedMessages,
      temperature: chatSettings.temperature,
      max_tokens:
        chatSettings.model === "gpt-4-vision-preview" ? 4096 : undefined,
      stream: true
    })

    return createStream(response)
  } catch (error: any) {
    const errorMessage = error.error?.message || "An unexpected error occurred"
    const errorCode = error.status || 500
    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode
    })
  }
}
