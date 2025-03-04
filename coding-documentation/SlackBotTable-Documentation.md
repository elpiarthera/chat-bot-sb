# SlackBotTable Component Documentation

## Overview

The `SlackBotTable` component is a feature-rich React component designed for managing Slack bots within the admin panel. It provides a comprehensive interface for viewing, filtering, and performing actions on Slack bots.

## Features

### 1. Bot Listing and Pagination

- Displays all Slack bots in a structured table format
- Shows key information including:
  - Bot name
  - Status (enabled/disabled)
  - Default configuration status
  - Channel count
- Implements pagination for managing large numbers of bots (20 bots per page)
- Provides empty state messaging when no bots are available

### 2. Search and Filtering

- **Search by Name**: Allows users to quickly find bots by typing in the search bar
- **Filter by Status**: Enables filtering to show only enabled or disabled bots
- **Combined Filters**: Search and status filters work together for precise results

### 3. Sorting Capabilities

The table supports sorting by various columns:
- Bot Name (alphabetically)
- Status (enabled/disabled)
- Channel Count (number of configured channels)
- Default Configuration

Users can toggle between ascending and descending order for each column.

### 4. Bulk Actions

- **Selection System**: Checkbox-based selection for multiple bots
- **Select All**: Quick selection of all bots on the current page
- **Bulk Enable/Disable**: Apply status changes to multiple bots simultaneously
- **Selection Counter**: Visual indicator showing number of selected bots

### 5. Individual Bot Actions

Each bot entry includes quick action buttons:
- **Enable/Disable Toggle**: Switch bot status without navigating to the edit page
- **Clone**: Create a duplicate of the bot with all its settings
- **Delete**: Remove the bot from the system
- **Edit**: Navigate to the bot's detail page (clicking anywhere on the row)

### 6. Visual Indicators and Feedback

- **Status Badges**: Clear visual indicators of bot status
- **Tooltips**: Contextual information on hover for each action button
- **Confirmation Modals**: Safety checks before performing destructive actions
- **Notification System**: Success and error messages for all operations

## Implementation Details

### Component Structure

```jsx
<SlackBotTable 
  slackBots={slackBots}
  refreshCallback={refreshCallback} 
/>
```

### Props

- **slackBots**: Array of SlackBot objects to display in the table
- **refreshCallback**: (Optional) Function to call after operations that modify bot data

### State Management

The component maintains several state variables:
- `page`: Current page number for pagination
- `searchText`: Current search query
- `statusFilter`: Current status filter selection
- `sortField` and `sortDirection`: Current sorting preferences
- `selectedBots`: Array of selected bot IDs for bulk actions
- `botToDelete` and `botToClone`: Temporary storage for confirmation modals

### Key Internal Functions

- **toggleBotStatus**: Enables or disables a bot via API call
- **handleSort**: Manages column sorting logic
- **handleBotSelection**: Tracks selected bots for bulk actions
- **handleBulkToggle**: Applies status changes to multiple bots
- **handleCloneBot**: Creates a copy of an existing bot
- **handleDeleteBot**: Removes a bot from the system

### API Integration

The component interacts with the following API endpoints via utility functions:
- `updateSlackBotField`: For toggling bot status
- `cloneSlackBot`: For duplicating a bot
- `deleteSlackBot`: For removing a bot

## Usage Example

```tsx
import { SlackBotTable } from "./SlackBotTable";
import { useEffect, useState } from "react";
import { SlackBot } from "@/lib/types";

const SlackBotManagementPage = () => {
  const [slackBots, setSlackBots] = useState<SlackBot[]>([]);
  
  const fetchBots = async () => {
    const response = await fetch("/api/manage/admin/slack-app/bots");
    if (response.ok) {
      const data = await response.json();
      setSlackBots(data);
    }
  };
  
  useEffect(() => {
    fetchBots();
  }, []);
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Slack Bot Management</h1>
      <SlackBotTable slackBots={slackBots} refreshCallback={fetchBots} />
    </div>
  );
};
```

## Related Components

- **SlackBotCreationForm**: Used for creating new bots
- **SlackBotUpdateForm**: For editing bot details
- **SlackTokensForm**: For managing bot tokens

## Integration with Channel Configuration System

The `SlackBotTable` serves as the entry point to the channel configuration system. Each row in the table provides access to a bot's channel-specific settings:

### Channel Count Display

- The table displays the number of channel configurations for each bot
- This count helps administrators quickly identify bots with multiple channel configurations

### Navigation to Channel Management

- Clicking on a bot row navigates to the bot's edit page (`/admin/bots/[bot-id]`)
- The edit page contains both the bot configuration form and the channel configuration table
- This two-level navigation pattern provides a clean separation of concerns

### Channel Configuration Flow

From the bot edit page, administrators can:
1. View all channel-specific configurations for the bot
2. Edit the default configuration that applies to all channels
3. Create new channel-specific configurations
4. Edit existing channel configurations
5. Delete channel configurations no longer needed

### Related Channel Configuration Components

The channel configuration system includes:

- **SlackChannelConfigsTable**: Displays all channel configurations for a bot
  - Shows channel name, associated assistant, document sets, and status
  - Provides search functionality for finding specific channels
  - Includes pagination for handling large numbers of configurations
  - Offers row-click navigation to edit configurations
  - Includes delete functionality with confirmation

- **Channel Creation Page** (`/admin/bots/[bot-id]/channels/new`):
  - Creates new channel-specific configurations
  - Fetches necessary data (document sets, assistants)
  - Uses the shared SlackChannelConfigCreationForm

- **Channel Edit Page** (`/admin/bots/[bot-id]/channels/[id]`):
  - Edits existing channel configurations
  - Handles both default and channel-specific configurations
  - Uses the same form component for consistency

- **SlackChannelConfigCreationForm**:
  - Shared form component for both creation and editing
  - Manages configuration options like document sets, assistants, response filters

## Testing

The component includes comprehensive test coverage using Jest and React Testing Library. Key test scenarios include:

1. Rendering with and without data
2. Search and filter functionality
3. Sorting behavior
4. Row navigation
5. Individual actions (enable/disable, clone, delete)
6. Bulk actions
7. Pagination

## Best Practices

- Always provide a `refreshCallback` to ensure the UI stays in sync with the backend
- Ensure proper error handling is implemented for API interactions
- Use the confirmation modals for potentially destructive operations
- Consider accessibility when extending or modifying the component
- When navigating to channel configuration, ensure the proper bot ID is passed
- Maintain consistency between bot-level and channel-level configurations

## Related Components

- **SlackBotCreationForm**: Used for creating new bots
- **SlackBotUpdateForm**: For editing bot details
- **SlackTokensForm**: For managing bot tokens 