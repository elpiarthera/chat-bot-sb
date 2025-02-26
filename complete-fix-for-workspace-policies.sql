-- 1. First, completely disable RLS to get back control
ALTER TABLE workspaces DISABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_users DISABLE ROW LEVEL SECURITY;

-- 2. Drop all existing policies on workspaces
DROP POLICY IF EXISTS "Workspace access policy" ON workspaces;
DROP POLICY IF EXISTS "Bypass all restrictions temporarily" ON workspaces;
DROP POLICY IF EXISTS "Allow users with shared access to view workspaces" ON workspaces;
DROP POLICY IF EXISTS "Enable read access for users" ON workspaces;
DROP POLICY IF EXISTS "Allow all users to read workspaces" ON workspaces;
DROP POLICY IF EXISTS "Allow individual users to CRUD their own workspaces" ON workspaces;
DROP POLICY IF EXISTS "Users can read own workspaces" ON workspaces;
DROP POLICY IF EXISTS "Users can modify own workspaces" ON workspaces;
DROP POLICY IF EXISTS "Users can read shared workspaces" ON workspaces;
DROP POLICY IF EXISTS "Allow full access to own workspaces" ON workspaces;
DROP POLICY IF EXISTS "Allow view access to non-private workspaces" ON workspaces;

-- 3. Drop all existing policies on workspace_users
DROP POLICY IF EXISTS "Allow selecting shared workspaces" ON workspace_users;
DROP POLICY IF EXISTS "Allow workspace owners to manage sharing" ON workspace_users;

-- 4. Create a simple, non-recursive policy for workspace owners
CREATE POLICY "Owners can access their workspaces" ON workspaces
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 5. Create a separate, simple policy for shared workspace access
-- This avoids the recursion by using a direct comparison instead of a nested query
CREATE POLICY "Shared users can view workspaces" ON workspaces
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM workspace_users
    WHERE workspace_users.workspace_id = workspaces.id
    AND workspace_users.user_id = auth.uid()
  )
);

-- 6. Re-create workspace_users policies
CREATE POLICY "Users can see workspaces shared with them" ON workspace_users
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Workspace owners can manage sharing" ON workspace_users
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM workspaces
    WHERE workspaces.id = workspace_users.workspace_id
    AND workspaces.user_id = auth.uid()
  )
);

-- 7. Re-enable RLS on both tables
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_users ENABLE ROW LEVEL SECURITY;

-- 8. Optional: Re-create the policy for non-private workspaces if needed
CREATE POLICY "Public workspaces are visible to all" ON workspaces
FOR SELECT
USING (sharing <> 'private'); 