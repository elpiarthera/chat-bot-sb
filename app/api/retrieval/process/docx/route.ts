import {
  processDocX,
  processWithUnstructured
} from "@/lib/retrieval/processing"
import { checkApiKey, getServerProfile } from "@/lib/server/server-chat-helpers"
import { Database } from "@/supabase/types"
import { FileItemChunk } from "@/types"
import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import OpenAI from "openai"

export async function POST(req: Request) {
  const json = await req.json()
  const { text, fileId, embeddingsProvider, fileExtension } = json as {
    text: string
    fileId: string
    embeddingsProvider: "openai" | "local"
    fileExtension: string
  }

  try {
    const supabaseAdmin = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const profile = await getServerProfile()

    if (embeddingsProvider === "openai") {
      if (profile.use_azure_openai) {
        checkApiKey(profile.azure_openai_api_key, "Azure OpenAI")
      } else {
        checkApiKey(profile.openai_api_key, "OpenAI")
      }
    }

    let chunks: FileItemChunk[] = []

    // Check if Unstructured API key is available
    const { data: settings } = await supabaseAdmin
      .from("settings")
      .select("unstructured_api_key")
      .eq("user_id", profile.user_id)
      .single()

    const useUnstructured =
      settings?.unstructured_api_key && fileExtension === "docx"

    if (useUnstructured) {
      try {
        console.log("Processing DOCX file with Unstructured API")
        // Convert text to blob for Unstructured API
        const textEncoder = new TextEncoder()
        const encodedText = textEncoder.encode(text)
        const blob = new Blob([encodedText], {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        })

        chunks = await processWithUnstructured(
          blob,
          fileExtension,
          profile.user_id
        )
      } catch (unstructuredError) {
        console.error(
          "Unstructured processing failed, falling back to standard processing:",
          unstructuredError
        )
        // Fall back to standard processing
        chunks = await processDocX(text)
      }
    } else {
      switch (fileExtension) {
        case "docx":
          chunks = await processDocX(text)
          break
        default:
          return new NextResponse("Unsupported file type", {
            status: 400
          })
      }
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
      file_id: fileId,
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
      .eq("id", fileId)

    return new NextResponse("Embed Successful", {
      status: 200
    })
  } catch (error: any) {
    console.error(error)
    const errorMessage = error.error?.message || "An unexpected error occurred"
    const errorCode = error.status || 500
    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode
    })
  }
}
