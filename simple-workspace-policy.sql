-- Simple workspace policy without recursion

-- 1. First ensure RLS is disabled to verify everything works normally
ALTER TABLE workspaces DISABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_active_models DISABLE ROW LEVEL SECURITY;

-- Test your application at this point to confirm it works

-- 2. When ready to re-enable security, follow these steps:

-- A. First drop any existing policies
DROP POLICY IF EXISTS "Owners can access their workspaces" ON workspaces;
DROP POLICY IF EXISTS "workspace_owner_full_access" ON workspaces;
DROP POLICY IF EXISTS "workspace_owner_full_access_v1" ON workspaces;
DROP POLICY IF EXISTS "Shared users can view workspaces" ON workspaces;
DROP POLICY IF EXISTS "workspace_shared_access_view" ON workspaces;
DROP POLICY IF EXISTS "workspace_shared_access_view_v1" ON workspaces;
DROP POLICY IF EXISTS "Public workspaces are visible to all" ON workspaces;
DROP POLICY IF EXISTS "workspace_public_view" ON workspaces;
DROP POLICY IF EXISTS "workspace_public_view_v1" ON workspaces;

-- B. Create a single, simple policy for each case
-- Workspace owner access
CREATE POLICY "workspace_owner_access" ON workspaces
FOR ALL USING (user_id = auth.uid());

-- C. Only when ready to fully implement sharing, add these policies
/*
-- Shared workspace access (uncomment when ready)
CREATE POLICY "workspace_shared_access" ON workspaces
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM workspace_users
    WHERE workspace_users.workspace_id = workspaces.id
    AND workspace_users.user_id = auth.uid()
  )
);

-- Public workspace access
CREATE POLICY "workspace_public_access" ON workspaces
FOR SELECT USING (sharing = 'public');
*/

-- D. Re-enable RLS with just the owner policy
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY; 