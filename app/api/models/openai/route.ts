import { getServerProfile } from "@/lib/server/server-chat-helpers"
import { checkApiKey } from "@/lib/server/server-chat-helpers"
import { OPENAI_LLM_LIST } from "@/lib/models/llm/openai-llm-list"
import OpenAI from "openai"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  console.log("🔍 OpenAI models API: Starting to fetch models")

  try {
    // Check if we're running on Vercel
    const isVercel = process.env.VERCEL === "1" || process.env.VERCEL === "true"
    console.log(
      `🔍 OpenAI models API: Running in ${isVercel ? "Vercel" : "local"} environment`
    )

    // Direct cookie access - simpler approach
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          }
        }
      }
    )

    // Get the user directly - simplest reliable approach
    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) {
      console.log("⚠️ OpenAI models API: No authenticated user")
      // Return hardcoded models if no user found
      return new Response(
        JSON.stringify({
          models: OPENAI_LLM_LIST.map(model => ({ id: model.modelId })),
          source: "fallback"
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store, max-age=0"
          }
        }
      )
    }

    console.log(`✅ OpenAI models API: User authenticated: ${user.id}`)

    // Get the user's profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (!profile || !profile.openai_api_key) {
      console.log("⚠️ OpenAI models API: No API key in profile")
      // Return hardcoded models if no API key found
      return new Response(
        JSON.stringify({
          models: OPENAI_LLM_LIST.map(model => ({ id: model.modelId })),
          source: "fallback"
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store, max-age=0"
          }
        }
      )
    }

    // Use the API key from the profile
    console.log(
      "🔍 OpenAI models API: API key found, fetching models from OpenAI"
    )
    const openaiConfig: any = {
      apiKey: profile.openai_api_key
    }

    // Only add organization if it exists in the profile
    if (profile.openai_organization_id) {
      openaiConfig.organization = profile.openai_organization_id
      console.log("🔍 OpenAI models API: Using organization ID")
    }

    try {
      const openai = new OpenAI(openaiConfig)
      const response = await openai.models.list()

      // Filter for chat models only (those starting with gpt-)
      const chatModels = response.data.filter(model =>
        model.id.startsWith("gpt-")
      )

      console.log(
        `✅ OpenAI models API: Successfully fetched ${chatModels.length} models from API`
      )

      return new Response(
        JSON.stringify({ models: chatModels, source: "api" }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store, max-age=0"
          }
        }
      )
    } catch (openaiError) {
      console.error(
        "❌ OpenAI models API: Error fetching from OpenAI:",
        openaiError
      )
      // Fall through to return hardcoded models
    }

    // Return hardcoded models as fallback
    console.log("⚠️ OpenAI models API: Using fallback models")
    return new Response(
      JSON.stringify({
        models: OPENAI_LLM_LIST.map(model => ({ id: model.modelId })),
        source: "fallback"
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, max-age=0"
        }
      }
    )
  } catch (error) {
    console.error("❌ OpenAI models API: Unexpected error:", error)

    // Return hardcoded models as a last resort
    return new Response(
      JSON.stringify({
        models: OPENAI_LLM_LIST.map(model => ({ id: model.modelId })),
        source: "fallback"
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, max-age=0"
        }
      }
    )
  }
}
