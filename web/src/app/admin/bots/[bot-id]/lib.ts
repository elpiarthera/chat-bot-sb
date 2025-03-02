// Functions for Slack channel configurations
import { SlackBotConfig } from "@/lib/types";

// Define the SlackChannelConfig type that was missing
export interface SlackChannelConfig {
  id: number;
  channel_config: {
    channel_name: string;
    disabled: boolean;
  };
  persona?: {
    id: number;
    name: string;
    document_sets: Array<{
      id: number;
      name: string;
    }>;
  };
  is_default?: boolean;
}

// Function to check if a persona is a Slack bot persona
export function isPersonaASlackBotPersona(persona: any): boolean {
  // Implement the logic to determine if a persona is a Slack bot persona
  // This is a placeholder implementation
  return persona.type === 'slack_bot';
}

// Function to delete a Slack channel configuration
export async function deleteSlackChannelConfig(configId: number): Promise<Response> {
  return fetch(`/api/admin/slack/channel-configs/${configId}`, {
    method: 'DELETE',
  });
}