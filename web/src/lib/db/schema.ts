import { relations } from "drizzle-orm";
import {
  bigint,
  boolean,
  integer,
  json,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  serial,
} from "drizzle-orm/pg-core";

// Slack bot table for storing bot configurations
export const slackBotTable = pgTable("slack_bots", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  bot_token: text("bot_token").notNull(),
  app_token: text("app_token").notNull(),
  enabled: boolean("enabled").default(false),
  is_public: boolean("is_public").default(false),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const slackBotRelations = relations(slackBotTable, ({ many }) => ({
  configs: many(slackBotConfigTable),
  groups: many(slackBotGroupTable),
}));

// Configuration for specific Slack channels
export const slackBotConfigTable = pgTable("slack_bot_configs", {
  id: serial("id").primaryKey(),
  slack_bot_id: integer("slack_bot_id").references(() => slackBotTable.id),
  channel_id: text("channel_id").notNull(),
  channel_name: text("channel_name"),
  enabled: boolean("enabled").default(true),
  assistant_id: text("assistant_id"),
  document_set_id: integer("document_set_id"),
  persona_id: integer("persona_id"),
  is_default: boolean("is_default").default(false),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const slackBotConfigRelations = relations(slackBotConfigTable, ({ one }) => ({
  bot: one(slackBotTable, {
    fields: [slackBotConfigTable.slack_bot_id],
    references: [slackBotTable.id],
  }),
}));

// Group access control for Slack bots
export const slackBotGroupTable = pgTable(
  "slack_bot_group",
  {
    bot_id: integer("bot_id")
      .notNull()
      .references(() => slackBotTable.id, { onDelete: "cascade" }),
    group_id: integer("group_id").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.bot_id, table.group_id] }),
  })
);

export const slackBotGroupRelations = relations(slackBotGroupTable, ({ one }) => ({
  bot: one(slackBotTable, {
    fields: [slackBotGroupTable.bot_id],
    references: [slackBotTable.id],
  }),
}));

// Define the user groups table
export const userGroupsTable = pgTable("user_groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  created_at: timestamp("created_at").defaultNow(),
});

// User-to-group mapping
export const slackBotToGroupTable = pgTable(
  "slack_bot_to_group",
  {
    bot_id: integer("bot_id").references(() => slackBotTable.id),
    group_id: integer("group_id").references(() => userGroupsTable.id),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.bot_id, table.group_id] }),
  })
);

export const userGroupMappingRelations = relations(slackBotToGroupTable, ({ one }) => ({
  group: one(userGroupsTable, {
    fields: [slackBotToGroupTable.group_id],
    references: [userGroupsTable.id],
  }),
}));