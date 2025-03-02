import { NextResponse } from "next/server"
import { SERVER_SIDE_ONLY__PAID_ENTERPRISE_FEATURES_ENABLED } from "@/lib/constants"

/**
 * API route to check if enterprise features are enabled
 */
export async function GET() {
  // In a real app, you might check a database or license server here
  return NextResponse.json({
    enterprise_enabled: SERVER_SIDE_ONLY__PAID_ENTERPRISE_FEATURES_ENABLED
  })
}
