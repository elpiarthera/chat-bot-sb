import { Database, Tables } from "@/supabase/types"
import { VALID_ENV_KEYS } from "@/types/valid-keys"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function getServerProfile() {
  console.log("🔍 getServerProfile: Starting to fetch user profile")

  try {
    const cookieStore = cookies()
    const supabase = createServerClient<Database>(
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

    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser()

    if (userError) {
      console.error("❌ getServerProfile: Auth error:", userError.message)

      // Create an empty profile that will be populated with env vars
      console.log(
        "⚠️ getServerProfile: Using environment variables only (auth error)"
      )
      const emptyProfile = {
        user_id: "env-fallback",
        id: "env-fallback",
        openai_api_key: null,
        anthropic_api_key: null,
        google_gemini_api_key: null,
        mistral_api_key: null,
        groq_api_key: null,
        perplexity_api_key: null,
        azure_openai_api_key: null,
        openai_organization_id: null,
        azure_openai_endpoint: null,
        azure_openai_35_turbo_id: null,
        azure_openai_45_vision_id: null,
        azure_openai_45_turbo_id: null,
        azure_openai_embeddings_id: null,
        openrouter_api_key: null,
        use_azure_openai: false
      } as Tables<"profiles">

      return addApiKeysToProfile(emptyProfile)
    }

    if (!user) {
      console.error("❌ getServerProfile: No user found after auth")

      // Create an empty profile that will be populated with env vars
      console.log(
        "⚠️ getServerProfile: Using environment variables only (no user)"
      )
      const emptyProfile = {
        user_id: "env-fallback",
        id: "env-fallback",
        openai_api_key: null,
        anthropic_api_key: null,
        google_gemini_api_key: null,
        mistral_api_key: null,
        groq_api_key: null,
        perplexity_api_key: null,
        azure_openai_api_key: null,
        openai_organization_id: null,
        azure_openai_endpoint: null,
        azure_openai_35_turbo_id: null,
        azure_openai_45_vision_id: null,
        azure_openai_45_turbo_id: null,
        azure_openai_embeddings_id: null,
        openrouter_api_key: null,
        use_azure_openai: false
      } as Tables<"profiles">

      return addApiKeysToProfile(emptyProfile)
    }

    console.log("✅ getServerProfile: User authenticated, fetching profile")
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (profileError || !profile) {
      console.error(
        "❌ getServerProfile: Profile error:",
        profileError?.message || "Profile not found"
      )

      // Create an empty profile that will be populated with env vars
      console.log(
        "⚠️ getServerProfile: Using environment variables only (profile error)"
      )
      const emptyProfile = {
        user_id: user.id,
        id: "env-fallback",
        openai_api_key: null,
        anthropic_api_key: null,
        google_gemini_api_key: null,
        mistral_api_key: null,
        groq_api_key: null,
        perplexity_api_key: null,
        azure_openai_api_key: null,
        openai_organization_id: null,
        azure_openai_endpoint: null,
        azure_openai_35_turbo_id: null,
        azure_openai_45_vision_id: null,
        azure_openai_45_turbo_id: null,
        azure_openai_embeddings_id: null,
        openrouter_api_key: null,
        use_azure_openai: false
      } as Tables<"profiles">

      return addApiKeysToProfile(emptyProfile)
    }

    console.log("✅ getServerProfile: Profile found, adding API keys")
    const profileWithKeys = addApiKeysToProfile(profile)
    return profileWithKeys
  } catch (error) {
    console.error("❌ getServerProfile: Unexpected error:", error)

    // Create an empty profile that will be populated with env vars
    console.log(
      "⚠️ getServerProfile: Using environment variables only (exception)"
    )
    const emptyProfile = {
      user_id: "env-fallback",
      id: "env-fallback",
      openai_api_key: null,
      anthropic_api_key: null,
      google_gemini_api_key: null,
      mistral_api_key: null,
      groq_api_key: null,
      perplexity_api_key: null,
      azure_openai_api_key: null,
      openai_organization_id: null,
      azure_openai_endpoint: null,
      azure_openai_35_turbo_id: null,
      azure_openai_45_vision_id: null,
      azure_openai_45_turbo_id: null,
      azure_openai_embeddings_id: null,
      openrouter_api_key: null,
      use_azure_openai: false
    } as Tables<"profiles">

    return addApiKeysToProfile(emptyProfile)
  }
}

function addApiKeysToProfile(profile: Tables<"profiles">) {
  const apiKeys = {
    [VALID_ENV_KEYS.OPENAI_API_KEY]: "openai_api_key",
    [VALID_ENV_KEYS.ANTHROPIC_API_KEY]: "anthropic_api_key",
    [VALID_ENV_KEYS.GOOGLE_GEMINI_API_KEY]: "google_gemini_api_key",
    [VALID_ENV_KEYS.MISTRAL_API_KEY]: "mistral_api_key",
    [VALID_ENV_KEYS.GROQ_API_KEY]: "groq_api_key",
    [VALID_ENV_KEYS.PERPLEXITY_API_KEY]: "perplexity_api_key",
    [VALID_ENV_KEYS.AZURE_OPENAI_API_KEY]: "azure_openai_api_key",
    [VALID_ENV_KEYS.OPENROUTER_API_KEY]: "openrouter_api_key",

    [VALID_ENV_KEYS.OPENAI_ORGANIZATION_ID]: "openai_organization_id",

    [VALID_ENV_KEYS.AZURE_OPENAI_ENDPOINT]: "azure_openai_endpoint",
    [VALID_ENV_KEYS.AZURE_GPT_35_TURBO_NAME]: "azure_openai_35_turbo_id",
    [VALID_ENV_KEYS.AZURE_GPT_45_VISION_NAME]: "azure_openai_45_vision_id",
    [VALID_ENV_KEYS.AZURE_GPT_45_TURBO_NAME]: "azure_openai_45_turbo_id",
    [VALID_ENV_KEYS.AZURE_EMBEDDINGS_NAME]: "azure_openai_embeddings_id"
  }

  for (const [envKey, profileKey] of Object.entries(apiKeys)) {
    if (process.env[envKey]) {
      ;(profile as any)[profileKey] = process.env[envKey]
    }
  }

  return profile
}

export function checkApiKey(apiKey: string | null, keyName: string) {
  if (apiKey === null || apiKey === "") {
    throw new Error(`${keyName} API Key not found`)
  }
}
