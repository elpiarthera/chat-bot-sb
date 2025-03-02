import { NextResponse } from "next/server"
import { SERVER_SIDE_ONLY__PAID_ENTERPRISE_FEATURES_ENABLED } from "@/lib/constants"

// Helper to generate a new API key
function generateApiKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  const prefix = "sk_test_"
  let result = prefix

  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  return result
}

// Regenerate an API key
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Gated behind enterprise features
  if (!SERVER_SIDE_ONLY__PAID_ENTERPRISE_FEATURES_ENABLED) {
    return NextResponse.json(
      { error: "API key management is an Enterprise feature" },
      { status: 403 }
    )
  }

  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid API key ID" }, { status: 400 })
    }

    // Generate a new API key
    const apiKey = generateApiKey()

    // Create display version (first 7 and last 4 chars)
    const apiKeyDisplay = `${apiKey.substring(0, 7)}...${apiKey.substring(apiKey.length - 4)}`

    // In a real implementation, update in database

    return NextResponse.json({
      api_key_id: id,
      api_key: apiKey,
      api_key_display: apiKeyDisplay
    })
  } catch (error) {
    console.error(`Error regenerating API key ${params.id}:`, error)
    return NextResponse.json(
      { error: "Failed to regenerate API key" },
      { status: 500 }
    )
  }
}
