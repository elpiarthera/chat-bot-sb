import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { Database } from "@/supabase/types"
import { createClient } from "@/lib/supabase/server"

// Force dynamic to prevent caching issues
export const dynamic = "force-dynamic"
export const revalidate = 0

interface ActiveModelRequestBody {
  activeModels: { modelId: string; provider: string }[]
}

export async function GET(
  request: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const workspaceId = params.workspaceId
    console.log(`🔍 Active Models API: Fetching for workspace ${workspaceId}`)

    if (!workspaceId) {
      console.log("⚠️ Active Models API: No workspace ID provided")
      return NextResponse.json([])
    }

    // Create a Supabase client with proper authentication
    const cookieStore = cookies()
    // Log available cookies
    console.log(
      "🔍 Active Models API: Available cookies:",
      cookieStore
        .getAll()
        .map(c => c.name)
        .join(", ")
    )

    // Use our centralized client with latest best practices
    const supabase = createClient(cookieStore)

    // Get the authenticated user
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser()

    if (userError) {
      console.error("❌ Active Models API: Auth error:", userError.message)
      console.error(
        "❌ Active Models API: Auth error details:",
        JSON.stringify(userError)
      )
    }

    if (!user) {
      console.error("❌ Active Models API: No authenticated user found")
      // Return empty array instead of 401 for GET requests - more forgiving
      return NextResponse.json([])
    }

    console.log(`✅ Active Models API: User authenticated: ${user.id}`)

    // Query the active models
    const { data, error } = await supabase
      .from("workspace_active_models")
      .select("*")
      .eq("workspace_id", workspaceId)

    if (error) {
      console.error("❌ Active Models API: Database error:", error.message)
      return NextResponse.json([])
    }

    console.log(
      `✅ Active Models API: Found ${data?.length || 0} active models`
    )
    return NextResponse.json(data || [])
  } catch (error) {
    console.error("❌ Active Models API: Unexpected error:", error)
    return NextResponse.json([])
  }
}

export async function POST(
  request: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const workspaceId = params.workspaceId
    console.log(`🔍 Active Models API: Saving for workspace ${workspaceId}`)

    // Create a Supabase client with proper authentication
    const cookieStore = cookies()
    // Log available cookies for debugging
    console.log(
      "🔍 Active Models API (POST): Available cookies:",
      cookieStore
        .getAll()
        .map(c => c.name)
        .join(", ")
    )

    // Use our centralized client with latest best practices
    const supabase = createClient(cookieStore)

    // Get the authenticated user
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser()

    if (userError) {
      console.error(
        "❌ Active Models API (POST): Auth error:",
        userError.message
      )
      console.error(
        "❌ Active Models API (POST): Auth error details:",
        JSON.stringify(userError)
      )
    }

    if (!user) {
      console.error("❌ Active Models API (POST): No authenticated user found")
      // For POST, return 401 since we need authentication
      return NextResponse.json(
        { error: "Authentication error" },
        { status: 401 }
      )
    }

    console.log(`✅ Active Models API: User authenticated: ${user.id}`)

    // Get the request body
    let activeModels
    try {
      const body = await request.json()
      activeModels = body.activeModels
      console.log(
        `🔍 Active Models API: Received ${activeModels?.length || 0} models to save`
      )
    } catch (parseError) {
      console.error(
        "❌ Active Models API: Error parsing request body:",
        parseError
      )
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 }
      )
    }

    // Delete existing models
    console.log("🔍 Active Models API: Deleting existing active models")
    const { error: deleteError } = await supabase
      .from("workspace_active_models")
      .delete()
      .eq("workspace_id", workspaceId)

    if (deleteError) {
      console.error(
        "❌ Active Models API: Error deleting models:",
        deleteError.message
      )
    }

    // Insert new models if any
    if (activeModels && activeModels.length > 0) {
      console.log(
        `🔍 Active Models API: Inserting ${activeModels.length} models`
      )

      const modelsToInsert = activeModels.map(
        (model: { modelId: string; provider: string }) => ({
          user_id: user.id,
          workspace_id: workspaceId,
          model_id: model.modelId,
          provider: model.provider
        })
      )

      const { error: insertError } = await supabase
        .from("workspace_active_models")
        .insert(modelsToInsert)

      if (insertError) {
        console.error(
          "❌ Active Models API: Insert error:",
          insertError.message
        )
        return NextResponse.json(
          { error: insertError.message },
          { status: 500 }
        )
      }

      console.log("✅ Active Models API: Successfully saved active models")
    } else {
      console.log("ℹ️ Active Models API: No models to insert")
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("❌ Active Models API: Unexpected error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
