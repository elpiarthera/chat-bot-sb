# Slack Bot Management

This document describes the Slack bot management interface in the Onyx admin panel, including the latest enhancements to improve usability and functionality.

## Overview

The Slack bot management interface allows administrators to:

1. View a list of all configured Slack bots
2. Create new Slack bots
3. Edit existing Slack bot configurations
4. Clone existing Slack bots
5. Enable/disable bots individually or in bulk
6. Delete bots that are no longer needed

## Main Components

### SlackBotTable Component

The enhanced `SlackBotTable` component provides a feature-rich interface for managing Slack bots with the following capabilities:

#### Searching and Filtering

- **Search by Name**: Quickly find bots by typing in the search bar
  - Real-time filtering as you type with highlighted matches
  - Case-insensitive search for better user experience
  - Empty state messaging when no results match the search criteria

- **Filter by Status**: Filter the view to show only enabled or disabled bots
  - Quick-toggle dropdown with "All", "Enabled", and "Disabled" options
  - Combined filtering with search for precise results
  - Visual indicator showing when filters are active

#### Sorting

The table supports interactive sorting with visual indicators:
- **Bot Name**: Alphabetical sorting (A-Z or Z-A)
- **Status**: Group by enabled/disabled status
- **Channel Count**: Numerical ordering (low-high or high-low)
- **Default Config**: Sort by default configuration status

Each column header serves as a toggle button that alternates between ascending and descending order, with an arrow indicator showing the current sort direction.

#### Bulk Actions

Select multiple bots using checkboxes to perform actions on them:
- **Multi-Selection**: Individual checkboxes and "Select All" option
- **Bulk Enable**: Activate multiple bots simultaneously
- **Bulk Disable**: Deactivate multiple bots simultaneously
- **Status Summary**: Visual counter showing "X selected" for active selections
- **Clear Selection**: Quick way to deselect all bots

#### Individual Bot Actions

Each bot row includes quick action buttons with tooltips:
- **Enable/Disable Toggle**: Directly change bot status without navigating away
  - Color-coded button that reflects current status
  - Success/error notifications on status change
- **Clone**: Create a duplicate of the bot with all its settings
  - Confirmation modal with custom name option
  - Cloned bot starts in disabled state to prevent conflicts
- **Delete**: Remove the bot from the system
  - Confirmation modal to prevent accidental deletion
  - Clear feedback on success/failure

#### Visual Indicators

- **Status Badges**: Color-coded badges (green for enabled, gray for disabled)
- **Channel Count**: Visual bar indicators showing relative usage compared to other bots
- **Action Tooltips**: Hover descriptions for each button
- **Row Highlighting**: Hover effect for better visual tracking
- **Empty State**: Friendly message when no bots are configured

#### Pagination

- **Page Navigation**: Previous/Next controls
- **Page Size**: Fixed at 20 items per page for optimal performance
- **Page Counter**: Shows current page and total pages

### Bot Creation and Editing

The bot creation flow involves:

1. **SlackBotCreationForm**: Entry point for creating a new bot
2. **SlackTokensForm**: Form for entering or updating bot tokens
3. **SlackBotUpdateForm**: Component for updating existing bots

### Channel Configuration System

The channel configuration system allows administrators to customize bot behavior for specific Slack channels:

#### SlackChannelConfigsTable

- Displays all channel configurations for a specific bot
- Provides search functionality for finding channels
- Shows key information including:
  - Channel name
  - Associated assistant (persona)
  - Document sets used for knowledge
  - Status (enabled/disabled)
- Supports pagination for managing large numbers of configurations
- Allows direct navigation to edit configurations via row clicks
- Provides delete functionality with confirmation

#### Channel Configuration Workflow

The channel configuration workflow includes:

1. **Default Configuration**:
   - Base settings that apply to all channels
   - Accessed via the "Edit Default Configuration" button
   - Provides foundation for channel-specific overrides

2. **Channel-Specific Configurations**:
   - Override default settings for specific channels
   - Created via the "New Channel Configuration" button
   - Allow for custom behavior in different channels

3. **Configuration Options**:
   - Link specific AI assistants to individual channels
   - Select document sets for knowledge search
   - Configure response filters and behaviors:
     - Answer validity checking
     - Question mark pre-filtering
     - Custom follow-up tags
     - Member group response restrictions
   - Set response type (in thread, direct message, etc.)
   - Enable/disable configurations independently

#### Channel Configuration Pages

- **Creation Page** (`/admin/bots/[bot-id]/channels/new`):
  - Server-side data fetching for document sets and assistants
  - Error handling for failed data requests
  - Uses shared form component for consistent experience

- **Edit Page** (`/admin/bots/[bot-id]/channels/[id]`):
  - Handles both default and channel-specific configurations
  - Auto-refresh capability for real-time updates
  - Error handling with user-friendly messages

- **Shared Form Component** (`SlackChannelConfigCreationForm`):
  - Reused for both creation and editing
  - Handles both new configurations and updates to existing ones
  - Provides consistent user experience throughout the system

## API Endpoints

The following API endpoints support the Slack bot management interface:

- `GET /api/manage/admin/slack-app/bots`: List all Slack bots
- `POST /api/manage/admin/slack-app/bots`: Create a new Slack bot
- `GET /api/manage/admin/slack-app/bots/:id`: Get details of a specific bot
- `PATCH /api/manage/admin/slack-app/bots/:id`: Update a bot's configuration or a specific field
- `DELETE /api/manage/admin/slack-app/bots/:id`: Delete a bot
- `POST /api/manage/admin/slack-app/bots/:id/clone`: Clone an existing bot

