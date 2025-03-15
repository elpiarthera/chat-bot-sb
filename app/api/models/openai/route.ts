import { getServerProfile } from "@/lib/server/server-chat-helpers"
import { checkApiKey } from "@/lib/server/server-chat-helpers"
import { OPENAI_LLM_LIST } from "@/lib/models/llm/openai-llm-list"
import OpenAI from "openai"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  try {
    // Add isVercel check to the top
    const isVercel = process.env.VERCEL === "1" || process.env.VERCEL === "true"
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    console.log("🔍 OpenAI models API: Starting request")

    // Create Supabase client for auth using our centralized implementation
    const cookieStore = cookies()

    // Log available cookies for debugging
    console.log(
      "🔍 OpenAI models API: Available cookies:",
      cookieStore
        .getAll()
        .map(c => c.name)
        .join(", ")
    )

    const supabase = createClient(cookieStore)

    // Get the current user
    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError) {
      console.error(
        "❌ OpenAI models API: Auth error getting user:",
        userError.message
      )
      return NextResponse.json(
        { error: "Authentication error" },
        { status: 401 }
      )
    }

    const user = userData.user
    if (!user) {
      console.error("❌ OpenAI models API: No authenticated user found")
      return NextResponse.json(
        { error: "Authentication error" },
        { status: 401 }
      )
    }

    console.log(`🔍 OpenAI models API: Retrieving profile for user ${user.id}`)

    // Get the user's profile to check API key settings
    const profileQuery = supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single()

    const { data: profile, error: profileError } = await profileQuery

    if (profileError) {
      console.error(
        "❌ OpenAI models API: Error retrieving profile:",
        profileError.message
      )
      return NextResponse.json(
        { error: "Error retrieving user profile" },
        { status: 500 }
      )
    }

    // Add detailed logging about the profile and API key
    console.log(
      `🔍 OpenAI models API: Profile retrieval result for user ${user.id}:`,
      profile ? "Profile found" : "No profile found"
    )

    if (profile) {
      // Log the profile keys to see its structure
      console.log(`🔍 OpenAI models API: Profile keys:`, Object.keys(profile))

      // Check specifically for the openai_api_key field
      if ("openai_api_key" in profile) {
        console.log(
          `🔍 OpenAI models API: OpenAI API key in profile: ${profile.openai_api_key ? "Present (not empty)" : "Empty string"}`
        )
      } else {
        console.log(
          `🔍 OpenAI models API: OpenAI API key field not found in profile`
        )
      }

      // If organization ID is set, log that too
      if (profile.openai_organization_id) {
        console.log("🔍 OpenAI models API: Organization ID is set in profile")
      }
    } else {
      // Log the query that was run to check for issues
      console.log(
        `🔍 OpenAI models API: No profile found for user_id=${user.id}. Check Supabase table.`
      )
    }

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
