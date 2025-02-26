import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { Database } from "@/supabase/types"

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
    if (!workspaceId) return NextResponse.json([])

    // Create a Supabase client with proper authentication
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

    // Get the authenticated user
    const {
      data: { user }
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json([])

    const { data, error } = await supabase
      .from("workspace_active_models")
      .select("*")
      .eq("workspace_id", workspaceId)

    if (error) return NextResponse.json([])
    return NextResponse.json(data || [])
  } catch (error) {
    return NextResponse.json([])
  }
}

export async function POST(
  request: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const workspaceId = params.workspaceId

    // Create a Supabase client with proper authentication
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

    // Get the authenticated user
    const {
      data: { user }
    } = await supabase.auth.getUser()
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // Get the request body
    const { activeModels } = (await request.json()) as ActiveModelRequestBody

    // Delete existing models
    await supabase
      .from("workspace_active_models")
      .delete()
      .eq("workspace_id", workspaceId)

    // Insert new models if any
    if (activeModels && activeModels.length > 0) {
      const modelsToInsert = activeModels.map(model => ({
        user_id: user.id,
        workspace_id: workspaceId,
        model_id: model.modelId,
        provider: model.provider
      }))

      const { error: insertError } = await supabase
        .from("workspace_active_models")
        .insert(modelsToInsert)

      if (insertError) {
        return NextResponse.json(
          { error: insertError.message },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
