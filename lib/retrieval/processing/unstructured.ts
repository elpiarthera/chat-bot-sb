import { FileItemChunk } from "@/types"
import { encode } from "gpt-tokenizer"
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"
import { CHUNK_OVERLAP, CHUNK_SIZE } from "."
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

// List of file extensions supported by Unstructured API
export const UNSTRUCTURED_SUPPORTED_EXTENSIONS = [
  "csv",
  "docx",
  "doc",
  "epub",
  "eml",
  "html",
  "md",
  "msg",
  "odt",
  "pdf",
  "ppt",
  "pptx",
  "txt",
  "xlsx",
  "xls"
]

/**
 * Checks if a file extension is supported by the Unstructured API
 */
export function isFileTypeSupported(fileExtension: string): boolean {
  return UNSTRUCTURED_SUPPORTED_EXTENSIONS.includes(fileExtension.toLowerCase())
}

/**
 * Processes a document using the Unstructured API
 * @param file The file blob to process
 * @param fileExtension The file extension (pdf, docx, etc.)
 * @param userId The user ID for retrieving API key
 * @returns Array of text chunks with token counts
 */
export const processWithUnstructured = async (
  file: Blob,
  fileExtension: string,
  userId: string
): Promise<FileItemChunk[]> => {
  try {
    // Get the Unstructured API key from settings
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    const { data: settings, error } = await supabase
      .from("settings")
      .select("unstructured_api_key")
      .eq("user_id", userId)
      .single()

    if (error || !settings?.unstructured_api_key) {
      throw new Error("Unstructured API key not found")
    }

    // Create form data for the API request
    const formData = new FormData()
    formData.append("files", file)

    // Optional parameters based on file type
    formData.append("strategy", "auto")

    // Add file-specific parameters
    if (fileExtension === "pdf") {
      formData.append("pdf_infer_table_structure", "true")
    }

    // Call the Unstructured API
    const response = await fetch(
      "https://api.unstructured.io/general/v0/general",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "unstructured-api-key": settings.unstructured_api_key
        },
        body: formData
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Unstructured API error:", errorText)
      throw new Error(`Unstructured API error: ${response.status} ${errorText}`)
    }

    const extractedData = await response.json()

    // Process the extracted elements
    // Filter for text content (narrative text, titles, etc.)
    const textElements = extractedData.filter((item: any) =>
      [
        "NarrativeText",
        "Title",
        "ListItem",
        "Text",
        "UncategorizedText"
      ].includes(item.type)
    )

    // Sort by page number and position to maintain document order
    textElements.sort((a: any, b: any) => {
      if (a.metadata?.page_number !== b.metadata?.page_number) {
        return (a.metadata?.page_number || 0) - (b.metadata?.page_number || 0)
      }
      return (a.metadata?.element_id || 0) - (b.metadata?.element_id || 0)
    })

    // Extract and join the text
    const extractedText = textElements
      .map((item: any) => item.text)
      .join("\n\n")

    // Process tables separately if present
    const tableElements = extractedData.filter(
      (item: any) => item.type === "Table"
    )
    let tableText = ""

    if (tableElements.length > 0) {
      tableText = tableElements
        .map((table: any) => {
          if (table.metadata?.text_as_html) {
            return `Table: ${table.text}`
          }
          return `Table: ${table.text}`
        })
        .join("\n\n")
    }

    // Combine all text
    const combinedText = [extractedText, tableText].filter(Boolean).join("\n\n")

    // Split the text into chunks
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: CHUNK_SIZE,
      chunkOverlap: CHUNK_OVERLAP
    })

    const splitDocs = await splitter.createDocuments([combinedText])

    // Create chunks with token counts
    const chunks: FileItemChunk[] = splitDocs.map(doc => ({
      content: doc.pageContent,
      tokens: encode(doc.pageContent).length
    }))

    return chunks
  } catch (error) {
    console.error("Error processing with Unstructured:", error)
    throw error
  }
}
