import { SlackBot } from "./types";

/**
 * Updates a specific field of a Slack bot
 * 
 * @param bot - The Slack bot to update
 * @param field - The field name to update
 * @param value - The new value for the field
 * @returns A Promise resolving to the API response
 */
export async function updateSlackBotField(
  bot: SlackBot, 
  field: string, 
  value: any
): Promise<Response> {
  const updateData = {
    [field]: value
  };

  return fetch(`/api/slack-bot/${bot.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updateData),
  });
}