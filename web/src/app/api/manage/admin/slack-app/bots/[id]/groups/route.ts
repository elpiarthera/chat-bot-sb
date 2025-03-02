import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { slackBotTable, slackBotGroupTable } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { checkAuth } from "@/lib/auth/utils";
import { UserRole } from "@/lib/types";

/**
 * API route for managing Slack bot group access
 */
export async function PUT(
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
        { detail: "Not authorized" },
        { status: 403 }
      );
    }

    const botId = parseInt(params.id);
    if (isNaN(botId)) {
      return NextResponse.json(
        { detail: "Invalid bot ID" },
        { status: 400 }
      );
    }

    // Check if bot exists
    const botExists = await db.query.slackBotTable.findFirst({
      where: eq(slackBotTable.id, botId),
    });

    if (!botExists) {
      return NextResponse.json(
        { detail: "Slack bot not found" },
        { status: 404 }
      );
    }

    const { is_public, groups } = await request.json();

    // Update the bot's public status
    await db
      .update(slackBotTable)
      .set({ is_public })
      .where(eq(slackBotTable.id, botId));

    // Delete existing group associations
    await db
      .delete(slackBotGroupTable)
      .where(eq(slackBotGroupTable.bot_id, botId));

    // Add new group associations if needed
    if (!is_public && groups && groups.length > 0) {
      const groupInserts = groups.map((groupId: number) => ({
        bot_id: botId,
        group_id: groupId,
      }));

      await db.insert(slackBotGroupTable).values(groupInserts);
    }

    return NextResponse.json(
      {
        detail: "Slack bot access settings updated successfully",
        is_public,
        groups
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating Slack bot groups:", error);
    return NextResponse.json(
      { detail: `Failed to update access settings: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    );
  }
}