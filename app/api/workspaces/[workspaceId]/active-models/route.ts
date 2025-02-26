import { getServerProfile } from "@/lib/server/server-chat-helpers"
import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const revalidate = 0

interface ActiveModelRequestBody {
  activeModels: { modelId: string; provider: string }[]
}

// Create a Supabase client with the service role key to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    db: {
      schema: "public"
    }
  }
)

export async function GET(
  request: Request,
  { params }: { params: { workspaceId: string } }
) {
  console.log("API: GET active-models route called")

  try {
    const workspaceId = params.workspaceId

    if (!workspaceId) {
      console.log("API: No workspaceId provided, returning empty array")
      return NextResponse.json([])
    }

    // Attempt to get profile, but handle the case if it fails
    let profile
    try {
      profile = await getServerProfile()
      console.log("API: GET active models for:", {
        workspaceId,
        profileId: profile.id,
        userId: profile.user_id
      })
    } catch (profileError) {
      console.error("API: Error getting server profile:", profileError)
      // Continue without profile, we'll still try to get models
    }

    // Use the admin client with the service key to bypass RLS
    const { data, error } = await supabaseAdmin
      .from("workspace_active_models")
      .select("*")
      .eq("workspace_id", workspaceId)

    if (error) {
      console.error("API: Error fetching active models:", error)
      // Return empty array instead of throwing
      return NextResponse.json([])
    }

    console.log(`API: Successfully fetched ${data?.length || 0} active models`)
    return NextResponse.json(data || [])
  } catch (error) {
    console.error("API: Failed to fetch active models:", error)
    // Return empty array on any error to prevent client-side issues
    return NextResponse.json([])
  }
}

export async function POST(
  request: Request,
  { params }: { params: { workspaceId: string } }
) {
  console.log("API: POST active-models route called")

  try {
    const profile = await getServerProfile()
    const workspaceId = params.workspaceId
    const userId = profile.user_id

    console.log("API: Saving active models:", {
      workspaceId,
      profileId: profile.id,
      userId,
      profileType: typeof profile.id
    })

    let requestBody
    try {
      requestBody = await request.json()
      console.log("API: Request body parsed:", requestBody)
    } catch (e) {
      console.error("API: Error parsing request body:", e)
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      )
    }

    const { activeModels } = requestBody as ActiveModelRequestBody

    // First, let's directly delete existing models using admin client
    const { error: deleteError } = await supabaseAdmin
      .from("workspace_active_models")
      .delete()
      .eq("workspace_id", workspaceId)

    if (deleteError) {
      console.error("API: Error deleting existing models:", deleteError)
      throw new Error(`Error deleting existing models: ${deleteError.message}`)
    }

    // Then insert new ones if there are any
    if (activeModels.length > 0) {
      const modelsToInsert = activeModels.map(model => ({
        user_id: userId,
        workspace_id: workspaceId,
        model_id: model.modelId,
        provider: model.provider
      }))

      // Log what we're trying to insert
      console.log(
        "API: Inserting models:",
        JSON.stringify(modelsToInsert, null, 2)
      )

      // Insert all models at once
      const { error: insertError } = await supabaseAdmin
        .from("workspace_active_models")
        .insert(modelsToInsert)

      if (insertError) {
        console.error("API: Error inserting models:", insertError)
        throw new Error(`Error inserting models: ${insertError.message}`)
      }

      console.log(`API: Successfully inserted ${modelsToInsert.length} models`)
    } else {
      console.log("API: No models to insert")
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("API: Failed to update active models:", error)
    return NextResponse.json(
      { error: `Failed to update active models: ${error}` },
      { status: 500 }
    )
  }
}
