import { NextResponse } from "next/server"
import { APIKey, APIKeyArgs } from "@/lib/types/api-keys"
import { SERVER_SIDE_ONLY__PAID_ENTERPRISE_FEATURES_ENABLED } from "@/lib/constants"
import { UserRole } from "@/lib/types"

// Mock API keys for demo
const mockApiKeys: APIKey[] = [
  {
    api_key_id: 1,
    api_key_display: "sk_test...y71b",
    api_key: null, // Only available on creation
    api_key_name: "Development API Key",
    api_key_role: UserRole.BASIC,
    user_id: "user1",
    created_at: "2023-05-15T10:00:00Z"
  },
  {
    api_key_id: 2,
    api_key_display: "sk_test...a93c",
    api_key: null,
    api_key_name: "Production API Key",
    api_key_role: UserRole.ADMIN,
    user_id: "user1",
    created_at: "2023-06-20T14:30:00Z"
  }
]

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

// Get all API keys
export async function GET(request: Request) {
  // Gated behind enterprise features
  if (!SERVER_SIDE_ONLY__PAID_ENTERPRISE_FEATURES_ENABLED) {
    return NextResponse.json(
      { error: "API key management is an Enterprise feature" },
      { status: 403 }
    )
  }

  // In a real implementation, you would fetch from the database
  return NextResponse.json(mockApiKeys)
}

// Create a new API key
export async function POST(request: Request) {
  // Gated behind enterprise features
  if (!SERVER_SIDE_ONLY__PAID_ENTERPRISE_FEATURES_ENABLED) {
    return NextResponse.json(
      { error: "API key management is an Enterprise feature" },
      { status: 403 }
    )
  }

  try {
    const body: APIKeyArgs = await request.json()

    // Validate input
    if (!body.role) {
      return NextResponse.json({ error: "Role is required" }, { status: 400 })
    }

    // Generate a new API key
    const apiKey = generateApiKey()

    // Create display version (first 7 and last 4 chars)
    const apiKeyDisplay = `${apiKey.substring(0, 7)}...${apiKey.substring(apiKey.length - 4)}`

    // Create new API key record
    const newApiKey: APIKey = {
      api_key_id: mockApiKeys.length + 1,
      api_key: apiKey,
      api_key_display: apiKeyDisplay,
      api_key_name: body.name || null,
      api_key_role: body.role,
      user_id: "current_user_id", // In a real implementation, get from authenticated user
      created_at: new Date().toISOString()
    }

    // In a real implementation, save to database
    mockApiKeys.push({
      ...newApiKey,
      api_key: null // Don't store full key in mock data for demo
    })

    return NextResponse.json(newApiKey, { status: 201 })
  } catch (error) {
    console.error("Error creating API key:", error)
    return NextResponse.json(
      { error: "Failed to create API key" },
      { status: 500 }
    )
  }
}
