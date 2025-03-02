import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getProfile } from "@/lib/user"

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const profile = await getProfile(supabase)

    if (!profile) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      )
    }

    // Get the API key from the request body
    const { apiKey } = await request.json()

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is required" },
        { status: 400 }
      )
    }

    // Create a simple test file
    const testText = "This is a test document for Unstructured API."
    const testFile = new Blob([testText], { type: "text/plain" })

    // Create form data for the API request
    const formData = new FormData()
    formData.append("files", testFile, "test.txt")

    // Make a test request to the Unstructured API
    try {
      const response = await fetch(
        "https://api.unstructured.io/general/v0/general",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "unstructured-api-key": apiKey
          },
          body: formData
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Unstructured API validation error:", errorText)
        return NextResponse.json(
          {
            valid: false,
            error: `API key validation, failed: ${response.status}`
          },
          { status: 200 }
        )
      }

      // API key is valid
      return NextResponse.json({ valid: true })
    } catch (error) {
      console.error("Error validating Unstructured API key:", error)
      return NextResponse.json(
        { valid: false, error: "Failed to validate API key" },
        { status: 200 }
      )
    }
  } catch (error) {
    console.error("Error in check-unstructured-api-key route:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
