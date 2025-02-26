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

    // Try to get the server profile using multiple approaches
    let profile
    let openaiApiKey = null

    try {
      console.log("🔍 OpenAI models API: Attempting to get server profile")
      profile = await getServerProfile()
      console.log("✅ OpenAI models API: Successfully retrieved profile")

      // If we have a profile, extract the API key
      if (profile && profile.openai_api_key) {
        openaiApiKey = profile.openai_api_key
        console.log("✅ OpenAI models API: Using API key from profile")
      }
    } catch (profileError) {
      console.error(
        "❌ OpenAI models API: Error getting profile:",
        profileError
      )
    }

    // If no API key from profile, try another approach
    if (!openaiApiKey) {
      console.log("🔍 OpenAI models API: Attempting direct cookie access")

      try {
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

        // Get the user directly
        const {
          data: { user }
        } = await supabase.auth.getUser()

        if (user) {
          // Get profile with the user ID
          const { data: directProfile } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", user.id)
            .single()

          if (directProfile && directProfile.openai_api_key) {
            openaiApiKey = directProfile.openai_api_key
            console.log(
              "✅ OpenAI models API: Successfully got API key from direct profile"
            )
          }
        }
      } catch (directError) {
        console.error(
          "❌ OpenAI models API: Error with direct approach:",
          directError
        )
      }
    }

    // If we have an API key, try to use it
    if (openaiApiKey) {
      try {
        console.log(
          "🔍 OpenAI models API: API key found, attempting to fetch models from OpenAI"
        )

        const openaiConfig: any = {
          apiKey: openaiApiKey
        }

        // Only add organization if it exists in the profile
        if (profile && profile.openai_organization_id) {
          openaiConfig.organization = profile.openai_organization_id
          console.log("🔍 OpenAI models API: Using organization ID")
        }

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
      }
    } else {
      console.log(
        "⚠️ OpenAI models API: No API key available, using fallback models"
      )
    }

    // Return a fallback response with hardcoded models
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

    // Return a fallback response with hardcoded models as a last resort
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
