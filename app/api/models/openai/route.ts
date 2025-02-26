import { getServerProfile } from "@/lib/server/server-chat-helpers"
import { checkApiKey } from "@/lib/server/server-chat-helpers"
import { OPENAI_LLM_LIST } from "@/lib/models/llm/openai-llm-list"
import OpenAI from "openai"

export async function GET() {
  try {
    // Try to get the server profile, but handle errors gracefully
    let profile
    try {
      profile = await getServerProfile()
      console.log("OpenAI models API: Successfully got profile")
    } catch (profileError) {
      console.error("OpenAI models API: Error getting profile:", profileError)
      // Return a fallback response with hardcoded models
      return new Response(
        JSON.stringify({
          models: OPENAI_LLM_LIST.map(model => ({ id: model.modelId })),
          source: "fallback"
        }),
        { status: 200 }
      )
    }

    // Check if an OpenAI API key is available
    if (!profile.openai_api_key) {
      console.log(
        "OpenAI models API: No API key available, using fallback models"
      )
      return new Response(
        JSON.stringify({
          models: OPENAI_LLM_LIST.map(model => ({ id: model.modelId })),
          source: "fallback"
        }),
        { status: 200 }
      )
    }

    try {
      // Try to fetch models from OpenAI
      const openai = new OpenAI({
        apiKey: profile.openai_api_key,
        organization: profile.openai_organization_id
      })

      const response = await openai.models.list()

      // Filter for chat models only (those starting with gpt-)
      const chatModels = response.data.filter(model =>
        model.id.startsWith("gpt-")
      )

      console.log("OpenAI models API: Successfully fetched models from API")
      return new Response(
        JSON.stringify({ models: chatModels, source: "api" }),
        { status: 200 }
      )
    } catch (openaiError) {
      console.error(
        "OpenAI models API: Error fetching from OpenAI:",
        openaiError
      )
      // Return a fallback response with hardcoded models
      return new Response(
        JSON.stringify({
          models: OPENAI_LLM_LIST.map(model => ({ id: model.modelId })),
          source: "fallback"
        }),
        { status: 200 }
      )
    }
  } catch (error: any) {
    console.error("OpenAI models API: Unexpected error:", error)
    // Return a fallback response with hardcoded models as a last resort
    return new Response(
      JSON.stringify({
        models: OPENAI_LLM_LIST.map(model => ({ id: model.modelId })),
        source: "fallback"
      }),
      { status: 200 }
    )
  }
}
