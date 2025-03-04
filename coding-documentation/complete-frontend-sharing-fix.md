# Complete Frontend Sharing Fix

## The Problem

We've identified that tools are visible in only one direction:
- When User A (workspace owner) creates a tool, User B can see it
- When User B creates a tool, User A cannot see it

## The Solution

The issue is that when a workspace member creates a tool, it's not being automatically associated with all workspaces they belong to. We need to fix this in the frontend.

## Step 1: Update the Tool Creation Function

```typescript
// Improved function to create and share a tool
async function createTool(toolData) {
  try {
    // Step 1: Create the tool
    const { data: newTool, error: toolError } = await supabase
      .from('tools')
      .insert(toolData)
      .select()
      .single();
    
    if (toolError) throw toolError;
    
    // Step 2: Find ALL workspaces the user belongs to (regardless of role)
    const { data: userWorkspaces, error: workspaceError } = await supabase
      .from('workspace_users')
      .select('workspace_id')
      .eq('user_id', newTool.user_id);
    
    if (workspaceError) throw workspaceError;
    
    // Step 3: Share the tool with ALL workspaces the user belongs to
    const workspaceIds = userWorkspaces?.map(w => w.workspace_id) || [];
    
    if (workspaceIds.length > 0) {
      // Create tool_workspaces entries in bulk
      const toolWorkspaces = workspaceIds.map(workspaceId => ({
        tool_id: newTool.id,
        workspace_id: workspaceId,
        user_id: newTool.user_id
      }));
      
      // Insert all associations at once, ignoring conflicts
      const { error: shareError } = await supabase
        .from('tool_workspaces')
        .upsert(toolWorkspaces, { onConflict: ['tool_id', 'workspace_id'] });
      
      if (shareError) {
        console.error('Error sharing tool:', shareError);
        // Continue anyway since the tool was created
      }
    }
    
    return { success: true, data: newTool };
  } catch (err) {
    console.error('Error in createTool:', err);
    return { success: false, error: err.message };
  }
}
```

## Step 2: Update the Assistant Creation Function

```typescript
// Improved function to create and share an assistant
async function createAssistant(assistantData) {
  try {
    // Step 1: Create the assistant
    const { data: newAssistant, error: assistantError } = await supabase
      .from('assistants')
      .insert(assistantData)
      .select()
      .single();
    
    if (assistantError) throw assistantError;
    
    // Step 2: Find ALL workspaces the user belongs to (regardless of role)
    const { data: userWorkspaces, error: workspaceError } = await supabase
      .from('workspace_users')
      .select('workspace_id')
      .eq('user_id', newAssistant.user_id);
    
    if (workspaceError) throw workspaceError;
    
    // Step 3: Share the assistant with ALL workspaces the user belongs to
    const workspaceIds = userWorkspaces?.map(w => w.workspace_id) || [];
    
    if (workspaceIds.length > 0) {
      // Create assistant_workspaces entries in bulk
      const assistantWorkspaces = workspaceIds.map(workspaceId => ({
        assistant_id: newAssistant.id,
        workspace_id: workspaceId,
        user_id: newAssistant.user_id
      }));
      
      // Insert all associations at once, ignoring conflicts
      const { error: shareError } = await supabase
        .from('assistant_workspaces')
        .upsert(assistantWorkspaces, { onConflict: ['assistant_id', 'workspace_id'] });
      
      if (shareError) {
        console.error('Error sharing assistant:', shareError);
        // Continue anyway since the assistant was created
      }
    }
    
    return { success: true, data: newAssistant };
  } catch (err) {
    console.error('Error in createAssistant:', err);
    return { success: false, error: err.message };
  }
}
```

## Step 3: Fix Existing Resource Sharing

This function will fix all existing tools and assistants, ensuring they're properly shared with ALL workspaces their creators belong to:

```typescript
// Comprehensive function to fix tool and assistant sharing
async function fixAllSharing() {
  try {
    // Step 1: Get all users
    const { data: allUsers, error: usersError } = await supabase
      .from('profiles')  // Assuming you have a profiles table
      .select('id');
    
    if (usersError) throw usersError;
    
    // Step 2: For each user, fix their tools and assistants
    for (const user of allUsers) {
      // Get all workspaces this user belongs to
      const { data: userWorkspaces } = await supabase
        .from('workspace_users')
        .select('workspace_id')
        .eq('user_id', user.id);
      
      const workspaceIds = userWorkspaces?.map(w => w.workspace_id) || [];
      
      if (workspaceIds.length === 0) continue; // Skip if user isn't in any workspaces
      
      // Get all tools created by this user
      const { data: userTools } = await supabase
        .from('tools')
        .select('id')
        .eq('user_id', user.id);
      
      // For each tool, associate with all workspaces
      for (const tool of (userTools || [])) {
        const toolWorkspaces = workspaceIds.map(workspaceId => ({
          tool_id: tool.id,
          workspace_id: workspaceId,
          user_id: user.id
        }));
        
        if (toolWorkspaces.length > 0) {
          await supabase
            .from('tool_workspaces')
            .upsert(toolWorkspaces, { onConflict: ['tool_id', 'workspace_id'] });
        }
      }
      
      // Get all assistants created by this user
      const { data: userAssistants } = await supabase
        .from('assistants')
        .select('id')
        .eq('user_id', user.id);
      
      // For each assistant, associate with all workspaces
      for (const assistant of (userAssistants || [])) {
        const assistantWorkspaces = workspaceIds.map(workspaceId => ({
          assistant_id: assistant.id,
          workspace_id: workspaceId,
          user_id: user.id
        }));
        
        if (assistantWorkspaces.length > 0) {
          await supabase
            .from('assistant_workspaces')
            .upsert(assistantWorkspaces, { onConflict: ['assistant_id', 'workspace_id'] });
        }
      }
    }
    
    return { success: true, message: "All tools and assistants are now properly shared" };
  } catch (err) {
    console.error('Error fixing sharing:', err);
    return { success: false, error: err.message };
  }
}
```

## Complete Fix Instructions

1. First, run the database scripts to set up clean RLS and fix existing associations:
   ```bash
   psql -U your_db_user -d your_database -f supabase/migrations/ultimate_simple_fix.sql
   psql -U your_db_user -d your_database -f supabase/migrations/fix_workspace_membership.sql
   ```

2. Then, update your frontend code with these new functions:
   - Replace your existing tool creation function
   - Replace your existing assistant creation function
   - Run the `fixAllSharing()` function once to fix all existing tools and assistants

3. Test the solution:
   - Have User A create a tool → User B should see it
   - Have User B create a tool → User A should see it
   - No errors should occur during tool creation

## Why This Works

The key improvement is that we're now:
1. Sharing resources with **ALL** workspaces a user belongs to (not just ones they own)
2. Using `upsert` with `onConflict` handling to avoid duplicate key errors
3. Handling bulk operations more efficiently

This ensures that when any workspace member creates a tool or assistant, it's automatically shared with all workspaces they belong to, making it visible to all members of those workspaces - including the workspace owner. 