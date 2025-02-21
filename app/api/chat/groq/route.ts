import { CHAT_SETTING_LIMITS } from "@/lib/chat-setting-limits"
import { checkApiKey, getServerProfile } from "@/lib/server/server-chat-helpers"
import { ChatAPIPayload } from "@/types"
import { ChatCompletionMessageParam } from "openai/resources/chat/completions"
import { createStream } from "@/lib/server/streaming-helpers"

export const runtime = "edge"

export async function POST(request: Request) {
  const json = await request.json()
  const { chatSettings, messages } = json as ChatAPIPayload

  try {
    const profile = await getServerProfile()
    checkApiKey(profile.groq_api_key, "Groq")

    // Format messages with proper typing
    const formattedMessages: ChatCompletionMessageParam[] = messages.map(
      msg => ({
        role: msg.role as "user" | "assistant" | "system",
        content: msg.content
      })
    )

    // Make the API call with fetch to get a proper Response object
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${profile.groq_api_key}`
        },
        body: JSON.stringify({
          model: chatSettings.model,
          messages: formattedMessages,
          temperature: chatSettings.temperature,
          max_tokens:
            CHAT_SETTING_LIMITS[chatSettings.model]?.MAX_TOKEN_OUTPUT_LENGTH,
          stream: true
        })
      }
    )

    // Now OpenAIStream will work correctly with the Response object
    return createStream(response)
  } catch (error: any) {
    const errorMessage = error.error?.message || "An unexpected error occurred"
    const errorCode = error.status || 500
    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode
    })
  }
}
