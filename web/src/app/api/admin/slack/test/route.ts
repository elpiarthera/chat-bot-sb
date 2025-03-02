import { NextResponse } from "next/server";

/**
 * API route for testing Slack tokens
 * This route validates that the provided bot_token and app_token can correctly
 * connect to the Slack API
 */
export async function POST(request: Request) {
  try {
    const { bot_token, app_token } = await request.json();
    
    if (!bot_token) {
      return NextResponse.json(
        { detail: "Bot token is required" },
        { status: 400 }
      );
    }

    if (!app_token) {
      return NextResponse.json(
        { detail: "App token is required" },
        { status: 400 }
      );
    }

    // Test bot token by calling Slack API auth.test endpoint
    const botTokenResponse = await fetch("https://slack.com/api/auth.test", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${bot_token}`,
      },
    });

    const botTokenData = await botTokenResponse.json();
    
    if (!botTokenData.ok) {
      return NextResponse.json(
        { detail: `Invalid bot token: ${botTokenData.error}` },
        { status: 400 }
      );
    }

    // Test app token by calling Slack API apps.connections.open endpoint
    const appTokenResponse = await fetch("https://slack.com/api/apps.connections.open", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${app_token}`,
      },
    });

    const appTokenData = await appTokenResponse.json();
    
    if (!appTokenData.ok) {
      return NextResponse.json(
        { detail: `Invalid app token: ${appTokenData.error}` },
        { status: 400 }
      );
    }

    // Both tokens are valid
    return NextResponse.json(
      { 
        detail: "Connection successful", 
        team: botTokenData.team,
        user: botTokenData.user
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error testing Slack connection:", error);
    return NextResponse.json(
      { detail: `Failed to test Slack connection: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    );
  }
}