import { SlackBot } from "../../../../lib/types";

/**
 * Mock Slack bots for testing purposes
 */
export const mockSlackBots: SlackBot[] = [
  {
    id: 1,
    name: "Support Bot",
    enabled: true,
    bot_token: "xoxb-test-token-1",
    app_token: "xapp-test-token-1",
    created_at: new Date("2023-01-01T00:00:00Z").toISOString(),
    updated_at: new Date("2023-01-01T00:00:00Z").toISOString(),
    configs_count: 5,
    is_public: true,
  },
  {
    id: 2,
    name: "Marketing Bot",
    enabled: true,
    bot_token: "xoxb-test-token-2",
    app_token: "xapp-test-token-2",
    created_at: new Date("2023-01-02T00:00:00Z").toISOString(),
    updated_at: new Date("2023-01-02T00:00:00Z").toISOString(),
    configs_count: 3,
    is_public: true,
  },
  {
    id: 3,
    name: "Development Bot",
    enabled: false,
    bot_token: "xoxb-test-token-3",
    app_token: "xapp-test-token-3",
    created_at: new Date("2023-01-03T00:00:00Z").toISOString(),
    updated_at: new Date("2023-01-03T00:00:00Z").toISOString(),
    configs_count: 0,
    is_public: true,
  },
  {
    id: 4,
    name: "Sales Bot",
    enabled: true,
    bot_token: "xoxb-test-token-4",
    app_token: "xapp-test-token-4",
    created_at: new Date("2023-01-04T00:00:00Z").toISOString(),
    updated_at: new Date("2023-01-04T00:00:00Z").toISOString(),
    configs_count: 8,
    is_public: true,
  },
  {
    id: 5,
    name: "Testing Bot",
    enabled: false,
    bot_token: "xoxb-test-token-5",
    app_token: "xapp-test-token-5",
    created_at: new Date("2023-01-05T00:00:00Z").toISOString(),
    updated_at: new Date("2023-01-05T00:00:00Z").toISOString(),
    configs_count: 1,
    is_public: true,
  },
];