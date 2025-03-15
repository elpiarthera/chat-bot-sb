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
    const supabase = createClient(cookieStore)

    // Get the authenticated user - improve error handling here
    const {
      data: { session },
      error: sessionError
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error(
        "❌ Active Models API: Session error:",
        sessionError.message
      )
    }

    // Instead of returning a 401, return empty data for GET request
    // This is more resilient for UI rendering and prevents errors
    if (!session || !session.user) {
      console.log("⚠️ Active Models API: No authenticated session found")
      return NextResponse.json([])
    }

    console.log(`✅ Active Models API: User authenticated: ${session.user.id}`)

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
    const { activeModels } = await request.json()

    // Create a Supabase client with proper authentication
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Require authentication for write operations
    const {
      data: { session },
      error: sessionError
    } = await supabase.auth.getSession()

    if (sessionError || !session || !session.user) {
      console.error("❌ Active Models API: Authentication error")
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    console.log(`✅ Active Models API: User authenticated: ${session.user.id}`)

    // Get the request body
    console.log(
      `🔍 Active Models API: Received ${activeModels?.length || 0} models to save`
    )

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
          user_id: session.user.id,
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
    console.error("❌ Active Models API POST error:", error)
    return NextResponse.json(
      { error: "Failed to update active models" },
      { status: 500 }
    )
  }
}
