import {
  processCSV,
  processJSON,
  processMarkdown,
  processPdf,
  processTxt,
  processWithUnstructured
} from "@/lib/retrieval/processing"
import { checkApiKey, getServerProfile } from "@/lib/server/server-chat-helpers"
import { Database } from "@/supabase/types"
import { FileItemChunk } from "@/types"
import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import OpenAI from "openai"

export async function POST(req: Request) {
  try {
    const supabaseAdmin = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const profile = await getServerProfile()
    const formData = await req.formData()

    const file_id = formData.get("file_id") as string
    const embeddingsProvider = formData.get("embeddingsProvider") as string
    const { data: fileMetadata, error: metadataError } = await supabaseAdmin
      .from("files")
      .select("*")
      .eq("id", file_id)
      .single()

    if (metadataError) {
      throw new Error(
        `Failed to retrieve file metadata: ${metadataError.message}`
      )
    }

    if (!fileMetadata) {
      throw new Error("File not found")
    }

    if (fileMetadata.user_id !== profile.user_id) {
      throw new Error("Unauthorized")
    }

    const { data: file, error: fileError } = await supabaseAdmin.storage
      .from("files")
      .download(fileMetadata.file_path)

    if (fileError)
      throw new Error(`Failed to retrieve file: ${fileError.message}`)

    const fileBuffer = Buffer.from(await file.arrayBuffer())
    const blob = new Blob([fileBuffer])
    const fileExtension = fileMetadata.name.split(".").pop()?.toLowerCase()
    try {
      if (profile.use_azure_openai) {
        checkApiKey(profile.azure_openai_api_key, "Azure OpenAI")
      } else {
        checkApiKey(profile.openai_api_key, "OpenAI")
      }
    } catch (error: any) {
      error.message =
        error.message +
        ", make sure it is configured or else use local embeddings"
      throw error
    }

    let chunks: FileItemChunk[] = []

    // Check if Unstructured API key is available
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from("settings" as any)
      .select("unstructured_api_key")
      .eq("user_id", profile.user_id)
      .single()

    if (settingsError) {
      console.error("Error fetching settings:", settingsError.message)
    }

    const useUnstructured =
      settings &&
      "unstructured_api_key" in settings &&
      settings.unstructured_api_key &&
      [
        "pdf",
        "docx",
        "pptx",
        "xlsx",
        "png",
        "jpg",
        "jpeg",
        "tiff",
        "gif"
      ].includes(fileExtension || "")

    if (useUnstructured) {
      try {
        console.log(`Processing ${fileExtension} file with Unstructured API`)
        chunks = await processWithUnstructured(
          blob,
          fileExtension || "",
          profile.user_id
        )
      } catch (unstructuredError) {
        console.error(
          "Unstructured processing failed, falling back to standard processing:",
          unstructuredError
        )
        // Fall back to standard processing
        chunks = await processFileWithStandardMethod(blob, fileExtension)
      }
    } else {
      chunks = await processFileWithStandardMethod(blob, fileExtension)
    }

    let embeddings: any = []

    let openai
    if (profile.use_azure_openai) {
      openai = new OpenAI({
        apiKey: profile.azure_openai_api_key || "",
        baseURL: `${profile.azure_openai_endpoint}/openai/deployments/${profile.azure_openai_embeddings_id}`,
        defaultQuery: { "api-version": "2023-12-01-preview" },
        defaultHeaders: { "api-key": profile.azure_openai_api_key }
      })
    } else {
      openai = new OpenAI({
        apiKey: profile.openai_api_key || "",
        organization: profile.openai_organization_id
      })
    }

    if (embeddingsProvider === "openai") {
      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: chunks.map(chunk => chunk.content)
      })

      embeddings = response.data.map((item: any) => {
        return item.embedding
      })
    } else {
      throw new Error("Local embeddings are not supported in this environment")
    }

    const file_items = chunks.map((chunk, index) => ({
      file_id,
      user_id: profile.user_id,
      content: chunk.content,
      tokens: chunk.tokens,
      openai_embedding: embeddings[index] || null,
      local_embedding: null
    }))

    await supabaseAdmin.from("file_items").upsert(file_items)

    const totalTokens = file_items.reduce((acc, item) => acc + item.tokens, 0)
    await supabaseAdmin
      .from("files")
      .update({ tokens: totalTokens })
      .eq("id", file_id)

    return new NextResponse("Embed Successful", {
      status: 200
    })
  } catch (error: any) {
    console.log(`Error in retrieval/process: ${error.stack}`)
    const errorMessage = error?.message || "An unexpected error occurred"
    const errorCode = error.status || 500
    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode
    })
  }
}

// Helper function to process file with standard method
async function processFileWithStandardMethod(
  blob: Blob,
  fileExtension?: string
): Promise<FileItemChunk[]> {
  switch (fileExtension) {
    case "csv":
      return await processCSV(blob)
    case "json":
      return await processJSON(blob)
    case "md":
      return await processMarkdown(blob)
    case "pdf":
      return await processPdf(blob)
    case "txt":
      return await processTxt(blob)
    default:
      throw new Error("Unsupported file type")
  }
}
