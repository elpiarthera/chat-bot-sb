/**
 * API endpoint to clone a Slack bot
 * 
 * This endpoint creates a copy of an existing Slack bot with all its settings
 * and configurations.
 */

import { NextResponse } from "next/server";
import { checkAuth } from "@/lib/auth/utils";
import { UserRole } from "@/lib/types";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { slackBotTable, slackBotConfigTable } from "@/lib/db/schema";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication and authorization
    const auth = await checkAuth();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = auth.role === UserRole.ADMIN;
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Only admins can clone Slack bots" },
        { status: 403 }
      );
    }

    const botId = parseInt(params.id);
    if (isNaN(botId)) {
      return NextResponse.json(
        { error: "Invalid bot ID" },
        { status: 400 }
      );
    }

    // Get the original bot
    const originalBot = await db.query.slackBotTable.findFirst({
      where: eq(slackBotTable.id, botId),
      with: {
        configs: true,
      },
    });

    if (!originalBot) {
      return NextResponse.json(
        { error: "Slack bot not found" },
        { status: 404 }
      );
    }

    // Create a copy of the bot
    const newBot = await db.insert(slackBotTable).values({
      name: `${originalBot.name} - Copy`,
      bot_token: originalBot.bot_token,
      app_token: originalBot.app_token,
      enabled: false, // Start as disabled to prevent conflicts
      created_at: new Date(),
      updated_at: new Date(),
    }).returning();

    if (!newBot[0]) {
      return NextResponse.json(
        { error: "Failed to create new bot" },
        { status: 500 }
      );
    }

    const newBotId = newBot[0].id;

    // Clone bot configs if they exist
    if (originalBot.configs && originalBot.configs.length > 0) {
      const configValues = originalBot.configs.map(config => ({
        slack_bot_id: newBotId,
        channel_id: config.channel_id,
        document_set_id: config.document_set_id,
        persona_id: config.persona_id,
        is_default: config.is_default,
      }));

      await db.insert(slackBotConfigTable).values(configValues);
    }

    // Return the new bot
    const createdBot = await db.query.slackBotTable.findFirst({
      where: eq(slackBotTable.id, newBotId),
      with: {
        configs: true,
      },
    });

    return NextResponse.json(createdBot);
  } catch (error) {
    console.error("Error cloning slack bot:", error);
    return NextResponse.json(
      { error: "Failed to clone slack bot" },
      { status: 500 }
    );
  }
}