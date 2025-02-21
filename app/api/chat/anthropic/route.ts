import { CHAT_SETTING_LIMITS } from "@/lib/chat-setting-limits"
import { ChatSettings, LLMID } from "@/types"

export const runtime = "edge"

export async function POST(req: Request) {
  try {
    const { messages, chatSettings } = (await req.json()) as {
      messages: any[]
      chatSettings: ChatSettings
    }

    // Add type assertion for model
    const modelLimits = CHAT_SETTING_LIMITS[chatSettings.model as LLMID]
    if (!modelLimits) {
      throw new Error(`No limits found for model: ${chatSettings.model}`)
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        messages,
        system: messages[0].content,
        max_tokens: modelLimits.MAX_TOKEN_OUTPUT_LENGTH,
        stream: true
      })
    })

    return new Response(response.body)
  } catch (error) {
    console.error(error)
    return new Response("Error", { status: 500 })
  }
}
