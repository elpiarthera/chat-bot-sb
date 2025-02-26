import { getServerProfile } from "@/lib/server/server-chat-helpers"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"

// Define interface for document data
interface DocumentData {
  user_id: string
  title: string
  content: string
  format: string
  source_url: string | null
  folder_path: string
  slug: string
  created_at: string
  updated_at: string
}

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const {
      content,
      title,
      sourceUrl,
      format = "markdown",
      folder = "Scrapes"
    } = json

    // Validate required fields
    if (!content || !title) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Content and title are required"
        }),
        { status: 400 }
      )
    }

    // Initialize Supabase client
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Get current user
    const {
      data: { user }
    } = await supabase.auth.getUser()
    if (!user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Unauthorized"
        }),
        { status: 401 }
      )
    }

    // Create a slug from the title
    const slug = title
      .toLowerCase()
      .replace(/[^\w\s]/gi, "")
      .replace(/\s+/g, "-")

    // Create timestamp
    const timestamp = new Date().toISOString()

    // Prepare document data
    const documentData: Partial<DocumentData> = {
      user_id: user.id,
      title,
      content,
      format,
      source_url: sourceUrl || null,
      folder_path: folder,
      slug,
      created_at: timestamp,
      updated_at: timestamp
    }

    // Insert into documents table
    const { data: document, error } = await supabase
      .from("documents")
      .insert(documentData)
      .select()
      .single()

    if (error) {
      console.error("Error saving document:", error)
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to save content: " + error.message
        }),
        { status: 500 }
      )
    }

    // Return success with document info
    return new Response(
      JSON.stringify({
        success: true,
        id: document.id,
        url: `/library/${folder}/${slug}`
      }),
      { status: 200 }
    )
  } catch (error: any) {
    console.error("Error in save-content API:", error)
    return new Response(
      JSON.stringify({
        success: false,
        error: "An unexpected error occurred: " + error.message
      }),
      { status: 500 }
    )
  }
}