### Channel Configuration API Endpoints

- `GET /api/manage/admin/slack-app/bots/:id/config`: List all configurations for a bot
- `GET /api/manage/admin/slack-app/bots/:id/channels`: Get available Slack channels
- `POST /api/manage/admin/slack-app/channel`: Create a new channel configuration
- `PATCH /api/manage/admin/slack-app/channel/:id`: Update an existing channel configuration
- `DELETE /api/manage/admin/slack-app/channel/:id`: Delete a channel configuration

## Recent Enhancements

The latest enhancements to the Slack bot management interface include:

1. **Advanced Search and Filtering**: Improved ability to find bots quickly
2. **Bulk Actions**: Enable/disable multiple bots at once
3. **Bot Cloning**: Easily duplicate bot configurations
4. **Quick Actions**: Direct access to common actions from the table
5. **Visual Improvements**: Better status indicators and usage visualization
6. **Sorting Options**: More flexible ways to organize the bot list
7. **Comprehensive Tests**: Thorough test coverage for all component features
8. **Channel Configuration System**: Granular control of bot behavior across different channels
9. **Enhanced Channel Management UI**: Improved interface for managing channel-specific settings

## Implementation Details

### Component Architecture

The SlackBotTable component uses a number of key React patterns:

1. **State Management**: 
   - Local state for UI controls (search, filter, sort)
   - Callback pattern for data refresh
   - Modal state for confirmations

2. **API Integration**:
   - Utility functions for all API operations
   - Proper error handling with user feedback
   - Optimistic updates where appropriate

3. **UI Components**:
   - Shadcn/UI components for consistent styling
   - React Icons for visual elements
   - Custom tooltips for enhanced UX

### Helper Functions

Key utility functions that support the table functionality:

```typescript
// Toggle a bot's enabled status
async function toggleBotStatus(botId: number, enabled: boolean, refreshCallback: () => void, setPopup: any)

// Clone an existing bot
async function cloneSlackBot(id: number)

// Delete a bot
async function deleteSlackBot(id: number)

// Update a specific field on a bot
async function updateSlackBotField(id: number, field: string, value: any)
```

## Developer Notes

When extending the Slack bot management interface, consider the following:

- All changes to bot status should go through the `updateSlackBotField` helper function
- The `refreshCallback` pattern ensures the UI stays in sync with backend state
- Confirmation modals are used for potentially destructive or significant actions
- All actions provide appropriate feedback via the popup notification system
- API endpoints follow the pattern `/api/manage/admin/slack-app/bots/...` for consistency 
- Channel configuration endpoints follow the pattern `/api/manage/admin/slack-app/channel/...`
- The bot edit page provides an integrated view of both bot settings and channel configurations

For more detailed documentation specific to the SlackBotTable component, see the dedicated documentation file at `SlackBotTable-Documentation.md`.

## Form Components

The Slack bot management system includes several form components for creating and updating bots:

### 1. SlackBotCreationForm

The `SlackBotCreationForm` component provides a user interface for creating new Slack bots with the following features:

- **Basic Information Input**: Fields for bot name and tokens
- **Connection Testing**: Tests Slack API tokens before saving
- **Advanced Options**: Toggle for additional configuration options
- **Access Control**: Group-based access control settings

Example usage:

```tsx
<SlackBotCreationForm 
  onClose={() => {/* Handle close */}} 
  setPopup={setPopup} 
/>
```

### 2. SlackBotUpdateForm

The `SlackBotUpdateForm` component allows updating existing Slack bots with these features:

- **Edit Existing Data**: Pre-filled form with current bot settings
- **Connection Testing**: Tests new API tokens when changed
- **Advanced Options**: Toggle for additional configuration options
- **Access Control**: Update group-based access settings
- **Delete Functionality**: Option to delete the bot

Example usage:

```tsx
<SlackBotUpdateForm
  slackBot={botData}
  onClose={() => {/* Handle close */}}
  setPopup={setPopup}
/>
```

## API Routes

### Token Testing

The system includes an API route for testing Slack tokens:

- **Endpoint**: `/api/admin/slack/test`
- **Method**: POST
- **Purpose**: Validates both bot tokens and app tokens with the Slack API
- **Response**: Success message or detailed error information

### Group Access Control

Group-based access control for Slack bots is managed through:

- **Endpoint**: `/api/manage/admin/slack-app/bots/[id]/groups`
- **Method**: PUT
- **Purpose**: Update public/private status and group assignments
- **Database**: Uses the `slackBotGroupTable` for managing permissions

## Database Schema

The Slack bot management system uses the following database tables:

### 1. slackBotTable

Stores the main bot configuration:

```typescript
{
  id: integer,
  name: text,
  enabled: boolean,
  bot_token: text,
  app_token: text,
  created_at: timestamp,
  updated_at: timestamp,
  is_public: boolean
}
```

### 2. slackBotConfigTable

Stores channel-specific configurations:

```typescript
{
  id: integer,
  bot_id: integer,
  channel_id: text,
  channel_name: text,
  enabled: boolean,
  assistant_id: uuid,
  created_at: timestamp,
  updated_at: timestamp
}
```

### 3. slackBotGroupTable

Manages group access permissions:

```typescript
{
  bot_id: integer,
  group_id: integer
}
```

## User Interface

The Slack bot management interface consists of:

1. **Bot Listing**: `SlackBotTable` component with filtering, sorting, and bulk actions
2. **Bot Creation**: Dedicated page with the creation form
3. **Bot Editing**: Tabbed interface with:
   - Bot Settings tab
   - Channel Configurations tab
