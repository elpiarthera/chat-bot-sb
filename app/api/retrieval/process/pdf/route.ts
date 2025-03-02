import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { processPdf } from "@/lib/retrieval/processing"
import {
  processWithUnstructured,
  isFileTypeSupported
} from "@/lib/retrieval/processing/unstructured"
import { FileItemChunk } from "@/types/file-item-chunk"
import OpenAI from "openai"
import { OpenAIEmbeddings } from "@langchain/openai"

// Create OpenAI API client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Get user profile
    const { data: profile } = await supabase.auth.getUser()

    if (!profile || !profile.user) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      )
    }

    // Get form data from the request
    const formData = await request.formData()
    const file = formData.get("file") as File
    const fileId = formData.get("fileId") as string

    if (!file || !fileId) {
      return NextResponse.json(
        { error: "File and fileId are required" },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer())

    // Check if user has Unstructured API key
    const { data: settings, error: settingsError } = await supabase
      .from("settings")
      .select("unstructured_api_key")
      .eq("user_id", profile.user.id)
      .single()

    if (settingsError) {
      console.error("Error fetching settings:", settingsError.message)
    }

    let chunks: FileItemChunk[] = []

    // Use Unstructured API if available and file type is supported
    if (
      settings &&
      "unstructured_api_key" in settings &&
      settings.unstructured_api_key &&
      isFileTypeSupported("pdf")
    ) {
      try {
        console.log("Processing PDF with Unstructured API")
        // Create a Blob from the Buffer
        const fileBlob = new Blob([fileBuffer], { type: "application/pdf" })
        chunks = await processWithUnstructured(fileBlob, "pdf", profile.user.id)
      } catch (error) {
        console.error(
          "Error processing with Unstructured API, falling back to standard method:",
          error
        )
        // Fall back to standard processing
        chunks = await processPdf(fileBuffer as unknown as Blob)
      }
    } else {
      // Standard processing
      console.log("Processing PDF with standard method")
      chunks = await processPdf(fileBuffer as unknown as Blob)
    }

    // Generate embeddings for each chunk
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY
    })

    // Process chunks in batches to avoid rate limiting
    const batchSize = 5
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize)

      // Generate embeddings for the batch
      const texts = batch.map(chunk => chunk.content)
      const embeddingResults = await embeddings.embedDocuments(texts)

      // Store chunks and embeddings in the database
      for (let j = 0; j < batch.length; j++) {
        const chunk = batch[j]
        const embedding = embeddingResults[j]

        await supabase.from("file_items").insert({
          file_id: fileId,
          content: chunk.content,
          tokens: chunk.tokens,
          embedding
        })
      }
    }

    return NextResponse.json({ success: true, chunks: chunks.length })
  } catch (error) {
    console.error("Error processing PDF:", error)
    return NextResponse.json(
      { error: "Failed to process PDF" },
      { status: 500 }
    )
  }
}
