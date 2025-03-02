import { UserRole } from "@/lib/types"

export interface APIKey {
  api_key_id: number
  api_key_display: string // Partial key for display (e.g., sk_...123)
  api_key: string | null // Full key, only available upon creation
  api_key_name: string | null
  api_key_role: UserRole
  user_id: string
  created_at?: string
}

export interface APIKeyArgs {
  name?: string
  role: UserRole
}
