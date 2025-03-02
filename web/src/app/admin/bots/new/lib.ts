export interface SlackBotCreationRequest {
  name: string;
  enabled: boolean;

  bot_token: string;
  app_token: string;
}

const buildRequestBodyFromCreationRequest = (
  creationRequest: SlackBotCreationRequest
) => {
  return JSON.stringify({
    name: creationRequest.name,
    enabled: creationRequest.enabled,
    bot_token: creationRequest.bot_token,
    app_token: creationRequest.app_token,
  });
};

export const createSlackBot = async (
  creationRequest: SlackBotCreationRequest
) => {
  return fetch("/api/manage/admin/slack-app/bots", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: buildRequestBodyFromCreationRequest(creationRequest),
  });
};

export const updateSlackBot = async (
  id: number,
  creationRequest: SlackBotCreationRequest
) => {
  return fetch(`/api/manage/admin/slack-app/bots/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: buildRequestBodyFromCreationRequest(creationRequest),
  });
};

export const deleteSlackBot = async (id: number) => {
  return fetch(`/api/manage/admin/slack-app/bots/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
};

/**
 * Clones an existing Slack bot with all its configurations
 * 
 * @param id - The ID of the Slack bot to clone
 * @returns A Promise resolving to the API response
 */
export const cloneSlackBot = async (id: number) => {
  return fetch(`/api/slack-bot/${id}/clone`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
};

/**
 * Updates a specific field of a Slack bot
 * 
 * @param id - The ID of the Slack bot to update
 * @param field - The field name to update
 * @param value - The new value for the field
 * @returns A Promise resolving to the API response
 */
export const updateSlackBotField = async (
  id: number,
  field: string,
  value: any
) => {
  const updateData = {
    [field]: value
  };

  return fetch(`/api/slack-bot/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updateData),
  });
};